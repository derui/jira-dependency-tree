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
  issueSize: Size;
  credentials: {
    jiraToken?: string;
  };
  userDomain: string | null;

  applyCredentials(jiraToken: string): Environment;
  applyUserDomain(jiraToken: string): Environment;
};

export const environmentFactory = function environmentFactory(argument: EnvironmentArgument): Environment {
  return {
    issueSize: argument.issueNodeSize ?? { width: 192, height: 64 },
    credentials: argument.credentials ?? {},
    userDomain: argument.userDomain ?? null,

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
