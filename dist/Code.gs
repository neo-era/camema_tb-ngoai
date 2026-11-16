/* TBNgoài — Backend Apps Script (Web App: Execute as Me, Access: Anyone).
 * File này được sinh bởi tools/build.mjs: lõi nghiệp vụ (src/core.js) nhúng ở dưới. KHÔNG sửa tay phần lõi. */
var APP_VERSION = '1.0.8';

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
  Anh: ['photo_client_id', 'file_id', 'uid', 'luc', 'bytes', 'chup_luc', 'lat', 'lng', 'gps_acc', 'ten_file', 'thu_muc']
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
  else if (!HEADER_OK_[name]) { // sheet tạo từ bản cũ: bổ sung tiêu đề cột mới (không đụng dữ liệu)
    var n = s.getLastColumn(), cols = SHEETS[name];
    if (n < cols.length) s.getRange(1, n + 1, 1, cols.length - n).setValues([cols.slice(n)]);
  }
  HEADER_OK_[name] = true;
  return s;
}
var HEADER_OK_ = {};
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
  if (rec.anh.length > 5) throw fail_('VALIDATION', 'Tối đa 5 ảnh');
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
  // Thông tin ảnh (thời gian chụp, tọa độ) do máy chụp gửi kèm; người cập nhật lấy từ phiên đăng nhập
  var m = p.meta || {}, chup = Date.parse(m.chup_luc) ? new Date(Date.parse(m.chup_luc)) : new Date();
  if (chup.getTime() > Date.now() + 10 * 60000) chup = new Date();
  var lat = Number(m.lat), lng = Number(m.lng), acc = Number(m.gps_acc);
  var hasXY = m.lat !== '' && m.lat != null && lat >= 10.3 && lat <= 11.2 && lng >= 106.3 && lng <= 107.1;
  var thang = Utilities.formatDate(chup, 'Asia/Ho_Chi_Minh', 'yyyy-MM');
  var name = 'TB_' + Utilities.formatDate(chup, 'Asia/Ho_Chi_Minh', 'yyyyMMdd_HHmmss') + '_' + user.uid + '_' + pcid.slice(0, 8) + (mime === 'image/png' ? '.png' : '.jpg');
  var file = monthFolder_(thang).createFile(Utilities.newBlob(bytes, mime, name));
  file.setDescription(['TBNgoài – ảnh thiết bị', 'Thời gian chụp: ' + Utilities.formatDate(chup, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss'),
    'Tọa độ: ' + (hasXY ? lat.toFixed(6) + ', ' + lng.toFixed(6) + (acc > 0 ? ' (±' + Math.round(acc) + ' m)' : '') : 'chưa có'),
    'Người cập nhật: ' + (user.ho_ten ? user.ho_ten + ' (' + user.uid + ')' : user.uid)].join('\n'));
  return withLock_(function () {
    var again = readAll_('Anh').filter(function (a) { return String(a.photo_client_id) === pcid; })[0];
    if (again) { file.setTrashed(true); return { file_id: String(again.file_id), replay: true }; }
    sh_('Anh').appendRow([pcid, file.getId(), user.uid, nowIso_(), bytes.length, chup.toISOString(), hasXY ? lat : '', hasXY ? lng : '', acc > 0 ? Math.round(acc) : '', name, thang]);
    return { file_id: file.getId() };
  });
}
/** Thư mục con theo tháng trong thư mục ảnh riêng (VD "2026-11"). */
function monthFolder_(thang) {
  var root = folder_(), it = root.getFoldersByName(thang);
  return it.hasNext() ? it.next() : root.createFolder(thang);
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
/** Khôi phục: cấp mật khẩu tạm mới cho tài khoản admin (chạy trong trình soạn thảo khi quên mật khẩu). Mật khẩu in ra nhật ký thực thi. */
function capLaiMatKhauAdmin() {
  withLock_(function () {
    var u = findUser_('admin'), temp = tempPw_();
    if (!u) { sh_('TaiKhoan').appendRow(['admin', 'Quản trị', 'admin', '', makePw_(temp), 0, false, 0, '', nowIso_(), true]); }
    else setUserCells_(u, { pw: makePw_(temp), tok_ver: (Number(u.tok_ver) || 0) + 1, sai_lan: 0, khoa_den: '', khoa: false, vai_tro: 'admin', phai_doi_mk: true });
    log_('he_thong', 'cap_lai_mk', 'admin', '', '', '');
    console.log('Tài khoản: admin — Mật khẩu tạm: ' + temp + '  (đổi ngay sau khi đăng nhập)');
  });
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
/* TBNgoài — lõi nghiệp vụ thuần (không DOM, không mạng).
 * Dùng chung: trình duyệt (window.Core), Apps Script (biến toàn cục Core), Node (module.exports). */
var Core = (function () {
  'use strict';

  var DM = {
    QUAN: {
      Q1: { ten: 'Quận 1', phuong: ['Tân Định', 'Bến Thành', 'Sài Gòn', 'Cầu Ông Lãnh'] },
      Q3: { ten: 'Quận 3', phuong: ['Bàn Cờ', 'Xuân Hòa', 'Nhiêu Lộc'] },
      Q5: { ten: 'Quận 5', phuong: ['Chợ Quán', 'An Đông', 'Chợ Lớn'] },
      Q8: { ten: 'Quận 8', phuong: ['Chánh Hưng', 'Bình Đông', 'Phú Định'] },
      Q10: { ten: 'Quận 10', phuong: ['Vườn Lài', 'Diên Hồng', 'Hòa Hưng'] },
      Q11: { ten: 'Quận 11', phuong: ['Hòa Bình', 'Phú Thọ', 'Bình Thới', 'Minh Phụng'] },
      BT: { ten: 'Bình Thạnh', phuong: ['Gia Định', 'Bình Thạnh', 'Bình Lợi Trung', 'Thạnh Mỹ Tây', 'Bình Quới'] },
      PN: { ten: 'Phú Nhuận', phuong: ['Đức Nhuận', 'Cầu Kiệu', 'Phú Nhuận'] }
    },
    NHOM: {
      quan_trac: { ten: 'Quan trắc môi trường', icon: 'wind', loai: ['Không khí', 'Khí tượng', 'Tiếng ồn', 'Mực nước/ngập', 'Khác'] },
      camera_gt: { ten: 'Camera / giao thông', icon: 'cam', loai: ['Camera an ninh (Công an/phường)', 'Camera giám sát giao thông', 'Camera phạt nguội', 'Đếm/đo tốc độ xe', 'Bảng VMS', 'Khác'] },
      vien_thong: { ten: 'Viễn thông', icon: 'wifi', loai: ['Trạm phát sóng nhỏ', 'Wifi công cộng', 'Hộp/tủ thiết bị mạng', 'Cáp quang/cáp treo', 'Khác'] },
      do_dien: { ten: 'Đồng hồ / thiết bị đo điện', icon: 'zap', loai: ['Công tơ', 'Thiết bị đo điện năng', 'Khác'] },
      le_hoi: { ten: 'Trang trí lễ hội – tuyên truyền', icon: 'star', loai: ['Đèn dây', 'Mô-típ/hoa văn', 'Băng rôn đèn', 'Cờ/phướn', 'Khác'] },
      loa: { ten: 'Loa truyền thanh phường', icon: 'speaker', loai: ['Loa', 'Hộp điều khiển loa', 'Khác'] },
      bien_bao: { ten: 'Biển báo / chỉ dẫn / tên đường', icon: 'sign', loai: ['Biển báo', 'Biển chỉ dẫn', 'Biển tên đường', 'Khác'] },
      quang_cao: { ten: 'Quảng cáo, băng rôn, pano', icon: 'flag', loai: ['Băng rôn', 'Pano', 'Bảng quảng cáo', 'Khác'] },
      tu_hop: { ten: 'Tủ / hộp điện đơn vị khác', icon: 'box', loai: ['Tủ điện', 'Hộp điện', 'Khác'] },
      khac: { ten: 'Khác', icon: 'dots', loai: ['Khác'] }
    },
    PHAP_LY: { co_vb: 'Có văn bản', dang_tt: 'Đang làm thủ tục', sai_vb: 'Sai văn bản', khong_vb: 'Không văn bản (trái phép)', chua_ro: 'Chưa rõ' },
    LOAI_VB: { hd_sd: 'Hợp đồng sử dụng', thoa_thuan: 'Thỏa thuận', giay_phep: 'Giấy phép', chap_thuan: 'Chấp thuận của cơ quan' },
    BEN_CAP: { sapulico: 'Sapulico', so: 'Sở', phuong: 'UBND phường', khac: 'Khác' },
    NGUON: { luoi_cs: 'Lưới chiếu sáng', rieng: 'Nguồn riêng / điện lực', pin_nlmt: 'Pin / mặt trời', khong_dien: 'Không dùng điện', chua_ro: 'Chưa rõ' },
    DIEM_DAU: { trong_tu: 'Trong tủ', cua_tru: 'Trong cửa trụ', day_noi: 'Trên dây nổi' },
    CONG_TO: { el_rieng: 'Công tơ điện lực riêng', phu: 'Công tơ phụ', khong: 'Không có' },
    AN_TOAN: { dat: 'Đạt', can_kp: 'Cần khắc phục', nguy_hiem: 'Nguy hiểm' },
    VAN_DE: {
      ro_dien: 'Rò điện thân/cửa trụ', cua_tru: 'Mất/hở cửa trụ', khoan_han: 'Khoan/hàn thân trụ',
      tinh_khong: 'Thấp, vướng xe (tĩnh không)', day_vong: 'Dây treo võng', cap_du: 'Cáp dư, chằng chịt',
      dau_noi: 'Đấu nối không an toàn', long_leo: 'Lỏng lẻo, không chắc chắn', che_den: 'Che khuất đèn',
      gio: 'Diện tích chắn gió lớn', tru_nghieng: 'Trụ nghiêng/biến dạng', qua_tai: 'Tải trọng vượt mức', khac: 'Khác'
    },
    XU_LY: { chua: 'Chưa xử lý', da_tb: 'Đã thông báo đơn vị', da_kp: 'Đơn vị đã khắc phục', da_thao: 'Đã tháo dỡ', chuyen_cq: 'Đã chuyển cơ quan chức năng' },
    TRANG_THAI: { dang_lap: 'Đang lắp', bo_hoang: 'Bỏ hoang, cần thu hồi', da_thao: 'Đã tháo' },
    VAI_TRO: { admin: 'Quản trị', giamsat: 'Giám sát', nhaplieu: 'Nhập liệu', xem: 'Chỉ xem' },
    VO_CHU: 'Chưa xác định chủ'
  };

  var DEFAULT_CFG = { vb_nhac_ngay: 60, nguy_hiem_gio: 24, can_kp_ngay: 30, dat_kt_ngay: 180, dang_tt_ngay: 60, le_hoi_nhac_ngay: 3, le_hoi_qua_ngay: 1 };

  var ALERTS = {
    dau_truoc_ct: { level: 'do', text: 'Nghi đấu trước contactor (điện 24/24 từ lưới chiếu sáng)' },
    nguy_hiem: { level: 'do', text: 'Nguy hiểm' },
    khong_vb: { level: 'do', text: 'Không văn bản (trái phép)' },
    vb_het_han: { level: 'do', text: 'Văn bản hết hạn' },
    le_hoi_qua_han: { level: 'do', text: 'Quá hạn tháo đèn lễ hội' },
    qua_han_xl: { level: 'do', text: 'Quá hạn xử lý' },
    can_kp: { level: 'vang', text: 'Cần khắc phục' },
    sai_vb: { level: 'vang', text: 'Sai so với văn bản' },
    luoi_khong_ct: { level: 'vang', text: 'Đấu lưới chiếu sáng, không công tơ' },
    vo_chu: { level: 'vang', text: 'Chưa xác định chủ' },
    vb_sap_het: { level: 'vang', text: 'Văn bản sắp hết hạn' },
    dang_tt_lau: { level: 'vang', text: 'Làm thủ tục quá lâu' },
    le_hoi_sap_thao: { level: 'vang', text: 'Sắp đến hạn tháo' },
    bo_hoang: { level: 'vang', text: 'Bỏ hoang, cần thu hồi' },
    chua_kt_lai: { level: 'xam', text: 'Lâu chưa kiểm tra lại' }
  };
  var LEVEL_RANK = { do: 0, vang: 1, xam: 2 };
  var VIOL = ['khong_vb', 'sai_vb', 'luoi_khong_ct', 'dau_truoc_ct', 'nguy_hiem', 'can_kp', 'le_hoi_qua_han'];
  /** Cảnh báo an toàn: chỉ hết khi chính điều kiện hết (về Đạt, hết điện 24/24) — không đóng bằng tình hình xử lý. */
  var SAFETY = { dau_truoc_ct: 1, nguy_hiem: 1, can_kp: 1, chua_kt_lai: 1 };
  var CLOSED_XL = { da_kp: 1, da_thao: 1, chuyen_cq: 1 };

  // ---------- tiện ích ----------
  /** Chỉ nhận khoá của chính danh mục (chặn 'constructor', '__proto__', 'toString'…). */
  function has(m, k) { return m != null && typeof k === 'string' && Object.prototype.hasOwnProperty.call(m, k); }
  function str(v) { return v == null ? '' : String(v).trim(); }
  function fold(s) {
    return str(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/\s+/g, ' ');
  }
  function isDate(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    var d = new Date(s + 'T00:00:00Z');
    return !isNaN(d) && d.toISOString().slice(0, 10) === s;
  }
  function todayVN(now) { return new Date((now || new Date()).getTime() + 7 * 3600e3).toISOString().slice(0, 10); }
  /** Ngày theo giờ VN: chuỗi 'YYYY-MM-DD' giữ nguyên; mốc thời gian ISO có giờ thì đổi sang ngày VN. */
  function dateOf(v) {
    var s = str(v); if (!s) return '';
    if (s.length > 10 && s.charAt(10) === 'T') { var t = Date.parse(s); if (!isNaN(t)) return todayVN(new Date(t)); }
    return s.slice(0, 10);
  }
  function daysBetween(a, b) { return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5); }
  function toBool(v) {
    if (v === true || v === false) return v;
    var s = fold(v);
    if (['true', '1', 'co', 'x', 'yes'].indexOf(s) >= 0) return true;
    if (['false', '0', 'khong', 'no'].indexOf(s) >= 0) return false;
    return null;
  }
  function toNum(v) { if (v === '' || v == null) return null; var n = Number(v); return isFinite(n) ? n : NaN; }
  function arr(v) {
    if (Array.isArray(v)) return v.map(str).filter(Boolean);
    return str(v) ? str(v).split(',').map(str).filter(Boolean) : [];
  }
  function upperCode(v) { return str(v).toUpperCase().replace(/\s+/g, ' '); }
  function safeEqual(a, b) {
    a = String(a); b = String(b);
    var diff = a.length ^ b.length, n = Math.max(a.length, b.length);
    for (var i = 0; i < n; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    return diff === 0;
  }
  var DANGER = /^[=+\-@\t\r＝＋－＠]/;
  function sanitizeCell(v) { return (typeof v === 'string' && DANGER.test(v)) ? "'" + v : v; }

  // ---------- validate ----------
  var LONG = { ghi_chu: 2000, ghi_chu_at: 2000, mo_ta: 2000 };
  function validate(input, opts) {
    opts = opts || {};
    var dm = opts.dm || DM, E = [], r = {}, k;
    for (k in input) if (Object.prototype.hasOwnProperty.call(input, k)) r[k] = typeof input[k] === 'string' ? input[k].trim() : input[k];
    function err(f, m) { E.push({ field: f, msg: m }); }
    function req(f, label) { if (str(r[f]) === '') { err(f, 'Thiếu ' + label); return false; } return true; }
    function oneOf(f, map, label) { if (req(f, label) && !has(map, r[f])) err(f, label + ' không hợp lệ'); }
    function date(f, label, need) {
      r[f] = dateOf(r[f]);
      if (!r[f]) { if (need) err(f, 'Thiếu ' + label); return; }
      if (!isDate(r[f])) err(f, label + ' sai định dạng (YYYY-MM-DD)');
    }

    r.tu = upperCode(r.tu); r.so_tru = upperCode(r.so_tru); r.so_tru_den = upperCode(r.so_tru_den);
    r.van_de = arr(r.van_de); r.anh = arr(r.anh);

    if (req('quan', 'quận') && !has(dm.QUAN, r.quan)) err('quan', 'Quận không thuộc KVTT');
    else if (has(dm.QUAN, r.quan) && req('phuong', 'phường') && dm.QUAN[r.quan].phuong.indexOf(r.phuong) < 0) err('phuong', 'Phường không thuộc ' + dm.QUAN[r.quan].ten);
    req('tuyen', 'tuyến đường'); req('so_tru', 'số trụ');
    if (req('nhom', 'nhóm thiết bị') && !has(dm.NHOM, r.nhom)) err('nhom', 'Nhóm không hợp lệ');
    else if (has(dm.NHOM, r.nhom) && req('loai', 'loại thiết bị') && dm.NHOM[r.nhom].loai.indexOf(r.loai) < 0) err('loai', 'Loại không thuộc nhóm');
    req('don_vi', 'đơn vị chủ quản');
    var sl = toNum(r.so_luong);
    if (sl === null) err('so_luong', 'Thiếu số lượng');
    else if (!(sl >= 1) || Math.floor(sl) !== sl) err('so_luong', 'Số lượng phải là số nguyên ≥ 1');
    else r.so_luong = sl;
    if (r.so_tru_den && str(r.so_tru_qua) === '') err('so_tru_qua', 'Nhập số trụ đi qua khi có trụ cuối');
    if (str(r.so_tru_qua) !== '') { var q = toNum(r.so_tru_qua); if (!(q >= 1) || Math.floor(q) !== q) err('so_tru_qua', 'Số trụ đi qua phải nguyên ≥ 1'); else r.so_tru_qua = q; }
    if (str(r.chieu_cao_m) !== '') { var h = toNum(r.chieu_cao_m); if (!(h > 0 && h < 50)) err('chieu_cao_m', 'Chiều cao không hợp lệ'); else r.chieu_cao_m = h; }

    // GPS
    var lat = toNum(r.lat), lng = toNum(r.lng), acc = toNum(r.gps_acc);
    if (lat === null && lng === null) { r.lat = ''; r.lng = ''; r.toa_do_tin_cay = false; }
    else if (!(lat >= 10.3 && lat <= 11.2 && lng >= 106.3 && lng <= 107.1)) { err('lat', 'Toạ độ ngoài TP.HCM'); }
    else { r.lat = lat; r.lng = lng; r.toa_do_tin_cay = acc !== null && !isNaN(acc) && acc <= 100; }

    // Pháp lý
    oneOf('phap_ly', dm.PHAP_LY, 'Pháp lý');
    var hasVb = ['co_vb', 'dang_tt', 'sai_vb'].indexOf(r.phap_ly) >= 0;
    if (hasVb) { req('so_vb', 'số văn bản'); oneOf('loai_vb', dm.LOAI_VB, 'Loại văn bản'); }
    date('ngay_vb', 'ngày văn bản', hasVb);
    date('han_vb', 'hạn văn bản', false);
    if (r.ngay_vb && r.han_vb && isDate(r.ngay_vb) && isDate(r.han_vb) && r.han_vb < r.ngay_vb) err('han_vb', 'Hạn văn bản trước ngày văn bản');
    if (str(r.ben_cap) && !has(dm.BEN_CAP, r.ben_cap)) err('ben_cap', 'Bên cấp không hợp lệ');
    var photos = r.anh.length + (opts.pendingPhotos || 0);
    if ((r.phap_ly === 'khong_vb' || r.phap_ly === 'sai_vb') && !photos) err('anh', 'Cần ít nhất 1 ảnh làm chứng cứ');

    // Nguồn
    oneOf('nguon', dm.NGUON, 'Cấp nguồn');
    if (r.nguon === 'luoi_cs') {
      req('tu', 'tủ điều khiển');
      oneOf('diem_dau', dm.DIEM_DAU, 'Điểm đấu');
      oneOf('cong_to', dm.CONG_TO, 'Công tơ');
      ['dien_24h', 'cb_rieng'].forEach(function (f) {
        var b = toBool(r[f]); if (b === null) err(f, f === 'dien_24h' ? 'Chọn có/không điện 24/24' : 'Chọn có/không CB riêng'); else r[f] = b;
      });
      var cs = toNum(r.cong_suat_w);
      if (cs === null || isNaN(cs)) err('cong_suat_w', 'Thiếu công suất (W)'); else if (cs < 0) err('cong_suat_w', 'Công suất không âm'); else r.cong_suat_w = cs;
      r.cs_uoc_tinh = toBool(r.cs_uoc_tinh) === true;
    }

    // An toàn
    for (var i = 0; i < r.van_de.length; i++) if (!has(dm.VAN_DE, r.van_de[i])) { err('van_de', 'Vấn đề không hợp lệ: ' + r.van_de[i]); break; }
    if (r.van_de.indexOf('ro_dien') >= 0) r.an_toan = 'nguy_hiem';
    oneOf('an_toan', dm.AN_TOAN, 'Mức an toàn');
    if (r.an_toan && r.an_toan !== 'dat') {
      if (!r.van_de.length) err('van_de', 'Chọn ít nhất 1 vấn đề an toàn');
      if (!photos) err('anh', 'Cần ít nhất 1 ảnh hiện trạng');
    }

    // Lễ hội
    var lh = r.nhom === 'le_hoi';
    date('ls_tu', 'ngày bắt đầu lắp', lh); date('ls_den', 'ngày phải tháo', lh);
    if (r.ls_tu && r.ls_den && isDate(r.ls_tu) && isDate(r.ls_den) && r.ls_den < r.ls_tu) err('ls_den', 'Ngày tháo trước ngày lắp');

    // Trạng thái / xử lý
    if (!str(r.trang_thai)) r.trang_thai = 'dang_lap';
    if (!has(dm.TRANG_THAI, r.trang_thai)) err('trang_thai', 'Trạng thái không hợp lệ');
    date('ngay_thao', 'ngày tháo', r.trang_thai === 'da_thao');
    if (r.trang_thai === 'da_thao') req('ly_do_thao', 'lý do tháo');
    if (!str(r.xu_ly)) r.xu_ly = 'chua';
    if (!has(dm.XU_LY, r.xu_ly)) err('xu_ly', 'Tình trạng xử lý không hợp lệ');
    if (r.xu_ly === 'da_tb') { req('so_cv', 'số công văn đã thông báo'); req('han_xu_ly', 'hạn xử lý ghi trong công văn'); }
    date('han_xu_ly', 'hạn xử lý', false); date('ngay_xu_ly', 'ngày xử lý', false); date('ngay_kt', 'ngày kiểm tra', false);
    var today = todayVN(opts.now);
    ['ngay_kt', 'ngay_thao', 'ngay_xu_ly', 'ngay_vb'].forEach(function (f) { if (r[f] && isDate(r[f]) && r[f] > today) err(f, 'Ngày không được sau hôm nay'); });

    // Độ dài
    for (k in r) if (typeof r[k] === 'string' && Array.from(r[k]).length > (LONG[k] || 500)) err(k, 'Quá dài (tối đa ' + (LONG[k] || 500) + ' ký tự)');
    return { ok: E.length === 0, errors: E, rec: r };
  }

  // ---------- cảnh báo ----------
  function isActive(r) { return !r.xoa && r.xoa !== 'TRUE' && r.trang_thai !== 'da_thao'; }
  function alerts(r, now, cfg) {
    cfg = cfg || DEFAULT_CFG; now = now || new Date();
    var out = [];
    if (!isActive(r)) return out;
    var t = todayVN(now), kt = dateOf(r.ngay_kt) || dateOf(r.tao_luc);
    function add(code, extra) { var a = { code: code, level: ALERTS[code].level, text: ALERTS[code].text }; for (var k in extra) a[k] = extra[k]; out.push(a); }
    var closed = !!CLOSED_XL[r.xu_ly];
    var b24 = toBool(r.dien_24h) === true;
    {
      if (r.nguon === 'luoi_cs' && b24) add('dau_truoc_ct');
      if (r.nguon === 'luoi_cs' && r.cong_to === 'khong') add('luoi_khong_ct');
      // Hạn xử lý an toàn tính từ lúc PHÁT HIỆN (máy chủ ghi phat_hien_luc), không bị "kiểm tra lại" làm mới
      var ph = str(r.phat_hien_luc) || str(r.tao_luc) || (dateOf(r.ngay_kt) ? dateOf(r.ngay_kt) + 'T00:00:00+07:00' : '');
      var phMs = ph ? Date.parse(ph.length === 10 ? ph + 'T00:00:00+07:00' : ph) : NaN;
      if (r.an_toan === 'nguy_hiem') add('nguy_hiem', { qua_han: !isNaN(phMs) && (now.getTime() - phMs) > cfg.nguy_hiem_gio * 3600e3 });
      if (r.an_toan === 'can_kp') { var od = !isNaN(phMs) && daysBetween(dateOf(new Date(phMs).toISOString()), t) > cfg.can_kp_ngay; add('can_kp', { qua_han: od }); if (od) out[out.length - 1].level = 'do'; }
      if (r.phap_ly === 'khong_vb') add('khong_vb');
      if (r.phap_ly === 'sai_vb') add('sai_vb');
      if (r.phap_ly === 'dang_tt' && dateOf(r.tao_luc) && daysBetween(dateOf(r.tao_luc), t) > cfg.dang_tt_ngay) add('dang_tt_lau');
      var han = dateOf(r.han_vb);
      if (han && isDate(han) && ['co_vb', 'dang_tt', 'sai_vb'].indexOf(r.phap_ly) >= 0) {
        var dleft = daysBetween(t, han);
        if (dleft < 0) add('vb_het_han'); else if (dleft <= cfg.vb_nhac_ngay) add('vb_sap_het', { con_ngay: dleft });
      }
      if (fold(r.don_vi) === fold(DM.VO_CHU)) add('vo_chu');
      if (r.trang_thai === 'bo_hoang') add('bo_hoang');
      var lsd = dateOf(r.ls_den);
      if (r.nhom === 'le_hoi' && lsd && isDate(lsd)) {
        var dd = daysBetween(lsd, t);
        if (dd >= cfg.le_hoi_qua_ngay) add('le_hoi_qua_han', { qua_ngay: dd });
        else if (-dd <= cfg.le_hoi_nhac_ngay && dd <= 0) add('le_hoi_sap_thao', { con_ngay: -dd });
      }
      var hx = dateOf(r.han_xu_ly);
      if (hx && isDate(hx) && hx < t) add('qua_han_xl');
    }
    if (r.an_toan === 'dat' && kt && daysBetween(kt, t) > cfg.dat_kt_ngay) add('chua_kt_lai');
    if (closed) out = out.filter(function (a) { return SAFETY[a.code]; });
    out.sort(function (a, b) { return LEVEL_RANK[a.level] - LEVEL_RANK[b.level] || (b.qua_han ? 1 : 0) - (a.qua_han ? 1 : 0); });
    return out;
  }
  function topAlert(r, now, cfg) { var a = alerts(r, now, cfg); return a.length ? a[0] : null; }

  // ---------- lọc / thống kê ----------
  function matchFilter(r, f) {
    if (r.xoa === true || r.xoa === 'TRUE') return false;
    if (f.trang_thai) { if (r.trang_thai !== f.trang_thai) return false; }
    else if (!f.ca_da_thao && r.trang_thai === 'da_thao') return false;
    if (f.quan && r.quan !== f.quan) return false;
    if (f.phuong && r.phuong !== f.phuong) return false;
    if (f.nhom && r.nhom !== f.nhom) return false;
    if (f.don_vi && fold(r.don_vi) !== fold(f.don_vi)) return false;
    if (f.an_toan && r.an_toan !== f.an_toan) return false;
    if (f.phap_ly && r.phap_ly !== f.phap_ly) return false;
    var kt = dateOf(r.ngay_kt);
    if (f.kt_tu && !(kt && kt >= f.kt_tu)) return false;
    if (f.kt_den && !(kt && kt <= f.kt_den)) return false;
    if (f.q) {
      var hay = ' ' + fold([r.tuyen, r.tu, r.so_tru, r.don_vi, r.loai, r.mo_ta, r.phuong, r.so_vb, r.ghi_chu].join(' ')).replace(/[^a-z0-9]+/g, ' ');
      var words = fold(f.q).replace(/[^a-z0-9]+/g, ' ').trim().split(' ');
      for (var i = 0; i < words.length; i++) if (words[i] && hay.indexOf(' ' + words[i]) < 0) return false; // khớp đầu từ
    }
    return true;
  }
  function filterRecs(recs, f) { f = f || {}; return recs.filter(function (r) { return matchFilter(r, f); }); }
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function bump(obj, key, r) { if (!obj[key]) obj[key] = { vi_tri: 0, so_luong: 0 }; obj[key].vi_tri++; obj[key].so_luong += num(r.so_luong); }

  function stats(recs, f, now, cfg) {
    var list = filterRecs(recs, f || {});
    var s = { vi_tri: 0, so_luong: 0, byQuanNhom: {}, byPhuong: {}, byDonVi: {}, phapLy: {}, nguon: {}, anToan: {}, xuLy: {}, byNhom: {}, canhBao: {}, congSuatTheoTu: [], xepHangViPham: [] };
    var tu = {}, dv = {}, dvName = {};
    function dvKey(d) { var k = fold(d); if (!(k in dvName)) dvName[k] = str(d); return dvName[k]; }
    list.forEach(function (r) {
      s.vi_tri++; s.so_luong += num(r.so_luong);
      if (!s.byQuanNhom[r.quan]) s.byQuanNhom[r.quan] = {};
      bump(s.byQuanNhom[r.quan], r.nhom, r);
      bump(s.byPhuong, r.phuong, r); bump(s.byDonVi, dvKey(r.don_vi), r); bump(s.byNhom, r.nhom, r);
      bump(s.phapLy, r.phap_ly, r); bump(s.nguon, r.nguon, r); bump(s.anToan, r.an_toan, r); bump(s.xuLy, r.xu_ly || 'chua', r);
      if (r.nguon === 'luoi_cs' && isActive(r)) {
        var tn = upperCode(r.tu) || '(chưa ghi tủ)', t = r.quan + '|' + tn; // tủ gom theo quận (trùng tên tủ ở 2 quận)
        if (!tu[t]) tu[t] = { quan: r.quan, tu: tn, cong_suat_w: 0, vi_tri: 0 };
        tu[t].cong_suat_w += num(r.cong_suat_w); tu[t].vi_tri++;
      }
      var al = alerts(r, now, cfg), v = 0;
      al.forEach(function (a) { s.canhBao[a.code] = (s.canhBao[a.code] || 0) + 1; if (VIOL.indexOf(a.code) >= 0) v++; });
      if (v) { var d = dvKey(r.don_vi); if (!dv[d]) dv[d] = { don_vi: d, vi_pham: 0, vi_tri: 0 }; dv[d].vi_pham += v; dv[d].vi_tri++; }
    });
    s.congSuatTheoTu = Object.keys(tu).map(function (k) { return tu[k]; }).sort(function (a, b) { return b.cong_suat_w - a.cong_suat_w || (a.tu < b.tu ? -1 : 1); });
    s.xepHangViPham = Object.keys(dv).map(function (k) { return dv[k]; }).sort(function (a, b) { return b.vi_pham - a.vi_pham || b.vi_tri - a.vi_tri || (a.don_vi < b.don_vi ? -1 : 1); });
    return s;
  }

  function dupCode(v) { return upperCode(v).replace(/\s+/g, ''); } // 'LL -02' = 'LL-02'
  function findDuplicates(r, recs) {
    var key = [dupCode(r.tu), dupCode(r.so_tru), str(r.loai), fold(r.don_vi)].join('|');
    return recs.filter(function (x) {
      return x.id !== r.id && isActive(x) && [dupCode(x.tu), dupCode(x.so_tru), str(x.loai), fold(x.don_vi)].join('|') === key;
    });
  }


  // ---------- tự điền vị trí ----------
  /** Khoảng cách (m) giữa 2 toạ độ — haversine. */
  function distM(lat1, lng1, lat2, lng2) {
    var R = 6371008.8, r = Math.PI / 180, dLat = (lat2 - lat1) * r, dLng = (lng2 - lng1) * r;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
  }
  function num(v) { var n = Number(v); return v === '' || v == null || !isFinite(n) ? null : n; }
  /** Bản ghi còn hiệu lực có toạ độ trong bán kính maxM, gần nhất trước. */
  function nearest(recs, lat, lng, maxM, exceptId) {
    lat = num(lat); lng = num(lng); if (lat == null || lng == null) return [];
    var out = [];
    (recs || []).forEach(function (x) {
      var a = num(x.lat), b = num(x.lng);
      if (a == null || b == null || !isActive(x) || (exceptId && x.id === exceptId)) return;
      var d = distM(lat, lng, a, b); if (d <= maxM) out.push({ r: x, d: d });
    });
    return out.sort(function (p, q) { return p.d - q.d; });
  }
  /** Tên đường từ kết quả tra ngược địa chỉ (Esri): bỏ số nhà, hẻm, chữ "Đường". */
  function streetName(addr) {
    if (!addr) return '';
    var s = str(addr.Address || addr.StAddr || '');
    if (str(addr.AddNum) && s.indexOf(str(addr.AddNum)) === 0) s = s.slice(str(addr.AddNum).length).trim();
    s = s.split(/\s*[&,]\s*/)[0];
    s = s.replace(/^(số\s*)?\d+[\w\/\-]*\s+/i, '').replace(/^(hẻm|hem|kiệt|ngõ|ngách)\s+\S+\s+/iu, '').replace(/^(đường|duong|đ\.)\s+/iu, '');
    s = s.replace(/\s+/g, ' ').trim();
    return /\p{L}/u.test(s) && s.length >= 2 && s.length <= 80 ? s : '';
  }
  function topBy(list, key) {
    var c = {}, best = '', n = 0;
    list.forEach(function (x) { var v = str(x[key]); if (v) { c[v] = (c[v] || 0) + 1; if (c[v] > n) { n = c[v]; best = v; } } });
    return best;
  }
  /**
   * Gợi ý tự điền theo vị trí từ thiết bị đã có gần đó.
   * ≤ sameM (cùng trụ): tủ + số trụ + tuyến + quận/phường; ≤ nearM: tuyến + tủ + quận/phường.
   * Chỉ ghi vào ô đang trống hoặc ô do máy tự điền (auto); không đè ô người dùng đã gõ.
   */
  function autoFill(form, recs, opt) {
    opt = opt || {};
    var sameM = opt.sameM || 12, nearM = opt.nearM || 60, auto = opt.auto || {};
    var patch = {}, src = null;
    var nb = nearest(recs, form.lat, form.lng, nearM, form.id);
    var free = function (k) { return !str(form[k]) || auto[k]; };
    function set(k, v) { v = str(v); if (v && free(k) && str(form[k]) !== v) patch[k] = v; }
    if (nb.length) {
      var top = nb[0], same = top.d <= sameM;
      var pool = nb.filter(function (x) { return x.d <= Math.max(sameM, top.d + 15); }).map(function (x) { return x.r; });
      src = { kind: same ? 'tru' : 'gan', d: Math.round(top.d), r: top.r };
      set('tuyen', topBy(pool, 'tuyen'));
      set('tu', top.r.tu);
      if (same) set('so_tru', top.r.so_tru);
      var q = top.r.quan, okQ = has(DM.QUAN, q) && (!opt.quans || opt.quans.indexOf(q) >= 0);
      if (okQ && (!form.quan || auto.quan) && form.quan !== q) patch.quan = q;
      if (okQ && str(top.r.phuong) && (patch.quan || form.quan === q) && (patch.quan || !str(form.phuong) || auto.phuong) && form.phuong !== top.r.phuong) patch.phuong = top.r.phuong;
    } else if (opt.street) {
      set('tuyen', opt.street);
      if (patch.tuyen || str(form.tuyen) === str(opt.street)) src = { kind: 'bando' };
    }
    return { patch: patch, src: src };
  }
  /** Tủ đã biết → tuyến, quận, phường hay gặp nhất. */
  function fromCabinet(recs, tu) {
    var k = dupCode(tu); if (!k) return null;
    var list = (recs || []).filter(function (x) { return isActive(x) && dupCode(x.tu) === k; });
    if (!list.length) return null;
    var q = topBy(list, 'quan');
    return { tuyen: topBy(list, 'tuyen'), quan: q, phuong: topBy(list.filter(function (x) { return x.quan === q; }), 'phuong'), n: list.length };
  }
  /** Danh sách gợi ý khi gõ: tuyến (ưu tiên cùng quận), tủ (ưu tiên cùng tuyến), trụ đã có của tủ. */
  function suggestLists(recs, f) {
    f = f || {};
    var act = (recs || []).filter(isActive), cnt = function (list, key, norm) {
      var m = {}; list.forEach(function (x) { var v = str(x[key]); if (!v) return; var k = norm ? norm(v) : fold(v); if (!m[k]) m[k] = { v: norm ? upperCode(v) : v, n: 0 }; m[k].n++; });
      return Object.keys(m).map(function (k) { return m[k]; });
    };
    var sortBy = function (a, pri) { return a.sort(function (x, y) { return (pri(y) - pri(x)) || (y.n - x.n) || x.v.localeCompare(y.v, 'vi'); }); };
    var tuyenSet = {}; act.forEach(function (x) { if (f.quan && x.quan === f.quan) tuyenSet[fold(x.tuyen)] = 1; });
    var tuyen = sortBy(cnt(act, 'tuyen'), function (x) { return tuyenSet[fold(x.v)] ? 1 : 0; }).map(function (x) { return x.v; });
    var tuSet = {}; act.forEach(function (x) { if (str(f.tuyen) && fold(x.tuyen) === fold(f.tuyen)) tuSet[dupCode(x.tu)] = 1; });
    var tu = sortBy(cnt(act, 'tu', dupCode), function (x) { return tuSet[dupCode(x.v)] ? 1 : 0; }).map(function (x) { return x.v; });
    var tru = [];
    if (dupCode(f.tu)) {
      var m = {};
      act.forEach(function (x) { if (dupCode(x.tu) !== dupCode(f.tu) || !str(x.so_tru)) return; var k = dupCode(x.so_tru); (m[k] = m[k] || { v: upperCode(x.so_tru), items: [] }).items.push(str(x.loai) + (str(x.don_vi) ? ' – ' + str(x.don_vi) : '')); });
      tru = Object.keys(m).map(function (k) { return { v: m[k].v, label: m[k].items.length + ' TB: ' + m[k].items.slice(0, 2).join('; ') + (m[k].items.length > 2 ? '…' : '') }; })
        .sort(function (a, b) { var na = parseInt(a.v, 10), nb2 = parseInt(b.v, 10); return (isNaN(na) || isNaN(nb2) ? 0 : na - nb2) || a.v.localeCompare(b.v); });
    }
    return { tuyen: tuyen, tu: tu, tru: tru };
  }

  // ---------- phân quyền ----------
  function quanList(u) { return Array.isArray(u.quan) ? u.quan : arr(u.quan); }
  function can(u, action, rec, old) {
    if (!u) return false;
    var role = u.vai_tro;
    if (action === 'users' || action === 'config') return role === 'admin';
    if (action === 'read') return has(DM.VAI_TRO, role);
    if (role === 'admin' || role === 'giamsat') return ['create', 'update', 'delete', 'xu_ly', 'feedback_admin'].indexOf(action) >= 0;
    if (role === 'nhaplieu') {
      if (action !== 'create' && action !== 'update') return false;
      var q = quanList(u);
      if (!rec || q.indexOf(rec.quan) < 0) return false;
      if (old && q.indexOf(old.quan) < 0) return false;
      return true;
    }
    return false;
  }

  /** Dòng chữ đóng dấu lên ảnh: thời gian (giờ VN), tọa độ, người cập nhật, vị trí trụ. */
  function photoStamp(o) {
    var d = new Date(Date.parse(o.luc) + 7 * 3600e3).toISOString();
    var t = d.slice(8, 10) + '/' + d.slice(5, 7) + '/' + d.slice(0, 4) + ' ' + d.slice(11, 19);
    var lat = Number(o.lat), lng = Number(o.lng), has = o.lat !== '' && o.lat != null && isFinite(lat) && isFinite(lng);
    var lines = ['Thời gian: ' + t,
      'Tọa độ: ' + (has ? lat.toFixed(6) + ', ' + lng.toFixed(6) + (o.acc ? ' (±' + Math.round(o.acc) + ' m)' : '') : 'chưa có'),
      'Người cập nhật: ' + (str(o.ho_ten) && str(o.ho_ten) !== str(o.uid) ? str(o.ho_ten) + ' (' + str(o.uid) + ')' : str(o.uid))];
    var vt = [str(o.so_tru) ? 'Trụ ' + upperCode(o.so_tru) : '', str(o.tu) ? 'Tủ ' + upperCode(o.tu) : '', str(o.tuyen)].filter(Boolean).join(' · ');
    if (vt) lines.push('Vị trí: ' + vt);
    return lines;
  }
  /** Kiểm tối thiểu 1 dòng đọc từ Sheet (có thể bị sửa tay). */
  function rowSane(r) {
    var sl = Number(r.so_luong);
    return has(DM.QUAN, r.quan) && has(DM.NHOM, r.nhom) && sl >= 1 && Math.floor(sl) === sl &&
      has(DM.PHAP_LY, r.phap_ly) && has(DM.NGUON, r.nguon) && has(DM.AN_TOAN, r.an_toan) && has(DM.TRANG_THAI, r.trang_thai || 'dang_lap');
  }
  return {
    has: has, rowSane: rowSane, photoStamp: photoStamp,
    DM: DM, DEFAULT_CFG: DEFAULT_CFG, ALERTS: ALERTS, VIOL: VIOL, SAFETY: SAFETY,
    fold: fold, isDate: isDate, todayVN: todayVN, daysBetween: daysBetween, toBool: toBool,
    sanitizeCell: sanitizeCell, safeEqual: safeEqual, upperCode: upperCode,
    validate: validate, alerts: alerts, topAlert: topAlert, isActive: isActive,
    filterRecs: filterRecs, stats: stats, findDuplicates: findDuplicates, can: can,
    distM: distM, nearest: nearest, streetName: streetName, autoFill: autoFill, fromCabinet: fromCabinet, suggestLists: suggestLists
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = Core;

