import { jsx, VNode } from "snabbdom"; // eslint-disable-line unused-imports/no-unused-imports
import { MemoryStream } from "xstream";
import { ComponentSinks, ComponentSources } from "@/components/type";
import { Project } from "@/model/project";

export interface ProjectInformationProps {
  project?: Project;
}

type ProjectInformationSources = ComponentSources<{
  props: MemoryStream<ProjectInformationProps>;
}>;

type ProjectInformationSinks = ComponentSinks<{}>;

const intent = function intent(sources: ProjectInformationSources) {
  return { props$: sources.props };
};

const model = function model(actions: ReturnType<typeof intent>) {
  return actions.props$.map((v) => ({ project: v.project }));
};

const view = function view(state$: ReturnType<typeof model>) {
  return state$.map(({ project }) => {
    const name = project?.name ?? "Click here";

    return (
      <div class={{ "project-information": true }}>
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
