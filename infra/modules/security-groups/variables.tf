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

variable "vpc_id" {
  description = "VPC ID the security groups belong to"
  type        = string
}

variable "alb_ingress_cidrs" {
  description = "CIDR blocks allowed to reach the public ALB on 80/443"
  type        = list(string)
  default     = ["0.0.0.0/0"]

  validation {
    condition     = alltrue([for c in var.alb_ingress_cidrs : can(cidrhost(c, 0))])
    error_message = "All alb_ingress_cidrs must be valid CIDR notation."
  }
}

variable "container_port" {
  description = "Port the ECS container listens on (ALB -> ECS)"
  type        = number
  default     = 8080
}

variable "db_port" {
  description = "Database port (ECS/Lambda -> RDS)"
  type        = number
  default     = 5432
}
