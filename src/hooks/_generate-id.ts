import { useContext } from "react";
import { RegistrarContext } from "@/registrar-context";

/**
 * get function to generate unique id
 */
export const useGenerateId = function useGenerateId(): () => string {
  const registrar = useContext(RegistrarContext);

  return () => registrar.resolve("generateId")();
};
