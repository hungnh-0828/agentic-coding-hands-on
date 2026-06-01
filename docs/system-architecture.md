# System Architecture

## AWS Infrastructure (Terraform)

IaC lives in `infra/` — reusable modules under `infra/modules/` composed per environment under
`infra/envs/{dev,staging,prod}/`. Region: **ap-southeast-1**. Provider: `hashicorp/aws ~> 5.0`.
State is stored in per-environment S3 backends with DynamoDB locking (`backend.tf`).

### Topology

```
Internet
   │  80/443
   ▼
[ ALB ]  (public subnets, SG: 80/443 from allowed CIDRs)
   │  container_port (HTTP→HTTPS redirect when cert set)
   ▼
[ ECS Fargate service ]  (private subnets, SG: from ALB only, no public IP)
   │  5432
   ▼
[ Aurora PostgreSQL 17.7 ]  (private subnets, SG: 5432 from ECS + Lambda only)

[ Worker Lambda ]  (VPC-attached, private subnets) ──5432──► Aurora
[ S3 bucket ]  (private, TLS-only, versioned, SSE)
NAT Gateway(s) provide private-subnet egress; ECR holds the app image.
Aurora master password is generated and stored in Secrets Manager.
```

### Modules

| Module | Responsibility |
|--------|----------------|
| `vpc` | VPC, public/private subnets across N AZs, IGW, NAT (single shared or one-per-AZ), route tables, optional flow logs |
| `security-groups` | Layered SGs — ALB→ECS→RDS chain via source-SG references (no CIDR on DB port); Lambda→RDS |
| `aurora` | Aurora PostgreSQL cluster + instances, DB subnet group, Secrets-Manager-managed credentials, storage encryption, enhanced monitoring |
| `alb` | Application LB, IP target group (Fargate), HTTP/HTTPS listeners (TLS 1.3), optional access logs |
| `ecs` | Fargate cluster, task definition, service (deployment circuit breaker), ECR (immutable + scan-on-push + lifecycle), IAM exec/task roles, CloudWatch logs |
| `s3` | Bucket with versioning, SSE, full public-access block, TLS-only bucket policy, lifecycle expiry |
| `lambda` | VPC-attached function, IAM role, CloudWatch logs, exactly-one deployment-source guard |

### Environment profiles

| | Dev | Staging | Prod |
|---|-----|---------|------|
| AZs / NAT | 2 AZ / 1 NAT | 2 AZ / 1 NAT | 3 AZ / 3 NAT (HA) |
| Aurora | db.t4g.medium ×1 | db.r6g.large ×1 | db.r6g.xlarge ×2 (writer+reader) |
| Fargate | 0.25vCPU/0.5GB ×1 | 0.5vCPU/1GB ×2 | 1vCPU/2GB ×3 |
| Deletion protection | off | off | on (Aurora + ALB) |
| Flow logs | off | on | on |

### Security posture

- ECS tasks have **no public IP**; only the ALB is internet-facing.
- DB reachable **only** from ECS/Lambda SGs — never `0.0.0.0/0` on 5432.
- Aurora storage encrypted; password never hardcoded (random + Secrets Manager).
- S3: all four public-access blocks, `BucketOwnerEnforced`, TLS-only policy.
- Prod ALB **fails plan** unless an ACM certificate is supplied (no cleartext prod traffic).
- CloudWatch log groups support optional CMK encryption (`log_kms_key_id`).

### Deploy prerequisites

1. Bootstrap state backends (`webapp-tf-state-{env}` S3 + `webapp-tf-locks-{env}` DynamoDB).
2. Set a Lambda deployment source (`lambda_package_path` or S3) per env.
3. Set `alb_certificate_arn` for prod.

> Cost estimates per environment: see [infra-cost-breakdown.md](./infra-cost-breakdown.md).
