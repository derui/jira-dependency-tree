---
to: src/state/store.ts
inject: true
skip_if: <%= h.changeCase.camel(name) %>Epic(registrar)
after: "const rootEpics = \\["
---
...<%= h.changeCase.camel(name) %>Epic(registrar),
