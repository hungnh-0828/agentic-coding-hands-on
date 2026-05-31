# Phase 4 — kudos actions (Supabase + cache mock)

Priority: P2 | Status: completed | Mock: `@/lib/supabase/server` + `next/cache`.

## File to create
- `lib/kudos/__tests__/actions.test.ts`

## Source facts (`lib/kudos/actions.ts`, "use server")
- Imports: `revalidatePath` from `next/cache`; `createClient` from `@/lib/supabase/server`; `assertValidCreateKudosInput` from `./compose-validation` (REAL — do not mock); `CreateKudosInput` type.
- `SENDER_ID = "00000000-0000-0000-0000-000000000001"`.
- `revalidateBoard()` calls `revalidatePath("/vi/sun-kudos")` AND `revalidatePath("/en/sun-kudos")` (2 calls).

### toggleKudosLike(kudosId, userId)
1. `from("kudos").select("sender_id").eq("id",kudosId).maybeSingle()` → `{data: kudos}`.
2. If `kudos?.sender_id === userId` → throw `Error("Sender cannot like own kudos")` (no revalidate).
3. `from("kudos_likes").select("kudos_id").eq("kudos_id",kudosId).eq("user_id",userId).maybeSingle()` → `{data: existing}`.
4. If existing → `from("kudos_likes").delete().eq("kudos_id",kudosId).eq("user_id",userId)` → `{error}`; if delError throw `Error(delError.message)`; else revalidateBoard, return `{liked:false}`.
5. Else → `from("kudos_likes").insert(row)` → `{error}`; if insError throw `Error(insError.message)`; else revalidateBoard, return `{liked:true}`.
   - row = `{ kudos_id, user_id, weight:1 }`.

### createKudos(input)
1. `assertValidCreateKudosInput(input, SENDER_ID)` — throws before any DB (REAL validation).
2. `from("hashtags").select("id, slug").in("slug", hashtagSlugs)` → `{data: tagRows, error: tagError}`; tagError throw `Error(tagError.message)`.
3. If `!tagRows || tagRows.length !== hashtagSlugs.length` → throw `Error("One or more hashtags are invalid")`.
4. `from("kudos").insert(kudosRow).select("id").single()` → `{data:{id}, error}`; kudosError throw `Error(kudosError.message)`. id = data.id.
   - kudosRow: title/content trimmed, sender_id=SENDER_ID, is_anonymous, anonymous_name = isAnonymous ? (anonymousName ?? null) : null, image_urls.
5. `from("kudos_hashtags").insert(linkRows)` → `{error: linkError}`. linkRows = tagRows.map(t => ({kudos_id:id, hashtag_id:t.id})).
6. If linkError → COMPENSATING: `from("kudos").delete().eq("id", id)` then throw `Error(linkError.message)`.
7. revalidateBoard(); return `{id}`.

## Mock setup
```ts
import { vi, beforeEach } from "vitest";
const createClient = vi.fn();
const revalidatePath = vi.fn();
vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("next/cache", () => ({ revalidatePath }));
import { toggleKudosLike, createKudos } from "../actions";
beforeEach(() => { revalidatePath.mockClear(); createClient.mockReset(); });
```
Build a fake `supabase` where `from(table)` returns a chainable stub. Each chain method returns `this` except terminals (`maybeSingle`, `single`, awaited `delete().eq()`, awaited `insert(...)`) which resolve `{data,error}`. Route per table + per call when a table is hit multiple times (kudos appears in select-sender, insert, and compensating delete). Suggested: a builder factory returning objects with `select/eq/in/insert/delete/maybeSingle/single` where you queue results. Track `revalidatePath` call count (expect 2 per successful mutation).

VALIDATION: a `createClient` that throws is NOT needed for createKudos validation tests — `assertValidCreateKudosInput` throws first, before `await createClient()`. Confirm createClient NOT called for invalid input.

## Test cases — toggleKudosLike
- [x] Reject self-like: kudos.sender_id === userId → throws "Sender cannot like own kudos"; revalidatePath NOT called.
- [x] Create like (no existing): existing null, insert no error → returns `{liked:true}`; insert called with `{kudos_id,user_id,weight:1}`; revalidatePath called 2x.
- [x] Delete like (existing present): existing truthy, delete no error → returns `{liked:false}`; revalidatePath 2x.
- [x] Insert error → throws with insError.message; revalidatePath NOT called.
- [x] Delete error → throws with delError.message; revalidatePath NOT called.
- [x] sender_id differs (not self) → proceeds normally.

## Test cases — createKudos
- [x] Invalid input (e.g. receiverId===SENDER_ID) → throws "Invalid receiver..."; createClient NOT called (assert `createClient` mock not invoked).
- [x] tagError → throws tagError.message.
- [x] Unknown slug: hashtagSlugs length 2 but tagRows length 1 → throws "One or more hashtags are invalid".
- [x] tagRows null → throws "One or more hashtags are invalid".
- [x] Happy path: 1 slug → 1 tagRow, kudos insert returns id, link insert ok → returns `{id}`; link insert called with `[{kudos_id:id, hashtag_id:tagRow.id}]`; revalidatePath 2x.
- [x] kudosError on insert → throws kudosError.message; no compensating delete (insert failed before id).
- [x] Compensating delete: linkError set → `from("kudos").delete().eq("id", id)` invoked, then throws linkError.message; revalidatePath NOT called.
- [x] title/content trimmed in kudosRow (assert insert payload trimmed); anonymous_name null when isAnonymous false even if anonymousName provided.

## Risks
- R2: `from("kudos")` hit up to 3 paths (select-sender in toggle; insert + delete in create). Mitigation: per-test fake client returns table-specific chain; for createKudos compensating-delete test, the `from("kudos")` insert returns id and a later `from("kudos")` delete is asserted called.

## Success criteria
Every throw path asserts exact message; every success path asserts return value + revalidatePath call count (2); compensating delete verified; validation short-circuit (no createClient) verified.
