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
      timeout: cdk.Duration.minutes(1),
    });

    const restApi = new apigw.LambdaRestApi(this, "Endpoint", {
      handler: jiraIssueHandlerLambda,
      apiKeySourceType: apigw.ApiKeySourceType.HEADER,
      proxy: false,
    });

    const integration = new apigw.LambdaIntegration(jiraIssueHandlerLambda, {
      proxy: true,
    });

    const issues = restApi.root.addResource("get-issues");
    issues.addMethod("POST", integration, { apiKeyRequired: true });
    issues.addMethod("OPTIONS", integration, { apiKeyRequired: false });

    const searchIssues = restApi.root.addResource("search-issues");
    searchIssues.addMethod("POST", integration, { apiKeyRequired: true });
    searchIssues.addMethod("OPTIONS", integration, { apiKeyRequired: false });

    const createLink = restApi.root.addResource("create-link");
    createLink.addMethod("POST", integration, { apiKeyRequired: true });
    createLink.addMethod("OPTIONS", integration, { apiKeyRequired: false });

    const deleteLink = restApi.root.addResource("delete-link");
    deleteLink.addMethod("POST", integration, { apiKeyRequired: true });
    deleteLink.addMethod("OPTIONS", integration, { apiKeyRequired: false });

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
