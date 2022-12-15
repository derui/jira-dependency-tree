import { Input } from "@/components/atoms/input";
import { mockDOMSource, VNode } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import { componentTest } from "test/helper";
import test from "ava";
import xs from "xstream";

test("initial display", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    const sinks = Input({
      DOM: dom as any,
      props: xs.of({
        value: "",
        label: "label",
      }),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        label: select("[data-testid=label]", vtree)[0].text,
        input: select("[data-testid=input]", vtree)[0].data?.attrs?.value,
      };
    });

    // Assert
    const expected$ = Time.diagram("(a|)", {
      a: {
        label: "label",
        input: "",
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

test("get value when input changed", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({
      'input[type="text"]': {
        input: Time.diagram("--a", {
          a: { target: { value: "foo" } },
        }),
      },
    });

    const sinks = Input({
      DOM: dom as any,
      props: Time.diagram("a--", {
        a: {
          value: "",
          label: "label",
        },
      }),
    });

    // Act
    const actual$ = sinks.value;

    // Assert
    const expected$ = Time.diagram("--a", {
      a: "foo",
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});

test("initial value and placeholder", async (t) => {
  await componentTest((done) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    const sinks = Input({
      DOM: dom as any,
      props: Time.diagram("a--", {
        a: {
          value: "foobar",
          label: "label",
          placeholder: "require",
        },
      }),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        value: select('[data-testid="input"]', vtree)[0].data?.attrs?.value,
        placeholder: select('[data-testid="input"]', vtree)[0].data?.attrs?.placeholder,
      };
    });

    // Assert
    const expected$ = Time.diagram("a--", {
      a: {
        value: "foobar",
        placeholder: "require",
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
  t.pass();
});
