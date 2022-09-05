use std::collections::HashMap;

use httpmock::{Method, MockServer};
use jira_issue_loader::{
    jira_issue_request::JiraUrl,
    jira_project_request::{load_project, JiraStatus},
};

struct TestRequest<'a> {
    server: &'a MockServer,
}
impl JiraUrl for TestRequest<'_> {
    fn get_url(&self, path: &str) -> String {
        self.server.url(path)
    }

    fn get_base_headers(&self) -> std::collections::HashMap<String, String> {
        let mut map = HashMap::new();
        map.insert("authorization".to_string(), "foo".to_string());
        map
    }
}

#[test]
fn request_to_get_a_project() {
    // arrange
    let server = httpmock::MockServer::start();
    let project_mock = server.mock(|when, then| {
        when.method(Method::GET)
            .path("/rest/api/3/project/PKE")
            .header("content-type", "application/json")
            .header("authorization", "foo");

        then.status(200)
            .header("content-type", "application/json")
            .body(include_str!("project.json"));
    });
    server.mock(|when, then| {
        when.method(Method::GET)
            .path("/rest/api/3/statuscategory")
            .header("content-type", "application/json")
            .header("authorization", "foo");

        then.status(200)
            .header("content-type", "application/json")
            .body(include_str!("status_categories.json"));
    });
    server.mock(|when, then| {
        when.method(Method::GET)
            .path("/rest/api/3/statuses/search")
            .header("content-type", "application/json")
            .header("authorization", "foo");

        then.status(200)
            .header("content-type", "application/json")
            .body(include_str!("statuses.json"));
    });
    server.mock(|when, then| {
        when.method(Method::GET)
            .path("/rest/api/3/issuetype/project")
            .query_param("projectId", "10000")
            .header("content-type", "application/json")
            .header("authorization", "foo");

        then.status(200)
            .header("content-type", "application/json")
            .body(include_str!("issue_types.json"));
    });

    // do
    let url = TestRequest { server: &server };
    let result = load_project("PKE", url).unwrap();

    // verify
    project_mock.assert();
    assert_eq!(result.id, 10000);
    assert_eq!(result.key, "PKE");
    assert_eq!(result.name, "project name");
    assert_eq!(
        result.statuses,
        vec![
            JiraStatus {
                id: "1000".into(),
                name: Some("Finished".into()),
                status_category: "DONE".into(),
                used_issues: vec!["10002".into()]
            },
            JiraStatus {
                id: "1001".into(),
                name: Some("TODO".into()),
                status_category: "TODO".into(),
                used_issues: vec!["10003".into(), "10004".into()]
            }
        ]
    );
}
