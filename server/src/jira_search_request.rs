use isahc::{ReadResponseExt, Request, RequestExt};

use serde_json::{json, Value};

use crate::{
    api_type::{ErrorHttpState, IssueSearchRequest},
    issue::{as_issue, JiraIssue},
    jira_url::JiraUrl,
};

/// load all issues from Jira API with JQL
fn search_issue_recursive(
    jql: &str,
    page: u32,
    url: &impl JiraUrl,
) -> Result<Vec<JiraIssue>, ErrorHttpState> {
    let jira_url = url.get_url("/rest/api/3/search");
    let body = json!({
        "jql": jql,
        "startAt": page,
        "maxResults": 50,
        "fields": vec!["status", "issuetype", "issuelinks", "subtasks", "summary"]
    });

    let cl = match Request::post(jira_url)
        .header(
            "authorization",
            url.get_base_headers()
                .get("authorization")
                .unwrap_or(&String::from("")),
        )
        .header("content-type", "application/json")
        .body(body.to_string())
    {
        Ok(cl) => cl,
        Err(_) => return Err(ErrorHttpState::InternalServerError),
    };

    match cl.send() {
        Ok(mut res) => {
            let v = res.json::<Value>();

            match v {
                Err(_) => Ok(Vec::new()),
                Ok(got_issues) => {
                    let ret = got_issues["issues"]
                        .as_array()
                        .map(|issues| issues.iter().map(as_issue).collect::<Vec<JiraIssue>>());

                    Ok(ret.unwrap_or(Vec::new()))
                }
            }
        }
        Err(e) => {
            if e.is_client() {
                Err(ErrorHttpState::BadRequest)
            } else {
                Err(ErrorHttpState::InternalServerError)
            }
        }
    }
}

// load issue with request
pub fn search_issue(
    request: &IssueSearchRequest,
    url: impl JiraUrl,
) -> Result<Vec<JiraIssue>, ErrorHttpState> {
    let jql = request.jql.clone();

    // load all issue keys in jql
    search_issue_recursive(&jql, request.page, &url)
}
