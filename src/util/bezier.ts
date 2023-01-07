export const factorialize = (v: number): number => {
  if (v < 0) {
    throw Error(`Can not factorialize with ${v}`);
  }

  if (v === 0) {
    return 1;
  } else {
    return v * factorialize(v - 1);
  }
};

const bernsteinBasis = (t: number, n: number, i: number) => {
  const binominalCoefficient = factorialize(n) / (factorialize(i) * factorialize(n - i));

  return binominalCoefficient * Math.pow(t, i) * Math.pow(1 - t, n - i);
};

export const cubicBezier = (controlPoint: [number, number, number, number]): ((t: number) => number) => {
  return (t: number) => {
    return controlPoint.reduce((accum, point, index) => {
      return accum + bernsteinBasis(t, 3, index) * point;
    }, 0);
  };
};
