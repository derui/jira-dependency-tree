import produce from "immer";
import { Env } from "./env";
import { ApiCredential } from "./event";
import { Size } from "@/type";

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

  toArgument(): SettingArgument;
  asApiCredential(env: Env): ApiCredential | undefined;
};

export const settingFactory = function settingFactory(argument: SettingArgument): Setting {
  return {
    issueSize: argument.issueNodeSize ?? { width: 160, height: 80 },
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
    asApiCredential(env): ApiCredential | undefined {
      const token = this.credentials?.jiraToken;
      const email = this.credentials?.email;
      const userDomain = this.userDomain;

      if (!token || !email || !userDomain) return;
      return { ...env, token, userDomain, email };
    },
  };
};
