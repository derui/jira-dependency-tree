import { DriverStatus } from "@/type";
import xs, { Stream } from "xstream";

// An interface for ProjectUpdater
export type ProjectUpdaterSource = {
  status: Stream<DriverStatus>;
};

// factory function for ProjectUpdater
export const projectUpdaterFactory = function projectUpdaterFactory(): () => ProjectUpdaterSource {
  return () => {
    return {
      status: xs.of<DriverStatus>(DriverStatus.FINISHED),
    };
  };
};
