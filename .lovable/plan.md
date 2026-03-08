

# Plan: Perbaikan UI, Embed Watermark, Footer, Tooltip, dan Mobile

## Ringkasan
6 perubahan: (1) icon bahasa jadi teks ID/EN saja, (2) watermark alfindigital.com di embed, (3) footer dengan "made with love by alfindigital", (4) samakan InfoTooltip di Budget Planner, (5) cek mobile responsiveness dan PWA, (6) verifikasi kalkulasi.

---

## 1. Language Toggle - Hapus Icon, Teks Saja

**File:** `src/components/RightIssueCalculator/LanguageToggle.tsx`

Hapus import `Languages` dari lucide-react. Hapus elemen icon `<Languages>`. Tombol hanya menampilkan teks "ID" atau "EN" (uppercase, bold).

Layout tombol:
```
Sebelum: [🌐 ID]
Sesudah: [ID] atau [EN]
```

---

## 2. Watermark alfindigital.com di Embed Widget

**File:** `src/components/EmbedCalculator/MiniCalculator.tsx`

Ubah bagian "Powered by" di footer widget dari "Right Issue Calculator" menjadi watermark promosi alfindigital.com:

```
Sebelum: Powered by Right Issue Calculator
Sesudah: Powered by alfindigital.com
```

Link mengarah ke `https://alfindigital.com` (bukan window.location.origin).

---

## 3. Footer dengan "Made with Love"

**File:** `src/components/RightIssueCalculator/index.tsx`

Ubah footer dari:
```
© alfindigital
```
Menjadi:
```
Made with [heart icon] by alfindigital
```

- Heart icon menggunakan `Heart` dari lucide-react (filled, warna merah/pink)
- "alfindigital" tetap hyperlink ke https://alfindigital.com
- Ukuran teks tetap kecil (text-[11px]) agar minimalis

---

## 4. Samakan InfoTooltip di Budget Planner

**File:** `src/components/RightIssueCalculator/BudgetLotPlanner.tsx`

Tambahkan `InfoTooltip` pada label-label di Budget Planner, konsisten dengan format yang digunakan di `RightIssueInfoSection` dan `OwnershipSection`:

| Label | Tooltip ID | Tooltip EN |
|-------|-----------|-----------|
| Rasio RI | "Contoh: 2:1 berarti setiap 2 lembar lama berhak 1 lembar baru." | "Example: 2:1 means every 2 old shares entitled to 1 new share." |
| Harga Pelaksanaan | "Harga per lembar untuk menebus right issue." | "Price per share to exercise the right issue." |
| Harga Cum Date | "Harga saham terakhir sebelum ex-date." | "Last stock price before ex-date." |
| Harga Avg Saat Ini | "Harga rata-rata pembelian saham Anda saat ini." | "Your current average purchase price." |
| Bonus Waran | "Centang jika right issue memberikan bonus waran." | "Check if RI provides bonus warrants." |
| Total Budget | "Total dana yang tersedia untuk investasi." | "Total funds available for investment." |
| Sertakan Dana Tebus | "Apakah budget sudah termasuk dana untuk menebus RI." | "Whether the budget includes funds to exercise RI." |

Import `InfoTooltip` dari `./InfoTooltip` dan tambahkan di setiap label yang relevan.

---

## 5. Mobile Responsiveness dan PWA

**Verifikasi (tidak perlu perubahan kode jika sudah OK):**

- PWA config sudah lengkap di `vite.config.ts` (manifest, workbox, icons)
- Meta tags PWA sudah ada di `index.html` (apple-mobile-web-app-capable, theme-color, viewport)
- `OfflineIndicator` dan `PWAUpdatePrompt` sudah ada
- Viewport sudah set `maximum-scale=1.0, user-scalable=no` untuk mobile
- `navigateFallbackDenylist` perlu ditambah `/~oauth` sesuai best practice

**Perubahan kecil:**
- `vite.config.ts`: tambahkan `/^\/~oauth/` ke `navigateFallbackDenylist`

---

## 6. Verifikasi Kalkulasi

Setelah perubahan, akan dilakukan tes otomatis pada:
- Kalkulator RI utama (TERP, lot baru, avg baru, waran)
- Budget Planner (rekomendasi lot optimal)
- Embed widget (kalkulasi mini)

---

## Detail Teknis - File yang Diubah

### `src/components/RightIssueCalculator/LanguageToggle.tsx`
- Hapus import `Languages` dari lucide-react
- Hapus elemen `<Languages>` icon
- Pertahankan animasi dan styling, hanya tampilkan teks ID/EN

### `src/components/EmbedCalculator/MiniCalculator.tsx`
- Ubah href di "Powered by" ke `https://alfindigital.com`
- Ubah teks dari "Right Issue Calculator" ke "alfindigital.com"

### `src/components/RightIssueCalculator/index.tsx`
- Import `Heart` dari lucide-react
- Ubah footer menjadi "Made with [heart] by alfindigital"

### `src/components/RightIssueCalculator/BudgetLotPlanner.tsx`
- Import `InfoTooltip` dari `./InfoTooltip`
- Tambahkan InfoTooltip pada 7 label form

### `vite.config.ts`
- Tambahkan `/^\/~oauth/` ke navigateFallbackDenylist

