---
name: project-nextjs16-conventions
description: Next.js 16 + next-intl v4 conventions in this repo — verify framework behavior before flagging it
metadata:
  type: project
---

This repo runs a NON-STANDARD Next.js (16.2.6) with breaking changes vs common training data. Verify framework behavior in `node_modules/next/dist/docs/` before flagging a framework-level "bug".

Verified conventions:
- **Middleware lives in `proxy.ts`** (repo root), not `middleware.ts` — it wires `next-intl` via `createMiddleware(routing)`. Do not flag the missing `middleware.ts`.
- **Route `params` is a `Promise`** in App Router pages/layouts — pages must `await params`. Flag only if a page reads `params.locale` without awaiting.
- **`useTranslations` is valid in React Server Components** with next-intl v4; do not assume `getTranslations` is required server-side.
- **Production redacts thrown Server Action error messages** (generic message + digest), so raw `error.message` leaks are largely dev-only — see [[project-demo-auth-design]] for the demo-calibration mindset.

Stack: React 19, `@supabase/ssr`, next-intl v4, Tailwind v4, TypeScript.
