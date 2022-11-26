use std::collections::HashMap;

use serde::Deserialize;

#[derive(Deserialize, Clone, Debug)]
pub struct JiraAuhtorization {
    pub jira_token: String,
    pub email: String,
    pub user_domain: String,
}

pub trait JiraUrl {
    // get full url with path
    fn get_url(&self, path: &str) -> String;

    fn get_base_headers(&self) -> HashMap<String, String>;
}

impl JiraUrl for JiraAuhtorization {
    fn get_url(&self, path: &str) -> String {
        let path = path.trim_start_matches(' ');
        let path = path.trim_start_matches('/');
        format!("https://{}.atlassian.net/{}", self.user_domain, path)
    }

    fn get_base_headers(&self) -> HashMap<String, String> {
        let mut map = HashMap::new();
        let auth = format!("{}:{}", self.email, self.jira_token);

        map.insert(
            String::from("authorization"),
            format!("Basic {}", base64::encode(auth)),
        );

        map
    }
}

#[cfg(test)]
mod tests {
    use super::JiraAuhtorization;
    use super::JiraUrl;

    #[test]
    fn get_url_for_jira_cloud() {
        // arrange
        let auth = JiraAuhtorization {
            jira_token: String::from("token"),
            email: String::from("test@example.com"),
            user_domain: String::from("domain"),
        };

        // do
        let url = auth.get_url("test/path");

        // verify
        assert_eq!(url, "https://domain.atlassian.net/test/path");
    }

    #[test]
    fn should_strip_lead_slash_from_path() {
        // arrange
        let auth = JiraAuhtorization {
            jira_token: String::from("token"),
            email: String::from("test@example.com"),
            user_domain: String::from("domain"),
        };

        // do
        let url = auth.get_url("/lead/slash");
        let multi_lead_slashes = auth.get_url("///lead/slash");

        // verify
        assert_eq!(url, "https://domain.atlassian.net/lead/slash");
        assert_eq!(
            multi_lead_slashes,
            "https://domain.atlassian.net/lead/slash"
        );
    }

    #[test]
    fn get_authorization_header() {
        // arrange
        let auth = JiraAuhtorization {
            jira_token: String::from("token"),
            email: String::from("test@example.com"),
            user_domain: String::from("domain"),
        };

        // do
        let headers = auth.get_base_headers();

        // verify
        assert_eq!(
            headers
                .get("authorization")
                .expect("can not found authorization"),
            "Basic dGVzdEBleGFtcGxlLmNvbTp0b2tlbg=="
        );
    }
}
