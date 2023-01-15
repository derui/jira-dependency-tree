export type TestIdGenerator = ReturnType<typeof generateTestId>;

export const generateTestId = function generateTestId(parent: string | undefined, separator = "/") {
  const fixedParent = parent ? `${parent}${separator}` : "";

  return (id: string) => `${fixedParent}${id}`;
};

export interface BaseProps {
  testid?: string;
}

/**
 * shortcut function to get snabbdom's classes object from array of classes
 */
export const classes = (...classes: string[]) => {
  return classes.reduce((accum, v) => {
    accum[v] = true;

    return accum;
  }, {} as Record<string, boolean>);
};
