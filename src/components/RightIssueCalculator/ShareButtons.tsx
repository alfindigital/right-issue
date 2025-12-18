import React, { useRef } from 'react';
import { Download, Link2, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface ShareButtonsProps {
  resultRef: React.RefObject<HTMLDivElement>;
  isCalculated: boolean;
  shareData: {
    ratioOld: string;
    ratioNew: string;
    rightPrice: string;
    cumDatePrice: string;
    currentShares: string;
    currentAvgPrice: string;
  };
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ resultRef, isCalculated, shareData }) => {
  if (!isCalculated) return null;

  const saveAsImage = async () => {
    if (!resultRef.current) return;
    
    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `right-issue-calculator-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Hasil kalkulasi berhasil disimpan sebagai gambar!');
    } catch (error) {
      toast.error('Gagal menyimpan gambar');
      console.error(error);
    }
  };

  const copyLink = () => {
    const params = new URLSearchParams({
      ro: shareData.ratioOld,
      rn: shareData.ratioNew,
      rp: shareData.rightPrice,
      cp: shareData.cumDatePrice,
      cs: shareData.currentShares,
      ca: shareData.currentAvgPrice,
    });
    
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link berhasil disalin ke clipboard!');
    }).catch(() => {
      toast.error('Gagal menyalin link');
    });
  };

  const shareNative = async () => {
    const params = new URLSearchParams({
      ro: shareData.ratioOld,
      rn: shareData.ratioNew,
      rp: shareData.rightPrice,
      cp: shareData.cumDatePrice,
      cs: shareData.currentShares,
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
    <div className="flex items-center gap-1.5 animate-fade-in">
      <button
        onClick={saveAsImage}
        className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-all duration-300 hover:scale-105"
        aria-label="Simpan sebagai gambar"
        title="Simpan gambar"
      >
        <Download className="w-4 h-4" />
      </button>
      <button
        onClick={copyLink}
        className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-all duration-300 hover:scale-105"
        aria-label="Salin link"
        title="Salin link"
      >
        <Link2 className="w-4 h-4" />
      </button>
      <button
        onClick={shareNative}
        className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-all duration-300 hover:scale-105"
        aria-label="Bagikan"
        title="Bagikan"
      >
        <Share2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ShareButtons;
