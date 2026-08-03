import { describe, expect, test, beforeEach } from "vitest"
import store from "./index"

describe("localStorage persistence", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test("beforeunload save omits theme undo history", () => {
    // Touch theme state so UndoManager has something to record
    store.themes[0]?.colors[0]?.setSpline("hue", [
      0, 200, 0.3, 180, 0.7, 160, 1, 140,
    ])

    window.dispatchEvent(new Event("beforeunload"))

    const raw = localStorage.getItem("huepals__state")
    expect(raw).toBeTruthy()
    const saved = JSON.parse(raw!)

    for (const theme of saved.themes ?? []) {
      expect(theme).not.toHaveProperty("history")
    }
  })
})
