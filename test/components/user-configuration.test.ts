import { UserConfiguration } from "@/components/user-configuration";
import { mockDOMSource } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import { suite } from "uvu";

const test = suite("components/UserConfiguration");

test("do not open dialog initially", async () => {
  await new Promise<void>(async (resolve, rej) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    // Act
    const sinks = UserConfiguration({ DOM: dom as any });

    const actual$ = sinks.DOM.map((vtree) => {
      return select("[data-testid=opener]", vtree)[0].data?.class;
    });
    const expected$ = Time.diagram("(a|)", {
      a: { "user-configuration__opener": true, "user-configuration__opener--opened": false },
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
    const sinks = UserConfiguration({ DOM: dom as any });

    const actual$ = sinks.DOM.map((vtree) => {
      return {
        opener: select("[data-testid=opener]", vtree)[0].data?.class,
        dialog: select("[data-testid=dialog]", vtree)[0].data?.class,
      };
    });
    const expected$ = Time.diagram("a-b------|", {
      a: {
        opener: { "user-configuration__opener": true, "user-configuration__opener--opened": false },
        dialog: { "user-configuration__dialog-container": true, "user-configuration__dialog-container--hidden": true },
      },
      b: {
        opener: { "user-configuration__opener": true, "user-configuration__opener--opened": true },
        dialog: { "user-configuration__dialog-container": true, "user-configuration__dialog-container--hidden": false },
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

test.run();
