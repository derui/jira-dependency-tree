use std::error::Error;

use isahc::{http::request::Builder, ReadResponseExt, Request, RequestExt};
use serde::{de::IntoDeserializer, Deserialize, Serialize};
use serde_json::Value;

use crate::{
    jira_issue_request::JiraUrl, jira_project_request::build_partial_request, IssueLoadingRequest,
};

#[derive(Deserialize, Serialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct JiraSuggestion {
    pub value: String,
    pub display_name: String,
}

#[derive(Deserialize, Serialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct JiraSuggestions {
    pub sprints: Vec<JiraSuggestion>,
}

fn load_board(project: &str, url: &impl JiraUrl) -> Result<String, Box<dyn Error>> {
    let mut res = build_partial_request(
        &format!("/rest/agile/1.0/board?projectLocation={}", project),
        url,
    )
    .body(())?
    .send()?;

    let json: Value = res.json()?;

    match json["values"]
        .as_array()
        .and_then(|values| values.get(0))
        .and_then(|value| value.as_str())
    {
        None => Err("can not found baord".into()),
        Some(value) => Ok(String::from(value)),
    }
}

// load all issues from Jira API
fn load_sprints_recursive(
    board_id: &str,
    url: &impl JiraUrl,
    suggestions: &mut Vec<JiraSuggestion>,
    start_at: usize,
) -> Result<Vec<JiraSuggestion>, Box<dyn std::error::Error>> {
    let mut res = build_partial_request(
        &format!(
            "/rest/agile/1.0/board/{}/sprint?state=active,future&startAt={}",
            board_id, start_at
        ),
        url,
    )
    .body(())?
    .send()?;

    let json: Value = res.json()?;

    match json["values"].as_array() {
        None => Ok(Vec::from_iter(suggestions.iter().cloned())),
        Some(got_sprints) => {
            let is_last = json["isLast"].as_bool().unwrap_or_default();

            got_sprints.iter().for_each(|sprint| {
                suggestions.push(JiraSuggestion {
                    value: sprint["id"].as_str().unwrap_or_default().into(),
                    display_name: sprint["name"].as_str().unwrap_or_default().into(),
                })
            });

            if is_last {
                return Ok(Vec::from_iter(suggestions.iter().cloned()));
            }

            load_sprints_recursive(board_id, url, suggestions, start_at + got_sprints.len())
        }
    }
}

// load issue with request
fn load_sprints(board_id: &str, url: &impl JiraUrl) -> Vec<JiraSuggestion> {
    let mut vec: Vec<JiraSuggestion> = Vec::new();

    load_sprints_recursive(board_id, url, &mut vec, 0 as usize).unwrap_or_default()
}

// load all issues from Jira API
pub fn get_suggestions(url: impl JiraUrl, project: &str) -> Option<JiraSuggestions> {
    let board_id = load_board(project, &url);

    match board_id {
        Ok(board_id) => {
            let sprints = load_sprints(&board_id, &url);
            Some(JiraSuggestions { sprints })
        }
        Err(_) => None,
    }
}
