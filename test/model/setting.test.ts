import { settingFactory } from "@/model/setting";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("setting");

test("empty setting", () => {
  // arrange

  // do
  const setting = settingFactory({});

  // verify
  assert.equal(setting.credentials, {});
  assert.equal(setting.userDomain, undefined);
  assert.equal(setting.isSetupFinished(), false);
});

test("setup finished if all informations are set", () => {
  // arrange

  // do
  const setting = settingFactory({}).applyCredentials("cred", "email").applyUserDomain("domain");

  // verify
  assert.equal(setting.credentials, { jiraToken: "cred", email: "email" });
  assert.equal(setting.userDomain, "domain");
  assert.equal(setting.isSetupFinished(), true);
});

test.run();
