# Quad of Sousse

Typed Next.js website and booking platform for Quad Sousse Loisirs in Sousse, Tunisia.

## Included

- App Router landing page with multilingual Framer Motion transitions
- KOOB-inspired, scroll-keyed quad cutout animation with a reduced-motion fallback
- Package-aware booking plan with upcoming dates, live time slots and capacity
- Stripe Payment Element checkout with server-calculated prices and verified webhooks
- Prisma + SQLite models for administrators, time slots, and bookings
- Typed `GET /api/time-slots?date=YYYY-MM-DD&experience=golden-hour` endpoint
- English, French and RTL Arabic interfaces

## Local setup

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev          # Next.js development server
npm run lint         # ESLint
npm run build        # Optimized production build
npm run db:generate  # Generate the Prisma client
npm run db:push      # Sync local SQLite schema
npm run db:seed      # Add the default 09:00, 11:30, 14:00 and 17:00 slots
npm run db:migrate   # Create a development migration
```

## Activate online payment

Create or open the project's Stripe account and add its own test or live values to `.env`:

```bash
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Register `/api/payments/webhook` as the Stripe webhook endpoint and subscribe to `payment_intent.succeeded`. During local testing, the Stripe CLI can forward signed events:

```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

Copy the `whsec_...` secret printed by that command into `.env`, then restart the development server. Never commit `.env` or expose a secret key in browser code.

Prices are stored as integer smallest-currency units. The PaymentIntent endpoint always re-reads capacity and calculates the final package price on the server before charging. Unpaid checkout holds expire after 20 minutes, and only the verified webhook marks a reservation as paid.

See [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) for the complete application map and next-phase boundaries.
