# TBNgoài — Quản lý thiết bị đơn vị ngoài lắp trên trụ chiếu sáng — Thiết kế

Phiên bản tài liệu: 1.0 (16/11/2026) · Trạng thái: **v1.0.0 đã qua Bước 0–5** (chuyên gia nghiệp vụ, kỹ thuật, UX, review mã, QA — xem *Nhật ký duyệt*). Chờ thử trên Apps Script + điện thoại thật.
Phạm vi: Chiếu sáng Khu vực Trung Tâm — địa bàn 8 quận cũ (1, 3, 5, 8, 10, 11, Bình Thạnh, Phú Nhuận) = 28 phường mới (từ 01/7/2025).

## 1. Mục tiêu
Web app **PWA** (cài trên điện thoại + máy tính) để tổ/xí nghiệp hiện trường **cập nhật thiết bị của đơn vị ngoài** gắn trên trụ chiếu sáng; phòng/Giám đốc **xem tổng hợp thống kê, cảnh báo và theo dõi xử lý**. Ba mục đích quản lý:
1. **Pháp lý** — có hợp đồng sử dụng/thoả thuận/giấy phép hay lắp trái phép, sai văn bản; hạn văn bản. (NĐ 72/2012/NĐ-CP, hợp nhất 47/VBHN-BXD 06/2026: Điều 17 yêu cầu hợp đồng sử dụng giữa chủ sở hữu và bên sử dụng; Điều 14 an toàn, chịu lực, đúng vị trí.)
2. **Cấp nguồn điện** — đấu từ lưới chiếu sáng không, điểm đấu, công tơ, CB riêng, công suất; phát hiện **đấu trước contactor** (thiết bị chạy 24/24 lấy điện lưới CS).
3. **An toàn trụ** — mức an toàn, vấn đề cụ thể, ảnh chứng cứ, thời hạn xử lý.

## 2. Bước 0 — Tiêu chí "chạy đúng"

### 2.1 Bản ghi
1 bản ghi = 1 nhóm thiết bị **cùng đơn vị, cùng loại** trên 1 trụ. Tuyến cáp treo / đèn dây chạy qua nhiều trụ: ghi **1 bản ghi** với `so_tru` (trụ đầu) + `so_tru_den` (trụ cuối) + `so_tru_qua` (số trụ đi qua) — không nhân bản từng trụ.

### 2.2 Danh mục (sửa được trong sheet DanhMuc)
| Mã nhóm | Nhóm | Loại chi tiết mặc định |
|---|---|---|
| `quan_trac` | Quan trắc môi trường | Không khí, Khí tượng, Tiếng ồn, Mực nước/ngập, Khác |
| `camera_gt` | Camera / giao thông | Camera an ninh (Công an/phường), Camera giám sát GT, Camera phạt nguội, Đếm/đo tốc độ xe, Bảng VMS, Khác |
| `vien_thong` | Viễn thông | Trạm phát sóng nhỏ, Wifi công cộng, Hộp/tủ thiết bị mạng, Cáp quang/cáp treo, Khác |
| `do_dien` | Đồng hồ / TB đo điện | Công tơ, Thiết bị đo điện năng, Khác |
| `le_hoi` | Trang trí lễ hội – tuyên truyền | Đèn dây, Mô-típ/hoa văn, Băng rôn đèn, Cờ/phướn, Khác |
| `loa` | Loa truyền thanh phường | Loa, Hộp điều khiển loa, Khác |
| `bien_bao` | Biển báo/chỉ dẫn/tên đường đơn vị khác | Biển báo, Biển chỉ dẫn, Biển tên đường, Khác |
| `quang_cao` | Quảng cáo, băng rôn, pano (không đèn) | Băng rôn, Pano, Bảng quảng cáo, Khác |
| `tu_hop` | Tủ/hộp điện đơn vị khác | Tủ điện, Hộp điện, Khác |
| `khac` | Khác | Khác |

