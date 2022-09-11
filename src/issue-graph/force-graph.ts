import { emptyGraph, Graph } from "@/depgraph/main";
import { Issue } from "@/model/issue";
import { Project } from "@/model/project";
import * as d3 from "d3";
import { buildIssueGraph } from "@/issue-graph/issue";
import { Configuration, D3Node, IssueLink, LeveledIssue as LeveledIssue } from "@/issue-graph/type";

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
  project: Project,
  configuration: Configuration
) {
  const issueGraph = makeIssueGraph(issues);
  const leveledIssues = makeLeveledIssues(issueGraph, issues);
  const linkData = makeLinkData(issueGraph, leveledIssues);

  const curve = d3.line().curve(d3.curveBasis);

  // make link between issues
  const links = container
    .selectAll(".issue-link")
    .data(linkData)
    .enter()
    .append("path")
    .attr("class", "issue-link")
    .attr("stroke", "#000")
    .attr("stroke-weight", 1)
    .attr("marker-end", "url(#arrowhead)");

  // build issue graphs
  const issueNodes = buildIssueGraph(container, leveledIssues, project, configuration);

  // define ticked event handler
  const ticked = function ticked() {
    issueNodes.attr("transform", (d) => {
      const x = d.level * (configuration.nodeSize.width + 50);
      const y = (d.level % 2) * (configuration.nodeSize.height + 25);
      // update positions for link calculation
      d.x = x;
      d.y = y;

      return `translate(${x},${d.y})`;
    });

    // link draw right-most center to left-most center of next issue.
    links.attr("d", (d) => {
      const startX = d.source.x! + configuration.nodeSize.width;
      const endY = d.target.y! + configuration.nodeSize.height / 2;
      const betweenDistanceX = d.target.x! - startX;
      const pointData: [number, number][] = [
        [startX, d.source.y! + configuration.nodeSize.height / 2],
        [startX + betweenDistanceX * 0.5, endY],
        [d.target.x!, endY],
      ];

      return curve(pointData);
    });
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
