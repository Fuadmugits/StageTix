# StageTix API Documentation (OpenAPI / REST Specification)

Tech Stack: **Laravel + SQLite/MySQL + Sanctum Token Auth + Midtrans Gateway**

Base URL: `http://localhost:8000/api/v1`

---

## 1. Authentication Endpoints

### 1.1 Register User
- **POST** `/auth/register`
- **Body**:
  ```json
  {
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "password": "password123",
    "phone": "08123456789",
    "role": "user"
  }
  ```
- **Roles available**: `user`, `admin`, `gate_staff`.

### 1.2 Login User & Get Bearer Token
- **POST** `/auth/login`
- **Body**:
  ```json
  {
    "email": "admin@stagetix.com",
    "password": "password123"
  }
  ```
- **Response**: Returns `token` (Bearer token for Sanctum) and user details.

### 1.3 User Profile (Protected: `auth:sanctum`)
- **GET** `/auth/profile`
- **Header**: `Authorization: Bearer <token>`

### 1.4 Logout
- **POST** `/auth/logout`
- **Header**: `Authorization: Bearer <token>`

---

## 2. Public Concerts & Events

### 2.1 List Events with Search & Filters
- **GET** `/concerts`
- **Query Params**:
  - `search`: Filter by artist, concert title, or venue.
  - `city`: `Jakarta`, `Tangerang`, etc.
  - `genre`: `Pop`, `Rock`, `Indie`, `Jazz`, `EDM`.
  - `date`: `YYYY-MM-DD`.
  - `status`: `on_sale`, `upcoming`, `sold_out`.
- **Response**: List of concerts along with ticket categories and **live remaining stock**.

### 2.2 Concert Detail
- **GET** `/concerts/{idOrSlug}`
- Example: `/concerts/coldplay-music-of-the-spheres-2026`

---

## 3. Virtual Waiting Room / Queue System

### 3.1 Join Event Queue
- **POST** `/concerts/{concertId}/queue/join`
- **Header**: `X-Session-ID: <uuid>` (optional, auto-generated if omitted)
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "session_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "queue_number": 42,
      "position_in_line": 22,
      "queue_status": "waiting",
      "estimated_wait_seconds": 66,
      "estimated_wait_human": "2 mins"
    }
  }
  ```

### 3.2 Check Queue Status & Admission Window
- **GET** `/concerts/{concertId}/queue/status?session_id=<uuid>`
- Once admitted:
  - `queue_status`: `"admitted"`
  - `remaining_seconds_to_checkout`: 600 (10 minutes countdown). If expired, status turns to `"expired"`.

### 3.3 Join Waitlist (When Sold Out)
- **POST** `/concerts/{concertId}/waitlist`
- **Body**: `{"email": "fan@email.com", "ticket_tier_id": 1, "phone": "08123456789"}`

---

## 4. Checkout & Atomic Stock Locking (Critical)

### 4.1 Order Checkout with Row-Locking
- **POST** `/orders/checkout`
- **Concurrency & Anti-Scalp Rules**:
  1. Row-level pessimistic locking (`SELECT ... FOR UPDATE`) prevents overselling under burst traffic.
  2. Maximum **4 tickets per user/order** for any single event.
  3. Holds stock for exactly **15 minutes** (`expires_at = now() + 15 min`).
- **Body**:
  ```json
  {
    "concert_id": 1,
    "ticket_tier_id": 1,
    "quantity": 2,
    "customer_name": "Rian Pratama",
    "customer_email": "rian.pratama@gmail.com",
    "customer_phone": "081234567890",
    "customer_identity_no": "3171012903980001",
    "payment_method": "qris",
    "promo_code": "STAGE2026"
  }
  ```

### 4.2 Get Order Details
- **GET** `/orders/{orderNumber}`

### 4.3 User Orders & Tickets (Protected)
- **GET** `/user/orders`
- **GET** `/user/tickets`

---

## 5. Promo Codes

### 5.1 Validate Promo at Checkout
- **POST** `/promos/validate`
- **Body**: `{"code": "STAGE2026", "subtotal": 2500000}`

---

## 6. Payment Webhook (Midtrans / Xendit)

- **POST** `/webhooks/payment`
- **Security & Idempotency**:
  - Verifies SHA-512 `signature_key = hash(order_id + status_code + gross_amount + server_key)`.
  - Idempotent: Duplicate notifications for `PAID` return `200 OK` safely.
  - Generates HMAC-SHA256 signed QR e-tickets upon settlement.
  - Automatically releases held stock back if status is `expire`, `cancel`, or `deny`.

---

## 7. Gate Validation Endpoint (Gate Staff / Admin)

### 7.1 Scan QR at Entrance Gate
- **POST** `/gate/scan`
- **Body**:
  ```json
  {
    "ticket_code": "TIX-XYZ12345",
    "gate_name": "North Gate Gate 3"
  }
  ```
- **Responses**:
  - `GRANTED` (HTTP 200): Ticket valid and atomically marked `status = USED` with `scanned_at`.
  - `ALREADY_USED` (HTTP 409): Ticket already scanned previously (shows exact scan timestamp).
  - `INVALID` (HTTP 404): Ticket not found.
  - `UNPAID` (HTTP 403): Order unpaid or expired.

---

## 8. Admin Management Endpoints (`Role: admin`)

Header required: `Authorization: Bearer <admin_token>`

- **GET** `/admin/events` : List all events.
- **POST** `/admin/events` : Create event with venue & categories (`draft`, `upcoming`, `on_sale`, etc.).
- **PUT** `/admin/events/{id}` : Update event details/status.
- **DELETE** `/admin/events/{id}` : Delete event.
- **GET** `/admin/venues` & **POST** `/admin/venues` : Venues CRUD.
- **GET** `/admin/promos` & **POST** `/admin/promos` : Promo codes CRUD.
- **POST** `/admin/concerts/{concertId}/queue/admit` : Admit next batch of queued users.
- **GET** `/admin/reports/summary` : Total revenue, daily sales trend, tickets sold per category.
- **GET** `/admin/reports/export-csv` : Stream download CSV export of all sales.
