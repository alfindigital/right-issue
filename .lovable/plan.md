
# Plan: Validasi Rasio Waran Wajib

## Ringkasan
Menambahkan validasi agar jika toggle waran aktif, rasio waran (RI : Waran) HARUS diisi sebelum bisa Apply/Hitung. Validasi ini diterapkan di 2 tempat: Budget Planner dan Kalkulator Utama.

## Alasan Penting
- **Mencegah data tidak lengkap**: Jika waran aktif tapi rasio kosong, hasil kalkulasi waran = 0 yang menyesatkan
- **User experience**: Warning yang jelas membantu user memahami apa yang perlu diisi
- **Konsistensi**: Mengikuti pola validasi yang sudah ada (harga avg wajib)

---

## Perubahan UI/UX

### 1. Budget Planner - Rasio Waran Section

**Kondisi Saat Ini:**
```
[Toggle Dengan Bonus Waran: ON]
  Rasio Waran
  [input RI] : [input Waran]
```

**Perubahan:**
```
[Toggle Dengan Bonus Waran: ON]
  Rasio Waran *
  [input RI] : [input Waran]  <- border amber jika kosong
  
[Tombol Terapkan: DISABLED jika rasio kosong]
"Isi rasio waran untuk melanjutkan"  <- pesan warning
```

### 2. Kalkulator Utama - Right Issue Info Section

**Kondisi Saat Ini:**
```
[Checkbox] Dengan Waran
  Rasio Waran
  [input RI] : [input Waran]
  
[Tombol Hitung: aktif tanpa cek rasio waran]
```

**Perubahan:**
```
[Checkbox] Dengan Waran
  Rasio Waran *  <- tanda wajib muncul
  [input RI] : [input Waran]  <- border amber jika kosong tapi waran aktif
  "Wajib diisi jika dengan waran"  <- helper text
  
[Tombol Hitung: DISABLED jika waran aktif tapi rasio kosong]
```

---

## Visualisasi Layout Mobile

```
+----------------------------------+
|   Informasi Right Issue          |
+----------------------------------+
|  Rasio: [5] : [2]                |
|  Harga Pelaksanaan: [500]        |
|  Harga Cum-Date: [2.500]         |
+----------------------------------+
|  [v] Dengan Waran                |
|  -------------------------------- |
|  Rasio Waran *                   |
|  [RI] : [Waran]   <-- highlight  |
|  ^ Wajib diisi jika waran aktif  |
+----------------------------------+

+----------------------------------+
|  [ HITUNG ]  <-- disabled state  |
|  ^ Lengkapi rasio waran dulu     |
+----------------------------------+
```

---

## Detail Teknis

### File yang Diubah

#### 1. `src/components/RightIssueCalculator/BudgetLotPlanner.tsx`

**Tambah validasi state:**
```typescript
// Tambah computed validation
const isWarrantRatioComplete = !hasWarrant || (warrantRatioOld && warrantRatioNew);
const isApplyEnabled = currentAvgPrice && isWarrantRatioComplete;
```

**Update UI input rasio waran:**
- Tambah tanda `*` pada label jika waran aktif
- Tambah border amber pada input jika kosong
- Tambah helper text "Wajib diisi jika dengan waran"

**Update tombol Terapkan:**
- Ubah `disabled={!currentAvgPrice}` menjadi `disabled={!isApplyEnabled}`
- Tambah conditional warning untuk rasio waran kosong

#### 2. `src/components/RightIssueCalculator/RightIssueInfoSection.tsx`

**Update UI input rasio waran:**
- Tambah tanda `*` pada label
- Tambah styling border amber jika waran aktif tapi rasio kosong
- Tambah helper text kecil di bawah input

#### 3. `src/components/RightIssueCalculator/index.tsx`

**Update validasi tombol Hitung:**
```typescript
// Dari:
const isCalculateEnabled = !!(
  ratioOld && ratioNew && rightPrice && cumDatePrice && 
  currentLots && currentAvgPrice && !ratioError
);

// Menjadi:
const isWarrantRatioValid = !hasWarrant || 
  (warrantRatioOld && warrantRatioNew && !warrantRatioError);

const isCalculateEnabled = !!(
  ratioOld && ratioNew && rightPrice && cumDatePrice && 
  currentLots && currentAvgPrice && !ratioError && 
  isWarrantRatioValid
);
```

#### 4. `src/contexts/LanguageContext.tsx`

**Tambah translation keys:**
```typescript
// Indonesian
'rightIssue.warrantRatioRequired': 'Wajib diisi jika dengan waran',
'validation.warrantRatioMissing': 'Lengkapi rasio waran dulu',

// English  
'rightIssue.warrantRatioRequired': 'Required if with warrant',
'validation.warrantRatioMissing': 'Complete warrant ratio first',
```

---

## Catatan UX

1. **Prioritas Mobile**: 
   - Warning message singkat dan jelas
   - Helper text sangat kecil (text-[10px]) agar tidak memakan space
   - Border highlight amber cukup untuk menarik perhatian

2. **Progressive Disclosure**:
   - Validation warning hanya muncul SETELAH user mengaktifkan waran
   - Tidak mengganggu flow user yang tidak pakai waran

3. **Konsistensi Visual**:
   - Menggunakan pattern yang sama dengan validasi harga avg
   - Amber color untuk warning (bukan merah/destructive)
   - Tanda `*` untuk field wajib

4. **Tombol Disabled State**:
   - Opacity 50% + cursor not-allowed
   - Pesan di bawah tombol menjelaskan kenapa disabled
