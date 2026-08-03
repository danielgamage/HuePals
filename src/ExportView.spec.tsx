import { describe, expect, test, beforeEach } from "vitest"
import { act, render } from "@testing-library/react"
import { applySnapshot } from "mobx-state-tree"
import state from "./state"
import ExportView from "./ExportView"

describe("ExportView textarea", () => {
  beforeEach(() => {
    applySnapshot(state, {
      themes: [
        {
          name: "Export Theme",
          colors: [{}],
          interpolationCount: 10,
        },
      ],
      ui: {
        exportLanguage: "css",
        colorspace: "hex",
        tab: "export",
      },
      version: "1.0",
    })
    state.ui.setCurrentTheme(state.themes[0])
  })

  test("keeps the textarea in sync when export language changes", () => {
    const theme = state.themes[0]
    const { container } = render(<ExportView theme={theme} />)
    const textarea = container.querySelector("textarea")

    expect(textarea).toBeTruthy()
    const initial = theme.exportText
    expect(textarea).toHaveValue(initial)

    act(() => {
      state.ui.setExportLanguage("csv")
    })
    expect(theme.exportText).not.toBe(initial)
    expect(textarea).toHaveValue(theme.exportText)
  })
})
