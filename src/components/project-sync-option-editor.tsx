import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { Reducer, StateSource } from "@cycle/state";
import xs, { Stream } from "xstream";
import isolate from "@cycle/isolate";
import {
  ComponentSource,
  classes,
  generateTestId,
  TestIdGenerator,
  ComponentSink,
  domSourceOf,
  simpleReduce,
} from "./helper";
import { ProjectSyncOptionEditorDialog } from "./project-sync-option-editor-dialog";
import { ApiCredential, SearchCondition } from "@/model/event";
import { filterUndefined, Rect } from "@/util/basic";

export interface State {
  currentSearchCondition: SearchCondition | undefined;
  editorOpened: boolean;
  openAt?: Rect;
}

interface Props {
  apiCredential: Stream<ApiCredential>;
  projectKey: Stream<string>;
}

interface Sources extends ComponentSource {
  props: Props;
  state: StateSource<State>;
}

interface Sinks extends ComponentSink<"DOM">, ComponentSink<"Portal">, ComponentSink<"HTTP"> {
  state: Stream<Reducer<State>>;
  value: Stream<SearchCondition>;
}

const intent = (sources: Sources) => {
  const selectorOpenerClicked = domSourceOf(sources).select("[data-id=opener]").events("click", { bubbles: false });

  return {
    openerClicked$: selectorOpenerClicked,
  };
};

const currentConditionName = (condition: SearchCondition | undefined) => {
  if (condition?.epic) {
    return condition.epic;
  } else if (condition?.sprint) {
    return condition.sprint.displayName;
  }

  return "Current Sprint";
};

const Styles = {
  root: classes("relative", "w-full", "flex", "items-center", "justify-center"),
  opener: (opened: boolean) => {
    return {
      ...classes(
        "inline-flex",
        "px-3",
        "py-2",
        "border",
        "border-gray",
        "bg-white",
        "rounded",
        "transition-colors",
        "hover:text-white",
        "hover:bg-secondary1-200",
        "hover:border-secondary1-500",
        "cursor-pointer",
        "items-center",
        "whitespace-nowrap",
      ),

      ...(!opened ? classes("border-gray", "bg-white") : {}),
      ...(opened ? classes("text-white", "bg-secondary1-200", "border-secondary1-500") : {}),
    };
  },
};

const view = (state$: Stream<State>, gen: TestIdGenerator) => {
  return state$.map(({ editorOpened, currentSearchCondition }) => {
    return (
      <div class={Styles.root}>
        <button class={Styles.opener(editorOpened)} dataset={{ testid: gen("opener"), id: "opener" }}>
          {currentConditionName(currentSearchCondition)}
        </button>
      </div>
    );
  });
};

export const ProjectSyncOptionEditor = (sources: Sources): Sinks => {
  const dialog = isolate(
    ProjectSyncOptionEditorDialog,
    "projectSyncOptionEditorDialog",
  )({
    ...sources,
    props: {
      apiCredential: sources.props.apiCredential,
      projectKey: sources.props.projectKey,
      openAt: sources.state.select<State["openAt"]>("openAt").stream.filter(filterUndefined),
    },
  });

  const actions = intent(sources);

  const initialReducer$ = xs.of<Reducer<State>>(() => {
    return {
      currentSearchCondition: undefined,
      editorOpened: false,
    };
  });

  const openerReducer$ = actions.openerClicked$.map(
    simpleReduce<State, MouseEvent>((draft, opened) => {
      draft.editorOpened = true;
      draft.openAt = Rect.fromDOMRect((opened.target as HTMLButtonElement).getBoundingClientRect());
    }),
  );

  const valueReducer$ = dialog.value.map(
    simpleReduce<State, SearchCondition>((draft, condition) => {
      draft.editorOpened = false;
      draft.currentSearchCondition = condition;
    }),
  );

  return {
    DOM: view(sources.state.stream, generateTestId(sources.testid)),
    HTTP: xs.merge(dialog.HTTP),
    Portal: dialog.Portal,
    state: xs.merge(initialReducer$, openerReducer$, valueReducer$, dialog.state as Stream<Reducer<State>>),
    value: sources.state
      .select<SearchCondition | undefined>("currentSearchCondition")
      .stream.filter(filterUndefined)
      .map((v) => {
        return xs.of(v);
      })
      .flatten(),
  };
};
