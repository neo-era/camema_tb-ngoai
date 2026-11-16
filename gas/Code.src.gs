/* TBNgoài — Backend Apps Script (Web App: Execute as Me, Access: Anyone).
 * File này được sinh bởi tools/build.mjs: lõi nghiệp vụ (src/core.js) nhúng ở dưới. KHÔNG sửa tay phần lõi. */
var APP_VERSION = '__APP_VERSION__';

var COLS = ['id', 'client_id', 'quan', 'phuong', 'tuyen', 'tu', 'so_tru', 'so_tru_den', 'so_tru_qua', 'lat', 'lng', 'gps_acc', 'toa_do_tin_cay',
  'nhom', 'loai', 'don_vi', 'lien_he', 'so_luong', 'mo_ta', 'chieu_cao_m', 'phap_ly', 'loai_vb', 'ben_cap', 'so_vb', 'ngay_vb', 'han_vb',
  'nguon', 'diem_dau', 'dien_24h', 'cong_to', 'cb_rieng', 'cong_suat_w', 'cs_uoc_tinh', 'an_toan', 'van_de', 'ghi_chu_at', 'ls_tu', 'ls_den',
  'trang_thai', 'ngay_thao', 'ly_do_thao', 'xu_ly', 'so_cv', 'han_xu_ly', 'ngay_xu_ly', 'ngay_kt', 'nguoi_kt', 'anh', 'ghi_chu',
  'tao_luc', 'tao_boi', 'sua_luc', 'sua_boi', 'xoa', 'version', 'last_request_id', 'phat_hien_luc'];
var SERVER_FIELDS = { id: 1, client_id: 1, tao_luc: 1, tao_boi: 1, sua_luc: 1, sua_boi: 1, xoa: 1, version: 1, last_request_id: 1, nguoi_kt: 1, phat_hien_luc: 1 };
var XU_LY_FIELDS = ['xu_ly', 'so_cv', 'han_xu_ly', 'ngay_xu_ly'];
var TS_COLS = { tao_luc: 1, sua_luc: 1, phat_hien_luc: 1 };
var BOOL_COLS = { toa_do_tin_cay: 1, dien_24h: 1, cb_rieng: 1, cs_uoc_tinh: 1, xoa: 1 };
var NUM_COLS = { so_tru_qua: 1, lat: 1, lng: 1, gps_acc: 1, so_luong: 1, chieu_cao_m: 1, cong_suat_w: 1, version: 1 };
var TK_COLS = ['uid', 'ho_ten', 'vai_tro', 'quan', 'pw', 'tok_ver', 'khoa', 'sai_lan', 'khoa_den', 'tao_luc', 'phai_doi_mk'];
var SHEETS = {
  ThietBi: COLS,
  TaiKhoan: TK_COLS,
  CauHinh: ['khoa', 'gia_tri', 'ghi_chu'],
  NhatKy: ['luc', 'uid', 'hanh_dong', 'id', 'truong', 'cu', 'moi'],
  GopY: ['luc', 'client_id', 'uid', 'sao', 'loai', 'noi_dung', 'phien_ban', 'thiet_bi', 'man_hinh', 'vi_tri', 'status', 'note'],
  Anh: ['photo_client_id', 'file_id', 'uid', 'luc', 'bytes']
};
var LIMIT_NORMAL = 64 * 1024, LIMIT_PHOTO = 900 * 1024, PHOTO_MAX = 600 * 1024;
var TOKEN_TTL_MS = 12 * 3600e3, PW_ITER_DEFAULT = 5000, LOGIN_PER_MIN = 30;
var ACTIONS = { login: 1, me: 1, sync: 1, save: 1, del: 1, recheck: 1, uploadPhoto: 1, getPhoto: 1, feedback: 1, changePw: 1, users: 1, userSave: 1, userResetPw: 1, ping: 1 };

// ================= Điểm vào =================
function doGet() { return json_({ ok: true, code: 'OK', data: { app: 'TBNgoai', version: APP_VERSION } }); }

function doPost(e) {
  var out;
  try { out = handle_(e); }
  catch (err) { out = { ok: false, code: err && err.code || 'SERVER', error: err && err.code ? err.message : 'Lỗi máy chủ', data: err && err.data }; if (!(err && err.code)) console.error(err && err.stack || err); }
  return json_(out);
}

