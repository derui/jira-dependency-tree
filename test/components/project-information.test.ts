import { mockDOMSource } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import test from "ava";
import xs from "xstream";
import { componentTest, emptySource } from "test/helper";
import { withState } from "@cycle/state";
import { ProjectInformation } from "@/components/project-information";

test("initial display when project is not configured", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    // Act
    const sinks = withState(ProjectInformation)({
      ...emptySource,
      DOM: dom as unknown,
      HTTP: {
        select() {
          return Time.diagram("--");
        },
      } as unknown,
      props: {
        credential: Time.diagram("---"),
      },
    });

    const actual$ = sinks.DOM.map((vtree) => {
      return {
        name: select("[data-testid=name]", vtree)[0].text,
        shown: select("[data-testid=marker]", vtree)[0].data?.class?.["--show"],
      };
    });
    const expected$ = Time.diagram("a", {
      a: {
        name: "Click here",
        shown: true,
      },
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

test("show project after input name and after credential", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({
      ".___nameInput": {
        'input[type="text"]': {
          input: Time.diagram("--x", {
            x: { target: { value: "bar" } },
          }),
          elements: xs.of({ focus() {} }),
        },
      },
      '[data-id="submit"]': {
        click: Time.diagram("---x", { x: {} }),
      },
    });

    // Act
    const sinks = withState(ProjectInformation)({
      ...emptySource,
      DOM: dom as unknown,
      HTTP: {
        select() {
          return Time.diagram("----x", {
            x: xs.of({
              status: 200,
              text: JSON.stringify({
                id: "foo",
                key: "bar",
                name: "foo",
                statuses: [{ id: "id", name: "type", statusCategory: "TODO" }],
                statusCategories: [{ id: "1", name: "category", colorName: "red" }],
                issueTypes: [{ id: "id", name: "issuetype", avatarUrl: null }],
              }),
            }),
          });
        },
      } as unknown,
      props: {
        credential: Time.diagram("x", {
          x: {
            userDomain: "domain",
            token: "token",
            email: "email",
            apiBaseUrl: "url",
            apiKey: "key",
          },
        }),
      },
    });

    const actual$ = sinks.DOM.map((vtree) => {
      return {
        name: select('[data-testid="name"]', vtree)[0].text,
      };
    });

    const expected$ = Time.diagram("a--ab", {
      a: {
        name: "Click here",
      },
      b: {
        name: "foo",
      },
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});
