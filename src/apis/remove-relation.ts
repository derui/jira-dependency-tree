import { ApiCredential } from "@/model/event";
import { IssueRelationId } from "@/type";

/**
 * execute to get a issues
 */
export const call = async function call(
  apiCredential: ApiCredential,
  relationId: IssueRelationId,
): Promise<IssueRelationId> {
  const body = {
    authorization: {
      jira_token: apiCredential.token,
      email: apiCredential.email,
      user_domain: apiCredential.userDomain,
    },
    id: relationId,
  };

  await fetch(`${apiCredential.apiBaseUrl}/delete-link`, {
    method: "POST",
    mode: "cors",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiCredential.apiKey,
    },
    body: JSON.stringify(body),
  });

  return relationId;
};
