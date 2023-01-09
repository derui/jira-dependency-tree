---
to: src/state/epics/<%= name %>.ts
---
import {ofType} from 'redux-observable';
import * as actions from '../actions';
import type RootState from '../store';
import type {Dependencies} from '@/dependencies';
import { DependencyRegistrar } from "@/util/dependency-registrar";

export const <%= h.changeCase.camel(name) %>Epic = (registrar: DependencyRegistrar<Dependencies>) => (action$: Observable<actions.Actions>, state$: Observable<RootState>) =>
  action$.pipe(
    ofType(''),
    // implement epic
  );
