import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import xs, { MemoryStream, Stream } from "xstream";
import { ComponentSinks, ComponentSources } from "@/components/type";
import { Project } from "@/model/project";
import { AsNodeStream, classes, generateTestId, mergeNodes, selectAsMain } from "@/components/helper";
import { filterUndefined } from "@/util/basic";
import isolate from "@cycle/isolate";
import { Input, InputProps, InputSinks } from "./atoms/input";

export interface ProjectInformationProps {
  project?: Project;
}

type ProjectInformationSources = ComponentSources<{
  props: MemoryStream<ProjectInformationProps>;
}>;

type ProjectInformationSinks = ComponentSinks<{
  value: Stream<string>;
}>;

const intent = function intent(sources: ProjectInformationSources, nameInput: InputSinks) {
  const nameClicked$ = selectAsMain(sources, '[data-id="name"]').events("click").mapTo(true);
  const nameChanged$ = nameInput.input;
  const cancel$ = nameInput.keypress.filter((v) => v === "Escape").mapTo(false);
  const submit$ = nameInput.keypress.filter((v) => v === "Enter").mapTo(false);

  return { props$: sources.props, nameClicked$, nameChanged$, cancel$, submit$ };
};

const model = function model(actions: ReturnType<typeof intent>) {
  return actions.props$
    .map((v) => {
      const opened$ = xs.merge(actions.nameClicked$, actions.submit$, actions.cancel$).fold((_, value) => value, false);

      const name$ = xs
        .of(v.project)
        .filter(filterUndefined)
        .map((v) => v.name)
        .startWith("Click here");

      return xs
        .combine(opened$, name$)
        .map(([opened, name]) => ({ projectGiven: v.project !== undefined, opened, name }));
    })
    .flatten();
};

const Styles = {
  root: classes(
    "relative",
    "bg-white",
    "grid",
    "grid-cols-1",
    "grid-rows-2",
    "h-8",
    "rounded",
    "items-center",
    "shadow-md"
  ),
  marker: (show: boolean) => {
    return {
      ...classes(
        "absolute",
        "top-3",
        "left-3",
        "inline-block",
        "invisibile",
        "w-3",
        "h-3",
        "rounded",
        "bg-primary-400"
      ),
      ...(show ? classes("visible") : {}),
    };
  },
  name: (editing: boolean) => {
    return {
      ...classes(
        "ml-4",
        "overflow-hidden",
        "text-ellipsis",
        "w-60",
        "flex-none",
        "font-bold",
        "cursor-pointer",
        "color-secondary2-400",
        "border-b-1",
        "border-b-transparent",
        "transition-colors",
        "transition-border",
        "leading-6",
        "p-2",
        "pr-0"
      ),
      ...(editing ? classes("hidden") : {}),
    };
  },
  keyEditor: (editing: boolean) => {
    return {
      ...(!editing ? classes("hidden") : {}),
    };
  },
};

const view = function view(
  state$: ReturnType<typeof model>,
  nodes$: AsNodeStream<["nameInput"]>,
  gen: ReturnType<typeof generateTestId>
) {
  return xs.combine(state$, nodes$).map(([{ projectGiven, opened, name }, nodes]) => {
    return (
      <div class={Styles.root} dataset={{ testid: gen("main") }}>
        <span class={Styles.marker(!projectGiven)} dataset={{ testid: gen("marker"), show: `${!projectGiven}` }}></span>
        <div class={Styles.name(opened)}>
          <span dataset={{ testid: gen("name") }}>{name}</span>
        </div>
        <div></div>
        <div class={Styles.keyEditor(opened)} dataset={{ testid: gen("nameEditor") }}>
          {nodes.nameInput}
        </div>
      </div>
    );
  });
};

export const ProjectInformation = function ProjectInformation(
  sources: ProjectInformationSources
): ProjectInformationSinks {
  const nameInput = isolate(
    Input,
    "nameInput"
  )({
    ...sources,
    props: sources.props.map<InputProps>((props) => {
      return {
        value: props.project?.key ?? "",
        placeholder: "Project Key",
      };
    }),
  });

  const actions = intent(sources, nameInput);
  const state$ = model(actions);

  const submittedName$ = actions.nameChanged$.map((name) => actions.submit$.take(1).mapTo(name)).flatten();

  return {
    DOM: view(state$, mergeNodes({ nameInput: nameInput.DOM }), generateTestId(sources.testid)),
    value: submittedName$,
  };
};
