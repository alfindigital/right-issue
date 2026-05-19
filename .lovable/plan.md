## Plan: 5 Peningkatan Input UX

Semua perubahan murni frontend. Tidak menyentuh logika kalkulasi.

---

### 1. Inline Validation Real-time

**Goal:** Border input berubah warna sesuai status: netral (default), hijau (valid), merah (error). Pesan error muncul kecil di bawah input.

**Implementasi:**
- Tambah varian state ke `input-calculator` di `src/index.css`:
  - `.input-calculator.is-valid` → `border-success`
  - `.input-calculator.is-error` → `border-destructive` + `animate-shake`
- Tambah util `src/lib/validators.ts`:
  - `validateRatio(val)` → `{state: 'idle'|'valid'|'error', message?}` (kosong=idle, 0=error, >0=valid)
  - `validatePrice(val)` → idle/valid/error (>0=valid, ada non-digit=error)
  - `validateLots(val)` → idle/valid/error (integer >0)
- Edit `CurrencyInput.tsx`, `RatioInput.tsx`, dan input lot inline di `OwnershipSection.tsx`:
  - Terima prop opsional `validation?: {state, message}`
  - Tambahkan className kondisional + `<p className="text-[10px] text-destructive">` di bawah saat error
- Edit `OwnershipSection.tsx` & `RightIssueInfoSection.tsx`: hitung `validation` dengan `useMemo` dan teruskan ke komponen input.
- Animasi shake: tambah keyframe di `tailwind.config.ts` (`shake: { 0,100%: translateX(0), 25%: -4px, 75%: 4px }`).
- Pesan validasi i18n: tambah keys `validation.ratioZero`, `validation.priceRequired`, `validation.invalidNumber` di `LanguageContext.tsx`.

---

### 2. Currency Mask dengan Prefix "Rp"

**Goal:** Saat user mengetik di field harga, "Rp" tampil sebagai prefix non-editable di dalam input, dan angka terformat live (2500000 → `2.500.000`).

**Implementasi:**
- Refactor `CurrencyInput.tsx`:
  - Bungkus `<input>` dalam `<div class="relative">` dengan `<span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">Rp</span>`.
  - Tambah `pl-9` ke input agar teks tidak menabrak prefix.
  - Format sudah ada (`formatNumber`) — tidak diubah.
  - Pastikan caret tetap di akhir setelah re-format (gunakan `requestAnimationFrame` + `setSelectionRange(input.value.length)` saat onInput).
- Hapus prefix "Rp" yang sudah dipakai sebagai label terpisah di komponen lain jika ada (tidak ada saat ini—aman).

---

### 3. Voice Input (Web Speech API)

**Goal:** Tombol mikrofon kecil di pojok kanan input numerik. Klik → mulai listen → angka yang diucapkan ("dua ribu lima ratus") diparse jadi `2500`.

**Implementasi:**
- Buat hook `src/hooks/useVoiceInput.ts`:
  - Cek `window.SpeechRecognition || window.webkitSpeechRecognition`.
  - State `isListening`, `error`.
  - Method `start(onResult: (digits: string) => void)` & `stop()`.
  - Set `recognition.lang` sesuai `language` ('id-ID' atau 'en-US').
  - `onresult` → ambil transcript, panggil util parser.
- Buat util `src/lib/parseSpokenNumber.ts`:
  - Map kata-kata ID: "satu"=1, "dua"=2, ..., "puluh"=*10, "ratus"=*100, "ribu"=*1000, "juta"=*1000000.
  - Fallback: ekstrak digit (`replace(/\D/g, '')`) jika user mengucapkan "2 500 000".
  - EN: parse dengan library mini atau regex digit + "thousand/million".
- Komponen `src/components/RightIssueCalculator/VoiceInputButton.tsx`:
  - Tombol icon `Mic`/`MicOff` dari lucide-react.
  - Animasi pulse merah saat listening.
  - Toast error jika browser tidak support.
- Tambah prop `voiceInput?: boolean` (default `true` pada `CurrencyInput`); render `<VoiceInputButton>` di `absolute right-2`.
- Pastikan tidak ditampilkan jika `!('SpeechRecognition' in window)`.

---

### 4. Paste Parser Cerdas

**Goal:** Di header section "Info Right Issue", tambah tombol "Paste Pengumuman". User paste teks → app auto-extract `ratioOld`, `ratioNew`, `rightPrice`, dan tanggal cum-date jika ada.

**Implementasi:**
- Buat util `src/lib/parseAnnouncement.ts`:
  - Regex ratio: `/(\d+)\s*:\s*(\d+)/` atau `/rasio[^\d]*(\d+)[^\d]+(\d+)/i`.
  - Regex harga RI: `/harga (?:pelaksanaan|tebus)[^\d]*(?:Rp\.?)?\s*([\d.,]+)/i` (dan EN: "exercise price").
  - Regex tanggal cum: `/cum[- ]?date[^\d]*(\d{1,2})[\s\-\/](\w+|\d{1,2})[\s\-\/](\d{2,4})/i`.
  - Return `{ratioOld?, ratioNew?, rightPrice?, cumDate?}`.
