import React, { useRef } from 'react';
import { Download, Link2, Share2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ExportTemplate from './ExportTemplate';
import { createRoot } from 'react-dom/client';

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
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ isCalculated, shareData, exportData }) => {
  const exportContainerRef = useRef<HTMLDivElement>(null);

  if (!isCalculated) return null;

  const saveAsImage = async () => {
    try {
      // Create a temporary container
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      // Create root and render the export template
      const root = createRoot(container);
      root.render(
        <ExportTemplate 
          data={{
            ...shareData,
            ...exportData
          }} 
        />
      );

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 100));

      const exportElement = container.querySelector('#export-template') as HTMLElement;
      
      if (!exportElement) {
        throw new Error('Export template not found');
      }

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
      
      // Cleanup
      root.unmount();
      document.body.removeChild(container);
      
      toast.success('Hasil berhasil disimpan sebagai gambar!');
    } catch (error) {
      toast.error('Gagal menyimpan gambar');
      console.error(error);
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
      toast.success('Link berhasil disalin!');
    }).catch(() => {
      toast.error('Gagal menyalin link');
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
          title: 'Kalkulator Right Issue',
          text: 'Lihat hasil kalkulasi Right Issue saya!',
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors text-xs font-medium"
          aria-label="Share"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={saveAsImage} className="cursor-pointer">
          <Download className="w-4 h-4 mr-2" />
          Download Gambar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareNative} className="cursor-pointer">
          <Link2 className="w-4 h-4 mr-2" />
          Bagikan Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButtons;
