use jira_issue_loader::handler;

#[tokio::test]
async fn test_parse_request() {
    // arrange
    let input = serde_json::json!({
        "authorization": {
        "jira_token": "token",
        "email": "email@example.com",
        "user_domain": "user-domain"
        },
        "project": "project"
    });

    // do
    let request = lambda_http::http::Request::builder()
        .uri("http://localhost/foo")
        .body(input.to_string().into())
        .expect("failed to create request");

    // verify
    let _response = handler(request).await.expect("failed to handle request");
}
