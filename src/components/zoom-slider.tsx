import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { MemoryStream } from "xstream";
import { ComponentSinkBase, ComponentSourceBase } from "@/components/type";
import { classes, generateTestId, selectAsMain } from "@/components/helper";

export interface ZoomSliderProps {
  zoom: number;
}

interface ZoomSliderSources extends ComponentSourceBase {
  props: MemoryStream<ZoomSliderProps>;
}

const intent = (sources: ZoomSliderSources) => {
  const clicked$ = selectAsMain(sources, ".zoom-slider").events("click").mapTo(true);

  return { props$: sources.props, clicked$ };
};

const model = (actions: ReturnType<typeof intent>) => {
  return actions.props$.map((v) => Math.round(v.zoom));
};

const Styles = {
  root: classes("absolute", "flex", "right-4", "bottom-4", "p-4", "bg-white"),
  currentZoom: classes("inline-block", "text-center"),
};

const view = (state$: ReturnType<typeof model>, gen: ReturnType<typeof generateTestId>) => {
  return state$.map((zoom) => {
    return (
      <div class={Styles.root}>
        <span class={Styles.currentZoom} dataset={{ testid: gen("current-zoom") }}>{`${zoom}%`}</span>
      </div>
    );
  });
};

export const ZoomSlider = (sources: ZoomSliderSources): ComponentSinkBase => {
  const actions = intent(sources);
  const state$ = model(actions);

  return {
    DOM: view(state$, generateTestId(sources.testid)),
  };
};
