# Data Layer & Security Review — 2026-06-01

**Scope:** lib/kudos/{actions,queries,compose-validation,types,hero-badge}.ts · lib/supabase/{server,client,types}.ts · lib/event.ts · proxy.ts · supabase/migrations/0001-0006 · supabase/seed.sql · supabase/config.toml · .gitignore

---

## Critical

None.

---

## Important

### 1. `image_urls` stored as data URLs with no per-item size guard in the server action
**`lib/kudos/actions.ts:103` / `lib/kudos/compose-validation.ts:11,44`**

`MAX_IMAGE_BYTES` (2 MB) is exported and documented as the per-image cap, but `assertValidCreateKudosInput` (the server-side gate) only checks the count (`imageUrls.length > MAX_IMAGES`). It never checks the byte length of individual URLs. A client can bypass the UI guard and POST up to 5 arbitrarily large base64 strings into the `image_urls text[]` column, inflating the kudos row without limit.

Fix: in `assertValidCreateKudosInput`, iterate `input.imageUrls` and throw if any entry's byte length exceeds `MAX_IMAGE_BYTES`.

```ts
for (const url of input.imageUrls) {
  if (Buffer.byteLength(url, "utf8") > MAX_IMAGE_BYTES)
    throw new Error("One or more images exceed the 2 MB limit");
}
```

---

### 2. `toggleKudosLike` is a check-then-act race condition
**`lib/kudos/actions.ts:46-70`**

Two concurrent requests for the same `(kudosId, userId)` can both read `existing = null`, then both attempt to INSERT. The second insert succeeds because `kudos_likes` has a composite PK, which will cause a unique-constraint error (`insError`) — the error is propagated as a thrown exception, so the UI gets an error state on one of the two concurrent requests. This is not silent data corruption, but the UX breakage is real. A single `INSERT ... ON CONFLICT DO DELETE / DO NOTHING` pattern would collapse both code paths and be atomic.

Fix (idiomatic, single round-trip):
```sql
-- via RPC or raw upsert; alternatively:
INSERT INTO kudos_likes (kudos_id, user_id, weight)
VALUES ($1, $2, 1)
ON CONFLICT (kudos_id, user_id) DO DELETE  -- not standard SQL
```
Or in Supabase, use an upsert + a separate delete, guarded by the constraint. Minimum fix: wrap in try/catch that detects the `23505` unique-violation error code and return `{ liked: false }` (treat constraint violation = row already existed → the parallel insert "won").

---

### 3. `lib/supabase/types.ts` — `kudos` Row type is stale (missing 4 columns)
**`lib/supabase/types.ts:33-48`**

Migrations 0005 added `title`, `is_anonymous`, `anonymous_name`, `image_urls` to `kudos`; migration 0006 added `avatar_url` to `users`. The `Database` type's `kudos.Row` still only has `{id, sender_id, receiver_id, content, created_at}` — the 4 new columns are absent. This is why `actions.ts` and `queries.ts` use `as any` casts: without these fields in the type, the SDK rejects the insert shape. The casts paper over the schema drift rather than fix it.

Impact: type errors that should be caught at compile time silently pass; future refactors that rely on `Database["public"]["Tables"]["kudos"]["Row"]` will get incorrect IntelliSense.

Fix: add `title`, `is_anonymous`, `anonymous_name`, `image_urls` to `kudos.Row` and `kudos.Insert`; add `avatar_url` to `users.Row` and `users.Insert`. This removes the need for all four `as any` casts in actions and queries.

---

### 4. `fetchKudosStats` — heart count filter likely broken (PostgREST join filter syntax)
**`lib/kudos/queries.ts:144-145`**

```ts
.select("weight, kudos!inner(receiver_id)")
.eq("kudos.receiver_id", userId)
```

PostgREST's embedded-resource filter uses the format `.eq("kudos.receiver_id", value)` only when using the `filter()` method, or as a query param. When called via the Supabase JS v2 `.eq()` chainable, the column reference must be a top-level column name — referencing a joined column as `"kudos.receiver_id"` may silently be ignored, returning all likes instead of only those on kudos received by `userId`. This would inflate the `hearts` stat.

Verify: test that `heartRes` actually filters correctly. If not, use a Postgres function or a raw filter: `.filter("kudos.receiver_id", "eq", userId)` (which is the documented PostgREST syntax for embedded filters in the JS client).

---

## Minor

### 5. Compensating delete ignores its own error
**`lib/kudos/actions.ts:124`**

```ts
await supabase.from("kudos").delete().eq("id", id);
```
Error from the compensating delete is swallowed. If the rollback fails, the orphaned kudos row remains. For a demo this is acceptable, but worth a `console.error` at minimum so it shows up in server logs.

---

### 6. `revalidatePath` hardcodes only `vi` and `en` locales
**`lib/kudos/actions.ts:26-27`**

Locale list is duplicated here rather than derived from `routing.locales`. Adding a third locale in `lib/i18n/routing.ts` would not revalidate its board path. Low-risk (only 2 locales currently), but brittle.

Fix: `import { routing } from "@/lib/i18n/routing"` and iterate `routing.locales`.

---

### 7. `users` table RLS: no write policy, but seed inserts via direct DB connection
**`supabase/migrations/0002_rls_policies.sql:14-16`**

Only a SELECT policy exists for `users`. No INSERT/UPDATE policy. Seed runs via `psql`/superuser (bypasses RLS) — this is fine. But any future server action that tries to upsert user profile data via the anon key will silently fail. Document or add a `TODO(auth)` note in `0002`.

---

### 8. Filler kudos in seed.sql omit `title` column
**`supabase/seed.sql:88-116`**

The three `generate_series` inserts do not specify `title`. Migration 0005 adds `title text NOT NULL DEFAULT ''`, so they'll get the empty-string default — valid but intentional. Worth a comment in seed.sql to make the omission explicit (`-- title intentionally omitted: defaults to ''`).

---

### 9. `fetchKudosBoard` silently eats all errors
**`lib/kudos/queries.ts:130-132`**

The outer `catch` returns `EMPTY` on any exception, including network errors and schema mismatches. Nothing is logged. Transient DB failures render the board permanently empty with no diagnostics. Add at minimum `console.error(e)` inside the catch.

---

## Secrets / Config Hygiene

- `.gitignore` correctly excludes `.env*` — no `.env.local` is tracked. Clean.
- `config.toml` uses `env(...)` substitution for all sensitive values (`OPENAI_API_KEY`, `SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN`, `S3_*`). No hardcoded secrets found.
- No API keys in source files.

---

## Known Deferrals (verified documented)

- `actions.ts:22-23` — `SENDER_ID` hardcoded; `TODO(auth)` comment present.
- `actions.ts:31-32` — `userId` taken from caller in `toggleKudosLike`; `TODO(auth)` comment present.
- `0005_compose_kudos.sql:4` — permissive write RLS; `TODO(auth)` comment present.
- `queries.ts:155-156` — `boxesOpened/boxesUnopened` mocked; comment present.

---

## Unresolved Questions

1. **Finding #4 (heart count filter):** Does `.eq("kudos.receiver_id", userId)` actually filter the join correctly in `@supabase/ssr` v2? Needs an integration test against real DB to confirm. If broken, `hearts` always returns the sum of all likes in the DB.
2. **`image_urls` column type:** `text[]` has no per-element length limit in Postgres. Is there a Supabase storage / PostgREST max-row-size guard in place for this deployment, or is mitigation purely application-layer?
