# 📖 DOKUMEN PANDUAN LENGKAP APLIKASI STAGETIX
**Platform Pemesanan Tiket Konser & Gate Scanner Terintegrasi**  
*Bahan Hafalan Presentasi & Ujian Kompetensi Keahlian Rekayasa Perangkat Lunak*

---

## 📌 DAFTAR ISI
1. **Ringkasan Eksekutif & Masalah yang Diselesaikan**
2. **Peran Pengguna (User Roles)**
3. **Peta Modul & Navigasi Halaman**
4. **Alur Kerja Sistem (End-to-End Flow 7 Tahap)**
5. **Konsep Teknis Unggulan (Poin Nilai Plus)**
6. **Integrasi Layanan Pihak Ketiga (Third Party Services)**
7. **Model Bisnis & Cara Penjualan ke Klien (Monetisasi)**
8. **Tanya-Jawab Cepat untuk Menjawab Guru / Penguji**

---

## 1. RINGKASAN EKSEKUTIF & MASALAH YANG DISELESAIKAN

### A. Apa itu StageTix?
StageTix adalah platform web terpadu untuk pemesanan tiket konser musik resmi yang dirancang dengan sistem anti-antrean (*high-concurrency virtual waiting room*), verifikasi pembayaran instan via payment gateway, penerbitan e-tiket ber-QR Code dinamis, serta modul pemindai gerbang (*gate scanner*) bagi kru di lokasi acara.

### B. Masalah Nyata yang Diselesaikan:
1. **Server Down & Overbooking saat War Tiket**:
   - *Masalah*: Jutaan orang checkout serentak menyebabkan server macet dan tiket terjual melebihi kuota fisik gedung (*double-booking*).
   - *Solusi StageTix*: Menerapkan antrean nomor urut (*FIFO Virtual Waiting Room*) dan penguncian baris database (*Pessimistic Row Locking: `lockForUpdate()`*).
2. **Tiket Palsu & Calo di Pintu Masuk Venue**:
   - *Masalah*: Tiket hasil tangkapan layar (screenshot) atau PDF yang difotokopi dijual ke banyak orang.
   - *Solusi StageTix*: E-tiket digital berstempel QR Code terenkripsi yang langsung terhubung ke *Gate Scanner* kru. Jika tiket yang sama di-scan dua kali, sistem langsung menolak (*Duplicate Scan Rejection*).
3. **Konfirmasi Pembayaran Manual yang Lambat**:
   - *Masalah*: Pembeli harus mengirim foto struk transfer dan menunggu berjam-jam diverifikasi admin.
   - *Solusi StageTix*: Integrasi Webhook Midtrans (QRIS & Virtual Account) yang otomatis mengubah status menjadi `PAID` dalam hitungan detik.

---

## 2. PERAN PENGGUNA (USER ROLES)

Aplikasi ini memiliki 3 level aktor:
1. **Penonton / Pembeli (*Customer*)**:
   - Menjelajahi jadwal konser, memilih kategori tempat duduk (VIP, Cat 1, Festival).
   - Mengantre nomor tiket, melakukan checkout, dan membayar instan via QRIS/VA.
   - Mengakses E-Tiket ber-QR Code di menu *Tiket Saya*.
2. **Kru Pintu Masuk (*Gate Staff*)**:
   - Mengoperasikan modul kamera scanner di pintu masuk stadion/venue (`/gate-scanner`).
   - Memvalidasi tiket asli vs palsu dan mendeteksi tiket ganda.
3. **Penyelenggara Konser (*Event Organizer / Promotor*) & Super Admin**:
   - Memantau metrik total pendapatan (*total revenue*), persentase tiket terjual, dan tingkat kehadiran penonton (*check-in rate*).
   - Menyetujui izin promotor dan mengatur harga serta kuota per kategori tiket.

---

## 3. PETA MODUL & NAVIGASI HALAMAN

