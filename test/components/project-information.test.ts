import { ProjectInformation } from "@/components/project-information";
import { projectFactory } from "@/model/project";
import { mockDOMSource } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import { suite } from "uvu";
import xs from "xstream";

const test = suite("components/UserConfiguration");

test("show dialog name", async () => {
  await new Promise<void>(async (resolve, rej) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    // Act
    const sinks = ProjectInformation({
      DOM: dom as any,
      props: xs.of({
        project: projectFactory({
          id: "id",
          key: "key",
          name: "name",
        }),
      }),
    });

    const actual$ = sinks.DOM.map((vtree) => {
      return select("[data-testid=name]", vtree)[0].text;
    });
    const expected$ = Time.diagram("(a|)", {
      a: "name",
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
