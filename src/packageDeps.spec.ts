import { describe, expect, test } from "vitest"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const pkg = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "..", "package.json"),
    "utf8"
  )
)

describe("package.json runtime dependencies", () => {
  test("ships mobx stack as production dependencies", () => {
    expect(pkg.dependencies).toHaveProperty("mobx")
    expect(pkg.dependencies).toHaveProperty("mobx-react")
    expect(pkg.dependencies).toHaveProperty("mobx-state-tree")
    expect(pkg.dependencies).toHaveProperty("bezier-js")
    expect(pkg.dependencies).toHaveProperty("lodash")
  })
})
