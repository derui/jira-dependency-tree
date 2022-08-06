import { Size } from "@/type";
import produce from "immer";

export type EnvironmentArgument = {
  // Size of issue in environment
  issueNodeSize?: Size;

  // user domain
  userDomain?: string;

  // credential on environment
  credentials?: {
    email?: string;
    jiraToken?: string;
  };
};

export type Environment = {
  readonly issueSize: Size;
  readonly credentials: {
    email?: string;
    jiraToken?: string;
  };
  readonly userDomain?: string;

  isSetupFinished(): boolean;
  applyCredentials(jiraToken: string, email: string): Environment;
  applyUserDomain(userDomain: string): Environment;
};

export const environmentFactory = function environmentFactory(argument: EnvironmentArgument): Environment {
  return {
    issueSize: argument.issueNodeSize ?? { width: 192, height: 64 },
    credentials: argument.credentials ?? {},
    userDomain: argument.userDomain,

    isSetupFinished() {
      return !!this.credentials.jiraToken && !!this.credentials.email && !!this.userDomain;
    },

    applyCredentials(jiraToken: string, email: string) {
      return produce(this, (draft) => {
        draft.credentials.jiraToken = jiraToken;
        draft.credentials.email = email;
      });
    },
    applyUserDomain(userDomain: string) {
      return produce(this, (draft) => {
        draft.userDomain = userDomain;
      });
    },
  };
};
