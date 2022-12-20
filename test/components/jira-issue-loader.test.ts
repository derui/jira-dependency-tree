import { mockTimeSource } from "@cycle/time";
import test from "ava";
import { componentTest } from "test/helper";
import xs from "xstream";
import { HTTPSource } from "@cycle/http";
import { JiraIssueLoader } from "@/components/jira-issue-loader";

test("load issues", async (t) => {
  await componentTest((done) => {
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

    Time.run(done);
  });
  t.pass();
});

test("merge subtask's outward", async (t) => {
  await componentTest((done) => {
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
            subtasks: ["bar"],
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
      } as unknown as HTTPSource,
      events: xs.of(),
    });

    const actual$ = sinks.issues.map((v) => v.filter((i) => i.key === "bar").at(0));
    const expected$ = Time.diagram("-b|", {
      b: {
        key: "bar",
        description: "",
        summary: "bar's summary",
        statusId: "id",
        typeId: "type",
        selfUrl: "self",
        outwardIssueKeys: ["baz"],
      },
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

test("add parent if subtask's outwards is empty", async (t) => {
  await componentTest((done) => {
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
            subtasks: ["bar"],
          },
          {
            key: "bar",
            summary: "bar's summary",
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
        description: "",
        summary: "bar's summary",
        statusId: "id",
        typeId: "type",
        selfUrl: "self",
        outwardIssueKeys: ["foo"],
      },
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});
