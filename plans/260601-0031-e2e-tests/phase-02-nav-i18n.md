# Phase 2 — Navigation + i18n

**Priority:** P2 · **Status:** completed · **Blocked by:** Phase 1

Owns: `e2e/navigation.spec.ts`. No auth needed (home, awards nav target is guarded but link presence is on header, rendered everywhere).

## Selectors / facts

- Root redirect handled by `proxy.ts`. `GET /` → `/vi`.
- Header logo: `getByRole("link", { name: "Sun* Annual Awards — Home" })`.
- Nav links (locale-stable names): `About SAA 2025`, `Sun* Kudos`; awards link name = "Awards Information" (en) / "Hệ thống giải thưởng" — use href instead. NavLink `/about-saa-2025`? No: header renders `NavLink href="/"` (about), `/awards-information`, `/sun-kudos`. Assert via role+name for about/kudos, and URL after click.
- Language switcher button: `getByRole("button")` showing `VN`/`EN` text + `aria-haspopup="menu"`; opens `role="menu"` with `role="menuitem"` named `VI` / `EN`.
- Hero image alt = `ROOT FURTHER` (both locales) → `getByRole("img", { name: "ROOT FURTHER" })` confirms home rendered.

## Test cases (e2e/navigation.spec.ts)

1. **root redirect**: `page.goto("/")` → `expect(page).toHaveURL(/\/vi$/)`.
2. **home renders**: on `/vi`, `expect(getByRole("img",{name:"ROOT FURTHER"})).toBeVisible()`.
3. **locale switch vi→en**: on `/vi`, click lang button (name `VN`), click menuitem `EN` → `expect(page).toHaveURL(/\/en$/)`; assert an en-only string is visible (awards nav link "Awards Information" via `getByRole("link",{name:"Awards Information"})`).
4. **locale switch en→vi**: reverse; `toHaveURL(/\/vi$/)`; assert vi-only string `Hệ thống giải thưởng` link visible.
5. **nav: Sun* Kudos link**: from `/vi`, click `getByRole("link",{name:"Sun* Kudos"})` → URL `/vi/sun-kudos` (lands on guard/login since unauth — assert `toHaveURL(/\/(vi|en)\/(sun-kudos|login)/)`; redirect covered in Phase 3, here just assert link navigates away from home). Keep loose to avoid coupling.
6. **nav: logo → home**: from `/en`, click logo link → `toHaveURL(/\/en$/)`.

## Success criteria

All 6 cases green. Locale assertions use URL regex + one locale-specific accessible name each. No fixed sleeps.

## Risks

- Lang menu may need explicit open click before menuitem visible (it's conditionally rendered on `open`). Test must click trigger first. Mitigation: assert `getByRole("menu")` visible before clicking item.
