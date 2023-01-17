import { Observable } from "rxjs";
import { IssueGraphCommand } from "./drivers/issue-graph";
import type { Env } from "./model/env";

// define dependencies
export type Dependencies = {
  env: Env;
  /**
   * dependency to post JSON to URL
   */
  postJSON: (param: { url: string; headers: Record<string, string>; body: object }) => Observable<unknown>;

  /**
   * send command to issueGraph
   */
  sendCommandTo: (command: IssueGraphCommand) => void;
};
