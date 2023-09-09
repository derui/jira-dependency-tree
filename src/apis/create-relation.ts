import { ApiCredential } from "@/models/event";
import { Relation } from "@/models/issue";
import { IssueKey } from "@/type";

/**
 * execute to create link
 */
export const call = async function call(
  apiCredential: ApiCredential,
  fromIssue: IssueKey,
  toIssue: IssueKey,
): Promise<Relation> {
  const body = {
    inward_issue: fromIssue,
    outward_issue: toIssue,
  };

  const ret = await fetch(`${apiCredential.apiBaseUrl}/create-link`, {
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

  return mapResponse(fromIssue, toIssue, json);
};

const mapResponse = (fromKey: IssueKey, toKey: IssueKey, body: Record<string, unknown>): Relation => {
  const id = body.id as string;

  return {
    id,
    inwardIssue: fromKey,
    outwardIssue: toKey,
  };
};
