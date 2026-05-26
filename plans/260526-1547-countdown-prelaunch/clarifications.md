# Clarifications — Countdown Prelaunch page

Source: `https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU`
Screen: `Countdown - Prelaunch page` (8PJQswPZmU)

## Defaults applied (no user interaction this round)

- Q: Route path → A: `/[locale]/prelaunch`
- Q: Workflow → A: Feature branch `feat/countdown-prelaunch`, commit only (no push)
- Q: Layout chrome → A: Naked full-screen (no header, no footer) — design specs list only BG + title + 3 units
- Q: Component reuse → A: Refactor `components/hero/countdown-timer.tsx` to accept `variant='hero'|'led'` prop. Hero variant unchanged. LED variant = boxed digit frames per spec ("LED-style digit boxes")
- Q: Behavior at zero → A: Display 00 00 00 (per test FUNCTION ID-50fc4021)
- Q: Auth gate → A: Public (test ACCESSING cases are explicitly ambiguous: "Access is allowed or the user is blocked/redirected (as per application configuration)")
- Q: Datetime source → A: Reuse `NEXT_PUBLIC_EVENT_DATETIME` env (same as homepage hero); fallback `2025-12-31T18:30:00+07:00`
- Q: Locale → A: Keep title bilingual via `prelaunch.title` key; unit labels (DAYS/HOURS/MINUTES) are uppercase ASCII per design — already exist in `hero.labels.*`, reuse those keys
