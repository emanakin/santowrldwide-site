# SANTOWRLDWIDE E-commerce

https://www.santowrldwide.com e-commerce platform built with Next.js, Firebase, and Shopify integration.

## Overview

SANTOWRLDWIDE is a Toronto-based streetwear brand website featuring a clean, minimalist design with secure user authentication, shopping cart functionality, and Shopify integration.

## Technologies

- **Frontend**: Next.js 15, React 19, TypeScript
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **E-commerce**: Shopify Storefront API
- **Styling**: CSS Modules

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project
- Shopify store with Storefront API access

### Environment Variables

Create a `.env.local` file with the following variables:

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Shopify
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=

# Site Settings
NEXT_PUBLIC_LOCK_MODE=false
SITE_PASSWORD=
SITE_UNLOCK_SECRET=

# Reviewed production outreach (server only)
SMTP_HOST=mail.privateemail.com
SMTP_PORT=465
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
SANTO_POSTAL_ADDRESS=
PRODUCTIONS_PORTFOLIO_READY=false
```

### Installation

```bash
# Install dependencies
npm install
# or
yarn

# Run development server
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Productions and contact research

- `/productions` is public and uses the existing R2 bucket root keys listed in `PRODUCTION_MEDIA.md`. It has its own studio layout and preserves the bottom project bar. Final credits, rights, and the Stop This impact figure still need owner confirmation.
- `/account/production` redirects to the owner-only dashboard at `/account/production/settings`.
- `/account/production/settings` is restricted to existing Firebase super admins. It can preload the 271 researched contacts bundled in `src/data/production-contacts.json`, import a newer CSV, review contacts and drafts, and export the live list. Firestore holds `production_contacts` and `production_drafts`. Preloading is idempotent for existing contacts.
- A contact must have a source URL, a recent check date, and a public professional route. The source and legal basis fields are separate: a published email alone does not authorize a commercial message.
- Each outbound draft needs review, explicit send confirmation, a recorded contact-specific outreach basis, a working Santo SMTP mailbox, a sender postal address, and an approved public portfolio. The owner can approve or pause the published portfolio in Email setup; this decision is stored in `production_settings/outreach` and overrides the initial `PRODUCTIONS_PORTFOLIO_READY` environment default. Approval should occur only after reviewing the public work, credits, and media rights. The dashboard can mark selected drafts ready in bulk, but each send remains a separate manual action limited to 10 recipients. A send with an uncertain SMTP result is recorded as `send_unknown` and is never retried automatically. Drafts and sent history remain visible in the Email history tab. The app never fills an empty outreach basis automatically.
- `/book/zeb` is an unlisted public booking page. The owner adds a Toronto start/end range in the Bookings tab; the system publishes each 20-minute opening in that range. None are published by default. Reservations are atomic in Firestore and send confirmations using Santo PrivateEmail. Guests can reply to request a change or a direct follow-up.
- Resend remains for existing transactional mail; production outreach uses the Santo mailbox only. The contact research workflow and source queue are documented in the production folder's README.

See `SETUP_GUIDE.md` for the complete setup and verification workflow. Configure the variables in `.env.example` for the target Vercel environment. `SITE_PASSWORD` and `SITE_UNLOCK_SECRET` are server-only; remove any prior `NEXT_PUBLIC_SITE_PASSWORD` setting from Vercel. Never commit `.env.local`.

## Deployment

The site is optimized for deployment on Vercel. For detailed deployment options, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

---

Built with ❤️ using [Next.js](https://nextjs.org)
