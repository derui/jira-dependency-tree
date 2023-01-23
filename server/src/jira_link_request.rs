use isahc::{http::StatusCode, Body, Error, ReadResponseExt, RequestExt, Response};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

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

        match status {
            StatusCode::CREATED => {
                let location = res.headers().get("location").unwrap();
                Some(JiraIssueLink {
                    id: location.to_str().unwrap().to_string(),
                })
            }
            _ => None,
        }
    } else {
        None
    }
}
