import { Env } from "./env";

export type ApiCredential = {
  userDomain: string;
  token: string;
  email: string;
} & Env;
