use std::collections::HashMap;

use httpmock::{Method, MockServer};
use jira_issue_loader::{
    jira_projects_request::{load_projects, JiraSimpleProject},
    jira_url::JiraUrl,
};
use serde_json::json;

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
fn request_to_get_projects() {
    // arrange
    let server = httpmock::MockServer::start();
    let project_mock = server.mock(|when, then| {
        when.method(Method::GET)
            .path("/rest/api/3/project/search")
            .header("content-type", "application/json")
            .header("authorization", "foo");

        then.status(200)
            .header("content-type", "application/json")
            .body(include_str!("projects.json"));
    });

    // do
    let url = TestRequest { server: &server };
    let result = load_projects(url);

    // verify
    project_mock.assert();
    assert_eq!(result.len(), 2);
    assert_eq!(result[0].id, 10000);
    assert_eq!(result[0].key, "PKE");
    assert_eq!(result[0].name, "project name");
    assert_eq!(result[1].id, 10001);
    assert_eq!(result[1].key, "PRO2");
    assert_eq!(result[1].name, "project2");
}

#[test]
fn request_to_get_all_projects_with_pagenation() {
    // arrange
    let server = httpmock::MockServer::start();
    let project_mock = server.mock(|when, then| {
        when.method(Method::GET)
            .path("/rest/api/3/project/search")
            .header("content-type", "application/json")
            .header("authorization", "foo")
            .query_param("startAt", "0");

        then.status(200)
            .header("content-type", "application/json")
            .body(
                json!({
                    "maxResults": 52,
                    "startAt": 0,
                    "values": (0..50).into_iter().map(|i| {
                         json!({
                             "id":format!("{}", i),
                             "name": format!("name{}",i),
                             "key": format!("KEY{}", i)
                         })
                    }).collect::<Vec<_>>()
                })
                .to_string(),
            );
    });
    server.mock(|when, then| {
        when.method(Method::GET)
            .path("/rest/api/3/project/search")
            .header("content-type", "application/json")
            .header("authorization", "foo")
            .query_param("startAt", "50");

        then.status(200)
            .header("content-type", "application/json")
            .body(
                json!({
                    "maxResults": 52,
                    "startAt": 50,
                    "values": (50..52).into_iter().map(|i| {
                         json!({
                             "id":format!("{}", i),
                             "name": format!("name{}",i),
                             "key": format!("KEY{}", i)
                         })
                    }).collect::<Vec<_>>()
                })
                .to_string(),
            );
    });

    // do
    let url = TestRequest { server: &server };
    let result = load_projects(url);

    // verify
    project_mock.assert();
    assert_eq!(result.len(), 52);
    assert_eq!(
        result,
        (0..52)
            .into_iter()
            .map(|i| {
                JiraSimpleProject {
                    id: i,
                    name: format!("name{}", i),
                    key: format!("KEY{}", i),
                }
            })
            .collect::<Vec<_>>()
    );
}
