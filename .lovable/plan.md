# Audit Improvement — IDX Right Issue Calculator

## Critical (bug, broken flow, data loss, security)

**1. [P0 | S] Edge function `active-rights` import CORS salah**
`import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'` — path ini tidak ada di paket supabase-js. Function bisa gagal cold-start. Solusi: definisikan `corsHeaders` inline (`'Access-Control-Allow-Origin': '*'`, dst) seperti pola standar Deno edge function.

**2. [P0 | S] Cache `active-rights` 30 menit + `s-maxage=1800` bisa serve data stale saat corporate action baru**
Investor bisa lihat RI expired. Solusi: turunkan TTL ke 5 menit, tambahkan field `expiresAt` per item, filter di client kalau `tradingEnd < today`.

**3. [P1 | S] `useAutoSave` tidak simpan `noOwnership` & field baru (stockCode ada, tapi state lain seperti view mode/simple mode tidak)**
Restore parsial bikin user bingung setelah reload. Solusi: audit state tersimpan vs state form, satukan schema, bump `SCHEMA_VERSION` ke 2 dengan migrator.

**4. [P1 | S] ErrorBoundary di App.tsx tidak reset saat route berubah**
Sekali error di `/ri/:ticker`, seluruh app stuck sampai reload. Solusi: reset `hasError` via `key={location.pathname}` atau `componentDidUpdate`.

**5. [P2 | M] Tidak ada rate-limit / abuse guard di edge function `stock-search` & `active-rights`**
Public endpoint tanpa JWT bisa di-scrape/DDoS. Solusi: tambah IP-based throttle (Deno KV) atau minimal `Cache-Control` + `ETag` yang benar.

## UI

**6. [P1 | S] `RightIssueInfoSection` ratio preset chips hanya muncul di mobile (`flex md:hidden`)**
Desktop user harus ketik manual padahal preset menghemat waktu. Solusi: tampilkan juga di desktop dengan layout inline kanan input.

**7. [P1 | S] `SmartResultBar` / `FloatingSummary` overlap dengan `BottomNav` di mobile**
Menutupi tombol tab. Solusi: tambah `bottom-[64px]` conditional saat mobile + `env(safe-area-inset-bottom)`.

**8. [P2 | M] `ResultsDashboard` 2x2 grid terasa datar setelah RI 1→5**
Tidak ada visual hierarchy antara metrik utama (TERP, harga rata baru) vs sekunder. Solusi: hero metric besar (TERP) + 3 secondary card kecil, warna semantic hijau/merah berdasarkan selisih vs cum-date.

**9. [P3 | S] Dark mode glassmorphism di card membuat teks muted-foreground kurang kontras (WCAG AA fail di beberapa card)**
Solusi: naikkan opacity background card ke 0.8, ubah muted-foreground ke `hsl(215 20% 75%)` di dark.

## UX flow

**10. [P0 | S] Setelah klik chip RI aktif di `ActiveRightsChips`, tidak ada scroll ke tombol Hitung atau autocalculate**
User bingung apa yang berubah. Solusi: setelah prefill, scroll ke `ResultsDashboard` + trigger calculate otomatis + toast "Data BRIS dimuat".

**11. [P1 | S] Landing `/ri/:ticker` CTA "Calculate" buka tab baru vs same-tab tidak jelas**
Solusi: same-tab dengan back button jelas di kalkulator ("← Kembali ke ringkasan BRIS").

**12. [P1 | M] Step-by-step wizard tidak bisa di-skip ke step tertentu**
User yang paham harus klik Next berkali-kali. Solusi: progress ring click-to-jump kalau step sebelumnya valid.

**13. [P2 | M] Tidak ada "Undo" setelah `clearStorage` / reset form**
Sekali reset, semua input hilang permanen. Solusi: soft-delete dengan snackbar undo 5 detik (pattern Gmail).

## Fitur core

**14. [P0 | M] Tidak ada perhitungan pajak & fee broker di scenario "Jual HMETD di pasar"**
Angka profit misleading. Solusi: field opsional fee beli/jual (default 0.15%/0.25%), PPh final 0.1%, terapkan di `ScenarioComparison`.

**15. [P1 | M] Belum ada perhitungan cash needed lengkap: user tebus X lot tapi tidak tahu total dana + sisa cash**
Solusi: tambah StatCard "Modal dibutuhkan" & "Cash setelah tebus" di `ResultsDashboard`.

**16. [P1 | L] Warrant hanya dihitung sebagai bonus lot, belum ada valuasi (harga waran teoritis via Black-Scholes atau intrinsic value)**
Solusi: input strike + expiry waran, hitung intrinsic + time value sederhana.

