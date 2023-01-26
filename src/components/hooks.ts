import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import type { AppDispatch, RootState } from "@/state/store";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const TransitionState = {
  Entering: "Entering",
  Entered: "Entered",
  Exiting: "Exiting",
  Exited: "Exited",
} as const;

export type TransitionState = typeof TransitionState[keyof typeof TransitionState];

const useTransitionState = (duration = 250) => {
  const [state, setState] = useState<TransitionState | undefined>();

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    if (state === TransitionState.Entering) {
      timerId = setTimeout(() => {
        setState(TransitionState.Entered);
      }, duration);
    }

    if (state === TransitionState.Exiting) {
      timerId = setTimeout(() => {
        setState(TransitionState.Exited);
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
 * transition state control
 */
export const useTransitionControl = (duration: number): [EnterFn, ExitFn, TransitionState | undefined] => {
  const [state, setState] = useTransitionState(duration);

  const enter = () => {
    if (state !== TransitionState.Exiting) {
      setState(TransitionState.Entering);
    }
  };

  const exit = () => {
    if (state !== TransitionState.Entering) {
      setState(TransitionState.Exiting);
    }
  };

  return [enter, exit, state];
};
