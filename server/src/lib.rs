pub mod jira_issue_request;
pub mod jira_project_request;

use isahc::http::Method;
use lambda_http::{Body, Error, Request, Response};
use serde::Deserialize;
use serde_json::json;

#[derive(Deserialize, Clone, Debug)]
pub struct JiraAuhtorization {
    pub jira_token: String,
    pub email: String,
    pub user_domain: String,
}

#[derive(Deserialize)]
pub struct IssueLoadingRequest {
    pub authorization: JiraAuhtorization,
    pub project: String,
}

pub async fn handler(event: Request) -> Result<Response<Body>, Error> {
    // Extract some useful information from the request
    let unmatch = not_found();
    let preflight = preflight();

    match event.uri().path() {
        "/prod/load-issues" => match event.method() {
            &Method::POST => execute_load_issue(&event).await,
            &Method::OPTIONS => preflight,
            _ => unmatch,
        },
        "/prod/load-project" => match event.method() {
            &Method::POST => execute_load_project(&event).await,
            &Method::OPTIONS => preflight,
            _ => unmatch,
        },
        _ => unmatch,
    }
}

async fn execute_load_issue(event: &Request) -> Result<Response<Body>, Error> {
    let json: IssueLoadingRequest = match event.body() {
        Body::Text(text) => serde_json::from_str(text).map_err(|_| "Invalid format"),
        _ => Err("Invalid body type"),
    }?;

    let issues = jira_issue_request::load_issue(&json, json.authorization.clone());
    // let issues = json!(
    // [{"key":"TES-3","summary":"Test3","description":null,"statusId":"10001","typeId":"10001","selfUrl":"https://derui.atlassian.net/rest/api/3/issue/10002","links":[]},{"key":"TES-2","summary":"Teset2","description":null,"statusId":"10000","typeId":"10001","selfUrl":"https://derui.atlassian.net/rest/api/3/issue/10001","links":[{"outwardIssue":"TES-3"}]},{"key":"TES-1","summary":"Test1","description":null,"statusId":"10001","typeId":"10001","selfUrl":"https://derui.atlassian.net/rest/api/3/issue/10000","links":[{"outwardIssue":"TES-2"},{"outwardIssue":"TES-3"}]}]

    //     );

    // Return something that implements IntoResponse.
    // It will be serialized to the right response event automatically by the runtime
    let resp = Response::builder()
        .status(200)
        .header("content-type", "application/json")
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Method", "POST,OPTIONS")
        .body(
            serde_json::to_string(&issues)
                .expect("unexpected format")
                .into(),
        )
        .map_err(Box::new)?;
    Ok(resp)
}

async fn execute_load_project(event: &Request) -> Result<Response<Body>, Error> {
    let json: IssueLoadingRequest = match event.body() {
        Body::Text(text) => serde_json::from_str(text).map_err(|_| "Invalid format"),
        _ => Err("Invalid body type"),
    }?;

    let project = jira_project_request::load_project(&json.project, json.authorization.clone())
        .expect("Not found");

    // let project = json!(
    //     {"id":10000,"key":"TES","name":"testproejct","statuses":[{"id":"10002","name":"Done","statusCategory":"DONE"},{"id":"10001","name":"In Progress","statusCategory":"IN_PROGRESS"},{"id":"10000","name":"To Do","statusCategory":"TODO"}],"statusCategories":[{"id":null,"name":"カテゴリがありません","colorName":"medium-gray"},{"id":null,"name":"To Do","colorName":"blue-gray"},{"id":null,"name":"進行中","colorName":"yellow"},{"id":null,"name":"完了","colorName":"green"}],"issueTypes":[{"id":"10001","name":"ストーリー","avatarUrl":null},{"id":"10002","name":"タスク","avatarUrl":null},{"id":"10003","name":"バグ","avatarUrl":null},{"id":"10004","name":"エピック","avatarUrl":null},{"id":"10005","name":"サブタスク","avatarUrl":null}]}
    // );

    // Return something that implements IntoResponse.
    // It will be serialized to the right response event automatically by the runtime
    let resp = Response::builder()
        .status(200)
        .header("content-type", "application/json")
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Method", "POST,OPTIONS")
        .body(
            serde_json::to_string(&project)
                .expect("unexpected format")
                .into(),
        )
        .map_err(Box::new)?;
    Ok(resp)
}

fn not_found() -> Result<Response<Body>, Error> {
    let builder = Response::builder().status(404);
    let json = json!({});
    Ok(builder.body(Body::Text(json.to_string()))?)
}

fn preflight() -> Result<Response<Body>, Error> {
    let builder = Response::builder().status(200);
    let json = json!({});
    Ok(builder
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Method", "POST,OPTIONS")
        .header("Access-Control-Allow-Headers", "content-type,x-api-key")
        .body(Body::Text(json.to_string()))?)
}
