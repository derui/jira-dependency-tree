import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { useContext } from "react";
import type { AppDispatch, RootState } from "@/state/store";
import { RegistrarContext } from "@/registrar-context";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * get registrar from context
 */
export const useRegistrar = () => {
  return useContext(RegistrarContext);
};
