import { test, expect } from "vitest";
import type { RootState } from "../store";
import * as s from "./graph-layout";
import { GraphLayout } from "@/issue-graph/type";

test("need test", () => {
  const state = {
    graphLayout: { graphLayout: GraphLayout.Horizontal },
  } as RootState;

  const ret = s.getGraphLayout()(state);

  expect(ret).toBe(GraphLayout.Horizontal);
});
