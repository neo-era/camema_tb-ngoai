import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { makeEnv, JPEG } from './gas-mock.mjs';
import crypto from 'node:crypto';

let env, adminTok, nlTok, gsTok, tempOf = {};
const rid = () => crypto.randomUUID();
const rec = (o = {}) => ({
  client_id: crypto.randomUUID(), quan: 'Q1', phuong: 'Bến Thành', tuyen: 'Lê Lợi', tu: 'LL-02', so_tru: String(Math.floor(Math.random() * 1e6)),
  lat: 10.7725, lng: 106.698, gps_acc: 8, nhom: 'vien_thong', loai: 'Wifi công cộng', don_vi: 'Viettel', so_luong: 1,
  phap_ly: 'co_vb', loai_vb: 'hd_sd', so_vb: '1/HĐ', ngay_vb: '2026-01-01', nguon: 'rieng', an_toan: 'dat', trang_thai: 'dang_lap', ...o
});

function login(uid, pw) { return env.call('login', { uid, pw }); }

before(() => {
  env = makeEnv();
  env.ctx.setup();
  const m = env.logs.join('\n').match(/Mật khẩu tạm: (\w+)/);
  const r = login('admin', m[1]);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.data.must_change, true);
  adminTok = r.data.token;
  assert.equal(env.call('users', {}, adminTok).code, 'MUST_CHANGE');
  adminTok = env.call('changePw', { old_pw: m[1], new_pw: 'Admin@12345' }, adminTok).data.token;
  for (const [uid, vai_tro, quan] of [['to1', 'nhaplieu', ['Q1']], ['gs1', 'giamsat', []]]) {
    const u = env.call('userSave', { uid, ho_ten: uid, vai_tro, quan }, adminTok);
    assert.equal(u.ok, true, JSON.stringify(u));
    tempOf[uid] = u.data.temp_pw;
  }
  // mật khẩu tạm: bị chặn mọi thao tác cho tới khi đổi
  const t1 = login('to1', tempOf.to1).data.token;
  assert.equal(env.call('sync', {}, t1).code, 'MUST_CHANGE');
  nlTok = env.call('changePw', { old_pw: tempOf.to1, new_pw: 'MatKhau@123' }, t1).data.token;
  const t2 = login('gs1', tempOf.gs1).data.token;
  gsTok = env.call('changePw', { old_pw: tempOf.gs1, new_pw: 'MatKhau@123' }, t2).data.token;
});

test('setup tạo đủ sheet + cấu hình', () => {
  for (const s of ['ThietBi', 'TaiKhoan', 'CauHinh', 'NhatKy', 'GopY', 'Anh']) assert.ok(env.sheets[s], s);
  assert.equal(env.sheets.CauHinh.data.length, 8);
  assert.match(env.sheets.TaiKhoan.data[1][4], /^sha256i\$5000\$/);
});

test('yêu cầu xấu: rỗng, không JSON, action lạ, quá cỡ', () => {
  assert.equal(env.raw('not json').code, 'BAD_REQUEST');
  assert.equal(env.call('hack', {}).code, 'BAD_ACTION');
  assert.equal(env.call('sync', { pad: 'x'.repeat(70000) }, nlTok).code, 'TOO_LARGE');
  assert.equal(env.call('uploadPhoto', { pad: 'x'.repeat(950000) }, nlTok).code, 'TOO_LARGE');
});

test('token giả/sai chữ ký → AUTH', () => {
  assert.equal(env.call('me', {}, 'abc').code, 'AUTH');
  const [p] = nlTok.split('.');
  assert.equal(env.call('me', {}, p + '.xxxx').code, 'AUTH');
  const forged = Buffer.from('admin|0|' + (Date.now() + 1e7)).toString('base64url') + '.' + nlTok.split('.')[1];
  assert.equal(env.call('me', {}, forged).code, 'AUTH');
  assert.equal(env.call('me', {}, nlTok).data.user.vai_tro, 'nhaplieu');
});

test('nhập liệu: tạo trong quận được giao; quận khác bị chặn', () => {
  const r = env.call('save', { rec: rec() }, nlTok, rid());
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.match(r.data.rec.id, /^TB/);
  assert.equal(r.data.rec.version, 1);
  const x = env.call('save', { rec: rec({ quan: 'Q3', phuong: 'Bàn Cờ' }) }, nlTok, rid());
  assert.equal(x.code, 'FORBIDDEN');
});

