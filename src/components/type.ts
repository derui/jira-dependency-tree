import { DOMSource, VNode } from "@cycle/dom";
import { Stream } from "xstream";

// A simple wrapper type for source
export type ComponentSources<T> = {
  DOM: DOMSource;
} & T;

// A simple wrapper type for sink
export type ComponentSinks<T> = {
  DOM: Stream<VNode>;
} & T;
