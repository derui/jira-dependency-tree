import { ComponentSources } from "@/components/type";
import { VNode } from "snabbdom";
import xs, { MemoryStream, Stream } from "xstream";

export type AsNodeStream<T extends string[]> = Stream<Record<T[number], VNode>>;
type NodesStream<T extends Record<string, unknown>> = Stream<Record<keyof T, VNode>>;

export const mergeNodes: <T extends Record<string, Stream<VNode>>>(nodes: T) => NodesStream<T> = (nodes) => {
  const entries = Object.entries(nodes).map(([key, value]) => {
    return value.map<[keyof typeof nodes, VNode]>((node) => [key, node]);
  });

  return xs.combine(...entries).map((_nodes) => {
    return _nodes.reduce((accum, [key, node]) => {
      accum[key] = node;
      return accum;
    }, {} as { [k in keyof typeof nodes]: VNode });
  });
};

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
