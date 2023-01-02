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
  disabled: boolean;
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
  opener: (opened: boolean, disabled: boolean) => {
    return {
      ...classes(
        "inline-flex",
        "px-3",
        "py-1",
        "border",
        "bg-white",
        "rounded",
        "transition-colors",
        "cursor-pointer",
        "items-center",
        "whitespace-nowrap",
        "text-sm",
      ),

      ...(opened ? classes("text-white", "bg-secondary1-200", "border-secondary1-500") : classes("bg-white")),
      ...(disabled
        ? classes("text-lightgray", "border-lightgray")
        : classes("border-gray", "hover:text-white", "hover:bg-secondary1-200", "hover:border-secondary1-500")),
    };
  },
};

const view = (state$: Stream<State>, gen: TestIdGenerator) => {
  return state$.map(({ editorOpened, currentSearchCondition, disabled }) => {
    return (
      <div class={Styles.root}>
        <button
          class={Styles.opener(editorOpened, disabled)}
          attrs={{ disabled }}
          dataset={{ testid: gen("opener"), id: "opener" }}
        >
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
      disabled: true,
    };
  });

  const disabledReducer$ = xs
    .combine(sources.props.apiCredential, sources.props.projectKey)
    .take(1)
    .map(
      simpleReduce<State, unknown>((draft) => {
        draft.disabled = false;
      }),
    );

  const defaultConditionReducer$ = sources.props.projectKey.map(
    simpleReduce<State, string>((draft, key) => {
      draft.currentSearchCondition = { projectKey: key };
    }),
  );

  const openerReducer$ = actions.openerClicked$.map(
    simpleReduce<State, MouseEvent>((draft, opened) => {
      draft.editorOpened = true;
      draft.openAt = Rect.fromDOMRect((opened.target as HTMLButtonElement).getBoundingClientRect());
    }),
  );

  const valueReducer$ = dialog.value.map(
    simpleReduce<State, SearchCondition>((draft, condition) => {
      draft.editorOpened = false;
      draft.openAt = undefined;
      draft.currentSearchCondition = condition;
    }),
  );

  const cancelReducer$ = dialog.cancel.map(
    simpleReduce<State, unknown>((draft) => {
      draft.editorOpened = false;
      draft.openAt = undefined;
    }),
  );

  return {
    DOM: view(sources.state.stream, generateTestId(sources.testid)),
    HTTP: xs.merge(dialog.HTTP),
    Portal: dialog.Portal,
    state: xs.merge(
      initialReducer$,
      openerReducer$,
      valueReducer$,
      cancelReducer$,
      defaultConditionReducer$,
      disabledReducer$,
      dialog.state as Stream<Reducer<State>>,
    ),
    value: sources.state
      .select<SearchCondition | undefined>("currentSearchCondition")
      .stream.filter(filterUndefined)
      .map((v) => {
        return xs.of(v);
      })
      .flatten(),
  };
};
