
# Tambah Input Harga Avg di Budget Planner

## Overview
Menambahkan input "Harga Rata-rata Saat Ini" di Budget Planner agar data lengkap saat diterapkan ke kalkulator utama. Saat ini, field `currentAvgPrice` tidak disertakan dari Budget Planner, sehingga kalkulator utama tidak memiliki data harga avg.

## Perubahan

### 1. Update Interface `BudgetPlannerData`
Tambahkan field `currentAvgPrice` pada interface:

```typescript
export interface BudgetPlannerData {
  lots: number;
  ratioOld: string;
  ratioNew: string;
  rightPrice: string;
  cumDatePrice: string;
  currentAvgPrice: string;  // BARU
  hasWarrant: boolean;
  warrantRatioOld: string;
  warrantRatioNew: string;
}
```

### 2. Tambah State Input di `BudgetLotPlanner.tsx`
Tambahkan state dan input field untuk harga avg:

```typescript
const [currentAvgPrice, setCurrentAvgPrice] = useState('');
```

### 3. Update UI di Budget Planner
Tambahkan input field di section "Info Right Issue" atau buat section baru "Kepemilikan":

**Lokasi**: Di bawah input Harga Cum-Date (grid cols-2)

```
┌─────────────────────────────────┐
│ Harga Pelaksanaan │ Harga Cum   │
│ [500]             │ [2.500]     │
├─────────────────────────────────┤
│ Harga Avg Saat Ini (opsional)   │
│ [1.800                      ]   │
│ Untuk kalkulasi avg baru        │
└─────────────────────────────────┘
```

### 4. Update Data yang Dikirim ke Kalkulator
Sertakan `currentAvgPrice` saat apply:

```typescript
onApplyToCalculator({
  lots: recommendedOption.lots,
  ratioOld,
  ratioNew,
  rightPrice,
  cumDatePrice,
  currentAvgPrice,  // BARU
  hasWarrant,
  warrantRatioOld,
  warrantRatioNew,
})
```

### 5. Update Handler di `index.tsx`
Modifikasi `handleApplyFromBudgetPlanner` untuk set `currentAvgPrice`:

```typescript
const handleApplyFromBudgetPlanner = useCallback((data: BudgetPlannerData) => {
  setRatioOld(data.ratioOld);
  setRatioNew(data.ratioNew);
  setRightPrice(data.rightPrice);
  setCumDatePrice(data.cumDatePrice);
  setCurrentLots(String(data.lots));
  setCurrentAvgPrice(data.currentAvgPrice);  // BARU
  setHasWarrant(data.hasWarrant);
  setWarrantRatioOld(data.warrantRatioOld);
  setWarrantRatioNew(data.warrantRatioNew);
  
  setActiveTab('calculator');
  // ...toast
}, [t]);
```

### 6. Tambah Translation Keys
Tambahkan key untuk label input baru:

```typescript
// Indonesian
'budgetPlanner.currentAvgPrice': 'Harga Avg Saat Ini',
'budgetPlanner.currentAvgPriceHelp': 'Opsional, untuk kalkulasi harga rata-rata baru',

// English
'budgetPlanner.currentAvgPrice': 'Current Avg Price',
'budgetPlanner.currentAvgPriceHelp': 'Optional, for new average price calculation',
```

## File yang Dimodifikasi

| File | Perubahan |
|------|-----------|
| `src/components/RightIssueCalculator/BudgetLotPlanner.tsx` | Tambah state `currentAvgPrice`, input field, dan sertakan di data yang dikirim |
| `src/components/RightIssueCalculator/index.tsx` | Update handler untuk set `currentAvgPrice` |
| `src/contexts/LanguageContext.tsx` | Tambah translation keys untuk label baru |

## Hasil Akhir
Setelah implementasi:
1. User mengisi semua parameter RI + harga avg saat ini di Budget Planner
2. Klik "Terapkan ke Kalkulator"
3. Semua data termasuk harga avg otomatis terisi di tab Kalkulator RI
4. User tinggal klik "Hitung" untuk mendapatkan hasil lengkap
