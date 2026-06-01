# REVIEW BEFORE DEPLOY
project     = "webapp"
environment = "dev"
aws_region  = "ap-southeast-1"

# Networking — 2 AZs, single NAT to save cost
vpc_cidr             = "10.10.0.0/16"
availability_zones   = ["ap-southeast-1a", "ap-southeast-1b"]
public_subnet_cidrs  = ["10.10.0.0/24", "10.10.1.0/24"]
private_subnet_cidrs = ["10.10.10.0/24", "10.10.11.0/24"]
single_nat_gateway   = true
enable_flow_logs     = false

# Aurora — single small instance, short backups, no deletion protection
aurora_instance_class        = "db.t4g.medium"
aurora_instance_count        = 1
aurora_backup_retention_days = 7
aurora_deletion_protection   = false

# ECS / ALB — minimal
container_port          = 8080
ecs_task_cpu            = 256
ecs_task_memory         = 512
ecs_desired_count       = 1
alb_deletion_protection = false

# S3 — allow teardown in dev
s3_force_destroy = true

# Lambda
lambda_function_name = "worker"
lambda_runtime       = "python3.14"

# Lambda deployment source — set ONE before `terraform plan` (plan fails otherwise):
#   lambda_package_path = "../../build/worker.zip"
# or upload to S3 and use:
#   (pass s3_bucket/s3_key/s3_object_version via the lambda module inputs)
