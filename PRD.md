# Product Requirements Document
## FashionHub — Full-Stack Fashion Ecommerce Platform

**Version:** 1.0 → 2.0
**Date:** 2026-03-04
**Stack:** Next.js 14 · Node.js + Express · PostgreSQL · Prisma · TypeScript

---

## 1. Overview

FashionHub is a complete fashion ecommerce platform that runs entirely on localhost. It provides a rich customer shopping experience alongside a powerful admin dashboard with real-time theme customization.

---

## 2. Goals

- Allow customers to browse, search, filter, and purchase fashion items
- Provide a secure, JWT-based authentication system
- Give admins full control over products, categories, orders, users, coupons, and storefront appearance
- Enable live theme customization (colors, fonts, homepage sections) from the admin panel without any code changes

---

## 3. Users & Roles

| Role  | Access |
|-------|--------|
| Guest | Browse, search, view products, add to cart (local) |
| User  | All guest actions + checkout, orders, wishlist, reviews, profile |
| Admin | All user actions + full admin dashboard |

---

## 4. Functional Requirements

### 4.1 Customer Features

#### Authentication
- Register with name, email, password
- Login with email and password (JWT issued)
- Persistent session via localStorage token
- Profile management (name, password change)

#### Home Page
- Dynamic sections loaded from database (configurable from admin):
  - Hero banner (title, subtitle, CTA button, background image)
  - Featured products carousel
  - Category grid (icons + links)
  - Promotional banner (text + image + CTA)
  - Newsletter signup
- Sections can be reordered, hidden, or edited from admin

#### Product Catalog
- Grid view of all products with pagination (12/24/48 per page)
- Filters: category, price range (slider), size, color, in-stock only
- Sort: newest, price low-to-high, price high-to-low, top-rated
- Product card: image, name, price (with compare-at strikethrough), rating stars, quick-add wishlist

#### Product Detail
- Image gallery (multiple images, click to zoom)
- Size + color variant picker with stock status per variant
- Quantity selector
- Add to Cart / Add to Wishlist buttons
- Product description tabs (Details, Size Guide, Reviews)
- Customer reviews with star rating and comments
- Related products section

#### Search
- Search bar in navbar with real-time autocomplete (product names)
- Full search results page with same filters as catalog

#### Cart
- Slide-over cart drawer (accessible from any page)
- Persist cart in DB for logged-in users, localStorage for guests
- Merge guest cart on login
- Update quantity, remove items
- Display subtotal, no shipping/tax until checkout

#### Wishlist
- Add/remove products from wishlist
- View wishlist page
- Move individual item to cart
- Requires login

#### Checkout
- Multi-step flow:
  1. **Shipping** — select saved address or add new
  2. **Coupon** — apply discount code
  3. **Review** — order summary (items, subtotal, discount, total)
  4. **Confirm** — place order (mock payment, always succeeds)
- After order placement: order confirmation page with order ID

#### Orders
- Order history list (date, status badge, total)
- Order detail: items, shipping address, applied coupon, timeline of status changes

### 4.2 Admin Features

#### Dashboard Overview
- KPI cards: Total Revenue (all-time), Orders Today, Active Users, Low-stock items
- Revenue chart (last 30 days, daily breakdown)
- Recent orders table (last 10)
- Top 5 selling products

#### Product Management
- List all products (paginated, searchable)
- Create/edit product:
  - Name, slug (auto-generated), description (rich text)
  - Price, compare-at price
  - Category assignment
  - Tags (comma-separated)
  - Upload multiple images (stored locally under `/backend/src/uploads/`)
  - Featured toggle, active/inactive toggle
  - Variants (size + color + stock + SKU per row; add/remove rows)
- Delete product (soft delete)

#### Category Management
- Create/edit/delete categories
- Nested categories (parent → child)
- Upload category image

#### Order Management
- All orders list with filters (status: PENDING / PROCESSING / SHIPPED / DELIVERED / CANCELLED)
- Update order status
- View order detail (customer info, items, address, total)

#### User Management
- List all users
- View user profile (orders, addresses)
- Promote/demote role (USER ↔ ADMIN)

#### Coupon Management
- Create coupons: code, type (percent or fixed), value, min order amount, max uses, expiry date
- List coupons with used/remaining count
- Delete coupon

#### Inventory Management
- Table of all product variants with stock counts
- Highlight variants with stock ≤ 5 (low-stock warning)
- Inline edit stock quantity

#### Theme Customizer
- **Colors panel:**
  - Primary color (buttons, links, highlights)
  - Secondary color (badges, accents)
  - Background color (page background)
  - Text color (body text)
  - Accent color (hover states, borders)
- **Typography panel:**
  - Heading font (select from Google Fonts: Playfair Display, Cormorant, Raleway, Montserrat, Lora)
  - Body font (select from Google Fonts: Inter, Poppins, DM Sans, Nunito, Open Sans)
- **General:**
  - Logo text
  - Store tagline
- **Live preview** — changes reflect immediately on a preview panel before saving
- **Save** — writes to DB; all frontend pages pick up new theme on next load

#### Homepage Sections Editor
- List of all sections with order, type, and visibility toggle
- Drag-and-drop reorder
- Edit each section:
  - Hero: title, subtitle, CTA label, CTA link, background image upload
  - Featured Products: title, product IDs to feature (multiselect)
  - Category Grid: title, which categories to show
  - Promo Banner: title, subtitle, image, CTA label, CTA link, background color
  - Newsletter: title, subtitle, placeholder text
