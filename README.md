# GARUT JOURNEY — TOUR & TRAVEL PLATFORM
**Platform Resmi Tour & Travel Wisata Garut, Jawa Barat**

PT Garut Journey Nusantara — Menghubungkan wisatawan dengan keindahan alam Gunung Papandayan, Geothermal Kawah Kamojang, Situ Bagendit, Situ Cangkuang, dan Curug Sanghyang Taraje melalui pemesanan online instan dan pembayaran aman.

---

## 1. Arsitektur & Teknologi

- **Frontend**: React SPA dengan TypeScript, Tailwind CSS v4, Lucide Icons, Google Fonts (Playfair Display & Plus Jakarta Sans).
- **Backend**: Node.js & Express API, validasi Zod, arsitektur Payment Gateway terabstraksi.
- **Database**: Supabase PostgreSQL dengan skema 10 tabel, Row Level Security (RLS), snapshot pricing, dan fungsi reservasi kuota atomik.
- **Payment Gateway**: Midtrans Snap API (Server-Side token creation, SHA512 signature verification, penanganan notifikasi webhook idempotent).
- **Notifikasi**: Email Transaksional otomatis (Booking Dibuat, E-Ticket Pembayaran Berhasil) dan direct generator link WhatsApp ke admin/pemandu.
- **SEO & Search Console**: Dynamic Sitemap XML (`/sitemap.xml`), `robots.txt`, Schema.org (TravelAgency & TouristTrip), OpenGraph, dan Twitter Card.

---

## 2. Struktur Database (10 Tabel Utama)

File migrasi SQL lengkap terletak di: `supabase/migrations/20261019_init_garut_journey.sql`

1. `profiles`: Data pengguna, role (`customer`, `guide`, `admin`, `super_admin`).
2. `tour_packages`: Master paket wisata, slug unik, rincian itinerary, harga dasar, titik penjemputan, fasilitas.
3. `package_images`: Galeri foto destinasi Garut berkualitas tinggi, rasio gambar, alt text SEO.
4. `departure_schedules`: Jadwal tanggal keberangkatan, total kapasitas, kuota terisi, status open/sold out.
5. `bookings`: Data transaksi pesanan, nomor booking (`GJ-XXXXXX-XXXX`), token keamanan akses (`access_token`), status, total pembayaran, tenggat waktu bayar.
6. `booking_items`: Snapshot harga dan rincian item paket & add-ons saat pesanan dibuat (kebal terhadap perubahan harga master).
7. `payments`: Riwayat pembayaran Midtrans, snap token, payment type (QRIS, VA Bank, Kartu), status transaksi.
8. `payment_events`: Catatan webhook mentah untuk audit trail dan pencegahan duplikasi event (idempotency key).
9. `promotions`: Kode promo voucher (`GARUTASRI10`, `EXPLOREGARUT`, `FAMILYTRIP`), diskon %, min spend, kuota penggunaan.
10. `site_settings`: Profil legalitas PT Garut Journey Nusantara, nomor WhatsApp, nomor rekening bank, durasi timeout holding kursi.

---

## 3. Instalasi & Pengujian Lokal

### Prasyarat
- Node.js versi 18 atau lebih baru.
- npm / npx.

### Langkah-langkah
```bash
# 1. Salin konfigurasi environment
cp .env.example .env

# 2. Install dependensi
npm install

# 3. Jalankan automated test suite backend
npm test

# 4. Jalankan server pengembangan full-stack (Express + Vite)
npm run dev
```

Aplikasi dapat diakses pada browser di: `http://localhost:3000`

---

## 4. Konfigurasi Midtrans Sandbox

1. Buat akun di [Midtrans Dashboard](https://dashboard.midtrans.com/) dan ubah mode ke **Sandbox Environment**.
2. Masuk ke menu **Settings > Access Keys**:
   - Salin **Server Key** ke `MIDTRANS_SERVER_KEY` pada file `.env`.
   - Salin **Client Key** ke `MIDTRANS_CLIENT_KEY` pada file `.env`.
3. Masuk ke menu **Settings > Configuration**:
   - Masukkan URL Payment Notification Webhook:
     `https://domain-anda.com/api/payments/midtrans-webhook`
   - Pastikan opsi **Append Notification URL** aktif.
4. **Simulator Bawaan**: Jika Anda menguji di lingkungan sandbox AI Studio tanpa IP publik, aplikasi telah dilengkapi **Midtrans Sandbox Simulator Modal** interaktif yang secara akurat mereproduksi alur bayar settlement, pending, cancel, dan pelepasan kuota kursi.

---

## 5. Konfigurasi Supabase PostgreSQL

1. Buat project baru di [Supabase Dashboard](https://supabase.com/).
2. Buka **SQL Editor** pada project Supabase Anda.
3. Jalankan skrip migrasi dari file `supabase/migrations/20261019_init_garut_journey.sql`.
4. Jalankan skrip seed awal dari file `supabase/seed.sql`.
5. Salin `Project URL`, `anon key`, dan `service_role key` ke file `.env`:
   ```env
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

---

## 6. Kredensial Administrator Bawaan

Akses dashboard admin melalui navigasi `/admin`:
- **Email Admin**: `admin@garutjourney.id`
- **Password**: `garutadmin2026`

Fitur Dashboard Admin:
- Metrik KPI real-time (Pendapatan terverifikasi dari settlement resmi, jumlah booking, pending, pembatalan).
- Manajemen Operasional Booking (Update status keberangkatan tanpa mengubah status bayar).
- Manajemen Paket Wisata & Galeri Destinasi.
- Manajemen Jadwal Keberangkatan & Kontrol Kuota Kursi.
- Audit Trail Webhook Pembayaran & Validasi Idempotensi.
- Ekspor Laporan Penjualan CSV satu-klik.
- Log Email Transaksional & Pengaturan Bisnis.

---

## 7. Checklist Pengujian Sebelum Produksi

- [x] Kalkulasi harga resmi dihitung di server (mencegah manipulasi harga dari browser).
- [x] Kuota kursi diamankan secara atomik (mencegah dua pelanggan merebut 1 kursi terakhir).
- [x] Akses booking pelanggan dilindungi token kriptografis acak (mencegah akses data pesanan orang lain).
- [x] Webhook Midtrans diverifikasi menggunakan signature key SHA512.
- [x] Validasi nominal webhook dicocokkan dengan snapshot transaksi database.
- [x] Notifikasi webhook duplikat ditangani secara idempotent (`payment_events`).
- [x] Timer kedaluwarsa 60 menit otomatis membatalkan pesanan yang belum dibayar dan mengembalikan kapasitas kursi.
- [x] Tampilan mobile-first responsif mematuhi batas sticky header $\le 15\%$.
- [x] Meta SEO, OpenGraph, Canonical, dan Sitemap XML dinamis aktif.
