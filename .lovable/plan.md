## Tujuan
Implementasi semua quick wins dari Section A (Bundle Size, Runtime Efficiency, UX Speed Perception) untuk turunkan initial bundle dan percepat perceived load time, terutama di mobile.

## Temuan Eksplorasi
- `lucide-react` dipakai di **49 file** (full barrel import). Vite dev serve seluruh modul (~157KB), tapi production build sudah tree-shake. Tetap ada gain dengan import per-icon path.
- `recharts` dipakai di **4 komponen** (ScenarioComparison, DilutionSimulator, AnalysisCharts via AdvancedAnalysisSection, BudgetAllocationChart). Sebagian besar sudah lazy via parent `index.tsx`, tapi `BudgetAllocationChart` masih eager di dalam BudgetLotPlanner. `chart.tsx` (shadcn) juga eager-import recharts.
- Poppins dimuat dari Google Fonts (render-blocking, ~64ms).
- `index.tsx` sudah punya `LazyFallback` Skeleton ✅
- Service Worker Workbox sudah aktif tapi `globPatterns` belum mencakup semua chunk lazy.
- `useMemo` belum digunakan di hot calculations dalam `ScenarioComparison` dan `DilutionSimulator` (DilutionSimulator sudah pakai, ScenarioComparison perlu cek).

## Scope Implementasi

### A1 — Bundle Size Reduction

**1. Lucide-react: tetap pakai named import**
Lucide-react v0.462 dengan Vite + tree-shaking sudah optimal di production build. Path import (`lucide-react/dist/esm/icons/x`) tidak stabil antar versi & merusak DX. **Skip** refactor 49 file — risk > reward. Sebagai gantinya: tambahkan `optimizeDeps.include` agar Vite pre-bundle lucide jadi satu chunk efisien.

**2. Lazy load recharts via per-component lazy**
- Bungkus `BudgetAllocationChart` dengan `React.lazy` di dalam `BudgetLotPlanner.tsx`.
- Verifikasi `AnalysisCharts` sudah lazy via `AdvancedAnalysisSection` (parent sudah lazy ✅).
- Tambah `manualChunks` di Vite config untuk pisahkan recharts ke chunk sendiri (`vendor-charts`).

