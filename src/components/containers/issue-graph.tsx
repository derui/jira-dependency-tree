import classNames from "classnames";
import { useEffect, useLayoutEffect, useRef, useState, WheelEvent } from "react";
import { fromEvent, take, takeUntil } from "rxjs";
import { BaseProps, generateTestId } from "../helper";
import { IssueNode } from "../organisms/issue-node";
import { LinkNode } from "../organisms/link-node";
import { useGraphNodeLayout, useViewBox } from "@/hooks";
import { Rect } from "@/utils/basic";

type Props = BaseProps;

const Styles = {
  root: classNames("max-h-full", "height-auto", "absolute"),
};

// eslint-disable-next-line func-style
export function IssueGraphContainer(props: Props) {
  const gen = generateTestId(props.testid);
  const graph = useGraphNodeLayout();
  const viewBox = useViewBox();
  const ref = useRef<SVGSVGElement | null>(null);

  const issues = graph.layout.issues.map((v) => {
    return <IssueNode key={v.issue.key} layout={v} />;
  });

  const links = graph.layout.links.map((v) => {
    return <LinkNode key={v.meta.relationId} layout={v} />;
  });

  useLayoutEffect(() => {
    const f = () => {
      const rect = document.body.getBoundingClientRect();
      viewBox.resize(Rect.fromDOMRect(rect));
    };
    document.body.addEventListener("resize", f);

    // reset size initially
    f();

    return () => {
      document.body.removeEventListener("resize", f);
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

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
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
        <marker id="arrowhead" markerWidth={10} markerHeight={7} refX={10} refY={3.5} orient="auto">
          <polygon points="0 0, 10 3.5, 0.7" />
        </marker>
      </defs>
      {issues}
      {links}
    </svg>
  );
}
