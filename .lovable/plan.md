
# Plan: Simpan Konfigurasi Budget Planner ke History

## Ringkasan
Menambahkan fitur untuk menyimpan dan memuat konfigurasi Budget Planner ke localStorage. User dapat menyimpan planning untuk berbagai saham RI dan load kembali kapan saja.

---

## Perubahan UI/UX

### Layout Header Budget Planner

**Saat Ini:**
```
+----------------------------------------+
|  📊 Informasi Right Issue              |
+----------------------------------------+
```

**Setelah:**
```
+----------------------------------------+
|  📊 Informasi Right Issue   [📂▼] [💾] |
+----------------------------------------+
```

- **[📂▼]** = Dropdown load konfigurasi tersimpan
- **[💾]** = Tombol simpan konfigurasi saat ini

### Dropdown Load History (Mobile-First)

```
+----------------------------------------+
| Konfigurasi Tersimpan (3)    [Hapus]   |
+----------------------------------------+
| BRIS  5:2  Rp500  10jt         1h  [×] |
| BRPT  3:1  Rp350  25jt        2h  [×]  |
| MDKA  2:1  Rp200  50jt        1d  [×]  |
+----------------------------------------+
```

### Toast Feedback
- "Konfigurasi disimpan" saat berhasil simpan
- "Konfigurasi dimuat" saat load dari history

---

## Detail Teknis

### File Baru

#### 1. `src/hooks/useBudgetPlannerHistory.ts`

```typescript
export interface BudgetPlannerHistoryItem {
  id: string;
  timestamp: number;
  stockCode?: string;  // Optional identifier
  config: {
    ratioOld: string;
    ratioNew: string;
    rightPrice: string;
    cumDatePrice: string;
    currentAvgPrice: string;
    budget: string;
    includeExerciseFund: boolean;
    hasWarrant: boolean;
    warrantRatioOld: string;
    warrantRatioNew: string;
  };
}

const STORAGE_KEY = 'ri-budget-planner-history';
const MAX_HISTORY_ITEMS = 10;

export const useBudgetPlannerHistory = () => {
  const [history, setHistory] = useState<BudgetPlannerHistoryItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  // Save to localStorage
  const saveToStorage = (items: BudgetPlannerHistoryItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  // Add config to history
  const addToHistory = (config: BudgetPlannerHistoryItem['config'], stockCode?: string) => {
    const newItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      stockCode,
      config,
    };
    const updated = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    setHistory(updated);
    saveToStorage(updated);
  };

  // Remove item
  const removeFromHistory = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    saveToStorage(updated);
  };

  // Clear all
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { history, addToHistory, removeFromHistory, clearHistory };
};
```

#### 2. `src/components/RightIssueCalculator/BudgetPlannerHistoryDropdown.tsx`

Komponen dropdown mirip `HistoryDropdown.tsx` tapi disesuaikan untuk Budget Planner:

```typescript
interface Props {
  history: BudgetPlannerHistoryItem[];
  onSelectHistory: (item: BudgetPlannerHistoryItem) => void;
  onRemoveHistory: (id: string) => void;
  onClearHistory: () => void;
}

// Display format per item:
// [BRIS] 5:2 Rp500 10jt  |  2h ago  [×]
```

**Fitur:**
- Icon folder/file untuk tombol trigger
- Badge count jika ada history
- Disabled state jika kosong
- Relative time formatting (baru saja, 1j, 2h, dst)
- Tombol delete per item
- Tombol clear all di header

### File yang Diubah

#### 3. `src/components/RightIssueCalculator/BudgetLotPlanner.tsx`

**Tambah import:**
```typescript
import { Save, FolderOpen } from 'lucide-react';
import { useBudgetPlannerHistory } from '@/hooks/useBudgetPlannerHistory';
import BudgetPlannerHistoryDropdown from './BudgetPlannerHistoryDropdown';
import { toast } from 'sonner';
```

**Tambah state untuk stock code (opsional):**
```typescript
const [stockCode, setStockCode] = useState('');
```

**Tambah hook:**
```typescript
const { history, addToHistory, removeFromHistory, clearHistory } = useBudgetPlannerHistory();
```

