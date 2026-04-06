import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, ArrowRight, Search, HelpCircle, GraduationCap, List } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// ─── Glossary Data ───────────────────────────────────────────────────
const glossaryItems = [
  {
    term: 'Right Issue (RI)',
    id_def: 'Penawaran Umum Terbatas (PUT) — aksi korporasi di mana emiten menerbitkan saham baru dan memberikan hak beli kepada pemegang saham lama sesuai rasio tertentu.',
    en_def: 'A corporate action where a company issues new shares and offers existing shareholders the right to purchase them at a set ratio.',
    category: 'basic',
  },
  {
    term: 'HMETD',
    id_def: 'Hak Memesan Efek Terlebih Dahulu — sertifikat hak yang diberikan kepada pemegang saham lama untuk membeli saham baru. HMETD bisa ditebus (exercise) atau dijual di pasar.',
    en_def: 'Pre-emptive Rights Certificate — a tradeable right given to existing shareholders to buy new shares. Can be exercised or sold in the market.',
    category: 'basic',
  },
  {
    term: 'TERP',
    id_def: 'Theoretical Ex-Right Price — harga teoritis saham setelah ex-date, dihitung dengan rumus: TERP = ((Harga Cum × Rasio Lama) + (Harga RI × Rasio Baru)) ÷ (Rasio Lama + Rasio Baru).',
    en_def: 'Theoretical Ex-Right Price — the theoretical share price after ex-date. Formula: TERP = ((Cum Price × Old Ratio) + (RI Price × New Ratio)) ÷ (Old Ratio + New Ratio).',
    category: 'pricing',
  },
  {
    term: 'Cum-Date',
    id_def: 'Tanggal terakhir perdagangan saham yang masih mendapat hak HMETD. Jika membeli saham pada atau sebelum cum-date, Anda berhak atas RI.',
    en_def: 'The last trading day where the share still carries the right (HMETD). Buying on or before cum-date entitles you to the RI.',
    category: 'timeline',
  },
  {
    term: 'Ex-Date',
    id_def: 'Tanggal setelah cum-date, di mana saham sudah tidak lagi membawa hak HMETD. Harga saham biasanya turun mendekati TERP pada tanggal ini.',
    en_def: 'The date after cum-date when the share no longer carries the right. Share price typically drops near TERP on this date.',
    category: 'timeline',
  },
  {
    term: 'Recording Date',
    id_def: 'Tanggal pencatatan pemegang saham yang berhak mendapat HMETD. Biasanya T+2 dari cum-date.',
    en_def: 'The date when shareholders entitled to HMETD are officially recorded. Usually T+2 from cum-date.',
    category: 'timeline',
  },
  {
    term: 'Exercise Period',
    id_def: 'Periode di mana pemegang HMETD dapat menebus hak mereka untuk membeli saham baru dengan membayar harga pelaksanaan.',
    en_def: 'The period during which HMETD holders can exercise their rights to purchase new shares by paying the exercise price.',
    category: 'timeline',
  },
  {
    term: 'Dilusi',
    id_def: 'Penurunan persentase kepemilikan saham akibat penambahan jumlah saham beredar. Jika tidak ikut RI, kepemilikan Anda terdilusi.',
    en_def: 'Reduction in ownership percentage due to the increase in total outstanding shares. Not participating in RI leads to dilution.',
    category: 'basic',
  },
  {
    term: 'Harga Pelaksanaan',
    id_def: 'Harga per lembar saham baru yang harus dibayar saat menebus HMETD. Biasanya di bawah harga pasar (diskon) agar menarik bagi investor.',
    en_def: 'The exercise price per new share when redeeming HMETD. Usually set below market price (at a discount) to attract investors.',
    category: 'pricing',
  },
  {
    term: 'Rasio RI',
    id_def: 'Perbandingan saham lama terhadap saham baru. Contoh: rasio 3:1 berarti setiap 3 lembar saham lama mendapat hak beli 1 lembar saham baru.',
    en_def: 'The ratio of old shares to new shares. Example: 3:1 ratio means every 3 existing shares get the right to buy 1 new share.',
    category: 'basic',
  },
  {
    term: 'Standby Buyer',
    id_def: 'Pembeli siaga yang berkomitmen membeli sisa saham RI yang tidak ditebus oleh pemegang saham lama. Biasanya pemegang saham pengendali atau investor strategis.',
    en_def: 'A committed buyer who agrees to purchase any unexercised RI shares. Usually a controlling shareholder or strategic investor.',
    category: 'basic',
  },
];

const categories = [
  { key: 'all', id: 'Semua', en: 'All' },
  { key: 'basic', id: 'Dasar', en: 'Basic' },
  { key: 'pricing', id: 'Harga', en: 'Pricing' },
  { key: 'timeline', id: 'Timeline', en: 'Timeline' },
];

