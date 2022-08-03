import { createJiraIssueLoader } from "@/infrastructure/jira-issue-loader";
import { createJiraProjectLoader } from "@/infrastructure/jira-project-loader";
import { Issue } from "@/model/issue";
import { Project } from "@/model/project";
import { filterUndefined } from "@/util/basic";
import { Driver } from "@cycle/run";
import { Version3Client } from "jira.js";
import xs, { Stream } from "xstream";

// An interface for ProjectUpdater
export type JiraLoaderSources = {
  project: Stream<Project>;
  issues: Stream<Issue[]>;
};

export type JiraLoaderSinks = {
  authorization?: {
    host: string;
    user: string;
    credential: string;
  };
  issueLoad?: string;
  projectLoad?: string;
};

// factory function for ProjectUpdater
export const createJiraLoader = function createJiraLoader(): Driver<Stream<JiraLoaderSinks>, JiraLoaderSources> {
  return (sinks$) => {
    const client$ = sinks$
      .map((v) => v.authorization)
      .filter(filterUndefined)
      .map(({ host, user, credential }) => {
        return new Version3Client({
          host,
          authentication: {
            basic: {
              email: user,
              apiToken: credential,
            },
          },
        });
      });
    const projectLoad$ = sinks$.map((v) => v.projectLoad).filter(filterUndefined);
    const issueLoad$ = sinks$.map((v) => v.issueLoad).filter(filterUndefined);

    return {
      project: xs
        .combine(client$, projectLoad$)
        .map(([client, key]) => {
          return xs.fromPromise(createJiraProjectLoader(client)(key));
        })
        .flatten(),
      issues: xs
        .combine(client$, issueLoad$)
        .map(([client, key]) => {
          return xs.fromPromise(createJiraIssueLoader(client)(key));
        })
        .flatten(),
    };
  };
};
