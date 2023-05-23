import { test, expect } from "vitest";
import { createDependencyRegistrar } from "../../util/dependency-registrar";
import { Dependencies } from "../../dependencies";
import * as epic from "./projects";

const registrar = createDependencyRegistrar<Dependencies>();
const env = {
  apiBaseUrl: "http://base.url",
  apiKey: "key",
};

test("test epic", async (t) => {});
