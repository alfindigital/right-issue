

# Plan: Fix Build Errors + Implement Features 2, 3, 5, 6

## Ringkasan

Fix 2 build errors (NodeJS namespace), lalu implementasi 4 fitur:
- **#2** Shareable Result Card (sudah ada via ExportTemplate, perlu polish)
- **#3** Progress Ring di wizard header
- **#5** Floating Summary Bar saat scroll
- **#6** Glassmorphism dark mode cards

---

## 0. Fix Build Errors (Pre-requisite)

**Files:** `src/hooks/useAutoSave.ts`, `src/components/RightIssueCalculator/ScenarioComparison.tsx`

Ganti `NodeJS.Timeout` dengan `ReturnType<typeof setTimeout>` di kedua file. Ini menghilangkan dependency pada namespace NodeJS yang tidak tersedia.

---

## 1. Shareable Result Card — Polish (#2)

**Analisis:** Fitur "Save as Image" sudah ada di `ShareButtons.tsx` menggunakan `html2canvas` + `ExportTemplate.tsx`. Yang perlu ditambah:

**File:** `src/components/RightIssueCalculator/ExportTemplate.tsx`
- Tambah QR code atau URL alfindigital.com sebagai watermark di bagian bawah card
- Tambah tanggal kalkulasi (timestamp)
- Polish layout agar lebih "Instagram-story friendly" (aspect ratio tetap 480px width)

**File:** `src/components/RightIssueCalculator/ShareButtons.tsx`
- Tambah opsi "Share to Instagram Story" (copy image to clipboard) selain download
- Improve toast feedback setelah save

---

## 2. Progress Ring di Wizard Header (#3)

**File baru:** `src/components/RightIssueCalculator/ProgressRing.tsx`

Komponen SVG circular progress:
- Props: `percent` (0-100), `size` (default 36px)
- SVG circle dengan `stroke-dasharray` dan `stroke-dashoffset` animasi
- Warna primary, background muted
- Teks persentase di tengah (font-size kecil)

**File:** `src/components/RightIssueCalculator/index.tsx`
- Hitung completion percentage berdasarkan field yang sudah terisi (rasio, harga RI, cum date price, lots, avg price = masing-masing ~20%)
- Render `ProgressRing` di header bar sebelah kanan, hanya tampil saat wizard mode aktif dan belum calculated
- Animasi smooth transition saat percentage berubah

---

## 3. Floating Summary Bar (#5)

**File baru:** `src/components/RightIssueCalculator/FloatingSummary.tsx`

Komponen sticky bar yang muncul saat `ResultsDashboard` keluar dari viewport:
- Gunakan `IntersectionObserver` pada `resultRef`
- Bar berisi: Stock code (jika ada) | Avg Price baru | TERP | Rekomendasi icon
- Posisi fixed top, z-50, backdrop-blur, slide-down animation
- Auto-hide saat scroll kembali ke atas (results visible)
- Hanya tampil setelah `isCalculated = true`

**File:** `src/components/RightIssueCalculator/index.tsx`
- Tambah ref pada ResultsDashboard section
- Render `FloatingSummary` dengan data kalkulasi
- Props: `isVisible`, `stockCode`, `avgPrice`, `terp`, `recommendation`

---

## 4. Glassmorphism Dark Mode (#6)

**File:** `src/index.css`

Update `.card-calculator` dan card-related classes di dark mode:

```css
.dark .card-calculator {
  background: hsl(var(--card) / 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid hsl(var(--primary) / 0.08);
  box-shadow: 
    0 4px 24px -4px hsl(0 0% 0% / 0.3),
    inset 0 1px 0 hsl(var(--primary) / 0.05);
}
```

Tambah juga untuk:
- `.dark .info-box` — subtle glass effect
- `.dark .input-calculator:focus` — glow ring yang lebih visible
- Header gradient dark mode — lebih subtle dan glass-like
- Stat cards di ResultsDashboard — border glow on hover di dark mode

**File:** `src/components/RightIssueCalculator/StatCard.tsx`
- Tambah conditional dark mode class untuk subtle border glow animation

---

## Detail Teknis — Urutan Implementasi

1. Fix build errors (`ReturnType<typeof setTimeout>`)
2. Glassmorphism CSS (index.css + StatCard)
3. Progress Ring component + integrasi wizard
4. Floating Summary Bar component + integrasi
5. Polish ExportTemplate + ShareButtons

**Total file baru:** 2 (`ProgressRing.tsx`, `FloatingSummary.tsx`)
**File diubah:** 6 (`useAutoSave.ts`, `ScenarioComparison.tsx`, `index.css`, `StatCard.tsx`, `index.tsx`, `ExportTemplate.tsx`)

