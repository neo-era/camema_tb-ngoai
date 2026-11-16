import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const C = require('../src/core.js');

const NOW = new Date('2026-11-16T03:00:00Z'); // 10:00 giờ VN
const base = () => ({
  quan: 'Q1', phuong: 'Bến Thành', tuyen: 'Lê Lợi', tu: 'll-02', so_tru: ' 12a ',
  lat: 10.7725, lng: 106.6980, gps_acc: 8,
  nhom: 'vien_thong', loai: 'Wifi công cộng', don_vi: 'Viettel', so_luong: '2',
  phap_ly: 'co_vb', loai_vb: 'hd_sd', so_vb: '15/HĐ', ngay_vb: '2026-01-10', han_vb: '2027-12-31',
  nguon: 'rieng', an_toan: 'dat', van_de: [], trang_thai: 'dang_lap', xu_ly: 'chua',
  ngay_kt: '2026-11-10', tao_luc: '2026-11-10T02:00:00Z', anh: []
});
const errs = (r, o) => C.validate(r, o).errors.map(e => e.field);

test('danh mục: 8 quận, 28 phường, 10 nhóm', () => {
  assert.equal(Object.keys(C.DM.QUAN).length, 8);
  assert.equal(Object.values(C.DM.QUAN).reduce((s, q) => s + q.phuong.length, 0), 28);
  assert.equal(Object.keys(C.DM.NHOM).length, 10);
  assert.ok(C.DM.NHOM.le_hoi.loai.includes('Cờ/phướn'));
});

test('chuẩn hoá: tủ/trụ chữ HOA, số lượng thành số', () => {
  const v = C.validate(base());
  assert.equal(v.ok, true, JSON.stringify(v.errors));
  assert.equal(v.rec.tu, 'LL-02');
  assert.equal(v.rec.so_tru, '12A');
  assert.equal(v.rec.so_luong, 2);
  assert.equal(v.rec.toa_do_tin_cay, true);
});

test('thiếu trường bắt buộc', () => {
  const r = base(); delete r.don_vi; r.tuyen = '  ';
  const e = errs(r);
  assert.ok(e.includes('don_vi') && e.includes('tuyen'));
});

test('số lượng 0 / âm / thập phân bị từ chối', () => {
  for (const v of ['0', -1, 1.5, 'abc']) assert.ok(errs({ ...base(), so_luong: v }).includes('so_luong'), String(v));
});

test('phường phải thuộc quận', () => {
  assert.ok(errs({ ...base(), phuong: 'Bàn Cờ' }).includes('phuong'));
  assert.ok(errs({ ...base(), quan: 'Q99' }).includes('quan'));
});

test('loại phải thuộc nhóm (hoặc Khác)', () => {
  assert.ok(errs({ ...base(), loai: 'Camera phạt nguội' }).includes('loai'));
});

test('pháp lý có VB → bắt buộc số/ngày/loại; hạn ≥ ngày VB; hạn trống = không thời hạn', () => {
  const e = errs({ ...base(), so_vb: '', ngay_vb: '', loai_vb: '' });
  assert.ok(e.includes('so_vb') && e.includes('ngay_vb') && e.includes('loai_vb'));
  assert.ok(errs({ ...base(), han_vb: '2025-01-01' }).includes('han_vb'));
  assert.equal(C.validate({ ...base(), han_vb: '' }).ok, true);
});

test('không VB / sai VB → bắt buộc ảnh', () => {
  const r = { ...base(), phap_ly: 'khong_vb' };
  assert.ok(errs(r).includes('anh'));
  assert.equal(C.validate({ ...r, anh: ['f1'] }).ok, true);
  assert.equal(C.validate(r, { pendingPhotos: 1 }).ok, true);
});

test('sai_vb cần ảnh', () => {
  assert.ok(errs({ ...base(), phap_ly: 'sai_vb', anh: [] }).includes('anh'));
});

