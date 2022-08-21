pub mod jira_request;

use lambda_http::{run, service_fn, Body, Error, Request, Response};
use serde::Deserialize;

#[derive(Deserialize, Clone, Debug)]
pub struct JiraAuhtorization {
    pub jira_token: String,
    pub email: String,
    pub user_domain: String,
}

#[derive(Deserialize)]
pub struct IssueLoadingRequest {
    pub authorization: JiraAuhtorization,
}

/// This is the main body for the function.
/// Write your code inside it.
/// There are some code example in the following URLs:
/// - https://github.com/awslabs/aws-lambda-rust-runtime/tree/main/examples
pub async fn handler(event: Request) -> Result<Response<Body>, Error> {
    // Extract some useful information from the request
    let json: IssueLoadingRequest = match event.body() {
        Body::Text(text) => serde_json::from_str(text).map_err(|_| "Invalid format"),
        _ => Err("Invalid body type"),
    }?;

    assert_eq!(json.authorization.jira_token, "");

    // Return something that implements IntoResponse.
    // It will be serialized to the right response event automatically by the runtime
    let resp = Response::builder()
        .status(200)
        .header("content-type", "text/html")
        .body("Hello AWS Lambda HTTP request".into())
        .map_err(Box::new)?;
    Ok(resp)
}
