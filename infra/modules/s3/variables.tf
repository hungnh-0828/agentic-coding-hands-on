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

variable "bucket_name" {
  description = "Globally-unique bucket name"
  type        = string
}

variable "versioning_enabled" {
  description = "Enable object versioning"
  type        = bool
  default     = true
}

variable "kms_key_arn" {
  description = "KMS key ARN for SSE-KMS. If null, SSE-S3 (AES256) is used."
  type        = string
  default     = null
}

variable "force_destroy" {
  description = "Allow deleting a non-empty bucket (keep false in prod)"
  type        = bool
  default     = false
}

variable "noncurrent_version_expiration_days" {
  description = "Expire noncurrent object versions after N days (0 disables)"
  type        = number
  default     = 90
}
