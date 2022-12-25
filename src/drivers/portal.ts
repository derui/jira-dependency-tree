import { Driver } from "@cycle/run";
import { Stream } from "xstream";
import { VNode } from "snabbdom";
import { IsolateableSource } from "@cycle/isolate";
import { div, MainDOMSource, makeDOMDriver } from "@cycle/dom";

export interface PortalSink {
  [k: string]: VNode;
}

export interface PortalSource extends IsolateableSource {
  DOM: MainDOMSource;
  isolateSource(source: PortalSource, scope: string): PortalSource;
  isolateSink(sink: Stream<PortalSink>, scope: string): Stream<PortalSink>;
}

class PortalSourceImpl implements PortalSource {
  public DOM: MainDOMSource;
  private _portalId: string;

  constructor(private _rootDOM: MainDOMSource, private _rootSelector: string, private scopes: string[]) {
    this._portalId = scopes.join("-");

    this.DOM = this._rootDOM.isolateSource(this._rootDOM, this._portalId);
  }

  isolateSource(_: PortalSource, scope: string): PortalSource {
    return new PortalSourceImpl(this._rootDOM, this._rootSelector, [...this.scopes, scope]);
  }

  isolateSink(sink: Stream<PortalSink>, scope: string): Stream<PortalSink> {
    return sink.map((portals) => {
      return Object.entries(portals).reduce<PortalSink>((accum, [key, value]) => {
        accum[`${scope}-${key}`] = value;

        return accum;
      }, {});
    });
  }
}

export const makePortalDriver = (selector: string): Driver<Stream<PortalSink>, PortalSource> => {
  const dom = makeDOMDriver(selector);

  return (sink) => {
    const vnode = sink.map((portals) => {
      const portalNodes = Object.entries(portals).map(([key, portal]) => {
        return div(`.portal-${key}`, [portal]);
      });

      return div(portalNodes);
    });

    return new PortalSourceImpl(dom(vnode), selector, ["root"]);
  };
};
