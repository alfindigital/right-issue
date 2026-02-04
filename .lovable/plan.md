
# Plan: Share to WhatsApp dengan Format Rapi

## Ringkasan
Menambahkan opsi "Share ke WhatsApp" di dropdown Share yang sudah ada. Ketika diklik, langsung buka WhatsApp dengan teks terformat yang berisi ringkasan hasil kalkulasi Right Issue.

---

## Perubahan UI/UX

### Dropdown Share Menu (Setelah)

```
+---------------------------+
|  [Share ▼]               |
+---------------------------+
| 📥 Download Gambar       |
| 🔗 Bagikan Link          |
| 💬 Share ke WhatsApp     |  <-- NEW
+---------------------------+
```

### Format Pesan WhatsApp

```
📊 *Hasil Kalkulasi RI BBRI*

📌 *Info RI:*
• Rasio: 5 : 2
• Harga RI: Rp 500
• Harga Cum: Rp 2.500

📈 *Hasil:*
• Lot saat ini: 100 lot
• Jatah RI: 40 lot
• Biaya tebus: Rp 2.000.000
• Avg baru: Rp 1.531

✅ TERP Rp 1.785 (potensi +16%)

🎁 Bonus Waran: 2.000 lembar

🔗 Hitung sendiri: [link]
```

### Catatan Format:
- Gunakan `*text*` untuk bold di WhatsApp
- Emoji untuk visual yang menarik
- Stock code di judul jika tersedia
- Section waran hanya muncul jika hasWarrant = true
- Persentase potensi dihitung dari selisih TERP vs Avg baru

---

## Flow Mobile

```
+----------------------------------+
|  User klik Share → dropdown     |
+----------------------------------+
         ↓
+----------------------------------+
|  Pilih "Share ke WhatsApp"      |
+----------------------------------+
         ↓
+----------------------------------+
|  Generate formatted text        |
|  + URL dengan params            |
+----------------------------------+
         ↓
+----------------------------------+
|  Buka wa.me/... atau app WA     |
+----------------------------------+
```

---

## Detail Teknis

### File yang Diubah

#### 1. `src/components/RightIssueCalculator/ShareButtons.tsx`

**Tambah import:**
```typescript
import { MessageCircle } from 'lucide-react'; // WhatsApp icon alternative
```

**Tambah fungsi `shareToWhatsApp`:**
```typescript
const shareToWhatsApp = () => {
  // Build URL dengan params
  const params = new URLSearchParams({
    ...(shareData.stockCode && { sc: shareData.stockCode }),
    ro: shareData.ratioOld,
    rn: shareData.ratioNew,
    rp: shareData.rightPrice,
    cp: shareData.cumDatePrice,
    cs: shareData.currentLots,
    ca: shareData.currentAvgPrice,
  });
  const calculatorUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  
  // Parse numeric values untuk kalkulasi persentase
  const avgBaru = parseInt(exportData.finalAvgPrice.replace(/[^\d]/g, '')) || 0;
  const terp = parseInt(exportData.theoreticalPrice.replace(/[^\d]/g, '')) || 0;
  const diffPercent = avgBaru > 0 
    ? (((terp - avgBaru) / avgBaru) * 100).toFixed(1) 
    : '0';
  const isPositive = terp > avgBaru;
  
  // Build message
  const stockLabel = shareData.stockCode 
    ? `RI ${shareData.stockCode}` 
    : 'Right Issue';
  
  let message = language === 'id' 
    ? `📊 *Hasil Kalkulasi ${stockLabel}*

📌 *Info RI:*
• Rasio: ${shareData.ratioOld} : ${shareData.ratioNew}
• Harga RI: Rp ${parseInt(shareData.rightPrice).toLocaleString('id-ID')}
• Harga Cum: Rp ${parseInt(shareData.cumDatePrice).toLocaleString('id-ID')}

📈 *Hasil:*
• Lot saat ini: ${parseInt(shareData.currentLots).toLocaleString('id-ID')} lot
• Jatah RI: ${exportData.newSharesCount} lot
• Biaya tebus: ${exportData.newTotalValue}
• Avg baru: ${exportData.finalAvgPrice}

${isPositive ? '✅' : '⚠️'} TERP ${exportData.theoreticalPrice} (${isPositive ? '+' : ''}${diffPercent}%)`
    : `📊 *${stockLabel} Calculation Result*

