import { mockDOMSource } from "@cycle/dom";
import { withState } from "@cycle/state";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import { componentTest } from "test/helper";
import test from "ava";
import { GraphLayout } from "@/issue-graph/type";
import { SideToolbar } from "@/components/side-toolbar";

test("initial state is given prop", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    const sinks = withState(SideToolbar)({
      HTTP: undefined,
      Portal: undefined,
      DOM: dom as unknown,
      props: Time.diagram("-x", { x: GraphLayout.Horizontal }),
      testid: undefined,
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        graphLayoutOpened: select("[data-testid=layouter]", vtree)[0].data?.class?.["--opened"],
        horizontalSelected: select("[data-testid=horizontal]", vtree)[0].data?.class?.["--selected"],
      };
    });

    // Assert
    const expected$ = Time.diagram("-a-", {
      a: {
        graphLayoutOpened: false,
        horizontalSelected: true,
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

test("open layouter when it clicked", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const click$ = Time.diagram("--a|", { a: { target: {} } });
    const dom = mockDOMSource({
      '[data-id="opener"]': {
        click: click$,
      },
    });

    const sinks = withState(SideToolbar)({
      HTTP: undefined,
      Portal: undefined,
      DOM: dom as unknown,
      props: Time.diagram("-x", { x: GraphLayout.Horizontal }),
      testid: undefined,
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        graphLayoutOpened: select("[data-testid=layouter]", vtree)[0].data?.class?.["--opened"],
      };
    });

    // Assert
    const expected$ = Time.diagram("-ab", {
      a: {
        graphLayoutOpened: false,
      },
      b: {
        graphLayoutOpened: true,
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

test("change layout when specific layout is clicked", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const click$ = Time.diagram("--a|", { a: { target: {} } });
    const layouterClick$ = Time.diagram("---a|", { a: { target: {} } });
    const dom = mockDOMSource({
      '[data-id="opener"]': {
        click: click$,
      },
      '[data-id="vertical"]': {
        click: layouterClick$,
      },
    });

    const sinks = withState(SideToolbar)({
      HTTP: undefined,
      Portal: undefined,
      DOM: dom as unknown,
      props: Time.diagram("-x", { x: GraphLayout.Horizontal }),
      testid: undefined,
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        vertical: select("[data-testid=vertical]", vtree)[0].data?.class?.["--selected"],
        horizontal: select("[data-testid=horizontal]", vtree)[0].data?.class?.["--selected"],
      };
    });

    // Assert
    const expected$ = Time.diagram("-aab", {
      a: {
        vertical: false,
        horizontal: true,
      },
      b: {
        vertical: true,
        horizontal: false,
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

test("should close layouter if value changed", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const clickVertical$ = Time.diagram("---a", { a: { target: {} } });
    const clickLayouter$ = Time.diagram("--a-", { a: { target: {} } });
    const dom = mockDOMSource({
      '[data-id="opener"]': {
        click: clickLayouter$,
      },
      '[data-id="vertical"]': {
        click: clickVertical$,
      },
    });

    const sinks = withState(SideToolbar)({
      HTTP: undefined,
      Portal: undefined,
      DOM: dom as unknown,
      props: Time.diagram("-x", { x: GraphLayout.Horizontal }),
      testid: undefined,
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return select("[data-testid=layouter]", vtree)[0].data?.class?.["--opened"];
    });

    // Assert
    const expected$ = Time.diagram("-aba", {
      a: false,
      b: true,
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});
