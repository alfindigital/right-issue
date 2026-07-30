import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calculator, TrendingUp, Info, Clock, Database } from 'lucide-react';
import { useActiveRights, type ActiveRight } from '@/hooks/useActiveRights';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

const BASE_URL = 'https://lotmetrik.my.id';

const formatCurrency = (n: number) => `Rp ${new Intl.NumberFormat('id-ID').format(n)}`;

const RiTicker: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { items, loading } = useActiveRights();
  const [notFoundConfirmed, setNotFoundConfirmed] = useState(false);

  const code = (ticker ?? '').toUpperCase();
  const ri: ActiveRight | undefined = items.find((r) => r.code.toUpperCase() === code);
  const updatedAt = new Date();
  const updatedLabel = new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric', month: 'short', year: 'numeric'
  }).format(updatedAt);

  // Compute per-ticker facts for FAQ + JSON-LD
  const terp = ri
    ? Math.round(((ri.cumDatePrice ?? ri.rightPrice) * Number(ri.ratioOld) + ri.rightPrice * Number(ri.ratioNew)) / (Number(ri.ratioOld) + Number(ri.ratioNew)))
    : null;
  const faqItems = ri
    ? (language === 'id' ? [
        { q: `Berapa TERP saham ${ri.code} setelah right issue?`, a: `Perkiraan TERP ${ri.code} adalah ${formatCurrency(terp!)} berdasarkan rasio ${ri.ratioOld}:${ri.ratioNew} dan harga tebus ${formatCurrency(ri.rightPrice)}.` },
        { q: `Berapa rasio right issue ${ri.code}?`, a: `Rasio HMETD ${ri.code} adalah ${ri.ratioOld}:${ri.ratioNew}, artinya setiap ${ri.ratioOld} lembar saham lama berhak menebus ${ri.ratioNew} lembar saham baru.` },
        { q: `Berapa harga tebus HMETD ${ri.code}?`, a: `Harga pelaksanaan (tebus) HMETD ${ri.code} adalah ${formatCurrency(ri.rightPrice)} per lembar.` },
        { q: `Apa yang terjadi jika saya tidak tebus HMETD ${ri.code}?`, a: `Jika HMETD tidak ditebus, persentase kepemilikan Anda akan terdilusi. Anda bisa menjual hak HMETD di pasar selama periode perdagangan untuk memitigasi kerugian.` },
      ] : [
        { q: `What is the TERP for ${ri.code} after the right issue?`, a: `Estimated TERP for ${ri.code} is ${formatCurrency(terp!)} based on ratio ${ri.ratioOld}:${ri.ratioNew} and exercise price ${formatCurrency(ri.rightPrice)}.` },
        { q: `What is the right issue ratio for ${ri.code}?`, a: `${ri.code}'s HMETD ratio is ${ri.ratioOld}:${ri.ratioNew} — every ${ri.ratioOld} old shares entitle you to subscribe ${ri.ratioNew} new shares.` },
        { q: `What is the ${ri.code} HMETD exercise price?`, a: `The exercise price for ${ri.code} HMETD is ${formatCurrency(ri.rightPrice)} per share.` },
        { q: `What happens if I don't exercise ${ri.code} HMETD?`, a: `If unexercised, your ownership percentage gets diluted. You can sell your HMETD on the market during the trading period to mitigate losses.` },
      ])
    : [];

  useEffect(() => {
    if (!loading && !ri) {
      // Confirm not-found after fetch has settled once so we don't flash a message during load.
      const t = setTimeout(() => setNotFoundConfirmed(true), 250);
      return () => clearTimeout(t);
    }
  }, [loading, ri]);

  const canonical = `${BASE_URL}/ri/${code}`;
  const title = ri
    ? `Kalkulator Right Issue ${ri.code} (${ri.name}) — Rasio ${ri.ratioOld}:${ri.ratioNew}`
    : `Kalkulator Right Issue ${code} Saham IDX`;
  const description = ri
    ? `Hitung TERP, dilusi, dan jatah HMETD ${ri.code} (${ri.name}) rasio ${ri.ratioOld}:${ri.ratioNew} harga Rp ${new Intl.NumberFormat('id-ID').format(ri.rightPrice)}. Gratis, otomatis, berbahasa Indonesia.`
    : `Kalkulator TERP dan dilusi Right Issue (HMETD) untuk saham ${code} di BEI. Hitung otomatis, gratis, berbahasa Indonesia.`;

  const openCalculator = () => {
    if (!ri) {
      navigate(`/?sc=${encodeURIComponent(code)}`);
      return;
    }
    const params = new URLSearchParams({
      sc: ri.code,
      ro: ri.ratioOld,
      rn: ri.ratioNew,
      rp: String(ri.rightPrice),
    });
    if (ri.cumDatePrice) params.set('cp', String(ri.cumDatePrice));
    if (ri.hasWarrant && ri.warrantRatioOld && ri.warrantRatioNew) {
      params.set('hw', '1');
      params.set('wro', ri.warrantRatioOld);
      params.set('wrn', ri.warrantRatioNew);
    }
    navigate(`/?${params.toString()}`);
  };

  // Structured data — WebApplication + BreadcrumbList (+ FinancialProduct when RI data is known)
  const jsonLd: unknown[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: `Right Issue ${code}`, item: canonical },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: title,
      url: canonical,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      inLanguage: ['id', 'en'],
      description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
    },
  ];
  if (ri) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FinancialProduct',
      name: `Right Issue ${ri.code}`,
      description: `Hak Memesan Efek Terlebih Dahulu (HMETD) ${ri.code} — ${ri.name}. Rasio ${ri.ratioOld}:${ri.ratioNew}, harga tebus ${formatCurrency(ri.rightPrice)}.`,
      provider: { '@type': 'Corporation', name: ri.name, tickerSymbol: ri.code },
      category: 'HMETD',
    });
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {jsonLd.map((s, i) => (
          <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
        ))}
      </Helmet>

      <main className="min-h-screen bg-background px-4 py-6 max-w-2xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> {language === 'id' ? 'Kalkulator' : 'Calculator'}
        </Link>

        <header className="mb-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            {language === 'id' ? 'Right Issue (HMETD)' : 'Right Issue (HMETD)'}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
            {ri ? `${ri.code} — ${ri.name}` : `${code}`}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {description}
          </p>
        </header>

        {loading && !ri && (
          <div className="space-y-3">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        )}

        {ri && (
          <>
            <section className="card-calculator mb-4">
              <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                {language === 'id' ? 'Ringkasan Aksi' : 'Corporate Action Summary'}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {language === 'id' ? `Diperbarui ${updatedLabel}` : `Updated ${updatedLabel}`}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  {language === 'id' ? 'Sumber: pengumuman IDX / KSEI' : 'Source: IDX / KSEI filings'}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-[11px] text-muted-foreground">
                    {language === 'id' ? 'Rasio' : 'Ratio'}
                  </dt>
                  <dd className="font-bold text-foreground">
                    {ri.ratioOld} : {ri.ratioNew}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-muted-foreground">
                    {language === 'id' ? 'Harga Tebus' : 'Exercise Price'}
                  </dt>
                  <dd className="font-bold text-primary">{formatCurrency(ri.rightPrice)}</dd>
                </div>
                {ri.cumDatePrice && (
                  <div>
                    <dt className="text-[11px] text-muted-foreground">
                      {language === 'id' ? 'Harga Cum-Date' : 'Cum-Date Price'}
                    </dt>
                    <dd className="font-bold text-foreground">{formatCurrency(ri.cumDatePrice)}</dd>
                  </div>
                )}
                {ri.hasWarrant && (
                  <div>
                    <dt className="text-[11px] text-muted-foreground">
                      {language === 'id' ? 'Waran' : 'Warrant'}
                    </dt>
                    <dd className="font-bold text-foreground">
                      {ri.warrantRatioOld}:{ri.warrantRatioNew}
                    </dd>
                  </div>
                )}
              </dl>
              {ri.note && (
                <p className="text-[11px] text-muted-foreground mt-3 flex items-start gap-1.5">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{ri.note}</span>
                </p>
              )}
            </section>

            <button
              type="button"
              onClick={openCalculator}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
            >
              <Calculator className="w-4 h-4" />
              {language === 'id' ? `Hitung Right Issue ${ri.code}` : `Calculate ${ri.code} Right Issue`}
            </button>
          </>
        )}

        {!ri && notFoundConfirmed && (
          <section className="card-calculator">
            <h2 className="text-sm font-bold text-foreground mb-2">
              {language === 'id'
                ? `Belum ada data RI aktif untuk ${code}`
                : `No active RI data for ${code} yet`}
            </h2>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              {language === 'id'
                ? `Anda tetap bisa memakai kalkulator untuk menghitung TERP, jatah HMETD, dan dilusi ${code} secara manual dengan memasukkan rasio dan harga tebus.`
                : `You can still use the calculator to compute TERP, HMETD allotment, and dilution for ${code} manually.`}
            </p>
            <button
              type="button"
              onClick={openCalculator}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              <Calculator className="w-4 h-4" />
              {language === 'id' ? 'Buka Kalkulator' : 'Open Calculator'}
            </button>
          </section>
        )}

        <section className="mt-8 text-xs text-muted-foreground leading-relaxed space-y-3">
          <h2 className="text-sm font-bold text-foreground">
            {language === 'id'
              ? `Tentang Right Issue ${code}`
              : `About ${code} Right Issue`}
          </h2>
          <p>
            {language === 'id'
              ? `Right Issue atau Hak Memesan Efek Terlebih Dahulu (HMETD) adalah aksi korporasi ketika ${ri?.name ?? code} menawarkan saham baru kepada pemegang saham lama pada harga tebus tertentu, sesuai rasio kepemilikan.`
              : `A right issue (HMETD) is a corporate action where ${ri?.name ?? code} offers new shares to existing shareholders at a predetermined exercise price based on their holding ratio.`}
          </p>
          <p>
            {language === 'id'
              ? 'Gunakan kalkulator untuk mengetahui TERP (Theoretical Ex-Rights Price), berapa lot yang bisa ditebus, biaya yang dibutuhkan, harga rata-rata baru, serta dampak dilusi bila HMETD tidak ditebus.'
              : 'Use the calculator to determine TERP (Theoretical Ex-Rights Price), how many lots you can subscribe to, the required cost, your new average price, and dilution impact if you skip the rights.'}
          </p>
        </section>

        {ri && faqItems.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-bold text-foreground mb-3">
              {language === 'id' ? `Pertanyaan Umum ${ri.code}` : `${ri.code} FAQ`}
            </h2>
            <div className="space-y-2">
              {faqItems.map((f, i) => (
                <details
                  key={i}
                  className="group card-calculator !p-3 cursor-pointer"
                >
                  <summary className="text-xs font-semibold text-foreground list-none flex items-start justify-between gap-2">
                    <span>{f.q}</span>
                    <span className="text-muted-foreground group-open:rotate-45 transition-transform text-base leading-none">+</span>
                  </summary>
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
};

export default RiTicker;