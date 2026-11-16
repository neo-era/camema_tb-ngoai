/* TBNgoài — PWA. Lõi nghiệp vụ dùng chung: window.Core (src/core.js). */
const C = window.Core, DM = C.DM;
const CFG = window.TBN_CONFIG || {};
const $ = (s, el = document) => el.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12));
const fmtN = (n) => Number(n || 0).toLocaleString('vi-VN');
const fmtD = (s) => (s ? String(s).slice(0, 10).split('-').reverse().join('/') : '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------- Icon ----------------
const IP = {
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01', map: 'M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3zM9 3v15M15 6v15',
  chart: 'M3 3v18h18M7 15v3M12 10v8M17 6v12', menu: 'M4 6h16M4 12h16M4 18h16', plus: 'M12 5v14M5 12h14', back: 'm15 18-6-6 6-6',
  cam: 'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3zM12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  wifi: 'M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a15 15 0 0 1 20 0M12 20h.01',
  wind: 'M17.7 7.7A2.5 2.5 0 1 1 19.5 12H2M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2', zap: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  star: 'm12 2 3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z', speaker: 'M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14',
  sign: 'M12 2v20M5 5h12l3 3-3 3H5z', flag: 'M4 22V4s1-1 4-1 5 2 8 2 4-1 4-1v11s-1 1-4 1-5-2-8-2-4 1-4 1', box: 'M3 3h18v18H3zM3 9h18M9 21V9',
  dots: 'M5 12h.01M12 12h.01M19 12h.01', alert: 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01',
  pin: 'M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z', search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-4.3-4.3',
  cloud: 'M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z', sync: 'M21 12a9 9 0 0 1-15.5 6.2L3 16M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M3 21v-5h5',
  user: 'M20 21a8 8 0 1 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z', users: 'M17 21a6 6 0 0 0-12 0M11 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21a6 6 0 0 0-4-5.7M16 3.1a4 4 0 0 1 0 7.8',
  msg: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3', logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  key: 'M21 2l-2 2m-7.6 7.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4',
  check: 'M20 6 9 17l-5-5', edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z', trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  nav: 'M3 11l19-9-9 19-2-8-8-2z', x: 'M18 6 6 18M6 6l12 12', file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
  install: 'M12 3v12M7 10l5 5 5-5M5 21h14', settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3z',
  filter: 'M22 3H2l8 9.5V19l4 2v-8.5z', recheck: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'
};
const ic = (n, label) => `<svg class="i" viewBox="0 0 24 24" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'}><path d="${IP[n] || IP.dots}"/></svg>`;

// ---------------- IndexedDB ----------------
const DB = {
  db: null,
  open() {
    return this.db ? Promise.resolve(this.db) : new Promise((res, rej) => {
      const r = indexedDB.open('tbngoai', 1);
      r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('kv'); d.createObjectStore('recs', { keyPath: 'id' }); d.createObjectStore('queue', { keyPath: 'qid' }); };
      r.onsuccess = () => { this.db = r.result; res(this.db); }; r.onerror = () => rej(r.error);
    });
  },
  async tx(store, mode, fn) {
    const d = await this.open();
    return new Promise((res, rej) => { const t = d.transaction(store, mode); const s = t.objectStore(store); const out = fn(s); t.oncomplete = () => res(out instanceof IDBRequest ? out.result : out); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); });
  },
  get: (st, k) => DB.tx(st, 'readonly', (s) => s.get(k)),
  all: (st) => DB.tx(st, 'readonly', (s) => s.getAll()),
  put: (st, v, k) => DB.tx(st, 'readwrite', (s) => (k === undefined ? s.put(v) : s.put(v, k))),
  del: (st, k) => DB.tx(st, 'readwrite', (s) => s.delete(k)),
  putMany: (st, arr) => DB.tx(st, 'readwrite', (s) => { arr.forEach((v) => s.put(v)); }),
  delMany: (st, ks) => DB.tx(st, 'readwrite', (s) => { ks.forEach((k) => s.delete(k)); }),
  clear: (st) => DB.tx(st, 'readwrite', (s) => s.clear())
};

// ---------------- Trạng thái ----------------
const S = {
  session: null, user: null, cfg: { ...C.DEFAULT_CFG }, recs: new Map(), queue: [], since: '', epoch: '', syncing: false, online: navigator.onLine,
  listFilter: { quan: '', q: '', nhom: '', an_toan: '', phap_ly: '', canh_bao: false }, listLimit: 60,
  statFilter: { quan: '', phuong: '', trang_thai: '', nhom: '', don_vi: '', kt_tu: '', kt_den: '' }, form: null, formErr: {}, photoCache: new Map(), installEvt: null, map: null, navDepth: 0
};
const scriptUrl = () => CFG.SCRIPT_URL || localStorage.getItem('tbn_script_url') || '';

// ---------------- API ----------------
class ApiError extends Error { constructor(code, msg, data) { super(msg); this.code = code; this.data = data; } }
async function api(action, payload = {}, opts = {}) {
  const url = scriptUrl();
  if (!url) throw new ApiError('NO_URL', 'Chưa cấu hình địa chỉ máy chủ');
  const body = JSON.stringify({ action, payload, token: S.session && S.session.token, requestId: opts.requestId });
  const tries = opts.retries ?? 4;
  for (let i = 0; ; i++) {
    let res;
    try {
      const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), opts.timeout || 60000);
      const r = await fetch(url, { method: 'POST', body, redirect: 'follow', credentials: 'omit', signal: ctl.signal });
      clearTimeout(tm);
      const text = await r.text();
      try { res = JSON.parse(text); } catch (x) { throw new ApiError('SERVER', 'Máy chủ trả về dữ liệu lạ (kiểm tra URL / triển khai Apps Script)'); }
    } catch (e) {
      if (e instanceof ApiError) { if (i < Math.min(tries, 1)) { await sleep(backoff(i)); continue; } throw e; } // lỗi máy chủ: thử lại 1 lần rồi báo ngay
      if (i < tries && navigator.onLine) { await sleep(backoff(i)); continue; }
      throw new ApiError('NETWORK', 'Không kết nối được máy chủ');
    }
    if (res.ok) return res.data;
    if (res.code === 'BUSY' && i < tries) { await sleep(backoff(i)); continue; }
    if (res.code === 'AUTH') onAuthLost();
    if (res.code === 'MUST_CHANGE' && action !== 'changePw') changePwDialog(true); // chỉ mở 1 hộp (có cờ)
    throw new ApiError(res.code, res.error || 'Lỗi', res.data);
  }
}
const backoff = (i) => 1000 * 2 ** i + Math.random() * 600;

// ---------------- Toast & modal ----------------
function toast(msg, { err = false, action, onAction, ms = 3500 } = {}) {
  const el = document.createElement('div'); el.className = 'toast' + (err ? ' err' : '');
  el.innerHTML = `<span style="flex:1">${esc(msg)}</span>${action ? `<button class="btn">${esc(action)}</button>` : ''}`;
  if (action) el.querySelector('button').onclick = () => { el.remove(); onAction && onAction(); };
  $('#toasts').append(el); setTimeout(() => el.remove(), action ? Math.max(ms, 8000) : ms);
}
function modal(html, { onMount, label = 'Hộp thoại' } = {}) {
  return new Promise((resolve) => {
    const bg = document.createElement('div'); bg.className = 'modal-bg';
    bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(label)}">${html}</div>`;
    const prev = document.activeElement;
    const close = (v) => { bg.remove(); document.removeEventListener('keydown', key); prev && prev.focus && prev.focus(); resolve(v); };
    const key = (e) => { if (e.key === 'Escape') close(null); };
    bg.addEventListener('click', (e) => { if (e.target === bg) close(null); const b = e.target.closest('[data-close]'); if (b) close(b.dataset.close || null); });
    document.addEventListener('keydown', key);
    document.body.append(bg);
    const f = bg.querySelector('input,select,textarea,button:not([data-close=""])'); f && f.focus();
    onMount && onMount(bg.querySelector('.modal'), close);
  });
}
const mHead = (t) => `<h2><span class="grow">${esc(t)}</span><button class="ib flat" data-close="" aria-label="Đóng">${ic('x')}</button></h2>`;
const confirmBox = (title, text, ok = 'Đồng ý', danger = false) =>
  modal(`${mHead(title)}<p>${text}</p><div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn" data-close="">Huỷ</button><button class="btn ${danger ? 'dan' : 'pri'}" data-close="ok">${esc(ok)}</button></div>`, { label: title }).then((v) => v === 'ok');

// ---------------- Phiên đăng nhập ----------------
async function loadSession() {
  S.session = await DB.get('kv', 'session');
  if (S.session && S.session.exp && S.session.exp < Date.now()) S.session = null;
  if (S.session) { S.user = S.session.user; S.cfg = { ...C.DEFAULT_CFG, ...(S.session.cfg || {}) }; }
}
async function saveSession(d) {
  const prev = await DB.get('kv', 'session');
  if (prev && prev.user && prev.user.uid !== d.user.uid) await wipeLocal();
  S.session = { token: d.token, user: d.user, cfg: d.cfg, exp: Date.now() + 11.5 * 3600e3 };
  S.user = d.user; S.cfg = { ...C.DEFAULT_CFG, ...(d.cfg || {}) };
  await DB.put('kv', S.session, 'session');
}
async function wipeLocal() { await Promise.all(['kv', 'recs', 'queue'].map((s) => DB.clear(s))); S.recs.clear(); S.queue = []; S.since = ''; S.epoch = ''; }
let authPrompting = false;
function onAuthLost() {
  if (authPrompting || !S.user) return;
  authPrompting = true;
  toast('Phiên đăng nhập hết hạn. Dữ liệu đang nhập vẫn được giữ.', { action: 'Đăng nhập lại', onAction: () => { authPrompting = false; reLogin(); }, ms: 15000 });
  setTimeout(() => { authPrompting = false; }, 15000);
}
async function reLogin() {
  const v = await modal(`${mHead('Đăng nhập lại')}<form class="menu" id="rl"><div class="fl"><label for="rl-pw">Mật khẩu cho ${esc(S.user.uid)}</label><input class="in" id="rl-pw" type="password" autocomplete="current-password" required></div><button class="btn pri block">Đăng nhập</button><div class="err" id="rl-e"></div></form>`, {
    label: 'Đăng nhập lại',
    onMount: (m, close) => { $('#rl', m).onsubmit = async (e) => { e.preventDefault(); try { const d = await api('login', { uid: S.user.uid, pw: $('#rl-pw', m).value }, { retries: 1 }); await saveSession(d); close('ok'); } catch (x) { $('#rl-e', m).textContent = x.message; } }; }
  });
  if (v === 'ok') { toast('Đã đăng nhập lại'); flushQueue(); }
}

// ---------------- Dữ liệu: đồng bộ + hàng chờ ----------------
async function loadLocal() {
  const [recs, q, meta] = await Promise.all([DB.all('recs'), DB.all('queue'), DB.get('kv', 'syncmeta')]);
  S.recs = new Map(recs.map((r) => [r.id, r])); S.queue = q.sort((a, b) => a.created - b.created);
  if (meta) { S.since = meta.since; S.epoch = meta.epoch; }
}
async function sync({ silent = false } = {}) {
  if (S.syncing || !S.session) return; S.syncing = true; renderHeaderState();
  try {
    const d = await api('sync', { since: S.since, epoch: S.epoch }, { retries: 2 });
    const rows = d.rows.map((a) => Object.fromEntries(d.cols.map((k, i) => [k, a[i]])));
    if (d.full) { const keep = S.recs; S.recs = new Map(); await DB.clear('recs'); rows.forEach((r) => { const k = keep.get(r.id); if (k && Number(k.version) > Number(r.version)) Object.assign(r, k); }); }
    const put = [], del = [];
    rows.forEach((r) => {
      const cur = S.recs.get(r.id);
      if (!d.full && cur && Number(cur.version) > Number(r.version)) return; // không ghi đè bản mới hơn vừa lưu
      if (r.xoa) { del.push(r.id); S.recs.delete(r.id); } else { put.push(r); S.recs.set(r.id, r); }
    });
    if (put.length) await DB.putMany('recs', put); if (del.length) await DB.delMany('recs', del);
    S.since = d.since; S.epoch = d.epoch; if (d.cfg) S.cfg = { ...C.DEFAULT_CFG, ...d.cfg };
    await DB.put('kv', { since: S.since, epoch: S.epoch, at: Date.now() }, 'syncmeta');
    if (d.bad_rows && S.user.vai_tro === 'admin') toast(`Có ${d.bad_rows} dòng trong Sheet bị sửa tay sai, đã bỏ qua`, { err: true });
    if (!silent && (rows.length || d.full)) toast(d.full ? `Đã tải ${fmtN(S.recs.size)} bản ghi` : `Đã cập nhật ${rows.length} thay đổi`);
  } catch (e) { if (!silent && e.code !== 'AUTH') toast(e.code === 'NETWORK' ? 'Đang ngoại tuyến — dùng dữ liệu đã lưu trên máy' : e.message, { err: e.code !== 'NETWORK' }); }
  finally { S.syncing = false; renderHeaderState(); rerenderSoft(); }
}
async function enqueue(item) {
  item.qid = item.qid || uuid(); item.created = item.created || Date.now(); item.requestId = item.requestId || uuid(); item.state = 'cho';
  await DB.put('queue', item); S.queue.push(item); renderHeaderState();
}
let flushing = false, flushAgain = false;
async function flushQueue() {
  if (flushing) { flushAgain = true; return; }
  if (!S.session || !navigator.onLine) return; flushing = true; flushAgain = false;
  let sent = 0;
  try {
    for (const it of [...S.queue]) {
      if (it.state === 'loi') continue;
      try {
        if (it.type === 'save') {
          for (const p of it.photos || []) {
            if (p.file_id) continue;
            const d = await api('uploadPhoto', { photo_client_id: p.pcid, b64: p.b64, meta: p.meta || {} }, { timeout: 120000 });
            p.file_id = d.file_id; await DB.put('queue', it);
          }
          const rec = { ...it.rec, anh: (it.rec.anh || []).map((a) => (a.startsWith('local:') ? (it.photos.find((p) => 'local:' + p.pcid === a) || {}).file_id : a)).filter(Boolean) };
          const d = await api('save', { rec, confirmDup: true }, { requestId: it.requestId });
          S.recs.set(d.rec.id, d.rec); await DB.put('recs', d.rec);
        } else if (it.type === 'del') {
          const d = await api('del', it.payload, { requestId: it.requestId }); S.recs.delete(d.rec.id); await DB.del('recs', d.rec.id);
        } else if (it.type === 'recheck') {
          const d = await api('recheck', it.payload, { requestId: it.requestId }); S.recs.set(d.rec.id, d.rec); await DB.put('recs', d.rec);
        } else if (it.type === 'feedback') {
          await api('feedback', it.payload, { requestId: it.requestId });
        }
        await DB.del('queue', it.qid); S.queue = S.queue.filter((x) => x.qid !== it.qid); sent++;
      } catch (e) {
        if (e.code === 'SERVER') { it.tries = (it.tries || 0) + 1; if (it.tries < 3) { await DB.put('queue', it); break; } } // lỗi máy chủ lặp lại 3 lần → chuyển "lỗi", không chặn mục sau
        else if (['NETWORK', 'BUSY', 'AUTH', 'NO_URL', 'MUST_CHANGE'].includes(e.code)) break; // thử lại sau
        it.state = 'loi'; it.error = e.message; it.errCode = e.code; it.errData = e.data; await DB.put('queue', it);
        toast('Một bản ghi chưa gửi được: ' + e.message, { err: true, action: 'Xem', onAction: () => go('#/queue') });
      }
    }
  } finally { flushing = false; renderHeaderState(); rerenderSoft(); }
  if (sent) toast(`Đã gửi ${sent} mục lên máy chủ`);
  if (flushAgain && S.queue.some((q) => q.state === 'cho')) return flushQueue(); // mục thêm trong lúc đang gửi
}
const pendingCount = () => S.queue.length;

