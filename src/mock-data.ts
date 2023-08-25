import { faker } from "@faker-js/faker";
import { ApiCredential } from "./model/event";
import { Issue } from "./model/issue";
import { projectFactory } from "./model/project";
import { StatusCategory } from "./type";
import { FirstArg } from "./util/type-tool";

export const MOCK_BASE_URL = "https://mock.example.com";

/**
 * get random project
 */
export const randomProject = (arg?: Partial<FirstArg<typeof projectFactory>>) => {
  return projectFactory({
    id: arg?.id ?? faker.string.uuid(),
    key: arg?.key ?? faker.word.verb(),
    name: arg?.name ?? faker.person.jobTitle(),
    issueTypes: [
      {
        id: faker.string.uuid(),
        name: faker.string.sample(),
        avatarUrl: faker.internet.url(),
      },
    ],
    statusCategories: [
      {
        id: faker.string.uuid(),
        name: faker.string.sample(),
        colorName: faker.color.human(),
      },
    ],
    statuses: [
      {
        id: faker.string.uuid(),
        name: faker.string.sample(),
        statusCategory: StatusCategory.IN_PROGRESS,
      },
    ],
  });
};

/**
 * get random api credential
 */
export const randomCredential = (): ApiCredential => {
  return {
    apiBaseUrl: MOCK_BASE_URL,
    apiKey: faker.internet.password(),
    email: faker.internet.email(),
    token: faker.internet.password(),
    userDomain: faker.internet.domainSuffix(),
  };
};

/**
 * get random issue. If given argument, use it partially for issue returned from this.
 */
export const randomIssue = (issue: Partial<Issue> = {}): Issue => {
  return {
    key: issue.key ?? faker.string.sample(),
    summary: issue.summary ?? faker.lorem.sentence(),
    description: issue.description ?? faker.company.catchPhrase(),
    relations: issue.relations ?? [],
    selfUrl: issue.selfUrl ?? faker.internet.url(),
    status: issue.status ?? {
      id: faker.string.uuid(),
      name: faker.string.symbol(),
      statusCategory: "TODO",
    },
    type: issue.type ?? {
      id: faker.string.uuid(),
      name: faker.string.symbol(),
      avatarUrl: faker.internet.url(),
    },
    parentIssue: issue.parentIssue,
    subIssues: issue.subIssues ?? [],
  };
};

export const randomApiIssue = function randomApiIssue(issue: Partial<>) {
  return {
    key: "key",
    summary: "summary",
    status: {
      id: "",
      name: "name",
      statusCategory: "TODO",
    },
    type: {
      id: "",
      name: "name",
    },
    links: [],
    subtasks: [],
  }
}
