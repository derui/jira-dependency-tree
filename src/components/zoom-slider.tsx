import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { MemoryStream } from "xstream";
import { ComponentSinks, ComponentSources } from "@/components/type";
import { selectAsMain } from "@/components/helper";

export interface ZoomSliderProps {
  zoom: number;
}

type ZoomSliderSources = ComponentSources<{
  props: MemoryStream<ZoomSliderProps>;
}>;

type ZoomSliderSinks = ComponentSinks<{}>;

const intent = function intent(sources: ZoomSliderSources) {
  const clicked$ = selectAsMain(sources, ".zoom-slider").events("click").mapTo(true);

  return { props$: sources.props, clicked$ };
};

const model = function model(actions: ReturnType<typeof intent>) {
  const zoom$ = actions.props$.map((v) => v.zoom);

  return zoom$;
};

const view = function view(state$: ReturnType<typeof model>) {
  return state$.map((zoom) => {
    return (
      <div class={{ "zoom-slider": true }} dataset={{ testid: "main" }}>
        <span class={{ "zoom-slider__current-zoom": true }} dataset={{ testid: "current-zoom" }}>{`${zoom}%`}</span>
      </div>
    );
  });
};

export const ZoomSlider = function ZoomSlider(sources: ZoomSliderSources): ZoomSliderSinks {
  const actions = intent(sources);
  const state$ = model(actions);

  return {
    DOM: view(state$),
  };
};