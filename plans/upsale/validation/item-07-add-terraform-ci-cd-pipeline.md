---
item_index: 7
item_slug: add-terraform-ci-cd-pipeline
track: technical
decision: KEEP
---

# Audits

- **Clause:** Terraform IaC stack (3 envs: dev/staging/prod) has no `plan`/`apply` automation (`04-delivery-operations.md:4,12-13`; `08-platform-support.md:11`)
  - **Evidence:** `infra/envs/dev/`, `infra/envs/staging/`, `infra/envs/prod/` all exist (confirmed via repo tree). No `.github/workflows/` directory at repo root (find returned 0 hits at repo root). `item_evidence` cites `04-delivery-operations.md:4` — "no `.github/workflows/`… Deployment is manual" and `08-platform-support.md:11` — "Self-hosted / on-premise: Terraform (AWS ECS Fargate + ALB + Aurora + S3 + Lambda, 3 envs)".
  - **Verdict:** correct
- **Clause:** Infra changes require manual CLI execution with no peer-review gate, no drift detection, and no apply audit log
  - **Evidence:** No CI pipeline file exists at repo root (confirmed). `item_evidence` `04-delivery-operations.md:4` confirms deployment is manual with no pipeline stages.
  - **Verdict:** correct
- **Clause:** S3 bucket `webapp-tf-state-{env}` + DynamoDB lock table `webapp-tf-locks-{env}`, region `ap-southeast-1` (`infra/envs/dev/backend.tf:4-9`)
  - **Evidence:** `infra/envs/dev/backend.tf:4-9` — `bucket = "webapp-tf-state-dev"`, `dynamodb_table = "webapp-tf-locks-dev"`, `region = "ap-southeast-1"`. Staging: `infra/envs/staging/backend.tf` — `bucket = "webapp-tf-state-staging"`, `dynamodb_table = "webapp-tf-locks-staging"`. Prod: `infra/envs/prod/backend.tf` — `bucket = "webapp-tf-state-prod"`, `dynamodb_table = "webapp-tf-locks-prod"`. All three confirmed.
  - **Verdict:** correct

# Reason

Check 1 (holistic): all Need claims are evidenced against the repo. The 3-env Terraform structure (dev/staging/prod) with S3+DynamoDB remote state is confirmed in `infra/envs/*/backend.tf`. No `.github/workflows/` directory exists at repo root. Item-07 is distinct from item-06 (app CI: lint/test/deploy) — item-07 covers exclusively the Terraform infra pipeline (`terraform-ci` workflow). Value=high is defensible: manual applies to prod Aurora/ECS with no review gate or audit trail represent a named destruction risk. Checks 2–6 all pass.

