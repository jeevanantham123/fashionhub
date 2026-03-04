# FashionHub — Local Ecommerce Platform

Full-stack fashion ecommerce built with Next.js 14 + Node.js/Express + PostgreSQL.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally
- npm or yarn

## Quick Start

### 1. Database Setup

Create a PostgreSQL database:
```bash
psql -U postgres -c "CREATE DATABASE fashion_ecommerce;"
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env if your PostgreSQL credentials differ from defaults

# Run migrations and seed data
npx prisma migrate dev --name init
npx prisma db seed

# Start the backend (port 4000)
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start the frontend (port 3000)
npm run dev
```

### 4. Open in Browser

- **Store:** http://localhost:3000
- **Admin:** http://localhost:3000/admin

## Default Credentials

### App Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@fashion.com | admin123 | Admin |
| staff@fashion.com | staff123 | Admin |
| user@example.com | user123 | Customer |

### Database

| Field | Value |
|-------|-------|
| Host | localhost |
| Port | 5432 |
| Database | fashion_ecommerce |
| User | _(your macOS username, e.g. `jeevanantham.d`)_ |
| Password | _(none by default on local Postgres)_ |

> Full connection string in `backend/.env` → `DATABASE_URL`

## Default Coupons

| Code | Discount | Min Order |
|------|----------|-----------|
| SAVE10 | 10% off | None |
| FLAT20 | $20 off | $100 |
| WELCOME15 | 15% off | None |
| VIP50 | 50% off | $200 |

## Features

### Customer
- Browse products with advanced filters (category, price, size, color)
- Full-text search with autocomplete
- Product variants (size + color) with per-variant stock
- Persistent cart (DB for logged-in, localStorage for guests)
- Wishlist management
- Multi-step checkout (address → coupon → review → confirm)
- Order history and status tracking
- Product reviews and ratings
- Profile management

### Admin (`/admin`)
- Dashboard KPIs and revenue charts
- Product CRUD with image upload and variant management
- Category management (nested)
- Order management with status updates
- User management and role control
- Coupon management
- Inventory with low-stock alerts
- **Theme Customizer** — live preview for colors, fonts
- **Homepage Sections Editor** — add/remove/reorder/edit sections drag-and-drop

## Project Structure

```
ecommerce-fashion/
├── PRD.md
├── README.md
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── uploads/
│   │   └── app.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── hooks/
    │   ├── lib/
    │   ├── store/
    │   └── types/
    ├── package.json
    └── tsconfig.json
```

## API Base URL

Backend runs at `http://localhost:4000/api`
