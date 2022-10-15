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
        shown: select("[data-testid=marker]", vtree)[0].data?.class!["--show"],
      };
    });
    const expected$ = Time.diagram("(a|)", {
      a: {
        name: "Click here",
        needConfiguration: true,
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

    const actual$ = sinks.DOM.drop(1).map((vtree) => {
      return {
        name: select("[data-testid=name]", vtree)[0].text,
        needConfiguration: select("[data-testid=name]", vtree)[0].data?.class!["--need-configuration"],
      };
    });
    const expected$ = Time.diagram("(a|)", {
      a: {
        name: "name",
        needConfiguration: false,
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

    const actual$ = sinks.DOM.drop(1).map((vtree) => {
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

test("show dialog if name click", async () => {
  await new Promise<void>(async (resolve, rej) => {
    // Arrange
    const Time = mockTimeSource();
    const click$ = Time.diagram("-a--|", { a: { target: {} } });
    const dom = mockDOMSource({
      ".project-information__name": {
        click: click$,
      },
    });

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

    const actual$ = sinks.DOM.drop(2).map((vtree) => {
      return {
        opened: select("[data-testid=main]", vtree)[0].data?.class!["--editor-opened"],
        editor: select("[data-testid=editor]", vtree)[0].data?.class!["--show"],
      };
    });
    const expected$ = Time.diagram("-a--|", { a: { opened: true, editor: true } });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run((e) => {
      if (e) rej(e);
      else resolve();
    });
  });
});

test("execute to update project when submit from editor", async () => {
  await new Promise<void>(async (resolve, rej) => {
    // Arrange
    const Time = mockTimeSource();
    const click$ = Time.diagram("-a----|", { a: { target: {} } });
    const input$ = Time.diagram("--a---|", { a: { target: { value: "next" } } });
    const submit$ = Time.diagram("----x-|", { x: { target: {} } });
    const dom = mockDOMSource({
      ".project-information__name": {
        click: click$,
      },
      ".project-information__name-input": {
        input: input$,
      },
      ".project-information__form": {
        submit: submit$,
      },
    });

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

    const actual$ = xs.combine(sinks.DOM.last(), sinks.value.last()).map(([vtree, called]) => {
      return {
        opened: select("[data-testid=main]", vtree)[0].data?.class!["--editor-opened"],
        called,
      };
    });
    const expected$ = Time.diagram("------(a|)", {
      a: { opened: false, called: "next" },
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
