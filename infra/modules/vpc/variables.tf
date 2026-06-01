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

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "vpc_cidr must be valid CIDR notation."
  }
}

variable "availability_zones" {
  description = "List of AZs to spread subnets across"
  type        = list(string)

  validation {
    condition     = length(var.availability_zones) >= 2
    error_message = "Provide at least 2 availability zones for high availability."
  }
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (one per AZ)"
  type        = list(string)

  validation {
    condition     = alltrue([for c in var.public_subnet_cidrs : can(cidrhost(c, 0))])
    error_message = "All public_subnet_cidrs must be valid CIDR notation."
  }
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (one per AZ)"
  type        = list(string)

  validation {
    condition     = alltrue([for c in var.private_subnet_cidrs : can(cidrhost(c, 0))])
    error_message = "All private_subnet_cidrs must be valid CIDR notation."
  }
}

variable "single_nat_gateway" {
  description = "Use a single shared NAT gateway (cost saving) instead of one per AZ"
  type        = bool
  default     = true
}

variable "enable_flow_logs" {
  description = "Enable VPC flow logs to CloudWatch"
  type        = bool
  default     = false
}

variable "flow_log_retention_days" {
  description = "Retention period for VPC flow logs"
  type        = number
  default     = 30
}

variable "log_kms_key_id" {
  description = "KMS key ARN to encrypt flow logs (null = AWS-owned key)"
  type        = string
  default     = null
}
