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
NEXT_PUBLIC_SITE_PASSWORD=
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

## Deployment

The site is optimized for deployment on Vercel. For detailed deployment options, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

---

Built with ❤️ using [Next.js](https://nextjs.org)
