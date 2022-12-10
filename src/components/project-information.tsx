import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import xs, { MemoryStream, Stream } from "xstream";
import { ComponentSinks, ComponentSources } from "@/components/type";
import { Project } from "@/model/project";
import { generateTestId, selectAsMain } from "@/components/helper";
import { filterUndefined } from "@/util/basic";

export interface ProjectInformationProps {
  project?: Project;
}

type ProjectInformationSources = ComponentSources<{
  props: MemoryStream<ProjectInformationProps>;
}>;

type ProjectInformationSinks = ComponentSinks<{
  value: Stream<string>;
}>;

const intent = function intent(sources: ProjectInformationSources) {
  const nameClicked$ = selectAsMain(sources, ".project-information__name").events("click").mapTo(true);
  const submit$ = selectAsMain(sources, ".project-information__form")
    .events("submit", { preventDefault: true, bubbles: false })
    .mapTo(false);
  const cancel$ = selectAsMain(sources, ".project-information__cancel")
    .events("click", { preventDefault: true, bubbles: false })
    .mapTo(false);
  const nameChanged$ = selectAsMain(sources, ".project-information__name-input")
    .events("input")
    .map((v) => {
      return (v.target as HTMLInputElement).value;
    });

  return { props$: sources.props, nameClicked$, nameChanged$, submit$, cancel$ };
};

const model = function model(actions: ReturnType<typeof intent>) {
  const project$ = actions.props$.map((v) => v.project);
  const opened$ = xs
    .merge(actions.nameClicked$, actions.submit$, actions.cancel$)
    .fold((accum, value) => !!value || !accum, false);
  const name$ = project$
    .filter(filterUndefined)
    .map((v) => v.name)
    .startWith("Click here");
  const key$ = xs
    .merge(
      project$.filter(filterUndefined).map((v) => v.key),
      actions.nameChanged$
    )
    .startWith("");

  return xs
    .combine(actions.props$, opened$, name$, key$)
    .map(([{ project }, opened, name, key]) => ({ projectGiven: project !== undefined, opened, name, key }));
};

const view = function view(state$: ReturnType<typeof model>, gen: ReturnType<typeof generateTestId>) {
  return state$.map(({ projectGiven, opened, name, key }) => {
    return (
      <div class={{ "project-information": true, "--editor-opened": opened }} dataset={{ testid: gen("main") }}>
        <span
          class={{ "project-information__marker": true, "--show": !projectGiven }}
          dataset={{ testid: gen("marker") }}
        ></span>
        <span
          class={{ "project-information__name": true, "--need-configuration": !projectGiven }}
          dataset={{ testid: gen("name") }}
        >
          {name}
        </span>
        <div class={{ "project-information__editor": true, "--show": opened }} dataset={{ testid: gen("editor") }}>
          <form class={{ "project-information__form": true }} attrs={{ method: "dialog" }}>
            <div class={{ "project-information__main": true }}>
              <label class={{ "project-information__input-container": true }}>
                <span class={{ "project-information__input-label": true }}>Key</span>
                <input
                  class={{ "project-information__name-input": true }}
                  attrs={{ type: "text", placeholder: "required", value: key }}
                  dataset={{ testid: gen("name-input") }}
                />
              </label>
            </div>
            <div class={{ "project-information__footer": true }}>
              <input
                class={{ "project-information__cancel": true }}
                attrs={{ type: "button", value: "Cancel" }}
                dataset={{ testid: gen("cancel") }}
              />
              <input
                class={{ "project-information__submit": true }}
                attrs={{ type: "submit", value: "Apply" }}
                dataset={{ testid: gen("submit") }}
              />
            </div>
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

  const submittedName$ = actions.nameChanged$.map((name) => actions.submit$.take(1).mapTo(name)).flatten();

  return {
    DOM: view(state$, generateTestId(sources.testid)),
    value: submittedName$,
  };
};
