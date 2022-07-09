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
