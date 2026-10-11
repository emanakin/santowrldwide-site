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
- Each outbound draft needs review, an explicit owner send action, a contact-specific outreach record, a working Santo SMTP mailbox, a sender postal address, and an approved public portfolio. The owner can approve or pause the published portfolio in Email setup; this decision is stored in `production_settings/outreach` and overrides the initial `PRODUCTIONS_PORTFOLIO_READY` environment default. Approval should occur only after reviewing the public work, credits, and media rights. The dashboard can mark selected drafts ready in bulk and start a manual batch of up to 100. Send review has one outreach-basis note for the whole selection, saved with the batch and added to contacts lacking a recorded basis alongside each source, role, jurisdiction, and review time. The linked sources should be checked before sending; an address merely appearing online is insufficient for Canadian implied consent. A batch runs in bounded server windows and automatically resumes while the owner dashboard stays open. Interrupted or uncertain sends pause for inspection, never automatic retry. Drafts and sent history remain visible in the Email history tab.
- SMTP acceptance and a copy in PrivateEmail's Sent folder are tracked separately. After acceptance, the app appends a mailbox copy over IMAP (default `mail.privateemail.com:993`, using the SMTP mailbox credentials unless `IMAP_HOST`, `IMAP_PORT`, `IMAP_USER`, or `IMAP_PASSWORD` override them). The copy omits the tracking pixel so viewing your own Sent folder does not count as a recipient image request. The Email history tab shows whether the copy was saved. For older sent records, **Save copy to PrivateEmail Sent** reconstructs a copy from the stored draft and Message-ID without resending it; IMAP checks for that Message-ID before appending to avoid duplicates. If the IMAP result is uncertain, the send remains recorded as sent and the owner can inspect the Sent folder before using the manual copy action.
- Outreach batches can include a first-party 1×1 image request signal, enabled by default and switchable at send review. The Email tracking tab shows sent messages, first and last fetch times, request counts, and tracking status. On the next authenticated dashboard load, a one-time migration enables tracking and assigns tokens to existing unsent drafts; the tab also has a manual backfill button. Sent messages cannot gain a pixel retroactively. Image blocking, mail privacy proxies, and scanners make an image request unsuitable as proof of a human read. Replies and bookings remain stronger engagement signals. The visible email footer uses a brief reply-based opt-out; no copy omits the sender postal address or opt-out route.
- `/book/zeb` is an unlisted public booking page. The owner adds a Toronto start/end range in the Bookings tab; the system publishes each 20-minute opening in that range. None are published by default. Reservations are atomic in Firestore and send confirmations using Santo PrivateEmail. Guests can reply to request a change or a direct follow-up.
- Resend remains for existing transactional mail; production outreach uses the Santo mailbox only. The contact research workflow and source queue are documented in the production folder's README.

See `SETUP_GUIDE.md` for the complete setup and verification workflow. Configure the variables in `.env.example` for the target Vercel environment. `SITE_PASSWORD` and `SITE_UNLOCK_SECRET` are server-only; remove any prior `NEXT_PUBLIC_SITE_PASSWORD` setting from Vercel. Never commit `.env.local`.

## Deployment

The site is optimized for deployment on Vercel. For detailed deployment options, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

---

Built with ❤️ using [Next.js](https://nextjs.org)
