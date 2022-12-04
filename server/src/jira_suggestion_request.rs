use std::error::Error;

use isahc::{ReadResponseExt, RequestExt};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::{jira_project_request::build_partial_request, jira_url::JiraUrl};

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

fn get_sprint_field_id(project: &str, url: &impl JiraUrl) -> Result<String, Box<dyn Error>> {
    let mut res = build_partial_request(
        &format!("/rest/api/3/jql/autocompletedata?projectIds={}", project),
        url,
    )
    .body(())?
    .send()?;

    let json: Value = res.json()?;

    match json["visibleFieldNames"]
        .as_array()
        .and_then(|values| {
            values.iter().find(|v| {
                let if_value = v["value"]
                    .as_str()
                    .unwrap_or_default()
                    .to_lowercase()
                    .contains("sprint");
                let if_type = v["types"]
                    .as_array()
                    .and_then(|types| {
                        types.iter().find(|typ| {
                            typ.as_str()
                                .unwrap_or_default()
                                .to_lowercase()
                                .contains("sprint")
                        })
                    })
                    .is_some();

                if_value || if_type
            })
        })
        .and_then(|value| value["cfid"].as_str())
    {
        None => Err("can not found board".into()),
        Some(value) => Ok(value.to_string()),
    }
}

// load all sprints from Jira API
fn load_sprints(
    sprint_field_id: &str,
    input_value: &str,
    url: &impl JiraUrl,
) -> Result<Vec<JiraSuggestion>, Box<dyn std::error::Error>> {
    let mut res = build_partial_request(
        &format!(
            "/rest/api/3/jql/autocompletedata/suggestions?fieldName={}&fieldValue={}",
            sprint_field_id, input_value
        ),
        url,
    )
    .body(())?
    .send()?;

    let json: Value = res.json()?;
    let mut vec: Vec<JiraSuggestion> = Vec::new();

    match json["results"].as_array() {
        None => Ok(Vec::new()),
        Some(got_sprints) => {
            got_sprints.iter().for_each(|sprint| {
                vec.push(JiraSuggestion {
                    value: sprint["value"].as_str().unwrap_or_default().to_string(),
                    // do not need bold tags that are inserted by API
                    display_name: sprint["displayName"]
                        .as_str()
                        .unwrap_or_default()
                        .replace("<b>", "")
                        .replace("</b>", "")
                        .into(),
                })
            });

            Ok(vec.clone())
        }
    }
}

// load all issues from Jira API
pub fn get_suggestions(
    url: impl JiraUrl,
    project: &str,
    input_value: &str,
) -> Option<JiraSuggestions> {
    let sprint_id = get_sprint_field_id(project, &url);

    let sprints = sprint_id.and_then(|sprint_id| load_sprints(&sprint_id, input_value, &url));
    match sprints {
        Ok(sprints) => Some(JiraSuggestions { sprints }),
        Err(e) => {
            println!("{}", e.to_string());
            None
        }
    }
}
