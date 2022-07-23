import { MainDOMSource } from "@cycle/dom";
import { ComponentSources } from "./type";

// helper function to select source as MainDOMSource forcely
export const selectAsMain = function selectAsMain<T>(sources: ComponentSources<T>, selector: string): MainDOMSource {
  return sources.DOM.select(selector) as MainDOMSource;
};
