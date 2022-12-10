import { UserConfiguration, UserConfigurationProps } from "@/components/user-configuration";
import { settingFactory } from "@/model/setting";
import { mockDOMSource } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import { suite } from "uvu";
import xs from "xstream";

const test = suite("components/UserConfiguration");

test("do not open dialog initially", async () => {
  await new Promise<void>(async (resolve, rej) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    // Act
    const sinks = UserConfiguration({
      DOM: dom as any,
      props: xs.of<UserConfigurationProps>({ setting: settingFactory({}), setupFinished: false }),
    });

    const actual$ = sinks.DOM.map((vtree) => {
      return select("[data-testid=opener]", vtree)[0].data?.class;
    });
    const expected$ = Time.diagram("(a|)", {
      a: { "user-configuration__opener": true, "--opened": false },
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run((e) => {
      if (e) rej(e);
      else resolve();
    });
  });
});

test("do not open dialog initially", async () => {
  await new Promise<void>(async (resolve, rej) => {
    // Arrange
    const Time = mockTimeSource();
    const click$ = Time.diagram("--x------|", { x: { target: {} } });
    const dom = mockDOMSource({
      ".user-configuration__opener": {
        click: click$,
      },
    });

    // Act
    const sinks = UserConfiguration({
      DOM: dom as any,
      props: xs.of<UserConfigurationProps>({ setting: settingFactory({}), setupFinished: true }),
    });

    const actual$ = sinks.DOM.map((vtree) => {
      return {
        opener: select("[data-testid=opener]", vtree)[0].data?.class,
        dialog: select("[data-testid=dialog-container]", vtree)[0].data?.class,
        marker: select("[data-testid=marker]", vtree)[0].data?.class!["--show"],
      };
    });
    const expected$ = Time.diagram("a-b------|", {
      a: {
        opener: { "user-configuration__opener": true, "--opened": false },
        dialog: { "user-configuration__dialog-container": true, "--opened": false },
        marker: false,
      },
      b: {
        opener: { "user-configuration__opener": true, "--opened": true },
        dialog: { "user-configuration__dialog-container": true, "--opened": true },
        marker: false,
      },
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run((e) => {
      if (e) rej(e);
      else resolve();
    });
  });
});

test("close dialog automatically when it applied", async () => {
  await new Promise<void>(async (resolve, rej) => {
    // Arrange
    const Time = mockTimeSource();
    const click$ = Time.diagram("-x-------|", { x: { target: {} } });
    const credential$ = Time.diagram("--x------|", { x: { target: { value: "a" } } });
    const userDomain$ = Time.diagram("--x------|", { x: { target: { value: "b" } } });
    const form$ = Time.diagram("---x-----|");
    const dom = mockDOMSource({
      ".___userConfigurationDialog": {
        ".user-configuration__credential": {
          input: credential$,
        },
        ".user-configuration__user-domain": {
          input: userDomain$,
        },
        ".user-configuration__form": {
          submit: form$,
        },
      },
      ".user-configuration__opener": {
        click: click$,
      },
    });

    // Act
    const sinks = UserConfiguration({
      DOM: dom as any,
      props: xs.of<UserConfigurationProps>({ setting: settingFactory({}), setupFinished: false }),
    });

    const actual$ = sinks.DOM.drop(1).map((vtree) => {
      return {
        opener: select("[data-testid=opener]", vtree)[0].data?.class!["--opened"],
        dialog: select("[data-testid=dialog-container]", vtree)[0].data?.class!["--opened"],
      };
    });
    const expected$ = Time.diagram("-a(aa)b-----|", {
      a: { opener: true, dialog: true },
      b: { opener: false, dialog: false },
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run((e) => {
      if (e) rej(e);
      else resolve();
    });
  });
});

test.run();
