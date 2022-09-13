import { Size } from "@/type";
import produce from "immer";
import { Credential } from "./event";

export type SettingArgument = {
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

export type Setting = {
  readonly issueSize: Size;
  readonly credentials: {
    email?: string;
    jiraToken?: string;
  };
  readonly userDomain?: string;

  isSetupFinished(): boolean;
  applyCredentials(jiraToken: string, email: string): Setting;
  applyUserDomain(userDomain: string): Setting;

  toCredential(): Credential | undefined;
  toArgument(): SettingArgument;
};

export const settingFactory = function settingFactory(argument: SettingArgument): Setting {
  return {
    issueSize: argument.issueNodeSize ?? { width: 192, height: 64 },
    credentials: argument.credentials ?? {},
    userDomain: argument.userDomain,

    isSetupFinished() {
      return !!this.credentials.jiraToken && !!this.credentials.email && !!this.userDomain;
    },

    toArgument() {
      return {
        issueNodeSize: Object.assign({}, this.issueSize),
        userDomain: this.userDomain,
        credentials: Object.assign({}, this.credentials),
      };
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
    toCredential(): Credential | undefined {
      const { email, jiraToken } = this.credentials;
      const userDomain = this.userDomain;

      if (!userDomain || !email || !jiraToken) {
        return;
      }

      return { token: jiraToken, email, userDomain };
    },
  };
};
