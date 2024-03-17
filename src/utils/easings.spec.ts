import { lerp } from "./easings"

describe("lerp", () => {
  describe("linearly interpolates", () => {
    test("10, 20, 0.5", () => {
      expect(lerp(10, 20, 0.5)).toBe(15)
    })
    test("0, 1, 0.2", () => {
      expect(lerp(0, 1, 0.2)).toBe(0.2)
    })
    test("0, 10, 0.2", () => {
      expect(lerp(0, 10, 0.2)).toBe(2)
    })
    test("10, 0, 0.2", () => {
      expect(lerp(10, 0, 0.2)).toBe(8)
    })
  })
})
