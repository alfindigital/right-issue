# Auto-Suggest Kode Saham (Yahoo Finance)

Saat user mengetik di field kode saham, muncul dropdown saran emiten IDX (nama + kode) dari Yahoo Finance. Tap/klik untuk auto-fill. Cocok di desktop & mobile.

## Kenapa edge function?

Yahoo Finance API (`query1.finance.yahoo.com/v1/finance/search`) memblokir CORS dari browser. Solusinya: proxy via Supabase Edge Function (`stock-search`) — sekaligus bisa filter hanya IDX (`.JK`), cache, dan rate-limit aman.

## Yang dibangun

### 1. Edge function `supabase/functions/stock-search/index.ts`
- GET `?q=BRI` → fetch `https://query1.finance.yahoo.com/v1/finance/search?q=BRI&lang=en-US&region=ID&quotesCount=8`
- Filter `quotes[]` dengan `exchange === "JKT"` atau `symbol.endsWith(".JK")`
- Return array ringkas: `[{ code: "BRIS", name: "Bank Syariah Indonesia Tbk", exchange: "JKT" }, ...]`
- `verify_jwt = false`, CORS headers, in-memory cache 5 menit per query, validasi `q` (1–10 char alfanumerik) dengan Zod.

### 2. Update `StockCodeInput.tsx`
- Tambah state: `suggestions`, `open`, `loading`, `activeIndex`
- Debounce 250ms saat input ≥ 2 huruf → panggil `supabase.functions.invoke('stock-search', { body: { q } })`
- Render dropdown di bawah input (absolute, z-50, `rounded-2xl`, glass style konsisten):
  - Tiap baris: `<kode tebal>` + nama emiten kecil (truncate)
  - Hover/active highlight, ikon `TrendingUp`
  - Empty state: "Tidak ada hasil" (ID) / "No results" (EN)
- Keyboard: ↑/↓ navigate, Enter pilih, Esc close
- Mobile: dropdown full width input, tap area min 44px
- Klik pilihan → `onChange(code)` + close dropdown
- Klik di luar → close (gunakan `useRef` + listener `mousedown`)
- A11y: `role="combobox"`, `aria-expanded`, `aria-activedescendant`

### 3. i18n key baru (`src/contexts/LanguageContext.tsx`)
- `stockCode.searching` — "Mencari..." / "Searching..."
- `stockCode.noResults` — "Tidak ada hasil" / "No results"
- `stockCode.poweredBy` — "Data: Yahoo Finance"

### 4. Memory
Tambah `mem://features/stock-autosuggest` ringkas (sumber Yahoo Finance via edge function, debounce, keyboard nav).

## Catatan teknis

- Tidak perlu auth/JWT — endpoint publik read-only.
- Tidak menyimpan data; Yahoo Finance dipanggil on-demand dengan cache pendek.
- Tetap manual input diperbolehkan: dropdown hanya saran, user bebas ketik kode apapun (validasi 4 huruf existing tetap berlaku).
- Tidak mengubah business logic kalkulator — murni UI input.

## Out of scope (batch lain)
- Auto-fill harga cum-date dari Yahoo
- Single-field ratio "2:1"
- Compact number format
- Diff flash animation