| No | URL Halaman | Nama Modul | Fungsi Utama |
| :---: | :--- | :--- | :--- |
| **1** | `/` | **Landing Page** | Beranda utama, promo konser unggulan, keunggulan platform, dan statistik resmi. |
| **2** | `/explore` | **Katalog Konser** | Pencarian artis, lokasi venue, dan filter genre musik (Pop, Rock, EDM, Jazz, Festival). |
| **3** | `/concert/[id]` | **Detail Konser & Antrean** | Pemilihan kategori kursi, sisa kuota real-time, dan pop-up antrean tiket (*Waiting Room*). |
| **4** | `/checkout` | **Formulir Checkout** | Validasi identitas penonton (Nama, NIK KTP, No. WhatsApp, Email) dan ringkasan biaya. |
| **5** | `/payment/[id]` | **Halaman Pembayaran** | Penyajian barcode QRIS dinamis dan nomor Virtual Account bank beserta simulator bayar. |
| **6** | `/ticket/[id]` | **E-Ticket Digital** | Tiket elektronik resmi ber-QR Code unik untuk ditunjukkan saat hari konser. |
| **7** | `/transactions` | **Riwayat Pesanan** | Daftar seluruh transaksi tiket milik user (status *Pending*, *Paid*, *Expired*). |
| **8** | `/gate-scanner` | **Scanner Gate Masuk** | Modul scanner kru untuk validasi izin masuk penonton di lokasi acara. |
| **9** | `/organizer` | **Dashboard Promotor** | Statistik omset, grafik penjualan, check-in rate gate, dan skema bisnis B2B. |

---

## 4. ALUR KERJA SISTEM (END-TO-END 7 TAHAP)

### Tahap 1: Pencarian Konser (*Discovery*)
Penonton membuka halaman `/explore`, mencari artis favorit, dan mengeklik konser untuk memeriksa tanggal serta lokasi panggung.

### Tahap 2: Antrean War Tiket (*Virtual Waiting Room*)
Saat pembeli menekan tombol *"Beli Tiket & Masuk Antrean"*, sistem backend memberikan **Nomor Antrean Unik (FIFO)**. Pop-up menampilkan posisi antrean dan estimasi waktu tunggu. Ketika gilirannya tiba, pembeli diberi waktu **10 menit** untuk menyelesaikan pembelian.

### Tahap 3: Pemesanan & Penguncian Kuota (*Pessimistic Locking*)
Pembeli mengisi identitas diri. Saat tombol konfirmasi ditekan, database backend menjalankan penguncian baris (`lockForUpdate()`) untuk mengurangi kuota tier tiket secara eksklusif. Hal ini menjamin tidak ada dua pembeli yang mendapatkan kursi yang sama.

### Tahap 4: Pembayaran Instan (*Payment Gateway Webhook*)
Pembeli memilih metode QRIS atau Virtual Account Bank (BCA, Mandiri, BRI, BNI). Server Midtrans mengirimkan sinyal notifikasi balik (*webhook callback*) yang diverifikasi menggunakan **SHA-512 Signature Hash**. Status invoice langsung berubah otomatis menjadi `PAID`.

### Tahap 5: Penerbitan E-Tiket Digital
Sistem secara instan membuat data tiket digital baru di database dengan kode unik berformat `STX-TKT-2026-XXXX` dan men-generate QR Code terenkripsi.

### Tahap 6: Pemeriksaan di Pintu Masuk (*Gate Scanner*)
Di hari pertunjukan, kru membuka modul `/gate-scanner` di HP/tablet:
- **HIJAU (ACCESS GRANTED)**: Tiket asli dan belum pernah dipakai. Status tiket berganti menjadi `USED` dan waktu scan (`scanned_at`) dicatat.
- **MERAH (DUPLICATE SCAN / REJECTED)**: Tiket pernah di-scan sebelumnya. Sistem menampilkan jam pemindaian pertama. Calo/pemakai tiket duplikat tertolak.
- **KUNING/ABU (INVALID / UNPAID)**: Kode palsu atau pesanan belum dibayar.

### Tahap 7: Monitoring Promotor (*Organizer Analytics*)
Promotor memantau jalannya acara secara *real-time*: memantau berapa persen penonton yang sudah masuk ke dalam stadion dan total omset penjualan tiket yang masuk.

---

## 5. KONSEP TEKNIS UNGGULAN (POIN NILAI PLUS)

1. **High Concurrency FIFO Waiting Room**:
   Menggunakan counter atomik di cache/Redis sehingga saat jutaan request datang bersamaan, server tidak crash melainkan menampung antrean secara teratur.
2. **Database Pessimistic Row Locking (`lockForUpdate()`)**:
   Mencegah *Race Condition* di level MySQL/database engine saat kuota tiket tersisa sedikit dan diperebutkan banyak user.
3. **Idempotent Webhook Processing**:
   Notifikasi webhook pembayaran aman dari duplikasi pemrosesan (jika Midtrans mengirim notifikasi berulang, sistem tidak akan membuat tiket ganda).