/** Bản ghi hiển thị = máy chủ + bản ghi đang chờ gửi (áp đè). */
function allRecs() {
  const map = new Map(S.recs);
  for (const it of S.queue) if (it.type === 'save') {
    const id = it.rec.id || 'local-' + it.rec.client_id;
    map.set(id, { ...(map.get(id) || {}), ...it.rec, id, _pending: it.state, _qid: it.qid, anh: it.rec.anh || [] });
  } else if (it.type === 'del') map.delete(it.payload.id);
  return [...map.values()];
}
const getRec = (id) => allRecs().find((r) => r.id === id);

// ---------------- Router ----------------
const routes = {};
function go(h, replace) { if (replace) location.replace(h); else { S.navDepth++; location.hash = h; } }
function back(fallback = '#/') { if (S.navDepth > 0) { S.navDepth--; history.back(); } else go(fallback, true); }
function parseHash() { const [p, q] = (location.hash.slice(1) || '/').split('?'); return { path: p, q: Object.fromEntries(new URLSearchParams(q || '')) }; }
window.addEventListener('hashchange', () => render());
function homePath() { return S.user && ['giamsat', 'xem', 'admin'].includes(S.user.vai_tro) ? '/stats' : '/list'; }
let curView = null;
function render() {
  const app = $('#app');
  if (!scriptUrl() || !S.session) { curView = 'login'; app.className = ''; return viewLogin(app); }
  let { path, q } = parseHash(); if (path === '/' || !routes[path]) path = homePath();
  if (curView === '/map' && path !== '/map' && S.map) { S.map.remove(); S.map = null; document.body.classList.remove('picking'); }
  curView = path;
  const tabbed = ['/list', '/map', '/stats', '/more'].includes(path);
  app.className = tabbed ? 'has-tabs' : '';
  routes[path](app, q);
  if (tabbed) app.insertAdjacentHTML('beforeend', tabsHtml(path));
  renderHeaderState(); window.scrollTo(0, q._keep ? window.scrollY : 0);
}
function rerenderSoft() { if (['/list', '/stats', '/detail', '/queue'].includes(curView)) { const y = window.scrollY; render(); window.scrollTo(0, y); } else if (curView === '/map') drawMarkers(); }
const tabsHtml = (cur) => `<nav class="tabs" aria-label="Chuyển màn">${[['/list', 'list', 'Danh sách'], ['/map', 'map', 'Bản đồ'], ['/stats', 'chart', 'Thống kê'], ['/more', 'menu', 'Khác']]
  .map(([p, i, l]) => `<a class="tab" href="#${p}" ${p === cur ? 'aria-current="page"' : ''}>${ic(i)}<span>${l}</span></a>`).join('')}</nav>`;
function header(title, { backTo, right = '' } = {}) {
  return `<header class="top">${backTo ? `<button class="ib" data-back="${backTo}" aria-label="Quay lại">${ic('back')}</button>` : ''}<h1>${esc(title)}</h1><span id="hstate"></span>${right}</header>`;
}
function renderHeaderState() {
  const el = $('#hstate'); if (!el) return;
  const n = pendingCount(), off = !navigator.onLine;
  el.innerHTML = `${off ? `<span class="pill off" title="Đang ngoại tuyến">${ic('cloud')}Ngoại tuyến</span>` : ''}${n ? `<a class="pill warn" href="#/queue" aria-label="${n} mục chờ gửi">${ic('sync')}${n} chờ gửi</a>` : ''}`;
}
document.addEventListener('click', (e) => { const b = e.target.closest('[data-back]'); if (b) { e.preventDefault(); back(b.dataset.back); } });

// ---------------- Đăng nhập ----------------
function viewLogin(app) {
  const needUrl = !scriptUrl();
  app.innerHTML = `<div class="login"><form class="card" id="lf" autocomplete="on">
    <div class="row"><div class="logo">${ic('zap')}</div><div><div style="font-weight:800;font-size:19px">Thiết bị ngoài trên trụ</div><div class="mut">${esc(CFG.ORG || '')}</div></div></div>
    ${needUrl ? `<div class="fl"><label for="l-url">Địa chỉ máy chủ (URL Apps Script /exec)</label><input class="in" id="l-url" type="url" inputmode="url" placeholder="https://script.google.com/macros/s/…/exec" required></div>` : ''}
    <div class="fl"><label for="l-uid">Tên đăng nhập</label><input class="in" id="l-uid" autocomplete="username" autocapitalize="none" required></div>
    <div class="fl"><label for="l-pw">Mật khẩu</label><input class="in" id="l-pw" type="password" autocomplete="current-password" required></div>
    <button class="btn pri block" id="l-btn">Đăng nhập</button><div class="err" id="l-e" role="alert"></div>
    <div class="mut" style="text-align:center">Phiên bản ${esc(window.APP_VERSION || '')}</div></form></div>`;
  $('#lf').onsubmit = async (e) => {
    e.preventDefault(); const btn = $('#l-btn'); btn.disabled = true; btn.textContent = 'Đang đăng nhập…'; $('#l-e').textContent = '';
    try {
      if (needUrl) { const u = $('#l-url').value.trim(); if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(u)) throw new ApiError('URL', 'URL phải có dạng https://script.google.com/macros/s/…/exec'); localStorage.setItem('tbn_script_url', u); }
      const d = await api('login', { uid: $('#l-uid').value.trim(), pw: $('#l-pw').value }, { retries: 1 });
      const prev = await DB.get('kv', 'session'), pend = await DB.all('queue');
      if (prev && prev.user && prev.user.uid !== d.user.uid && pend.length &&
        !(await confirmBox('Còn dữ liệu chưa gửi của người khác', `Máy này còn ${pend.length} mục chưa gửi của tài khoản <b>${esc(prev.user.uid)}</b>. Đăng nhập tài khoản khác sẽ <b>xoá</b> các mục đó. Nên để ${esc(prev.user.uid)} đăng nhập lại để gửi trước.`, 'Vẫn xoá và đăng nhập', true))) {
        btn.disabled = false; btn.textContent = 'Đăng nhập'; return;
      }
      await saveSession(d); await loadLocal(); go('#' + homePath(), true); render();
      if (d.must_change) changePwDialog(true); else { sync(); flushQueue(); }
    } catch (x) { $('#l-e').textContent = x.message; btn.disabled = false; btn.textContent = 'Đăng nhập'; }
  };
}

// ---------------- Danh sách ----------------
const nhomIcon = (n) => ic((DM.NHOM[n] || {}).icon || 'dots');
const quanTen = (q) => (DM.QUAN[q] || {}).ten || q || '';
function userQuans() { return S.user.vai_tro === 'nhaplieu' && S.user.quan.length ? S.user.quan : Object.keys(DM.QUAN); }
function badgeFor(r) {
  if (r._pending) return `<span class="bd ${r._pending === 'loi' ? 'do' : 'xam'}">${ic('sync')}${r._pending === 'loi' ? 'Gửi lỗi' : 'Chờ gửi'}</span>`;
  const a = C.topAlert(r, new Date(), S.cfg);
  if (!a) return r.trang_thai === 'da_thao' ? '<span class="bd xam">Đã tháo</span>' : `<span class="bd ok">${ic('check')}Ổn</span>`;
  return `<span class="bd ${a.level}">${ic('alert')}${esc(a.text)}${a.qua_han ? ' · quá hạn' : ''}</span>`;
}
function cardHtml(r) {
  const tru = r.so_tru_den ? `${r.so_tru}→${r.so_tru_den}` : r.so_tru;
  return `<button class="card it" data-open="${esc(r.id)}"><div class="ic">${nhomIcon(r.nhom)}</div><div class="grow">
    <div class="t">${esc(r.loai)}${Number(r.so_luong) > 1 ? ' ×' + fmtN(r.so_luong) : ''}</div>
    <div class="m">${esc(r.don_vi)} · Trụ ${esc(tru)}${r.tu ? '/' + esc(r.tu) : ''} · ${esc(r.tuyen)}</div>
    <div class="m">${esc(r.phuong)} (${esc(quanTen(r.quan))}) · KT ${fmtD(r.ngay_kt)}</div><div class="bds">${badgeFor(r)}</div></div></button>`;
}
function listData() {
  const f = S.listFilter, now = new Date();
  let a = C.filterRecs(allRecs(), { quan: f.quan, q: f.q, nhom: f.nhom, an_toan: f.an_toan, phap_ly: f.phap_ly, ca_da_thao: true });
  if (f.canh_bao) a = a.filter((r) => C.alerts(r, now, S.cfg).some((x) => x.level !== 'xam'));
  return a.sort((x, y) => (y._pending ? 1 : 0) - (x._pending ? 1 : 0) || String(y.sua_luc || '').localeCompare(String(x.sua_luc || '')));
}
routes['/list'] = (app) => {
  const f = S.listFilter, data = listData(), nFil = ['nhom', 'an_toan', 'phap_ly'].filter((k) => f[k]).length + (f.canh_bao ? 1 : 0);
  const canAdd = ['admin', 'giamsat', 'nhaplieu'].includes(S.user.vai_tro);
  app.innerHTML = `${header('Thiết bị ngoài trên trụ', { right: `<button class="ib" id="b-sync" aria-label="Đồng bộ">${ic('sync')}</button>` })}
  <main><div class="wrap"><div class="pad row" style="padding-bottom:0"><label class="search">${ic('search')}<span class="sr">Tìm</span><input id="q" type="search" placeholder="Tìm tuyến, trụ, tủ, đơn vị…" value="${esc(f.q)}"></label>
  <button class="ib" id="b-fil" aria-label="Bộ lọc">${ic('filter')}${nFil ? `<b>${nFil}</b>` : ''}</button></div>
  <div class="chips" role="group" aria-label="Lọc theo quận"><button class="chip" data-q="" aria-pressed="${!f.quan}">Tất cả</button>${userQuans().map((q) => `<button class="chip" data-q="${q}" aria-pressed="${f.quan === q}">${esc(quanTen(q))}</button>`).join('')}
  <button class="chip" data-cb aria-pressed="${f.canh_bao}">${ic('alert')} Có cảnh báo</button></div>
  <div class="pad mut" style="padding-top:2px">${fmtN(data.length)} bản ghi${S.syncing ? ' · đang đồng bộ…' : ''}</div>
  <div class="list" id="lst">${!S.recs.size && S.syncing ? '<div class="skel"></div><div class="skel"></div><div class="skel"></div>' : data.length ? data.slice(0, S.listLimit).map(cardHtml).join('') :
    `<div class="empty">${ic('list')}<div>${S.recs.size ? 'Không có bản ghi khớp bộ lọc.' : 'Chưa có dữ liệu. Bấm nút + để thêm thiết bị đầu tiên.'}</div></div>`}</div>
  ${data.length > S.listLimit ? `<button class="btn more" id="b-more">Xem thêm (${fmtN(data.length - S.listLimit)})</button>` : ''}</div></main>
  ${canAdd ? `<button class="fab" id="b-add" aria-label="Thêm thiết bị">${ic('plus')}</button>` : ''}`;
  let tm; $('#q').oninput = (e) => { clearTimeout(tm); tm = setTimeout(() => { f.q = e.target.value; S.listLimit = 60; const pos = e.target.selectionStart; render(); const i = $('#q'); i.focus(); i.setSelectionRange(pos, pos); }, 250); };
  app.querySelectorAll('[data-q]').forEach((b) => (b.onclick = () => { f.quan = b.dataset.q; S.listLimit = 60; render(); }));
  $('[data-cb]').onclick = () => { f.canh_bao = !f.canh_bao; render(); };
  $('#b-sync').onclick = () => { sync(); flushQueue(); };
  $('#b-fil').onclick = filterDialog;
  if ($('#b-more')) $('#b-more').onclick = () => { S.listLimit += 100; const y = scrollY; render(); scrollTo(0, y); };
  if (canAdd) $('#b-add').onclick = () => go('#/form');
  $('#lst').onclick = (e) => { const b = e.target.closest('[data-open]'); if (b) go('#/detail?id=' + encodeURIComponent(b.dataset.open)); };
};
async function filterDialog() {
  const f = S.listFilter;
  const sel = (k, map, label) => `<div class="fl"><label for="f-${k}">${label}</label><select class="in" id="f-${k}"><option value="">Tất cả</option>${Object.entries(map).map(([v, t]) => `<option value="${v}" ${f[k] === v ? 'selected' : ''}>${esc(typeof t === 'string' ? t : t.ten)}</option>`).join('')}</select></div>`;
  const v = await modal(`${mHead('Bộ lọc')}<div class="menu">${sel('nhom', DM.NHOM, 'Nhóm thiết bị')}${sel('an_toan', DM.AN_TOAN, 'An toàn')}${sel('phap_ly', DM.PHAP_LY, 'Pháp lý')}
    <div class="row"><button class="btn" data-close="clear" style="flex:1">Xoá lọc</button><button class="btn pri" data-close="ok" style="flex:1">Áp dụng</button></div></div>`, {
    label: 'Bộ lọc', onMount: (m) => m.addEventListener('change', (e) => { f['_' + e.target.id.slice(2)] = e.target.value; })
  });
  if (v === 'clear') { f.nhom = f.an_toan = f.phap_ly = ''; f.canh_bao = false; }
  if (v === 'ok') for (const k of ['nhom', 'an_toan', 'phap_ly']) if ('_' + k in f) { f[k] = f['_' + k]; }
  for (const k of ['nhom', 'an_toan', 'phap_ly']) delete f['_' + k];
  render();
}

