---
to: src/state/slices/<%= name %>.test.ts
---
import {test, expect} from 'vitest';
import {getInitialState} from './<%= name %>';

test('initial state', (t) => {
  t.is(getInitialState(), {});
});
