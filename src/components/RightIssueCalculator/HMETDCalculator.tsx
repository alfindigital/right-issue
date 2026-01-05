import React from 'react';
import { TrendingUp, Wallet, ArrowRightLeft } from 'lucide-react';

interface HMETDCalculatorProps {
  cumPrice: number;
  riPrice: number;
  ratioOld: number;
  ratioNew: number;
  newSharesCount: number;
}

const formatCurrency = (value: number): string => {
  return `Rp ${new Intl.NumberFormat('id-ID').format(Math.round(value))}`;
};

const HMETDCalculator: React.FC<HMETDCalculatorProps> = ({
  cumPrice,
  riPrice,
  ratioOld,
  ratioNew,
  newSharesCount,
}) => {
  // Guard against truly invalid data (only when no ratio is set)
  const hasValidData = ratioOld > 0 && ratioNew > 0;
  
  if (!hasValidData) {
    return (
      <div className="text-center p-4 text-muted-foreground text-sm">
        Masukkan data rasio RI terlebih dahulu
      </div>
    );
  }

  // Nilai Teoritis HMETD = (Harga Cum - Harga RI) / ((Rasio Lama / Rasio Baru) + 1)
  // Rumus ini memastikan nilai HMETD mencerminkan "dilusi" dari rasio
  const hmetdValue = Math.max(0, (cumPrice - riPrice) / ((ratioOld / ratioNew) + 1));
  
  // Jual HMETD: Dapat = Jatah RI x Nilai HMETD, Modal = 0
  // Ini adalah cash yang diterima sekarang
  const sellProfit = newSharesCount * hmetdValue;
  
  // Tebus RI: Bayar = Total Biaya Tebus, Dapat = Saham baru
  const exerciseCost = newSharesCount * riPrice;
  
  // TERP untuk estimasi gain
  const terp = ((cumPrice * ratioOld) + (riPrice * ratioNew)) / (ratioOld + ratioNew);
  
  // Potensi gain dari tebus = (TERP - Harga RI) x jumlah saham baru
  // Ini adalah unrealized gain (belum pasti karena tergantung harga pasar)
  const exercisePotentialGain = newSharesCount * (terp - riPrice);
  
  // Perbandingan: jual HMETD = cash sekarang vs tebus = potensi nilai lebih tinggi
  const isSellBetter = sellProfit > exercisePotentialGain;

  return (
    <div className="space-y-4">
      {/* Nilai Teoritis HMETD */}
      <div className="stagger-item text-center p-4 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl border border-primary/20" style={{ animationDelay: '0ms' }}>
        <p className="text-xs text-muted-foreground mb-1">Nilai Teoritis HMETD</p>
        <p className="text-2xl font-bold text-primary">{formatCurrency(hmetdValue)}</p>
        <p className="text-xs text-muted-foreground mt-1">per hak</p>
      </div>

      {/* Perbandingan Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Jual HMETD */}
        <div className={`stagger-item p-3 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
          isSellBetter 
            ? 'border-green-500 bg-green-50 dark:bg-green-950/30' 
            : 'border-border bg-muted/30'
        }`} style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Wallet className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold">Jual HMETD</span>
          </div>
          <div className="space-y-1.5">
            <div>
              <p className="text-[10px] text-muted-foreground">Modal</p>
              <p className="text-sm font-bold text-green-600">Rp 0</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Dapat</p>
              <p className="text-sm font-bold">{formatCurrency(sellProfit)}</p>
            </div>
          </div>
          {isSellBetter && (
            <div className="mt-2 flex items-center gap-1 text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span className="text-[10px] font-semibold">Lebih untung</span>
            </div>
          )}
        </div>

        {/* Tebus RI */}
        <div className={`stagger-item p-3 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
          !isSellBetter 
            ? 'border-green-500 bg-green-50 dark:bg-green-950/30' 
            : 'border-border bg-muted/30'
        }`} style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <ArrowRightLeft className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold">Tebus RI</span>
          </div>
          <div className="space-y-1.5">
            <div>
              <p className="text-[10px] text-muted-foreground">Modal</p>
              <p className="text-sm font-bold text-red-600">{formatCurrency(exerciseCost)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Potensi Gain</p>
              <p className="text-sm font-bold text-green-600">+{formatCurrency(exercisePotentialGain)}</p>
            </div>
          </div>
          {!isSellBetter && (
            <div className="mt-2 flex items-center gap-1 text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span className="text-[10px] font-semibold">Lebih untung</span>
            </div>
          )}
        </div>
      </div>

      {/* Rekomendasi */}
      <div className={`stagger-item p-3 rounded-xl text-center transition-all duration-300 ${
        isSellBetter 
          ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 dark:from-amber-950/30 dark:to-amber-900/20 dark:border-amber-800' 
          : 'bg-gradient-to-r from-green-50 to-green-100/50 border border-green-200 dark:from-green-950/30 dark:to-green-900/20 dark:border-green-800'
      }`} style={{ animationDelay: '300ms' }}>
        <p className={`text-sm font-bold ${isSellBetter ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400'}`}>
          {isSellBetter ? 'Jual HMETD lebih menguntungkan' : 'Tebus RI lebih menguntungkan'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Selisih: +{formatCurrency(Math.abs(sellProfit - exercisePotentialGain))}
        </p>
      </div>
    </div>
  );
};

export default HMETDCalculator;
