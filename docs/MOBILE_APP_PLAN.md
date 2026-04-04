# AniKo Mobile App — Feasibility & Implementation Plan

> Saved for future reference. Build the mobile app after the web system is fully running.

---

## Can the current system support a mobile app?

**Yes — Supabase makes this even simpler than before.** Here's why:

- **Supabase client works everywhere** — `@supabase/supabase-js` runs in React Native, Flutter, and any JavaScript environment. The same Supabase project serves both web and mobile.
- **Auth is built-in** — Supabase Auth handles signup, login, and session management. Mobile apps use the same auth flow.
- **RLS handles authorization** — No need to duplicate access control logic. The database enforces what each user can access.
- **No custom backend to deploy** — The API is Supabase itself. No Express server to maintain or scale.

```
┌─────────────────┐
│  Next.js Web App │──────┐
└─────────────────┘      │    ┌──────────────────┐
                         ├───▶│     Supabase      │
┌─────────────────┐      │    │  (Auth + DB + RLS)│
│   Mobile App     │──────┘    └──────────────────┘
└─────────────────┘
   Same Supabase project
```

---

## What needs to be built

Only the **mobile frontend** — a new client that talks to the same Supabase project. The database, auth, RLS policies, and database functions stay exactly as they are.

---

## Three Approaches (with trade-offs)

### Option A: React Native (Recommended)

- **Why**: The team already knows React and TypeScript. ~80% of frontend logic (hooks, services, types) can be reused directly.
- **Stack**: React Native + Expo + TypeScript + `@supabase/supabase-js`
- **Reuse**: `services/*.service.ts`, `types/`, `hooks/useCart.tsx` — all portable with minimal changes. Auth uses the same `supabase.auth` API.
- **Output**: Native iOS + Android apps from one codebase.
- **Learning curve**: Low.

### Option B: Progressive Web App (PWA)

- **Why**: Zero new codebase — add a manifest, service worker, and responsive tweaks to the existing Next.js app.
- **Trade-off**: Not a "real" app store app. Limited push notifications, no native hardware access. iOS Safari PWA support is still limited.
- **Learning curve**: Minimal.

### Option C: Flutter or Native (Swift/Kotlin)

- **Why**: Best performance and native feel.
- **Trade-off**: Completely new codebase, new language (Dart/Swift/Kotlin), limited code reuse.
- **Note**: Supabase has official Flutter and Swift SDKs, so the backend integration is still straightforward.
- **Learning curve**: High.

---

## Implementation Details (React Native — Option A)

### Backend changes: NONE

Supabase is already mobile-compatible. The same project, same tables, same RLS policies work for both web and mobile.

### New mobile project structure

```
aniko/
  frontend/          (existing web app — unchanged)
  mobile/            (NEW — React Native / Expo)
    src/
      screens/       (equivalent of pages/)
      components/    (UI components)
      navigation/    (React Navigation stack)
      hooks/         (reuse useCart, create useAuth for mobile)
      services/      (copy service files — same Supabase queries)
      lib/           (supabase.ts — same config, different storage adapter)
      types/         (copy from frontend/)
```

### Key adaptations in mobile

| Web (current) | Mobile (adaptation) |
|---|---|
| `@supabase/ssr` (browser client) | `@supabase/supabase-js` + `AsyncStorage` adapter |
| `localStorage` (cart) | `AsyncStorage.setItem('aniko_cart', ...)` |
| `next/router` (navigation) | `React Navigation` stack/tab navigators |
| `next/link` | `navigation.navigate('ScreenName')` |
| `next/image` | `<Image source={{ uri }}>` |
| Tailwind CSS classes | React Native StyleSheet or NativeWind |
| `<Head><title>` | React Navigation screen options |

### Mobile screens to build

| Web Page | Mobile Screen |
|---|---|
| `pages/index.tsx` (landing) | Not needed (app opens to marketplace or login) |
| `pages/auth/login.tsx` | `screens/LoginScreen.tsx` |
| `pages/auth/register.tsx` | `screens/RegisterScreen.tsx` |
| `pages/marketplace.tsx` | `screens/MarketplaceScreen.tsx` |
| `pages/crop/[id].tsx` | `screens/CropDetailScreen.tsx` |
| `pages/dashboard/buyer/index.tsx` | `screens/BuyerDashboardScreen.tsx` |
| `pages/dashboard/buyer/cart.tsx` | `screens/CartScreen.tsx` |
| `pages/dashboard/buyer/orders.tsx` | `screens/OrdersScreen.tsx` |
| `pages/dashboard/admin/*` | `screens/admin/*` (if admin mobile access is needed) |

---

## Optional enhancements for mobile

- **Push notifications** — Supabase Edge Functions + Firebase Cloud Messaging for order status updates
- **Real-time updates** — Supabase Realtime subscriptions for live order status changes
- **Image upload** — Supabase Storage for crop photos
- **Offline support** — Cache marketplace data locally for offline browsing

---

## Recommendation

**Go with Option A (React Native / Expo)** if a real app store presence is desired. The system is fully ready — Supabase serves both web and mobile with zero backend changes, and most TypeScript logic can be reused.

**Go with Option B (PWA)** for quick mobile accessibility with minimal effort.

---

## Prerequisites before starting mobile development

1. Web system fully functional and tested
2. Supabase project deployed and accessible
3. All RLS policies verified and stable
4. Authentication flow verified end-to-end
5. Node.js and npm available for React Native / Expo CLI
