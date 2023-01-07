export const simpleTransit = (duration: number, callback: (elapsed: number) => void) => {
  if (duration < 10) {
    throw Error("duration must be greater than 10");
  }

  let start: number | undefined;
  let raf: number;

  const _callback: FrameRequestCallback = (time) => {
    if (start === undefined) {
      start = time;
    }

    const elapsed = time - start;

    if (elapsed <= duration) {
      callback(elapsed);
      raf = window.requestAnimationFrame(_callback);
    } else {
      callback(duration);
      window.cancelAnimationFrame(raf);
    }
  };

  raf = window.requestAnimationFrame(_callback);
};
