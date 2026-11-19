# PROMPT LENGKAP & INTEGRATIF PRESENTASI STAGETIX

Gunakan prompt di bawah ini secara utuh untuk di-copy-paste ke AI (ChatGPT, Claude, atau Gemini) guna membuat naskah presentasi, slide PPT, maupun proposal ujian Anda.

---

### [COPY SELURUH TEKS DI BAWAH INI]

```markdown
Bertindaklah sebagai Konsultan Pitch Deck Startup & Dosen Penguji Sidang Teknologi Informasi Senior. 

Saya ingin Anda membuatkan struktur Slide PowerPoint (PPT) lengkap beserta Naskah Ucapan Presenter (Presenter Speech Script) untuk proyek aplikasi saya bernama "StageTix".

Presentasi ini harus dibangun secara runtut dengan 6 pilar utama:
1. Masalah & Peluang (Problem & Opportunity)
2. Ide Besar & Konsep Inovasi (The Big Idea & Product Concept)
3. Solusi Produk & Arsitektur Teknologi (Product Solution & Tech Stack)
4. Target Pasar & Model Bisnis (Target Market & Business Model)
5. Kelebihan Produk / Nilai Kompetitif (Competitive Advantage)
6. Rencana Ke Depan (Future Roadmap & Vision)

Berikut adalah data lengkap, ide, dan spesifikasi teknis dari proyek StageTix:

---

### 1. IDENTITAS PRODUK:
- Nama Produk: StageTix (Next-Generation Concert Ticketing & Smart Gateway Platform)
- Tagline: "Fair, Fast & Fraud-Proof Concert Ticketing Ecosystem"
- Platform: Aplikasi Berbasis Web Responsive (Desktop & Mobile)

---

### 2. MASALAH (THE PAIN POINTS):
- Server Crash saat "Ticket War": Lonjakan trafik puluhan ribu orang secara bersamaan selalu melumpuhkan server tiket konvensional.
- Monopoli Bot & Calo (Scalpers): Penggemar asli tersisih karena calo menggunakan script otomatis untuk memborong tiket.
- Payment Drop (Tiket Hilang Saat Bayar): Pembeli sudah memilih tiket, namun saat membuka aplikasi m-Banking untuk transfer, kuota tiket tiba-tiba hangus atau direbut orang lain karena tidak ada sistem penahanan stok.
- Tiket Duplikat & Penipuan Gerbang Masuk: Satu file barcode (PDF/screenshot) sering dijual calo ke 5–10 orang berbeda, memicu kericuhan di pintu masuk konser.
- Monitoring Manual & Lambat: Promotor kesulitan memantau data penjualan tiket real-time dan rasio kehadiran penonton di gate.

---

### 3. PELUANG PASAR (THE OPPORTUNITY):
- Ledakan industri konser dan festival musik di Indonesia (Coldplay, Bruno Mars, artis K-Pop, festival lokal).
- Promotor musik dan penonton sangat mendambakan platform ticketing lokal yang adil, stabil, transparan, dan tidak memerlukan biaya sewa hardware scanner laser yang mahal.

---

### 4. IDE BESAR & GAGASAN UTAMA (THE BIG IDEA):
"Membangun Ekosistem Tiket Konser yang Adil, Anti-Calo, dan Anti-Kecurangan dari Saat Pembelian hingga Masuk ke Gerbang Konser."
Bukan sekadar toko tiket online biasa, StageTix menggabungkan 4 pilar ide inovasi:
1. Fair Queueing Idea: Mengganti rebutan liar dengan sistem Virtual Waiting Room (FIFO) agar server tidak pernah tumbang.
2. Guaranteed Transaction Idea: Menjamin pembeli mendapatkan tiketnya dengan mengunci kuota selama 15 menit (15-Minute Atomic Stock Hold).
3. Universal Instant Payment Idea: Pembayaran tanpa ribet upload bukti transfer manual menggunakan pop-up resmi Midtrans Snap (QRIS & Virtual Account instan).
4. Zero-Duplicate Gate Idea: Mematikan praktik tiket palsu dan calo screenshot di pintu masuk konser menggunakan validasi kamera smartphone/laptop dengan teknologi database atomic row-locking.

---

### 5. SOLUSI PRODUK & FITUR KUNCI:
- Virtual Waiting Room: Ruang tunggu antrean digital berbasis waktu estimasi antrean untuk meratakan beban server.
- 15-Minute Atomic Stock Hold: Begitu checkout, stok tiket dikunci secara atomic di database agar aman selama proses bayar.
- Integrasi Midtrans Snap: Pop-up checkout otomatis menyediakan QRIS dinamis (GoPay, OVO, ShopeePay, DANA), Virtual Account (BCA, Mandiri, BNI, BRI), dan Kartu Kredit dengan webhook settlement instan.
- Anti-Fraud Gate Scanner: Kamera scanner web 15 FPS dengan Viewfinder dinamis, audio beep, dan query `lockForUpdate()`. Tiket yang pertama kali di-scan langsung berstatus USED, dan jika dicoba scan kedua kali akan langsung ditolak (ALREADY USED).
- Dual-Code Resolution: Scanner pintar mengenali baik Kode Tiket Resmi (TCK-...) maupun Nomor Pesanan (STX-...).
- Multi-Role Portal: Portal Customer, Portal Kru Gate Scanner, Dashboard Promotor, dan Admin Panel.

---

### 6. TECH STACK & ARSITEKTUR:
- Frontend: Next.js 16 (React 19, Turbopack, Tailwind CSS dengan Dark/Light Mode, Lucide Icons, Html5-QRCode).
- Backend: Laravel 11 RESTful API Engine, Sanctum Auth, Role-Based Access Control (RBAC).
- Database: SQLite / PostgreSQL dengan dukungan transaksi ACID & Atomic Locks.
- Integrasi Cloud: Midtrans Payment Gateway API & Supabase Authentication.

---

### 7. TARGET PASAR & MODEL BISNIS:
- Target B2B (Klien Utama): Promotor Konser, Event Organizer (EO) Musik, Pengelola Venue/Stadion, Panitia Acara Musik Kampus.
- Target B2C (Pengguna): Penggemar konser & penikmat musik rentang usia 17–40 tahun.
- Model Monetisasi (B2B SaaS):
  * Platform Service Fee: Rp25.000 per transaksi checkout.
  * Payment Processing Margin: Selisih MDR dari transaksi QRIS dan Virtual Account.
  * Promoter Revenue Sharing: Komisi 2.5% – 5% dari total omset tiket promotor.
  * Gate Crew Support: Layanan teknis hari-H dan pendampingan gerbang masuk.

---

### 8. KELEBIHAN PRODUK DIBANDINGKAN SISTEM LAIN:
- Zero Overbooking: Tidak ada risiko tiket terjual melebihi kapasitas stadion.
- Fair-War Engine: Pembatasan identitas KTP/NIK dan antrean virtual menekan gerak calo bot.
- Low Operational Cost: Validasi gate tidak perlu sewa alat scanner laser mahal; kru cukup menggunakan kamera smartphone atau laptop masing-masing.

---

### 9. RENCANA KE DEPAN (FUTURE ROADMAP):
- Fase 1 (Current): Platform Web Responsif, Integrasi Midtrans Snap, dan Web Gate Scanner.
- Fase 2: Aplikasi Mobile Native (Flutter/React Native) dengan fitur Offline-first Gate Scanner (tetap bisa scan tanpa sinyal internet di venue terpencil).
- Fase 3: Dynamic Rotating QR Code (QR Code barcode tiket berganti tiap 30 detik seperti Google Authenticator) untuk membasmi praktik calo screenshot tiket.
- Fase 4: Face Recognition Gate Check-in & NFT-based Collectible Tickets sebagai memorabilia konser digital.

---

### FORMAT OUTPUT YANG SAYA MINTA:
1. Outline Slide Presentasi (Slide 1 hingga Slide Penutup):
   - Judul Slide
   - Poin-Poin Kunci (Bullet points singkat, padat, profesional)
   - Saran Visual Layout Slide (grafik, diagram, mock-up yang cocok ditampilkan)
2. Naskah Ucapan Presenter (Presenter Speech / Script) untuk setiap slide:
   - Bahasa Indonesia yang percaya diri, lugas, santai, dan persuasif.
   - Durasi presentasi ideal sekitar 7–10 menit.
3. Rekomendasi Antisipasi Tanya Jawab (Q&A):
   - 3-5 pertanyaan kritis yang kemungkinan besar diajukan oleh dosen penguji atau calon investor, lengkap dengan jawaban cerdas dan teknisnya.
```

