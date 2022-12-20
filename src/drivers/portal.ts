import { Driver } from "@cycle/run";
import { Stream } from "xstream";
import { VNode } from "snabbdom";
import { IsolateableSource } from "@cycle/isolate";
import { MainDOMSource, makeDOMDriver } from "@cycle/dom";

export interface PortalSource extends IsolateableSource {
  DOM: MainDOMSource;
  isolateSource(source: PortalSource, scope: string): PortalSource;
  isolateSink(sink: Stream<VNode>, scope: string): Stream<VNode>;
}

class PortalSourceImpl implements PortalSource {
  public DOM: MainDOMSource;
  private _element: HTMLDivElement;
  private _portalId: string;

  constructor(private _rootDOM: MainDOMSource, private _rootSelector: string, private scopes: string[]) {
    this._portalId = scopes.join("-");
    this._element = document.createElement("div");
    this._element.dataset[`portal-id`] = this._portalId;
    document.querySelector(this._rootSelector)?.appendChild(this._element);

    this.DOM = this._rootDOM.select(`${this._rootSelector} div[data-portal-id="${this._portalId}"]`);
  }

  isolateSource(_: PortalSource, scope: string): PortalSource {
    return new PortalSourceImpl(this._rootDOM, this._rootSelector, [...this.scopes, scope]);
  }

  isolateSink(sink: Stream<VNode>): Stream<VNode> {
    return sink;
  }
}

export const makePortalDriver = (selector: string): Driver<Stream<VNode>, PortalSource> => {
  const dom = makeDOMDriver(selector);

  return (sink) => {
    return new PortalSourceImpl(dom(sink), selector, []);
  };
};
