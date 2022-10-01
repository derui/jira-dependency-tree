use std::error::Error;

use isahc::{http::request::Builder, ReadResponseExt, Request, RequestExt};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::jira_issue_request::JiraUrl;

#[derive(Deserialize, Serialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct JiraStatus {
    pub id: String,
    pub name: Option<String>,
    pub status_category: String,
}

#[derive(Deserialize, Serialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct JiraIssueStatusCategory {
    pub id: Option<String>,
    pub name: Option<String>,
    pub color_name: Option<String>,
}

#[derive(Deserialize, Serialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct JiraIssueType {
    pub id: String,
    pub name: Option<String>,
    pub avatar_url: Option<String>,
}

#[derive(Deserialize, Serialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct JiraProject {
    pub id: u64,
    pub key: String,
    pub name: String,
    pub statuses: Vec<JiraStatus>,
    pub status_categories: Vec<JiraIssueStatusCategory>,
    pub issue_types: Vec<JiraIssueType>,
}

fn build_partial_request(path: &str, url: &impl JiraUrl) -> Builder {
    let jira_url = url.get_url(path);

    Request::get(jira_url)
        .header(
            "authorization",
            url.get_base_headers()
                .get("authorization")
                .unwrap_or(&String::from("")),
        )
        .header("content-type", "application/json")
}

fn load_project_inner(project: &str, url: &impl JiraUrl) -> Result<Value, Box<dyn Error>> {
    let mut project = build_partial_request(&format!("/rest/api/3/project/{}", project), url)
        .body(())?
        .send()?;

    Ok(project.json()?)
}

fn load_status_categories(
    url: &impl JiraUrl,
) -> Result<Vec<JiraIssueStatusCategory>, Box<dyn Error>> {
    let mut body = build_partial_request("/rest/api/3/statuscategory", url)
        .body(())?
        .send()?;

    let json: Value = body.json()?;

    Ok(json
        .as_array()
        .map(|vec| {
            vec.iter()
                .map(|obj| JiraIssueStatusCategory {
                    id: obj["id"].as_str().map(Into::into),
                    name: obj["name"].as_str().map(|v| v.into()),
                    color_name: obj["colorName"].as_str().map(|v| v.into()),
                })
                .collect()
        })
        .unwrap_or_default())
}

fn load_issue_types(
    project_id: u64,
    url: &impl JiraUrl,
) -> Result<Vec<JiraIssueType>, Box<dyn Error>> {
    let path = format!("/rest/api/3/issuetype/project?projectId={}", project_id);
    let mut body = build_partial_request(&path, url).body(())?.send()?;

    let json: Value = body.json()?;

    Ok(json
        .as_array()
        .map(|vec| {
            vec.iter()
                .map(|obj| JiraIssueType {
                    id: obj["id"].as_str().map(Into::into).unwrap_or_default(),
                    name: obj["name"].as_str().map(Into::into),
                    avatar_url: obj["avatarUrl"].as_str().map(Into::into),
                })
                .collect()
        })
        .unwrap_or_default())
}

fn load_statuses(project_id: u64, url: &impl JiraUrl) -> Result<Vec<JiraStatus>, Box<dyn Error>> {
    let mut body = build_partial_request(
        &format!("/rest/api/3/statuses/search?projectId={}", project_id),
        url,
    )
    .body(())?
    .send()?;

    let json: Value = body.json()?;
    let values = &json["values"];

    Ok(values
        .as_array()
        .map(|vec| {
            vec.iter()
                .map(|obj| -> JiraStatus {
                    JiraStatus {
                        id: obj["id"].as_str().map(Into::into).unwrap_or_default(),
                        name: obj["name"].as_str().map(Into::into),
                        status_category: obj["statusCategory"]
                            .as_str()
                            .map(Into::into)
                            .unwrap_or_default(),
                    }
                })
                .collect()
        })
        .unwrap_or_default())
}

// load all issues from Jira API
pub fn load_project(project: &str, url: impl JiraUrl) -> Option<JiraProject> {
    let project_inner = load_project_inner(project, &url);

    match project_inner {
        Ok(json) => {
            let project_id: u64 = json["id"].as_str().map(|v| v.parse().unwrap()).unwrap_or(0);
            let statuses = load_statuses(project_id, &url).unwrap_or_default();
            let status_categories = load_status_categories(&url).unwrap_or_default();
            let types = load_issue_types(project_id, &url).unwrap_or_default();

            Some(JiraProject {
                id: project_id,
                key: json["key"].as_str().map(Into::into).unwrap_or_default(),
                name: json["name"].as_str().map(Into::into).unwrap_or_default(),
                statuses,
                status_categories,
                issue_types: types,
            })
        }
        Err(_) => None,
    }
}
