import { ProjectToolbar } from "@/components/project-toolbar";
import { suggestionFactory } from "@/model/suggestion";
import { mockDOMSource, VNode } from "@cycle/dom";
import { withState } from "@cycle/state";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import { componentTest } from "test/helper";
import { suite } from "uvu";
import xs from "xstream";

const test = suite("components/ProjectToolbar");

test("initial state is given prop", async () => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    const sinks = withState(ProjectToolbar)({
      DOM: dom as any,
      props: xs.of(suggestionFactory({})).remember(),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        selectorOpened: select("[data-testid=selector]", vtree)[0].data?.class!!["--opened"],
      };
    });

    // Assert
    const expected$ = Time.diagram("a-", {
      a: {
        selectorOpened: false,
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
});

test("open selector when it clicked", async () => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const click$ = Time.diagram("--a|", { a: { target: {} } });
    const dom = mockDOMSource({
      ".project-toolbar__search-condition-editor": {
        click: click$,
      },
    });

    const sinks = withState(ProjectToolbar)({
      DOM: dom as any,
      props: xs.of(suggestionFactory({})).remember(),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        selectorOpened: select("[data-testid=selector]", vtree)[0].data?.class!!["--opened"],
      };
    });

    // Assert
    const expected$ = Time.diagram("a-b", {
      a: {
        selectorOpened: false,
      },
      b: {
        selectorOpened: true,
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
});

test("close selector when cancel button is clicked", async () => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const click$ = Time.diagram("--a|", { a: { target: {} } });
    const cancelClick$ = Time.diagram("---a|", { a: { target: {} } });
    const dom = mockDOMSource({
      ".project-toolbar__search-condition-editor": {
        click: click$,
      },
      ".search-condition-editor__cancel": {
        click: cancelClick$,
      },
    });

    const sinks = withState(ProjectToolbar)({
      DOM: dom as any,
      props: xs.of(suggestionFactory({})).remember(),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        selectorOpened: select("[data-testid=selector]", vtree)[0].data?.class!!["--opened"],
      };
    });

    // Assert
    const expected$ = Time.diagram("a-ba", {
      a: {
        selectorOpened: false,
      },
      b: {
        selectorOpened: true,
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
});

test.run();
