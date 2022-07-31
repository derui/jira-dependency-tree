import { environmentFactory } from "@/environment";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("environment");

test("empty environment", () => {
  // arrange

  // do
  const env = environmentFactory({});

  // verify
  assert.equal(env.credentials, {});
  assert.equal(env.userDomain, undefined);
  assert.equal(env.isSetupFinished(), false);
});

test("setup finished if all informations are set", () => {
  // arrange

  // do
  const env = environmentFactory({}).applyCredentials("cred").applyUserDomain("domain");

  // verify
  assert.equal(env.credentials, { jiraToken: "cred" });
  assert.equal(env.userDomain, "domain");
  assert.equal(env.isSetupFinished(), true);
});

test.run();
