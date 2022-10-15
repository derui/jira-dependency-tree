import { emptyGraph, Graph } from "@/depgraph/main";
import { Issue } from "@/model/issue";
import { Project } from "@/model/project";
import * as d3 from "d3";
import { buildIssueGraph } from "@/issue-graph/issue";
import { Configuration, D3Node, IssueLink, LayoutedLeveledIssue } from "@/issue-graph/type";
import { calculateLayouts } from "./issue-layout";
import { Position, Size } from "@/type";

const makeIssueGraph = function makeIssueGraph(issues: Issue[]) {
  const issueGraph = issues.reduce((graph, issue) => {
    const edited = graph.addVertex(issue.key);
    return issue.outwardIssueKeys.reduce((graph, key) => graph.directTo(issue.key, key), edited);
  }, emptyGraph());

  return issueGraph;
};

const makeLeveledIssues = function makeLeveledIssues(graph: Graph, issues: Issue[], nodeSize: Size) {
  const issueMap = issues.reduce((accum, issue) => {
    accum.set(issue.key, issue);
    return accum;
  }, new Map<string, Issue>());

  const { graphs, orphans } = calculateLayouts(graph, nodeSize);
  let basePosition: Position = { x: 0, y: 0 };
  const groupedIssues: LayoutedLeveledIssue[][] = [];

  for (const layout of graphs) {
    const layoutedIssues = layout.vertices.map(({ vertex, baseX: x, baseY: y, ...rest }) => {
      return {
        issueKey: vertex,
        issue: issueMap.get(vertex),
        ...rest,
        baseX: x + basePosition.x,
        baseY: y + basePosition.y,
      };
    });

    groupedIssues.push(layoutedIssues);
    basePosition = { x: basePosition.x, y: basePosition.y + layout.size.height + nodeSize.height };
  }

  if (orphans) {
    const layoutedIssues = orphans.vertices.map(({ vertex, baseX: x, baseY: y, ...rest }) => {
      return {
        issueKey: vertex,
        issue: issueMap.get(vertex),
        ...rest,
        baseX: x - orphans.size.width - nodeSize.width * 2,
        baseY: y,
      };
    });

    groupedIssues.push(layoutedIssues);
  }

  return groupedIssues;
};

const makeLinkData = function makeLinkData(graph: Graph, issues: LayoutedLeveledIssue[][]) {
  const issueMap = issues.flat().reduce((accum, issue) => {
    accum.set(issue.issueKey, issue);
    return accum;
  }, new Map<string, LayoutedLeveledIssue>());

  return graph.vertices.reduce<IssueLink[]>((accum, v) => {
    const source = issueMap.get(v);
    if (!source) {
      return accum;
    }

    graph.adjacent(v).forEach((adjacent) => {
      const target = issueMap.get(adjacent);

      if (!target) return;

      accum.push({ source, target });
    });
    return accum;
  }, []);
};

export const makeForceGraph = function makeForceGraph(
  container: D3Node<any>,
  issues: Issue[],
  project: Project,
  configuration: Configuration
) {
  const issueGraph = makeIssueGraph(issues);
  const leveledIssues = makeLeveledIssues(issueGraph, issues, configuration.nodeSize);
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
      return `translate(${d.x},${d.y})`;
    });

    // link draw right-most center to left-most center of next issue.
    links.attr("d", (d) => {
      const startX = d.source.x! + configuration.nodeSize.width;
      const startY = d.source.y! + configuration.nodeSize.height / 2;
      const endY = d.target.y! + configuration.nodeSize.height / 2;
      const betweenDistanceX = d.target.x! - startX;
      const betweenDistanceY = Math.abs(startY - endY);
      let yAxis = -1;
      if (startY >= endY) {
        yAxis = 1;
      }

      const pointData: [number, number][] = [
        [startX, startY],
        [startX + betweenDistanceX * 0.3, startY],
        [startX + betweenDistanceX * 0.5, endY + yAxis * betweenDistanceY * 0.5],
        [startX + betweenDistanceX * 0.7, endY],
        [d.target.x!, endY],
      ];

      return curve(pointData);
    });
  };

  // force between nodes
  leveledIssues.forEach((issueUnit) => {
    const simulation = d3
      .forceSimulation<LayoutedLeveledIssue>()
      .nodes(issueUnit)
      .on("tick", ticked)
      .force(
        "fx",
        d3.forceX<LayoutedLeveledIssue>().x((d) => d.baseX)
      )
      .force(
        "fy",
        d3.forceY<LayoutedLeveledIssue>().y((d) => d.baseY)
      );
    // define initial position
    simulation.nodes().forEach((d) => {
      d.x = d.level * (configuration.nodeSize.width * 1.75);
      d.y =
        (d.level % 2) * (configuration.nodeSize.height + 25) * (configuration.nodeSize.height + 25) * d.indexInLevel;
    });
  });
};
