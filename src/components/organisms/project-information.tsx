import { useRef, useState } from "react";
import classNames from "classnames";
import { BaseProps, classes, generateTestId } from "../helper";
import { useAppDispatch, useAppSelector } from "../hooks";
import { Dialog } from "../atoms/dialog";
import { ProjectInformationEditor } from "../molecules/project-information-editor";
import { ProjectEditorTop } from "../molecules/project-editor-top";
import { queryProject } from "@/state/selectors/project";
import { Loading } from "@/type";
import { submitProjectKey } from "@/state/actions";

export type Props = BaseProps;

const Styles = {
  root: classes(
    "relative",
    "flex",
    "flex-auto",
    "h-12",
    "px-3",
    "items-center",
    "transition-all",
    "border-b",
    "border-b-transparent",
  ),
  marker: (show: boolean) => {
    return {
      ...classes("flex", "w-2", "h-2", "left-2", "top-2", "absolute"),
      ...(!show ? classes("invisible") : {}),
      ...(show ? classes("visible") : {}),
    };
  },
  markerPing: classes("absolute", "inline-flex", "w-2", "h-2", "rounded-full", "bg-primary-200", "animate-ping"),
  markerInner: classes("relative", "inline-flex", "w-2", "h-2", "rounded-full", "bg-primary-400"),
  name: (needEditing: boolean, loading: boolean) => {
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
        "leading-6",
        "pl-2",
      ),
      ...(!needEditing ? classes("text-secondary2-400", "hover:text-secondary2-400") : {}),
      ...(needEditing ? classes("text-gray", "hover:text-darkgray") : {}),
      hidden: loading,
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

// eslint-disable-next-line func-style
export function ProjectInformation(props: Props) {
  const gen = generateTestId(props.testid);
  const [_loading, project] = useAppSelector(queryProject());
  const [editing, setEditing] = useState(false);
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement | null>(null);
  const loading = _loading === Loading.Loading;

  const handleSelectProject = (payload: string | null) => {
    if (!payload) {
      return;
    }

    setEditing(false);
    dispatch(submitProjectKey(payload));
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleRequireEdit = () => {
    setEditing(true);
  };

  return (
    <div ref={ref} className={classNames(Styles.root)} data-testid={gen("main")}>
      {!editing ? (
        <ProjectEditorTop
          name={project?.name}
          projectKey={project?.key}
          onRequireEdit={handleRequireEdit}
          testid={gen("top")}
        />
      ) : null}
      <span className={classNames(Styles.skeletonRoot(loading))} data-testid={gen("skeleton")}>
        <span className={classNames(Styles.skeleton)}></span>
      </span>
      {editing ? (
        <ProjectInformationEditor
          testid={gen("editor")}
          onSelectProject={handleSelectProject}
          onCancel={handleCancel}
        />
      ) : null}
    </div>
  );
}
