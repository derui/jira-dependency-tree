pub mod api_type;
mod error;
pub mod issue;
pub mod jira_issue_request;
pub mod jira_link_request;
pub mod jira_search_request;
pub mod jira_url;

use api_type::{CreateLinkRequest, DeleteLinkRequest, IssueLoadingRequest, IssueSearchRequest};
use isahc::http::Method;
use jira_link_request::{create_link, delete_link};

use jira_url::JiraAuhtorization;
use lambda_http::{Body, Error, Request, Response};

use serde_json::json;

pub async fn handler(event: Request) -> Result<Response<Body>, Error> {
    // Extract some useful information from the request
    let unmatch = not_found();
    let preflight = preflight();

    match event.uri().path() {
        "/prod/get-issues" => match *event.method() {
            Method::POST => execute_get_issues(&event).await,
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
        "/prod/search-issues" => match *event.method() {
            Method::POST => execute_search_issues(&event).await,
            Method::OPTIONS => preflight,
            _ => unmatch,
        },
        _ => unmatch,
    }
}

fn event_to_cred(event: &Request) -> JiraAuhtorization {
    JiraAuhtorization {
        user_domain: event
            .headers()
            .get("x-user-domain")
            .unwrap()
            .to_str()
            .unwrap()
            .to_string(),
        email: event
            .headers()
            .get("x-user-email")
            .unwrap()
            .to_str()
            .unwrap()
            .to_string(),
        jira_token: event
            .headers()
            .get("x-user-token")
            .unwrap()
            .to_str()
            .unwrap()
            .to_string(),
    }
}

async fn execute_get_issues(event: &Request) -> Result<Response<Body>, Error> {
    let json: IssueLoadingRequest = match event.body() {
        Body::Text(text) => serde_json::from_str(text).map_err(|_| "Invalid format"),
        _ => Err("Invalid body type"),
    }?;

    let cred = event_to_cred(event);

    let issues = jira_issue_request::load_issue(&json, cred.clone());

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

async fn execute_delete_link(event: &Request) -> Result<Response<Body>, Error> {
    let json: DeleteLinkRequest = match event.body() {
        Body::Text(text) => serde_json::from_str(text).map_err(|_| "Invalid format"),
        _ => Err("Invalid body type"),
    }?;

    let cred = event_to_cred(event);

    delete_link(&json.id, &cred).expect("Not found");

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

    let cred = event_to_cred(event);
    let link = create_link(&json.inward_issue, &json.outward_issue, &cred).expect("Not found");

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

async fn execute_search_issues(event: &Request) -> Result<Response<Body>, Error> {
    let json: IssueSearchRequest = match event.body() {
        Body::Text(text) => serde_json::from_str(text).map_err(|_| "Invalid format"),
        _ => Err("Invalid body type"),
    }?;

    let cred = event_to_cred(event);
    let issues = jira_search_request::search_issues(&json, cred.clone());

    match issues {
        Ok(issues) => {
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
                .unwrap();
            Ok(resp)
        }
        Err(resp) => Ok(resp),
    }
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
