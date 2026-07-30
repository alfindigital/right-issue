import { Helmet } from 'react-helmet-async';
import RightIssueCalculator from '@/components/RightIssueCalculator';

const webAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Kalkulator Right Issue IDX',
  url: 'https://rightissue.lovable.app/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any',
  inLanguage: ['id', 'en'],
  description:
    'Kalkulator Right Issue (HMETD) saham IDX: hitung jatah lot, biaya tebus, TERP, dilusi, warrant, dan rekomendasi tebus.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
  publisher: { '@type': 'Organization', name: 'lotmetrik' },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Apa itu Right Issue (HMETD)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Right Issue atau HMETD (Hak Memesan Efek Terlebih Dahulu) adalah hak yang diberikan emiten kepada pemegang saham lama untuk membeli saham baru pada harga tertentu sesuai rasio yang ditetapkan.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bagaimana cara menghitung TERP?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TERP (Theoretical Ex-Rights Price) dihitung dengan rumus: ((harga cum-rights × jumlah saham lama) + (harga tebus × jumlah saham baru)) ÷ (jumlah saham lama + jumlah saham baru).',
      },
    },
    {
      '@type': 'Question',
      name: 'Apa dampak dilusi jika tidak menebus Right Issue?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Jika tidak menebus, persentase kepemilikan akan berkurang (terdilusi) karena jumlah saham beredar bertambah, sementara jumlah saham yang dimiliki tetap.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah wajib menebus Right Issue?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tidak wajib. Pemegang saham bisa menebus seluruh, sebagian, atau menjual hak HMETD-nya di pasar selama periode perdagangan rights. Keputusan sebaiknya berdasarkan analisis TERP dan prospek emiten.',
      },
    },
  ],
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Beranda',
      item: 'https://rightissue.lovable.app/',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Kalkulator Right Issue',
      item: 'https://rightissue.lovable.app/',
    },
  ],
};

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Rumus Right Issue & Kalkulator TERP Saham IDX | alfin</title>
        <meta
          name="description"
          content="Hitung rumus right issue otomatis: jatah HMETD, TERP, dilusi & warrant saham IDX. Kalkulator gratis berbahasa Indonesia untuk investor pasar modal."
        />
        <link rel="canonical" href="https://rightissue.lovable.app/" />
        <link rel="alternate" hrefLang="id" href="https://rightissue.lovable.app/" />
        <link rel="alternate" hrefLang="en" href="https://rightissue.lovable.app/" />
        <link rel="alternate" hrefLang="x-default" href="https://rightissue.lovable.app/" />
        <meta property="og:title" content="Rumus Right Issue & Kalkulator TERP Saham IDX" />
        <meta
          property="og:description"
          content="Hitung rumus right issue otomatis: jatah HMETD, TERP, dilusi & warrant. Gratis, berbahasa Indonesia."
        />
        <meta property="og:url" content="https://rightissue.lovable.app/" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta property="og:image" content="https://rightissue.lovable.app/og-home.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Kalkulator Right Issue Saham IDX" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Rumus Right Issue & Kalkulator TERP Saham IDX" />
        <meta
          name="twitter:description"
          content="Hitung rumus right issue otomatis: jatah HMETD, TERP, dilusi & warrant. Gratis."
        />
        <meta name="twitter:image" content="https://rightissue.lovable.app/og-home.png" />
        <script type="application/ld+json">{JSON.stringify(webAppJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>
      <RightIssueCalculator />
    </>
  );
};

export default Index;
