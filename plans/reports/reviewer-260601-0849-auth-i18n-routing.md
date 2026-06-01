# Code Review: AUTH · i18n · Routing · App Pages

**Date:** 2026-06-01  
**Scope:** lib/auth/*, lib/i18n/*, app/[locale]/* (8 pages), components/login/*, components/header/*, messages/en+vi, next.config.ts, proxy.ts

---

## Overall Assessment

Solid Next.js 16 / next-intl v4 implementation. Params awaited correctly throughout; setRequestLocale/getMessages order is right; message keys are complete across both locales; proxy.ts matcher is the standard next-intl pattern; default export in proxy.ts is valid per Next 16 docs. The main defects are: hardcoded locale list in revalidatePath, admin-dashboard reachable without any guard, and DB queries firing before client-side auth check on protected pages.

---

## Critical

### C1 · `lib/kudos/actions.ts:26-27` — Hardcoded locale list in `revalidatePath`

```ts
revalidatePath("/vi/sun-kudos");
revalidatePath("/en/sun-kudos");
```

Locales are duplicated from `routing.ts`. Adding a third locale means the new cache entries are never busted — stale board served indefinitely after a kudos/like action.

**Fix:**
```ts
import { routing } from "@/lib/i18n/routing";

function revalidateBoard() {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/sun-kudos`);
  }
}
```
Tests at `actions.test.ts:156-157,197-198,390-391` must be updated to match.

---

## Important

### I1 · `app/[locale]/admin-dashboard/page.tsx` — No AuthGuard, no role check

The page renders "Coming soon" content but has zero auth barrier. Any unauthenticated user who navigates directly to `/vi/admin-dashboard` can reach it. The AccountMenu only hides the link client-side — it is not a route guard. Even for a demo the route name implies restricted access; an `AuthGuard` (and ideally a role check) should wrap the content.

**Fix:** Wrap `<main>` in `<AuthGuard>`. Add a role guard for `admin` role when non-"coming soon" content ships.

### I2 · `app/[locale]/sun-kudos/page.tsx:42-45` and `awards-information/page.tsx:70-71` — DB queries run before auth check

Both pages fire `fetchKudosBoard / fetchKudosStats / fetchAwards` unconditionally at the server level, before `AuthGuard` can gate rendering. For unauthenticated requests:
- Wasted DB round trips on every page load.
- The full board/awards HTML is in the SSR response; `AuthGuard` hides it client-side but it has already been sent over the wire.

In the demo context this is not a PII leak (data is mock/public), but the pattern would be dangerous with real user data.

**Fix (minimal):** Move data fetches inside a helper that AuthGuard can conditionally invoke, or check auth state server-side (real Supabase session) before querying.

### I3 · `lib/auth/auth-guard.tsx:14` — Wrong i18n namespace for a shared component

```ts
const t = useTranslations("awardsInfo");
```

`AuthGuard` is used on both `/sun-kudos` and `/awards-information`. Hardwiring it to the `awardsInfo` namespace is a coupling smell. The key `awardsInfo.redirectingToLogin` exists in both locales so it works today, but adding AuthGuard to any future route would silently reuse an awards-scoped string.

**Fix:** Move `redirectingToLogin` to the `common` namespace, or create a dedicated `auth` namespace. Update both `en.json` and `vi.json`.

---

## Minor

### M1 · `app/[locale]/layout.tsx:20-23` — Static (non-locale-aware) metadata title

```ts
export const metadata: Metadata = {
  title: "Sun* Annual Awards 2025 — ROOT FURTHER",
```

Title is always English regardless of locale. Vietnamese users see the English title in browser tabs / search results.

**Fix:** Convert to `generateMetadata` that calls `getTranslations` with explicit `locale`.

### M2 · `messages/vi.json` — Nav labels not translated

`vi.nav.about`, `vi.nav.awards`, `vi.nav.kudos` are identical to the English strings ("About SAA 2025", "Awards Information", "Sun* Kudos"). May be intentional (brand names), but if localisation is desired these should be updated.

### M3 · `proxy.ts:5` — Default export instead of named `proxy` export

```ts
export default createMiddleware(routing);
```

Next.js 16 docs show the preferred convention is `export function proxy(...)`. Default export is documented as still valid. No functional issue — suggestion only for convention alignment.

### M4 · `components/header/site-header.tsx:48` — "About SAA 2025" nav label routes to `/`

NavLink `href="/"` is labelled `t("nav.about")` ("About SAA 2025") but the homepage is the full landing page, not the dedicated about page. Per commit #12 this is intentional (about-saa-2025 page is placeholder "coming soon"). Noted for when `about-saa-2025` gets real content — the nav href will need updating.

---

## Known Deferrals (verified documented)

- **Client-side-only AuthGuard** (`auth-guard.tsx:9-10`): Explicitly commented as a mock stopgap. `router.replace("/login")` uses the locale-aware router from `lib/i18n/navigation`, so locale prefix is preserved correctly.
- **DEMO_STATS_USER_ID / SENDER_ID constants**: Hardcoded UUIDs have TODO(auth) comments throughout; not a review defect.
- **`process.env.NODE_ENV === "development"` guard in AccountMenu** (`account-menu.tsx:48`): Dev-only mock sign-in buttons are correctly gated; do not appear in production builds.
- **`supabase.from(...) as any` casts in actions.ts**: Justified by a comment (Supabase generic loses table type); `eslint-disable` comment is present.

---

## Verified Correct (no action needed)

| Item | Verdict |
|------|---------|
| `params: Promise<{locale}>` awaited in all 8 pages | Correct (Next 16 async params) |
| `setRequestLocale` called before `getTranslations`/`getMessages` | Correct in all pages |
| `generateMetadata` passes explicit `{locale}` to `getTranslations` | Correct |
| `hasLocale` guard before `notFound()` in layout | Correct |
| `useTranslations` in `LoginHero` without `"use client"` | Valid — next-intl v4 exports `useTranslations` for RSC |
| proxy.ts matcher `/((?!api|_next|_vercel|.*\\..*).*)` | Standard next-intl pattern; correctly excludes static assets |
| Both `en.json` and `vi.json` — all referenced keys present | No missing keys found |
| `createNavigation` / `Link` / `useRouter` from `lib/i18n/navigation` | Correct locale-aware wrappers used consistently |
| `localePrefix: "always"` with `defaultLocale: "vi"` | Consistent; middleware will always redirect `/` → `/vi/` |

---

## Unresolved Questions

1. Is `vi.nav.*` intentionally English (brand names) or a translation gap?
2. When real Supabase Auth ships, will `revalidateBoard` be refactored to use tags (`revalidateTag`) instead of per-locale path calls?
3. `admin-dashboard` — is it intended to remain publicly accessible as a placeholder, or should it be gated immediately?
