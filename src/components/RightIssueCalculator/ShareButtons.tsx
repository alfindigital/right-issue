import React, { useState } from 'react';
import { Download, Link2, Share2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
      
      toast.success('Hasil berhasil disimpan sebagai gambar!');
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
      toast.success('Link berhasil disalin!');
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
