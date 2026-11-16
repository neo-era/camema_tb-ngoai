/* TBNgoài — Hướng dẫn sử dụng tích hợp trong app (chạy được khi mất mạng).
 * window.TBN_HELP(cfg) → [{ id, title, icon, roles?, html }]. roles: chỉ để gắn nhãn "dành cho"; mọi người đều xem được. */
window.TBN_HELP = function (cfg) {
  cfg = cfg || {};
  var g = function (k, d) { return cfg[k] != null ? cfg[k] : d; };
  return [
    {
      id: 'batdau', title: 'Bắt đầu: cài app, đăng nhập', icon: 'install',
      html: '<ol>' +
        '<li><b>Cài app lên máy</b> để mở toàn màn hình, dùng được khi mất mạng:<ul>' +
        '<li>Android / máy tính (Chrome, Edge): mở link app → bấm <b>Cài đặt</b> (hoặc menu ⋮ → Cài đặt ứng dụng).</li>' +
        '<li>iPhone / iPad: mở bằng <b>Safari</b> → nút <b>Chia sẻ</b> → <b>Thêm vào MH chính</b>.</li></ul></li>' +
        '<li><b>Đăng nhập</b> bằng tài khoản Quản trị cấp. Lần đầu (mật khẩu tạm) app bắt buộc <b>đổi mật khẩu</b> — tối thiểu 8 ký tự.</li>' +
        '<li>App có 4 tab dưới cùng: <b>Danh sách</b> · <b>Bản đồ</b> · <b>Thống kê</b> · <b>Khác</b>.</li></ol>' +
        '<table><tr><th>Vai trò</th><th>Được làm</th></tr>' +
        '<tr><td>Nhập liệu</td><td>Thêm/sửa thiết bị trong các quận được giao, chụp ảnh, kiểm tra lại</td></tr>' +
        '<tr><td>Giám sát</td><td>Xem/sửa toàn KVTT, cập nhật <b>tình hình xử lý</b>, xoá, xuất Excel</td></tr>' +
        '<tr><td>Chỉ xem</td><td>Xem danh sách, bản đồ, thống kê, xuất Excel</td></tr>' +
        '<tr><td>Quản trị</td><td>Toàn quyền + quản lý tài khoản</td></tr></table>'
    },
    {
      id: 'them', title: 'Thêm thiết bị mới', icon: 'plus', roles: 'Nhập liệu, Giám sát',
      html: '<ol>' +
        '<li>Đứng ngay chân trụ, bấm nút <b>+</b> (góc dưới phải tab Danh sách). App tự lấy <b>GPS</b>; khung toạ độ màu vàng nghĩa là sai số lớn (&gt; 30 m) — bấm <b>Lấy lại</b> khi ra chỗ thoáng.</li>' +
        '<li><b>Quận / phường</b> (địa bàn cũ) → <b>Tuyến, Tủ, Số trụ</b> (xem mục <i>Tự điền</i> bên dưới).</li>' +
        '<li><b>Nhóm thiết bị</b> → <b>Loại chi tiết</b> → <b>Đơn vị chủ quản</b> (gõ vài chữ để chọn đơn vị đã có; không biết chủ thì bấm <b>Chưa rõ chủ</b>) → <b>Số lượng</b>.</li>' +
        '<li><b>An toàn</b>, <b>Ảnh</b>, <b>Cấp nguồn</b>, <b>Pháp lý</b> — xem các mục riêng bên dưới.</li>' +
        '<li>Bấm <b>Lưu</b>. Ô còn thiếu hiện chữ đỏ ngay dưới ô. Nếu đã có thiết bị cùng tủ + trụ + loại + đơn vị, app hỏi lại để tránh nhập trùng.</li></ol>' +
        '<p class="tip">Đang nhập dở thoát ra, lần sau mở lại nút + sẽ còn nguyên bản nháp.</p>' +
        '<p><b>Tuyến cáp / đèn dây qua nhiều trụ:</b> chỉ ghi <b>1 bản ghi</b> — số trụ đầu, mở mục "Tuyến cáp / đèn dây qua nhiều trụ" để ghi trụ cuối và số trụ đi qua.</p>'
    },
    {
      id: 'tudien', title: 'Tự điền Tuyến đường, Tủ, Số trụ', icon: 'star',
      html: '<ul>' +
        '<li><b>Theo vị trí</b> (khi thêm mới, sau khi có GPS hoặc chọn trên bản đồ):<ul>' +
        '<li>Đã có thiết bị cách <b>≤ 12 m</b> (cùng trụ) → điền tuyến, tủ, <b>số trụ</b>, quận/phường.</li>' +
        '<li>Cách 12–60 m → điền tuyến, tủ, quận/phường (không điền số trụ).</li>' +
        '<li>Không có thiết bị gần → lấy <b>tên đường trên bản đồ</b>.</li></ul></li>' +
        '<li><b>Khi gõ:</b> các ô hiện danh sách gợi ý từ dữ liệu đã có. Gõ một <b>tủ</b> đã biết → tự điền tuyến, quận/phường; ô Số trụ gợi ý các trụ của tủ đó đã có thiết bị.</li>' +
        '<li>App <b>không đè</b> chữ bạn đã gõ. Dòng ghi chú cho biết nguồn tự điền; bấm <b>Bỏ tự điền</b> nếu sai.</li></ul>' +
        '<p class="tip">Luôn nhìn lại số trụ trên thân trụ — tự điền chỉ là gợi ý.</p>'
    },
    {
      id: 'bando-them', title: 'Thêm thiết bị trên bản đồ', icon: 'map',
      html: '<ol><li>Tab <b>Bản đồ</b> → bấm nút <b>+</b>.</li>' +
        '<li>Kéo bản đồ cho <b>tâm ngắm đỏ</b> trùng vị trí trụ (phóng to tới khi app cho chọn — mức 16 trở lên). Nút ☰ góc phải đổi nền <b>Vệ tinh</b> để nhìn rõ trụ.</li>' +
        '<li>Bấm <b>Thêm tại đây</b> → form mở sẵn toạ độ, ghi "chọn trên bản đồ". Trên máy tính có thể <b>bấm chuột phải</b> ngay vào vị trí.</li></ol>' +
        '<p>Dùng khi nhập bổ sung tại văn phòng hoặc GPS điện thoại kém. Trên bản đồ: điểm <b>đỏ hình tam giác</b> = có cảnh báo đỏ, vàng = cần lưu ý, xanh = bình thường. Chạm một điểm để xem nhanh.</p>'
    },
    {
      id: 'anh', title: 'Chụp ảnh thiết bị', icon: 'cam',
      html: '<ul><li>Mục <b>Ảnh thiết bị</b>: <b>Chụp ảnh</b> (mở camera) hoặc <b>Chọn ảnh</b> có sẵn; tối đa <b>5 ảnh</b>/bản ghi.</li>' +
        '<li>App tự <b>đóng dấu lên ảnh</b>: thời gian, toạ độ (kèm sai số), người cập nhật, trụ/tủ/tuyến. Nên nhập trụ/tủ/tuyến <b>trước</b> khi chụp để dấu có đủ thông tin.</li>' +
        '<li><b>Bắt buộc có ảnh</b> khi mức an toàn khác Đạt, hoặc pháp lý là Không văn bản / Sai văn bản.</li>' +
        '<li>Ảnh lưu trên Google Drive, thư mục riêng của đơn vị, chia theo tháng. Mất mạng vẫn chụp được, ảnh gửi sau.</li></ul>' +
        '<p class="tip">Chụp 1 ảnh toàn cảnh trụ + 1 ảnh cận điểm đấu/vi phạm.</p>'
    },
    {
      id: 'antoan', title: 'Mức an toàn & cảnh báo', icon: 'alert',
      html: '<table><tr><th>Mức</th><th>Khi nào chọn</th><th>Hạn xử lý</th></tr>' +
        '<tr><td><b>Nguy hiểm</b></td><td>Rò điện, đấu nối hở, vướng xe, trụ nghiêng… có thể gây tai nạn ngay</td><td>' + g('nguy_hiem_gio', 24) + ' giờ từ lúc phát hiện</td></tr>' +
        '<tr><td><b>Cần khắc phục</b></td><td>Không an toàn nhưng chưa nguy cấp: cáp chằng chịt, mất cửa trụ, khoan/hàn thân trụ…</td><td>' + g('can_kp_ngay', 30) + ' ngày</td></tr>' +
        '<tr><td><b>Đạt</b></td><td>Lắp chắc chắn, không ảnh hưởng hệ thống</td><td>Kiểm tra lại sau ' + g('dat_kt_ngay', 180) + ' ngày</td></tr></table>' +
        '<ul><li>Chọn vấn đề <b>Rò điện</b> → app tự chuyển mức Nguy hiểm.</li>' +
        '<li>Màu cảnh báo: <b>đỏ</b> (phải xử lý: nguy hiểm, trái phép, văn bản hết hạn, nghi đấu trước contactor, quá hạn), <b>vàng</b> (lưu ý), <b>xám</b> (lâu chưa kiểm tra lại).</li>' +
        '<li>Hạn tính từ <b>lúc phát hiện</b>; bấm "Kiểm tra lại – không đổi" không làm mới hạn.</li>' +
        '<li>Cảnh báo an toàn chỉ hết khi chính tình trạng hết (đã sửa về Đạt) — không tự hết khi ghi "đã thông báo".</li></ul>'
    },
    {
      id: 'nguon', title: 'Cấp nguồn điện & pháp lý', icon: 'zap',
      html: '<p><b>Cấp nguồn:</b> nếu thiết bị lấy điện từ <b>lưới chiếu sáng</b>, ghi thêm điểm đấu (trong tủ / cửa trụ / dây nổi), có điện 24/24 không, công tơ, CB riêng, công suất (W).</p>' +
        '<ul><li>Lưới chiếu sáng nhưng có điện <b>24/24</b> → cảnh báo đỏ <b>nghi đấu trước contactor</b>.</li>' +
        '<li>Lưới chiếu sáng mà <b>không công tơ</b> → cảnh báo vàng (sử dụng điện không đo đếm).</li></ul>' +
        '<p><b>Pháp lý:</b> Có văn bản / Đang làm thủ tục / Sai văn bản / Không văn bản (trái phép) / Chưa rõ. Có văn bản thì ghi loại, số, ngày, hạn (để trống = không thời hạn). App nhắc trước khi văn bản hết hạn ' + g('vb_nhac_ngay', 60) + ' ngày.</p>' +
        '<p><b>Đèn trang trí lễ hội:</b> bắt buộc ghi ngày lắp và ngày phải tháo; app nhắc trước ' + g('le_hoi_nhac_ngay', 3) + ' ngày và báo đỏ khi quá hạn tháo.</p>'
    },
    {
      id: 'danhsach', title: 'Danh sách, tìm kiếm, kiểm tra lại', icon: 'list',
      html: '<ul><li>Ô tìm: gõ tuyến, số trụ, tủ, đơn vị… Chip quận và <b>Có cảnh báo</b> để lọc nhanh; nút phễu để lọc theo nhóm, mức an toàn, pháp lý.</li>' +
        '<li>Chạm một thiết bị để xem chi tiết, ảnh, nút <b>Chỉ đường</b> (Google Maps).</li>' +
        '<li>Đi kiểm tra mà thiết bị <b>không thay đổi</b>: bấm <b>Kiểm tra lại – không đổi</b> (ghi ngày kiểm tra, không cần nhập lại).</li>' +
        '<li>Có thay đổi: bấm <b>Sửa / cập nhật xử lý</b>. Thiết bị đã tháo: đổi trạng thái <b>Đã tháo</b> kèm ngày, lý do.</li></ul>'
    },
    {
      id: 'xuly', title: 'Xử lý vi phạm (Giám sát)', icon: 'check', roles: 'Giám sát, Quản trị',
      html: '<ol><li>Tab <b>Thống kê</b> → mục <b>Cần xử lý</b> liệt kê bản ghi có cảnh báo đỏ, nguy hiểm lên đầu.</li>' +
        '<li>Mở bản ghi → <b>Sửa / cập nhật xử lý</b> → chọn: Đã thông báo đơn vị (bắt buộc số công văn + hạn xử lý) · Đơn vị đã khắc phục · Đã tháo dỡ · Đã chuyển cơ quan chức năng.</li>' +
        '<li>Gửi công văn hàng loạt: bảng <b>Xếp hạng vi phạm</b> → nút <b>Đề nghị khắc phục</b> của từng đơn vị → file Excel A4 ngang, có khối ký, đính kèm công văn.</li></ol>' +
        '<p class="tip">Nhập liệu không cập nhật được tình hình xử lý — tránh tự đóng cảnh báo.</p>'
    },
    {
      id: 'thongke', title: 'Thống kê & xuất Excel', icon: 'chart',
      html: '<ul><li>Lọc theo quận, phường, nhóm, đơn vị, trạng thái, khoảng ngày kiểm tra. Chạm ô số liệu để xem danh sách tương ứng.</li>' +
        '<li>Các bảng: theo nhóm, theo đơn vị, theo pháp lý/nguồn, công suất theo tủ, xếp hạng vi phạm.</li>' +
        '<li>Nút <b>Excel</b> góc trên: xuất danh sách theo bộ lọc hoặc bảng tổng hợp (định dạng sẵn để in).</li></ul>'
    },
    {
      id: 'matmang', title: 'Làm việc khi mất mạng', icon: 'cloud',
      html: '<ul><li>Mất mạng vẫn thêm, sửa, chụp ảnh bình thường; góc trên hiện <b>Ngoại tuyến</b> và <b>n chờ gửi</b>.</li>' +
        '<li>Có mạng lại, app <b>tự gửi</b> — không cần làm gì. Xem chi tiết ở <b>Khác → Hàng chờ gửi</b>.</li>' +
        '<li><b>Không đăng xuất</b> khi còn mục chờ gửi (đăng xuất sẽ xoá dữ liệu trên máy).</li>' +
        '<li>Hai người cùng sửa một bản ghi: app báo <b>xung đột</b> để chọn giữ bản nào.</li></ul>'
    },
    {
      id: 'taikhoan', title: 'Quản lý tài khoản (Quản trị)', icon: 'users', roles: 'Quản trị',
      html: '<ol><li><b>Khác → Quản lý tài khoản → +</b>: nhập tên đăng nhập, họ tên, vai trò; Nhập liệu phải chọn quận được giao.</li>' +
        '<li>Mật khẩu tạm chỉ hiện <b>một lần</b> — sao chép gửi riêng từng người.</li>' +
        '<li>Quên mật khẩu: mở tài khoản → <b>Cấp lại mật khẩu</b>. Nghỉ việc: <b>Khoá</b> — phiên đăng nhập cũ hết hiệu lực ngay.</li></ol>'
    },
    {
      id: 'loi', title: 'Gặp sự cố thường gặp', icon: 'alert',
      html: '<dl>' +
        '<dt>Không lấy được GPS</dt><dd>Cho phép quyền <b>Vị trí</b> cho app/trình duyệt, bật GPS, ra chỗ thoáng rồi bấm <b>Lấy lại</b>. Vẫn lưu được nhưng toạ độ ghi "chưa tin cậy" — có thể chọn vị trí trên bản đồ.</dd>' +
        '<dt>Bản đồ trắng / không hiện nền</dt><dd>Bấm ☰ góc phải bản đồ, đổi sang lớp nền khác.</dd>' +
        '<dt>Không chụp được ảnh</dt><dd>Cho phép quyền <b>Camera</b>; hoặc dùng <b>Chọn ảnh</b> từ thư viện.</dd>' +
        '<dt>Báo "phiên hết hạn" / phải đăng nhập lại</dt><dd>Đăng nhập lại; dữ liệu chờ gửi vẫn còn. Tài khoản bị đổi quyền hoặc cấp lại mật khẩu cũng phải đăng nhập lại.</dd>' +
        '<dt>App chưa có tính năng mới</dt><dd>Đóng hẳn app rồi mở lại 1–2 lần. Số phiên bản ở cuối tab <b>Khác</b>.</dd>' +
        '<dt>Mục chờ gửi báo lỗi</dt><dd>Mở <b>Khác → Hàng chờ gửi</b> xem lý do, sửa rồi gửi lại; vẫn lỗi thì báo qua <b>Góp ý</b>.</dd></dl>'
    },
    {
      id: 'gopy', title: 'Góp ý & báo lỗi', icon: 'msg',
      html: '<p><b>Khác → Góp ý & đánh giá</b>: chấm sao, chọn loại (đề xuất, lỗi app, sai dữ liệu) và mô tả. App tự kèm phiên bản và màn hình đang dùng; mất mạng thì gửi sau.</p>'
    }
  ];
};
