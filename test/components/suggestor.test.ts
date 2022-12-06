import { Suggestor, SuggestorProps } from "@/components/suggestor";
import { mockDOMSource, VNode } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import { componentTest, elements } from "test/helper";
import { suite } from "uvu";
import xs from "xstream";

const test = suite("components/Suggestor");

test("button is disabled if no any suggestion", async () => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    const sinks = Suggestor({
      DOM: dom as any,
      props: Time.diagram("x", { x: { suggestions: [] } }).remember(),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        noSuggestion: select("[data-testid=suggestor-opener]", vtree)[0].data?.class!["--empty"],
      };
    });

    // Assert
    const expected$ = Time.diagram("a", {
      a: {
        noSuggestion: true,
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
});

test("open main when button clicked", async () => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({
      ".suggestor__opener": {
        click: Time.diagram("-a", { a: {} }),
      },
    });

    const sinks = Suggestor({
      DOM: dom as any,
      props: Time.diagram("x", { x: { suggestions: [{ id: "id", label: "label", value: 1 }] } }).remember(),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        buttonDisabled: select("[data-testid=suggestor-opener]", vtree)[0].data?.class!["--empty"],
        buttonOpened: select("[data-testid=suggestor-opener]", vtree)[0].data?.class!["--opened"],
        mainOpened: select("[data-testid=search-dialog]", vtree)[0].data?.class!["--opened"],
      };
    });

    // Assert
    const expected$ = Time.diagram("ab", {
      a: {
        buttonDisabled: false,
        buttonOpened: false,
        mainOpened: false,
      },
      b: {
        buttonDisabled: false,
        buttonOpened: true,
        mainOpened: true,
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
});

test("display suggestions", async () => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    const sinks = Suggestor({
      DOM: dom as any,
      props: Time.diagram("x", {
        x: {
          suggestions: [
            { id: "id1", label: "label", value: 1 },
            { id: "id2", label: "label2", value: 1 },
          ],
        },
      }).remember(),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        suggestions: select("[data-testid=suggestion]", vtree).map((v) => v.text),
      };
    });

    // Assert
    const expected$ = Time.diagram("a", {
      a: {
        suggestions: ["label", "label2"],
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
});

test("send term when suggestions is empty", async () => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({
      ".suggestor__opener": {
        click: Time.diagram("-a", { a: {} }),
      },
      ".suggestor-main__term-input": {
        input: Time.diagram("--a", { a: { target: { value: "x" } } }),
      },
    });

    const sinks = Suggestor({
      DOM: dom as any,
      props: Time.diagram("x", {
        x: { suggestions: [] },
      }).remember(),
    });

    // Act
    const actual$ = sinks.value;

    // Assert
    const expected$ = Time.diagram("--a", {
      a: { kind: "term", value: "x" },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
});

test("do not send term when suggestions is not empty", async () => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({
      ".suggestor__opener": {
        click: Time.diagram("-a", { a: {} }),
      },
      ".suggestor-main__term-input": {
        input: Time.diagram("--a", { a: { target: { value: "x" } } }),
      },
    });

    const sinks = Suggestor({
      DOM: dom as any,
      props: Time.diagram("x", {
        x: { suggestions: [{ id: "id", label: "label", value: "value" }] },
      }).remember(),
    });

    // Act
    const actual$ = sinks.value.filter((v) => v.kind === "term");

    // Assert
    const expected$ = Time.diagram("---");

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
});

test.run();
