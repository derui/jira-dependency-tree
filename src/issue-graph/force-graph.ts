import * as d3 from "d3";
import { calculateLayouts, LayoutedGraph } from "./issue-layout";
import { emptyGraph, Graph } from "@/depgraph/main";
import { Issue } from "@/model/issue";
import { Project } from "@/model/project";
import { buildIssueGraph } from "@/issue-graph/issue";
import { Configuration, D3Node, IssueLink, GraphLayout, LayoutedLeveledIssue } from "@/issue-graph/type";
import { Position, Size } from "@/type";

const makeIssueGraph = (issues: Issue[]) => {
  const issueGraph = issues.reduce((graph, issue) => {
    const edited = graph.addVertex(issue.key);
    return issue.outwardIssueKeys.reduce((graph, key) => graph.directTo(issue.key, key), edited);
  }, emptyGraph());

  return issueGraph;
};

const getNextPositionBy = (position: Position, layout: LayoutedGraph, nodeSize: Size, direction: GraphLayout) => {
  switch (direction) {
    case GraphLayout.Horizontal:
      return { x: position.x + layout.size.width + nodeSize.width, y: position.y };
    case GraphLayout.Vertical:
      return { x: position.x, y: position.y + layout.size.height + nodeSize.height };
  }
};

const makeLeveledIssues = (graph: Graph, issues: Issue[], nodeSize: Size, direction: GraphLayout) => {
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
    basePosition = getNextPositionBy(basePosition, layout, nodeSize, direction);
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

const makeLinkData = (graph: Graph, issues: LayoutedLeveledIssue[]) => {
  const issueMap = issues.reduce((accum, issue) => {
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

export const makeForceGraph = (
  container: D3Node<any>,
  issues: Issue[],
  project: Project,
  configuration: Configuration,
): void => {
  const issueGraph = makeIssueGraph(issues);
  const leveledIssueUnits = makeLeveledIssues(issueGraph, issues, configuration.nodeSize, configuration.graphLayout);
  const leveledIssues = leveledIssueUnits.flat();
  const linkData = makeLinkData(issueGraph, leveledIssues);

  const curve = d3.line().curve(d3.curveBasis);

  let focusingANode = false;

  // make link between issues
  let links: d3.Selection<any, IssueLink, any, undefined> = container.append("svg:g").selectAll("path");

  // build issue graphs
  const [issueNode, issueNodeRestarter] = buildIssueGraph(container, leveledIssues, project, configuration);

  // define ticked event handler
  const ticked = function ticked() {
    issueNode.attr("transform", (d) => {
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
  leveledIssueUnits.forEach((issueUnit) => {
    const simulation = d3
      .forceSimulation<LayoutedLeveledIssue>()
      .nodes(issueUnit)
      .on("tick", ticked)
      .force(
        "fx",
        d3.forceX<LayoutedLeveledIssue>().x((d) => d.baseX),
      )
      .force(
        "fy",
        d3.forceY<LayoutedLeveledIssue>().y((d) => d.baseY),
      );
    // define initial position
    simulation.nodes().forEach((d) => {
      d.x = d.level * (configuration.nodeSize.width * 1.75);
      d.y =
        (d.level % 2) * (configuration.nodeSize.height + 25) * (configuration.nodeSize.height + 25) * d.indexInLevel;
    });
  });

  const restart = () => {
    links = links.data(linkData);

    // update existing links
    links
      .classed("--selected", (d) => !!d.relatedFocusingIssue)
      .classed("--unfocused", (d) => !d.relatedFocusingIssue && focusingANode)
      .attr("marker-end", (d) => {
        if (d.relatedFocusingIssue) {
          return "url(#selected-arrowhead)";
        } else if (focusingANode) {
          return "url(#unfocusing-arrowhead)";
        } else {
          return "url(#arrowhead)";
        }
      });
    // remove old links
    links.exit().remove();

    // append links with current selector
    links = links
      .enter()
      .append("path")
      .attr("class", "issue-link")
      .attr("stroke", "#000")
      .attr("stroke-weight", 1)
      .classed("--selected", (d) => !!d.relatedFocusingIssue)
      .classed("--unfocused", (d) => !d.relatedFocusingIssue && focusingANode)
      .attr("marker-end", (d) => {
        if (d.relatedFocusingIssue) {
          return "url(#selected-arrowhead)";
        } else {
          return "url(#arrowhead)";
        }
      })
      .merge(links);

    issueNodeRestarter(leveledIssues);
  };

  // update links are related clicked issue
  issueNode.on("click", (event, d) => {
    event.stopPropagation();

    focusingANode = true;
    const focusedIssues = new Set<string>();

    linkData.forEach((link) => {
      if (link.source.issueKey === d.issueKey || link.target.issueKey === d.issueKey) {
        link.relatedFocusingIssue = true;
        focusedIssues.add(link.source.issueKey);
        focusedIssues.add(link.target.issueKey);
      } else {
        link.relatedFocusingIssue = false;
      }
    });

    leveledIssues.forEach((issue) => {
      if (focusedIssues.has(issue.issueKey)) {
        issue.focusing = "focused";
      } else {
        issue.focusing = "unfocused";
      }
    });

    restart();
  });

  // reset focusing when click root canvas
  container.on("click", (event) => {
    event.stopPropagation();

    focusingANode = false;

    linkData.forEach((link) => {
      link.relatedFocusingIssue = false;
    });

    leveledIssues.forEach((issue) => {
      issue.focusing = "initial";
    });

    restart();
  });

  // call restart to apply a data
  restart();
};