function handle_(e) {
  var len = e && e.postData ? (e.postData.length || (e.postData.contents || '').length) : 0;
  if (!len) throw fail_('BAD_REQUEST', 'Yêu cầu rỗng');
  if (len > LIMIT_PHOTO) throw fail_('TOO_LARGE', 'Dữ liệu gửi quá lớn');
  var req;
  try { req = JSON.parse(e.postData.contents); } catch (x) { throw fail_('BAD_REQUEST', 'Dữ liệu không phải JSON'); }
  var action = String(req.action || '');
  if (!ACTIONS[action]) throw fail_('BAD_ACTION', 'Thao tác không hợp lệ');
  if (action !== 'uploadPhoto' && len > LIMIT_NORMAL) throw fail_('TOO_LARGE', 'Dữ liệu gửi quá lớn');
  var p = req.payload || {};
  if (action === 'ping') return ok_({ version: APP_VERSION });
  if (action === 'login') return ok_(login_(p));
  var user = auth_(req.token);
  if (Core.toBool(user.phai_doi_mk) === true && action !== 'me' && action !== 'changePw') throw fail_('MUST_CHANGE', 'Vui lòng đổi mật khẩu tạm trước khi dùng');
  switch (action) {
    case 'me': return ok_({ user: publicUser_(user), cfg: cfg_(), version: APP_VERSION });
    case 'sync': return ok_(sync_(user, p));
    case 'save': return ok_(save_(user, p, String(req.requestId || '')));
    case 'del': return ok_(del_(user, p, String(req.requestId || '')));
    case 'recheck': return ok_(recheck_(user, p, String(req.requestId || '')));
    case 'uploadPhoto': return ok_(uploadPhoto_(user, p));
    case 'getPhoto': return ok_(getPhoto_(user, p));
    case 'feedback': return ok_(feedback_(user, p));
    case 'changePw': return ok_(changePw_(user, p));
    case 'users': need_(Core.can(user, 'users')); return ok_({ users: readUsers_().map(publicUser_) });
    case 'userSave': need_(Core.can(user, 'users')); return ok_(userSave_(user, p));
    case 'userResetPw': need_(Core.can(user, 'users')); return ok_(userResetPw_(user, p));
  }
  throw fail_('BAD_ACTION', 'Thao tác không hợp lệ');
}

function ok_(data) { return { ok: true, code: 'OK', data: data }; }
function fail_(code, msg, data) { var e = new Error(msg); e.code = code; if (data) e.data = data; return e; }
function need_(cond) { if (!cond) throw fail_('FORBIDDEN', 'Bạn không có quyền thực hiện thao tác này'); }
function json_(o) {
  if (o && o.ok === false && o.data === undefined) delete o.data;
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function nowIso_() { return new Date().toISOString(); }

// ================= Sheet helpers =================
function ss_() { return SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(prop_('SHEET_ID')); }
function sh_(name) {
  var s = ss_().getSheetByName(name);
  if (!s) { s = ss_().insertSheet(name); s.getRange(1, 1, 1, SHEETS[name].length).setValues([SHEETS[name]]); textFormat_(s, name); }
  return s;
}
/** Ép định dạng VĂN BẢN (@) cho cột chuỗi/ngày để Sheets không tự đổi '012' → 12, '2026-01-05' → ô ngày, SĐT mất số 0. */
function textFormat_(s, name) {
  var cols = SHEETS[name], rows = Math.max(s.getMaxRows ? s.getMaxRows() : 1000, 1000);
  cols.forEach(function (k, j) { if (!(name === 'ThietBi' && (NUM_COLS[k] || BOOL_COLS[k]))) s.getRange(1, j + 1, rows, 1).setNumberFormat('@'); });
}
function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k); }
function setProp_(k, v) { PropertiesService.getScriptProperties().setProperty(k, String(v)); }
function header_(s) { return s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0].map(String); }