**Phường mới theo quận cũ** (Nghị quyết 1685/NQ-UBTVQH15):
- Q.1: Tân Định, Bến Thành, Sài Gòn, Cầu Ông Lãnh
- Q.3: Bàn Cờ, Xuân Hòa, Nhiêu Lộc
- Q.5: Chợ Quán, An Đông, Chợ Lớn
- Q.8: Chánh Hưng, Bình Đông, Phú Định
- Q.10: Vườn Lài, Diên Hồng, Hòa Hưng
- Q.11: Hòa Bình, Phú Thọ, Bình Thới, Minh Phụng
- Bình Thạnh: Gia Định, Bình Thạnh, Bình Lợi Trung, Thạnh Mỹ Tây, Bình Quới
- Phú Nhuận: Đức Nhuận, Cầu Kiệu, Phú Nhuận

`quan` = địa bàn quận cũ (dùng để phân quyền, thống kê); `phuong` chọn từ danh mục phường mới của quận đó.

**Đơn vị chủ quản**: gõ có gợi ý từ danh sách đã nhập; có giá trị cố định **"Chưa xác định chủ"** (thiết bị vô chủ) — có cảnh báo riêng.

### 2.3 Giá trị liệt kê
- `phap_ly`: `co_vb` (Có VB) · `dang_tt` (Đang làm thủ tục) · `sai_vb` (Có VB nhưng sai vị trí/số lượng/loại) · `khong_vb` (Không VB – trái phép) · `chua_ro`
- `loai_vb`: `hd_sd` (HĐ sử dụng) · `thoa_thuan` · `giay_phep` · `chap_thuan` (chấp thuận của cơ quan) · `ben_cap`: `sapulico` · `so` · `phuong` · `khac`
- `nguon`: `luoi_cs` (Lưới chiếu sáng) · `rieng` (Nguồn riêng/điện lực) · `pin_nlmt` · `khong_dien` · `chua_ro`
- `diem_dau`: `trong_tu` · `cua_tru` · `day_noi` · `dien_24h`: có/không · `cong_to`: `el_rieng` (CT điện lực riêng) · `phu` (CT phụ) · `khong` · `cb_rieng`: có/không · `cong_suat_w` + `cs_uoc_tinh` (ước tính)
- `an_toan`: `dat` · `can_kp` · `nguy_hiem`
- `van_de` (nhiều): `ro_dien` (thân/cửa trụ có điện → tự đặt **nguy_hiem**) · `cua_tru` (mất/hở cửa trụ) · `khoan_han` (khoan/hàn thân trụ) · `tinh_khong` (thấp, vướng xe) · `day_vong` · `cap_du` (cáp dư, chằng chịt) · `dau_noi` (đấu nối không an toàn) · `long_leo` · `che_den` · `gio` (chắn gió lớn) · `tru_nghieng` (nghiêng/biến dạng) · `qua_tai` (tải vượt mức) · `khac`
- `xu_ly`: `chua` · `da_tb` (đã thông báo đơn vị, + `so_cv`) · `da_kp` (đơn vị đã khắc phục) · `da_thao` · `chuyen_cq` (chuyển cơ quan chức năng); + `han_xu_ly`, `ngay_xu_ly`
- `trang_thai`: `dang_lap` · `bo_hoang` (không hoạt động, cần thu hồi) · `da_thao` (+ `ngay_thao`, `ly_do_thao`)

