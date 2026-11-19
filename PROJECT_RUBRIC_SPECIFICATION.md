# 🎤 StageTix - Concert Ticketing & Payment Gateway Architecture Specification

Dokumentasi lengkap implementasi sistem ticketing konser **StageTix** sesuai dengan Rubrik Penilaian Proyek.

---

## 📑 Rubrik Penilaian Proyek & Pemenuhan Fitur

### 1. Identifikasi Masalah & Perancangan Sistem
* **Identifikasi Masalah**:
  - **Calo & Overbooking**: Tingginya kasus pemesanan ganda (double-booking) saat *flash sale* tiket konser.
  - **Antrean Pintu Masuk (Gate Queue)**: Validasi tiket manual yang lambat dan risiko penggunaan tiket palsu/duplikat di lokasi acara.
  - **Solusi StageTix**: Arsitektur berbasis *Pessimistic DB Locking* (`lockForUpdate()`) di Laravel backend, integrasi *Payment Gateway Webhook*, serta sistem *Gate Scanner QR Code* real-time.
* **Arsitektur Sistem**:
  - **Frontend**: Next.js 16 (App Router), Tailwind CSS, Glassmorphic UI design.
  - **Backend**: Laravel 11 REST API (PHP 8.2+), Eloquent ORM, MySQL Database (`stagetix_db`).
  - **Authentikasi**: Supabase Auth (Google OAuth 2.0) & Sanctum session/tokens.
  - **Payment Gateway**: Integrasi Midtrans Webhook (QRIS, VA BCA/Mandiri/BRIVA, Credit Card).

---

### 2. Backend & Database
* **Database Schema (Migrations)**:
  - `concerts`: Menyimpan data konser, artis, venue, kategori, dan gambar.
  - `ticket_tiers`: Menyimpan kategori tiket (VIP, CAT 1, CAT 2), harga, dan sisa kuota (`available_quantity`).
  - `orders`: Menyimpan data pemesanan, invoice, status pembayaran (PENDING, PAID, EXPIRED, CANCELLED), nomor VA, dan QRIS.
  - `order_items`: Detail tiket yang dibeli per order.
  - `tickets`: Tiket digital per individu, berisi kode unik (`ticket_code`), QR code payload, status (`ACTIVE`, `USED`, `CANCELLED`), dan waktu scan (`scanned_at`).
* **REST API Endpoints**:
  - `GET /api/v1/concerts` & `GET /api/v1/concerts/{idOrSlug}`: Mengambil daftar & detail konser.
  - `POST /api/v1/orders/checkout`: Membuat transaksi tiket secara atomic.
  - `GET /api/v1/orders/{orderNumber}`: Mengambil status pesanan & invoice.
  - `POST /api/v1/webhooks/payment`: Callback handler untuk pembaruan status transaksi otomatis dari Midtrans.
  - `GET /api/v1/tickets/{ticketCode}`: Mengambil data e-ticket.
  - `POST /api/v1/gate/scan`: Validasi & klaim tiket di pintu masuk gate.
  - `GET /api/v1/organizer/stats`: Metrics analitik real-time untuk organizer.

---

### 3. Frontend / UI & UX
* **Landing Page (`/`)**: Hero banner dinamis, filter kategori (Pop, Rock, EDM, Jazz, Festival), pencarian artis/venue, serta konser populer (*selling fast*).
* **Detail Event (`/concert/[id]`)**: Detail acara, pemilihan tier tiket, benefit/perks per tier, serta perhitungan sisa kuota real-time.
* **Pemilihan Tiket**: Selector kuantitas tiket (1-4 tiket per pemesanan).
* **Checkout (`/checkout`)**: Form data pemesan (Nama, Email, No HP, No KTP), pilihan metode pembayaran (QRIS, Virtual Account, Credit Card), serta ringkasan biaya.
* **Responsive Design**: Desain fluid, responsif, dan ramah pengguna di perangkat mobile, tablet, maupun desktop.

---

### 4. Payment Concept
* **Sisi Pembeli**:
  - Halaman instruksi pembayaran interaktif (`/payment/[orderId]`).
  - Menampilkan QRIS QR Code dan nomor Virtual Account unik.
  - Simulator pembayaran instan untuk pengujian integrasi gateway.
  - E-Ticket digital (`/ticket/[ticketId]`) dilengkapi QR Code validasi gate.
* **Sisi Organizer (`/organizer`)**:
  - Dashboard analitik pendapatan (*total revenue*), jumlah tiket terjual, dan rasio *gate check-in rate*.

---

### 5. High Concurrency (Pencegahan Overbooking)
* Menggunakan **Pessimistic Database Row Locking** (`lockForUpdate()`) di dalam blok `DB::transaction()` pada Laravel:
  ```php
  DB::transaction(function () use ($validated) {
      $tier = TicketTier::where('id', $validated['ticket_tier_id'])
          ->lockForUpdate()
          ->firstOrFail();

      if ($tier->available_quantity < $validated['quantity']) {
          throw new Exception("Kuota tiket tidak mencukupi.");
      }

      $tier->decrement('available_quantity', $validated['quantity']);
      // ... create order
  });
  ```
* Mencegah *race condition* meskipun ribuan pembeli melakukan checkout secara bersamaan pada *flash sale*.

---

### 6. Gate Scanner (`/gate-scanner`)
* Halaman scanner interaktif untuk petugas di pintu masuk gate lokasi acara.
* Mendukung validasi input QR Code / Kode Unik Tiket (`STX-TKT-...`).
* **Fitur Keamanan Gate**:
  - **ACCESS GRANTED**: Tiket valid & aktif -> Mengubah status menjadi `USED` dan mencatat `scanned_at`.
  - **DUPLICATE SCAN (REJECTED)**: Menolak tiket yang pernah di-scan sebelumnya (menampilkan jam scan pertama).
  - **INVALID/UNPAID**: Menolak tiket palsu atau pesanan yang belum dibayar.

---

### 7. Third Party Service Integration
* **Supabase Auth**: Sign In dengan Google OAuth 2.0.
* **Midtrans Payment Gateway**: Webhook callback listener untuk pembayaran otomatis.
* **QR Code API**: Generasi QR code instan untuk pembayaran QRIS & e-ticket.
