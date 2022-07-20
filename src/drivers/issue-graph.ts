import { Driver } from "@cycle/run";
import xs, { Stream } from "xstream";
import { adapt } from "@cycle/run/lib/adapt";
import { Issue } from "@/model/issue";
import { Project } from "@/model/project";
import { makeIssueGraphRoot } from "@/issue-graph/root";
import { Size } from "@/type";
import { Selection } from "d3";
import { filterNull, Rect } from "@/util";
import { PanZoomState } from "./pan-zoom";

export interface IssueGraphSink {
  panZoom: PanZoomState;
  issues: Issue[];
  project: Project;
}

export interface IssueGraphSource {}

export const makeViewBox = function makeViewBox(panZoom: PanZoomState, rect: Rect) {
  const scale = panZoom.zoomPercentage / 100;
  const zoomedWidth = rect.width * scale;
  const zoomedHeight = rect.height * scale;
  const centerX = panZoom.pan.x + rect.width / 2;
  const centerY = panZoom.pan.y + rect.height / 2;

  const newMinX = centerX - zoomedWidth / 2;
  const newMinY = centerY - zoomedHeight / 2;

  return [newMinX, newMinY, zoomedWidth, zoomedHeight];
};

export const makeIssueGraphDriver = function makeIssueGraphDriver(
  parentSelector: string,
  nodeSize: Size = { width: 152, height: 64 }
): Driver<Stream<IssueGraphSink | null>, Stream<IssueGraphSource>> {
  return function IssueGraphDriver(sink$) {
    let svg: Selection<SVGSVGElement, undefined, null, undefined> | null = null;
    let svgSize: DOMRect;

    sink$.filter(filterNull).subscribe({
      next: ({ panZoom, issues, project }) => {
        if (svg === null) {
          const configuration = {
            nodeSize,
            canvasSize: { width: 0, height: 0 },
          };

          svg = makeIssueGraphRoot(issues, project, configuration);
          document.querySelector(parentSelector)?.append(svg.node() as Node);
          svgSize = document.querySelector(parentSelector)!.getBoundingClientRect();
        }

        svg.attr("viewBox", makeViewBox(panZoom, svgSize));
      },
    });

    return adapt(xs.of({}));
  };
};
