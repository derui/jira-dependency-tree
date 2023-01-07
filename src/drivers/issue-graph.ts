import { Driver } from "@cycle/run";
import xs, { Listener, MemoryStream, Stream } from "xstream";
import { Selection } from "d3";
import { fromEvent } from "@cycle/dom/lib/cjs/fromEvent";
import { simpleTransit } from "./util/transition";
import { Issue } from "@/model/issue";
import { Project } from "@/model/project";
import { makeIssueGraphRoot } from "@/issue-graph/root";
import { Position, Size } from "@/type";
import { filterNull, Rect } from "@/util/basic";
import { GraphLayout } from "@/issue-graph/type";
import { getTargetIssuePositionInSVG } from "@/issue-graph/issue";

type AttentionIssueCommand = {
  kind: "AttentionIssue";
  key: string;
};

export type IssueGraphCommand = AttentionIssueCommand;

interface IssueGraphState {
  pan: Position;
  zoomPercentage: number;
}

export interface IssueGraphSink {
  issues: Issue[];
  project: Project;
  graphLayout: GraphLayout;
}

export interface IssueGraphSource {
  // reset pan and zoom
  reset(): void;
  /**
   * run command on issue graph
   */
  runCommand(command: IssueGraphCommand): void;
  state: MemoryStream<IssueGraphState>;
}

const makeDragListener = (
  mousemove$: Stream<Event>,
  mouseup$: Stream<Event>,
  next: (pos: Position) => void,
): Partial<Listener<Event>> => {
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

const makeWheelListener = (next: (delta: number) => void): Partial<Listener<Event>> => {
  return {
    next: (e) => {
      const event = e as WheelEvent;
      const delta = event.deltaY > 0 ? 1 : -1;
      event.preventDefault();

      next(delta);
    },
  };
};

const makePanZoomStream = (selector: string, reference: IssueGraphState): MemoryStream<IssueGraphState> => {
  const element = document.querySelector(selector);

  if (!element) {
    throw Error(`Can not get element by ${selector}`);
  }

  const mouseup$ = fromEvent(element, "mouseup");
  const mousedown$ = fromEvent(element, "mousedown");
  const mousemove$ = fromEvent(element, "mousemove");
  const wheel$ = fromEvent(element, "wheel");
  const rect = element.getBoundingClientRect();

  reference.pan = { x: -1 * (rect.width / 2), y: (-1 * rect.height) / 2 };
  reference.zoomPercentage = 100;

  return xs.createWithMemory<IssueGraphState>({
    start: (listener) => {
      const dragListener = makeDragListener(mousemove$, mouseup$, (delta) => {
        const { pan, zoomPercentage: zoom } = reference;
        reference.pan = { x: pan.x + delta.x * (100 / zoom), y: pan.y + delta.y * (100 / zoom) };

        listener.next({ pan, zoomPercentage: zoom });
      });

      const wheelListener = makeWheelListener((delta) => {
        const { pan, zoomPercentage: zoom } = reference;
        const zoomScale = delta * 5 * (zoom / 100);

        reference.zoomPercentage = Math.max(Math.min(zoom + -1 * zoomScale, 200), 1);

        listener.next({ pan, zoomPercentage: zoom });
      });

      mousedown$.addListener(dragListener);
      wheel$.addListener(wheelListener);

      listener.next(reference);
    },
    stop() {},
  });
};

export const makeViewBox = function makeViewBox(panZoom: IssueGraphState, rect: Rect) {
  const scale = 100 / panZoom.zoomPercentage;
  const zoomedWidth = rect.width * scale;
  const zoomedHeight = rect.height * scale;
  const centerX = panZoom.pan.x + rect.width / 2;
  const centerY = panZoom.pan.y + rect.height / 2;

  const newMinX = centerX - zoomedWidth / 2;
  const newMinY = centerY - zoomedHeight / 2;

  return [newMinX, newMinY, zoomedWidth, zoomedHeight];
};

const attentionIssue = (
  svg: Selection<SVGSVGElement, undefined, null, undefined> | null,
  key: string,
  reference: IssueGraphState,
  callback: (pos: Position) => void,
) => {
  const targetPos = getTargetIssuePositionInSVG(svg, key);

  if (!targetPos) return;

  const { pan: initialPan } = reference;
  const vector = { x: targetPos.x - initialPan.x, y: targetPos.y - initialPan.y };

  const interpolatePosition = (elapsed: number) => {
    const rate = elapsed / 500;

    callback({ x: initialPan.x + vector.x * rate, y: initialPan.y + vector.y * rate });
  };

  simpleTransit(500, interpolatePosition);
};

export const makeIssueGraphDriver = function makeIssueGraphDriver(
  parentSelector: string,
  nodeSize: Size = { width: 160, height: 80 },
): Driver<Stream<IssueGraphSink | null>, IssueGraphSource> {
  return (sink$) => {
    let svg: Selection<SVGSVGElement, undefined, null, undefined> | null = null;
    let svgSize: DOMRect;
    let prevIssues: Issue[] | null = null;
    let prevProject: Project | null = null;
    let prevLayout: GraphLayout | null = null;
    const stateReference: IssueGraphState = {
      pan: { x: 0, y: 0 },
      zoomPercentage: 100,
    };

    const configuration = {
      nodeSize,
      canvasSize: { width: 0, height: 0 },
    };

    const stateStream = makePanZoomStream(parentSelector, stateReference);

    stateStream.subscribe({
      next(panZoom) {
        if (!svg) return;

        svg.attr("viewBox", makeViewBox(panZoom, svgSize));
      },
    });

    sink$.filter(filterNull).subscribe({
      next: ({ issues, project, graphLayout }) => {
        if (svg === null) {
          svg = makeIssueGraphRoot(issues, project, { ...configuration, graphLayout });
          document.querySelector(parentSelector)?.append(svg.node() as Node);
          svgSize = document.querySelector(parentSelector)?.getBoundingClientRect() ?? svgSize;
        } else if (prevIssues !== issues || prevProject !== project || prevLayout !== graphLayout) {
          svg.remove();

          svg = makeIssueGraphRoot(issues, project, { ...configuration, graphLayout });
          document.querySelector(parentSelector)?.append(svg.node() as Node);
          svgSize = document.querySelector(parentSelector)?.getBoundingClientRect() ?? svgSize;
        }

        configuration.canvasSize = { width: svgSize.width, height: svgSize.height };
        prevIssues = issues;
        prevProject = project;
        prevLayout = graphLayout;
      },
    });

    return {
      reset() {
        stateReference.pan = { x: -1 * (svgSize.width / 2), y: -1 * (svgSize.height / 2) };
      },
      runCommand(command) {
        switch (command.kind) {
          case "AttentionIssue":
            attentionIssue(svg, command.key, stateReference, (pan) => {
              svg?.attr("viewBox", makeViewBox({ ...stateReference, pan }, svgSize));
            });
            break;
        }
      },
      state: stateStream,
    };
  };
};
