# AniKo Technical Architecture Document (TAD)

## 1. System Overview

AniKo is a digital commerce platform operated by a private sector company. The platform sources fresh produce from local farmers and sells it to city buyers such as restaurants, grocery stores, and individual consumers.

The system consists of:

- Web frontend (Next.js)
- Supabase backend (Auth, PostgreSQL, RLS, Database Functions)

Primary stack:

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, React, Tailwind CSS, TypeScript |
| Backend | Supabase (hosted PostgreSQL, Auth, RLS) |
| Auth | Supabase Auth (email/password) |
| Data Access | `@supabase/supabase-js` + `@supabase/ssr` |

## 2. High-Level Architecture

```
Client (Browser)
       |
   Next.js Frontend
       |
   Supabase Client (@supabase/ssr)
       |
  ┌────┴─────────────────────────┐
  │         Supabase             │
  │  ┌──────────────────────┐    │
  │  │   Supabase Auth      │    │
  │  └──────────────────────┘    │
  │  ┌──────────────────────┐    │
  │  │  PostgreSQL + RLS    │    │
  │  └──────────────────────┘    │
  │  ┌──────────────────────┐    │
  │  │  Database Functions  │    │
  │  │  (place_order, etc.) │    │
  │  └──────────────────────┘    │
  └──────────────────────────────┘
```

Key responsibilities:

- **Frontend** → UI rendering, user interaction, calls Supabase client
- **Supabase Auth** → user registration, login, session management
- **PostgreSQL + RLS** → data storage, access control at the row level
- **Database Functions** → transactional operations (order placement, status updates)

## 3. Project Structure

```
aniko/
  frontend/
    lib/              # Supabase client
    components/       # UI components
    pages/            # Next.js pages
    hooks/            # React hooks (useAuth, useCart)
    services/         # Data access services
    types/            # TypeScript type definitions
    layouts/          # Page layouts
    constants/        # Navigation links, etc.
    styles/           # Tailwind globals

  database/
    supabase_migration.sql   # Schema, RLS policies, triggers
    supabase_functions.sql   # DB functions (place_order, etc.)
    supabase_seed.sql        # Seed data

  docs/
    AI_RULES.md
    PRD.md
    TECH_ARCHI.md
    MOBILE_APP_PLAN.md
```

## 4. Frontend Architecture

```
Pages → Hooks → Services → Supabase Client (lib/supabase.ts)
```

### Services

| Service | Responsibility |
|---------|---------------|
| `crop.service.ts` | CRUD operations on crops table |
| `order.service.ts` | Order placement (via RPC), order queries |
| `admin.service.ts` | Admin-specific queries (users, stats) |

### Hooks

| Hook | Responsibility |
|------|---------------|
| `useAuth.tsx` | Auth state, login, register, logout via Supabase Auth |
| `useCart.tsx` | Client-side cart management (localStorage) |

## 5. Database Design

### Entity Relationship

```
Profiles (auth.users)
  |
  |------< Crops    (farmer_id → profiles.id)
  |
  |------< Orders   (buyer_id → profiles.id)
              |
              |------< OrderItems
```

### Tables

**profiles** (linked to auth.users)
- id (UUID, FK → auth.users.id)
- name, email, role, location, phone
- created_at, updated_at

**crops**
- id (UUID), farmer_id (FK → profiles.id)
- name, price, quantity, harvest_date, description
- created_at, updated_at

**orders**
- id (UUID), buyer_id (FK → profiles.id)
- status (pending/accepted/rejected/delivered), total_price
- created_at, updated_at

**order_items**
- id (UUID), order_id (FK → orders.id), crop_id (FK → crops.id)
- quantity, price

## 6. Authentication Flow

```
User registers via Supabase Auth
↓
Trigger creates profiles row with user metadata
↓
User logs in → Supabase session created
↓
Frontend reads session + profile
↓
Supabase client auto-attaches auth token to queries
↓
RLS policies enforce access control
```

## 7. Authorization (Row Level Security)

| Table | Read | Write |
|-------|------|-------|
| profiles | Own profile; admin reads all | Own profile update |
| crops | Public (anyone) | Admin only |
| orders | Own orders (buyer); admin reads all | Buyer creates own; admin updates |
| order_items | Linked to order ownership | Via place_order function |

## 8. Database Functions

| Function | Purpose |
|----------|---------|
| `place_order(p_items)` | Transactional order creation: validates stock, inserts order + items, decrements inventory |
| `admin_update_order_status(p_order_id, p_status)` | Admin-only status update with validation |
| `get_user_role()` | Helper used in RLS policies to check current user's role |
| `handle_new_user()` | Trigger function that creates a profile when a new auth user signs up |

## 9. Frontend Pages

### Public
- Landing Page (`/`)
- Marketplace (`/marketplace`)
- Produce Details (`/crop/[id]`)

### Auth
- Login (`/auth/login`)
- Register (`/auth/register`)

### Buyer Dashboard
- Dashboard (`/dashboard/buyer`)
- Cart (`/dashboard/buyer/cart`)
- Orders (`/dashboard/buyer/orders`)

### Admin Dashboard
- Overview (`/dashboard/admin`)
- User Management (`/dashboard/admin/users`)
- Order Management (`/dashboard/admin/orders`)
- Listing Management (`/dashboard/admin/listings`)

### Platform
- Platform Dashboard (`/server-dashboard`)

## 10. Security Measures

- Supabase Auth handles password hashing and session management
- RLS policies enforce data access at the database level
- Database functions use `SECURITY DEFINER` for trusted operations
- Supabase anon key is safe for frontend (public key; RLS controls access)
- Input validation in frontend services before queries

## 11. Deployment Strategy

| Component | Platform |
|-----------|----------|
| Frontend | Vercel |
| Backend | Supabase (managed) |
| Database | Supabase PostgreSQL (managed) |

## 12. Future Improvements

- Payments integration
- Logistics coordination
- Notifications (email/SMS via Supabase Edge Functions)
- Mobile application (React Native + Supabase client)
- Analytics and reporting dashboard
- AI-assisted pricing and demand forecasting
