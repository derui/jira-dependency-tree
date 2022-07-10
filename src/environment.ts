import { Size } from "@/type";

export type EnvironmentArgument = {
  // Size of issue in environment
  issueNodeSize?: Size;

  // user domain
  userDomain?: string;

  // credential on environment
  credentials?: {
    jiraToken?: string;
  };
};

// Environment is application's context. Some of configuration contains this class.
export class Environment implements Environment {
  // Size of issue in environment
  private _issueSize: Size;

  get issueSize() {
    return Object.freeze(this._issueSize);
  }

  // credential on environment
  private _credentials: {
    jiraToken?: string;
  };

  get crednetials() {
    return Object.freeze(this._credentials);
  }

  private _userDomain: string | null;

  get userDomain() {
    return this._userDomain;
  }

  constructor(env: EnvironmentArgument) {
    this._issueSize = env.issueNodeSize ?? { width: 192, height: 64 };
    this._credentials = env.credentials ?? {};
    this._userDomain = env.userDomain ?? null;
  }

  // set credential
  applyCrednetial(jiraToken: string) {
    this._credentials.jiraToken = jiraToken;
  }

  // set credential
  initUserDomain(userDomain: string) {
    this._userDomain = userDomain;
  }
}
