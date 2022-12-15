import { SyncJira, SyncJiraProps } from "@/components/sync-jira";
import { mockDOMSource } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import test from "ava";
import xs from "xstream";
import { componentTest } from "test/helper";

test("initial display when component can not sync", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    // Act
    const sinks = SyncJira({
      DOM: dom as any,
      props: xs.of<SyncJiraProps>({ status: "LOADING", setupFinished: false }),
    });

    const actual$ = sinks.DOM.map((vtree) => {
      return {
        mainSync: select("[data-testid=button]", vtree)[0].data?.class!["--syncing"],
        mainDisabled: select("[data-testid=button]", vtree)[0].data?.attrs!.disabled,
      };
    });
    const expected$ = Time.diagram("(a|)", {
      a: {
        mainSync: false,
        mainDisabled: true,
      },
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

test("initial display when component can sync", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    // Act
    const sinks = SyncJira({
      DOM: dom as any,
      props: xs.of<SyncJiraProps>({ status: "COMPLETED", setupFinished: true }),
    });

    const actual$ = sinks.DOM.map((vtree) => {
      return {
        mainSync: select("[data-testid=button]", vtree)[0].data?.class!["--syncing"],
        mainDisabled: select("[data-testid=button]", vtree)[0].data?.attrs!.disabled,
      };
    });
    const expected$ = Time.diagram("(a|)", {
      a: {
        mainSync: false,
        mainDisabled: false,
      },
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

test("get event when clicked", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const click$ = Time.diagram("-a--|", { a: { target: {} } });
    const dom = mockDOMSource({
      ".sync-jira__main": {
        click: click$,
      },
    });

    // Act
    const sinks = SyncJira({
      DOM: dom as any,
      props: xs.of<SyncJiraProps>({ status: "COMPLETED", setupFinished: true }),
    });

    const actual$ = sinks.value;
    const expected$ = Time.diagram("-b--|", {
      b: "REQUEST",
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});
