---
to: src/components/<%= type %>/<%= name %>.test.tsx
---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';
import test from 'ava';
import {render, screen, cleanup, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

<%
  splittedNames = name.split('/');
  componentName = splittedNames[splittedNames.length - 1];
%>

import { <%= h.changeCase.pascal(componentName) %> } from './<%= name %>';

test.afterEach(cleanup);

test.serial("should be able to render", (t) => {
  render(<<%= h.changeCase.pascal(componentName) %> />);
});
