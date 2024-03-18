// eg. `value: "0.00"` becomes `parts: [{ value: "0.0", type: "insignificant" }, { value: "0", type: "significant" }]`
// eg. `value: "0.21"` becomes `parts: [{ value: "0.", type: "insignificant" }, { value: "21", type: "significant" }]`
// eg. `value: "1.00"` becomes `parts: [{ value: "1.00", type: "significant" }]`
import {describe, it, expect, test } from "vitest"
import { separateNumericStringIntoParts } from "./string"

describe("separateNumericStringIntoParts", () => {
  describe("should separate a string into parts", () => {
    test("zero", () => {
      expect(separateNumericStringIntoParts("0.00")).toEqual([
        { value: "0.0", type: "insignificant" },
        { value: "0", type: "significant" },
      ])
    })
    test("decimal below 1", () => {
      expect(separateNumericStringIntoParts("0.21")).toEqual([
        { value: "0.", type: "insignificant" },
        { value: "21", type: "significant" },
      ])
    })
    test("decimal below .1", () => {
      expect(separateNumericStringIntoParts("0.01")).toEqual([
        { value: "0.0", type: "insignificant" },
        { value: "1", type: "significant" },
      ])
    })
    test("1.00", () => {
      expect(separateNumericStringIntoParts("1.00")).toEqual([
        { value: "1.00", type: "significant" },
      ])
    })
  })
})