**17. [P2 | M] Tidak ada perbandingan dengan tidak-ikut-RI (biar dilusi eksplisit dalam Rupiah, bukan hanya %)**
Solusi: di `DilutionSimulator` tambah kolom "Kerugian dilusi (Rp)" berdasarkan TERP × lot terdilusi.

**18. [P3 | L] Belum support Private Placement / PMTHMETD yang makin sering dipakai emiten**
Solusi: mode kedua di kalkulator dengan formula berbeda (tanpa HMETD tradable).

## Onboarding

**19. [P1 | S] `OnboardingTour` step "body / center" welcome bisa di-skip tapi tidak ada preview hasil**
User belum tahu value prop sebelum isi form. Solusi: step pertama tampilkan animated GIF/lottie contoh hasil.

**20. [P2 | M] Tidak ada demo mode "Load contoh BRIS" yang jelas di empty state**
`loadDemo` ada tapi tersembunyi. Solusi: tombol besar "Coba dengan data BRIS" di `EmptyStateCard` di atas fold.

**21. [P3 | S] Tour tidak muncul ulang untuk fitur baru (versioning storage key)**
Solusi: `ri-onboarding-v2` saat rilis fitur baru + changelog modal.

## Data (persistence, export, backup)

**22. [P1 | M] `useCalculationHistory` hanya localStorage, hilang saat ganti device/clear browser**
Solusi: opsional sync ke Lovable Cloud dengan anonymous auth (device_id), RLS by device_id.

**23. [P1 | S] Export PDF tidak include screenshot chart `AnalysisCharts` & `DilutionSimulator`**
Solusi: html2canvas kedua komponen, embed sebagai image di PDF.

**24. [P2 | M] Belum ada export CSV/XLSX untuk `BudgetLotPlanner`**
Solusi: tombol "Ekspor Excel" di planner, gunakan `xlsxwriter` via SheetJS.

**25. [P2 | S] Tidak ada backup/restore history (JSON export/import)**
Solusi: menu Settings → Backup → Download JSON / Restore.

## Performance

**26. [P1 | S] `react-joyride`, `recharts`, `jspdf` semua di-eager-load walau lazy `Admin`**
Bundle awal berat. Solusi: lazy load `OnboardingTour`, `AnalysisCharts`, `ExportPDFButton` dengan Suspense.

**27. [P2 | M] `useActiveRights` fetch tiap mount tanpa React Query dedup**
Solusi: pindahkan ke `useQuery` dengan staleTime 5 menit + share cache lintas komponen.

**28. [P3 | S] `writeVersioned` autosave tiap 500ms bisa memicu localStorage quota exceed di long session**
Solusi: cek `try/catch` + fallback IndexedDB via idb-keyval.

## Mobile / responsive

**29. [P1 | S] `MobileNumpad` tidak dismiss saat scroll (menutupi hasil saat verifikasi angka)**
Solusi: dismiss on scroll >50px atau tombol collapse di header numpad.

**30. [P2 | M] Landscape mode di HP kecil bikin `BottomNav` + `StickyCalculateBar` makan >40% viewport**
Solusi: auto-hide sticky bar di landscape saat scroll down.

**31. [P3 | S] Tidak ada haptic feedback saat error validasi (`ratioError`)**
Solusi: `haptic('error')` pattern getar 3x pendek saat error muncul.

## Trust

**32. [P1 | S] Disclaimer di footer terlalu kecil, banyak user mobile skip**
Solusi: modal disclaimer sekali muncul di kalkulasi pertama + link permanen di ResultsDashboard.

**33. [P1 | S] Tidak ada "Sumber data" & "Terakhir diperbarui" di landing `/ri/:ticker`**
Trust rendah untuk SEO visitor. Solusi: badge "Diperbarui {tanggal} · Sumber: IDX/KSEI" di header ticker page.

**34. [P2 | M] Belum ada testimoni / social proof / jumlah pengguna**
Solusi: counter "10.000+ kalkulasi bulan ini" di landing (real dari analytics).

**35. [P3 | S] Tidak ada halaman /about atau /metodologi menjelaskan formula TERP**
Solusi: static page yang di-link dari InfoTooltip TERP.

## Monetisasi / konversi

**36. [P2 | L] Belum ada tier premium (unlimited history sync, watchlist RI, alert cum-date)**
Solusi: Lovable Cloud + Stripe, gate fitur sync history & email alert.

**37. [P2 | M] Belum ada affiliate broker (Ajaib/Stockbit/IPOT) di CTA "Beli lot tambahan"**
Solusi: tombol "Beli via {broker}" dengan tracking link, revenue-share.

