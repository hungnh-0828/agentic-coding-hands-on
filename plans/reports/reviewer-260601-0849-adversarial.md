# Adversarial Red-Team Review — 2026-06-01

## Scope
- lib/kudos/actions.ts, compose-validation.ts, queries.ts
- components/kudos/kudos-image-gallery.tsx, kudos-card.tsx, person-block.tsx, image-uploader.tsx
- app/[locale]/admin-dashboard/page.tsx, supabase/migrations/0004+0005

---

## NEW Critical

### C1 — imageUrls: per-element content/byte-size not validated in server action → stored payload amplification

**Scenario:** Attacker calls `createKudos` directly with `imageUrls: Array(5).fill("A".repeat(10_000_000))` (50 MB arbitrary strings). `assertValidCreateKudosInput` only checks `.length > MAX_IMAGES` (count ≤ 5); it never inspects element content or byte size.

**Code path:**
- `compose-validation.ts:44` — `if (input.imageUrls.length > MAX_IMAGES) throw` — count only
- `compose-validation.ts:11` — `MAX_IMAGE_BYTES` defined but **only consumed by the client-side `ImageUploader`** (`image-uploader.tsx:26`)
- `actions.ts:103` — `image_urls: imageUrls` stored verbatim into `text[]` column (no DB constraint on element length, `0005_compose_kudos.sql:10`)

**Impact:** Each malicious row bloats `image_urls` indefinitely. `fetchKudosBoard` (`queries.ts:38`) fetches **all rows unbounded** — no `limit`, no pagination — on every page load (RSC, no cache config). One attacker insert forces every subsequent board visitor to receive the full payload. 5 rows × 50 MB = 250 MB per request → server OOM / Supabase row-limit error at best, continuous DoS for all users at worst.

**Fix:** In `assertValidCreateKudosInput`, add per-element validation:
```ts
if (input.imageUrls.some(u => !u.startsWith('data:image/') || u.length > MAX_IMAGE_BYTES * 1.4)) {
  throw new Error("Invalid image data");
}
```
(Base64 overhead ~1.37×). Also add `.limit(100)` or pagination to `fetchKudosBoard`.

---

## NEW Important

### I1 — No max length on `title` / `content` server-side → stored XSS-adjacent DoS

**Scenario:** Attacker calls `createKudos` with `title: "A".repeat(1_000_000)`. `assertValidCreateKudosInput` (`compose-validation.ts:39`) only checks `!title.trim()` — no upper bound. Stored in `text` column (no `varchar(N)`, `0005_compose_kudos.sql:7`).

**Impact:** 1 MB title × N kudos → inflated `fetchKudosBoard` response payload sent to all visitors. Also renders inside `<h3>` in `kudos-card.tsx:64` — React escapes it safely (no XSS) but the payload still travels to every client and may break card layout.

**Fix:** Add `MAX_TITLE_LEN`/`MAX_CONTENT_LEN` constants (e.g. 200/2000 chars) to `compose-validation.ts` and check in `assertValidCreateKudosInput`.

### I2 — DB error messages propagated verbatim to callers

**Scenario:** Attacker sends `receiverId` of a non-existent UUID → FK constraint fires on Supabase insert → `actions.ts:111` `throw new Error(kudosError.message)`. Supabase error messages include constraint names (`sender_not_receiver`), table names, and column names.

**Code path:** `actions.ts:59,68,88,111,125` — all five DB error paths forward raw `error.message`.

**Impact:** Internal schema details leaked to callers in production error responses. In Next.js, thrown errors from server actions are serialised; message reaches the client.

**Fix:** Map DB errors to generic user-facing messages; log raw error server-side only.

### I3 — `fetchKudosBoard`: unbounded full-table scan across 6 tables on every page load

**Scenario:** With normal usage growth (thousands of kudos), every page load issues 6 parallel `SELECT *` with no `LIMIT`, `OFFSET`, or cache. `queries.ts:34–41` uses `Promise.all` over all 6 tables. No `unstable_cache`, no `revalidate`, no pagination.

**Impact:** Linear degradation with data volume; `image_urls` payload makes this worse (C1). Supabase free-tier row limits (1000 rows default) may silently truncate results without error.

**Fix:** Add `limit`/pagination to kudos fetch; use `unstable_cache` or `revalidate` for the board data.

---

## NEW Minor

### M1 — `admin-dashboard` has no auth guard

**Scenario:** GET `/en/admin-dashboard` is accessible by any anonymous user.

**Verified impact:** `app/[locale]/admin-dashboard/page.tsx` renders only i18n strings ("Coming Soon") — **no DB reads, no sensitive data**. The route is guarded only by obscurity. Impact is low now but the route is a future trap: any developer adding real admin queries will assume the guard was already in place.

**Fix:** Add `<AuthGuard>` wrapper or middleware redirect before the route accumulates real functionality.

### M2 — `@supabase/ssr: "^0.10.3"` allows breaking minor updates at 0.x semver

`package.json:14` — caret on `0.x` means any `^0.10.x` → `0.99.x` is accepted. At `0.x`, semver convention allows breaking changes on minor bumps.

**Fix:** Pin to exact version or `~0.10.3` (patch-only).

---

## Attacks Attempted That the Code Correctly Blocks

- **Duplicate hashtagSlugs bypass** (`["foo","foo"]`): length check passes (2 ≤ 5) but `.in("slug", [...])` deduplicates SQL results → `tagRows.length(1) !== hashtagSlugs.length(2)` → throws. Correctly blocked at `actions.ts:91`.
- **Self-kudos** (`receiverId == SENDER_ID`): blocked by `assertValidCreateKudosInput:36` and DB `sender_not_receiver` constraint.
- **XSS via title/content**: React renders as text nodes; no `dangerouslySetInnerHTML` anywhere in the kudos component tree.
- **XSS via `imageUrls` with `javascript:` or `data:text/html`**: `Next/Image` client (`get-img-props.js:270`) treats non-http URLs as `unoptimized → src` passed to `<img>` directly; `<img src="javascript:...">` does not execute scripts; `<img src="data:text/html,...">` opens as broken image, not a frame. SVG in `<img>` tags does not execute inline scripts in modern browsers.
- **`imageUrls` with external HTTP URLs not in `remotePatterns`**: optimizer (`image-optimizer.js:597`) rejects → broken image only; no SSRF since optimizer is server-side.
- **`anonymousName` leaking when `isAnonymous=false`**: `actions.ts:102` explicitly nulls it; `kudos-card.tsx:33` falls back to `t("anonymous")` if null. Safe.
- **Empty `hashtagSlugs`**: `assertValidCreateKudosInput:41` — length < 1 throws.
- **Non-existent `receiverId`**: DB FK rejects → error thrown (though message leaks, per I2).
- **Admin dashboard exposing sensitive DB data**: confirmed no DB reads in that page.

---

## Unresolved Questions

1. Does Supabase enforce a max row size for `text[]` columns in this project's plan, or is C1 actually unbounded at the DB layer?
2. Are Next.js server action errors sanitised by the framework before reaching the browser in production builds, or does `error.message` reach the client as-is?
