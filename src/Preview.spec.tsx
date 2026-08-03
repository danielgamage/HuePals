import { describe, expect, test } from "vitest"
import { render } from "@testing-library/react"
import { RootStore } from "./state"
import Preview from "./Preview"

describe("Preview", () => {
  test("does not crash when the theme has no colors", () => {
    const store = RootStore.create({
      themes: [
        {
          name: "Empty Theme",
          colors: [],
          interpolationCount: 10,
        },
      ],
      ui: {},
      version: "1.0",
    })
    const theme = store.themes[0]

    expect(() => render(<Preview theme={theme} />)).not.toThrow()
  })
})
