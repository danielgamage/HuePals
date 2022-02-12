export const lerp = (start, end, position) => {
  return (1 - position) * start + position * end
}

export const remap = (value, min1, max1, min2, max2) => {
  return min2 + ((value - min1) * (max2 - min2)) / (max1 - min1)
}

export const easings = {
  linear: {
    name: "Linear",
    handles: [1 / 3, 1 / 3, (1 / 3) * 2, (1 / 3) * 2],
  },
  linear2: {
    name: "Linear",
    handles: [1 / 3, 1 / 3, (1 / 3) * 2, (1 / 3) * 2],
  },
  linear3: {
    name: "Linear",
    handles: [1 / 3, 1 / 3, (1 / 3) * 2, (1 / 3) * 2],
  },
  easeInSine: { name: "Sine In", handles: [0.12, 0, 0.39, 0] },
  easeOutSine: { name: "Sine Out", handles: [0.61, 1, 0.88, 1] },
  easeInOutSine: { name: "Sine", handles: [0.37, 0, 0.63, 1] },
  easeInQuad: { name: "Quad In", handles: [0.11, 0, 0.5, 0] },
  easeOutQuad: { name: "Quad Out", handles: [0.5, 1, 0.89, 1] },
  easeInOutQuad: { name: "Quad", handles: [0.45, 0, 0.55, 1] },
  easeInCubic: { name: "Cubic In", handles: [0.32, 0, 0.67, 0] },
  easeOutCubic: { name: "Cubic Out", handles: [0.33, 1, 0.68, 1] },
  easeInOutCubic: { name: "Cubic", handles: [0.65, 0, 0.35, 1] },
  easeInQuart: { name: "Quart In", handles: [0.5, 0, 0.75, 0] },
  easeOutQuart: { name: "Quart Out", handles: [0.25, 1, 0.5, 1] },
  easeInOutQuart: { name: "Quart", handles: [0.76, 0, 0.24, 1] },
  easeInQuint: { name: "Quint In", handles: [0.64, 0, 0.78, 0] },
  easeOutQuint: { name: "Quint Out", handles: [0.22, 1, 0.36, 1] },
  easeInOutQuint: { name: "Quint", handles: [0.83, 0, 0.17, 1] },
  easeInExpo: { name: "Expo In", handles: [0.7, 0, 0.84, 0] },
  easeOutExpo: { name: "Expo Out", handles: [0.16, 1, 0.3, 1] },
  easeInOutExpo: { name: "Expo", handles: [0.87, 0, 0.13, 1] },
  easeInCirc: { name: "Circ In", handles: [0.55, 0, 1, 0.45] },
  easeOutCirc: { name: "Circ Out", handles: [0, 0.55, 0.45, 1] },
  easeInOutCirc: { name: "Circ", handles: [0.85, 0, 0.15, 1] },
  easeInBack: { name: "Back In", handles: [0.36, 0, 0.66, -0.56] },
  easeOutBack: { name: "Back Out", handles: [0.34, 1.56, 0.64, 1] },
  easeInOutBack: { name: "Back", handles: [0.68, -0.6, 0.32, 1.6] },
}
