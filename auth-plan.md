# Auth Implementation Plan for pmk

> Pattern learned from `cashflow-notion` — a production-grade Better Auth setup with email/password, Google OAuth, route protection, server-side session utilities, and post-registration hooks.

## Current State vs Target

| Layer | Current (pmk) | Target (cashflow-notion pattern) |
|---|---|---|
| Auth server (`lib/auth.ts`) | Done — email/password, baseURL, nextCookies, joins | Done |
| Auth client (`lib/auth-client.ts`) | Done — signIn, signUp, signOut, useSession | Done |
| API route (`app/api/auth/[...all]/route.ts`) | Done — toNextJsHandler | Done |
| Auth page (`app/auth/page.tsx`) | Done — renders AuthCard | Done |
| Auth form (`components/auth-card.tsx`) | Done — sign in + sign up tabs | Needs: redirect param support (currently hardcoded to `/`) |
| **Route protection** (`proxy.ts`) | **MISSING** | Blocked — no proxy/middleware exists. All routes are public. |
| **Server-side session** (`lib/session.ts`) | **MISSING** | Blocked — no `getSession()` utility. Server actions don't check auth. |
| **Auth bypass toggle** | Env var set but not wired | Blocked — `NEXT_PUBLIC_BYPASS_AUTH=true` is in `.env` but no code references it. |
| **Sign out in UI** | **MISSING** | Blocked — `signOut` is exported from auth-client but never called anywhere. |
| **User display in UI** | **MISSING** | Blocked — `useSession` is exported but never used. |
| **Auth enforcement in server actions** | **MISSING** | Blocked — all `actions/business/*.ts` operate without any auth check. |
| **Redirect after login** | **MISSING** | Blocked — login always redirects to `/`, never back to the original page. |
| **Auth layout** (`app/auth/layout.tsx`) | **MISSING** | Optional — could add auth-specific layout (no nav, no QueryProvider). |

---

## Implementation Steps (in order)

### Step 1 — Create `lib/session.ts` (server-side session utility)

Follows `lib/management.ts` pattern from cashflow-notion.

```ts
// lib/session.ts
import "server-only"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { cache } from "react"

export const getSession = cache(async () => {
  const bypass = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true"
  if (bypass) return null // or return a mock session

  const hdrs = await headers()
  return auth.api.getSession({ headers: hdrs })
})

export async function requireSession() {
  const session = await getSession()
  if (!session) throw new Error("Not authenticated")
  return session
}
```

**Why `cache()`:** React's `cache()` deduplicates `headers()` calls within a single request. Multiple server actions called from the same page won't re-read headers.

**Why `"server-only"`:** Prevents accidental import into client components (would leak server-only APIs like `headers()`).

### Step 2 — Add auth bypass support to `lib/session.ts`

The `NEXT_PUBLIC_BYPASS_AUTH` env var already exists in `.env`. Wire it up so that when enabled:
- `getSession()` returns `null` (no session required)
- All server actions still work without a real user
- The proxy still allows all traffic

In development with bypass, we skip all auth — this matches the current behavior while keeping the auth infrastructure ready for production deploy.

### Step 3 — Create `proxy.ts` (route protection)

Follows `proxy.ts` pattern from cashflow-notion. Next.js 16 uses `proxy.ts` instead of `middleware.ts`.

```ts
// proxy.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

export async function proxy(request: NextRequest) {
  const bypass = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true"
  if (bypass) return NextResponse.next()

  const { pathname } = request.nextUrl

  // Skip static/API paths
  const isSkippedPath =
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest" ||
    pathname.startsWith("/icons/") ||
    pathname === "/sw.js"

  if (isSkippedPath) return NextResponse.next()

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  // Authenticated users on /auth → redirect to home
  if (pathname === "/auth") {
    if (session) {
      const redirectTo = request.nextUrl.searchParams.get("redirect")
      const safeRedirect =
        redirectTo?.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/"
      return NextResponse.redirect(new URL(safeRedirect, request.url))
    }
    return NextResponse.next()
  }

  // Unauthenticated users → redirect to /auth
  if (!session) {
    const authUrl = new URL("/auth", request.url)
    authUrl.searchParams.set("redirect", `${request.nextUrl.pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(authUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|sw\\.js|icons/.*\\.svg|.*\\.(?:png|json|svg)$).*)",
  ],
}
```

**Notes:**
- Bypass check first — when `NEXT_PUBLIC_BYPASS_AUTH=true`, all requests pass through.
- Static/assets are excluded via matcher regex.
- `/api/auth/[...all]` is excluded (it's under `/api` which is skipped).
- `redirect` query param preserves the original URL so users return after login.

### Step 4 — Add redirect support to `components/auth-card.tsx`

Currently both `signIn.email()` and `signUp.email()` hardcode `callbackURL: "/"`. They should respect a `redirect` search param.

Changes needed:
- Read `redirect` from `useSearchParams()`
- Validate it's a safe relative URL
- Pass it as `callbackURL` to `signIn.email()` / `signUp.email()`
- After successful auth, navigate to `redirect` instead of always `/`
- Wrap the component in `<Suspense>` (required by `useSearchParams`)

### Step 5 — Add sign out and user display to the main app

In `components/pempek-business-app.tsx`:

- Import `useSession` and `signOut` from `@/lib/auth-client`
- In the HeroSummary or app header, display the user's name/email from session
- Add a sign-out button (avatar dropdown or profile section)

Pattern from cashflow-notion:
```ts
const { data: session } = useSession()

