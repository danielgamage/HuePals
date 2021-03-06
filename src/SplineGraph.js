import React, { useRef } from "react"
import logo from "./logo.svg"
import { observer } from "mobx-react"
import state from "./state"
import styled from "styled-components"
import { scaleLinear } from "d3-scale"

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
        hsl(480, 100%, 50%),
        hsl(440, 100%, 50%),
        hsl(400, 100%, 50%),
        hsl(360, 100%, 50%),
        hsl(320, 100%, 50%),
        hsl(280, 100%, 50%),
        hsl(240, 100%, 50%),
        hsl(200, 100%, 50%),
        hsl(160, 100%, 50%),
        hsl(120, 100%, 50%),
        hsl(80, 100%, 50%),
        hsl(40, 100%, 50%),
        hsl(0, 100%, 50%)
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
        r: 0.07;
        fill: var(--bg-1);
      }
      &--oncurve-2 {
        r: 0.06;
        stroke: var(--fg-4);
        stroke-width: 2.5px;
        fill: var(--body-background);
        pointer-events: none;
      }
      &--oncurve-sample {
        r: 0.015;
        pointer-events: none;
        &.start {
          fill: hsl(
            var(--start-hue),
            var(--start-saturation),
            var(--start-lightness)
          );
        }
        &.end {
          fill: hsl(
            var(--end-hue),
            var(--end-saturation),
            var(--end-lightness)
          );
        }
      }
      &--offcurve {
        fill: var(--body-background);
        r: 0.07;
      }
      &--offcurve-2 {
        r: 0.06;
        stroke: var(--fg-4);
        stroke-width: 2.5px;
        pointer-events: none;
      }
      &--offcurve-3 {
        fill: var(--fg-4);
        r: 0.015;
        pointer-events: none;
      }
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
    color,
    onSplineUpdate,
    max,
    min,
    width,
    height = 1,
    onStartUpdate,
    onEndUpdate,
    attribute,
  }) => {
    const svgRef = useRef(null)

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
      <Styles className={`SplineGraph ${attribute}`} height={height}>
        {attribute === "hue" && <div className="rainbow" />}
        <svg className="splineGraph" viewBox={`0 0 1 ${height}`} ref={svgRef}>
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
      </Styles>
    )
  }
)

export default SplineGraph
