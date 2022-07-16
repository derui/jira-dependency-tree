import { Issue } from "@/model/issue";
import { BaseType, HierarchyPointNode, Selection } from "d3";

// The type of data in issue graph
export type IssueHierarchyData = HierarchyPointNode<Issue>;

// The type of common node object in issue graph
export type D3Node<T extends BaseType = null> = Selection<T, undefined, null, undefined>;

// The type of issueNode
export type IssueNode = Selection<BaseType | SVGElement, IssueHierarchyData, SVGElement, undefined>;
