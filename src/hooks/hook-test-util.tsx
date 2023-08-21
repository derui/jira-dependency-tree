import { Provider } from "react-redux";
import { Store } from "redux";
import { RootState } from "@/state/store";

/**
 * get wrapper for test
 */
export const getWrapper = (store: Store<RootState>) => (props: { children: React.ReactElement }) => {
  return <Provider store={store}>{props.children}</Provider>;
};
