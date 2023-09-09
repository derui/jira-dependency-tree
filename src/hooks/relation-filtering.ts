import { useAppDispatch } from "./_internal-hooks";
import * as Actions from "@/status/actions";

interface Result {
  /**
   * filter relation with term
   */
  filter: (term: string) => void;

  /**
   * clear filtring for relations
   */
  clear: () => void;
}

/**
 * get methods to edit relation between issues
 */
export const useRelationFiltering = function useRelationFiltering(): Result {
  const dispatch = useAppDispatch();

  const filter = (term: string) => {
    dispatch(Actions.relations.filter(term));
  };

  const clear = () => {
    dispatch(Actions.relations.clearFilter());
  };

  return {
    filter,
    clear,
  };
};
