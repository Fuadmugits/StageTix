# PANDUAN SLIDE PRESENTASI & POIN PENTING: STAGETIX

Gunakan struktur di bawah ini untuk menyusun slide PowerPoint (PPT) Anda agar terstruktur, profesional, dan siap diujikan di depan dosen/penguji.

---

## SLIDE 1: JUDUL & IDENTITAS PROYEK
* **Judul Utama**: StageTix – Next-Generation Concert Ticketing & Smart Gateway Platform
* **Sub-judul**: Solusi Terpadu Tiket Konser Digital dengan Virtual Waiting Room, Integrasi Multi-Payment Gateway (Midtrans), dan Sistem Validasi Gate Masuk Real-Time.
* **Disusun Oleh**: [Nama Anda / Tim]
* **Program Studi & Universitas**: [Nama Jurusan / Kampus]

---

## SLIDE 2: LATAR BELAKANG & PROBLEM STATEMENT (MASALAH NYATA)
* **Ticket War & Bot Scalper**: Lonjakan trafik ekstrem saat penjualan tiket dibuka sering membuat server crash dan tiket diborong calo.
* **Kegagalan Pembayaran (Payment Drop)**: Tidak adanya mekanisme penahanan stok (*stock holding*) membuat kuota habis saat user sedang melakukan transaksi di bank.
* **Tiket Duplikat & Penipuan Fisik**: Maraknya pemalsuan tiket di pintu masuk konser (*double redemption*).
* **Rekapitulasi Manual Promotor**: Sulitnya penyelenggara konser memantau arus kas dan kehadiran penonton secara langsung (*real-time*).

---

## SLIDE 3: SOLUSI YANG DITAWARKAN OLEH STAGETIX
* **Virtual Waiting Room**: Antrean antiluber dengan algoritma FIFO (*First-In-First-Out*) untuk menjaga kestabilan server saat traffic tinggi.
* **15-Minute Atomic Stock Hold**: Sistem mengunci kuota tiket selama 15 menit agar user dapat menyelesaikan pembayaran tanpa takut kehabisan.
* **Omnichannel Multi-Payment Gateway**: Integrasi resmi Midtrans Snap (QRIS dinamis, BCA/Mandiri/BNI Virtual Account, e-Wallet, Kartu Kredit).
* **Anti-Fraud Gate Scanner**: Validasi QR code digital di pintu masuk konser dengan teknologi *atomic row-locking* guna mencegah tiket dipakai dua kali.

---

## SLIDE 4: ARSITEKTUR TEKNOLOGI & TECH STACK
* **Frontend Layer**:
  * **Framework**: Next.js 16 (App Router, Turbopack, React 19).
  * **Styling**: Tailwind CSS dengan Adaptive Dark/Light Mode.
  * **Interactivity**: Lucide Icons, Canvas-Confetti, Html5-QRCode.
* **Backend Layer**:
  * **Framework**: Laravel 11 RESTful API Engine.
  * **Security**: Sanctum Auth, Role-Based Access Control (RBAC: Admin, Crew, Customer).
* **Database & Third-Party**:
  * **Database**: SQLite / PostgreSQL (mendukung transaksi ACID & row locking).
  * **Payment Gateway**: Midtrans Sandbox API (Snap & Core API).
  * **Cloud Auth**: Supabase Authentication Service.

---

## SLIDE 5: ALUR SISTEM END-TO-END (USER JOURNEY)
1. **Jelajah Konser**: Pengunjung memilih konser, jadwal, dan kategori tiket (VIP, Festival, CAT).
2. **Virtual Waiting Room (Queueing)**: Jika kuota rebutan, user menunggu antrean nomor registrasi secara otomatis.
3. **Checkout & Pengisian Identitas**: Input identitas resmi (NIK/KTP, Email, No. HP) dan verifikasi kode promo voucher.
4. **Pembayaran Midtrans**: Pop-up resmi Midtrans Snap terbuka secara otomatis, menampilkan QRIS atau nomor Virtual Account.
5. **Verifikasi Webhook**: Sistem menerima sinyal settlement dari Midtrans dan mengonfirmasi pembayaran secara instan.
6. **E-Ticket Digital**: Tiket resmi terbit dengan barcode/QR Code terenkripsi unik.
7. **Gate Scanner Check-In**: Kru gate memindai QR code tiket di pintu masuk dengan kamera; status langsung berubah menjadi *USED*.

---

## SLIDE 6: FITUR UNGGULAN TEKNIS (TECHNICAL HIGHLIGHTS)
* **Midtrans Snap Integration**:
  * Menggunakan Server Key & Client Key resmi.
  * Mendukung simulasi pembayaran QRIS melalui link gambar dan VA via Simulator Midtrans resmi.
* **Kamera Scanner Berkecepatan Tinggi**:
  * Menggunakan modul HTML5-QRCode dengan Viewfinder Adaptif (80% area layar) dan frame rate 15 FPS.
  * Dilengkapi efek audio *beep* saat QR berhasil terkunci.
* **Dual-Code Resolution**:
  * Scanner gate cerdas: mengenali **Kode Tiket Resmi (`TCK-...`)** maupun **Kode Pesanan (`STX-...`)**.
* **Atomic Double-Entry Protection**:
  * Menggunakan database `lockForUpdate()`. Tiket yang sudah dipindai tidak akan pernah bisa dipakai masuk untuk kedua kalinya (*Access Denied: Already Used*).

---

## SLIDE 7: HAK AKSES SISTEM (ROLE-BASED ACCESS CONTROL)
* **Customer**:
  * Jelajah konser, booking tiket, bayar via Midtrans, simpan riwayat transaksi, akses E-Ticket digital.
* **Gate Crew**:
  * Akses scanner gate berbasis kamera dan input kode manual untuk check-in penonton.
* **Promotor / Penyelenggara**:
  * Memantau statistik tiket terjual, sisa kuota, dan rasio kehadiran di venue konser.
* **Super Admin**:
  * Manajemen data master konser, tier harga tiket, voucher diskon, dan kontrol antrean batch virtual.

---

## SLIDE 8: MONETISASI & NILAI BISNIS (B2B SAAS)
* **Platform Service Fee**: Biaya layanan tetap Rp25.000 per transaksi dari pembeli tiket.
* **MDR Payment Processing**: Margin dari biaya gateway (QRIS 0.7%, Virtual Account flat fee).
* **Promoter Revenue Sharing**: Bagi hasil 2.5% – 5% dari total penjualan tiket konser promotor.
* **Add-on Gate Hardware Support**: Penyewaan perangkat scanner gate & sistem ticketing offline/hybrid.

---

## SLIDE 9: KESIMPULAN & DEMO APLIKASI
* **Kesimpulan**: StageTix berhasil mengatasi masalah klasik industri pertunjukan di Indonesia: membasmi calo tiket, mengamankan antrean lonjakan traffic, mempermudah multi-pembayaran, dan menjamin validitas akses masuk penonton.
* **Sesi Demo**:
  1. Simulasi pemesanan tiket konser Coldplay 2026.
  2. Pembayaran via Pop-up Midtrans Snap (QRIS / BCA VA).
  3. Validasi QR Code di Scanner Gate (Kamera & Audio Beep).
* **Tanya Jawab (Q&A)**: Terima Kasih!

