# Improvement Aspect: Error Handling — agentic-coding-hands-on
**Use context:** internal

---

- Status: opportunity
- Category: error-handling
- Observation: No Next.js App Router error boundaries (`error.tsx`, `not-found.tsx`, `global-error.tsx`) exist in any route segment. Unhandled server-component exceptions bubble up to the framework default white-screen crash.
- Evidence: `find app -name "error.tsx" -o -name "not-found.tsx" -o -name "global-error.tsx"` returned empty. All route files are `page.tsx`/`layout.tsx` only — confirmed by full `app/[locale]/` listing (03-architecture-shape.md, "Module / package inventory").
- Potential improvement: Add at minimum `app/[locale]/error.tsx` (locale-scoped client boundary with retry) and `app/not-found.tsx` (global 404). A `global-error.tsx` at `app/` root catches layout-level crashes. All three are single-file additions in Next.js App Router with no new dependencies.
- Customer-value signal: reliability
- Value: medium
- Effort hint: low
- Risk if untouched: Any unhandled exception in a Server Component (e.g., Supabase client instantiation failure, i18n config error) renders a raw Next.js error page with a stack trace in development and a generic blank screen in production — no user-visible recovery path, no retry affordance.

---

- Status: opportunity
- Category: error-handling
- Observation: `fetchKudosBoard` in `lib/kudos/queries.ts` silently swallows all exceptions — both DB errors on individual parallel queries (5 of 6 are not checked) and catch-all at line 130. The board page receives `EMPTY` with no diagnostic signal.
- Evidence: `queries.ts:43` — only `kudosRes.error` is checked; errors on `usersRes`, `deptRes`, `hashRes`, `linkRes`, `likeRes` are silently ignored (data falls back to `[]`). `queries.ts:130-132` — catch block discards the error entirely and returns `EMPTY`. Discovery snapshot 03-architecture-shape.md: "Returns an empty result on any DB error so the UI can render an explicit empty state."
- Potential improvement: Check and log (or re-throw) errors from all 6 parallel queries, not just `kudosRes`. In the catch block, at minimum pass the error to an error-reporting boundary or structured logger before returning `EMPTY`, so ops teams can distinguish a real outage from a genuinely empty board. This is a targeted code change in one file.
- Customer-value signal: operational efficiency
- Value: medium
- Effort hint: low
- Risk if untouched: Partial DB failures (e.g., `users` table unreachable) silently render an empty board indistinguishable from "no kudos yet." Support and engineering cannot diagnose production degradation without error signals.

---

- Status: opportunity
- Category: error-handling
- Observation: Server actions in `lib/kudos/actions.ts` throw raw `new Error(supabaseError.message)` on DB failures. The client-side catch in `compose-kudo-modal.tsx:58-59` discards the error object entirely and shows a generic i18n toast. No error classification, no error code surface.
- Evidence: `actions.ts:59,68,88,111,125` — all Supabase errors are re-thrown as opaque `new Error(message)`. `compose-kudo-modal.tsx:58-59` — `catch { showToast(t("errorToast")) }` — error is not inspected. `kudos-board-context.tsx:141` — `catch { … showToast("Không thể lưu lượt thả tim…") }` — same pattern.
- Potential improvement: Define a small typed error class or discriminated union (e.g., `{ code: "DB_WRITE_FAILED" | "HASHTAG_INVALID" | "SELF_LIKE", message: string }`) returned from server actions instead of thrown exceptions. Callers can then branch on `code` to show actionable messages (e.g., "Invalid hashtag — please refresh") vs. generic retry toasts. This is a targeted refactor across `actions.ts` + two call sites.
- Customer-value signal: employee productivity
- Value: medium
- Effort hint: medium
- Risk if untouched: Validation errors (e.g., `hashtagSlugs` mismatch — `actions.ts:91-93`) surface identically to transient network errors. Employees cannot self-diagnose or retry intelligently, increasing support friction for an internally used award platform.

---

- Status: opportunity
- Category: error-handling
- Observation: `fetchKudosStats` (queries.ts:136-160) catches all errors and returns zero-filled stats silently. The `heartRes` query uses a `.eq("kudos.receiver_id", userId)` join filter that is non-standard for Supabase PostgREST and may silently return wrong data rather than an error.
- Evidence: `queries.ts:143-145` — `supabase.from("kudos_likes").select("weight, kudos!inner(receiver_id)").eq("kudos.receiver_id", userId)` — dot-notation filter on a joined table is PostgREST-specific syntax and may not filter as intended. `queries.ts:158-159` — catch returns `{ received:0, sent:0, hearts:0, … }` with no logging.
- Potential improvement: Validate `heartRes.error` explicitly before accumulating weights. Replace the dot-notation filter with `eq("kudos.receiver_id", userId)` verified against Supabase docs, or restructure as a two-step query. Add a log/error signal in the catch block.
- Customer-value signal: reliability
- Value: low
- Effort hint: low
- Risk if untouched: Hero stats shown on the kudos board sidebar may silently display zeros (or inflated totals) for heart counts without any observable error, eroding employee trust in the award data.
