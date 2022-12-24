import { mockDOMSource } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import test from "ava";
import xs from "xstream";
import { componentTest, emptySource } from "test/helper";
import { withState } from "@cycle/state";
import { SyncIssueButton } from "@/components/sync-issue-button";

test("initial display when component can not sync", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    // Act
    const sinks = withState(SyncIssueButton)({
      ...emptySource,
      DOM: dom as unknown,
      HTTP: {
        select() {
          return Time.diagram("--");
        },
      } as unknown,
      props: {
        credential: xs.never(),
        condition: xs.never(),
      },
    });

    const actual$ = sinks.DOM.map((vtree) => {
      return {
        mainDisabled: select("[data-testid=button]", vtree)[0].data?.attrs?.disabled,
      };
    });
    const expected$ = Time.diagram("a", {
      a: {
        mainDisabled: true,
      },
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

test("allow click button when it prepared", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    // Act
    const sinks = withState(SyncIssueButton)({
      ...emptySource,
      DOM: dom as unknown,
      HTTP: {
        select() {
          return Time.diagram("--");
        },
      } as unknown,
      props: {
        credential: Time.diagram("--x", {
          x: {
            userDomain: "domain",
            token: "token",
            email: "email",
            apiBaseUrl: "url",
            apiKey: "key",
          },
        }),
        condition: Time.diagram("---x", { x: { projectKey: "key" } }),
      },
    });

    const actual$ = sinks.DOM.map((vtree) => {
      return {
        mainDisabled: select("[data-testid=button]", vtree)[0].data?.attrs?.disabled,
        loading: select("[data-testid=button]", vtree)[0].data?.class?.["--loading"],
      };
    });
    const expected$ = Time.diagram("a--(bb)", {
      a: {
        mainDisabled: true,
        loading: false,
      },
      b: {
        mainDisabled: true,
        loading: true,
      },
    });

    // Assert
    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

test("get event when clicked", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const click$ = Time.diagram("-a--|", { a: { target: {} } });
    const dom = mockDOMSource({
      button: {
        click: click$,
      },
    });
    const response$ = Time.diagram("------x", {
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
    const sinks = withState(SyncIssueButton)({
      ...emptySource,
      DOM: dom as unknown,
      HTTP: {
        select() {
          return Time.diagram("-----x", { x: response$ });
        },
      },
      props: {
        credential: Time.diagram("--x", {
          x: {
            userDomain: "domain",
            token: "token",
            email: "email",
            apiBaseUrl: "url",
            apiKey: "key",
          },
        }),
        condition: Time.diagram("---x", { x: { projectKey: "key" } }),
      },
    });

    const actual$ = sinks.value;
    const expected$ = Time.diagram("------x", {
      x: [
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
