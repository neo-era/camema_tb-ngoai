# TBNgoài — Hướng dẫn triển khai & vận hành

Phiên bản 1.0.8 · 16/11/2026

## 1. Thành phần
| Phần | Ở đâu | Ghi chú |
|---|---|---|
| Giao diện PWA | Thư mục `web/` → GitHub Pages (HTTPS) | Không chứa bí mật |
| Máy chủ | `dist/Code.gs` → Apps Script gắn với 1 Google Sheet | Execute as: **Me**, Who has access: **Anyone** |
| Dữ liệu | Google Sheet: ThietBi, TaiKhoan, CauHinh, NhatKy, GopY, Anh | **Không chia sẻ** Sheet cho nhân viên |
| Ảnh | Thư mục Drive "TBNgoai - Ảnh hiện trường" (riêng tư) | Xem ảnh qua app |
| Sao lưu | Thư mục Drive "TBNgoai - Sao lưu" | Tự chạy 1 giờ sáng, giữ 30 bản; ảnh không gắn bản ghi nào quá 30 ngày thì tự dọn |

Tài khoản chủ script: dùng **tài khoản Google của đơn vị** (bật xác minh 2 bước), không dùng tài khoản cá nhân của nhân viên.

## 2. Cài máy chủ (15 phút)
1. Tạo Google Sheet mới, đặt tên `TBNgoai - Du lieu`.
2. Trong Sheet, chọn **Tiện ích mở rộng → Apps Script**. Xoá nội dung `Code.gs`, dán toàn bộ file `dist/Code.gs` vào, rồi bấm **Lưu**.
3. Chọn hàm `setup` → **Chạy** → cấp quyền khi được hỏi. Mở **Nhật ký thực thi** để lấy dòng `Tài khoản: admin — Mật khẩu tạm: …`.
4. Chọn hàm `benchmarkHash` → **Chạy**. Hàm này tự đặt số vòng băm mật khẩu sao cho mỗi lần đăng nhập mất khoảng 1 giây.
5. Chọn **Triển khai → Triển khai mới → Ứng dụng web**:
   - Thực thi dưới dạng: **Tôi**
   - Người có quyền truy cập: **Bất kỳ ai**
   - Bấm **Triển khai**, sau đó sao chép URL kết thúc bằng `/exec`.
6. Mở URL đó trên trình duyệt. Nếu thấy `{"ok":true,…"app":"TBNgoai"}` là máy chủ đã chạy.

> **Cập nhật code lần sau:** vào **Triển khai → Quản lý bản triển khai → ✏️ → Phiên bản mới**. Cách này giữ nguyên URL. Không dùng URL `/dev`.

## 3. Đưa giao diện lên GitHub Pages
Repo: **github.com/neo-era/camema_tb-ngoai**
- Nhánh `main`: toàn bộ mã nguồn (src, gas, dist, web, test, docs).
- Nhánh `gh-pages`: chỉ chứa thư mục `web/`, dùng để chạy app.

1. Vào **Settings → Pages → Build and deployment → Deploy from a branch**, chọn nhánh **gh-pages**, thư mục **/(root)**, rồi bấm **Save**. Địa chỉ app: `https://neo-era.github.io/camema_tb-ngoai/`.
2. Sửa `web/config.js` để dán URL `/exec` vào `SCRIPT_URL`. Nếu để trống, người dùng phải tự dán URL này ở màn đăng nhập. `KY_GIAM_DOC` là tên in ở khối ký trong file Excel.
3. Mỗi lần cập nhật giao diện, chạy trong thư mục repo:
   ```
   git add -A && git commit -m "..." && git push
   git subtree push --prefix web origin gh-pages
   ```
   Bản sao repo trên máy nằm ở `Kho_Software_Driver\TBNgoai\repo-tb-ngoai`.

## 4. Tạo tài khoản
1. Đăng nhập bằng `admin` và mật khẩu tạm, rồi đổi mật khẩu ngay.
2. Vào **Khác → Quản lý tài khoản → +** (tài khoản dùng mật khẩu tạm bị chặn mọi thao tác cho tới khi đổi mật khẩu), tạo tài khoản cho từng người:
   - **Nhập liệu**: tổ/xí nghiệp. Phải chọn quận được giao; người này chỉ thêm/sửa được bản ghi trong các quận đó.
   - **Giám sát**: phòng Kỹ thuật/An toàn. Xem và sửa toàn KVTT, xoá, cập nhật xử lý.
   - **Chỉ xem**: lãnh đạo, xem thống kê.
