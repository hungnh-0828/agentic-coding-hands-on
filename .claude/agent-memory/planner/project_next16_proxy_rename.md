---
name: next16-proxy-rename
description: This project runs Next.js 16 where middleware.ts is renamed to proxy.ts; affects routing/redirect logic
metadata:
  type: project
---

Next.js 16.2.6 renamed `middleware.ts` → `proxy.ts`. In this repo the next-intl locale middleware (root `/` → `/vi` redirect, locale prefixing) lives in `/proxy.ts` at project root, not `middleware.ts`.

**Why:** Next 16 breaking change (AGENTS.md warns its Next is non-standard — read `node_modules/next/dist/docs/` before coding).
**How to apply:** When planning anything touching routing, redirects, or i18n entry points, look at `proxy.ts` not `middleware.ts`. Any E2E webServer must serve through it (normal `next dev`/`next start` does).
