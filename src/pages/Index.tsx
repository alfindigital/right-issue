import { Helmet } from 'react-helmet-async';
import RightIssueCalculator from '@/components/RightIssueCalculator';

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
      </Helmet>
      <RightIssueCalculator />
    </>
  );
};

export default Index;
