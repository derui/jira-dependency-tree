import { JiraProjectLoader } from "@/components/jira-project-loader";
import { projectFactory } from "@/model/project";
import { mockTimeSource } from "@cycle/time";
import { suite } from "uvu";
import xs from "xstream";

const test = suite("components/JiraProjectLoader");

test("load project", async () => {
  await new Promise<void>(async (resolve, rej) => {
    // Arrange
    const Time = mockTimeSource();

    const response$ = Time.diagram("-x|", {
      x: {
        status: 200,
        body: JSON.stringify({
          id: "foo",
          key: "bar",
          name: "name",
          statues: [{ id: "id", name: "type", categoryId: null }],
          statusCategories: [{ id: 1, name: "category", colorName: "red" }],
          issueTypes: [{ id: "id", name: "issuetype", avatarUrl: null }],
        }),
      },
    });

    // Act
    const sinks = JiraProjectLoader({
      HTTP: {
        select() {
          return Time.diagram("x|", { x: response$ });
        },
      } as any,
      events: xs.of(),
    });

    const actual$ = sinks.project.map((v) => {
      return { id: v.id, name: v.name, key: v.key };
    });
    const project = projectFactory({
      id: "foo",
      key: "bar",
      name: "name",
      statuses: [{ id: "id", name: "type", categoryId: "" }],
      statusCategories: [{ id: "1", name: "category", colorName: "" }],
      issueTypes: [{ id: "id", name: "issuetype", avatarUrl: "" }],
    });
    const expected$ = Time.diagram("-b|", {
      b: { id: project.id, name: project.name, key: project.key },
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
