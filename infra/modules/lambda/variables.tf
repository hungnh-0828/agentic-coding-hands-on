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

variable "function_name" {
  description = "Logical function name (suffix); full name is {project}-{env}-{name}"
  type        = string
}

variable "runtime" {
  description = "Lambda runtime (see SKILL.md Version Policy)"
  type        = string
  default     = "python3.14"
}

variable "handler" {
  description = "Function entrypoint, e.g. index.handler"
  type        = string
  default     = "index.handler"
}

variable "package_path" {
  description = "Path to the deployment zip. Mutually exclusive with s3_bucket/s3_key."
  type        = string
  default     = null
}

variable "s3_bucket" {
  description = "S3 bucket holding the deployment package (alternative to package_path)"
  type        = string
  default     = null
}

variable "s3_key" {
  description = "S3 key of the deployment package"
  type        = string
  default     = null
}

variable "s3_object_version" {
  description = "S3 object version of the package (enables change detection on same-key updates)"
  type        = string
  default     = null
}

variable "memory_size" {
  description = "Memory (MB)"
  type        = number
  default     = 256
}

variable "timeout" {
  description = "Timeout (seconds)"
  type        = number
  default     = 30
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

variable "environment_variables" {
  description = "Non-secret environment variables"
  type        = map(string)
  default     = {}
}

variable "vpc_subnet_ids" {
  description = "Private subnet IDs for VPC access. Empty = no VPC attachment."
  type        = list(string)
  default     = []
}

variable "vpc_security_group_ids" {
  description = "Security group IDs when running in a VPC"
  type        = list(string)
  default     = []
}

variable "secret_arns" {
  description = "Secrets Manager ARNs the function may read"
  type        = list(string)
  default     = []
}
