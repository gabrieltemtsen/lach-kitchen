# Lach Eat & Smile Kitchen — Online Ordering

A complete online-ordering web app for **Lach Eat & Smile Kitchen** (Lekki Phase 1, Lagos), plus print/social marketing assets.

## What's in this folder

| Folder | What it is |
|---|---|
| `app/` | The web app — Next.js + Convex + Tailwind |
| `marketing/` | QR flyer, Instagram/story banners, 2 ad designs + generator script |
| `media/` | Your original photos & videos (untouched) |

## How the app works

**Customers:** browse the menu (photos + videos of each dish) → add to cart → checkout with name/phone/address → see your bank details → transfer → upload the payment receipt → track their order live on the order page (it updates in real time when you confirm).

**You (admin):** every new order and every uploaded receipt lands in your **Telegram** with a direct link. Open `/admin`, view the receipt, and hit **Confirm**, **Reject**, or **Delivered**. You can also edit prices, add/remove dishes, toggle availability, and change your bank details — no code needed.

## First-time setup (~10 minutes)

### 1. Install & run

```bash
cd app
npm install
npx convex dev        # creates your free Convex project, keep it running
# in a second terminal:
npm run dev           # site at http://localhost:3000
```

`npx convex dev` will ask you to log in (free account) and writes `NEXT_PUBLIC_CONVEX_URL` into `.env.local` automatically.

### 2. Set the admin password

```bash
npx convex env set ADMIN_PASSWORD your-secret-password
```

Then open http://localhost:3000/admin, log in, and click **"Load starter menu"** — this seeds Efo Riro, Akara, Masa & Mosa with dummy prices you can edit, plus default settings. **Go to the Settings tab and enter your real bank account details.**

### 3. Telegram notifications (2 minutes)

1. In Telegram, message **@BotFather** → `/newbot` → pick a name → copy the **token**.
2. Message your new bot anything (press Start).
3. Get your chat id: open `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser and copy `"chat":{"id":...}`.
4. Set the env vars:

```bash
npx convex env set TELEGRAM_BOT_TOKEN 123456:ABC-your-token
npx convex env set TELEGRAM_CHAT_ID 123456789
npx convex env set SITE_URL http://localhost:3000   # update after deploying
```

Place a test order — you'll get a Telegram message with the order + a link straight to it in the admin dashboard.

> Tip: for a shared kitchen team, add the bot to a Telegram **group** and use the group's chat id (negative number) so everyone gets order alerts.

### 4. Deploy (free)

The easiest path is [Vercel](https://vercel.com):

```bash
npx convex deploy     # creates the production Convex deployment
```

Then import the `app/` folder into Vercel (or run `npx vercel`), set `NEXT_PUBLIC_CONVEX_URL` to your **production** Convex URL, and re-set the four env vars on the production deployment (`npx convex env set --prod ...`), with `SITE_URL` now your real domain.

### 5. Regenerate the QR code for your real domain

The marketing assets currently point to a placeholder URL. Once deployed:

```bash
cd marketing
pip install qrcode pillow
python3 generate_assets.py https://your-real-domain.com
```

All five assets are regenerated with the correct QR code and URL.

## Marketing assets

- `qr-flyer-a5.png` — print-ready A5 flyer (300 dpi) for packaging, tables, storefront
- `banner-instagram-1080.png` — "We're now online!" announcement post
- `banner-story-1080x1920.png` — WhatsApp status / IG story with scannable QR
- `ad-efo-riro-1080.png` — promo ad (square, feed)
- `ad-akara-1080x1350.png` — promo ad (portrait, feed)

## Admin cheat-sheet

- `/admin` → **Orders**: filter by status, tap an order, view receipt, Confirm / Reject / Delivered, WhatsApp the customer in one tap
- `/admin` → **Menu**: change prices inline (₦ field + Save), toggle availability, add new dishes (point image/video at `/media/...` files or any URL)
- `/admin` → **Settings**: bank details, phone, WhatsApp, address, delivery note

Customer order pages update **live** — the moment you press Confirm, their screen flips to "we're cooking!".
