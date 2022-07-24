import { UserConfiguration } from "@/components/user-configuration-dialog";
import { mockDOMSource } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import { suite } from "uvu";

const test = suite("components/UserConfigurationDialog");

test("allow user to submit if all value is valid", async () => {
  await new Promise<void>(async (resolve, rej) => {
    // Arrange
    const Time = mockTimeSource();
    const domain$ = Time.diagram("--x------|", { x: { target: { value: "domain" } } });
    const cred$ = Time.diagram("---x-----|", { x: { target: { value: "cred" } } });
    const submit$ = Time.diagram("----x----|", { x: { target: {} } });
    const dom = mockDOMSource({
      ".user-configuration__user-domain": {
        input: domain$,
      },
      ".user-configuration__credential": {
        input: cred$,
      },
      ".user-configuration__form": {
        submit: submit$,
      },
    });

    // Act
    const sinks = UserConfiguration({ DOM: dom as any });

    const actual$ = sinks.DOM.map((vtree) => {
      return select(".user-configuration__submitter", vtree)[0].data?.attrs?.disabled;
    });
    const expected$ = Time.diagram("a-ab-----|", { a: true, b: false });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run((e) => {
      if (e) rej(e);
      else resolve();
    });
  });
});

test("get value with submit", async () => {
  await new Promise<void>(async (resolve, rej) => {
    // Arrange
    const Time = mockTimeSource();
    const domain$ = Time.diagram("--x------|", { x: { target: { value: "domain" } } });
    const cred$ = Time.diagram("---x-----|", { x: { target: { value: "cred" } } });
    const submit$ = Time.diagram("----x----|", { x: { target: {} } });
    const dom = mockDOMSource({
      ".user-configuration__user-domain": {
        input: domain$,
      },
      ".user-configuration__credential": {
        input: cred$,
      },
      ".user-configuration__form": {
        submit: submit$,
      },
    });

    // Act
    const sinks = UserConfiguration({ DOM: dom as any });

    const actual$ = sinks.value.map((v) => v);
    const expected$ = Time.diagram("----x----|", { x: { jiraToken: "cred", userDomain: "domain" } });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run((e) => {
      if (e) rej(e);
      else resolve();
    });
  });
});

test.run();
