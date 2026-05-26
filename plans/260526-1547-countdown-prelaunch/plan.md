# Plan — Countdown Prelaunch page

**Date:** 2026-05-26
**Source:** [Countdown - Prelaunch page on MoMorph](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU) (screenId: `8PJQswPZmU`)
**Clarifications:** [clarifications.md](./clarifications.md)
**Branch:** `feat/countdown-prelaunch`
**Builds on:** main HEAD (homepage + login + awards-info merged)

## Goal
Standalone full-screen prelaunch countdown page at `/[locale]/prelaunch`. Dark BG with root pattern, centered title "Sự kiện sẽ bắt đầu sau" + 3 LED-styled countdown boxes (DAYS / HOURS / MINUTES). Shares the homepage's `NEXT_PUBLIC_EVENT_DATETIME` env. Reuses `CountdownTimer` via new `variant='led'` prop.

## Phases

| # | Phase | Status |
|---|-------|--------|
| 01 | Plan + clarifications | ✅ done |
| 02 | Refactor `CountdownTimer` to accept `variant` prop | ✅ done |
| 03 | Add `prelaunch.*` i18n keys (vi + en) | ✅ done |
| 04 | Create `app/[locale]/prelaunch/page.tsx` | ✅ done |
| 05 | Build verify + curl test | ✅ done |
| 06 | Reviewer + fixes | ✅ done |
| 07 | Deliver (pm + doc-writer + git-manager) | pending |

## Architecture

```
app/[locale]/prelaunch/page.tsx              # Server: full-screen layout, no header/footer

components/hero/countdown-timer.tsx          # ADDS variant prop: 'hero' | 'led'
                                             # 'led' = boxed digits in dark frames, larger

messages/{vi,en}.json                        # New `prelaunch.title` key
```

## Behavior
- Uses `NEXT_PUBLIC_EVENT_DATETIME` (shared with homepage); fallback `2025-12-31T18:30:00+07:00`
- Updates every 60s via existing useEffect interval
- Hours clamped 00-23, Minutes clamped 00-59, Days clamped to ≥ 0
- Hits 0 → all three units show 00 (no redirect — keeps it KISS)
- Single string label per unit (uppercase white)

## Success criteria
- `npm run build` clean
- `GET /vi/prelaunch` 200, content "Sự kiện sẽ bắt đầu sau" + DAYS/HOURS/MINUTES
- `GET /en/prelaunch` 200, content "The event starts in" + same labels
- `GET /prelaunch` → redirects to `/vi/prelaunch`
- Homepage hero unaffected (CountdownTimer default variant stays `'hero'`)

## Review & Fixes Applied
- **Reviewer score:** 7.5/10 APPROVE_WITH_FIXES
- **Report:** plans/260526-1547-countdown-prelaunch/reports/reviewer-260526-1605-countdown-timer-led-variant.md
- **Fixes:**
  - I1: Wrapped LED units in `role="group"` + `aria-label` for a11y
  - I2: Removed redundant `padStart` in LedDigitPair
  - N3: Stable keys ("tens"/"ones") replacing index keys
  - N5: Extracted `FALLBACK_EVENT_ISO` + `getEventISO()` to new `lib/event.ts`; DRY across hero-section + prelaunch

## Out of scope
- Auth gating (test cases ambiguous; treat as public)
- Animations
- Real-time SSE / WS (poll every 60s is enough)
- E2E tests
