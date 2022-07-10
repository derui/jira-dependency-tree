import { Project } from "@/model/project";
import { ProjectLoader } from "@/project-loader";
import { IssueStatus, IssueStatusCategory, IssueType } from "@/type";
import { Version3Client } from "jira.js";
import { IssueTypeDetails, StatusCategory, StatusDetails } from "jira.js/out/version3/models";

const mapStatus = function mapStatus(status: StatusDetails): IssueStatus {
  return {
    id: status.id,
    name: status.name,
    categoryId: "",
  };
};

const mapStatusCategory = function mapStatusCategories(category: StatusCategory): IssueStatusCategory {
  return {
    id: category.id?.toString() ?? "",
    name: category.name ?? "",
    colorName: category.colorName ?? "",
  };
};

const mapIssueType = function mapIssueType(issueType: IssueTypeDetails): IssueType {
  return {
    id: issueType.id ?? "",
    name: issueType.name ?? "",
    avatarUrl: issueType.iconUrl ?? "",
  };
};

const createJiraProjectLoader = function createJiraProejctLoader(client: Version3Client): ProjectLoader {
  return async (projectKey) => {
    const project = await client.projects.getProject({ projectIdOrKey: projectKey });
    const statusCategories = await client.workflowStatusCategories.getStatusCategories();
    const statuses = await client.workflowStatuses.getStatuses();
    const issueTypes = await client.issueTypes.getIssueTypesForProject({
      projectId: Number(project.id),
    });

    return new Project({
      id: project.id,
      key: project.key,
      name: project.name,
      statuses: statuses.map(mapStatus),
      statusCategories: statusCategories.map(mapStatusCategory),
      issueTypes: issueTypes.map(mapIssueType),
    });
  };
};
