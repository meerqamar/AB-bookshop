# AB Book Shop

Production e-commerce storefront for selling books online in Pakistan with **Cash on Delivery (COD)**.

| | |
| --- | --- |
| **Repository** | [github.com/meerqamar/AB-bookshop](https://github.com/meerqamar/AB-bookshop) |
| **Production** | [ab-bookshop.vercel.app](https://ab-bookshop.vercel.app) |
| **Stack** | Next.js 16 · React 19 · Tailwind CSS · Supabase · Vercel |

---

## Table of contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Prerequisites](#prerequisites)
5. [Getting started](#getting-started)
6. [Environment variables](#environment-variables)
7. [Supabase](#supabase)
8. [Vercel deployment](#vercel-deployment)
9. [Application structure](#application-structure)
10. [Business rules](#business-rules)
11. [Security](#security)
12. [SEO](#seo)
13. [Scripts](#scripts)
14. [Operations checklist](#operations-checklist)
15. [Troubleshooting](#troubleshooting)

---

## Overview

AB Book Shop is a full-stack bookstore:

- **Customers** browse the catalog, manage a cart, check out with COD, and track orders.
- **Admins** manage products, categories, orders, users, and store settings from `/admin`.

Data, auth, and image storage run on **Supabase**. The app is hosted on **Vercel** with continuous deployment from `main`.

---

## Features

### Storefront

- Responsive catalog with search, category filter, and sort
- Featured books grid on the homepage
- Product detail pages with COD messaging
- Persistent cart (per guest / per logged-in user on the same device)
- Authenticated checkout with saved addresses
- Customer dashboard (orders, addresses, profile)
- Floating WhatsApp contact (number from admin settings)
- First-order promo code `WELCOME10` (10% off, once per account)

### Admin portal (`/admin`)

- Dashboard stats (products, orders, revenue, users)
- Product CRUD with image upload; archive when a product is tied to past orders
- Category CRUD with optional logos
- Order status management
- User list
- WhatsApp number setting for the storefront widget

### Platform

- Supabase Auth (email / password)
- Role-based access (`profiles.role`: `user` | `admin`)
- Session refresh and route protection via Next.js `proxy.js`
- SEO: metadata, sitemap, robots, Open Graph, JSON-LD

---

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  Browser / PWA  │────▶│  Next.js on Vercel   │────▶│    Supabase     │
│  Store + Admin  │◀────│  App Router + proxy  │◀────│ Auth · DB · S3  │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
```

| Concern | Implementation |
| --- | --- |
| UI / routing | Next.js App Router (`app/`) |
| Auth session | `@supabase/ssr` cookies + `proxy.js` |
| Database | Supabase Postgres (+ RLS) |
| Files | Supabase Storage bucket `product-images` |
| Cart | Browser `localStorage` (keyed by guest / user id) |
| Deploy | Vercel (GitHub → production on `main`) |

---

## Prerequisites

- Node.js **20+** (LTS recommended)
- npm **10+**
- A [Supabase](https://supabase.com) project
- A [Vercel](https://vercel.com) account (for production)
- Git

---

## Getting started

```bash
git clone https://github.com/meerqamar/AB-bookshop.git
cd AB-bookshop

npm install
cp .env.example .env
# Edit .env with your Supabase URL, anon key, and site URL

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin: create a user in Supabase Auth, set `profiles.role = 'admin'`, then visit `/admin` (or sign in on the store and follow the admin redirect).

---

## Environment variables

Copy `.env.example` → `.env` for local work. Configure the same keys in **Vercel → Project → Settings → Environment Variables** for Production (and Preview if needed).

| Variable | Required | Exposed to browser | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | Supabase anon (public) key |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Yes | Canonical origin for SEO (`https://your-domain.com`) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | **No** | Service role key — server only if used; never commit or prefix with `NEXT_PUBLIC_` |

Example `.env`:

```bash
NEXT_PUBLIC_SITE_URL=https://ab-bookshop.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

> **Never commit `.env` or real secrets.** Rotate keys if they leak.

---

## Supabase

Supabase is the production backend for **Auth**, **Postgres**, and **Storage**.

### Services in use

| Service | Usage in AB Book Shop |
| --- | --- |
| **Auth** | Customer sign-up / login; admin login; session cookies via SSR |
| **Database** | Catalog, profiles, addresses, orders, settings |
| **Storage** | Public (or policy-controlled) bucket `product-images` for covers and category logos |
| **RLS** | Enforces who can read/write rows; app uses the anon key |

### App integration

| Path | Purpose |
| --- | --- |
| `lib/supabase/client.js` | Browser client (`createBrowserClient`) |
| `lib/supabase/server.js` | Server Components / server actions (`createServerClient` + cookies) |
| `lib/supabase/middleware.js` | Refresh session; protect `/admin/*` and `/dashboard` |
| `proxy.js` | Next.js 16 entry that runs `updateSession` on matched routes |

### Core tables

| Table | Purpose |
| --- | --- |
| `profiles` | User profile; `role` = `user` \| `admin` |
| `categories` | Shop categories (`name`, `sort_order`, logo, …) |
| `products` | Books (`title`, `price`, `image`, `in_stock`, `is_featured`, …) |
| `addresses` | Delivery addresses per `user_id` |
| `orders` | COD orders (`status`, `total_price`, `address_id`, …) |
| `order_items` | Line items (`product_id`, `quantity`, `price`) |
| `settings` | Key/value store (e.g. `whatsapp_number`) |

### Roles

- **Customer** — `profiles.role = 'user'` (default on sign-up).
- **Admin** — `profiles.role = 'admin'`. Middleware and `/admin` shell require this role.

Promote an admin in the Supabase SQL editor (example):

```sql
update public.profiles
set role = 'admin'
where id = '<auth-user-uuid>';
```

### Storage

- Bucket name: `product-images`
- Used by admin product and category forms for uploads and public URLs

Ensure bucket policies allow authenticated admins to upload and the storefront to read public image URLs as designed in your project.

### Supabase dashboard checklist

1. Auth → providers: Email enabled  
2. Tables + RLS policies aligned with storefront/admin access  
3. Storage bucket `product-images` created and policies set  
4. At least one admin profile  
5. Optional: seed categories / products  

---

## Vercel deployment

Production runs on **Vercel**, connected to the GitHub repository.

### Pipeline

1. Push (or merge) to `main`.
2. Vercel builds with `next build`.
3. Deployment goes live on the project URL / custom domain.
4. `proxy.js` runs on requests to refresh Supabase cookies and enforce protected routes.

### Configure the project

1. Import [meerqamar/AB-bookshop](https://github.com/meerqamar/AB-bookshop) in Vercel (or reconnect the existing project).
2. Framework preset: **Next.js** (auto-detected).
3. Set environment variables for **Production** (see table above).
4. Set `NEXT_PUBLIC_SITE_URL` to the final public URL (Vercel domain or custom domain).
5. Deploy; confirm build logs succeed.

### Custom domain (optional)

1. Vercel → Project → Domains → add domain.  
2. Point DNS as instructed.  
3. Update `NEXT_PUBLIC_SITE_URL` to `https://your-domain.com` and redeploy.

### Preview deployments

Pull requests can get Preview URLs. Add the same env vars for the **Preview** environment if previews must talk to Supabase. Prefer a separate Supabase project for staging when possible.

---

## Application structure

```
app/
  (store)/              # Public storefront
    page.js             # Home
    shop/               # Catalog + filters
    product/[id]/       # Product detail
    cart/ · checkout/   # Cart & COD checkout
    login/ · signup/    # Auth
    dashboard/          # Customer account
    privacy/ · terms/
  admin/                # Admin portal (layout + CRUD)
  sitemap.js · robots.js · manifest.js
components/             # Navbar, Footer, CartProvider, ProductCard, …
lib/
  supabase/             # Clients + session middleware
  seo.js · utils.js · auth.js
proxy.js                # Session + route guards (Next.js 16)
```

---

## Business rules

| Rule | Behavior |
| --- | --- |
| Checkout | Requires a signed-in customer |
| Cart | Stored in `localStorage`; separate keys per guest and per user id |
| Logout | Account session ends; cart can remain for guest browsing; another login loads that user’s own cart |
| `WELCOME10` | 10% off; **first non-cancelled order only** per account |
| Product delete | Hard-delete if unused in `order_items`; otherwise archive (`in_stock = false`) to preserve order history |
| COD shipping | Flat estimate via `codFee()` in `lib/utils.js` (confirm at checkout by city messaging) |

---

## Security

- Use the **anon key** in the app; rely on **RLS** for authorization.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client or commit it.
- `/admin` and `/dashboard` are blocked without a valid session (and admin role for `/admin`).
- Keep dependencies updated (`npm audit` / Dependabot as needed).
- Restrict Supabase Auth redirect URLs to your production (and local) origins.

---

## SEO

- `NEXT_PUBLIC_SITE_URL` drives canonical URLs, sitemap, and Open Graph.
- `app/sitemap.js` / `app/robots.js` / `lib/seo.js` + JSON-LD on key pages.
- Cart, checkout, login, signup, dashboard, and admin are noindex where configured.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build locally |
| `npm run lint` | ESLint |

---

## Operations checklist

### Before go-live

- [ ] Production env vars set on Vercel  
- [ ] `NEXT_PUBLIC_SITE_URL` matches the live domain  
- [ ] Supabase Auth email templates / confirmation settings reviewed  
- [ ] RLS and Storage policies verified  
- [ ] Admin account created and tested  
- [ ] WhatsApp number set in Admin → Settings  
- [ ] Smoke test: browse → add to cart → login → checkout → order in dashboard/admin  

### After each production deploy

- [ ] Vercel build succeeded  
- [ ] Home, shop, product, login, checkout, admin load  
- [ ] Images still load from Supabase Storage  

---

## Troubleshooting

| Issue | What to check |
| --- | --- |
| Auth / blank session | `NEXT_PUBLIC_SUPABASE_*` on Vercel; Auth site URL & redirect allow-list |
| Admin redirected home | `profiles.role` must be `admin` for that user |
| Images fail to upload | Storage bucket name `product-images` and upload policies |
| Wrong SEO URLs | `NEXT_PUBLIC_SITE_URL` |
| Cart shared across accounts | Hard-refresh after deploy; carts are keyed per user (legacy `ab_cart` is migrated) |
| `WELCOME10` rejected | User already has a non-cancelled order |
| Product delete error | Product is in `order_items` — app archives instead of hard-delete |

---

## License

Private project — all rights reserved unless otherwise stated by the repository owner.
