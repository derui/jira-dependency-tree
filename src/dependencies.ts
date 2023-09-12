import type { Env } from "./models/env";
import { Apis } from "@/apis/api";

// define dependencies
export type Dependencies = {
  env: Env;

  apis: typeof Apis;

  /**
   * generate unique id
   */
  generateId: () => string;
};
