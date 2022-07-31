import { ProjectInformation, ProjectInformationProps } from "@/components/project-information";
import { projectFactory } from "@/model/project";
import { mockDOMSource } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import { suite } from "uvu";
import xs from "xstream";

const test = suite("components/UserConfiguration");

test("initial display when project is not configured", async () => {
  await new Promise<void>(async (resolve, rej) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    // Act
    const sinks = ProjectInformation({
      DOM: dom as any,
      props: xs.of<ProjectInformationProps>({}),
    });

    const actual$ = sinks.DOM.map((vtree) => {
      return {
        name: select("[data-testid=name]", vtree)[0].text,
        needConfiguration: select("[data-testid=name]", vtree)[0].data?.class!["--need-configuration"],
        syncDisabled: select("[data-testid=sync]", vtree)[0].data?.attrs?.disabled,
        shown: select("[data-testid=marker]", vtree)[0].data?.class!["--show"],
      };
    });
    const expected$ = Time.diagram("(a|)", {
      a: {
        name: "Click here",
        needConfiguration: true,
        syncDisabled: true,
        shown: true,
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

test("show project name", async () => {
  await new Promise<void>(async (resolve, rej) => {
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
        name: select("[data-testid=name]", vtree)[0].text,
        needConfiguration: select("[data-testid=name]", vtree)[0].data?.class!["--need-configuration"],
        syncDisabled: select("[data-testid=sync]", vtree)[0].data?.attrs?.disabled,
      };
    });
    const expected$ = Time.diagram("(a|)", {
      a: {
        name: "name",
        needConfiguration: false,
        syncDisabled: false,
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

test("do not show marker if setup finished", async () => {
  await new Promise<void>(async (resolve, rej) => {
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
        shown: select("[data-testid=marker]", vtree)[0].data?.class!["--show"],
      };
    });
    const expected$ = Time.diagram("(a|)", { a: { shown: false } });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run((e) => {
      if (e) rej(e);
      else resolve();
    });
  });
});

test.run();
