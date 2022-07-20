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

// Deadly simple rect class
export class Rect {
  readonly top: number;
  readonly left: number;
  readonly right: number;
  readonly bottom: number;
  constructor(args: { top: number; left: number; right: number; bottom: number }) {
    this.top = args.top;
    this.left = args.left;
    this.right = args.right;
    this.bottom = args.bottom;
  }

  static fromDOMRect(rect: DOMRect) {
    return new Rect({
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
    });
  }

  get height() {
    return Math.max(this.bottom - this.top, 0);
  }

  get width() {
    return Math.max(this.right - this.left, 0);
  }
}
