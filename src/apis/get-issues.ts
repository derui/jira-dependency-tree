import { mapResponse } from "./mapper/issue";
import { ApiCredential } from "@/models/event";
import { Issue } from "@/models/issue";
import { IssueKey } from "@/type";

/**
 * execute to get a issues
 */
export const call = async function call(apiCredential: ApiCredential, targetIssueKeys: IssueKey[]): Promise<Issue[]> {
  const body = {
    issues: Array.from(targetIssueKeys).sort(),
  };

  const ret = await fetch(`${apiCredential.apiBaseUrl}/get-issues`, {
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

  const json = await ret.json();

  return mapResponse(json);
};
