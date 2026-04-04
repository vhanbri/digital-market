# AniKo Product Requirements Document (PRD)

## 1. Product Overview

**Product Name:** AniKo

AniKo is a digital commerce platform owned and operated by a private sector company. The platform sources fresh produce directly from Cebu farmers and sells it to buyers in Cebu city markets, such as restaurants, grocery stores, and individual consumers.

Farmers supply their crops to AniKo, which handles curation, pricing, and distribution. Buyers purchase through the AniKo marketplace, benefiting from quality-assured, Cebu-sourced produce at competitive prices.

---

# 2. Problem Statement

In many agricultural supply chains:

- Farmers struggle to find consistent, reliable buyers.
- Multiple intermediaries inflate prices before produce reaches consumers.
- Quality control is inconsistent across the supply chain.
- Buyers lack access to fresh, Cebu-sourced produce at fair prices.
- There is no single trusted platform bridging Cebu farms and Cebu city markets.

AniKo solves this by acting as **the trusted bridge between Cebu farmers and buyers in Cebu city markets** — sourcing produce at fair prices from farmers and distributing it through a curated online marketplace.

---

# 3. Goals

### Primary Goals

1. Source fresh produce from Cebu farmers through the platform.
2. Provide buyers with a curated marketplace of Cebu-sourced products.
3. Ensure quality control and transparent pricing.
4. Simplify procurement for both farmers (supply side) and buyers (demand side).

### Secondary Goals

- Support Cebu farming communities by providing a reliable sales channel
- Reduce post-harvest losses through efficient order management
- Build a trusted brand for Cebu-sourced produce
- Provide platform analytics for operational decision-making

---

# 4. Non-Goals (MVP)

The following will **NOT** be included in the first version:

- logistics routing
- delivery tracking
- AI crop pricing
- crop demand prediction
- financing for farmers
- payment processing

These may be added later.

---

# 5. Target Users

### Farmers (Suppliers)

Cebu farm owners or Cebuano agricultural producers who supply their produce through AniKo. Farmers do not have system accounts — their produce is managed by platform admins.

---

### Buyers (Customers)

Examples:

- restaurants
- grocery stores
- small retailers
- households

Needs:

- browse available produce
- compare prices
- place orders through the platform

---

### Admin (Platform Operators)

AniKo staff who manage platform operations.

Needs:

- manage produce listings (create, edit, delete)
- manage orders and order statuses
- manage user accounts
- monitor platform activity and performance

---

# 6. MVP Feature Scope

## Buyer Features

Buyers must be able to:

- register account
- login
- browse the AniKo marketplace
- view produce details
- add items to cart
- place orders
- view order history

---

## Admin Features

Admins must be able to:

- view and manage all users
- create, edit, and delete produce listings
- view and manage all orders
- update order statuses

---

# 7. User Flow

### Buyer Flow

```
Buyer registers
↓
Buyer browses AniKo marketplace
↓
Buyer selects produce
↓
Buyer adds to cart
↓
Buyer places order
```

---

# 8. Core Entities

## Profiles (linked to Supabase Auth)

Fields:
```
id (UUID, from auth.users)
name
email
role
location
phone
created_at
updated_at
```

Roles:
- buyer (customer)
- admin (platform operator)

---

## Crops

Fields:
```
id
farmer_id (FK → profiles.id, admin who created)
name
price
quantity
harvest_date
description
created_at
updated_at
```

---

## Orders

Fields:
```
id
buyer_id (FK → profiles.id)
status
total_price
created_at
updated_at
```

Order Status:
```
pending
accepted
rejected
delivered
```

---

## Order Items

Fields:
```
id
order_id
crop_id
quantity
price
```

---

# 9. System Architecture

### Frontend

- Next.js
- React
- Tailwind CSS
- TypeScript

---

### Backend

- Supabase (managed PostgreSQL, Auth, Row Level Security)
- Database functions for transactional operations

---

### Authentication

- Supabase Auth (email/password)
- RLS for authorization

---

# 10. Frontend Pages

## Public
- Landing Page
- Marketplace
- Produce Details

## Buyer Dashboard
- Dashboard Overview
- Cart
- Orders

## Admin Dashboard
- Dashboard Overview
- User Management
- Order Management
- Listing Management
- Platform Dashboard

---

# 11. UI Design Principles

The UI should be:

- clean and professional
- mobile friendly
- agriculture-themed with a modern brand identity
- simple for non-technical users

Primary color: Green (brand-* tokens)

---

# 12. Security Requirements

- Supabase Auth handles password hashing and sessions
- Row Level Security enforces data access
- Input validation in frontend services
- Role-based access via RLS policies
- Database functions use SECURITY DEFINER for trusted operations

---

# 13. Scalability Considerations

Future upgrades may include:

- Supabase Edge Functions for complex server-side logic
- Real-time subscriptions for order updates
- Supabase Storage for crop images
- Delivery logistics system

---

# 14. Success Metrics

The MVP will be successful if:

- buyers can place orders through the marketplace
- admins can manage listings and orders
- orders can be tracked and managed
- the platform runs reliably

Key metrics:

- number of active buyers
- number of orders placed and fulfilled
- platform uptime and response times

---

# 15. Development Phases

### Phase 1 — MVP

- authentication (Supabase Auth)
- crop listing and marketplace
- order management
- admin dashboard
- platform dashboard

---

### Phase 2

- payments integration
- delivery coordination
- notifications (email/SMS)

---

### Phase 3

- mobile app
- analytics and reporting
- AI-assisted pricing and demand forecasting
