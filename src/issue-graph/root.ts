import * as d3 from "d3";
import { Issue } from "@/model/issue";
import { Project } from "@/model/project";
import { makeForceGraph } from "@/issue-graph/force-graph";
import { Configuration } from "@/issue-graph/type";

export const makeIssueGraphRoot = function makeIssueGraphRoot(
  issues: Issue[],
  project: Project,
  configuration: Configuration,
) {
  const { width, height } = configuration.canvasSize;
  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("style", "max-width: 100%; height: auto; height: intrinsic; position: absolute")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10);

  // arrow head from below
  // http://thenewcode.com/1068/Making-Arrows-in-SVG
  const defs = svg.append("defs");

  defs
    .append("marker")
    .attr("id", "arrowhead")
    .attr("markerWidth", 10)
    .attr("markerHeight", 7)
    .attr("refX", 10)
    .attr("refY", 3.5)
    .attr("orient", "auto")
    .append("polygon")
    .attr("points", "0 0, 10 3.5, 0 7");

  defs
    .append("marker")
    .attr("id", "selected-arrowhead")
    .attr("markerWidth", 10)
    .attr("markerHeight", 7)
    .attr("refX", 10)
    .attr("refY", 3.5)
    .attr("orient", "auto")
    .append("polygon")
    .attr("fill", "#A4393C")
    .attr("stroke", "#A4393C")
    .attr("points", "0 0, 10 3.5, 0 7");

  defs
    .append("marker")
    .attr("id", "unfocusing-arrowhead")
    .attr("markerWidth", 10)
    .attr("markerHeight", 7)
    .attr("refX", 10)
    .attr("refY", 3.5)
    .attr("orient", "auto")
    .append("polygon")
    .attr("fill", "var(--color-light-gray)")
    .attr("stroke", "var(--color-light-gray)")
    .attr("points", "0 0, 10 3.5, 0 7");

  defineFilters(defs);

  // definition for text backgrounds
  svg.append("g").attr("font-family", "sans-serif").attr("font-size", 10);

  makeForceGraph(svg, issues, project, configuration);

  return svg;
};

const defineFilters = function defineFilters(defs: d3.Selection<SVGDefsElement, undefined, null, undefined>) {
  const todo = defs
    .append("filter")
    .attr("id", "todo-bg")
    // this settings for centric placement for text
    .attr("x", -0.05)
    .attr("y", -0.1)
    .attr("width", 1.1)
    .attr("height", 1.2);
  todo
    .append("feFlood")
    // secondary-2-1
    .attr("flood-color", "#6A909B");
  todo.append("feComposite").attr("in", "SourceGraphic").attr("operator", "xor");

  const inProgress = defs
    .append("filter")
    .attr("id", "in-progress-bg")
    .attr("x", -0.05)
    .attr("y", -0.1)
    .attr("width", 1.1)
    .attr("height", 1.2);
  inProgress
    .append("feFlood")
    // primary-1
    .attr("flood-color", "#FDACAE");
  inProgress.append("feComposite").attr("in", "SourceGraphic").attr("operator", "atop");

  const done = defs
    .append("filter")
    .attr("id", "done-bg")
    .attr("x", -0.05)
    .attr("y", -0.1)
    .attr("width", 1.1)
    .attr("height", 1.2);
  done
    .append("feFlood")
    // complement-1-1
    .attr("flood-color", "#90CF8D");
  done.append("feComposite").attr("in", "SourceGraphic").attr("operator", "atop");
};
