import { jsx, VNode } from "snabbdom"; // eslint-disable-line unused-imports/no-unused-imports
import { Stream } from "xstream";
import { ComponentSinks, ComponentSources } from "@/components/type";
import { Project } from "@/model/project";

type Props = {
  project: Project;
};

type ProjectInformationSources = ComponentSources<{
  props: Stream<Props>;
}>;

type ProjectInformationSinks = ComponentSinks<{}>;

const intent = function intent(sources: ProjectInformationSources) {
  return { props$: sources.props };
};

const model = function model(actions: ReturnType<typeof intent>) {
  return actions.props$.map((v) => ({ props: v }));
};

const view = function view(state$: ReturnType<typeof model>) {
  return state$.map(({ props }) => (
    <div class={{ "project-information": true }}>
      <div class={{ "project-information__toolbar": true }}>
        <span class={{ "project-information__name": true }} dataset={{ testid: "name" }}>
          {props.project.name}
        </span>
        <span>
          <button class={{ "project-information__synchronize": true }} dataset={{ testid: "sync" }}></button>
        </span>
      </div>
    </div>
  ));
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