function readAll_(name) {
  var s = sh_(name), n = s.getLastRow() - 1;
  if (n < 1) return [];
  var h = header_(s), v = s.getRange(2, 1, n, h.length).getValues();
  return v.map(function (row, i) { var o = { _row: i + 2 }; h.forEach(function (k, j) { o[k] = row[j]; }); return o; });
}
function fromRow_(o) {
  var r = {};
  COLS.forEach(function (k) {
    var v = o[k];
    if (v instanceof Date) v = TS_COLS[k] ? v.toISOString() : Utilities.formatDate(v, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd'); // ô bị Sheets đổi thành ngày
    if (typeof v === 'string' && v.charAt(0) === "'") v = v.slice(1);
    if (BOOL_COLS[k]) v = v === true || v === 'TRUE' || v === 'true';
    else if (NUM_COLS[k]) v = v === '' || v == null ? '' : Number(v);
    else if (k === 'van_de' || k === 'anh') v = String(v || '').split(',').filter(Boolean);
    else v = v == null ? '' : String(v);
    r[k] = v;
  });
  return r;
}
function toRow_(r) {
  return COLS.map(function (k) {
    var v = r[k];
    if (BOOL_COLS[k]) return v === true || v === 'TRUE' || v === 'true';
    if (v === undefined || v === null) return '';
    if (NUM_COLS[k]) return v === '' ? '' : Number(v);
    if (Array.isArray(v)) v = v.join(',');
    return Core.sanitizeCell(String(v));
  });
}
function seenReq_(old, requestId) { return String(old.last_request_id || '').split(',').indexOf(requestId) >= 0; }
function pushReq_(old, requestId) { return [requestId].concat(String(old.last_request_id || '').split(',').filter(Boolean)).slice(0, 5).join(','); }
function colIndex_(name) { return COLS.indexOf(name) + 1; }
function findRow_(col, value) {
  var s = sh_('ThietBi'), n = s.getLastRow() - 1;
  if (n < 1 || !value) return 0;
  var v = s.getRange(2, colIndex_(col), n, 1).getValues();
  for (var i = 0; i < v.length; i++) if (String(v[i][0]) === String(value)) return i + 2;
  return 0;
}
function readRow_(row) {
  var o = {}, v = sh_('ThietBi').getRange(row, 1, 1, COLS.length).getValues()[0];
  COLS.forEach(function (k, j) { o[k] = v[j]; });
  return fromRow_(o);
}
function withLock_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw fail_('BUSY', 'Máy chủ đang bận, đang thử lại…');
  try { var r = fn(); SpreadsheetApp.flush(); return r; }
  finally { lock.releaseLock(); }
}
function log_(uid, act, id, field, oldV, newV) {
  sh_('NhatKy').appendRow([nowIso_(), uid, act, id, field || '', Core.sanitizeCell(String(oldV == null ? '' : oldV)).slice(0, 1000), Core.sanitizeCell(String(newV == null ? '' : newV)).slice(0, 1000)]);
}
function cfg_() {
  var c = {}, k;
  for (k in Core.DEFAULT_CFG) c[k] = Core.DEFAULT_CFG[k];
  readAll_('CauHinh').forEach(function (r) { var key = String(r.khoa); if (key in c && r.gia_tri !== '' && isFinite(Number(r.gia_tri))) c[key] = Number(r.gia_tri); });
  return c;
}

