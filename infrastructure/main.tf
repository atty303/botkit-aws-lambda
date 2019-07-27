terraform {
  required_version = ">= 0.12.0"

  required_providers {
    aws     = ">= 2.21.0"
  }

  backend "s3" {
    region = "ap-northeast-1"
    bucket = "atty303-terraform"
    key = "botkit-aws-lambda/terraform.tfstate"
    workspace_key_prefix = "env:"
    dynamodb_table = "terraform_backend"
  }
}

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

resource aws_api_gateway_deployment api {
  depends_on  = ["aws_api_gateway_integration.proxy_any"]
  rest_api_id = aws_api_gateway_rest_api.api.id
  stage_name  = "default"
}

resource aws_api_gateway_integration proxy_any {
  content_handling        = "CONVERT_TO_TEXT"
  http_method             = aws_api_gateway_method.any.http_method
  integration_http_method = "POST"
  resource_id             = aws_api_gateway_resource.proxy.id
  rest_api_id             = aws_api_gateway_rest_api.api.id
  timeout_milliseconds    = 15000
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.name}:lambda:path/2015-03-31/functions/${var.apex_function_bot}/invocations"
}

resource aws_api_gateway_method any {
  authorization = "NONE"
  http_method   = "ANY"
  resource_id   = aws_api_gateway_resource.proxy.id
  rest_api_id   = aws_api_gateway_rest_api.api.id
}

resource aws_api_gateway_resource proxy {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "{proxy+}"
}

resource aws_api_gateway_rest_api api {
  description = "Slackbot REST API"
  name        = "bot"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
  minimum_compression_size = -1
  api_key_source = "HEADER"
}

resource "aws_lambda_permission" "invoke_api" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.apex_function_bot
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.api.id}/*/*"
}
