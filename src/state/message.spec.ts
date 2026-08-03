import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { applySnapshot, getSnapshot } from "mobx-state-tree"
import { RootStore } from "./index"

describe("Message.dismiss lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test("dismiss timeout does not throw after the message is removed", () => {
    const store = RootStore.create({
      themes: [{ colors: [{}] }],
      ui: {},
      version: "1.0",
    })

    store.ui.addMessage({ body: "hello" })
    expect(store.ui.messages.length).toBe(1)

    applySnapshot(store, {
      ...getSnapshot(store),
      ui: {
        ...getSnapshot(store.ui),
        messages: [],
      },
    })
    expect(store.ui.messages.length).toBe(0)

    expect(() => {
      vi.runAllTimers()
    }).not.toThrow()
  })
})
