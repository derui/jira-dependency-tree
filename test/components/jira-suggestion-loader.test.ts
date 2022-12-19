import { mockTimeSource } from "@cycle/time";
import test from "ava";
import { componentTest } from "test/helper";
import xs from "xstream";
import { suggestionFactory } from "@/model/suggestion";
import { JiraSuggestionLoader } from "@/components/jira-suggestions-loader";

test("load project", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();

    const response$ = Time.diagram("-x|", {
      x: {
        status: 200,
        text: JSON.stringify({
          sprints: [
            { value: "value", displayName: "name" },
            { value: "2", displayName: "name2" },
          ],
        }),
      },
    });

    // Act
    const sinks = JiraSuggestionLoader({
      HTTP: {
        select() {
          return Time.diagram("x|", { x: response$ });
        },
      } as any,
      events: xs.of(),
    });

    const actual$ = sinks.suggestion.map((v) => {
      return v.sprints;
    });
    const suggestion = suggestionFactory({
      sprints: [
        { value: "value", displayName: "name" },
        { value: "2", displayName: "name2" },
      ],
    });
    const expected$ = Time.diagram("-b|", {
      b: suggestion.sprints,
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});
