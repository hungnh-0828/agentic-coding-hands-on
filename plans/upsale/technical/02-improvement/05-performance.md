# Improvement Aspect: Performance — agentic-coding-hands-on
**Use context:** internal

---

- Status: opportunity
- Category: performance
- Observation: `hero-bg.png` (4.3 MB raw PNG) and `login-keyvisual.png` (2.5 MB raw PNG) are served via `next/image` with `priority` and `sizes="100vw"` but no `quality` override and no `formats` configuration in `next.config.ts`. Next.js 16 defaults to WebP only; AVIF (typically 50% smaller than WebP) is not enabled.
- Evidence: `public/home/hero-bg.png` = 4.3 MB (measured); `public/login/login-keyvisual.png` = 2.5 MB; `next.config.ts:10-16` has `images.remotePatterns` only — no `formats`, no `quality`, no `deviceSizes`; `components/hero/hero-section.tsx:19-26` uses `priority sizes="100vw"` without `quality`; `app/[locale]/login/page.tsx:38-43` same pattern.
- Potential improvement: Add `images: { formats: ["image/avif", "image/webp"] }` to `next.config.ts` to enable AVIF serving for browsers that support it (Chrome, Firefox, Safari 16+). Set `quality={80}` on both LCP images. AVIF for a 4.3 MB hero at q80 typically yields < 400 KB — a ~10× reduction with no visual change for an internal audience.
- Customer-value signal: operational efficiency | employee productivity
- Value: medium
- Effort hint: low
- Risk if untouched: Every page load transfers 4.3 MB + 2.5 MB of uncompressed PNG data over the network. On a corporate Wi-Fi or mobile connection, this directly delays LCP and first meaningful paint for all ~employees hitting the platform on launch day. AVIF is already supported natively by Next.js Image — only a config change is needed.

---

- Status: opportunity
- Category: performance
- Observation: Six award-orb PNGs (each ~164–168 KB, 336×336 px declared) are used in `award-card.tsx` without a `sizes` prop. Without `sizes`, Next.js Image generates and serves a full `srcset` based on default `deviceSizes`, potentially shipping 2× or 3× the actual display pixel count to desktop browsers.
- Evidence: `components/awards/award-card.tsx:32-39` — `<Image src={orbSrc} width={336} height={336}>` with no `sizes` attribute; 6 orb files in `public/home/` each 164–168 KB (`du -sh` output); `next.config.ts:6-17` has no `imageSizes` or `deviceSizes` override.
- Potential improvement: Add `sizes="(max-width: 640px) 50vw, 336px"` to the orb `<Image>` in `award-card.tsx`. This gives the browser an accurate hint so it selects the correct srcset candidate, avoiding downloading a 672-px or 1008-px image where 336 px suffices. Combined with AVIF (entry above), total award-section payload drops from ~1 MB to ~150 KB.
- Customer-value signal: employee productivity | operational efficiency
- Value: low
- Effort hint: low
- Risk if untouched: On high-DPR mobile devices the browser may download a 2× srcset candidate (672 px) when 336 px would suffice — double the bytes per orb for no visual gain.

---

- Status: opportunity
- Category: performance
- Observation: `fetchKudosBoard()` fires 6 parallel Supabase queries on every page request to `/sun-kudos` with no Next.js data cache layer. Any navigation to the kudos page — including full-page refresh or inter-locale navigation — incurs a full round-trip to Supabase for all 6 tables.
- Evidence: `lib/kudos/queries.ts:34-41` — `Promise.all([...6 supabase.from(...).select(...)...])` with no `unstable_cache` or `cache()` wrapper; `app/[locale]/sun-kudos/page.tsx:42-45` calls `fetchKudosBoard()` directly in the RSC render path; `lib/kudos/actions.ts:25-27` uses `revalidatePath("/vi/sun-kudos")` on mutation — meaning the intent to cache + invalidate exists in the action layer but the cache itself is never set.
- Potential improvement: Wrap `fetchKudosBoard` in Next.js `unstable_cache` with a `["kudos-board"]` tag and a short `revalidate` (e.g. 30 s). The existing `revalidatePath` calls in `actions.ts` can be replaced with `revalidateTag("kudos-board")` for precise invalidation on write. This converts the hot read path from 6-query fan-out per request to a single cache hit for all concurrent users.
- Customer-value signal: reliability | operational efficiency
- Value: medium
- Effort hint: low
- Risk if untouched: Under concurrent load on event launch day, every user landing on `/sun-kudos` fires 6 database queries. Supabase free/shared tiers have connection limits; a spike of 50 concurrent users each triggering 6 queries = 300 simultaneous DB connections, risking connection exhaustion or rate-limit errors on an internal tool with no horizontal DB scaling (`02-tech-stack.md` — no Redis/ElastiCache, SQS, or connection pool detected).

---

