import { mapResponse } from "./mapper/issue";
import { ApiCredential } from "@/model/event";
import { Issue } from "@/model/issue";

/**
 * execute to get a issues
 */
export const call = async function call(
  apiCredential: ApiCredential,
  jql: string,
  page: number = 1,
): Promise<[Issue[], string | undefined]> {
  const body = {
    jql,
    page,
  };

  const ret = await fetch(`${apiCredential.apiBaseUrl}/search-issues`, {
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

  if (ret.status === 400) {
    return [[], `Invalid JQL: ${json.message}`];
  } else if (ret.status !== 200) {
    console.error("API failed");
    throw ret.statusText;
  }

  return [mapResponse(json), undefined];
};
