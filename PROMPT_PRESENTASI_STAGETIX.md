# DRAFT PROMPT SIAP PAKAI: PEMBUATAN MATERI PRESENTASI & SLIDE DECK STAGETIX

Gunakan prompt di bawah ini untuk dimasukkan ke AI (ChatGPT, Claude, atau Gemini) atau sebagai panduan skrip pitch deck presentasi Anda.

---

### [COPY PROMPT DI BAWAH INI]

```markdown
Bertindaklah sebagai Konsultan Pitch Deck & Presentasi Startup Senior. Saya ingin Anda menyusun naskah presentasi dan struktur slide presentasi (Slide Deck) yang sangat memukau, terstruktur rapi, meyakinkan, dan profesional untuk proyek aplikasi saya bernama "StageTix".

Tolong susun presentasi ini dengan struktur 5 pilar wajib berikut:
1. Masalah & Peluang (Problem & Opportunity)
2. Solusi & Penjelasan Produk (Product Solution & Architecture)
3. Target Pasar & Model Bisnis (Target Market & Business Model)
4. Kelebihan Produk / Nilai Kompetitif (Unique Value Proposition & Competitive Advantages)
5. Rencana Ke Depan / Roadmap Pengembangan (Future Roadmap & Vision)

Berikut adalah ringkasan data dan spesifikasi teknis dari proyek StageTix:

---

### DATA & SPESIFIKASI PROYEK STAGETIX:

1. IDENTITAS PRODUK:
   - Nama: StageTix (Next-Generation Concert Ticketing & Smart Gateway Platform)
   - Konsep: Platform pemesanan tiket konser digital terintegrasi yang menyelesaikan masalah "Ticket War", kecurangan calo, kegagalan transaksi, dan antrean validasi pintu masuk konser.

2. MASALAH (PAIN POINTS):
   - Server Melumpuh saat Ticket War: Lonjakan trafik puluhan ribu user secara bersamaan sering membuat sistem crash.
   - Monopoli Bot & Calo (Scalper): Calo memborong tiket dengan script otomatis sehingga penggemar asli tidak kebagian.
   - Payment Drop: User sudah klik bayar, tetapi saat proses transfer di bank, tiket keburu terjual ke orang lain (tidak ada mekanisme hold kuota).
   - Tiket Palsu & Double Entry: Tiket difotokopi/dijual ke beberapa orang, memicu kericuhan di pintu masuk konser.
   - Rekapitulasi Manual Promotor: Laporan penjualan dan tingkat kehadiran di gate lambat serta tidak transparan.

3. PELUANG (OPPORTUNITY):
   - Industri konser dan festival musik di Indonesia/Asia Tenggara sedang mengalami ledakan eksponensial (Coldplay, Bruno Mars, K-Pop, festival lokal).
   - Promotor dan penonton sangat mendambakan platform tiket yang adil, stabil, dan transparan.

4. SOLUSI PRODUK (FITUR KUNCI):
   - Virtual Waiting Room: Algoritma antrean FIFO (First-In, First-Out) otomatis saat traffic padat untuk mencegah server overload.
   - 15-Minute Atomic Stock Hold: Sistem menahan kuota tiket selama 15 menit agar pembeli tenang menyelesaikan pembayaran di perbankan.
   - Omnichannel Payment Gateway (Midtrans Snap): Pembayaran instan via QRIS Dinamis (GoPay, OVO, ShopeePay, BCA, dll), Virtual Account (BCA, Mandiri, BNI, BRI), dan Kartu Kredit dengan webhook settlement otomatis.
   - Anti-Fraud Gate Scanner: Pemindaian barcode kamera berkecepatan 15 FPS dengan proteksi database `lockForUpdate()`, audio feedback beep, dan pencegahan tiket duplikat (sekali scan langsung USED).
   - Dual-Code Resolution: Scanner cerdas mengenali Kode Tiket Resmi (TCK-...) maupun Nomor Pesanan (STX-...).

5. TECH STACK:
   - Frontend: Next.js 16 (React 19, Turbopack, Tailwind CSS, Html5-QRCode).
   - Backend: Laravel 11 RESTful API Engine dengan RBAC (Customer, Crew, Promoter, Super Admin).
   - Database: SQLite / PostgreSQL dengan dukungan transaksi ACID & Atomic Locks.
   - 3rd Party Integrations: Midtrans Payment Gateway API & Supabase Cloud Authentication.

6. TARGET PASAR:
   - Segmen B2B (Utama): Promotor Konser, Event Organizer (EO) Musik, Pengelola Venue/Stadion, Komunitas Kampus/Festival.
   - Segmen B2C (Pengguna Akhir): Komunitas penikmat musik, penonton festival, dan penggemar konser rentang usia 17–40 tahun.

7. MODEL BISNIS & MONETISASI:
   - Platform Service Fee: Rp25.000 per transaksi checkout.
   - Gateway Processing Margin: Selisih MDR dari transaksi QRIS dan Virtual Account.
   - Revenue Sharing Promotor: Komisi 2.5% – 5% dari total omset tiket konser.
   - Hardware & On-site Crew Support: Biaya penyewaan terminal scanner gate dan support teknis hari-H.

8. KELEBIHAN KOMPETITIF (KENAPA STAGETIX LEBIH UNGGUL):
   - Zero Overbooking: Garansi tidak ada tiket terjual melebihi kapasitas berkat atomic inventory locking.
   - Fair-War Engine: Pembatasan identitas KTP/NIK dan antrean virtual meminimalisir bot calo.
   - Kecepatan Gate Scan Tinggi: Pemeriksaan penonton kurang dari 0.5 detik per orang dengan kamera biasa tanpa alat scanner mahal.

9. RENCANA KE DEPAN (ROADMAP):
   - Fase 1 (Current): Peluncuran Web Platform, Integrasi Midtrans Sandbox/Production, dan Web-based Camera Gate Scanner.
   - Fase 2: Aplikasi Mobile Native (Flutter/React Native) dengan Offline-first Gate Scanner (tetap bisa scan tanpa sinyal internet di venue terpencil).
   - Fase 3: Dynamic Encrypted Rotating QR Code (QR Code berganti tiap 30 detik seperti Google Authenticator untuk membasmi tangkapan layar/screenshot tiket).
   - Fase 4: Official Face Recognition Gate Check-in & NFT-based Collectible Tickets untuk merchandise memorabilia konser.

---

### OUTPUT YANG DIBUTUHKAN:
1. Outline Slide by Slide (Judul slide, Poin-poin bullet, dan Visual Suggestion untuk desain slide PowerPoint).
2. Naskah Ucapan Presenter (Presenter Speech / Script) untuk setiap slide dengan gaya bahasa yang santai, percaya diri, lugas, dan meyakinkan penguji/audiens.
3. Tips Menjawab Pertanyaan Penguji (Q&A Anticipation) seputar teknis keamanan database, integrasi payment gateway, dan strategi bisnis.
```

