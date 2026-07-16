# lunarlogic-amy-demo

A LunarLogic finance-cockpit demo built for **Vanguard Holdings Group** (CFO persona: Amy Chen). Single-URL, unauthenticated demo environment showcasing treasury, cash flow forecasting, month-end close, and debt covenant monitoring.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** + **shadcn/ui** primitives
- **Recharts** for data visualization
- **Nunito** (body) + **Fraunces** (headings) via `next/font/google`

## Brand tokens

| Token | Value |
| --- | --- |
| Page background | `#0F172A` |
| Card surfaces | `slate-800 / 40%` |
| Borders | `slate-700` |
| Body text | `slate-300` |
| Muted text | `slate-500` |
| Primary CTA | `#3B82F6` |
| Gradient accent | `linear-gradient(135deg, #60A5FA, #818CF8)` |
| Success / Warning / Danger | `green-400` / `amber-400` / `red-400` |

Tokens live in `tailwind.config.ts` (`brand.*` palette + semantic shadcn layer) and `src/app/globals.css` (CSS variables + `.brand-*` helpers).

## Data

No authentication, no database. All figures come from local mock files in `src/data/`:

- `client.ts` — demo client identity
- `nav.ts` — sidebar navigation
- `dashboard.ts` — headline treasury metrics

## Develop

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.
