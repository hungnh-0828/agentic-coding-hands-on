# REVIEW BEFORE DEPLOY
locals {
  name    = "${var.project}-${var.environment}-${var.function_name}"
  use_vpc = length(var.vpc_subnet_ids) > 0
}

# ----- Log group (explicit so retention is controlled) -----
resource "aws_cloudwatch_log_group" "fn" {
  name              = "/aws/lambda/${local.name}"
  retention_in_days = var.log_retention_days
  kms_key_id        = var.log_kms_key_id

  tags = { Name = "${local.name}-logs" }
}

# ----- Execution role -----
data "aws_iam_policy_document" "assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "fn" {
  name               = "${local.name}-role"
  assume_role_policy = data.aws_iam_policy_document.assume.json

  tags = { Name = "${local.name}-role" }
}

resource "aws_iam_role_policy_attachment" "basic" {
  role       = aws_iam_role.fn.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "vpc" {
  count      = local.use_vpc ? 1 : 0
  role       = aws_iam_role.fn.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy" "secrets" {
  count = length(var.secret_arns) > 0 ? 1 : 0
  name  = "${local.name}-read-secrets"
  role  = aws_iam_role.fn.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = var.secret_arns
    }]
  })
}

# ----- Function -----
resource "aws_lambda_function" "fn" {
  function_name = local.name
  role          = aws_iam_role.fn.arn
  runtime       = var.runtime
  handler       = var.handler
  memory_size   = var.memory_size
  timeout       = var.timeout

  # Exactly one source: local zip OR s3 object (enforced by precondition below)
  filename         = var.package_path
  source_code_hash = var.package_path != null ? filebase64sha256(var.package_path) : null
  s3_bucket         = var.package_path == null ? var.s3_bucket : null
  s3_key            = var.package_path == null ? var.s3_key : null
  s3_object_version = var.package_path == null ? var.s3_object_version : null

  dynamic "environment" {
    for_each = length(var.environment_variables) > 0 ? [1] : []
    content {
      variables = var.environment_variables
    }
  }

  dynamic "vpc_config" {
    for_each = local.use_vpc ? [1] : []
    content {
      subnet_ids         = var.vpc_subnet_ids
      security_group_ids = var.vpc_security_group_ids
    }
  }

  tracing_config {
    mode = "Active"
  }

  tags = { Name = local.name }

  depends_on = [aws_cloudwatch_log_group.fn]

  lifecycle {
    precondition {
      condition     = (var.package_path != null) != (var.s3_bucket != null && var.s3_key != null)
      error_message = "Provide exactly one deployment source: package_path OR (s3_bucket + s3_key)."
    }
  }
}
