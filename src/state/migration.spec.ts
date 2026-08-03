import { describe, expect, test } from "vitest"
import { RootStore } from "./index"

describe("HSL → OKLCH loadState migration", () => {
  test("converts legacy HSL-scale lightness/saturation splines into OKLCH ranges", () => {
    const store = RootStore.create({
      themes: [{ colors: [{}], interpolationCount: 10 }],
      ui: {},
      version: "1.0",
    })

    // Legacy HSL-era spline: lightness/saturation stored on 0–100 scale
    store.loadState({
      themes: [
        {
          name: "Legacy",
          interpolationCount: 10,
          colors: [
            {
              name: "Gray",
              hueSpline: [0, 200, 0.3, 180, 0.7, 160, 1, 140],
              saturationSpline: [0, 50, 0.3, 40, 0.7, 30, 1, 20],
              lightnessSpline: [0, 90, 0.3, 60, 0.7, 30, 1, 10],
            },
          ],
        },
      ],
      ui: {},
      version: "1.0",
    })

    const color = store.themes[0].colors[0]
    for (let i = 1; i < color.lightnessSpline.length; i += 2) {
      expect(color.lightnessSpline[i]).toBeLessThanOrEqual(1)
    }
    for (let i = 1; i < color.saturationSpline.length; i += 2) {
      expect(color.saturationSpline[i]).toBeLessThanOrEqual(0.5)
    }
  })
})
