import {
  types,
  getType,
  getSnapshot,
  applySnapshot,
  getParent,
  getRoot,
} from "mobx-state-tree"
import { format } from "d3-format"
import { hsl, rgb } from "d3-color"
import { Bezier } from "bezier-js"
import { loadState, saveState } from "./localStorage"
import { kebabCase, camelCase } from "lodash"
import uuid from "uuid/v4"
import { easings, lerp, remap } from "../utils/easings"
import { hsluvToRgb, hsluvToHex } from "hsluv"
console.log(hsluvToRgb)
// clone does... just that, and does not update `id`
const cloneWithNewId = (node, id) =>
  getType(node).create(Object.assign({}, getSnapshot(node), { id }))

/**
 * @name Shade
 * @description Mostly interpolations
 */
const Shade = types
  .model("Shade", {
    id: types.optional(types.identifier, uuid),
    h: types.optional(types.number, 0),
    s: types.optional(types.number, 100),
    l: types.optional(types.number, 100),
  })
  .extend((self) => {
    return {
      views: {
        get merged() {
          return [
            { value: format(".0f")(self.h), unit: "º" },
            { value: format(".0f")(self.s), unit: "%" },
            { value: format(".0f")(self.l), unit: "%" },
          ]
        },
        get convertedRGB() {
          console.log(
            hsluvToRgb,
            self.h,
            self.s,
            self.l,
            hsluvToRgb([self.h, self.s, self.l])
          )
          return hsluvToRgb([self.h, self.s, self.l]).map((v) => v * 255)
        },
        get hsl() {
          return `hsl(${format(".2f")(self.h % 360)}, ${format(".2f")(
            self.s
          )}%, ${format(".2f")(self.l)}%)`
        },
        get hex() {
          return hsluvToHex([self.h, self.s, self.l])
        },
        get rgb() {
          const value = self.convertedRGB
          return `rgb(${format(".2f")(value[0])}, ${format(".2f")(
            value[1]
          )}, ${format(".2f")(value[2])})`
        },
      },
    }
  })

/**
 * @name Color
 * @description contains shades,
 */
const Color = types
  .model("Color", {
    id: types.optional(types.identifier, uuid),
    name: types.optional(types.string, "Gray"),
    hueSpline: types.optional(
      types.array(types.number),
      [0, 78, 0.33, 150, 0.66, 170, 1, 174]
    ),
    saturationSpline: types.optional(
      types.array(types.number),
      [0, 60, 0.5, 80, 0.8, 80, 1, 60]
    ),
    lightnessSpline: types.optional(
      types.array(types.number),
      [0, 90, 0.33, 66, 0.66, 33, 1, 12]
    ),
  })
  .extend((self) => {
    return {
      views: {
        get interpolations() {
          const bounds = {
            hue: {
              min: 0,
              max: 480,
            },
            saturation: {
              min: 0,
              max: 100,
            },
            lightness: {
              min: 0,
              max: 100,
            },
          }
          const getYAtX = (position, key) => {
            position = Math.min(position, 0.999999)
            const spline = self[`${key}Spline`]
            const bezierPoints = [
              { x: spline[0], y: spline[1] },
              { x: spline[2], y: spline[3] },
              { x: spline[4], y: spline[5] },
              { x: spline[6], y: spline[7] },
            ]
            const curve = new Bezier(bezierPoints)
            const line = {
              p1: { x: position, y: -1000 },
              p2: { x: position, y: 1000 },
            }
            const intersect = curve.intersects(line)[0]
            const intersectY = curve.get(intersect).y
            const output = Math.min(
              Math.max(intersectY, bounds[key].min),
              bounds[key].max
            )
            return output
          }

          return Array(getParent(self, 2).interpolationCount)
            .fill()
            .map((_el, i) => {
              const position =
                Math.max(i, 0.00001) /
                (getParent(self, 2).interpolationCount - 1)
              return Shade.create({
                h: getYAtX(position, "hue"),
                s: getYAtX(position, "saturation"),
                l: getYAtX(position, "lightness"),
              })
            })
        },

        get shades() {
          return self.interpolations
        },
      },
      actions: {
        setHex(startOrEnd, v) {
          const newValue = hsl(v)
          const index = startOrEnd === "start" ? 1 : 7

          self.hueSpline[index] = newValue.h || 0
          self.saturationSpline[index] = newValue.s * 100
          self.lightnessSpline[index] = newValue.l * 100
        },
        setEasing(splineKey, easingKey) {
          const spline = self[`${splineKey}Spline`]
          const start = spline[1]
          const end = spline[7]
          const easing = easings[easingKey]
          const newSpline = [
            spline[0],
            spline[1],

            easing.handles[0],
            lerp(start, end, easing.handles[1]),
            easing.handles[2],
            lerp(start, end, easing.handles[3]),

            spline[6],
            spline[7],
          ]
          self[`${splineKey}Spline`] = newSpline
        },
        remove() {
          getParent(self, 2).removeColor(self)
        },
        duplicate() {
          const dup = cloneWithNewId(self, uuid())
          getParent(self, 2).addColor(dup)
        },
      },
    }
  })

/**
 * @name Message
 */
