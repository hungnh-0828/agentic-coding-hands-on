# Login UI Design-Alignment: Asset Constraints and Viewport-Width Gotchas

**Date**: 2026-05-29 11:20  
**Severity**: Medium (latent bugs surfaced only at wider viewports)  
**Component**: Login screen (page layout, hero asset, form styling, language switcher)  
**Status**: Resolved (PR #7 merged)

## What Happened

Aligned login-screen UI with MoMorph design spec (screenId: GzbNeVGJHz). Built out app/[locale]/login/page.tsx and four component modules (login-header, login-hero, login-form, login-language-switcher). Added UK flag asset (public/login/flag-en.svg). Passed TypeScript strict mode (tsc --noEmit), ESLint, and 62/62 vitest unit tests. Discovered and fixed two critical z-order and layout bugs during multi-viewport verification that would have shipped broken at 1920px.

## The Brutal Truth

Two rounds of /fix-bug cycles exposed the danger of testing only at the design reference width (1440px). At 1920px, the entire screen rendered dark — the background gradient didn't show at all. The Google login button stretched full-width instead of staying inline. Both bugs were latent in the code but invisible at 1440px. The frustrating part: we had a screenshot-verification approach that worked at one width and silently failed at another. No amount of visual review at 1440 catches what breaks at 1920.

## Technical Details

**Asset flattening constraint:**
- Source: public/login/login-keyvisual.png (full-screen export from Figma)
- Issue: Foreground content (headline, text, button) is baked into the left ~46% of the image
- Live components must mask that left band to prevent double-rendering (asset text + component text)
- Root cause: MoMorph MCP media retrieval failed (get_media_file → 401 Unauthorized; get_figma_image → 500)
- Workaround: used foreground-baked asset; requires CSS mask or background-position to hide the left band
- Lesson: flagged to user that re-exporting a background-only asset from Figma would eliminate this constraint and enable full-bleed gradient rendering

**Full-bleed background vs. constrained content:**
- Original defect: both background and content were capped at max-w-[1440px], so narrow viewport = narrow background
- Fix: separated into two layers:
  - Full-bleed background: `fixed inset-0 w-screen h-screen` (outside max-width constraint)
  - Content frame: `max-w-[1440px] mx-auto` (constrained, centered)
- Impact: background now extends to viewport edges at any width; content stays readable

**z-order bug (1920px viewport):**
- Symptom: entire screen rendered navy (#00101A) at 1920; background gradient completely invisible
- Root cause: outer div has `bg-[#00101A]` (navy background); full-bleed bg layer was `-z-10` direct child, so navy painted on top
- Stack: outer navy div (z-auto) → full-bleed bg (z-10 applied as fix) → content (z-10)
- Fixed: gave background explicit `z-0`, content `z-10`; navy outer div stays implicit z-auto (behind both)
- Never caught at 1440 because the shorter viewport didn't trigger overflow or stacking-context edge cases

**Button stretch bug (1920px viewport):**
- Symptom: Google login button stretched full-width instead of staying inline (~280px)
- Root cause: `<main>` is `flex flex-col` with default `items-stretch`, pulling the inline-flex button across the cross-axis
- Fixed: added `items-start` to main, so flex children align to the start (left)
- Latent because: button width = content width at 1440 (close enough to viewport), so stretch was invisible; at 1920, the extra space became obvious

**Button spec correctness:**
- Initial implementation: gap-10 (40px) between icon and text
- Source of error: gap-10 was on the outer frame in Figma's component tree, not the button's internal gap
- Actual button spec: h-60 (60px height), rounded-lg, 24px padding, gap-2 (8px icon↔text gap), 22px font-bold text
- Fixed: corrected gap to gap-2, aligned all sizing and typography
- Lesson: read the leaf-node component spec, not the wrapping frame value

## What We Tried

1. **Screenshot verification at 1440px only** (failed): visual check passed, but bugs only surfaced at 1920
2. **Full-bleed background in same constrained max-w div** (failed): shrank background with content
3. **Relying on Figma gap value from outer frame** (failed): used wrong gap (10 vs 2)
4. **MoMorph media endpoints for background extraction** (failed): both endpoints returned auth/server errors

## Root Cause Analysis

**Why viewport-width bugs went undetected:**
- Development workflow tested only at 1440px (design reference width)
- No systematic multi-viewport verification (mobile, tablet, desktop, wide-desktop)
- z-order issues are viewport-agnostic but only surface visually at certain widths due to overflow and layout recalc
- Testing discipline: "looks good at design width" is insufficient for full-viewport components

**Why asset-retrieval failed:**
- MoMorph MCP endpoints require specific auth headers or have server-side issues
- Fallback to manual export was necessary; introduces manual sync burden
- No pre-planning for "what if we can't fetch the exact layer?"

**Why button gap was wrong:**
- Figma design tree has multiple frames; grabbed value from wrapper, not leaf component
- No automated design-to-code type-checking; gap-10 compiled fine, just wrong visually

## Lessons Learned

1. **Test every layout change across multiple viewport widths.** Responsive design breaks at specific breakpoints. A feature that looks correct at 1440px can be completely broken at 1920px (or 480px). Build the habit now: dev workflow should include 480, 1024, 1440, 1920 checks. This caught two shipping bugs.

2. **Z-order bugs hide in multi-layer designs.** When you have a full-bleed bg + constrained content + outer wrapper, explicit z-index layers are non-negotiable. Don't rely on DOM order. Use explicit z-0, z-10, z-20 and document why.

3. **Read the leaf-node spec, not the wrapper.** Figma groups components in frames for organization, but the actual spec (padding, gap, font size) lives on the innermost element. Always drill down. Add a design-reading checklist: component selected, all properties visible, no inherited values from parent frame.

4. **Asset extraction fallback must be documented.** If MoMorph/Figma media export fails, document the constraint it introduces. In this case: "using flattened full-screen export → must mask left band." This is friction that should trigger a fix request, not stay invisible.

5. **Verification beats review.** Peer review of code can miss viewport-width issues, but running the app at multiple widths surfaces them immediately. Multi-viewport verification should be non-negotiable for responsive components.

## Next Steps

1. **Update dev workflow checklist.** Before submitting responsive UI for review, verify at 480, 1024, 1440, 1920 widths. Add screenshot requirement for all three. Owner: team lead. Timeline: immediately.

2. **Request background-only asset export from Figma.** Current login-keyvisual.png is flattened with foreground content. Re-export background only → eliminates masking constraint, enables full-bleed gradient at any width. Owner: design. Timeline: next iteration.

3. **Add z-index documentation to code-standards.md.** Document stacking context rules for full-bleed patterns. Include examples: how to layer outer wrapper (implicit z-auto) vs fixed-position backgrounds (z-0, z-10). Owner: doc-writer. Timeline: this sprint.

4. **Create design-reading SOP for Figma specs.** When extracting component props, drill to the leaf element, screenshot the selected state with all properties visible, include that screenshot in implementation ticket. Prevents "grabbed value from parent frame" mistakes. Owner: team lead. Timeline: next sprint.

---

**Branch**: fix/login-ui  
**Commit**: 5f4b9b7  
**PR**: #7 (main)  
**Test Results**: tsc --noEmit ✓ | eslint ✓ | vitest 62/62 ✓
