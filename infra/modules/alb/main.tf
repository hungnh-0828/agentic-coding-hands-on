# REVIEW BEFORE DEPLOY
locals {
  name = "${var.project}-${var.environment}"
}

resource "aws_lb" "main" {
  name               = "${local.name}-alb"
  load_balancer_type = "application"
  internal           = false
  subnets            = var.public_subnet_ids
  security_groups    = [var.security_group_id]

  enable_deletion_protection = var.enable_deletion_protection
  drop_invalid_header_fields = true

  dynamic "access_logs" {
    for_each = var.access_logs_bucket != null ? [1] : []
    content {
      bucket  = var.access_logs_bucket
      prefix  = var.access_logs_prefix
      enabled = true
    }
  }

  tags = { Name = "${local.name}-alb" }

  lifecycle {
    precondition {
      condition     = !(var.environment == "prod" && var.certificate_arn == null)
      error_message = "Production ALB requires certificate_arn so the HTTPS listener is created (no cleartext prod traffic). Set alb_certificate_arn in prod tfvars."
    }
  }
}

resource "aws_lb_target_group" "main" {
  name        = "${local.name}-tg"
  port        = var.container_port
  protocol    = "HTTP"
  target_type = "ip" # Fargate awsvpc networking
  vpc_id      = var.vpc_id

  health_check {
    enabled             = true
    path                = var.health_check_path
    protocol            = "HTTP"
    matcher             = "200-399"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
  }

  deregistration_delay = 30

  tags = { Name = "${local.name}-tg" }
}

# ----- HTTP listener -----
# With a certificate: redirect 80 -> 443. Without: forward 80 -> target group.
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = var.certificate_arn != null ? "redirect" : "forward"

    target_group_arn = var.certificate_arn != null ? null : aws_lb_target_group.main.arn

    dynamic "redirect" {
      for_each = var.certificate_arn != null ? [1] : []
      content {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  }
}

# ----- HTTPS listener (only when a certificate is supplied) -----
resource "aws_lb_listener" "https" {
  count             = var.certificate_arn != null ? 1 : 0
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }
}
