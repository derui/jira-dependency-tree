import { useEffect, useState } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { useAppDispatch, useAppSelector } from "../hooks";
import { ProjectInformationEditor } from "../molecules/project-information-editor";
import { ProjectEditorTop } from "../molecules/project-editor-top";
import { queryProject } from "@/state/selectors/project";
import { Loading } from "@/type";
import { projects, submitProjectId } from "@/state/actions";
import { selectProjectSuggestions } from "@/state/selectors/project-suggestions";

export type Props = BaseProps;

const Styles = {
  root: classNames(
    "relative",
    "flex",
    "flex-auto",
    "h-12",
    "px-2",
    "items-center",
    "transition-all",
    "border-b",
    "border-b-transparent",
  ),
  marker: (show: boolean) => {
    return classNames("flex", "w-2", "h-2", "left-2", "top-2", "absolute", {
      invisible: !show,
      visible: show,
    });
  },
  markerPing: classNames("absolute", "inline-flex", "w-2", "h-2", "rounded-full", "bg-primary-200", "animate-ping"),
  markerInner: classNames("relative", "inline-flex", "w-2", "h-2", "rounded-full", "bg-primary-400"),
  name: (needEditing: boolean, loading: boolean) => {
    return classNames(
      "w-full",
      "overflow-hidden",
      "text-ellipsis",
      "flex-none",
      "font-bold",
      "cursor-pointer",
      "border-b-1",
      "border-b-transparent",
      "transition-colors",
      "leading-6",
      "pl-2",
      {
        ["text-secondary2-400 hover:text-secondary2-400"]: !needEditing,
        ["text-gray hover:text-darkgray"]: needEditing,
        hidden: loading,
      },
    );
  },
  // skeleton styles
  skeletonRoot: classNames("animate-pulse", "flex", "h-12", "w-full", "items-center"),
  skeleton: classNames("bg-lightgray", "rounded", "h-8", "py-2", "px-2", "w-full"),
};

const toProjectState = function toProjectState(suggestionLoading: Loading) {
  switch (suggestionLoading) {
    case "Loading":
      return "Loading";
    case "Errored":
    case "Completed":
      return "Editable";
  }
};

// eslint-disable-next-line func-style
export function ProjectInformation(props: Props) {
  const gen = generateTestId(props.testid);
  const [_loading, project] = useAppSelector(queryProject());
  const [_suggestionLoading, suggestions] = useAppSelector(selectProjectSuggestions);
  const [editing, setEditing] = useState(false);
  const dispatch = useAppDispatch();
  const loading = _loading === Loading.Loading;
  const projectState = toProjectState(_suggestionLoading);

  const handleSelectProject = (payload: string | null) => {
    if (!payload) {
      return;
    }

    setEditing(false);
    dispatch(submitProjectId(payload));
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleRequireEdit = () => {
    setEditing(true);

    if (suggestions.length === 0) {
      dispatch(projects.loadProjects());
    }
  };

  if (loading) {
    return (
      <div className={Styles.root} data-testid={gen("main")}>
        <span className={Styles.skeletonRoot} data-testid={gen("skeleton")}>
          <span className={Styles.skeleton}></span>
        </span>
      </div>
    );
  }

  return (
    <div className={Styles.root} data-testid={gen("main")}>
      {!editing ? (
        <ProjectEditorTop
          projectState={projectState}
          name={project?.name}
          projectKey={project?.key}
          onRequireEdit={handleRequireEdit}
          testid={gen("top")}
        />
      ) : null}
      {editing ? (
        <ProjectInformationEditor
          suggestions={suggestions}
          testid={gen("editor")}
          onSelectProject={handleSelectProject}
          onCancel={handleCancel}
        />
      ) : null}
    </div>
  );
}
