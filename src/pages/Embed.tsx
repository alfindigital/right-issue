import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
    <>
      <Helmet>
        <title>Embed Widget Kalkulator Right Issue IDX</title>
        <meta
          name="description"
          content="Widget mini kalkulator Right Issue saham IDX yang bisa di-embed di blog atau situs lain via iframe. Mendukung tema light/dark dan bahasa ID/EN."
        />
        <link rel="canonical" href="https://rightissue.lovable.app/embed" />
        <meta name="robots" content="noindex,follow" />
        <meta property="og:title" content="Embed Widget Kalkulator Right Issue IDX" />
        <meta
          property="og:description"
          content="Widget mini kalkulator Right Issue saham IDX yang bisa di-embed via iframe."
        />
        <meta property="og:url" content="https://rightissue.lovable.app/embed" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://rightissue.lovable.app/og-embed.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Embed Widget Kalkulator Right Issue IDX" />
        <meta
          name="twitter:description"
          content="Widget mini kalkulator Right Issue saham IDX yang bisa di-embed via iframe."
        />
        <meta name="twitter:image" content="https://rightissue.lovable.app/og-embed.png" />
      </Helmet>
      <main className="min-h-screen flex items-center justify-center p-2">
        <MiniCalculator />
      </main>
    </>
  );
};

export default Embed;
