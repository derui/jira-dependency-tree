import { UserConfigurationDialog, UserConfigurationState } from "@/components/user-configuration-dialog";
import { mockDOMSource } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import { suite } from "uvu";
import xs from "xstream";

const test = suite("components/UserConfigurationDialog");

test("allow user to submit if all value is valid", async () => {
  await new Promise<void>(async (resolve, rej) => {
    // Arrange
    const Time = mockTimeSource();
    const domain$ = Time.diagram("--x------|", { x: { target: { value: "domain" } } });
    const cred$ = Time.diagram("---x-----|", { x: { target: { value: "cred" } } });
    const email$ = Time.diagram("----x----|", { x: { target: { value: "email" } } });
    const submit$ = Time.diagram("-----x---|", { x: { target: {} } });
    const dom = mockDOMSource({
      ".user-configuration__user-domain": {
        input: domain$,
      },
      ".user-configuration__credential": {
        input: cred$,
      },
      ".user-configuration__email": {
        input: email$,
      },
      ".user-configuration__form": {
        submit: submit$,
      },
    });

    // Act
    const sinks = UserConfigurationDialog({ DOM: dom as any, props: xs.of({}) });

    const actual$ = sinks.DOM.map((vtree) => {
      return select(".user-configuration__submitter", vtree)[0].data?.attrs?.disabled;
    });
    const expected$ = Time.diagram("a-aab----|", { a: true, b: false });

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
    const email$ = Time.diagram("---x-----|", { x: { target: { value: "email" } } });
    const submit$ = Time.diagram("----x----|", { x: { target: {} } });
    const dom = mockDOMSource({
      ".user-configuration__user-domain": {
        input: domain$,
      },
      ".user-configuration__credential": {
        input: cred$,
      },
      ".user-configuration__email": {
        input: email$,
      },
      ".user-configuration__form": {
        submit: submit$,
      },
    });

    // Act
    const sinks = UserConfigurationDialog({ DOM: dom as any, props: xs.of({}) });

    const actual$ = sinks.value.map((v) => v);
    const expected$ = Time.diagram("----x----|", { x: { jiraToken: "cred", userDomain: "domain", email: "email" } });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run((e) => {
      if (e) rej(e);
      else resolve();
    });
  });
});

test("use given value when it passed", async () => {
  await new Promise<void>(async (resolve, rej) => {
    // Arrange
    const Time = mockTimeSource();
    const domain$ = Time.diagram("--------|");
    const cred$ = Time.diagram("--------|");
    const email$ = Time.diagram("--------|");
    const submit$ = Time.diagram("----x----|", { x: { target: {} } });
    const dom = mockDOMSource({
      ".user-configuration__user-domain": {
        input: domain$,
      },
      ".user-configuration__credential": {
        input: cred$,
      },
      ".user-configuration__email": {
        input: email$,
      },
      ".user-configuration__form": {
        submit: submit$,
      },
    });

    // Act
    const sinks = UserConfigurationDialog({
      DOM: dom as any,
      props: xs.of<Partial<UserConfigurationState>>({ userDomain: "domain", jiraToken: "cred", email: "email" }),
    });

    const actual$ = sinks.value.map((v) => v);
    const expected$ = Time.diagram("----x----|", { x: { jiraToken: "cred", userDomain: "domain", email: "email" } });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run((e) => {
      if (e) rej(e);
      else resolve();
    });
  });
});

test.run();
