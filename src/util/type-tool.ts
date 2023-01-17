/**
 * get the type of first argument of function
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type FirstArg<T extends (r: any, ...args: Array<any>) => any> = T extends (
  r: infer R,
  ...args: Array<any>
) => any
  ? R
  : never;
/* eslint-enable @typescript-eslint/no-explicit-any */
