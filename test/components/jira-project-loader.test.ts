import { mockTimeSource } from "@cycle/time";
import { componentTest } from "test/helper";
import test from "ava";
import xs from "xstream";
import { projectFactory } from "@/model/project";
import { JiraProjectLoader } from "@/components/jira-project-loader";

test("load project", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();

    const response$ = Time.diagram("-x|", {
      x: {
        status: 200,
        text: JSON.stringify({
          id: "foo",
          key: "bar",
          name: "name",
          statuses: [{ id: "id", name: "type", statusCategory: "TODO" }],
          statusCategories: [{ id: "1", name: "category", colorName: "red" }],
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
      statuses: [{ id: "id", name: "type", statusCategory: "TODO" }],
      statusCategories: [{ id: "1", name: "category", colorName: "" }],
      issueTypes: [{ id: "id", name: "issuetype", avatarUrl: "" }],
    });
    const expected$ = Time.diagram("-b|", {
      b: { id: project.id, name: project.name, key: project.key },
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});
