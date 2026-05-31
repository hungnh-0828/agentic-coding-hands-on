# Phase 3 — kudos queries (Supabase mock)

Priority: P2 | Status: completed | Mock: `@/lib/supabase/server`.

## File to create
- `lib/kudos/__tests__/queries.test.ts`

## Source facts (`lib/kudos/queries.ts`)
- Imports `createClient` from `@/lib/supabase/server`; `heroRankFromReceived` from `./hero-badge` (REAL, do not mock).
- `EMPTY = { kudos:[], hashtags:[], departments:[], totalKudos:0, receiverNames:[], people:[] }`.

### fetchKudosBoard() call shape — `Promise.all` of 6 calls, each `supabase.from(T).select(cols)`:
1. `from("users").select("id, display_name, department_id, avatar_url")`
2. `from("departments").select("id, slug, name")`
3. `from("hashtags").select("id, slug, label")`
4. `from("kudos").select("id, sender_id, receiver_id, title, content, created_at, is_anonymous, anonymous_name, image_urls")`
5. `from("kudos_hashtags").select("kudos_id, hashtag_id")`
6. `from("kudos_likes").select("kudos_id, user_id, weight")`
- Each `.select(...)` resolves to `{ data, error }` (await on the builder directly — `.select` returns a thenable/Promise here).
- Guard: `if (kudosRes.error || !kudosRes.data) return EMPTY`.
- Transform: receivedCountById (count per receiver_id), userById (KudosPerson via heroRankFromReceived), dept lookup, hashtag-by-kudos, likes-by-kudos, kudos sorted `Date.parse(b.createdAt)-Date.parse(a.createdAt)` (newest first), kudos with missing sender OR receiver in userById are dropped (`return null` → filtered).
- Output: name fallback `"Sunner"` when display_name null; departmentSlug/Name null when no dept; imageUrls `[]` when null; title `""` when null; isAnonymous false / anonymousName null fallbacks.

### fetchKudosStats(userId) — `Promise.all` of 3 calls:
1. `from("kudos").select("id",{count:"exact",head:true}).eq("receiver_id",userId)` → `{count}`
2. `from("kudos").select("id",{count:"exact",head:true}).eq("sender_id",userId)` → `{count}`
3. `from("kudos_likes").select("weight, kudos!inner(receiver_id)").eq("kudos.receiver_id",userId)` → `{data:[{weight}]}`
- hearts = sum of `row.weight ?? 1`. received/sent = `count ?? 0`. boxesOpened=3, boxesUnopened=2 (hardcoded).
- catch → `{received:0,sent:0,hearts:0,boxesOpened:0,boxesUnopened:0}`.

## Mock setup
```ts
import { vi } from "vitest";
const createClient = vi.fn();
vi.mock("@/lib/supabase/server", () => ({ createClient }));
import { fetchKudosBoard, fetchKudosStats } from "../queries";
```
Build a fake client per test. For BOARD, `.from(table)` returns object whose `.select()` resolves the row-set for that table — route by table name:
```ts
const board = (rows: Record<string, {data?:unknown;error?:unknown}>) => ({
  from: (t: string) => ({ select: () => Promise.resolve(rows[t] ?? { data: [] }) }),
});
createClient.mockResolvedValue(board({...}));
```
For STATS, `.select()` must return a chainable `.eq()` that resolves to `{count}` or `{data}`:
```ts
const sel = (res:unknown) => ({ select: () => ({ eq: () => Promise.resolve(res) }) });
// from("kudos") is called twice (receiver then sender). Use mockReturnValueOnce sequence
// OR a from() that returns count by inspecting call order. Track call index.
```
Note: `from("kudos")` appears twice in stats with different eq results → use an index counter inside `from` to return recvRes then sentRes; `from("kudos_likes")` returns the heart rows. Keep per-test (KISS).

## Test cases — fetchKudosBoard
- [x] Happy path: 2 users (one with dept, one without), 1 dept, 2 hashtags, 2 kudos linking sender/receiver → returns kudos length 2, totalKudos 2, people length 2.
- [x] receivedCountById drives hero badge: give a receiver 10 received kudos → that person `starCount:1, badge:"rising"` (verify heroRankFromReceived wired).
- [x] Sort newest-first: kudos with createdAt "2025-01-01" and "2025-06-01" → result[0].createdAt is the June one.
- [x] Drops kudos whose sender_id/receiver_id not in users (missing receiver → that kudos excluded; totalKudos reflects drop).
- [x] display_name null → person.name === "Sunner".
- [x] department null → departmentSlug null, departmentName null.
- [x] image_urls null → post.imageUrls === []; title null → "".
- [x] hashtags joined: a kudos linked to hashtag id resolves to {slug,label}; unknown hashtag_id link is skipped.
- [x] likes joined: like rows grouped under correct kudos with {userId,weight}.
- [x] receiverNames is de-duplicated set of receiver names.
- [x] kudosRes.error truthy → returns EMPTY (deep equal to EMPTY).
- [x] kudosRes.data null → returns EMPTY.
- [x] createClient throws → catch returns EMPTY.

## Test cases — fetchKudosStats
- [x] counts: recv count 5, sent count 3 → received 5, sent 3.
- [x] hearts: like rows [{weight:2},{weight:3}] → hearts 5.
- [x] hearts weight fallback: row {weight: null/undefined} counts as 1.
- [x] count null → received/sent 0.
- [x] boxesOpened 3, boxesUnopened 2 always (happy path).
- [x] createClient throws → all-zero object incl boxes 0/0.

## Risks
- R2: stats `from("kudos")` double-call order. Mitigation: implement `from` with an internal index, asserted by the two distinct counts test.

## Success criteria
All branches (happy, drop, fallbacks, sort, both error paths) asserted with real expected values.
