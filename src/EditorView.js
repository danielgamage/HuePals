import React from 'react';
import logo from './logo.svg';
import './App.css';
import { observer } from 'mobx-react';
import state from './state'
import styled from 'styled-components'
import SplineGraph from './SplineGraph'
import { applyPatch } from 'mobx-state-tree';
import Button from './Button'
import ColorInput from './ColorInput'
import { Icon } from '@iconify/react';
import deleteIcon from '@iconify/icons-ic/outline-delete';
import warningIcon from '@iconify/icons-ic/baseline-warning';
import paletteIcon from '@iconify/icons-ic/outline-palette';

const Styles = styled.div`
display: flex;
height: 100%;
flex-flow: column;
overflow: auto;
padding-bottom: 3rem;

.graphs {
  position: sticky;
  top: 0;
  z-index: 1;
  display: grid;
  grid-gap: 1rem;
  grid-template-areas:
    "4rem 4rem"
    "4rem 4rem";
  padding: 1rem 0;
  background: linear-gradient(to bottom, var(--body-background) 90%, #27263700 100%);
}
.graph {
  position: relative;
  display: flex;
  justify-content: space-between
}
.graph-hue {
  grid-row: 1 / 3;
}
.graph-lightness, .graph-saturation {
  h3 { top: auto; bottom: 0.5rem; }
}
h3 {
  position: absolute;
  pointer-events: none;
  opacity: 0.3;
  margin: 0;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 1;
  abbr {
    text-decoration: none;
  }
}
.colors {
  display: flex;
  flex: 1 1 auto;
  padding: 0 2rem 3rem;
  width: min-content;
}
.color {
  padding: 1rem 0 0;
  width: 17rem;
  flex: 0 0 auto;
  text-overflow: ellipsis;
  & + .color {
    margin-left: 2rem;
  }
  &.values-hidden {
    width: 128px;
  }
}
.title{
  display: flex;
  align-items: center;
  margin: 0;
  input[type=text] {
    all: unset;
    width: 100%;
    margin-left: 0.5rem;
  }
  .checkbox {
    cursor: pointer;
    input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }
    .viz {
      width: 1rem;
      height: 1rem;
      border: 2px solid var(--gray-6);
      border-radius: 1rem;
    }
    input:checked + .viz {
      border-color: var(--red-4);
      background: var(--gray-6);
    }
  }
}
.shade {
  position: relative;
  display: flex;
  text-align: left;
  white-space: nowrap;
  align-items: center;
  border-radius: 4px;
  & + .shade {
    margin-top: 1rem;
  }

  &:first-child, &:last-child {
    cursor: pointer;
    &::before {
      content: "";
      position: absolute;
      display: block;
      top: -0.5rem;
      right: -1rem;
      bottom: -0.5rem;
      left: -1rem;
      border-radius: 4px;
      background: var(--gray-8);
      opacity: 0;
      z-index: -1;
    }
    &:hover {
      &::before {
        opacity: 1;
      }
    }
  }
}
.shade-title {
  margin: 0;
}
.shade-value {
  margin: 0;
}
.swatch {
  width: 2rem;
  height: 2rem;
  border-radius: 1rem;
  background: var(--color);
  margin-right: 1rem;
  flex: 0 0 auto;
  box-shadow:
    0 0 0 3px inset var(--base-color),
    var(--box-shadow);
}
.add-button-container {
  flex: 0 0 auto;
  width: 256px;
  margin: 1rem 0 1rem 2rem;
}
.add-button {
  width: 100%;
  font: inherit;
  font-size: 2rem;
  font-weight: 700;
  position: sticky;
  top: 1rem;
}
.remove-button {
  line-height: 0.5;
  z-index: 11;
}
`

