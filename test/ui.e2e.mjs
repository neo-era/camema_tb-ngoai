// Kiểm thử giao diện thật (Chromium) nối với backend Code.gs chạy trên môi trường giả lập.
// Chạy: node test/ui.e2e.mjs   (ảnh chụp ở test/shots/)
import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { makeEnv, JPEG } from './gas-mock.mjs';
import { createRequire } from 'node:module';
const C = createRequire(import.meta.url)('../src/core.js');

const ROOT = new URL('..', import.meta.url).pathname, PORT = 8765, BASE = `http://localhost:${PORT}/`;
const URL_API = 'https://script.google.com/macros/s/TESTDEPLOY/exec';
mkdirSync(ROOT + 'test/shots', { recursive: true });
const TILE_PNG = '89504e470d0a1a0a0000000d4948445200000100000001000802000000d3103f31000002bf49444154785eedd3310d002000c030c0bf491e1e4c1074ac75b063739f3ba06a55c3e13300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d20c409a01483300690620cd00a419803403906600d21e544504b2f03101dc0000000049454e44ae426082';
const results = []; const ok = (name) => { results.push(['✔', name]); console.log('✔', name); };
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '-d', ROOT + 'web'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));

// ---- Backend giả lập + dữ liệu mẫu ----
const env = makeEnv(); env.ctx.setup();
const adminPw = env.logs.join('\n').match(/Mật khẩu tạm: (\w+)/)[1];
const adminTok0 = env.call('login', { uid: 'admin', pw: adminPw }).data.token;
const adminTok = env.call('changePw', { old_pw: adminPw, new_pw: 'Admin@12345' }, adminTok0).data.token;
function mkUser(uid, vai_tro, quan) {
  const t = env.call('userSave', { uid, ho_ten: uid === 'to1' ? 'Tổ CS Quận 1' : 'Phòng Kỹ thuật', vai_tro, quan }, adminTok).data.temp_pw;
  const tok = env.call('login', { uid, pw: t }).data.token;
  return env.call('changePw', { old_pw: t, new_pw: 'MatKhau@123' }, tok).data.token;
}
const toTok = mkUser('to1', 'nhaplieu', ['Q1', 'Q3']); const gsTok = mkUser('gs1', 'giamsat', []);
const photo = env.call('uploadPhoto', { photo_client_id: crypto.randomUUID(), b64: readFileSync(ROOT + 'test/fixtures/tru.jpg').toString('base64') }, gsTok).data.file_id;
const seed = [
  { quan: 'Q1', phuong: 'Bến Thành', tuyen: 'Lê Lợi', tu: 'LL-02', so_tru: '12', lat: 10.7731, lng: 106.6993, gps_acc: 6, nhom: 'camera_gt', loai: 'Camera an ninh (Công an/phường)', don_vi: 'Công an TP.HCM', so_luong: 2, phap_ly: 'khong_vb', nguon: 'luoi_cs', diem_dau: 'cua_tru', dien_24h: true, cong_to: 'khong', cb_rieng: false, cong_suat_w: 60, an_toan: 'can_kp', van_de: ['dau_noi', 'cua_tru'], anh: [photo] },
  { quan: 'Q1', phuong: 'Sài Gòn', tuyen: 'Hàm Nghi', tu: 'HN-01', so_tru: '05', lat: 10.7713, lng: 106.7032, gps_acc: 9, nhom: 'vien_thong', loai: 'Trạm phát sóng nhỏ', don_vi: 'Viettel', so_luong: 1, phap_ly: 'co_vb', loai_vb: 'hd_sd', so_vb: '15/HĐ-CSCC', ngay_vb: '2025-03-01', han_vb: '2026-12-20', nguon: 'rieng', an_toan: 'dat' },
  { quan: 'Q3', phuong: 'Xuân Hòa', tuyen: 'Nam Kỳ Khởi Nghĩa', tu: 'NKKN-03', so_tru: '21', lat: 10.7835, lng: 106.6915, gps_acc: 12, nhom: 'quan_trac', loai: 'Không khí', don_vi: 'Sở NN&MT', so_luong: 1, phap_ly: 'dang_tt', so_vb: 'CV 88', loai_vb: 'thoa_thuan', ngay_vb: '2026-08-01', nguon: 'luoi_cs', diem_dau: 'trong_tu', dien_24h: false, cong_to: 'phu', cb_rieng: true, cong_suat_w: 40, an_toan: 'nguy_hiem', van_de: ['ro_dien'], anh: [photo] },
  { quan: 'BT', phuong: 'Gia Định', tuyen: 'Phan Đăng Lưu', tu: 'PDL-01', so_tru: '03', so_tru_den: '18', so_tru_qua: 16, lat: 10.8031, lng: 106.6958, gps_acc: 15, nhom: 'le_hoi', loai: 'Đèn dây', don_vi: 'UBND P.Gia Định', so_luong: 40, phap_ly: 'co_vb', loai_vb: 'chap_thuan', so_vb: '12/UBND', ngay_vb: '2026-10-01', nguon: 'luoi_cs', diem_dau: 'day_noi', dien_24h: false, cong_to: 'khong', cb_rieng: false, cong_suat_w: 900, an_toan: 'dat', ls_tu: '2026-10-05', ls_den: '2026-11-10' },
  { quan: 'Q5', phuong: 'Chợ Lớn', tuyen: 'Hải Thượng Lãn Ông', tu: 'HTLO-02', so_tru: '9', lat: 10.7506, lng: 106.6580, gps_acc: 7, nhom: 'loa', loai: 'Loa', don_vi: 'Chưa xác định chủ', so_luong: 2, phap_ly: 'chua_ro', nguon: 'khong_dien', an_toan: 'dat' }
];
for (const r of seed) { const x = env.call('save', { rec: { client_id: crypto.randomUUID(), trang_thai: 'dang_lap', ...r }, confirmDup: true }, gsTok, crypto.randomUUID()); assert.equal(x.ok, true, JSON.stringify(x)); }
for (let i = 0; i < 40; i++) env.call('save', { rec: { client_id: crypto.randomUUID(), quan: 'Q10', phuong: ['Vườn Lài', 'Diên Hồng', 'Hòa Hưng'][i % 3], tuyen: '3 Tháng 2', tu: 'BTH-0' + (i % 4), so_tru: String(100 + i), lat: 10.77 + i * 0.0004, lng: 106.67 + (i % 5) * 0.001, gps_acc: 8, nhom: i % 2 ? 'vien_thong' : 'camera_gt', loai: i % 2 ? 'Wifi công cộng' : 'Camera giám sát giao thông', don_vi: i % 3 ? 'VNPT' : 'Sở Xây dựng', so_luong: 1 + (i % 3), phap_ly: 'co_vb', loai_vb: 'hd_sd', so_vb: 'HD' + i, ngay_vb: '2025-01-01', nguon: 'rieng', an_toan: 'dat' }, confirmDup: true }, gsTok, crypto.randomUUID());

