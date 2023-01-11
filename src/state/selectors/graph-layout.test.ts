import test from "ava";
import type { RootState } from "../store";
import * as s from "./graph-layout";
import { GraphLayout } from "@/issue-graph/type";

test("need test", (t) => {
  const state = {
    graphLayout: { graphLayout: GraphLayout.Horizontal },
  } as RootState;

  const ret = s.getGraphLayout()(state);

  t.is(ret, GraphLayout.Horizontal);
});
