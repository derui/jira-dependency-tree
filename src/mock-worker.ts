import { setupWorker, rest } from "msw";

// create empty worker
export const worker = setupWorker();

window.msw = {
  worker,
  rest,
};

declare global {
  interface Window {
    msw: {
      worker: unknown;
      rest: typeof rest;
    };
  }
}
