import { test, expect } from "vitest";
import { settingFactory } from "@/models/setting";
import { Env } from "@/models/env";

test("empty setting", () => {
  // arrange

  // do
  const setting = settingFactory({});

  // verify
  expect(setting.credentials).toEqual({});
  expect(setting.userDomain).toBeUndefined();
  expect(setting.isSetupFinished()).toBe(false);
});

test("setup finished if all informations are set", () => {
  // arrange

  // do
  const setting = settingFactory({}).applyCredentials("cred", "email").applyUserDomain("domain");

  // verify
  expect(setting.credentials).toEqual({ jiraToken: "cred", email: "email" });
  expect(setting.userDomain).toBe("domain");
  expect(setting.isSetupFinished()).toBe(true);
});

test("can not get api credential when it does not finish setup", () => {
  // arrange
  const setting = settingFactory({});
  const fakeEnv: Env = { apiBaseUrl: "url", apiKey: "" };

  // do
  const ret = setting.asApiCredential(fakeEnv);

  // verify
  expect(ret).toBeUndefined();
});

test("can get api credentail if setup finished", () => {
  // arrange
  const setting = settingFactory({ userDomain: "domain", credentials: { jiraToken: "token", email: "email" } });
  const fakeEnv: Env = { apiBaseUrl: "url", apiKey: "" };

  // do
  const ret = setting.asApiCredential(fakeEnv);

  // verify
  expect(ret).toEqual({
    apiBaseUrl: "url",
    apiKey: "",
    userDomain: "domain",
    token: "token",
    email: "email",
  });
});
