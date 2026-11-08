# Aura Health — Hệ thống đặt lịch khám bệnh

Ứng dụng web đặt lịch khám sức khỏe, bao gồm trang khách hàng để đặt lịch với bác sĩ và bảng điều khiển quản trị để quản lý lịch hẹn, đổi lịch, xem thống kê và quản lý danh sách bác sĩ.

---

## Tính năng

**Khách hàng**
- Xem danh sách bác sĩ và chuyên khoa (lấy từ cơ sở dữ liệu)
- Chọn bác sĩ → chọn ngày → chọn khung giờ trống (backend tính từ lịch làm việc của bác sĩ; giờ đã qua được ẩn, giờ đã có người đặt bị gạch)
- Điền thông tin và xác nhận lịch hẹn (backend kiểm tra lại giờ làm việc và chỗ trống, chống đặt trùng)

**Quản trị viên**
- Đăng nhập bằng tài khoản nhân viên (JWT)
- Xem toàn bộ lịch hẹn, mở rộng từng dòng để xem chi tiết
- Cập nhật trạng thái lịch hẹn: Chờ xác nhận / Đã xác nhận / Đã hủy
- **Đổi lịch hẹn**: đổi ngày/giờ khám cho lịch chưa diễn ra (giữ nguyên bác sĩ, khách, trạng thái)
- **Thống kê**: tổng số lịch, số lịch theo trạng thái và biểu đồ cột theo ngày hẹn khám
- Thêm, sửa, xóa bác sĩ
- Quản lý khung giờ làm việc của từng bác sĩ theo thứ trong tuần

---

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, Axios |
| Backend | Spring Boot 3.3, Java 21, Spring Security (JWT), JPA/Hibernate |
| Cơ sở dữ liệu | PostgreSQL + Flyway (migration tự động) |
| Kiểm thử | JUnit 5, Spring Boot Test, MockMvc, H2 (chỉ dùng khi chạy test) |

---

## Yêu cầu cài đặt

- Node.js 20+
- Java 21
- Maven 3.9+
- PostgreSQL 15+

---

## Cài đặt & Chạy

### 1. Cơ sở dữ liệu

Tạo database PostgreSQL:

```sql
CREATE DATABASE healthbooking;
```

> Flyway sẽ tự động tạo bảng và nạp dữ liệu mẫu khi backend khởi động lần đầu.

---

### 2. Backend

Tạo file cấu hình local (file này bị gitignore, không được commit):

```bash
cp backend/src/main/resources/application-local.yml.example \
   backend/src/main/resources/application-local.yml
```

Chỉnh sửa `application-local.yml` với thông tin kết nối thực tế của bạn:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/healthbooking
    username: postgres
    password: your_password

app:
  jwt:
    secret: local-dev-secret-key-change-in-production
```

> `application.yml` chứa cấu hình chung dùng cho mọi môi trường — mật khẩu và secret key **không được** lưu trực tiếp vào file đó.

Khởi chạy backend với profile `local`:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Backend chạy tại: `http://localhost:8080`. Đợi đến khi log hiện `Started HealthBookingApplication` rồi mới đăng nhập.

**Tài khoản admin mặc định** (được seed sẵn):

| Tên đăng nhập | Mật khẩu |
|---|---|
| `admin` | `admin123` |

---

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại: `http://localhost:5173` — trang quản trị: `http://localhost:5173/admin/login`.

