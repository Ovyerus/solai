// Fixed artwork settings shared by both canvas renderers; no browser state here.
export const artPattern = {
  size: 8,
  values: new Uint8Array([
     0, 32,  8, 40,  2, 34, 10, 42,
    48, 16, 56, 24, 50, 18, 58, 26,
    12, 44,  4, 36, 14, 46,  6, 38,
    60, 28, 52, 20, 62, 30, 54, 22,
     3, 35, 11, 43,  1, 33,  9, 41,
    51, 19, 59, 27, 49, 17, 57, 25,
    15, 47,  7, 39, 13, 45,  5, 37,
    63, 31, 55, 23, 61, 29, 53, 21,
  ]),
};

export const artSettings = Object.freeze({
  scale: 1.5,
  spread: 0.25,
  threshold: 0.54,
  contrast: 1.1,
  motion: 1,
  cursorStrength: 0.65,
});
