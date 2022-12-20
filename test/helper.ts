import { MemoryStream } from "xstream";
import { ComponentSource, domSourceOf } from "@/components/helper";

// short cut function to select element
export const elements = (source: ComponentSource, selector: string): MemoryStream<Element[]> => {
  return domSourceOf(source).select(selector).elements() as MemoryStream<Element[]>;
};

// short cut function to fire event
export const fire = (element: Element, eventType: string, details: any) => {
  const event = new window.Event(eventType, details);
  element.dispatchEvent(event);
};

//go next tick
export const tick = async () => {
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
export const componentTest = (f: (done: (error: unknown) => void) => void) => {
  return new Promise<void>(async (resolve, rej) => {
    f((e) => {
      if (e) rej(e);
      else resolve();
    });
  });
};
