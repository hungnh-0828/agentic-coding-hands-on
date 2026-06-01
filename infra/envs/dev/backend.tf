# REVIEW BEFORE DEPLOY
# State bucket + lock table must exist before `terraform init` (bootstrap separately).
terraform {
  backend "s3" {
    bucket         = "webapp-tf-state-dev"
    key            = "dev/terraform.tfstate"
    region         = "ap-southeast-1"
    encrypt        = true
    dynamodb_table = "webapp-tf-locks-dev"
  }
}
