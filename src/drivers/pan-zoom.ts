import { Driver } from "@cycle/run";
import xs, { Listener, MemoryStream, Stream } from "xstream";
import { Position } from "@/type";
import { fromEvent } from "@cycle/dom/lib/cjs/fromEvent";

export interface PanZoomSource {
  // reset pan and zoom
  reset(): void;
  state$: MemoryStream<PanZoomState>;
}

export type PanZoomState = {
  pan: Position;
};

const makeDragListener = function makeDragListener(
  mousemove$: Stream<Event>,
  mouseup$: Stream<Event>,
  next: (pos: Position) => void
): Partial<Listener<Event>> {
  return {
    next: (e) => {
      const event = e as MouseEvent;

      let prevX = event.clientX;
      let prevY = event.clientY;

      const mmStream = mousemove$.endWhen(mouseup$.take(1));
      const listener: Partial<Listener<Event>> = {
        next: (mm) => {
          mm.preventDefault();
          const moveEvent = mm as MouseEvent;

          const deltaX = prevX - moveEvent.clientX;
          const deltaY = prevY - moveEvent.clientY;
          prevX = moveEvent.clientX;
          prevY = moveEvent.clientY;

          next({ x: deltaX, y: deltaY });
        },
        complete() {
          mmStream.removeListener(listener);
        },
      };

      mmStream.addListener(listener);
    },
  };
};

export const makePanZoomDriver = function makePanZoomDriver(selector: string = "body"): Driver<void, PanZoomSource> {
  const element = document.querySelector(selector)!;

  return function IssueGraphDriver() {
    const mouseup$ = fromEvent(document, "mouseup");
    const mousedown$ = fromEvent(element, "mousedown");
    const mousemove$ = fromEvent(element, "mousemove");

    let pan = { x: 0, y: 0 };

    return {
      reset() {
        pan = { x: 0, y: 0 };
      },
      state$: xs.createWithMemory({
        start: (listener) => {
          const dragListener = makeDragListener(mousemove$, mouseup$, (delta) => {
            pan = { x: pan.x + delta.x, y: pan.y + delta.y };

            listener.next({ pan });
          });

          mousedown$.addListener(dragListener);
        },
        stop() {},
      }),
    };
  };
};
