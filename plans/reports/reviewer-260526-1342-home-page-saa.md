# Code Review — Homepage SAA + Supabase

**Date:** 2026-05-26
**Reviewer:** reviewer agent
**Scope:** 21 files (846 LOC total), all newly created for Homepage SAA implementation
**Plan:** `plans/260526-1342-home-page-saa-supabase/plan.md`

---

## Verdict: APPROVE_WITH_FIXES

## Score: 8.2 / 10

---

## Critical (must fix before merge)

**1. CountdownTimer hydration mismatch — `components/hero/countdown-timer.tsx:28`**

`useState(() => Date.now())` runs on the server during SSR, producing a timestamp. React 19 then tries to hydrate with the client's `Date.now()`, which differs by milliseconds-to-seconds depending on network latency. This will produce a React hydration error (`Text content did not match`) in production. The server-rendered countdown numbers will differ from the client-rendered ones.

Fix: initialize state to `0` / `null` on server, set the real value in `useEffect` (client-only), and render a placeholder skeleton until mounted.

```tsx
const [tick, setTick] = useState<number>(0);
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
  setTick(Date.now());
  const id = setInterval(() => setTick(Date.now()), 60_000);
  return () => clearInterval(id);
}, []);

if (!mounted) return <div className="h-20" aria-hidden />; // skeleton
```

**2. No RLS on Supabase tables — `supabase/migrations/0001_initial_schema.sql`**

Neither `users`, `awards`, nor `notifications` tables have `ENABLE ROW LEVEL SECURITY` + policies. The server client correctly uses the `anon` key, but with no RLS the anon key can read/write all rows, including other users' notifications. If Supabase is ever exposed to the public internet (staging, prod), any visitor can read all notification data via the PostgREST endpoint.

Fix: add at minimum `alter table public.notifications enable row level security;` with a policy restricting reads to `auth.uid() = user_id`. Awards can be public-read. For this local-dev session, at least add the `enable row level security` statement so the migration is production-ready.

---

## Important (should fix soon)

**3. `selected` prop hardcoded on About SAA nav link — `components/header/site-header.tsx:41`**

`<NavLink href="/about-saa-2025" selected>` always renders the active/underlined style regardless of which page is currently active. On `/awards-information` or `/sun-kudos`, the "About SAA 2025" nav item will still appear highlighted.

Fix: use next-intl `usePathname` hook in a client wrapper around `NavLink`, or derive the active state from the current path in the header.

**4. `award-card.tsx` uses native `<a>` instead of next-intl `Link` — `components/awards/award-card.tsx:14`**

`href="/awards-information#${slug}"` is a bare native anchor. It will navigate to `/awards-information#<slug>` without the locale prefix (e.g., `/en/awards-information#top-talent` won't be reached from `/en`). The link will incorrectly strip the locale segment or not prefix it, causing a redirect loop via middleware.

Fix: replace `<a href={...}>` with `<Link href={...}>` from `@/lib/i18n/navigation`.

**5. Mock auth "Sign in as regular / Sign in as admin" buttons not gated behind dev mode — `components/header/account-menu.tsx:56,64`**

These debug buttons ship in production builds. Any user can toggle to admin role and see admin-only UI elements (Admin Dashboard link). While auth is UI-only by design, the presence of "Sign in as admin" in a production bundle is a UX trust issue and a future security footgun if real auth is wired later.

Fix: wrap with `{process.env.NODE_ENV === 'development' && (...)}`.

**6. Hardcoded strings not translated — multiple files**

- `components/widget-button.tsx:13,16,19`: three Vietnamese-only action labels ("Đề cử nhanh", "Gửi Kudos", "Liên hệ ban tổ chức") — no English equivalent, not in `messages/en.json`.
- `app/[locale]/login/page.tsx:15`: `"Sign in"` hardcoded, ignores locale.
- `components/header/notification-bell.tsx:36`: `"${unreadCount} unread"` and `"No new notifications."` hardcoded in English.

Fix: add keys to both `vi.json` and `en.json`, use `useTranslations`/`getTranslations` to render them.

**7. `isFuture` computed at SSR time in server component — `components/hero/hero-section.tsx:13`**

`Date.now()` evaluated at request time. If `NEXT_PUBLIC_EVENT_DATETIME` is in the past by the time the event occurs, the "Coming soon" banner simply disappears — which is fine. However, if the page is statically cached (ISR), this value will be stale. Currently there's no `export const dynamic = 'force-dynamic'` or `export const revalidate` on the page. The `cookies()` call in `SiteHeader` forces dynamic rendering anyway (via `createClient()` → `cookies()`), so in practice this is dynamic and won't be stale. But this implicit dependency is fragile: if `SiteHeader` is ever cached or the cookies() call is removed, `isFuture` silently becomes stale. Consider making it explicit.

---

## Nit (optional)

**N1. `languageEN` key in messages is unused — `messages/vi.json:9`, `messages/en.json:9`**

Both JSON files define `header.languageEN` but `LanguageSwitcher` renders `loc.toUpperCase()` from the `routing.locales` array, never referencing this key.

**N2. `nav` keys not translated between VN/EN — `messages/vi.json:3-5` vs `messages/en.json:3-5`**

Both locales use identical English strings for nav items ("About SAA 2025", "Awards Information", "Sun* Kudos"). If VN nav should be in Vietnamese, this needs localized strings.

**N3. Multiple Supabase client instances per request — `site-header.tsx`, `awards-section.tsx`**

Each RSC creates its own `createClient()` → `createServerClient()` instance. Per `@supabase/ssr` docs this is the recommended pattern (no singleton for RSC), so it's technically correct. Just noting it for awareness.

**N4. `turbopack.root: __dirname` in `next.config.ts`**

`__dirname` is a CJS global. In a TypeScript ES module context, Next.js 16 processes `next.config.ts` with its own transform so `__dirname` works — but it's implicitly relying on Next's CJS transform. Low risk given it works (build passes), but `import.meta.dirname` or `path.resolve()` would be more explicit.

**N5. `NavLink` href type union is fragile — `components/header/nav-link.tsx:4`**

The `href` type is a hardcoded union. Adding a new route requires updating the type manually. Consider `string` or a generated route type.

---

## Strengths

- Next.js 16 patterns correct throughout: `params: Promise<{locale: string}>` awaited properly in all 7 route files; `setRequestLocale` called before any i18n calls; `getMessages()` + `NextIntlClientProvider` wired correctly in layout.
- Supabase server client pattern is textbook-correct: `await cookies()` in an async factory, `setAll` has try/catch with correct RSC comment, anon key (not service role) used for data queries.
- i18n `Link`, `useRouter`, `usePathname` consistently imported from `@/lib/i18n/navigation` (not `next/link` or `next/navigation`) across all components — zero violations.
- File sizes well under 200-line limit (max 72 lines); kebab-case naming consistent.
- Fallback awards array in `awards-section.tsx` prevents blank page when Supabase is offline — resilient pattern.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Implementation is solid for a local-dev session. Two issues need resolution before any public-facing deploy: the countdown hydration mismatch (will throw React errors in production) and absent RLS policies (data exposure risk if DB is ever internet-accessible).
**Concerns/Blockers:** Critical #1 (hydration) is a functional bug visible to users in production. Critical #2 (RLS) is a data security issue at deploy time. Both are straightforward fixes. Important #4 (award-card native anchor losing locale) is a functional navigation bug that will manifest immediately when users navigate from `/en`.
