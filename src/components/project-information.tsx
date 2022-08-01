import { jsx, VNode } from "snabbdom"; // eslint-disable-line unused-imports/no-unused-imports
import xs, { MemoryStream } from "xstream";
import { ComponentSinks, ComponentSources } from "@/components/type";
import { Project } from "@/model/project";
import { selectAsMain } from "./helper";

export interface ProjectInformationProps {
  project?: Project;
}

type ProjectInformationSources = ComponentSources<{
  props: MemoryStream<ProjectInformationProps>;
}>;

type ProjectInformationSinks = ComponentSinks<{}>;

const intent = function intent(sources: ProjectInformationSources) {
  const nameClicked$ = selectAsMain(sources, ".project-information__name").events("click").mapTo(true);

  return { props$: sources.props, nameClicked$ };
};

const model = function model(actions: ReturnType<typeof intent>) {
  const project$ = actions.props$.map((v) => v.project);
  const opened$ = actions.nameClicked$.fold((accum) => !accum, false);

  return xs.combine(project$, opened$).map(([project, opened]) => ({ project, opened }));
};

const view = function view(state$: ReturnType<typeof model>) {
  return state$.map(({ project, opened }) => {
    const name = project?.name ?? "Click here";

    return (
      <div class={{ "project-information": true, "--editor-opened": opened }} dataset={{ testid: "main" }}>
        <span class={{ "project-information__marker": true, "--show": !project }} dataset={{ testid: "marker" }}></span>
        <span
          class={{ "project-information__name": true, "--need-configuration": !project }}
          dataset={{ testid: "name" }}
        >
          {name}
        </span>
        <div class={{ "project-information__toolbar": true }}>
          <span>
            <button
              class={{ "project-information__synchronize": true }}
              attrs={{ disabled: !project }}
              dataset={{ testid: "sync" }}
            ></button>
          </span>
        </div>
        <div class={{ "project-information__editor": true, "--show": opened }} dataset={{ testid: "editor" }}>
          <form class={{ "project-information__form": true }} attrs={{ method: "dialog" }}>
            <label class={{ "project-information__input-container": true }}>
              <span class={{ "project-information__input-label": true }}>Key</span>
              <input
                class={{ "project-information__name-input": true }}
                attrs={{ type: "text", placeholder: "required" }}
              />
            </label>
            <input class={{ "project-information__submitter": true }} attrs={{ type: "submit", value: "Apply" }} />
          </form>
        </div>
      </div>
    );
  });
};

export const ProjectInformation = function ProjectInformation(
  sources: ProjectInformationSources
): ProjectInformationSinks {
  const actions = intent(sources);
  const state$ = model(actions);

  return {
    DOM: view(state$),
  };
};
