import React from 'react';
import { TrendingUp, Wallet, ArrowRightLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { language } = useLanguage();
  
  const hasValidData = ratioOld > 0 && ratioNew > 0;
  
  if (!hasValidData) {
    return (
      <div className="text-center p-4 text-muted-foreground text-sm">
        {language === 'id' ? 'Masukkan data rasio RI terlebih dahulu' : 'Enter RI ratio data first'}
      </div>
    );
  }

  const hmetdValue = Math.max(0, (cumPrice - riPrice) / ((ratioOld / ratioNew) + 1));
  const sellProfit = newSharesCount * hmetdValue;
  const exerciseCost = newSharesCount * riPrice;
  const terp = ((cumPrice * ratioOld) + (riPrice * ratioNew)) / (ratioOld + ratioNew);
  const exercisePotentialGain = newSharesCount * (terp - riPrice);
  const isSellBetter = sellProfit > exercisePotentialGain;

  return (
    <div className="space-y-4">
      {/* Nilai Teoritis HMETD */}
      <div className="stagger-item text-center p-4 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl border border-primary/20" style={{ animationDelay: '0ms' }}>
        <p className="text-xs text-muted-foreground mb-1">
          {language === 'id' ? 'Nilai Teoritis HMETD' : 'Theoretical HMETD Value'}
        </p>
        <p className="text-2xl font-bold text-primary">{formatCurrency(hmetdValue)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {language === 'id' ? 'per hak' : 'per right'}
        </p>
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
            <span className="text-xs font-semibold">
              {language === 'id' ? 'Jual HMETD' : 'Sell HMETD'}
            </span>
          </div>
          <div className="space-y-1.5">
            <div>
              <p className="text-[10px] text-muted-foreground">
                {language === 'id' ? 'Modal' : 'Capital'}
              </p>
              <p className="text-sm font-bold text-green-600">Rp 0</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">
                {language === 'id' ? 'Dapat' : 'Receive'}
              </p>
              <p className="text-sm font-bold">{formatCurrency(sellProfit)}</p>
            </div>
          </div>
          {isSellBetter && (
            <div className="mt-2 flex items-center gap-1 text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span className="text-[10px] font-semibold">
                {language === 'id' ? 'Lebih untung' : 'More profitable'}
              </span>
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
            <span className="text-xs font-semibold">
              {language === 'id' ? 'Tebus RI' : 'Exercise RI'}
            </span>
          </div>
          <div className="space-y-1.5">
            <div>
              <p className="text-[10px] text-muted-foreground">
                {language === 'id' ? 'Modal' : 'Capital'}
              </p>
              <p className="text-sm font-bold text-red-600">{formatCurrency(exerciseCost)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">
                {language === 'id' ? 'Potensi Gain' : 'Potential Gain'}
              </p>
              <p className="text-sm font-bold text-green-600">+{formatCurrency(exercisePotentialGain)}</p>
            </div>
          </div>
          {!isSellBetter && (
            <div className="mt-2 flex items-center gap-1 text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span className="text-[10px] font-semibold">
                {language === 'id' ? 'Lebih untung' : 'More profitable'}
              </span>
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
          {isSellBetter 
            ? (language === 'id' ? 'Jual HMETD lebih menguntungkan' : 'Selling HMETD is more profitable')
            : (language === 'id' ? 'Tebus RI lebih menguntungkan' : 'Exercising RI is more profitable')}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {language === 'id' ? 'Selisih:' : 'Difference:'} +{formatCurrency(Math.abs(sellProfit - exercisePotentialGain))}
        </p>
      </div>
    </div>
  );
};

export default HMETDCalculator;
