---
to: src/state/store.ts
inject: true
skip_if: <%= h.changeCase.camel(name) %>
after: "const reducers = {"
---
<%= h.changeCase.camel(name) %>: <%= h.changeCase.camel(name) + '.reducer' %>,
