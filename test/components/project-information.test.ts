import { mockDOMSource } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import test from "ava";
import xs from "xstream";
import { componentTest } from "test/helper";
import { projectFactory } from "@/model/project";
import { ProjectInformation, ProjectInformationProps } from "@/components/project-information";

test("initial display when project is not configured", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    // Act
    const sinks = ProjectInformation({
      DOM: dom as any,
      props: Time.diagram("x", { x: {} }),
    });

    const actual$ = sinks.DOM.map((vtree) => {
      return {
        name: select("[data-testid=name]", vtree)[0].text,
        shown: select("[data-testid=marker]", vtree)[0].data?.dataset?.show,
      };
    });
    const expected$ = Time.diagram("a", {
      a: {
        name: "Click here",
        shown: "true",
      },
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

test("show project name", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    // Act
    const sinks = ProjectInformation({
      DOM: dom as any,
      props: Time.diagram("x", {
        x: {
          project: projectFactory({
            id: "id",
            key: "key",
            name: "name",
          }),
        },
      }),
    });

    const actual$ = sinks.DOM.map((vtree) => {
      return {
        name: select('[data-testid="name"]', vtree)[0].text,
      };
    });

    const expected$ = Time.diagram("a", {
      a: {
        name: "name",
      },
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

test("do not show marker if setup finished", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    // Act
    const sinks = ProjectInformation({
      DOM: dom as any,
      props: xs
        .of<ProjectInformationProps>({
          project: projectFactory({
            id: "id",
            key: "key",
            name: "name",
          }),
        })
        .remember(),
    });

    const actual$ = sinks.DOM.map((vtree) => {
      return {
        shown: select("[data-testid=marker]", vtree)[0].data?.dataset?.show,
      };
    });
    const expected$ = Time.diagram("(a|)", { a: { shown: "false" } });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});
