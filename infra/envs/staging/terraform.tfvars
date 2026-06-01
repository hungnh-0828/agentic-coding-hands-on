# REVIEW BEFORE DEPLOY
project     = "webapp"
environment = "staging"
aws_region  = "ap-southeast-1"

# Networking — 2 AZs, single NAT
vpc_cidr             = "10.20.0.0/16"
availability_zones   = ["ap-southeast-1a", "ap-southeast-1b"]
public_subnet_cidrs  = ["10.20.0.0/24", "10.20.1.0/24"]
private_subnet_cidrs = ["10.20.10.0/24", "10.20.11.0/24"]
single_nat_gateway   = true
enable_flow_logs     = true

# Aurora — medium, 1 writer (add reader to mirror prod if needed)
aurora_instance_class        = "db.r6g.large"
aurora_instance_count        = 1
aurora_backup_retention_days = 14
aurora_deletion_protection   = false

# ECS / ALB — medium
container_port          = 8080
ecs_task_cpu            = 512
ecs_task_memory         = 1024
ecs_desired_count       = 2
alb_deletion_protection = false

# S3
s3_force_destroy = false

# Lambda
lambda_function_name = "worker"
lambda_runtime       = "python3.14"

# Lambda deployment source — set ONE before `terraform plan` (plan fails otherwise):
#   lambda_package_path = "../../build/worker.zip"
# or upload to S3 and use:
#   (pass s3_bucket/s3_key/s3_object_version via the lambda module inputs)
