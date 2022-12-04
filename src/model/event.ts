import { Env } from "./env";

export type Credential = {
  userDomain: string;
  token: string;
  email: string;
};

export type Events = GetWholeDataRequest | SyncIssuesRequest | GetSuggestionRequest;

export interface GetWholeDataRequest {
  kind: "GetWholeDataRequest";
  env: Env;
  credential: Credential;
  projectKey: string;
}

export interface SyncIssuesRequest {
  kind: "SyncIssuesRequest";
  env: Env;
  credential: Credential;
  projectKey: string;
  condition?: SearchCondition;
}

export interface GetSuggestionRequest {
  kind: "GetSuggestionRequest";
  env: Env;
  credential: Credential;
  projectKey: string;
  term: string;
}

export interface SearchCondition {
  sprint?: string;
  epic?: string;
}
