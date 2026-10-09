# Santo foundation audit

Checked October 9, 2026. This records what the repository needs and what could be verified in this workspace. It contains no account passwords or API keys.

| Service | Existing use | Status for this work |
| --- | --- | --- |
| Firebase | Client authentication, Admin authorization, Firestore users/newsletter | Owner dashboard uses the existing super admin guard and new `production_contacts` / `production_drafts` collections. Local Firebase client/Admin values are absent, so authenticated browser and database tests are pending. |
| Shopify | Storefront API and customer records | Existing code remains wired, but Storefront credentials are absent locally. The supplied login reached Shopify's six-digit email verification step, so admin settings could not be read. No production feature depends on Shopify. |
| PrivateEmail | Santo mailbox | SMTP host, port, mailbox username, and From identity are in ignored `.env.local`; the supplied mailbox password failed authentication and was removed. A working SMTP/app password and test recipient delivery are pending. |
| Resend | Existing transactional mail | Account login succeeded. One existing sending API key is visible only in masked form and cannot be copied from the key detail page. The domain was **Failed**; a fresh verification was started and is **Pending**. Public DNS currently has the requested DKIM TXT and `send` SPF TXT, but lacks the `send` MX record. Outreach code does not use Resend; transactional delivery was not tested. |
| Twilio | Existing SMS notifications | Existing integration has no locally configured credential; SMS was not changed or tested. |
| Cloudflare R2 | Existing asset storage | R2 configuration and public base support already exist. No new video was uploaded because selected works, credits, and publishing approval are pending. |
| Newsletter | `newsletter_subscribers` Firestore collection | Existing subscribe/unsubscribe paths were identified. Converting subscribers into authenticated users requires a separate consent and migration design; no bulk conversion was performed. |
| Vercel | Site hosting | Vercel environment access was unavailable from this workspace, so settings were not changed. Set the variables from `.env.example` before deployment, including server-only `SITE_PASSWORD` and `SITE_UNLOCK_SECRET`; delete any old `NEXT_PUBLIC_SITE_PASSWORD` setting. |
| Figma | Design reference | The connected Figma account returned a file-access denial. The Productions page uses neutral foundation styling and an empty approved-work manifest. |

## Deployment gates

1. Provide and verify Firebase client/Admin configuration and the required existing storefront settings in the target environment.
2. Add a valid Santo mailbox SMTP credential and sender postal address. Test delivery to a controlled recipient before any outreach.
3. Add selected media, exact credits, and explicit publishing approval; then set `PRODUCTIONS_PORTFOLIO_READY=true` after the public portfolio is published.
4. Review and qualify each contact's source, fit, and legal basis before making a draft ready. Keep suppression records when updating the CSV.

Resend's missing DNS item is an MX record at host `send` with priority `10` and target `feedback-smtp.us-east-1.amazonses.com`. The domain uses Namecheap nameservers. Adding this record would enable Resend's bounce handling for the sending subdomain; review the current Namecheap DNS zone and Resend's refreshed status before changing it. The primary PrivateEmail MX records should remain intact.

`npx tsc --noEmit` passes. A Next production build under Node 22 also completes when placeholder Firebase client values are supplied; it logs expected Firebase Admin and Shopify warnings because their real credentials are absent. `/productions` rendered in the browser at desktop and 390px mobile widths. Authenticated dashboard/database checks still require valid configuration. The local default Node 26 triggers a Next/Firebase runtime error in this repository.

The signed site-unlock flow was checked locally with disposable test values: an unauthenticated visit redirected to `/locked`, the API set a signed cookie for the correct password, the signed cookie opened `/productions`, and a forged `site_unlocked=true` cookie remained locked.
