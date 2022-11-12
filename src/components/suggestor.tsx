import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { ComponentSinks, ComponentSources } from "@/components/type";
import xs, { MemoryStream } from "xstream";
import { selectAsMain } from "./helper";

interface Suggestion<T> {
  label: string;
  value: T;
}

export interface SuggestorProps<T> {
  suggestions: Suggestion<T>[];
}

type SuggestorSources<T> = ComponentSources<{
  props: MemoryStream<SuggestorProps<T>>;
}>;

type SuggestorSinks = ComponentSinks<{}>;

const intent = function intent<T>(sources: SuggestorSources<T>) {
  const openerClicked$ = selectAsMain(sources, ".suggestor__opener").events("click").mapTo(true);
  return { openerClicked$ };
};

const model = function model(actions: ReturnType<typeof intent>) {
  const opened = actions.openerClicked$.fold((accum) => !accum, false);

  return xs.combine(opened).map(([opened]) => {
    return { opened };
  });
};

const view = function view(state$: ReturnType<typeof model>) {
  return state$.map(({ opened }) => {
    return (
      <div class={{ suggestor: true }}>
        <button
          class={{ suggestor__opener: true, "--opened": opened }}
          attrs={{ "data-testid": "opener", disabled: true }}
        >
          Open
        </button>
        <div class={{ suggestor__main: true, "--opened": opened }}>
          <span class={{ "suggestor-main__searcher": true }}>
            <input class={{ "suggestor-main__searcher-input": true }} />
          </span>
          <select class={{ "suggestor-main__suggestions": true }}></select>
        </div>
      </div>
    );
  });
};

export const Suggestor = function Suggestor<T>(sources: SuggestorSources<T>): SuggestorSinks {
  const actions = intent(sources);
  const state$ = model(actions);

  return {
    DOM: view(state$),
  };
};