- Add new section (choose type)
- Delete section

---

## 5. Non-Functional Requirements

- Runs 100% on localhost — no external services required
- Images stored on local filesystem (backend `/uploads/` dir)
- Passwords hashed with bcrypt (salt rounds 10)
- All admin routes protected by JWT + admin role middleware
- Responsive design (mobile-first Tailwind CSS)
- TypeScript end-to-end (frontend + backend)

---

## 6. Tech Stack

| Component | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| State | Zustand |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| File uploads | Multer |
| Validation | Zod |

---

## 7. Data Models Summary

See `backend/prisma/schema.prisma` for the full schema.

Core entities: User, Address, Category, Product, ProductVariant, Order, OrderItem, Cart, CartItem, Wishlist, WishlistItem, Review, Coupon, ThemeSetting, HomeSection

---

## 8. Default Credentials (Seed Data)

| Email | Password | Role |
|---|---|---|
| admin@fashion.com | admin123 | ADMIN |
| staff@fashion.com | staff123 | ADMIN |
| user@example.com | user123 | USER |

**Default Coupons:**
- `SAVE10` — 10% off, no minimum
- `FLAT20` — $20 off, minimum $100
- `WELCOME15` — 15% off (new users)
- `VIP50` — 50% off, minimum $200

---

## 9. Local Setup

See `README.md` for step-by-step setup instructions.

---

## 10. V2 Plan — Free Tier

> All services below have a **free tier** — no paid plans needed.

### 10.1 Free Tier Deployment Stack

| Layer | Service | Free Tier Limits |
|-------|---------|-----------------|
| Frontend | Vercel | Unlimited deploys, 100GB bandwidth/mo |
| Backend | Render | 750 hrs/mo (1 service free), spins down after inactivity |
| Database | Neon (PostgreSQL) | 0.5GB storage, 1 project |
| Images | Cloudinary | 25GB storage, 25GB bandwidth/mo |
| Email | Resend | 3,000 emails/mo, 1 custom domain |
| Payments | Stripe (test mode) | Free forever — no real charges |

---

### 10.2 Feature Changes

#### A. Image Uploads → Cloudinary
- Replace Multer local storage with Cloudinary SDK
- Upload images directly from admin → get back a CDN URL
- Store Cloudinary URL in DB instead of local path
- Remove `backend/src/uploads/` directory dependency
- **New env vars:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

#### B. Email Notifications (Resend)
- Order placed → confirmation email to customer (order ID, items, total)
- Order status changed → status update email (shipped/delivered)
- Welcome email on registration
- Use **Resend** SDK (`resend` npm package) with React Email templates
- **New env var:** `RESEND_API_KEY`

#### C. Stripe Checkout (Test Mode)
- Replace mock "always succeeds" checkout with Stripe Payment Intent
- Frontend: Stripe Elements (card input component)
- Backend: create `PaymentIntent` → confirm on frontend → webhook updates order status
- Test card: `4242 4242 4242 4242`
- **New env vars:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

#### D. Rate Limiting
- `express-rate-limit` on all API routes (100 req/15min per IP)
- Stricter limit on auth routes (10 req/15min)

#### E. Production CORS
- Read `ALLOWED_ORIGINS` from env — whitelist Vercel frontend URL only
- Remove wildcard `*` CORS from v1

---

### 10.3 UX Improvements

| Feature | Details |
|---------|---------|
| Skeleton loaders | Product grid, product detail, orders list |
| Mobile nav drawer | Hamburger menu → slide-in sidebar on mobile |
| Toast on wishlist | "Added to wishlist" / "Removed" feedback |
| Empty states | Illustrated empty state for cart, wishlist, orders |
| Image zoom | Click-to-zoom on product detail gallery |
| Infinite scroll | Optional toggle vs pagination on product catalog |

---

### 10.4 Admin Improvements

| Feature | Details |
|---------|---------|
| Revenue by category chart | Bar chart breakdown in dashboard |
| Order export | Download orders as CSV |
| Bulk product status | Select multiple → activate/deactivate |
| Email preview | Preview order confirmation email template from admin |

---

### 10.5 Schema Changes for V2

New fields/models needed:

```prisma
// Order — add payment fields
model Order {
  stripePaymentIntentId  String?
  paymentStatus          String   @default("PENDING") // PENDING | PAID | FAILED
}

// New model for email logs (optional)
model EmailLog {
  id        String   @id @default(cuid())
  to        String
  subject   String
  type      String   // ORDER_CONFIRM | STATUS_UPDATE | WELCOME
  sentAt    DateTime @default(now())
  orderId   String?
}
```

---

### 10.6 V2 Environment Variables

```env
# Existing
DATABASE_URL=
JWT_SECRET=

# New in V2
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RESEND_API_KEY=
EMAIL_FROM=noreply@yourdomain.com

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

---

### 10.7 V2 Implementation Order

1. **Cloudinary** — unblocks real image hosting, needed before deploy
2. **Rate limiting + production CORS** — security baseline
3. **Deploy** — Neon DB → Render backend → Vercel frontend
4. **Stripe test mode** — checkout becomes real
5. **Email (Resend)** — order confirmations
6. **UX improvements** — skeletons, mobile nav, empty states
7. **Admin improvements** — CSV export, bulk actions
