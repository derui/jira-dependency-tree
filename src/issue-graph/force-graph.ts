import { emptyGraph, Graph } from "@/depgraph";
import { Issue } from "@/model/issue";
import * as d3 from "d3";
import { buildIssueGraph } from "./issue";
import { Configuration, D3Node, IssueLink, LeveledIssue as LeveledIssue } from "./type";

const MAX_LEVEL = 100;

const makeIssueGraph = function makeIssueGraph(issues: Issue[]) {
  let issueGraph = issues.reduce((graph, issue) => {
    return graph.addVertex(issue.key);
  }, emptyGraph());

  issueGraph = issues.reduce((graph, issue) => {
    return issue.outwardIssueKeys.reduce((graph, key) => graph.directTo(issue.key, key), graph);
  }, issueGraph);

  return issueGraph;
};

const makeLeveledIssues = function makeLeveledIssues(graph: Graph, issues: Issue[]) {
  const issueMap = issues.reduce((accum, issue) => {
    accum.set(issue.key, issue);
    return accum;
  }, new Map<string, Issue>());
  const accum: LeveledIssue[] = [];

  for (let i = 0; i < MAX_LEVEL; i += 1) {
    const level = graph.levelAt(i);
    if (!level.length) {
      break;
    }

    level.forEach((v) => {
      accum.push({ issue: issueMap.get(v)!, level: i });
    });
  }

  return accum;
};

const makeLinkData = function makeLinkData(graph: Graph, issues: LeveledIssue[]) {
  const issueMap = issues.reduce((accum, issue) => {
    accum.set(issue.issue.key, issue);
    return accum;
  }, new Map<string, LeveledIssue>());

  return graph.vertices.reduce((accum, v) => {
    graph.adjacent(v).forEach((adjacent) => {
      accum.push({ source: issueMap.get(v)!, target: issueMap.get(adjacent)! });
    });
    return accum;
  }, [] as { source: LeveledIssue; target: LeveledIssue }[]);
};

export const makeForceGraph = function makeForceGraph(
  container: D3Node<any>,
  issues: Issue[],
  configuration: Configuration
) {
  const issueGraph = makeIssueGraph(issues);
  const leveledIssues = makeLeveledIssues(issueGraph, issues);
  const linkData = makeLinkData(issueGraph, leveledIssues);

  // make link between issues
  const links = container
    .selectAll(".issue-link")
    .data(linkData)
    .enter()
    .append("line")
    .attr("class", (d) => {
      return `issue-link-${d.source.issue.key}-${d.target.issue.key}`;
    })
    .attr("stroke", "#000")
    .attr("stroke-weight", 1)
    .attr("marker-end", "url(#arrowhead)");

  // build issue graphs
  const issueNodes = buildIssueGraph(container, leveledIssues, configuration);

  // define ticked event handler
  const ticked = function ticked() {
    issueNodes.attr("transform", (d) => {
      const x = d.level * (configuration.nodeSize.width + 50);
      // update positions for link calculation
      d.x = x;

      return `translate(${x},${d.y})`;
    });

    // link draw right-most center to left-most center of next issue.
    links
      .attr("x1", (d) => d.source.x! + configuration.nodeSize.width)
      .attr("y1", (d) => d.source.y! + configuration.nodeSize.height / 2)
      .attr("x2", (d) => d.target.x!)
      .attr("y2", (d) => d.target.y! + configuration.nodeSize.height / 2);
  };

  // force between nodes
  const simulation = d3
    .forceSimulation<LeveledIssue>()
    .nodes(leveledIssues)
    .on("tick", ticked)
    .force(
      "link",
      d3
        .forceLink<LeveledIssue, IssueLink>(linkData)
        .id((d) => d.issue.key)
        .distance(30)
    )
    .force("center", d3.forceY(configuration.canvasSize.height / 2))
    .force("charge", d3.forceManyBody().strength(-10))
    .force("collision", d3.forceCollide(configuration.nodeSize.width / 2))
    .velocityDecay(0.5);

  // define initial position
  simulation.nodes().forEach((d) => {
    d.x = d.level * (configuration.nodeSize.width + 50);
  });
};
