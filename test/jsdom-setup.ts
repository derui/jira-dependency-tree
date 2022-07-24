import * as jsdom from "jsdom";

const dom = new jsdom.JSDOM("<main></main>");

export const setupJsdom = function setup() {
  global.window = dom.window as any;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.MutationObserver = dom.window.MutationObserver;
  global.requestAnimationFrame = null as any;
};

export const resetJsdom = function reset() {
  dom.window.document.head.innerHTML = "";
  dom.window.document.body.innerHTML = "<main></main>";
};
