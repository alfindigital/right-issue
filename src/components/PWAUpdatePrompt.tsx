import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export const PWAUpdatePrompt = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const initSW = async () => {
      try {
        const { registerSW } = await import('virtual:pwa-register');
        const update = registerSW({
          onNeedRefresh() {
            setNeedRefresh(true);
          },
          onOfflineReady() {
            if (import.meta.env.DEV) console.log('App ready for offline use');
          },
        });
        setUpdateSW(() => update);
      } catch (error) {
        // PWA not available in development
        if (import.meta.env.DEV) console.log('PWA registration not available');
      }
    };

    initSW();
  }, []);

  const handleUpdate = async () => {
    if (updateSW) {
      await updateSW();
      window.location.reload();
    }
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-card border border-border rounded-lg shadow-lg p-4 animate-slide-up">
      <div className="flex items-start gap-3">
        <RefreshCw className="h-5 w-5 text-primary mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {t('pwa.updateAvailable')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('pwa.updateDesc')}
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setNeedRefresh(false)}
        >
          {t('pwa.later')}
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={handleUpdate}
        >
          {t('pwa.update')}
        </Button>
      </div>
    </div>
  );
};
