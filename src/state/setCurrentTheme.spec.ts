import { describe, expect, test } from "vitest"
import { RootStore } from "./index"

describe("UIStore.setCurrentTheme", () => {
  test("clears background selection on the theme being left", () => {
    const store = RootStore.create({
      themes: [
        {
          name: "A",
          colors: [{ name: "Gray" }],
          interpolationCount: 10,
        },
        {
          name: "B",
          colors: [{ name: "Gray" }],
          interpolationCount: 10,
        },
      ],
      ui: {},
      version: "1.0",
    })

    const themeA = store.themes[0]
    const themeB = store.themes[1]
    themeA.setBackgroundShade(themeA.colors[0].id, 0)
    expect(themeA.backgroundColorId).toBe(themeA.colors[0].id)

    store.ui.setCurrentTheme(themeA)
    store.ui.setCurrentTheme(themeB)

    expect(themeA.backgroundColorId).toBeUndefined()
    expect(themeA.backgroundShadeIndex).toBeUndefined()
  })
})