**3. Manual chunk splitting di vite.config.ts**
Pisahkan vendor besar ke chunk terpisah:
- `vendor-react` (react, react-dom, react-router-dom)
- `vendor-charts` (recharts)
- `vendor-radix` (semua @radix-ui/*)
- `vendor-pdf` (jspdf, html2canvas) — sudah lazy, tetap pisah chunk

**4. Self-host Poppins (subset Latin)**
- Hapus `<link>` Google Fonts dari `index.html`.
- Tambah `@font-face` di `src/index.css` dengan `font-display: swap`.
- Download woff2 Latin subset (400/500/600/700) ke `public/fonts/poppins/`.
- Tambah `<link rel="preload" as="font" type="font/woff2" crossorigin>` untuk weight 400 & 600 (paling sering dipakai).
- Update Workbox `globPatterns` agar font ter-cache.

### A2 — Runtime Efficiency

**5. Memoize kalkulasi berat di ScenarioComparison**
- Audit `ScenarioComparison.tsx` — bungkus derived calculations (P/L per skenario, chart data) dalam `useMemo`.
- Verifikasi `DilutionSimulator` sudah pakai `useMemo` ✅ (sudah ada).

**6. Skip virtualisasi lot list**
Tidak ada list lot yang ditampilkan ke UI (perhitungan numerik saja). **Skip** — tidak relevan.

**7. Tune Service Worker pre-cache**
- Tambah `js` chunks ke `globPatterns` (sudah include `**/*.{js,...}` ✅).
- Tambah strategy `StaleWhileRevalidate` untuk JS/CSS chunks agar return visitor instant load.
- Tambah `cleanupOutdatedCaches: true` agar SW lama auto-purge.

### A3 — UX Speed Perception

**8. Skeleton loaders kontekstual**
- `LazyFallback` saat ini generic. Buat 2 varian:
  - `ChartSkeleton` (mirip ukuran chart asli — 200px tinggi, dengan pulse bar shapes)
  - `SectionSkeleton` (untuk Education, BudgetPlanner)
- Pasang per-Suspense boundary dengan skeleton yang sesuai.

**9. Optimistic UI (sudah sebagian ada)**
Hasil utama (`ResultsDashboard`, summary numbers) di-render instant tanpa Suspense boundary. Komponen berat (charts, what-if, dilution) sudah di balik Suspense. **Sudah optimistic by design ✅** — verifikasi tidak ada blocking parent.

**10. Prefetch idle chunks**
- Tambah hook `useIdlePrefetch()` di `index.tsx`:
  - Saat `requestIdleCallback` available, panggil dynamic `import()` untuk: BudgetLotPlanner, EducationSection, AdvancedAnalysisSection.
  - Trigger setelah app mount + 2 detik.
- Browser akan cache chunk → saat user buka tab, instant.

## Detail Teknis

### File yang Diubah
| File | Perubahan |
|---|---|
| `vite.config.ts` | Tambah `build.rollupOptions.output.manualChunks`, `optimizeDeps.include`, update Workbox config |
| `index.html` | Hapus Google Fonts link, tambah preload font lokal |
| `src/index.css` | Tambah `@font-face` Poppins lokal |
| `public/fonts/poppins/*.woff2` | (Skip download manual — pakai unicode-range subset di @font-face dengan tetap fetch dari fonts.gstatic.com tapi dengan preload + caching SW) |
| `src/components/RightIssueCalculator/index.tsx` | Tambah `useIdlePrefetch`, ganti `LazyFallback` → skeleton kontekstual |
| `src/components/RightIssueCalculator/BudgetLotPlanner.tsx` | Lazy `BudgetAllocationChart` |
| `src/components/RightIssueCalculator/ScenarioComparison.tsx` | Wrap kalkulasi dalam `useMemo` |
| `src/components/RightIssueCalculator/ChartSkeleton.tsx` | **Baru** — skeleton untuk chart loading |

### Decision: Self-host vs Google Fonts
Self-host woff2 perlu file binary (woff2) yang sulit dibuat di sandbox tanpa download. **Pendekatan praktis**: tetap pakai Google Fonts CDN tapi tambah `<link rel="preload">` untuk CSS, dan SW sudah cache fonts.gstatic.com. Hasil: hampir setara self-host tanpa kerumitan.

### Manual Chunks Strategy
```text
dist/assets/
  vendor-react-[hash].js     ~45KB (react, react-dom, router)
  vendor-radix-[hash].js     ~80KB (all @radix-ui)
  vendor-charts-[hash].js    ~140KB (recharts) — lazy-loaded
  vendor-pdf-[hash].js       ~250KB (jspdf+html2canvas) — lazy-loaded
  index-[hash].js            ~60KB (app code)
  [section]-[hash].js        ~5-15KB each (lazy sections)
```

## Yang TIDAK Dilakukan (Out of Scope)
- ❌ Refactor 49 file lucide imports — minimal gain di production, high risk
- ❌ Replace recharts dengan visx/chart.js — ini refactor besar, perlu plan terpisah
- ❌ Virtualisasi list — tidak ada list panjang di UI
- ❌ Self-host font dengan download binary — pakai pendekatan hybrid (preload + SW cache)

## Hasil yang Diharapkan
- Initial bundle production: **~30-40% lebih kecil** karena recharts/pdf dipisah ke lazy chunks
- Repeat visit: **<1s** load (SW cache + manual chunks stabil hash)
- Tab switch (BudgetPlanner, Education): **instant** (idle prefetch)
- Charts loading: skeleton kontekstual, no layout shift

## Verifikasi
1. Build production lalu cek `dist/assets/` — pastikan recharts di chunk terpisah
2. Browser test viewport mobile — capture performance profile
3. Network tab: verifikasi font preload + SW caching
4. Console: tidak ada warning baru