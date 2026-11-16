// Giả lập tối thiểu môi trường Google Apps Script để chạy dist/Code.gs trong Node.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const toSigned = (buf) => Array.from(buf, (b) => (b > 127 ? b - 256 : b));
const toBuf = (bytes) => Buffer.from(bytes.map((b) => b & 255));
const strBytes = (s) => toSigned(Buffer.from(String(s), 'utf8'));

class Range {
  constructor(sh, r, c, nr, nc) { Object.assign(this, { sh, r, c, nr, nc }); }
  getValues() {
    const out = [];
    for (let i = 0; i < this.nr; i++) {
      const row = this.sh.data[this.r - 1 + i] || [];
      out.push(Array.from({ length: this.nc }, (_, j) => (row[this.c - 1 + j] ?? '')));
    }
    return out;
  }
  setValues(v) {
    v.forEach((row, i) => {
      const R = this.r - 1 + i;
      while (this.sh.data.length <= R) this.sh.data.push([]);
      row.forEach((x, j) => { this.sh.data[R][this.c - 1 + j] = x; });
    });
    return this;
  }
  setValue(x) { return this.setValues([[x]]); }
  setNumberFormat(f) { this.sh.formats[this.c] = f; return this; }
}
class Sheet {
  constructor(name) { this.name = name; this.data = []; this.formats = {}; }
  getMaxRows() { return 1000; }
  getRange(r, c, nr = 1, nc = 1) { return new Range(this, r, c, nr, nc); }
  getLastRow() { return this.data.length; }
  getLastColumn() { return Math.max(0, ...this.data.map((r) => r.length)); }
  appendRow(a) { this.data.push(a.slice()); }
  deleteRow(i) { this.data.splice(i - 1, 1); }
}

export function makeEnv() {
  const sheets = {}, props = {}, cache = {}, files = {}, folders = {}, logs = [];
  const state = { lockFree: true, lockCalls: 0 };
  const ss = {
    getSheetByName: (n) => sheets[n] || null,
    insertSheet: (n) => (sheets[n] = new Sheet(n)),
    getId: () => 'SS1'
  };
  const blob = (data, mime, name) => {
    const bytes = Array.isArray(data) ? data.slice() : strBytes(data);
    return { getBytes: () => bytes.slice(), getDataAsString: () => toBuf(bytes).toString('utf8'), getContentType: () => mime || 'text/plain', getName: () => name };
  };
  const mkFile = (b, name) => {
    const id = 'F' + crypto.randomBytes(8).toString('hex');
    const f = { id, trashed: false, blob: b, created: new Date(), desc: '', getId: () => id, setTrashed: (t) => { f.trashed = t; }, getBlob: () => b, getDateCreated: () => f.created, setDescription: (d) => { f.desc = d; return f; }, getName: () => b.getName(),
      makeCopy: (n, folder) => folder.createFile(blob([], 'x', n)) };
    files[id] = f; return f;
  };
  const mkFolder = (name) => {
    const id = 'D' + crypto.randomBytes(6).toString('hex'); const list = [];
    const f = { id, name, list, subs: [], getId: () => id, createFile: (b) => { const x = mkFile(b); x.parent = f; list.push(x); return x; },
      createFolder: (n) => { const d = mkFolder(n); f.subs.push(d); return d; }, getFoldersByName: (n) => { const l = f.subs.filter((d) => d.name === n); let i = 0; return { hasNext: () => i < l.length, next: () => l[i++] }; },
      getFiles: () => { let i = 0; const l = list.filter((x) => !x.trashed); return { hasNext: () => i < l.length, next: () => l[i++] }; } };
    folders[id] = f; return f;
  };
  const ctx = {
    console: { log: (...a) => logs.push(a.join(' ')), error: () => {} },
    SpreadsheetApp: { getActiveSpreadsheet: () => ss, openById: () => ss, flush: () => {} },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (k in props ? props[k] : null), setProperty: (k, v) => { props[k] = String(v); } }) },
    CacheService: { getScriptCache: () => ({ get: (k) => (k in cache ? cache[k] : null), put: (k, v) => { cache[k] = String(v); } }) },
    LockService: { getScriptLock: () => ({ tryLock: () => { state.lockCalls++; return state.lockFree; }, releaseLock: () => {} }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (s) => ({ content: s, setMimeType() { return this; } }) },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' },
      newBlob: blob,
      computeDigest: (alg, bytes) => toSigned(crypto.createHash('sha256').update(typeof bytes === 'string' ? Buffer.from(bytes) : toBuf(bytes)).digest()),
      computeHmacSha256Signature: (v, k) => toSigned(crypto.createHmac('sha256', k).update(v).digest()),
      base64EncodeWebSafe: (v) => (typeof v === 'string' ? Buffer.from(v) : toBuf(v)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_'),
      base64DecodeWebSafe: (s) => { if (!/^[A-Za-z0-9_\-=]*$/.test(s)) throw new Error('bad'); return toSigned(Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64')); },
      base64Encode: (b) => toBuf(b).toString('base64'),
      base64Decode: (s) => { if (!/^[A-Za-z0-9+/=]*$/.test(s)) throw new Error('bad'); return toSigned(Buffer.from(s, 'base64')); },
      getUuid: () => crypto.randomUUID(),
      formatDate: (d, tz, f) => { const x = new Date(d.getTime() + 7 * 3600e3).toISOString(); return f.replace('yyyy', x.slice(0, 4)).replace('MM', x.slice(5, 7)).replace('dd', x.slice(8, 10)).replace('HH', x.slice(11, 13)).replace('mm', x.slice(14, 16)).replace('ss', x.slice(17, 19)); }
    },
    DriveApp: {
      createFolder: mkFolder,
      getFolderById: (id) => { if (!folders[id]) throw new Error('no'); return folders[id]; },
      getFileById: (id) => { if (id === 'SS1') return { makeCopy: (n, f) => f.createFile(blob([], 'x', n)) }; if (!files[id]) throw new Error('no'); return files[id]; }
    },
    ScriptApp: { getProjectTriggers: () => [], deleteTrigger: () => {}, newTrigger: () => ({ timeBased: () => ({ everyDays: () => ({ atHour: () => ({ create: () => {} }) }) }) }) },
    Date, JSON, Math, Number, String, Array, Object, Error, isFinite, isNaN, RegExp, Buffer
  };
  vm.createContext(ctx);
  vm.runInContext(readFileSync(new URL('../dist/Code.gs', import.meta.url), 'utf8'), ctx);
  const call = (action, payload, token, requestId) => {
    const body = JSON.stringify({ action, payload, token, requestId });
    return JSON.parse(ctx.doPost({ postData: { contents: body, length: Buffer.byteLength(body) } }).content);
  };
  const raw = (contents) => JSON.parse(ctx.doPost({ postData: { contents, length: Buffer.byteLength(contents) } }).content);
  return { ctx, sheets, props, cache, files, logs, state, call, raw };
}
export const JPEG = (n = 100) => Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), crypto.randomBytes(n)]).toString('base64');
