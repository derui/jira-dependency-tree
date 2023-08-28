use serde::Deserialize;

use crate::jira_url::JiraAuhtorization;

#[derive(Deserialize, Default)]
pub struct IssueSearchCondition {
    pub sprint: Option<String>,
    pub epic: Option<String>,
}

#[derive(Deserialize)]
pub struct IssueLoadingRequest {
    pub authorization: JiraAuhtorization,
    pub issues: Vec<String>,
}

#[derive(Deserialize)]
pub struct IssueSearchRequest {
    pub authorization: JiraAuhtorization,
    pub jql: String,
    pub page: u32,
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
