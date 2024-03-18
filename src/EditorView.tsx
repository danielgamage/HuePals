import "./App.css"
import { Instance } from "mobx-state-tree"
import { observer } from "mobx-react"
import state, { Theme } from "./state"
import styled from "styled-components"
import SplineGraph from "./SplineGraph"
import { applyPatch } from "mobx-state-tree"
import LabeledCheckbox from "./LabeledCheckbox"
import Button from "./Button"
import ColorInput from "./ColorInput"
import { Icon } from "@iconify/react"
import deleteIcon from "@iconify-icons/solar/trash-bin-2-bold"
import warningIcon from "@iconify-icons/solar/danger-triangle-bold-duotone"
import circleHalf from "@iconify-icons/solar/pin-circle-bold-duotone"
import circleHalfFill from "@iconify-icons/solar/pin-circle-bold"
import swatchesIcon from "@iconify-icons/solar/palette-bold-duotone"
import copyIcon from "@iconify-icons/solar/copy-bold-duotone"
import paintBrushBroad from "@iconify-icons/solar/paint-roller-bold-duotone"
import paintBrushBroadFill from "@iconify-icons/solar/paint-roller-bold-duotone"
import linkIcon from "@iconify-icons/solar/link-minimalistic-2-bold"
import linkBrokenIcon from "@iconify-icons/solar/link-broken-minimalistic-bold"
import classNames from "classnames"

const Styles = styled.div`
  display: flex;
  height: 100%;
  flex-flow: column;
  overflow: auto;
  padding-bottom: 3rem;
  background: var(--body-background);
  .graphs {
    position: sticky;
    top: 0;
    z-index: 1;
    display: grid;
    grid-gap: 1rem;
    grid-template-areas:
      "l h"
      "c h";
    padding: 1rem 0;
    margin-bottom: -1rem;
    background: var(--body-background);
  }
  .graph {
    position: relative;
    display: flex;
    justify-content: space-between;
  }
  .graph-hue {
    grid-area: h;
  }
  .graph-lightness,
  .graph-saturation {
    h3 {
      top: auto;
      bottom: 0.5rem;
    }
  }
  .graph-lightness {
    grid-area: l;
  }
  .graph-saturation {
    grid-area: c;
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
  .title-line {
    font-size: var(--size-1);
    display: flex;
    align-items: center;
    margin: 0;
    height: 2rem;
    gap: 0.8rem;
    color: var(--fg-1);
    --unchecked-icon-color: var(--fg-2);
    --checked-icon-color: var(--fg-1);
    input[type="text"] {
      all: unset;
      width: 100%;
    }
    svg {
      height: 24px;
      width: 24px;
    }
    .checkbox {
      cursor: pointer;
      input {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
      }
      input:checked + svg {
        color: var(--fg-1);
      }
    }
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  &.graphs-hidden .list-header {
    top: 0;
  }
  &.graphs-visible .list-header {
    top: 20rem;
  }
  .list-header {
    position: sticky;
    display: flex;
    padding-left: 5rem;
    font-family: var(--mono);
    font-size: var(--size-0);
    color: var(--fg-5);
    z-index: 1;
    background: var(--body-background);
    box-shadow: 0 7px 10px -7px var(--shadow-color);
    .list-heading {
      display: flex;
      align-items: center;
      gap: 0.2rem;
      width: 3rem;
      text-align: right;
      padding-right: 1.1rem;
      color: var(--fg-3);
      svg {
        color: var(--fg-5);
      }
      &.active {
        svg {
          color: var(--fg-3);
        }
      }
    }
    .link-button {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      width: 24px;
      height: 24px;
    }
    abbr {
      text-decoration: none;
    }
  }
  .shade {
    position: relative;
    display: flex;
    text-align: left;
    white-space: nowrap;
    align-items: center;
    border-radius: var(--radius);
    gap: 1rem;

    &:first-child,
    &:last-child {
      cursor: pointer;
      &::before {
        content: "";
        position: absolute;
        display: block;
        top: -0.5rem;
        right: -1rem;
        bottom: -0.5rem;
        left: -1rem;
        border-radius: var(--radius);
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
    display: flex;
    flex: 1 1 auto;
    align-items: baseline;
    margin: 0;
    gap: 1rem;
  }
  .shade-background-field {
    flex: 0 0 auto;
    color: var(--fg-4);
    width: 1rem;
    position: relative;
    &::after {
      content: "";
      opacity: 0.2;
      position: absolute;
      width: 1.6rem;
      height: 1.6rem;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    &.active {
      color: var(--fg-1);
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
    font-size: var(--size-0);
    color: var(--fg-5);
  }
  .shade-title-padding {
    color: var(--fg-5);
  }
  .shade-value {
    display: flex;
    margin: 0;
    font-size: var(--size-0);
    font-family: var(--mono);
    color: var(--fg-1);
  }
  .shade-value-insignificant {
    color: var(--fg-5);
  }
  .shade-value-value {
    display: inline-block;
    width: 2.5em;
    text-align: right;
  }
  .shade-value-unit {
    color: var(--fg-4);
  }
  .shade-value-separator {
    display: inline-block;
    color: var(--fg-5);
    opacity: 0;
  }
  .add-button-container {
    flex: 0 0 auto;
    width: 256px;
    margin: 1rem 0 1rem 2rem;
  }
  .add-button {
    width: 100%;
    font: inherit;
    font-size: var(--size-1);
    font-weight: 400;
    position: sticky;
    top: 1rem;
  }
  .remove-button {
    line-height: 0.5;
    z-index: 11;
    padding-inline: 0;
    font-size: var(--size-1);
  }
`

