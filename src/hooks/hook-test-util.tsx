import { Provider } from "react-redux";
import { Store } from "redux";
import { act } from "@testing-library/react";
import { RootState } from "@/status/store";

/**
 * get wrapper for test
 */
export const getWrapper = (store: Store<RootState>) => (props: { children: React.ReactElement }) => {
  return <Provider store={store}>{props.children}</Provider>;
};

/**
 * A simple function to wait some promise resolved
 */
export const waitForNextUpdate = () => act(() => Promise.resolve());
