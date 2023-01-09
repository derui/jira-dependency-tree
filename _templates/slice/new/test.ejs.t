---
to: src/state/slices/<%= name %>.test.ts
---
import test from 'ava';
import {getInitialState} from './<%= name %>';

test('initial state', (t) => {
  t.is(getInitialState(), {});
});
