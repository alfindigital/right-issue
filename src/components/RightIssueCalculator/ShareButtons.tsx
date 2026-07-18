import React, { useRef, useState } from 'react';
import { Download, Link2, Share2, ChevronDown, MessageCircle, Clipboard, FileText, FileBarChart2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ExportTemplate from './ExportTemplate';
import { createRoot } from 'react-dom/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateRightIssuePDF, type ExportPDFData } from '@/lib/exportPdf';

interface ShareButtonsProps {
  resultRef: React.RefObject<HTMLDivElement>;
  isCalculated: boolean;
  shareData: {
    stockCode?: string;
    ratioOld: string;
    ratioNew: string;
    rightPrice: string;
    cumDatePrice: string;
    currentLots: string;
    currentAvgPrice: string;
  };
  exportData: {
    currentTotalValue: string;
    newSharesCount: string;
    newTotalValue: string;
    finalShares: string;
    finalAvgPrice: string;
    finalTotalValue: string;
    theoreticalPrice: string;
    recommendation: 'positive' | 'negative' | null;
    recommendationText: string;
    hasWarrant: boolean;
    warrantCount: string;
  };
  pdfData?: ExportPDFData;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ isCalculated, shareData, exportData, pdfData }) => {
  const exportContainerRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!isCalculated) return null;

  const exportPdf = async (variant: 'full' | 'compact') => {
    if (!pdfData) return;
    setIsExportingPdf(true);
    try {
      const filename = await generateRightIssuePDF(pdfData, variant, language);
      toast.success(
        (language === 'id' ? 'PDF berhasil diunduh: ' : 'PDF downloaded: ') + filename,
      );
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      toast.error(language === 'id' ? 'Gagal export PDF' : 'Failed to export PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const saveAsImage = async () => {
    try {
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      const root = createRoot(container);
      root.render(
        <ExportTemplate 
          data={{
            ...shareData,
            ...exportData
          }} 
        />
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      const exportElement = container.querySelector('#export-template') as HTMLElement;
      
      if (!exportElement) {
        throw new Error('Export template not found');
      }

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(exportElement, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `right-issue-calculator-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      root.unmount();
      document.body.removeChild(container);
      
      toast.success(language === 'id' ? '✅ Gambar berhasil disimpan!' : '✅ Image saved successfully!');
    } catch (error) {
      toast.error(language === 'id' ? 'Gagal menyimpan gambar' : 'Failed to save image');
      if (import.meta.env.DEV) console.error(error);
    }
  };

  const copyImageToClipboard = async () => {
    try {
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      const root = createRoot(container);
      root.render(
        <ExportTemplate data={{ ...shareData, ...exportData }} />
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      const exportElement = container.querySelector('#export-template') as HTMLElement;
      if (!exportElement) throw new Error('Export template not found');

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(exportElement, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            toast.success(language === 'id' ? '📋 Gambar disalin ke clipboard!' : '📋 Image copied to clipboard!');
          } catch {
            toast.error(language === 'id' ? 'Browser tidak mendukung copy gambar' : 'Browser does not support image copy');
          }
        }
      }, 'image/png');

      root.unmount();
      document.body.removeChild(container);
    } catch (error) {
      toast.error(language === 'id' ? 'Gagal menyalin gambar' : 'Failed to copy image');
      if (import.meta.env.DEV) console.error(error);
    }
  };

  const copyLink = () => {
    const params = new URLSearchParams({
      ...(shareData.stockCode && { sc: shareData.stockCode }),
      ro: shareData.ratioOld,
      rn: shareData.ratioNew,
      rp: shareData.rightPrice,
      cp: shareData.cumDatePrice,
      cs: shareData.currentLots,
      ca: shareData.currentAvgPrice,
    });
    
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    navigator.clipboard.writeText(url).then(() => {
      toast.success(t('toast.copied'));
    }).catch(() => {
      toast.error(language === 'id' ? 'Gagal menyalin link' : 'Failed to copy link');
    });
  };

  const shareNative = async () => {
    const params = new URLSearchParams({
      ...(shareData.stockCode && { sc: shareData.stockCode }),
      ro: shareData.ratioOld,
      rn: shareData.ratioNew,
      rp: shareData.rightPrice,
      cp: shareData.cumDatePrice,
      cs: shareData.currentLots,
      ca: shareData.currentAvgPrice,
    });
    
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: language === 'id' ? 'Kalkulator Right Issue' : 'Right Issue Calculator',
          text: language === 'id' ? 'Lihat hasil kalkulasi Right Issue saya!' : 'Check out my Right Issue calculation!',
          url: url,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          copyLink();
        }
      }
    } else {
      copyLink();
    }
  };

  const shareToWhatsApp = () => {
    const params = new URLSearchParams({
      ...(shareData.stockCode && { sc: shareData.stockCode }),
      ro: shareData.ratioOld,
      rn: shareData.ratioNew,
      rp: shareData.rightPrice,
      cp: shareData.cumDatePrice,
      cs: shareData.currentLots,
      ca: shareData.currentAvgPrice,
    });
    const calculatorUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    const avgBaru = parseInt(exportData.finalAvgPrice.replace(/[^\d]/g, '')) || 0;
    const terp = parseInt(exportData.theoreticalPrice.replace(/[^\d]/g, '')) || 0;
    const diffPercent = avgBaru > 0 
      ? (((terp - avgBaru) / avgBaru) * 100).toFixed(1) 
      : '0';
    const isPositive = terp > avgBaru;
    
    const stockLabel = shareData.stockCode 
      ? `RI ${shareData.stockCode}` 
      : 'Right Issue';
    
    let message = language === 'id' 
      ? `📊 *Hasil Kalkulasi ${stockLabel}*

📌 *Info RI:*
• Rasio: ${shareData.ratioOld} : ${shareData.ratioNew}
• Harga RI: Rp ${parseInt(shareData.rightPrice).toLocaleString('id-ID')}
• Harga Cum: Rp ${parseInt(shareData.cumDatePrice).toLocaleString('id-ID')}

📈 *Hasil:*
• Lot saat ini: ${parseInt(shareData.currentLots).toLocaleString('id-ID')} lot
• Jatah RI: ${exportData.newSharesCount} lot
• Biaya tebus: ${exportData.newTotalValue}
• Avg baru: ${exportData.finalAvgPrice}

${isPositive ? '✅' : '⚠️'} TERP ${exportData.theoreticalPrice} (${isPositive ? '+' : ''}${diffPercent}%)`
      : `📊 *${stockLabel} Calculation Result*

📌 *RI Info:*
• Ratio: ${shareData.ratioOld} : ${shareData.ratioNew}
• RI Price: Rp ${parseInt(shareData.rightPrice).toLocaleString('id-ID')}
• Cum Price: Rp ${parseInt(shareData.cumDatePrice).toLocaleString('id-ID')}

📈 *Result:*
• Current lots: ${parseInt(shareData.currentLots).toLocaleString('id-ID')} lots
• RI allocation: ${exportData.newSharesCount} lots
• Exercise cost: ${exportData.newTotalValue}
• New avg: ${exportData.finalAvgPrice}

${isPositive ? '✅' : '⚠️'} TERP ${exportData.theoreticalPrice} (${isPositive ? '+' : ''}${diffPercent}%)`;

    if (exportData.hasWarrant && exportData.warrantCount !== '0') {
      message += language === 'id'
        ? `\n\n🎁 Bonus Waran: ${exportData.warrantCount} lembar`
        : `\n\n🎁 Bonus Warrants: ${exportData.warrantCount} units`;
    }
    
    message += language === 'id'
      ? `\n\n🔗 Hitung sendiri: ${calculatorUrl}`
      : `\n\n🔗 Calculate yourself: ${calculatorUrl}`;
    
    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    
    toast.success(language === 'id' ? 'Membuka WhatsApp...' : 'Opening WhatsApp...');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors text-xs font-medium"
          aria-label="Share"
        >
          {isExportingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
          <ChevronDown className="w-3 h-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs">
          {language === 'id' ? 'Bagikan / Salin' : 'Share / Copy'}
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={saveAsImage}
          className="gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 text-primary" />
          <span className="text-sm">{language === 'id' ? 'Download Gambar' : 'Download Image'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={copyImageToClipboard}
          className="gap-2 cursor-pointer"
        >
          <Clipboard className="w-4 h-4 text-primary" />
          <span className="text-sm">{language === 'id' ? 'Salin Gambar' : 'Copy Image'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={shareNative}
          className="gap-2 cursor-pointer"
        >
          <Link2 className="w-4 h-4 text-primary" />
          <span className="text-sm">{language === 'id' ? 'Bagikan Link' : 'Share Link'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={shareToWhatsApp}
          className="gap-2 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="text-sm">{language === 'id' ? 'Share ke WhatsApp' : 'Share to WhatsApp'}</span>
        </DropdownMenuItem>
        {pdfData && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs">
              {language === 'id' ? 'Export PDF' : 'Export PDF'}
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => exportPdf('compact')}
              disabled={isExportingPdf}
              className="gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {language === 'id' ? 'PDF Ringkas (1 hal)' : 'PDF Compact (1 page)'}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {language === 'id' ? 'Input utama + rekomendasi' : 'Main inputs + recommendation'}
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => exportPdf('full')}
              disabled={isExportingPdf}
              className="gap-2 cursor-pointer"
            >
              <FileBarChart2 className="w-4 h-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {language === 'id' ? 'PDF Lengkap' : 'PDF Full Report'}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {language === 'id' ? 'Semua metrik & dilusi' : 'All metrics & dilution'}
                </span>
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButtons;
