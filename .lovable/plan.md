# Paket A — Input Cepat di Mobile

Tujuan: tekan friction pengisian form sampai ≥40% — user bisa menyelesaikan satu RI dari nol dalam <15 detik tanpa keyboard.

## 5 perubahan

### 1. Auto-advance antar field (Calculator + Wizard)
Saat user selesai mengisi satu field, fokus otomatis pindah ke field berikutnya tanpa perlu tap.

- Trigger: setelah numpad `Done`, atau (di RatioInput) setelah user mengetik 2+ digit dan jeda 600ms.
- Urutan: `Rasio Lama → Rasio Baru → Harga Tebus → Harga Cum-Date → Lot Saat Ini → Avg Price`.
- Skip otomatis field yang sudah terisi.
- Bisa di-disable lewat Settings (toggle "Auto-advance fokus", default ON).

### 2. Quick chips di MobileNumpad
Chip nilai cepat di atas keypad, kontekstual per jenis input.

- **Harga (Rp)**: chip `+100`, `+500`, `+1.000`, `×2`, `÷2`, plus 4 chip preset dari history harga terakhir untuk stock yang sama.
- **Lot**: chip `1`, `5`, `10`, `25`, `50`, `100` + chip `Semua` (= max dari history kepemilikan terakhir).
- **Rasio**: di RatioInput tambah preset chip `1`, `2`, `4`, `10` di bawah field (tanpa numpad).
- Tap chip → langsung apply ke draft + haptic ringan.

Numpad props baru: `quickChips?: { label: string; apply: (draft: string) => string }[]`.

### 3. Stepper +/− di field lot & harga
Tombol bulat ±20px di kanan field (sebelum tombol voice), long-press = akselerasi increment.

- Lot: step 1, long-press step 5 setelah 500ms, step 25 setelah 1500ms.
- Harga: step 50, long-press step 500, lalu 5.000.
- Hanya tampil di mobile. Disembunyikan ketika numpad terbuka.
- Hormati reduce-motion (no scale animation).

### 4. Smart paste detector (proaktif)
Tanpa user perlu tekan tombol "Paste":

- Saat tab Calculator aktif & form kosong, baca `navigator.clipboard.readText()` (dengan permission check).
- Jika hasilnya match `parseAnnouncement()` dengan ≥2 field terdeteksi, munculkan **toast persisten 6 detik** di bawah:
  > "Terdeteksi data RI di clipboard — Terapkan?" [Terapkan] [Abaikan]
- Sekali per session per nilai clipboard (cache via hash di sessionStorage).
- Fallback: tetap pertahankan tombol `PasteParserButton` yang sudah ada.

### 5. Inline error polish + shake
Ganti pesan error multi-line dengan badge inline + animasi.

- Validator yang sekarang return `state: 'error'` menampilkan badge ✕ kecil di pojok kanan field + border merah.
- Tooltip on tap badge menjelaskan error penuh (gunakan `InfoTooltip` yang sudah ada).
- Tambah keyframe `shake` di `index.css`; field error melakukan shake 1× saat user mencoba submit/next.
- Hormati `prefers-reduced-motion` dan toggle reduce-motion.

## Settings baru (di Settings → Kenyamanan)

- Toggle **Auto-advance fokus** (default ON)
- Toggle **Smart paste detector** (default ON, dengan note kebutuhan izin clipboard)

## Technical Section

### File yang dibuat
- `src/hooks/useAutoAdvance.ts` — daftar ref ordered, fungsi `advanceFrom(refKey)` yang fokus ke ref berikutnya yang masih kosong.
- `src/hooks/useClipboardWatcher.ts` — baca clipboard pada mount + visibilitychange + tab calculator menjadi aktif, cache hash di sessionStorage.
- `src/components/RightIssueCalculator/Stepper.tsx` — komponen kecil `<Stepper value, onChange, step, accelSteps[] />` dengan long-press akselerator.
- `src/components/RightIssueCalculator/QuickChipsBar.tsx` — render baris chip horizontal scroll di atas numpad keypad atau di bawah RatioInput.

### File yang diubah
- `src/components/RightIssueCalculator/MobileNumpad.tsx` — terima prop `quickChips`, render `QuickChipsBar`, panggil `onDone` → context auto-advance.
- `src/components/RightIssueCalculator/CurrencyInput.tsx` — forward ref ke `<input>`, terima `nextFieldKey?: string` & opsional `showStepper?: boolean`, integrasi `useAutoAdvance` + `Stepper`.
- `src/components/RightIssueCalculator/RatioInput.tsx` — sama (forward ref + auto-advance setelah debounce).
- `src/components/RightIssueCalculator/RightIssueInfoSection.tsx` & `OwnershipSection.tsx` — daftarkan field ke `useAutoAdvance` provider, set urutan, pasang `showStepper` di lot & harga.
- `src/components/RightIssueCalculator/index.tsx` — pasang `AutoAdvanceProvider` di sekitar form, pakai `useClipboardWatcher` dengan toast prompt action.
- `src/components/RightIssueCalculator/SettingsDropdown.tsx` — dua toggle baru, persist di `localStorage` (`ri-auto-advance`, `ri-clip-watch`).
- `src/index.css` — keyframe `shake` + utility `.input-error-shake`.

### Kontrak `useAutoAdvance`
```ts
type FieldKey = 'ratioOld' | 'ratioNew' | 'rightPrice' | 'cumDatePrice' | 'currentLots' | 'currentAvgPrice';
register(key: FieldKey, el: HTMLElement): void
unregister(key: FieldKey): void
advanceFrom(key: FieldKey): void  // fokus ke field kosong berikut sesuai urutan
```
Urutan tergantung mode (wizard vs simple vs pro vs noOwnership) — provider menerima `order: FieldKey[]`.

### Telemetry dev (opsional)
Tambah log `[input]` di `DevPerfOverlay` untuk durasi rata-rata pengisian per field — biar bisa lihat dampak.

## Out of scope

- Recently used stocks chip (masuk paket C).
- Voice input changes (sudah ada `VoiceInputButton`).
- Numpad untuk RatioInput (sengaja pakai keyboard sistem karena perlu titik desimal & rapi di chip preset).
- Perubahan logic kalkulasi.

## Rollout
Semua perubahan bersifat additive + dikontrol toggle, jadi user yang lebih suka cara lama bisa kembali.
