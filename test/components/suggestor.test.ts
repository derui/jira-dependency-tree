import { Suggestor, SuggestorProps } from "@/components/suggestor";
import { mockDOMSource, VNode } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import { componentTest } from "test/helper";
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
      props: xs.of<SuggestorProps>({ suggestions: [] }).remember(),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        noSuggestion: select("[data-testid=opener]", vtree)[0].data?.attrs?.disabled,
      };
    });

    // Assert
    const expected$ = Time.diagram("(a|)", {
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
      props: xs.of<SuggestorProps>({ suggestions: [{ id: "id", label: "label", value: 1 }] }).remember(),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        buttonDisabled: select("[data-testid=opener]", vtree)[0].data?.attrs?.disabled,
        buttonOpened: select("[data-testid=opener]", vtree)[0].data?.class!["--opened"],
        mainOpened: select("[data-testid=main]", vtree)[0].data?.class!["--opened"],
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
      props: xs
        .of<SuggestorProps>({
          suggestions: [
            { id: "id1", label: "label", value: 1 },
            { id: "id2", label: "label2", value: 1 },
          ],
        })
        .remember(),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        suggestions: select("[data-testid=suggestion]", vtree).map((v) => v.text),
      };
    });

    // Assert
    const expected$ = Time.diagram("(a|)", {
      a: {
        suggestions: ["label", "label2"],
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
});

test.run();
