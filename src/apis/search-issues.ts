import { mapResponse } from "./mapper/issue";
import { ApiCredential } from "@/model/event";
import { Issue } from "@/model/issue";

/**
 * execute to get a issues
 */
export const call = async function call(
  apiCredential: ApiCredential,
  jql: string,
): Promise<[Issue[], string | undefined]> {
  const body = {
    authorization: {
      jira_token: apiCredential.token,
      email: apiCredential.email,
      user_domain: apiCredential.userDomain,
    },
    jql,
  };

  const ret = await fetch(`${apiCredential.apiBaseUrl}/search-issues`, {
    method: "POST",
    mode: "cors",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiCredential.apiKey,
    },
    body: JSON.stringify(body),
  });
  const json = await ret.json();

  if (ret.status === 400) {
    return [[], `Invalid JQL: ${json.message}`];
  }

  return [mapResponse(json), undefined];
};