### 2.4 Quy tắc bắt buộc nhập (kiểm ở client **và** máy chủ)
1. Luôn bắt buộc: quận, phường, tuyến, số trụ, nhóm, loại, đơn vị, số lượng (nguyên ≥ 1), pháp lý, nguồn, an toàn, trạng thái.
2. `co_vb`/`dang_tt`/`sai_vb` → bắt buộc `so_vb`, `ngay_vb`, `loai_vb`. `han_vb` trống = không thời hạn; có thì phải ≥ `ngay_vb`.
3. `khong_vb`/`sai_vb` → bắt buộc ≥ 1 ảnh.
4. `nguon = luoi_cs` → bắt buộc `tu`, `diem_dau`, `dien_24h`, `cong_to`, `cb_rieng`, `cong_suat_w` (≥ 0, cho phép đánh dấu ước tính).
5. `an_toan ≠ dat` → bắt buộc ≥ 1 `van_de` và ≥ 1 ảnh. Chọn `ro_dien` → `an_toan` tự thành `nguy_hiem`.
6. `le_hoi` → bắt buộc `ls_tu`, `ls_den` (đến ≥ từ).
7. `da_thao` → bắt buộc `ngay_thao`, `ly_do_thao`. `xu_ly = da_tb` → bắt buộc `so_cv`.
8. GPS: ngoài khung lat 10.3–11.2 / lng 106.3–107.1 → từ chối; độ chính xác > 30 m cảnh báo vàng, > 100 m hoặc không có quyền → gắn `toa_do_tin_cay = false`.
9. Chuẩn hoá: số trụ/tủ chữ HOA, gộp khoảng trắng; chuỗi ≤ 500 ký tự (ghi chú ≤ 2000).

### 2.5 Cảnh báo (ngưỡng chỉnh được trong DanhMuc/CauHinh)
| Mã | Điều kiện | Mức |
|---|---|---|
| `dau_truoc_ct` | `luoi_cs` + `dien_24h` | Đỏ — nghi đấu trước contactor |
| `nguy_hiem` | an toàn nguy hiểm | Đỏ; quá **24 giờ** kể từ `phat_hien_luc` → "quá hạn" |
| `can_kp` | cần khắc phục | Vàng; quá **30 ngày** kể từ `phat_hien_luc` → đỏ |
| `khong_vb` / `sai_vb` | pháp lý | Đỏ / vàng |
| `luoi_khong_ct` | `luoi_cs` + `cong_to = khong` | Vàng |
| `vo_chu` | đơn vị "Chưa xác định chủ" | Vàng |
| `vb_het_han` / `vb_sap_het` | hết hạn / còn ≤ **60 ngày** | Đỏ / vàng |
| `dang_tt_lau` | đang làm thủ tục > **60 ngày** (từ ngày tạo) | Vàng |
| `le_hoi_qua_han` / `le_hoi_sap_thao` | quá ngày tháo ≥ **1 ngày** / còn ≤ **3 ngày** | Đỏ / vàng |
| `bo_hoang` | trạng thái bỏ hoang | Vàng |
| `qua_han_xl` | `han_xu_ly` đã qua mà chưa `da_kp/da_thao/chuyen_cq` (bất kể có cảnh báo khác) | Đỏ |
| `chua_kt_lai` | lần kiểm tra cuối quá **180 ngày** (mức đạt) | Xám |
Cảnh báo vi phạm **đóng** khi `xu_ly ∈ {da_kp, da_thao, chuyen_cq}` hoặc bản ghi đã tháo/xoá. Có nút **"Kiểm tra lại – không đổi"** cập nhật `ngay_kt`, `nguoi_kt` mà không sửa nội dung.

### 2.6 Thống kê (đếm **số vị trí** và **tổng số lượng**, loại trừ đã tháo/đã xoá trừ khi lọc)
Theo quận cũ × nhóm · theo phường · theo đơn vị chủ quản · pháp lý · nguồn · an toàn · tình hình xử lý · **tổng công suất đấu lưới CS theo tủ** · **xếp hạng đơn vị theo số vi phạm** (khong_vb + sai_vb + luoi_khong_ct + dau_truoc_ct + nguy_hiem). Lọc: quận, phường, nhóm, đơn vị, trạng thái, khoảng ngày kiểm tra. Số liệu phải khớp tuyệt đối với test đối chiếu tính tay.

