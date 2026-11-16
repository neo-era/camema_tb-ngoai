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
    filterRecs: filterRecs, stats: stats, findDuplicates: findDuplicates, can: can
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = Core;
