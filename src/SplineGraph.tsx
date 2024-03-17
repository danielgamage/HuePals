import React, { useRef, useState } from "react"
import logo from "./logo.svg"
import { observer } from "mobx-react"
import state from "./state"
import styled from "styled-components"
import { scaleLinear } from "d3-scale"
import { easings } from "./utils/easings"

const Styles = styled.div`
  position: relative;
  background: var(--body-background);
  /* backdrop-filter: blur(10px); */
  border-radius: 4px;

  &.hue {
    --start-saturation: 100%;
    --end-saturation: 100%;
    --start-lightness: 50%;
    --end-lightness: 50%;
  }
  &.saturation {
    --start-lightness: 50%;
    --end-lightness: 50%;
  }
  &.lightness {
  }
  &.menu-open {
    .splineGraph {
      opacity: 0;
    }
    .easing-menu {
      display: grid;
    }
  }

  .rainbow {
    width: 100%;
    height: 100%;
    position: absolute;
    border-radius: 4px;
    z-index: 0;
    opacity: 0.5;
    overflow: hidden;
    &::before,
    &::after {
      content: "";
      width: 2px;
      height: 100%;
      position: absolute;
      background: linear-gradient(
        to bottom,
        oklch(.7 .4 480),
        oklch(.7 .4 440),
        oklch(.7 .4 400),
        oklch(.7 .4 360),
        oklch(.7 .4 320),
        oklch(.7 .4 280),
        oklch(.7 .4 240),
        oklch(.7 .4 200),
        oklch(.7 .4 160),
        oklch(.7 .4 120),
        oklch(.7 .4 80),
        oklch(.7 .4 40),
        oklch(.7 .4 0)
      );
    }
    &::before {
      left: 0;
    }
    &::after {
      right: 0;
    }
  }
  .splineGraph {
    overflow: visible;
    width: 8rem;
    height: 100%;
    vector-effect: non-scaling-stroke;
    position: relative;
    border-radius: 4px;
    box-shadow: var(--shadow-beveled), var(--shadow-elevated);

    path,
    line,
    circle {
      stroke-width: 2px;
      fill: none;
      vector-effect: non-scaling-stroke;
      stroke-linecap: round;
    }
    line {
      stroke: var(--fg-4);
    }
    path {
      stroke: var(--fg-1);
      pointer-events: none;
    }
    .point {
      fill: transparent;
      stroke-width: 2px;

      &--oncurve {
        r: 0.07px;
        stroke: var(--fg-4);
        fill: var(--bg-1);
      }
      &--oncurve-2 {
        r: 0.06px;
        stroke: var(--fg-4);
        stroke-width: 2.5px;
        fill: var(--body-background);
        pointer-events: none;
      }
      &--oncurve-sample {
        r: 0.015px;
        pointer-events: none;
        &.start {
          fill: oklch(
            var(--start-lightness) 
            var(--start-saturation) 
            var(--start-hue)
          );
        }
        &.end {
          fill: oklch(
            var(--end-lightness) 
            var(--end-saturation) 
            var(--end-hue)
          );
        }
      }
      &--offcurve {
        fill: var(--body-background);
        r: 0.07px;
      }
      &--offcurve-2 {
        r: 0.06px;
        stroke: var(--fg-4);
        stroke-width: 2.5px;
        pointer-events: none;
      }
      &--offcurve-3 {
        fill: var(--fg-4);
        r: 0.015px;
        pointer-events: none;
      }
    }
  }
  .easing-menu {
    display: none;
    position: absolute;
    inset: 0;
    grid-template-columns: 1fr 1fr 1fr;
    overflow: auto;
    box-shadow: var(--shadow-beveled), var(--shadow-elevated);
  }
  .easing-option {
    display: flex;
    background: none;
    border: none;
    padding: 0.5rem;
    &:hover,
    &:focus {
      path {
        stroke: var(--fg-2);
      }
    }
    svg {
      overflow: visible;
      height: 100%;
      width: 100%;
    }
    path {
      stroke: var(--fg-4);
      fill: none;
      vector-effect: non-scaling-stroke;
      stroke-width: 2px;
      stroke-linecap: round;
    }
  }
`

let isMouseDown = false
let initialMouse,
  initial,
  selectedNode,
  svgBounds,
  scaleX,
  scaleY,
  scaleYOncurve

