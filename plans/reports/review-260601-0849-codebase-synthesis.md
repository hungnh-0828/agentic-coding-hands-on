# Codebase Review — Synthesis & Verdicts (2026-06-01)

**Target:** Full codebase scan · Next.js 16.2.6 + React 19 + Supabase + next-intl
**Method:** 3 parallel quality reviewers (data/security · auth/i18n/routing · frontend) → 1 adversarial red-team → orchestrator adjudication + independent verification.
**Calibration:** Demo app, intentionally MOCK UI-only auth. Documented `TODO(auth)` deferrals are NOT counted as defects.

Source reports: `reviewer-260601-0849-{data-layer-security,auth-i18n-routing,frontend-components,adversarial}.md`

---

## Verdict summary

| # | Finding | Severity | Verdict | Location |
|---|---------|----------|---------|----------|
| A1 | Stored image-payload amplification DoS (no server-side per-image size check + unbounded board fetch) | **High** | Accept | actions.ts:103, compose-validation.ts:44, queries.ts:38 |
| A2 | No server-side max length on `title`/`content` | Important | Accept | compose-validation.ts:39 |
| A3 | `fetchKudosBoard` unbounded 6-table scan, no LIMIT/cache | Important | Accept | queries.ts:34-41 |
| A4 | Stale `Database` type → 8 `as any` casts (type-safety hole) | Important | Accept | supabase/types.ts:33-48 |
| A5 | `toggleKudosLike` check-then-act race (unique-violation surfaces as error) | Important | Accept | actions.ts:46-70 |
| A6 | `use-compose-form` validity drift: `anonymousName` always `null` in `isValid` | Important | Accept | use-compose-form.ts:32-40 |
| A7 | `image-uploader` index `key={idx}` on removable list → wrong-node reuse | Important | Accept | image-uploader.tsx:50 |
| A8 | `kudos-board-context` stale-closure optimistic rollback + setState-in-render | Important | Accept | kudos-board-context.tsx:63-67,107-165 |
| A9 | `revalidatePath` hardcodes `vi`/`en` instead of `routing.locales` | Minor | Accept | actions.ts:26-27 |
| M1 | DB error `.message` thrown verbatim from server actions | Minor | Defer | actions.ts:59,68,88,111,125 |
| M2 | `admin-dashboard` has no auth guard (renders only "Coming Soon" today) | Minor | Accept | admin-dashboard/page.tsx |
| M3 | Protected pages run DB queries before client auth gate | Minor | Defer | sun-kudos/page.tsx:42, awards-information/page.tsx:70 |
| M4 | `AuthGuard` hardwired to `awardsInfo` i18n namespace | Minor | Accept | auth-guard.tsx:14 |
| M5 | Layout metadata title not locale-aware | Minor | Accept | layout.tsx:20-23 |
| M6 | Hardcoded Vietnamese toast strings bypass `t()` | Minor | Accept | kudos-board-context.tsx:110,119,154 |
| M7 | Silent error swallow (board catch + compensating delete) | Minor | Accept | queries.ts:130, actions.ts:124 |
| M8 | `@supabase/ssr: ^0.10.3` caret on 0.x allows breaking minors | Minor | Accept | package.json:14 |
| V1 | Heart-count embed filter `.eq("kudos.receiver_id", …)` | — | **Verify** | queries.ts:144-145 |

---

## High — fix first

