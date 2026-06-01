---
item_index: 1
item_slug: resolve-deployment-target-divergence-and-define-authoritative-ci-cd-deploy-path
track: technical
decision: KEEP
---

# Audits

- **Clause:** `.vercel/project.json` references active Vercel deployment (`03-architecture-shape.md:56`)
  - **Evidence:** `.vercel/project.json` exists at repo root with `projectName: "saa-2025"` and valid `projectId`/`orgId` fields — confirmed via direct file read. `item_evidence` cites `04-delivery-operations.md:13`: "`.vercel/project.json:1` references Vercel project `saa-2025`". Discovery file `03-architecture-shape.md` line ~56 records "Deployment-target divergence: `.vercel/` present (active Vercel deployment) alongside `infra/` Terraform ECS Fargate target."
  - **Verdict:** correct

- **Clause:** `infra/` Terraform ECS Fargate stack coexists with the Vercel deployment (`03-architecture-shape.md:56`; `04-delivery-operations.md:13`)
  - **Evidence:** `infra/envs/` directory contains `dev/`, `staging/`, `prod/` sub-environments confirmed via repo ls; `infra/modules/ecs/main.tf` present; `04-delivery-operations.md:13` records "active Vercel deploy coexists with Terraform AWS ECS stack (3 envs: dev/staging/prod)".
  - **Verdict:** correct

- **Clause:** No CI/CD pipeline detected (`03-architecture-shape.md:56`; `08-platform-support.md:24`)
  - **Evidence:** No `.github/workflows/` directory found at repo root (Bash: `ls .github/workflows/` returned "No .github/workflows"). `03-architecture-shape.md` line ~56 records "two competing deploy paths with no CI/CD pipeline detected." `08-platform-support.md:24` records "two concurrent deployment targets, relationship unresolved."
  - **Verdict:** correct

- **Clause:** Terraform ECS module provisions ECR but no `Dockerfile` exists in repo (`04-delivery-operations.md:11`)
  - **Evidence:** `find . -name "Dockerfile"` returned 0 results across entire repo. `infra/modules/ecs/main.tf` confirms `aws_ecr_repository.app` resource and `var.container_image` parameter. `04-delivery-operations.md:11` records "No root Dockerfile or docker-compose*.yml — verified at repo root" and "Terraform ECS Fargate module provisions an ECR repository and expects a container image via `var.container_image` (`infra/modules/ecs/main.tf:4,8`) — image build path not defined in repo."
  - **Verdict:** correct

- **Clause:** Two concurrent deployment targets — Vercel and Terraform AWS ECS (3 envs) — with no CI gate routing between them and no documented promotion path (`03-architecture-shape.md:56`; `08-platform-support.md:24`)
  - **Evidence:** Vercel presence confirmed via `.vercel/project.json`; ECS Fargate presence confirmed via `infra/envs/{dev,staging,prod}/`; no CI workflow files found; no promotion runbook or deployment ADR found in `docs/` or `plans/`. `08-platform-support.md:24` records "relationship unresolved."
  - **Verdict:** correct

# Reason

Check 1 (holistic gate): all Need claims are evidenced by real repo artifacts — `.vercel/project.json` is present, `infra/envs/` has three ECS envs, no Dockerfile exists, and no CI pipeline files were found. The proposed solution (designate one authoritative target, archive the other, wire Dockerfile if ECS path is chosen) directly addresses the coexistence gap and is implementable within this Next.js/Terraform stack. Value `high` is defensible (check 2): non-deployable ECS path represents live infra spend with no production output, and absence of any rollback path is a concrete operational risk for an internal awards platform approaching a real employee audience. Benefits cite concrete outcomes (rollback clarity, dead spend elimination, CI/CD unblocking) rather than soft language. Use-context `internal` is consistent (check 3): the lever is operational efficiency and risk reduction, not monetisation. No secrets or fabricated citations detected (check 5). Formatting is compliant (check 6). All checks 1–6 pass — KEEP.