// ─── Step-by-Step Data ───────────────────────────────────────────────
const stepsData = [
  {
    step: 1,
    icon: '📢',
    id_title: 'Emiten Mengumumkan RI',
    en_title: 'Company Announces RI',
    id_desc: 'Perusahaan mengumumkan rencana Right Issue: rasio, harga pelaksanaan, dan jadwal. Contoh: PT ABC melakukan RI dengan rasio 2:1 dan harga Rp 500/lembar.',
    en_desc: 'The company announces the Right Issue plan: ratio, exercise price, and schedule. Example: PT ABC conducts RI with 2:1 ratio at Rp 500/share.',
  },
  {
    step: 2,
    icon: '📅',
    id_title: 'Cum-Date & Ex-Date',
    en_title: 'Cum-Date & Ex-Date',
    id_desc: 'Pada cum-date, saham terakhir kali diperdagangkan dengan hak HMETD. Setelah ex-date, harga saham biasanya turun mendekati TERP. Jika harga cum Rp 2.500, TERP = ((2.500 × 2) + (500 × 1)) ÷ 3 = Rp 1.833.',
    en_desc: 'On cum-date, shares trade for the last time with HMETD rights. After ex-date, price typically drops near TERP. If cum price is Rp 2,500, TERP = ((2,500 × 2) + (500 × 1)) ÷ 3 = Rp 1,833.',
  },
  {
    step: 3,
    icon: '🎫',
    id_title: 'HMETD Didistribusikan',
    en_title: 'HMETD Distributed',
    id_desc: 'Pemegang saham yang tercatat pada recording date mendapat HMETD. Contoh: punya 100 lot (10.000 lembar), rasio 2:1 → mendapat 5.000 HMETD (50 lot hak beli).',
    en_desc: 'Shareholders recorded on recording date receive HMETD. Example: holding 100 lots (10,000 shares), ratio 2:1 → receive 5,000 HMETD (50 lots of buying rights).',
  },
  {
    step: 4,
    icon: '🤔',
    id_title: 'Keputusan: Tebus atau Jual',
    en_title: 'Decision: Exercise or Sell',
    id_desc: 'Anda punya 3 pilihan:\n• Tebus penuh — bayar Rp 500 × 5.000 = Rp 2,5 juta, dapat 50 lot baru\n• Tebus sebagian — tebus 25 lot, jual 25 lot HMETD\n• Jual semua HMETD — dapat uang dari penjualan hak, tapi kepemilikan terdilusi',
    en_desc: 'You have 3 options:\n• Full exercise — pay Rp 500 × 5,000 = Rp 2.5M, get 50 new lots\n• Partial exercise — exercise 25 lots, sell 25 lots of HMETD\n• Sell all HMETD — receive cash from selling rights, but ownership gets diluted',
  },
  {
    step: 5,
    icon: '💰',
    id_title: 'Tebus HMETD (Exercise)',
    en_title: 'Exercise HMETD',
    id_desc: 'Jika menebus penuh: Total saham = 10.000 + 5.000 = 15.000 lembar (150 lot). Avg baru = (10.000 × 2.000 + 5.000 × 500) ÷ 15.000 = Rp 1.500. Avg baru di bawah TERP (Rp 1.833) → berpotensi untung!',
    en_desc: 'If fully exercised: Total shares = 10,000 + 5,000 = 15,000 shares (150 lots). New avg = (10,000 × 2,000 + 5,000 × 500) ÷ 15,000 = Rp 1,500. New avg below TERP (Rp 1,833) → potential profit!',
  },
  {
    step: 6,
    icon: '📊',
    id_title: 'Dampak Dilusi',
    en_title: 'Dilution Impact',
    id_desc: 'Jika tidak ikut RI: total saham beredar naik 50%, tapi saham Anda tetap. Kepemilikan turun dari 10% menjadi ~6,67%. Jika ikut penuh, kepemilikan tetap 10%. Gunakan Simulasi Dilusi di kalkulator untuk melihat dampaknya.',
    en_desc: 'If you don\'t participate: total outstanding shares increase by 50%, but yours stay the same. Ownership drops from 10% to ~6.67%. Full participation maintains 10%. Use the Dilution Simulator in the calculator to see the impact.',
  },
];

