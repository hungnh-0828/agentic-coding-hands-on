# REVIEW BEFORE DEPLOY
output "cluster_endpoint" {
  description = "Writer endpoint of the Aurora cluster"
  value       = aws_rds_cluster.main.endpoint
  sensitive   = true
}

output "reader_endpoint" {
  description = "Reader endpoint of the Aurora cluster"
  value       = aws_rds_cluster.main.reader_endpoint
  sensitive   = true
}

output "cluster_port" {
  description = "Database port"
  value       = aws_rds_cluster.main.port
}

output "database_name" {
  description = "Initial database name"
  value       = aws_rds_cluster.main.database_name
}

output "secret_arn" {
  description = "Secrets Manager ARN holding the master credentials"
  value       = aws_secretsmanager_secret.db.arn
  sensitive   = true
}
