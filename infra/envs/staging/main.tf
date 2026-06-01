# REVIEW BEFORE DEPLOY
# Environment composition — wires all modules together.
# This file is identical across dev/staging/prod; behaviour differs via terraform.tfvars.

data "aws_caller_identity" "current" {}

locals {
  # Globally-unique bucket name derived from account id (no manual edit needed)
  assets_bucket = "${var.project}-${var.environment}-assets-${data.aws_caller_identity.current.account_id}"
}

module "vpc" {
  source = "../../modules/vpc"

  project              = var.project
  environment          = var.environment
  vpc_cidr             = var.vpc_cidr
  availability_zones   = var.availability_zones
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  single_nat_gateway   = var.single_nat_gateway
  enable_flow_logs     = var.enable_flow_logs
}

module "security_groups" {
  source = "../../modules/security-groups"

  project        = var.project
  environment    = var.environment
  vpc_id         = module.vpc.vpc_id
  container_port = var.container_port
  db_port        = 5432
}

module "aurora" {
  source = "../../modules/aurora"

  project               = var.project
  environment           = var.environment
  subnet_ids            = module.vpc.private_subnet_ids
  security_group_ids    = [module.security_groups.rds_sg_id]
  instance_class        = var.aurora_instance_class
  instance_count        = var.aurora_instance_count
  backup_retention_days = var.aurora_backup_retention_days
  deletion_protection   = var.aurora_deletion_protection
}

module "alb" {
  source = "../../modules/alb"

  project                    = var.project
  environment                = var.environment
  vpc_id                     = module.vpc.vpc_id
  public_subnet_ids          = module.vpc.public_subnet_ids
  security_group_id          = module.security_groups.alb_sg_id
  container_port             = var.container_port
  certificate_arn            = var.alb_certificate_arn
  enable_deletion_protection = var.alb_deletion_protection
}

module "ecs" {
  source = "../../modules/ecs"

  project            = var.project
  environment        = var.environment
  aws_region         = var.aws_region
  private_subnet_ids = module.vpc.private_subnet_ids
  security_group_id  = module.security_groups.ecs_sg_id
  target_group_arn   = module.alb.target_group_arn
  container_image    = var.container_image
  container_port     = var.container_port
  task_cpu           = var.ecs_task_cpu
  task_memory        = var.ecs_task_memory
  desired_count      = var.ecs_desired_count
  db_secret_arn      = module.aurora.secret_arn

  # Ensure ALB listener exists before the service registers targets
  depends_on = [module.alb]
}

module "s3" {
  source = "../../modules/s3"

  project       = var.project
  environment   = var.environment
  bucket_name   = local.assets_bucket
  force_destroy = var.s3_force_destroy
}

module "lambda" {
  source = "../../modules/lambda"

  project                = var.project
  environment            = var.environment
  function_name          = var.lambda_function_name
  runtime                = var.lambda_runtime
  package_path           = var.lambda_package_path
  vpc_subnet_ids         = module.vpc.private_subnet_ids
  vpc_security_group_ids = [module.security_groups.lambda_sg_id]
  secret_arns            = [module.aurora.secret_arn]
  environment_variables  = { ASSETS_BUCKET = local.assets_bucket }
}
