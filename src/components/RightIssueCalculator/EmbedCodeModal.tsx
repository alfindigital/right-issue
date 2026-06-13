import React, { useState, useMemo } from 'react';
import { Code, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';

type SizeOption = 'small' | 'medium' | 'large';
type ThemeOption = 'light' | 'dark' | 'auto';
type LangOption = 'id' | 'en';

const sizes: Record<SizeOption, { width: number; height: number; label: string }> = {
  small: { width: 320, height: 480, label: 'Small (320×480)' },
  medium: { width: 400, height: 540, label: 'Medium (400×540)' },
  large: { width: 500, height: 600, label: 'Large (500×600)' },
};

interface EmbedCodeModalProps {
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
}

const EmbedCodeModal: React.FC<EmbedCodeModalProps> = ({ externalOpen, onExternalOpenChange }) => {
  const { t, language } = useLanguage();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onExternalOpenChange || setInternalOpen;
  const [copied, setCopied] = useState(false);
  const [size, setSize] = useState<SizeOption>('medium');
  const [theme, setTheme] = useState<ThemeOption>('auto');
  const [embedLang, setEmbedLang] = useState<LangOption>(language as LangOption);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const embedUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (theme !== 'auto') params.set('theme', theme);
    if (embedLang) params.set('lang', embedLang);
    const queryString = params.toString();
    return `${baseUrl}/embed${queryString ? `?${queryString}` : ''}`;
  }, [baseUrl, theme, embedLang]);

  const embedCode = useMemo(() => {
    const { width, height } = sizes[size];
    return `<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
  title="Right Issue Calculator"
></iframe>`;
  }, [embedUrl, size]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast({
        title: t('embed.copied'),
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            {t('embed.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Options */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                {t('embed.size')}
              </Label>
              <Select value={size} onValueChange={(v) => setSize(v as SizeOption)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">{t('embed.small')}</SelectItem>
                  <SelectItem value="medium">{t('embed.medium')}</SelectItem>
                  <SelectItem value="large">{t('embed.large')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                {t('embed.theme')}
              </Label>
              <Select value={theme} onValueChange={(v) => setTheme(v as ThemeOption)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                {language === 'id' ? 'Bahasa' : 'Language'}
              </Label>
              <Select value={embedLang} onValueChange={(v) => setEmbedLang(v as LangOption)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Indonesia</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              {t('embed.preview')}
            </Label>
            <div 
              className="bg-muted/30 rounded-lg p-4 flex items-center justify-center overflow-hidden"
              style={{ minHeight: '300px' }}
            >
              <iframe
                src={embedUrl}
                width={Math.min(sizes[size].width, 360)}
                height={Math.min(sizes[size].height, 400)}
                frameBorder="0"
                style={{ 
                  borderRadius: '12px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transform: sizes[size].width > 360 ? `scale(${360 / sizes[size].width})` : 'none',
                  transformOrigin: 'center center',
                }}
                title="Right Issue Calculator Preview"
              />
            </div>
          </div>

          {/* Code */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              {language === 'id' ? 'Kode Embed' : 'Embed Code'}
            </Label>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto font-mono text-foreground">
                {embedCode}
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={copyCode}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    {language === 'id' ? 'Disalin!' : 'Copied!'}
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    {t('embed.copyCode')}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">
              {language === 'id' ? 'Cara menggunakan:' : 'How to use:'}
            </p>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>
                {language === 'id' 
                  ? 'Salin kode di atas' 
                  : 'Copy the code above'}
              </li>
              <li>
                {language === 'id'
                  ? 'Tempel ke HTML website Anda'
                  : 'Paste into your website HTML'}
              </li>
              <li>
                {language === 'id'
                  ? 'Sesuaikan ukuran jika diperlukan'
                  : 'Adjust size if needed'}
              </li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmbedCodeModal;
