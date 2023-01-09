---
to: src/state/store.ts
inject: true
skip_if: <%= h.changeCase.camel(name) %>Epic
after: "const rootEpics = ["
---
<%= h.changeCase.camel(name) %>Epic(registrar),
