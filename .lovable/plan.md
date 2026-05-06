

# Plan: Logo & Favicon Refresh

## Ringkasan
Buat logo SVG kustom (ikon chart + arrow up) yang merepresentasikan Right Issue / growth, lalu gunakan sebagai favicon, PWA icon, watermark di header/footer, dan share card.

## 1. Buat Logo SVG Component

**File baru:** `src/components/RightIssueCalculator/Logo.tsx`

Komponen SVG inline — desain: bar chart sederhana (3 bar ascending) dengan arrow pointing up, warna primary (blue gradient). Props: `size`, `className`, `withText` (opsional tampilkan "RI Calc" di samping).

## 2. Generate PNG untuk Favicon & PWA Icons

**File:** `public/favicon.svg` — SVG version untuk favicon  
**File:** `public/pwa-192x192.png` — Generate ulang dengan desain baru  
**File:** `public/pwa-512x512.png` — Generate ulang dengan desain baru  

Akan menggunakan AI image generation untuk membuat PNG icons yang clean dan recognizable di ukuran kecil.

## 3. Update index.html

**File:** `index.html`
- Tambah `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`
- Update apple-touch-icon reference

## 4. Update Header & Footer dengan Logo

**File:** `src/components/RightIssueCalculator/index.tsx`
- Import `Logo` component
- Render logo di samping title di header (ukuran ~24px)
- Render logo kecil di footer sebagai branding

## 5. Update ExportTemplate Watermark

**File:** `src/components/RightIssueCalculator/ExportTemplate.tsx`
- Tambah inline SVG logo di footer section (sebelah "alfindigital.com")
- Logo dalam warna putih/semi-transparent agar cocok dengan dark background template

## 6. Update PWA Manifest

**File:** `vite.config.ts`
- Icon references tetap sama (path tidak berubah), hanya file PNG-nya yang di-replace

## Detail Teknis

Logo SVG design:
- 3 ascending bars (representing growth/chart)
- Arrow pointing up-right dari bar terakhir
- Rounded corners, modern flat style
- Primary color: `#3b82f6` (blue-500) dengan gradient ke `#60a5fa`
- Compact dan readable di 16x16 (favicon) maupun 512x512

**Total file baru:** 2 (`Logo.tsx`, `favicon.svg`)
**File diubah:** 4 (`index.html`, `index.tsx`, `ExportTemplate.tsx`, PNG files replaced)

