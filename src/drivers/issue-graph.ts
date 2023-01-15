import { Selection } from "d3";
import { distinctUntilChanged, filter, fromEvent, Observable, Subject, take, takeUntil } from "rxjs";
import { simpleTransit } from "./util/transition";
import { Issue } from "@/model/issue";
import { Project } from "@/model/project";
import { makeIssueGraphRoot } from "@/issue-graph/root";
import { Position, Size } from "@/type";
import { filterNull, Rect } from "@/util/basic";
import { GraphLayout } from "@/issue-graph/type";
import { getTargetIssuePositionInSVG } from "@/issue-graph/issue";
import { cubicBezier } from "@/util/bezier";

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

  /**
   * state stream of pan zoom
   */
  state$: Observable<IssueGraphState>;
}

const makeDragListener = (
  mousemove$: Observable<Event>,
  mouseup$: Observable<Event>,
  next: (pos: Position) => void,
): ((e: Event) => void) => {
  return (e) => {
    const event = e as MouseEvent;

    let prevX = event.clientX;
    let prevY = event.clientY;

    const mmStream = mousemove$.pipe(takeUntil(mouseup$.pipe(take(1))));

    const subscription = mmStream.subscribe({
      next(mm) {
        mm.preventDefault();
        const moveEvent = mm as MouseEvent;

        const deltaX = prevX - moveEvent.clientX;
        const deltaY = prevY - moveEvent.clientY;
        prevX = moveEvent.clientX;
        prevY = moveEvent.clientY;

        next({ x: deltaX, y: deltaY });
      },
      complete() {
        subscription.unsubscribe();
      },
    });
  };
};

const makeWheelListener = (next: (delta: number) => void): ((e: Event) => void) => {
  return (e) => {
    const event = e as WheelEvent;
    const delta = event.deltaY > 0 ? 1 : -1;
    event.preventDefault();

    next(delta);
  };
};

const makePanZoomStream = (selector: string, reference: IssueGraphState): Observable<IssueGraphState> => {
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

  return new Observable<IssueGraphState>((subscriber) => {
    const dragListener = makeDragListener(mousemove$, mouseup$, (delta) => {
      const { pan, zoomPercentage: zoom } = reference;
      reference.pan = { x: pan.x + delta.x * (100 / zoom), y: pan.y + delta.y * (100 / zoom) };

      subscriber.next({ pan, zoomPercentage: zoom });
    });

    const wheelListener = makeWheelListener((delta) => {
      const { pan, zoomPercentage: zoom } = reference;
      const zoomScale = delta * 5 * (zoom / 100);

      reference.zoomPercentage = Math.max(Math.min(zoom + -1 * zoomScale, 200), 1);

      subscriber.next({ pan, zoomPercentage: zoom });
    });

    mousedown$.subscribe(dragListener);
    wheel$.subscribe(wheelListener);

    subscriber.next(reference);
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
  svgRect: DOMRect,
  key: string,
  reference: IssueGraphState,
  callback: (pos: Position) => void,
) => {
  const targetPos = getTargetIssuePositionInSVG(svg, key);

  if (!targetPos) return;

  const { pan: initialPan } = reference;
  const center = { x: initialPan.x + svgRect.width / 2, y: initialPan.y + svgRect.height / 2 };
  const vector = { x: targetPos.x - center.x, y: targetPos.y - center.y };
  const bezier = cubicBezier([0, 0.1, 0.75, 1.0]);

  const interpolatePosition = (time: number) => {
    const rate = bezier(time);

    callback({ x: initialPan.x + vector.x * rate, y: initialPan.y + vector.y * rate });
  };

  simpleTransit(250)(interpolatePosition);
};

export const makeIssueGraphDriver = function makeIssueGraphDriver(
  parentSelector: string,
  nodeSize: Size = { width: 160, height: 80 },
): (sink: Subject<IssueGraphSink | null>) => IssueGraphSource {
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

    const updateIssueGraph = ({ issues, project, graphLayout }: IssueGraphSink) => {
      svg = makeIssueGraphRoot(issues, project, { ...configuration, graphLayout });
      document.querySelector(parentSelector)?.append(svg.node() as Node);

      svgSize = document.querySelector(parentSelector)?.getBoundingClientRect() ?? svgSize;
      stateReference.pan = { x: -1 * (svgSize.width / 2), y: (-1 * svgSize.height) / 2 };

      svg.attr("viewBox", makeViewBox(stateReference, svgSize));
    };

    sink$.pipe(filter(filterNull), distinctUntilChanged()).subscribe({
      next: ({ issues, project, graphLayout }) => {
        if (svg === null) {
          updateIssueGraph({ issues, project, graphLayout });
        } else if (prevIssues !== issues || prevProject !== project || prevLayout !== graphLayout) {
          svg.remove();

          updateIssueGraph({ issues, project, graphLayout });
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
            attentionIssue(svg, svgSize, command.key, stateReference, (pan) => {
              stateReference.pan = pan;
              svg?.attr("viewBox", makeViewBox({ ...stateReference, pan }, svgSize));
            });
            break;
        }
      },
      state: stateStream,
    };
  };
};
