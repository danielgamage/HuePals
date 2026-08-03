import { describe, expect, test } from "vitest"
import { RootStore } from "./index"

describe("Color.setHex", () => {
  test("writes OKLCH-scale saturation and lightness (not HSL×100)", () => {
    const store = RootStore.create({
      themes: [{ colors: [{}], interpolationCount: 10 }],
      ui: {},
      version: "1.0",
    })
    const color = store.themes[0].colors[0]

    color.setHex("start", "#ff0000")

    // OKLCH chroma is roughly 0–0.4; lightness is 0–1
    expect(color.saturationSpline[1]).toBeGreaterThanOrEqual(0)
    expect(color.saturationSpline[1]).toBeLessThanOrEqual(0.5)
    expect(color.lightnessSpline[1]).toBeGreaterThanOrEqual(0)
    expect(color.lightnessSpline[1]).toBeLessThanOrEqual(1)
  })

  test("end handle also stays in OKLCH ranges", () => {
    const store = RootStore.create({
      themes: [{ colors: [{}], interpolationCount: 10 }],
      ui: {},
      version: "1.0",
    })
    const color = store.themes[0].colors[0]

    color.setHex("end", "#0000ff")

    expect(color.saturationSpline[7]).toBeLessThanOrEqual(0.5)
    expect(color.lightnessSpline[7]).toBeLessThanOrEqual(1)
  })
})
