import { SyncJira, SyncJiraProps } from "@/components/sync-jira";
import { mockDOMSource } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import { suite } from "uvu";
import xs from "xstream";

const test = suite("components/SyncJira");

test("initial display when component can not sync", async () => {
  await new Promise<void>(async (resolve, rej) => {
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
        mainSync: select("[data-testid=sync-jira-main]", vtree)[0].data?.class!["--syncing"],
        mainDisabled: select("[data-testid=sync-jira-main]", vtree)[0].data?.attrs!.disabled,
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

    Time.run((e) => {
      if (e) rej(e);
      else resolve();
    });
  });
});

test("initial display when component can sync", async () => {
  await new Promise<void>(async (resolve, rej) => {
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
        mainSync: select("[data-testid=sync-jira-main]", vtree)[0].data?.class!["--syncing"],
        mainDisabled: select("[data-testid=sync-jira-main]", vtree)[0].data?.attrs!.disabled,
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

    Time.run((e) => {
      if (e) rej(e);
      else resolve();
    });
  });
});

test("get event when clicked", async () => {
  await new Promise<void>(async (resolve, rej) => {
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

    Time.run((e) => {
      if (e) rej(e);
      else resolve();
    });
  });
});

test.run();