test('gửi lại cùng client_id không tạo trùng', () => {
  const r0 = rec(); const n = env.sheets.ThietBi.data.length;
  const a = env.call('save', { rec: r0 }, nlTok, rid());
  const b = env.call('save', { rec: r0, confirmDup: true }, nlTok, rid());
  assert.equal(a.data.rec.id, b.data.rec.id);
  assert.equal(b.data.replay, true);
  assert.equal(env.sheets.ThietBi.data.length, n + 1);
});

test('kiểm dữ liệu ở máy chủ', () => {
  const r = env.call('save', { rec: rec({ so_luong: 0, phap_ly: 'khong_vb' }) }, nlTok, rid());
  assert.equal(r.code, 'VALIDATION');
  assert.ok(r.data.errors.some((e) => e.field === 'so_luong'));
  assert.ok(r.data.errors.some((e) => e.field === 'anh'));
});

test('trùng → DUP, xác nhận thì lưu', () => {
  const r1 = rec({ so_tru: 'T-DUP' });
  assert.equal(env.call('save', { rec: r1 }, nlTok, rid()).ok, true);
  const d = env.call('save', { rec: { ...r1, client_id: crypto.randomUUID() } }, nlTok, rid());
  assert.equal(d.code, 'DUP');
  assert.equal(d.data.dups.length, 1);
  assert.equal(env.call('save', { rec: { ...r1, client_id: crypto.randomUUID() }, confirmDup: true }, nlTok, rid()).ok, true);
});

test('sửa: version, xung đột, phát lại requestId, nhật ký cũ→mới, trường máy chủ không bị ghi đè', () => {
  const c = env.call('save', { rec: rec() }, nlTok, rid()).data.rec;
  const req = rid();
  const u = env.call('save', { rec: { ...c, tuyen: 'Hàm Nghi', tao_boi: 'hacker', version: 1 } }, nlTok, req);
  assert.equal(u.ok, true, JSON.stringify(u));
  assert.equal(u.data.rec.version, 2);
  assert.equal(u.data.rec.tao_boi, 'to1');
  // phát lại cùng requestId (mất phản hồi) → thành công, không xung đột
  const again = env.call('save', { rec: { ...c, tuyen: 'Hàm Nghi', version: 1 } }, nlTok, req);
  assert.equal(again.ok, true); assert.equal(again.data.replay, true);
  // version cũ, requestId mới → xung đột
  const cf = env.call('save', { rec: { ...c, tuyen: 'X', version: 1 } }, gsTok, rid());
  assert.equal(cf.code, 'CONFLICT');
  assert.equal(cf.data.current.version, 2);
  const log = env.sheets.NhatKy.data.find((r) => r[3] === c.id && r[4] === 'tuyen');
  assert.deepEqual([...log.slice(5)], ['Lê Lợi', 'Hàm Nghi']);
  // nhập liệu không được chuyển bản ghi sang quận khác
  assert.equal(env.call('save', { rec: { ...u.data.rec, quan: 'Q3', phuong: 'Bàn Cờ' } }, nlTok, rid()).code, 'FORBIDDEN');
});

test('chống chèn công thức khi ghi Sheet, đọc lại sạch', () => {
  const r = env.call('save', { rec: rec({ tuyen: '=HYPERLINK("x")', ghi_chu: '＋cmd' }) }, nlTok, rid()).data.rec;
  const row = env.sheets.ThietBi.data.find((x) => x[0] === r.id);
  assert.equal(row[4], `'=HYPERLINK("x")`);
  assert.equal(typeof row[17], 'number');
  const s = env.call('sync', {}, nlTok).data;
  const back = s.rows.map((a) => Object.fromEntries(s.cols.map((k, i) => [k, a[i]]))).find((x) => x.id === r.id);
  assert.equal(back.tuyen, '=HYPERLINK("x")');
});

