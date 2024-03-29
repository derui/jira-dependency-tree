import { faker } from "@faker-js/faker";
import { ApiCredential } from "@/models/event";
import { Issue } from "@/models/issue";
import { ApiIssue } from "@/apis/mapper/issue";

export const MOCK_BASE_URL = "https://mock.example.com";

/**
 * get random api credential
 */
export const randomCredential = (v: Partial<ApiCredential> = {}): ApiCredential => {
  return {
    apiBaseUrl: v.apiBaseUrl ?? MOCK_BASE_URL,
    apiKey: v.apiKey ?? faker.internet.password(),
    email: v.email ?? faker.internet.email(),
    token: v.token ?? faker.internet.password(),
    userDomain: v.userDomain ?? faker.internet.domainSuffix(),
  };
};

/**
 * get random issue. If given argument, use it partially for issue returned from this.
 */
export const randomIssue = (issue: Partial<Issue> = {}): Issue => {
  return {
    key: issue.key ?? faker.word.sample(),
    summary: issue.summary ?? faker.lorem.sentence(),
    description: issue.description ?? faker.company.catchPhrase(),
    relations: issue.relations ?? [],
    selfUrl: issue.selfUrl ?? faker.internet.url(),
    status: issue.status ?? {
      id: faker.string.uuid(),
      name: faker.word.verb(),
      statusCategory: "TODO",
    },
    type: issue.type ?? {
      id: faker.string.uuid(),
      name: faker.word.verb(),
      avatarUrl: faker.internet.url(),
    },
    parentIssue: issue.parentIssue,
    subIssues: issue.subIssues ?? [],
  };
};

/**
 * create new ApiIssue for testing
 */
export const randomApiIssue = function randomApiIssue(issue: Partial<ApiIssue> = {}): ApiIssue {
  return {
    key: faker.word.adverb(),
    summary: faker.lorem.slug(),
    status: {
      id: faker.string.uuid(),
      name: faker.word.noun(),
      statusCategory: "TODO",
    },
    type: {
      id: faker.string.uuid(),
      name: faker.word.verb(),
      avatarUrl: faker.internet.url(),
    },
    links: [],
    subtasks: [],
    ...issue,
  };
};
