import { IssueLoader } from "./issue-loader";
import { ProjectLoader } from "./project-loader";
import { createDependencyRegistrar } from "./util/dependency-registrar";

type Dependencies = {
  issueLoader: IssueLoader;
  projectLoader: ProjectLoader;
};

export const dependencyRegistrar = createDependencyRegistrar<Dependencies>();
