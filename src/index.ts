import * as d3 from "d3";
import { makeForceGraph } from "./issue-graph/force-graph";

const issues = [
  {
    key: "EX-1",
    summary: "summary of ex-1",
    description: "",
    statusId: "1",
    typeId: "2",
    selfUrl: "http://localhost/ex-1",
    outwardIssueKeys: ["EX-2", "EX-4"],
  },

  {
    key: "EX-2",
    summary: "summary of ex-2",
    description: "",
    statusId: "1",
    typeId: "2",
    selfUrl: "http://localhost/ex-2",
    outwardIssueKeys: ["EX-3"],
  },
  {
    key: "EX-3",
    summary: "summary of ex-3",
    description: "",
    statusId: "1",
    typeId: "2",
    selfUrl: "http://localhost/ex-3",
    outwardIssueKeys: ["EX-4"],
  },
  {
    key: "EX-4",
    summary: "summary of ex-4",
    description: "",
    statusId: "1",
    typeId: "2",
    selfUrl: "http://localhost/ex-4",
    outwardIssueKeys: [],
  },
  {
    key: "EX-5",
    summary: "summary of ex-5",
    description: "",
    statusId: "1",
    typeId: "2",
    selfUrl: "http://localhost/ex-5",
    outwardIssueKeys: ["EX-3"],
  },
];

const width = 1000;
const height = 1000;
const svg = d3
  .create("svg")
  .attr("viewBox", [0, 0, width, height])
  .attr("width", width)
  .attr("height", height)
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
const configuration = {
  nodeSize: { width: 152, height: 64 },
  canvasSize: { width: 1000, height: 1000 },
};

makeForceGraph(g, issues, configuration);

document.querySelector("#root")?.appendChild(svg.node() as Node);
