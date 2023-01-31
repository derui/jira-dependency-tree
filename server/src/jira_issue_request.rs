use std::collections::{HashMap, HashSet};

use isahc::{ReadResponseExt, Request, RequestExt};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::{jira_url::JiraUrl, IssueLoadingRequest, IssueSearchCondition};

#[derive(Deserialize, Serialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct JiraIssueLink {
    pub id: String,
    pub outward_issue: String,
    pub inward_issue: String,
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
    /// correct self with issue map
    fn correct_from_map(&self, map: &HashMap<String, JiraIssue>) -> JiraIssue {
        JiraIssue {
            subtasks: self
                .subtasks
                .iter()
                .filter_map(|v| {
                    if map.contains_key(v) {
                        Some(v.into())
                    } else {
                        None
                    }
                })
                .collect(),
            ..self.clone()
        }
    }
}

/// json to issue link
fn as_issuelink(value: &[Value], issue_key: &str) -> Vec<JiraIssueLink> {
    value
        .iter()
        .filter_map(|v| {
            let id = v["id"].as_str();
            let outward = v["outwardIssue"]["key"].as_str();
            let inward = v["inwardIssue"]["key"].as_str();

            match (id, outward, inward) {
                (Some(id), Some(outward_issue), None) => Some(JiraIssueLink {
                    id: id.to_string(),
                    outward_issue: outward_issue.to_string(),
                    inward_issue: issue_key.to_string(),
                }),
                (Some(id), None, Some(inward_issue)) => Some(JiraIssueLink {
                    id: id.to_string(),

                    outward_issue: issue_key.to_string(),
                    inward_issue: inward_issue.to_string(),
                }),
                (_, _, _) => None,
            }
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
    let key = issue["key"].as_str().expect("key must not null");

    JiraIssue {
        key: key.to_string(),
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
            .map(|v| as_issuelink(v, key))
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

    if let Some(v) = issue["fields"]["issuelinks"].as_array() {
        v.iter().for_each(|v| {
            if let Some(key) = v["outwardIssue"]["key"].as_str() {
                keys.insert(key.to_string());
            }
        })
    }

    if let Some(v) = issue["fields"]["subtasks"].as_array() {
        v.iter().for_each(|v| {
            if let Some(key) = v["key"].as_str() {
                keys.insert(key.to_string());
            }
        })
    }

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
    url: &impl JiraUrl,
    callback: &mut F,
) -> Result<(), Box<dyn std::error::Error>>
where
    F: FnMut(&mut Value) -> T,
    T: Clone,
{
    let mut total = Some(0);

    while let Some(current_total) = total {
        let jira_url = url.get_url("/rest/api/3/search");
        let body = json!({
            "jql": jql,
            "startAt": current_total,
            "maxResults": 50,
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

                got_issues.clone().iter_mut().for_each(|v| {
                    (*callback)(v);
                });

                if total_size <= current_total || total_size <= 50 {
                    break;
                }

                total = Some(current_total + got_issues.len());
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
    let mut callback = |value: &mut Value| {
        for v in as_issue_keys(value) {
            issue_keys.insert(v);
        }

        loaded_issues.insert(
            value["key"].as_str().unwrap_or_default().to_string(),
            as_issue(value),
        );
    };

    // load all issue keys in jql
    load_issue_recursive(&jql, &url, &mut callback).unwrap_or(());

    let binding = HashSet::from_iter(loaded_issues.keys().into_iter().map(|v| v.to_string()));
    let not_full_loaded_keys = issue_keys.difference(&binding);
    let keys = not_full_loaded_keys
        .map(|v| v.to_string())
        .collect::<Vec<String>>();

    if !keys.is_empty() {
        let jql = format!("key IN ({})", keys.join(","));

        // load issues do not fully-loaded
        // re-define to avoid borrow-checker
        let mut callback = |value: &mut Value| {
            loaded_issues.insert(
                value["key"].as_str().unwrap_or_default().to_string(),
                as_issue(value),
            );
        };

        load_issue_recursive(&jql, &url, &mut callback).unwrap_or(());
    }

    loaded_issues
        .values()
        .map(|issue| issue.correct_from_map(&loaded_issues))
        .collect()
}
