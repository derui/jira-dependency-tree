import { Env } from "./env";

export type Credential = {
  userDomain: string;
  token: string;
  email: string;
};

export type Events = GetWholeDataRequest | SyncIssuesRequest;

export type GetWholeDataRequest = {
  kind: "GetWholeDataRequest";
  env: Env;
  credential: Credential;
  projectKey: string;
};

export type SyncIssuesRequest = {
  kind: "SyncIssuesRequest";
  env: Env;
  credential: Credential;
  projectKey: string;
};