4. **Secure Dynamic QR Code Verification**:
   Payload QR Code berisi token verifikasi yang hanya dapat di-decode dan diakui oleh endpoint gate scanner resmi StageTix.

---

## 6. INTEGRASI LAYANAN PIHAK KETIGA (THIRD PARTY)

1. **Midtrans Payment Gateway**:
   - Memproses pembayaran otomatis via QRIS (GoPay, OVO, Dana) dan Virtual Account Bank.
   - Terintegrasi dengan Server Key (`MIDTRANS_SERVER_KEY`) dan Client Key (`MIDTRANS_CLIENT_KEY`).
2. **Supabase Cloud Authentication**:
   - Menangani autentikasi identitas penonton menggunakan login cepat Google OAuth 2.0 dan enkripsi sesi token JWT.
3. **QR Code Engine API**:
   - Menghasilkan grafis QR Code dinamis untuk scan bayar QRIS dan barcode E-Tiket penonton.
4. **Unsplash High-Res CDN**:
   - Menyediakan banner dan poster acara konser beresolusi tinggi secara cepat.

---

## 7. MODEL BISNIS & CARA PENJUALAN KE KLIEN (MONETISASI)

Jika aplikasi ini dipresentasikan atau ditawarkan ke agensi promotor, terdapat 3 opsi skema penjualan:

1. **Skema Bagi Hasil / Komisi Per Tiket (*Revenue Sharing*) — Paling Diminati**:
   - Promotor menggunakan platform StageTix secara **gratis tanpa modal awal** (*Zero Setup Fee*).
   - Kita mengambil keuntungan dari biaya platform (*ticketing service fee*) sebesar **Rp 5.000 – Rp 15.000 / tiket** yang dibebankan kepada penonton saat checkout.
   - *Contoh Hitungan*: Konser 20.000 penonton × fee Rp 10.000 = **Rp 200.000.000 omset bersih per event**.
2. **Skema Sewa Sistem Per Event (*White-Label*)**:
   - Promotor besar menyewa sistem untuk 1 konser dengan logo dan domain mereka sendiri (misal: `tiket.pestapora2026.com`).
   - Paket sewa mencakup server anti-war tiket, dashboard promotor, dan scanner gate.
   - *Nilai Kontrak*: **Rp 15 Juta – Rp 50 Juta per event**.
3. **Skema Jual Putus / Lisensi Software (*Enterprise*)**:
   - Menjual seluruh source code StageTix kepada agensi Event Organizer atau pengelola gedung venue konser untuk dipasang di server pribadi mereka sendiri.
   - *Biaya Lisensi*: **Rp 50 Juta – Rp 100 Juta+** plus kontrak biaya pemeliharaan (*maintenance*) berkala.

---

## 8. TANYA-JAWAB CEPAT UNTUK MENJAWAB GURU / PENGUJI

* **T: Apa kelebihan aplikasi ini dibanding web e-commerce biasa?**  
  *J: "StageTix memiliki sistem antrean tiket FIFO untuk menangani lonjakan jutaan pembeli serentak, penguncian kuota database atomik agar tidak overbooking, serta scanner gate terenkripsi untuk mencegah tiket palsu dan calo di lokasi konser."*

* **T: Bagaimana cara sistem memastikan tiket tidak bisa dipalsukan atau di-screenshot oleh calo?**  
  *J: "Setiap e-tiket memiliki kode unik dan QR Code dinamis. Begitu di-scan oleh petugas pintu masuk, status tiket di database langsung berubah menjadi `USED`. Jika orang lain mencoba memakai screenshot tiket yang sama, layar scanner kru akan langsung menyala merah dengan peringatan DUPLICATE SCAN."*

* **T: Mengapa menggunakan Pessimistic Locking di backend Laravel?**  
  *J: "Untuk mencegah Race Condition saat war tiket. Ketika kuota tiket tersisa 1 kursi dan ada 100 orang menekan checkout bersamaan, perintah `lockForUpdate()` mengunci baris data di database sehingga hanya orang pertama yang bisa menyelesaikan transaksi, sedangkan 99 orang lainnya mendapat notifikasi kuota habis secara aman."*

* **T: Apa peran Midtrans Webhook di sini?**  
  *J: "Webhook bekerja secara server-to-server. Begitu pembeli sukses memindai QRIS atau transfer Virtual Account, Midtrans langsung mengirim sinyal HTTP POST ke backend kita sehingga status pesanan langsung berubah menjadi PAID secara instan tanpa perlu upload bukti transfer manual."*

