import React, { useRef, useState } from "react";
import classNames from "classnames";
import { BaseProps, classes, generateTestId } from "../helper";
import { useAppDispatch, useAppSelector } from "../hooks";
import { Dialog } from "../atoms/dialog";
import { ProjectInformationEditor } from "../molecules/project-information-editor";
import { queryProject } from "@/state/selectors/project";
import { Loading } from "@/type";
import { submitProjectKey } from "@/state/actions";

export type Props = BaseProps;

const Styles = {
  root: (editing: boolean) => {
    return {
      ...classes(
        "relative",
        "flex",
        "flex-auto",
        "h-12",
        "items-center",
        "transition-all",
        "border-b",
        "border-b-transparent",
      ),
      ...(!editing ? classes("hover:border-secondary1-400") : {}),
      ...(editing ? classes("h-24") : {}),
    };
  },
  marker: (show: boolean) => {
    return {
      ...classes("flex", "w-2", "h-2", "left-0", "top-2", "absolute"),
      ...(!show ? classes("invisible") : {}),
      ...(show ? classes("visible") : {}),
    };
  },
  markerPing: classes("absolute", "inline-flex", "w-2", "h-2", "rounded-full", "bg-primary-200", "animate-ping"),
  markerInner: classes("relative", "inline-flex", "w-2", "h-2", "rounded-full", "bg-primary-400"),
  name: (editing: boolean, needEditing: boolean, loading: boolean) => {
    return {
      ...classes(
        "w-full",
        "overflow-hidden",
        "text-ellipsis",
        "flex-none",
        "font-bold",
        "cursor-pointer",
        "border-b-1",
        "border-b-transparent",
        "transition-colors",
        "transition-border",
        "leading-6",
        "pl-2",
      ),
      ...(!needEditing ? classes("text-secondary2-400", "hover:text-secondary2-400") : {}),
      ...(needEditing ? classes("text-gray", "hover:text-darkgray") : {}),
      ...(editing || loading ? classes("hidden") : {}),
    };
  },
  // skeleton styles
  skeletonRoot: (loading: boolean) => {
    return {
      ...classes("animate-pulse", "flex", "h-12", "w-full", "items-center"),
      ...(loading ? {} : classes("hidden")),
    };
  },
  skeleton: classes("bg-lightgray", "rounded", "h-8", "py-2", "px-2", "w-full"),
};

export const ProjectInformation: React.FC<Props> = (props) => {
  const gen = generateTestId(props.testid);
  const [opened, setOpened] = useState(false);
  const [key, setKey] = useState("");
  const [_loading, project] = useAppSelector(queryProject());
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement | null>(null);
  const loading = _loading === Loading.Loading;

  const handleSubmit = (payload: { projectKey: string } | undefined) => {
    setOpened(false);

    if (!payload) {
      setKey("");
      return;
    }

    dispatch(submitProjectKey(payload.projectKey));
  };

  const showMarker = Boolean(!project && !opened && !loading);

  return (
    <div ref={ref} className={classNames(Styles.root(opened))} data-testid={gen("main")}>
      <span className={classNames(Styles.marker(showMarker))} aria-hidden={!showMarker} data-testid={gen("marker")}>
        <span className={classNames(Styles.markerPing)}></span>
        <span className={classNames(Styles.markerInner)}></span>
      </span>
      <span
        className={classNames(Styles.name(opened, !project, loading))}
        data-testid={gen("name")}
        onClick={() => setOpened(!opened)}
      >
        {project?.name ?? "Click here"}
      </span>
      <span className={classNames(Styles.skeletonRoot(loading))} data-testid={gen("skeleton")}>
        <span className={classNames(Styles.skeleton)}></span>
      </span>
      <Dialog
        opened={opened}
        aligned='bottomLeft'
        parentRect={ref.current?.getBoundingClientRect()}
        margin='left-top'
        testid={gen("container")}
      >
        <ProjectInformationEditor testid={gen("form")} initialPayload={{ projectKey: key }} onEndEdit={handleSubmit} />
      </Dialog>
    </div>
  );
};