test('nguồn lưới CS → bắt buộc tủ, điểm đấu, 24h, công tơ, CB, công suất ≥ 0', () => {
  const e = errs({ ...base(), nguon: 'luoi_cs', tu: '' });
  for (const f of ['tu', 'diem_dau', 'dien_24h', 'cong_to', 'cb_rieng', 'cong_suat_w']) assert.ok(e.includes(f), f);
  const ok = { ...base(), nguon: 'luoi_cs', diem_dau: 'trong_tu', dien_24h: false, cong_to: 'khong', cb_rieng: true, cong_suat_w: 0 };
  assert.equal(C.validate(ok).ok, true, JSON.stringify(C.validate(ok).errors));
  assert.ok(errs({ ...ok, cong_suat_w: -5 }).includes('cong_suat_w'));
});

test('an toàn ≠ đạt → bắt buộc vấn đề + ảnh; rò điện tự thành nguy hiểm', () => {
  const e = errs({ ...base(), an_toan: 'can_kp' });
  assert.ok(e.includes('van_de') && e.includes('anh'));
  const v = C.validate({ ...base(), an_toan: 'dat', van_de: ['ro_dien'], anh: ['x'] });
  assert.equal(v.rec.an_toan, 'nguy_hiem');
  assert.equal(v.ok, true);
});

test('vấn đề lạ bị từ chối; van_de chuỗi "a,b" được tách', () => {
  assert.ok(errs({ ...base(), an_toan: 'can_kp', van_de: ['xyz'], anh: ['a'] }).includes('van_de'));
  const v = C.validate({ ...base(), an_toan: 'can_kp', van_de: 'day_vong,cap_du', anh: ['a'] });
  assert.deepEqual(v.rec.van_de, ['day_vong', 'cap_du']);
});

test('lễ hội cần từ–đến, đến ≥ từ', () => {
  const r = { ...base(), nhom: 'le_hoi', loai: 'Đèn dây' };
  assert.ok(errs(r).includes('ls_tu'));
  assert.ok(errs({ ...r, ls_tu: '2026-11-20', ls_den: '2026-11-10' }).includes('ls_den'));
  assert.equal(C.validate({ ...r, ls_tu: '2026-11-01', ls_den: '2026-12-01' }).ok, true);
});

test('đã tháo cần ngày + lý do; đã thông báo cần số CV', () => {
  assert.ok(errs({ ...base(), trang_thai: 'da_thao' }).includes('ngay_thao'));
  assert.ok(errs({ ...base(), trang_thai: 'da_thao' }).includes('ly_do_thao'));
  assert.ok(errs({ ...base(), xu_ly: 'da_tb' }).includes('so_cv'));
  assert.ok(errs({ ...base(), xu_ly: 'da_tb', so_cv: '1' }).includes('han_xu_ly'));
});

test('GPS: ngoài TP từ chối; sai số lớn → không tin cậy; không có GPS vẫn lưu', () => {
  assert.ok(errs({ ...base(), lat: 21.02, lng: 105.8 }).includes('lat'));
  assert.equal(C.validate({ ...base(), gps_acc: 150 }).rec.toa_do_tin_cay, false);
  const v = C.validate({ ...base(), lat: '', lng: '', gps_acc: '' });
  assert.equal(v.ok, true);
  assert.equal(v.rec.toa_do_tin_cay, false);
});

test('ngày sai định dạng bị từ chối', () => {
  assert.ok(errs({ ...base(), ngay_vb: '31/12/2026' }).includes('ngay_vb'));
  assert.ok(errs({ ...base(), ngay_vb: '2026-02-30' }).includes('ngay_vb'));
});

test('chuỗi quá dài bị từ chối', () => {
  assert.ok(errs({ ...base(), tuyen: 'x'.repeat(501) }).includes('tuyen'));
  assert.ok(errs({ ...base(), ghi_chu: 'x'.repeat(2001) }).includes('ghi_chu'));
});

test('sanitizeCell chống chèn công thức', () => {
  for (const s of ['=1+1', '+A1', '-2', '@x', '\tA', '\rB', '＝1', '＋1', '－1', '＠a'])
    assert.equal(C.sanitizeCell(s), "'" + s, JSON.stringify(s));
  assert.equal(C.sanitizeCell('Lê Lợi'), 'Lê Lợi');
  assert.equal(C.sanitizeCell(5), 5);
  assert.equal(C.sanitizeCell(-5), -5);
});