### A1 — Stored image-payload amplification (DoS)
`createKudos` is a directly-callable server action. `assertValidCreateKudosInput` only checks image **count** (≤5); `MAX_IMAGE_BYTES` is enforced **client-side only** (`image-uploader.tsx:26`). Images are stored as base64 data-URLs in a `text[]` column with no DB length constraint. `fetchKudosBoard` then fetches **all** kudos with **no `LIMIT`** on every board load. One attacker insert of 5 large strings is replayed to every visitor → payload amplification / OOM.
**Fix:** in `assertValidCreateKudosInput`, per element require `startsWith("data:image/")` and `byteLength ≤ MAX_IMAGE_BYTES`; add `.limit(N)`/pagination to `fetchKudosBoard`. (Combines data-review #1 + adversarial C1.)

## Important

- **A2** Add `MAX_TITLE_LEN`/`MAX_CONTENT_LEN` and enforce server-side (currently only non-empty checked → 1 MB title accepted & broadcast).
- **A3** Bound + cache the board fetch (`.limit()` / pagination / `revalidate`); amplifies A1 and degrades linearly with data.
- **A4** Add `title,is_anonymous,anonymous_name,image_urls` to `kudos` (mig 0005) and `avatar_url` to `users` (mig 0006) in the `Database` type → deletes all 8 `as any` casts in actions.ts/queries.ts, restoring compile-time safety.
- **A5** Collapse `toggleKudosLike` to one round-trip OR catch PG `23505` unique-violation and treat as "row already existed". Frontend optimistic rollback (A8) compounds this.
- **A6** Pass the real `anonymousName` (matching `toInput()`) into the `isValid` check — currently always `null`, a latent drift that breaks the moment the rule tightens.
- **A7** Use a stable id for the image thumbnail `key` (not array index) so removal doesn't reuse the wrong DOM node.
- **A8** Reconstruct optimistic rollback from the functional-update arg, not a closure snapshot; replace setState-in-render sync with `useEffect`/derived state to survive React 19 concurrent scheduling.

## Minor

- **A9** Iterate `routing.locales` in `revalidateBoard()` (adding a locale otherwise serves a stale board forever).
- **M1** *(Defer)* Next.js redacts thrown server-action messages in **production** builds (generic message + digest), so the schema-name leak is largely dev-only — still cheap to log raw + return generic.
- **M2** Wrap `admin-dashboard` in `AuthGuard` now — harmless today (only renders "Coming Soon") but a trap for the first dev who adds admin queries.
- **M3** *(Defer)* Move data fetches behind the auth decision once real server-side auth lands; today it is wasted SSR work, not a leak (no real PII).
- **M4** Move `AuthGuard`'s `redirectingToLogin` key to a shared/`auth` namespace.
- **M5** Use `generateMetadata` + `getTranslations({ locale })` for a locale-aware title.
- **M6** Route the three hardcoded VI toast strings through `t()`.
- **M7** `console.error` in the board catch and the compensating-delete path (no diagnostics on failure today).
- **M8** Pin `@supabase/ssr` to `~0.10.3` (patch-only) — caret on `0.x` accepts breaking minors.

## Verify (not asserted)

- **V1** Heart-count: `.from("kudos_likes").select("weight, kudos!inner(receiver_id)").eq("kudos.receiver_id", userId)`. Dot-notation filtering on a `!inner` embed **is** valid supabase-js v2 syntax, so this likely works correctly. Confirm with the existing `queries.test.ts` or an integration row-count assertion before changing anything — flagged because the reviewer could not run a live DB.

---

## Attacks attempted that the code correctly blocks (verified safe)

- **XSS** via `content`/`title`/`anonymousName` — React text nodes, no `dangerouslySetInnerHTML` in the kudos tree.
- **XSS** via `image_urls` `javascript:`/`data:text/html` — Next/Image passes non-http URLs straight to `<img src>`, which does not execute.
- **Self-kudos** (`receiverId == SENDER_ID`) — blocked by validator + DB `sender_not_receiver` constraint.
- **Duplicate / empty hashtagSlugs** — blocked (`length !== resolved` and `length < 1` throw).
- **`anonymousName` leak when `isAnonymous=false`** — explicitly nulled.
- **Non-existent `receiverId`** — DB FK rejects (message leak noted in M1).

## Known deferrals (documented, not defects)

Mock UI-only auth · `SENDER_ID` hardcoded · `userId` from caller in `toggleKudosLike` · permissive demo write RLS (RLS **is** enabled on all kudos tables) · mocked prize-box counts. No secrets committed; `.env*` gitignored; `config.toml` uses `env(...)` substitution.

## Unresolved questions

1. Does the deployment's Supabase plan cap `text[]` row size at the DB layer, or is A1 unbounded server-side? (Mitigate at app layer regardless.)
2. V1 heart-count: confirm against a live DB / the existing test before acting.
