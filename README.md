# Lotmetrik — Kalkulator Right Issue Saham IDX

Kalkulator Right Issue (HMETD) untuk saham IDX: hitung jatah RI, TERP,
dilusi, warrant, dan rekomendasi tebus vs jual HMETD.

- Live: https://lotmetrik.my.id
- Mirror: https://rightissue.alfindigital.com

## Fitur inti

- Kalkulasi RI (rasio, harga pelaksanaan, cum price) → jatah, TERP, avg baru
- Deteksi RI premium vs diskon dengan rekomendasi kontekstual
- Mode "beli HMETD dari pasar" (tanpa kepemilikan awal)
- Warrant, dilution simulator, target price what-if, scenario comparison
- Budget planner, PDF/CSV export, share deep-link, PWA offline

## Stack

Vite · React · TypeScript · Tailwind · shadcn-ui · Vitest · Playwright.

## Dev

```sh
npm i
npm run dev
npm test
```

E2E: `python tests/e2e/right-issue-flow.spec.py` (butuh Playwright).

## Lisensi

© Lotmetrik.
