import { jsx, VNode } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import xs, { Stream } from "xstream";
import { classes, domSourceOf, generateTestId, ComponentSink, ComponentSource } from "../helper";

type ColorSchema = "primary" | "secondary1" | "gray";

export interface ButtonProps {
  content: VNode;
  schema: ColorSchema;
  type?: "normal" | "submit";
  disabled?: boolean;
}

interface ButtonSources extends ComponentSource {
  props: Stream<ButtonProps>;
}

interface ButtonSinks extends ComponentSink<"DOM"> {
  /**
   * flow click event. values are always `true`
   */
  click: Stream<boolean>;
}

const intent = (sources: ButtonSources) => {
  const buttonClicked$ = domSourceOf(sources).select("button").events("click", { bubbles: false }).mapTo(true);
  const submitClicked$ = domSourceOf(sources)
    .select('input[type="submit"]')
    .events("click", { bubbles: false })
    .mapTo(true);

  return {
    clicked$: xs.merge(buttonClicked$, submitClicked$),
  };
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
    "disabled:bg-lightgray",
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

const view = (state$: Stream<Required<ButtonProps>>, gen: ReturnType<typeof generateTestId>) => {
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
  const state$ = sources.props.map((props) => {
    return {
      ...props,
      type: props.type ?? "normal",
      disabled: props.disabled ?? false,
    };
  });

  return {
    DOM: view(state$, gen),
    click: actions.clicked$,
  };
};