test('ngày theo giờ VN', () => {
  assert.equal(C.todayVN(new Date('2026-11-16T18:30:00Z')), '2026-11-17');
  assert.equal(C.daysBetween('2026-11-16', '2026-12-16'), 30);
});

const codes = (r, now = NOW) => C.alerts(r, now).map(a => a.code);

test('cảnh báo pháp lý', () => {
  assert.deepEqual(codes(base()), []);
  assert.ok(codes({ ...base(), phap_ly: 'khong_vb' }).includes('khong_vb'));
  assert.ok(codes({ ...base(), phap_ly: 'sai_vb' }).includes('sai_vb'));
  assert.ok(codes({ ...base(), han_vb: '2026-11-15' }).includes('vb_het_han'));
  assert.ok(codes({ ...base(), han_vb: '2027-01-15' }).includes('vb_sap_het')); // 60 ngày
  assert.ok(!codes({ ...base(), han_vb: '2027-01-16' }).includes('vb_sap_het')); // 61 ngày
  assert.ok(codes({ ...base(), phap_ly: 'dang_tt', tao_luc: '2026-09-01T00:00:00Z' }).includes('dang_tt_lau'));
  assert.ok(!codes({ ...base(), phap_ly: 'dang_tt', tao_luc: '2026-10-01T00:00:00Z' }).includes('dang_tt_lau'));
});

test('cảnh báo nguồn: đấu trước contactor, lưới không công tơ', () => {
  const r = { ...base(), nguon: 'luoi_cs', dien_24h: true, cong_to: 'khong' };
  const a = C.alerts(r, NOW);
  assert.equal(a[0].code, 'dau_truoc_ct');
  assert.equal(a[0].level, 'do');
  assert.ok(a.some(x => x.code === 'luoi_khong_ct'));
  assert.ok(!codes({ ...r, dien_24h: false, cong_to: 'el_rieng' }).length);
});

test('cảnh báo an toàn: hạn tính từ lúc phát hiện, theo giờ', () => {
  const nh = { ...base(), an_toan: 'nguy_hiem', phat_hien_luc: '2026-11-15T06:00:00Z' }; // NOW = 16/11 03:00Z → 21 giờ
  assert.equal(C.alerts(nh, NOW).find(a => a.code === 'nguy_hiem').qua_han, false);
  assert.equal(C.alerts({ ...nh, phat_hien_luc: '2026-11-15T02:00:00Z' }, NOW).find(a => a.code === 'nguy_hiem').qua_han, true); // 25 giờ
  const kp = C.alerts({ ...base(), an_toan: 'can_kp', phat_hien_luc: '2026-10-01T03:00:00Z' }, NOW).find(a => a.code === 'can_kp');
  assert.equal(kp.level, 'do'); // quá 30 ngày → đỏ
  assert.equal(C.alerts({ ...base(), an_toan: 'can_kp', phat_hien_luc: '2026-11-01T03:00:00Z' }, NOW).find(a => a.code === 'can_kp').level, 'vang');
  // "kiểm tra lại" (ngay_kt mới) KHÔNG làm mới hạn
  assert.equal(C.alerts({ ...base(), an_toan: 'can_kp', phat_hien_luc: '2026-09-01T03:00:00Z', ngay_kt: '2026-11-16' }, NOW).find(a => a.code === 'can_kp').level, 'do');
});

test('ngày kiểm tra / tháo / xử lý không được sau hôm nay', () => {
  assert.ok(C.validate({ ...base(), ngay_kt: '2099-01-01' }, { now: NOW }).errors.some(e => e.field === 'ngay_kt'));
});

test('dang_tt_lau tính theo ngày giờ VN', () => {
  // tạo 18:00Z ngày 16/09 = 01:00 ngày 17/09 giờ VN → đến 16/11 là 60 ngày → chưa quá
  assert.ok(!codes({ ...base(), phap_ly: 'dang_tt', tao_luc: '2026-09-16T18:00:00Z' }).includes('dang_tt_lau'));
  assert.ok(codes({ ...base(), phap_ly: 'dang_tt', tao_luc: '2026-09-16T10:00:00Z' }).includes('dang_tt_lau'));
});

