---
to: src/state/store.ts
inject: true
skip_if: <%= h.changeCase.camel(name) %>
after: "const reducers = ["
---

