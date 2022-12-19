import test from "ava";
import { settingFactory } from "@/model/setting";

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