📌 *RI Info:*
• Ratio: ${shareData.ratioOld} : ${shareData.ratioNew}
• RI Price: Rp ${parseInt(shareData.rightPrice).toLocaleString('id-ID')}
• Cum Price: Rp ${parseInt(shareData.cumDatePrice).toLocaleString('id-ID')}

📈 *Result:*
• Current lots: ${parseInt(shareData.currentLots).toLocaleString('id-ID')} lots
• RI allocation: ${exportData.newSharesCount} lots
• Exercise cost: ${exportData.newTotalValue}
• New avg: ${exportData.finalAvgPrice}

${isPositive ? '✅' : '⚠️'} TERP ${exportData.theoreticalPrice} (${isPositive ? '+' : ''}${diffPercent}%)`;

  // Add warrant section if applicable
  if (exportData.hasWarrant && exportData.warrantCount !== '0') {
    message += language === 'id'
      ? `\n\n🎁 Bonus Waran: ${exportData.warrantCount} lembar`
      : `\n\n🎁 Bonus Warrants: ${exportData.warrantCount} units`;
  }
  
  // Add calculator link
  message += language === 'id'
    ? `\n\n🔗 Hitung sendiri: ${calculatorUrl}`
    : `\n\n🔗 Calculate yourself: ${calculatorUrl}`;
  
  // Encode and open WhatsApp
  const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
  
  toast.success(language === 'id' ? 'Membuka WhatsApp...' : 'Opening WhatsApp...');
};
```

**Update DropdownMenuContent:**
```tsx
<DropdownMenuContent align="end" className="w-44">
  <DropdownMenuItem onClick={saveAsImage} className="cursor-pointer">
    <Download className="w-4 h-4 mr-2" />
    {language === 'id' ? 'Download Gambar' : 'Download Image'}
  </DropdownMenuItem>
  <DropdownMenuItem onClick={shareNative} className="cursor-pointer">
    <Link2 className="w-4 h-4 mr-2" />
    {language === 'id' ? 'Bagikan Link' : 'Share Link'}
  </DropdownMenuItem>
  <DropdownMenuItem onClick={shareToWhatsApp} className="cursor-pointer">
    <MessageCircle className="w-4 h-4 mr-2" />
    {language === 'id' ? 'Share ke WhatsApp' : 'Share to WhatsApp'}
  </DropdownMenuItem>
</DropdownMenuContent>
```

#### 2. `src/contexts/LanguageContext.tsx`

**Tambah translation keys (opsional, untuk konsistensi):**
```typescript
// Indonesian
'share.whatsapp': 'Share ke WhatsApp',
'share.openingWhatsapp': 'Membuka WhatsApp...',

// English
'share.whatsapp': 'Share to WhatsApp',
'share.openingWhatsapp': 'Opening WhatsApp...',
```

---

## Implementasi WhatsApp Deep Link

### Desktop Behavior
- `https://wa.me/?text=...` → Buka WhatsApp Web atau prompt install
- User bisa pilih kontak untuk mengirim pesan

### Mobile Behavior
- `https://wa.me/?text=...` → Langsung buka app WhatsApp
- Pre-filled message siap dikirim ke kontak mana saja

### Fallback
- Jika WhatsApp tidak terinstall, browser akan menampilkan halaman wa.me
- Tidak perlu error handling khusus karena wa.me handle sendiri

---

## Catatan UX

1. **Icon Choice**: 
   - Menggunakan `MessageCircle` dari Lucide sebagai alternatif karena tidak ada icon WhatsApp official
   - Bisa juga pakai custom SVG WhatsApp icon jika diperlukan

2. **Dropdown Width**:
   - Lebarkan sedikit dari `w-40` ke `w-44` agar teks tidak terpotong

3. **Toast Feedback**:
   - Tampilkan toast "Membuka WhatsApp..." sebagai feedback
   - Singkat dan informatif

4. **Message Format**:
   - Bold text dengan `*...*` (WhatsApp markdown)
   - Emoji untuk visual appeal
   - Struktur yang sama dengan template export gambar untuk konsistensi
   - Link di akhir agar mudah di-tap

5. **Bilingual Support**:
   - Pesan otomatis mengikuti bahasa yang dipilih user
   - Format angka tetap pakai format Indonesia (titik sebagai separator ribuan)
