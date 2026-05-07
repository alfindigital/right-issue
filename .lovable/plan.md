
# Plan: 4 UX Improvements

Implementasi 4 fitur secara berurutan dalam satu rangkaian. Semua perubahan murni frontend, tidak menyentuh logika kalkulasi.

---

## 1. Onboarding Tour Sekali Jalan (react-joyride)

**Goal:** User baru dipandu lewat 5–6 langkah saat pertama kali buka app, menjelaskan TERP, HMETD, dan dilusi langsung di konteksnya.

**Implementasi:**
- Install `react-joyride`.
- Buat `src/components/RightIssueCalculator/OnboardingTour.tsx` yang:
  - Cek `localStorage` key `ri-onboarding-v1`. Jika sudah ada → tidak tampil.
  - Render `<Joyride>` dengan `continuous`, `showProgress`, `showSkipButton`, `disableScrolling: false`, styling dark/light sesuai design tokens (primary, popover bg).
  - Locale ID/EN dari `useLanguage`.
- Tambahkan `data-tour` attribute ke elemen target di `index.tsx`, `RightIssueInfoSection.tsx`, `OwnershipSection.tsx`, `ResultsDashboard.tsx`, `DilutionSimulator.tsx`:
  - `data-tour="stock-code"` → input kode saham
  - `data-tour="ratio"` → input rasio RI (jelaskan HMETD)
  - `data-tour="right-price"` → harga pelaksanaan
  - `data-tour="calculate"` → tombol Hitung
  - `data-tour="terp"` → kartu TERP di hasil (jelaskan TERP)
  - `data-tour="dilution"` → simulator dilusi
- Mount `<OnboardingTour />` di root `RightIssueCalculator/index.tsx`.
- Tambah menu "Tampilkan tour ulang" di `SettingsDropdown.tsx` (hapus key localStorage + reload state).
- Tambahkan kunci i18n untuk teks setiap step di `LanguageContext.tsx`.

---

## 2. Standardisasi Icon ke lucide-react

**Goal:** Hilangkan semua emoji kontekstual (💡⚠️✅📊📈💰🎁) di komponen UI; pertahankan emoji hanya di string share/WhatsApp (karena memang dirender di luar app).

**Mapping:**
| Emoji | Lucide |
|-------|--------|
| 💡 | `Lightbulb` |
| ⚠️ | `AlertTriangle` |
| ✅ | `CheckCircle2` |
| 📊 | `BarChart3` |
| 📈 | `TrendingUp` |
| 💰 | `Wallet` / `Coins` |
| 🎁 | `Gift` |
| 🎉 (komentar saja) | biarkan |

**File yang diubah:**
- `WhatIfTargetPrice.tsx` (baris 188–189, 289–290): ganti dengan `<CheckCircle2>` / `<AlertTriangle>` + `<Lightbulb>` inline.
- `LotOptimizationSection.tsx` (113): `<CheckCircle2>` inline.
- `OwnershipSection.tsx` (128–129): `<Lightbulb>` inline.
- `DilutionSimulator.tsx` (116–117): `<AlertTriangle>` inline.
- `ResultsDashboard.tsx` (157–158): `<CheckCircle2>` / `<AlertTriangle>`.
- `EducationSection.tsx`: ubah field `icon: string` jadi `icon: LucideIcon` (component reference), update render dari `<span>{icon}</span>` ke `<Icon className="..." />`.
- `ShareButtons.tsx`: **biarkan emoji** untuk `toast.success` dan template WhatsApp (line 90, 218, 232, 249–250 dst) — ini teks output, bukan UI ikon.

**Style:** semua ikon `className="w-4 h-4 inline-block mr-1.5 text-{contextual-color}"` dengan token semantic (mis. `text-emerald-500`, `text-amber-500`).

---

## 3. Tooltip → Bottom Sheet di Mobile

**Goal:** Di viewport `<640px`, klik info icon membuka bottom sheet (vaul `Drawer`) yang lebih mudah dibaca; di desktop tetap `Tooltip` standar.

**Implementasi:**
- Edit `src/components/RightIssueCalculator/InfoTooltip.tsx`:
  - Pakai `useIsMobile()` hook yang sudah ada.
  - Jika `isMobile`: render `<Drawer>` (dari `@/components/ui/drawer`) dengan trigger ikon Info dan content berisi `text` (font lebih besar, padding nyaman, ada drag handle bawaan).
  - Jika desktop: kode tooltip eksisting tidak berubah.
  - Tambah opsional prop `title?: string` untuk header drawer (default: "Info" / "Information" via i18n).
- Tidak perlu ubah call sites — interface `InfoTooltipProps` backward compatible.

---

## 4. Swipe Between Tabs (Calculator ↔ Budget ↔ Education)

**Goal:** Di mobile, swipe horizontal di area konten memindahkan tab.

**Implementasi:**
- Di `RightIssueCalculator/index.tsx`:
  - Definisikan urutan: `const TAB_ORDER = ['calculator', 'budget', 'education']`.
  - Buat handler:
    ```ts
    const goNextTab = () => {
      const i = TAB_ORDER.indexOf(activeTab);
      if (i < TAB_ORDER.length - 1) setActiveTab(TAB_ORDER[i + 1]);
    };
    const goPrevTab = () => { /* sebaliknya */ };
    ```
  - Pakai `useSwipeGesture({ onSwipeLeft: goNextTab, onSwipeRight: goPrevTab, threshold: 60 })`.
  - Hanya aktif di mobile: spread handler `{...(isMobile ? swipeHandlers : {})}` ke wrapper `<div>` yang membungkus `<Tabs>`.
- Tambah animasi transisi tab fade (sudah ada `data-[state=active]:animate-tab-fade-in` di `tabs.tsx`).
- Pastikan swipe di dalam komponen scroll horizontal (chart Recharts) tidak conflict — `useSwipeGesture` sudah filter via `Math.abs(deltaX) > Math.abs(deltaY)`.

---

## Urutan Implementasi
1. Standardisasi icon (paling cepat, no deps).
2. Bottom sheet tooltip (refactor file kecil).
3. Swipe tabs (1 file edit + handler).
4. Onboarding tour (install dep + komponen baru + tag elemen).

## Verifikasi
- Build harus lolos.
- Cek console preview: tidak ada warning baru.
- Manual: resize viewport ke <640px untuk verifikasi tooltip bottom sheet & swipe.
- Buka mode incognito untuk lihat tour pertama kali jalan.

## Catatan Teknis
- `react-joyride` ~30KB gzip — acceptable; bisa di-`lazy` import jika perlu.
- Tidak ada perubahan ke business logic / kalkulasi / storage.
- Memori "Consistently use InfoTooltip" tetap terjaga (interface InfoTooltip tidak berubah).
