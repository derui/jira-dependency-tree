import assert from "node:assert";
import { MainDOMSource } from "@cycle/dom";
import { HTTPSource, RequestInput, Response } from "@cycle/http";
import { VNode } from "snabbdom";
import xs, { Stream } from "xstream";
import { PortalSource } from "@/drivers/portal";

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

// support for node merger
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

// cyclejs's driver support
export type SupportedDrivers = "DOM" | "HTTP" | "Portal";
type SupportedSourceTypes = {
  DOM: MainDOMSource;
  HTTP: HTTPSource;
  Portal: PortalSource;
};

export type ComponentSinkTypes = {
  DOM: { DOM: Stream<VNode> };
  HTTP: { HTTP: Stream<RequestInput> };
  Portal: { Portal: Stream<VNode> };
};

// helper function to get driver from any source.
const driverSourceOf = <T extends SupportedDrivers>(
  sources: Record<string, unknown>,
  target: T
): SupportedSourceTypes[T] => {
  const driver = sources[target] as SupportedSourceTypes[T] | undefined;

  assert(driver !== undefined);

  return driver;
};

export const domSourceOf = (sources: object) => driverSourceOf(sources as Record<string, unknown>, "DOM");
export const httpSourceOf = (sources: object) => driverSourceOf(sources as Record<string, unknown>, "HTTP");
export const portalSourceOf = (sources: object) => driverSourceOf(sources as Record<string, unknown>, "Portal");

// A simple wrapper type for source
// interface can be applied all driver's sources, but you should use xxxSourceOf helper function to get driver's source.
type UnknownDrivers = Partial<{ [k in keyof SupportedSourceTypes]: unknown }>;

export interface ComponentSource extends UnknownDrivers {
  testid?: string | undefined;
}

// A simple wrapper type for sink
export type ComponentSink<B extends SupportedDrivers> = ComponentSinkTypes[B];
