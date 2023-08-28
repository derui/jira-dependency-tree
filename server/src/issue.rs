use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use serde_json::Value;

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