**38. [P3 | M] Belum ada sponsored placement di `ActiveRightsChips` (highlight RI emiten yang bayar promosi)**
Solusi: field `sponsored:true`, badge kecil "Ad" — hati-hati compliance OJK.

## Retensi

**39. [P1 | M] Tidak ada notifikasi cum-date/trading-end untuk RI yang user sudah hitung**
User lupa exercise deadline. Solusi: Web Push (PWA) atau email opt-in H-3 cum-date.

**40. [P2 | M] Belum ada "Watchlist RI" — user tandai RI menarik lalu dapat update**
Solusi: bookmark button di landing ticker → simpan ke Cloud, halaman /watchlist.

**41. [P3 | S] Tidak ada streak / gamifikasi ringan ("Anda sudah hitung 5 RI bulan ini")**
Solusi: badge di header, mostly cosmetic.

## Growth

**42. [P1 | S] Sitemap dynamic sudah ada tapi tidak di-submit otomatis ke GSC / Bing**
Solusi: ping `https://www.google.com/ping?sitemap=...` di CI setelah generate.

**43. [P1 | M] Landing `/ri/:ticker` tidak punya konten unik cukup untuk ranking (hanya summary + CTA)**
SEO tipis. Solusi: tambahkan FAQ per ticker (auto-generated dari data RI: "Berapa TERP BRIS?", "Kapan cum-date?"), 300-500 kata unik.

**44. [P2 | M] Embed widget tidak punya backlink attribution otomatis**
Solusi: mini "Powered by RightIssue.id" link no-follow tapi trackable via UTM.

**45. [P2 | M] Belum ada share ke Twitter/X dengan preview image OG dinamis per ticker**
Solusi: edge function `og-image` generate PNG on-the-fly (Satori), set `og:image` di RiTicker.

**46. [P3 | L] Belum ada blog / edukasi long-form untuk SEO informasional ("apa itu HMETD", "cara hitung TERP")**
Solusi: content collection MDX 5-10 artikel pilar.

## Teknis

**47. [P1 | S] `supabase/config.toml` hanya declare `gsc-admin`, `active-rights` & `stock-search` tidak listed**
Bisa jadi verify_jwt default = true bikin fetch gagal. Solusi: tambah `[functions.active-rights] verify_jwt = false` dan sama untuk stock-search kalau public.

**48. [P1 | S] Test coverage tipis — hanya `useSwipeGesture.test.tsx`**
Solusi: unit test untuk formula TERP, `parseAnnouncement`, `useAutoSave` schema migration.

**49. [P2 | M] Tidak ada CI type-check + test di pre-commit / GitHub Actions**
Solusi: husky + lint-staged + gh actions workflow.

**50. [P2 | S] `analytics.ts` no-op sampai Plausible script di-load, tapi script belum ditambah ke `index.html`**
Semua event yang sudah di-track hilang. Solusi: tambah script tag Plausible sesuai catatan sebelumnya.

**51. [P3 | S] Bundle analyzer belum ada, sulit tahu culprit ukuran**
Solusi: `rollup-plugin-visualizer` sekali jalan untuk assessment.

---

## Top 10 Urutan Eksekusi (Lintas Kategori)

1. **#1** — Fix CORS import di `active-rights` (fungsi bisa down)
2. **#50** — Aktifkan Plausible script (analytics baseline)
3. **#10** — Auto-scroll + calculate setelah pilih chip RI aktif (UX kritis fitur baru)
4. **#47** — Config verify_jwt untuk edge functions publik
5. **#14** — Fee & pajak di ScenarioComparison (akurasi angka)
6. **#43** — FAQ per-ticker di landing (SEO growth cepat)
7. **#33** — "Sumber data · terakhir diperbarui" di landing (trust + SEO)
8. **#26** — Lazy load Joyride/Recharts/jsPDF (perf mobile)
9. **#4** — ErrorBoundary reset per route (stability)
10. **#39** — Web Push notifikasi cum-date (retention hook)

## 3 Ide yang Sengaja TIDAK Disarankan

- **AI-powered "should I subscribe" recommendation via LLM** — Trade-off: risiko regulasi OJK (nasihat investasi tanpa lisensi) + halusinasi angka. Kalkulator harus deterministik.
- **Login wajib untuk kalkulasi** — Trade-off: friction masif, drop conversion. Kalkulator utility harus tetap zero-friction; login hanya untuk fitur sync opsional.
- **Native mobile app (React Native / Capacitor)** — Trade-off: effort besar untuk audience kecil; PWA sudah cukup, biaya maintenance dua codebase tidak sebanding dengan retensi tambahan.
