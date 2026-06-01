---
item_index: 18
item_slug: rename-proxy-ts-to-middleware-ts
track: technical
decision: DROP
---

# Audits

- **Clause:** Next.js 16 requires middleware file named `middleware.ts` at project root
  - **Evidence:** `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` — version-history table, `v16.0.0`: "Middleware is deprecated and renamed to Proxy"; prose states "Create a `proxy.ts` (or `.js`) file in the project root"; migration guide documents codemod `middleware-to-proxy` that renames `middleware.ts` → `proxy.ts`. `middleware.ts` is the **old** name. `proxy.ts` is the required name in Next.js 16.
  - **Verdict:** wrong
- **Clause:** project uses `proxy.ts` which the framework does not auto-detect as middleware (`proxy.ts:1`)
  - **Evidence:** `proxy.ts:1` — file exists at repo root and exports `createMiddleware(routing)` as default plus `config.matcher`. `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md:23` — Next.js 16 explicitly requires `proxy.ts` at project root for auto-detection; this is the correct filename, not a non-standard one. The project file is correctly named and correctly structured.
  - **Verdict:** wrong
- **Clause:** future contributors and automated migration tooling (e.g., Next.js codemods) will fail to locate or process the middleware file (`03-architecture-shape.md:51`)
  - **Evidence:** `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md:751-758` — the Next.js-provided codemod (`npx @next/codemod@canary middleware-to-proxy`) renames `middleware.ts` → `proxy.ts`, i.e. the tooling targets `proxy.ts` as the destination. Renaming to `middleware.ts` would move away from where codemods expect to find it.
  - **Verdict:** wrong
- **Clause:** misnamed file embeds a non-standard label into the code-quality layer of the import graph
  - **Evidence:** `proxy.ts` is the standard Next.js 16 name per official docs. The label is framework-idiomatic, not non-standard.
  - **Verdict:** wrong

# Reason

Check 1 (holistic gate) fires DROP. Every atomic claim in the Need bullet is inverted: in Next.js 16 `proxy.ts` is the official, auto-detected file convention (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`, version history `v16.0.0`); `middleware.ts` is the deprecated predecessor that the official codemod migrates *away from*. Renaming `proxy.ts` → `middleware.ts` would break framework middleware detection entirely. The item's premise is the exact opposite of the truth — no revision can salvage it. All four Need claims are wrong with no nearest supportable alternative; item is not recoverable.
