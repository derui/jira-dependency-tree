type Size = {
  width: number;
  height: number;
};

export type EnvironmentArgument = {
  // Size of issue in environment
  issueSize?: Size;

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

  constructor(env: EnvironmentArgument) {
    this._issueSize = env.issueSize ?? { width: 192, height: 64 };
    this._credentials = env.credentials ?? {};
  }

  // set credential
  applyCrednetial(jiraToken: string) {
    this._credentials.jiraToken = jiraToken;
  }
}
