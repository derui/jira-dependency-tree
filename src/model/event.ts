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
  condition?: SearchCondition;
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
}

type SprintCondition = { kind: "current" } | { kind: "suggestion"; sprintName: string };
export interface SearchCondition {
  sprint?: SprintCondition;
  epic?: string;
}
