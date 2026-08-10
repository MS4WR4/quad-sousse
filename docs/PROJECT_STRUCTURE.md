# Quad Sousse Loisirs — application structure

The current site combines the multilingual showcase, a foreground scroll
animation, live availability, and Stripe-ready online checkout.

```text
app/
├── [locale]/
│   ├── layout.tsx                    # Validated locale and RTL boundary
│   └── page.tsx                      # Localized storefront route
├── booking/page.tsx                  # Package-aware booking and checkout page
├── api/
│   ├── time-slots/route.ts           # Availability, capacity and package prices
│   └── payments/
│       ├── create-intent/route.ts    # Server-owned Stripe PaymentIntent creation
│       └── webhook/route.ts          # Signature-verified paid-booking update
├── globals.css                       # Brand tokens, motion and focus styles
├── layout.tsx                        # Root shell and scroll-quad layer
└── page.tsx                          # Default redirect to /fr

components/
├── landing/LandingPage.tsx           # Storefront and package booking links
├── booking/
│   ├── BookingPageContent.tsx        # Booking page shell
│   └── BookingAvailability.tsx       # Dates, slots, details and Payment Element
├── i18n/
│   ├── LanguageProvider.tsx          # In-place locale, storage and RTL state
│   └── LanguageSwitcher.tsx          # Accessible language control
└── visual/ScrollQuadSprite.tsx       # KOOB-inspired keyed quad animation

lib/
├── booking.ts                        # Date validation and checkout-hold policy
├── experiences.ts                    # Package identifiers and server pricing
├── prisma.ts                         # Shared Prisma client
└── stripe.ts                         # Server-only Stripe client

i18n/
├── messages/fr.json
├── messages/en.json
├── messages/ar.json
└── site.ts                           # Shared dictionary and locale types

prisma/
├── schema.prisma                     # Admin, TimeSlot and Booking models
└── seed.mjs                          # Default daily departure slots

types/
├── payment.ts                        # PaymentIntent API contracts
└── time-slot.ts                      # Availability API contracts
```

## Runtime boundaries

- The fixed quad animation is click-through, uses no WebGL canvas, and eases
  between keyed poses with `requestAnimationFrame`.
- Reduced-motion visitors receive a static quad; the booking page omits the
  decorative quad layer entirely.
- Language changes persist to `localStorage` and update `lang`, `dir`, title,
  and description without reloading.
- Prices and package multipliers stay on the server. The browser never chooses
  a PaymentIntent amount.
- Paid bookings and checkout holds reduce capacity. Unpaid holds expire after
  20 minutes.
- A booking becomes paid only after Stripe sends a signature-verified
  `payment_intent.succeeded` webhook with a matching amount and currency.
