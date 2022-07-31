import { Size } from "@/type";
import produce from "immer";

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

export type Environment = {
  readonly issueSize: Size;
  readonly credentials: {
    jiraToken?: string;
  };
  readonly userDomain?: string;

  isSetupFinished(): boolean;
  applyCredentials(jiraToken: string): Environment;
  applyUserDomain(jiraToken: string): Environment;
};

export const environmentFactory = function environmentFactory(argument: EnvironmentArgument): Environment {
  return {
    issueSize: argument.issueNodeSize ?? { width: 192, height: 64 },
    credentials: argument.credentials ?? {},
    userDomain: argument.userDomain,

    isSetupFinished() {
      return !!this.credentials?.jiraToken && !!this.userDomain;
    },

    applyCredentials(jiraToken: string) {
      return produce(this, (draft) => {
        draft.credentials.jiraToken = jiraToken;
      });
    },
    applyUserDomain(userDomain: string) {
      return produce(this, (draft) => {
        draft.userDomain = userDomain;
      });
    },
  };
};
