import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import xs, { MemoryStream, Stream } from "xstream";
import isolate from "@cycle/isolate";
import { Input, InputProps, InputSinks } from "./atoms/input";
import { Icon, IconProps } from "./atoms/icon";
import {
  ComponentSink,
  ComponentSource,
  AsNodeStream,
  classes,
  domSourceOf,
  generateTestId,
  mergeNodes,
} from "@/components/helper";
import { Project } from "@/model/project";
import { filterUndefined } from "@/util/basic";

export interface ProjectInformationProps {
  project?: Project;
}

interface ProjectInformationSources extends ComponentSource {
  props: MemoryStream<ProjectInformationProps>;
}

interface ProjectInformationSinks extends ComponentSink<"DOM"> {
  value: Stream<string>;
}

const intent = (sources: ProjectInformationSources, nameInput: InputSinks) => {
  const nameClicked$ = domSourceOf(sources).select('[data-id="name"]').events("click").mapTo(true);
  const nameChanged$ = nameInput.input;
  const submit$ = nameInput.keypress.filter((v) => v === "Enter").mapTo(false);
  const submitClicked$ = domSourceOf(sources).select('[data-id="submit"]').events("click").mapTo(false);
  const cancel$ = domSourceOf(sources).select('[data-id="cancel"]').events("click").mapTo(false);

  return { props$: sources.props, nameClicked$, nameChanged$, submit$: xs.merge(submit$, submitClicked$), cancel$ };
};

const model = (actions: ReturnType<typeof intent>) => {
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
        "border-b-transparent"
      ),
      ...(!editing ? classes("hover:border-secondary1-400") : {}),
      ...(editing ? classes("h-24") : {}),
    };
  },
  marker: (show: boolean) => {
    return {
      ...classes("absolute", "top-0", "left-0", "inline-block", "w-2", "h-2", "rounded-full", "bg-primary-400"),
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
        "pl-2"
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
  state$: ReturnType<typeof model>,
  nodes$: AsNodeStream<["nameInput", "cancel", "submit"]>,
  gen: ReturnType<typeof generateTestId>
) => {
  return xs.combine(state$, nodes$).map(([{ projectGiven, opened, name }, nodes]) => {
    return (
      <div class={Styles.root(opened)} dataset={{ testid: gen("main") }}>
        <span
          class={Styles.marker(!projectGiven && !opened)}
          dataset={{ testid: gen("marker"), show: `${!projectGiven}` }}
        ></span>
        <span class={Styles.name(opened, !projectGiven)} dataset={{ id: "name" }}>
          {name}
        </span>
        <div class={Styles.keyEditor(opened)} dataset={{ testid: gen("nameEditor"), opened: `${opened}` }}>
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

export const ProjectInformation = (sources: ProjectInformationSources): ProjectInformationSinks => {
  const nameInput = isolate(
    Input,
    "nameInput"
  )({
    ...sources,
    props: sources.props.map<InputProps>((props) => {
      return {
        focus: true,
        value: props.project?.key ?? "",
        placeholder: "Project Key",
      };
    }),
  });

  const cancelIcon = Icon({
    ...sources,
    props: xs.of<IconProps>({
      type: "circle-x",
      color: "gray",
      size: "m",
    }),
  });

  const submitIcon = Icon({
    ...sources,
    props: xs.of<IconProps>({
      type: "circle-check",
      color: "complement",
      size: "m",
    }),
  });

  const actions = intent(sources, nameInput);
  const state$ = model(actions);

  const submittedName$ = actions.nameChanged$.map((name) => actions.submit$.take(1).mapTo(name)).flatten();

  return {
    DOM: view(
      state$,
      mergeNodes({ nameInput: nameInput.DOM, cancel: cancelIcon.DOM, submit: submitIcon.DOM }),
      generateTestId(sources.testid)
    ),
    value: submittedName$,
  };
};
