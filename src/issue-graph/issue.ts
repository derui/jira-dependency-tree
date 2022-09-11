import { Project } from "@/model/project";
import { StatusCategory } from "@/type";
import { Configuration, D3Node, IssueNode, LeveledIssue } from "@/components/type";

const buildIssueNode = function buildIssueNode(node: IssueNode, project: Project, configuration: Configuration) {
  node
    .append("rect")
    .attr("class", "issue-node-outer")
    .attr("stroke-size", 1)
    .attr("width", configuration.nodeSize.width)
    .attr("height", configuration.nodeSize.height)
    .attr("rx", 4.0)
    .attr("ry", 4.0);

  // issue key
  node
    .append("text")
    .attr("class", "issue-key")
    .attr("dy", 16)
    .attr("dx", 8)
    .text((d) => d.issue.key);

  // issue summary
  node
    .append("text")
    .attr("class", "issue-summary")
    .attr("dy", 32)
    .attr("dx", 8)
    .text((d) => d.issue.summary);

  // issue status
  node
    .append("rect")
    .attr("class", "issue-node__status")
    .attr("stroke-size", 0)
    .attr("width", 32)
    .attr("height", 16)
    .attr("x", 8)
    .attr("y", "4em")
    .attr("fill", (d) => {
      const status = project.findStatusBy(d.issue.statusId);
      switch (status?.statusCategory) {
        case StatusCategory.TODO:
          // secondary-2-1
          return "#d6efa2";
        case StatusCategory.IN_PROGRESS:
          // secondary-1-1
          return "lightgray";
        case StatusCategory.DONE:
          // complement-1-1
          return "#9PCF8D";
        default:
          break;
      }

      return null;
    });
};

export const buildIssueGraph = function buildIssueGraph(
  container: D3Node<any>,
  data: LeveledIssue[],
  project: Project,
  configuration: Configuration
) {
  const issueNode = container
    .selectAll("g")
    .data(data)
    .join("g")
    .attr("class", "graph-issue")
    .on("click", (_, d) => {
      const url = new URL(d.issue.selfUrl);
      window.open(`${url.origin}/browse/${d.issue.key}`, "_blank");
    });

  buildIssueNode(issueNode, project, configuration);

  return issueNode;
};
