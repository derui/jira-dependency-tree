use std::collections::HashMap;

use httpmock::{Method, MockServer};
use jira_issue_loader::{
    api_type::IssueSearchRequest,
    issue::JiraIssueLink,
    jira_search_request::search_issues,
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
            .header("authorization", "foo");

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

    // do
    let url = TestRequest { server: &server };
    let request = IssueSearchRequest {
        authorization: JiraAuhtorization {
            email: "email".to_string(),
            jira_token: "token".to_string(),
            user_domain: "domain".to_string(),
        },
        jql: "jql".to_string(),
        page: 1,
    };
    let result = search_issues(&request, url).unwrap();

    // verify
    assert_eq!(result.len(), 1);
    assert_eq!(result[0].key, "test");
    assert_eq!(result[0].summary, "summary");
    assert_eq!(result[0].description, Some("description".to_string()));
    assert_eq!(result[0].self_url, Some("https://self.url".to_string()));
    assert_eq!(result[0].status_id, None);
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
fn request_to_next_page() {
    // arrange
    let server = httpmock::MockServer::start();
    let mock = server.mock(|when, then| {
        when.method(Method::POST)
            .path("/rest/api/3/search")
            .header("content-type", "application/json")
            .header("authorization", "foo")
            .body_contains("startAt\":50");

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
    let request = IssueSearchRequest {
        authorization: JiraAuhtorization {
            email: "email".to_string(),
            jira_token: "token".to_string(),
            user_domain: "domain".to_string(),
        },
        page: 2,
        jql: "jql".to_string(),
    };
    let result = search_issues(&request, url).unwrap();

    // verify
    mock.assert();
    assert_eq!(result.len(), 1);
    assert_eq!(result[0].key, "test");
    assert_eq!(result[0].summary, "summary");
    assert_eq!(result[0].description, None);
    assert_eq!(result[0].self_url, None);
    assert_eq!(result[0].status_id, None);
    assert_eq!(result[0].links.len(), 0);
}
