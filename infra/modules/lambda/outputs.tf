# REVIEW BEFORE DEPLOY
output "function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.fn.function_name
}

output "function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.fn.arn
}

output "invoke_arn" {
  description = "Invoke ARN (for API Gateway integration)"
  value       = aws_lambda_function.fn.invoke_arn
}

output "role_arn" {
  description = "ARN of the function execution role"
  value       = aws_iam_role.fn.arn
}
