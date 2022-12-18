import { jsx, VNode } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import xs, { Stream } from "xstream";
import { classes, generateTestId, selectAsMain } from "../helper";
import { ComponentSinkBase, ComponentSourceBase } from "../type";

type ColorSchema = "primary" | "secondary1" | "gray";

export interface ButtonProps {
  content: VNode;
  schema: ColorSchema;
  type?: "normal" | "submit";
  disabled?: boolean;
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
  const buttonClicked$ = selectAsMain(sources, "button").events("click").mapTo(true);
  const submitClicked$ = selectAsMain(sources, 'input[type="submit"]').events("click").mapTo(true);

  return {
    props$: sources.props,
    clicked$: xs.merge(buttonClicked$, submitClicked$),
  };
};

const model = (actions: ReturnType<typeof intent>) => {
  return actions.props$.map((props) => {
    return {
      ...props,
      type: props.type ?? "normal",
      disabled: props.disabled ?? false,
    };
  });
};

const Styles = {
  button: classes(
    "flex-none",
    "self-end",
    "px-3",
    "py-2",
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
      case "gray":
        return classes("border-gray", "bg-white", "color-black", "hover:bg-lightgray", "active:bg-gray");
    }
  },
};

const view = (state$: ReturnType<typeof model>, gen: ReturnType<typeof generateTestId>) => {
  return state$.map(({ content, schema, type, disabled }) => {
    const style = {
      ...Styles.button,
      ...Styles.color(schema),
    };

    if (type === "normal") {
      return (
        <button class={style} attrs={{ type: "button", disabled }} dataset={{ testid: gen("button") }}>
          {content}
        </button>
      );
    } else {
      return (
        <button class={style} attrs={{ type: "submit", disabled }} dataset={{ testid: gen("button") }}>
          {content}
        </button>
      );
    }
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
