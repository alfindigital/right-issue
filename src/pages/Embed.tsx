import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MiniCalculator from '@/components/EmbedCalculator/MiniCalculator';
import { useLanguage } from '@/contexts/LanguageContext';

const Embed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { setLanguage } = useLanguage();

  // Apply theme from query params
  useEffect(() => {
    const theme = searchParams.get('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    }
    // 'auto' or no param = use system preference (already handled by next-themes)
  }, [searchParams]);

  // Apply language from query params
  useEffect(() => {
    const lang = searchParams.get('lang');
    if (lang === 'en' || lang === 'id') {
      setLanguage(lang);
    }
  }, [searchParams, setLanguage]);

  // Listen for config messages from parent
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'RI_CONFIG') {
        const { theme, lang } = event.data;
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
          document.documentElement.classList.remove('dark');
        }
        if (lang === 'en' || lang === 'id') {
          setLanguage(lang);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setLanguage]);

  // Transparent background for embedding
  useEffect(() => {
    document.body.style.background = 'transparent';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-2">
      <MiniCalculator />
    </div>
  );
};

export default Embed;
