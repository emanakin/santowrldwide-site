# Santo Productions setup and operating guide

## 1. Public portfolio

- The public page is `/productions`. Its studio layout is separate from the storefront navigation and background; the bottom project bar remains.
- Media uses the existing `santowrldwide-assets` R2 bucket. `PRODUCTION_MEDIA.md` lists the exact uploaded root keys. Change `src/lib/production/portfolioMedia.ts` if a key changes, or `src/lib/media.ts` if the public base changes. The portrait and two poster images are in `public/production/`.
- Confirm publication rights, exact credits, and the artist/Spotify link for **Stop This**. Add a dated, linked Spotify number only after checking the official artist or track page. Do not invent a reach figure or claim the film caused the plays.
- The `.mov` sources may fail in browsers that lack their codecs. Check all three V2 players in the target browsers and replace them with H.264/AAC `.mp4` objects in R2 if needed.

## 2. Local environment and deployment

- Install dependencies with `npm ci`, then run `npm run dev`. Open `http://localhost:3000/productions`.
- Copy `.env.example` settings into ignored `.env.local`. Supply existing Firebase client/Admin configuration and the variables needed by other site features. Add secret values only to `.env.local` and Vercel environment settings, never source files or this guide.
- In Vercel, set `SITE_PASSWORD` and `SITE_UNLOCK_SECRET` as server-only values, and remove any earlier `NEXT_PUBLIC_SITE_PASSWORD`. `/productions` is exempt from the site lock; `/account/production/settings` still requires a signed-in super admin.
- Set `SANTO_SITE_URL` to the deployed HTTPS origin so optional image-request links resolve. This signal does not prove a person read the email. Leave `PRODUCTIONS_PORTFOLIO_READY=false` until work, credits, and outreach positioning are approved.
- Existing Shopify, Resend, Twilio, Firebase, and R2 account gaps are tracked in `FOUNDATION_AUDIT.md`. Resend continues to serve the site's existing transactional messages; this outreach feature uses the Santo mailbox.

## 3. Admin access and contact data

- Sign in with a Firebase account that passes `useSuperAdminGuard` and open `/account/production/settings`. The server APIs also verify super admin access; hiding the page alone is not the security boundary.
- Press **Preload 271 researched contacts** to add the bundled seed once. The research master is `../santoworld-production-portfolio/contacts.csv`. You can import a newer CSV from the dashboard. Import skips duplicates and reports row errors. Export the live Firestore list from the dashboard after edits.
- Firestore collections: `production_contacts` and `production_drafts`. Each contact carries city, company/category/scale, professional email or contact route, source URL and check date, fit note, status, and a separate consent basis. The company link uses `websiteUrl` when set and otherwise the source URL. Agency rows show stage, last sent date, and optional email image-request status.
- Keep suppressed contacts in Firestore so a later import does not restore them to the send queue. Recheck routes and source dates before qualifying a research row. The scripts and research method are documented in the production folder README.

## 4. PrivateEmail sending

- In the open PrivateEmail account, go to **Settings → Connect third-party apps → View configuration**. The current SMTP panel lists `mail.privateemail.com`, port `465` (SSL) or `587`; this application is configured for port `465`. The mailbox username is `support@santowrldwide.com`, and `SMTP_FROM` can be `SANTOWRLDWIDE <support@santowrldwide.com>`.
- For `SMTP_PASSWORD`, go to **Settings → Security Center → App Passwords → Create new password**, name it for the Santo website, and copy the generated value into the ignored `.env.local` and the corresponding Vercel server environment variable. The current account has an existing app-password entry, but its value is not shown on the list. Do not reuse or expose the main sign-in password. Enter Santo's valid mailing address as `SANTO_POSTAL_ADDRESS`.
- The dashboard's **Email setup** panel shows whether SMTP settings, the postal address, and the portfolio approval flag are configured. **Check SMTP connection** verifies the mailbox login without sending an email. Vercel environment changes require a fresh deployment before the dashboard sees them.
- Review Canadian CASL and US CAN-SPAM requirements for each recipient and record the applicable basis in `consentBasis`. A public email address alone is not consent. The email footer supplies the sender address and reply-to unsubscribe instruction; remove and suppress opt-outs promptly.
- Create one draft for an eligible email contact, replace the bracketed personalization prompt, review subject/body, optionally disable image-request tracking, and mark it **ready**. Saving changes preserves its review status. The Agency pipeline can select ready drafts; batches remain blocked until every selected contact has a recorded basis and the other send requirements pass. Sending requires explicit confirmation. A contact with no basis, a suppression, or a portfolio-ready flag that is false cannot send.
- Sent means the SMTP server accepted the message. An uncertain SMTP response becomes `send_unknown` and must be investigated before any further attempt. An image request means the tracking pixel URL was requested; mail clients or privacy proxies may preload or block it, so it is **not proof a person viewed the email**. Tracking only applies to HTML messages with the checkbox enabled.
- Send a single test to an address you control after mailbox and production URL setup. Verify delivery, reply-to, footer, optional image-load update, and suppression. Do not start a campaign until this check passes.

## Booking availability

- In **Bookings**, enter a start and end on the same Toronto date. The range must start on :00, :20, or :40 and contain complete 20-minute blocks, up to eight hours. Every block becomes one public opening.
- A guest reserves one opening. The reservation transaction prevents a second booking of that time, and confirmations go to the guest and Santo mailbox. The studio follows up directly afterward.

## 5. Verification before launch

1. Run TypeScript and a production build; check `/productions` on desktop and mobile.
2. Play all V2, Stop This, and Capone films from the R2 URLs. Confirm stills, posters, credits, and spelling.
3. Sign in as a super admin; check import, edit, source links, filtering, CSV export, draft review, last sent, and image-load labels. Check that a non-admin cannot access the APIs.
4. Recheck the research CSV and any contact proposed for send. Verify legal basis, recipient route, unsubscribe handling, and a test delivery.
5. Set `PRODUCTIONS_PORTFOLIO_READY=true` only when the public portfolio is approved and live.

## Campus Apply separation

The Santo pipeline is implemented in this repository. Campus Apply is a separate application. Its application and password-reset email flows have not been changed while the requested removal scope is clarified; removing them without a replacement would break core functions.
