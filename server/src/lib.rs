pub mod jira_issue_request;
pub mod jira_project_request;
pub mod jira_suggestion_request;
pub mod jira_url;

use isahc::http::Method;
use jira_url::JiraAuhtorization;
use lambda_http::{Body, Error, Request, Response};
use serde::Deserialize;
use serde_json::json;

#[derive(Deserialize, Default)]
pub struct IssueSearchCondition {
    pub sprint: Option<String>,
    pub epic: Option<String>,
}

#[derive(Deserialize)]
pub struct IssueLoadingRequest {
    pub authorization: JiraAuhtorization,
    pub project: String,
    pub condition: Option<IssueSearchCondition>,
}

#[derive(Deserialize)]
pub struct SuggestionRequest {
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
        "/prod/get-suggestions" => match event.method() {
            &Method::POST => execute_get_suggestions(&event).await,
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

async fn execute_get_suggestions(event: &Request) -> Result<Response<Body>, Error> {
    let json: SuggestionRequest = match event.body() {
        Body::Text(text) => serde_json::from_str(text).map_err(|_| "Invalid format"),
        _ => Err("Invalid body type"),
    }?;

    let project =
        jira_suggestion_request::get_suggestions(json.authorization.clone(), &json.project)
            .expect("Not found");

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
