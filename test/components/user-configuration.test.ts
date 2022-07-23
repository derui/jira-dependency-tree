import { UserConfiguration } from "@/components/user-configuration";
import { makeDOMDriver } from "@cycle/dom";
import { DisposeFunction, setup } from "@cycle/run";
import { withState } from "@cycle/state";
import { element } from "test/helper";
import { resetJsdom, setupJsdom } from "test/jsdom-setup";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import xs from "xstream";

const test = suite("components/UserConfiguration");

test.before(setupJsdom);
test.before.each(resetJsdom);

test("should create with initial state", async () => {
  // Arrange
  const dom = makeDOMDriver("body");

  // Act
  const { sources, run } = setup(withState(UserConfiguration), { DOM: dom });
  let dispose: DisposeFunction;
  dispose = run();

  // Assert
  await new Promise<void>((resolve) => {
    xs.combine(
      element(sources, ".user-configuration__user-domain"),
      element(sources, ".user-configuration__credential"),
      element(sources, ".user-configuration__submitter")
    ).subscribe({
      next: ([userDomain, credential, submit]) => {
        assert.snapshot(userDomain.nodeValue || "", "", "user domain");
        assert.snapshot(credential.nodeValue || "", "", "credential");
        assert.equal(submit.hasAttribute("disabled"), true, "disabled");
        dispose();
      },
      complete: resolve,
    });
  });
});

test.run();
