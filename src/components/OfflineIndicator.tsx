import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-warning text-warning-foreground px-4 py-2 flex items-center justify-center gap-2 animate-slide-up">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">
        Anda sedang offline. Semua data tersimpan lokal.
      </span>
    </div>
  );
};
