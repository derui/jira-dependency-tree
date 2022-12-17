import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import xs, { Stream } from "xstream";
import { classes, generateTestId, selectAsMain } from "../helper";
import { ComponentSinkBase, ComponentSourceBase } from "../type";

export interface InputProps {
  placeholder?: string;
  value: string;
  label?: string;
}

interface InputSources extends ComponentSourceBase {
  props: Stream<InputProps>;
}

export interface InputSinks extends ComponentSinkBase {
  value: Stream<string>;
}

const intent = (sources: InputSources) => {
  const changed$ = selectAsMain(sources, 'input[type="text"]')
    .events("input")
    .map((v) => {
      return (v.target as HTMLInputElement).value;
    });

  return {
    props$: sources.props,
    changed$,
  };
};

const model = (actions: ReturnType<typeof intent>) => {
  return actions.props$
    .map((props) => {
      const value$ = actions.changed$.startWith(props.value);

      return value$.map((v) => {
        return { value: v, placeholder: props.placeholder, label: props.label };
      });
    })
    .flatten();
};

const containerClass = classes(
  "flex",
  "flex-auto",
  "items-center",
  "flex-col",
  "mx-3",
  "justify-between",
  "whitespace-nowrap",
  "m-4",
  "first:mt-0",
  "last:mb-0"
);
const labelClass = classes("flex-auto", "text-primary-500", "whitespace-nowrap");
const inputClass = classes(
  "flex-auto",
  "ml-4",
  "px-4",
  "py-3",
  "border",
  "border-lightgray",
  "outline-1",
  "outline-transparent",
  "bg-lightgray",
  "rounded",
  "transition-outline",
  "transition-colors",
  "focus:bg-white",
  "focus:outline-1",
  "focus:outline-primray-400",
  "focus:border-primary-400"
);

const view = (state$: ReturnType<typeof model>, gen: ReturnType<typeof generateTestId>) => {
  return state$.map(({ value, placeholder, label }) => {
    if (label) {
      return (
        <label class={containerClass}>
          <span class={labelClass} dataset={{ testid: gen("label") }}>
            {label}
          </span>
          <input
            class={inputClass}
            attrs={{ type: "text", placeholder: placeholder ?? "", value: value }}
            dataset={{ testid: gen("input") }}
          />
        </label>
      );
    } else {
      return (
        <input
          class={inputClass}
          attrs={{ type: "text", placeholder: placeholder ?? "", value: value }}
          dataset={{ testid: gen("input") }}
        />
      );
    }
  });
};

export const Input = (sources: InputSources): InputSinks => {
  const gen = generateTestId(sources.testid);
  const actions = intent(sources);
  const state$ = model(actions);

  return {
    DOM: view(state$, gen),
    value: actions.changed$,
  };
};