test('cảnh báo đóng khi đã xử lý; đã tháo/xoá không cảnh báo', () => {
  const r = { ...base(), phap_ly: 'khong_vb', an_toan: 'nguy_hiem' };
  // đóng xử lý: hết cảnh báo pháp lý/quản lý, NHƯNG cảnh báo an toàn còn khi điều kiện còn
  assert.deepEqual(codes({ ...r, xu_ly: 'da_kp' }), ['nguy_hiem']);
  assert.deepEqual(codes({ ...r, xu_ly: 'chuyen_cq' }), ['nguy_hiem']);
  assert.deepEqual(codes({ ...r, xu_ly: 'da_kp', an_toan: 'dat' }), []);
  assert.deepEqual(codes({ ...base(), nguon: 'luoi_cs', dien_24h: true, cong_to: 'khong', xu_ly: 'da_kp' }), ['dau_truoc_ct']);
  assert.deepEqual(codes({ ...r, trang_thai: 'da_thao' }), []);
  assert.deepEqual(codes({ ...r, xoa: true }), []);
  // quá hạn xử lý: bất kể đã thông báo hay chưa, kể cả không có cảnh báo khác
  assert.ok(codes({ ...r, xu_ly: 'da_tb', han_xu_ly: '2026-11-10' }).includes('qua_han_xl'));
  assert.ok(codes({ ...base(), xu_ly: 'chua', han_xu_ly: '2026-11-10' }).includes('qua_han_xl'));
  assert.ok(!codes({ ...r, xu_ly: 'da_tb', han_xu_ly: '2026-11-20' }).includes('qua_han_xl'));
});

test('cảnh báo lễ hội, vô chủ, bỏ hoang, chưa kiểm tra lại', () => {
  const lh = { ...base(), nhom: 'le_hoi', loai: 'Đèn dây', ls_tu: '2026-10-01' };
  assert.equal(C.alerts({ ...lh, ls_den: '2026-11-15' }, NOW).find(a => a.code === 'le_hoi_qua_han').level, 'do');
  assert.ok(codes({ ...lh, ls_den: '2026-11-19' }).includes('le_hoi_sap_thao'));
  assert.ok(!codes({ ...lh, ls_den: '2026-11-20' }).includes('le_hoi_sap_thao'));
  assert.ok(codes({ ...base(), don_vi: 'Chưa xác định chủ' }).includes('vo_chu'));
  assert.ok(codes({ ...base(), trang_thai: 'bo_hoang' }).includes('bo_hoang'));
  assert.ok(codes({ ...base(), ngay_kt: '2026-05-01' }).includes('chua_kt_lai'));
});

test('ngưỡng chỉnh được qua cfg', () => {
  const cfg = { ...C.DEFAULT_CFG, vb_nhac_ngay: 30 };
  assert.ok(!C.alerts({ ...base(), han_vb: '2027-01-10' }, NOW, cfg).some(a => a.code === 'vb_sap_het'));
});

test('topAlert: đỏ trước vàng trước xám', () => {
  const r = { ...base(), don_vi: 'Chưa xác định chủ', an_toan: 'nguy_hiem', van_de: ['ro_dien'], ngay_kt: '2026-05-01' }; // chua_kt_lai chỉ áp mức Đạt
  assert.equal(C.topAlert(r, NOW).code, 'nguy_hiem');
  assert.equal(C.topAlert(base(), NOW), null);
});