const App = observer(({theme}) => {
  return (
    <Styles className="Editor">
      <div className="colors">
        {theme.colors.map(color => (
          <div className="color">
            <h2 className="title">
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="base-radio"
                  checked={color.base}
                  onChange={(e)=> {applyPatch(color, {op: 'add', path: './base', value: e.target.checked})}}
                />
                <div className="viz" />
              </label>
              <input
                type="text"
                value={color.name}
                onInput={(e)=> {applyPatch(color, {op: 'add', path: './name', value: e.target.value})}}
              />
              <Button
                status="text danger"
                className="remove-button"
                onClick={() => color.remove()}
                label={<Icon icon={deleteIcon} />}
                confirmLabel={<Icon icon={warningIcon} />}
              />
            </h2>
            <div className="graphs">
              <div className="graph graph-hue">
                <h3><abbr title="Hue">H</abbr></h3>
                <SplineGraph
                  hue
                  color={color}
                  min={0}
                  max={480}
                  height={2.25}
                  spline={color.hueSpline}
                  onStartUpdate={(v) => {applyPatch(color, {op: 'add', path: './start/h', value: v})}}
                  onEndUpdate={(v) => {applyPatch(color, {op: 'add', path: './end/h', value: v})}}
                  onSplineUpdate={(v)=> {applyPatch(color, {op: 'add', path: './hueSpline', value: v})}}
                />
              </div>
              <div className="graph graph-saturation">
                <h3><abbr title="Saturation">S</abbr></h3>
                <SplineGraph
                  color={color}
                  min={0}
                  max={100}
                  spline={color.saturationSpline}
                  onStartUpdate={(v) => {applyPatch(color, {op: 'add', path: './start/s', value: v})}}
                  onEndUpdate={(v) => {applyPatch(color, {op: 'add', path: './end/s', value: v})}}
                  onSplineUpdate={(v)=> {applyPatch(color, {op: 'add', path: './saturationSpline', value: v})}}
                />
              </div>
              <div className="graph graph-lightness">
                <h3><abbr title="Lightness">L</abbr></h3>
                <SplineGraph
                  color={color}
                  min={0}
                  max={100}
                  spline={color.lightnessSpline}
                  onStartUpdate={(v) => {applyPatch(color, {op: 'add', path: './start/l', value: v})}}
                  onEndUpdate={(v) => {applyPatch(color, {op: 'add', path: './end/l', value: v})}}
                  onSplineUpdate={(v)=> {applyPatch(color, {op: 'add', path: './lightnessSpline', value: v})}}
                />
              </div>
            </div>
            <div>
              {color.shades.map((shade, i, arr) => {
                const isExtreme = i === 0 || i === arr.length - 1
                const RootElement = isExtreme ? 'label' : 'div'

                return (
                  <RootElement className={`shade`} style={{"--color": shade.hsl}} >
                    {isExtreme ?
                      <ColorInput
                        type="color"
                        value={shade.hex}
                        baseColor={theme.baseColor && theme.baseColor.shades[i].hsl}
                        onInput={(e) => color.setHex(i === 0 ? 'start' : 'end', e.target.value)}
                      />
                    :
                      <div
                        className="swatch"
                        style={{"--base-color": theme.baseColor && theme.baseColor.shades[i].hsl}}
                      />
                    }
                    <div>
                      <h4 className="shade-title">{color.name} {i + 1}</h4>
                      {state.ui.isValueVisible &&
                        <p className="shade-value">{shade.hsl}</p>
                      }
                    </div>
                  </RootElement>
                )
              })}
            </div>
          </div>
        ))}

        <div className="add-button-container">
          <Button
            className="add-button"
            onClick={() => {theme.addColor()}}
            label={<>
              <Icon icon={paletteIcon} />
              <span>Add Color</span>
            </>}
          />
        </div>
      </div>
      <footer className={`app-footer`}>
        <label>
          Shades:
          <input
            className="shade-count"
            type="number"
            min="3"
            onChange={(e) => {
              const value = parseInt(e.target.value)
              if (value >= 3 && value <= 16) {
                applyPatch(theme, {op: 'add', path: './interpolationCount', value: value})
              }
            }}
            value={theme.interpolationCount}
          />
        </label>
        <div className="messages">
          {state.ui.visibleMessages.map(message => (
            <div className={`message ${message.status}`}>{message.body}</div>
          ))}
        </div>
      </footer>
    </Styles>
  );
})

export default App;
