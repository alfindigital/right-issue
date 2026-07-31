import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calculator } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { SITE_URL, absUrl, OG_IMAGE } from '@/lib/siteUrl';

const EducationSection = lazy(() => import('@/components/RightIssueCalculator/EducationSection'));

const CANONICAL = absUrl('/edukasi');

const TITLE = 'Edukasi Right Issue & HMETD Saham IDX — Panduan Lengkap';
const DESCRIPTION =
  'Panduan lengkap right issue (HMETD) saham IDX: mekanisme, jadwal cum/ex-date, rumus TERP, dilusi, warrant, dan glosarium istilah pasar modal.';

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Apa itu HMETD dalam right issue?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'HMETD (Hak Memesan Efek Terlebih Dahulu) adalah hak yang diberikan emiten kepada pemegang saham lama untuk membeli saham baru pada harga pelaksanaan sesuai rasio yang ditetapkan. HMETD dapat ditebus atau dijual di pasar selama periode perdagangan rights.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apa beda cum-date dan ex-date pada right issue?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cum-date adalah hari terakhir pembelian saham masih mendapat hak HMETD. Mulai ex-date, pembeli saham tidak lagi memperoleh hak tersebut dan harga saham biasanya menyesuaikan ke arah TERP.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bagaimana rumus menghitung TERP?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TERP = ((harga cum-date × rasio lama) + (harga pelaksanaan × rasio baru)) ÷ (rasio lama + rasio baru).',
      },
    },
    {
      '@type': 'Question',
      name: 'Bagaimana menghitung dilusi jika HMETD tidak ditebus?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dilusi terjadi karena jumlah saham beredar bertambah sementara jumlah saham yang dimiliki tetap. Persentase kepemilikan baru = saham dimiliki ÷ (saham beredar lama + saham baru hasil right issue).',
      },
    },
  ],
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Edukasi Right Issue', item: CANONICAL },
  ],
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: TITLE,
  description: DESCRIPTION,
  inLanguage: 'id',
  mainEntityOfPage: CANONICAL,
  author: { '@type': 'Organization', name: 'lotmetrik' },
  publisher: { '@type': 'Organization', name: 'lotmetrik' },
};

const EducationSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-24 w-full rounded-2xl" />
    <Skeleton className="h-40 w-full rounded-2xl" />
    <Skeleton className="h-40 w-full rounded-2xl" />
  </div>
);

const Education: React.FC = () => {
  const { language } = useLanguage();
  const id = language === 'id';

  return (
    <>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={CANONICAL} />
        <link rel="alternate" hrefLang="id" href={CANONICAL} />
        <link rel="alternate" hrefLang="x-default" href={CANONICAL} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Edukasi Right Issue & HMETD Saham IDX" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <div className="min-h-dvh bg-background">
        <div className="max-w-2xl mx-auto w-full px-3 py-4 md:px-4">
          <nav aria-label="Breadcrumb" className="mb-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {id ? 'Kembali ke kalkulator' : 'Back to calculator'}
            </Link>
          </nav>

          <header className="mb-4">
            <h1 className="text-lg md:text-xl font-bold text-foreground">
              {id ? 'Edukasi Right Issue & HMETD Saham IDX' : 'Right Issue & HMETD Guide (IDX)'}
            </h1>
            <p className="mt-1 text-xs md:text-sm text-muted-foreground leading-relaxed">
              {id
                ? 'Pahami mekanisme right issue di Bursa Efek Indonesia: jadwal cum/ex-date, rumus TERP, efek dilusi, warrant, sampai glosarium istilahnya.'
                : 'Understand right issues on the Indonesia Stock Exchange: cum/ex-date timeline, the TERP formula, dilution effects, warrants, and a glossary.'}
            </p>
          </header>

          <Suspense fallback={<EducationSkeleton />}>
            <EducationSection />
          </Suspense>

          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Calculator className="w-4 h-4" />
              {id ? 'Coba kalkulator right issue' : 'Try the right issue calculator'}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Education;
