# REVIEW BEFORE DEPLOY
variable "project" {
  description = "Project name used in resource naming"
  type        = string
  default     = "webapp"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "aws_region" {
  description = "Primary AWS region"
  type        = string
}

# ----- Networking -----
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "availability_zones" {
  description = "AZs to spread subnets across"
  type        = list(string)
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDRs (one per AZ)"
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDRs (one per AZ)"
  type        = list(string)
}

variable "single_nat_gateway" {
  description = "Use a single shared NAT gateway (cost saving)"
  type        = bool
  default     = true
}

variable "enable_flow_logs" {
  description = "Enable VPC flow logs"
  type        = bool
  default     = false
}

# ----- Aurora -----
variable "aurora_instance_class" {
  description = "Aurora instance class"
  type        = string
  default     = "db.t4g.medium"
}

variable "aurora_instance_count" {
  description = "Aurora cluster instance count (1 writer; >1 for read HA)"
  type        = number
  default     = 1
}

variable "aurora_backup_retention_days" {
  description = "Aurora backup retention period"
  type        = number
  default     = 7
}

variable "aurora_deletion_protection" {
  description = "Protect Aurora cluster from deletion (safe default; dev/staging override to false)"
  type        = bool
  default     = true
}

# ----- ECS / ALB -----
variable "container_image" {
  description = "Container image URI (null = use created ECR repo :latest)"
  type        = string
  default     = null
}

variable "container_port" {
  description = "Container listen port"
  type        = number
  default     = 8080
}

variable "ecs_task_cpu" {
  description = "Fargate task CPU units"
  type        = number
  default     = 256
}

variable "ecs_task_memory" {
  description = "Fargate task memory (MiB)"
  type        = number
  default     = 512
}

variable "ecs_desired_count" {
  description = "Number of running ECS tasks"
  type        = number
  default     = 1
}

variable "alb_certificate_arn" {
  description = "ACM cert ARN for HTTPS (null = HTTP only)"
  type        = string
  default     = null
}

variable "alb_deletion_protection" {
  description = "Protect ALB from deletion"
  type        = bool
  default     = false
}

# ----- S3 -----
variable "s3_force_destroy" {
  description = "Allow deleting a non-empty assets bucket"
  type        = bool
  default     = false
}

# ----- Lambda -----
variable "lambda_function_name" {
  description = "Logical name for the worker Lambda"
  type        = string
  default     = "worker"
}

variable "lambda_runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "python3.14"
}

variable "lambda_package_path" {
  description = "Path to Lambda deployment zip (provide before apply)"
  type        = string
  default     = null
}
