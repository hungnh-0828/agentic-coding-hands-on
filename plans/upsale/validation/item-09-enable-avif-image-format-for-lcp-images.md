---
item_index: 9
item_slug: enable-avif-image-format-for-lcp-images
track: technical
decision: KEEP
---

# Audits

- **Clause:** `hero-bg.png` (4.3 MB raw PNG) served via `next/image` with no AVIF config
  - **Evidence:** `ls -lh public/home/hero-bg.png` confirmed 4.3M file size. `item_evidence` first entry cites `public/home/hero-bg.png` = 4.3 MB (measured). File exists at path.
  - **Verdict:** correct

- **Clause:** `login-keyvisual.png` (2.5 MB raw PNG) served via `next/image` with no AVIF config
  - **Evidence:** `ls -lh public/login/login-keyvisual.png` confirmed 2.5M file size. `item_evidence` cites `public/login/login-keyvisual.png` = 2.5 MB (measured). File exists at path.
  - **Verdict:** correct

- **Clause:** `next.config.ts:10-16` has `images.remotePatterns` only — no `formats`, no `quality`, no `deviceSizes`
  - **Evidence:** `next.config.ts` lines 10-16 read directly: `images: { remotePatterns: [...] }` — no `formats`, `quality`, or `deviceSizes` keys present. Exact match to claim.
  - **Verdict:** correct

- **Clause:** `components/hero/hero-section.tsx:19-26` uses `priority sizes="100vw"` without `quality` override
  - **Evidence:** `hero-section.tsx` lines 19-26 contain `<Image src="/home/hero-bg.png" alt="" aria-hidden fill priority sizes="100vw" ...>` — no `quality` prop present. Line range matches claim.
  - **Verdict:** correct

- **Clause:** `app/[locale]/login/page.tsx:38-43` uses same `priority sizes="100vw"` pattern without `quality`
  - **Evidence:** `login/page.tsx` lines 37-44 contain `<Image src="/login/login-keyvisual.png" alt="" width={1440} height={1024} priority sizes="100vw" ...>` — no `quality` prop. Claim's line range 38-43 is slightly narrow (image tag spans 37-44) but all asserted attributes confirmed within that region.
  - **Verdict:** correct

# Reason

Check 1 (holistic) — all Need claims are evidence-backed: both PNG assets exist at the stated sizes (4.3 MB and 2.5 MB confirmed via `ls`), `next.config.ts:10-16` confirms no `formats`/`quality` config, and both LCP `<Image>` components confirmed to lack `quality` prop at the cited locations. Proposed solution (add `formats: ["image/avif", "image/webp"]` to `next.config.ts`, set `quality={80}` on both images) is directly implementable — AVIF is natively supported in Next.js 16 Image. Check 2 (Value=medium) is defensible for an internal tool: a launch-day spike where all employees load a 4.3 MB PNG is a concrete performance risk, not soft language. Checks 3–6 pass without issue.
