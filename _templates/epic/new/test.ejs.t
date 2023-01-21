---
to: src/state/epics/<%= name %>.test.ts
---
import {test, expect} from 'vitest';
import * as epic from './<%= name %>';
import {createDependencyRegistrar} from '../../util/dependency-registrar';
import {Dependencies} from '../../dependencies';

const registrar = createDependencyRegistrar<Dependencies>();
const env = {
  apiBaseUrl: 'http://base.url',
  apiKey: 'key'
};

test('test epic', async (t) => {

});
