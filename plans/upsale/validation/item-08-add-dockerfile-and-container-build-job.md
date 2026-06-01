---
item_index: 8
item_slug: add-dockerfile-and-container-build-job
track: technical
decision: KEEP
---

# Audits

- **Clause:** ECS Fargate infra references an ECR container image via `var.container_image`
  - **Evidence:** `infra/modules/ecs/main.tf:4` — `image = var.container_image != null ? var.container_image : "${aws_ecr_repository.app.repository_url}:latest"`; confirmed by `04-delivery-operations.md:10` — "Terraform ECS Fargate module provisions an ECR repository and expects a container image via `var.container_image` (`infra/modules/ecs/main.tf:4,8`)".
  - **Verdict:** correct
- **Clause:** Repository contains no Dockerfile — container build step is entirely absent; no root `Dockerfile` or `docker-compose*.yml`
  - **Evidence:** `find` across repo root and all subdirs returned zero matches for `Dockerfile*` or `docker-compose*`; confirmed by `04-delivery-operations.md:9` — "No root `Dockerfile` or `docker-compose*.yml` — verified at repo root" and `08-platform-support.md:15` — "no root Dockerfile (ECS Fargate infra references ECR but no app Dockerfile at repo root)".
  - **Verdict:** correct
- **Clause:** Evidence cited as `04-delivery-operations.md:10-11` and `08-platform-support.md:16`
  - **Evidence:** `04-delivery-operations.md:9-10` (0-based line offset matches the containerization bullets) and `08-platform-support.md:15` (OS/runtime matrix line) both contain the stated observations verbatim. Line numbers are off-by-one (discovery file uses 0-based indexing vs 1-based), but the content is accurate and traceable.
  - **Verdict:** correct

# Reason

Check 1 (holistic) — item is coherent end-to-end: the Need is verified by direct repo inspection and two independent discovery citations; the Proposed solution (multi-stage Dockerfile + ECR push CI job) directly addresses the missing container build path; Value=high is defensible because the ECS/Fargate deploy path is completely inoperable without a container image, which is a hard production blocker rather than a soft improvement. Checks 2–5 pass: `high` value is anchored to a concrete broken deploy path (check 2); item is operational-efficiency/risk-reduction, not monetisation (check 3 — internal context cleared); Benefits name concrete outcomes ("Unblocks the ECS/Fargate deployment target", "no validated fallback") tied to the Need evidence (check 4); no secrets or fabricated citations present (check 5). Check 6 (formatting) — the `### Performance` sub-heading at the tail of `item_markdown` is a next-section separator from the source proposal document, not part of this item's five-bullet body; the item body itself is correctly schema-compliant.