### 2.7 Tiêu chí đạt khác
1. Nhập 1 bản ghi trên điện thoại ≤ 90 s (không tính chụp ảnh); điền sẵn quận/phường/tuyến/tủ từ bản ghi trước.
2. **Offline**: lưu được khi mất mạng (kể cả ảnh) vào hàng chờ IndexedDB; tự gửi lại; không trùng (`client_id`, `photo_client_id`); hiện số bản ghi chờ. Nháp form tự lưu.
3. **Phân quyền** (máy chủ đọc lại vai trò + quận từ sheet mỗi request): `admin` (tất cả + tài khoản, danh mục) · `giamsat` (toàn KVTT, sửa mọi bản ghi, xoá mềm, cập nhật xử lý) · `nhaplieu` (thêm/sửa trong quận được giao, không xoá) · `xem` (chỉ xem).
4. Mọi sửa/xoá ghi **NhatKy** (trường, cũ → mới, ai, lúc nào).
5. Sửa đồng thời: `version`; khác version → báo xung đột, không ghi đè; gửi lại cùng `requestId` đã ghi → trả thành công (`last_request_id`).
6. Trùng: cùng (tủ + số trụ + loại + đơn vị) đang lắp → hỏi xác nhận.
7. **Xuất Excel**: danh sách đang lọc; bảng thống kê; mẫu **"Danh sách đề nghị đơn vị X khắc phục"** để đính kèm công văn.
8. Bản đồ: điểm màu theo mức cảnh báo cao nhất; chạm mở chi tiết.
9. PWA cài được desktop + Android + iOS; offline vào được shell + dữ liệu đã cache.
10. UI hiện đại, sáng/tối, dọc + ngang + 360×640, safe-area, nút quay lại mọi màn phụ, vùng chạm ≥ 48 px, không đè.
11. Góp ý & đánh giá (sao + loại + nội dung, offline, mời 1 lần sau 5 lần lưu).
12. Trường không bắt buộc: chiều cao lắp (m), người liên hệ/SĐT đơn vị, mô tả/model, ghi chú.

### 2.8 Ca xấu phải chịu được
Mất mạng giữa lúc lưu/giữa upload ảnh; phiên hết hạn khi đang nhập (giữ nháp); số lượng 0/âm/thập phân; công suất âm; ngày sai thứ tự; toạ độ ngoài TP; sheet sửa tay sai (bỏ qua dòng + báo, không sập); `nhaplieu` gửi bản ghi quận khác (máy chủ từ chối `FORBIDDEN`); gửi lại cùng `client_id`/`requestId`; ảnh > 600 KB hoặc không phải JPEG/PNG theo magic bytes; payload quá cỡ; action lạ; Apps Script trả HTML; máy chủ bận (`BUSY` → thử lại lùi dần).

### 2.9 Không làm ở v1
Tự học từ chỉnh sửa (không có đề xuất tự động); đơn vị ngoài tự khai; phí thuê trụ/đối soát tiền điện (v2 — NĐ 72 có quy định giá); danh mục trụ chuẩn.

