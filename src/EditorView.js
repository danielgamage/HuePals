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
import copyIcon from '@iconify/icons-ic/content-copy';
import formatColorFill from '@iconify/icons-ic/baseline-format-color-fill';

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
  color: var(--fg-3);
  line-height: 1;
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
.title-line{
  display: flex;
  align-items: center;
  margin: 0;
  gap: 0.8rem;
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
      border: 2px solid var(--fg-3);
      border-radius: 1rem;
    }
    input:checked + .viz {
      border-color: var(--red-4);
      background: var(--fg-3);
    }
  }
}
.list {
}
.shade {
  position: relative;
  display: flex;
  text-align: left;
  white-space: nowrap;
  align-items: center;
  border-radius: 4px;
  gap: 0.5rem;
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
      background: var(--fg-3);
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
.shade-text {
  flex: 1 1 auto;
}
.shade-background-field {
  align-self: flex-start;
  flex: 0 0 auto;
  color:var(--fg-4);
  &.active {
    color:var(--fg-1);
  }

  input {
    opacity: 0;
    position: absolute;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    width: 1px;
    height: 1px;
    overflow: hidden;
    position: absolute;
  }
}
.shade-title {
  margin: 0;
}
.shade-value {
  margin: 0.1rem 0 0;
  font-size: var(--size--1);
  font-family: var(--mono);
  color: var(--fg-2);
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
  padding-inline: 0;
  font-size: var(--size-1);
}
.app-footer {
  padding: 1rem;
  position: absolute;
  display: flex;
  align-items: center;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4rem;
  padding: 0 2rem;
  background: var(--bg-2);
  z-index: 1;
  transition: 0.3s var(--ease-out) height;
  box-shadow: 0 -2px 5px var(--shadow-color);
  & > * + * {
    margin-left: 1rem;
  }
}
`

const App = observer(({theme}) => {
  return (
    <Styles className={`Editor`}>
      <div className="colors">
        {theme.colors.map((color, colorIndex) => (
          <div className="color">
            <h2 className="title-line">
              <input
                type="text"
                value={color.name}
                onInput={(e)=> {applyPatch(color, {op: 'add', path: './name', value: e.target.value})}}
              />
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="base-radio"
                  checked={color.base}
                  onChange={(e) => {
                    applyPatch(color, {op: 'add', path: './base', value: e.target.checked})}
                  }
                />
                <div className="viz" />
              </label>
              <Button
                status="text"
                className="remove-button"
                onClick={() => color.duplicate()}
                label={<Icon icon={copyIcon} />}
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
            <div className="list">
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
                    <div className="shade-text">
                      <h4 className="shade-title">{color.name} {i + 1}</h4>
                      {state.ui.isValueVisible &&
                        <p className="shade-value">{shade.merged}</p>
                      }
                    </div>
                    <label className={"shade-background-field " + `${theme.backgroundColorId === color.id && theme.backgroundShadeIndex ===  i && "active"}`}>
                      <Icon icon={formatColorFill}></Icon>
                      <input
                        className="shade-background-input"
                        type="radio"
                        name="background-color"
                        id={shade.hsl}
                        value={shade.hex}
                        checked={theme.backgroundColorId === color.id && theme.backgroundShadeIndex ===  i}
                        onChange={e => {
                          if (e.target.checked) {
                            theme.setBackgroundShade(color.id, i)
                          }
                        }}
                      />
                    </label>
                  </RootElement>
                )
              })}
            </div>
          </div>
        ))}

        <div className="add-button-container">
          <Button
            className="add-button"
            status="secondary"
            onClick={() => {theme.addColor()}}
            label={<>
              <Icon icon={paletteIcon} />
              <span>Add Color</span>
            </>}
          />
        </div>
      </div>
    </Styles>
  );
})

export default App;
