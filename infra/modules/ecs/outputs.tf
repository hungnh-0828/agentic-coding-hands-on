# REVIEW BEFORE DEPLOY
output "cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.app.name
}

output "ecr_repository_url" {
  description = "ECR repository URL to push images to"
  value       = aws_ecr_repository.app.repository_url
}

output "task_role_arn" {
  description = "ARN of the task role (attach app runtime permissions here)"
  value       = aws_iam_role.task.arn
}

output "log_group_name" {
  description = "CloudWatch log group for the service"
  value       = aws_cloudwatch_log_group.app.name
}
