// Parses Indonesian/English right-issue (HMETD/PMHMETD/PUT/Rights) announcements
// and extracts ratio, exercise price, cum-date, and optional cum-date price.
// Uses scored matches so the most likely candidate wins when several appear.

export interface ParsedAnnouncement {
  ratioOld?: string;
  ratioNew?: string;
  rightPrice?: string;
  cumPrice?: string;
  cumDate?: string;
  matchedFields: string[];
}

const ID_MONTHS: Record<string, number> = {
  jan: 1, januari: 1, january: 1,
  feb: 2, februari: 2, february: 2, pebruari: 2,
  mar: 3, maret: 3, march: 3,
  apr: 4, april: 4,
  mei: 5, may: 5,
  jun: 6, juni: 6, june: 6,
  jul: 7, juli: 7, july: 7,
  agu: 8, agt: 8, agust: 8, agustus: 8, aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  okt: 10, oct: 10, october: 10, oktober: 10,
  nov: 11, november: 11, nopember: 11,
  des: 12, dec: 12, december: 12, desember: 12,
};

const MONTH_NAMES = Object.keys(ID_MONTHS)
  .sort((a, b) => b.length - a.length)
  .join('|');

const RI_CONTEXT_RE =
  /(hmetd|pmhmetd|right\s*issue|rights\s*issue|penawaran\s+umum\s+terbatas|put\s*[ivx]+|tebus|pelaksanaan|exercise|subscription|penerbitan|rights?\b)/i;

function digitsOnly(s: string): string {
  return s.replace(/[^\d]/g, '');
}

// Score a substring by how close it is to RI context keywords.
function contextScore(text: string, index: number, windowSize = 80): number {
  const start = Math.max(0, index - windowSize);
  const end = Math.min(text.length, index + windowSize);
  const slice = text.slice(start, end);
  let score = 0;
  if (RI_CONTEXT_RE.test(slice)) score += 5;
  if (/rasio|ratio/i.test(slice)) score += 3;
  if (/harga|price/i.test(slice)) score += 2;
  if (/cum[-\s]?date|tanggal\s+cum/i.test(slice)) score += 4;
  return score;
}

function normalizeDate(raw: string): string {
  const cleaned = raw.trim().replace(/\s+/g, ' ');
  const m1 = cleaned.match(
    new RegExp(`^(\\d{1,2})\\s+(${MONTH_NAMES})[a-z]*\\s+(\\d{2,4})$`, 'i'),
  );
  if (m1) {
    const d = m1[1].padStart(2, '0');
    const mo = String(ID_MONTHS[m1[2].toLowerCase()] ?? 0).padStart(2, '0');
    const y = m1[3].length === 2 ? `20${m1[3]}` : m1[3];
    if (mo !== '00') return `${y}-${mo}-${d}`;
  }
  const m2 = cleaned.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
  if (m2) return `${m2[1]}-${m2[2].padStart(2, '0')}-${m2[3].padStart(2, '0')}`;
  const m3 = cleaned.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (m3) {
    const d = m3[1].padStart(2, '0');
    const mo = m3[2].padStart(2, '0');
    const y = m3[3].length === 2 ? `20${m3[3]}` : m3[3];
    return `${y}-${mo}-${d}`;
  }
  return cleaned;
}

interface Candidate<T> { value: T; score: number; }

function pickRatio(t: string): Candidate<[string, string]> | null {
  const candidates: Candidate<[string, string]>[] = [];
  const reA = /(?:rasio|ratio|perbandingan)[^\d]{0,30}(\d{1,5})\s*[:/-]\s*(\d{1,5})/gi;
  for (const m of t.matchAll(reA)) {
    if (+m[1] === 0 || +m[2] === 0) continue;
    candidates.push({ value: [m[1], m[2]], score: 10 + contextScore(t, m.index ?? 0) });
  }
  const reB =
    /setiap\s+(\d{1,5})\s+(?:saham|lembar)(?:\s+lama)?[^\d]{1,80}?(\d{1,5})\s+(?:saham|lembar|hmetd|hak|rights?)/gi;
  for (const m of t.matchAll(reB)) {
    candidates.push({ value: [m[1], m[2]], score: 9 + contextScore(t, m.index ?? 0) });
  }
  const reC =
    /every\s+(\d{1,5})\s+(?:old\s+)?shares?[^\d]{1,80}?(\d{1,5})\s+(?:new|rights?)/gi;
  for (const m of t.matchAll(reC)) {
    candidates.push({ value: [m[1], m[2]], score: 9 + contextScore(t, m.index ?? 0) });
  }
  const reD = /\b(\d{1,4})\s*:\s*(\d{1,4})\b/g;
  for (const m of t.matchAll(reD)) {
    const ctx = contextScore(t, m.index ?? 0);
    if (ctx === 0) continue;
    if (+m[1] === 0 || +m[2] === 0) continue;
    candidates.push({ value: [m[1], m[2]], score: 4 + ctx });
  }
  if (!candidates.length) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}

