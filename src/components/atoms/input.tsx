import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import xs, { Stream } from "xstream";
import { classes, domSourceOf, generateTestId, ComponentSink, ComponentSource } from "../helper";

export interface InputProps {
  placeholder?: string;
  value: string;
  label?: string;
  focus?: boolean;
}

interface InputSources extends ComponentSource {
  props: Stream<InputProps>;
}

export interface InputSinks extends ComponentSink<"DOM"> {
  input: Stream<string>;
  keypress: Stream<string>;
}

const intent = (sources: InputSources) => {
  const changed$ = domSourceOf(sources)
    .select('input[type="text"]')
    .events("input")
    .map((v) => {
      return (v.target as HTMLInputElement).value;
    });

  const keypress$ = domSourceOf(sources)
    .select('input[type="text"]')
    .events("keypress")
    .map((v) => v.key);

  const element$ = domSourceOf(sources).select('input[type="text"]').element();

  return {
    props$: sources.props,
    changed$,
    keypress$,
    element$,
  };
};

const model = (actions: ReturnType<typeof intent>) => {
  return actions.props$
    .map((props) => {
      const value$ = actions.changed$.startWith(props.value);

      const effect$ = actions.element$
        .map((e) => {
          if (props.focus) {
            (e as HTMLInputElement).focus();
          }
        })
        .startWith(undefined);

      return xs.combine(value$, effect$).map(([v, effect]) => {
        return { value: v, placeholder: props.placeholder, label: props.label, effect };
      });
    })
    .flatten();
};

const containerClass = classes(
  "flex",
  "flex-auto",
  "items-center",
  "flex-row",
  "mx-3",
  "justify-between",
  "whitespace-nowrap",
  "mt-4",
  "first:mt-0"
);
const labelClass = classes("flex-[1_1_40%]", "text-primary-500", "whitespace-nowrap");
const inputClass = classes(
  "w-full",
  "flex-[1_1_60%]",
  "px-4",
  "py-3",
  "border",
  "border-lightgray",
  "outline-1",
  "outline-lightgray",
  "bg-lightgray",
  "rounded",
  "transition-outline",
  "transition-colors",
  "focus:bg-white",
  "focus:outline-primary-400",
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
    input: actions.changed$,
    keypress: actions.keypress$,
  };
};
