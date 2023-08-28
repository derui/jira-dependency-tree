use serde::{Deserialize, Serialize};

use crate::{jira_projects_request::JiraSimpleProject, jira_url::JiraAuhtorization};

/// A http state when error happended
pub enum ErrorHttpState {
    BadRequest,
    NotFound,
    InternalServerError,
}

#[derive(Deserialize, Default)]
pub struct IssueSearchCondition {
    pub sprint: Option<String>,
    pub epic: Option<String>,
}

#[derive(Deserialize)]
pub struct IssueLoadingRequest {
    pub authorization: JiraAuhtorization,
    pub project: String,
    pub condition: Option<IssueSearchCondition>,
}

#[derive(Deserialize)]
pub struct IssueSearchRequest {
    pub authorization: JiraAuhtorization,
    pub jql: String,
    pub page: u32,
}

#[derive(Deserialize)]
pub struct GetProjectsRequest {
    pub authorization: JiraAuhtorization,
}

#[derive(Deserialize)]
pub struct SuggestionRequest {
    pub authorization: JiraAuhtorization,
    pub project: String,
    pub input_value: String,
}

#[derive(Deserialize)]
pub struct CreateLinkRequest {
    pub authorization: JiraAuhtorization,
    pub inward_issue: String,
    pub outward_issue: String,
}

#[derive(Deserialize)]
pub struct DeleteLinkRequest {
    pub authorization: JiraAuhtorization,
    pub id: String,
}

#[derive(Serialize)]
pub struct ProjectsResponse {
    pub values: Vec<JiraSimpleProject>,
}
