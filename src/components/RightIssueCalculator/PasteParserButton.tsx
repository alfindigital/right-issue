import React, { useState } from 'react';
import { Clipboard, Wand2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { parseAnnouncement, ParsedAnnouncement } from '@/lib/parseAnnouncement';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';

interface Props {
  onParsed: (data: ParsedAnnouncement) => void;
}

const PasteParserButton: React.FC<Props> = ({ onParsed }) => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<ParsedAnnouncement | null>(null);

  const handleOpen = async (next: boolean) => {
    setOpen(next);
    if (next) {
      setPreview(null);
      // Try reading clipboard automatically
      try {
        const clip = await navigator.clipboard.readText();
        if (clip) {
          setText(clip);
          setPreview(parseAnnouncement(clip));
        }
      } catch { /* permission denied — user can paste manually */ }
    }
  };

  const handleParse = () => {
    const result = parseAnnouncement(text);
    setPreview(result);
    if (result.matchedFields.length === 0) {
      toast({
        title: language === 'id' ? 'Tidak ada data terdeteksi' : 'No data detected',
        description: language === 'id'
          ? 'Coba paste teks pengumuman yang lebih lengkap.'
          : 'Try pasting a more complete announcement.',
        variant: 'destructive',
      });
    }
  };

  const handleApply = () => {
    if (!preview) return;
    onParsed(preview);
    toast({
      title: language === 'id' ? 'Data diterapkan' : 'Data applied',
      description: `${preview.matchedFields.length} ${language === 'id' ? 'field terisi' : 'fields filled'}`,
    });
    setOpen(false);
    setText('');
    setPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 text-[11px] font-medium text-primary hover:bg-primary/10 px-2 py-1 rounded-lg transition-colors"
          title={language === 'id' ? 'Paste pengumuman' : 'Paste announcement'}
        >
          <Clipboard className="w-3 h-3" />
          {language === 'id' ? 'Paste' : 'Paste'}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'id' ? 'Paste Pengumuman Right Issue' : 'Paste Right Issue Announcement'}
          </DialogTitle>
          <DialogDescription>
            {language === 'id'
              ? 'Tempel teks pengumuman, app akan mendeteksi rasio, harga, dan cum-date secara otomatis.'
              : 'Paste announcement text; the app will detect ratio, price, and cum-date automatically.'}
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={language === 'id'
            ? 'Contoh: Rasio 2:1, harga pelaksanaan Rp 500 per saham, cum-date 12 Agustus 2025...'
            : 'Example: Ratio 2:1, exercise price Rp 500 per share, cum-date 12 Aug 2025...'}
          rows={6}
          className="text-xs"
        />

        {preview && preview.matchedFields.length > 0 && (
          <div className="space-y-1 text-xs bg-accent/20 p-3 rounded-lg border border-accent/30">
            <p className="font-semibold text-foreground">
              {language === 'id' ? 'Terdeteksi:' : 'Detected:'}
            </p>
            {preview.ratioOld && preview.ratioNew && (
              <p>• {language === 'id' ? 'Rasio' : 'Ratio'}: <strong>{preview.ratioOld} : {preview.ratioNew}</strong></p>
            )}
            {preview.rightPrice && (
              <p>• {language === 'id' ? 'Harga RI' : 'RI Price'}: <strong>Rp {Number(preview.rightPrice).toLocaleString('id-ID')}</strong></p>
            )}
            {preview.cumDate && (
              <p>• Cum-date: <strong>{preview.cumDate}</strong></p>
            )}
            {preview.cumPrice && (
              <p>• {language === 'id' ? 'Harga Cum-Date' : 'Cum-Date Price'}: <strong>Rp {Number(preview.cumPrice).toLocaleString('id-ID')}</strong></p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleParse} disabled={!text.trim()}>
            <Wand2 className="w-3.5 h-3.5 mr-1" />
            {language === 'id' ? 'Parse' : 'Parse'}
          </Button>
          <Button onClick={handleApply} disabled={!preview || preview.matchedFields.length === 0}>
            {language === 'id' ? 'Terapkan' : 'Apply'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PasteParserButton;