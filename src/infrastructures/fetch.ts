import { switchMap } from "rxjs/operators";
import { fromFetch } from "rxjs/fetch";

interface PostJSONArg {
  url: string;
  headers: Record<string, string>;
  body: object;
}

/**
 * A function to post JSON and get JSON as response
 */
export const postJSON = (obj: PostJSONArg) => {
  return fromFetch(obj.url, {
    method: "POST",
    headers: Object.assign({}, obj.headers, {
      "context-type": "application/json",
    }),
    body: JSON.stringify(obj.body),
  }).pipe(
    switchMap((response) => {
      if (response.status === 200) {
        return response.json();
      }

      throw new Error("invalid response");
    }),
  );
};
