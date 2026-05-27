# Phase 02 — Types + Queries (people, title) + `createKudos` action

Track: B (backend) · Priority: P1 · Status: completed · Blocked by: 01

## Context
- `lib/kudos/types.ts`: has `KudosPerson`, `KudosBoardData`, `KudosPost`. Need recipient candidate list + optional `title`.
- `lib/kudos/queries.ts`: `fetchKudosBoard` already builds `userById` Map<id, KudosPerson>. Cheap to also expose all people.
- `lib/kudos/actions.ts`: `toggleKudosLike` — mirror its pattern (plain async server fn, `as any` cast for insert, `revalidateBoard()` both locales). NOT FormData (KISS, matches codebase).
- Sender DEMO id `00000000-0000-0000-0000-000000000001`; exclude from recipient list.

## Files
- Modify: `lib/kudos/types.ts`, `lib/kudos/queries.ts`, `lib/kudos/actions.ts`
- Read: existing three above + `lib/supabase/server.ts` (createClient)

## Implementation steps
### types.ts
1. Add `title: string` to `KudosPost` (board card may show later; queries will select it).
2. Add `people: KudosPerson[]` to `KudosBoardData` (recipient/@mention source).
3. Add `CreateKudosInput` type:
   ```ts
   export type CreateKudosInput = {
     receiverId: string;
     title: string;
     content: string;
     hashtagSlugs: string[];   // 1..5
     imageUrls: string[];      // 0..5 data URLs
     isAnonymous: boolean;
     anonymousName: string | null;
   };
   ```

### queries.ts
4. Add `title` to the `kudos` select and to `KudosRow`; map into `KudosPost.title`.
5. Build `people`: `Array.from(userById.values())` (all Sunners). Add to returned `KudosBoardData` and to `EMPTY` (`people: []`). Do NOT exclude sender here — exclude in the UI (board may want full list elsewhere). Document this.
6. Keep the file lean; reuse existing maps (DRY).

### actions.ts — `createKudos`
7. New exported `async function createKudos(input: CreateKudosInput)`:
   - `const SENDER_ID = "00000000-0000-0000-0000-000000000001";` (top const; comment TODO(auth)).
   - Server-side validation (defensive — UI also validates):
     - `receiverId` non-empty AND `!== SENDER_ID` (guards `sender_not_receiver`). Throw on violation.
     - `title.trim()` non-empty.
     - `content.trim()` non-empty.
     - `hashtagSlugs.length` between 1 and 5.
     - `imageUrls.length` ≤ 5.
   - Resolve hashtag ids: `supabase.from("hashtags").select("id, slug").in("slug", hashtagSlugs)`. Throw if none resolved.
   - Insert kudos row (cast via `as any` like the like action):
     `{ sender_id, receiver_id, title, content, is_anonymous, anonymous_name, image_urls }` → `.select("id").single()`. Throw on error.
   - Insert `kudos_hashtags` rows for resolved ids: `[{ kudos_id, hashtag_id }, ...]`. Throw on error (consider best-effort: if hashtag insert fails after kudos insert, log; do not orphan — acceptable for demo, note as risk).
   - `revalidateBoard()` (reuse existing helper; export or duplicate the two `revalidatePath` calls — reuse existing one in file).
   - Return `{ id }`.
8. Keep under 200 lines total for actions.ts; if tight, that's fine (still small).

## Data flow
`createKudos(input)` ← modal submit (phase-05). Validates → INSERT kudos → INSERT kudos_hashtags → revalidate `/vi/sun-kudos` + `/en/sun-kudos` → returns new id. Next render of board includes the post (queries now select title; receiver/sender resolved via people map).

## Todo
- [ ] Add `title` to `KudosPost`; `people` to `KudosBoardData` (+ EMPTY); `CreateKudosInput`
- [ ] queries: select+map `title`; expose `people`
- [ ] action: SENDER_ID const + validation
- [ ] action: resolve hashtag ids by slug
- [ ] action: insert kudos + kudos_hashtags
- [ ] action: revalidate both locales, return id
- [ ] `npx tsc --noEmit` clean

## Success criteria
- `fetchKudosBoard()` returns `people` (all Sunners) and `KudosPost.title`.
- `createKudos` with valid input inserts 1 kudos + N hashtag links; board shows it after revalidate.
- Invalid input (receiver==sender, empty title/content, 0 or >5 hashtags) throws before any insert.
- TypeScript compiles; no new `any` beyond the existing insert-cast pattern.

## Risk assessment
| Risk | L×I | Mitigation |
|------|-----|-----------|
| Supabase generic loses insert types | High×Low | Reuse existing `as any` cast pattern from toggleKudosLike |
| Partial write (kudos ok, hashtags fail) | Low×Med | Validate hashtags resolve BEFORE kudos insert; note demo-acceptable, log on link failure |
| `sender_not_receiver` violation crashes insert | Med×High | Validate `receiverId !== SENDER_ID` server-side AND exclude in UI |
| Selecting `title` before migration applied | Med×High | Hard dep on phase-01; success criteria re-checks column |

## Backwards compatibility
`KudosPost.title` added as required string — existing board card code unaffected (doesn't read it). `people` additive. No breaking change to `toggleKudosLike`.

## Security
Server-side validation independent of UI (server functions are POST-reachable). TODO(auth): derive sender from session, tighten RLS.

## Next
Unblocks phase-05 integration.
