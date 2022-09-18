export interface TextMeasure {
  // return pixel width of text
  getTextWidthOf(text: string): number;

  // return text that given width includes
  chopTextIncludedWidthOf(text: string, requiredWidth: number): string;
}

export const makeTextMeasure = function makeTextMeasure(font: string): TextMeasure {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  context.font = font;

  return {
    getTextWidthOf(text: string): number {
      return context.measureText(text).width;
    },

    chopTextIncludedWidthOf(text: string, requiredWidth: number): string {
      const characters = text.split("");

      let accum = "";

      for (const character of characters) {
        const next = `${accum}${character}`;
        const lineWidth = this.getTextWidthOf(next);

        if (lineWidth >= requiredWidth) {
          break;
        } else {
          accum = next;
        }
      }

      return accum;
    },
  };
};