## 3. Kiến trúc
```
[PWA tĩnh – GitHub Pages (HTTPS), CSP meta]  index.html + css + js (không framework)
   │  fetch POST text/plain {action, token, requestId, payload}, redirect:'follow', credentials:'omit'
   ▼  (redirect 302 → script.googleusercontent.com)
[Apps Script Web App] Execute as: Me (tài khoản quản trị của đơn vị, bật 2FA, không dùng TK cá nhân nhân viên) · Access: Anyone · URL /exec version cố định
   doPost: try/catch toàn bộ → luôn {ok, code, data|error}
   ├─ Kiểm e.postData.length: lệnh thường ≤ 64 KB, uploadPhoto ≤ 900 KB; action theo danh sách cho phép
   ├─ Auth: mật khẩu `sha256i$iter$salt$hash` (iter đo thực tế, đăng nhập ≤ 1,5 s, ≥ 5.000)
   │        sai 5 lần/TK → khoá 5 phút; giới hạn tổng ≤ 30 lần đăng nhập/phút (CacheService)
   │        token = base64(uid|tok_ver|exp).HMAC-SHA256 (khoá trong Script Properties), TTL 12 giờ, so chữ ký constant-time
   │        mỗi request đọc TaiKhoan: kiểm tok_ver, khoá, vai trò, quận (tăng tok_ver khi đổi MK/khoá/đổi vai trò → thu hồi phiên)
   ├─ Ghi: getScriptLock().tryLock(10000) → không được trả BUSY (client lùi 1-2-4-8 s + jitter)
   │        trong lock CHỈ: kiểm client_id / version / last_request_id → setValues → tăng dataVersion → flush → releaseLock (≤ 2 s)
   ├─ uploadPhoto: 1 ảnh/lệnh, NGOÀI lock, idempotent photo_client_id, magic bytes FFD8FF/89504E47, ≤ 600 KB sau decode
   │        thư mục Drive riêng tư (FOLDER_ID), KHÔNG chia sẻ link; xem ảnh qua action getPhoto (base64) có kiểm quyền
   │        trigger dọn ảnh mồ côi > 30 ngày; trigger sao lưu Sheet hằng ngày (giữ 30 bản)
   ├─ Đồng bộ: sync(since) trả bản ghi sua_luc > since, kể cả tombstone (xoa=true); tải đủ lần đầu hoặc lệch dataVersion
   └─ Chống chèn công thức: ô chuỗi bắt đầu `= + - @ \t \r ＝ ＋ － ＠` → thêm `'`; cột số ép Number (cả khi xuất SheetJS)
[Google Sheet] ThietBi · TaiKhoan · DanhMuc · CauHinh · NhatKy (xoay vòng theo năm) · GopY   (không chia sẻ cho nhân viên)
```
- Lọc + thống kê + cảnh báo chạy ở client bằng `core.js` (cùng lõi nhúng vào Code.gs).
- Client cache IndexedDB tách theo tài khoản; đăng xuất xoá sạch. Service Worker cache shell, **không cache API**.
- Vendored: Leaflet (nền OSM), SheetJS, icon SVG inline.
- Tiêu chí hiệu năng: delta ≤ 200 KB; tải đầu 10.000 bản ghi ≤ 15 s trên 4G (gửi dạng mảng cột rút gọn).

### 3.1 Cấu trúc mã
```
tbngoai/
  docs/TBNgoai-thiet-ke.md
  src/core.js          lõi thuần: danh mục, chuẩn hoá, validate, cảnh báo, thống kê, trùng, sanitize, token helpers
  gas/Code.src.gs      backend → tools/build.mjs nhúng core → dist/Code.gs
  web/                 PWA: index.html, app.css, app.js, sw.js, manifest.webmanifest, icons/, vendor/
  test/core.test.mjs   unit test lõi (node:test)
  test/gas.test.mjs    backend với SpreadsheetApp/LockService/Utilities giả
  test/ui.spec.py      Playwright: luồng chính + ảnh dọc/ngang/sáng/tối (API giả)