// In a button/link:
await signOut()
window.location.href = "/auth"
```

### Step 6 — Protect server actions with auth check

All files in `actions/business/*.ts` currently have no auth enforcement. Add `requireSession()` at the top of every mutation (create, update, delete). Queries (`getProducts`, `getInventoryItems`, etc.) should also be protected.

**Example — before:**
```ts
export async function saveProduct(values: EntryValues, id?: string) {
  // ... directly uses prisma
}
```

**After:**
```ts
import { requireSession } from "@/lib/session"

export async function saveProduct(values: EntryValues, id?: string) {
  await requireSession()
  // ... rest of the logic
}
```

**Affected files** (8 files, ~25 server actions):
| File | Actions to protect |
|---|---|
| `actions/business/products.ts` | `getProducts`, `saveProduct`, `createProductKind`, `deleteProduct` |
| `actions/business/inventory.ts` | `getInventoryItems`, `saveInventoryItem`, `deleteInventoryItem` |
| `actions/business/sales.ts` | `getSales`, `saveSale`, `deleteSale`, `checkoutCart` |
| `actions/business/purchases.ts` | `getPurchases`, `createPurchase`, `deletePurchase` |
| `actions/business/productions.ts` | `getProductions`, `createProduction`, `deleteProduction` |
| `actions/business/dashboard.ts` | `getBusinessDashboard` |
| `actions/business/activity-log.ts` | `getActivityLogs`, `getActivityLogKinds` |

**Note:** Read-only actions (`getProducts` etc.) should also be protected since this app has per-user data (all data is shared currently, but auth establishes the pattern for future multi-tenancy).

### Step 7 — Optional: create `app/auth/layout.tsx`

Currently the auth page inherits the root layout with QueryProvider and PWA registration. If desired, create a narrower layout:

```tsx
// app/auth/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh">{children}</div>
}
```

This is optional — the current setup works fine.

---

## Files to create

| File | Purpose |
|---|---|
| `lib/session.ts` | Server-side `getSession()` + `requireSession()` |
| `proxy.ts` | Route protection (redirect unauthenticated users) |

## Files to edit

| File | Changes |
|---|---|
| `components/auth-card.tsx` | Add `redirect` search param support, wrap in `<Suspense>` |
| `components/pempek-business-app.tsx` | Add `useSession` + `signOut` for user display and logout |
| `actions/business/products.ts` | Add `requireSession()` guard |
| `actions/business/inventory.ts` | Add `requireSession()` guard |
| `actions/business/sales.ts` | Add `requireSession()` guard |
| `actions/business/purchases.ts` | Add `requireSession()` guard |
| `actions/business/productions.ts` | Add `requireSession()` guard |
| `actions/business/dashboard.ts` | Add `requireSession()` guard |
| `actions/business/activity-log.ts` | Add `requireSession()` guard |

## Implementation order

1. **`lib/session.ts`** — foundation, no other changes depend on it yet but it's new code that's safe to add
2. **`proxy.ts`** — enables route protection (guarded by bypass flag initially)
3. **`components/auth-card.tsx`** — redirect support for proper login flow
4. **Server actions** — add `requireSession()` to all `actions/business/*.ts`
5. **`components/pempek-business-app.tsx`** — sign out + user display (UX polish)
6. **Test** — verify bypass works, then disable bypass and test full auth flow

## Testing plan

1. With `NEXT_PUBLIC_BYPASS_AUTH=true`: app should work exactly as before (all routes public, all actions work)
2. With `NEXT_PUBLIC_BYPASS_AUTH=false`:
   - Visiting `/` should redirect to `/auth?redirect=%2F`
   - Sign up a new user → should redirect to `/`
   - Sign out → should redirect to `/auth`
   - All CRUD operations should work when authenticated
   - Calling server actions without session should throw

## NOT in scope (deferred)

These cashflow-notion features are intentionally excluded from this plan:
- **Google OAuth** — adds complexity and requires Google Cloud Console setup
- **databaseHooks (post-registration)** — cashflow-notion creates Management/categories on sign-up; pmk has no multi-tenancy yet
- **Custom OAuth server (MCP)** — cashflow-notion has a full OAuth 2.0 server for MCP integration; not needed for pmk
- **Account linking** — not relevant without multiple social providers
