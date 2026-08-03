import { describe, expect, test, beforeEach } from "vitest"
import { render } from "@testing-library/react"
import { applySnapshot } from "mobx-state-tree"
import state from "./state"
import EditorView from "./EditorView"

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

describe("EditorView color inputs", () => {
  beforeEach(() => {
    applySnapshot(state, {
      themes: [
        {
          name: "Test Theme",
          colors: [{}],
          interpolationCount: 10,
        },
      ],
      ui: {
        isGraphVisible: false,
        isValueVisible: false,
        tab: "editor",
      },
      version: "1.0",
    })
    state.ui.setCurrentTheme(state.themes[0])
  })

  test("passes hex values to color inputs (not oklch)", () => {
    const theme = state.themes[0]
    const { container } = render(<EditorView theme={theme} />)

    const colorInputs = container.querySelectorAll('input[type="color"]')
    expect(colorInputs.length).toBeGreaterThan(0)

    colorInputs.forEach((input) => {
      const value = input.getAttribute("value")
      expect(value, "color input should have a value").toBeTruthy()
      expect(value).toMatch(HEX_COLOR)
    })
  })
})
