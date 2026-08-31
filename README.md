# Lotmetrik — Right Issue Calculator for IDX Stocks

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-backend-3ECF8E?logo=supabase)](https://supabase.com)

**Lotmetrik** is a free, bilingual (Indonesian/English) web application that calculates Right Issue (HMETD) mechanics for shares listed on the Indonesia Stock Exchange (IDX/BEI).

Live demo: https://lotmetrik.my.id

---

## Features

- **Right Issue Calculator** — input ratio, exercise price, cum price, and lot count to instantly get your allotment, total redemption cost, new average price, and TERP
- **HMETD Premium/Discount Detection** — automatic contextual recommendation: redeem vs. sell HMETD on the market
- **Buy HMETD from Market** — mode for investors who have no initial holdings but want to purchase HMETD rights
- **Warrant Module** — calculate warrant exercise value and dilution impact
- **Dilution Simulator** — model the effect of the rights issue on your portfolio percentage
- **Target Price What-If** — scenario analysis for target prices post-RI
- **Scenario Comparison** — compare multiple RI configurations side by side
- **Budget Planner** — plan your capital allocation across multiple stocks
- **PDF / CSV Export** — download calculation results for record-keeping
- **Share Deep-Link** — share your exact calculation state via URL
- **PWA / Offline** — installable as a Progressive Web App, works offline
- **Dark Mode** — full dark/light theme support
- **Bilingual** — Indonesian and English UI

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Build tool   | Vite 5                              |
| UI Framework | React 18 + TypeScript 5             |
| Styling      | Tailwind CSS 3 + shadcn/ui          |
| Backend      | Supabase (PostgreSQL + Edge Functions) |
| State        | TanStack Query v5                   |
| Charts       | Recharts                            |
| PWA          | vite-plugin-pwa + Workbox           |
| Testing      | Vitest + Testing Library            |
| Routing      | React Router v6                     |

---

## Quick Start

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier is sufficient)

### 1. Clone

```sh
git clone https://github.com/alfindigital/right-issue.git
cd right-issue
```

### 2. Install dependencies

```sh
npm install
```

### 3. Configure environment

```sh
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_URL=https://your_project_id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_public_key
```

Find these in your Supabase Dashboard → Project Settings → API.

### 4. Start development server

```sh
npm run dev
```

Open http://localhost:8080

### 5. Run tests

```sh
npm test
```

### 6. Production build

```sh
npm run build
```

Output is in `dist/`.

---

## Project Structure

```
right-issue/
├── public/              # Static assets (icons, splash screens, sitemap)
├── scripts/
│   └── generate-sitemap.ts   # Pre-build sitemap generator
├── src/
│   ├── components/      # Reusable UI components
│   │   └── RightIssueCalculator/   # Core calculator components
│   ├── contexts/        # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── integrations/
│   │   └── supabase/    # Supabase client + type definitions
│   ├── lib/             # Utilities and helpers
│   ├── pages/           # Route-level page components
│   │   ├── Index.tsx        # Main calculator page
│   │   ├── Education.tsx    # RI education guide (Edukasi)
│   │   ├── RiTicker.tsx     # Per-ticker RI detail page
│   │   ├── Admin.tsx        # Admin panel
│   │   ├── Embed.tsx        # Embeddable calculator widget
│   │   └── NotFound.tsx     # 404 page
│   ├── test/            # Test utilities and fixtures
│   ├── App.tsx          # Root app component + routing
│   └── main.tsx         # Application entry point
├── supabase/
│   ├── config.toml      # Supabase CLI configuration
│   └── functions/       # Supabase Edge Functions
├── tests/               # E2E and integration tests
├── .env.example         # Environment variable template
├── vite.config.ts       # Vite + PWA configuration
└── vitest.config.ts     # Test configuration
```

---

## Environment Variables

| Variable                        | Description                                 |
|---------------------------------|---------------------------------------------|
| `VITE_SUPABASE_PROJECT_ID`      | Your Supabase project ID                    |
| `VITE_SUPABASE_URL`             | Your Supabase project URL                   |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon (public) key             |

See `.env.example` for a complete template. Never commit `.env` — it is in `.gitignore`.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Branch naming conventions
- Commit message format
- Pull request checklist

---

## Security

Please review [SECURITY.md](SECURITY.md) for:
- Vulnerability disclosure process
- Credential hygiene guidance
- Important notice about Supabase key rotation if you forked this repo

---

## License

MIT License — see [LICENSE](LICENSE) for details.
