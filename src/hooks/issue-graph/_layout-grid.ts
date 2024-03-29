import { produce } from "immer";
import { DirectedGraph } from "@/libs/depgraph/main";
import { filterUndefined } from "@/utils/basic";

type VertexWithLevel = {
  readonly vertex: string;
  readonly level: number;
};

const empty: unique symbol = Symbol("empty");
const vertex: unique symbol = Symbol("vertex");

type Empty = { kind: typeof empty };
type Vertex = { kind: typeof vertex; vertex: string };
type Placement = Empty | Vertex;

export type T = {
  /**
   * place vertices to grid. return new instance of [T]
   */
  placeDirectedWith(from: VertexWithLevel, to: VertexWithLevel): T;

  /**
   * place vertex on the level
   */
  place(v: VertexWithLevel): T;

  /**
   * get vertex of position specified
   */
  position(col: number, row: number): string | undefined;

  /**
   * align each rows as square grid.
   */
  alignAsSquareGrid(): T;

  /**
   * layouted grid
   */
  readonly layout: ReadonlyArray<ReadonlyArray<Placement>>;
};

export const isEmpty = function isEmpty(obj: Placement): obj is Empty {
  return obj.kind == empty;
};

/**
 * return new layout grid.
 */
const newLayoutGrid = function newLayoutGrid(layout: T["layout"]): T {
  const layoutedVertices = new Set(
    layout
      .map((v) => {
        return v.map((v) => {
          switch (v.kind) {
            case empty:
              return;
            case vertex:
              return v.vertex;
          }
        });
      })
      .flat()
      .filter(filterUndefined),
  );

  return {
    position(col, row) {
      const v = layout[col][row];

      switch (v.kind) {
        case empty:
          return;
        case vertex:
          return v.vertex;
      }
    },

    place(v) {
      const { vertex: _vertex, level } = v;

      const edited = produce(layout, (draft) => {
        if (!layoutedVertices.has(_vertex)) {
          draft[level].push({ kind: vertex, vertex: _vertex });
          layoutedVertices.add(_vertex);
        }
      });

      return newLayoutGrid(edited);
    },

    placeDirectedWith(from, to) {
      const { vertex: fromV, level: fromL } = from;
      const { vertex: toV, level: toL } = to;

      if (fromV === toV || fromL >= toL) {
        throw new Error(`Invalid place call: from=${JSON.stringify(from)}, to=${JSON.stringify(to)}`);
      }

      const edited = produce(layout, (draft) => {
        // get largest depth in current layout
        let maximumDepth = 0;
        let needFillBetweenLevels = false;
        for (let i = fromL + 1; i < toL; i++) {
          maximumDepth = Math.max(draft[i].length, maximumDepth);
        }

        if (!layoutedVertices.has(fromV)) {
          maximumDepth = Math.max(draft[fromL].length, maximumDepth);
          needFillBetweenLevels = true;
        }

        if (!layoutedVertices.has(toV)) {
          maximumDepth = Math.max(draft[toL].length, maximumDepth);
          needFillBetweenLevels = true;
        }

        // fill gap with empty
        if (!layoutedVertices.has(fromV)) {
          draft[fromL].push(...Array(Math.max(0, maximumDepth - draft[fromL].length)).fill({ kind: empty }));
          draft[fromL].push({ kind: vertex, vertex: fromV });
          layoutedVertices.add(fromV);
        }

        if (!layoutedVertices.has(toV)) {
          draft[toL].push(...Array(Math.max(0, maximumDepth - draft[toL].length)).fill({ kind: empty }));
          draft[toL].push({ kind: vertex, vertex: toV });
          layoutedVertices.add(toV);
        }

        if (!needFillBetweenLevels) {
          return;
        }

        // Fill in the empty if the levels are not different by one
        for (let l = fromL + 1; l < toL; l++) {
          draft[l].push(...Array(Math.max(1, maximumDepth - draft[l].length + 1)).fill({ kind: empty }));
        }
      });

      return newLayoutGrid(edited);
    },

    alignAsSquareGrid() {
      const edited = produce(layout, (draft) => {
        let maximumRow = 0;
        for (const col of draft) {
          maximumRow = Math.max(maximumRow, col.length);
        }

        // fill empty to each rows of column
        for (let i = 0; i < draft.length; i++) {
          draft[i].push(...Array(Math.max(0, maximumRow - draft[i].length)).fill({ kind: empty }));
        }
      });

      return newLayoutGrid(edited);
    },

    layout,
  } satisfies T;
};

/**
 * get new layout grid from graph
 */
export const make = function make(graph: DirectedGraph): T {
  const largestDepth = graph.maxDepth();

  const layout = Array.from(Array(largestDepth), () => []);

  return newLayoutGrid(layout);
};
