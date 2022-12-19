import { DOMSource, mockDOMSource } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import test from "ava";
import xs from "xstream";
import { componentTest } from "test/helper";
import { withState } from "@cycle/state";
import { Props, UserConfigurationDialog } from "@/components/user-configuration-dialog";
import { Rect } from "@/util/basic";

test("do not open default", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    // Act
    const sinks = withState(UserConfigurationDialog)({
      DOM: dom as unknown as DOMSource,
      props: xs.of<Props>({}),
      testid: undefined,
    });

    const actual$ = sinks.DOM.map((vtree) => {
      return select("[data-testid=dialog-container]", vtree)[0].data?.dataset?.opened;
    });
    const expected$ = Time.diagram("a", {
      a: "false",
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

test("opened and set position", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({
      "[data-id=root]": {
        elements: xs.of([
          {
            style: {},
          },
        ]),
      },
    });

    // Act
    const sinks = withState(UserConfigurationDialog)({
      DOM: dom as unknown as DOMSource,
      props: Time.diagram("ax", { a: {}, x: { openAt: new Rect({ left: 0, right: 10, top: 50, bottom: 70 }) } }),
      testid: undefined,
    });

    const actual$ = sinks.DOM.take(1).map((vtree) => {
      return {
        opened: select("[data-testid=dialog-container]", vtree)[0].data?.dataset?.opened,
        right: select("[data-testid=dialog-container]", vtree)[0].data?.style?.right,
        top: select("[data-testid=dialog-container]", vtree)[0].data?.style?.top,
      };
    });
    const expected$ = Time.diagram("(a|)", {
      a: {
        opened: "false",
        right: "",
        top: "",
      },
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});
