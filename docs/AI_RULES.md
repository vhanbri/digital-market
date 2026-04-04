# AniKo — AI Coding Rules

AniKo is a digital commerce platform operated by a private sector company. The platform sources fresh produce from local farmers and sells it to city buyers. Farmers are suppliers, buyers are customers, and admins manage platform operations.

This document defines the hard constraints every AI agent (and human developer) must follow when generating or modifying code in this repository. Read this file in full before writing any code.

---

## 1. Architecture Overview

AniKo uses **Supabase** as its backend — there is no Express server. The frontend talks directly to Supabase for auth, data, and business logic.

```
Next.js Frontend ──▶ Supabase
                       ├── Supabase Auth (signup, login, sessions)
                       ├── PostgreSQL + RLS (data access control)
                       └── Database Functions via .rpc() (transactions)
```

### Frontend layers

```
Pages → Hooks → Services → Supabase Client (lib/supabase.ts)
```

- Pages import hooks and components. They do not call `supabase` directly.
- Hooks call service functions. They do not construct queries or manage auth state directly.
- Service files (`services/*.service.ts`) call the Supabase client. They are the only files that touch `supabase.from()`, `supabase.rpc()`, etc.
- `lib/supabase.ts` is the single source for the Supabase browser client.

### Data access control

- **Row Level Security (RLS)** on all tables enforces who can read/write what data.
- **Database functions** (`place_order`, `admin_update_order_status`) handle transactional operations.
- Authorization is handled at the database level — no middleware needed.

---

## 2. Naming Conventions

### Files

| Type | Pattern | Example |
|------|---------|---------|
| React component | `PascalCase.tsx` | `CropCard.tsx` |
| React hook | `use<Name>.tsx` | `useAuth.tsx` |
| Frontend service | `<domain>.service.ts` | `crop.service.ts` |
| Types (shared) | `<domain>.types.ts` | `order.types.ts` |
| Supabase client | `lib/supabase.ts` | `lib/supabase.ts` |

### Code

| Element | Convention | Example |
|---------|------------|---------|
| Interfaces / types | PascalCase | `CreateCropDTO` |
| Functions, methods | camelCase | `getCropById` |
| Constants | UPPER_SNAKE_CASE | `PAGE_SIZE` |
| Database columns | snake_case | `farmer_id`, `created_at` |
| Enum-like unions | lowercase literal | `'pending' \| 'accepted'` |
| Boolean variables | `is`/`has`/`can` prefix | `isActive`, `hasPermission` |

---

## 3. Supabase Patterns

### Auth

- Use `supabase.auth.signUp()`, `supabase.auth.signInWithPassword()`, `supabase.auth.signOut()`.
- Listen for auth state changes with `supabase.auth.onAuthStateChange()`.
- User metadata (name, role, location) is stored via `options.data` during signup.
- A database trigger auto-creates a `profiles` row when a user signs up.
- Registration must not allow the `admin` role — admins are created manually.

### Data queries

- Use `supabase.from('table').select()` for reads.
- Use `.insert()`, `.update()`, `.delete()` for writes.
- Always handle the `{ data, error }` response pattern.
- Use `{ count: 'exact', head: true }` for count-only queries.

### Transactional operations

- Use `supabase.rpc('function_name', { args })` for operations that need transactions.
- `place_order` — creates order + order items + decrements stock in one transaction.
- `admin_update_order_status` — validates role and updates status.

### Row Level Security

- All tables have RLS enabled.
- `profiles` — users read own profile; admins read all.
- `crops` — public read; admin write.
- `orders` — buyers read own; admins read all; buyers insert own; admins update.
- `order_items` — access linked to order ownership.
- The `get_user_role()` helper function is used in RLS policies.

---

## 4. Database Rules

- All primary keys are UUIDs (`gen_random_uuid()`).
- All tables have `created_at TIMESTAMPTZ DEFAULT NOW()`.
- Mutable tables have `updated_at` with a `BEFORE UPDATE` trigger.
- Foreign keys use `ON DELETE CASCADE` unless the child record must survive (use `RESTRICT`).
- Complex operations use database functions, not client-side multi-step queries.

---

## 5. TypeScript Rules

- `strict: true` in every `tsconfig.json` — no exceptions.
- No `any` types unless accompanied by a comment explaining why.
- Prefer `unknown` over `any` for untyped external data.
- No unused imports or variables.
- Async functions must have proper error propagation — never swallow errors silently.
- Frontend types live in `frontend/types/` (JSON-compatible — dates as `string`).

---

## 6. Security Rules

- Auth is handled by Supabase Auth — never store passwords in the application.
- All sensitive env vars go in `.env.local` (gitignored). Committed examples go in `.env.local.example` with placeholder values.
- Role checks are enforced by RLS policies at the database level.
- The Supabase anon key is safe to expose in the frontend (it's a public key; RLS controls access).

---

## 7. Component Rules (Frontend)

- Reusable UI primitives live in `components/ui/`.
- Domain-specific components live in `components/<domain>/` (e.g. `components/crops/`).
- Layouts live in `layouts/` — pages import layouts, not the other way around.
- Every component that accepts children must type them as `ReactNode`.
- CSS is Tailwind utility classes only — no CSS modules, no styled-components, no inline style objects.
- Color palette uses the `brand-*` tokens defined in `globals.css`, not raw hex values.

---

## 8. What NOT to Build (MVP)

Per the PRD, the following are explicitly out of scope:

- Logistics / delivery routing
- Delivery tracking
- AI crop pricing
- Crop demand prediction
- Farmer financing
- Payment processing
- Mobile app
- Analytics / reporting dashboards (beyond the existing platform dashboard)

Do not generate code for these features.

---

## 9. Business Model Context

- AniKo is **owned and operated by a private sector company**.
- **Farmers** are external supplier partners — they do NOT have system accounts. Their produce is managed by admins.
- **Buyers** are the only public-facing user role — they register, browse, and purchase through the marketplace.
- **Admins** are platform operators — they manage users, create/edit/delete produce listings, and manage all orders.
- The platform sources all produce **locally from farmers** and sells it under the AniKo brand.
- The system has **two user roles**: `buyer` and `admin`. The `farmer` role exists in the database enum for legacy data but is not available for new registrations.
- The system is NOT a peer-to-peer marketplace — AniKo acts as the intermediary between farmers and buyers.
