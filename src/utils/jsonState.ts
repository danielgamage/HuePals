import { getSnapshot, IAnyStateTreeNode } from "mobx-state-tree"
import { saveState } from "../state/localStorage"

export const serializeSnapshot = (node: IAnyStateTreeNode) =>
  JSON.stringify(getSnapshot(node), null, 2)

export const downloadJson = (filename: string, content: string) => {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json" })
  )
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const parseImportJson = (
  text: string
): { kind: "store" | "theme"; snapshot: object } => {
  const parsed = JSON.parse(text)

  if (parsed && Array.isArray(parsed.themes)) {
    return { kind: "store", snapshot: parsed }
  }

  if (parsed && Array.isArray(parsed.colors)) {
    return { kind: "theme", snapshot: parsed }
  }

  throw new Error("Unrecognized HuePals JSON format")
}

export const applyImportJson = (
  rootStore: IAnyStateTreeNode,
  text: string
): "store" | "theme" => {
  const { kind, snapshot } = parseImportJson(text)

  if (kind === "store") {
    if (
      !confirm("Replace all themes and settings with the imported data?")
    ) {
      throw new Error("Import cancelled")
    }
    rootStore.loadState(snapshot)
  } else {
    rootStore.addTheme(snapshot)
  }

  saveState(getSnapshot(rootStore))
  return kind
}
