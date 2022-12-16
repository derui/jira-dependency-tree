import { Suggestor, SuggestorProps } from "@/components/suggestor";
import { mockDOMSource, VNode } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import { componentTest } from "test/helper";
import test from "ava";
import xs from "xstream";

test("open main when button clicked", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({
      ".suggestor__opener": {
        click: Time.diagram("---a", { a: {} }),
      },
    });

    const sinks = Suggestor({
      DOM: dom as any,
      props: xs.of<SuggestorProps>({ suggestions: [{ id: "id", label: "label", value: 1 }] }).remember(),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        buttonOpened: select("[data-testid=suggestor-opener]", vtree)[0].data?.class!["--opened"],
        mainOpened: select("[data-testid=search-dialog]", vtree)[0].data?.class!["--opened"],
      };
    });

    // Assert
    const expected$ = Time.diagram("a--x", {
      a: {
        buttonOpened: false,
        mainOpened: false,
      },
      x: {
        buttonOpened: true,
        mainOpened: true,
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

test("display suggestions", async (t) => {
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
  t.pass();
});

test("do not send term when suggestions is not empty", async (t) => {
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
  t.pass();
});
