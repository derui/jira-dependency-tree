import { CycleDetection, DirectedGraph, emptyDirectedGraph } from "@/libs/depgraph/main";
import { Relation } from "@/models/issue";
import { IssueModel } from "@/view-models/issue";

const correctSubgraph = (subgraph: DirectedGraph, cycle: CycleDetection) => {
  if (cycle.kind === "NotHaveCycle") {
    return subgraph;
  } else {
    return cycle.cycles.reduce((graph, cycle) => {
      const last = cycle.cycle.at(cycle.cycle.length - 1);

      if (!last) {
        return graph;
      }

      return graph.removeDirection(last, cycle.next);
    }, subgraph);
  }
};

const removeCycle = (graph: DirectedGraph) => {
  return graph.vertices.reduce((g, vertex) => {
    if (g.vertices.includes(vertex)) {
      return g;
    }
    const [subgraph, cycle] = graph.subgraphOf(vertex);

    return g.union(correctSubgraph(subgraph, cycle));
  }, emptyDirectedGraph());
};

export const makeIssueGraph = (issues: IssueModel[], relations: Relation[]) => {
  const graphWithIssues = issues.reduce((graph, issue) => {
    return graph.addVertex(issue.key);
  }, emptyDirectedGraph());

  const issueKeys = new Set(graphWithIssues.vertices);

  const issueGraph = relations.reduce((graph, relation) => {
    if (!issueKeys.has(relation.inwardIssue) || !issueKeys.has(relation.outwardIssue)) {
      return graph;
    }
    let edited = graph.addVertex(relation.inwardIssue);
    edited = edited.addVertex(relation.outwardIssue);
    return edited.directTo(relation.inwardIssue, relation.outwardIssue);
  }, graphWithIssues);

  return removeCycle(issueGraph);
};
