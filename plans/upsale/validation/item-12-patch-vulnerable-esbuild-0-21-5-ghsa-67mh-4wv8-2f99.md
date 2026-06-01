---
item_index: 12
item_slug: patch-vulnerable-esbuild-0-21-5-ghsa-67mh-4wv8-2f99
track: technical
decision: KEEP
---

# Audits

- **Clause:** `esbuild@0.21.5` is a known-vulnerable version
  - **Evidence:** `package-lock.json:4789-4790` — `"node_modules/esbuild": { "version": "0.21.5" ... "dev": true }`. Confirmed present and locked at this version.
  - **Verdict:** correct

- **Clause:** CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:N/A:N
  - **Evidence:** `06-security-compliance.md:13` — GHSA-67mh-4wv8-2f99 entry cites this exact CVSS vector verbatim. OSV.dev queried 2026-06-01.
  - **Verdict:** correct

- **Clause:** dev server accepts cross-origin requests, allowing any website to read build responses
  - **Evidence:** `06-security-compliance.md:13` — "esbuild dev server accepts cross-origin requests; any website can read responses". `item_evidence` third opportunity block restates the same behavior assertion.
  - **Verdict:** correct

- **Clause:** fix available at `esbuild@0.25.0`
  - **Evidence:** `06-security-compliance.md:28` — "esbuild: 0.21.5 → ≈0.25 (minor-drift; fix for GHSA-67mh-4wv8-2f99 at 0.25.0)". Advisory ID and fix version match.
  - **Verdict:** correct

- **Clause:** citation `06-security-compliance.md:13,28`
  - **Evidence:** File exists at `plans/upsale/technical/01-discovery/06-security-compliance.md`; lines 13 and 28 contain the esbuild advisory entry and fix-version entry respectively.
  - **Verdict:** correct

- **Clause:** citation `package-lock.json:4789`
  - **Evidence:** `package-lock.json:4789` — `"node_modules/esbuild":` block opens at this line; version 0.21.5 confirmed at line 4790.
  - **Verdict:** correct

# Reason

Check 1 (holistic) — all Need claims resolve against `item_evidence` and the repo; GHSA-67mh-4wv8-2f99 is reproduced verbatim from OSV response recorded in `06-security-compliance.md:13` with no ID tampering. Check 2 (value defensibility) — `medium` is appropriate: the vulnerability is dev-only (esbuild not shipped to prod, `package-lock.json:4793` `"dev": true`), CVSS AC:H + UI:R indicates low exploitability, and the concrete benefit is named-advisory mitigation for a specific developer network exposure scenario, satisfying the `medium` bar (concrete reliability/security signal). No severity inflation detected. Checks 3–6 pass without issue.

