import { LayoutDirection } from "@/issue-graph/type";
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
  assert.equal(setting.layoutDirection, LayoutDirection.Vertical);
});

test("setup finished if all informations are set", () => {
  // arrange

  // do
  const setting = settingFactory({})
    .applyCredentials("cred", "email")
    .applyUserDomain("domain")
    .changeDirection(LayoutDirection.Horizontal);

  // verify
  assert.equal(setting.credentials, { jiraToken: "cred", email: "email" });
  assert.equal(setting.userDomain, "domain");
  assert.equal(setting.isSetupFinished(), true);
  assert.equal(setting.layoutDirection, LayoutDirection.Horizontal);
});

test.run();
