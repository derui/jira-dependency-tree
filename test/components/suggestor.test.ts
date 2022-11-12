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

test.run();
