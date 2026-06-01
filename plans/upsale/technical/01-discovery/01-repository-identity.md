# Repository Identity — agentic-coding-hands-on
**Use context:** internal

- **Project name:** `agentic-coding-hands-on` — `package.json`:2
- **One-sentence purpose:** Internal employee-facing Sun* Annual Awards 2025 (SAA) platform for peer kudos and awards management — `README.md`:1 ("Next.js project bootstrapped with create-next-app"); app identity confirmed by `app/[locale]/about-saa-2025/page.tsx` route name and `scout-report.md` ## Notes.
- **Primary language(s):** TypeScript 5.x (`package.json`:31, `^5`), JavaScript — confirmed by scout `## Detected Language`; compile target ES2017 (`tsconfig.json`:3); secondary HCL (Terraform) in `infra/`.
- **Runtime:** Node.js — no explicit version pin (no `.nvmrc`, no `engines` field in `package.json`); Next.js 16.2.6 (`package.json`:16) + React 19.2.4 (`package.json`:18) imply a current Node LTS (≥18); Lambda sidecar uses Python 3.14 (`infra/envs/prod/terraform.tfvars`:35, `infra/envs/dev/terraform.tfvars`:32).
