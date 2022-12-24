import test from "ava";
import { settingFactory } from "@/model/setting";
import { Env } from "@/model/env";

test("empty setting", (t) => {
  // arrange

  // do
  const setting = settingFactory({});

  // verify
  t.deepEqual(setting.credentials, {});
  t.deepEqual(setting.userDomain, undefined);
  t.deepEqual(setting.isSetupFinished(), false);
});

test("setup finished if all informations are set", (t) => {
  // arrange

  // do
  const setting = settingFactory({}).applyCredentials("cred", "email").applyUserDomain("domain");

  // verify
  t.deepEqual(setting.credentials, { jiraToken: "cred", email: "email" });
  t.deepEqual(setting.userDomain, "domain");
  t.deepEqual(setting.isSetupFinished(), true);
});

test("can not get api credential when it does not finish setup", (t) => {
  // arrange
  const setting = settingFactory({});
  const fakeEnv: Env = { apiBaseUrl: "url", apiKey: "" };

  // do
  const ret = setting.asApiCredential(fakeEnv);

  // verify
  t.is(ret, undefined);
});

test("can get api credentail if setup finished", (t) => {
  // arrange
  const setting = settingFactory({ userDomain: "domain", credentials: { jiraToken: "token", email: "email" } });
  const fakeEnv: Env = { apiBaseUrl: "url", apiKey: "" };

  // do
  const ret = setting.asApiCredential(fakeEnv);

  // verify
  t.deepEqual(ret, {
    apiBaseUrl: "url",
    apiKey: "",
    userDomain: "domain",
    token: "token",
    email: "email",
  });
});