// ================= Mật khẩu & phiên =================
function bytes_(s) { return Utilities.newBlob(String(s)).getBytes(); }
function hex_(b) { return b.map(function (x) { var h = (x & 255).toString(16); return h.length < 2 ? '0' + h : h; }).join(''); }
function hashPw_(pw, salt, iter) {
  var h = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, bytes_(salt + '|' + pw));
  var p = bytes_(pw);
  for (var i = 1; i < iter; i++) h = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h.concat(p));
  return hex_(h);
}
function makePw_(pw) {
  var iter = Number(prop_('PW_ITER')) || PW_ITER_DEFAULT, salt = Utilities.getUuid().replace(/-/g, '');
  return 'sha256i$' + iter + '$' + salt + '$' + hashPw_(pw, salt, iter);
}
function checkPw_(pw, stored) {
  var p = String(stored || '').split('$');
  if (p.length !== 4 || p[0] !== 'sha256i') return false;
  return Core.safeEqual(hashPw_(pw, p[2], Number(p[1])), p[3]);
}
function secret_() {
  var s = prop_('HMAC_SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); setProp_('HMAC_SECRET', s); }
  return s;
}
function sign_(payload) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(payload, secret_())).replace(/=+$/, ''); }
function makeToken_(u) {
  var payload = [u.uid, Number(u.tok_ver) || 0, Date.now() + TOKEN_TTL_MS].join('|');
  return Utilities.base64EncodeWebSafe(payload).replace(/=+$/, '') + '.' + sign_(payload);
}
function auth_(token) {
  var bad = fail_('AUTH', 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
  var parts = String(token || '').split('.');
  if (parts.length !== 2) throw bad;
  var payload;
  try { payload = Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0] + '==='.slice((parts[0].length + 3) % 4))).getDataAsString(); } catch (x) { throw bad; }
  if (!Core.safeEqual(sign_(payload), parts[1])) throw bad;
  var f = payload.split('|');
  if (f.length !== 3 || Number(f[2]) < Date.now()) throw bad;
  var u = findUser_(f[0]);
  if (!u || Core.toBool(u.khoa) === true || String(Number(u.tok_ver) || 0) !== f[1]) throw bad;
  return u;
}
function readUsers_() {
  return readAll_('TaiKhoan').filter(function (u) { return String(u.uid).trim(); }).map(function (u) {
    u.uid = String(u.uid).trim().toLowerCase();
    u.quan = String(u.quan || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    return u;
  });
}
function findUser_(uid) { uid = String(uid || '').trim().toLowerCase(); return readUsers_().filter(function (u) { return u.uid === uid; })[0] || null; }
function publicUser_(u) { return { uid: u.uid, ho_ten: String(u.ho_ten || ''), vai_tro: String(u.vai_tro), quan: u.quan, khoa: Core.toBool(u.khoa) === true }; }
function setUserCells_(u, obj) {
  var s = sh_('TaiKhoan'), h = header_(s);
  for (var k in obj) { var c = h.indexOf(k); if (c >= 0) s.getRange(u._row, c + 1).setValue(obj[k]); }
}

function login_(p) {
  var cache = CacheService.getScriptCache(), mk = 'login_' + Math.floor(Date.now() / 60000);
  var cnt = Number(cache.get(mk) || 0) + 1;
  cache.put(mk, String(cnt), 120);
  if (cnt > LOGIN_PER_MIN) throw fail_('RATE', 'Quá nhiều lượt đăng nhập, thử lại sau 1 phút');
  var uid = String(p.uid || '').trim().toLowerCase(), pw = String(p.pw || '');
  var generic = fail_('LOGIN', 'Sai tài khoản hoặc mật khẩu');
  if (!uid || !pw || pw.length > 200) throw generic;
  var u = findUser_(uid);
  var iter = Number(prop_('PW_ITER')) || PW_ITER_DEFAULT;
  if (!u) { hashPw_(pw, 'x', iter); throw generic; } // cùng thời gian băm → không lộ tên đăng nhập
  if (Core.toBool(u.khoa) === true) throw fail_('LOCKED', 'Tài khoản đã bị khoá, liên hệ quản trị');
  var until = u.khoa_den ? new Date(u.khoa_den).getTime() : 0;
  if (until && until > Date.now()) throw fail_('LOCKED', 'Sai mật khẩu nhiều lần, thử lại sau ' + Math.ceil((until - Date.now()) / 60000) + ' phút');
  var good = checkPw_(pw, u.pw); // băm NGOÀI lock
  if (!good) {
    withLock_(function () {
      var x = findUser_(uid), n = (Number(x.sai_lan) || 0) + 1;
      setUserCells_(x, n >= 5 ? { sai_lan: 0, khoa_den: new Date(Date.now() + 5 * 60000).toISOString() } : { sai_lan: n });
    });
    throw generic;
  }
  if (Number(u.sai_lan) || u.khoa_den) withLock_(function () { setUserCells_(findUser_(uid), { sai_lan: 0, khoa_den: '' }); });
  return { token: makeToken_(u), user: publicUser_(u), cfg: cfg_(), version: APP_VERSION, must_change: Core.toBool(u.phai_doi_mk) === true };
}
function changePw_(user, p) {
  var np = String(p.new_pw || '');
  if (np.length < 8 || np.length > 100) throw fail_('VALIDATION', 'Mật khẩu mới phải từ 8 ký tự');
  if (!checkPw_(String(p.old_pw || ''), user.pw)) throw fail_('LOGIN', 'Mật khẩu cũ không đúng');
  return withLock_(function () {
    var u = findUser_(user.uid), tv = (Number(u.tok_ver) || 0) + 1;
    setUserCells_(u, { pw: makePw_(np), tok_ver: tv, phai_doi_mk: false });
    u.tok_ver = tv;
    log_(user.uid, 'doi_mk', '', '', '', '');
    return { token: makeToken_(u) };
  });
}
function userSave_(admin, p) {
  var uid = String(p.uid || '').trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,40}$/.test(uid)) throw fail_('VALIDATION', 'Tên đăng nhập 3–40 ký tự a-z, 0-9, . _ -');
  if (!Core.DM.VAI_TRO[p.vai_tro]) throw fail_('VALIDATION', 'Vai trò không hợp lệ');
  var quan = (p.quan || []).filter(function (q) { return Core.DM.QUAN[q]; });
  if (p.vai_tro === 'nhaplieu' && !quan.length) throw fail_('VALIDATION', 'Nhập liệu phải được giao ít nhất 1 quận');
  if (uid === admin.uid && (p.vai_tro !== 'admin' || p.khoa)) throw fail_('VALIDATION', 'Không thể tự khoá hoặc tự hạ quyền tài khoản đang dùng');
  return withLock_(function () {
    var u = findUser_(uid), temp = null;
    if (!u) {
      temp = tempPw_();
      sh_('TaiKhoan').appendRow([uid, Core.sanitizeCell(String(p.ho_ten || '')), p.vai_tro, quan.join(','), makePw_(temp), 0, !!p.khoa, 0, '', nowIso_(), true]);
      log_(admin.uid, 'tao_tk', uid, 'vai_tro', '', p.vai_tro);
    } else {
      var changed = u.vai_tro !== p.vai_tro || u.quan.join(',') !== quan.join(',') || (Core.toBool(u.khoa) === true) !== !!p.khoa;
      setUserCells_(u, { ho_ten: Core.sanitizeCell(String(p.ho_ten || '')), vai_tro: p.vai_tro, quan: quan.join(','), khoa: !!p.khoa, tok_ver: changed ? (Number(u.tok_ver) || 0) + 1 : u.tok_ver });
      log_(admin.uid, 'sua_tk', uid, 'vai_tro/quan/khoa', [u.vai_tro, u.quan.join(','), u.khoa].join(' | '), [p.vai_tro, quan.join(','), !!p.khoa].join(' | '));
    }
    return { user: publicUser_(findUser_(uid)), temp_pw: temp };
  });
}
function userResetPw_(admin, p) {
  return withLock_(function () {
    var u = findUser_(p.uid);
    if (!u) throw fail_('NOT_FOUND', 'Không có tài khoản');
    var temp = tempPw_();
    setUserCells_(u, { pw: makePw_(temp), tok_ver: (Number(u.tok_ver) || 0) + 1, sai_lan: 0, khoa_den: '', phai_doi_mk: true });
    log_(admin.uid, 'cap_lai_mk', u.uid, '', '', '');
    return { temp_pw: temp };
  });
}
function tempPw_() { return Utilities.getUuid().replace(/-/g, '').slice(0, 10); }