// ─── FAQ Data ────────────────────────────────────────────────────────
const faqData = [
  {
    id_q: 'Apakah harus ikut Right Issue?',
    en_q: 'Is it mandatory to participate in a Right Issue?',
    id_a: 'Tidak wajib. Namun jika tidak ikut, kepemilikan Anda akan terdilusi. Anda bisa memilih untuk menjual HMETD di pasar untuk mendapat kompensasi tunai.',
    en_a: 'No, it\'s optional. However, not participating will dilute your ownership. You can sell your HMETD on the market for cash compensation.',
  },
  {
    id_q: 'Bagaimana cara menghitung nilai HMETD?',
    en_q: 'How to calculate HMETD value?',
    id_a: 'Nilai HMETD ≈ (Harga Cum - Harga RI) ÷ (Rasio Lama/Rasio Baru + 1). Contoh: Harga cum Rp 2.500, harga RI Rp 500, rasio 2:1 → HMETD = (2.500 - 500) ÷ (2/1 + 1) = Rp 667 per lembar.',
    en_a: 'HMETD value ≈ (Cum Price - RI Price) ÷ (Old Ratio/New Ratio + 1). Example: Cum price Rp 2,500, RI price Rp 500, ratio 2:1 → HMETD = (2,500 - 500) ÷ (2/1 + 1) = Rp 667 per share.',
  },
  {
    id_q: 'Apa yang terjadi jika HMETD tidak ditebus dan tidak dijual?',
    en_q: 'What happens if HMETD is neither exercised nor sold?',
    id_a: 'HMETD yang tidak ditebus akan hangus setelah periode exercise berakhir. Anda kehilangan hak tersebut dan kepemilikan Anda terdilusi tanpa kompensasi. Jangan biarkan HMETD hangus!',
    en_a: 'Unexercised HMETD will expire after the exercise period ends. You lose the rights and your ownership gets diluted without any compensation. Never let HMETD expire!',
  },
  {
    id_q: 'Apakah harga saham pasti turun setelah ex-date?',
    en_q: 'Will the stock price definitely drop after ex-date?',
    id_a: 'Secara teoritis, harga akan turun mendekati TERP. Namun harga aktual ditentukan oleh pasar — bisa di atas atau di bawah TERP tergantung sentimen dan permintaan. TERP adalah acuan teoritis, bukan jaminan.',
    en_a: 'Theoretically, the price drops near TERP. However, the actual price is determined by the market — it can be above or below TERP depending on sentiment and demand. TERP is a theoretical reference, not a guarantee.',
  },
  {
    id_q: 'Lebih baik tebus RI atau jual HMETD?',
    en_q: 'Is it better to exercise RI or sell HMETD?',
    id_a: 'Tergantung kondisi:\n• Tebus jika Anda yakin harga saham akan naik ke atas avg baru Anda\n• Jual HMETD jika butuh dana tunai atau ragu dengan prospek emiten\n• Pertimbangkan avg baru vs TERP — jika avg baru < TERP, menebus bisa menguntungkan\n\nGunakan fitur Perbandingan Skenario di kalkulator untuk analisis detail.',
    en_a: 'It depends on the situation:\n• Exercise if you believe the stock price will rise above your new average\n• Sell HMETD if you need cash or are uncertain about the company\'s prospects\n• Consider new avg vs TERP — if new avg < TERP, exercising can be profitable\n\nUse the Scenario Comparison feature in the calculator for detailed analysis.',
  },
  {
    id_q: 'Bagaimana jika lot saham saya menghasilkan HMETD pecahan?',
    en_q: 'What if my shares result in fractional HMETD?',
    id_a: 'HMETD pecahan (odd lot) biasanya tidak bisa ditebus secara langsung karena perdagangan dalam lot (100 lembar). Beberapa broker menyediakan mekanisme untuk menangani odd lot. Gunakan fitur Optimasi Lot di kalkulator untuk menyesuaikan jumlah lot agar hasil RI genap.',
    en_a: 'Fractional HMETD (odd lots) usually cannot be exercised directly since trading is in lots (100 shares). Some brokers provide mechanisms for handling odd lots. Use the Lot Optimization feature in the calculator to adjust your lot count for even RI results.',
  },
];

// ─── Components ──────────────────────────────────────────────────────

const GlossarySection: React.FC = () => {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = glossaryItems.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      (language === 'id' ? item.id_def : item.en_def).toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={language === 'id' ? 'Cari istilah...' : 'Search terms...'}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-2.5 py-1 text-[11px] rounded-full font-medium transition-all ${
              activeCategory === cat.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {language === 'id' ? cat.id : cat.en}
          </button>
        ))}
      </div>

      {/* Terms */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {language === 'id' ? 'Tidak ditemukan' : 'No results found'}
          </p>
        ) : (
          filtered.map((item) => (
            <GlossaryCard key={item.term} item={item} />
          ))
        )}
      </div>
    </div>
  );
};

const GlossaryCard: React.FC<{ item: (typeof glossaryItems)[0] }> = ({ item }) => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`rounded-xl border transition-all cursor-pointer ${
        open ? 'border-primary/30 bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-primary/20'
      }`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between p-3">
        <span className="font-semibold text-sm text-foreground">{item.term}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </div>
      {open && (
        <div className="px-3 pb-3 animate-fade-in">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {language === 'id' ? item.id_def : item.en_def}
          </p>
        </div>
      )}
    </div>
  );
};

