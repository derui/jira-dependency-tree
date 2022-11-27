import { DOMSource, VNode } from "@cycle/dom";
import { Stream } from "xstream";

// A simple wrapper type for source
export type ComponentSources<T> = {
  DOM: DOMSource;
  testid?: string | undefined;
} & T;

// A simple wrapper type for sink
export type ComponentSinks<T> = {
  DOM: Stream<VNode>;
} & T;

// A simple wrapper type for source
export interface ComponentSourceBase {
  DOM: DOMSource;
  testid?: string | undefined;
}

// A simple wrapper type for sink
export interface ComponentSinkBase {
  DOM: Stream<VNode>;
}
