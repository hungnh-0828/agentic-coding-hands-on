---
item_index: 10
item_slug: cache-kudos-board-data-with-next-js-unstable-cache
track: technical
decision: REVISE
---

# Audits

- **Clause:** `fetchKudosBoard()` fires 6 parallel Supabase queries on every page request with no Next.js data cache layer (`lib/kudos/queries.ts:34-41`)
  - **Evidence:** `lib/kudos/queries.ts:34-41` — `Promise.all([...6 supabase.from(...).select(...)...])` with no `unstable_cache`, `use cache`, or any cache wrapper; confirmed by grep on the live file returning 0 hits for `unstable_cache|use cache|cache(`.
  - **Verdict:** correct

- **Clause:** `lib/kudos/actions.ts:25-27` uses `revalidatePath` on mutation — intent to cache + invalidate exists but cache is never set
  - **Evidence:** `lib/kudos/actions.ts:25-27` — `revalidateBoard()` helper calls `revalidatePath("/vi/sun-kudos")` (line 26) and `revalidatePath("/en/sun-kudos")` (line 27); no `revalidateTag` or cache setter found anywhere in the file or queries.ts. The "intent to cache + invalidate exists but cache is never set" characterisation is accurate.
  - **Verdict:** correct

- **Clause:** `app/[locale]/sun-kudos/page.tsx:42-45` calls `fetchKudosBoard()` directly in the RSC render path
  - **Evidence:** `app/[locale]/sun-kudos/page.tsx:42-44` — `const [board, stats] = await Promise.all([fetchKudosBoard(), fetchKudosStats(...)])` in the RSC render body; line numbers are 42-44 not 42-45, but the claim is materially correct.
  - **Verdict:** correct

# Reason

Check 1 (holistic) — item is coherent and all Need citations resolve against the live repo. The problem (uncached 6-query fan-out) and the intent evidence (`revalidatePath` in actions) are both verified correct. Check 1 returns KEEP with one recoverable issue: the proposed solution names `unstable_cache`, which Next.js 16.2.6 docs (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/unstable_cache.md`) explicitly supersede — *"This API has been replaced by `use cache` in Next.js 16."* Using a deprecated-in-v16 API as the prescribed fix is a stack-native correctness issue recoverable via REVISE: update the solution to use the `'use cache'` directive + `cacheTag()` + `revalidateTag()` pattern, which is the idiomatic Next.js 16 equivalent. The title retains the intent but should drop the `unstable_cache` API name to avoid prescribing the stale API.

# Revised item

## Cache kudos board data with Next.js `use cache`

- **Value:** medium
- **Need:** `fetchKudosBoard()` fires 6 parallel Supabase queries on every page request with no Next.js data cache layer; `lib/kudos/actions.ts:25-27` uses `revalidatePath` on mutation — intent to cache + invalidate exists but cache is never set (`lib/kudos/queries.ts:34-41`; `app/[locale]/sun-kudos/page.tsx:42-44`).
- **Benefits:** Converts the hot read path from 6-query fan-out per request to a single cache hit for all concurrent users. Prevents connection exhaustion on Supabase free/shared tiers at event launch day concurrency (50 users × 6 queries = 300 simultaneous DB connections).
- **Proposed solution:** Add `'use cache'` directive and `cacheTag("kudos-board")` inside `fetchKudosBoard` in `lib/kudos/queries.ts` (the idiomatic Next.js 16 caching API — `unstable_cache` is superseded in Next.js 16 per framework docs). Set a `cacheLife` of 30 s. Replace `revalidatePath` calls in `actions.ts` with `revalidateTag("kudos-board")` for precise invalidation on write. Enable `cacheComponents: true` in `next.config.ts` as required by the `'use cache'` + `cacheTag` API. Targeted change to `lib/kudos/queries.ts`, `lib/kudos/actions.ts`, and `next.config.ts`.
- **Effort hint:** low
