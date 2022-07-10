import { Issue } from "./model/issue";
import { Project } from "./model/project";

// type of issue loader.
export type IssueLoader = (project: Project) => Promise<Issue[]>;
