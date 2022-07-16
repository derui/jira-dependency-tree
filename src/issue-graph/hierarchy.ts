import { emptyGraph } from "@/depgraph";
import { Issue } from "@/model/issue";
import { filterUndefined } from "@/util";
import * as d3 from "d3";

export const makeHierarchies = function makeHierarchies(issues: Issue[]) {
  const issueMap = issues.reduce((map, issue) => map.set(issue.key, issue), new Map<string, Issue>());

  let issueGraph = issues.reduce((graph, issue) => {
    return graph.addVertex(issue.key);
  }, emptyGraph());

  issueGraph = issues.reduce((graph, issue) => {
    return issue.outwardIssueKeys.reduce((graph, key) => graph.directTo(issue.key, key), graph);
  }, issueGraph);

  const getChildren = function getChildren(parent: Issue) {
    const adjacents = issueGraph.adjacent(parent.key);

    if (adjacents.length) {
      return adjacents.map((v) => issueMap.get(v)).filter(filterUndefined);
    }

    return null;
  };

  return issueGraph.levelAt(0).map((v) => d3.hierarchy(issueMap.get(v)!, getChildren));
};
