import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations: Record<Language, Record<string, string>> = {
  id: {
    // Header
    'app.title': 'Kalkulator Right Issue',
    'app.subtitle': 'Hitung kebutuhan dana & saham baru',
    
    // Stock Code
    'stockCode.label': 'Kode Saham',
    'stockCode.placeholder': 'Contoh: BBRI',
    
    // Right Issue Info
    'rightIssue.title': 'Informasi Right Issue',
    'rightIssue.ratio': 'Rasio',
    'rightIssue.ratioOld': 'Saham Lama',
    'rightIssue.ratioNew': 'Hak Baru',
    'rightIssue.ratioHelp': 'Setiap {old} saham lama mendapat hak untuk membeli {new} saham baru',
    'rightIssue.price': 'Harga Pelaksanaan',
    'rightIssue.priceHelp': 'Harga per lembar saham baru yang harus dibayar',
    'rightIssue.cumPrice': 'Harga Cum-Date',
    'rightIssue.cumPriceHelp': 'Harga saham terakhir sebelum ex-date (tanggal cum-date)',
    'rightIssue.hasWarrant': 'Dengan Waran',
    'rightIssue.warrantRatio': 'Rasio Waran',
    'rightIssue.warrantRatioHelp': 'Setiap {old} saham baru mendapat {new} waran',
    
    // Ownership
    'ownership.title': 'Kepemilikan Saat Ini',
    'ownership.currentLots': 'Jumlah Lot',
    'ownership.currentLotsHelp': 'Jumlah lot saham yang dimiliki saat ini (1 lot = 100 lembar)',
    'ownership.avgPrice': 'Harga Rata-rata',
    'ownership.avgPriceHelp': 'Harga beli rata-rata per lembar saham',
    'ownership.totalValue': 'Total Nilai',
    'ownership.calculate': 'Hitung',
    
    // New Shares
    'newShares.title': 'Saham Baru (Right Issue)',
    'newShares.lots': 'Jumlah Lot Baru',
    'newShares.avgPrice': 'Harga',
    'newShares.totalValue': 'Total Modal',
    
    // Final
    'final.title': 'Setelah Right Issue',
    'final.lots': 'Total Lot',
    'final.avgPrice': 'Avg Baru',
    'final.totalValue': 'Total Modal',
    
    // Warrant
    'warrant.title': 'Hasil Waran',
    'warrant.count': 'Jumlah Waran',
    'warrant.info': 'Waran dapat dieksekusi sesuai ketentuan emiten',
    
    // Lot Optimization
    'lotOptimization.title': 'Optimasi Lot',
    'lotOptimization.current': 'Lot saat ini',
    'lotOptimization.suggestion': 'Saran',
    'lotOptimization.perfect': 'Sudah optimal! Tidak ada sisa saham.',
    'lotOptimization.adjust': 'Untuk hasil optimal tanpa sisa:',
    'lotOptimization.add': 'Tambah',
    'lotOptimization.remove': 'Kurangi',
    'lotOptimization.lots': 'lot',
    'lotOptimization.apply': 'Terapkan',
    
    // Conclusion
    'conclusion.title': 'Kesimpulan',
    'conclusion.terp': 'TERP',
    'conclusion.terpFull': 'Theoretical Ex-Right Price',
    'conclusion.terpHelp': 'Harga teoritis saham setelah right issue berdasarkan perhitungan weighted average',
    'conclusion.newLots': 'Hak Tebus',
    'conclusion.exercisePrice': 'Harga Tebus',
    'conclusion.totalCost': 'Dana Dibutuhkan',
    'conclusion.newAvg': 'Avg Baru',
    'conclusion.recommendation': 'Rekomendasi',
    
    // Recommendations
    'recommendation.positive': 'TERP lebih tinggi dari harga pelaksanaan. Right issue ini berpotensi menguntungkan.',
    'recommendation.negative': 'TERP lebih rendah dari harga pelaksanaan. Pertimbangkan dengan hati-hati.',
    
    // Advanced Analysis
    'advanced.title': 'Analisis Lanjutan',
    'advanced.composition': 'Komposisi Saham',
    'advanced.oldShares': 'Saham Lama',
    'advanced.newShares': 'Saham Baru',
    'advanced.priceComparison': 'Perbandingan Harga',
    'advanced.cumPrice': 'Harga Cum',
    'advanced.riPrice': 'Harga RI',
    'advanced.terp': 'TERP',
    'advanced.newAvg': 'Avg Baru',
    'advanced.breakeven': 'Break-Even & ROI',
    'advanced.hmetd': 'Kalkulator HMETD',
    
    // History
    'history.title': 'Riwayat',
    'history.empty': 'Belum ada riwayat kalkulasi',
    'history.clear': 'Hapus Semua',
    'history.load': 'Muat',
    'history.delete': 'Hapus',
    
    // Actions
    'action.reset': 'Reset',
    'action.share': 'Bagikan',
    'action.export': 'Ekspor',
    
    // Toast messages
    'toast.restored': 'Data dipulihkan',
    'toast.restoredDesc': 'Input terakhir Anda telah dipulihkan.',
    'toast.copied': 'Link disalin!',
    'toast.copiedDesc': 'Link kalkulasi berhasil disalin ke clipboard.',
    'toast.historyLoaded': 'Data dimuat',
    'toast.historyLoadedDesc': 'Kalkulasi dari riwayat berhasil dimuat.',
    
    // Offline
    'offline.message': 'Anda sedang offline. Semua data tersimpan lokal.',
    'pwa.updateAvailable': 'Versi baru tersedia',
    'pwa.update': 'Update',
    
    // Footer
    'footer.copyright': '©',
  },
  en: {
    // Header
    'app.title': 'Right Issue Calculator',
    'app.subtitle': 'Calculate fund requirements & new shares',
    
    // Stock Code
    'stockCode.label': 'Stock Code',
    'stockCode.placeholder': 'e.g., BBRI',
    
    // Right Issue Info
    'rightIssue.title': 'Right Issue Information',
    'rightIssue.ratio': 'Ratio',
    'rightIssue.ratioOld': 'Old Shares',
    'rightIssue.ratioNew': 'New Rights',
    'rightIssue.ratioHelp': 'Every {old} old shares entitled to buy {new} new shares',
    'rightIssue.price': 'Exercise Price',
    'rightIssue.priceHelp': 'Price per new share to be paid',
    'rightIssue.cumPrice': 'Cum-Date Price',
    'rightIssue.cumPriceHelp': 'Last share price before ex-date (cum-date)',
    'rightIssue.hasWarrant': 'With Warrant',
    'rightIssue.warrantRatio': 'Warrant Ratio',
    'rightIssue.warrantRatioHelp': 'Every {old} new shares receive {new} warrants',
    
    // Ownership
    'ownership.title': 'Current Ownership',
    'ownership.currentLots': 'Number of Lots',
    'ownership.currentLotsHelp': 'Number of lots currently owned (1 lot = 100 shares)',
    'ownership.avgPrice': 'Average Price',
    'ownership.avgPriceHelp': 'Average purchase price per share',
    'ownership.totalValue': 'Total Value',
    'ownership.calculate': 'Calculate',
    
    // New Shares
    'newShares.title': 'New Shares (Right Issue)',
    'newShares.lots': 'New Lots',
    'newShares.avgPrice': 'Price',
    'newShares.totalValue': 'Total Capital',
    
    // Final
    'final.title': 'After Right Issue',
    'final.lots': 'Total Lots',
    'final.avgPrice': 'New Avg',
    'final.totalValue': 'Total Capital',
    
    // Warrant
    'warrant.title': 'Warrant Result',
    'warrant.count': 'Warrant Count',
    'warrant.info': 'Warrants can be exercised according to issuer terms',
    
    // Lot Optimization
    'lotOptimization.title': 'Lot Optimization',
    'lotOptimization.current': 'Current lots',
    'lotOptimization.suggestion': 'Suggestion',
    'lotOptimization.perfect': 'Already optimal! No remaining shares.',
    'lotOptimization.adjust': 'For optimal result without remainder:',
    'lotOptimization.add': 'Add',
    'lotOptimization.remove': 'Reduce',
    'lotOptimization.lots': 'lots',
    'lotOptimization.apply': 'Apply',
    
    // Conclusion
    'conclusion.title': 'Conclusion',
    'conclusion.terp': 'TERP',
    'conclusion.terpFull': 'Theoretical Ex-Right Price',
    'conclusion.terpHelp': 'Theoretical share price after right issue based on weighted average calculation',
    'conclusion.newLots': 'Rights',
    'conclusion.exercisePrice': 'Exercise Price',
    'conclusion.totalCost': 'Funds Required',
    'conclusion.newAvg': 'New Avg',
    'conclusion.recommendation': 'Recommendation',
    
    // Recommendations
    'recommendation.positive': 'TERP is higher than exercise price. This right issue is potentially profitable.',
    'recommendation.negative': 'TERP is lower than exercise price. Consider carefully.',
    
    // Advanced Analysis
    'advanced.title': 'Advanced Analysis',
    'advanced.composition': 'Share Composition',
    'advanced.oldShares': 'Old Shares',
    'advanced.newShares': 'New Shares',
    'advanced.priceComparison': 'Price Comparison',
    'advanced.cumPrice': 'Cum Price',
    'advanced.riPrice': 'RI Price',
    'advanced.terp': 'TERP',
    'advanced.newAvg': 'New Avg',
    'advanced.breakeven': 'Break-Even & ROI',
    'advanced.hmetd': 'HMETD Calculator',
    
    // History
    'history.title': 'History',
    'history.empty': 'No calculation history yet',
    'history.clear': 'Clear All',
    'history.load': 'Load',
    'history.delete': 'Delete',
    
    // Actions
    'action.reset': 'Reset',
    'action.share': 'Share',
    'action.export': 'Export',
    
    // Toast messages
    'toast.restored': 'Data restored',
    'toast.restoredDesc': 'Your last input has been restored.',
    'toast.copied': 'Link copied!',
    'toast.copiedDesc': 'Calculation link copied to clipboard.',
    'toast.historyLoaded': 'Data loaded',
    'toast.historyLoadedDesc': 'Calculation from history loaded successfully.',
    
    // Offline
    'offline.message': 'You are offline. All data is saved locally.',
    'pwa.updateAvailable': 'New version available',
    'pwa.update': 'Update',
    
    // Footer
    'footer.copyright': '©',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('id');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'id' || savedLang === 'en')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
