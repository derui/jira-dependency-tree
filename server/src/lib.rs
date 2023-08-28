pub mod api_type;
pub mod issue;
pub mod jira_issue_request;
pub mod jira_link_request;
pub mod jira_project_request;
pub mod jira_projects_request;
pub mod jira_search_request;
pub mod jira_suggestion_request;
pub mod jira_url;

use api_type::{
    CreateLinkRequest, DeleteLinkRequest, GetProjectsRequest, IssueLoadingRequest,
    ProjectsResponse, SuggestionRequest,
};
use isahc::http::Method;
use jira_link_request::{create_link, delete_link};

use lambda_http::{Body, Error, Request, Response};

use serde_json::json;

pub async fn handler(event: Request) -> Result<Response<Body>, Error> {
    // Extract some useful information from the request
    let unmatch = not_found();
    let preflight = preflight();

    match event.uri().path() {
        "/prod/get-issues" => match *event.method() {
            Method::POST => execute_load_issue(&event).await,
            Method::OPTIONS => preflight,
            _ => unmatch,
        },
        "/prod/get-project" => match *event.method() {
            Method::POST => execute_get_project(&event).await,
            Method::OPTIONS => preflight,
            _ => unmatch,
        },
        "/prod/get-projects" => match *event.method() {
            Method::POST => execute_load_projects(&event).await,
            Method::OPTIONS => preflight,
            _ => unmatch,
        },
        "/prod/get-suggestions" => match *event.method() {
            Method::POST => execute_get_suggestions(&event).await,
            Method::OPTIONS => preflight,
            _ => unmatch,
        },
        "/prod/create-link" => match *event.method() {
            Method::POST => execute_create_link(&event).await,
            Method::OPTIONS => preflight,
            _ => unmatch,
        },
        "/prod/delete-link" => match *event.method() {
            Method::POST => execute_delete_link(&event).await,
            Method::OPTIONS => preflight,
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

async fn execute_get_project(event: &Request) -> Result<Response<Body>, Error> {
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

async fn execute_load_projects(event: &Request) -> Result<Response<Body>, Error> {
    let json: GetProjectsRequest = match event.body() {
        Body::Text(text) => serde_json::from_str(text).map_err(|_| "Invalid format"),
        _ => Err("Invalid body type"),
    }?;

    let projects = jira_projects_request::load_projects(json.authorization);

    // Return something that implements IntoResponse.
    // It will be serialized to the right response event automatically by the runtime
    let resp = Response::builder()
        .status(200)
        .header("content-type", "application/json")
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Method", "POST,OPTIONS")
        .body(
            serde_json::to_string(&ProjectsResponse { values: projects })
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

    let project = jira_suggestion_request::get_suggestions(
        json.authorization.clone(),
        &json.project,
        &json.input_value,
    )
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

async fn execute_delete_link(event: &Request) -> Result<Response<Body>, Error> {
    let json: DeleteLinkRequest = match event.body() {
        Body::Text(text) => serde_json::from_str(text).map_err(|_| "Invalid format"),
        _ => Err("Invalid body type"),
    }?;

    delete_link(&json.id, &json.authorization).expect("Not found");

    // Return something that implements IntoResponse.
    // It will be serialized to the right response event automatically by the runtime
    let resp = Response::builder()
        .status(200)
        .header("content-type", "application/json")
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Method", "POST,OPTIONS")
        .body(().into())?;
    Ok(resp)
}

async fn execute_create_link(event: &Request) -> Result<Response<Body>, Error> {
    let json: CreateLinkRequest = match event.body() {
        Body::Text(text) => serde_json::from_str(text).map_err(|_| "Invalid format"),
        _ => Err("Invalid body type"),
    }?;

    let link = create_link(&json.inward_issue, &json.outward_issue, &json.authorization)
        .expect("Not found");

    // Return something that implements IntoResponse.
    // It will be serialized to the right response event automatically by the runtime
    let resp = Response::builder()
        .status(200)
        .header("content-type", "application/json")
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Method", "POST,OPTIONS")
        .body(
            serde_json::to_string(&link)
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

    #[cfg(debug_assertions)]
    let origin = "http://localhost:5173";

    #[cfg(not(debug_assertions))]
    let origin = include_str!(".origin-release").trim();

    Ok(builder
        .header("Access-Control-Allow-Origin", origin)
        .header("Access-Control-Allow-Method", "POST,OPTIONS")
        .header("Access-Control-Allow-Headers", "content-type,x-api-key")
        .body(Body::Text(json.to_string()))?)
}
