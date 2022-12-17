import { mockDOMSource, VNode } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import { componentTest } from "test/helper";
import test from "ava";
import { Icon } from "@/components/atoms/icon";

test("small icon", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    const sinks = Icon({
      DOM: dom as any,
      props: Time.diagram("x", {
        x: {
          type: "search",
        },
      }),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      const classes = Object.keys(select("[data-testid=icon]", vtree)[0].data?.class ?? {});
      return {
        widthIsSmall: classes.includes("w-5"),
        heightIsSmall: classes.includes("h-5"),
        typeIsTest: classes.some((v) => v.match(/mask:url.+search.svg/)),
      };
    });

    // Assert
    const expected$ = Time.diagram("a", {
      a: {
        widthIsSmall: true,
        heightIsSmall: true,
        typeIsTest: true,
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });

  t.pass();
});

test("change icon type", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    const sinks = Icon({
      DOM: dom as any,
      props: Time.diagram("xs", {
        x: {
          type: "search",
        },

        s: {
          type: "square",
          size: "m",
        },
      }),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      const classes = Object.keys(select("[data-testid=icon]", vtree)[0].data?.class ?? {});

      return {
        widthIsMedium: classes.includes("w-6"),
        heightIsMedium: classes.includes("h-6"),
        typeChanged: classes.some((v) => v.match(/mask:url.+square.svg/)),
      };
    });

    // Assert
    const expected$ = Time.diagram("ab", {
      a: {
        widthIsMedium: false,
        heightIsMedium: false,
        typeChanged: false,
      },
      b: {
        widthIsMedium: true,
        heightIsMedium: true,
        typeChanged: true,
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });

  t.pass();
});

test("can add some styles", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    const sinks = Icon({
      DOM: dom as any,
      props: Time.diagram("x", {
        x: {
          type: "test",
          style: { "m-2": true },
        },
      }),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      const classes = Object.keys(select("[data-testid=icon]", vtree)[0].data?.class ?? {});

      return {
        userStyle: classes.includes("m-2"),
      };
    });

    // Assert
    const expected$ = Time.diagram("a", {
      a: {
        userStyle: true,
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });

  t.pass();
});
