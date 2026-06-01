# REVIEW BEFORE DEPLOY
variable "project" {
  description = "Project name used in resource naming"
  type        = string
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
  description = "AWS region (for log configuration)"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs to run tasks in"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

variable "target_group_arn" {
  description = "ALB target group ARN to register tasks with"
  type        = string
}

variable "container_image" {
  description = "Full container image URI. If null, the created ECR repo + :latest is used."
  type        = string
  default     = null
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
  default     = 8080
}

variable "task_cpu" {
  description = "Fargate task CPU units (256, 512, 1024, 2048, 4096)"
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Fargate task memory in MiB"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Number of running task replicas"
  type        = number
  default     = 1
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

variable "log_kms_key_id" {
  description = "KMS key ARN to encrypt the log group (null = AWS-owned key)"
  type        = string
  default     = null
}

variable "db_secret_arn" {
  description = "Secrets Manager ARN the task execution role may read (db creds). Null to skip."
  type        = string
  default     = null
}

variable "container_environment" {
  description = "Non-secret environment variables for the container"
  type        = map(string)
  default     = {}
}

variable "container_user" {
  description = "Run the container as this non-root user (e.g. \"1000\"). Null = image default."
  type        = string
  default     = null
}
