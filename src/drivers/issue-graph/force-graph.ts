import * as d3 from "d3";
import type { BaseType } from "d3";
import { calculateLayouts, LayoutedGraph } from "./issue-layout";
import { buildTooltip } from "./tooltip";
import { buildIssueGraph } from "./issue";
import {
  Configuration,
  D3Node,
  IssueLink,
  GraphLayout,
  LayoutedLeveledIssue,
  TreeFrame,
  LayoutedLeveledIssueUnit,
} from "./type";
import { CycleDetection, emptyDirectedGraph, DirectedGraph } from "@/drivers/depgraph/main";
import { Issue, selectOutwardIssues } from "@/model/issue";
import { Position, Size } from "@/type";
import { Rect } from "@/util/basic";

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

const makeIssueGraph = (issues: Issue[]) => {
  const issueGraph = issues.reduce((graph, issue) => {
    const edited = graph.addVertex(issue.key);
    return selectOutwardIssues(issue).reduce((graph, key) => graph.directTo(issue.key, key), edited);
  }, emptyDirectedGraph());

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

const makeLeveledIssues = (
  graph: DirectedGraph,
  issues: Issue[],
  nodeSize: Size,
  direction: GraphLayout,
): { units: LayoutedLeveledIssueUnit[]; orphan?: LayoutedLeveledIssueUnit } => {
  const issueMap = new Map<string, Issue>(issues.map((v) => [v.key, v]));

  const { graphs, orphans } = calculateLayouts(graph, nodeSize);
  let basePosition: Position = { x: 0, y: 0 };
  const leveledIssueUnits: LayoutedLeveledIssueUnit[] = [];

  for (const layout of graphs) {
    const issues = layout.vertices.map(({ vertex, baseX: x, baseY: y, ...rest }) => {
      return {
        issueKey: vertex,
        issue: issueMap.get(vertex),
        subIssues: issueMap.get(vertex)?.subIssues ?? [],
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
        subIssues: issueMap.get(vertex)?.subIssues ?? [],
        ...rest,
        baseX: x - orphans.size.width - nodeSize.width * 2,
        baseY: y,
      };
    });

    return {
      units: leveledIssueUnits,
      orphan: {
        issues: layoutedIssues,
        unitRect: new Rect({
          top: 0,
          left: -1 * (orphans.size.width + nodeSize.width * 2),
          right: -1 * nodeSize.width * 2,
          bottom: orphans.size.height,
        }),
      },
    };
  }

  return { units: leveledIssueUnits };
};

const makeLinkData = (graph: DirectedGraph, issues: LayoutedLeveledIssue[]) => {
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

const buildIssueTreeFrame = (container: D3Node<SVGSVGElement>): TreeFrame => {
  const FrameSize = {
    padding: 16,
  };

  const frame = container.append("svg:g").selectAll<BaseType, LayoutedLeveledIssueUnit>("rect");

  frame
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

  return frame;
};

const makeOrphanUnitSimulation = (
  issueUnit: LayoutedLeveledIssueUnit,
  configuration: Configuration,
  ticked: () => void,
) => {
  const simulation = d3
    .forceSimulation<LayoutedLeveledIssue>()
    .nodes(issueUnit.issues)
    .on("tick", ticked)
    .force(
      "fx",
      d3.forceX<LayoutedLeveledIssue>().x((d) => d.baseX),
    )
    .force("charge", d3.forceManyBody().strength(-100))
    .force(
      "collision",
      d3.forceCollide().radius(Math.max(configuration.nodeSize.height, configuration.nodeSize.width) / 2),
    );

  // define initial position
  simulation.nodes().forEach((d) => {
    d.x = d.level * (configuration.nodeSize.width * 1.75);
    d.y = (d.level % 2) * (configuration.nodeSize.height + 25) * (configuration.nodeSize.height + 25) * d.indexInLevel;
  });

  return simulation;
};

export type GraphRestarter = (issues: Issue[], configuration: Configuration) => void;

export const makeForceGraph = (
  container: D3Node<SVGSVGElement>,
  issues: Issue[],
  configuration: Configuration,
): GraphRestarter => {
  let issueGraph = makeIssueGraph(issues);
  let leveledIssueUnits = makeLeveledIssues(issueGraph, issues, configuration.nodeSize, configuration.graphLayout);
  let leveledIssues = leveledIssueUnits.units
    .map(({ issues }) => issues)
    .flat()
    .concat(leveledIssueUnits.orphan?.issues ?? []);
  let linkData = makeLinkData(issueGraph, leveledIssues);

  const curve = d3.line().curve(d3.curveBasis);
  const tooltip = buildTooltip();

  let focusingANode = false;
  let doNotPreventFocusingANode: "startDragging" | "shouldPrevent" | "notDragging" = "notDragging";

  // make link between issues
  let links: d3.Selection<SVGPathElement, IssueLink, BaseType, undefined> = container.append("svg:g").selectAll("path");

  // build issue graphs
  const [_issueNode, issueNodeRestarter] = buildIssueGraph(container, configuration);
  let issueNode = _issueNode;

  // build frame for issue group
  let treeFrame = buildIssueTreeFrame(container);

  // define ticked event handler
  const ticked = function ticked() {
    issueNode.attr("transform", (d) => {
      return `translate(${d.baseX},${d.y})`;
    });

    // link draw right-most center to left-most center of next issue.
    links.attr("d", (d) => {
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      const startX = d.source.baseX! + configuration.nodeSize.width;
      const startY = d.source.y! + configuration.nodeSize.height / 2;
      const endY = d.target.y! + configuration.nodeSize.height / 2;
      const betweenDistanceX = d.target.baseX! - startX;
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
        [d.target.baseX!, endY],
      ];

      /* eslint-enable @typescript-eslint/no-non-null-assertion */
      return curve(pointData);
    });
  };

  const makeSimulation = (issueUnit: LayoutedLeveledIssueUnit, links: IssueLink[]) => {
    const linkForForce = links
      .map((link) => {
        return {
          source: link.source.issueKey,
          target: link.target.issueKey,
        };
      })
      .filter(({ source, target }) => issueUnit.issues.some((v) => v.issueKey === source || v.issueKey === target));

    const simulation = d3
      .forceSimulation<LayoutedLeveledIssue>()
      .nodes(issueUnit.issues)
      .on("tick", ticked)
      .force("collide", d3.forceCollide(Math.max(configuration.nodeSize.height, configuration.nodeSize.width) / 2))
      .force("center", d3.forceCenter(issueUnit.unitRect.left, issueUnit.unitRect.top))
      .force(
        "link",
        d3
          .forceLink()
          .links(linkForForce)
          .id((d) => (d as LayoutedLeveledIssue).issueKey)
          .distance(configuration.nodeSize.width * 0.75),
      );

    // define initial position
    simulation.nodes().forEach((d) => {
      d.fx = d.level * (configuration.nodeSize.width * 1.75);
      d.y =
        (d.level % 2) * (configuration.nodeSize.height + 25) * (configuration.nodeSize.height + 25) * d.indexInLevel;
    });

    return simulation;
  };

  // force between nodes
  let simulations = leveledIssueUnits.units.map((unit) => makeSimulation(unit, linkData));
  if (leveledIssueUnits.orphan) {
    simulations.push(makeOrphanUnitSimulation(leveledIssueUnits.orphan, configuration, ticked));
  }

  const restart = () => {
    links = links.data(linkData);

    // update existing links
    links
      .classed("stroke-primary-100", (d) => !!d.relatedFocusingIssue)
      .classed("stroke-lightgray-alpha", (d) => !d.relatedFocusingIssue && focusingANode)
      .classed("z-10", (d) => !!d.relatedFocusingIssue)
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
      .attr("class", "issue-link fill-none")
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

    treeFrame = treeFrame.data(leveledIssueUnits.units);

    issueNode = issueNodeRestarter(leveledIssues);

    issueNode
      .selectAll<d3.BaseType, LayoutedLeveledIssue>(".graph-issue__sub-issue-notification")
      .on("click", (event, d) => {
        event.stopPropagation();

        configuration.dispatchAction({ kind: "ExpandSelectedIssue", key: d.issueKey });
      });

    // update links are related clicked issue
    issueNode
      .on("click", (event, d) => {
        event.stopPropagation();

        configuration.dispatchAction({ kind: "SelectIssue", key: d.issueKey });
      })
      .on("mouseenter", (event, d) => {
        focusingANode = true;
        const focusedIssues = new Set<string>([d.issueKey]);

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

        tooltip.show(event.target, d.issue);

        restart();
      })
      // reset focusing when click root canvas
      .on("mouseleave", () => {
        if (doNotPreventFocusingANode === "shouldPrevent") {
          doNotPreventFocusingANode = "notDragging";
        }

        focusingANode = false;

        linkData.forEach((link) => {
          link.relatedFocusingIssue = false;
        });

        leveledIssues.forEach((issue) => {
          issue.focusing = "initial";
        });

        tooltip.hide();

        restart();
      });
  };

  const graphRestarter = (issues: Issue[], configuration: Configuration) => {
    issueGraph = makeIssueGraph(issues);
    leveledIssueUnits = makeLeveledIssues(issueGraph, issues, configuration.nodeSize, configuration.graphLayout);
    leveledIssues = leveledIssueUnits.units
      .map(({ issues }) => issues)
      .flat()
      .concat(leveledIssueUnits.orphan?.issues ?? []);
    linkData = makeLinkData(issueGraph, leveledIssues);

    simulations.forEach((v) => v.stop());
    simulations = leveledIssueUnits.units.map((unit) => makeSimulation(unit, linkData));
    if (leveledIssueUnits.orphan) {
      simulations.push(makeOrphanUnitSimulation(leveledIssueUnits.orphan, configuration, ticked));
    }

    restart();
  };

  container.on("mousedown", () => {
    doNotPreventFocusingANode = "startDragging";
  });
  container.on("mousemove", () => {
    if (doNotPreventFocusingANode === "startDragging") {
      doNotPreventFocusingANode = "shouldPrevent";
    }
  });

  // call restart to apply a data
  restart();

  return graphRestarter;
};
