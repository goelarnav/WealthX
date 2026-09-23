# WealthX

A stock-recommendation platform: phone + PIN authentication, a recommendations
dashboard, and a "More" section of placeholder financial calculators.

## Tech stack

- **Framework:** Next.js (App Router, Server Actions) + React + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Animation:** [Motion](https://motion.dev)
- **Database:** PostgreSQL via Prisma (driver adapter: `@prisma/adapter-pg`)
- **Auth:** phone + OTP (mocked) → 4-digit PIN, signed JWT session cookie (`jose`)

## Getting started

### 1. Prerequisites

- Node.js 20+
- A running PostgreSQL instance

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the values (see below).

```bash
cp .env.example .env
```

### 4. Set up the database

```bash
npm run db:migrate   # creates tables from prisma/schema.prisma
npm run db:seed       # loads demo recommendations
```

### 5. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). You'll land on `/login`;
use "Create an account" to sign up. OTPs are mocked — the 6-digit code is
shown on screen ("Dev mode — your code is ...") and logged to the server
console, so no SMS provider is needed to test the flow.

## Environment variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret used to sign session/verification cookies (`openssl rand -hex 32`) |
| `OTP_PROVIDER` | `mock` (default) or a real provider id once one is wired up in `lib/auth/otp-provider.ts` |
| `OTP_TTL_SECONDS` | How long an OTP stays valid (default 300) |

## Project structure

```
app/
  login/                  phone + PIN login, "forgot PIN" wizard
  signup/                 phone → OTP → create-profile wizard
  (app)/                  authenticated shell (header, mobile nav)
    dashboard/            main recommendations dashboard
    recommendations/[id]/ recommendation detail + timeline
    profile/              profile view/edit, change PIN, logout
    calculators/          "More" section: overview + 6 placeholder pages
components/
  auth/                   phone/OTP/PIN inputs, wizards, auth shell
  navigation/             header, mobile bottom nav, "More" dropdown, user menu
  recommendations/        summary cards, filters, table (desktop), cards (mobile)
  profile/                edit-profile and change-PIN dialogs
  calculators/            shared "coming soon" placeholder
  motion/                 small Motion wrappers (page reveal, step transitions)
  ui/                     shadcn/ui primitives
lib/
  auth/                   OTP issuing/verification, PIN hashing, sessions, rate limiting
  db/                     Prisma client
  recommendations/        repository (Prisma) + derived-value helpers (gain %, days held)
  validators/             zod schemas for phone/OTP/PIN/name
  calculators.ts          single source of truth for the 6 calculator routes
prisma/
  schema.prisma
  seed.ts
```

## Architecture notes

**Auth.** Signup and "forgot PIN" are each a single route that runs a
client-side, multi-step wizard (phone → OTP → PIN) calling Server Actions —
no phone numbers ever sit in a URL. A verified phone is carried between
steps via a short-lived, signed httpOnly cookie (`lib/auth/verification.ts`),
not by trusting client-submitted state. PINs are hashed with bcrypt; because
a 4-digit PIN only has 10,000 possibilities, the real defense against
brute-forcing is the attempt counter + temporary lockout on the `User` row
(`lib/auth/pin.ts`), plus request-level rate limiting
(`lib/auth/rate-limit.ts`) on OTP send/verify and login. Sessions are a
signed JWT in an httpOnly cookie (`lib/auth/session.ts`); `proxy.ts`
(Next's Edge-safe "middleware") checks that cookie to protect
`/dashboard`, `/profile`, `/recommendations`, `/calculators`.

**Recommendation data.** `StockRecommendation` stores only source-of-truth
facts (prices, dates, status). Gain %, days held, and open/closed framing
are computed on read in `lib/recommendations/derive.ts` rather than stored,
so they can never drift out of sync with the underlying prices. The
repository (`lib/recommendations/repository.ts`) already exposes
`createRecommendation` / `updateCurrentPrice` / `closeRecommendation` /
`importRecommendations` — no admin UI yet, but the seams are there for one,
and for a future Excel/CSV import.

## What's not implemented yet

- Calculator logic (SIP/SWP/brokerage/margin/credit/pricing pages are
  placeholders by design — see spec)
- Admin UI for managing recommendations (backend supports it; see above)
- Real SMS provider (swap into `lib/auth/otp-provider.ts`)
- Live market data / price history / charts