// ---------------- Chi tiết ----------------
routes['/detail'] = (app, q) => {
  const r = getRec(q.id);
  if (!r) { app.innerHTML = `${header('Chi tiết', { backTo: '#/list' })}<main><div class="empty">${ic('alert')}<div>Không tìm thấy bản ghi (có thể đã bị xoá).</div></div></main>`; return; }
  const al = C.alerts(r, new Date(), S.cfg), L = (m, k) => (m[k] ? m[k] : k || '—'), yn = (b) => (b === true ? 'Có' : b === false ? 'Không' : '—');
  const canEdit = !r._pending && C.can(S.user, 'update', r, r), canDel = !r._pending && C.can(S.user, 'delete', r);
  const kv = (rows) => `<dl class="kv">${rows.filter((x) => x[1] !== '' && x[1] != null && x[1] !== '—').map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
  app.innerHTML = `${header(r.loai || 'Chi tiết', { backTo: '#/list' })}<main><div class="f" style="max-width:900px">
  ${r._pending ? `<div class="al ${r._pending === 'loi' ? 'do' : 'xam'}">${ic('sync')}${r._pending === 'loi' ? 'Gửi lỗi — xem ở Hàng chờ' : 'Đang chờ gửi lên máy chủ'}</div>` : ''}
  ${al.length ? `<div class="alerts">${al.map((a) => `<div class="al ${a.level}">${ic('alert')}${esc(a.text)}${a.qua_han ? ' — quá hạn' : ''}${a.con_ngay != null ? ` (còn ${a.con_ngay} ngày)` : ''}${a.qua_ngay ? ` (quá ${a.qua_ngay} ngày)` : ''}</div>`).join('')}</div>` : `<div class="al" style="background:var(--grn-bg);color:var(--grn)">${ic('check')}Không có cảnh báo</div>`}
  <div class="actions">${canEdit ? `<button class="btn pri" id="b-edit">${ic('edit')}Sửa / cập nhật xử lý</button><button class="btn" id="b-rc">${ic('recheck')}Kiểm tra lại – không đổi</button>` : ''}
    ${r.lat ? `<a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${r.lat},${r.lng}">${ic('nav')}Chỉ đường</a>` : ''}${canDel ? `<button class="btn" id="b-del" style="color:var(--red)">${ic('trash')}Xoá</button>` : ''}</div>
  ${r.anh && r.anh.length ? `<div class="photos" id="photos">${r.anh.map((f) => `<div class="ph-load" data-f="${esc(f)}" role="img" aria-label="Ảnh hiện trường"></div>`).join('')}</div>` : ''}
  <div class="grp"><h3>${nhomIcon(r.nhom)} Thiết bị</h3>${kv([['Nhóm', esc(L(DM.NHOM, r.nhom).ten || r.nhom)], ['Loại', esc(r.loai)], ['Đơn vị chủ quản', esc(r.don_vi)], ['Liên hệ', esc(r.lien_he)], ['Số lượng', fmtN(r.so_luong)], ['Mô tả / model', esc(r.mo_ta)], ['Chiều cao lắp', r.chieu_cao_m ? r.chieu_cao_m + ' m' : '']])}</div>
  <div class="grp"><h3>${ic('pin')} Vị trí</h3>${kv([['Quận / phường', esc(quanTen(r.quan) + ' · ' + r.phuong)], ['Tuyến', esc(r.tuyen)], ['Tủ điều khiển', esc(r.tu)], ['Trụ', esc(r.so_tru + (r.so_tru_den ? ' → ' + r.so_tru_den : '') + (r.so_tru_qua ? ` (${r.so_tru_qua} trụ)` : ''))], ['Tọa độ', r.lat ? `${r.lat}, ${r.lng}${r.gps_acc ? ' ±' + Math.round(r.gps_acc) + ' m' : ''}${r.toa_do_tin_cay ? '' : ' (chưa tin cậy)'}` : 'Chưa có']])}</div>
  <div class="grp"><h3>${ic('alert')} An toàn</h3>${kv([['Mức', esc(L(DM.AN_TOAN, r.an_toan))], ['Vấn đề', esc((r.van_de || []).map((v) => DM.VAN_DE[v] || v).join('; '))], ['Ghi chú', esc(r.ghi_chu_at)]])}</div>
  <div class="grp"><h3>${ic('zap')} Cấp nguồn</h3>${kv([['Nguồn', esc(L(DM.NGUON, r.nguon))], ...(r.nguon === 'luoi_cs' ? [['Điểm đấu', esc(L(DM.DIEM_DAU, r.diem_dau))], ['Điện 24/24', yn(r.dien_24h)], ['Công tơ', esc(L(DM.CONG_TO, r.cong_to))], ['CB bảo vệ riêng', yn(r.cb_rieng)], ['Công suất', fmtN(r.cong_suat_w) + ' W' + (r.cs_uoc_tinh ? ' (ước tính)' : '')]] : [])])}</div>
  <div class="grp"><h3>${ic('file')} Pháp lý</h3>${kv([['Tình trạng', esc(L(DM.PHAP_LY, r.phap_ly))], ['Loại văn bản', esc(DM.LOAI_VB[r.loai_vb] || '')], ['Bên cấp', esc(DM.BEN_CAP[r.ben_cap] || '')], ['Số văn bản', esc(r.so_vb)], ['Ngày', fmtD(r.ngay_vb)], ['Hạn', r.han_vb ? fmtD(r.han_vb) : r.so_vb ? 'Không thời hạn' : '']])}</div>
  ${r.nhom === 'le_hoi' ? `<div class="grp"><h3>${ic('star')} Lễ hội</h3>${kv([['Lắp từ', fmtD(r.ls_tu)], ['Phải tháo trước', fmtD(r.ls_den)]])}</div>` : ''}
  <div class="grp"><h3>${ic('check')} Xử lý & trạng thái</h3>${kv([['Trạng thái', esc(L(DM.TRANG_THAI, r.trang_thai))], ['Ngày tháo', fmtD(r.ngay_thao)], ['Lý do tháo', esc(r.ly_do_thao)], ['Xử lý', esc(L(DM.XU_LY, r.xu_ly || 'chua'))], ['Số công văn', esc(r.so_cv)], ['Hạn xử lý', fmtD(r.han_xu_ly)], ['Ngày xử lý', fmtD(r.ngay_xu_ly)], ['Kiểm tra gần nhất', `${fmtD(r.ngay_kt)} ${r.nguoi_kt ? '· ' + esc(r.nguoi_kt) : ''}`], ['Ghi chú', esc(r.ghi_chu)], ['Tạo', `${esc(r.tao_boi || '')} ${fmtD(r.tao_luc)}`], ['Sửa', `${esc(r.sua_boi || '')} ${fmtD(r.sua_luc)}`], ['Mã', esc(r.id)]])}</div>
  </div></main>`;
  if ($('#b-edit')) $('#b-edit').onclick = () => go('#/form?id=' + encodeURIComponent(r.id));
  if ($('#b-rc')) $('#b-rc').onclick = async () => { await enqueue({ type: 'recheck', payload: { id: r.id } }); toast(navigator.onLine ? 'Đã ghi nhận kiểm tra lại' : 'Đã lưu, sẽ gửi khi có mạng'); flushQueue(); };
  if ($('#b-del')) $('#b-del').onclick = async () => {
    const v = await modal(`${mHead('Xoá bản ghi?')}<p>Bản ghi sẽ bị ẩn (xoá mềm), có lưu nhật ký.</p><div class="fl"><label for="d-ly">Lý do xoá</label><input class="in" id="d-ly" required></div><div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn" data-close="">Huỷ</button><button class="btn dan" id="d-ok">Xoá</button></div>`, {
      label: 'Xoá bản ghi', onMount: (m, close) => { $('#d-ok', m).onclick = () => { const ly = $('#d-ly', m).value.trim(); if (!ly) { $('#d-ly', m).setAttribute('aria-invalid', 'true'); return; } close(ly); }; }
    });
    if (v) { await enqueue({ type: 'del', payload: { id: r.id, version: r.version, ly_do: v } }); toast('Đã xoá'); flushQueue(); back('#/list'); }
  };
  if ($('#photos')) loadPhotos($('#photos'));
};
async function loadPhotos(box) {
  for (const el of box.querySelectorAll('[data-f]')) {
    const f = el.dataset.f;
    try {
      let url = S.photoCache.get(f);
      if (!url) {
        if (f.startsWith('local:')) { const it = S.queue.find((q) => (q.photos || []).some((p) => 'local:' + p.pcid === f)); const p = it && it.photos.find((p) => 'local:' + p.pcid === f); url = p ? 'data:image/jpeg;base64,' + p.b64 : ''; }
        else { const d = await api('getPhoto', { file_id: f }, { retries: 1 }); url = `data:${d.mime};base64,${d.b64}`; }
        S.photoCache.set(f, url);
      }
      const img = document.createElement('img'); img.src = url; img.alt = 'Ảnh hiện trường'; img.tabIndex = 0; img.onclick = () => viewer(url); el.replaceWith(img);
    } catch (e) { el.textContent = 'Không tải được ảnh'; }
  }
}
function viewer(url) {
  const v = document.createElement('div'); v.className = 'viewer'; v.innerHTML = `<img src="${url}" alt="Ảnh phóng to"><button class="ib" aria-label="Đóng">${ic('x')}</button>`;
  v.onclick = () => v.remove(); document.body.append(v);
}

// ---------------- Form nhập ----------------
const SEG = (name, map, { cols = 2, danger = {}, warn = {} } = {}) => `<div class="seg ${cols === 3 ? 'c3' : ''}" role="group" data-field="${name}" ${S.formErr[name] ? 'aria-invalid="true"' : ''}>${Object.entries(map).map(([v, t]) =>
  `<button type="button" data-seg="${name}" data-v="${esc(v)}" aria-pressed="${String(S.form[name]) === String(v)}" class="${danger[v] ? 'dg' : warn[v] ? 'wn' : ''}">${esc(t)}</button>`).join('')}</div>`;
const MULTI = (name, map) => `<div class="seg" role="group" data-field="${name}" ${S.formErr[name] ? 'aria-invalid="true"' : ''}>${Object.entries(map).map(([v, t]) =>
  `<button type="button" data-multi="${name}" data-v="${v}" aria-pressed="${(S.form[name] || []).includes(v)}" class="${v === 'ro_dien' ? 'dg' : ''}">${esc(t)}</button>`).join('')}</div>`;
const YN = { true: 'Có', false: 'Không' };
function FL(name, label, inner, { req = false, cls = '' } = {}) {
  return `<div class="fl ${cls}" data-fl="${name}"><${inner.startsWith('<div') ? 'div class="lb"' : `label for="i-${name}"`}>${esc(label)}${req ? ' <span class="req" aria-hidden="true">*</span>' : ''}</${inner.startsWith('<div') ? 'div' : 'label'}>${inner}${S.formErr[name] ? `<div class="err">${esc(S.formErr[name])}</div>` : ''}</div>`;
}
const INP = (name, { type = 'text', ph = '', mode = '', up = false, list = '' } = {}) =>
  `<input class="in" id="i-${name}" data-in="${name}" type="${type}" ${mode ? `inputmode="${mode}"` : ''} ${up ? 'autocapitalize="characters"' : ''} ${list ? `list="${list}"` : ''} placeholder="${esc(ph)}" value="${esc(S.form[name] ?? '')}" ${S.formErr[name] ? 'aria-invalid="true"' : ''}>`;
const TXT = (name, ph = '') => `<textarea class="in" id="i-${name}" data-in="${name}" placeholder="${esc(ph)}">${esc(S.form[name] ?? '')}</textarea>`;

async function openForm(id) {
  S.formErr = {};
  const draftKey = 'draft-' + (id || 'new');
  const draft = await DB.get('kv', draftKey);
  if (id) {
    const r = getRec(id); if (!r) return null;
    S.form = draft && draft.version === r.version ? draft : { ...r, van_de: [...(r.van_de || [])], anh: [...(r.anh || [])] };
  } else if (draft) S.form = draft;
  else {
    const last = (await DB.get('kv', 'lastEntry')) || {};
    const q = userQuans().includes(last.quan) ? last.quan : userQuans().length === 1 ? userQuans()[0] : '';
    S.form = { client_id: uuid(), quan: q, phuong: q === last.quan ? last.phuong || '' : '', tuyen: last.tuyen || '', tu: last.tu || '', so_tru: '', so_luong: 1, van_de: [], anh: [], trang_thai: 'dang_lap', xu_ly: 'chua', an_toan: '', nguon: '', phap_ly: '' };
  }
  S.form._draftKey = draftKey; S.form._photos = S.form._photos || [];
  if (!id) applyPick(S.form);
  return S.form;
}
/** Vị trí chọn trên bản đồ → điền vào form thêm mới (ghi đè GPS). */
function applyPick(f) {
  if (!S.pickLoc || !f) return;
  f.lat = S.pickLoc.lat; f.lng = S.pickLoc.lng; f.gps_acc = S.pickLoc.acc; f._picked = true; delete S.formErr.lat;
  S.pickLoc = null;
}
let draftTimer;
function saveDraft() { clearTimeout(draftTimer); const form = S.form; draftTimer = setTimeout(() => { if (form && S.form === form) DB.put('kv', { ...form }, form._draftKey).catch(() => {}); }, 400); }

