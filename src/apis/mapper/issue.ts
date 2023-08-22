import { Issue } from "@/model/issue";
import { IssueKey } from "@/type";

/**
 * map API response to issue.
 */
export const mapResponse = (body: { [k: string]: unknown }[]): Issue[] => {
  const subtasks = body
    .map((b) => {
      return (b.subtasks as string[]).map((subtask: string) => {
        return { parent: b.key as string, subtask };
      });
    })
    .flat();

  const issues = body.map((b) => {
    return {
      key: b.key as string,
      summary: b.summary as string,
      description: b.description ?? "",
      status: b.status,
      type: b.type,
      selfUrl: b.selfUrl ?? "",
      relations: (b.links as { inwardIssue: string; id: string; outwardIssue: string }[]).map((v) => ({
        ...v,
      })),
      subIssues: [] as IssueKey[],
    } as Issue;
  });

  return mergeTasks(issues, subtasks);
};

const mergeTasks = (issues: Issue[], subtasks: { parent: string; subtask: string }[]): Issue[] => {
  const map = new Map<string, Issue>(issues.map((v) => [v.key, v]));

  for (const { parent, subtask } of subtasks) {
    const subtaskRelatedIssue = map.get(subtask);

    if (subtaskRelatedIssue) {
      subtaskRelatedIssue.parentIssue = parent;
    }

    const _parent = map.get(parent);
    if (_parent) {
      _parent.subIssues.push(subtask);
    }
  }

  return Array.from(map.values());
};
