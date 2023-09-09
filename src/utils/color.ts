type RGB = [number, number, number];
type HSL = {
  h: number;
  s: number;
  l: number;
};

/**
 * return color generated from any string
 */
const stringToColor = (str: string): RGB => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colour: RGB = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour[i] = value;
  }
  return colour;
};

// http://marcocorvi.altervista.org/games/imgpr/rgb-hsl.htm
const rgbToHsl = (color: RGB): HSL => {
  const r = Math.max(0, Math.min(color[0], 255)) / 255;
  const g = Math.max(0, Math.min(color[1], 255)) / 255;
  const b = Math.max(0, Math.min(color[2], 255)) / 255;

  const minX = Math.min(r, g, b);
  const maxX = Math.max(r, g, b);
  const l = (minX + maxX) / 2;

  if (minX === maxX) {
    return { l, h: 0, s: 0 };
  }

  let s = 0;
  if (l < 0.5) {
    s = (maxX - minX) / (maxX + minX);
  } else {
    s = (maxX - minX) / (2 - maxX + minX);
  }

  let h = 0;
  if (r === maxX) {
    h = (g - b) / (maxX - minX);
  } else if (g === maxX) {
    h = 2 + (b - r) / (maxX - minX);
  } else {
    h = 4 + (r - g) / (maxX - minX);
  }

  if (h < 0) h = h + 6;

  return { l, s, h };
};

const hslToRgb = (color: HSL): RGB => {
  if (color.s === 0) {
    return [color.l, color.l, color.l] as RGB;
  }

  let temp2 = 0;
  if (color.l < 0.5) {
    temp2 = color.l * (1 + color.s);
  } else {
    temp2 = color.l + color.s - color.l * color.s;
  }

  const temp1 = 2 * color.l - temp2;
  const h = color.h / 6;
  const tempColors = [
    h + 1 / 3 > 1 ? h + 1 / 3 - 1 : h + 1 / 3, // for R
    h, // for G
    h - 1 / 3 < 0 ? h + 1 / 3 + 1 : h - 1 / 3, // for B
  ];

  const colors = [0, 0, 0];
  for (let i = 0; i < colors.length; i++) {
    const temp3 = tempColors[i];

    if (temp3 < 1 / 6) {
      colors[i] = temp1 + (temp2 - temp1) * 6 * temp3;
    } else if (temp3 < 0.5) {
      colors[i] = temp2;
    } else if (temp3 < 2 / 3) {
      colors[i] = temp1 + (temp2 - temp1) * (2 / 3 - temp3) * 6;
    } else {
      colors[i] = temp1;
    }
  }

  return colors.map((v) => Math.max(0, Math.min(255, Math.ceil(v * 255)))) as RGB;
};

/**
 * return color generated from any string
 */
const rgbToString = (color: RGB) => {
  let colorString = "#";
  for (const c of color) {
    colorString += c.toString(16).padStart(2, "0");
  }
  return colorString;
};

/**
 * return color generated from any string
 */
export const stringToColour = (str: string) => {
  const color = stringToColor(str);

  return rgbToString(color);
};

const better_contrast = 4.5;

// https://www.w3.org/TR/WCAG20/#relativeluminancedef
const getRelativeLuminance = function getRelativeLuminance(color: RGB) {
  const s = color.map((v) => v / 255);
  const r = s[0] <= 0.03928 ? s[0] / 12.92 : ((s[0] + 0.055) / 1.055) ** 2.4;
  const g = s[1] <= 0.03928 ? s[1] / 12.92 : ((s[1] + 0.055) / 1.055) ** 2.4;
  const b = s[2] <= 0.03928 ? s[2] / 12.92 : ((s[2] + 0.055) / 1.055) ** 2.4;

  return r * 0.2126 + 0.7152 * g + 0.0722 * b;
};

// get contrast ratio between lighter color and darker color
const getContrastRatio = (lighter: number, darker: number) => {
  return (lighter + 0.05) / (darker / 0.05);
};

/**
 * get a color that is similar to given color with high contrast as possible.
 */
const colorToHighContrastSimilarColor = function colorToHighContrastSimilarColor(color: RGB) {
  const luminance = getRelativeLuminance(color);

  const getRatio = (color: HSL) => {
    const otherLuminance = getRelativeLuminance(hslToRgb(color));

    if (luminance < 0.5) {
      return getContrastRatio(otherLuminance, luminance);
    } else {
      return getContrastRatio(luminance, otherLuminance);
    }
  };
  let similarColor = rgbToHsl(color);
  let trialCount = 0;

  if (luminance < 0.5) {
    // get lighter color
    const luminanceStep = Math.abs(1.0 - similarColor.l) / 5;

    while (getRatio(similarColor) < better_contrast && trialCount < 4) {
      const nextColor = { ...similarColor, l: similarColor.l + luminanceStep };

      similarColor = nextColor;
      trialCount++;
      if (getRatio(nextColor) > better_contrast) {
        break;
      }
    }
  } else {
    // get darker color
    const luminanceStep = Math.abs(similarColor.l) / 5;
    while (getRatio(similarColor) < better_contrast && trialCount < 4) {
      const nextColor = { ...similarColor, l: similarColor.l - luminanceStep };

      similarColor = nextColor;
      trialCount++;
      if (getRatio(nextColor) > better_contrast) {
        break;
      }
    }
  }

  return hslToRgb(similarColor);
};

/**
 * return high contrast color generated from any string
 */
export const stringToHighContrastColor = (str: string) => {
  const color = stringToColor(str);

  return rgbToString(colorToHighContrastSimilarColor(color));
};
