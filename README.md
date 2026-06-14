# Aura Health — Hệ thống đặt lịch khám bệnh

Ứng dụng web đặt lịch khám sức khỏe, bao gồm trang khách hàng để đặt lịch với bác sĩ và bảng điều khiển quản trị để quản lý lịch hẹn và danh sách bác sĩ.

---

## Tính năng

**Khách hàng**
- Xem danh sách bác sĩ và chuyên khoa (lấy từ cơ sở dữ liệu)
- Chọn bác sĩ → chọn ngày → chọn khung giờ trống (tự động tính từ lịch làm việc của bác sĩ)
- Điền thông tin và xác nhận lịch hẹn

**Quản trị viên**
- Đăng nhập bằng tài khoản nhân viên (JWT)
- Xem toàn bộ lịch hẹn, mở rộng từng dòng để xem chi tiết
- Cập nhật trạng thái lịch hẹn: Chờ xác nhận / Đã xác nhận / Đã hủy
- Thêm, sửa, xóa bác sĩ
- Quản lý khung giờ làm việc của từng bác sĩ theo thứ trong tuần

---

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, Axios |
| Backend | Spring Boot 3.3, Java 21, Spring Security (JWT), JPA/Hibernate |
| Cơ sở dữ liệu | PostgreSQL + Flyway (migration tự động) |

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

Backend chạy tại: `http://localhost:8080`

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

Frontend chạy tại: `http://localhost:5173`

---

## Cấu trúc thư mục

```
health-booking/
├── backend/                        # Spring Boot API
│   └── src/main/
│       ├── java/com/healthbooking/
│       │   ├── controller/         # REST controllers
│       │   ├── model/              # JPA entities
│       │   ├── service/            # Business logic
│       │   ├── repository/         # Spring Data repos
│       │   ├── dto/                # Request/Response DTOs
│       │   ├── security/           # JWT filter & config
│       │   └── config/             # Security, CORS config
│       └── resources/
│           ├── application.yml
│           └── db/migration/       # Flyway SQL scripts
└── frontend/                       # React + Vite
    └── src/
        ├── pages/
        │   ├── Landing/            # Trang khách hàng (Hero + Booking)
        │   └── Admin/              # Bảng quản trị (Lịch hẹn + Bác sĩ)
        ├── components/             # Navbar, Footer
        ├── services/               # Axios API calls
        ├── store/                  # Zustand auth store
        └── types/                  # TypeScript interfaces
```

---

## API chính

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/api/doctors` | Danh sách bác sĩ | Public |
| GET | `/api/doctors/{id}/availability` | Lịch làm việc bác sĩ | Public |
| POST | `/api/appointments` | Tạo lịch hẹn | Public |
| POST | `/api/auth/login` | Đăng nhập admin | Public |
| GET | `/api/admin/appointments` | Toàn bộ lịch hẹn | Admin |
| PATCH | `/api/admin/appointments/{id}/status` | Cập nhật trạng thái | Admin |
| POST | `/api/admin/doctors` | Thêm bác sĩ | Admin |
| PUT | `/api/admin/doctors/{id}` | Sửa bác sĩ | Admin |
| DELETE | `/api/admin/doctors/{id}` | Xóa bác sĩ | Admin |
| POST | `/api/admin/doctors/{id}/availability` | Thêm khung giờ | Admin |
| DELETE | `/api/admin/doctors/{id}/availability/{aid}` | Xóa khung giờ | Admin |