```

### 3.2 Cột sheet ThietBi
`id, client_id, quan, phuong, tuyen, tu, so_tru, so_tru_den, so_tru_qua, lat, lng, gps_acc, toa_do_tin_cay, nhom, loai, don_vi, lien_he, so_luong, mo_ta, chieu_cao_m, phap_ly, loai_vb, ben_cap, so_vb, ngay_vb, han_vb, nguon, diem_dau, dien_24h, cong_to, cb_rieng, cong_suat_w, cs_uoc_tinh, an_toan, van_de, ghi_chu_at, ls_tu, ls_den, trang_thai, ngay_thao, ly_do_thao, xu_ly, so_cv, han_xu_ly, ngay_xu_ly, ngay_kt, nguoi_kt, anh, ghi_chu, tao_luc, tao_boi, sua_luc, sua_boi, xoa, version, last_request_id, phat_hien_luc`

`phat_hien_luc` do máy chủ ghi lúc mức an toàn chuyển sang cần KP/nguy hiểm (giữ nguyên khi sửa/kiểm tra lại cùng mức, xoá khi về Đạt). Trường xử lý (`xu_ly, so_cv, han_xu_ly, ngay_xu_ly`) chỉ giám sát/admin ghi được — máy chủ lấy lại giá trị cũ với vai trò khác. Cột chuỗi/ngày ép định dạng văn bản `@`.

TaiKhoan: `uid, ho_ten, vai_tro, quan (danh sách, ngăn bởi ,), pw, tok_ver, khoa, sai_lan, khoa_den, tao_luc, phai_doi_mk` (mật khẩu tạm → chặn mọi thao tác trừ đổi mật khẩu)

## 3.3 Chuẩn giao diện (chốt UI 16/11/2026 — chuyên gia UX)
Khung **A** (danh sách hiện trường, tab đáy, nút + lớn) + tab **Thống kê** theo bố cục **B** (KPI, thanh theo nhóm, "Cần xử lý"; ≥1024 px chia 2–3 cột; `giamsat`/`xem` mở vào thẳng tab này) + tab **Bản đồ** theo **C** (bản đồ + ngăn kéo). Mockup `ui/mock.html`, ảnh `UI-A/B/C/form.png`.
- Màu sáng: brand `#0b3b6f`, accent icon `#0e7490`, chữ phụ `#475569` (≥ 14 px), viền điều khiển `#94a3b8` (≥ 3:1); cam chữ nhỏ `#b45309`. Tối: brand `#4f9be8`, đỏ `#f87171`, viền `#64748b`. Font Be Vietnam Pro/Inter, chữ nội dung ≥ 16 px, nhãn trạng thái ≥ 13 px.
- Vùng chạm ≥ 48 px (chip, nút GPS, nút chọn); tab đáy ≥ 56 px; khoảng cách nút ≥ 8 px. Nút chọn đã chọn: **nền đặc + ✓ + chữ trắng**; "Nguy hiểm" nền đỏ đặc. Nhóm/lựa chọn xếp 2 cột, nhãn viết đủ (không "Cần KP", "Lưới CS"…).
- Danh sách chừa đáy ≥ 160 px + safe-area; Lưu ở màn dọc nằm trong thanh đáy có nền; màn ngang đặt Lưu ở góc phải header. Bản đồ ngang: cụm nổi `right: 44%`.
- Điểm bản đồ có viền + **hình dạng** theo mức (tam giác nguy hiểm, vuông cần KP/vàng, tròn đạt).
- Thứ tự form: GPS + quận/phường tự nhận → tuyến → tủ → số trụ → nhóm → loại → đơn vị → số lượng (−/+) → **An toàn** (vấn đề) → ảnh → **Nguồn** (chi tiết khi lưới CS) → **Pháp lý** (chi tiết khi có VB) → lễ hội từ–đến → trạng thái/xử lý → ghi chú. Mỗi thẻ danh sách hiện 1 nhãn cảnh báo nặng nhất kèm icon. Header hiện số bản ghi chờ gửi.

## 4. Kế hoạch
| Đợt | Nội dung | Kiểm chứng |
|---|---|---|
| 0 | Tiêu chí + thiết kế → chuyên gia nghiệp vụ & kỹ thuật | ✅ duyệt có điều kiện, đã áp |
| 1 | Chốt UI: 3 phương án → chuyên gia UX | ảnh mockup |
| 2 | Test lõi (TDD) → `core.js` | `node --test` |
| 3 | Backend `Code.gs` + test giả lập | `node --test` |
| 4 | PWA đầy đủ | Playwright |
| 5 | Review độc lập → kiểm chứng QA + nghiệp vụ | báo cáo + ảnh |
| 6 | Hướng dẫn cài đặt, đo thật trên Apps Script (iter băm, cỡ POST, thời gian lock), lưu Project + kho máy | |

