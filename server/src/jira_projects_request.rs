use std::error::Error;

use isahc::{http::request::Builder, ReadResponseExt, Request, RequestExt};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::jira_url::JiraUrl;

#[derive(Deserialize, Serialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct JiraSimpleProject {
    pub id: u64,
    pub key: String,
    pub name: String,
}

pub(crate) fn build_partial_request(path: &str, url: &impl JiraUrl) -> Builder {
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

fn load_projects_paginated(
    start_at: usize,
    url: &impl JiraUrl,
) -> Result<(Vec<JiraSimpleProject>, usize), Box<dyn Error>> {
    let mut project = build_partial_request(
        &format!("/rest/api/3/project/search?startAt={}", start_at),
        url,
    )
    .body(())?
    .send()?;

    let json: Value = project.json()?;
    let values = &json["values"];

    let projects = values
        .as_array()
        .map(|vec| {
            vec.iter()
                .map(|json| {
                    let project_id: u64 =
                        json["id"].as_str().map(|v| v.parse().unwrap()).unwrap_or(0);

                    JiraSimpleProject {
                        id: project_id,
                        key: json["key"].as_str().map(Into::into).unwrap_or_default(),
                        name: json["name"].as_str().map(Into::into).unwrap_or_default(),
                    }
                })
                .collect()
        })
        .unwrap_or_default();

    let result = json["total"]
        .as_i64()
        .map(|v| v as usize)
        .unwrap_or_default();

    Ok((projects, result))
}

// load all issues from Jira API
pub fn load_projects(url: impl JiraUrl) -> Vec<JiraSimpleProject> {
    let mut loaded_projects: Vec<JiraSimpleProject> = vec![];
    let mut loaded_size = Some(0);

    while let Some(size) = loaded_size {
        let (mut projects, result_size) = load_projects_paginated(size, &url).unwrap_or_default();
        loaded_projects.append(&mut projects);

        if (loaded_projects.len() as i64) - (result_size as i64) >= 0 {
            loaded_size = None
        } else {
            loaded_size = Some(loaded_projects.len());
        }
    }

    loaded_projects
}
