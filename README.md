# WealthX

A stock-recommendation platform: phone + PIN authentication, a recommendations
dashboard with live market prices, a personal "My Stocks" portfolio, and a
"More" section of placeholder financial calculators.

## Tech stack

- **Framework:** Next.js (App Router, Server Actions) + React + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Animation:** [Motion](https://motion.dev)
- **Database:** PostgreSQL via Prisma (driver adapter: `@prisma/adapter-pg`)
- **Auth:** phone + OTP (mocked) → 4-digit PIN, signed JWT session cookie (`jose`)
- **Live prices:** Yahoo Finance's unofficial quote endpoint (no API key)

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
npm run prices:refresh  # optional: pull live CMPs from Yahoo Finance now
```

### 5. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). You'll land on `/login`;
use "Create an account" to sign up. OTPs are mocked — the 6-digit code is
shown on screen ("Dev mode — your code is ...") and logged to the server
console, so no SMS provider is needed to test the flow.

To manage recommendations, go to [http://localhost:3000/admin](http://localhost:3000/admin)
— it redirects straight to a login form, entirely separate from customer
accounts. Log in with `ADMIN_USERNAME` / the plaintext password behind
`ADMIN_PASSWORD_HASH` in your `.env`. To set your own password:

```bash
npm run admin:hash-password -- "your-new-password"
# paste the printed hash into ADMIN_PASSWORD_HASH in .env, restart the dev server
```

## Environment variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret used to sign session/verification cookies (`openssl rand -hex 32`) |
| `OTP_PROVIDER` | `mock` (default) or a real provider id once one is wired up in `lib/auth/otp-provider.ts` |
| `OTP_TTL_SECONDS` | How long an OTP stays valid (default 300) |
| `MARKET_DATA_PROVIDER` | `yahoo` (default, no key needed) — see `lib/market/price-provider.ts` |
| `MARKET_REFRESH_SECRET` | Bearer token a scheduler must send to `POST /api/market/refresh` |
| `ADMIN_USERNAME` | Username for `/admin/login` |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the admin password (`npm run admin:hash-password -- "..."`) |

## Project structure

```
app/
  login/                  phone + PIN login, "forgot PIN" wizard
  signup/                 phone → OTP → create-profile wizard
  admin/                  separate area: own login, no customer session needed
    login/                username + password form
  api/market/refresh/     cron-facing endpoint that pulls live CMPs
  (app)/                  authenticated shell (header, mobile nav)
    dashboard/            main recommendations dashboard
    recommendations/[id]/ recommendation detail + timeline + invest/exit
    portfolio/            "My Stocks" — personal positions + history
    profile/              profile view/edit, change PIN, logout
    calculators/          "More" section: overview + 6 placeholder pages
components/
  auth/                   phone/OTP/PIN inputs, wizards, auth shell
  navigation/             header, mobile bottom nav, "More" dropdown, user menu
  recommendations/        summary cards, filters, table (desktop), cards (mobile)
  investments/            invest/exit dialogs, position panel, portfolio list
  admin/                  login form, add/update-CMP/close dialogs, admin table
  profile/                edit-profile and change-PIN dialogs
  calculators/            shared "coming soon" placeholder
  motion/                 small Motion wrappers (page reveal, step transitions)
  ui/                     shadcn/ui primitives
lib/
  auth/                   OTP issuing/verification, PIN hashing, customer + admin
                          sessions, rate limiting
  db/                     Prisma client
  recommendations/        repository (Prisma) + derived-value helpers (gain %, days held)
  investments/            repository + derived-value helpers (P&L, holding days)
  market/                 price-provider abstraction, Yahoo Finance client, refresh job
  validators/             zod schemas for phone/OTP/PIN/name/amount/recommendation/admin
  calculators.ts          single source of truth for the 6 calculator routes
prisma/
  schema.prisma
  seed.ts
scripts/
  refresh-prices.ts       manual/cron entry point for the price refresh job
  hash-admin-password.ts  prints a bcrypt hash for ADMIN_PASSWORD_HASH
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
repository (`lib/recommendations/repository.ts`) exposes
`createRecommendation` / `updateCurrentPrice` / `closeRecommendation` /
`importRecommendations`; `/admin` is a thin UI over the first three, and
`importRecommendations` is still an open seam for a future Excel/CSV
import.

**Admin.** Deliberately not part of the customer auth system at all — no
`User` row is ever "an admin." `/admin/login` checks a username/password
against `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` in the environment
(`lib/auth/admin-session.ts`) and, on success, sets its own signed JWT
cookie (`wealthx_admin_session`, 12h expiry) — a completely separate cookie
from the customer `wealthx_session`, so being logged in as a customer
grants no admin access and vice versa. `proxy.ts` branches on the `/admin`
prefix before any customer-auth logic runs, redirecting straight to
`/admin/login` when that cookie is missing/invalid; every `/admin` Server
Action also calls `requireAdminSession()` itself as defense-in-depth, same
pattern as `requireUser()` for customers. Login attempts are rate-limited
per username (`lib/auth/rate-limit.ts`), same as customer login. A closed
recommendation's admin controls disappear (nothing to update/close
further), matching the read-only CLOSED state everywhere else in the app.

**Personal investments ("My Stocks").** A recommendation is one shared,
admin-owned record; an `Investment` is a user's own position in it, and the
two are deliberately independent. Investing snapshots `entryPrice` from the
recommendation's live price at that moment and takes a ₹ `amount` — no
share-quantity math. Exiting is a separate action where the user types
*their own* exit price/date (not necessarily today's market price), because
this records what actually happened for them (e.g. via their real broker),
not a mirror of the admin's recommendation lifecycle — so a position stays
exitable even after an admin closes the underlying recommendation, and nothing
auto-closes it. Same rule as recommendations: gain %, current value, and
holding days are derived in `lib/investments/derive.ts`, never stored.

**Live prices.** `lib/market/price-provider.ts` is a `PriceProvider`
interface (same shape as the OTP provider) so a paid vendor can replace
Yahoo later without touching callers. `lib/market/refresh-prices.ts` pulls a
quote per OPEN recommendation's NSE code and writes it through the existing
`updateCurrentPrice()` — the dashboard only ever reads from the DB, it never
calls out to Yahoo itself, so page loads don't depend on a third party's
uptime. Two ways to run it: `npm run prices:refresh` (manual/local), or
`POST /api/market/refresh` with `Authorization: Bearer $MARKET_REFRESH_SECRET`
(what an external scheduler — cron, GitHub Actions, Vercel Cron — should
hit every few minutes during market hours; none is configured in this repo).
Yahoo's endpoint is unofficial and undocumented — every failure mode
resolves to skipping that one symbol for the cycle rather than throwing, so
one bad symbol can't take down the rest of the refresh.

## What's not implemented yet

- Calculator logic (SIP/SWP/brokerage/margin/credit/pricing pages are
  placeholders by design — see spec)
- Excel/CSV import into recommendations (backend seam exists; see above)
- Real SMS provider (swap into `lib/auth/otp-provider.ts`)
- An actual scheduler calling `/api/market/refresh` (the endpoint and script
  exist; nothing cron's it yet)
- Price history / charts (only the latest CMP is kept, not a time series)