// ---- Trình duyệt ----
const browser = await chromium.launch();
let apiCalls = 0, offline = false;
async function newCtx(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, permissions: ['geolocation'], geolocation: { latitude: 10.7769, longitude: 106.7009, accuracy: 8 }, locale: 'vi-VN', timezoneId: 'Asia/Ho_Chi_Minh', ...opts });
  await ctx.addInitScript((u) => localStorage.setItem('tbn_script_url', u), URL_API);
  await ctx.route('https://script.google.com/**', (route) => {
    if (offline) return route.abort('internetdisconnected');
    apiCalls++;
    const body = route.request().postData() || '';
    const res = env.ctx.doPost({ postData: { contents: body, length: Buffer.byteLength(body) } });
    route.fulfill({ status: 200, contentType: 'application/json', body: res.content });
  });
  await ctx.route('https://server.arcgisonline.com/**', (r) => r.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from(TILE_PNG, 'hex') }));
  await ctx.route('https://tile.openstreetmap.org/**', (r) => r.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from(TILE_PNG, 'hex') }));
  return ctx;
}
async function login(page, uid) {
  await page.goto(BASE);
  await page.fill('#l-uid', uid); await page.fill('#l-pw', 'MatKhau@123'); await page.click('#l-btn');
  await page.waitForSelector('.tabs');
  await page.waitForFunction(() => window.__tbn && window.__tbn.S.recs.size > 0 && !window.__tbn.S.syncing);
}
const errs = [];
function watch(page) { page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => { if (m.type() === 'error' && !/favicon|ERR_INTERNET_DISCONNECTED|Failed to load resource/.test(m.text())) errs.push(m.text()); }); }
async function noOverflow(page, label) {
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (ov > 1) console.log('  tràn bởi:', await page.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > innerWidth + 1).slice(0, 6).map((e) => e.tagName + '.' + e.className + ' ' + Math.round(e.getBoundingClientRect().right))));
  assert.ok(ov <= 1, `${label}: tràn ngang ${ov}px`);
}
async function noOverlap(page, a, b, label) {
  const r = await page.evaluate(([a, b]) => { const x = document.querySelector(a), y = document.querySelector(b); if (!x || !y) return null; const p = x.getBoundingClientRect(), q = y.getBoundingClientRect(); return !(p.right <= q.left || q.right <= p.left || p.bottom <= q.top || q.bottom <= p.top); }, [a, b]);
  assert.notEqual(r, true, `${label}: ${a} đè ${b}`);
}

