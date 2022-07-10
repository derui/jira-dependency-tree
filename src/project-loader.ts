import { Project } from "./model/project";

// A simple project loader
export type ProjectLoader = (userDomain: string, key: string) => Promise<Project>;
