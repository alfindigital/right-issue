import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';

interface InfoTooltipProps {
  text: string;
  title?: string;
}

const TriggerIcon = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  (props, ref) => (
    <span
      ref={ref}
      {...props}
      className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary cursor-help transition-colors ml-1"
    >
      <Info size={10} />
    </span>
  )
);
TriggerIcon.displayName = 'TriggerIcon';

const InfoTooltip = React.forwardRef<HTMLSpanElement, InfoTooltipProps>(({ text, title }, ref) => {
  const isMobile = useIsMobile();
  const { language } = useLanguage();

  if (isMobile) {
    const drawerTitle = title ?? (language === 'id' ? 'Info' : 'Information');
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <TriggerIcon ref={ref} role="button" aria-label={drawerTitle} />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-base">{drawerTitle}</DrawerTitle>
            <DrawerDescription className="text-sm leading-relaxed text-foreground pt-2">
              {text}
            </DrawerDescription>
          </DrawerHeader>
          <div className="h-6" />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <TriggerIcon ref={ref} />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[220px] text-xs font-normal normal-case">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

InfoTooltip.displayName = 'InfoTooltip';

export default InfoTooltip;