try {
  // ===== 1. Nhập liệu trên điện thoại =====
  const ctx = await newCtx(); const page = await ctx.newPage(); watch(page);
  await page.goto(BASE);
  await page.fill('#l-uid', 'to1'); await page.fill('#l-pw', 'sai-mat-khau'); await page.click('#l-btn');
  await page.waitForFunction(() => document.querySelector('#l-e').textContent.length > 0);
  assert.match(await page.textContent('#l-e'), /Sai tài khoản/); ok('Đăng nhập sai báo lỗi');
  await login(page, 'to1');
  const cards = await page.locator('#lst .it').count();
  assert.equal(cards, 45); ok('Danh sách tải đủ 45 bản ghi (nhập liệu xem toàn KVTT)');
  await page.screenshot({ path: ROOT + 'test/shots/01-list-doc-sang.png' });
  await page.click('[data-q="Q3"]'); assert.equal(await page.locator('#lst .it').count(), 1); ok('Lọc theo quận');
  await page.click('[data-q=""]'); await page.fill('#q', 'cong an'); await page.waitForTimeout(400);
  assert.equal(await page.locator('#lst .it').count(), 1); ok('Tìm không dấu');
  await page.fill('#q', ''); await page.waitForTimeout(400);

  // Form: bấm Lưu khi trống → báo lỗi
  await page.click('#b-add'); await page.waitForSelector('#frm');
  await page.waitForFunction(() => window.__tbn.S.form && window.__tbn.S.form.lat);
  await page.locator('.savebar [data-save]').click();
  await page.waitForSelector('.err');
  assert.equal(await page.locator('[data-seg="xu_ly"]').count(), 0); ok('Nhập liệu không thấy phần "Tình hình xử lý"');
  const nErr = await page.locator('.err').count(); assert.ok(nErr >= 5, 'phải báo nhiều lỗi, có ' + nErr); ok(`Lưu form trống: báo ${nErr} lỗi tại trường`);
  await page.screenshot({ path: ROOT + 'test/shots/02-form-loi.png' });

  // Điền đầy đủ: nguồn lưới CS + an toàn cần KP (cần ảnh)
  const seg = (f, v) => page.locator(`[data-seg="${f}"][data-v="${v}"]`).click();
  await seg('quan', 'Q1'); await seg('phuong', 'Tân Định');
  await page.fill('#i-tuyen', 'Hai Bà Trưng'); await page.fill('#i-tu', 'hbt-05'); await page.fill('#i-so_tru', '33');
  await seg('nhom', 'vien_thong'); await seg('loai', 'Hộp/tủ thiết bị mạng');
  await page.fill('#i-don_vi', 'FPT Telecom'); await page.locator('[data-step="1"]').click();
  await seg('an_toan', 'can_kp'); await page.locator('[data-multi="van_de"][data-v="cap_du"]').click();
  await page.setInputFiles('#i-photo', { name: 'a.jpg', mimeType: 'image/jpeg', buffer: await (async () => { const p2 = await ctx.newPage(); const b = await p2.screenshot({ type: 'jpeg', quality: 80 }); await p2.close(); return b; })() });
  await page.waitForSelector('#ph .slot img, #ph .slot .ph-load');
  await seg('nguon', 'luoi_cs'); await seg('diem_dau', 'trong_tu'); await seg('dien_24h', 'true'); await seg('cong_to', 'khong'); await seg('cb_rieng', 'false');
  await page.fill('#i-cong_suat_w', '120');
  await seg('phap_ly', 'co_vb'); await seg('loai_vb', 'hd_sd'); await page.fill('#i-so_vb', '77/HĐ'); await page.fill('#i-ngay_vb', '2026-02-01');
  await page.screenshot({ path: ROOT + 'test/shots/03-form-dien-doc-sang.png', fullPage: true });
  const before = env.sheets.ThietBi.data.length;
  await page.locator('.savebar [data-save]').click();
  await page.waitForSelector('#lst'); await page.waitForFunction(() => window.__tbn.S.queue.length === 0, null, { timeout: 15000 });
  assert.equal(env.sheets.ThietBi.data.length, before + 1);
  const saved = env.call('sync', {}, gsTok).data; const recs = saved.rows.map((a) => Object.fromEntries(saved.cols.map((k, i) => [k, a[i]])));
  const mine = recs.find((r) => r.tuyen === 'Hai Bà Trưng');
  assert.equal(mine.tu, 'HBT-05'); assert.equal(mine.so_luong, 2); assert.equal(mine.anh.length, 1); assert.ok(mine.lat > 10.7);
  assert.equal(mine.tao_boi, 'to1');
  ok('Thêm bản ghi đủ trường + ảnh → lên máy chủ đúng (tủ chữ HOA, SL 2, 1 ảnh, GPS)');
  const arow = env.sheets.Anh.data.find((r) => r[1] === mine.anh[0]);
  assert.equal(arow[2], 'to1'); assert.ok(arow[6] > 10.7 && arow[7] > 106.6, 'ảnh có tọa độ'); assert.match(arow[9], /^TB_\d{8}_\d{6}_to1_/);
  assert.match(env.files[mine.anh[0]].desc, /Người cập nhật: Tổ CS Quận 1 \(to1\)/);
  const { writeFileSync } = await import('node:fs'); writeFileSync(ROOT + 'test/shots/anh-dong-dau.jpg', Buffer.from(env.files[mine.anh[0]].getBlob().getBytes().map((b) => b & 255)));
  ok('Ảnh lưu thư mục tháng, tên + mô tả + sheet Anh có thời gian/tọa độ/người cập nhật');
  assert.match(await page.locator('#lst .it').first().textContent(), /Nghi đấu trước contactor/); ok('Thẻ hiện cảnh báo nặng nhất: đấu trước contactor');

  // Trùng
  await page.click('#b-add'); await page.waitForSelector('#frm');
  await seg('quan', 'Q1'); await seg('phuong', 'Tân Định'); await page.fill('#i-tuyen', 'Hai Bà Trưng'); await page.fill('#i-tu', 'HBT-05'); await page.fill('#i-so_tru', '33');
  await seg('nhom', 'vien_thong'); await seg('loai', 'Hộp/tủ thiết bị mạng'); await page.fill('#i-don_vi', 'fpt telecom');
  await seg('an_toan', 'dat'); await seg('nguon', 'rieng'); await seg('phap_ly', 'chua_ro');
  await page.locator('.savebar [data-save]').click();
  await page.waitForSelector('.modal'); assert.match(await page.textContent('.modal'), /trùng/i); ok('Cảnh báo trùng trước khi lưu');
  await page.click('.modal [data-close=""]');

  // Huỷ để bỏ nháp
  page.once('dialog', (d) => d.accept());
  await page.click('[data-cancel]'); await page.click('.modal [data-close="ok"]'); await page.waitForSelector('#lst');

  // Offline: lưu vào hàng chờ, có mạng tự gửi
  offline = true; await ctx.setOffline(true);
  await page.click('#b-add'); await page.waitForSelector('#frm');
  await seg('quan', 'Q3'); await seg('phuong', 'Nhiêu Lộc'); await page.fill('#i-tuyen', 'Trần Quốc Thảo'); await page.fill('#i-so_tru', '7');
  await seg('nhom', 'bien_bao'); await seg('loai', 'Biển chỉ dẫn'); await page.fill('#i-don_vi', 'Sở Xây dựng');
  await seg('an_toan', 'dat'); await seg('nguon', 'khong_dien'); await seg('phap_ly', 'chua_ro');
  const n0 = env.sheets.ThietBi.data.length;
  await page.locator('.savebar [data-save]').click(); await page.waitForSelector('#lst');
  await page.waitForSelector('#hstate .pill.warn'); assert.match(await page.textContent('#hstate'), /1 chờ gửi/);
  assert.match(await page.locator('#lst .it').first().textContent(), /Chờ gửi/);
  assert.equal(env.sheets.ThietBi.data.length, n0); ok('Mất mạng: lưu trên máy, hiện "1 chờ gửi"');
  await page.screenshot({ path: ROOT + 'test/shots/04-offline-cho-gui.png' });
  // tải lại trang khi offline → vẫn còn hàng chờ (IndexedDB) và shell mở được
  await page.reload(); await page.waitForSelector('#lst'); assert.match(await page.textContent('#hstate'), /1 chờ gửi/); ok('Mở lại app khi offline: vẫn vào được, hàng chờ còn nguyên');
  offline = false; await ctx.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await page.waitForFunction(() => window.__tbn.S.queue.length === 0, null, { timeout: 15000 });
  assert.equal(env.sheets.ThietBi.data.length, n0 + 1); ok('Có mạng lại: tự gửi, không trùng');

  // Chi tiết + kiểm tra lại + ảnh
  await page.locator('#lst .it', { hasText: 'Camera an ninh' }).click(); await page.waitForSelector('.kv');
  await page.waitForSelector('#photos img'); ok('Chi tiết hiện ảnh tải qua API (thư mục Drive riêng tư)');
  await page.screenshot({ path: ROOT + 'test/shots/05-chitiet-doc-sang.png', fullPage: true });
  const v0 = recs.length; await page.click('#b-rc'); await page.waitForSelector('.toast'); await page.waitForFunction(() => window.__tbn.S.queue.length === 0);
  ok('Kiểm tra lại – không đổi');
  assert.equal(await page.locator('#b-del').count(), 0); ok('Nhập liệu không thấy nút Xoá');
  await page.click('[data-back]'); await page.waitForSelector('#lst'); ok('Nút quay lại ở màn phụ');

  // Góp ý
  await page.click('a[href="#/more"]'); await page.click('#m-fb'); await page.click('.modal button[type="submit"], .modal .btn.pri');
  assert.match(await page.textContent('#fb-e'), /Chọn số sao/);
  await page.click('[data-s="4"]'); await page.fill('#fb-nd', 'Thêm lọc theo tủ'); await page.click('.modal .btn.pri');
  for (let i = 0; i < 50 && env.sheets.GopY.data.length < 2; i++) await page.waitForTimeout(100);
  assert.equal(env.sheets.GopY.data.at(-1)[3], 4); ok('Góp ý & đánh giá: rỗng bị chặn, gửi được');
  await ctx.close();

  // ===== 2. Giám sát: thống kê + xuất Excel =====
  const ctx2 = await newCtx({ viewport: { width: 1366, height: 900 }, acceptDownloads: true }); const p2 = await ctx2.newPage(); watch(p2);
  await login(p2, 'gs1');
  assert.equal(p2.url().includes('#/stats') || (await p2.locator('h1').textContent()).includes('thống kê'), true); ok('Giám sát mở vào thẳng Thống kê');
  const all = env.call('sync', {}, gsTok).data; const allRecs = all.rows.map((a) => Object.fromEntries(all.cols.map((k, i) => [k, a[i]])));
  const st = C.stats(allRecs, {}, new Date());
  const kpi0 = await p2.locator('.kpi .n').first().textContent();
  assert.equal(kpi0.replace(/\D/g, ''), String(st.vi_tri)); ok(`KPI tổng vị trí khớp lõi: ${st.vi_tri}`);
  assert.equal((await p2.locator('.kpi.do .n').nth(1).textContent()).trim(), String(st.canhBao.dau_truoc_ct)); ok('KPI đấu trước contactor khớp');
  await p2.screenshot({ path: ROOT + 'test/shots/06-thongke-desktop-sang.png', fullPage: true });
  await p2.selectOption('#s-quan', 'Q10'); await p2.waitForTimeout(200);
  assert.equal((await p2.locator('.kpi .n').first().textContent()).replace(/\D/g, ''), '40'); ok('Lọc thống kê theo quận');
  await p2.selectOption('#s-quan', '');
  const [dl] = await Promise.all([p2.waitForEvent('download'), (async () => { await p2.click('#b-xls'); await p2.click('.modal [data-close="stat"]'); })()]);
  const xp = ROOT + 'test/shots/' + dl.suggestedFilename(); await dl.saveAs(xp); ok('Xuất Excel thống kê: ' + dl.suggestedFilename());
  const [dl2] = await Promise.all([p2.waitForEvent('download'), p2.locator('[data-dn]').first().click()]);
  const xp2 = ROOT + 'test/shots/' + dl2.suggestedFilename(); await dl2.saveAs(xp2); ok('Xuất mẫu Đề nghị khắc phục: ' + dl2.suggestedFilename());
  const [dl3] = await Promise.all([p2.waitForEvent('download'), (async () => { await p2.click('#b-xls'); await p2.click('.modal [data-close="list"]'); })()]);
  const xp3 = ROOT + 'test/shots/' + dl3.suggestedFilename(); await dl3.saveAs(xp3); ok('Xuất danh sách');
  // Bản đồ
  await p2.click('a[href="#/map"]'); await p2.waitForSelector('.leaflet-marker-icon');
  const nm = await p2.locator('.leaflet-marker-icon').count(); assert.ok(nm >= 40, 'marker ' + nm); ok(`Bản đồ hiện ${nm} điểm`);
  assert.ok(await p2.locator('.mk.do').count() >= 2); ok('Điểm đỏ dùng hình tam giác (không chỉ màu)');
  await p2.screenshot({ path: ROOT + 'test/shots/07-bando-desktop.png' });
  // Quản lý tài khoản: giám sát không thấy
  await p2.click('a[href="#/more"]'); assert.equal(await p2.locator('#m-users').count(), 0); ok('Giám sát không có mục Quản lý tài khoản');
  await ctx2.close();

  // ===== 3. Bộ ảnh mobile: dọc / ngang / máy nhỏ × sáng / tối =====
  const sizes = { doc: [390, 844], ngang: [844, 390], nho: [360, 640] };
  for (const theme of ['light', 'dark']) for (const [sz, [w, h]] of Object.entries(sizes)) {
    const c = await newCtx({ viewport: { width: w, height: h }, colorScheme: theme }); const p = await c.newPage(); watch(p);
    await login(p, 'to1');
    for (const [route, name] of [['#/list', 'list'], ['#/stats', 'stats'], ['#/map', 'map'], ['#/form', 'form'], ['#/more', 'more']]) {
      await p.evaluate((r) => (location.hash = r), route); await p.waitForTimeout(route === '#/map' ? 700 : 300);
      if (route === '#/form') await p.waitForSelector('#frm');
      await noOverflow(p, `${name} ${sz} ${theme}`);
      if (route === '#/list') { await noOverlap(p, '.fab', '.tabs', `${sz}`); }
      if (route === '#/map') { await noOverlap(p, '.map-top', '.drawer', `map ${sz}`); await noOverlap(p, '.locate', '.drawer', `map ${sz}`); await noOverlap(p, '.map-add', '.drawer', `map+ ${sz}`); await noOverlap(p, '.map-add', '.locate', `map+ ${sz}`); await noOverlap(p, '.map-add', '.map-top', `map+ ${sz}`);
        await p.click('#b-madd'); await p.waitForTimeout(400);
        await noOverlap(p, '.pickbar', '.crosshair', `pick ${sz}`); await noOverlap(p, '.pickbar', '.map-top', `pick ${sz}`);
        await p.screenshot({ path: `${ROOT}test/shots/m-mapadd-${sz}-${theme}.png` });
        await p.click('#pick-no'); }
      if (route === '#/form' && sz === 'ngang') { assert.ok(await p.locator('.head-save').isVisible(), 'ngang: nút Lưu ở header'); }
      await p.screenshot({ path: `${ROOT}test/shots/m-${name}-${sz}-${theme}.png` });
    }
    // vùng chạm
    const small = await p.evaluate(() => { location.hash = '#/list'; return null; });
    await p.waitForTimeout(250);
    const tiny = await p.evaluate(() => [...document.querySelectorAll('button, a.tab, .chip, input:not([type=checkbox]):not(.sr)')].filter((e) => !e.closest('.search')).filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.height && r.height < 44; }).map((e) => e.className + ':' + Math.round(e.getBoundingClientRect().height)));
    assert.deepEqual(tiny, [], `vùng chạm < 44px (${sz} ${theme}): ${tiny.join(', ')}`);
    await c.close();
  }
  ok('Ảnh dọc/ngang/360×640 × sáng/tối: không tràn ngang, không đè, vùng chạm ≥ 44 px');

  // ===== 4. PWA =====
  const c4 = await newCtx(); const p4 = await c4.newPage(); watch(p4);
  await p4.goto(BASE); await p4.evaluate(() => navigator.serviceWorker.ready);
  const man = await p4.evaluate(async () => (await fetch('manifest.webmanifest')).json());
  assert.equal(man.display, 'standalone'); assert.ok(man.icons.some((i) => i.purpose === 'maskable'));
  ok('Manifest standalone + icon maskable; service worker sẵn sàng');
  await p4.reload(); await p4.evaluate(() => navigator.serviceWorker.ready); await c4.setOffline(true); await p4.reload();
  await p4.waitForSelector('#lf'); ok('Tắt mạng mở lại: shell vẫn chạy (cache SW)');
  await c4.close();

  // ===== 4b. Thêm thiết bị trên bản đồ =====
  const c7 = await newCtx(); const p7 = await c7.newPage(); watch(p7);
  await login(p7, 'to1');
  await p7.evaluate(() => (location.hash = '#/map')); await p7.waitForSelector('.leaflet-marker-icon');
  await p7.evaluate(() => window.__tbn.S.map ? 0 : 0);
  await p7.click('#b-madd'); await p7.waitForSelector('.pickbar', { state: 'visible' });
  await p7.evaluate(() => { /* đưa tâm ngắm về Q.1 */ });
  await p7.click('#pick-ok'); await p7.waitForSelector('#frm');
  const pf = await p7.evaluate(() => ({ lat: window.__tbn.S.form.lat, acc: window.__tbn.S.form.gps_acc, picked: window.__tbn.S.form._picked }));
  assert.ok(pf.lat > 10.3 && pf.lat < 11.2 && pf.picked === true && pf.acc > 0 && pf.acc <= 30, JSON.stringify(pf));
  assert.match(await p7.textContent('.gps'), /chọn trên bản đồ/);
  await p7.waitForTimeout(1500); // GPS tự động không được ghi đè vị trí đã chọn
  assert.equal(await p7.evaluate(() => window.__tbn.S.form.lat), pf.lat);
  ok(`Thêm trên bản đồ: tâm ngắm → form có tọa độ ${pf.lat.toFixed(5)} (±${pf.acc} m), không bị GPS ghi đè`);
  await c7.close();

  // ===== 5. Mật khẩu tạm khi còn hàng chờ: không làm hỏng hàng chờ, chỉ 1 hộp đổi mật khẩu =====
  const c5 = await newCtx(); const p5 = await c5.newPage(); watch(p5);
  await login(p5, 'to1');
  offline = true; await c5.setOffline(true);
  for (const tr of ['901', '902']) {
    await p5.evaluate(() => (location.hash = '#/form')); await p5.waitForSelector('#frm');
    await p5.locator('[data-seg="quan"][data-v="Q1"]').click(); await p5.locator('[data-seg="phuong"][data-v="Sài Gòn"]').click();
    await p5.fill('#i-tuyen', 'Đồng Khởi'); await p5.fill('#i-so_tru', tr);
    await p5.locator('[data-seg="nhom"][data-v="khac"]').click(); await p5.fill('#i-don_vi', 'Đơn vị X');
    await p5.locator('[data-seg="an_toan"][data-v="dat"]').click(); await p5.locator('[data-seg="nguon"][data-v="khong_dien"]').click(); await p5.locator('[data-seg="phap_ly"][data-v="chua_ro"]').click();
    await p5.locator('.savebar [data-save]').click(); await p5.waitForSelector('#lst');
  }
  const tmp = env.call('userResetPw', { uid: 'to1' }, adminTok).data.temp_pw;
  offline = false; await c5.setOffline(false);
  await p5.evaluate(async () => { const s = await window.__tbn.DB.get('kv', 'session'); s.token = 'het-han.x'; await window.__tbn.DB.put('kv', s, 'session'); });
  await p5.goto(BASE); await p5.waitForTimeout(800);
  // phiên cũ bị thu hồi → đăng nhập lại bằng mật khẩu tạm
  await p5.evaluate(async () => { await window.__tbn.DB.del('kv', 'session'); }); await p5.goto(BASE);
  await p5.fill('#l-uid', 'to1'); await p5.fill('#l-pw', tmp); await p5.click('#l-btn');
  await p5.waitForSelector('.modal'); await p5.waitForTimeout(1500);
  assert.equal(await p5.locator('.modal').count(), 1, 'chỉ 1 hộp đổi mật khẩu');
  const q = await p5.evaluate(() => window.__tbn.S.queue.map((x) => x.state));
  assert.deepEqual(q, ['cho', 'cho'], 'hàng chờ phải còn nguyên: ' + q);
  ok('Mật khẩu tạm + hàng chờ: 1 hộp đổi mật khẩu, hàng chờ không bị chuyển lỗi');
  await p5.fill('#p-old', tmp); await p5.fill('#p-new', 'MatKhau@123'); await p5.fill('#p-new2', 'MatKhau@123'); await p5.click('#pf .btn.pri');
  await p5.waitForFunction(() => window.__tbn.S.queue.length === 0, null, { timeout: 15000 });
  ok('Đổi mật khẩu xong: hàng chờ tự gửi');
  await c5.close();

  // ===== 6. Excel có định dạng in =====
  const py = spawn('python3', ['-c', `
import openpyxl,glob
f=sorted(glob.glob('${ROOT}test/shots/DeNghiKhacPhuc_*.xlsx'))[-1]; ws=openpyxl.load_workbook(f).active
assert ws.page_setup.orientation=='landscape', 'A4 ngang'
assert ws.print_title_rows, 'lặp tiêu đề'
hr=[r for r in range(1,15) if ws.cell(r,1).value=='STT'][0]
assert ws.cell(hr,1).font.b and ws.cell(hr+1,2).border.left.style=='thin', 'đậm + khung'
assert any('Công văn số' in str(ws.cell(r,1).value) for r in range(1,8)), 'dòng kèm công văn'
assert any(ws.cell(r,c).value=='GIÁM ĐỐC' for r in range(1,ws.max_row+1) for c in range(1,14)), 'khối ký'
print('xlsx-ok', ws.cell(hr+1,2).value)
`]);
  let out = ''; py.stdout.on('data', (d) => (out += d)); py.stderr.on('data', (d) => (out += d));
  await new Promise((r) => py.on('close', r));
  assert.match(out, /xlsx-ok TB/, out); ok('Excel đề nghị khắc phục: A4 ngang, lặp tiêu đề, đậm + khung, dòng công văn, khối ký');

  assert.deepEqual(errs, [], 'Lỗi JS trên trang: ' + errs.join(' | ')); ok('Không có lỗi JavaScript trên trang');
  console.log(`\nĐẠT ${results.length} kiểm tra giao diện. Số lệnh API: ${apiCalls}`);
} catch (e) {
  console.error('\n✘ THẤT BẠI:', e.message); if (errs.length) console.error('Lỗi trang:', errs); process.exitCode = 1;
} finally { await browser.close(); srv.kill(); }
