import { DOMSource, mockDOMSource } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import test from "ava";
import xs from "xstream";
import { componentTest } from "test/helper";
import { UserConfiguration, UserConfigurationProps } from "@/components/user-configuration";
import { Rect } from "@/util/basic";

test("marker shows when setup finished", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    // Act
    const sinks = UserConfiguration({
      DOM: dom as unknown as DOMSource,
      props: xs.of<UserConfigurationProps>({ setupFinished: false }),
      testid: undefined,
    });

    const actual$ = sinks.DOM.map((vtree) => {
      return select("[data-testid=marker]", vtree)[0].data?.dataset?.show;
    });
    const expected$ = Time.diagram("(a|)", {
      a: "true",
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

test("hide marker if setup finished", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    // Act
    const sinks = UserConfiguration({
      DOM: dom as unknown as DOMSource,
      props: Time.diagram("x--a", {
        x: { setupFinished: false },
        a: { setupFinished: true },
      }),
      testid: undefined,
    });

    const actual$ = sinks.DOM.map((vtree) => {
      return {
        marker: select("[data-testid=marker]", vtree)[0].data?.dataset?.show,
      };
    });
    const expected$ = Time.diagram("a--b", {
      a: {
        marker: "true",
      },
      b: {
        marker: "false",
      },
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

test("event occurred when clicked", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const click$ = Time.diagram("-x-", { x: { target: {} } });
    const dom = mockDOMSource({
      '[data-id="opener"]': {
        click: click$,
      },
      '[data-id="root"]': {
        elements: xs
          .of([
            {
              getBoundingClientRect() {
                return new Rect({ top: 1, bottom: 2, left: 0, right: 1 });
              },
            },
          ])
          .remember(),
      },
    });

    // Act
    const sinks = UserConfiguration({
      DOM: dom as unknown as DOMSource,
      props: Time.diagram("x", { x: { setupFinished: false } }),
      testid: undefined,
    });

    const actual$ = sinks.click;
    const expected$ = Time.diagram("-x-", {
      x: new Rect({ top: 1, bottom: 2, left: 0, right: 1 }),
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});
