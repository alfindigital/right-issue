import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ValidationErrors } from '@/hooks/useInputValidation';

interface InputSummaryProps {
  errors: ValidationErrors;
  ratioOld: string;
  ratioNew: string;
  rightPrice: string;
  cumDatePrice: string;
  noOwnership: boolean;
  currentLots: string;
  currentAvgPrice: string;
  hmetdLots: string;
  hmetdPrice: string;
  hasWarrant: boolean;
  warrantRatioOld: string;
  warrantRatioNew: string;
}

const fmtInt = (raw: string) =>
  raw ? new Intl.NumberFormat('id-ID').format(parseInt(raw)) : '';

/**
 * Compact side-summary that lists every input the user has filled in correctly
 * (no validation error). Helps users double-check before pressing "Hitung".
 */
const InputSummary: React.FC<InputSummaryProps> = ({
  errors,
  ratioOld,
  ratioNew,
  rightPrice,
  cumDatePrice,
  noOwnership,
  currentLots,
  currentAvgPrice,
  hmetdLots,
  hmetdPrice,
  hasWarrant,
  warrantRatioOld,
  warrantRatioNew,
}) => {
  const { language } = useLanguage();
  const L = (id: string, en: string) => (language === 'id' ? id : en);

  type Row = { label: string; value: string };
  const rows: Row[] = [];

  // Right Issue
  if (ratioOld && ratioNew && !errors.ratioOld && !errors.ratioNew) {
    rows.push({ label: L('Rasio RI', 'RI Ratio'), value: `${ratioOld} : ${ratioNew}` });
  }
  if (rightPrice && !errors.rightPrice) {
    rows.push({
      label: L('Harga Pelaksanaan', 'Exercise Price'),
      value: `Rp ${fmtInt(rightPrice)} / ${L('lembar', 'share')}`,
    });
  }
  if (cumDatePrice && !errors.cumDatePrice) {
    rows.push({
      label: L('Harga Cum-date', 'Cum-date Price'),
      value: `Rp ${fmtInt(cumDatePrice)} / ${L('lembar', 'share')}`,
    });
  }

  // Ownership / HMETD
  if (noOwnership) {
    if (hmetdLots && !errors.hmetdLots) {
      rows.push({ label: L('Lot HMETD', 'HMETD Lots'), value: `${fmtInt(hmetdLots)} lot` });
    }
    if (hmetdPrice && !errors.hmetdPrice) {
      rows.push({
        label: L('Harga HMETD', 'HMETD Price'),
        value: `Rp ${fmtInt(hmetdPrice)} / ${L('lembar', 'share')}`,
      });
    }
  } else {
    if (currentLots && !errors.currentLots) {
      rows.push({ label: L('Lot Saat Ini', 'Current Lots'), value: `${fmtInt(currentLots)} lot` });
    }
    if (currentAvgPrice && !errors.currentAvgPrice) {
      rows.push({
        label: L('Harga Rata-rata', 'Average Price'),
        value: `Rp ${fmtInt(currentAvgPrice)} / ${L('lembar', 'share')}`,
      });
    }
  }

  // Warrant
  if (hasWarrant && warrantRatioOld && warrantRatioNew && !errors.warrantRatioOld && !errors.warrantRatioNew) {
    rows.push({
      label: L('Rasio Waran', 'Warrant Ratio'),
      value: `${warrantRatioOld} : ${warrantRatioNew}`,
    });
  }

  if (rows.length === 0) return null;

  return (
    <section
      aria-label={L('Ringkasan input', 'Input summary')}
      className="card-calculator border-success/30 bg-success/5 animate-fade-in"
    >
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden />
        <h3 className="text-xs font-semibold text-foreground">
          {L('Ringkasan Input', 'Input Summary')}
        </h3>
        <span className="text-[10px] text-muted-foreground">
          ({rows.length} {L('terisi', 'filled')})
        </span>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-2 text-xs">
            <dt className="text-muted-foreground truncate">{r.label}</dt>
            <dd className="font-medium text-foreground tabular-nums text-right">{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-[10px] text-muted-foreground mt-2">
        {L('Cek nilai di atas sebelum menekan "Hitung".', 'Verify the values above before pressing "Calculate".')}
      </p>
    </section>
  );
};

export default InputSummary;