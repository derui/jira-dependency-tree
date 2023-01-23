use isahc::{http::StatusCode, Body, Error, ReadResponseExt, RequestExt, Response};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use url::Url;

use crate::{jira_project_request::build_partial_request, jira_url::JiraUrl};

#[derive(Deserialize, Serialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct JiraIssueLink {
    pub id: String,
}

// load all sprints from Jira API
fn request_create_link(
    inward_key: &str,
    outward_key: &str,
    url: &impl JiraUrl,
) -> Result<Response<Body>, Error> {
    build_partial_request("/rest/api/3/issueLink", url)
        .method(isahc::http::Method::POST)
        .body(
            json!({
                "outwardIssue": {
                    "key": outward_key,
                },
                "inwardIssue": {
                    "key": inward_key
                },
                "type": {
                    "name": "Blocks"
                }
            })
            .to_string(),
        )?
        .send()
}

// create link between two issues
pub fn create_link(
    inward_key: &str,
    outward_key: &str,
    url: &impl JiraUrl,
) -> Option<JiraIssueLink> {
    if let Ok(res) = request_create_link(inward_key, outward_key, url) {
        let status = res.status();

        if let StatusCode::CREATED = status {
            let location = res.headers().get("location").unwrap().to_str().unwrap();
            let url = Url::parse(&location).expect("should be URL as location");
            let id_segment = url
                .path_segments()
                .map(|c| c.collect::<Vec<_>>())
                .and_then(|c| c.last().cloned())
                .expect("should has least one segment");

            Some(JiraIssueLink {
                id: id_segment.to_string(),
            })
        } else {
            None
        }
    } else {
        None
    }
}

// load all sprints from Jira API
fn request_delete_link(id: &str, url: &impl JiraUrl) -> Result<Response<Body>, Error> {
    build_partial_request(&format!("/rest/api/3/issueLink/{}", id), url)
        .method(isahc::http::Method::DELETE)
        .body(())?
        .send()
}

// create link between two issues
pub fn delete_link(id: &str, url: &impl JiraUrl) -> Option<()> {
    if let Ok(res) = request_delete_link(id, url) {
        let status = res.status();

        match status {
            StatusCode::OK | StatusCode::NO_CONTENT => Some(()),
            _ => None,
        }
    } else {
        None
    }
}