interface PriceMatch { value: string; score: number; kind: 'exercise' | 'cum'; }

function pickPrices(t: string): { right?: string; cum?: string } {
  const out: PriceMatch[] = [];
  const push = (digits: string, score: number, kind: PriceMatch['kind']) => {
    if (!digits) return;
    const n = +digits;
    if (n < 1 || n > 10_000_000) return;
    out.push({ value: digits, score, kind });
  };

  const exerciseRegexes: { re: RegExp; weight: number }[] = [
    { re: /harga\s+(?:pelaksanaan|tebus|penerbitan|penawaran|rights?|hmetd)[^\d]{0,30}(?:rp\.?\s*)?([\d.,]+)/gi, weight: 12 },
    { re: /(?:exercise|subscription|issue|offering)\s+price[^\d]{0,30}(?:rp\.?\s*)?([\d.,]+)/gi, weight: 12 },
    { re: /harga\s+(?:per\s+)?(?:saham|lembar)\s+baru[^\d]{0,20}(?:rp\.?\s*)?([\d.,]+)/gi, weight: 10 },
    { re: /rp\.?\s*([\d.,]{2,})\s*(?:per|\/)\s*(?:saham|share|lembar|rights?|hmetd)/gi, weight: 6 },
  ];
  for (const { re, weight } of exerciseRegexes) {
    for (const m of t.matchAll(re)) {
      push(digitsOnly(m[1]), weight + contextScore(t, m.index ?? 0), 'exercise');
    }
  }

  const cumPriceRegexes: { re: RegExp; weight: number }[] = [
    { re: /harga\s+(?:saham\s+)?cum[-\s]?date[^\d]{0,30}(?:rp\.?\s*)?([\d.,]+)/gi, weight: 12 },
    { re: /harga\s+(?:penutupan|terakhir)[^\d]{0,40}cum[^\d]{0,20}(?:rp\.?\s*)?([\d.,]+)/gi, weight: 11 },
    { re: /(?:closing|cum)\s*price[^\d]{0,30}(?:rp\.?\s*)?([\d.,]+)/gi, weight: 11 },
  ];
  for (const { re, weight } of cumPriceRegexes) {
    for (const m of t.matchAll(re)) {
      push(digitsOnly(m[1]), weight + contextScore(t, m.index ?? 0), 'cum');
    }
  }

  const best = (kind: PriceMatch['kind']) =>
    out.filter(p => p.kind === kind).sort((a, b) => b.score - a.score)[0]?.value;

  return { right: best('exercise'), cum: best('cum') };
}

function pickCumDate(t: string): string | undefined {
  const datePart =
    `(\\d{1,2}\\s+(?:${MONTH_NAMES})[a-z]*\\s+\\d{2,4}` +
    `|\\d{4}[\\/\\-.]\\d{1,2}[\\/\\-.]\\d{1,2}` +
    `|\\d{1,2}[\\/\\-.]\\d{1,2}[\\/\\-.]\\d{2,4})`;

  const labelled: RegExp[] = [
    new RegExp(`cum[-\\s]?(?:date|period)[^\\d]{0,40}${datePart}`, 'gi'),
    new RegExp(`tanggal\\s+(?:terakhir\\s+)?(?:cum|perdagangan\\s+cum)[^\\d]{0,40}${datePart}`, 'gi'),
    new RegExp(`(?:cum[-\\s]?date|tanggal\\s+cum)\\s*[:\\-]?\\s*${datePart}`, 'gi'),
    new RegExp(`(?:perdagangan|trading)[^\\d]{0,40}cum[^\\d]{0,40}${datePart}`, 'gi'),
  ];

  let best: { raw: string; score: number } | null = null;
  for (const re of labelled) {
    for (const m of t.matchAll(re)) {
      const score = 5 + contextScore(t, m.index ?? 0);
      if (!best || score > best.score) best = { raw: m[1], score };
    }
  }
  if (!best) return undefined;
  return normalizeDate(best.raw);
}

export function parseAnnouncement(text: string): ParsedAnnouncement {
  const out: ParsedAnnouncement = { matchedFields: [] };
  if (!text) return out;

  const t = text
    .replace(/\u00a0/g, ' ')
    .replace(/[–—]/g, '-')
    .replace(/\r/g, '\n');

  const ratio = pickRatio(t);
  if (ratio) {
    out.ratioOld = ratio.value[0];
    out.ratioNew = ratio.value[1];
    out.matchedFields.push('ratio');
  }

  const { right, cum } = pickPrices(t);
  if (right) {
    out.rightPrice = right;
    out.matchedFields.push('price');
  }
  if (cum) {
    out.cumPrice = cum;
    out.matchedFields.push('cumPrice');
  }

  const cumDate = pickCumDate(t);
  if (cumDate) {
    out.cumDate = cumDate;
    out.matchedFields.push('cumDate');
  }

  return out;
}