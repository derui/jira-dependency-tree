import { Project } from "@/model/project";
import { StatusCategory } from "@/type";
import { Configuration, D3Node, IssueNode, LeveledIssue } from "@/issue-graph/type";

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
    .append("text")
    .attr("class", "issue-node__status")
    .attr("dy", 48)
    .attr("dx", 8)
    .attr("filter", (d) => {
      const status = project.findStatusBy(d.issue.statusId);
      switch (status?.statusCategory) {
        case StatusCategory.TODO:
          return "url(#todo-bg)";
        case StatusCategory.IN_PROGRESS:
          // secondary-1-1
          return "url(#in-progress-bg)";
        case StatusCategory.DONE:
          return "url(#done-bg)";
        default:
          break;
      }

      return null;
    })
    .text((d) => {
      const status = project.findStatusBy(d.issue.statusId);
      return status?.name ?? "";
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
