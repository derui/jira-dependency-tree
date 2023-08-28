use isahc::{ReadResponseExt, Request, RequestExt};
use serde_json::{json, Value};
use std::collections::{HashMap, HashSet};

use crate::api_type::IssueLoadingRequest;
use crate::issue::as_issue;
use crate::issue::JiraIssue;
use crate::jira_url::JiraUrl;

/// get all keys of issue
fn as_issue_keys(issue: &Value) -> HashSet<String> {
    let mut keys = HashSet::new();

    let key = issue["key"]
        .as_str()
        .expect("key must not null")
        .to_string();
    keys.insert(key);

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
    let keys = request.issues.join(",");
    format!("key in ({})", keys)
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

                let new_total = current_total + got_issues.len();

                if total_size <= new_total {
                    total = None;
                } else {
                    total = Some(new_total);
                }
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
    let not_full_loaded_keys = issue_keys
        .difference(&binding)
        .map(|v| v.to_string())
        .collect::<Vec<String>>();

    if !not_full_loaded_keys.is_empty() {
        let jql = format!("key IN ({})", not_full_loaded_keys.join(","));

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
