import * as d3 from "d3";
import { BaseType } from "d3";
import { calculateLayouts, LayoutedGraph } from "./issue-layout";
import { CycleDetection, emptyGraph, Graph } from "@/depgraph/main";
import { Issue, selectOutwardIssues } from "@/model/issue";
import { Project } from "@/model/project";
import { buildIssueGraph } from "@/issue-graph/issue";
import { Configuration, D3Node, IssueLink, GraphLayout, LayoutedLeveledIssue } from "@/issue-graph/type";
import { Position, Size } from "@/type";
import { Rect } from "@/util/basic";

const correctSubgraph = (subgraph: Graph, cycle: CycleDetection) => {
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

const removeCycle = (graph: Graph) => {
  return graph.vertices.reduce((g, vertex) => {
    if (g.vertices.includes(vertex)) {
      return g;
    }
    const [subgraph, cycle] = graph.subgraphOf(vertex);

    return g.union(correctSubgraph(subgraph, cycle));
  }, emptyGraph());
};

const makeIssueGraph = (issues: Issue[]) => {
  const issueGraph = issues.reduce((graph, issue) => {
    const edited = graph.addVertex(issue.key);
    return selectOutwardIssues(issue).reduce((graph, key) => graph.directTo(issue.key, key), edited);
  }, emptyGraph());

  return removeCycle(issueGraph);
};

const getNextPositionBy = (position: Position, layout: LayoutedGraph, nodeSize: Size, direction: GraphLayout) => {
  switch (direction) {
    case GraphLayout.Horizontal:
      return { x: position.x + layout.size.width + nodeSize.width, y: position.y };
    case GraphLayout.Vertical:
      return { x: position.x, y: position.y + layout.size.height + nodeSize.height };
  }
};

type LayoutedLeveledIssueUnit = {
  issues: LayoutedLeveledIssue[];
  unitRect: Rect;
};

const makeLeveledIssues = (
  graph: Graph,
  issues: Issue[],
  nodeSize: Size,
  direction: GraphLayout,
): LayoutedLeveledIssueUnit[] => {
  const issueMap = issues.reduce((accum, issue) => {
    accum.set(issue.key, issue);
    return accum;
  }, new Map<string, Issue>());

  const { graphs, orphans } = calculateLayouts(graph, nodeSize);
  let basePosition: Position = { x: 0, y: 0 };
  const leveledIssueUnits: LayoutedLeveledIssueUnit[] = [];

  for (const layout of graphs) {
    const issues = layout.vertices.map(({ vertex, baseX: x, baseY: y, ...rest }) => {
      return {
        issueKey: vertex,
        issue: issueMap.get(vertex),
        ...rest,
        baseX: x + basePosition.x,
        baseY: y + basePosition.y,
      };
    });

    leveledIssueUnits.push({
      issues,
      unitRect: new Rect({
        top: basePosition.y,
        left: basePosition.x,
        right: basePosition.x + layout.size.width,
        bottom: basePosition.y + layout.size.height,
      }),
    });
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

    leveledIssueUnits.push({
      issues: layoutedIssues,
      unitRect: new Rect({
        top: 0,
        left: -1 * (orphans.size.width + nodeSize.width * 2),
        right: -1 * nodeSize.width * 2,
        bottom: orphans.size.height,
      }),
    });
  }

  return leveledIssueUnits;
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

const buildIssueTreeFrame = (
  container: D3Node<SVGSVGElement>,
  layoutedLeveledIssueUnits: LayoutedLeveledIssueUnit[],
) => {
  const FrameSize = {
    padding: 16,
  };

  container
    .append("svg:g")
    .selectAll("rect")
    .data(layoutedLeveledIssueUnits)
    .enter()
    .append("rect")
    .attr("width", (d) => d.unitRect.width + FrameSize.padding * 2)
    .attr("height", (d) => d.unitRect.height + FrameSize.padding * 2)
    .attr("x", (d) => d.unitRect.left - FrameSize.padding)
    .attr("y", (d) => d.unitRect.top - FrameSize.padding)
    .attr("rx", "4")
    .classed("fill-none", () => true)
    .classed("stroke-2", () => true)
    .classed("stroke-lightgray", () => true);
};

export const makeForceGraph = (
  container: D3Node<SVGSVGElement>,
  issues: Issue[],
  project: Project,
  configuration: Configuration,
): void => {
  const issueGraph = makeIssueGraph(issues);
  const leveledIssueUnits = makeLeveledIssues(issueGraph, issues, configuration.nodeSize, configuration.graphLayout);
  const leveledIssues = leveledIssueUnits.map(({ issues }) => issues).flat();
  const linkData = makeLinkData(issueGraph, leveledIssues);

  const curve = d3.line().curve(d3.curveBasis);

  let focusingANode = false;

  // make link between issues
  let links: d3.Selection<SVGPathElement, IssueLink, BaseType, undefined> = container.append("svg:g").selectAll("path");

  // build issue graphs
  const [issueNode, issueNodeRestarter] = buildIssueGraph(container, leveledIssues, project, configuration);

  // build frame for issue group
  buildIssueTreeFrame(container, leveledIssueUnits);

  // define ticked event handler
  const ticked = function ticked() {
    issueNode.attr("transform", (d) => {
      return `translate(${d.x},${d.y})`;
    });

    // link draw right-most center to left-most center of next issue.
    links.attr("d", (d) => {
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
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

      /* eslint-enable @typescript-eslint/no-non-null-assertion */
      return curve(pointData);
    });
  };

  // force between nodes
  leveledIssueUnits.forEach((issueUnit) => {
    const simulation = d3
      .forceSimulation<LayoutedLeveledIssue>()
      .nodes(issueUnit.issues)
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
      .classed("stroke-primary-100", (d) => !!d.relatedFocusingIssue)
      .classed("stroke-lightgray-alpha", (d) => !d.relatedFocusingIssue && focusingANode)
      .classed("stroke-darkgray", () => !focusingANode)
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
      .attr("class", "fill-none")
      .attr("stroke-weight", 1)
      .classed("stroke-primary-100", (d) => !!d.relatedFocusingIssue)
      .classed("stroke-lightgray-alpha", (d) => !d.relatedFocusingIssue && focusingANode)
      .classed("stroke-darkgray", () => !focusingANode)
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