// ---- thống kê: bộ dữ liệu đối chiếu tính tay ----
const DATA = [
  { ...base(), id: 'a', quan: 'Q1', phuong: 'Bến Thành', nhom: 'vien_thong', don_vi: 'Viettel', so_luong: 2 },
  { ...base(), id: 'b', quan: 'Q1', phuong: 'Sài Gòn', nhom: 'camera_gt', loai: 'Camera phạt nguội', don_vi: 'Công an TP', so_luong: 3, phap_ly: 'khong_vb', anh: ['x'] },
  { ...base(), id: 'c', quan: 'Q3', phuong: 'Bàn Cờ', nhom: 'vien_thong', don_vi: 'Viettel', so_luong: 1, nguon: 'luoi_cs', tu: 'BC-01', diem_dau: 'trong_tu', dien_24h: true, cong_to: 'khong', cb_rieng: false, cong_suat_w: 150 },
  { ...base(), id: 'd', quan: 'Q3', phuong: 'Bàn Cờ', nhom: 'quan_trac', loai: 'Không khí', don_vi: 'Sở NN&MT', so_luong: 1, nguon: 'luoi_cs', tu: 'BC-01', diem_dau: 'cua_tru', dien_24h: false, cong_to: 'phu', cb_rieng: true, cong_suat_w: 50, an_toan: 'nguy_hiem', van_de: ['ro_dien'], anh: ['y'] },
  { ...base(), id: 'e', quan: 'Q1', phuong: 'Bến Thành', nhom: 'vien_thong', don_vi: 'Viettel', so_luong: 4, trang_thai: 'da_thao', ngay_thao: '2026-11-01', ly_do_thao: 'hết HĐ' },
  { ...base(), id: 'f', quan: 'Q1', phuong: 'Bến Thành', nhom: 'vien_thong', don_vi: 'Viettel', so_luong: 9, xoa: true },
  { ...base(), id: 'g', quan: 'Q5', phuong: 'Chợ Lớn', nhom: 'le_hoi', loai: 'Đèn dây', don_vi: 'UBND P.Chợ Lớn', so_luong: 40, nguon: 'luoi_cs', tu: 'CL-07', diem_dau: 'day_noi', dien_24h: false, cong_to: 'khong', cb_rieng: false, cong_suat_w: 800, ls_tu: '2026-11-01', ls_den: '2026-11-10' },
];

test('thống kê khớp tính tay', () => {
  const s = C.stats(DATA, {}, NOW);
  assert.equal(s.vi_tri, 5);           // a b c d g (loại e đã tháo, f đã xoá)
  assert.equal(s.so_luong, 47);        // 2+3+1+1+40
  assert.deepEqual(s.byQuanNhom.Q1, { vien_thong: { vi_tri: 1, so_luong: 2 }, camera_gt: { vi_tri: 1, so_luong: 3 } });
  assert.equal(s.byQuanNhom.Q3.vien_thong.so_luong, 1);
  assert.equal(s.byPhuong['Bàn Cờ'].vi_tri, 2);
  assert.equal(s.byDonVi.Viettel.vi_tri, 2);
  assert.equal(s.byDonVi.Viettel.so_luong, 3);
  assert.equal(s.phapLy.khong_vb.vi_tri, 1);
  assert.equal(s.phapLy.co_vb.vi_tri, 4);
  assert.equal(s.nguon.luoi_cs.vi_tri, 3);
  assert.equal(s.anToan.nguy_hiem.vi_tri, 1);
  assert.deepEqual(s.congSuatTheoTu, [{ quan: 'Q5', tu: 'CL-07', cong_suat_w: 800, vi_tri: 1 }, { quan: 'Q3', tu: 'BC-01', cong_suat_w: 200, vi_tri: 2 }]);
  // vi phạm: Viettel c (dau_truoc_ct + luoi_khong_ct = 2), Công an b (khong_vb=1), Sở d (nguy_hiem=1), UBND g (luoi_khong_ct + le_hoi_qua_han = 2)
  assert.deepEqual(s.xepHangViPham.slice(0, 2), [{ don_vi: 'UBND P.Chợ Lớn', vi_pham: 2, vi_tri: 1 }, { don_vi: 'Viettel', vi_pham: 2, vi_tri: 1 }]);
  assert.equal(s.xepHangViPham.length, 4);
  assert.equal(s.canhBao.dau_truoc_ct, 1);
  assert.equal(s.canhBao.le_hoi_qua_han, 1);
});

test('thống kê gom đơn vị không phân biệt hoa/thường, dấu cách', () => {
  const s = C.stats([{ ...base(), id: 'x1', don_vi: 'Viettel' }, { ...base(), id: 'x2', don_vi: ' VIETTEL ' }], {}, NOW);
  assert.deepEqual(Object.keys(s.byDonVi), ['Viettel']);
  assert.equal(s.byDonVi.Viettel.vi_tri, 2);
});

