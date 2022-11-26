use std::collections::HashMap;

use httpmock::{Method, MockServer};
use jira_issue_loader::{
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
fn request_to_get_suggestions() {
    // arrange
    let server = httpmock::MockServer::start();
    let project_mock = server.mock(|when, then| {
        when.method(Method::GET)
            .path("/rest/agile/1.0/board")
            .query_param("projectLocation", "ABC")
            .header("content-type", "application/json")
            .header("authorization", "foo");

        then.status(200)
            .header("content-type", "application/json")
            .body(include_str!("board.json"));
    });
    server.mock(|when, then| {
        when.method(Method::GET)
            .path("/rest/agile/1.0/board/1/sprint")
            .query_param("state", "active,future")
            .query_param("startAt", "0")
            .header("content-type", "application/json")
            .header("authorization", "foo");

        then.status(200)
            .header("content-type", "application/json")
            .body(include_str!("sprints.json"));
    });

    // do
    let url = TestRequest { server: &server };
    let result = get_suggestions(url, "ABC").unwrap();

    // verify
    project_mock.assert();
    assert_eq!(
        result.sprints,
        vec![
            JiraSuggestion {
                value: "5".into(),
                display_name: "ABC スプリント 5".into()
            },
            JiraSuggestion {
                value: "6".into(),
                display_name: "ABC スプリント 6".into()
            },
        ]
    );
}
