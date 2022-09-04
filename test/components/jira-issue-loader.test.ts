import { JiraIssueLoader } from "@/components/jira-issue-loader";
import { mockTimeSource } from "@cycle/time";
import { suite } from "uvu";
import xs from "xstream";

const test = suite("components/JiraIssueLoader");

test("load issues", async () => {
  await new Promise<void>(async (resolve, rej) => {
    // Arrange
    const Time = mockTimeSource();

    const response$ = Time.diagram("-x|", {
      x: {
        status: 200,
        body: JSON.stringify([
          {
            key: "foo",
            summary: "bar",
            description: "desc",
            statusId: "id",
            typeId: "typeid",
            selfUrl: "self",
            links: [],
          },
        ]),
      },
    });

    // Act
    const sinks = JiraIssueLoader({
      HTTP: {
        select() {
          return Time.diagram("x|", { x: response$ });
        },
      } as any,
      events: xs.of(),
    });

    const actual$ = sinks.issues;
    const expected$ = Time.diagram("-b|", {
      b: [
        {
          key: "foo",
          summary: "bar",
          description: "desc",
          statusId: "id",
          typeId: "typeid",
          selfUrl: "self",
          outwardIssueKeys: [],
        },
      ],
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
