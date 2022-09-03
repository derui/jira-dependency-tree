import { Env } from "./env";

export type Credential = {
  userDomain: string;
  token: string;
  email: string;
};

export type IssueRequest = {
  env: Env;
  credential: Credential;
  projectKey: string;
};

export type ProjectRequest = {
  env: Env;
  credential: Credential;
  projectKey: string;
};
