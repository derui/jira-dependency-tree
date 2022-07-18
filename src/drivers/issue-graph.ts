import { Driver } from "@cycle/run";
import xs, { Stream } from "xstream";
import { adapt } from "@cycle/run/lib/adapt";
import { Issue } from "@/model/issue";
import { Project } from "@/model/project";
import { makeIssueGraphRoot } from "@/issue-graph/root";
import { Size } from "@/type";
import { Selection } from "d3";
import { filterNull } from "@/util";

export type IssueGraphViewPort = {
  minX: number;
  minY: number;
  width: number;
  height: number;
};

export interface IssueGraphSink {
  viewPort: IssueGraphViewPort;
  issues: Issue[];
  project: Project;
}

export interface IssueGraphSource {}

export const makeIssueGraphDriver = function makeIssueGraphDriver(
  parentSelector: string,
  nodeSize: Size = { width: 152, height: 64 }
): Driver<Stream<IssueGraphSink | null>, Stream<IssueGraphSource>> {
  return function IssueGraphDriver(sink$) {
    let svg: Selection<SVGSVGElement, undefined, null, undefined> | null = null;

    sink$.filter(filterNull).subscribe({
      next: ({ viewPort, issues, project }) => {
        const configuration = {
          nodeSize,
          canvasSize: { width: viewPort.width, height: viewPort.height },
        };

        if (svg === null) {
          svg = makeIssueGraphRoot(issues, project, configuration);
          document.querySelector(parentSelector)?.append(svg.node() as Node);
        }

        svg.attr("viewBox", [viewPort.minX, viewPort.minY, viewPort.width, viewPort.height]);
      },
    });

    return adapt(xs.of({}));
  };
};
