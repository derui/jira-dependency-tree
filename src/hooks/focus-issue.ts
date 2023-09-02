import { useContext } from "react";
import { RegistrarContext } from "@/registrar-context";
import { IssueKey } from "@/type";

/**
 * get function to focus issue
 */
export const useFocusIssue = function useFocusIssue(): (key: IssueKey) => void {
  const registrar = useContext(RegistrarContext);

  return (key: IssueKey) => registrar.resolve("sendCommandTo")({ kind: "AttentionIssue", key });
};
