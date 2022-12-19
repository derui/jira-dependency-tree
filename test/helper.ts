import { MemoryStream } from "xstream";
import { ComponentSources } from "@/components/type";

// short cut function to select element
export const elements = function elements<T>(source: ComponentSources<T>, selector: string): MemoryStream<Element[]> {
  return source.DOM.select(selector).elements() as MemoryStream<Element[]>;
};

// short cut function to fire event
export const fire = function fire(element: Element, eventType: string, details: any) {
  const event = new window.Event(eventType, details);
  element.dispatchEvent(event);
};

//go next tick
export const tick = async function tick() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

// short cut function to run component with Time
// Usage:
// await componentTest((done) => {
//   ....

//     Time.run(done)
// })
export const componentTest = function componentTest(f: (done: (error: any) => void) => void) {
  return new Promise<void>(async (resolve, rej) => {
    f((e) => {
      if (e) rej(e);
      else resolve();
    });
  });
};
