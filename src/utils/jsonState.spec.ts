import { beforeEach, describe, expect, test, vi } from "vitest"
import { RootStore } from "../state"
import {
  applyImportJson,
  serializeSnapshot,
} from "./jsonState"

vi.mock("../state/localStorage", () => ({
  loadState: () => undefined,
  saveState: vi.fn(),
}))

describe("theme JSON export/import ids", () => {
  beforeEach(() => {
    vi.stubGlobal("confirm", vi.fn(() => true))
  })

  test("theme export omits theme and color ids", () => {
    const store = RootStore.create({
      themes: [
        {
          id: "theme-fixed-id",
          name: "Export Me",
          colors: [
            {
              id: "color-fixed-id",
              name: "Gray",
            },
          ],
          baseColorId: "color-fixed-id",
          backgroundColorId: "color-fixed-id",
          backgroundShadeIndex: 0,
          interpolationCount: 10,
        },
      ],
      ui: {},
      version: "1.0",
    })

    const parsed = JSON.parse(serializeSnapshot(store.themes[0]))

    expect(parsed).not.toHaveProperty("id")
    expect(parsed.colors[0]).not.toHaveProperty("id")
    expect(parsed).not.toHaveProperty("baseColorId")
    expect(parsed).not.toHaveProperty("backgroundColorId")
  })

  test("importing the same theme JSON twice uses new unique ids", () => {
    const store = RootStore.create({
      themes: [
        {
          name: "Seed",
          colors: [{}],
          interpolationCount: 10,
        },
      ],
      ui: {},
      version: "1.0",
    })

    const themeJson = serializeSnapshot(store.themes[0])
    const originalThemeId = store.themes[0].id

    expect(() => {
      applyImportJson(store, themeJson)
      applyImportJson(store, themeJson)
    }).not.toThrow()

    expect(store.themes.length).toBe(3)
    expect(store.themes[1].id).not.toBe(originalThemeId)
    expect(store.themes[2].id).not.toBe(originalThemeId)
    expect(store.themes[1].id).not.toBe(store.themes[2].id)

    const themeIds = store.themes.map((theme) => theme.id)
    expect(new Set(themeIds).size).toBe(themeIds.length)

    const colorIds = store.themes.flatMap((theme) =>
      theme.colors.map((color) => color.id)
    )
    expect(new Set(colorIds).size).toBe(colorIds.length)

    expect(() => {
      store.ui.setCurrentTheme(store.themes[1])
      store.ui.setCurrentTheme(store.themes[2])
    }).not.toThrow()
  })

  test("imported theme remaps base/background color refs to new color ids", () => {
    const store = RootStore.create({
      themes: [
        {
          name: "With Base",
          colors: [
            { id: "color-a", name: "A" },
            { id: "color-b", name: "B" },
          ],
          baseColorId: "color-b",
          backgroundColorId: "color-a",
          backgroundShadeIndex: 2,
          interpolationCount: 10,
        },
      ],
      ui: {},
      version: "1.0",
    })

    const originalBaseColorId = store.themes[0].colors[1].id
    const originalBackgroundColorId = store.themes[0].colors[0].id
    const themeJson = serializeSnapshot(store.themes[0])
    applyImportJson(store, themeJson)

    const imported = store.themes[1]
    expect(imported.baseColorId).toBe(imported.colors[1].id)
    expect(imported.backgroundColorId).toBe(imported.colors[0].id)
    expect(imported.baseColorId).not.toBe(originalBaseColorId)
    expect(imported.backgroundColorId).not.toBe(originalBackgroundColorId)
    expect(imported.backgroundShadeIndex).toBe(2)
  })
})
