import { mockDOMSource, VNode } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import { componentTest } from "test/helper";
import test from "ava";
import { Button } from "@/components/atoms/button";

test("normal button", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    const sinks = Button({
      DOM: dom as any,
      props: Time.diagram("x", {
        x: {
          label: "test",
          schema: "primary",
        },
      }),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      const classes = Object.keys(select("[data-testid=button]", vtree)[0].data?.class ?? {});

      return {
        primary: classes.some((v) => v.includes("primary")),
        label: select("[data-testid=button]", vtree)[0].text,
      };
    });

    // Assert
    const expected$ = Time.diagram("a", {
      a: {
        primary: true,
        label: "test",
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });

  t.pass();
});

test("change button schema", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    const sinks = Button({
      DOM: dom as any,
      props: Time.diagram("x--a", {
        x: {
          label: "test",
          schema: "primary",
        },
        a: {
          label: "test",
          schema: "secondary1",
        },
      }),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      const classes = Object.keys(select("[data-testid=button]", vtree)[0].data?.class ?? {});

      return {
        primary: classes.some((v) => v.includes("primary")),
        secondary1: classes.some((v) => v.includes("secondary1")),
      };
    });

    // Assert
    const expected$ = Time.diagram("a--b", {
      a: {
        primary: true,
        secondary1: false,
      },
      b: {
        primary: false,
        secondary1: true,
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });

  t.pass();
});

test("give click event", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({
      button: {
        click: Time.diagram("--x--x", { x: {} }),
      },
    });

    const sinks = Button({
      DOM: dom as any,
      props: Time.diagram("x", {
        x: {
          label: "test",
          schema: "primary",
        },
      }),
    });

    // Act
    const actual$ = sinks.click;

    // Assert
    const expected$ = Time.diagram("--a--a", {
      a: true,
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });

  t.pass();
});