// ================= Dữ liệu =================
function sync_(user, p) {
  need_(Core.can(user, 'read'));
  var since = String(p.since || ''), epoch = prop_('EPOCH') || '1';
  var full = !since || String(p.epoch || '') !== epoch;
  var now = nowIso_(), bad = 0, rows = [];
  readAll_('ThietBi').forEach(function (o) {
    if (!String(o.id || '').trim()) { if (String(o.quan || o.tuyen || '').trim()) bad++; return; }
    var r = fromRow_(o);
    if (!r.xoa && !Core.rowSane(r)) { bad++; return; } // dòng bị sửa tay sai → bỏ qua, báo admin
    if (full ? !r.xoa : r.sua_luc > since) rows.push(r);
  });
  // Trả về dạng cột rút gọn để giảm dung lượng
  return { full: full, epoch: epoch, since: new Date(Date.parse(now) - 5000).toISOString(), cols: COLS, rows: rows.map(function (r) { return COLS.map(function (k) { return r[k]; }); }), bad_rows: bad, cfg: cfg_() };
}

function save_(user, p, requestId) {
  if (!requestId) throw fail_('BAD_REQUEST', 'Thiếu requestId');
  var input = p.rec || {}, isNew = !input.id;
  var clean = {};
  for (var k in input) if (!SERVER_FIELDS[k] && COLS.indexOf(k) >= 0) clean[k] = input[k];
  var mayXuLy = Core.can(user, 'xu_ly');
  if (!mayXuLy && isNew) { clean.xu_ly = 'chua'; clean.so_cv = ''; clean.han_xu_ly = ''; clean.ngay_xu_ly = ''; }
  if (!mayXuLy && !isNew) { // lấy lại các trường xử lý từ bản đang lưu, không tin client
    var oRow = findRow_('id', input.id); if (oRow) { var o0 = readRow_(oRow); XU_LY_FIELDS.forEach(function (f) { clean[f] = o0[f]; }); }
  }
  var v = Core.validate(clean, { dm: Core.DM });
  if (!v.ok) throw fail_('VALIDATION', v.errors.map(function (e) { return e.msg; }).join('; '), { errors: v.errors });
  var rec = v.rec;
  if (rec.anh.length > 3) throw fail_('VALIDATION', 'Tối đa 3 ảnh');
  if (rec.anh.length) {
    var known = {}; readAll_('Anh').forEach(function (a) { known[String(a.file_id)] = 1; });
    rec.anh.forEach(function (f) { if (!known[f]) throw fail_('VALIDATION', 'Ảnh không hợp lệ hoặc chưa tải lên xong'); });
  }
  if (!rec.ngay_kt) rec.ngay_kt = Core.todayVN(new Date());

  // Kiểm trùng (tư vấn, ngoài lock)
  if (isNew && !p.confirmDup) {
    var all = readAll_('ThietBi').filter(function (o) { return o.id; }).map(fromRow_);
    var cid = String(input.client_id || '');
    var existing = all.filter(function (x) { return x.client_id === cid; })[0];
    if (!existing) {
      var dups = Core.findDuplicates(rec, all);
      if (dups.length) throw fail_('DUP', 'Có thể trùng bản ghi đã có', { dups: dups.slice(0, 5) });
    }
  }

  return withLock_(function () {
    var t = nowIso_();
    if (isNew) {
      var cid = String(input.client_id || '');
      if (!/^[A-Za-z0-9-]{8,64}$/.test(cid)) throw fail_('BAD_REQUEST', 'client_id không hợp lệ');
      var exRow = findRow_('client_id', cid);
      if (exRow) return { rec: readRow_(exRow), replay: true };
      need_(Core.can(user, 'create', rec));
      rec.id = 'TB' + t.slice(2, 10).replace(/-/g, '') + '-' + Utilities.getUuid().slice(0, 8);
      rec.client_id = cid; rec.tao_luc = t; rec.tao_boi = user.uid; rec.sua_luc = t; rec.sua_boi = user.uid;
      rec.xoa = false; rec.version = 1; rec.last_request_id = requestId; rec.nguoi_kt = user.uid;
      rec.phat_hien_luc = rec.an_toan === 'dat' ? '' : t;
      sh_('ThietBi').appendRow(toRow_(rec));
      log_(user.uid, 'tao', rec.id, '', '', rec.nhom + ' / ' + rec.don_vi + ' / trụ ' + (rec.tu ? rec.tu + '/' : '') + rec.so_tru);
      return { rec: rec };
    }
    var row = findRow_('id', input.id);
    if (!row) throw fail_('NOT_FOUND', 'Bản ghi không còn tồn tại');
    var old = readRow_(row);
    if (seenReq_(old, requestId)) return { rec: old, replay: true };
    if (old.xoa) throw fail_('NOT_FOUND', 'Bản ghi đã bị xoá');
    need_(Core.can(user, 'update', rec, old));
    if (Number(input.version) !== Number(old.version)) throw fail_('CONFLICT', 'Bản ghi vừa được người khác sửa', { current: old });
    ['id', 'client_id', 'tao_luc', 'tao_boi', 'xoa'].forEach(function (f) { rec[f] = old[f]; });
    if (!mayXuLy) XU_LY_FIELDS.forEach(function (f) { rec[f] = old[f]; });
    var RANK = { dat: 0, can_kp: 1, nguy_hiem: 2 }, worse = RANK[rec.an_toan] > (RANK[old.an_toan] || 0);
    rec.phat_hien_luc = rec.an_toan === 'dat' ? '' : (!worse && old.phat_hien_luc ? old.phat_hien_luc : t);
    if (worse) { rec.xu_ly = 'chua'; rec.so_cv = ''; rec.han_xu_ly = ''; rec.ngay_xu_ly = ''; } // an toàn xấu đi → mở lại vòng xử lý
    rec.sua_luc = t; rec.sua_boi = user.uid; rec.version = Number(old.version) + 1; rec.last_request_id = pushReq_(old, requestId); rec.nguoi_kt = user.uid;
    if (rec.xu_ly !== old.xu_ly && rec.xu_ly !== 'chua' && !rec.ngay_xu_ly) rec.ngay_xu_ly = Core.todayVN(new Date());
    sh_('ThietBi').getRange(row, 1, 1, COLS.length).setValues([toRow_(rec)]);
    diffLog_(user.uid, old, rec);
    return { rec: rec };
  });
}
function fromCell_(v) { return typeof v === 'string' && v.charAt(0) === "'" ? v.slice(1) : v; }
function diffLog_(uid, a, b) {
  var rows = [], t = nowIso_(), c = function (v) { return Core.sanitizeCell(String(v)).slice(0, 1000); };
  var ra = toRow_(a), rb = toRow_(b); // so theo dạng sẽ ghi xuống Sheet (chuẩn hoá bool/số/mảng)
  COLS.forEach(function (k, i) {
    if (SERVER_FIELDS[k]) return;
    var x = String(ra[i]), y = String(rb[i]);
    if (x !== y) rows.push([t, uid, 'sua', b.id, k, c(fromCell_(ra[i])), c(fromCell_(rb[i]))]);
  });
  if (rows.length) { var s = sh_('NhatKy'); s.getRange(s.getLastRow() + 1, 1, rows.length, 7).setValues(rows); } // ghi 1 lần
}
function del_(user, p, requestId) {
  if (!requestId) throw fail_('BAD_REQUEST', 'Thiếu requestId');
  return withLock_(function () {
    var row = findRow_('id', p.id);
    if (!row) throw fail_('NOT_FOUND', 'Bản ghi không còn tồn tại');
    var old = readRow_(row);
    if (seenReq_(old, requestId)) return { rec: old, replay: true };
    if (old.xoa) throw fail_('NOT_FOUND', 'Bản ghi đã bị xoá');
    need_(Core.can(user, 'delete', old));
    if (Number(p.version) !== Number(old.version)) throw fail_('CONFLICT', 'Bản ghi vừa được người khác sửa', { current: old });
    old.xoa = true; old.sua_luc = nowIso_(); old.sua_boi = user.uid; old.version++; old.last_request_id = pushReq_(old, requestId);
    sh_('ThietBi').getRange(row, 1, 1, COLS.length).setValues([toRow_(old)]);
    log_(user.uid, 'xoa', old.id, 'ly_do', '', String(p.ly_do || '').slice(0, 300));
    return { rec: old };
  });
}
function recheck_(user, p, requestId) {
  if (!requestId) throw fail_('BAD_REQUEST', 'Thiếu requestId');
  return withLock_(function () {
    var row = findRow_('id', p.id);
    if (!row) throw fail_('NOT_FOUND', 'Bản ghi không còn tồn tại');
    var old = readRow_(row);
    if (seenReq_(old, requestId)) return { rec: old, replay: true };
    if (old.xoa) throw fail_('NOT_FOUND', 'Bản ghi đã bị xoá');
    need_(Core.can(user, 'update', old, old));
    old.ngay_kt = Core.todayVN(new Date()); old.nguoi_kt = user.uid; old.sua_luc = nowIso_(); old.sua_boi = user.uid; old.version++; old.last_request_id = pushReq_(old, requestId);
    sh_('ThietBi').getRange(row, 1, 1, COLS.length).setValues([toRow_(old)]);
    log_(user.uid, 'kiem_tra_lai', old.id, 'ngay_kt', '', old.ngay_kt);
    return { rec: old };
  });
}