const App = observer(({ theme }: { theme: Instance<typeof Theme> }) => {
  return (
    <Styles
      className={`Editor ${
        state.ui.isGraphVisible ? "graphs-visible" : "graphs-hidden"
      }`}
    >
      <div className="colors">
        {theme.colors.map((color) => {
          const start = color.shades[0]
          const end = color.shades[color.shades.length - 1]
          return (
            <div
              className="color"
              style={{
                "--start-hue": `${start.h}`,
                "--end-hue": `${end.h}`,
                "--start-saturation": `${start.s}`,
                "--end-saturation": `${end.s}`,
                "--start-lightness": `${start.l}`,
                "--end-lightness": `${end.l}`,
              }}
            >
              <h2 className="title-line">
                <input
                  type="text"
                  value={color.name}
                  onInput={(e) => {
                    applyPatch(color, {
                      op: "add",
                      path: "./name",
                      value: e.target.value,
                    })
                  }}
                />
                <LabeledCheckbox
                  value={theme.baseColorId === color.id}
                  onChange={(v) => {
                    if (v) {
                      applyPatch(theme, {
                        op: "add",
                        path: "./baseColorId",
                        value: color.id,
                      })
                    } else {
                      applyPatch(theme, {
                        op: "add",
                        path: "./baseColorId",
                        value: undefined,
                      })
                    }
                  }}
                  checkedLabel={<Icon icon={circleHalfFill} />}
                  uncheckedLabel={<Icon icon={circleHalf} />}
                />
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
              {state.ui.isGraphVisible && (
                <div className="graphs">
                  <div className="graph graph-lightness">
                    <h3>
                      <abbr title="Lightness">L</abbr>
                    </h3>
                    <SplineGraph
                      attribute="lightness"
                      color={color}
                      min={0}
                      max={1}
                      spline={color.lightnessSpline}
                      onEasingSelect={(key) => {
                        color.setEasing("lightness", key)
                      }}
                      onSplineUpdate={(v) => {
                        color.setSpline("lightness", v)
                      }}
                    />
                  </div>

                  <div className="graph graph-saturation">
                    <h3>
                      <abbr title="Chroma">C</abbr>
                    </h3>
                    <SplineGraph
                      attribute="saturation"
                      color={color}
                      min={0}
                      max={0.5}
                      spline={color.saturationSpline}
                      onEasingSelect={(key) => {
                        color.setEasing("saturation", key)
                      }}
                      onSplineUpdate={(v) => {
                        color.setSpline("saturation", v)
                      }}
                    />
                  </div>

                  <div className="graph graph-hue">
                    <h3>
                      <abbr title="Hue">H</abbr>
                    </h3>
                    <SplineGraph
                      attribute="hue"
                      color={color}
                      min={0}
                      max={480}
                      height={2.25}
                      spline={color.hueSpline}
                      onEasingSelect={(key) => {
                        color.setEasing("hue", key)
                      }}
                      onSplineUpdate={(v) => {
                        color.setSpline("hue", v)
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="list">
                <div className="list-header">
                  {/* <div className="list-header">
                  {[{
                    key: "lightness",
                    label: "Lightness",
                    abbr: "L",
                  }, {
                    key: "saturation",
                    label: "Chroma",
                    abbr: "C",
                  }, {
                    key: "hue",
                    label: "Hue",
                    abbr: "H",
                  }].map(({ key, label, abbr }) => (
                    <span key={key}>
                      <button
                        className={classNames("link-button", {
                          active: color[`${key}Linked`],
                        })}
                        onClick={() => color.linkSpline(key, !color[`${key}Linked`])}
                      >
                        <Icon icon={linkIcon} />
                      </button>
                      <abbr title={label}>{abbr}</abbr>
                    </span>
                  ))}
                </div> */}
                  <span
                    className={classNames("list-heading", {
                      active: color.lightnessLinked,
                    })}
                  >
                    <button
                      className={classNames("link-button")}
                      onClick={() =>
                        color.linkSpline("lightness", !color.lightnessLinked)
                      }
                    >
                      <Icon
                        icon={color.lightnessLinked ? linkIcon : linkBrokenIcon}
                      />
                    </button>
                    <abbr title="lightness">L</abbr>
                  </span>
                  <span
                    className={classNames("list-heading", {
                      active: color.saturationLinked,
                    })}
                  >
                    <button
                      className={classNames("link-button")}
                      onClick={() =>
                        color.linkSpline("saturation", !color.saturationLinked)
                      }
                    >
                      <Icon
                        icon={
                          color.saturationLinked ? linkIcon : linkBrokenIcon
                        }
                      />
                    </button>
                    <abbr title="chroma">C</abbr>
                  </span>
                  <span
                    className={classNames("list-heading", {
                      active: color.hueLinked,
                    })}
                  >
                    <button
                      className={classNames("link-button")}
                      onClick={() => color.linkSpline("hue", !color.hueLinked)}
                    >
                      <Icon
                        icon={color.hueLinked ? linkIcon : linkBrokenIcon}
                      />
                    </button>
                    <abbr title="hue">H</abbr>
                  </span>
                </div>
                {color.shades.map((shade, i, arr) => {
                  const isExtreme = i === 0 || i === arr.length - 1
                  const isBackground =
                    theme.backgroundColorId === color.id &&
                    theme.backgroundShadeIndex === i
                  const name = i + 1
                  const namePadding = Array(
                    arr.length.toString().length - name.toString().length
                  ).fill("0")
                  return (
                    <label
                      className={`shade`}
                      style={{ "--color": shade.oklch }}
                    >
                      <ColorInput
                        disabled={!isExtreme}
                        type="color"
                        value={shade.oklch}
                        baseColor={
                          theme.baseColor && theme.baseColor.shades[i].oklch
                        }
                        onInput={(e) =>
                          color.setHex(
                            i === 0 ? "start" : "end",
                            e.target.value
                          )
                        }
                      />
                      <dl className="shade-text">
                        <dt className="shade-title">
                          <span className="shade-title-padding">
                            {namePadding}
                          </span>
                          {name}
                        </dt>
                        {state.ui.isValueVisible && (
                          <dd className="shade-value">
                            {shade.merged.map((v, i) => (
                              <>
                                {i !== 0 && (
                                  <span className="shade-value-separator">
                                    |
                                  </span>
                                )}
                                <span className="shade-value-value">
                                  {v.parts.map((part) => (
                                    <span
                                      className={`shade-value-${part.type}`}
                                    >
                                      {part.value}
                                    </span>
                                  ))}
                                  <span className="shade-value-unit">
                                    {v.unit}
                                  </span>
                                </span>
                              </>
                            ))}
                          </dd>
                        )}
                      </dl>
                      <label
                        className={
                          "shade-background-field " +
                          `${isBackground ? "active" : ""}`
                        }
                      >
                        <Icon
                          icon={
                            isBackground ? paintBrushBroadFill : paintBrushBroad
                          }
                        ></Icon>
                        <input
                          className="shade-background-input"
                          type="radio"
                          name="background-color"
                          id={shade.hsl}
                          value={shade.hex}
                          checked={
                            theme.backgroundColorId === color.id &&
                            theme.backgroundShadeIndex === i
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              theme.setBackgroundShade(color.id, i)
                            }
                          }}
                        />
                      </label>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}

        <div className="add-button-container">
          <Button
            className="add-button"
            status="secondary"
            onClick={() => {
              theme.addColor()
            }}
            label={
              <>
                <Icon icon={swatchesIcon} />
                <span>Add Color</span>
              </>
            }
          />
        </div>
      </div>
    </Styles>
  )
})

export default App
