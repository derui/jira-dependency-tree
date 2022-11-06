import { SideToolbar } from "@/components/side-toolbar";
import { GraphLayout } from "@/issue-graph/type";
import { mockDOMSource, VNode } from "@cycle/dom";
import { withState } from "@cycle/state";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import { componentTest } from "test/helper";
import { suite } from "uvu";

const test = suite("components/SideToolbar");

test("initial state is given prop", async () => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    const sinks = withState(SideToolbar)({
      DOM: dom as any,
      props: Time.diagram("-x", { x: GraphLayout.Horizontal }),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        graphLayoutOpened: select("[data-testid=graph-layout]", vtree)[0].data?.class!!["--opened"],
        horizontalSelected: select("[data-testid=horizontal]", vtree)[0].data?.class!!["--selected"],
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
});

test("open layouter when it clicked", async () => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const click$ = Time.diagram("--a|", { a: { target: {} } });
    const dom = mockDOMSource({
      ".side-toolbar__graph-layout": {
        click: click$,
      },
    });

    const sinks = withState(SideToolbar)({
      DOM: dom as any,
      props: Time.diagram("-x", { x: GraphLayout.Horizontal }),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        graphLayoutOpened: select("[data-testid=graph-layout]", vtree)[0].data?.class!!["--opened"],
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
});

test("change layout when specific layout is clicked", async () => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const click$ = Time.diagram("--a|", { a: { target: {} } });
    const dom = mockDOMSource({
      ".graph-layouter__vertical": {
        click: click$,
      },
    });

    const sinks = withState(SideToolbar)({
      DOM: dom as any,
      props: Time.diagram("-x", { x: GraphLayout.Horizontal }),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        vertical: select("[data-testid=vertical]", vtree)[0].data?.class!!["--selected"],
        horizontal: select("[data-testid=horizontal]", vtree)[0].data?.class!!["--selected"],
      };
    });

    // Assert
    const expected$ = Time.diagram("-a(ab)", {
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
});

test("should close layouter if value changed", async () => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const clickVertical$ = Time.diagram("---a|", { a: { target: {} } });
    const clickLayouter$ = Time.diagram("--a-|", { a: { target: {} } });
    const dom = mockDOMSource({
      ".graph-layouter__vertical": {
        click: clickVertical$,
      },
      ".side-toolbar__graph-layout": {
        click: clickLayouter$,
      },
    });

    const sinks = withState(SideToolbar)({
      DOM: dom as any,
      props: Time.diagram("-x", { x: GraphLayout.Horizontal }),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return select("[data-testid=graph-layout]", vtree)[0].data?.class!!["--opened"];
    });

    // Assert
    const expected$ = Time.diagram("-ab(aa)", {
      a: false,
      b: true,
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
});

test.run();
