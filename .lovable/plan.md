# Ide UI/UX Improvement & Simplifikasi — Mobile-First

Fokus: bikin kalkulator lebih cepat dipahami pemula, lebih ringan di mobile, dan tetap powerful di desktop. Dibagi per prioritas.

---

## 🔥 Prioritas Tinggi (Quick Win, dampak besar)

### 1. Mode "Simple vs Pro" Toggle
Saat ini semua field & section tampil sekaligus → overwhelming.
- **Simple Mode** (default untuk user baru): hanya 4 input — Stock Code, Lots Dimiliki, Rasio, Harga Tebus. Hasil langsung: total tebusan + lot baru.
- **Pro Mode**: tampilkan warrant, cum-date price, analisis lanjutan, dilution, target price, dll.
- Toggle di header, persist di localStorage.

### 2. Sticky "Smart Result Bar" di Mobile
Replace FloatingSummary dengan bar bawah (di atas BottomNav) yang **selalu menampilkan 2 angka paling penting**: Total Tebusan + Rekomendasi (Tebus/Jual/Skip) dengan warna. User tidak perlu scroll untuk lihat hasil.

### 3. Progressive Disclosure pada Form
- Section "Warrant", "Cum-Date Price", "Kepemilikan Saat Ini" jadi collapsed by default.
- Hanya expand otomatis kalau ada data terisi.
- Hemat ~40% scroll di mobile.

### 4. Auto-Calculate (hapus tombol "Hitung")
Hasil update real-time saat user mengetik (debounce 300ms). Tombol "Hitung" hanya jadi anchor scroll ke hasil di mobile. Lebih modern, mengurangi friksi.

### 5. Empty State yang Edukatif
Sebelum user isi apapun, hasil card menampilkan ilustrasi + "Isi rasio & harga tebus untuk mulai" + tombol "Pakai contoh BRIS" (auto-fill demo data). Saat ini hasil kosong terasa "rusak".

---

## 📱 Mobile-Specific

### 6. One-Hand Reachability
- Tombol primer (Hitung, Share, Export) pindah ke **bottom action sheet**, bukan di tengah card.
- Header lebih tipis (logo + settings only), hilangkan title panjang di mobile.

### 7. Swipe Between Sections
Di mobile, ubah panel Calculator/Budget/Education jadi swipeable (sudah ada useSwipeGesture hook — manfaatkan).

### 8. Compact Number Display
Angka besar pakai format "Rp 2,5 jt" / "Rp 1,2 M" di stat card mobile (tap untuk lihat full). Saat ini "Rp 2.500.000.000" pecah di layar kecil.

### 9. Haptic + Sound Feedback
Tambah haptic ringan saat: hasil muncul, validasi error, tombol primary ditekan. Sudah ada di numpad — extend ke seluruh app.

### 10. Pull-to-Refresh untuk Reset
Pull down di mobile = clear form (dengan confirm). Native feel.

---

## 🎯 Form Simplification

### 11. Single Combined Ratio Input
Ganti dua input "Lama : Baru" jadi **satu input "2:1"** yang auto-parse. Lebih cepat diketik, terutama mobile.

### 12. Smart Defaults
- Cum-date price auto-fill dari rightPrice × 1.2 (estimasi) dengan badge "estimasi, ubah jika tahu"
- Lots: kalau kosong, asumsikan 0 (mode "Beli dari pasar" otomatis aktif)

### 13. Inline Examples di Placeholder
Placeholder bukan "0" tapi "contoh: 100" / "contoh: 500" / "contoh: 2:1". Lebih guiding.

### 14. Stock Code → Auto-suggest
Dropdown kecil saat ketik (BRIS, BBRI, TLKM, dll dari top 20 IDX). Optional, tapi mengurangi typo.

---

## 🎨 Visual & Hierarchy

### 15. Result-First Layout di Desktop
Desktop saat ini: form kiri, hasil bawah. Ubah jadi **2 kolom**: form kiri (sticky), hasil kanan (live update). User lihat dampak input secara real-time.

### 16. Color-Coded Recommendation Banner
Hasil utama (Tebus/Skip/Jual Rights) jadi **banner besar full-width** di atas, bukan teks kecil. Hijau/Merah/Kuning + ikon besar. Keputusan langsung jelas dalam 1 detik.

### 17. Reduce Card Nesting
Banyak card di dalam card. Flatten jadi section dengan separator → less visual noise, lebih cepat di-render.

### 18. Skeleton → Shimmer
Saat loading PDF/chart, pakai shimmer effect, bukan plain skeleton.

---

## 🚀 Discovery & Onboarding

### 19. Interactive First-Time Tour (Re-design)
OnboardingTour saat ini ada — perpendek jadi **3 langkah max** dengan animasi pointer. Tambah "Skip & coba sendiri" yang prominent.

### 20. Contextual Tips (bukan tooltip)
Ganti beberapa InfoTooltip dengan **inline hint card** kecil yang muncul sekali lalu bisa di-dismiss. Tooltip kurang discoverable di mobile (hover ≠ ada).

### 21. "What changed?" Diff Indicator
Saat user ubah input, highlight angka di hasil yang berubah dengan flash animation kuning sebentar.

---

## ⚡ Performance & Polish

### 22. Tab Persistence di URL
Tab aktif (calculator/budget/education) masuk URL hash `#calculator`. Bisa di-share & back button works.

### 23. Lazy Load Heavy Sections
Education, Advanced Analysis, Dilution Simulator → load on visible (IntersectionObserver), bukan saat tab dibuka.

### 24. Reduce Settings Dropdown Items
SettingsDropdown saat ini terlalu banyak. Group jadi: **Display** (theme, language, numpad) / **Tools** (history, shortcuts, embed) / **About**.

---

## 🧪 Eksperimental (high effort, high delight)

### 25. AI Assistant Sidekick
Chip kecil "Tanya AI" di bawah hasil → buka mini chat: "Apakah saya harus tebus?" → jawaban kontekstual pakai Lovable AI Gateway dengan input form sebagai context.

### 26. Compare Mode
Side-by-side bandingkan 2 skenario right issue (misal BRIS vs ANTM) dalam 1 view.

### 27. Watchlist Right Issue
Simpan beberapa emiten yang lagi RI, dashboard ringkas status masing-masing.

---

## 🎯 Rekomendasi Implementasi (Phased)

**Fase 1 — Quick Wins (1 batch):** #1, #2, #3, #4, #5, #16
**Fase 2 — Mobile Polish:** #6, #8, #11, #13
**Fase 3 — Desktop Layout:** #15, #17, #24
**Fase 4 — Discovery:** #19, #20, #21
**Fase 5 — Nice-to-have:** #22, #23, #25

---

Pilih fase atau item spesifik yang mau saya kerjakan. Saya rekomendasikan mulai dari **Fase 1** karena dampak UX paling besar dengan effort relatif kecil.
