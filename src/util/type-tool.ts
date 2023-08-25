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

/**
 * get the type of second argument of function
 */
export type SecondArg<T extends (r: any, r2: any, ...args: Array<any>) => any> = T extends (
  r: any,
  r2: infer R,
  ...args: Array<any>
) => any
  ? R
  : never;
/* eslint-enable @typescript-eslint/no-explicit-any */
