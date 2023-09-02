export type TestIdGenerator = ReturnType<typeof generateTestId>;

export const generateTestId = function generateTestId(parent: string | undefined, separator = "/") {
  const fixedParent = parent ? `${parent}${separator}` : "";

  return (id: string) => `${fixedParent}${id}`;
};

export interface BaseProps {
  testid?: string;
}
