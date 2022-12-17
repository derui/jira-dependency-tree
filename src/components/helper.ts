import { MainDOMSource } from "@cycle/dom";
import { HTTPSource, Response } from "@cycle/http";
import { VNode } from "snabbdom";
import xs, { Stream } from "xstream";
import { ComponentSources } from "./type";

// helper function to select source as MainDOMSource forcely
export const selectAsMain = function selectAsMain<T>(sources: ComponentSources<T>, selector: string): MainDOMSource {
  return sources.DOM.select(selector) as MainDOMSource;
};

// helper function to fix type definition of cycle/http
export const selectResponse = function selectResponse(http: HTTPSource, category?: string): Stream<Stream<Response>> {
  const res$: Stream<Stream<Response>> = http.select(category) as unknown as Stream<Stream<Response>>;

  return res$;
};

export type TestIdGenerator = ReturnType<typeof generateTestId>;

export const generateTestId = function generateTestId(parent: string | undefined, separator = "/") {
  const fixedParent = parent ? `${parent}${separator}` : "";

  return (id: string) => `${fixedParent}${id}`;
};

/**
 * shortcut function to get snabbdom's classes object from array of classes
 */
export const classes = (...classes: string[]) => {
  return classes.reduce((accum, v) => {
    accum[v] = true;

    return accum;
  }, {} as Record<string, boolean>);
};

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
