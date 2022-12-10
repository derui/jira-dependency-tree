use std::{
    collections::{HashMap, HashSet},
    default::default,
    ops::Deref,
};

use isahc::{ReadResponseExt, Request, RequestExt};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::{jira_url::JiraUrl, IssueLoadingRequest, IssueSearchCondition};

#[derive(Deserialize, Serialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct JiraIssueLink {
    pub outward_issue: String,
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
    pub subtasks: Vec<String>,
}

impl JiraIssue {
    /// correct self links/subtasks with issue map
    fn correct_from_map(&self, map: &HashMap<String, JiraIssue>) -> JiraIssue {
        JiraIssue {
            links: self
                .links
                .iter()
                .filter(|v| map.contains_key(&v.outward_issue))
                .map(|v| JiraIssueLink {
                    outward_issue: v.outward_issue,
                })
                .collect(),
            subtasks: self
                .subtasks
                .iter()
                .filter(|v| map.contains_key(*v))
                .map(|v| v.into())
                .collect(),
            ..*self
        }
    }
}

/// json to issue link
fn as_issuelink(value: &[Value]) -> Vec<JiraIssueLink> {
    value
        .iter()
        .filter_map(|v| {
            v["outwardIssue"]
                .as_object()
                .and_then(|obj| obj["key"].as_str())
                .map(|v| JiraIssueLink {
                    outward_issue: v.to_string(),
                })
        })
        .collect()
}

/// json to subtask
fn as_subtasks(value: &[Value]) -> Vec<String> {
    value
        .iter()
        .map(|v| v["key"].as_str().expect("key must not null").to_string())
        .collect()
}

/// json to JiraIssue
fn as_issue(issue: &Value) -> JiraIssue {
    JiraIssue {
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
    }
}

/// get all keys of issue
fn as_issue_keys(issue: &Value) -> HashSet<String> {
    let mut keys = HashSet::new();

    let key = issue["key"]
        .as_str()
        .expect("key must not null")
        .to_string();
    keys.insert(key);

    issue["fields"]["issuelinks"].as_array().map(|v| {
        v.iter().for_each(|v| {
            keys.insert(v.as_str().expect("key must not null").to_string());
        })
    });

    issue["fields"]["subtasks"].as_array().map(|v| {
        v.iter().for_each(|v| {
            keys.insert(v.as_str().expect("key must not null").to_string());
        })
    });

    keys
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

/// load all issues from Jira API with JQL
fn load_issue_recursive<T, F>(
    jql: &str,
    url: impl JiraUrl,
    callback: F,
) -> Result<(), Box<dyn std::error::Error>>
where
    F: FnMut(&Value) -> T,
    T: Clone,
{
    let jira_url = url.get_url("/rest/api/3/search");
    let mut total = Some(0);

    while let Some(current_total) = total {
        let body = json!({
            "jql": jql,
            "startAt": current_total,
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
            None => break,
            Some(got_issues) => {
                let total_size = json["total"].as_u64().unwrap_or_default() as usize;

                got_issues.iter_mut().for_each(|v| {
                    callback(v);
                });

                if total_size <= current_total {
                    break;
                }

                total = Some(total_size);
            }
        }
    }

    Ok(())
}

// load issue with request
pub fn load_issue(request: &IssueLoadingRequest, url: impl JiraUrl) -> Vec<JiraIssue> {
    let mut loaded_issues = HashMap::new();
    let mut issue_keys: HashSet<String> = HashSet::new();
    let jql = request_to_jql(request);
    let mut callback = |value| {
        for v in as_issue_keys(value) {
            issue_keys.insert(v);
        }

        loaded_issues.insert(value["key"].to_string(), as_issue(value));
    };

    // load all issue keys in jql
    load_issue_recursive(&jql, url, callback).unwrap_or(());

    let not_full_loaded_keys = issue_keys.difference(&HashSet::from_iter(
        loaded_issues.keys().into_iter().map(|v| v.to_string()),
    ));
    let keys = not_full_loaded_keys
        .map(|v| v.to_string())
        .collect::<Vec<String>>()
        .join(", ");
    let jql = format!("key IN ({})", keys);

    // load issues do not fully-loaded
    load_issue_recursive(&jql, url, callback).unwrap_or(());

    loaded_issues
        .values()
        .map(|issue| issue.correct_from_map(&loaded_issues))
        .collect()
}