> ⚠️ Backend chỉ chấp nhận CORS từ đúng địa chỉ `http://localhost:5173`. Nếu Vite báo đang chạy ở cổng khác (ví dụ `5174` vì 5173 đang bị chiếm) hoặc bạn mở bằng `127.0.0.1`, mọi request sẽ bị từ chối với lỗi **"Invalid CORS request"**. Xem mục [Xử lý sự cố](#xử-lý-sự-cố).

---

### 4. Chạy nhanh bằng script

Ở thư mục gốc dự án:

| Hệ điều hành | Backend (profile `local`) | Frontend |
|---|---|---|
| Windows | `start-backend.bat` | `start-frontend.bat` |
| Linux / macOS | `./start-backend.sh` | `./start-frontend.sh` |

> Script backend cần file `application-local.yml` (bước 2). Trên Windows, chạy `npm install` trong `frontend/` một lần trước khi dùng `start-frontend.bat` (script `.sh` tự cài nếu chưa có `node_modules`).

---

## Cấu hình ứng dụng

Các tùy chọn nghiệp vụ trong `backend/src/main/resources/application.yml`:

| Khóa | Mặc định | Ý nghĩa |
|---|---|---|
| `app.timezone` | `Asia/Ho_Chi_Minh` | Múi giờ dùng để xác định "hôm nay", "bây giờ" và hiểu ngày/giờ hẹn khám |
| `app.booking.slot-capacity` | `1` | Số lịch **chưa hủy** tối đa trong một khung giờ 30 phút của một bác sĩ |
| `app.jwt.expiration-ms` | `86400000` | Thời hạn token đăng nhập (24 giờ) |

---

## Hướng dẫn sử dụng

### Đổi lịch hẹn (nhân viên)

1. Đăng nhập trang quản trị → tab **Lịch hẹn**.
2. Bấm **Đổi lịch** ở cột *Thao tác* của lịch hẹn cần đổi.
3. Chọn **Ngày khám mới** → hệ thống hiển thị các khung giờ còn trống của bác sĩ (giờ đã có người đặt bị gạch, giờ hiện tại có nhãn *"Hiện tại"*).
4. Chọn giờ mới, kiểm tra khối **Lịch cũ → Lịch mới**, bấm **Xác nhận đổi lịch**.
5. Thành công: danh sách được cập nhật và có thông báo. Thất bại (ví dụ giờ vừa bị người khác đặt): hộp thoại giữ nguyên và hiển thị lý do — chọn giờ khác rồi xác nhận lại.

Quy tắc:
- Chỉ đổi được lịch **Chờ xác nhận** hoặc **Đã xác nhận** và **chưa đến giờ khám** — nếu không, nút *Đổi lịch* không hiển thị.
- Chỉ đổi ngày và giờ; giữ nguyên mã lịch, bác sĩ, thông tin khách và trạng thái.
- Giờ mới phải ở tương lai, nằm trong lịch làm việc của bác sĩ và còn chỗ. Backend kiểm tra lại toàn bộ khi lưu, không dựa vào danh sách giờ đã hiển thị.
- Chọn lại đúng ngày/giờ hiện tại thì không có thay đổi.
- Khách hàng chưa thể tự đổi lịch.

### Thống kê lịch hẹn

1. Trang quản trị → tab **Thống kê** (mặc định từ đầu tháng hiện tại đến hôm nay).
2. Chọn **Từ ngày – Đến ngày** (tối đa 90 ngày) → **Xem thống kê**. Nút **Tháng này** đưa về khoảng mặc định.
3. Xem tổng số lịch, số lịch theo từng trạng thái và biểu đồ số lịch theo ngày. Rê chuột lên cột để xem chi tiết; **Xem dạng bảng** để xem số liệu từng ngày.

Cách tính:
- Theo **ngày hẹn khám** (không phải ngày tạo), bao gồm trọn ngày đầu và ngày cuối.
- Tổng và biểu đồ tính **mọi trạng thái, kể cả đã hủy**; tổng = Chờ xác nhận + Đã xác nhận + Đã hủy.
- Ngày không có lịch hiển thị 0. Lịch đã đổi được tính vào ngày hẹn mới.

### Chống đặt trùng

Đặt lịch mới và đổi lịch dùng chung một cơ chế: trong cùng một giao dịch, backend khóa bản ghi bác sĩ (`SELECT … FOR UPDATE`), đếm số lịch chưa hủy tại khung giờ đó rồi mới ghi. Hai yêu cầu tranh cùng một giờ sẽ được xử lý lần lượt; yêu cầu sau nhận lỗi *"đã hết chỗ"* thay vì vượt sức chứa.

---

## Kiểm thử

```bash
cd backend
mvn test
```

Test tích hợp chạy trên cơ sở dữ liệu H2 trong bộ nhớ (chế độ PostgreSQL) với các migration Flyway thật — **không cần cài PostgreSQL**. Bao gồm: đổi lịch (thành công, trạng thái không hợp lệ, giờ quá khứ, ngoài giờ làm việc, hết chỗ, yêu cầu đồng thời, phân quyền) và thống kê (đếm theo trạng thái, ngày biên, ngày bằng 0, khoảng không hợp lệ, phân quyền).

Frontend:

```bash
cd frontend
npm run build   # kiểm tra kiểu TypeScript + build
npm run lint
```

---

## Xử lý sự cố

| Hiện tượng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Đăng nhập báo *"Tên đăng nhập hoặc mật khẩu không đúng"* dù nhập đúng | Trang đăng nhập hiển thị thông báo này cho **mọi** lỗi, kể cả khi backend chưa chạy | Mở DevTools → Network, xem `POST /api/auth/login`: `401` là sai mật khẩu; `403`, `500`, `502`, `504` là lỗi kết nối/cấu hình |
| `403` với nội dung **"Invalid CORS request"** | Frontend không chạy ở `http://localhost:5173` (Vite tự chuyển sang `5174`…, hoặc mở bằng `127.0.0.1`) | Tắt tiến trình đang chiếm cổng 5173, chạy lại `npm run dev` và mở đúng `http://localhost:5173` |
| Backend không khởi động: *Port 8080 was already in use* | Còn một backend khác đang chạy | Windows: `netstat -ano \| findstr :8080` để tìm PID, rồi tắt tiến trình đó |
| Không thấy nút **Đổi lịch** | Lịch đã hủy hoặc đã qua giờ khám | Chỉ lịch Chờ xác nhận / Đã xác nhận ở tương lai mới đổi được |
| Không có khung giờ nào khi chọn ngày | Bác sĩ không làm việc ngày đó, hoặc các giờ trong ngày đã qua | Chọn ngày khác hoặc thêm khung giờ làm việc ở tab **Bác sĩ** |

---

## Cấu trúc thư mục

```
health-booking/
├── backend/                        # Spring Boot API
│   └── src/
│       ├── main/
│       │   ├── java/com/healthbooking/
│       │   │   ├── controller/     # REST controllers
│       │   │   ├── model/          # JPA entities
│       │   │   ├── service/        # Business logic (SlotService: tính khung giờ & chỗ trống)
│       │   │   ├── repository/     # Spring Data repos
│       │   │   ├── dto/            # Request/Response DTOs
│       │   │   ├── exception/      # Lỗi nghiệp vụ (BusinessException)
│       │   │   ├── security/       # JWT filter & config
│       │   │   └── config/         # Security, CORS, múi giờ, xử lý lỗi
│       │   └── resources/
│       │       ├── application.yml
│       │       └── db/migration/   # Flyway SQL scripts
│       └── test/                   # Integration test (H2)
├── frontend/                       # React + Vite
│   └── src/
│       ├── pages/
│       │   ├── Landing/            # Trang khách hàng (Hero + Booking)
│       │   └── Admin/              # Bảng quản trị (Lịch hẹn, Đổi lịch, Thống kê, Bác sĩ)
│       ├── components/             # Navbar, Footer, UI
│       ├── services/               # Axios API calls
│       ├── store/                  # Zustand auth store
│       ├── types/                  # TypeScript interfaces
│       └── utils/                  # Ngày giờ theo múi giờ ứng dụng, xử lý lỗi API
└── docs/changes/                   # Báo cáo thay đổi (đổi lịch & thống kê)
```

---

## API chính

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/api/doctors` | Danh sách bác sĩ | Public |
| GET | `/api/doctors/{id}/availability` | Lịch làm việc bác sĩ | Public |
| GET | `/api/doctors/{id}/slots?date=yyyy-MM-dd` | Khung giờ chưa qua trong ngày và số chỗ còn lại | Public |
| POST | `/api/appointments` | Tạo lịch hẹn | Public |
| POST | `/api/auth/login` | Đăng nhập admin | Public |
| GET | `/api/admin/appointments` | Toàn bộ lịch hẹn | Admin |
| PATCH | `/api/admin/appointments/{id}/status` | Cập nhật trạng thái | Admin |
| PATCH | `/api/admin/appointments/{id}/schedule` | Đổi ngày/giờ khám — body `{ "appointmentDate": "2026-11-16", "appointmentTime": "10:30" }` | Admin |
| GET | `/api/admin/appointments/stats?from=&to=` | Thống kê theo ngày hẹn khám (mặc định đầu tháng → hôm nay, tối đa 90 ngày) | Admin |
| POST | `/api/admin/doctors` | Thêm bác sĩ | Admin |
| PUT | `/api/admin/doctors/{id}` | Sửa bác sĩ | Admin |
| DELETE | `/api/admin/doctors/{id}` | Xóa bác sĩ | Admin |
| POST | `/api/admin/doctors/{id}/availability` | Thêm khung giờ | Admin |
| DELETE | `/api/admin/doctors/{id}/availability/{aid}` | Xóa khung giờ | Admin |

Lỗi nghiệp vụ trả về dạng `{ "error": "<thông điệp tiếng Việt>", "code": "<MÃ_LỖI>" }`, ví dụ:

| Mã lỗi | HTTP | Ý nghĩa |
|---|---|---|
| `SLOT_FULL` | 409 | Khung giờ đã hết chỗ (có thể vừa bị người khác đặt) |
| `SLOT_IN_PAST` | 400 | Thời điểm đã qua |
| `OUTSIDE_WORKING_HOURS` | 400 | Ngoài lịch làm việc của bác sĩ |
| `STATUS_NOT_RESCHEDULABLE` | 409 | Lịch không ở trạng thái Chờ xác nhận / Đã xác nhận |
| `APPOINTMENT_STARTED` | 409 | Lịch đã đến hoặc đã qua giờ khám |
| `INVALID_RANGE` / `RANGE_TOO_LONG` | 400 | Khoảng ngày thống kê không hợp lệ / quá 90 ngày |

Chi tiết thay đổi, quy tắc nghiệp vụ và kết quả kiểm thử: [docs/changes/doi-lich-va-thong-ke.md](docs/changes/doi-lich-va-thong-ke.md).
