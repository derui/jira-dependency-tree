import classNames from "classnames";
import { useEffect, useLayoutEffect, useRef, WheelEvent } from "react";
import { fromEvent, merge, take, takeUntil } from "rxjs";
import { BaseProps, generateTestId } from "../helper";
import { IssueNode } from "../organisms/issue-node";
import { LinkNode } from "../organisms/link-node";
import { IssueDetailViewer } from "../organisms/issue-detail-viewer";
import { useGraphNodeLayout, useViewBox } from "@/hooks";
import { Rect } from "@/utils/basic";
import { simpleTransit } from "@/utils/transition";
import { IssueModelWithLayout } from "@/view-models/graph-layout";
import { Position } from "@/type";
import { cubicBezier } from "@/utils/bezier";
import { useFocusedIssue } from "@/hooks/focused-issue";

type Props = BaseProps;

type PrevCache = { x: number; y: number; diff: number };

const Styles = {
  root: classNames("max-h-full", "h-auto", "absolute", "touch-none", "select-none"),
  arrowhead: classNames("stroke-secondary1-300", "fill-secondary1-300"),
};

const attentionIssue = (
  center: Position,
  targetIssueKey: string,
  issues: IssueModelWithLayout[],
  callback: (pos: Position) => void,
) => {
  const targetIssue = issues.find((i) => i.issue.key === targetIssueKey);

  if (!targetIssue) return;

  const targetPosition = {
    x: targetIssue.position.x + targetIssue.size.width / 2,
    y: targetIssue.position.y + targetIssue.size.height / 2,
  };
  const vector = { x: targetPosition.x - center.x, y: targetPosition.y - center.y };
  const bezier = cubicBezier([0, 0.1, 0.75, 1.0]);

  const interpolatePosition = (time: number) => {
    const rate = bezier(time);

    callback({ x: vector.x * rate, y: vector.y * rate });
    vector.x -= vector.x * rate;
    vector.y -= vector.y * rate;
  };

  simpleTransit(250)(interpolatePosition);
};

const GESTURE_THRESHOLD = 100;

const handlePointerMove = function handlePointerMove(
  events: PointerEvent[],
  prevCache: PrevCache,
  movePan: ReturnType<typeof useViewBox>["movePan"],
  zoomIn: ReturnType<typeof useViewBox>["zoomIn"],
  zoomOut: ReturnType<typeof useViewBox>["zoomOut"],
) {
  // handle for mouse
  if (events.length == 1 && events[0].pointerType == "mouse") {
    const event = events[0];

    const deltaX = prevCache.x - event.clientX;
    const deltaY = prevCache.y - event.clientY;
    prevCache.x = event.clientX;
    prevCache.y = event.clientY;

    movePan({ x: deltaX, y: deltaY });
    // handle for gesture
  } else if (events.length == 2) {
    const diff = Math.sqrt(
      Math.pow(events[1].clientX - events[0].clientX, 2) + Math.pow(events[1].clientY - events[0].clientY, 2),
    );

    // If the distance between two fingers is less than or equal to the threshold, it is considered PAN
    if (diff <= GESTURE_THRESHOLD) {
      const centerX = (events[1].clientX + events[0].clientX) / 2;
      const centerY = (events[1].clientY - events[0].clientY) / 2;

      let doPan = true;
      if (prevCache.x == 0 && prevCache.y == 0) {
        doPan = false;
      }
      const deltaX = prevCache.x - centerX;
      const deltaY = prevCache.y - centerY;
      prevCache.x = centerX;
      prevCache.y = centerY;

      if (doPan) {
        movePan({ x: deltaX, y: deltaY });
      }
    } else {
      if (prevCache.diff == 0) {
        prevCache.diff = diff;
      } else {
        const scale = prevCache.diff / diff;

        if (scale > 1.0) {
          zoomOut(1);
        } else {
          zoomIn(1);
        }
      }
    }
  }
};

// eslint-disable-next-line func-style
export function IssueGraphContainer(props: Props) {
  const gen = generateTestId(props.testid);
  const graph = useGraphNodeLayout();
  const viewBox = useViewBox();
  const ref = useRef<SVGSVGElement | null>(null);
  const focusedIssue = useFocusedIssue();
  const movePan = viewBox.movePan;

  useLayoutEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      viewBox.resize(Rect.fromDOMRect(rect));
    });

    observer.observe(document.body);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const pointerdown$ = fromEvent<PointerEvent>(ref.current, "pointerdown");
    const pointerup$ = fromEvent<PointerEvent>(ref.current, "pointerup");
    const pointercancel$ = fromEvent<PointerEvent>(ref.current, "pointercancel");
    const pointermove$ = fromEvent<PointerEvent>(ref.current, "pointermove");

    let prevCache: PrevCache = { x: 0, y: 0, diff: 0 };
    const evCache: PointerEvent[] = [];

    const totalSubscription = pointerdown$.subscribe((e) => {
      evCache.push(e);

      prevCache.x = e.clientX;
      prevCache.y = e.clientY;

      const pointerUpSubscription = merge(pointercancel$, pointerup$)
        .pipe(take(1))
        .subscribe({
          next(e) {
            for (let i = 0; i < evCache.length; i++) {
              if (evCache[i].pointerId == e.pointerId) {
                evCache.splice(i, 1);
                break;
              }
            }
          },
          complete() {
            prevCache = { x: 0, y: 0, diff: 0 };
            pointerUpSubscription.unsubscribe();
          },
        });

      const subscription = pointermove$.pipe(takeUntil(pointerup$.pipe(take(1)))).subscribe({
        next(mm) {
          for (let i = 0; i < evCache.length; i++) {
            if (evCache[i].pointerId == mm.pointerId) {
              evCache[i] = mm;
              break;
            }
          }

          handlePointerMove(evCache, prevCache, movePan, viewBox.zoomIn, viewBox.zoomOut);
        },
        complete() {
          subscription.unsubscribe();
        },
      });
    });

    return () => totalSubscription.unsubscribe();
  }, [ref.current, movePan]);

  useEffect(() => {
    if (focusedIssue) {
      attentionIssue(viewBox.state.center, focusedIssue, graph.layout.issues, (p) => {
        viewBox.movePan(p);
      });
    }
  }, [focusedIssue]);

  const issues = graph.layout.issues.map((v) => {
    return <IssueNode key={v.issue.key} layout={v} testid={gen("issue-node")} />;
  });

  const links = graph.layout.links.map((v) => {
    return <LinkNode key={v.meta.relationId} layout={v} testid={gen("link-node")} />;
  });

  const detail = graph.layout.selectedIssue ? (
    <IssueDetailViewer layout={graph.layout.selectedIssue} testid={gen("detail")} />
  ) : null;

  const handleWheel = (e: WheelEvent) => {
    const delta = e.deltaY > 0 ? 1 : -1;

    if (delta > 0) {
      viewBox.zoomOut(1);
    } else {
      viewBox.zoomIn(1);
    }
  };

  return (
    <svg
      ref={ref}
      viewBox={viewBox.state.viewBox.join(" ")}
      data-testid={gen("root")}
      className={Styles.root}
      onWheel={handleWheel}
    >
      <defs>
        <marker
          id="arrowhead"
          className={Styles.arrowhead}
          markerWidth={10}
          markerHeight={7}
          refX={10}
          refY={3.5}
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" />
        </marker>
      </defs>
      {links}
      {issues}
      {detail}
    </svg>
  );
}
