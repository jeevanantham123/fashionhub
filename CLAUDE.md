# FashionHub — Claude Context & Rules

## Project Overview

Full-stack fashion ecommerce platform (monorepo).

- **Backend:** Node.js + Express + Prisma ORM → `backend/` (port 4000)
- **Frontend:** Next.js 14 App Router + TypeScript + Tailwind CSS → `frontend/` (port 3000)
- **Database:** PostgreSQL — `fashion_ecommerce` (local, no password)
- **State:** Zustand (auth, cart, theme stores)

## Dev Credentials

| Purpose | Value |
|---------|-------|
| Admin login | `admin@fashion.com` / `admin123` |
| Customer login | `user@example.com` / `user123` |
| DB name | `fashion_ecommerce` |
| DB user | `jeevanantham.d` (local macOS user) |
| Backend URL | `http://localhost:4000/api` |
| Frontend URL | `http://localhost:3000` |

## Start Commands

```bash
# Terminal 1 — Backend
cd ecommerce-fashion/backend && npm run dev

# Terminal 2 — Frontend
cd ecommerce-fashion/frontend && npm run dev
```

## Key Architecture Decisions

- **Theme system:** `ThemeSetting` DB rows → `/api/theme` → `themeStore.ts` → CSS variables on `document.documentElement` → Tailwind picks up `var(--primary)` etc.
- **Guest cart:** `sessionId` in localStorage → `x-session-id` header → `/api/cart/merge` on login
- **Auth:** JWT in Zustand `authStore`, axios interceptor attaches `Authorization: Bearer` on every request
- **Image uploads:** Cloudinary SDK (memory storage → stream upload) → returns CDN URL stored in DB
- **Admin guard:** `authenticate` + `requireAdmin` middleware on all `/api/admin/*` routes
- **Next.js Suspense:** Pages using `useSearchParams` are wrapped in `<Suspense>` (Products, Search, Login pages)
- **Rate limiting:** 100 req/15min (all API), 10 req/15min (auth routes) via `express-rate-limit`
- **CORS:** `ALLOWED_ORIGINS` env var — defaults to `localhost:3000` in dev, Vercel URL in prod

## File Map (Key Files)

| File | Purpose |
|------|---------|
| `backend/prisma/schema.prisma` | All DB models |
| `backend/prisma/seed.ts` | Seed data (users, products, coupons, theme) |
| `backend/src/app.ts` | Express app + route mounts |
| `backend/src/middleware/auth.ts` | authenticate / requireAdmin |
| `frontend/src/lib/api.ts` | All API calls (axios instance + grouped functions) |
| `frontend/src/store/` | authStore, cartStore, themeStore |
| `frontend/src/app/admin/theme/page.tsx` | Theme customizer + homepage sections editor |
| `frontend/src/components/Providers.tsx` | Bootstraps auth, cart, theme on app load |

## Rules for Claude

- **Never change the DB schema** without running a new Prisma migration
- **Never touch `seed.ts`** unless explicitly asked — re-seeding drops existing data
- **Keep CSS variables** for theming — do not hardcode colors in components
- **Use existing API functions** in `api.ts` before creating new ones
- **Admin pages** go under `frontend/src/app/admin/`; use the existing `AdminSidebar` component
- **Always add `'use client'`** to any component that uses hooks, browser APIs, or event handlers
- **Branching:** `feat/*` for new features, `fix/*` for bugs — never commit directly to `main`
- **Commit style:** `feat:`, `fix:`, `chore:`, `docs:` prefixes

## Production URLs

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://dreamweaver-fashionhub.vercel.app |
| Backend (Render) | https://fashionhub-z16x.onrender.com |
| API Health | https://fashionhub-z16x.onrender.com/api/health |

## Current Status

| Version | Status | Notes |
|---------|--------|-------|
| v1 | Live (local) | All core features complete |
| v2 | Deployed ✓ | Cloudinary · rate limiting · CORS · Neon DB · Render · Vercel |
| v2 next | Pending | Stripe test checkout · Resend email · UX improvements |
