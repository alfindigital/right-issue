// Parse spoken number transcript (ID/EN) into digit string.
const ID_UNITS: Record<string, number> = {
  nol: 0, kosong: 0, satu: 1, dua: 2, tiga: 3, empat: 4, lima: 5,
  enam: 6, tujuh: 7, delapan: 8, sembilan: 9, sepuluh: 10, sebelas: 11,
};
const ID_MULT: Record<string, number> = {
  belas: 1, puluh: 10, ratus: 100, ribu: 1000, juta: 1_000_000, miliar: 1_000_000_000,
  milyar: 1_000_000_000,
};
const EN_UNITS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
  fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90,
};
const EN_MULT: Record<string, number> = {
  hundred: 100, thousand: 1000, million: 1_000_000, billion: 1_000_000_000,
};

function parseIndonesian(words: string[]): number | null {
  let total = 0;
  let current = 0;
  let found = false;
  for (const w of words) {
    if (w in ID_UNITS) { current += ID_UNITS[w]; found = true; continue; }
    if (w === 'se') { current = 1; found = true; continue; }
    if (w in ID_MULT) {
      found = true;
      const m = ID_MULT[w];
      if (m === 1) { // belas
        current = 10 + (current || 0);
      } else if (m >= 1000) {
        current = (current || 1) * m;
        total += current;
        current = 0;
      } else {
        current = (current || 1) * m;
      }
    }
  }
  if (!found) return null;
  return total + current;
}

function parseEnglish(words: string[]): number | null {
  let total = 0;
  let current = 0;
  let found = false;
  for (const w of words) {
    if (w in EN_UNITS) { current += EN_UNITS[w]; found = true; continue; }
    if (w in EN_MULT) {
      found = true;
      const m = EN_MULT[w];
      if (m === 100) current = (current || 1) * 100;
      else { current = (current || 1) * m; total += current; current = 0; }
    }
  }
  if (!found) return null;
  return total + current;
}

export function parseSpokenNumber(transcript: string, lang: 'id' | 'en' = 'id'): string {
  if (!transcript) return '';
  const cleaned = transcript.toLowerCase().trim();

  // Try pure-digit fallback (e.g. "2 500 000" or "2.500.000")
  const digitsOnly = cleaned.replace(/[^\d]/g, '');
  if (digitsOnly && /^[\d\s.,]+$/.test(cleaned)) {
    return digitsOnly;
  }

  const words = cleaned.replace(/[.,]/g, '').split(/\s+/).filter(Boolean);
  const parsed = lang === 'id' ? parseIndonesian(words) : parseEnglish(words);
  if (parsed !== null && parsed > 0) return String(parsed);

  // Last resort: extract any digits found
  return digitsOnly;
}