test('xoá: nhập liệu bị chặn, giám sát xoá mềm; đồng bộ delta có tombstone', () => {
  const c = env.call('save', { rec: rec() }, nlTok, rid()).data.rec;
  const s0 = env.call('sync', {}, gsTok).data;
  assert.equal(s0.full, true);
  assert.equal(env.call('del', { id: c.id, version: 1 }, nlTok, rid()).code, 'FORBIDDEN');
  // đẩy mốc since về trước để bản ghi xoá chắc chắn nằm trong delta
  const d = env.call('del', { id: c.id, version: 1, ly_do: 'nhập nhầm' }, gsTok, rid());
  assert.equal(d.ok, true, JSON.stringify(d));
  const s1 = env.call('sync', { since: s0.since, epoch: s0.epoch }, gsTok).data;
  assert.equal(s1.full, false);
  const ids = s1.rows.map((a) => a[0]);
  assert.ok(ids.includes(c.id));
  const xoaIdx = s1.cols.indexOf('xoa');
  assert.equal(s1.rows.find((a) => a[0] === c.id)[xoaIdx], true);
  // tải đầy đủ không còn bản ghi đã xoá
  assert.ok(!env.call('sync', {}, gsTok).data.rows.some((a) => a[0] === c.id));
});

test('dòng sheet sửa tay hỏng không làm sập đồng bộ', () => {
  env.sheets.ThietBi.data.push(['', '', 'Q1', '', 'gõ tay']);
  env.sheets.ThietBi.data.push(['TBX', '', 'Q1', 'Bến Thành', 'Tay', '', '', '', 'abc', 'xx']);
  const s = env.call('sync', {}, gsTok);
  assert.equal(s.ok, true);
  assert.equal(s.data.bad_rows, 2); // dòng thiếu id + dòng có id nhưng dữ liệu sai
  assert.ok(!s.data.rows.some((a) => a[0] === 'TBX'));
});

test('ảnh: magic bytes, cỡ, idempotent, xem qua API, lưu bản ghi chỉ nhận ảnh đã tải', () => {
  assert.equal(env.call('uploadPhoto', { photo_client_id: crypto.randomUUID(), b64: Buffer.from('<?php').toString('base64') }, nlTok).code, 'VALIDATION');
  assert.equal(env.call('uploadPhoto', { photo_client_id: crypto.randomUUID(), b64: JPEG(700 * 1024) }, nlTok).code, 'TOO_LARGE');
  assert.equal(env.call('uploadPhoto', { photo_client_id: crypto.randomUUID(), b64: JPEG(610 * 1024).slice(0, 820000) }, nlTok).code, 'VALIDATION');
  const pcid = crypto.randomUUID(), b64 = JPEG(2000);
  const a = env.call('uploadPhoto', { photo_client_id: pcid, b64 }, nlTok);
  assert.equal(a.ok, true, JSON.stringify(a));
  const b = env.call('uploadPhoto', { photo_client_id: pcid, b64 }, nlTok);
  assert.equal(b.data.file_id, a.data.file_id); assert.equal(b.data.replay, true);
  const xemPw = env.call('userSave', { uid: 'xem1', vai_tro: 'xem', quan: [] }, adminTok).data.temp_pw;
  const xt = env.call('changePw', { old_pw: xemPw, new_pw: 'MatKhau@123' }, login('xem1', xemPw).data.token).data.token;
  assert.equal(env.call('uploadPhoto', { photo_client_id: crypto.randomUUID(), b64 }, xt).code, 'FORBIDDEN');
  const g = env.call('getPhoto', { file_id: a.data.file_id }, gsTok);
  assert.equal(g.data.b64, b64);
  assert.equal(env.call('getPhoto', { file_id: 'FAKE' }, gsTok).code, 'NOT_FOUND');
  assert.equal(env.call('save', { rec: rec({ phap_ly: 'khong_vb', anh: ['Fkhongco'] }) }, nlTok, rid()).code, 'VALIDATION');
  assert.equal(env.call('save', { rec: rec({ phap_ly: 'khong_vb', anh: [a.data.file_id] }) }, nlTok, rid()).ok, true);
});

test('máy chủ bận → BUSY', () => {
  env.state.lockFree = false;
  assert.equal(env.call('save', { rec: rec() }, nlTok, rid()).code, 'BUSY');
  env.state.lockFree = true;
});

