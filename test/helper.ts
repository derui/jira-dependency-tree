import { ComponentSources } from "@/components/type";
import { MemoryStream } from "xstream";

// short cut function to select element
export const element = function element<T>(source: ComponentSources<T>, selector: string): MemoryStream<Element> {
  return source.DOM.select(selector).element() as MemoryStream<Element>;
};

// short cut function to fire event
export const fire = function fire(element: Element, eventType: string, details: any) {
  const event = new Event(eventType, details);
  element.dispatchEvent(event);
};
