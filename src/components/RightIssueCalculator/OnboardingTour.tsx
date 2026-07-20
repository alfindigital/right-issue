import React, { useEffect, useState } from 'react';
import { Joyride, STATUS, type EventData, type Step } from 'react-joyride';
import { useLanguage } from '@/contexts/LanguageContext';

const STORAGE_KEY = 'ri-onboarding-v1';

interface OnboardingTourProps {
  forceRun?: boolean;
  onFinish?: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ forceRun = false, onFinish }) => {
  const { language } = useLanguage();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (forceRun) {
      setRun(true);
      return;
    }
    // Auto-tour disabled — only runs when user explicitly replays it.
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, '1');
    }
  }, [forceRun]);

  const steps: Step[] = language === 'id' ? [
    {
      target: 'body',
      placement: 'center',
      title: 'Selamat datang!',
      content: 'Tur singkat 60 detik untuk mengenal kalkulator Right Issue ini, termasuk istilah TERP, HMETD, dan dilusi.',
      skipBeacon: true,
    },
    {
      target: '[data-tour="stock-code"]',
      title: 'Kode Saham',
      content: 'Opsional. Masukkan kode emiten (mis. ELPI) untuk memudahkan riwayat dan ekspor.',
    },
    {
      target: '[data-tour="ri-info"]',
      title: 'Rasio & Harga (HMETD)',
      content: 'HMETD adalah Hak Memesan Efek Terlebih Dahulu. Rasio menentukan berapa saham baru yang bisa Anda tebus dari saham lama. Harga pelaksanaan adalah harga tebus per lembar.',
    },
    {
      target: '[data-tour="ownership"]',
      title: 'Kepemilikan Anda',
      content: 'Isi jumlah lot dan harga rata-rata. Anda juga bisa simulasikan beli HMETD langsung dari pasar tanpa kepemilikan awal.',
    },
    {
      target: '[data-tour="terp"]',
      title: 'TERP',
      content: 'Theoretical Ex-Right Price — harga teoritis saham setelah ex-date. Bandingkan dengan harga rata-rata baru Anda untuk menilai potensi keuntungan.',
    },
    {
      target: '[data-tour="dilution"]',
      title: 'Simulasi Dilusi',
      content: 'Lihat bagaimana persentase kepemilikan Anda berubah jika ikut atau tidak ikut RI.',
    },
  ] : [
    {
      target: 'body',
      placement: 'center',
      title: 'Welcome!',
      content: 'A 60-second tour to introduce this Right Issue calculator, including TERP, HMETD, and dilution.',
      skipBeacon: true,
    },
    {
      target: '[data-tour="stock-code"]',
      title: 'Stock Code',
      content: 'Optional. Enter ticker (e.g. ELPI) to label your history and exports.',
    },
    {
      target: '[data-tour="ri-info"]',
      title: 'Ratio & Price (HMETD)',
      content: 'HMETD is the pre-emptive right. The ratio defines how many new shares you can subscribe to. Exercise price is the per-share price you pay.',
    },
    {
      target: '[data-tour="ownership"]',
      title: 'Your Holdings',
      content: 'Fill in your lot count and average price. You can also simulate buying HMETD from the market without prior holdings.',
    },
    {
      target: '[data-tour="terp"]',
      title: 'TERP',
      content: 'Theoretical Ex-Right Price — the theoretical share price after ex-date. Compare it to your new average to gauge potential upside.',
    },
    {
      target: '[data-tour="dilution"]',
      title: 'Dilution Simulator',
      content: "See how your ownership % changes if you exercise or skip the RI.",
    },
  ];

  const locale = language === 'id'
    ? { back: 'Kembali', close: 'Tutup', last: 'Selesai', next: 'Lanjut', skip: 'Lewati' }
    : { back: 'Back', close: 'Close', last: 'Done', next: 'Next', skip: 'Skip' };

  const handleEvent = (data: EventData) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem(STORAGE_KEY, '1');
      setRun(false);
      onFinish?.();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      onEvent={handleEvent}
      locale={locale}
      options={{
        showProgress: true,
        primaryColor: 'hsl(var(--primary))',
        textColor: 'hsl(var(--foreground))',
        backgroundColor: 'hsl(var(--popover))',
        arrowColor: 'hsl(var(--popover))',
        overlayColor: 'rgba(0,0,0,0.55)',
        zIndex: 10000,
        skipBeacon: true,
        buttons: ['back', 'skip', 'primary'],
      }}
      styles={{
        tooltip: { borderRadius: 16, fontSize: 13 },
        tooltipTitle: { fontSize: 15, fontWeight: 700 },
        buttonPrimary: { borderRadius: 10, padding: '8px 14px', fontWeight: 600, fontSize: 13 },
        buttonBack: { color: 'hsl(var(--muted-foreground))', fontSize: 13 },
        buttonSkip: { color: 'hsl(var(--muted-foreground))', fontSize: 13 },
      }}
    />
  );
};

export default OnboardingTour;
export { STORAGE_KEY as ONBOARDING_STORAGE_KEY };