test('đăng nhập: sai 5 lần khoá 5 phút; giới hạn tổng/phút', () => {
  env.call('userSave', { uid: 'to2', vai_tro: 'nhaplieu', quan: ['Q5'] }, adminTok);
  for (let i = 0; i < 5; i++) assert.equal(login('to2', 'sai' + i).code, 'LOGIN');
  assert.equal(login('to2', 'sai').code, 'LOCKED');
  assert.equal(login('khongco', 'x').code, 'LOGIN');
  for (const k of Object.keys(env.cache)) env.cache[k] = '30';
  assert.equal(login('admin', 'x').code, 'RATE');
  for (const k of Object.keys(env.cache)) delete env.cache[k];
  // băm nằm NGOÀI lock: đăng nhập vẫn chạy khi lock đang bận (chỉ cần lock khi ghi sai_lan)
  env.state.lockFree = false;
  assert.equal(login('gs1', 'MatKhau@123').ok, true);
  env.state.lockFree = true;
  for (const k of Object.keys(env.cache)) delete env.cache[k];
});

test('đổi vai trò / khoá TK thu hồi phiên cũ; chỉ admin quản lý TK', () => {
  assert.equal(env.call('users', {}, gsTok).code, 'FORBIDDEN');
  const t = login('to1', 'MatKhau@123').data.token;
  assert.equal(env.call('me', {}, t).ok, true);
  env.call('userSave', { uid: 'to1', ho_ten: 'to1', vai_tro: 'nhaplieu', quan: ['Q1', 'Q3'] }, adminTok);
  assert.equal(env.call('me', {}, t).code, 'AUTH');
  const t2 = login('to1', 'MatKhau@123').data.token;
  assert.deepEqual([...env.call('me', {}, t2).data.user.quan], ['Q1', 'Q3']);
  // đổi mật khẩu → token mới, token cũ hết hiệu lực
  const c = env.call('changePw', { old_pw: 'MatKhau@123', new_pw: 'matkhau-moi-123' }, t2);
  assert.equal(c.ok, true);
  assert.equal(env.call('me', {}, t2).code, 'AUTH');
  assert.equal(env.call('me', {}, c.data.token).ok, true);
  assert.equal(login('to1', 'matkhau-moi-123').data.must_change, false);
  nlTok = c.data.token;
  const users = env.call('users', {}, adminTok).data.users;
  assert.ok(users.every((u) => !('pw' in u)));
});

test('kiểm tra lại – không đổi', () => {
  const c = env.call('save', { rec: rec({ ngay_kt: '2026-01-01' }) }, nlTok, rid()).data.rec;
  const r = env.call('recheck', { id: c.id }, nlTok, rid());
  assert.equal(r.ok, true);
  assert.notEqual(r.data.rec.ngay_kt, '2026-01-01');
  assert.equal(r.data.rec.version, 2);
});

test('góp ý: rỗng bị từ chối; lưu; gửi lại không trùng', () => {
  assert.equal(env.call('feedback', {}, nlTok).code, 'VALIDATION');
  assert.equal(env.call('feedback', { sao: 9 }, nlTok).code, 'VALIDATION');
  const cid = crypto.randomUUID();
  assert.equal(env.call('feedback', { client_id: cid, sao: 5, noi_dung: '=cmd' }, nlTok).ok, true);
  assert.equal(env.call('feedback', { client_id: cid, sao: 5 }, nlTok).data.replay, true);
  const row = env.sheets.GopY.data.at(-1);
  assert.equal(row[5], "'=cmd");
  assert.equal(row[10], 'moi');
});

test('cấu hình đọc từ sheet CauHinh', () => {
  env.sheets.CauHinh.data[1][1] = 45;
  assert.equal(env.call('me', {}, nlTok).data.cfg.vb_nhac_ngay, 45);
});

test('dọn ảnh mồ côi > 30 ngày', () => {
  const a = env.call('uploadPhoto', { photo_client_id: crypto.randomUUID(), b64: JPEG(50) }, nlTok).data.file_id;
  const row = env.sheets.Anh.data.find((r) => r[1] === a);
  row[3] = new Date(Date.now() - 31 * 864e5).toISOString();
  env.ctx.dailyJob();
  assert.equal(env.files[a].trashed, true);
  assert.ok(!env.sheets.Anh.data.some((r) => r[1] === a));
});