3. Mật khẩu tạm chỉ hiện **một lần**. Sao chép và gửi riêng cho từng người. Lần đăng nhập đầu, người dùng sẽ được yêu cầu đổi mật khẩu.
4. Khi khoá tài khoản, đổi vai trò hoặc đổi quận, phiên đăng nhập cũ của người đó tự hết hiệu lực.

## 5. Cài app lên máy
- **Android / Chrome / Edge trên máy tính:** mở link → bấm **Cài đặt** (hoặc menu → Cài đặt ứng dụng).
- **iPhone / iPad:** mở bằng Safari → **Chia sẻ → Thêm vào MH chính**.

## 6. Chỉnh ngưỡng cảnh báo
Sửa cột `gia_tri` trong sheet **CauHinh**. App tự áp dụng ở lần đồng bộ sau.
| khoa | Mặc định | Ý nghĩa |
|---|---|---|
| vb_nhac_ngay | 60 | Nhắc văn bản sắp hết hạn |
| nguy_hiem_gio | 24 | Mức Nguy hiểm phải xử lý trong (giờ, tính từ lúc phát hiện) |
| can_kp_ngay | 30 | Cần khắc phục quá số ngày này (tính từ lúc phát hiện) thì chuyển đỏ |
| dat_kt_ngay | 180 | Bản ghi mức Đạt cần kiểm tra lại sau |
| dang_tt_ngay | 60 | Đang làm thủ tục quá số ngày này thì cảnh báo |
| le_hoi_nhac_ngay | 3 | Nhắc trước ngày tháo đèn lễ hội |
| le_hoi_qua_ngay | 1 | Quá ngày tháo thì cảnh báo đỏ |

> Các con số trên là **đề xuất theo thực tiễn vận hành**, cần Phòng Kỹ thuật xác nhận.

## 7. Vận hành hằng ngày
- **Tổ hiện trường:**
  - Bấm **+**. GPS tự lấy.
  - Nhập theo thứ tự: quận/phường → tuyến/tủ/trụ → nhóm/loại → đơn vị → **An toàn** (kèm ảnh) → **Nguồn** → **Pháp lý** → Lưu.
  - Khi mất mạng vẫn lưu được; app tự gửi khi có mạng (góc trên hiện "n chờ gửi").
- **Phân quyền xử lý:** chỉ Giám sát/Quản trị cập nhật được "Tình hình xử lý" (Nhập liệu không tự đóng cảnh báo được). Hạn xử lý an toàn tính từ **lúc phát hiện**; bấm "Kiểm tra lại – không đổi" không làm mới hạn.
- **Giám sát:**
  - Mở tab **Thống kê** và xử lý mục **Cần xử lý**.
  - Mở bản ghi → **Sửa / cập nhật xử lý**: đã thông báo (số công văn, hạn), đã khắc phục, đã tháo, đã chuyển cơ quan chức năng.
  - Cảnh báo tự đóng khi đã xử lý xong.
- **Gửi công văn hàng loạt:** vào **Thống kê → Xếp hạng vi phạm → Đề nghị KP** để xuất Excel danh sách vi phạm của từng đơn vị, đính kèm công văn.
- **Tuyến cáp hoặc đèn dây chạy qua nhiều trụ:** chỉ ghi **1 bản ghi**, gồm trụ đầu, trụ cuối và số trụ đi qua.
- **Góp ý của người dùng:** xem trong sheet **GopY**. Xử lý xong thì đổi cột `status` thành `da_xu_ly` và ghi cách xử lý vào `note`.

## 8. Đang chạy thật (16/11/2026)
- App: https://neo-era.github.io/camema_tb-ngoai/ — repo `neo-era/camema_tb-ngoai`.
- Máy chủ: Apps Script "TBNgoai - May chu", gắn với Sheet "TBNgoai - Du lieu" (tài khoản maivulam2020@gmail.com). Bản triển khai Web App là phiên bản 2 (v1.0.4); URL `/exec` giữ cố định và đã điền sẵn trong `web/config.js`.
- **Quên mật khẩu admin:** mở trình soạn thảo Apps Script, chọn hàm `capLaiMatKhauAdmin`, bấm **Run**. Mật khẩu tạm hiện trong Execution log.
- **Cập nhật máy chủ:** dán `dist/Code.gs` vào trình soạn thảo, bấm Lưu, rồi vào **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**.

