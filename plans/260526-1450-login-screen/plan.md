# Plan — Login Screen (Mock Google OAuth)

**Date:** 2026-05-26
**Source:** [Login on MoMorph](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz) (screenId: `GzbNeVGJHz`)
**Clarifications:** [clarifications.md](./clarifications.md)
**Builds on:** commit `6844b4b` (Homepage SAA + Supabase + i18n scaffold)

## Goal
Replace placeholder `/login` route with the MoMorph login design: minimal header (logo + language switcher), centered hero with `ROOT FURTHER` + welcome text + Google OAuth button (mocked → uses `MockAuthContext`), footer copyright. Authenticated users get redirected to home.

## Phases (sequential, lean)

| # | Phase | Status |
|---|-------|--------|
| 01 | Plan + clarifications | ✅ done |
| 02 | i18n keys for login (vi + en) | ✅ done |
| 03 | UI components — `login-header`, `login-form` | ✅ done |
| 04 | Update `app/[locale]/login/page.tsx` | ✅ done |
| 05 | Build verify + curl test | ✅ done |
| 06 | Reviewer + fixes | ✅ done |
| 07 | Deliver (project-manager + doc-writer + git-manager) | pending |

## Architecture

```
app/[locale]/login/page.tsx          # Server component: header + content + footer
components/login/
├── login-header.tsx                 # Minimal header (logo + language switcher)
├── login-form.tsx                   # Client: Google button + loading + redirect
└── login-hero.tsx                   # ROOT FURTHER key visual + welcome text

messages/{vi,en}.json                # New keys: login.welcomeLine1, login.welcomeLine2, login.googleCta, login.loading, login.alreadyAuthed
```

## Data flow

```
User → /login
       │
       ▼
LoginPage (server) renders [LoginHeader, LoginHero, LoginForm, SiteFooter]
       │
       ▼ (client hydration)
LoginForm checks MockAuthContext.isAuthenticated
       │
       ├── true  → router.replace("/") immediately
       └── false → show Google button
                       │
                       ▼ click
                  setLoading(true) → setTimeout(800ms simulate OAuth)
                       │
                       ▼
                  MockAuthContext.signIn("regular") → router.replace("/")
```

## Success criteria
- `npm run build` clean
- `GET /vi/login` returns 200 with localized "Đăng nhập bằng Google" CTA
- `GET /en/login` returns 200 with "Sign in with Google" CTA
- Login button shows loading state + redirects to `/{locale}` after mock auth
- If already authenticated, /login auto-redirects to home

## Review Fixes Applied

**Reviewer report:** [reviewer-260526-1450-login-screen.md](../reports/reviewer-260526-1450-login-screen.md) (8.5/10, APPROVE_WITH_FIXES)

Fixes applied (§4):
1. **setTimeout cleanup** — `useRef<ReturnType<typeof setTimeout>>` + `useEffect` cleanup in `login-form.tsx`
2. **Button ARIA busy state** — `aria-busy={loading}` on sign-in button
3. **Status announcement** — `role="status"` on already-authed paragraph
4. **Metadata consumption** — `generateMetadata` uses `login.title` in `page.tsx`

Not applied: §5.1 (guard-clause redundancy — acceptable as defensive measure)

## Out of scope
- Real Google OAuth (no credentials configured)
- Email/password form
- Sign-up flow
- Forgot password
- Server-side session check
- E2E tests
