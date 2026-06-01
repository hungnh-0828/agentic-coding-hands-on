# REVIEW BEFORE DEPLOY
project     = "webapp"
environment = "prod"
aws_region  = "ap-southeast-1"

# Networking — 3 AZs, NAT per AZ for HA
vpc_cidr             = "10.30.0.0/16"
availability_zones   = ["ap-southeast-1a", "ap-southeast-1b", "ap-southeast-1c"]
public_subnet_cidrs  = ["10.30.0.0/24", "10.30.1.0/24", "10.30.2.0/24"]
private_subnet_cidrs = ["10.30.10.0/24", "10.30.11.0/24", "10.30.12.0/24"]
single_nat_gateway   = false
enable_flow_logs     = true

# Aurora — HA: writer + reader, long backups, deletion protection on
aurora_instance_class        = "db.r6g.xlarge"
aurora_instance_count        = 2
aurora_backup_retention_days = 30
aurora_deletion_protection   = true

# ECS / ALB — production sizing
container_port          = 8080
ecs_task_cpu            = 1024
ecs_task_memory         = 2048
ecs_desired_count       = 3
alb_deletion_protection = true

# HTTPS — set your ACM certificate ARN to enable the HTTPS listener
# alb_certificate_arn = "arn:aws:acm:ap-southeast-1:<account-id>:certificate/<uuid>"

# S3 — never force-destroy prod data
s3_force_destroy = false

# Lambda
lambda_function_name = "worker"
lambda_runtime       = "python3.14"

# Lambda deployment source — set ONE before `terraform plan` (plan fails otherwise):
#   lambda_package_path = "../../build/worker.zip"
# or upload to S3 and use:
#   (pass s3_bucket/s3_key/s3_object_version via the lambda module inputs)
