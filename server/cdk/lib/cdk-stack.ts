import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const jiraIssueHandlerLambda = new lambda.DockerImageFunction(this, "jiraIssueLoader", {
      functionName: "jira-issue-loader",
      code: lambda.DockerImageCode.fromImageAsset("../"),
    });

    new apigw.LambdaRestApi(this, "Endpoint", {
      handler: jiraIssueHandlerLambda,
    });
  }
}