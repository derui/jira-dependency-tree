import { ZoomSlider } from "@/components/zoom-slider";
import { mockDOMSource, VNode } from "@cycle/dom";
import { mockTimeSource } from "@cycle/time";
import { select } from "snabbdom-selector";
import { suite } from "uvu";

const test = suite("components/ZoomSlider");

test("display current zoom value", async () => {
  await new Promise<void>(async (resolve, rej) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    const sinks = ZoomSlider({
      DOM: dom as any,
      props: Time.diagram("-x", { x: { zoom: 50 } }),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        zoom: select("[data-testid=current-zoom]", vtree)[0].text,
      };
    });

    // Assert
    const expected$ = Time.diagram("-a-", {
      a: {
        zoom: "50%",
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run((e) => {
      if (e) rej(e);
      else resolve();
    });
  });
});

test("zoom value must be integer", async () => {
  await new Promise<void>(async (resolve, rej) => {
    // Arrange
    const Time = mockTimeSource();
    const dom = mockDOMSource({});

    const sinks = ZoomSlider({
      DOM: dom as any,
      props: Time.diagram("-x", { x: { zoom: 50.5 } }),
    });

    // Act
    const actual$ = sinks.DOM.map((vtree) => {
      return {
        zoom: select("[data-testid=current-zoom]", vtree)[0].text,
      };
    });

    // Assert
    const expected$ = Time.diagram("-a-", {
      a: {
        zoom: "51%",
      },
    });

    Time.assertEqual(actual$, expected$);

    Time.run((e) => {
      if (e) rej(e);
      else resolve();
    });
  });
});

test.run();
