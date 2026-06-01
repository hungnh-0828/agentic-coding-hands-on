# REVIEW BEFORE DEPLOY
locals {
  name = "${var.project}-${var.environment}"
}

resource "aws_db_subnet_group" "main" {
  name       = "${local.name}-aurora-subnets"
  subnet_ids = var.subnet_ids

  tags = { Name = "${local.name}-aurora-subnets" }
}

# ----- Master password: generated, never hardcoded, stored in Secrets Manager -----
resource "random_password" "master" {
  length  = 24
  special = true
  # RDS disallows / @ " and space; <> dropped too (some DSN parsers mishandle them)
  override_special = "!#$%^&*()-_=+[]{}:?"
}

resource "aws_secretsmanager_secret" "db" {
  name                    = "${local.name}/aurora/master"
  description             = "Aurora master credentials for ${local.name}"
  recovery_window_in_days = var.secret_recovery_window_days

  tags = { Name = "${local.name}-aurora-secret" }
}

resource "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id
  secret_string = jsonencode({
    username = var.master_username
    password = random_password.master.result
    engine   = "postgres"
    host     = aws_rds_cluster.main.endpoint
    port     = 5432
    dbname   = var.database_name
  })
}

# ----- Aurora PostgreSQL cluster -----
resource "aws_rds_cluster" "main" {
  cluster_identifier = "${local.name}-aurora"
  engine             = "aurora-postgresql"
  engine_version     = var.engine_version
  database_name      = var.database_name
  master_username    = var.master_username
  master_password    = random_password.master.result
  port               = 5432

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = var.security_group_ids

  storage_encrypted = true
  kms_key_id        = var.kms_key_id

  backup_retention_period      = var.backup_retention_days
  preferred_backup_window      = "02:00-03:00"
  preferred_maintenance_window = "sun:03:30-sun:04:30"

  deletion_protection       = var.deletion_protection
  copy_tags_to_snapshot     = true
  skip_final_snapshot       = var.environment == "prod" ? false : true
  final_snapshot_identifier = var.environment == "prod" ? "${local.name}-aurora-final" : null

  enabled_cloudwatch_logs_exports = ["postgresql"]

  tags = { Name = "${local.name}-aurora" }

  lifecycle {
    ignore_changes = [master_password]
  }
}

resource "aws_rds_cluster_instance" "main" {
  count              = var.instance_count
  identifier         = "${local.name}-aurora-${count.index}"
  cluster_identifier = aws_rds_cluster.main.id
  engine             = aws_rds_cluster.main.engine
  engine_version     = aws_rds_cluster.main.engine_version
  instance_class     = var.instance_class

  db_subnet_group_name = aws_db_subnet_group.main.name

  performance_insights_enabled = true
  monitoring_interval          = 60
  monitoring_role_arn          = aws_iam_role.monitoring.arn

  tags = { Name = "${local.name}-aurora-${count.index}" }
}

# ----- Enhanced monitoring role -----
resource "aws_iam_role" "monitoring" {
  name = "${local.name}-aurora-monitoring"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "monitoring.rds.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = { Name = "${local.name}-aurora-monitoring" }
}

resource "aws_iam_role_policy_attachment" "monitoring" {
  role       = aws_iam_role.monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}