**Tambah handler:**
```typescript
const handleSaveConfig = () => {
  addToHistory({
    ratioOld,
    ratioNew,
    rightPrice,
    cumDatePrice,
    currentAvgPrice,
    budget,
    includeExerciseFund,
    hasWarrant,
    warrantRatioOld,
    warrantRatioNew,
  }, stockCode || undefined);
  
  toast.success(t('budgetPlanner.configSaved'));
};

const handleLoadConfig = (item: BudgetPlannerHistoryItem) => {
  const { config, stockCode: savedCode } = item;
  setRatioOld(config.ratioOld);
  setRatioNew(config.ratioNew);
  setRightPrice(config.rightPrice);
  setCumDatePrice(config.cumDatePrice);
  setCurrentAvgPrice(config.currentAvgPrice);
  setBudget(config.budget);
  setIncludeExerciseFund(config.includeExerciseFund);
  setHasWarrant(config.hasWarrant);
  setWarrantRatioOld(config.warrantRatioOld);
  setWarrantRatioNew(config.warrantRatioNew);
  if (savedCode) setStockCode(savedCode);
  
  toast.success(t('budgetPlanner.configLoaded'));
};
```

**Update UI Header Section:**
```tsx
<div className="card-calculator">
  <div className="flex items-center justify-between mb-3">
    <h2 className="section-title flex items-center gap-2 mb-0">
      <TrendingUp className="w-4 h-4 text-primary" />
      {t('rightIssue.title')}
    </h2>
    
    <div className="flex items-center gap-1">
      {/* Load Dropdown */}
      <BudgetPlannerHistoryDropdown
        history={history}
        onSelectHistory={handleLoadConfig}
        onRemoveHistory={removeFromHistory}
        onClearHistory={clearHistory}
      />
      
      {/* Save Button */}
      <button
        onClick={handleSaveConfig}
        disabled={!isInputComplete}
        className="p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={t('budgetPlanner.saveConfig')}
      >
        <Save className="w-4 h-4" />
      </button>
    </div>
  </div>
  
  {/* Stock Code Input - Optional identifier */}
  <div className="mb-3">
    <label className="text-xs text-muted-foreground mb-1 block">
      {t('stockCode.label')} ({t('stockCode.optional')})
    </label>
    <input
      type="text"
      value={stockCode}
      onChange={(e) => setStockCode(e.target.value.toUpperCase().slice(0, 4))}
      placeholder="BBRI"
      className="input-calculator w-24"
      maxLength={4}
    />
  </div>
  
  {/* ... rest of form ... */}
</div>
```

#### 4. `src/contexts/LanguageContext.tsx`

**Tambah translation keys:**
```typescript
// Indonesian
'budgetPlanner.saveConfig': 'Simpan Konfigurasi',
'budgetPlanner.loadConfig': 'Muat Konfigurasi',
'budgetPlanner.configSaved': 'Konfigurasi disimpan',
'budgetPlanner.configLoaded': 'Konfigurasi dimuat',
'budgetPlanner.savedConfigs': 'Konfigurasi Tersimpan',
'budgetPlanner.noSavedConfigs': 'Belum ada konfigurasi tersimpan',

// English
'budgetPlanner.saveConfig': 'Save Configuration',
'budgetPlanner.loadConfig': 'Load Configuration',
'budgetPlanner.configSaved': 'Configuration saved',
'budgetPlanner.configLoaded': 'Configuration loaded',
'budgetPlanner.savedConfigs': 'Saved Configurations',
'budgetPlanner.noSavedConfigs': 'No saved configurations yet',
```

---

## Catatan UX

1. **Lokasi Tombol**:
   - Tombol Save & Load di header section "Info RI" agar mudah dijangkau
   - Compact (hanya icon) agar tidak memakan space di mobile

2. **Stock Code Input**:
   - Optional tapi berguna untuk identifikasi
   - Posisi di atas form, sebelum ratio
   - Max 4 karakter, auto uppercase

3. **Save Validation**:
   - Tombol Save disabled jika form belum lengkap (minimal ratio, harga, budget)
   - Mencegah save konfigurasi kosong

4. **Load Behavior**:
   - Replace semua field saat load
   - Toast confirmation
   - Auto-close dropdown setelah select

5. **History Limit**:
   - Max 10 konfigurasi (sama seperti calculator history)
   - FIFO: yang paling lama otomatis terhapus

6. **Dropdown Display**:
   - Menampilkan stock code, ratio, harga RI, budget
   - Relative time (baru saja, 1j, 2h)
   - Delete button per item

---

## Visualisasi Mobile

```
+----------------------------------+
| Informasi Right Issue  [📂][💾]  |
+----------------------------------+
| Kode Saham (opsional)            |
| [BBRI    ]                       |
+----------------------------------+
| Rasio                            |
| [5] : [2]                        |
+----------------------------------+
```

Saat klik [📂]:
```
+----------------------------------+
| Konfigurasi Tersimpan (3) [Hapus]|
+----------------------------------+
| BRIS  5:2  Rp500  10jt      1j ×|
| BRPT  3:1  Rp350  25jt      2j ×|
| MDKA  2:1  Rp200  50jt      1h ×|
+----------------------------------+
```