## 9. Ảnh thiết bị & bản đồ
- **Ảnh:**
  - Mỗi bản ghi chụp hoặc chọn tối đa 5 ảnh.
  - App đóng dấu lên ảnh: thời gian, tọa độ (kèm sai số), người cập nhật, trụ/tủ/tuyến.
  - Ảnh lưu ở thư mục Drive riêng tư **"TBNgoai - Ảnh hiện trường"**, chia thư mục con theo tháng (ví dụ `2026-11`). Tên file dạng `TB_yyyyMMdd_HHmmss_<người>_….jpg`; phần mô tả file ghi thời gian, tọa độ, người cập nhật.
  - Sheet **Anh** lưu: thời gian chụp, tọa độ, sai số, tên file, thư mục.
- **Bản đồ:**
  - Nút ☰ ở góc phải để chọn lớp nền: Đường phố (Esri, mặc định), Vệ tinh (Esri) hoặc OpenStreetMap. Lớp nào lỗi liên tục thì app tự chuyển sang lớp khác.
  - Mạng văn phòng hiện không kết nối được tới openstreetmap.org, nên mặc định dùng Esri.
- **Thêm thiết bị trên bản đồ:**
  - Bấm **+** trên bản đồ → kéo bản đồ cho tâm ngắm trùng vị trí trụ → **Thêm tại đây**. Phải phóng to từ mức 16 trở lên.
  - Trên máy tính có thể bấm chuột phải ngay vào vị trí.

## 9b. Tự điền Tuyến đường / Tủ / Số trụ (từ 1.0.8)
- **Theo vị trí** (khi thêm mới, sau khi lấy GPS hoặc chọn trên bản đồ):
  - Có thiết bị đã nhập cách ≤ 12 m (coi là cùng trụ) → điền tuyến, tủ, **số trụ**, quận/phường.
  - Cách 12–60 m → điền tuyến, tủ, quận/phường (không điền số trụ).
  - Không có thiết bị gần → tra tên đường trên bản đồ Esri (bỏ số nhà, chữ "Đường").
- **Khi gõ:** ô Tuyến/Tủ/Số trụ có danh sách gợi ý từ dữ liệu đã có (tuyến ưu tiên cùng quận, tủ ưu tiên cùng tuyến, số trụ là các trụ đã có thiết bị của tủ đó). Gõ tủ đã biết → tự điền tuyến, quận/phường; chọn tuyến chỉ có 1 tủ → tự điền tủ.
- Chỉ ghi vào ô trống hoặc ô máy đã tự điền, **không đè ô người dùng đã gõ**. Dòng ghi chú cho biết nguồn; nút **Bỏ tự điền** xoá các ô tự điền.
- Sửa bản ghi: không tự điền khi mở; bấm "Lấy lại" GPS thì chỉ điền ô đang trống.
- Máy chủ không đổi (không cần triển khai lại Apps Script).

## 10. Kiểm thử (dành cho người phát triển)
```
npm test                 # build + 79 test lõi & máy chủ (giả lập Apps Script)
node test/ui.e2e.mjs     # 40 kiểm tra giao diện Chromium, ảnh ở test/shots/
```
Lõi nghiệp vụ `src/core.js` được nhúng vào cả `dist/Code.gs` lẫn `web/js/core.js` qua `tools/build.mjs`. Chỉ sửa ở `src/`, sau đó chạy `npm run build`.

## 11. Chưa kiểm trên hệ thống thật (cần anh thử khi triển khai)
- Apps Script, Drive và Sheet thật: thời gian đăng nhập sau `benchmarkHash`; giới hạn kích thước gửi ảnh (~800 KB); thời gian giữ lock khi Sheet có hàng nghìn dòng.
- Điện thoại thật: GPS ngoài trời, chụp ảnh bằng camera, cài PWA trên iPhone (Safari) và Android, chạy offline ngoài hiện trường.
