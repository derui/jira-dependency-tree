use std::collections::{HashMap, HashSet};

use httpmock::{Method, MockServer};
use jira_issue_loader::{
    api_type::IssueLoadingRequest,
    issue::{JiraIssue, JiraIssueLink, JiraStatus},
    jira_issue_request::load_issue,
    jira_url::{JiraAuhtorization, JiraUrl},
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
fn request_to_get_an_issue() {
    // arrange
    let server = httpmock::MockServer::start();
    let _mock = server.mock(|when, then| {
        when.method(Method::POST)
            .path("/rest/api/3/search")
            .header("content-type", "application/json")
            .header("authorization", "foo")
            .body_contains("key-1");

        then.status(200)
            .header("content-type", "application/json")
            .json_body(serde_json::json!({
                "total": 1,
                "issues": [
                    {
                        "key": "test",
                        "self": "https://self.url",
                        "fields": {
                            "summary": "summary",
                            "description": {
                                "text": "description"
                            },
                            "issuelinks": [
                                {
                                    "id": "100",
                                    "outwardIssue": {
                                        "key": "other"
                                    }
                                }
                            ]
                        }
                    }
                ]
            }));
    });

    server.mock(|when, then| {
        when.method(Method::POST)
            .path("/rest/api/3/search")
            .header("content-type", "application/json")
            .header("authorization", "foo")
            .body_contains("other");

        then.status(200)
            .header("content-type", "application/json")
            .json_body(serde_json::json!({
                "total": 0,
                "issues": [{
                    "key": "other",
                    "fields": {
                        "summary": ""
                    }
                }]
            }));
    });

    // do
    let url = TestRequest { server: &server };
    let request = IssueLoadingRequest {
        authorization: JiraAuhtorization {
            email: "email".to_string(),
            jira_token: "token".to_string(),
            user_domain: "domain".to_string(),
        },
        issues: vec!["key-1".to_string()],
    };
    let result = load_issue(&request, url);

    // verify
    assert_eq!(result.len(), 1);
    let result = result
        .iter()
        .filter(|v| v.key == "test")
        .take(1)
        .collect::<Vec<&JiraIssue>>();

    assert_eq!(result[0].key, "test");
    assert_eq!(result[0].summary, "summary");
    assert_eq!(result[0].description, Some("description".to_string()));
    assert_eq!(result[0].self_url, Some("https://self.url".to_string()));
    assert_eq!(
        result[0].links[0],
        JiraIssueLink {
            id: "100".to_string(),
            inward_issue: "test".to_string(),
            outward_issue: "other".to_string()
        }
    );
}

#[test]
fn request_to_get_simplest_issue() {
    // arrange
    let server = httpmock::MockServer::start();
    let mock = server.mock(|when, then| {
        when.method(Method::POST)
            .path("/rest/api/3/search")
            .header("content-type", "application/json")
            .header("authorization", "foo");

        then.status(200)
            .header("content-type", "application/json")
            .json_body(serde_json::json!({
                "total": 1,
                "issues": [
                    {
                        "key": "test",
                        "fields": {
                            "summary": "summary",
                        }
                    }
                ]
            }));
    });

    // do
    let url = TestRequest { server: &server };
    let request = IssueLoadingRequest {
        authorization: JiraAuhtorization {
            email: "email".to_string(),
            jira_token: "token".to_string(),
            user_domain: "domain".to_string(),
        },
        issues: vec!["key-1".to_string()],
    };
    let result = load_issue(&request, url);

    // verify
    mock.assert();
    assert_eq!(result.len(), 1);
    assert_eq!(result[0].key, "test");
    assert_eq!(result[0].summary, "summary");
    assert_eq!(result[0].description, None);
    assert_eq!(result[0].self_url, None);
    assert_eq!(result[0].links.len(), 0);
}

#[test]
fn request_to_get_simplest_issue_with_subtasks() {
    // arrange
    let server = httpmock::MockServer::start();
    let _mock = server.mock(|when, then| {
        when.method(Method::POST)
            .path("/rest/api/3/search")
            .header("content-type", "application/json")
            .header("authorization", "foo")
            .body_contains("test");

        then.status(200)
            .header("content-type", "application/json")
            .body(include_str!("issue.json"));
    });
    server.mock(|when, then| {
        when.method(Method::POST)
            .path("/rest/api/3/search")
            .header("content-type", "application/json")
            .header("authorization", "foo")
            .body_contains("key-2");

        then.status(200)
            .header("content-type", "application/json")
            .body(include_str!("sub-tasks.json"));
    });

    // do
    let url = TestRequest { server: &server };
    let request = IssueLoadingRequest {
        authorization: JiraAuhtorization {
            email: "email".to_string(),
            jira_token: "token".to_string(),
            user_domain: "domain".to_string(),
        },
        issues: vec!["test".to_string()],
    };
    let mut result = load_issue(&request, url);

    result.sort_by(|o1, o2| o1.key.cmp(&o2.key).reverse());
    // verify
    assert_eq!(result.len(), 2);
    assert_eq!(result[0].key, "test");
    assert_eq!(result[0].summary, "summary");
    assert_eq!(result[0].description, Some("description".to_string()));
    assert_eq!(result[0].self_url, Some("https://self.url".to_string()));
    assert_eq!(
        result[0].status.clone().unwrap(),
        JiraStatus {
            id: "10001".to_string(),
            name: "foo".to_string(),
            status_category: "To Do".to_string(),
        }
    );
    assert_eq!(result[0].links.len(), 1);
    assert_eq!(result[0].subtasks.len(), 1);
    assert_eq!(result[0].subtasks[0], "key-2");
}

#[test]
fn request_recursive() {
    // arrange
    let server = httpmock::MockServer::start();
    let mock = server.mock(|when, then| {
        when.method(Method::POST)
            .path("/rest/api/3/search")
            .header("content-type", "application/json")
            .header("authorization", "foo")
            .json_body_partial("{\"startAt\": 0}");

        then.status(200)
            .header("content-type", "application/json")
            .body(include_str!("fixtures/issue.json"));
    });

    server.mock(|when, then| {
        when.method(Method::POST)
            .path("/rest/api/3/search")
            .header("content-type", "application/json")
            .header("authorization", "foo")
            .json_body_partial("{\"startAt\": 50}");

        then.status(200)
            .header("content-type", "application/json")
            .body(include_str!("fixtures/issue_one.json"));
    });

    // do
    let url = TestRequest { server: &server };
    let request = IssueLoadingRequest {
        authorization: JiraAuhtorization {
            email: "email".to_string(),
            jira_token: "token".to_string(),
            user_domain: "domain".to_string(),
        },
        issues: (1..51).into_iter().map(|v| format!("key-{}", v)).collect(),
    };
    let ret = load_issue(&request, url);
    let keys = ret.into_iter().map(|v| v.key).collect::<HashSet<String>>();
    let expected = (0..=50)
        .into_iter()
        .map(|v| format!("test{}", v))
        .collect::<HashSet<String>>();

    // verify
    mock.assert();
    assert_eq!(keys.len(), 51);
    assert_eq!(keys.difference(&expected).count(), 0);
}
