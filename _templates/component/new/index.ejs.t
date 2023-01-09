---
to: src/components/<%= type %>/<%= name %>.tsx
---
import React from 'react';

export interface Props {
  // need Property definition
}

<%
  splittedNames = name.split('/');
  componentName = splittedNames[splittedNames.length - 1];
%>

export const <%= h.changeCase.pascal(componentName) %>: React.FC<Props> = (props) => {

  return <span>need implementation</span>
};
