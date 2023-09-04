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
    id: relationId,
  };

  await fetch(`${apiCredential.apiBaseUrl}/delete-link`, {
    method: "POST",
    mode: "cors",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiCredential.apiKey,
      "x-user-domain": apiCredential.userDomain,
      "x-user-email": apiCredential.email,
      "x-user-token": apiCredential.token,
    },
    body: JSON.stringify(body),
  });

  return relationId;
};
