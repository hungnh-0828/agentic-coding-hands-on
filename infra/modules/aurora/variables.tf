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

variable "subnet_ids" {
  description = "Private subnet IDs for the DB subnet group"
  type        = list(string)

  validation {
    condition     = length(var.subnet_ids) >= 2
    error_message = "Aurora requires subnets in at least 2 AZs."
  }
}

variable "security_group_ids" {
  description = "Security group IDs attached to the cluster"
  type        = list(string)
}

variable "engine_version" {
  description = "Aurora PostgreSQL engine version (see SKILL.md Version Policy)"
  type        = string
  default     = "17.7"
}

variable "instance_class" {
  description = "Instance class for cluster instances"
  type        = string
  default     = "db.t4g.medium"
}

variable "instance_count" {
  description = "Number of cluster instances (1 writer; >1 adds readers for HA)"
  type        = number
  default     = 1

  validation {
    condition     = var.instance_count >= 1
    error_message = "instance_count must be at least 1."
  }
}

variable "database_name" {
  description = "Initial database name"
  type        = string
  default     = "appdb"
}

variable "master_username" {
  description = "Master username"
  type        = string
  default     = "dbadmin"
  sensitive   = true
}

variable "backup_retention_days" {
  description = "Number of days to retain automated backups"
  type        = number
  default     = 7
}

variable "deletion_protection" {
  description = "Protect the cluster from accidental deletion (default safe; override to false in dev)"
  type        = bool
  default     = true
}

variable "secret_recovery_window_days" {
  description = "Secrets Manager recovery window before permanent deletion"
  type        = number
  default     = 30
}

variable "kms_key_id" {
  description = "KMS key ARN for storage encryption (null = AWS-managed aws/rds key)"
  type        = string
  default     = null
}
