import { IssueLoader } from "@/issue-loader";
import { Issue } from "@/model/issue";
import { Project } from "@/model/project";
import { filterUndefined } from "@/util/basic";
import { Version3Client } from "jira.js";
import { Issue as JiraIssue } from "jira.js/out/version3/models";

const mapJiraIssue = function mapJiraIssue(issue: JiraIssue): Issue {
  const outwardIssueKeys = issue.fields.issuelinks.map((v) => v.outwardIssue?.key).filter(filterUndefined);

  return {
    key: issue.key,
    summary: issue.fields.summary,
    description: issue.fields.description?.text || "",
    statusId: issue.fields.status.id || "",
    typeId: issue.fields.issuetype?.id || "",
    selfUrl: issue.self || "",
    outwardIssueKeys,
  };
};

const createJiraIssueLoader = function createJiraIssueLoader(client: Version3Client): IssueLoader {
  const loadRecursive = async function loadRecursive(project: Project, loadedIssues: Issue[]): Promise<Issue[]> {
    const jql = `project = ${project.key} AND sprint in openSprints()`;

    try {
      const result = await client.issueSearch.searchForIssuesUsingJql({ jql, startAt: loadedIssues.length });
      const issuesGot = result.issues ?? [];
      const newIssues = loadedIssues.concat(issuesGot.map(mapJiraIssue));

      if (newIssues.length >= (result.total ?? 0)) {
        return loadedIssues;
      }

      return loadRecursive(project, newIssues);
    } catch {
      return loadedIssues;
    }
  };

  return async (project) => {
    return await loadRecursive(project, []);
  };
};
