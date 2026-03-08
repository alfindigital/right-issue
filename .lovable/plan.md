

## Ide Improvement untuk Right Issue Calculator — Prioritas untuk Investor IDX

Berikut rekomendasi fitur berurutan dari yang paling berdampak:

---

### 1. Dilusi Kepemilikan Simulator (High Priority)
**Masalah:** Investor sering tidak sadar seberapa besar persentase kepemilikan mereka terdilusi jika tidak ikut RI.
**Solusi:** Tambahkan visualisasi sebelum vs sesudah RI yang menunjukkan:
- % kepemilikan sebelum RI
- % kepemilikan jika ikut penuh, ikut sebagian, atau tidak ikut
- Donut chart perbandingan dilusi

Ini bisa ditambahkan sebagai section baru di hasil kalkulasi atau tab terpisah.

---

### 2. Notifikasi & Kalender Jadwal RI (High Priority)
**Masalah:** Investor sering terlewat tanggal penting (cum-date, ex-date, recording date, trading HMETD, exercise date).
**Solusi:** Input tanggal-tanggal penting RI, lalu tampilkan:
- Timeline visual horizontal
- Countdown ke tanggal terdekat
- Opsi export ke Google Calendar (.ics)
- Reminder badge jika mendekati deadline

---

### 3. Fetch Data Emiten Otomatis via Kode Saham (Medium-High)
**Masalah:** User harus input manual rasio, harga RI, dan harga cum-date.
**Solusi:** Ketika user mengetik kode saham (misal BBRI), auto-populate data RI yang sedang berlangsung dari database/API. Bisa menggunakan:
- Supabase table berisi data RI aktif yang di-maintain manual/berkala
- Atau scraping dari sumber publik

Ini akan sangat mengurangi friction dan potensi input error.

---

### 4. Multi-Skenario "What If" dengan Target Harga (Medium)
**Masalah:** Fitur ScenarioComparison sudah ada, tapi belum bisa custom target harga.
**Solusi:** Tambahkan input "Target Harga Jual" dimana investor bisa:
- Masukkan beberapa target harga (misal Rp 1.500, 2.000, 2.500)
- Lihat profit/loss di setiap target untuk skenario ikut RI vs tidak
- Tabel perbandingan ROI per target harga

---

### 5. Panduan Edukasi Interaktif (Medium)
**Masalah:** Banyak investor retail tidak paham mekanisme RI, HMETD, TERP, dilusi.
**Solusi:** Tambahkan section "Pelajari" atau guided tour:
- Glosarium istilah RI (HMETD, TERP, cum-date, ex-date, dll)
- Step-by-step visual: "Apa yang terjadi saat emiten RI?"
- FAQ interaktif dengan contoh angka nyata
- Bisa sebagai tab ketiga atau drawer/modal

---

### 6. Export Laporan PDF Lengkap (Medium-Low)
**Masalah:** ExportTemplate sudah ada tapi terbatas. Investor butuh dokumen lengkap untuk diskusi/arsip.
**Solusi:** Generate PDF satu halaman berisi:
- Semua input parameter
- Hasil kalkulasi lengkap
- Chart analisis
- Rekomendasi HMETD
- Timestamp dan disclaimer

Bisa menggunakan html2canvas (sudah terinstall) + jsPDF.

---

### 7. Perbandingan RI Antar Emiten (Low)
**Masalah:** Kadang ada beberapa emiten RI bersamaan, investor bingung prioritas.
**Solusi:** Fitur side-by-side comparison 2-3 emiten RI:
- Bandingkan diskon RI price vs market price
- Bandingkan potensi dilusi
- Bandingkan nilai HMETD
- Ranking otomatis mana yang paling menguntungkan

---

### Ringkasan Prioritas

| # | Fitur | Impact | Effort |
|---|-------|--------|--------|
| 1 | Dilusi Kepemilikan Simulator | Tinggi | Rendah |
| 2 | Kalender & Timeline Jadwal RI | Tinggi | Sedang |
| 3 | Auto-fetch Data Emiten | Tinggi | Tinggi |
| 4 | What-If Target Harga | Sedang | Sedang |
| 5 | Panduan Edukasi Interaktif | Sedang | Sedang |
| 6 | Export PDF Lengkap | Sedang | Rendah |
| 7 | Perbandingan Antar Emiten | Rendah | Tinggi |

Rekomendasi: Mulai dari **#1 (Dilusi Simulator)** karena impact tinggi dengan effort rendah — cukup tambahkan visualisasi dari data yang sudah tersedia di kalkulator.

