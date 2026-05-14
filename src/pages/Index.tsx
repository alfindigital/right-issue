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
  publisher: { '@type': 'Organization', name: 'alfindigital' },
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

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Kalkulator Right Issue IDX - Hitung Jatah RI & TERP Saham</title>
        <meta
          name="description"
          content="Hitung jatah Right Issue (HMETD) saham IDX: jumlah lot, biaya tebus, harga teoritis TERP, dilusi, dan rekomendasi tebus. Mendukung warrant & budget planner."
        />
        <link rel="canonical" href="https://rightissue.lovable.app/" />
        <meta property="og:title" content="Kalkulator Right Issue IDX - Hitung Jatah RI & TERP Saham" />
        <meta
          property="og:description"
          content="Kalkulator HMETD saham Indonesia: jatah lot, biaya tebus, TERP, dilusi, dan rekomendasi tebus."
        />
        <meta property="og:url" content="https://rightissue.lovable.app/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Kalkulator Right Issue IDX - Hitung Jatah RI & TERP Saham" />
        <meta
          name="twitter:description"
          content="Kalkulator HMETD saham Indonesia: jatah lot, biaya tebus, TERP, dilusi, dan rekomendasi tebus."
        />
        <script type="application/ld+json">{JSON.stringify(webAppJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      <RightIssueCalculator />
    </>
  );
};

export default Index;
