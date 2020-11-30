import { types, getType, getSnapshot, applySnapshot, getParent, getRoot, clone } from "mobx-state-tree"
import BezierEasing from 'bezier-easing'
import {scaleLinear} from "d3-scale";
import {format} from 'd3-format'
import {hsl, rgb} from 'd3-color'
import Bezier from 'bezier-js'
import {loadState, saveState} from './localStorage'
import {kebabCase, camelCase} from 'lodash'
import uuid from 'uuid/v4'

// clone does... just that, and does not update `id`
const cloneWithNewId = (node, id) =>
  getType(node).create(Object.assign({}, getSnapshot(node), { id }));

/**
 * @name Shade
 * @description Mostly interpolations
 */
const Shade = types.model('Shade', {
  id: types.optional(types.identifier, uuid),
  h: types.optional(types.number, 0),
  s: types.optional(types.number, 100),
  l: types.optional(types.number, 100),
}).extend(self => {
  return {
    views: {
      get merged () {
        return `hsl(${format('.0f')(self.h)}deg, ${format('.0f')(self.s)}%, ${format('.0f')(self.l)}%)`
      },
      get hsl () {
        return `hsl(${format('.2f')(self.h)}, ${format('.2f')(self.s)}%, ${format('.2f')(self.l)}%)`
      },
      get hex () {
        return rgb(self.hsl).formatHex()
      },
      get rgb () {
        const value = rgb(self.hsl)
        return `rgb(${format('.2f')(value.r)}, ${format('.2f')(value.g)}, ${format('.2f')(value.b)})`
      }
    }
  }
})

/**
 * @name Color
 * @description contains shades,
 */
const Color = types.model('Color', {
  id: types.optional(types.identifier, uuid),
  name: types.optional(types.string, 'Gray'),
  base: types.optional(types.boolean, false),
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
}).extend(self => {
  return {
    views: {
      get interpolations () {
        const bounds = {
          hue: {
            min: 0,
            max: 480
          },
          saturation: {
            min: 0,
            max: 100
          },
          lightness: {
            min: 0,
            max: 100
          },
        }
        const getYAtX = (position, key) => {
          position = Math.min(position, 0.999999)
          var curve = new Bezier(...self[`${key}Spline`]);
          var line = { p1: { x: position, y: -1000 }, p2: { x: position, y: 1000 } };
          const intersect = curve.get(curve.intersects(line)[0])
          return Math.min(
            Math.max(
              intersect.y,
              bounds[key].min,
            ),
            bounds[key].max
          )
        }

        return Array(getParent(self, 2).interpolationCount).fill().map((el, i) => {
          const position = i / (getParent(self, 2).interpolationCount - 1)
          return Shade.create({
            h: getYAtX(position, 'hue'),
            s: getYAtX(position, 'saturation'),
            l: getYAtX(position, 'lightness')
          })
        })
      },

      get shades () {
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
      remove() {
        getParent(self, 2).removeColor(self)
      },
      duplicate() {
        const dup = cloneWithNewId(self, uuid())
        getParent(self, 2).addColor(dup)
      }
    }
  }
})

/**
 * @name Message
 */
export const Message = types.model("Message", {
  id: types.optional(types.identifier, uuid),
  body: types.optional(types.string, ''),
  date: types.optional(types.string, new Date().toISOString()),
  status: types.optional(types.string, 'secondary'),
  visible: types.optional(types.boolean, true),
}).actions(self => ({
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
export const Theme = types.model("Theme", {
  id: types.optional(types.identifier, uuid),
  name: types.optional(types.string, 'New Theme'),
  favorite: types.optional(types.boolean, false),
  colors: types.optional(types.array(Color), [{}]),
  interpolationCount: types.optional(types.number, 10),
  backgroundColorId: types.maybe(types.string),
  backgroundShadeIndex: types.maybe(types.number),
}).extend(self => {
  return {
    views: {
      get backgroundShade () {
        if (self.backgroundColorId && self.backgroundShadeIndex !== undefined) {
          let shade
          self.colors.find(color => {
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
        return self.colors.find(color => color.base)
      },
      get exportText () {
        const ui = getRoot(self).ui

        let
          formatter,
          prefix,
          separator,
          showSemicolon = true;
        switch(ui.exportLanguage) {
          case 'sass':
            formatter = camelCase
            prefix = '$'
            separator = ': '
            showSemicolon = false
            break;
          case 'csv':
            formatter = v => v
            prefix = ''
            separator = ','
            showSemicolon = false
            break;
          case 'css':
          default:
            formatter = kebabCase
            prefix = '--'
            separator = ': '
            break;
        }
        return self.colors.map(color => {
          return color.shades.map((shade, i) => {
            const name = formatter(`${color.name} ${i + 1}`)
            const value = shade[ui.colorspace]

            return `${prefix}${name}${separator}${value}${showSemicolon ? ';' : ''}`
          }).join('\n')
        }).join('\n\n')
      }
    },
    actions: {
      addColor(options) {
        self.colors.push(options || {})
      },
      removeColor (item) {
        self.colors.splice(self.colors.indexOf(item), 1)
      },
      toggleFavorite () {
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
      }
    }
  }
})


/**
 * @name UIStore
 */
export const UIStore = types.model("UIStore", {
  isFooterOpen: types.optional(types.boolean, false),
  isGraphVisible: types.optional(types.boolean, true),
  isValueVisible: types.optional(types.boolean, true),
  exportLanguage: types.optional(types.string, 'css'),
  messages: types.array(Message),
  colorspace: types.optional(types.string, 'hsl'),
  tab: types.optional(types.string, 'overview'),
  currentTheme: types.maybeNull(types.reference(Theme)),
}).extend(self => {
  return {
    views: {
      get view () {
        if (self.currentTheme) {
          return self.tab
        } else {
          return 'overview'
        }
      },
      get visibleMessages() {
        return self.messages.filter(m => m.visible)
      }
    },
    actions: {
      addMessage(options) {
        self.messages.push(options || {})
      },
      toggleGraphs(options) {
        self.isGraphVisible = !self.isGraphVisible;
      },
      toggleValues(options) {
        self.isValueVisible = !self.isValueVisible;
      },
      toggleFooter(options) {
        self.isFooterOpen = !self.isFooterOpen;
      },
      setColorspace(value) {
        self.colorspace = value;
      },
      setExportLanguage(value) {
        self.exportLanguage = value;
      },
      setTab(value) {
        self.tab = value;
      },
      setCurrentTheme(theme) {
        self.currentTheme = theme
        self.tab = 'editor'
        self.backgroundShadeIndex = undefined
        self.backgroundColorId = undefined
      },
    }
  }
})

const defaultState = {
  themes: [Theme.create({
    colors: [Color.create({})]
  })],
  ui: {}
}

export const RootStore = types.model("Store", {
  themes: types.array(Theme),
  ui: types.optional(UIStore, {}),
}).extend(self => ({
  actions: {
    addTheme(options) {
      self.themes.push(options || {})
    },
    resetStore() {
      applySnapshot(self, defaultState)
    },
    loadState(snapshot) {
      applySnapshot(self, snapshot)
    },
    removeTheme(item) {
      self.themes.splice(self.themes.indexOf(item), 1)
    }
  }
}))

// initialization and unload

const persisitedState = loadState();

let store = RootStore.create(persisitedState || defaultState)
window.__store__ = store

window.addEventListener('beforeunload', function (e) {
  // console.log('beforeunload')
  // e.preventDefault()
  // e.returnValue = '';
  // console.log(JSON.parse(JSON.stringify(store)))
  saveState(getSnapshot(store));
});

window.STATE = store

export default store;
