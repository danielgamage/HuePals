import { types, getSnapshot, applySnapshot, getParent } from "mobx-state-tree"
import BezierEasing from 'bezier-easing'
import {scaleLinear} from "d3-scale";
import {format} from 'd3-format'
import {hsl, rgb} from 'd3-color'
import Bezier from 'bezier-js'
import {loadState, saveState} from './localStorage'
import {kebabCase, camelCase} from 'lodash'

const Shade = types.model('Shade', {
  h: types.optional(types.number, 0),
  s: types.optional(types.number, 100),
  l: types.optional(types.number, 100),
}).extend(self => {
  return {
    views: {
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
    },
    actions: {
      setHex(v) {
        const newValue = hsl(v)
        self.h = newValue.h || 0
        self.s = newValue.s * 100
        self.l = newValue.l * 100
      }
    }
  }
})

const Color = types.model('Color', {
  name: types.optional(types.string, 'Gray'),
  base: types.optional(types.boolean, false),
  start: types.optional(Shade, {h: 78, s: 60, l: 90}),
  end: types.optional(Shade, {h: 174, s: 60, l: 12}),
  hueSpline: types.optional(
    types.array(types.number),
    [0.33, 150, 0.66, 170]
  ),
  saturationSpline: types.optional(
    types.array(types.number),
    [0.5, 80, 0.8, 80]
  ),
  lightnessSpline: types.optional(
    types.array(types.number),
    [0.33, 66, 0.66, 33]
  ),
}).extend(self => {
  return {
    views: {
      get hueBezier () {
        return [
          0, self.start.h,
          self.hueSpline[0], self.hueSpline[1],
          self.hueSpline[2], self.hueSpline[3],
          1, self.end.h,
        ]
      },
      get saturationBezier () {
        return [
          0, self.start.s,
          self.saturationSpline[0], self.saturationSpline[1],
          self.saturationSpline[2], self.saturationSpline[3],
          1, self.end.s,
        ]
      },
      get lightnessBezier () {
        return [
          0, self.start.l,
          self.lightnessSpline[0], self.lightnessSpline[1],
          self.lightnessSpline[2], self.lightnessSpline[3],
          1, self.end.l,
        ]
      },
      get interpolations () {
        const getYAtX = (position, bezier) => {
          var curve = new Bezier(...bezier);
          var line = { p1: { x: position, y: -1000 }, p2: { x: position, y: 1000 } };
          const intersect = curve.get(curve.intersects(line)[0])
          return intersect.y
        }

        return Array(self.$treenode.root.storedValue.interpolationCount - 2).fill().map((el, i) => {
          const position = (i + 1) / (self.$treenode.root.storedValue.interpolationCount - 1)
          return Shade.create({
            h: getYAtX(position, self.hueBezier),
            s: getYAtX(position, self.saturationBezier),
            l: getYAtX(position, self.lightnessBezier)
          })
        })
      },
      get shades () {
        return [
          self.start,
          ...self.interpolations,
          self.end
        ]
      },
    },
    actions: {
      remove() {
        getParent(self, 2).removeColor(self)
      }
    }
  }
})

export const Message = types.model("Message", {
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

export const UIStore = types.model("UIStore", {
  isFooterOpen: types.optional(types.boolean, false),
  isGraphVisible: types.optional(types.boolean, true),
  isValueVisible: types.optional(types.boolean, true),
  exportLanguage: types.optional(types.string, 'css'),
  messages: types.array(Message),
  colorspace: types.optional(types.string, 'hsl'),
  tab: types.optional(types.string, 'editor'),
}).extend(self => {
  return {
    views: {
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
    }
  }
})

const defaultState = {
  colors: [Color.create({
  })],
  ui: {}
}

export const RootStore = types.model("Store", {
  colors: types.array(Color),
  interpolationCount: types.optional(types.number, 10),
  ui: types.optional(UIStore, {}),
}).extend(self => {
  return {
    views: {
      get baseColor() {
        return self.colors.find(color => color.base)
      },
      get exportText () {
        let
          formatter,
          colorspace,
          keyFormat,
          prefix,
          separator,
          showSemicolon = true;
        switch(self.ui.exportLanguage) {
          case 'sass':
            formatter = camelCase
            prefix = '$'
            separator = ':'
            showSemicolon = false
            break;
          case 'csv':
            formatter = v => v
            prefix = ''
            separator = ':'
            showSemicolon = false
            break;
          case 'css':
          default:
            formatter = kebabCase
            prefix = '--'
            separator = ':'
            break;
        }
        return self.colors.map(color => {
          return color.shades.map((shade, i) => {
            const name = formatter(`${color.name} ${i + 1}`)
            const value = shade[self.ui.colorspace]
            console.log({value})

            return `${prefix}${name}${separator} ${value}${showSemicolon ? ';' : ''}`
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
      resetStore() {
        applySnapshot(self, defaultState)
      },
      loadState(snapshot) {
        applySnapshot(self, snapshot)
      },
    }
  }
})

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
