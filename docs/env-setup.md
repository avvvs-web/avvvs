# Environment variables: what to add, and where

All of these go in **Vercel → the `avvvs` project → Settings → Environment Variables**.
Tick **Production** (and **Preview** too, unless a row says otherwise), then **redeploy**
(Deployments → latest → ⋯ → Redeploy). Changes don't apply until the next deploy, and every
`NEXT_PUBLIC_…` value is baked in at build time.

For local development, put the same names in `web/.env.local` (copy `web/.env.example`).
Never commit `.env.local`: the repo is public.

---

## 1. Needed for the site to work fully

### Enquiry form (the "Work With Us" / "Discuss manufacturing" form)

Without these, the form shows an error in production and **no enquiry reaches you**.

| Name | Example | Where to get it |
|---|---|---|
| `SMTP_HOST` | `smtp.gmail.com` / `smtp.zoho.in` / `smtp.office365.com` | Your email provider's SMTP settings |
| `SMTP_PORT` | `587` | Usually 587. Use 465 if the provider says "SSL" |
| `SMTP_SECURE` | *(leave empty)* | `true` only when the port is 465 |
| `SMTP_USER` | `website@avvvs.com` | The mailbox that sends the mail |
| `SMTP_PASS` | *(secret)* | That mailbox's **app password** (Google/Microsoft: create one under the account's security settings; your normal password won't work with 2-step sign-in on) |
| `MAIL_FROM` | `website@avvvs.com` | The "From" address. Must be the SMTP user or an alias it is allowed to send as |
| `MAIL_TO` | `mail@avvvs.com` | Where enquiries arrive. If empty, it uses the contact email on the site |
| `SEND_ACK` | `false` | `true` also sends the enquirer a short "we have your enquiry" email |

### Journal admin (`/admin`)

| Name | Where to get it |
|---|---|
| `DATABASE_URL` | **Set automatically.** Vercel → project → **Storage → Create → Neon (Postgres)** → connect it to this project. Tables create themselves on first use |
| `BLOB_READ_WRITE_TOKEN` | **Set automatically.** Vercel → project → **Storage → Create → Blob** → connect it to this project. Holds images uploaded in the editor |
| `ADMIN_SETUP_KEY` | **You make it up.** Any long random phrase, 16+ characters. Used once at `/admin/setup` to create the first admin account. Keep it private |

After the redeploy: open `/admin/setup`, enter the setup key, create your account, and add the
other writers from **Users** inside the admin.

---

## 2. When the real domain goes live

| Name | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://avvvs.com` | Set it only once avvvs.com points to this Vercel site. Until then leave it **unset**: the site uses the Vercel production domain by itself. Production only, not Preview. Drives canonical links, hreflang, sitemap, robots, share cards and structured data |

---

## 3. Optional: analytics and verification

Each one only switches on when it has a value, and the trackers load only after a visitor accepts
cookies. Production only is fine.

| Name | Example | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` | Google Analytics → Admin → Data streams → your web stream → Measurement ID |
| `NEXT_PUBLIC_META_PIXEL_ID` | `1234567890` | Meta Events Manager → Data sources → your pixel's ID |
| `NEXT_PUBLIC_GSC_VERIFICATION` | `abc123…` | Google Search Console → Add property → **HTML tag** method → copy only the `content="…"` value |
| `NEXT_PUBLIC_META_DOMAIN_VERIFICATION` | `xyz789…` | Meta Business Settings → Brand safety → Domains → **Meta-tag** method → the `content` value |

---

## Do not add these

Vercel sets them itself, and the site reads them automatically:
`VERCEL_ENV`, `VERCEL_PROJECT_PRODUCTION_URL`, `NODE_ENV`, `NEXT_PUBLIC_DEPLOY_ENV`.

(`NEXT_PUBLIC_DEPLOY_ENV` is derived from `VERCEL_ENV` so preview links stay out of Google.)

---

## Checklist

- [ ] SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `MAIL_TO`
- [ ] Storage → Neon connected (`DATABASE_URL` appears)
- [ ] Storage → Blob connected (`BLOB_READ_WRITE_TOKEN` appears)
- [ ] `ADMIN_SETUP_KEY` added
- [ ] Redeployed
- [ ] Sent a test enquiry and it arrived
- [ ] Created the first admin at `/admin/setup`
- [ ] *(later)* `NEXT_PUBLIC_SITE_URL` once the domain is moved
- [ ] *(optional)* GA, Meta Pixel, Search Console, Meta domain verification
