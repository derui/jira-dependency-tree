// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import test from "ava";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { UserConfigurationDialog } from "./user-configuration-dialog";

test.afterEach(cleanup);

test.serial("should be able to render", (t) => {
  render(<UserConfigurationDialog />);
});
