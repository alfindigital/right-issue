import React from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowRightLeft } from 'lucide-react';

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
  // Nilai Teoritis HMETD = (Harga Cum - Harga RI) / ((Rasio Lama / Rasio Baru) + 1)
  const hmetdValue = (cumPrice - riPrice) / ((ratioOld / ratioNew) + 1);
  
  // Jual HMETD: Dapat = Jatah RI x Nilai HMETD, Modal = 0
  const sellProfit = newSharesCount * hmetdValue;
  
  // Tebus RI: Bayar = Total Biaya Tebus, Dapat = Saham baru
  const exerciseCost = newSharesCount * riPrice;
  
  // TERP untuk estimasi gain
  const terp = ((cumPrice * ratioOld) + (riPrice * ratioNew)) / (ratioOld + ratioNew);
  const exercisePotentialGain = newSharesCount * (terp - riPrice);
  
  // Rekomendasi: bandingkan nilai jual HMETD vs potential gain tebus
  const isSellBetter = sellProfit > exercisePotentialGain;

  return (
    <div className="space-y-4">
      {/* Nilai Teoritis HMETD */}
      <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
        <p className="text-xs text-muted-foreground mb-1">Nilai Teoritis HMETD</p>
        <p className="text-2xl font-bold text-primary">{formatCurrency(hmetdValue)}</p>
        <p className="text-xs text-muted-foreground mt-1">per lembar hak</p>
      </div>

      {/* Perbandingan Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Jual HMETD */}
        <div className={`p-3 rounded-lg border-2 transition-all ${
          isSellBetter 
            ? 'border-green-500 bg-green-50 dark:bg-green-950/30' 
            : 'border-border bg-muted/30'
        }`}>
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
              <span className="text-[10px] font-semibold">LEBIH UNTUNG</span>
            </div>
          )}
        </div>

        {/* Tebus RI */}
        <div className={`p-3 rounded-lg border-2 transition-all ${
          !isSellBetter 
            ? 'border-green-500 bg-green-50 dark:bg-green-950/30' 
            : 'border-border bg-muted/30'
        }`}>
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
              <span className="text-[10px] font-semibold">LEBIH UNTUNG</span>
            </div>
          )}
        </div>
      </div>

      {/* Rekomendasi */}
      <div className={`p-3 rounded-lg text-center ${
        isSellBetter 
          ? 'bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800' 
          : 'bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-800'
      }`}>
        <p className={`text-sm font-bold ${isSellBetter ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400'}`}>
          {isSellBetter ? '💰 Jual HMETD lebih menguntungkan' : '🔄 Tebus RI lebih menguntungkan'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {isSellBetter 
            ? `Selisih: +${formatCurrency(sellProfit - exercisePotentialGain)}`
            : `Selisih: +${formatCurrency(exercisePotentialGain - sellProfit)}`
          }
        </p>
      </div>
    </div>
  );
};

export default HMETDCalculator;
