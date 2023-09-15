import classNames from "classnames";
import { useEffect, useLayoutEffect, useRef, WheelEvent } from "react";
import { fromEvent, take, takeUntil } from "rxjs";
import { BaseProps, generateTestId } from "../helper";
import { IssueNode } from "../organisms/issue-node";
import { LinkNode } from "../organisms/link-node";
import { useGraphNodeLayout, useViewBox } from "@/hooks";
import { Rect } from "@/utils/basic";
import { simpleTransit } from "@/utils/transition";
import { IssueModelWithLayout } from "@/view-models/graph-layout";
import { Position } from "@/type";
import { cubicBezier } from "@/utils/bezier";

interface Props extends BaseProps {
  attension?: string;
}

const Styles = {
  root: classNames("max-h-full", "height-auto", "absolute"),
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

// eslint-disable-next-line func-style
export function IssueGraphContainer(props: Props) {
  const gen = generateTestId(props.testid);
  const graph = useGraphNodeLayout();
  const viewBox = useViewBox();
  const ref = useRef<SVGSVGElement | null>(null);

  const issues = graph.layout.issues.map((v) => {
    return <IssueNode key={v.issue.key} layout={v} testid={gen("issue-node")} />;
  });

  const links = graph.layout.links.map((v) => {
    return <LinkNode key={v.meta.relationId} layout={v} testid={gen("link-node")} />;
  });

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

    const mousedown$ = fromEvent(ref.current, "mousedown");
    const mouseup$ = fromEvent(ref.current, "mouseup");
    const mousemove$ = fromEvent(ref.current, "mousemove");

    let prevX = 0;
    let prevY = 0;

    const totalSubscription = mousedown$.subscribe((e) => {
      prevX = (e as MouseEvent).clientX;
      prevY = (e as MouseEvent).clientY;

      const subscription = mousemove$.pipe(takeUntil(mouseup$.pipe(take(1)))).subscribe({
        next(mm) {
          mm.preventDefault();
          const moveEvent = mm as MouseEvent;

          const deltaX = prevX - moveEvent.clientX;
          const deltaY = prevY - moveEvent.clientY;
          prevX = moveEvent.clientX;
          prevY = moveEvent.clientY;

          viewBox.movePan({ x: deltaX, y: deltaY });
        },
        complete() {
          subscription.unsubscribe();
        },
      });
    });

    return () => totalSubscription.unsubscribe();
  }, [ref.current]);

  useEffect(() => {
    if (props.attension) {
      attentionIssue(viewBox.state.center, props.attension, graph.layout.issues, (p) => {
        viewBox.movePan(p);
      });
    }
  }, [props.attension]);

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
      {issues}
      {links}
    </svg>
  );
}
