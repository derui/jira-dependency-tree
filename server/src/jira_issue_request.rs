use isahc::{ReadResponseExt, Request, RequestExt};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::{jira_url::JiraUrl, IssueLoadingRequest, IssueSearchCondition};

#[derive(Deserialize, Serialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct JiraIssueLink {
    pub outward_issue: Option<String>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct JiraSubtask {
    pub key: String,
    pub summary: String,
    pub description: Option<String>,
    pub status_id: Option<String>,
    pub type_id: Option<String>,
    pub self_url: Option<String>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct JiraIssue {
    pub key: String,
    pub summary: String,
    pub description: Option<String>,
    pub status_id: Option<String>,
    pub type_id: Option<String>,
    pub self_url: Option<String>,
    pub links: Vec<JiraIssueLink>,
    pub subtasks: Vec<JiraSubtask>,
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

fn as_subtasks(value: &[Value]) -> Vec<JiraSubtask> {
    value
        .iter()
        .map(|v| JiraSubtask {
            key: v["key"].as_str().expect("key must not null").into(),
            summary: v["fields"]["summary"]
                .as_str()
                .expect("summary must not null")
                .into(),
            description: v["fields"]["description"]["text"]
                .as_str()
                .map(|v| v.into()),
            status_id: v["fields"]["status"]["id"].as_str().map(|v| v.into()),
            type_id: v["fields"]["issuetype"]["id"].as_str().map(|v| v.into()),
            self_url: v["self"].as_str().map(|v| v.into()),
        })
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
            subtasks: issue["fields"]["subtasks"]
                .as_array()
                .map(|v| as_subtasks(v))
                .unwrap_or_default(),
        })
        .collect()
}

fn request_to_jql(request: &IssueLoadingRequest) -> String {
    match &request.condition {
        Some(IssueSearchCondition {
            sprint: Some(sprint),
            epic: None,
        }) => format!("project = \"{}\" AND Sprint = {}", request.project, sprint),
        Some(IssueSearchCondition {
            sprint: None,
            epic: Some(epic),
        }) => format!(
            "project = \"{}\" AND parentEpic = \"{}\"",
            request.project, epic
        ),
        _ => format!(
            "project = \"{}\" AND Sprint in openSprints()",
            request.project
        ),
    }
}

// load all issues from Jira API
fn load_issue_recursive(
    request: &IssueLoadingRequest,
    url: impl JiraUrl,
    issues: &mut Vec<JiraIssue>,
) -> Result<Vec<JiraIssue>, Box<dyn std::error::Error>> {
    let jira_url = url.get_url("/rest/api/3/search");
    let body = json!({
        "jql": request_to_jql(request),
        "startAt": issues.len(),
        "fields": vec!["status", "issuetype", "issuelinks", "subtasks", "summary"]
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
            let total_size = json["total"].as_u64().unwrap_or_default() as usize;

            issues.append(as_issue(got_issues).as_mut());

            if total_size <= issues.len() {
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
