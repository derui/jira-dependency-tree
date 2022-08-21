use std::collections::HashMap;

use crate::JiraAuhtorization;

pub trait JiraUrl {
    // get full url with path
    fn get_url(&self, path: &str) -> String;

    fn get_base_headers(&self) -> HashMap<String, String>;
}

impl JiraUrl for JiraAuhtorization {
    fn get_url(&self, path: &str) -> String {
        return format!("https://{}.atlassian.net/{}", self.user_domain, path);
    }

    fn get_base_headers(&self) -> HashMap<String, String> {
        let mut map = HashMap::new();
        let auth = format!("{}:{}", self.email, self.jira_token);

        map.insert(String::from("Authorization"), base64::encode(auth));

        return map;
    }
}

#[cfg(test)]
mod tests {
    use crate::JiraAuhtorization;

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
}
