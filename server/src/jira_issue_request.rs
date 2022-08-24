use std::collections::HashMap;

use isahc::{ReadResponseExt, Request, RequestExt};
use serde::Serialize;
use serde_json::{json, Value};

use crate::{IssueLoadingRequest, JiraAuhtorization};

pub trait JiraUrl {
    // get full url with path
    fn get_url(&self, path: &str) -> String;

    fn get_base_headers(&self) -> HashMap<String, String>;
}

impl JiraUrl for JiraAuhtorization {
    fn get_url(&self, path: &str) -> String {
        let path = path.trim_start_matches(' ');
        let path = path.trim_start_matches('/');
        format!("https://{}.atlassian.net/{}", self.user_domain, path)
    }

    fn get_base_headers(&self) -> HashMap<String, String> {
        let mut map = HashMap::new();
        let auth = format!("{}:{}", self.email, self.jira_token);

        map.insert(
            String::from("authorization"),
            format!("Basic {}", base64::encode(auth)),
        );

        map
    }
}

#[derive(Serialize, Clone, Debug, PartialEq, Eq)]
pub struct JiraIssueLink {
    pub outward_issue: Option<String>,
}

#[derive(Serialize, Clone, Debug)]
pub struct JiraIssue {
    pub key: String,
    pub summary: String,
    pub description: Option<String>,
    pub status_id: Option<String>,
    pub type_id: Option<String>,
    pub self_url: Option<String>,
    pub links: Vec<JiraIssueLink>,
}

fn as_issuelink(value: &[Value]) -> Vec<JiraIssueLink> {
    value
        .iter()
        .filter_map(|v| {
            v["outwardIssue"]
                .as_object()
                .map(|obj| obj["key"].as_str().map(|v| v.into()))
        })
        .map(|v| JiraIssueLink { outward_issue: v })
        .collect()
}

// json to JiraIssue
fn as_issue(issues: &[Value]) -> Vec<JiraIssue> {
    issues
        .iter()
        .map(|issue| JiraIssue {
            key: issue["key"].as_str().expect("key must not null").into(),
            summary: issue["fields"]["summary"]
                .as_str()
                .expect("summary must not null")
                .into(),
            description: issue["fields"]["description"]["text"]
                .as_str()
                .map(|v| v.into()),
            status_id: issue["fields"]["status"]["id"].as_str().map(|v| v.into()),
            type_id: issue["fields"]["issuetype"]["id"]
                .as_str()
                .map(|v| v.into()),
            self_url: issue["self"].as_str().map(|v| v.into()),
            links: issue["fields"]["issuelinks"]
                .as_array()
                .map(|v| as_issuelink(v))
                .unwrap_or_default(),
        })
        .collect()
}

// load all issues from Jira API
fn load_issue_recursive(
    request: &IssueLoadingRequest,
    url: impl JiraUrl,
    issues: &mut Vec<JiraIssue>,
) -> Result<Vec<JiraIssue>, Box<dyn std::error::Error>> {
    let jira_url = url.get_url("/rest/api/3/search");
    let body = json!({
        "jql": format!("project = \"{}\" AND Sprint in openSprints()", request.project),
        "startAt": issues.len()
    });

    let mut res = Request::post(jira_url)
        .header(
            "authorization",
            url.get_base_headers()
                .get("authorization")
                .unwrap_or(&String::from("")),
        )
        .header("content-type", "application/json")
        .body(body.to_string())?
        .send()?;

    let json: Value = res.json()?;

    match json["issues"].as_array() {
        None => Ok(Vec::from_iter(issues.iter().cloned())),
        Some(got_issues) => {
            let issue_len = got_issues.len();
            let total_size = json["total"].as_u64().unwrap_or_default() as usize;

            issues.append(as_issue(got_issues).as_mut());

            if total_size <= issues.len() + issue_len {
                return Ok(Vec::from_iter(issues.iter().cloned()));
            }

            load_issue_recursive(request, url, issues)
        }
    }
}

// load issue with request
pub fn load_issue(request: &IssueLoadingRequest, url: impl JiraUrl) -> Vec<JiraIssue> {
    let mut vec: Vec<JiraIssue> = Vec::new();

    load_issue_recursive(request, url, &mut vec).unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use crate::JiraAuhtorization;

    use super::JiraUrl;

    #[test]
    fn get_url_for_jira_cloud() {
        // arrange
        let auth = JiraAuhtorization {
            jira_token: String::from("token"),
            email: String::from("test@example.com"),
            user_domain: String::from("domain"),
        };

        // do
        let url = auth.get_url("test/path");

        // verify
        assert_eq!(url, "https://domain.atlassian.net/test/path");
    }

    #[test]
    fn should_strip_lead_slash_from_path() {
        // arrange
        let auth = JiraAuhtorization {
            jira_token: String::from("token"),
            email: String::from("test@example.com"),
            user_domain: String::from("domain"),
        };

        // do
        let url = auth.get_url("/lead/slash");
        let multi_lead_slashes = auth.get_url("///lead/slash");

        // verify
        assert_eq!(url, "https://domain.atlassian.net/lead/slash");
        assert_eq!(
            multi_lead_slashes,
            "https://domain.atlassian.net/lead/slash"
        );
    }

    #[test]
    fn get_authorization_header() {
        // arrange
        let auth = JiraAuhtorization {
            jira_token: String::from("token"),
            email: String::from("test@example.com"),
            user_domain: String::from("domain"),
        };

        // do
        let headers = auth.get_base_headers();

        // verify
        assert_eq!(
            headers
                .get("authorization")
                .expect("can not found authorization"),
            "Basic dGVzdEBleGFtcGxlLmNvbTp0b2tlbg=="
        );
    }
}