const SplineGraph = observer(
  ({
    spline,
    onSplineUpdate,
    onEasingSelect,
    max,
    min,
    height = 1,
    attribute,
  }) => {
    const svgRef = useRef(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleMouseDown = (e, index) => {
      // right click
      if (e.button === 2) return

      isMouseDown = true
      selectedNode = index
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseEnd)
      window.addEventListener("mouseleave", handleMouseEnd)

      initialMouse = { x: e.clientX, y: e.clientY }
      svgBounds = svgRef.current.getBoundingClientRect()
      scaleX = scaleLinear()
        .domain([svgBounds.x, svgBounds.x + svgBounds.width])
        .range([0, 1])
        .clamp(true)
      scaleY = scaleLinear()
        .domain([svgBounds.y, svgBounds.y + svgBounds.height])
        .range([max, min])
      scaleYOncurve = scaleLinear()
        .domain([svgBounds.y, svgBounds.y + svgBounds.height])
        .range([max, min])
        .clamp(true)
    }
    const handleMouseMove = (e) => {
      if (isMouseDown) {
        const mouse = { x: e.clientX, y: e.clientY }
        let newSpline = [...spline]

        const xIndex = selectedNode * 2
        const yIndex = xIndex + 1

        switch (selectedNode) {
          case 0: // first
          case 3: // last
            newSpline[yIndex] = scaleYOncurve(mouse.y)
            break
          case 1: // first offcurve
          case 2: // last offcurve
            newSpline[xIndex] = scaleX(mouse.x)
            newSpline[yIndex] = scaleY(mouse.y)
            break
          default:
            break
        }

        onSplineUpdate(newSpline)
      }
    }
    const handleMouseEnd = (e) => {
      isMouseDown = false
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseEnd)
      window.removeEventListener("mouseleave", handleMouseEnd)
    }

    const graphScaleY = scaleLinear().domain([min, max]).range([height, 0])

    const scaledS = spline.map((el, i) => (i % 2 === 0 ? el : graphScaleY(el)))

    return (
      <Styles className={`SplineGraph ${attribute} ${isMenuOpen && "menu-open"}`} height={height}>
        {attribute === "hue" && <div className="rainbow" />}
        <svg
          className="splineGraph"
          viewBox={`0 0 1 ${height}`}
          ref={svgRef}
          onContextMenu={(e)=>{e.preventDefault(); setIsMenuOpen(true)}}
        >
          <line
            x1={scaledS[0]}
            y1={scaledS[1]}
            x2={scaledS[2]}
            y2={scaledS[3]}
          />
          <circle
            className="point point--offcurve"
            cx={scaledS[2]}
            cy={scaledS[3]}
            onMouseDown={(e) => {
              handleMouseDown(e, 1)
            }}
          />
          <circle
            className="point point--offcurve-2"
            cx={scaledS[2]}
            cy={scaledS[3]}
          />
          <circle
            className="point point--offcurve-3"
            cx={scaledS[2]}
            cy={scaledS[3]}
          />

          <line
            x1={scaledS[4]}
            y1={scaledS[5]}
            x2={scaledS[6]}
            y2={scaledS[7]}
          />
          <circle
            className="point point--offcurve"
            cx={scaledS[4]}
            cy={scaledS[5]}
            onMouseDown={(e) => {
              handleMouseDown(e, 2)
            }}
          />
          <circle
            className="point point--offcurve-2"
            cx={scaledS[4]}
            cy={scaledS[5]}
          />
          <circle
            className="point point--offcurve-3"
            cx={scaledS[4]}
            cy={scaledS[5]}
          />

          <path
            d={`
            M ${scaledS[0]}, ${scaledS[1]}
            C ${scaledS[2]}, ${scaledS[3]}
              ${scaledS[4]}, ${scaledS[5]}
              ${scaledS[6]}, ${scaledS[7]}
            `}
          />

          <circle
            className="point point--oncurve"
            cx={scaledS[0]}
            cy={scaledS[1]}
            onMouseDown={(e) => {
              handleMouseDown(e, 0)
            }}
          />
          <circle
            className="point point--oncurve-2"
            cx={scaledS[0]}
            cy={scaledS[1]}
          />
          <circle
            className="point point--oncurve-sample start"
            cx={scaledS[0]}
            cy={scaledS[1]}
          />

          <circle
            className="point point--oncurve"
            cx={scaledS[6]}
            cy={scaledS[7]}
            onMouseDown={(e) => {
              handleMouseDown(e, 3)
            }}
          />
          <circle
            className="point point--oncurve-2"
            cx={scaledS[6]}
            cy={scaledS[7]}
          />
          <circle
            className="point point--oncurve-sample end"
            cx={scaledS[6]}
            cy={scaledS[7]}
          />
        </svg>

          <div className="easing-menu">
            {Object.entries(easings).map(([key, value]) => (
              <button
                onClick={() => {
                  onEasingSelect(key)
                  setIsMenuOpen(false)
                }}
                onContextMenu={(e)=>{e.preventDefault(); setIsMenuOpen(false)}}
                className="easing-option"
                title={value.name}
              >
                <svg viewBox="0 0 1 1">
                  <path d={`
                    M 0, 0
                    C ${value.handles[0]}, ${value.handles[1]}
                      ${value.handles[2]}, ${value.handles[3]}
                      1, 1
                  `} />
                </svg>
              </button>
            ))}
          </div>
      </Styles>
    )
  }
)

export default SplineGraph
