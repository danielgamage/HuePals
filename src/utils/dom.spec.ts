import { afterEach, describe, expect, test, vi } from "vitest"
import { copyText } from "./dom"

describe("copyText", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test("rejects when the clipboard API fails", async () => {
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: vi.fn(() => {
          throw new Error("denied")
        }),
      },
    })

    await expect(copyText("hello")).rejects.toThrow("denied")
  })
})
