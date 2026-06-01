# REVIEW BEFORE DEPLOY
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "alb_dns_name" {
  description = "Public DNS name of the ALB"
  value       = module.alb.alb_dns_name
}

output "ecr_repository_url" {
  description = "ECR repository to push the app image to"
  value       = module.ecs.ecr_repository_url
}

output "aurora_cluster_endpoint" {
  description = "Aurora writer endpoint"
  value       = module.aurora.cluster_endpoint
  sensitive   = true
}

output "aurora_secret_arn" {
  description = "Secrets Manager ARN for DB credentials"
  value       = module.aurora.secret_arn
  sensitive   = true
}

output "assets_bucket" {
  description = "S3 assets bucket name"
  value       = module.s3.bucket_id
}

output "lambda_function_name" {
  description = "Worker Lambda function name"
  value       = module.lambda.function_name
}
