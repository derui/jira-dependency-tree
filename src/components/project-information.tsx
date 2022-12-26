import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import xs, { Stream } from "xstream";
import isolate from "@cycle/isolate";
import { Reducer, StateSource } from "@cycle/state";
import { Input, InputProps, InputSinks } from "./atoms/input";
import { Icon, IconProps } from "./atoms/icon";
import { JiraProjectLoader } from "./jira-project-loader";
import {
  ComponentSink,
  ComponentSource,
  AsNodeStream,
  classes,
  domSourceOf,
  generateTestId,
  mergeNodes,
  simpleReduce,
} from "@/components/helper";
import { Project } from "@/model/project";
import { ApiCredential, Events } from "@/model/event";

export interface State {
  project?: Project;
  name: string;
  opened: boolean;
}

export interface Props {
  credential: Stream<ApiCredential>;
}

interface Sources extends ComponentSource {
  props: Props;
  state: StateSource<State>;
}

interface Sinks extends ComponentSink<"DOM">, ComponentSink<"HTTP"> {
  state: Stream<Reducer<State>>;
}

const intent = (sources: Sources, nameInput: InputSinks) => {
  const nameClicked$ = domSourceOf(sources).select('[data-id="name"]').events("click").mapTo(true);
  const nameChanged$ = nameInput.input;
  const submit$ = nameInput.keypress.filter((v) => v === "Enter").mapTo(false);
  const submitClicked$ = domSourceOf(sources).select('[data-id="submit"]').events("click").mapTo(false);
  const cancel$ = domSourceOf(sources).select('[data-id="cancel"]').events("click").mapTo(false);

  return { nameClicked$, nameChanged$, submit$: xs.merge(submit$, submitClicked$), cancel$ };
};

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
        "overflow-hidden",
        "border-b",
        "border-b-transparent",
      ),
      ...(!editing ? classes("hover:border-secondary1-400") : {}),
      ...(editing ? classes("h-24") : {}),
    };
  },
  marker: (show: boolean) => {
    return {
      ...classes("absolute", "top-2", "left-0", "inline-block", "w-2", "h-2", "rounded-full", "bg-primary-400"),
      ...(!show ? classes("invisible") : {}),
      ...(show ? classes("visible") : {}),
    };
  },
  name: (editing: boolean, needEditing: boolean) => {
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
      ...(editing ? classes("hidden") : {}),
    };
  },
  keyEditor: (editing: boolean) => {
    return {
      ...classes("bg-white", "flex", "flex-col", "mx-3"),
      ...(!editing ? classes("hidden") : {}),
    };
  },
  keyEditorButtonGroup: classes("bg-white", "flex", "justify-end", "mt-2"),
  keyEditorButton: classes("first:ml-0", "last:mr-0", "mx-2", "cursor-pointer"),
};

const view = (
  state$: Stream<State>,
  nodes$: AsNodeStream<["nameInput", "cancel", "submit"]>,
  gen: ReturnType<typeof generateTestId>,
) => {
  return xs.combine(state$, nodes$).map(([{ project, opened, name }, nodes]) => {
    return (
      <div class={Styles.root(opened)} dataset={{ testid: gen("main") }}>
        <span
          class={{ ...Styles.marker(!project && !opened), "--show": !project }}
          dataset={{ testid: gen("marker") }}
        ></span>
        <span class={Styles.name(opened, !project)} dataset={{ testid: gen("name"), id: "name" }}>
          {name}
        </span>
        <div class={{ ...Styles.keyEditor(opened), "--opened": opened }} dataset={{ testid: gen("nameEditor") }}>
          {nodes.nameInput}
          <span class={Styles.keyEditorButtonGroup}>
            <span class={Styles.keyEditorButton} dataset={{ id: "cancel" }}>
              {nodes.cancel}
            </span>
            <span class={Styles.keyEditorButton} dataset={{ id: "submit" }}>
              {nodes.submit}
            </span>
          </span>
        </div>
      </div>
    );
  });
};

export const ProjectInformation = (sources: Sources): Sinks => {
  const gen = generateTestId(sources.testid);

  const nameInput = isolate(
    Input,
    "nameInput",
  )({
    ...sources,
    props: xs.of<InputProps>({
      focus: true,
      value: "",
      placeholder: "Project Key",
    }),
  });

  const cancelIcon = Icon({
    ...sources,
    props: xs.of<IconProps>({
      type: "circle-x",
      color: "gray",
      size: "m",
    }),
    testid: gen("cancel"),
  });

  const submitIcon = Icon({
    ...sources,
    props: xs.of<IconProps>({
      type: "circle-check",
      color: "complement",
      size: "m",
    }),
    testid: gen("submit"),
  });

  const actions = intent(sources, nameInput);

  const event$ = xs
    .combine(sources.props.credential, actions.nameChanged$)
    .map(([credential, projectKey]) => {
      return actions.submit$.take(1).mapTo<Events>({
        kind: "GetWholeDataRequest",
        credential,
        projectKey,
      });
    })
    .flatten();

  const loader = isolate(
    JiraProjectLoader,
    "jiraProjectLoader",
  )({
    ...sources,
    events: event$,
  });

  const initialReducer$ = xs.of<Reducer<State>>(() => {
    return {
      name: "Click here",
      opened: false,
    };
  });

  const projectReducer$ = loader.project.map(
    simpleReduce<State, Project>((draft, project) => {
      draft.project = project;
      draft.name = project.name;
      draft.opened = false;
    }),
  );

  const openedReducer$ = xs.merge(actions.nameClicked$, actions.submit$, actions.cancel$).map(
    simpleReduce<State, boolean>((draft, opened) => {
      draft.opened = opened;
    }),
  );

  return {
    DOM: view(sources.state.stream, mergeNodes({ nameInput, cancel: cancelIcon, submit: submitIcon }), gen),
    HTTP: xs.merge(loader.HTTP),
    state: xs.merge(initialReducer$, projectReducer$, openedReducer$),
  };
};
