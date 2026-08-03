import { describe, expect, test } from "vitest"
import { applySnapshot, getSnapshot } from "mobx-state-tree"
import { RootStore } from "./index"

describe("Color interpolations", () => {
  test("shade identities are stable across repeated access", () => {
    const store = RootStore.create({
      themes: [{ colors: [{}], interpolationCount: 10 }],
      ui: {},
      version: "1.0",
    })
    const color = store.themes[0].colors[0]

    const firstId = color.shades[0].id
    const secondId = color.shades[0].id
    expect(firstId).toBe(secondId)
  })

  test("interpolationCount of 1 samples the start of the spline", () => {
    const store = RootStore.create({
      themes: [{ colors: [{}], interpolationCount: 1 }],
      ui: {},
      version: "1.0",
    })
    const color = store.themes[0].colors[0]
    const shade = color.shades[0]

    // One shade should represent the start handle, not be clamped to the end
    // via (count - 1) === 0 → Infinity → Math.min(..., 0.999999).
    expect(shade.l).toBeCloseTo(color.lightnessSpline[1], 2)
    expect(shade.h).toBeCloseTo(color.hueSpline[1], 0)
  })

  test("short/corrupt splines do not throw when reading interpolations", () => {
    const store = RootStore.create({
      themes: [{ colors: [{}], interpolationCount: 10 }],
      ui: {},
      version: "1.0",
    })
    const color = store.themes[0].colors[0]

    applySnapshot(color, {
      ...getSnapshot(color),
      hueSpline: [0, 100],
      saturationSpline: [0],
      lightnessSpline: [],
    })

    let readError: unknown
    try {
      void color.interpolations.length
    } catch (err) {
      readError = err
    }
    expect(readError).toBeUndefined()
  })
})