- Status: opportunity
- Category: performance
- Observation: `KudosBoardProvider` is a `"use client"` component with 11 direct consumers. The entire kudos board sub-tree — including static display components like `KudosBanner`, `HighlightSection`, and `SpotlightBoard` — is forced into the client bundle because they are children or consumers of a client context. No static parts of the board are lifted to RSC.
- Evidence: `components/kudos/kudos-board-context.tsx:1` — `"use client"` directive; 11 consumers listed in `03-architecture-shape.md` (spotlight-board, kudos-card, copy-link-button, compose-kudo-modal, kudos-toast, kudos-filters, kudos-sidebar, all-kudos-section, highlight-section, like-button, `app/[locale]/sun-kudos/page.tsx`); `app/[locale]/sun-kudos/page.tsx:52` wraps entire page content in `<KudosBoardProvider>`.
- Potential improvement: Identify display-only components that do not call `useKudosBoard()` (e.g. `KudosBanner`, static layout wrappers) and move them outside the provider or convert them to RSC. For interactive islands (like-button, compose form), keep client boundary but narrow it to the smallest subtree. This reduces the JS shipped to the client for the board's non-interactive sections.
- Customer-value signal: employee productivity | platform capability
- Value: low
- Effort hint: medium
- Risk if untouched: As the kudos board grows (more card types, more filters), the monolithic client context will accumulate state and re-render logic, slowing initial JS parse time. Not urgent at current scale (~6k LOC, internal tool) but architectural technical debt that compounds.

---

- Status: opportunity
- Category: performance
- Observation: No bundle analysis tooling is configured. There is no `@next/bundle-analyzer` in `package.json` and no `ANALYZE` flag in `next.config.ts`. The actual client-side JS bundle composition is unknown — no visibility into which dependencies dominate the bundle or whether tree-shaking is effective.
- Evidence: `next.config.ts:6-17` — no `withBundleAnalyzer` wrapper; `package.json` (all 17 direct deps listed in `02-tech-stack.md`) — no `@next/bundle-analyzer` entry; `04-delivery-operations.md` — no CI/CD pipeline and no build artifact analysis step.
- Potential improvement: Add `@next/bundle-analyzer` as a devDependency and wrap `next.config.ts` with `withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })`. One `ANALYZE=true npm run build` run reveals the actual bundle composition. This is a one-time diagnostic, not a production change — low risk, high informational value before the event launch.
- Customer-value signal: operational efficiency | time-to-market for dependent teams
- Value: low
- Effort hint: low
- Risk if untouched: Without bundle visibility, future dependency additions (e.g. a rich-text editor for kudos compose, a charting lib for admin dashboard) may silently balloon the bundle with no detection mechanism until users complain about slow load times.

---

- Status: opportunity
- Category: performance
- Observation: The compose kudo modal (`ComposeKudoModal`) and its sub-components (editor, image uploader, recipient/hashtag pickers) are imported statically at the top of `sun-kudos/page.tsx`. They are loaded on every kudos board visit even when the user never opens the compose flow.
- Evidence: `app/[locale]/sun-kudos/page.tsx:11-18` — static imports of `ComposeKudoModal`, `ComposeModalProvider`, `SendKudosInput`; `components/kudos/compose/` directory contains multiple subcomponents (`compose-kudo-form.tsx` 168 LOC, `image-uploader.tsx`, editor, pickers); no `dynamic()` or `import()` call found anywhere in `app/` or `components/` (grep confirmed zero results).
- Potential improvement: Wrap `ComposeKudoModal` in `next/dynamic` with `{ ssr: false }` since it is a client-only modal. This defers the modal's JS until the user clicks "Send Kudos", eliminating it from the critical path for board readers. Estimated savings: the compose sub-tree is ~5 files × ~100–170 LOC — likely 15–30 KB of JS deferred.
- Customer-value signal: employee productivity | operational efficiency
- Value: low
- Effort hint: low
- Risk if untouched: Every kudos board visitor — including read-only viewers — downloads and parses compose modal JS. For an internal event platform where most users are consumers not authors, this is wasted parse time on every load.

---

- Status: opportunity
- Category: performance
- Observation: `fetchKudosStats` in `lib/kudos/queries.ts` contains a join-filtered query on `kudos_likes` (`kudos_likes JOIN kudos WHERE kudos.receiver_id = userId`). `kudos_likes` has no secondary index on `kudos_id` beyond the composite PK, and there is no index on the `kudos.receiver_id` column in the `kudos_likes` join path.
- Evidence: `lib/kudos/queries.ts:139-145` — `.from("kudos_likes").select("weight, kudos!inner(receiver_id)").eq("kudos.receiver_id", userId)`; `supabase/migrations/0004_kudos_schema.sql:38-44` — `kudos_likes` table definition with only `primary key (kudos_id, user_id)`, no index on `kudos_id` alone; `kudos_receiver_idx` exists on `kudos` table (`0004_kudos_schema.sql:29`) but the join traversal from `kudos_likes` → `kudos` on `kudos_id` may not use it efficiently without an explicit `kudos_likes.kudos_id` index.
- Potential improvement: Add a migration with `CREATE INDEX kudos_likes_kudos_id_idx ON public.kudos_likes (kudos_id)` to accelerate the join. At current seed scale this is imperceptible, but as kudos volume grows (event runs for days/weeks with potentially hundreds of employees), the join becomes a sequential scan over an unbounded likes table.
- Customer-value signal: reliability | operational efficiency
- Value: low
- Effort hint: low
- Risk if untouched: At scale (e.g. 500 kudos × average 10 likes = 5,000 like rows), the `fetchKudosStats` heart-count query performs a full-scan join on `kudos_likes` for every sidebar render call. Low risk now; medium risk if the platform is reused for future events with higher engagement volume.
