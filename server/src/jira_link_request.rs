use isahc::{http::StatusCode, Body, Error, Request, RequestExt, Response};
use serde_json::json;
use url::Url;

use crate::{issue::JiraIssueLink, jira_url::JiraUrl};

// load all sprints from Jira API
fn request_create_link(
    inward_key: &str,
    outward_key: &str,
    url: &impl JiraUrl,
) -> Result<Response<Body>, Error> {
    Request::post(url.get_url("/rest/api/3/issueLink"))
        .header(
            "authorization",
            url.get_base_headers()
                .get("authorization")
                .unwrap_or(&String::from("")),
        )
        .header("content-type", "application/json")
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
            let url = Url::parse(location).expect("should be URL as location");
            let id_segment = url
                .path_segments()
                .map(|c| c.collect::<Vec<_>>())
                .and_then(|c| c.last().cloned())
                .expect("should has least one segment");

            Some(JiraIssueLink {
                id: id_segment.to_string(),
                outward_issue: String::from(outward_key),
                inward_issue: String::from(inward_key),
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
    let jira_url = url.get_url(&format!("/rest/api/3/issueLink/{}", id));

    Request::delete(jira_url)
        .header(
            "authorization",
            url.get_base_headers()
                .get("authorization")
                .unwrap_or(&String::from("")),
        )
        .header("content-type", "application/json")
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
