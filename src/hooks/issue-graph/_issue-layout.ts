import { produce } from "immer";
import * as LayoutGrid from "./_layout-grid";
import { DirectedGraph } from "@/libs/depgraph/main";
import { Size } from "@/type";
import { IssueModel } from "@/view-models/issue";
import { IssueModelWithLayout } from "@/view-models/graph-layout";
import { UndirectedGraph, fromDirectedGraph, isSameUndirectGraph } from "@/libs/depgraph/undirected";
import { filterUndefined } from "@/utils/basic";
import { Vertex } from "@/libs/depgraph/type";

export const ISSUE_SIZE: Size = { width: 200, height: 74 };
export const ISSUE_X_GAP = ISSUE_SIZE.width * 0.25;
export const ISSUE_Y_GAP = ISSUE_SIZE.height * 0.2;

// get subgraphs from a graph that contains whole issues
const getSubgraphs = (graph: DirectedGraph): DirectedGraph[] => {
  const rootUndirected = fromDirectedGraph(graph);

  return graph
    .levelAt(0)
    .reduce<Array<[UndirectedGraph, DirectedGraph]>>((accum, vertex) => {
      const [subgraph] = graph.subgraphOf(vertex);
      const undirectedSubgraph = rootUndirected.subgraphOf(vertex);

      return produce(accum, (draft) => {
        const idx = accum.findIndex(([ug]) => {
          return isSameUndirectGraph(undirectedSubgraph, ug);
        });

        if (idx === -1) {
          draft.push([undirectedSubgraph, subgraph]);
        } else {
          draft[idx][1] = draft[idx][1].union(subgraph);
        }
      });
    }, [])
    .map(([, sg]) => sg);
};

const getMaximumRowIndexOfGrid = (grid: ReadonlyArray<ReadonlyArray<unknown>>): number => {
  let maximumHeightIndex = 0;

  for (const col of grid) {
    // grid has empty element in some case
    if (!col) {
      continue;
    }

    maximumHeightIndex = Math.max(col.length, maximumHeightIndex);
  }

  return maximumHeightIndex;
};

const getHeightOfGrid = (grid: ReadonlyArray<ReadonlyArray<unknown>>): number => {
  const maximumRowIndex = getMaximumRowIndexOfGrid(grid);

  return maximumRowIndex * (ISSUE_Y_GAP + ISSUE_SIZE.height);
};

const layoutGridOfSubgraph = function layoutGridOfSubgraph(graph: DirectedGraph, issueMap: Map<string, IssueModel>) {
  const largestDepth = graph.maxDepth() - 1;
  let layout = LayoutGrid.make(graph);
  const levelMap = new Map<string, number>();

  // make layout grid of graph.
  for (let level = largestDepth; level >= 0; level--) {
    for (const v of graph.levelAt(level)) {
      levelMap.set(v, level);
    }
  }

  const dfs = (from: Vertex) => {
    for (const adj of graph.adjacent(from)) {
      layout = layout.placeDirectedWith(
        { level: levelMap.get(from)!, vertex: from },
        { level: levelMap.get(adj)!, vertex: adj },
      );

      dfs(adj);
    }
  };

  for (const vertex of graph.levelAt(0)) {
    if (!issueMap.has(vertex)) {
      continue;
    }

    if (graph.adjacent(vertex).length == 0) {
      layout = layout.place({ level: 0, vertex });
      continue;
    }

    dfs(vertex);
    layout = layout.alignAsSquareGrid();
  }

  return layout;
};

const gridToGraphLayout = function gridToGraphLayout(
  layout: LayoutGrid.T,
  issueMap: Map<string, IssueModel>,
  baseY: number,
  baseRowIndex: number,
): IssueModelWithLayout[] {
  return layout.layout
    .map((v, colIdx) => {
      return v.map((placement, rowIdx) => {
        if (LayoutGrid.isEmpty(placement)) {
          return;
        }
        const issueKey = placement.vertex;

        const issue = issueMap.get(issueKey);

        if (!issue) {
          throw Error(`Invalid path:key = ${issueKey}`);
        }

        return {
          issue,
          position: {
            x: colIdx * (ISSUE_X_GAP + ISSUE_SIZE.width),
            y: baseY + rowIdx * (ISSUE_Y_GAP + ISSUE_SIZE.height),
          },
          size: ISSUE_SIZE,
          meta: {
            rowIndex: rowIdx + baseRowIndex,
            colIndex: colIdx,
          },
        };
      });
    })
    .flat()
    .filter(filterUndefined);
};

/**
 * get issue layouts from graph
 */
export const calculateIssueLayout = (graph: DirectedGraph, issues: IssueModel[]) => {
  const issueMap = new Map(issues.map((v) => [v.key, v]));
  const subgraphs = getSubgraphs(graph).sort((v1, v2) => {
    return v2.vertices.length - v1.vertices.length;
  });

  let accumulatedGridHeight = 0;
  let baseRowIndex = 0;

  return subgraphs.flatMap((g) => {
    const grid = layoutGridOfSubgraph(g, issueMap);
    const layout = gridToGraphLayout(grid, issueMap, accumulatedGridHeight, baseRowIndex);

    accumulatedGridHeight += getHeightOfGrid(grid.layout);
    baseRowIndex += getMaximumRowIndexOfGrid(grid.layout);
    return layout;
  });
};
