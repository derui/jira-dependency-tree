import { createJiraIssueLoader } from "@/infrastructure/jira-issue-loader";
import { createJiraProjectLoader } from "@/infrastructure/jira-project-loader";
import { Issue } from "@/model/issue";
import { Project } from "@/model/project";
import { Driver } from "@cycle/run";
import { Version3Client } from "jira.js";
import xs, { Listener, Stream } from "xstream";

// An interface for ProjectUpdater
export type JiraLoaderSources = {
  authorize(parameter: { host: string; user: string; credential: string }): void;
  project: Stream<Project>;
  issues: Stream<Issue[]>;
};

export type JiraIssueLoaderAction = {
  kind: "issue";
  projectKey: string;
};

export type JiraProjectLoaderAction = {
  kind: "project";
  projectKey: string;
};

type JiraLoaderAction = JiraIssueLoaderAction | JiraProjectLoaderAction;

export type JiraLoaderSinks = JiraLoaderAction;

const isIssueLoaderAction = function isIssueLoaderAction(action: JiraLoaderAction): action is JiraIssueLoaderAction {
  return action.kind === "issue";
};

const isProjectLoaderAction = function isProjectLoaderAction(
  action: JiraLoaderAction
): action is JiraProjectLoaderAction {
  return action.kind === "project";
};

export const createJiraLoader = function createJiraLoader(): Driver<Stream<JiraLoaderSinks>, JiraLoaderSources> {
  let clientListener: Listener<Version3Client> | undefined;

  let client$ = xs.createWithMemory<Version3Client>({
    start: (listener) => {
      clientListener = listener;
    },
    stop() {
      clientListener = undefined;
    },
  });

  return (sinks$) => {
    const projectLoad$ = sinks$.filter(isProjectLoaderAction).map((v) => v.projectKey);
    const issueLoad$ = sinks$.filter(isIssueLoaderAction).map((v) => v.projectKey);

    return {
      authorize({ host, user, credential }) {
        const client = new Version3Client({
          host,
          authentication: {
            basic: {
              email: user,
              apiToken: credential,
            },
          },
        });

        clientListener?.next(client);
      },

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
