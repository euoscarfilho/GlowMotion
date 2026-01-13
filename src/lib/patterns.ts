// A function that defines a color pattern for the LED grid.
// x, y: coordinates of the LED
// t: time, for animation
// cols, rows: dimensions of the grid
// colors: the color palette to use
export type PatternFunction = (
  x: number,
  y: number,
  t: number,
  cols: number,
  rows: number,
  colors: string[]
) => string;

// Helper to convert hex to RGB
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
};

// Helper to convert RGB to hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
};

// Helper to interpolate between two colors
const lerpColor = (
  color1: [number, number, number],
  color2: [number, number, number],
  factor: number
): [number, number, number] => {
  const result = color1.slice() as [number, number, number];
  for (let i = 0; i < 3; i++) {
    result[i] = color1[i] + factor * (color2[i] - color1[i]);
  }
  return result;
};

// --- PATTERNS ---

const rainbowWave: PatternFunction = (x, y, t, cols, rows, colors) => {
  const sin = Math.sin(x / (cols / 4) + y / (rows / 4) + t);
  const hue = (sin * 180 + 180) % 360;
  return `hsl(${hue}, 100%, 70%)`;
};

const plasma: PatternFunction = (x, y, t, cols, rows, colors) => {
  const v1 = Math.sin(x / (cols / 8) + t);
  const v2 = Math.sin(y / (rows / 8) + t);
  const v3 = Math.sin((x + y) / ((cols + rows) / 16) + t);
  const v = (v1 + v2 + v3) / 3;
  const colorIndex = Math.floor(((v + 1) / 2) * (colors.length - 1));
  const nextColorIndex = Math.ceil(((v + 1) / 2) * (colors.length - 1));
  const factor = (((v + 1) / 2) * (colors.length - 1)) % 1;
  
  const rgbColors = colors.map(hexToRgb);
  const color1 = rgbColors[colorIndex];
  const color2 = rgbColors[nextColorIndex];

  if (!color1 || !color2) return '#000000';
  
  const finalColor = lerpColor(color1, color2, factor);
  return rgbToHex(finalColor[0], finalColor[1], finalColor[2]);
};

const sparkle: PatternFunction = (x, y, t, cols, rows, colors) => {
    // A pseudo-random but deterministic function of x, y, and t
    const timeSegment = Math.floor(t * 2); // Change sparkle every 0.5s
    const randomSeed = (x * 13 + y * 29 + timeSegment * 41) % 100 / 100;
    
    if (randomSeed > 0.98) { // 2% chance to sparkle
        const colorIndex = Math.floor(Math.random() * colors.length);
        return colors[colorIndex] || '#000000';
    }
    return '#000000';
};

const gradient: PatternFunction = (x, y, t, cols, rows, colors) => {
    const progress = (x / (cols -1) + Math.sin(t / 2)) % 1;
    const colorStops = colors.length -1;
    const startIndex = Math.floor(progress * colorStops);
    const endIndex = Math.min(startIndex + 1, colorStops);
    const localProgress = (progress * colorStops) - startIndex;

    const rgbColors = colors.map(hexToRgb);
    const color1 = rgbColors[startIndex];
    const color2 = rgbColors[endIndex];

    if (!color1 || !color2) return '#000000';

    const finalColor = lerpColor(color1, color2, localProgress);
    return rgbToHex(finalColor[0], finalColor[1], finalColor[2]);
};

const solidColor: PatternFunction = (x, y, t, cols, rows, colors) => {
  const baseColor = colors[0] || '#000000';
  const pulse = (Math.sin(t * 2) + 1) / 2; // oscillates between 0 and 1
  const pulseFactor = 0.8 + pulse * 0.2; // pulse between 80% and 100% brightness

  const rgb = hexToRgb(baseColor);
  const finalColor = rgbToHex(rgb[0] * pulseFactor, rgb[1] * pulseFactor, rgb[2] * pulseFactor);

  return finalColor;
};

const christmasBlinkRandom: PatternFunction = (x, y, t, cols, rows, colors) => {
    const ledIndex = y * cols + x;
    const phase = t * 2;
    const isOn = (phase + ledIndex) % (colors.length + 5) < colors.length;
    if (isOn) {
        const colorIndex = (ledIndex + Math.floor(phase)) % colors.length;
        return colors[colorIndex];
    }
    return '#000000';
};

const christmasTwinkle: PatternFunction = (x, y, t, cols, rows, colors) => {
    const ledIndex = y * cols + x;
    const colorIndex = ledIndex % colors.length;
    const baseColor = colors[colorIndex];
    
    const timeSegment = Math.floor(t * 4);
    const randomSeed = (x * 13 + y * 29 + timeSegment * 41) % 100 / 100;

    if (randomSeed > 0.8) {
        return '#FFFFFF';
    }
    if (randomSeed > 0.6) {
        return '#000000';
    }
    return baseColor;
};

export const patterns: { name: string; id: string; func: PatternFunction }[] = [
  { name: 'Plasma', id: 'plasma', func: plasma },
  { name: 'Rainbow Wave', id: 'rainbow-wave', func: rainbowWave },
  { name: 'Sparkle', id: 'sparkle', func: sparkle },
  { name: 'Gradient', id: 'gradient', func: gradient },
  { name: 'Luzes de Natal', id: 'christmas-blink-random', func: christmasBlinkRandom },
  { name: 'Pisca-Pisca Natal', id: 'christmas-twinkle', func: christmasTwinkle },
  { name: 'Cor Sólida', id: 'solid-color', func: solidColor },
];
