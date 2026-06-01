# Improvement Aspect: Accessibility — agentic-coding-hands-on
**Use context:** internal

---

- Status: opportunity
- Category: accessibility
- Observation: The compose modal uses `role="dialog"` and `aria-modal="true"` but does not programmatically move focus into the dialog on open, nor trap Tab/Shift-Tab within it. A keyboard user activating the compose button lands outside the modal panel.
- Evidence: `components/kudos/compose/compose-kudo-modal.tsx:37-48` — Escape key handler is present but no `useRef` + `.focus()` call, no `autoFocus`, and no third-party focus-trap utility. Compare with `components/kudos/compose/compose-kudo-form.tsx` which never receives an `autoFocus` prop.
- Potential improvement: On modal open, `useEffect` should call `ref.current.focus()` on the first focusable element inside the dialog panel; add Tab-cycle trap (either manual `keydown` guard or `focus-trap-react`). On close, return focus to the trigger button.
- Customer-value signal: employee productivity
- Value: medium
- Effort hint: low
- Risk if untouched: Keyboard-only employees (motor impairments, power users) cannot complete kudo submission; violates WCAG 2.1 SC 2.1.2 (No Keyboard Trap) and SC 2.4.3 (Focus Order).

---

- Status: opportunity
- Category: accessibility
- Observation: The compose form's visible field labels (`<span>` elements) are not programmatically associated with their `<input>` counterparts — no `htmlFor`/`id` pairing exists, and no `aria-labelledby` alternative is used. The recipient combobox, title input, and anonymous-name input are all affected.
- Evidence: `components/kudos/compose/compose-kudo-form.tsx:59-82` — label text rendered as `<span>` with no `id`; `<input>` at line 69 has no `id` or `aria-labelledby`. `components/kudos/compose/recipient-select.tsx:54-58` — same pattern: label `<span>` not linked to the `<input>` at line 67.
- Potential improvement: Replace label `<span>` elements with semantic `<label htmlFor="field-id">` elements (or add matching `id` to inputs and `aria-labelledby` to widgets). The anonymous-name input (conditionally rendered, `compose-kudo-form.tsx:130`) also needs a label when visible.
- Customer-value signal: compliance
- Value: medium
- Effort hint: low
- Risk if untouched: Screen readers (NVDA, VoiceOver) announce inputs as unlabeled; employees using assistive tech cannot identify required fields. Violates WCAG 2.1 SC 1.3.1 (Info and Relationships) and SC 3.3.2 (Labels or Instructions).

---

- Status: opportunity
- Category: accessibility
- Observation: The language-switcher dropdown renders a `role="menu"` + `role="menuitem"` pattern but does not close on Escape key nor does the trigger button receive returned focus after an option is selected. The account-menu has the same gap — `role="menu"` is present but no Escape handler or focus-return is implemented.
- Evidence: `components/header/language-switcher.tsx:28-58` — `setOpen(false)` only wired to `onClick`; no `keydown` handler. `components/header/account-menu.tsx:20-71` — `aria-label="Account menu"`, `role="menu"` present but zero keyboard event handling in the file (`grep keydown/Escape` returns nothing).
- Potential improvement: Add `onKeyDown` handler on both menus: Escape closes and returns focus to trigger; arrow keys move between menuitems (`role="menuitem"` items should respond to `ArrowDown`/`ArrowUp`). This is standard ARIA APG Menu Button pattern and ~30 LOC per component.
- Customer-value signal: employee productivity
- Value: medium
- Effort hint: low
- Risk if untouched: Keyboard navigation of header menus is broken for motor-impaired or non-mouse employees. Violates WCAG 2.1 SC 2.1.1 (Keyboard) and ARIA APG Menu Button pattern.

---

- Status: opportunity
- Category: accessibility
- Observation: The countdown timer hero variant (default) renders digit spans without any `aria-label` or `role="group"` wrapper, giving screen readers only the raw padded number string ("07") with no unit context. The `led` and `tone="light"` sub-variants do use `role="group"` + `aria-label`, but the default hero path (lines 127-138) does not.
- Evidence: `components/hero/countdown-timer.tsx:127-138` — `<div className="flex flex-wrap …">` with no ARIA; inner `<span>` at line 132 outputs `pad(unit.value)` but no `aria-label` combining value + unit label. Contrast with line 64 (`led`/`light` variant) which correctly sets `aria-label={`${display} ${unit.label}`}`.
- Potential improvement: Wrap each unit `<div>` in the hero variant with `role="timer"` (or `role="group"`) and `aria-label={`${pad(unit.value)} ${unit.label}`}` — a two-line change mirroring the already-correct `led` variant.
- Customer-value signal: employee productivity
- Value: low
- Effort hint: low
- Risk if untouched: Screen reader users hear "zero seven zero three one two" with no day/hour/minute context. WCAG 2.1 SC 1.3.1 soft violation (information conveyed only visually via label below).

---

- Status: opportunity
- Category: accessibility
- Observation: The `KudosImageGallery` alt text is hardcoded in Vietnamese (`"Ảnh đính kèm ${i + 1}"`) regardless of active locale. With 2 supported locales (`vi`, `en`), English-locale users receive Vietnamese alt strings, reducing screen-reader usefulness.
- Evidence: `components/kudos/kudos-image-gallery.tsx:12` — `alt={\`Ảnh đính kèm ${i + 1}\`}` — no `useTranslations` call in this file; compare with sibling components that use `useTranslations("kudos.card")`.
- Potential improvement: Import `useTranslations` and add a key (e.g., `kudos.card.attachedImageAlt`) with `{index}` interpolation; replicate the pattern already used in `like-button.tsx` and `kudos-card.tsx`. One-line change per locale message file.
- Customer-value signal: employee productivity
- Value: low
- Effort hint: low
- Risk if untouched: English-locale screen-reader users receive Vietnamese alt text for every gallery image; minor but inconsistent with the otherwise complete i18n surface (`07-product-surface.md:30` — 2 locales declared).

---

- Status: opportunity
- Category: accessibility
- Observation: The `RecipientSelect` custom combobox implements only mouse/click interaction. The dropdown list (`<ul>`) has no `role="listbox"`, items have no `role="option"`, the input has no `aria-autocomplete`/`aria-controls`/`aria-activedescendant` attributes, and keyboard arrow-key navigation is absent.
- Evidence: `components/kudos/compose/recipient-select.tsx:62-103` — `<div onClick>` wrapper; `<input>` has no ARIA combobox attributes; `<ul>` has no role; `<li>` items use `onMouseDown` only. No `keydown` handler in the component.
- Potential improvement: Implement ARIA combobox pattern per APG: input gets `role="combobox"`, `aria-expanded`, `aria-autocomplete="list"`, `aria-controls` pointing to the listbox `id`; list gets `role="listbox"`; items get `role="option"` with `aria-selected`. Add `ArrowDown`/`ArrowUp`/`Enter`/`Escape` keyboard handling (~50 LOC). Alternatively, replace with an accessible headless library (Radix `Select` or Headless UI `Combobox`) already compatible with Tailwind v4.
- Customer-value signal: compliance
- Value: medium
- Effort hint: medium
- Risk if untouched: The single required field in the kudos compose flow is inaccessible to keyboard and screen-reader users, blocking the core user action for employees relying on assistive technology. Violates WCAG 2.1 SC 2.1.1 and SC 4.1.2 (Name, Role, Value).
