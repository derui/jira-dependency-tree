import { JiraProjectLoader } from "@/components/jira-project-loader";
import { JiraSuggestionLoader } from "@/components/jira-suggestions-loader";
import { projectFactory } from "@/model/project";
import { suggestionFactory } from "@/model/suggestion";
import { mockTimeSource } from "@cycle/time";
import { suite } from "uvu";
import xs from "xstream";

const test = suite("components/JiraSuggestionLoader");

test("load project", async () => {
  await new Promise<void>(async (resolve, rej) => {
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

    Time.run((e) => {
      if (e) rej(e);
      else resolve();
    });
  });
});

test.run();
