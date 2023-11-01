import { useCallback } from "react";
import { useGetApiCredential } from "./get-api-credential";
import { useImportIssues } from "./_import-issues";

type Hook = (urlLike: string) => void;

/**
 * get methods to import issue and select/unselect issue to import
 */
export const useLoadIssue = function useLoadIssue(): Hook {
  const apiCredential = useGetApiCredential();
  const importIssues = useImportIssues();

  const execute = useCallback(
    (urlLike: string) => {
      if (!apiCredential) {
        return;
      }

      let key = null;

      try {
        // We wish we can use parser/resolver as interface to parse URL or something.
        const url = new URL(urlLike);
        const regExpForKey = new RegExp("/browse/([^/]+?)");
        const match = regExpForKey.exec(url.pathname);
        if (url.host == `${apiCredential.userDomain}.atlassian.net` && match != null) {
          key = match.at(1);
        }
      } catch {
        console.warn(`Invalid url format`);
        return;
      }

      if (key == null) {
        return;
      }

      importIssues([key]);
    },
    [apiCredential, importIssues],
  );

  return execute;
};
