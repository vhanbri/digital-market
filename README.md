# AniKo

**Cebu's farm-to-city digital produce marketplace**

AniKo is a digital commerce platform that sources fresh produce directly from Cebu farmers and sells it to buyers in Cebu city markets — restaurants, grocery stores, and individual consumers. The platform handles curation, pricing, and order management, acting as the trusted bridge between local farms and urban buyers.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, Row Level Security) |
| Auth | Supabase Auth (email/password) |
| Data Access | `@supabase/supabase-js`, `@supabase/ssr` |

## Architecture

```
Browser → Next.js Frontend → Supabase Client
                                    ↓
                              ┌───────────┐
                              │  Supabase  │
                              │  Auth      │
                              │  Postgres  │
                              │  RLS + RPC │
                              └───────────┘
```

The frontend calls Supabase directly — no custom backend server. Authorization is enforced at the database level via Row Level Security policies, and transactional operations (order placement, stock management) run as PostgreSQL functions.

## Project Structure

```
├── frontend/
│   ├── pages/            # Next.js pages (Pages Router)
│   ├── components/       # UI components
│   ├── hooks/            # useAuth, useCart, useCrops, useOrders
│   ├── services/         # Supabase query services
│   ├── lib/              # Supabase client init
│   ├── utils/supabase/   # Client, server, and middleware helpers
│   ├── layouts/          # Page layouts
│   ├── types/            # TypeScript definitions
│   └── styles/           # Tailwind globals + brand tokens
├── database/
│   ├── supabase_migration.sql   # Schema, RLS policies, triggers
│   ├── supabase_functions.sql   # DB functions (place_order, etc.)
│   └── supabase_seed.sql        # Seed data
├── docs/
│   ├── PRD.md            # Product requirements
│   ├── TECH_ARCHI.md     # Technical architecture
│   ├── AI_RULES.md       # Development conventions
│   └── MOBILE_APP_PLAN.md
└── shared/               # Shared TypeScript types
```

## Features

### Buyer
- Browse the marketplace and view produce details
- Add items to cart (client-side, localStorage)
- Place orders with automatic stock validation
- View order history and status

### Admin
- Manage produce listings (create, edit, delete)
- Manage all orders and update statuses
- View all registered users
- Platform statistics dashboard

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone https://github.com/vhanbri/digital-market.git
cd digital-market/frontend
npm install
```

### 2. Set up Supabase

Run the following SQL files in your Supabase SQL Editor, in order:

1. `database/supabase_migration.sql` — creates tables, enums, triggers, and RLS policies
2. `database/supabase_functions.sql` — creates `place_order` and `admin_update_order_status` functions
3. `database/supabase_seed.sql` — seeds sample crop data (after creating users)

### 3. Create test users

In the Supabase Dashboard under **Authentication > Users**, create:

| Email | Password | Role |
|-------|----------|------|
| `admin@aniko.ph` | `admin123` | Admin (update via SQL after creation) |
| `ana@buyer.com` | `buyer123` | Buyer |

Then promote the admin:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@aniko.ph';
```

### 4. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-key
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Schema

```
profiles (auth.users)
  ├──< crops      (farmer_id → profiles.id)
  └──< orders     (buyer_id → profiles.id)
            └──< order_items
```

All tables have Row Level Security enabled. Access rules:

| Table | Public Read | Write |
|-------|------------|-------|
| profiles | No (own profile only; admin reads all) | Own profile |
| crops | Yes | Admin only |
| orders | Own orders; admin reads all | Buyer creates; admin updates |
| order_items | Linked to order ownership | Via `place_order` function |

## License

This project is for educational and demonstration purposes.
