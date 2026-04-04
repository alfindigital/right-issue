import React, { useCallback, useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';

interface ExportPDFData {
  stockCode: string;
  ratioOld: string;
  ratioNew: string;
  rightPrice: string;
  cumDatePrice: string;
  currentLots: string;
  currentAvgPrice: string;
  hasWarrant: boolean;
  warrantRatioOld: string;
  warrantRatioNew: string;
  // Results
  newLotsCount: string;
  finalLots: string;
  finalAvgPrice: string;
  finalTotalValue: string;
  theoreticalPrice: string;
  recommendation: 'positive' | 'negative' | null;
  recommendationText: string;
  warrantCount: string;
  currentTotalValue: string;
  newTotalValue: string;
}

interface ExportPDFButtonProps {
  isCalculated: boolean;
  data: ExportPDFData;
}

const formatCurrency = (value: string | number): string => {
  const num = typeof value === 'string' ? parseInt(value) || 0 : value;
  return `Rp ${new Intl.NumberFormat('id-ID').format(num)}`;
};

const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({ isCalculated, data }) => {
  const { language } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);

  const generatePDF = useCallback(async () => {
    if (!isCalculated) return;
    setIsExporting(true);

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const colors = {
        primary: [37, 99, 235] as [number, number, number],    // blue-600
        success: [5, 150, 105] as [number, number, number],     // emerald-600
        danger: [220, 38, 38] as [number, number, number],      // red-600
        dark: [30, 30, 30] as [number, number, number],
        muted: [120, 120, 120] as [number, number, number],
        light: [245, 245, 245] as [number, number, number],
        white: [255, 255, 255] as [number, number, number],
        border: [220, 220, 220] as [number, number, number],
      };

      // --- Header ---
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, pageWidth, 32, 'F');
      doc.setTextColor(...colors.white);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Right Issue Calculator', margin, 14);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(language === 'id' ? 'Laporan Hasil Kalkulasi' : 'Calculation Report', margin, 21);

      // Stock code & timestamp
      const now = new Date();
      const timestamp = now.toLocaleString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
      doc.setFontSize(8);
      if (data.stockCode) {
        doc.text(`${data.stockCode}  •  ${timestamp}`, margin, 28);
      } else {
        doc.text(timestamp, margin, 28);
      }

      y = 40;

      // --- Helper functions ---
      const drawSectionTitle = (title: string) => {
        doc.setFillColor(...colors.primary);
        doc.rect(margin, y, 3, 6, 'F');
        doc.setTextColor(...colors.dark);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin + 6, y + 5);
        y += 10;
      };

      const drawRow = (label: string, value: string, highlight = false) => {
        if (highlight) {
          doc.setFillColor(...colors.light);
          doc.rect(margin, y - 3, contentWidth, 7, 'F');
        }
        doc.setTextColor(...colors.muted);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(label, margin + 2, y + 1);
        doc.setTextColor(...colors.dark);
        doc.setFont('helvetica', 'bold');
        doc.text(value, pageWidth - margin - 2, y + 1, { align: 'right' });
        y += 7;
      };

      const drawDivider = () => {
        doc.setDrawColor(...colors.border);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageWidth - margin, y);
        y += 4;
      };

      const checkPageBreak = (needed: number) => {
        if (y + needed > 280) {
          doc.addPage();
          y = margin;
        }
      };

      // --- Section 1: Input Data ---
      drawSectionTitle(language === 'id' ? 'Data Input' : 'Input Data');
      drawRow(language === 'id' ? 'Rasio RI' : 'RI Ratio', `${data.ratioOld} : ${data.ratioNew}`);
      drawRow(language === 'id' ? 'Harga Pelaksanaan' : 'Exercise Price', formatCurrency(data.rightPrice));
      drawRow(language === 'id' ? 'Harga Cum Date' : 'Cum Date Price', formatCurrency(data.cumDatePrice));
      drawRow(language === 'id' ? 'Jumlah Lot' : 'Current Lots', `${new Intl.NumberFormat('id-ID').format(parseInt(data.currentLots) || 0)} lot`);
      drawRow(language === 'id' ? 'Harga Rata-rata' : 'Avg Price', formatCurrency(data.currentAvgPrice));
      drawRow(language === 'id' ? 'Total Nilai Saat Ini' : 'Current Total Value', data.currentTotalValue, true);
      
      if (data.hasWarrant) {
        drawRow(language === 'id' ? 'Rasio Waran' : 'Warrant Ratio', `${data.warrantRatioOld} : ${data.warrantRatioNew}`);
      }

      y += 3;
      drawDivider();

      // --- Section 2: Calculation Results ---
      checkPageBreak(60);
      drawSectionTitle(language === 'id' ? 'Hasil Kalkulasi' : 'Calculation Results');
      drawRow('TERP', data.theoreticalPrice, true);
      drawRow(language === 'id' ? 'Hak Lot Baru' : 'New Lots', `${data.newLotsCount} lot`);
      drawRow(language === 'id' ? 'Dana Dibutuhkan' : 'Funds Required', data.newTotalValue);
      drawRow(language === 'id' ? 'Total Lot Akhir' : 'Final Lots', `${data.finalLots} lot`);
      drawRow(language === 'id' ? 'Avg Harga Baru' : 'New Avg Price', data.finalAvgPrice, true);
      drawRow(language === 'id' ? 'Total Nilai Akhir' : 'Final Total Value', data.finalTotalValue, true);

      if (data.hasWarrant && data.warrantCount !== '0') {
        drawRow(language === 'id' ? 'Jumlah Waran' : 'Warrants', data.warrantCount);
      }

      y += 3;
      drawDivider();

      // --- Section 3: Recommendation ---
      checkPageBreak(35);
      drawSectionTitle(language === 'id' ? 'Rekomendasi' : 'Recommendation');

      if (data.recommendation) {
        const isPositive = data.recommendation === 'positive';
        const badgeColor = isPositive ? colors.success : colors.danger;
        const badgeText = isPositive
          ? (language === 'id' ? 'POTENSI POSITIF' : 'POSITIVE POTENTIAL')
          : (language === 'id' ? 'PERTIMBANGKAN ALTERNATIF' : 'CONSIDER ALTERNATIVES');

        // Badge
        doc.setFillColor(...badgeColor);
        doc.roundedRect(margin, y - 1, doc.getTextWidth(badgeText) + 8, 6, 1.5, 1.5, 'F');
        doc.setTextColor(...colors.white);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(badgeText, margin + 4, y + 3);
        y += 10;

        // Recommendation text
        doc.setTextColor(...colors.dark);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(data.recommendationText, contentWidth - 4);
        doc.text(lines, margin + 2, y);
        y += lines.length * 4.5 + 4;
      }

      y += 3;
      drawDivider();

      // --- Section 4: Key Metrics Summary ---
      checkPageBreak(40);
      drawSectionTitle(language === 'id' ? 'Ringkasan Metrik' : 'Key Metrics');

      const cumPrice = parseInt(data.cumDatePrice) || 0;
      const riPrice = parseInt(data.rightPrice) || 0;
      const discount = cumPrice > 0 ? (((cumPrice - riPrice) / cumPrice) * 100).toFixed(1) : '0';
      const currentShares = (parseInt(data.currentLots) || 0) * 100;
      const newLots = parseFloat(data.newLotsCount.replace(/\./g, '').replace(',', '.')) || 0;
      const newShares = newLots * 100;
      const dilution = currentShares > 0
        ? (((currentShares / (currentShares + newShares)) - 1) * -100).toFixed(2)
        : '0';

      drawRow(language === 'id' ? 'Diskon RI vs Cum Price' : 'RI Discount vs Cum Price', `${discount}%`);
      drawRow(language === 'id' ? 'Potensi Dilusi (jika skip)' : 'Potential Dilution (if skip)', `${dilution}%`);
      drawRow(language === 'id' ? 'Total Saham Baru' : 'New Shares', new Intl.NumberFormat('id-ID').format(newShares));
      drawRow(language === 'id' ? 'Total Saham Akhir' : 'Final Shares', new Intl.NumberFormat('id-ID').format(currentShares + newShares), true);

      y += 5;

      // --- Disclaimer ---
      checkPageBreak(30);
      doc.setFillColor(255, 250, 240);
      doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');
      doc.setDrawColor(230, 200, 150);
      doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'S');
      
      doc.setTextColor(180, 130, 50);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('⚠ DISCLAIMER', margin + 4, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      const disclaimerText = language === 'id'
        ? 'Hasil kalkulasi ini hanya bersifat estimasi dan tidak menjadi rekomendasi investasi. Keputusan investasi sepenuhnya merupakan tanggung jawab investor. Selalu lakukan riset mandiri (DYOR) dan konsultasikan dengan penasihat keuangan profesional sebelum mengambil keputusan.'
        : 'This calculation is for estimation purposes only and does not constitute investment advice. Investment decisions are entirely the responsibility of the investor. Always do your own research (DYOR) and consult a professional financial advisor before making decisions.';
      const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - 8);
      doc.text(disclaimerLines, margin + 4, y + 10);

      y += 28;

      // --- Footer ---
      doc.setTextColor(...colors.muted);
      doc.setFontSize(7);
      doc.text(`Generated by Right Issue Calculator • alfindigital.com • ${timestamp}`, pageWidth / 2, 290, { align: 'center' });

      // Save
      const filename = data.stockCode
        ? `RI_${data.stockCode}_${now.toISOString().slice(0, 10)}.pdf`
        : `RI_Report_${now.toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);

      toast({
        title: language === 'id' ? 'PDF berhasil diunduh' : 'PDF downloaded',
        description: filename,
        duration: 3000,
      });
    } catch (err) {
      console.error('PDF export error:', err);
      toast({
        title: language === 'id' ? 'Gagal export PDF' : 'PDF export failed',
        description: String(err),
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsExporting(false);
    }
  }, [isCalculated, data, language]);

  if (!isCalculated) return null;

  return (
    <button
      onClick={generatePDF}
      disabled={isExporting}
      className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
      aria-label={language === 'id' ? 'Export PDF' : 'Export PDF'}
      title={language === 'id' ? 'Export ke PDF' : 'Export to PDF'}
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
    </button>
  );
};

export default ExportPDFButton;
