import { Issue } from "@/model/issue";
import { Project } from "@/model/project";
import * as d3 from "d3";
import { makeForceGraph } from "@/issue-graph/force-graph";
import { Configuration } from "@/issue-graph/type";

export const makeIssueGraphRoot = function makeIssueGraphRoot(
  issues: Issue[],
  project: Project,
  configuration: Configuration
) {
  const { width, height } = configuration.canvasSize;
  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10);

  // arrow head from below
  // http://thenewcode.com/1068/Making-Arrows-in-SVG
  svg
    .append("defs")
    .append("marker")
    .attr("id", "arrowhead")
    .attr("markerWidth", 10)
    .attr("markerHeight", 7)
    .attr("refX", 10)
    .attr("refY", 3.5)
    .attr("orient", "auto")
    .append("polygon")
    .attr("points", "0 0, 10 3.5, 0 7");

  const g = svg.append("g").attr("font-family", "sans-serif").attr("font-size", 10);

  makeForceGraph(g, issues, project, configuration);

  return svg;
};
