import { getSnapshot, IAnyStateTreeNode } from "mobx-state-tree"
import { saveState } from "../state/localStorage"

type ColorSnapshot = {
  id?: string
  [key: string]: unknown
}

type ThemeSnapshot = {
  id?: string
  history?: unknown
  colors?: ColorSnapshot[]
  baseColorId?: string
  backgroundColorId?: string
  baseColorIndex?: number
  backgroundColorIndex?: number
  [key: string]: unknown
}

const stripThemeHistory = (theme: ThemeSnapshot) => {
  const { history: _history, ...rest } = theme
  return rest
}

/** Strip theme/color ids for portable theme exports; keep refs as indices. */
const stripThemeIdsForExport = (theme: ThemeSnapshot) => {
  const {
    history: _history,
    id: _id,
    colors = [],
    baseColorId,
    backgroundColorId,
    ...rest
  } = theme

  const baseColorIndex = colors.findIndex((color) => color.id === baseColorId)
  const backgroundColorIndex = colors.findIndex(
    (color) => color.id === backgroundColorId
  )

  return {
    ...rest,
    colors: colors.map(({ id: _colorId, ...color }) => color),
    ...(baseColorIndex >= 0 ? { baseColorIndex } : {}),
    ...(backgroundColorIndex >= 0 ? { backgroundColorIndex } : {}),
  }
}

/** Mint fresh theme/color ids and remap background/base refs. */
export const remintThemeSnapshot = (snapshot: ThemeSnapshot) => {
  const {
    id: _id,
    history: _history,
    colors = [],
    baseColorId,
    backgroundColorId,
    baseColorIndex,
    backgroundColorIndex,
    ...rest
  } = snapshot

  const newColors = colors.map((color) => {
    const { id: _colorId, ...colorRest } = color
    return { ...colorRest, id: crypto.randomUUID() }
  })

  const resolveColorId = (
    index: number | undefined,
    legacyId: string | undefined
  ) => {
    if (typeof index === "number" && newColors[index]) {
      return newColors[index].id
    }
    if (legacyId) {
      const legacyIndex = colors.findIndex((color) => color.id === legacyId)
      if (legacyIndex >= 0 && newColors[legacyIndex]) {
        return newColors[legacyIndex].id
      }
    }
    return undefined
  }

  return {
    ...rest,
    colors: newColors,
    baseColorId: resolveColorId(baseColorIndex, baseColorId),
    backgroundColorId: resolveColorId(backgroundColorIndex, backgroundColorId),
  }
}

export const stripHistoryForPersistence = (snapshot: unknown): unknown => {
  if (!snapshot || typeof snapshot !== "object") return snapshot

  if (Array.isArray((snapshot as { themes?: unknown }).themes)) {
    const store = snapshot as { themes: ThemeSnapshot[] }
    return {
      ...store,
      themes: store.themes.map(stripThemeHistory),
    }
  }

  return snapshot
}

const stripExportHistory = (snapshot: unknown): unknown => {
  if (!snapshot || typeof snapshot !== "object") return snapshot

  if (Array.isArray((snapshot as { themes?: unknown }).themes)) {
    return stripHistoryForPersistence(snapshot)
  }

  if (Array.isArray((snapshot as ThemeSnapshot).colors)) {
    return stripThemeIdsForExport(snapshot as ThemeSnapshot)
  }

  return snapshot
}

export const serializeSnapshot = (node: IAnyStateTreeNode) =>
  JSON.stringify(stripExportHistory(getSnapshot(node)), null, 2)

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
    rootStore.addTheme(remintThemeSnapshot(snapshot as ThemeSnapshot))
  }

  saveState(getSnapshot(rootStore))
  return kind
}
