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
import { kebabCase, camelCase, cloneDeep } from "lodash"
import ColorJS from "colorjs.io"
import { easings, lerp } from "../utils/easings"
import { separateNumericStringIntoParts } from "../utils/string"

// clone does... just that, and does not update `id`
const cloneWithNewId = (node, id) =>
  getType(node).create(Object.assign({}, getSnapshot(node), { id }))

/**
 * @name Shade
 * @description Mostly interpolations
 */
const Shade = types
  .model("Shade", {
    id: types.optional(types.identifier, () => crypto.randomUUID()),
    l: types.optional(types.number, 1),
    s: types.optional(types.number, 0.5),
    h: types.optional(types.number, 0),
  })
  .extend((self) => {
    return {
      views: {
        get merged() {
          return [
            { value: format(".2f")(self.l), unit: "" },
            { value: format(".2f")(self.s), unit: "" },
            { value: format(".0f")(self.h).padStart(3, "0"), unit: "º" },
          ].map((el) => {
            el.parts = separateNumericStringIntoParts(el.value)
            return el
          })
        },
        get colorObject() {
          return new ColorJS("oklch", [self.l, self.s, self.h])
        },
        get oklch() {
          return self.colorObject.to("oklch").toString({ format: "oklch" })
        },
        get lch() {
          return self.colorObject.to("lch").toString({ format: "lch" })
        },
        get hsl() {
          return self.colorObject.to("hsl").toString({ format: "hsl" })
        },
        get hex() {
          return self.colorObject.to("srgb").toString({ format: "hex" })
        },
        get rgb() {
          return self.colorObject.to("srgb").toString({ format: "rgb" })
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
    id: types.optional(types.identifier, () => crypto.randomUUID()),
    name: types.optional(types.string, "Gray"),
    hueSpline: types.optional(
      types.array(types.number),
      [0, 389.74, 0.29, 332.3, 0.65, 294.56, 1, 276.51]
    ),
    saturationSpline: types.optional(
      types.array(types.number),
      [0, 0.05, 0.328125, 0.23, 0.76, 0.25, 1, 0.05]
    ),
    lightnessSpline: types.optional(
      types.array(types.number),
      [0, 0.9, 0.203, 0.53, 0.58, 0.24, 1, 0.16]
    ),
    hueLinked: types.optional(types.boolean, false),
    saturationLinked: types.optional(types.boolean, true),
    lightnessLinked: types.optional(types.boolean, true),
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
              max: 0.5,
            },
            lightness: {
              min: 0,
              max: 1,
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
        setSpline(key, value, propagate = true) {
          self[`${key}Spline`] = value
          if (propagate === true && self[`${key}Linked`]) {
            getParent(self, 2).colors.forEach((color) => {
              if (color.id !== self.id && color[`${key}Linked`]) {
                color.setSpline(key, value, false)
              }
            })
          }
        },
        linkSpline(key: "hue" | "lightness" | "saturation", value) {
          let linkKey: "hueLinked" | "lightnessLinked" | "saturationLinked"
          let splineKey: "hueSpline" | "lightnessSpline" | "saturationSpline"
          switch (key) {
            case "hue": {
              linkKey = "hueLinked"
              splineKey = "hueSpline"
              break
            }
            case "lightness": {
              linkKey = "lightnessLinked"
              splineKey = "lightnessSpline"
              break
            }
            case "saturation": {
              linkKey = "saturationLinked"
              splineKey = "saturationSpline"
              break
            }
          }
          if (value === true) {
            const linkSource = getParent(self, 2).colors.find(
              (color) => color[linkKey] === true
            )
            if (linkSource) {
              self[splineKey] = cloneDeep(linkSource[splineKey])
            }
          }

          self[linkKey] = value
        },
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

          if (self[`${splineKey}Linked`]) {
            getParent(self, 2).colors.forEach((color) => {
              if (color.id !== self.id && color[`${splineKey}Linked`]) {
                color[splineKey + "Spline"] = cloneDeep(newSpline)
              }
            })
          }
        },
        remove() {
          getParent(self, 2).removeColor(self)
        },
        duplicate() {
          const dup = cloneWithNewId(self, crypto.randomUUID())
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
    id: types.optional(types.identifier, () => crypto.randomUUID()),
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
    id: types.optional(types.identifier, () => crypto.randomUUID()),
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
        get svgString() {
          const ui = getRoot(self).ui
          const width = 128
          const height = 128
          const xCount = self.colors.length
          const yCount = self.colors[0].interpolations.length
          const svgString = `
            <svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' enable-background='new 0 0 100 100' xml:space='preserve' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>
              ${self.colors
                .map((shade, x) =>
                  shade.interpolations
                    .map((interpolation, y) => {
                      const fill = interpolation[ui.colorspace]

                      return `<rect
                          x='${(x / xCount) * width}'
                          y='${(y / yCount) * height}'
                          width='${width / xCount}'
                          height='${height / yCount}'
                          fill='${fill}' />`
                    })
                    .join("\n")
                )
                .join("\n")}
            </svg>`
          return svgString
        },
        get svgURI() {
          return (
            "data:image/svg+xml;utf8," +
            encodeURIComponent(self.svgString.replace(/\s+/g, " "))
          )
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
    colorspace: types.optional(types.string, "lch"),
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
          if (self.version == "1.0") {
            // convert from hsl to oklch
          }
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
