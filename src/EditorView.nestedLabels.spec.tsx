import { describe, expect, test, beforeEach } from "vitest"
import { render } from "@testing-library/react"
import { applySnapshot } from "mobx-state-tree"
import state from "./state"
import EditorView from "./EditorView"

describe("EditorView markup", () => {
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
        isValueVisible: true,
        tab: "editor",
      },
      version: "1.0",
    })
    state.ui.setCurrentTheme(state.themes[0])
  })

  test("does not nest label elements inside other labels", () => {
    const { container } = render(<EditorView theme={state.themes[0]} />)
    expect(container.querySelectorAll("label label").length).toBe(0)
  })
})