routes['/form'] = async (app, q) => {
  if (!q.id && S.form && S.form._for === 'new') applyPick(S.form);
  if (!S.form || S.form._for !== (q.id || 'new')) {
    app.innerHTML = `${header('Đang mở…', { backTo: '#/list' })}<main><div class="pad"><div class="skel"></div></div></main>`;
    const f = await openForm(q.id); if (!f) { toast('Không tìm thấy bản ghi', { err: true }); return back('#/list'); }
    f._for = q.id || 'new';
  }
  drawForm(app, q.id);
  if (!q.id && S.form.lat === undefined) getGps();
};
function drawForm(app, id) {
  const f = S.form, nhom = DM.NHOM[f.nhom], isEdit = !!id;
  const quans = userQuans().reduce((o, k) => ((o[k] = quanTen(k)), o), {});
  const phuongs = f.quan && DM.QUAN[f.quan] ? DM.QUAN[f.quan].phuong.reduce((o, k) => ((o[k] = k), o), {}) : null;
  const donvis = [...new Set([...S.recs.values()].map((r) => r.don_vi).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'));
  const nPhoto = (f.anh || []).length;
  const gpsCls = f.gps_acc > 30 || !f.lat ? 'warn' : '';
  const canXuLy = C.can(S.user, 'xu_ly'); // nhập liệu không cập nhật xử lý (máy chủ cũng chặn)
  app.innerHTML = `${header(isEdit ? 'Sửa thiết bị' : 'Thêm thiết bị', { backTo: isEdit ? '#/detail?id=' + encodeURIComponent(id) : '#/list', right: `<button class="btn pri head-save" data-save>Lưu</button>` })}
  <main style="padding-bottom:16px"><form class="f" id="frm" novalidate>
  <div class="gps full ${gpsCls}" data-fl="lat">${ic('pin')}<div class="grow">${f.lat ? `<b>${Number(f.lat).toFixed(6)}, ${Number(f.lng).toFixed(6)}</b> · ±${Math.round(f.gps_acc || 0)} m${f._picked ? ' — chọn trên bản đồ' : ''}${f.gps_acc > 100 ? ' — chưa tin cậy' : f.gps_acc > 30 ? ' — sai số lớn' : ''}` : S.gpsBusy ? 'Đang lấy tọa độ GPS…' : 'Chưa có tọa độ GPS'}
    ${S.formErr.lat ? `<div class="err">${esc(S.formErr.lat)}</div>` : ''}</div><button type="button" class="pill" id="b-gps">${ic('sync')}${f.lat ? 'Lấy lại' : 'Lấy GPS'}</button></div>
  ${FL('quan', 'Quận (địa bàn cũ)', SEG('quan', quans, { cols: 3 }), { req: true, cls: 'full' })}
  ${phuongs ? FL('phuong', 'Phường', SEG('phuong', phuongs), { req: true, cls: 'full' }) : ''}
  ${FL('tuyen', 'Tuyến đường', INP('tuyen', { ph: 'VD: Nguyễn Thị Minh Khai' }), { req: true })}
  <div class="g2">${FL('tu', 'Tủ điều khiển', INP('tu', { up: true, ph: 'VD: NTMK-02' }), { req: f.nguon === 'luoi_cs' })}${FL('so_tru', 'Số trụ (đầu)', INP('so_tru', { up: true, ph: 'VD: 12' }), { req: true })}</div>
  <details class="full" ${f.so_tru_den ? 'open' : ''}><summary class="mut" style="min-height:44px;display:flex;align-items:center;cursor:pointer">Tuyến cáp / đèn dây qua nhiều trụ</summary>
    <div class="g2">${FL('so_tru_den', 'Trụ cuối', INP('so_tru_den', { up: true }))}${FL('so_tru_qua', 'Số trụ đi qua', INP('so_tru_qua', { type: 'number', mode: 'numeric' }))}</div></details>
  ${FL('nhom', 'Nhóm thiết bị', SEG('nhom', Object.fromEntries(Object.entries(DM.NHOM).map(([k, v]) => [k, v.ten]))), { req: true, cls: 'full' })}
  ${nhom ? FL('loai', 'Loại chi tiết', SEG('loai', Object.fromEntries(nhom.loai.map((l) => [l, l]))), { req: true, cls: 'full' }) : ''}
  <div class="full">${FL('don_vi', 'Đơn vị chủ quản', `<div class="row">${INP('don_vi', { list: 'dl-dv', ph: 'VD: Viettel, Công an TP…' })}<button type="button" class="btn" id="b-vochu" style="flex:none">Chưa rõ chủ</button></div><datalist id="dl-dv">${donvis.map((d) => `<option value="${esc(d)}">`).join('')}</datalist>`, { req: true })}</div>
  ${FL('so_luong', 'Số lượng', `<div class="stepper"><button type="button" class="btn" data-step="-1" aria-label="Giảm">−</button>${INP('so_luong', { type: 'number', mode: 'numeric' })}<button type="button" class="btn" data-step="1" aria-label="Tăng">+</button></div>`, { req: true })}
  ${FL('mo_ta', 'Mô tả / model', INP('mo_ta', { ph: 'Không bắt buộc' }))}

  <section class="grp full"><h3>${ic('alert')} An toàn</h3>
    ${FL('an_toan', 'Mức an toàn', SEG('an_toan', DM.AN_TOAN, { cols: 3, danger: { nguy_hiem: 1 }, warn: { can_kp: 1 } }), { req: true })}
    ${f.an_toan && f.an_toan !== 'dat' || (f.van_de || []).length ? FL('van_de', 'Vấn đề (chọn nhiều)', MULTI('van_de', DM.VAN_DE), { req: f.an_toan !== 'dat' }) : ''}
    ${f.an_toan && f.an_toan !== 'dat' ? FL('ghi_chu_at', 'Mô tả hiện trạng', TXT('ghi_chu_at')) : ''}
  </section>

  <section class="grp full"><h3>${ic('cam')} Ảnh thiết bị</h3>
    ${FL('anh', `Ảnh (${nPhoto}/5) — tự đóng dấu thời gian, tọa độ, người cập nhật`, `<div class="ph" id="ph">${(f.anh || []).map((a, i) => `<div class="slot" data-ph="${i}"><div class="ph-load" data-f="${esc(a)}"></div><button type="button" class="x" data-rmph="${i}" aria-label="Bỏ ảnh">×</button></div>`).join('')}
      ${nPhoto < 5 ? `<label class="slot" aria-label="Chụp ảnh">${ic('cam')}<span class="mut" style="font-size:13px">Chụp ảnh</span><input type="file" accept="image/*" capture="environment" id="i-photo" class="sr"></label>
      <label class="slot" aria-label="Chọn ảnh có sẵn">${ic('plus')}<span class="mut" style="font-size:13px">Chọn ảnh</span><input type="file" accept="image/*" multiple id="i-photo2" class="sr"></label>` : ''}</div>`,
      { req: (f.an_toan && f.an_toan !== 'dat') || ['khong_vb', 'sai_vb'].includes(f.phap_ly) })}
  </section>

  <section class="grp full"><h3>${ic('zap')} Cấp nguồn điện</h3>
    ${FL('nguon', 'Nguồn', SEG('nguon', DM.NGUON), { req: true })}
    ${f.nguon === 'luoi_cs' ? `${FL('diem_dau', 'Điểm đấu', SEG('diem_dau', DM.DIEM_DAU, { cols: 3 }), { req: true })}
      ${FL('dien_24h', 'Thiết bị có điện 24/24?', SEG('dien_24h', YN, { danger: { true: 1 } }), { req: true })}
      ${FL('cong_to', 'Công tơ', SEG('cong_to', DM.CONG_TO, { cols: 3, warn: { khong: 1 } }), { req: true })}
      ${FL('cb_rieng', 'Có CB bảo vệ riêng?', SEG('cb_rieng', YN), { req: true })}
      <div class="g2">${FL('cong_suat_w', 'Công suất (W)', INP('cong_suat_w', { type: 'number', mode: 'numeric' }), { req: true })}
      ${FL('cs_uoc_tinh', 'Công suất là', SEG('cs_uoc_tinh', { false: 'Đo/ghi nhãn', true: 'Ước tính' }))}</div>` : ''}
  </section>

  <section class="grp full"><h3>${ic('file')} Pháp lý</h3>
    ${FL('phap_ly', 'Tình trạng pháp lý', SEG('phap_ly', DM.PHAP_LY, { danger: { khong_vb: 1 }, warn: { sai_vb: 1 } }), { req: true })}
    ${['co_vb', 'dang_tt', 'sai_vb'].includes(f.phap_ly) ? `${FL('loai_vb', 'Loại văn bản', SEG('loai_vb', DM.LOAI_VB), { req: true })}${FL('ben_cap', 'Bên cấp / ký', SEG('ben_cap', DM.BEN_CAP))}
      ${FL('so_vb', 'Số văn bản', INP('so_vb', { ph: 'VD: 125/HĐ-CSCC' }), { req: true })}
      <div class="g2">${FL('ngay_vb', 'Ngày văn bản', INP('ngay_vb', { type: 'date' }), { req: true })}${FL('han_vb', 'Hạn (trống = không thời hạn)', INP('han_vb', { type: 'date' }))}</div>` : ''}
    ${FL('lien_he', 'Người liên hệ / SĐT đơn vị', INP('lien_he', { ph: 'Không bắt buộc', mode: 'text' }))}
  </section>

  ${f.nhom === 'le_hoi' ? `<section class="grp full"><h3>${ic('star')} Thời gian lắp lễ hội</h3><div class="g2">${FL('ls_tu', 'Lắp từ ngày', INP('ls_tu', { type: 'date' }), { req: true })}${FL('ls_den', 'Phải tháo trước', INP('ls_den', { type: 'date' }), { req: true })}</div></section>` : ''}

  <section class="grp full"><h3>${ic('check')} Trạng thái & xử lý</h3>
    ${FL('trang_thai', 'Trạng thái', SEG('trang_thai', DM.TRANG_THAI, { cols: 3, warn: { bo_hoang: 1 } }))}
    ${f.trang_thai === 'da_thao' ? `<div class="g2">${FL('ngay_thao', 'Ngày tháo', INP('ngay_thao', { type: 'date' }), { req: true })}${FL('ly_do_thao', 'Lý do tháo', INP('ly_do_thao'), { req: true })}</div>` : ''}
    ${canXuLy ? `${FL('xu_ly', 'Tình hình xử lý', SEG('xu_ly', DM.XU_LY))}
      ${f.xu_ly === 'da_tb' ? FL('so_cv', 'Số công văn đã thông báo', INP('so_cv'), { req: true }) : ''}
      ${f.xu_ly && f.xu_ly !== 'chua' ? `<div class="g2">${FL('han_xu_ly', 'Hạn xử lý', INP('han_xu_ly', { type: 'date' }), { req: f.xu_ly === 'da_tb' })}${FL('ngay_xu_ly', 'Ngày xử lý', INP('ngay_xu_ly', { type: 'date' }))}</div>` : ''}` : ''}
    <div class="g2">${FL('chieu_cao_m', 'Chiều cao lắp (m)', INP('chieu_cao_m', { type: 'number', mode: 'decimal' }))}${FL('ngay_kt', 'Ngày kiểm tra', INP('ngay_kt', { type: 'date' }))}</div>
    ${FL('ghi_chu', 'Ghi chú', TXT('ghi_chu'))}
  </section>
  <div class="full" style="height:8px"></div></form></main>
  <div class="savebar"><button class="btn" data-cancel>Huỷ</button><button class="btn pri" data-save>${ic('check')}Lưu</button></div>`;
  wireForm(app, id);
  if ($('#ph')) loadPhotos($('#ph'));
  renderHeaderState();
}
function wireForm(app, id) {
  const f = S.form, frm = $('#frm');
  const redraw = () => { const y = scrollY; drawForm(app, id); scrollTo(0, y); };
  frm.addEventListener('input', (e) => { const k = e.target.dataset.in; if (!k) return; f[k] = e.target.value; if (S.formErr[k]) { delete S.formErr[k]; e.target.removeAttribute('aria-invalid'); } saveDraft(); });
  frm.addEventListener('click', (e) => {
    const s = e.target.closest('[data-seg]'), m = e.target.closest('[data-multi]'), st = e.target.closest('[data-step]'), rm = e.target.closest('[data-rmph]');
    if (s) {
      const k = s.dataset.seg; let v = s.dataset.v; if (v === 'true') v = true; else if (v === 'false') v = false;
      f[k] = f[k] === v && !['quan', 'nhom', 'an_toan', 'nguon', 'phap_ly', 'trang_thai'].includes(k) ? '' : v;
      if (k === 'quan') f.phuong = ''; if (k === 'nhom') f.loai = DM.NHOM[v].loai.length === 1 ? DM.NHOM[v].loai[0] : '';
      if (k === 'an_toan' && v === 'dat' && !(f.van_de || []).includes('ro_dien')) f.van_de = [];
      delete S.formErr[k]; saveDraft(); redraw();
    } else if (m) {
      const k = m.dataset.multi, v = m.dataset.v, a = new Set(f[k] || []); a.has(v) ? a.delete(v) : a.add(v); f[k] = [...a];
      if (v === 'ro_dien' && a.has(v)) { f.an_toan = 'nguy_hiem'; toast('Rò điện → tự chuyển mức Nguy hiểm'); }
      delete S.formErr[k]; saveDraft(); redraw();
    } else if (st) { f.so_luong = Math.max(1, (parseInt(f.so_luong, 10) || 0) + Number(st.dataset.step)); saveDraft(); redraw(); }
    else if (rm) { const i = +rm.dataset.rmph; const a = f.anh[i]; f.anh.splice(i, 1); f._photos = (f._photos || []).filter((p) => 'local:' + p.pcid !== a); saveDraft(); redraw(); }
  });
  $('#b-gps').onclick = () => getGps(true);
  $('#b-vochu').onclick = () => { f.don_vi = DM.VO_CHU; delete S.formErr.don_vi; saveDraft(); redraw(); };
  const onPick = async (inp) => {
    const files = [...inp.files].slice(0, 5 - (f.anh || []).length); if (!files.length) return;
    for (const file of files) {
      try {
        const meta = { chup_luc: new Date(file.lastModified && inp.id === 'i-photo2' ? file.lastModified : Date.now()).toISOString(), lat: f.lat ?? '', lng: f.lng ?? '', gps_acc: f.gps_acc ?? '' };
        const stamp = C.photoStamp({ luc: meta.chup_luc, lat: meta.lat, lng: meta.lng, acc: meta.gps_acc, ho_ten: S.user.ho_ten, uid: S.user.uid, so_tru: f.so_tru, tu: f.tu, tuyen: f.tuyen });
        const b64 = await compressImage(file, stamp); const pcid = uuid();
        f._photos = [...(f._photos || []), { pcid, b64, meta }]; f.anh = [...(f.anh || []), 'local:' + pcid];
        S.photoCache.set('local:' + pcid, 'data:image/jpeg;base64,' + b64); delete S.formErr.anh;
      } catch (e) { toast(e.message, { err: true }); }
    }
    saveDraft(); redraw();
  };
  for (const id of ['#i-photo', '#i-photo2']) { const el = $(id); if (el) el.onchange = () => onPick(el); }
  app.querySelectorAll('[data-save]').forEach((b) => (b.onclick = () => submitForm(id)));
  const cancel = app.querySelector('[data-cancel]'); if (cancel) cancel.onclick = async () => { if (await confirmBox('Huỷ nhập?', 'Nội dung đang nhập sẽ bị bỏ.', 'Bỏ nội dung', true)) { clearTimeout(draftTimer); await DB.del('kv', f._draftKey); S.form = null; back('#/list'); } };
}
async function submitForm(id) {
  const f = S.form;
  const clean = {}; for (const [k, v] of Object.entries(f)) if (!k.startsWith('_')) clean[k] = v;
  const v = C.validate(clean);
  S.formErr = {}; v.errors.forEach((e) => { if (!S.formErr[e.field]) S.formErr[e.field] = e.msg; });
  if (!v.ok) {
    drawForm($('#app'), id);
    const first = $('#app [aria-invalid="true"], #app .err'); if (first) { first.closest('[data-fl], .gps').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    toast(`Còn ${v.errors.length} mục cần sửa`, { err: true }); return;
  }
  const rec = v.rec;
  if (!id) {
    const dups = C.findDuplicates(rec, allRecs());
    if (dups.length && !(await confirmBox('Có thể trùng', `Đã có ${dups.length} bản ghi cùng tủ <b>${esc(rec.tu)}</b>, trụ <b>${esc(rec.so_tru)}</b>, loại <b>${esc(rec.loai)}</b>, đơn vị <b>${esc(rec.don_vi)}</b>. Vẫn lưu bản ghi mới?`, 'Vẫn lưu'))) return;
  }
  const photos = (f._photos || []).filter((p) => rec.anh.includes('local:' + p.pcid));
  await enqueue({ type: 'save', rec: { ...rec, id: id || undefined, version: id ? f.version : undefined, client_id: id ? f.client_id : f.client_id }, photos });
  clearTimeout(draftTimer); await DB.del('kv', f._draftKey);
  if (!id) await DB.put('kv', { quan: rec.quan, phuong: rec.phuong, tuyen: rec.tuyen, tu: rec.tu }, 'lastEntry');
  S.form = null;
  const n = (Number(localStorage.getItem('tbn_saves')) || 0) + 1; localStorage.setItem('tbn_saves', n);
  toast(navigator.onLine ? 'Đã lưu, đang gửi…' : 'Đã lưu trên máy, sẽ gửi khi có mạng');
  back('#/list');
  await flushQueue();
  const it = S.queue.find((q) => q.state === 'loi' && q.errCode === 'CONFLICT');
  if (it) conflictDialog(it);
  if (n === 5 && !localStorage.getItem('tbn_rated')) setTimeout(() => toast('Anh/chị thấy ứng dụng thế nào?', { action: 'Đánh giá', onAction: feedbackDialog, ms: 10000 }), 1500);
}
async function conflictDialog(it) {
  const cur = it.errData && it.errData.current;
  const ok = await confirmBox('Bản ghi vừa được người khác sửa', `Người sửa: <b>${esc(cur && cur.sua_boi)}</b> lúc ${esc(cur && fmtD(cur.sua_luc))}. Bỏ thay đổi của anh/chị và mở bản mới nhất để sửa lại?`, 'Mở bản mới nhất');
  if (ok) { await DB.del('queue', it.qid); S.queue = S.queue.filter((x) => x.qid !== it.qid); if (cur) { S.recs.set(cur.id, cur); await DB.put('recs', cur); } go('#/form?id=' + encodeURIComponent(cur.id)); }
}
/** Nén ảnh (cạnh dài 1280 px, ≤ 560 KB) và đóng dấu dải thông tin ở đáy ảnh. */
function compressImage(file, stamp) {
  return new Promise((res, rej) => {
    if (!/^image\//.test(file.type)) return rej(new Error('Chỉ chọn tệp ảnh'));
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.naturalWidth, h = img.naturalHeight; const k = Math.min(1, 1280 / Math.max(w, h)); w = Math.round(w * k); h = Math.round(h * k);
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); g.drawImage(img, 0, 0, w, h);
      if (stamp && stamp.length) {
        const fs = Math.max(14, Math.round(Math.min(w, h) / 30)), lh = Math.round(fs * 1.35), pad = Math.round(fs * 0.6), bh = lh * stamp.length + pad * 2;
        g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, h - bh, w, bh);
        g.font = `600 ${fs}px "Be Vietnam Pro", "Segoe UI", Roboto, Arial, sans-serif`; g.textBaseline = 'top'; g.fillStyle = '#fff';
        g.shadowColor = 'rgba(0,0,0,.8)'; g.shadowBlur = 2;
        stamp.forEach((t, i) => g.fillText(t, pad, h - bh + pad + i * lh, w - pad * 2));
        g.shadowBlur = 0;
      }
      for (let q = 0.75; q >= 0.35; q -= 0.1) { const b64 = cv.toDataURL('image/jpeg', q).split(',')[1]; if (b64.length * 0.75 <= 560 * 1024) return res(b64); }
      rej(new Error('Ảnh quá lớn, không nén được'));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Không đọc được ảnh')); };
    img.src = url;
  });
}
function getGps(manual) {
  if (!navigator.geolocation) { if (manual) toast('Máy không hỗ trợ GPS', { err: true }); return; }
  S.gpsBusy = true; const f = S.form; let best = null; const t0 = Date.now();
  const done = () => { navigator.geolocation.clearWatch(wid); S.gpsBusy = false; if (S.form === f && curView === '/form') { const y = scrollY; drawForm($('#app'), parseHash().q.id); scrollTo(0, y); } };
  const wid = navigator.geolocation.watchPosition((p) => {
    if (!best || p.coords.accuracy < best.accuracy) { best = p.coords; f._picked = false; f.lat = +p.coords.latitude.toFixed(7); f.lng = +p.coords.longitude.toFixed(7); f.gps_acc = Math.round(p.coords.accuracy); delete S.formErr.lat; saveDraft(); }
    if (p.coords.accuracy <= 10 || Date.now() - t0 > 15000) done();
  }, (e) => { done(); toast(e.code === 1 ? 'Chưa cho phép vị trí — vẫn lưu được, tọa độ đánh dấu chưa tin cậy' : 'Không lấy được GPS', { err: true }); }, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
  setTimeout(() => { if (S.gpsBusy) done(); }, 16000);
  if (curView === '/form') { const y = scrollY; drawForm($('#app'), parseHash().q.id); scrollTo(0, y); }
}

// ---------------- Thống kê ----------------
routes['/stats'] = (app) => {
  const sf = S.statFilter, now = new Date(), recs = allRecs().filter((r) => !r._pending);
  const st = C.stats(recs, sf, now, S.cfg), cb = st.canhBao;
  const quans = Object.keys(DM.QUAN), nhoms = Object.keys(DM.NHOM);
  const maxN = Math.max(1, ...Object.values(st.byNhom).map((x) => x.vi_tri));
  const kpi = (n, l, cls, link) => `<button class="card kpi ${cls || ''}" ${link ? `data-kpi="${link}"` : ''}><div class="n">${fmtN(n)}</div><div class="l">${l}</div></button>`;
  const todo = C.filterRecs(recs, sf).map((r) => ({ r, a: C.alerts(r, now, S.cfg).filter((x) => x.level === 'do') })).filter((x) => x.a.length)
    .sort((x, y) => (y.a.some((a) => a.code === 'nguy_hiem') ? 1 : 0) - (x.a.some((a) => a.code === 'nguy_hiem') ? 1 : 0) || y.a.length - x.a.length);
  const dist = (title, obj, map) => `<div class="card bars"><div style="font-weight:700">${title}</div>${Object.entries(map).filter(([k]) => obj[k]).map(([k, t]) =>
    `<div><div class="bar-l"><span>${esc(t)}</span><b>${fmtN(obj[k].vi_tri)}</b></div><div class="bar"><i style="width:${(obj[k].vi_tri / Math.max(1, st.vi_tri)) * 100}%"></i></div></div>`).join('') || '<div class="mut">Chưa có dữ liệu</div>'}</div>`;
  const opt = (map, cur) => Object.entries(map).map(([k, v]) => `<option value="${k}" ${cur === k ? 'selected' : ''}>${esc(typeof v === 'string' ? v : v.ten)}</option>`).join('');
  const donvis = [...new Set(recs.map((r) => r.don_vi).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'));
  app.innerHTML = `${header('Tổng hợp thống kê', { right: `<button class="ib" id="b-xls" aria-label="Xuất Excel">${ic('download')}<span>Excel</span></button>` })}
  <main><div class="wrap pad">
  <div class="g2" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">
    <div class="fl"><label for="s-quan">Quận</label><select class="in" id="s-quan" data-sf="quan"><option value="">Toàn KVTT</option>${opt(Object.fromEntries(quans.map((q) => [q, quanTen(q)])), sf.quan)}</select></div>
    <div class="fl"><label for="s-nhom">Nhóm</label><select class="in" id="s-nhom" data-sf="nhom"><option value="">Tất cả</option>${opt(DM.NHOM, sf.nhom)}</select></div>
    ${sf.quan ? `<div class="fl"><label for="s-ph">Phường</label><select class="in" id="s-ph" data-sf="phuong"><option value="">Tất cả</option>${DM.QUAN[sf.quan].phuong.map((p) => `<option ${sf.phuong === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select></div>` : ''}
    <div class="fl"><label for="s-tt">Trạng thái</label><select class="in" id="s-tt" data-sf="trang_thai"><option value="">Đang hoạt động</option>${opt(DM.TRANG_THAI, sf.trang_thai)}</select></div>
    <div class="fl"><label for="s-dv">Đơn vị</label><select class="in" id="s-dv" data-sf="don_vi"><option value="">Tất cả</option>${donvis.map((d) => `<option ${sf.don_vi === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select></div>
    <div class="fl"><label for="s-tu">Kiểm tra từ</label><input class="in" type="date" id="s-tu" data-sf="kt_tu" value="${esc(sf.kt_tu)}"></div>
    <div class="fl"><label for="s-den">đến</label><input class="in" type="date" id="s-den" data-sf="kt_den" value="${esc(sf.kt_den)}"></div>
  </div>
  <div class="sec">Tổng quan · ${fmtD(C.todayVN(now))}</div>
  <div class="kpis">${kpi(st.vi_tri, `vị trí · ${fmtN(st.so_luong)} thiết bị`)}${kpi((cb.nguy_hiem || 0), 'nguy hiểm', 'do', 'an_toan=nguy_hiem')}
    ${kpi(cb.dau_truoc_ct || 0, 'nghi đấu trước contactor', 'do')}${kpi(cb.khong_vb || 0, 'không văn bản (trái phép)', 'do', 'phap_ly=khong_vb')}
    ${kpi(cb.luoi_khong_ct || 0, 'đấu lưới chiếu sáng, không công tơ', 'vang')}${kpi((cb.vb_het_han || 0) + (cb.vb_sap_het || 0), 'văn bản hết / sắp hết hạn', 'vang')}
    ${kpi(cb.qua_han_xl || 0, 'quá hạn xử lý', 'do')}${kpi((cb.le_hoi_qua_han || 0), 'đèn lễ hội quá hạn tháo', 'do')}</div>
  <div class="grid-st" style="margin-top:14px">
  <div class="card bars"><div style="font-weight:700">Theo nhóm thiết bị (vị trí)</div>${nhoms.filter((n) => st.byNhom[n]).map((n) => `<div><div class="bar-l"><span>${esc(DM.NHOM[n].ten)}</span><b>${fmtN(st.byNhom[n].vi_tri)} <span class="mut">/ ${fmtN(st.byNhom[n].so_luong)} TB</span></b></div><div class="bar"><i style="width:${(st.byNhom[n].vi_tri / maxN) * 100}%"></i></div></div>`).join('') || '<div class="mut">Chưa có dữ liệu</div>'}</div>
  <div class="card"><div class="pad" style="font-weight:700">Cần xử lý (${fmtN(todo.length)})</div><div class="list" style="padding-bottom:12px" id="todo">${todo.slice(0, 8).map(({ r, a }) => `<button class="card it" data-open="${esc(r.id)}"><div class="ic" style="color:var(--red);background:var(--red-bg)">${ic('alert')}</div><div class="grow"><div class="t">${esc(a.map((x) => x.text + (x.qua_han ? ' (quá hạn)' : '')).join(' · '))}</div><div class="m">${esc(r.loai)} · ${esc(r.don_vi)} · Trụ ${esc(r.so_tru)}/${esc(r.tu)} · ${esc(r.tuyen)}</div></div></button>`).join('') || '<div class="mut pad">Không có việc đỏ cần xử lý.</div>'}
    ${todo.length > 8 ? `<a class="btn" href="#/list" id="b-alltodo">Xem tất cả trong Danh sách</a>` : ''}</div></div>
  <div class="card wide"><div class="pad" style="font-weight:700">Theo quận × nhóm (vị trí / thiết bị)</div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Quận</th>${nhoms.filter((n) => st.byNhom[n]).map((n) => `<th class="n">${esc(DM.NHOM[n].ten)}</th>`).join('')}<th class="n">Tổng</th></tr></thead><tbody>
    ${quans.filter((q) => st.byQuanNhom[q]).map((q) => { const row = st.byQuanNhom[q], tot = Object.values(row).reduce((s, x) => [s[0] + x.vi_tri, s[1] + x.so_luong], [0, 0]); return `<tr><td>${esc(quanTen(q))}</td>${nhoms.filter((n) => st.byNhom[n]).map((n) => `<td class="n">${row[n] ? `${fmtN(row[n].vi_tri)} / ${fmtN(row[n].so_luong)}` : '—'}</td>`).join('')}<td class="n"><b>${fmtN(tot[0])} / ${fmtN(tot[1])}</b></td></tr>`; }).join('')}
    </tbody></table></div></div>
  ${dist('Pháp lý', st.phapLy, DM.PHAP_LY)}${dist('Cấp nguồn', st.nguon, DM.NGUON)}${dist('An toàn', st.anToan, DM.AN_TOAN)}${dist('Tình hình xử lý', st.xuLy, DM.XU_LY)}
  <div class="card"><div class="pad" style="font-weight:700">Xếp hạng đơn vị theo vi phạm</div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Đơn vị</th><th class="n">Vi phạm</th><th class="n">Vị trí</th><th></th></tr></thead><tbody>
    ${st.xepHangViPham.slice(0, 15).map((d) => `<tr><td>${esc(d.don_vi)}</td><td class="n">${fmtN(d.vi_pham)}</td><td class="n">${fmtN(d.vi_tri)}</td><td><button class="pill" data-dn="${esc(d.don_vi)}">${ic('file')}Đề nghị khắc phục</button></td></tr>`).join('') || '<tr><td colspan="4" class="mut">Không có vi phạm</td></tr>'}</tbody></table></div></div>
  <div class="card"><div class="pad" style="font-weight:700">Công suất đấu lưới chiếu sáng theo tủ</div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Tủ</th><th>Quận</th><th class="n">Công suất (W)</th><th class="n">Vị trí</th></tr></thead><tbody>
    ${st.congSuatTheoTu.slice(0, 15).map((t) => `<tr><td>${esc(t.tu)}</td><td>${esc(quanTen(t.quan))}</td><td class="n">${fmtN(t.cong_suat_w)}</td><td class="n">${fmtN(t.vi_tri)}</td></tr>`).join('') || '<tr><td colspan="4" class="mut">Không có</td></tr>'}</tbody></table></div></div>
  <div class="card"><div class="pad" style="font-weight:700">Theo đơn vị chủ quản</div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Đơn vị</th><th class="n">Vị trí</th><th class="n">Thiết bị</th></tr></thead><tbody>
    ${Object.entries(st.byDonVi).sort((a, b) => b[1].vi_tri - a[1].vi_tri).slice(0, 20).map(([k, x]) => `<tr><td>${esc(k)}</td><td class="n">${fmtN(x.vi_tri)}</td><td class="n">${fmtN(x.so_luong)}</td></tr>`).join('') || '<tr><td colspan="3" class="mut">—</td></tr>'}</tbody></table></div></div>
  <div class="card"><div class="pad" style="font-weight:700">Theo phường</div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Phường</th><th class="n">Vị trí</th><th class="n">Thiết bị</th></tr></thead><tbody>
    ${Object.entries(st.byPhuong).sort((a, b) => b[1].vi_tri - a[1].vi_tri).map(([p, x]) => `<tr><td>${esc(p)}</td><td class="n">${fmtN(x.vi_tri)}</td><td class="n">${fmtN(x.so_luong)}</td></tr>`).join('') || '<tr><td colspan="3" class="mut">—</td></tr>'}</tbody></table></div></div>
  </div></div></main>`;
  app.querySelectorAll('[data-sf]').forEach((el) => (el.onchange = () => { sf[el.dataset.sf] = el.value; if (el.dataset.sf === 'quan') sf.phuong = ''; render(); }));
  app.querySelectorAll('[data-kpi]').forEach((el) => (el.onclick = () => { const [k, v] = el.dataset.kpi.split('='); Object.assign(S.listFilter, { nhom: sf.nhom, quan: sf.quan, an_toan: '', phap_ly: '', canh_bao: false, [k]: v }); go('#/list'); }));
  if ($('#b-alltodo')) $('#b-alltodo').onclick = () => { Object.assign(S.listFilter, { quan: sf.quan, canh_bao: true }); };
  $('#todo').onclick = (e) => { const b = e.target.closest('[data-open]'); if (b) go('#/detail?id=' + encodeURIComponent(b.dataset.open)); };
  app.querySelectorAll('[data-dn]').forEach((b) => (b.onclick = () => exportDeNghi(b.dataset.dn)));
  $('#b-xls').onclick = exportDialog;
};

// ---------------- Xuất Excel (ExcelJS: có định dạng in) ----------------
const XL_COLS = [['id', 'Mã bản ghi', 18], ['quan', 'Quận (cũ)', 11], ['phuong', 'Phường', 14], ['tuyen', 'Tuyến đường', 22], ['tu', 'Tủ', 10], ['so_tru', 'Trụ', 7], ['so_tru_den', 'Trụ cuối', 8], ['so_tru_qua', 'Số trụ qua', 8],
  ['nhom', 'Nhóm', 20], ['loai', 'Loại', 22], ['don_vi', 'Đơn vị chủ quản', 22], ['lien_he', 'Liên hệ', 16], ['so_luong', 'Số lượng', 8], ['phap_ly', 'Pháp lý', 18], ['loai_vb', 'Loại văn bản', 16], ['ben_cap', 'Bên cấp', 12],
  ['so_vb', 'Số văn bản', 14], ['ngay_vb', 'Ngày VB', 11], ['han_vb', 'Hạn VB', 11], ['nguon', 'Nguồn', 18], ['diem_dau', 'Điểm đấu', 12], ['dien_24h', 'Điện 24/24', 9], ['cong_to', 'Công tơ', 16], ['cb_rieng', 'CB riêng', 8],
  ['cong_suat_w', 'Công suất (W)', 10], ['an_toan', 'An toàn', 13], ['van_de', 'Vấn đề an toàn', 30], ['phat_hien_luc', 'Ngày phát hiện', 12], ['trang_thai', 'Trạng thái', 12], ['xu_ly', 'Xử lý', 18], ['so_cv', 'Số CV', 12],
  ['han_xu_ly', 'Hạn xử lý', 11], ['ngay_xu_ly', 'Ngày xử lý', 11], ['ngay_kt', 'Ngày kiểm tra', 11], ['canh_bao', 'Cảnh báo', 34], ['lat', 'Vĩ độ', 11], ['lng', 'Kinh độ', 11], ['ghi_chu', 'Ghi chú', 24]];
const yesNo = (r, v) => (r.nguon === 'luoi_cs' ? (v === true ? 'Có' : 'Không') : '');
function xlRow(r, now) {
  const L = { quan: quanTen, nhom: (v) => (DM.NHOM[v] || {}).ten || v, phap_ly: (v) => DM.PHAP_LY[v] || v, loai_vb: (v) => DM.LOAI_VB[v] || '', ben_cap: (v) => DM.BEN_CAP[v] || '', nguon: (v) => DM.NGUON[v] || v,
    diem_dau: (v) => DM.DIEM_DAU[v] || '', cong_to: (v) => DM.CONG_TO[v] || '', an_toan: (v) => DM.AN_TOAN[v] || v, van_de: (v) => (v || []).map((x) => DM.VAN_DE[x] || x).join('; '),
    trang_thai: (v) => DM.TRANG_THAI[v] || v, xu_ly: (v) => DM.XU_LY[v || 'chua'], dien_24h: (v) => yesNo(r, v), cb_rieng: (v) => yesNo(r, v),
    ngay_vb: fmtD, han_vb: fmtD, phat_hien_luc: fmtD, han_xu_ly: fmtD, ngay_xu_ly: fmtD, ngay_kt: fmtD };
  return XL_COLS.map(([k]) => (k === 'canh_bao' ? C.alerts(r, now, S.cfg).map((a) => a.text).join('; ') : L[k] ? L[k](r[k]) : r[k] ?? ''));
}
const THIN = { style: 'thin', color: { argb: 'FF94A3B8' } }, BOX = { top: THIN, left: THIN, bottom: THIN, right: THIN };
/** Ghi 1 bảng có tiêu đề in đậm gộp ô, khung, tự xuống dòng; trả về dòng kế tiếp. */
function xlTable(ws, startRow, title, head, rows, { widths } = {}) {
  let r = startRow;
  if (title) { ws.mergeCells(r, 1, r, head.length); const c = ws.getCell(r, 1); c.value = title; c.font = { bold: true, size: 12 }; r++; }
  const hr = ws.getRow(r); head.forEach((h, i) => { const c = hr.getCell(i + 1); c.value = h; c.font = { bold: true }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }; c.border = BOX; c.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' }; });
  const headRow = r; r++;
  rows.forEach((row) => { const x = ws.getRow(r); row.forEach((v, i) => { const c = x.getCell(i + 1); c.value = v === '' ? null : v; c.border = BOX; c.alignment = { wrapText: true, vertical: 'top', horizontal: typeof v === 'number' ? 'right' : 'left' }; if (typeof v === 'number') c.numFmt = '#,##0'; }); r++; });
  if (widths) widths.forEach((w, i) => { if (!ws.getColumn(i + 1).width || ws.getColumn(i + 1).width < w) ws.getColumn(i + 1).width = w; });
  return { next: r + 1, headRow };
}
function xlBook() {
  const wb = new ExcelJS.Workbook(); wb.creator = 'TBNgoài'; wb.created = new Date();
  return wb;
}
function xlSheet(wb, name, { landscape = true } = {}) {
  return wb.addWorksheet(name, { pageSetup: { paperSize: 9, orientation: landscape ? 'landscape' : 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } },
    headerFooter: { oddFooter: '&C&8Trang &P/&N' }, properties: { defaultRowHeight: 18 } });
}
function xlHeading(ws, ncol, lines) {
  const org = CFG.ORG_PARENT || 'CÔNG TY CP CHIẾU SÁNG CÔNG CỘNG TP.HCM';
  ws.mergeCells(1, 1, 1, Math.ceil(ncol / 2)); ws.getCell(1, 1).value = org; ws.getCell(1, 1).font = { size: 11 };
  ws.mergeCells(2, 1, 2, Math.ceil(ncol / 2)); ws.getCell(2, 1).value = (CFG.ORG || 'CHIẾU SÁNG KHU VỰC TRUNG TÂM').toUpperCase(); ws.getCell(2, 1).font = { bold: true, size: 11 };
  let r = 4;
  lines.forEach(([text, font]) => { ws.mergeCells(r, 1, r, ncol); const c = ws.getCell(r, 1); c.value = text; c.font = font || { size: 11, italic: true }; c.alignment = { horizontal: 'center', wrapText: true }; r++; });
  return r + 1;
}
function xlSign(ws, row, ncol) {
  const half = Math.max(2, Math.floor(ncol / 2));
  const put = (c1, c2, lines) => lines.forEach(([t, f], i) => { ws.mergeCells(row + i, c1, row + i, c2); const c = ws.getCell(row + i, c1); c.value = t; c.font = f; c.alignment = { horizontal: 'center' }; });
  put(1, half, [['NGƯỜI LẬP', { bold: true }], ['(Ký, ghi rõ họ tên)', { italic: true, size: 10 }], ['', {}], ['', {}], ['', {}], [S.user.ho_ten || S.user.uid, { bold: true }]]);
  put(half + 1, ncol, [['GIÁM ĐỐC', { bold: true }], ['(Ký, ghi rõ họ tên, đóng dấu)', { italic: true, size: 10 }], ['', {}], ['', {}], ['', {}], [CFG.KY_GIAM_DOC || '', { bold: true }]]);
}
async function xlSave(wb, name) {
  const buf = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast('Đã xuất ' + name);
}
function needXl() { if (window.ExcelJS) return true; toast('Thư viện Excel chưa tải xong, thử lại sau giây lát', { err: true }); return false; }
function exportDialog() {
  modal(`${mHead('Xuất Excel')}<div class="menu"><button class="btn block" data-close="list">${ic('list')}Danh sách theo bộ lọc thống kê</button><button class="btn block" data-close="stat">${ic('chart')}Báo cáo tổng hợp thống kê</button>
    <p class="mut">Mẫu "Đề nghị khắc phục" theo từng đơn vị: bấm nút <b>Đề nghị khắc phục</b> trong bảng xếp hạng vi phạm.</p></div>`, { label: 'Xuất Excel' }).then(async (v) => {
    if (!v || !needXl()) return;
    const now = new Date(), d = C.todayVN(now), sf = S.statFilter, base = allRecs().filter((r) => !r._pending), recs = C.filterRecs(base, sf);
    const pham = `${sf.quan ? quanTen(sf.quan) + (sf.phuong ? ' – ' + sf.phuong : '') : 'Toàn Chiếu sáng KVTT'}${sf.nhom ? ' · ' + DM.NHOM[sf.nhom].ten : ''}${sf.don_vi ? ' · ' + sf.don_vi : ''}`;
    const wb = xlBook();
    if (v === 'list') {
      const ws = xlSheet(wb, 'Danh sách');
      const r0 = xlHeading(ws, 12, [['DANH SÁCH THIẾT BỊ ĐƠN VỊ NGOÀI LẮP TRÊN TRỤ CHIẾU SÁNG', { bold: true, size: 14 }], [`${pham} · Ngày ${fmtD(d)}`]]);
      const t = xlTable(ws, r0, null, ['STT', ...XL_COLS.map((c) => c[1])], recs.map((r, i) => [i + 1, ...xlRow(r, now)]), { widths: [5, ...XL_COLS.map((c) => c[2])] });
      ws.pageSetup.printTitlesRow = `${t.headRow}:${t.headRow}`; ws.views = [{ state: 'frozen', ySplit: t.headRow, xSplit: 2 }];
      await xlSave(wb, `TBNgoai_DanhSach_${d}.xlsx`);
    } else {
      const st = C.stats(base, sf, now, S.cfg), nh = Object.keys(DM.NHOM), qs = sf.quan ? [sf.quan] : Object.keys(DM.QUAN);
      const ws = xlSheet(wb, 'Tổng hợp');
      let r = xlHeading(ws, 2 + nh.length * 2, [['BÁO CÁO TỔNG HỢP THIẾT BỊ ĐƠN VỊ NGOÀI LẮP TRÊN TRỤ CHIẾU SÁNG', { bold: true, size: 14 }], [`${pham} · Số liệu đến ngày ${fmtD(d)}`],
        [`Tổng: ${fmtN(st.vi_tri)} vị trí · ${fmtN(st.so_luong)} thiết bị`, { bold: true, size: 11 }]]);
      const qn = (q, n) => (st.byQuanNhom[q] && st.byQuanNhom[q][n]) || { vi_tri: 0, so_luong: 0 };
      r = xlTable(ws, r, '1. Theo quận × nhóm thiết bị (vị trí / thiết bị)', ['Quận', ...nh.flatMap((n) => [DM.NHOM[n].ten + ' – vị trí', 'thiết bị']), 'Tổng vị trí', 'Tổng thiết bị'],
        [...qs.map((q) => { const t = nh.map((n) => qn(q, n)); return [quanTen(q), ...t.flatMap((x) => [x.vi_tri, x.so_luong]), t.reduce((s, x) => s + x.vi_tri, 0), t.reduce((s, x) => s + x.so_luong, 0)]; }),
          ['Tổng', ...nh.flatMap((n) => [(st.byNhom[n] || {}).vi_tri || 0, (st.byNhom[n] || {}).so_luong || 0]), st.vi_tri, st.so_luong]], { widths: [30, ...nh.flatMap(() => [11, 9]), 10, 10] }).next;
      const two = (title, obj, map) => { r = xlTable(ws, r, title, ['Nội dung', 'Vị trí', 'Thiết bị'], Object.entries(map).map(([k, t]) => [t.ten || t, (obj[k] || {}).vi_tri || 0, (obj[k] || {}).so_luong || 0])).next; };
      r = xlTable(ws, r, '2. Cảnh báo đang mở', ['Cảnh báo', 'Số vị trí'], Object.keys(C.ALERTS).map((k) => [C.ALERTS[k].text, st.canhBao[k] || 0])).next;
      two('3. Pháp lý', st.phapLy, DM.PHAP_LY); two('4. Cấp nguồn', st.nguon, DM.NGUON); two('5. An toàn', st.anToan, DM.AN_TOAN); two('6. Tình hình xử lý', st.xuLy, DM.XU_LY);
      const ws2 = xlSheet(wb, 'Phường – Đơn vị', { landscape: false }); let r2 = 1;
      r2 = xlTable(ws2, r2, '7. Theo phường', ['Quận', 'Phường', 'Vị trí', 'Thiết bị'], qs.flatMap((q) => DM.QUAN[q].phuong.filter((p) => !sf.phuong || p === sf.phuong).map((p) => [quanTen(q), p, (st.byPhuong[p] || {}).vi_tri || 0, (st.byPhuong[p] || {}).so_luong || 0])), { widths: [14, 20, 10, 10] }).next;
      r2 = xlTable(ws2, r2, '8. Theo đơn vị chủ quản', ['Đơn vị', '', 'Vị trí', 'Thiết bị'], Object.entries(st.byDonVi).sort((a, b) => b[1].vi_tri - a[1].vi_tri).map(([k, x]) => [k, '', x.vi_tri, x.so_luong])).next;
      r2 = xlTable(ws2, r2, '9. Xếp hạng đơn vị theo vi phạm', ['Đơn vị', '', 'Số vi phạm', 'Vị trí'], st.xepHangViPham.map((x) => [x.don_vi, '', x.vi_pham, x.vi_tri])).next;
      r2 = xlTable(ws2, r2, '10. Công suất đấu lưới chiếu sáng theo tủ', ['Quận', 'Tủ', 'Công suất (W)', 'Vị trí'], st.congSuatTheoTu.map((x) => [quanTen(x.quan), x.tu, x.cong_suat_w, x.vi_tri])).next;
      xlSign(ws2, r2 + 1, 4);
      await xlSave(wb, `TBNgoai_ThongKe_${d}.xlsx`);
    }
  });
}
const YC_CODE = { khong_vb: 'Liên hệ Chiếu sáng KVTT làm thủ tục hợp đồng sử dụng; nếu không, tự tháo dỡ', sai_vb: 'Điều chỉnh lắp đặt đúng vị trí, số lượng, chủng loại theo văn bản',
  luoi_khong_ct: 'Lắp công tơ riêng, ký hợp đồng mua bán điện với điện lực', dau_truoc_ct: 'Tách ngay khỏi lưới chiếu sáng (đang đấu trước contactor)', nguy_hiem: 'Khắc phục ngay sự cố mất an toàn, cô lập nguồn điện',
  can_kp: 'Khắc phục các tồn tại về an toàn nêu tại cột vấn đề', le_hoi_qua_han: 'Tháo dỡ đèn trang trí đã quá thời hạn', vb_het_han: 'Làm thủ tục gia hạn văn bản', vb_sap_het: 'Chuẩn bị hồ sơ gia hạn văn bản',
  bo_hoang: 'Thu hồi thiết bị không còn sử dụng', sai_vb2: '' };
const YC_VD = { ro_dien: 'cô lập điện, xử lý rò điện', cua_tru: 'lắp lại cửa trụ, không luồn dây qua cửa', khoan_han: 'không khoan/hàn thân trụ, dùng đai kẹp', tinh_khong: 'nâng cao thiết bị/dây đảm bảo tĩnh không',
  day_vong: 'căng lại dây treo', cap_du: 'bó gọn, thu hồi cáp dư', dau_noi: 'làm lại đấu nối đúng kỹ thuật, có hộp bảo vệ', long_leo: 'gia cố chắc chắn', che_den: 'di dời không che khuất đèn',
  gio: 'giảm diện tích chắn gió', tru_nghieng: 'phối hợp kiểm tra, gỡ tải gây nghiêng trụ', qua_tai: 'giảm tải trên trụ' };
async function exportDeNghi(donVi) {
  if (!needXl()) return;
  const now = new Date(), d = C.todayVN(now);
  const rows = C.filterRecs(allRecs().filter((r) => !r._pending), { ...S.statFilter, don_vi: donVi })
    .map((r) => ({ r, a: C.alerts(r, now, S.cfg).filter((x) => YC_CODE[x.code]) })).filter((x) => x.a.length);
  if (!rows.length) return toast('Đơn vị này không có tồn tại cần khắc phục');
  const wb = xlBook(), ws = xlSheet(wb, 'Đề nghị khắc phục'), NC = 13;
  let r = xlHeading(ws, NC, [[`DANH SÁCH VỊ TRÍ ĐỀ NGHỊ ${donVi.toUpperCase()} KHẮC PHỤC`, { bold: true, size: 14 }],
    [`(Kèm theo Công văn số ……/……-CSKVTT ngày …/…/…… của ${CFG.ORG || 'Chiếu sáng Khu vực Trung Tâm'})`]]);
  const t = xlTable(ws, r, null, ['STT', 'Mã bản ghi', 'Quận', 'Phường', 'Tuyến đường', 'Tủ', 'Trụ', 'Thiết bị', 'SL', 'Ngày phát hiện', 'Nội dung tồn tại', 'Yêu cầu khắc phục', 'Hạn hoàn thành'],
    rows.map(({ r: x, a }, i) => [i + 1, x.id, quanTen(x.quan), x.phuong, x.tuyen, x.tu, x.so_tru + (x.so_tru_den ? '→' + x.so_tru_den : ''), x.loai, Number(x.so_luong) || 1, fmtD(x.phat_hien_luc || x.tao_luc),
      [...a.map((y) => y.text), ...(x.van_de || []).map((v) => DM.VAN_DE[v])].filter((v, j, arr) => arr.indexOf(v) === j).join('; '),
      [...a.map((y) => YC_CODE[y.code]), ...(x.van_de || []).map((v) => YC_VD[v]).filter(Boolean).map((v) => v.charAt(0).toUpperCase() + v.slice(1))].join('; '), '…/…/……']),
    { widths: [5, 17, 10, 13, 20, 9, 7, 20, 5, 11, 30, 40, 11] });
  ws.pageSetup.printTitlesRow = `${t.headRow}:${t.headRow}`;
  xlSign(ws, t.next, NC);
  await xlSave(wb, `DeNghiKhacPhuc_${C.fold(donVi).replace(/[^a-z0-9]+/g, '-')}_${d}.xlsx`);
}

// ---------------- Bản đồ ----------------
// Hình dạng theo mức (không dùng màu làm tín hiệu duy nhất): tam giác = đỏ, vuông = vàng, tròn = ổn
const MK = {
  do: '<polygon points="12,1.5 23,21.5 1,21.5" fill="#dc2626"/>', vang: '<rect x="3" y="3" width="18" height="18" rx="3" fill="#d97706"/>',
  ok: '<circle cx="12" cy="12" r="9" fill="#15803d"/>', xam: '<circle cx="12" cy="12" r="9" fill="#64748b"/>'
};
const mkHtml = (lv) => `<span class="mk ${lv}"><svg viewBox="0 0 24 24" aria-hidden="true"><g stroke="#fff" stroke-width="2.5" stroke-linejoin="round">${MK[lv]}</g></svg></span>`;
let mapLayer = null, drawerMin = false;
routes['/map'] = (app) => {
  app.innerHTML = `<div class="mapv"><div id="map" role="application" aria-label="Bản đồ thiết bị"></div></div>
  <div class="map-top"><label class="search">${ic('search')}<span class="sr">Tìm</span><input id="mq" type="search" placeholder="Tìm tuyến, trụ, đơn vị…" value="${esc(S.listFilter.q)}"></label></div>
  <button class="ib locate" id="b-loc" aria-label="Về vị trí của tôi">${ic('nav')}</button>
  ${canAddRec() ? `<button class="fab map-add" id="b-madd" aria-label="Thêm thiết bị trên bản đồ">${ic('plus')}</button>
  <div class="crosshair" id="xh" aria-hidden="true"></div>
  <div class="pickbar" id="pickbar" role="dialog" aria-label="Chọn vị trí thiết bị"><div class="t" id="pick-t">Kéo bản đồ cho tâm ngắm trùng vị trí trụ</div>
    <div class="row"><button class="btn" id="pick-no">Huỷ</button><button class="btn" id="pick-gps">${ic('nav')}Về GPS</button><button class="btn pri" id="pick-ok">${ic('check')}Thêm tại đây</button></div></div>` : ''}
  <section class="drawer ${drawerMin ? 'min' : ''}" id="drw" aria-label="Danh sách trong vùng"><button class="grab" id="grab" aria-label="Thu gọn / mở rộng danh sách"></button>
    <div class="legend"><span>${mkHtml('do')} Đỏ</span><span>${mkHtml('vang')} Vàng</span><span>${mkHtml('ok')} Ổn</span><span id="mcount"></span></div>
    <div class="list" id="mlist" style="padding-bottom:12px"></div></section>`;
  if (!window.L) { setTimeout(() => curView === '/map' && render(), 300); return; }
  if (S.map) S.map.remove();
  S.map = L.map('map', { zoomControl: false, attributionControl: true }).setView([10.776, 106.69], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(S.map);
  L.control.zoom({ position: 'topright' }).addTo(S.map);
  mapLayer = L.layerGroup().addTo(S.map);
  drawMarkers(true);
  S.map.on('moveend', drawDrawer);
  let tm; $('#mq').oninput = (e) => { clearTimeout(tm); tm = setTimeout(() => { S.listFilter.q = e.target.value; drawMarkers(); }, 250); };
  $('#grab').onclick = () => { drawerMin = !drawerMin; $('#drw').classList.toggle('min', drawerMin); };
  $('#b-loc').onclick = () => navigator.geolocation && navigator.geolocation.getCurrentPosition((p) => S.map.setView([p.coords.latitude, p.coords.longitude], 17), () => toast('Không lấy được vị trí', { err: true }), { enableHighAccuracy: true, timeout: 10000 });
  $('#mlist').onclick = (e) => { const b = e.target.closest('[data-open]'); if (b) go('#/detail?id=' + encodeURIComponent(b.dataset.open)); };
  if (canAddRec()) {
    const setPick = (on) => { document.body.classList.toggle('picking', on); if (on) updatePickHint(); };
    $('#b-madd').onclick = () => { setPick(true); if (S.map.getZoom() < 17) S.map.setZoom(17); };
    $('#pick-no').onclick = () => setPick(false);
    $('#pick-gps').onclick = () => $('#b-loc').click();
    $('#pick-ok').onclick = () => { const p = crosshairLatLng(); if (p) pickAt(p); };
    S.map.on('zoomend', () => document.body.classList.contains('picking') && updatePickHint());
    S.map.on('contextmenu', (e) => pickAt(e.latlng)); // chuột phải (máy tính) / nhấn giữ (điện thoại)
  }
};
function canAddRec() { return S.user && ['admin', 'giamsat', 'nhaplieu'].includes(S.user.vai_tro); }
/** Sai số ước tính khi chọn tay: ~10 điểm ảnh ở mức phóng hiện tại. */
function pickAcc(lat) { return Math.max(2, Math.round(156543.03 * Math.cos((lat * Math.PI) / 180) / 2 ** S.map.getZoom() * 10)); }
function updatePickHint() {
  const z = S.map.getZoom(), el = $('#pick-t'), ok = $('#pick-ok'); if (!el) return;
  const enough = z >= 16;
  el.textContent = enough ? `Kéo bản đồ cho tâm ngắm trùng vị trí trụ (sai số ≈ ±${pickAcc(S.map.getCenter().lat)} m)` : 'Phóng to thêm để chọn chính xác vị trí trụ';
  ok.disabled = !enough;
}
function crosshairLatLng() {
  const xh = $('#xh'), m = $('#map'); if (!xh || !S.map) return null;
  const a = xh.getBoundingClientRect(), b = m.getBoundingClientRect();
  return S.map.containerPointToLatLng([a.left + a.width / 2 - b.left, a.top + a.height / 2 - b.top]);
}
function pickAt(ll) {
  if (S.map.getZoom() < 16) { S.map.setView(ll, 17); document.body.classList.add('picking'); updatePickHint(); toast('Đã phóng to — chỉnh tâm ngắm rồi bấm "Thêm tại đây"'); return; }
  if (!(ll.lat >= 10.3 && ll.lat <= 11.2 && ll.lng >= 106.3 && ll.lng <= 107.1)) return toast('Vị trí nằm ngoài TP.HCM', { err: true });
  S.pickLoc = { lat: +ll.lat.toFixed(7), lng: +ll.lng.toFixed(7), acc: pickAcc(ll.lat) };
  document.body.classList.remove('picking');
  go('#/form');
}
function mapData() { return C.filterRecs(allRecs(), { q: S.listFilter.q, quan: S.listFilter.quan }).filter((r) => r.lat && r.lng); }
function levelOf(r) { const a = C.topAlert(r, new Date(), S.cfg); return a ? a.level : 'ok'; }
function drawMarkers(fit) {
  if (!S.map || !mapLayer) return;
  mapLayer.clearLayers(); const pts = [];
  for (const r of mapData()) {
    const lv = levelOf(r);
    const m = L.marker([r.lat, r.lng], { icon: L.divIcon({ className: '', html: mkHtml(lv), iconSize: [24, 24], iconAnchor: [12, 12] }), title: `${r.loai} — ${r.don_vi}`, keyboard: true, zIndexOffset: lv === 'do' ? 1000 : lv === 'vang' ? 500 : 0 });
    m.on('click', () => go('#/detail?id=' + encodeURIComponent(r.id))); m.addTo(mapLayer); pts.push([r.lat, r.lng]);
  }
  if (fit && pts.length) S.map.fitBounds(pts, { padding: [40, 40], maxZoom: 16 });
  drawDrawer();
}
function drawDrawer() {
  if (!S.map || !$('#mlist')) return;
  const b = S.map.getBounds(), rank = { do: 0, vang: 1, xam: 2, ok: 3 };
  const inView = mapData().filter((r) => b.contains([r.lat, r.lng])).sort((x, y) => rank[levelOf(x)] - rank[levelOf(y)]);
  $('#mcount').textContent = `${fmtN(inView.length)} trong vùng nhìn`;
  $('#mlist').innerHTML = inView.slice(0, 40).map(cardHtml).join('') || `<div class="mut pad">Không có thiết bị trong vùng này${allRecs().some((r) => !r.lat) ? ' (một số bản ghi chưa có tọa độ)' : ''}.</div>`;
}

// ---------------- Khác ----------------
routes['/more'] = (app) => {
  const u = S.user, isAdmin = u.vai_tro === 'admin';
  const item = (id, icn, t, m) => `<button class="card it" id="${id}"><div class="ic">${ic(icn)}</div><div class="grow"><div class="t">${t}</div>${m ? `<div class="m">${m}</div>` : ''}</div></button>`;
  const th = localStorage.getItem('tbn_theme') || 'auto';
  app.innerHTML = `${header('Khác')}<main><div class="wrap pad"><div class="menu">
    <div class="card it" style="cursor:default"><div class="ic">${ic('user')}</div><div class="grow"><div class="t">${esc(u.ho_ten || u.uid)}</div><div class="m">${esc(u.uid)} · ${esc(DM.VAI_TRO[u.vai_tro])}${u.quan.length ? ' · ' + u.quan.map(quanTen).join(', ') : ''}</div></div></div>
    ${item('m-queue', 'sync', 'Hàng chờ gửi', `${pendingCount()} mục`)}
    ${item('m-sync', 'cloud', 'Đồng bộ lại toàn bộ', 'Tải lại dữ liệu từ máy chủ')}
    ${item('m-fb', 'msg', 'Góp ý & đánh giá', 'Báo lỗi, đề xuất, chấm điểm ứng dụng')}
    ${isAdmin ? item('m-users', 'users', 'Quản lý tài khoản', 'Thêm, phân quyền, khoá, cấp lại mật khẩu') : ''}
    ${item('m-pw', 'key', 'Đổi mật khẩu')}
    <div class="card" style="padding:12px"><div class="t" style="font-weight:700;margin-bottom:8px">${ic('moon')} Giao diện</div><div class="seg c3">${[['auto', 'Tự động'], ['light', 'Sáng'], ['dark', 'Tối']].map(([v, t]) => `<button data-theme-set="${v}" aria-pressed="${th === v}">${t}</button>`).join('')}</div></div>
    ${item('m-install', 'install', 'Cài ứng dụng lên máy', isIOS() ? 'iPhone/iPad: bấm Chia sẻ → Thêm vào MH chính' : S.installEvt ? 'Cài như ứng dụng, mở toàn màn hình' : 'Đã cài hoặc dùng menu trình duyệt → Cài đặt ứng dụng')}
    ${item('m-out', 'logout', 'Đăng xuất', 'Xoá dữ liệu lưu trên máy này')}
    <div class="mut" style="text-align:center">Phiên bản ${esc(window.APP_VERSION || '')} · ${esc(CFG.ORG || '')}</div></div></div></main>`;
  $('#m-queue').onclick = () => go('#/queue');
  $('#m-sync').onclick = async () => { S.since = ''; await sync(); flushQueue(); };
  $('#m-fb').onclick = feedbackDialog;
  if (isAdmin) $('#m-users').onclick = () => go('#/users');
  $('#m-pw').onclick = () => changePwDialog(false);
  $('#m-install').onclick = installApp;
  $('#m-out').onclick = async () => {
    if (pendingCount() && !(await confirmBox('Còn dữ liệu chưa gửi', `Có ${pendingCount()} mục chưa gửi lên máy chủ sẽ bị mất nếu đăng xuất.`, 'Vẫn đăng xuất', true))) return;
    await wipeLocal(); S.session = null; S.user = null; go('#/', true); render();
  };
  app.querySelectorAll('[data-theme-set]').forEach((b) => (b.onclick = () => { localStorage.setItem('tbn_theme', b.dataset.themeSet); const p = b.dataset.themeSet; document.documentElement.dataset.theme = p === 'dark' || (p === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'; render(); }));
};
routes['/queue'] = (app) => {
  const lab = { save: 'Lưu thiết bị', del: 'Xoá', recheck: 'Kiểm tra lại', feedback: 'Góp ý' };
  app.innerHTML = `${header('Hàng chờ gửi', { backTo: '#/more' })}<main><div class="wrap pad"><div class="menu">
    ${S.queue.map((q) => `<div class="card it" style="cursor:default"><div class="ic">${ic(q.state === 'loi' ? 'alert' : 'sync')}</div><div class="grow"><div class="t">${lab[q.type]}${q.rec ? ': ' + esc(q.rec.loai || '') + ' · ' + esc(q.rec.don_vi || '') : ''}</div>
      <div class="m">${new Date(q.created).toLocaleString('vi-VN')}${q.photos && q.photos.length ? ` · ${q.photos.length} ảnh` : ''}</div>${q.state === 'loi' ? `<div class="err">${esc(q.error)}</div>` : ''}
      <div class="actions" style="margin-top:8px">${q.state === 'loi' ? `<button class="btn" data-retry="${q.qid}">Thử lại</button>${q.type === 'save' ? `<button class="btn" data-fix="${q.qid}">Sửa lại</button>` : ''}` : ''}<button class="btn" data-drop="${q.qid}" style="color:var(--red)">Bỏ</button></div></div></div>`).join('') || `<div class="empty">${ic('check')}<div>Không có mục nào chờ gửi.</div></div>`}
    ${S.queue.length ? `<button class="btn pri block" id="q-send">${ic('sync')}Gửi ngay</button>` : ''}</div></div></main>`;
  app.onclick = async (e) => {
    const r = e.target.closest('[data-retry]'), d = e.target.closest('[data-drop]'), fx = e.target.closest('[data-fix]');
    if (r) { const it = S.queue.find((x) => x.qid === r.dataset.retry); if (it.errCode === 'CONFLICT') return conflictDialog(it); it.state = 'cho'; await DB.put('queue', it); flushQueue(); }
    if (d && (await confirmBox('Bỏ mục này?', 'Dữ liệu chưa gửi sẽ mất.', 'Bỏ', true))) { await DB.del('queue', d.dataset.drop); S.queue = S.queue.filter((x) => x.qid !== d.dataset.drop); render(); renderHeaderState(); }
    if (fx) { const it = S.queue.find((x) => x.qid === fx.dataset.fix); S.form = { ...it.rec, _photos: it.photos, _draftKey: 'draft-' + (it.rec.id || 'new'), _for: it.rec.id || 'new' }; await DB.del('queue', it.qid); S.queue = S.queue.filter((x) => x.qid !== it.qid); go('#/form' + (it.rec.id ? '?id=' + encodeURIComponent(it.rec.id) : '')); }
    if (e.target.closest('#q-send')) flushQueue();
  };
};
routes['/users'] = async (app) => {
  app.innerHTML = `${header('Quản lý tài khoản', { backTo: '#/more', right: `<button class="ib" id="u-add" aria-label="Thêm tài khoản">${ic('plus')}</button>` })}<main><div class="wrap pad"><div class="menu" id="ul"><div class="skel"></div></div></div></main>`;
  $('#u-add').onclick = () => userDialog(null);
  try {
    const d = await api('users', {}, { retries: 1 }); if (curView !== '/users') return;
    $('#ul').innerHTML = d.users.map((u) => `<button class="card it" data-u='${esc(JSON.stringify(u))}'><div class="ic">${ic('user')}</div><div class="grow"><div class="t">${esc(u.ho_ten || u.uid)} ${u.khoa ? '<span class="bd do">Đã khoá</span>' : ''}</div><div class="m">${esc(u.uid)} · ${esc(DM.VAI_TRO[u.vai_tro] || u.vai_tro)}${u.quan.length ? ' · ' + u.quan.map(quanTen).join(', ') : ''}</div></div></button>`).join('');
    $('#ul').onclick = (e) => { const b = e.target.closest('[data-u]'); if (b) userDialog(JSON.parse(b.dataset.u)); };
  } catch (e) { $('#ul').innerHTML = `<div class="err">${esc(e.message)}</div>`; }
};
async function userDialog(u) {
  const isNew = !u; u = u || { uid: '', ho_ten: '', vai_tro: 'nhaplieu', quan: [], khoa: false };
  await modal(`${mHead(isNew ? 'Thêm tài khoản' : 'Sửa tài khoản')}<form class="menu" id="uf">
    <div class="fl"><label for="u-uid">Tên đăng nhập</label><input class="in" id="u-uid" value="${esc(u.uid)}" ${isNew ? '' : 'readonly'} autocapitalize="none" required pattern="[a-z0-9._\\-]{3,40}"></div>
    <div class="fl"><label for="u-ten">Họ tên</label><input class="in" id="u-ten" value="${esc(u.ho_ten)}"></div>
    <div class="fl"><label for="u-vt">Vai trò</label><select class="in" id="u-vt">${Object.entries(DM.VAI_TRO).map(([k, v]) => `<option value="${k}" ${u.vai_tro === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
    <div class="fl"><div class="lb">Quận được giao (cho Nhập liệu)</div><div class="seg c3">${Object.keys(DM.QUAN).map((q) => `<button type="button" data-uq="${q}" aria-pressed="${u.quan.includes(q)}">${esc(quanTen(q))}</button>`).join('')}</div></div>
    <label class="row" style="min-height:48px"><input type="checkbox" id="u-khoa" ${u.khoa ? 'checked' : ''} style="width:24px;height:24px"> Khoá tài khoản</label>
    <div class="err" id="u-e"></div><div class="row"><button class="btn pri" style="flex:1">Lưu</button>${isNew ? '' : `<button type="button" class="btn" id="u-rs">${ic('key')}Cấp lại mật khẩu</button>`}</div></form>`, {
    label: 'Tài khoản',
    onMount: (m, close) => {
      const qs = new Set(u.quan);
      m.querySelectorAll('[data-uq]').forEach((b) => (b.onclick = () => { qs.has(b.dataset.uq) ? qs.delete(b.dataset.uq) : qs.add(b.dataset.uq); b.setAttribute('aria-pressed', qs.has(b.dataset.uq)); }));
      $('#uf', m).onsubmit = async (e) => {
        e.preventDefault();
        try {
          const d = await api('userSave', { uid: $('#u-uid', m).value.trim().toLowerCase(), ho_ten: $('#u-ten', m).value, vai_tro: $('#u-vt', m).value, quan: [...qs], khoa: $('#u-khoa', m).checked }, { retries: 1 });
          close('ok'); if (d.temp_pw) showTempPw(d.user.uid, d.temp_pw); else toast('Đã lưu tài khoản'); render();
        } catch (x) { $('#u-e', m).textContent = x.message; }
      };
      const rs = $('#u-rs', m); if (rs) rs.onclick = async () => { try { const d = await api('userResetPw', { uid: u.uid }, { retries: 1 }); close('ok'); showTempPw(u.uid, d.temp_pw); } catch (x) { $('#u-e', m).textContent = x.message; } };
    }
  });
}
function showTempPw(uid, pw) {
  modal(`${mHead('Mật khẩu tạm')}<p>Gửi cho người dùng <b>${esc(uid)}</b>. Mật khẩu chỉ hiện <b>một lần</b>; người dùng sẽ được yêu cầu đổi khi đăng nhập.</p>
    <div class="in" style="display:flex;align-items:center;font-size:22px;font-weight:800;letter-spacing:.06em" id="tpw">${esc(pw)}</div><div class="row" style="margin-top:12px"><button class="btn pri" style="flex:1" id="cp">Sao chép</button><button class="btn" data-close="">Xong</button></div>`, {
    label: 'Mật khẩu tạm', onMount: (m) => { $('#cp', m).onclick = () => navigator.clipboard && navigator.clipboard.writeText(`Tài khoản: ${uid}\nMật khẩu tạm: ${pw}`).then(() => toast('Đã sao chép')); }
  });
}
let pwDialogOpen = false;
function changePwDialog(forced) {
  if (pwDialogOpen) return; pwDialogOpen = true;
  modal(`${mHead(forced ? 'Đổi mật khẩu tạm' : 'Đổi mật khẩu')}<form class="menu" id="pf">${forced ? '<p>Anh/chị đang dùng mật khẩu tạm, vui lòng đặt mật khẩu mới.</p>' : ''}
    <div class="fl"><label for="p-old">Mật khẩu hiện tại</label><input class="in" type="password" id="p-old" autocomplete="current-password" required></div>
    <div class="fl"><label for="p-new">Mật khẩu mới (≥ 8 ký tự)</label><input class="in" type="password" id="p-new" autocomplete="new-password" minlength="8" required></div>
    <div class="fl"><label for="p-new2">Nhập lại mật khẩu mới</label><input class="in" type="password" id="p-new2" autocomplete="new-password" required></div>
    <div class="err" id="p-e"></div><button class="btn pri block">Đổi mật khẩu</button></form>`, {
    label: 'Đổi mật khẩu',
    onMount: (m, close) => {
      new MutationObserver((_, o) => { if (!document.body.contains(m)) { pwDialogOpen = false; o.disconnect(); } }).observe(document.body, { childList: true });
      $('#pf', m).onsubmit = async (e) => {
        e.preventDefault(); const n = $('#p-new', m).value;
        if (n !== $('#p-new2', m).value) return ($('#p-e', m).textContent = 'Hai lần nhập mật khẩu mới không khớp');
        try { const d = await api('changePw', { old_pw: $('#p-old', m).value, new_pw: n }, { retries: 1 }); S.session.token = d.token; await DB.put('kv', S.session, 'session'); close('ok'); toast('Đã đổi mật khẩu'); flushQueue(); sync({ silent: true }); }
        catch (x) { $('#p-e', m).textContent = x.message; }
      };
    }
  });
}
function feedbackDialog(ctx = {}) {
  let sao = 0, loai = ctx.loai || 'de_xuat';
  const LO = { de_xuat: 'Đề xuất tính năng', loi_app: 'Lỗi ứng dụng', sai_du_lieu: 'Sai dữ liệu', khac: 'Khác' };
  const NH = ['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt'];
  modal(`${mHead('Góp ý & đánh giá')}<form class="menu" id="fb"><div class="fl"><div class="lb">Chấm điểm</div><div class="stars" role="group" aria-label="Số sao">${[1, 2, 3, 4, 5].map((i) => `<button type="button" data-s="${i}" aria-label="${i} sao — ${NH[i - 1]}" aria-pressed="false">★</button>`).join('')}</div><div class="mut" id="fb-nh">Chưa chọn</div></div>
    <div class="fl"><div class="lb">Loại góp ý</div><div class="seg">${Object.entries(LO).map(([k, v]) => `<button type="button" data-l="${k}" aria-pressed="${k === loai}">${v}</button>`).join('')}</div></div>
    <div class="fl"><label for="fb-nd">Nội dung</label><textarea class="in" id="fb-nd" maxlength="2000" placeholder="Mô tả lỗi, đề xuất…">${esc(ctx.text || '')}</textarea></div>
    <label class="row" style="min-height:44px"><input type="checkbox" id="fb-vt" style="width:22px;height:22px"> Gửi kèm vị trí gần đúng (làm tròn ~100 m)</label>
    <div class="err" id="fb-e"></div><button class="btn pri block">Gửi góp ý</button></form>`, {
    label: 'Góp ý',
    onMount: (m, close) => {
      m.querySelectorAll('[data-s]').forEach((b) => (b.onclick = () => { sao = +b.dataset.s; m.querySelectorAll('[data-s]').forEach((x) => x.setAttribute('aria-pressed', +x.dataset.s <= sao)); $('#fb-nh', m).textContent = NH[sao - 1]; }));
      m.querySelectorAll('[data-l]').forEach((b) => (b.onclick = () => { loai = b.dataset.l; m.querySelectorAll('[data-l]').forEach((x) => x.setAttribute('aria-pressed', x === b)); }));
      $('#fb', m).onsubmit = async (e) => {
        e.preventDefault(); const nd = $('#fb-nd', m).value.trim();
        if (!sao && !nd) return ($('#fb-e', m).textContent = 'Chọn số sao hoặc nhập nội dung');
        let vt = '';
        if ($('#fb-vt', m).checked && S.form && S.form.lat) vt = `${(+S.form.lat).toFixed(3)},${(+S.form.lng).toFixed(3)}`;
        await enqueue({ type: 'feedback', payload: { client_id: uuid(), sao, loai, noi_dung: nd, phien_ban: window.APP_VERSION, thiet_bi: navigator.userAgent.slice(0, 180) + (isStandalone() ? ' [PWA]' : ''), man_hinh: `${innerWidth}x${innerHeight} ${curView}`, vi_tri: vt } });
        localStorage.setItem('tbn_rated', '1'); close('ok');
        toast(navigator.onLine ? 'Cảm ơn góp ý! Đang gửi…' : 'Đã lưu góp ý, sẽ gửi khi có mạng'); flushQueue();
      };
    }
  });
}

// ---------------- Cài đặt PWA ----------------
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); S.installEvt = e; if (!isStandalone() && !localStorage.getItem('tbn_install_hint')) { localStorage.setItem('tbn_install_hint', '1'); toast('Cài ứng dụng lên máy để mở nhanh, dùng khi mất mạng', { action: 'Cài đặt', onAction: installApp }); } });
async function installApp() {
  if (S.installEvt) { S.installEvt.prompt(); const r = await S.installEvt.userChoice; if (r.outcome === 'accepted') toast('Đã cài ứng dụng'); S.installEvt = null; return; }
  if (isIOS()) return modal(`${mHead('Cài trên iPhone / iPad')}<ol><li>Mở trang này bằng <b>Safari</b>.</li><li>Bấm nút <b>Chia sẻ</b> (ô vuông có mũi tên).</li><li>Chọn <b>Thêm vào MH chính</b> → <b>Thêm</b>.</li></ol>`, { label: 'Cài đặt' });
  toast(isStandalone() ? 'Ứng dụng đã được cài' : 'Dùng menu trình duyệt → "Cài đặt ứng dụng"');
}

// ---------------- Khởi động ----------------
window.addEventListener('online', () => { S.online = true; renderHeaderState(); flushQueue().then(() => sync({ silent: true })); });
window.addEventListener('offline', () => { S.online = false; renderHeaderState(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.session) { flushQueue(); sync({ silent: true }); } });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => { if ((localStorage.getItem('tbn_theme') || 'auto') === 'auto') document.documentElement.dataset.theme = e.matches ? 'dark' : 'light'; });
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});

(async function start() {
  try { await DB.open(); } catch (e) { $('#app').innerHTML = '<div class="login"><div class="card pad">Trình duyệt chặn bộ nhớ (IndexedDB). Hãy tắt chế độ ẩn danh rồi mở lại.</div></div>'; return; }
  await loadSession();
  if (S.session) { await loadLocal(); }
  render();
  if (S.session) { flushQueue(); sync({ silent: S.recs.size > 0 }); setInterval(() => { if (navigator.onLine) { flushQueue(); sync({ silent: true }); } }, 5 * 60000); }
})();
window.__tbn = { S, DB, sync, flushQueue }; // hỗ trợ kiểm thử
