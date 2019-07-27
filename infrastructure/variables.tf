variable "aws_region" {}
variable "apex_environment" {}
variable "apex_function_role" {}
variable "apex_function_arns" {
  type = map(string)
}
variable "apex_function_names" {
  type = map(string)
}
variable "apex_function_bot" {}
variable "apex_function_bot_name" {}
