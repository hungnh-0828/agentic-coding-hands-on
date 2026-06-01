# Infrastructure Cost Breakdown

> **ESTIMATE ONLY.** `infracost`/`oiq` were not installed on the generating machine, and the
> heuristic fallback has no pricing for `aws_rds_cluster_instance` (the dominant cost) and cannot
> resolve module-variable instance classes. The figures below are **manual estimates** based on
> AWS **ap-southeast-1 (Singapore)** on-demand pricing, ~730 hrs/month. They exclude data
> transfer, request volume, Fargate/Lambda invocation charges, and storage growth. Verify with
> `infracost breakdown --path infra/envs/<env>` before relying on them.

Architecture: public ALB → ECS Fargate (private) → Aurora PostgreSQL 17.7 (private) + S3 + worker Lambda.

## Dev

| Resource | Type | Qty | Monthly USD | Notes |
|----------|------|-----|-------------|-------|
| NAT Gateway | aws_nat_gateway | 1 | $43 | single shared NAT |
| ALB | aws_lb | 1 | $20 | + LCU usage |
| Aurora instance | aws_rds_cluster_instance | 1 | $53 | db.t4g.medium |
| Aurora storage/backups | — | — | $3 | ~20 GB |
| Fargate task | aws_ecs_service | 1 | $13 | 0.25 vCPU / 0.5 GB |
| Secrets Manager | aws_secretsmanager_secret | 1 | $0.40 | |
| ECR + CloudWatch + S3 | — | — | $8 | low volume |
| Worker Lambda | aws_lambda_function | 1 | $1 | mostly idle |
| **Dev subtotal** | | | **~$141** | |

## Staging

| Resource | Type | Qty | Monthly USD | Notes |
|----------|------|-----|-------------|-------|
| NAT Gateway | aws_nat_gateway | 1 | $43 | single shared NAT |
| ALB | aws_lb | 1 | $20 | |
| Aurora instance | aws_rds_cluster_instance | 1 | $234 | db.r6g.large |
| Aurora storage/backups | — | — | $3 | |
| Fargate task | aws_ecs_service | 2 | $50 | 0.5 vCPU / 1 GB each |
| Secrets Manager | aws_secretsmanager_secret | 1 | $0.40 | |
| ECR + CloudWatch + S3 + flow logs | — | — | $15 | flow logs on |
| Worker Lambda | aws_lambda_function | 1 | $1 | |
| **Staging subtotal** | | | **~$366** | |

## Production

| Resource | Type | Qty | Monthly USD | Notes |
|----------|------|-----|-------------|-------|
| NAT Gateway | aws_nat_gateway | 3 | $129 | one per AZ (HA) |
| ALB | aws_lb | 1 | $25 | + LCU usage |
| Aurora instance | aws_rds_cluster_instance | 2 | $934 | db.r6g.xlarge, writer + reader |
| Aurora storage/backups | — | — | $5 | 30-day retention |
| Fargate task | aws_ecs_service | 3 | $151 | 1 vCPU / 2 GB each |
| Secrets Manager | aws_secretsmanager_secret | 1 | $0.40 | |
| ECR + CloudWatch + S3 + flow logs | — | — | $30 | |
| Worker Lambda | aws_lambda_function | 1 | $2 | |
| **Production subtotal** | | | **~$1,276** | |

## Total

| Environment | Monthly USD |
|-------------|-------------|
| Dev | ~$141 |
| Staging | ~$366 |
| Production | ~$1,276 |
| **Grand Total** | **~$1,783/month** |

**Biggest lever:** Aurora instance class/count (~70% of prod cost). Consider Aurora Serverless v2
or `db.r6g.large` for prod if traffic is bursty/low. Single-NAT in prod would save ~$86/mo at the
cost of AZ-level NAT redundancy.
