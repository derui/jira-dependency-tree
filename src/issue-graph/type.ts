import { Issue } from "@/model/issue";
import { Size } from "@/type";
import { BaseType, Selection, SimulationNodeDatum } from "d3";

// The type of common node object in issue graph
export type D3Node<T extends BaseType = null> = Selection<T, undefined, null, undefined>;

// The type of issueNode
export type IssueNode = Selection<BaseType | SVGGElement, LeveledIssue, SVGGElement, undefined>;

export type LeveledIssue = {
  issue: Issue;
  level: number;
} & SimulationNodeDatum;

export type IssueLink = {
  source: LeveledIssue;
  target: LeveledIssue;
};

export interface Configuration {
  nodeSize: Size;

  canvasSize: Size;
}
