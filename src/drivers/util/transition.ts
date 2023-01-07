export const simpleTransit = (duration: number): ((callback: (time: number) => void) => void) => {
  if (duration < 10) {
    throw Error("duration must be greater than 10");
  }

  return (callback) => {
    let start: number | undefined;
    let raf: number;

    const _callback: FrameRequestCallback = (time) => {
      if (start === undefined) {
        start = time;
      }

      const elapsed = time - start;

      callback(Math.min(1.0, elapsed / duration));

      if (elapsed <= duration) {
        raf = window.requestAnimationFrame(_callback);
      } else {
        window.cancelAnimationFrame(raf);
      }
    };

    raf = window.requestAnimationFrame(_callback);
  };
};