test('nhập liệu KHÔNG tự đóng được cảnh báo (xu_ly do máy chủ giữ)', () => {
  const c = env.call('save', { rec: rec({ phap_ly: 'khong_vb', anh: [] , an_toan: 'dat' }) }, nlTok, rid());
  assert.equal(c.code, 'VALIDATION'); // cần ảnh
  const a = env.call('uploadPhoto', { photo_client_id: crypto.randomUUID(), b64: JPEG(100) }, nlTok).data.file_id;
  const r1 = env.call('save', { rec: rec({ phap_ly: 'khong_vb', anh: [a], xu_ly: 'da_kp', so_cv: 'X' }) }, nlTok, rid()).data.rec;
  assert.equal(r1.xu_ly, 'chua'); assert.equal(r1.so_cv, '');
  const r2 = env.call('save', { rec: { ...r1, xu_ly: 'da_kp', han_xu_ly: '2026-12-01' } }, nlTok, rid()).data.rec;
  assert.equal(r2.xu_ly, 'chua'); assert.equal(r2.han_xu_ly, '');
  const r3 = env.call('save', { rec: { ...r2, xu_ly: 'da_tb', so_cv: '12/CSKVTT', han_xu_ly: '2026-12-01' } }, gsTok, rid()).data.rec;
  assert.equal(r3.xu_ly, 'da_tb');
  // nhập liệu sửa trường khác vẫn giữ nguyên xử lý của giám sát
  const r4 = env.call('save', { rec: { ...r3, ghi_chu: 'bổ sung', xu_ly: 'chua' } }, nlTok, rid()).data.rec;
  assert.equal(r4.xu_ly, 'da_tb'); assert.equal(r4.so_cv, '12/CSKVTT');
});

test('phat_hien_luc: ghi khi phát hiện, giữ nguyên khi kiểm tra lại/sửa, xoá khi về Đạt', () => {
  const a = env.call('uploadPhoto', { photo_client_id: crypto.randomUUID(), b64: JPEG(100) }, nlTok).data.file_id;
  const r1 = env.call('save', { rec: rec({ an_toan: 'can_kp', van_de: ['cap_du'], anh: [a] }) }, nlTok, rid()).data.rec;
  assert.ok(r1.phat_hien_luc);
  const row = env.sheets.ThietBi.data.find((x) => x[0] === r1.id); row[COLS_IDX('phat_hien_luc')] = '2026-09-01T00:00:00.000Z';
  const r2 = env.call('recheck', { id: r1.id }, nlTok, rid()).data.rec;
  assert.equal(r2.phat_hien_luc, '2026-09-01T00:00:00.000Z');
  const r3 = env.call('save', { rec: { ...r2, ghi_chu: 'x' } }, nlTok, rid()).data.rec;
  assert.equal(r3.phat_hien_luc, '2026-09-01T00:00:00.000Z');
  const r4 = env.call('save', { rec: { ...r3, an_toan: 'dat', van_de: [] } }, nlTok, rid()).data.rec;
  assert.equal(r4.phat_hien_luc, '');
});
function COLS_IDX(k) { return env.ctx.COLS.indexOf(k); }

test('Sheets đổi ô thành ngày → đọc lại đúng ngày giờ VN; cột chuỗi ép định dạng văn bản', () => {
  assert.equal(env.sheets.ThietBi.formats[COLS_IDX('so_tru') + 1], '@');
  assert.equal(env.sheets.ThietBi.formats[COLS_IDX('ngay_vb') + 1], '@');
  assert.equal(env.sheets.ThietBi.formats[COLS_IDX('so_luong') + 1], undefined);
  const r = env.call('save', { rec: rec() }, nlTok, rid()).data.rec;
  const row = env.sheets.ThietBi.data.find((x) => x[0] === r.id);
  row[COLS_IDX('ngay_vb')] = new Date('2025-12-31T17:00:00Z'); // = 00:00 01/01/2026 giờ VN
  const s = env.call('sync', {}, gsTok).data;
  const back = s.rows.find((a) => a[0] === r.id);
  assert.equal(back[COLS_IDX('ngay_vb')], '2026-01-01');
});

