use serde::Deserialize;

#[derive(Deserialize, Default)]
pub struct IssueSearchCondition {
    pub sprint: Option<String>,
    pub epic: Option<String>,
}

#[derive(Deserialize)]
pub struct IssueLoadingRequest {
    pub issues: Vec<String>,
}

#[derive(Deserialize)]
pub struct IssueSearchRequest {
    pub jql: String,
    pub page: u32,
}

#[derive(Deserialize)]
pub struct CreateLinkRequest {
    pub inward_issue: String,
    pub outward_issue: String,
}

#[derive(Deserialize)]
pub struct DeleteLinkRequest {
    pub id: String,
}
