/**
 * return color generated from any string
 */
export const stringToColour = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += value.toString(16).padStart(2, "0");
  }
  return colour;
};

const color_regexp = /[a-fA-F0-9]{6}/;

export const colorToInvertColor = function colorToInvertColor(color: string) {
  if (color.length !== 7 || color[0] !== "#" || !color.slice(1).match(color_regexp)) {
    throw new Error(`invalid color spec ${color}`);
  }

  const r = 255 - Number.parseInt(color.slice(1, 3), 16);
  const g = 255 - Number.parseInt(color.slice(3, 5), 16);
  const b = 255 - Number.parseInt(color.slice(5, 7), 16);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};
