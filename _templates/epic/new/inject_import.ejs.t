---
to: src/state/store.ts
inject: true
skip_if: <%= h.changeCase.camel(name) %>Epic
after: "// INJECT EPIC IMPORT HERE"
---
import { <%= h.changeCase.camel(name) %> } from './state/epics/<%= name %>';
