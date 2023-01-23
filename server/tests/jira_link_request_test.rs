use std::collections::HashMap;

use httpmock::{Method, MockServer};
use jira_issue_loader::{
    jira_link_request::{create_link, delete_link},
    jira_suggestion_request::{get_suggestions, JiraSuggestion},
    jira_url::JiraUrl,
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
fn request_to_create_link() {
    // arrange
    let server = httpmock::MockServer::start();
    let project_mock = server.mock(|when, then| {
        when.method(Method::POST)
            .path("/rest/api/3/issueLink")
            .header("content-type", "application/json")
            .header("authorization", "foo")
            .json_body(serde_json::json!({
                "inwardIssue": {
                    "key": "key1"
                },
                "outwardIssue": {
                    "key": "key2"
                },
                "type": {
                    "name": "Blocks"
                }
            }));

        then.status(201)
            .header("content-type", "application/json")
            .header(
                "Location",
                "https://foo.jira.com/rest/api/3/issueLink/12345",
            );
    });

    // do
    let url = TestRequest { server: &server };
    let result = create_link("key1", "key2", &url).unwrap();

    // verify
    project_mock.assert();
    assert_eq!(result.id, "12345");
}

#[test]
fn request_to_delete_link() {
    // arrange
    let server = httpmock::MockServer::start();
    let project_mock = server.mock(|when, then| {
        when.method(Method::DELETE)
            .path("/rest/api/3/issueLink/12345")
            .header("content-type", "application/json")
            .header("authorization", "foo");

        then.status(204).header("content-type", "application/json");
    });

    // do
    let url = TestRequest { server: &server };
    let result = delete_link("12345", &url).unwrap();

    // verify
    project_mock.assert();
    assert_eq!(result, ());
}
