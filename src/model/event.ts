import { Env } from "./env";

export type ApiCredential = {
  userDomain: string;
  token: string;
  email: string;
} & Env;

export type Events = GetWholeDataRequest | SyncIssuesRequest | GetSuggestionRequest;

export interface GetWholeDataRequest {
  kind: "GetWholeDataRequest";
  env: Env;
  credential: ApiCredential;
  projectKey: string;
}

export interface SyncIssuesRequest {
  kind: "SyncIssuesRequest";
  env: Env;
  credential: ApiCredential;
  projectKey: string;
  condition?: SearchCondition;
}

export interface GetSuggestionRequest {
  kind: "GetSuggestionRequest";
  env: Env;
  credential: ApiCredential;
  projectKey: string;
  term: string;
}

export interface SearchCondition {
  sprint?: {
    value: string;
    displayName: string;
  };
  epic?: string;
}
