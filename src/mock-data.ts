import { faker } from "@faker-js/faker";
import { ApiCredential } from "./model/event";
import { projectFactory } from "./model/project";
import { StatusCategory } from "./type";

/**
 * get random project
 */
export const randomProject = () => {
  return projectFactory({
    id: faker.datatype.uuid(),
    key: faker.word.verb(),
    name: faker.name.jobTitle(),
    issueTypes: [
      {
        id: faker.datatype.uuid(),
        name: faker.datatype.string(),
        avatarUrl: faker.internet.url(),
      },
    ],
    statusCategories: [
      {
        id: faker.datatype.uuid(),
        name: faker.datatype.string(),
        colorName: faker.color.human(),
      },
    ],
    statuses: [
      {
        id: faker.datatype.uuid(),
        name: faker.datatype.string(),
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
    apiBaseUrl: faker.internet.url(),
    apiKey: faker.internet.password(),
    email: faker.internet.email(),
    token: faker.internet.password(),
    userDomain: faker.internet.domainSuffix(),
  };
};
