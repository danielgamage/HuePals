import { useRef, type MutableRefObject } from "react"
import { Instance } from "mobx-state-tree"
import { observer } from "mobx-react"
import state, { Theme } from "./state"
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

type SplineKey = "lightness" | "saturation" | "hue"

const splinesEqual = (a: number[], b: number[]) =>
  a.length === b.length && a.every((n, i) => n === b[i])

const createSplineDragHandlers = (
  theme: Instance<typeof Theme>,
  color: Instance<typeof Theme>["colors"][number],
  key: SplineKey,
  snapshots: MutableRefObject<Map<string, number[]>>
) => {
  const dragKey = `${color.id}-${key}`
  const splineKey = `${key}Spline` as const

  return {
    onUpdateStart: () => {
      snapshots.current.set(dragKey, [...color[splineKey]])
    },
    onSplineUpdate: (v: number[]) => {
      theme.history.withoutUndo(() => color.setSpline(key, v))
    },
    onUpdateEnd: () => {
      const start = snapshots.current.get(dragKey)
      snapshots.current.delete(dragKey)
      if (!start) return

      const current = [...color[splineKey]]
      if (splinesEqual(start, current)) return

      theme.history.withoutUndo(() => color.setSpline(key, start))
      color.setSpline(key, current)
    },
  }
}

const App = observer(({ theme }: { theme: Instance<typeof Theme> }) => {
  const dragSnapshots = useRef(new Map<string, number[]>())

  return (
    <div
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
                  className="rounded"
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
                      {...createSplineDragHandlers(
                        theme,
                        color,
                        "lightness",
                        dragSnapshots
                      )}
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
                      {...createSplineDragHandlers(
                        theme,
                        color,
                        "saturation",
                        dragSnapshots
                      )}
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
                      {...createSplineDragHandlers(
                        theme,
                        color,
                        "hue",
                        dragSnapshots
                      )}
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
                      className="shade rounded"
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
    </div>
  )
})

export default App
