import { Size } from "@/type";
import { D3Node, IssueHierarchyData, IssueNode } from "./type";

interface Configuration {
  nodeSize: Size;
}

const buildIssueNode = function buildIssueNode(node: IssueNode, configuration: Configuration) {
  node.attr("transform", (d) => `translate(${d.y},${d.x})`);

  node
    .append("rect")
    .attr("class", "issue-node-outer")
    .attr("stroke-size", 1)
    .attr("width", configuration.nodeSize.width)
    .attr("height", configuration.nodeSize.height)
    .attr("rx", 4.0)
    .attr("ry", 4.0);

  node
    .append("text")
    .attr("class", "issue-summary")
    .attr("dy", 24)
    .attr("dx", 48)
    .text((d) => d.data.summary);
};

export const buildIssueTree = function buildIssueTree(
  container: D3Node<any>,
  data: IssueHierarchyData,
  configuration: Configuration
) {
  const issueNode = container
    .append("g")
    .attr("stroke-linejoin", "round")
    .attr("stroke-width", 3)
    .selectAll("g")
    .data(data.descendants())
    .join("g");

  buildIssueNode(issueNode, configuration);

  return issueNode;
};

/**
   <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:bx="https://boxy-svg.com">
   <rect x="152.044" y="118.398" width="156" height="60" style="stroke: rgb(0, 0, 0); fill: rgb(255, 255, 255);" rx="3.833" ry="3.833"></rect>
   <desc>Author: https://pixabay.com/users/Ly-HN-17242598
   License: https://pixabay.com/service/terms/#license
   </desc>
   </image>
   <text style="fill: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 10px; white-space: pre;" x="171.951" y="135.085">test name in card</text>
   <text style="fill: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 10px; white-space: pre;" x="159.71" y="162.268">EX-12345</text>
   <text style="fill: rgb(51, 51, 51); font-family: &quot;Fira Code&quot;; font-size: 10px; white-space: pre;" x="216.78" y="161.842">In progress</text>
   </svg>
*/
