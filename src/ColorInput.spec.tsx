import { describe, expect, test, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import ColorInput from "./ColorInput"

describe("ColorInput", () => {
  test("forwards value, type, and disabled to the native color input", () => {
    render(
      <ColorInput
        value="#ff6600"
        type="color"
        disabled
        baseColor="#000000"
        onInput={vi.fn()}
      />
    )

    const input = screen.getByDisplayValue("#ff6600")
    expect(input).toBeInstanceOf(HTMLInputElement)
    expect(input).toHaveAttribute("type", "color")
    expect(input).toBeDisabled()
  })
})
