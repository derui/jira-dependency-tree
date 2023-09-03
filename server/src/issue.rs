use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};

#[derive(Deserialize, Serialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct JiraIssueLink {
    pub id: String,
    pub outward_issue: String,
    pub inward_issue: String,
}

#[derive(Deserialize, Serialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct JiraStatus {
    pub id: String,
    pub name: String,
    pub status_category: String,
}

#[derive(Deserialize, Serialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct JiraIssueType {
    pub id: String,
    pub name: String,
    pub avatar_url: Option<String>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct JiraIssue {
    pub key: String,
    pub summary: String,
    pub description: Option<String>,
    pub status: Option<JiraStatus>,
    pub issue_type: Option<JiraIssueType>,
    pub self_url: Option<String>,
    pub links: Vec<JiraIssueLink>,
    pub subtasks: Vec<String>,
}

impl JiraIssue {
    /// correct self with issue map
    pub fn correct_from_map(&self, map: &HashMap<String, JiraIssue>) -> JiraIssue {
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

fn as_status(v: &Map<String, Value>) -> JiraStatus {
    JiraStatus {
        id: v["id"]
            .as_str()
            .map(|v| v.into())
            .unwrap_or(String::default()),
        name: v
            .get("name")
            .and_then(|v| v.as_str())
            .map(|v| v.into())
            .unwrap_or(String::default()),
        status_category: v
            .get("statusCategory")
            .and_then(|v| v.as_object())
            .map(|v| {
                v["name"]
                    .as_str()
                    .map(|v| v.into())
                    .unwrap_or(String::default())
            })
            .unwrap_or(String::default()),
    }
}

fn as_issue_type(v: &Map<String, Value>) -> JiraIssueType {
    JiraIssueType {
        id: v["id"]
            .as_str()
            .map(|v| v.into())
            .unwrap_or(String::default()),
        name: v["name"]
            .as_str()
            .map(|v| v.into())
            .unwrap_or(String::default()),
        avatar_url: v["iconUrl"].as_str().map(|v| v.into()),
    }
}

/// json to JiraIssue
pub fn as_issue(issue: &Value) -> JiraIssue {
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
        status: issue["fields"]["status"].as_object().map(as_status),
        issue_type: issue["fields"]["issuetype"].as_object().map(as_issue_type),
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
