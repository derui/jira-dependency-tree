import { MainDOMSource } from "@cycle/dom";
import { HTTPSource, Response } from "@cycle/http";
import { Stream } from "xstream";
import { ComponentSources } from "./type";

// helper function to select source as MainDOMSource forcely
export const selectAsMain = function selectAsMain<T>(sources: ComponentSources<T>, selector: string): MainDOMSource {
  return sources.DOM.select(selector) as MainDOMSource;
};

// helper function to fix type definition of cycle/http
export const selectResponse = function selectResponse(http: HTTPSource, category?: string): Stream<Stream<Response>> {
  const res$: Stream<Stream<Response>> = http.select(category) as any;

  return res$;
};
