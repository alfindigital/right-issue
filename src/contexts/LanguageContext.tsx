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
    'pwa.updateDesc': 'Klik untuk memperbarui aplikasi',
    'pwa.update': 'Update',
    'pwa.later': 'Nanti',
    
    // Charts
    'charts.title': 'Analisis Grafik',
    'charts.priceComparison': 'Perbandingan Harga',
    'charts.hmetdVsExercise': 'Jual HMETD vs Tebus',
    'charts.noData': 'Data tidak tersedia untuk grafik',
    'charts.sellHmetd': 'Jual HMETD',
    'charts.exerciseRi': 'Tebus RI',
    
    // Back to top
    'backToTop.label': 'Kembali ke atas',
    
    // Footer
    'footer.copyright': '©',
    
    // Keyboard Shortcuts
    'shortcuts.title': 'Pintasan Keyboard',
    'shortcuts.calculate': 'Hitung',
    'shortcuts.reset': 'Reset form',
    'shortcuts.share': 'Salin link',
    'shortcuts.escape': 'Tutup fokus',
    'shortcuts.help': 'Bantuan pintasan',
    
    // Embed Widget
    'embed.title': 'Embed Kalkulator',
    'embed.preview': 'Pratinjau',
    'embed.size': 'Ukuran',
    'embed.small': 'Kecil',
    'embed.medium': 'Sedang',
    'embed.large': 'Besar',
    'embed.theme': 'Tema',
    'embed.copyCode': 'Salin Kode',
    'embed.copied': 'Kode berhasil disalin!',
    'embed.poweredBy': 'Dibuat dengan',
    
    // Scenario Comparison
    'scenario.title': 'Perbandingan Skenario',
    'scenario.chartView': 'Grafik',
    'scenario.detailView': 'Detail',
    'scenario.fullExercise': 'Tebus Penuh',
    'scenario.fullExerciseDesc': 'Tebus semua hak HMETD',
    'scenario.partialExercise': 'Tebus Sebagian',
    'scenario.partialExerciseDesc': 'Tebus 50% + Jual 50% HMETD',
    'scenario.partialPercent': 'Persentase Tebus Sebagian',
    'scenario.exercise': 'Tebus',
    'scenario.sell': 'Jual',
    'scenario.sellHmetd': 'Jual HMETD',
    'scenario.sellHmetdDesc': 'Jual semua hak HMETD',
    'scenario.bestOption': 'Opsi Terbaik',
    'scenario.best': 'Terbaik',
    'scenario.potentialProfit': 'Potensi Keuntungan',
    'scenario.cost': 'Biaya',
    'scenario.finalShares': 'Saham Akhir',
    'scenario.finalValue': 'Nilai Akhir',
    'scenario.profitLoss': 'Profit/Loss',
    
    // Budget Planner
    'budgetPlanner.title': 'Budget Planner',
    'budgetPlanner.budget': 'Budget Anda',
    'budgetPlanner.totalBudget': 'Total Budget',
    'budgetPlanner.includeExercise': 'Termasuk Dana Tebus RI',
    'budgetPlanner.includeExerciseDesc': 'Budget akan mencakup biaya beli saham dan dana tebus RI',
    'budgetPlanner.excludeExerciseDesc': 'Budget hanya untuk beli saham, siapkan dana tebus RI terpisah',
    'budgetPlanner.recommendation': 'Rekomendasi Lot',
    'budgetPlanner.optimalLot': 'LOT OPTIMAL',
    'budgetPlanner.buyingCost': 'Biaya Beli',
    'budgetPlanner.exerciseCost': 'Dana Tebus',
    'budgetPlanner.totalCost': 'Total Biaya',
    'budgetPlanner.remaining': 'Sisa Budget',
    'budgetPlanner.riResult': 'Hasil RI',
    'budgetPlanner.shares': 'lembar',
    'budgetPlanner.applyToCalculator': 'Terapkan ke Kalkulator',
    'budgetPlanner.showAllOptions': 'Lihat semua opsi',
    'budgetPlanner.hideOptions': 'Sembunyikan',
    'budgetPlanner.insufficientBudget': 'Budget tidak mencukupi',
    'budgetPlanner.insufficientBudgetDesc': 'Budget minimal tidak tercapai untuk membeli 1 lot optimal. Coba tingkatkan budget atau sesuaikan parameter RI.',
    'budgetPlanner.allocation': 'Alokasi Budget',
    'budgetPlanner.used': 'Terpakai',
    'budgetPlanner.applied': 'Berhasil Diterapkan',
    'budgetPlanner.appliedDesc': 'telah diterapkan ke kalkulator',
    
    // Tab Navigation
    'tab.calculator': 'Kalkulator RI',
    'tab.budgetPlanner': 'Budget Planner',
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
    'pwa.updateDesc': 'Click to update the app',
    'pwa.update': 'Update',
    'pwa.later': 'Later',
    
    // Charts
    'charts.title': 'Chart Analysis',
    'charts.priceComparison': 'Price Comparison',
    'charts.hmetdVsExercise': 'Sell HMETD vs Exercise',
    'charts.noData': 'No data available for chart',
    'charts.sellHmetd': 'Sell HMETD',
    'charts.exerciseRi': 'Exercise RI',
    
    // Back to top
    'backToTop.label': 'Back to top',
    
    // Footer
    'footer.copyright': '©',
    
    // Keyboard Shortcuts
    'shortcuts.title': 'Keyboard Shortcuts',
    'shortcuts.calculate': 'Calculate',
    'shortcuts.reset': 'Reset form',
    'shortcuts.share': 'Copy link',
    'shortcuts.escape': 'Close focus',
    'shortcuts.help': 'Shortcut help',
    
    // Embed Widget
    'embed.title': 'Embed Calculator',
    'embed.preview': 'Preview',
    'embed.size': 'Size',
    'embed.small': 'Small',
    'embed.medium': 'Medium',
    'embed.large': 'Large',
    'embed.theme': 'Theme',
    'embed.copyCode': 'Copy Code',
    'embed.copied': 'Code copied!',
    'embed.poweredBy': 'Powered by',
    
    // Scenario Comparison
    'scenario.title': 'Scenario Comparison',
    'scenario.chartView': 'Chart',
    'scenario.detailView': 'Details',
    'scenario.fullExercise': 'Full Exercise',
    'scenario.fullExerciseDesc': 'Exercise all HMETD rights',
    'scenario.partialExercise': 'Partial Exercise',
    'scenario.partialExerciseDesc': 'Exercise 50% + Sell 50% HMETD',
    'scenario.partialPercent': 'Partial Exercise Percentage',
    'scenario.exercise': 'Exercise',
    'scenario.sell': 'Sell',
    'scenario.sellHmetd': 'Sell HMETD',
    'scenario.sellHmetdDesc': 'Sell all HMETD rights',
    'scenario.bestOption': 'Best Option',
    'scenario.best': 'Best',
    'scenario.potentialProfit': 'Potential Profit',
    'scenario.cost': 'Cost',
    'scenario.finalShares': 'Final Shares',
    'scenario.finalValue': 'Final Value',
    'scenario.profitLoss': 'Profit/Loss',
    
    // Budget Planner
    'budgetPlanner.title': 'Budget Planner',
    'budgetPlanner.budget': 'Your Budget',
    'budgetPlanner.totalBudget': 'Total Budget',
    'budgetPlanner.includeExercise': 'Include Exercise Fund',
    'budgetPlanner.includeExerciseDesc': 'Budget includes share purchase and RI exercise cost',
    'budgetPlanner.excludeExerciseDesc': 'Budget only for share purchase, prepare RI exercise fund separately',
    'budgetPlanner.recommendation': 'Lot Recommendation',
    'budgetPlanner.optimalLot': 'OPTIMAL LOT',
    'budgetPlanner.buyingCost': 'Buying Cost',
    'budgetPlanner.exerciseCost': 'Exercise Cost',
    'budgetPlanner.totalCost': 'Total Cost',
    'budgetPlanner.remaining': 'Remaining',
    'budgetPlanner.riResult': 'RI Result',
    'budgetPlanner.shares': 'shares',
    'budgetPlanner.applyToCalculator': 'Apply to Calculator',
    'budgetPlanner.showAllOptions': 'Show all options',
    'budgetPlanner.hideOptions': 'Hide',
    'budgetPlanner.insufficientBudget': 'Insufficient budget',
    'budgetPlanner.insufficientBudgetDesc': 'Minimum budget not reached for 1 optimal lot. Try increasing budget or adjusting RI parameters.',
    'budgetPlanner.allocation': 'Budget Allocation',
    'budgetPlanner.used': 'Used',
    'budgetPlanner.applied': 'Successfully Applied',
    'budgetPlanner.appliedDesc': 'has been applied to calculator',
    
    // Tab Navigation
    'tab.calculator': 'RI Calculator',
    'tab.budgetPlanner': 'Budget Planner',
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
