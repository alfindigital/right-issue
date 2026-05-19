export interface ParsedAnnouncement {
  ratioOld?: string;
  ratioNew?: string;
  rightPrice?: string;
  cumDate?: string;
  matchedFields: string[];
}

export function parseAnnouncement(text: string): ParsedAnnouncement {
  const out: ParsedAnnouncement = { matchedFields: [] };
  if (!text) return out;
  const t = text.replace(/\u00a0/g, ' ');

  // Ratio: prefer "rasio X : Y" or "ratio X : Y" or "X : Y saham"
  let ratioMatch =
    t.match(/rasio[^\d]{0,20}(\d{1,4})\s*[:\/]\s*(\d{1,4})/i) ||
    t.match(/ratio[^\d]{0,20}(\d{1,4})\s*[:\/]\s*(\d{1,4})/i) ||
    t.match(/\b(\d{1,4})\s*:\s*(\d{1,4})\b/);
  if (ratioMatch) {
    out.ratioOld = ratioMatch[1];
    out.ratioNew = ratioMatch[2];
    out.matchedFields.push('ratio');
  }

  // Price: "harga pelaksanaan", "harga tebus", "exercise price"
  const priceRegexes = [
    /harga\s+(?:pelaksanaan|tebus|penawaran)[^\d]{0,30}(?:rp\.?\s*)?([\d.,]+)/i,
    /exercise\s+price[^\d]{0,30}(?:rp\.?\s*)?([\d.,]+)/i,
    /subscription\s+price[^\d]{0,30}(?:rp\.?\s*)?([\d.,]+)/i,
    /rp\.?\s*([\d.]{3,})\s*(?:per|\/)\s*(?:saham|share|lembar)/i,
  ];
  for (const re of priceRegexes) {
    const m = t.match(re);
    if (m) {
      const digits = m[1].replace(/[^\d]/g, '');
      if (digits) {
        out.rightPrice = digits;
        out.matchedFields.push('price');
        break;
      }
    }
  }

  // Cum date: try common formats
  const cumRegexes = [
    /cum[-\s]?date[^\d]{0,30}(\d{1,2}\s+\w+\s+\d{2,4})/i,
    /cum[-\s]?date[^\d]{0,30}(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /tanggal\s+cum[^\d]{0,30}(\d{1,2}\s+\w+\s+\d{2,4})/i,
  ];
  for (const re of cumRegexes) {
    const m = t.match(re);
    if (m) {
      out.cumDate = m[1];
      out.matchedFields.push('cumDate');
      break;
    }
  }

  return out;
}