// ================= Ảnh =================
function folder_() {
  var id = prop_('FOLDER_ID'), f = null;
  if (id) try { f = DriveApp.getFolderById(id); } catch (x) { f = null; }
  if (!f) { f = DriveApp.createFolder('TBNgoai - Ảnh hiện trường'); setProp_('FOLDER_ID', f.getId()); }
  return f;
}
function uploadPhoto_(user, p) {
  need_(['admin', 'giamsat', 'nhaplieu'].indexOf(user.vai_tro) >= 0);
  var pcid = String(p.photo_client_id || '');
  if (!/^[A-Za-z0-9-]{8,64}$/.test(pcid)) throw fail_('BAD_REQUEST', 'photo_client_id không hợp lệ');
  var prev = readAll_('Anh').filter(function (a) { return String(a.photo_client_id) === pcid; })[0];
  if (prev) return { file_id: String(prev.file_id), replay: true };
  var bytes;
  try { bytes = Utilities.base64Decode(String(p.b64 || '')); } catch (x) { throw fail_('VALIDATION', 'Ảnh hỏng'); }
  if (!bytes.length || bytes.length > PHOTO_MAX) throw fail_('VALIDATION', 'Ảnh phải nhỏ hơn 600 KB');
  var b0 = bytes[0] & 255, b1 = bytes[1] & 255, b2 = bytes[2] & 255, b3 = bytes[3] & 255, mime;
  if (b0 === 0xFF && b1 === 0xD8 && b2 === 0xFF) mime = 'image/jpeg';
  else if (b0 === 0x89 && b1 === 0x50 && b2 === 0x4E && b3 === 0x47) mime = 'image/png';
  else throw fail_('VALIDATION', 'Chỉ nhận ảnh JPEG hoặc PNG');
  var file = folder_().createFile(Utilities.newBlob(bytes, mime, pcid + (mime === 'image/png' ? '.png' : '.jpg')));
  return withLock_(function () {
    var again = readAll_('Anh').filter(function (a) { return String(a.photo_client_id) === pcid; })[0];
    if (again) { file.setTrashed(true); return { file_id: String(again.file_id), replay: true }; }
    sh_('Anh').appendRow([pcid, file.getId(), user.uid, nowIso_(), bytes.length]);
    return { file_id: file.getId() };
  });
}
function getPhoto_(user, p) {
  need_(Core.can(user, 'read'));
  var fid = String(p.file_id || '');
  var known = readAll_('Anh').filter(function (a) { return String(a.file_id) === fid; })[0];
  if (!known) throw fail_('NOT_FOUND', 'Không tìm thấy ảnh');
  var blob = DriveApp.getFileById(fid).getBlob();
  return { mime: blob.getContentType(), b64: Utilities.base64Encode(blob.getBytes()) };
}

