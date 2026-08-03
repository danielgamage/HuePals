import { describe, expect, test } from "vitest"
import { RootStore } from "./index"

const createStoreWithTheme = (colors: object[] = [{}]) =>
  RootStore.create({
    themes: [
      {
        name: "Test Theme",
        colors,
        interpolationCount: 10,
      },
    ],
    ui: {},
    version: "1.0",
  })

describe("Theme empty colors", () => {
  test("removeColor does not remove the last remaining color", () => {
    const store = createStoreWithTheme([{}])
    const theme = store.themes[0]
    const onlyColor = theme.colors[0]

    expect(theme.colors.length).toBe(1)
    theme.removeColor(onlyColor)
    expect(theme.colors.length).toBe(1)
  })

  test("svgString does not throw when colors is empty", () => {
    const store = createStoreWithTheme([])
    const theme = store.themes[0]

    expect(theme.colors.length).toBe(0)
    expect(() => theme.svgString).not.toThrow()
    expect(theme.svgString).toContain("<svg")
  })
})