test('lọc: quận, nhóm, đơn vị, trạng thái đã tháo, khoảng ngày kiểm tra', () => {
  assert.equal(C.stats(DATA, { quan: 'Q3' }, NOW).vi_tri, 2);
  assert.equal(C.stats(DATA, { nhom: 'vien_thong' }, NOW).so_luong, 3);
  assert.equal(C.stats(DATA, { don_vi: 'viettel' }, NOW).vi_tri, 2);
  assert.equal(C.stats(DATA, { trang_thai: 'da_thao' }, NOW).vi_tri, 1);
  assert.equal(C.stats(DATA, { kt_tu: '2026-11-11' }, NOW).vi_tri, 0);
  assert.equal(C.filterRecs(DATA, { q: 'cong an' }).length, 1); // tìm không dấu
});

test('trùng: cùng tủ + trụ + loại + đơn vị, đang lắp, khác id', () => {
  const r = { ...DATA[0], id: undefined, tu: 'll-02', so_tru: '12A', don_vi: ' viettel ' };
  assert.deepEqual(C.findDuplicates(r, DATA).map(x => x.id), ['a']);
  assert.deepEqual(C.findDuplicates({ ...r, id: 'a' }, DATA), []);
  assert.deepEqual(C.findDuplicates({ ...r, loai: 'Khác' }, DATA), []);
});

test('phân quyền', () => {
  const nl = { vai_tro: 'nhaplieu', quan: ['Q1'] };
  assert.equal(C.can(nl, 'create', { quan: 'Q1' }), true);
  assert.equal(C.can(nl, 'create', { quan: 'Q3' }), false);
  assert.equal(C.can(nl, 'update', { quan: 'Q1' }, { quan: 'Q3' }), false); // chuyển sang quận khác
  assert.equal(C.can(nl, 'delete', { quan: 'Q1' }), false);
  assert.equal(C.can({ vai_tro: 'giamsat', quan: [] }, 'delete', { quan: 'Q8' }), true);
  assert.equal(C.can({ vai_tro: 'xem', quan: ['Q1'] }, 'create', { quan: 'Q1' }), false);
  assert.equal(C.can({ vai_tro: 'admin' }, 'users'), true);
  assert.equal(C.can({ vai_tro: 'giamsat' }, 'users'), false);
});

test('so sánh hằng thời gian', () => {
  assert.equal(C.safeEqual('abc', 'abc'), true);
  assert.equal(C.safeEqual('abc', 'abd'), false);
  assert.equal(C.safeEqual('abc', 'abcd'), false);
});

test('bỏ dấu tiếng Việt', () => {
  assert.equal(C.fold('Đường Lê Lợi'), 'duong le loi');
});

test('chặn khoá kế thừa của Object làm giá trị liệt kê', () => {
  for (const [f, v] of [['phap_ly', 'constructor'], ['trang_thai', 'valueOf'], ['nguon', 'hasOwnProperty'], ['quan', 'toString'], ['nhom', '__proto__'], ['xu_ly', 'toString']])
    assert.ok(errs({ ...base(), [f]: v }).includes(f), f + '=' + v);
  assert.ok(errs({ ...base(), an_toan: 'can_kp', van_de: ['constructor'], anh: ['a'] }).includes('van_de'));
});
test('trùng bỏ khoảng trắng trong mã tủ/trụ; tuyến cáp cần số trụ qua; độ dài tính theo ký tự', () => {
  assert.deepEqual(C.findDuplicates({ ...DATA[0], id: 'z', tu: 'LL -02', so_tru: '12 A' }, DATA).map(x => x.id), ['a']);
  assert.ok(errs({ ...base(), so_tru_den: '18' }).includes('so_tru_qua'));
  assert.equal(C.validate({ ...base(), tuyen: '😀'.repeat(500) }).ok, true);
});
test('rowSane: dòng sửa tay sai bị loại', () => {
  assert.equal(C.rowSane({ ...base(), so_luong: 2 }), true);
  assert.equal(C.rowSane({ ...base(), quan: 'Q99' }), false);
  assert.equal(C.rowSane({ ...base(), so_luong: 'hai' }), false);
  assert.equal(C.rowSane({ ...base(), an_toan: 'tot' }), false);
});
