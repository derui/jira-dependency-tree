import { Driver } from "@cycle/run";
import xs, { Stream } from "xstream";
import { Issue } from "@/model/issue";
import { Project } from "@/model/project";
import { makeIssueGraphRoot } from "@/issue-graph/root";
import { Size } from "@/type";
import { Selection } from "d3";
import { filterNull, Rect } from "@/util/basic";
import { PanZoomState } from "./pan-zoom";
import { GraphLayout } from "@/issue-graph/type";

export interface IssueGraphSink {
  panZoom: PanZoomState;
  issues: Issue[];
  project: Project;
  graphLayout: GraphLayout;
}

export interface IssueGraphSource {}

export const makeViewBox = function makeViewBox(panZoom: PanZoomState, rect: Rect) {
  const scale = 100 / panZoom.zoomPercentage;
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
  nodeSize: Size = { width: 160, height: 80 }
): Driver<Stream<IssueGraphSink | null>, Stream<IssueGraphSource>> {
  return function IssueGraphDriver(sink$) {
    let svg: Selection<SVGSVGElement, undefined, null, undefined> | null = null;
    let svgSize: DOMRect;
    let prevIssues: Issue[] | null = null;
    let prevProject: Project | null = null;
    let prevLayout: GraphLayout | null = null;

    const configuration = {
      nodeSize,
      canvasSize: { width: 0, height: 0 },
    };

    sink$.filter(filterNull).subscribe({
      next: ({ panZoom, issues, project, graphLayout }) => {
        if (svg === null) {
          svg = makeIssueGraphRoot(issues, project, { ...configuration, graphLayout });
          document.querySelector(parentSelector)?.append(svg.node() as Node);
          svgSize = document.querySelector(parentSelector)!.getBoundingClientRect();
        } else if (prevIssues !== issues || prevProject !== project || prevLayout !== graphLayout) {
          svg.remove();

          svg = makeIssueGraphRoot(issues, project, { ...configuration, graphLayout });
          document.querySelector(parentSelector)?.append(svg.node() as Node);
          svgSize = document.querySelector(parentSelector)!.getBoundingClientRect();
        }

        svg.attr("viewBox", makeViewBox(panZoom, svgSize));
        configuration.canvasSize = { width: svgSize.width, height: svgSize.height };
        prevIssues = issues;
        prevProject = project;
        prevLayout = graphLayout;
      },
    });

    return xs.of({});
  };
};
