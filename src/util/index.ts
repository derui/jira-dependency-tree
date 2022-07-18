/**
   Make difference between two sets.

   Return new Set [a - b]. Returned set contains elements that are not in [b].
 */
export const difference = function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
  const diff = new Set<T>(a);

  for (const v of b) {
    diff.delete(v);
  }

  return diff;
};

// check constraint and throw error if constraint is broken.
export const constraint = function constraint(condition: boolean, message?: string) {
  let revisedMessage = message ?? "Detect invalid constraint";

  if (!condition) {
    throw Error(revisedMessage);
  }
};

// A simple type guard to remove undefined
export const filterUndefined = function filterUndefined<T>(value: T | undefined): value is T {
  return value !== undefined;
};

export const filterNull = function filterNull<T>(value: T | null): value is T {
  return value !== null;
};
