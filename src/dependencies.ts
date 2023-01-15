import { Observable } from "rxjs";
import type { Env } from "./model/env";

// define dependencies
export type Dependencies = {
  env: Env;
  /**
   * dependency to post JSON to URL
   */
  postJSON: (param: { url: string; headers: Record<string, string>; body: object }) => Observable<unknown>;
};
