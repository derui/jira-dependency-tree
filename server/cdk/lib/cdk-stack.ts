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

    const restApi = new apigw.LambdaRestApi(this, "Endpoint", {
      handler: jiraIssueHandlerLambda,
      apiKeySourceType: apigw.ApiKeySourceType.HEADER,
      proxy: false,
    });

    const integration = new apigw.LambdaIntegration(jiraIssueHandlerLambda, {
      proxy: true,
    });

    const issues = restApi.root.addResource("load-issues");
    issues.addMethod("POST", integration, { apiKeyRequired: true });
    issues.addMethod("OPTIONS", integration, { apiKeyRequired: false });
    const project = restApi.root.addResource("load-project");
    project.addMethod("POST", integration, { apiKeyRequired: true });
    project.addMethod("OPTIONS", integration, { apiKeyRequired: false });
    const suggestions = restApi.root.addResource("get-suggestions");
    suggestions.addMethod("POST", integration, { apiKeyRequired: true });
    suggestions.addMethod("OPTIONS", integration, { apiKeyRequired: false });

    new apigw.RateLimitedApiKey(this, "default", {
      apiKeyName: "default",
      apiStages: [
        {
          api: restApi,
          stage: restApi.deploymentStage,
        },
      ],
      resources: [restApi],
      enabled: true,
      throttle: {
        rateLimit: 10,
        burstLimit: 10,
      },
    });
  }
}
