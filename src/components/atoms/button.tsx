import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { Stream } from "xstream";
import { classes, generateTestId, selectAsMain } from "../helper";
import { ComponentSinkBase, ComponentSourceBase } from "../type";

type ColorSchema = "primary" | "secondary1";

export interface ButtonProps {
  label: string;
  schema: ColorSchema;
}

interface ButtonSources extends ComponentSourceBase {
  props: Stream<ButtonProps>;
}

interface ButtonSinks extends ComponentSinkBase {
  /**
   * flow click event. values are always `true`
   */
  click: Stream<boolean>;
}

const intent = (sources: ButtonSources) => {
  const clicked$ = selectAsMain(sources, "button").events("click").mapTo(true);

  return {
    props$: sources.props,
    clicked$,
  };
};

const model = (actions: ReturnType<typeof intent>) => {
  return actions.props$.map((props) => {
    return { label: props.label, schema: props.schema };
  });
};

const Styles = {
  button: classes(
    "flex-none",
    "self-end",
    "p-3",
    "rounded",
    "transition-colors",
    "border",
    "disabled:color-gray",
    "disabled:bg-white",
    "disabled:border-gray"
  ),

  color: (schema: ColorSchema) => {
    switch (schema) {
      case "secondary1":
        return classes(
          "border-secondary1-100",
          "bg-secondary1-200",
          "color-white",
          "hover:bg-secondary1-300",
          "active:bg-secondary1-400"
        );
      case "primary":
        return classes(
          "border-primary-100",
          "bg-primary-200",
          "color-white",
          "hover:bg-primary-300",
          "active:bg-primary-400"
        );
    }
  },
};

const view = (state$: ReturnType<typeof model>, gen: ReturnType<typeof generateTestId>) => {
  return state$.map(({ label, schema }) => {
    const style = {
      ...Styles.button,
      ...Styles.color(schema),
    };

    return (
      <button class={style} dataset={{ testid: gen("button") }}>
        {label}
      </button>
    );
  });
};

export const Button = (sources: ButtonSources): ButtonSinks => {
  const gen = generateTestId(sources.testid);
  const actions = intent(sources);
  const state$ = model(actions);

  return {
    DOM: view(state$, gen),
    click: actions.clicked$,
  };
};