test('ngày kiểm tra tương lai bị từ chối; xoá/kiểm tra lại bắt buộc requestId; không thao tác trên bản ghi đã xoá', () => {
  assert.equal(env.call('save', { rec: rec({ ngay_kt: '2099-01-01' }) }, nlTok, rid()).code, 'VALIDATION');
  const r = env.call('save', { rec: rec() }, nlTok, rid()).data.rec;
  assert.equal(env.call('del', { id: r.id, version: 1 }, gsTok, '').code, 'BAD_REQUEST');
  assert.equal(env.call('del', { id: r.id, version: 1 }, gsTok, rid()).ok, true);
  assert.equal(env.call('recheck', { id: r.id }, gsTok, rid()).code, 'NOT_FOUND');
});

test('admin không tự khoá / tự hạ quyền', () => {
  assert.equal(env.call('userSave', { uid: 'admin', vai_tro: 'xem', quan: [] }, adminTok).code, 'VALIDATION');
  assert.equal(env.call('userSave', { uid: 'admin', vai_tro: 'admin', quan: [], khoa: true }, adminTok).code, 'VALIDATION');
});

test('nhật ký sửa ghi 1 lần cho nhiều trường', () => {
  const r = env.call('save', { rec: rec() }, nlTok, rid()).data.rec;
  const n = env.sheets.NhatKy.data.length;
  env.call('save', { rec: { ...r, tuyen: 'A', mo_ta: 'B', ghi_chu: 'C' } }, nlTok, rid());
  assert.equal(env.sheets.NhatKy.data.length, n + 3);
});

test('an toàn xấu đi → máy chủ mở lại vòng xử lý', () => {
  const a = env.call('uploadPhoto', { photo_client_id: crypto.randomUUID(), b64: JPEG(100) }, nlTok).data.file_id;
  const r1 = env.call('save', { rec: rec({ an_toan: 'can_kp', van_de: ['cap_du'], anh: [a] }) }, nlTok, rid()).data.rec;
  const r2 = env.call('save', { rec: { ...r1, xu_ly: 'da_kp', ngay_xu_ly: '2026-11-16' } }, gsTok, rid()).data.rec;
  assert.equal(r2.xu_ly, 'da_kp');
  const r3 = env.call('save', { rec: { ...r2, van_de: ['ro_dien'] } }, nlTok, rid()).data.rec; // tổ phát hiện rò điện
  assert.equal(r3.an_toan, 'nguy_hiem'); assert.equal(r3.xu_ly, 'chua');
});

test('gửi lại requestId cũ sau khi người khác đã sửa → vẫn thành công (nhớ 5 requestId)', () => {
  const r = env.call('save', { rec: rec() }, nlTok, rid()).data.rec;
  const ra = rid();
  assert.equal(env.call('save', { rec: { ...r, tuyen: 'A' } }, nlTok, ra).ok, true);
  assert.equal(env.call('save', { rec: { ...r, tuyen: 'B', version: 2 } }, gsTok, rid()).ok, true);
  const again = env.call('save', { rec: { ...r, tuyen: 'A' } }, nlTok, ra);
  assert.equal(again.ok, true); assert.equal(again.data.replay, true);
});
test('máy chủ chặn giá trị "constructor" / "__proto__"', () => {
  assert.equal(env.call('save', { rec: rec({ phap_ly: 'constructor' }) }, gsTok, rid()).code, 'VALIDATION');
  assert.equal(env.call('save', { rec: rec({ quan: 'toString' }) }, gsTok, rid()).code, 'VALIDATION');
  assert.equal(env.call('save', { rec: rec({ nhom: '__proto__' }) }, gsTok, rid()).code, 'VALIDATION');
});

test('capLaiMatKhauAdmin cấp mật khẩu tạm mới, phiên cũ hết hạn', () => {
  env.ctx.capLaiMatKhauAdmin();
  const pw = env.logs.join('\n').match(/Mật khẩu tạm: (\w+)/g).pop().split(': ')[1];
  assert.equal(env.call('me', {}, adminTok).code, 'AUTH');
  const r = env.call('login', { uid: 'admin', pw });
  assert.equal(r.ok, true); assert.equal(r.data.must_change, true);
});