// ================= Góp ý =================
function feedback_(user, p) {
  var sao = Number(p.sao) || '', nd = String(p.noi_dung || '').slice(0, 2000);
  if (!sao && !nd.trim()) throw fail_('VALIDATION', 'Chọn số sao hoặc nhập nội dung');
  if (sao && !(sao >= 1 && sao <= 5)) throw fail_('VALIDATION', 'Số sao 1–5');
  var cid = String(p.client_id || '');
  return withLock_(function () {
    if (cid && readAll_('GopY').some(function (g) { return String(g.client_id) === cid; })) return { replay: true };
    var c = Core.sanitizeCell;
    sh_('GopY').appendRow([nowIso_(), c(cid), user.uid, sao, c(String(p.loai || 'khac').slice(0, 40)), c(nd), c(String(p.phien_ban || '').slice(0, 40)), c(String(p.thiet_bi || '').slice(0, 200)), c(String(p.man_hinh || '').slice(0, 60)), c(String(p.vi_tri || '').slice(0, 60)), 'moi', '']);
    return { saved: true };
  });
}

// ================= Cài đặt & trigger =================
/** Chạy 1 lần trong trình soạn thảo: tạo sheet, khoá bí mật, tài khoản admin, trigger. Mật khẩu tạm in ra nhật ký thực thi. */
function setup() {
  Object.keys(SHEETS).forEach(function (n) { textFormat_(sh_(n), n); });
  secret_(); folder_();
  if (!prop_('EPOCH')) setProp_('EPOCH', '1');
  var cfg = sh_('CauHinh');
  if (cfg.getLastRow() < 2) {
    var notes = { vb_nhac_ngay: 'Nhắc văn bản sắp hết hạn (ngày)', nguy_hiem_gio: 'Nguy hiểm phải xử lý trong (giờ)', can_kp_ngay: 'Cần khắc phục quá (ngày) → đỏ', dat_kt_ngay: 'Kiểm tra lại mức Đạt sau (ngày)', dang_tt_ngay: 'Làm thủ tục quá (ngày)', le_hoi_nhac_ngay: 'Nhắc trước ngày tháo lễ hội (ngày)', le_hoi_qua_ngay: 'Quá ngày tháo (ngày) → đỏ' };
    Object.keys(Core.DEFAULT_CFG).forEach(function (k) { cfg.appendRow([k, Core.DEFAULT_CFG[k], notes[k]]); });
  }
  if (!readUsers_().length) {
    var temp = tempPw_();
    sh_('TaiKhoan').appendRow(['admin', 'Quản trị', 'admin', '', makePw_(temp), 0, false, 0, '', nowIso_(), true]);
    console.log('Tài khoản: admin — Mật khẩu tạm: ' + temp + '  (đổi ngay sau khi đăng nhập)');
  }
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('dailyJob').timeBased().everyDays(1).atHour(1).create();
}
/** Đo số vòng băm để đăng nhập ≈ 1 giây; lưu PW_ITER. */
function benchmarkHash() {
  var t = Date.now(); hashPw_('thu-mat-khau', 'muoi', 2000); var ms = Date.now() - t;
  var iter = Math.max(PW_ITER_DEFAULT, Math.round(2000 * 1000 / Math.max(ms, 1)));
  setProp_('PW_ITER', iter); console.log('2000 vòng = ' + ms + ' ms → PW_ITER = ' + iter);
}
function dailyJob() { backup_(); cleanOrphans_(); }
function backup_() {
  var id = prop_('BACKUP_FOLDER_ID'), f = null;
  if (id) try { f = DriveApp.getFolderById(id); } catch (x) { f = null; }
  if (!f) { f = DriveApp.createFolder('TBNgoai - Sao lưu'); setProp_('BACKUP_FOLDER_ID', f.getId()); }
  DriveApp.getFileById(ss_().getId()).makeCopy('TBNgoai_' + Core.todayVN(new Date()), f);
  var files = [], it = f.getFiles();
  while (it.hasNext()) files.push(it.next());
  files.sort(function (a, b) { return b.getDateCreated() - a.getDateCreated(); });
  files.slice(30).forEach(function (x) { x.setTrashed(true); });
}
function cleanOrphans_() {
  var used = {};
  readAll_('ThietBi').forEach(function (o) { String(o.anh || '').split(',').forEach(function (f) { if (f) used[f] = 1; }); });
  var limit = Date.now() - 30 * 864e5, s = sh_('Anh'); // 30 ngày: chừa thời gian cho bản ghi kẹt trong hàng chờ offline
  readAll_('Anh').reverse().forEach(function (a) {
    if (!used[String(a.file_id)] && new Date(a.luc).getTime() < limit) {
      try { DriveApp.getFileById(String(a.file_id)).setTrashed(true); } catch (x) {}
      s.deleteRow(a._row);
    }
  });
}

// ================= Lõi nghiệp vụ (nhúng từ src/core.js) =================
//@@CORE@@
