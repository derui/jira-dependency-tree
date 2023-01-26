import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import type { AppDispatch, RootState } from "@/state/store";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const State = {
  Entering: "Entering",
  Entered: "Entered",
  Exiting: "Exiting",
  Exited: "Exited",
};

type State = typeof State[keyof typeof State];

const useTransitionState = (duration = 250) => {
  const [state, setState] = useState<State | undefined>();

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    if (state === State.Entering) {
      timerId = setTimeout(() => {
        setState(State.Entered);
      }, duration);
    }

    if (state === State.Exiting) {
      timerId = setTimeout(() => {
        setState(State.Exited);
      }, duration);
    }

    return () => {
      timerId && clearTimeout(timerId);
    };
  });

  return [state, setState] as const;
};

type EnterFn = () => void;
type ExitFn = () => void;

/**
 * transition state
 */
export const useTransition = (duration: number): [EnterFn, ExitFn, State | undefined] => {
  const [state, setState] = useTransitionState(duration);

  const enter = () => {
    if (state !== State.Exiting) {
      setState(State.Entering);
    }
  };

  const exit = () => {
    if (state !== State.Entering) {
      setState(State.Exiting);
    }
  };

  return [enter, exit, state];
};
