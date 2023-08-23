import { createContext } from "react";
import { Dependencies } from "./dependencies";
import { DependencyRegistrar } from "./util/dependency-registrar";

/**
 * a context to get dependency registrar
 */
export const RegistrarContext = createContext<DependencyRegistrar<Dependencies>>(
  null as unknown as DependencyRegistrar<Dependencies>,
);