export const Message = types
  .model("Message", {
    id: types.optional(types.identifier, uuid),
    body: types.optional(types.string, ""),
    date: types.optional(types.string, new Date().toISOString()),
    status: types.optional(types.string, "secondary"),
    visible: types.optional(types.boolean, true),
  })
  .actions((self) => ({
    afterCreate() {
      setTimeout(() => {
        self.dismiss()
      }, 5000)
    },
    dismiss() {
      self.visible = false
    },
  }))

/**
 * @name Theme
 */
export const Theme = types
  .model("Theme", {
    id: types.optional(types.identifier, uuid),
    name: types.optional(types.string, "New Theme"),
    favorite: types.optional(types.boolean, false),
    colors: types.optional(types.array(Color), [{}]),
    baseColorId: types.maybe(types.string, null),
    interpolationCount: types.optional(types.number, 10),
    backgroundColorId: types.maybe(types.string),
    backgroundShadeIndex: types.maybe(types.number),
  })
  .extend((self) => {
    return {
      views: {
        get backgroundShade() {
          if (
            self.backgroundColorId &&
            self.backgroundShadeIndex !== undefined
          ) {
            let shade
            self.colors.find((color) => {
              if (color.id === self.backgroundColorId) {
                shade = color.shades[self.backgroundShadeIndex]
                if (shade) {
                  return true
                }
              }
            })
            return shade
          }
        },
        get baseColor() {
          return self.colors.find((color) => color.id === self.baseColorId)
        },
        get exportText() {
          const ui = getRoot(self).ui

          let formatter,
            prefix,
            separator,
            showSemicolon = true
          switch (ui.exportLanguage) {
            case "sass":
              formatter = camelCase
              prefix = "$"
              separator = ": "
              showSemicolon = false
              break
            case "csv":
              formatter = (v) => v
              prefix = ""
              separator = ","
              showSemicolon = false
              break
            case "css":
            default:
              formatter = kebabCase
              prefix = "--"
              separator = ": "
              break
          }
          return self.colors
            .map((color) => {
              return color.shades
                .map((shade, i) => {
                  const name = formatter(`${color.name} ${i + 1}`)
                  const value = shade[ui.colorspace]

                  return `${prefix}${name}${separator}${value}${
                    showSemicolon ? ";" : ""
                  }`
                })
                .join("\n")
            })
            .join("\n\n")
        },
      },
      actions: {
        addColor(options) {
          self.colors.push(options || {})
        },
        removeColor(item) {
          self.colors.splice(self.colors.indexOf(item), 1)
        },
        toggleFavorite() {
          self.favorite = !self.favorite
        },
        resetStore() {
          applySnapshot(self, defaultState)
        },
        loadState(snapshot) {
          applySnapshot(self, snapshot)
        },
        remove() {
          getParent(self, 2).removeTheme(self)
        },
        setBackgroundShade(colorId, value) {
          self.backgroundColorId = colorId
          self.backgroundShadeIndex = value
        },
      },
    }
  })

/**
 * @name UIStore
 */
export const UIStore = types
  .model("UIStore", {
    isFooterOpen: types.optional(types.boolean, false),
    isGraphVisible: types.optional(types.boolean, true),
    isValueVisible: types.optional(types.boolean, true),
    exportLanguage: types.optional(types.string, "css"),
    messages: types.array(Message),
    colorspace: types.optional(types.string, "hsl"),
    tab: types.optional(types.string, "overview"),
    currentTheme: types.maybeNull(types.reference(Theme)),
  })
  .extend((self) => {
    return {
      views: {
        get view() {
          if (self.currentTheme) {
            return self.tab
          } else {
            return "overview"
          }
        },
        get visibleMessages() {
          return self.messages.filter((m) => m.visible)
        },
      },
      actions: {
        addMessage(options) {
          self.messages.push(options || {})
        },
        toggleGraphs(options) {
          self.isGraphVisible = !self.isGraphVisible
        },
        toggleValues(options) {
          self.isValueVisible = !self.isValueVisible
        },
        toggleFooter(options) {
          self.isFooterOpen = !self.isFooterOpen
        },
        setColorspace(value) {
          self.colorspace = value
        },
        setExportLanguage(value) {
          self.exportLanguage = value
        },
        setTab(value) {
          self.tab = value
        },
        setCurrentTheme(theme) {
          self.currentTheme = theme
          self.tab = "editor"
          self.backgroundShadeIndex = undefined
          self.backgroundColorId = undefined
        },
      },
    }
  })

const defaultState = {
  themes: [
    Theme.create({
      colors: [Color.create({})],
    }),
  ],
  ui: {},
}

export const RootStore = types
  .model("Store", {
    themes: types.array(Theme),
    ui: types.optional(UIStore, {}),
    version: "1.0",
  })
  .extend((self) => ({
    actions: {
      addTheme(options) {
        self.themes.push(options || {})
      },
      resetStore() {
        applySnapshot(self, defaultState)
      },
      loadState(snapshot) {
        if (self.version) {
          applySnapshot(self, snapshot)
        }
      },
      removeTheme(item) {
        self.themes.splice(self.themes.indexOf(item), 1)
      },
    },
  }))

// initialization and unload

const persisitedState = loadState()

let store = RootStore.create(persisitedState || defaultState)
window.__store__ = store

window.addEventListener("beforeunload", function (e) {
  // console.log('beforeunload')
  // e.preventDefault()
  // e.returnValue = '';
  // console.log(JSON.parse(JSON.stringify(store)))
  saveState(getSnapshot(store))
})

window.STATE = store

export default store
