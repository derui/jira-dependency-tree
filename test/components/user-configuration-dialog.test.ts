import { UserConfigurationDialog, UserConfigurationState } from "@/components/user-configuration-dialog";
import { mockDOMSource } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import test from "ava";
import xs from "xstream";
import { componentTest } from "test/helper";

test("allow user to submit if all value is valid", async (t) => {
  await componentTest((done) => {
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
      return select(".user-configuration__submit", vtree)[0].data?.attrs?.disabled;
    });
    const expected$ = Time.diagram("a-aab----|", { a: true, b: false });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

test("get value with submit", async (t) => {
  await componentTest((done) => {
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
    const expected$ = Time.diagram("----x----|", {
      x: { kind: "submit", state: { jiraToken: "cred", userDomain: "domain", email: "email" } },
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

test("use given value when it passed", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const domain$ = Time.diagram("--------|");
    const cred$ = Time.diagram("--------|");
    const email$ = Time.diagram("--------|");
    const submit$ = Time.diagram("----x---|", { x: { target: {} } });
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
    const expected$ = Time.diagram("----x---|", {
      x: { kind: "submit", state: { jiraToken: "cred", userDomain: "domain", email: "email" } },
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});
