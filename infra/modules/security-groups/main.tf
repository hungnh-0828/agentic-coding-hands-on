# REVIEW BEFORE DEPLOY
locals {
  name = "${var.project}-${var.environment}"
}

# ============================================================
# ALB security group — public entry point
# ============================================================
resource "aws_security_group" "alb" {
  name_prefix = "${local.name}-alb-"
  description = "ALB ingress 80/443 from allowed CIDRs"
  vpc_id      = var.vpc_id

  tags = { Name = "${local.name}-alb-sg" }

  lifecycle { create_before_destroy = true }
}

resource "aws_vpc_security_group_ingress_rule" "alb_http" {
  for_each          = toset(var.alb_ingress_cidrs)
  security_group_id = aws_security_group.alb.id
  description       = "HTTP from ${each.value}"
  cidr_ipv4         = each.value
  from_port         = 80
  to_port           = 80
  ip_protocol       = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "alb_https" {
  for_each          = toset(var.alb_ingress_cidrs)
  security_group_id = aws_security_group.alb.id
  description       = "HTTPS from ${each.value}"
  cidr_ipv4         = each.value
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "alb_to_ecs" {
  security_group_id            = aws_security_group.alb.id
  description                  = "Forward to ECS tasks on container port"
  referenced_security_group_id = aws_security_group.ecs.id
  from_port                    = var.container_port
  to_port                      = var.container_port
  ip_protocol                  = "tcp"
}

# ============================================================
# ECS task security group — receives traffic only from ALB
# ============================================================
resource "aws_security_group" "ecs" {
  name_prefix = "${local.name}-ecs-"
  description = "ECS tasks ingress from ALB only"
  vpc_id      = var.vpc_id

  tags = { Name = "${local.name}-ecs-sg" }

  lifecycle { create_before_destroy = true }
}

resource "aws_vpc_security_group_ingress_rule" "ecs_from_alb" {
  security_group_id            = aws_security_group.ecs.id
  description                  = "Container port from ALB"
  referenced_security_group_id = aws_security_group.alb.id
  from_port                    = var.container_port
  to_port                      = var.container_port
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "ecs_all" {
  security_group_id = aws_security_group.ecs.id
  description       = "Outbound to internet/services via NAT (pull images, call APIs)"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

# ============================================================
# Lambda security group — outbound only (reaches RDS + NAT)
# ============================================================
resource "aws_security_group" "lambda" {
  name_prefix = "${local.name}-lambda-"
  description = "Lambda VPC functions, outbound only"
  vpc_id      = var.vpc_id

  tags = { Name = "${local.name}-lambda-sg" }

  lifecycle { create_before_destroy = true }
}

resource "aws_vpc_security_group_egress_rule" "lambda_all" {
  security_group_id = aws_security_group.lambda.id
  description       = "Outbound to DB and services via NAT"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

# ============================================================
# RDS security group — DB port from ECS + Lambda only
# ============================================================
resource "aws_security_group" "rds" {
  name_prefix = "${local.name}-rds-"
  description = "RDS ingress on db_port from ECS and Lambda"
  vpc_id      = var.vpc_id

  tags = { Name = "${local.name}-rds-sg" }

  lifecycle { create_before_destroy = true }
}

resource "aws_vpc_security_group_ingress_rule" "rds_from_ecs" {
  security_group_id            = aws_security_group.rds.id
  description                  = "DB port from ECS tasks"
  referenced_security_group_id = aws_security_group.ecs.id
  from_port                    = var.db_port
  to_port                      = var.db_port
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "rds_from_lambda" {
  security_group_id            = aws_security_group.rds.id
  description                  = "DB port from Lambda functions"
  referenced_security_group_id = aws_security_group.lambda.id
  from_port                    = var.db_port
  to_port                      = var.db_port
  ip_protocol                  = "tcp"
}
