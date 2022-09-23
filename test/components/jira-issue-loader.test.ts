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
        text: JSON.stringify([
          {
            key: "foo",
            summary: "bar",
            description: "desc",
            statusId: "id",
            typeId: "typeid",
            selfUrl: "self",
            links: [],
            subtasks: [],
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

test("merge subtask's outward", async () => {
  await new Promise<void>(async (resolve, rej) => {
    // Arrange
    const Time = mockTimeSource();

    const response$ = Time.diagram("-x|", {
      x: {
        status: 200,
        text: JSON.stringify([
          {
            key: "foo",
            summary: "bar",
            description: "desc",
            statusId: "id",
            typeId: "typeid",
            selfUrl: "self",
            links: [],
            subtasks: [
              {
                key: "bar",
                summary: "bar's summary",
                statusId: "id",
                selfUrl: "self",
                typeId: "type",
              },
            ],
          },
          {
            key: "bar",
            summary: "bar's summary",
            statusId: "id",
            typeId: "type",
            selfUrl: "self",
            links: [
              {
                outwardIssue: "baz",
              },
            ],
            subtasks: [],
          },
          {
            key: "baz",
            summary: "baz's summary",
            statusId: "id",
            typeId: "type",
            selfUrl: "self",
            links: [],
            subtasks: [],
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

    const actual$ = sinks.issues.map((v) => v.filter((i) => i.key === "bar").at(0)!);
    const expected$ = Time.diagram("-b|", {
      b: {
        key: "bar",
        description: undefined,
        summary: "bar's summary",
        statusId: "id",
        typeId: "type",
        selfUrl: "self",
        outwardIssueKeys: ["foo", "baz"],
      },
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
