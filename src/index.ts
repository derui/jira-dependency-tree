import * as d3 from "d3";
import * as d3tree from "d3-hierarchy";
import { makeHierarchies } from "./issue-graph/hierarchy";
import { buildIssueTree } from "./issue-graph/issue";
import { Issue } from "./model/issue";

const tree = d3tree.tree().nodeSize([100, 25]);

const issues = [
  {
    key: "EX-1",
    summary: "summary of ex-1",
    description: "",
    statusId: "1",
    typeId: "2",
    selfUrl: "http://localhost/ex-1",
    outwardIssueKeys: ["EX-2", "EX-3", "EX-4"],
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
];

const root = makeHierarchies(issues);

const width = 1000;
const height = 1000;
const svg = d3
  .create("svg")
  .attr("viewBox", [-250, -250, width - 250, height - 250])
  .attr("width", width)
  .attr("height", height)
  .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
  .attr("font-family", "sans-serif")
  .attr("font-size", 10);

const g = svg.append("g").attr("font-family", "sans-serif").attr("font-size", 10);

root.map((v) => {
  const [x, y] = tree.nodeSize() || [1, 1];
  buildIssueTree(g, tree(v) as d3.HierarchyPointNode<Issue>, { nodeSize: { width: x, height: y } });
});

document.querySelector("#root")?.appendChild(svg.node() as Node);