- Komponen `src/components/RightIssueCalculator/PasteParserButton.tsx`:
  - Tombol kecil `Clipboard` icon + label "Paste Pengumuman".
  - Klik → buka `<Dialog>` (atau `<Drawer>` di mobile) dengan `<Textarea>` + tombol "Parse".
  - Atau langsung baca `navigator.clipboard.readText()` jika izin diberi.
  - Setelah parse, tampilkan preview fields yang terdeteksi + tombol "Terapkan" → callback `onParsed(data)`.
- Edit `RightIssueInfoSection.tsx` tambahkan tombol di kanan judul section dan handler yang setState semua field.
- Toast feedback: "3 field terdeteksi: rasio 2:1, harga Rp 500, cum-date 12 Agu".

---

### 5. Numpad Overlay di Mobile

**Goal:** Saat user fokus ke input numerik di mobile (`<768px`), buka custom bottom-sheet numpad dengan tombol besar (0-9, koma, backspace, Done).

**Implementasi:**
- Komponen `src/components/RightIssueCalculator/MobileNumpad.tsx`:
  - Pakai `Drawer` dari `@/components/ui/drawer`.
  - Props: `open`, `onOpenChange`, `value`, `onChange(value)`, `onDone()`, `allowDecimal?: boolean`, `label?: string`.
  - Grid 3×4 dengan tombol angka besar (h-14, text-xl, rounded-2xl, active:scale-95 + haptic via `navigator.vibrate(10)`).
  - Tombol khusus: `.` (jika `allowDecimal`), `⌫` (backspace), `✓ Done`.
  - Display value besar di atas grid dengan format thousand-separator live.
- Hook `src/hooks/useMobileNumpad.ts`:
  - `useState<{open, field}>` untuk field aktif.
  - Helper `openFor(fieldId, currentValue, setter)` agar mudah dipakai.
- Integrasi minimal-invasif: di `CurrencyInput.tsx` dan input lot:
  - Cek `useIsMobile()` + `localStorage.getItem('numpad-enabled') !== 'false'`.
  - Pada `onFocus`: `e.target.blur()` lalu open numpad bound ke field tersebut.
  - Saat numpad close: setter dipanggil dengan nilai final.
- Tambah toggle di `SettingsDropdown.tsx`: "Numpad Mobile" (on/off) → simpan ke localStorage.
- Performa: `MobileNumpad` di-lazy import; hanya dimount jika `isMobile`.

---

## Urutan Implementasi

1. **Currency Mask "Rp" prefix** — paling cepat, dampak visual instan.
2. **Inline Validation Real-time** — refactor input + util kecil.
3. **Paste Parser** — komponen + util mandiri, tidak ganggu existing.
4. **Voice Input** — hook + tombol, fitur additive.
5. **Mobile Numpad** — paling kompleks (state coordination), kerjakan terakhir.

## Verifikasi
- Build hijau.
- Manual: di desktop test prefix, validation, paste; di mobile (DevTools 375px) test numpad & voice.
- Cek tidak ada warning baru di console preview.
- Pastikan keyboard shortcut Enter/Esc tetap berfungsi (numpad jangan trap).

## File Baru
- `src/lib/validators.ts`
- `src/lib/parseSpokenNumber.ts`
- `src/lib/parseAnnouncement.ts`
- `src/hooks/useVoiceInput.ts`
- `src/hooks/useMobileNumpad.ts`
- `src/components/RightIssueCalculator/VoiceInputButton.tsx`
- `src/components/RightIssueCalculator/PasteParserButton.tsx`
- `src/components/RightIssueCalculator/MobileNumpad.tsx`

## File yang Diedit
- `src/index.css` (varian validation + shake)
- `tailwind.config.ts` (keyframe shake)
- `src/contexts/LanguageContext.tsx` (i18n keys)
- `src/components/RightIssueCalculator/CurrencyInput.tsx`
- `src/components/RightIssueCalculator/RatioInput.tsx`
- `src/components/RightIssueCalculator/OwnershipSection.tsx`
- `src/components/RightIssueCalculator/RightIssueInfoSection.tsx`
- `src/components/RightIssueCalculator/SettingsDropdown.tsx`

## Catatan Teknis
- Web Speech API hanya tersedia di Chrome/Edge/Safari modern; fallback graceful saat tidak ada.
- `navigator.clipboard.readText()` butuh user gesture + permission; sediakan fallback textarea.
- `navigator.vibrate` no-op di iOS; tidak masalah.
- Tidak ada perubahan business logic, kalkulasi, atau storage schema.