# Plan: Konsolidasi Section dengan Progressive Disclosure

Mengurangi cognitive load dari 15+ section terpisah menjadi 6 section utama yang dikelompokkan secara logis. Pemula tidak overwhelmed, power user tetap bisa akses semua fitur via expand/sub-tabs.

## Struktur Baru (Setelah Konsolidasi)

```
1. INPUT  (selalu terlihat)
   ├─ StockCodeInput
   ├─ RightIssueInfoSection (info RI + warrant)
   └─ OwnershipSection (kepemilikan / no-ownership mode)

2. HASIL UTAMA  (muncul setelah Hitung)
   ├─ ResultsDashboard (hero card + 2x2 grid)
   └─ ConclusionSection (rekomendasi)

3. PERENCANAAN LOT  (collapsible, default: open)
   └─ LotOptimizationSection + WarrantSection (jika hasWarrant)
      Catatan: BudgetLotPlanner tetap di tab "Budget" (use-case berbeda)

4. SKENARIO & PROYEKSI  (collapsible, default: closed — sub-tabs di dalam)
   ├─ Tab "Skenario"      → ScenarioComparison
   ├─ Tab "What-If Harga" → WhatIfTargetPrice
   └─ Tab "Break-Even"    → BreakEvenROICalculator (jika ada)

5. DAMPAK KEPEMILIKAN  (collapsible, default: closed)
   ├─ DilutionSimulator (PieChart)
   └─ Mini-summary OwnershipSection (badge: "kepemilikan turun X%")

6. ANALISIS LANJUTAN  (collapsible, default: closed)
   └─ AdvancedAnalysisSection (price comparison chart)

PELAJARI RI  → tetap di tab "Education" (tidak digabung ke Calculator,
              karena konten panjang & target audience beda)
```

Hasil: dari **8 section flat** di tab Calculator → **6 section utama** dengan 3 di antaranya collapsed by default. Initial scroll length berkurang ~60% pada mobile.

## Komponen Baru

**`CollapsibleSection.tsx`** — wrapper reusable berbasis Radix `Collapsible` (sudah ada di `src/components/ui/collapsible.tsx`):
- Props: `title`, `icon`, `subtitle?`, `defaultOpen`, `badge?` (untuk preview metric saat collapsed, contoh: "Dilusi: 15%"), `storageKey?` (persist open/close state ke localStorage per-section).
- Header: chevron rotate + smooth animation (`data-[state=open]:animate-accordion-down`).
- Tetap rounded-2xl + glassmorphism style sesuai memory.
- Saat collapsed, tampilkan 1-line preview value supaya user tahu isinya tanpa expand.

**`ScenarioProjectionTabs.tsx`** — internal sub-tabs untuk grup #4:
- Pakai komponen `Tabs` yang sudah ada, variant lebih ringan (pill style).
- Lazy-mount tab content (hanya render aktif tab) untuk hemat render.

## Perubahan File

**`src/components/RightIssueCalculator/index.tsx`**
- Refactor `renderCalculatorContent()` (full mode, baris 651-722) — bungkus section dengan `CollapsibleSection`.
- Susun ulang urutan: Input → Results → Lot Planning → Scenarios (sub-tabs) → Dilution → Advanced.
- Wizard mode (baris 526-647) tetap apa adanya — wizard sudah progressive by design.
- Pindahkan `WarrantResultSection` ke dalam grup "Perencanaan Lot".

**`src/components/RightIssueCalculator/CollapsibleSection.tsx`** — komponen baru.

**`src/components/RightIssueCalculator/ScenarioProjectionTabs.tsx`** — komponen baru, gabungkan ScenarioComparison + WhatIfTargetPrice + BreakEvenROI dalam Tabs.

**`src/contexts/LanguageContext.tsx`** — tambah translations:
- `section.lotPlanning` ("Perencanaan Lot" / "Lot Planning")
- `section.scenarios` ("Skenario & Proyeksi" / "Scenarios & Projection")
- `section.dilution` ("Dampak Kepemilikan" / "Ownership Impact")
- `section.advanced` ("Analisis Lanjutan" / "Advanced Analysis")
- Sub-tab labels.

## Detail UX

**Preview badges saat collapsed** (penting untuk UX) — user tidak perlu expand untuk lihat metric kunci:
- Lot Planning: "+X lot saran" atau "Sudah optimal"
- Scenarios: "Best: Ikut RI (+Rp X jt)"
- Dilution: "Kepemilikan turun X%" (warna merah jika >5%)
- Advanced: "Lihat chart perbandingan"

**State persistence** — simpan open/closed state per section ke `localStorage` (key: `ri-section-{name}`) supaya user tidak perlu re-expand setiap kali. Default state hanya berlaku first-visit.

**Smooth animations** — pakai Radix data-state animations + `animate-fade-in` untuk content. Hindari layout shift dengan placeholder height saat lazy chunk loading (sudah pakai `ChartSkeleton`).

**Mobile-first** — collapsible header full-width tappable (min 44x44px touch target), chevron di kanan.

**Backward compatibility** — fitur yang sudah ada tetap berfungsi 100%, hanya layout/grouping berubah. PDF export, share buttons, history, floating summary tidak terdampak.

## Out of Scope

- BudgetLotPlanner tetap di tab terpisah (use-case beda: planning dari budget vs analysis dari kepemilikan).
- EducationSection tetap di tab terpisah (konten edukasi panjang, target pemula).
- Wizard mode tidak diubah (sudah step-by-step).
- Tidak ada perubahan kalkulasi/business logic.

## Verifikasi

- Typecheck pass.
- Console clean (no forwardRef warnings dari komponen baru).
- Test manual: expand/collapse persist setelah reload, sub-tab switching tidak re-trigger calculation, lazy chunks tetap prefetched via `useIdlePrefetch`.
- Visual QA di mobile (375px) dan desktop.

## Setelah Approve

Setelah selesai implementasi, perlu Publish ulang ke `rightissue.lovable.app`.
