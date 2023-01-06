import { mockDOMSource } from "@cycle/dom";
import { withState } from "@cycle/state";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import { componentTest } from "test/helper";
import test from "ava";
import { IssueSearcher } from "@/components/issue-searcher";
import { Issue } from "@/model/issue";

test("initial display when issue not given", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    const sinks = withState(IssueSearcher)({
      HTTP: undefined,
      Portal: undefined,
      DOM: dom as unknown,
      props: { issues: Time.diagram("-") },
      testid: undefined,
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        hideIssueList: select("[data-testid=issue-list]", vtree)[0].data?.class?.hidden,
      };
    });

    // Assert
    const expected$ = Time.diagram("a", {
      a: {
        hideIssueList: true,
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

test("open term input when opener clicked", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const click$ = Time.diagram("--a|", { a: { target: {} } });
    const dom = mockDOMSource({
      "[data-id=opener]": {
        click: click$,
      },
    });

    const sinks = withState(IssueSearcher)({
      HTTP: undefined,
      Portal: undefined,
      DOM: dom as unknown,
      props: { issues: Time.diagram("-a-", { a: [] }) },
      testid: undefined,
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        inputWiden: select("[data-testid=input-wrapper]", vtree)[0].data?.class?.["w-64"],
      };
    });

    // Assert
    const expected$ = Time.diagram("a(aa)(bb)", {
      a: {
        inputWiden: undefined,
      },
      b: {
        inputWiden: true,
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

const getIssue = (key: string, summary: string): Issue => {
  return {
    key,
    summary,
    description: "",
    statusId: "",
    typeId: "",
    selfUrl: "",
    outwardIssueKeys: [],
  };
};

test("list issues matches input", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const click$ = Time.diagram("--a|", { a: { target: {} } });
    const input$ = Time.diagram("---a|", { a: { target: { value: "foo" } } });
    const dom = mockDOMSource({
      "[data-id=opener]": {
        click: click$,
      },
      "input[type=text]": {
        input: input$,
      },
    });

    const sinks = withState(IssueSearcher)({
      HTTP: undefined,
      Portal: undefined,
      DOM: dom as unknown,
      props: {
        issues: Time.diagram("-a", { a: [getIssue("key", "foo"), getIssue("foo", "bar"), getIssue("key", "baz")] }),
      },
      testid: undefined,
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        hideIssueList: select("[data-testid=issue-list]", vtree)[0].data?.class?.hidden,
        issues: select("[data-testid=issue]", vtree).length,
      };
    });

    // Assert
    const expected$ = Time.diagram("a(aa)(aa)(cc)", {
      a: {
        hideIssueList: true,
        issues: 0,
      },
      c: {
        hideIssueList: undefined,
        issues: 2,
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});