const StepByStepSection: React.FC = () => {
  const { language } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {stepsData.map((step, idx) => (
          <React.Fragment key={step.step}>
            <button
              onClick={() => setActiveStep(idx)}
              className={`flex-shrink-0 w-8 h-8 rounded-full text-xs font-bold transition-all ${
                idx === activeStep
                  ? 'bg-primary text-primary-foreground shadow-md scale-110'
                  : idx < activeStep
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step.step}
            </button>
            {idx < stepsData.length - 1 && (
              <div
                className={`flex-shrink-0 w-4 h-0.5 rounded-full ${
                  idx < activeStep ? 'bg-primary/40' : 'bg-border'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Active Step Card */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4 animate-fade-in" key={activeStep}>
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">{stepsData[activeStep].icon}</span>
          <div className="space-y-2 min-w-0">
            <h3 className="font-bold text-sm text-foreground">
              {language === 'id' ? stepsData[activeStep].id_title : stepsData[activeStep].en_title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
              {language === 'id' ? stepsData[activeStep].id_desc : stepsData[activeStep].en_desc}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
          className="text-xs font-medium text-primary disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors disabled:hover:bg-transparent"
        >
          <ChevronRight className="w-3 h-3 rotate-180" />
          {language === 'id' ? 'Sebelumnya' : 'Previous'}
        </button>
        <span className="text-[10px] text-muted-foreground self-center">
          {activeStep + 1} / {stepsData.length}
        </span>
        <button
          onClick={() => setActiveStep(Math.min(stepsData.length - 1, activeStep + 1))}
          disabled={activeStep === stepsData.length - 1}
          className="text-xs font-medium text-primary disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors disabled:hover:bg-transparent"
        >
          {language === 'id' ? 'Selanjutnya' : 'Next'}
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* All Steps Summary */}
      <div className="space-y-1.5 pt-2 border-t border-border">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
          {language === 'id' ? 'Semua Langkah' : 'All Steps'}
        </p>
        {stepsData.map((step, idx) => (
          <button
            key={step.step}
            onClick={() => setActiveStep(idx)}
            className={`w-full text-left flex items-center gap-2.5 p-2 rounded-lg transition-all text-xs ${
              idx === activeStep
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <span className="flex-shrink-0">{step.icon}</span>
            <span>{language === 'id' ? step.id_title : step.en_title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const FAQSection: React.FC = () => {
  const { language } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {faqData.map((faq, idx) => (
        <div
          key={idx}
          className={`rounded-xl border transition-all ${
            openIdx === idx ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
          }`}
        >
          <button
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            className="w-full flex items-start justify-between gap-3 p-3 text-left"
          >
            <div className="flex items-start gap-2 min-w-0">
              <HelpCircle className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-foreground leading-snug">
                {language === 'id' ? faq.id_q : faq.en_q}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5 transition-transform ${
                openIdx === idx ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openIdx === idx && (
            <div className="px-3 pb-3 pl-8 animate-fade-in">
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                {language === 'id' ? faq.id_a : faq.en_a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Main Education Section ──────────────────────────────────────────

type SubTab = 'glossary' | 'steps' | 'faq';

const EducationSection = React.forwardRef<HTMLDivElement, {}>((props, ref) => {
  const { language } = useLanguage();
  const [subTab, setSubTab] = useState<SubTab>('steps');

  const tabs: { key: SubTab; icon: React.ReactNode; label: string }[] = [
    {
      key: 'steps',
      icon: <GraduationCap className="w-3.5 h-3.5" />,
      label: language === 'id' ? 'Cara Kerja RI' : 'How RI Works',
    },
    {
      key: 'glossary',
      icon: <List className="w-3.5 h-3.5" />,
      label: language === 'id' ? 'Glosarium' : 'Glossary',
    },
    {
      key: 'faq',
      icon: <HelpCircle className="w-3.5 h-3.5" />,
      label: 'FAQ',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Hero */}
      <section className="card-calculator animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-primary/10">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              {language === 'id' ? 'Panduan Right Issue' : 'Right Issue Guide'}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {language === 'id'
                ? 'Pelajari mekanisme RI, istilah penting, dan strategi partisipasi'
                : 'Learn RI mechanics, key terms, and participation strategies'}
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted/50">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSubTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                subTab === tab.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="card-calculator animate-fade-in">
        {subTab === 'glossary' && <GlossarySection />}
        {subTab === 'steps' && <StepByStepSection />}
        {subTab === 'faq' && <FAQSection />}
      </section>
    </div>
  );
});

EducationSection.displayName = 'EducationSection';

export default EducationSection;