## 5. Rủi ro
- **Chưa xác minh** (đo trên deployment thật ở Đợt 6): giới hạn cỡ POST/response web app; tốc độ `computeDigest`; quota 30 lượt đồng thời có tính chung cho chủ script khi Execute as Me.
- Ngưỡng cảnh báo (24 giờ/30/60/180 ngày, nhắc lễ hội 3 ngày) là **đề xuất theo thực tiễn vận hành**, cần Phòng Kỹ thuật xác nhận; để trong CauHinh.
- Chưa xác minh nội dung QCVN 07-7:2016/BXD về treo thiết bị (tĩnh không, tải trọng), quy định riêng UBND TP.HCM, hiệu lực TTLT 15/2016/TTLT-BTTTT-BXD.
- Sheet không có transaction → lock ngắn + idempotent + version.
- iOS PWA có thể bị đóng nền → hàng chờ + nháp trong IndexedDB.

## Nhật ký duyệt
| Ngày | Chốt | Chuyên gia | Quyết định | Thay đổi bắt buộc đã áp |
|---|---|---|---|---|
| 16/11/2026 | Bước 0 | Nghiệp vụ chiếu sáng công cộng | DUYỆT CÓ ĐIỀU KIỆN | Phường mới theo danh mục; thêm 5 nhóm (loa, biển báo, quảng cáo, tủ/hộp điện, khác) + Cờ/phướn + Camera an ninh; "Chưa xác định chủ" + liên hệ; pháp lý `sai_vb`, loại VB, bên cấp, bắt buộc số/ngày VB, ảnh chứng cứ; nguồn: điểm đấu, điện 24h (cảnh báo đấu trước contactor), công tơ 3 loại, CB riêng; 13 vấn đề an toàn, `ro_dien` → nguy hiểm; vòng xử lý (xu_ly, hạn, ngày); `bo_hoang`, ngày + lý do tháo; ngưỡng 60 ngày/24 giờ/30/180, đang TT > 60 ngày, lễ hội 3 ngày/1 ngày; tuyến qua nhiều trụ ghi 1 bản ghi. Nhận cả góp ý NÊN: công suất theo tủ, xếp hạng vi phạm, chiều cao, "kiểm tra lại – không đổi", mẫu Excel đề nghị khắc phục. Phí thuê trụ để v2. |
| 16/11/2026 | Bước 0 | Kỹ thuật & bảo mật Apps Script | DUYỆT CÓ ĐIỀU KIỆN | tryLock 10 s + BUSY + lùi dần, lock ≤ 2 s; ảnh tách lệnh riêng ngoài lock, magic bytes, thư mục riêng tư, getPhoto, dọn mồ côi; token có tok_ver, đọc lại vai trò mỗi request, so constant-time; băm `algo$iter$salt$hash` + giới hạn tổng/phút; đồng bộ delta + tombstone; last_request_id; chặn thêm tab/CR/ký tự toàn khổ, ép kiểu số; giới hạn cỡ payload + danh sách action. Nhận góp ý NÊN: CSP meta, sao lưu hằng ngày, NhatKy xoay vòng, /exec version cố định, TK chủ của đơn vị. |
| 16/11/2026 | Chốt UI | UX/UI hiện trường | Chọn A + ghép B (Thống kê) + C (Bản đồ) | Sửa đè (đáy danh sách, Lưu, bản đồ ngang); tương phản AA (chữ phụ, viền 3:1, icon, cam, đỏ tối); vùng chạm 48/56 px; trạng thái chọn nền đặc + ✓; thứ tự form an toàn trước pháp lý + đủ trường; nhãn viết đủ; điểm bản đồ có hình dạng. Nhận NÊN: số chờ gửi trên header, 1 nhãn nặng nhất/thẻ, ô ảnh ≥ 96 px, Xuất Excel trên Thống kê. |
| 16/11/2026 | Bước 4 – review mã (vòng 1) | Review mã độc lập | KHÔNG DUYỆT | Chặn nhập liệu sửa trường xử lý; ép định dạng văn bản `@` + đọc ô ngày theo giờ VN; thêm `phat_hien_luc` (kiểm tra lại không làm mới hạn), chặn ngày tương lai; ngưỡng nguy hiểm theo giờ; `qua_han_xl` đúng điều kiện; băm mật khẩu ngoài lock + băm đủ vòng khi TK không tồn tại. Nhận NÊN: NhatKy ghi 1 lần, lặp gửi hàng chờ, sync không ghi đè bản mới, cảnh báo khi đổi người còn hàng chờ, ép đổi mật khẩu tạm ở máy chủ, admin không tự hạ quyền, requestId bắt buộc cho xoá/kiểm tra lại, dọn ảnh 30 ngày, lọc phường/trạng thái, SW chỉ cache phản hồi tốt. |
| 16/11/2026 | Bước 4 – review mã (vòng 2) | Review mã độc lập | DUYỆT CÓ ĐIỀU KIỆN → đã đạt | `MUST_CHANGE` không làm hỏng hàng chờ, chỉ 1 hộp đổi mật khẩu, đổi xong tự gửi (có test giao diện). |
| 16/11/2026 | Bước 5 – kiểm chứng | Nghiệp vụ chiếu sáng | DUYỆT CÓ ĐIỀU KIỆN (tính tay khớp 100% thống kê) | Cảnh báo an toàn (nguy hiểm, cần KP, đấu trước contactor) chỉ hết khi điều kiện hết — không đóng bằng xử lý; an toàn xấu đi → máy chủ mở lại vòng xử lý; "đã thông báo" bắt buộc hạn xử lý; mẫu Đề nghị khắc phục đủ tồn tại (thêm cần KP, lễ hội quá hạn, VB hết hạn, bỏ hoang) + yêu cầu cụ thể theo từng vấn đề, có mã bản ghi, ngày phát hiện, hạn hoàn thành, ngày CV để trống, định dạng in (đậm, khung, A4 ngang, lặp tiêu đề, khối ký); Excel thống kê thêm phường, đơn vị, xử lý (đủ 8 quận × 10 nhóm); màn hình thêm bảng đơn vị. Nhận NÊN: công suất gom theo quận + tủ, xếp hạng vi phạm tính cả cần KP + lễ hội quá hạn, nhãn viết đủ, ngày VB không sau hôm nay, Excel danh sách thêm cột. Chưa làm (v1.1): cảnh báo GPS lệch phường (cần ranh giới phường), cập nhật hàng loạt "đã thông báo" sau khi xuất đề nghị, bắt buộc ảnh sau khắc phục. |
| 16/11/2026 | Bước 5 – kiểm chứng | QA độc lập | DUYỆT CÓ ĐIỀU KIỆN | Chặn giá trị liệt kê là khoá kế thừa (`constructor`, `__proto__`…) ở client + máy chủ; đồng bộ loại dòng Sheet sửa tay sai (đếm `bad_rows`). Nhận NÊN: nhớ 5 requestId gần nhất (gửi lại sau khi người khác sửa vẫn thành công), lỗi máy chủ lặp 3 lần → chuyển "lỗi" không chặn hàng chờ, báo lỗi máy chủ ngay sau 1 lần thử lại, so trùng bỏ khoảng trắng, tuyến cáp bắt buộc số trụ qua, độ dài tính theo ký tự. |

## Kết quả kiểm chứng v1.0.0
- `npm test`: **66/66** (lõi 38 + máy chủ giả lập 28). `node test/ui.e2e.mjs`: **34/34** (Chromium thật nối máy chủ giả lập; ảnh dọc/ngang/360×640 × sáng/tối; offline; PWA; Excel).
- Chưa thử trên hệ thống thật: Apps Script/Sheet/Drive thật (cỡ POST, tốc độ băm, thời gian lock, trigger), điện thoại thật (GPS, camera, cài PWA iOS/Android, iOS đóng nền), tải 10.000 bản ghi trên 4G. Ngưỡng cảnh báo cần Phòng Kỹ thuật xác nhận.
