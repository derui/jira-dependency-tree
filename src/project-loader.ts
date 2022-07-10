import { Project } from "./model/project";

// A simple project loader
export type ProjectLoader = (key: string) => Promise<Project>;
