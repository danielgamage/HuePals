import { useRef, useState, type RefObject } from "react"
import { useDrag } from "@use-gesture/react"
import { observer } from "mobx-react"
import styled from "styled-components"
import { scaleLinear } from "d3-scale"
import { easings } from "./utils/easings"

const Styles = styled.div/* CSS */`
  position: relative;
  background: var(--body-background);
  /* backdrop-filter: blur(10px); */
  border-radius: var(--radius);

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
    border-radius: var(--radius);
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
    border-radius: var(--radius);
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
      touch-action: none;

      &--oncurve {
        r: 0.07px;
        fill: var(--body-background);
      }
      &--oncurve-2 {
        r: 0.06px;
        stroke: var(--fg-4);
        stroke-width: 2px;
        pointer-events: none;
      }
      &--oncurve-sample {
        r: 0.03px;
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

type SplineHandleProps = {
  index: number
  cx: number
  cy: number
  className: string
  svgRef: RefObject<SVGSVGElement>
  min: number
  max: number
  spline: number[]
  onUpdateStart?: () => void
  onUpdateEnd?: () => void
  onSplineUpdate: (spline: number[]) => void
}

const SplineHandle = ({
  index,
  cx,
  cy,
  className,
  svgRef,
  min,
  max,
  spline,
  onUpdateStart,
  onUpdateEnd,
  onSplineUpdate,
}: SplineHandleProps) => {
  const propsRef = useRef({
    spline,
    onUpdateStart,
    onUpdateEnd,
    onSplineUpdate,
  })

  propsRef.current = {
    spline,
    onUpdateStart,
    onUpdateEnd,
    onSplineUpdate,
  }

  const updateFromPointer = (x: number, y: number) => {
    const svg = svgRef.current
    if (!svg) return

    const bounds = svg.getBoundingClientRect()
    const scaleX = scaleLinear()
      .domain([bounds.x, bounds.x + bounds.width])
      .range([0, 1])
      .clamp(true)
    const scaleY = scaleLinear()
      .domain([bounds.y, bounds.y + bounds.height])
      .range([max, min])
    const scaleYOncurve = scaleLinear()
      .domain([bounds.y, bounds.y + bounds.height])
      .range([max, min])
      .clamp(true)

    const { spline: currentSpline, onSplineUpdate: update } = propsRef.current
    const newSpline = [...currentSpline]
    const xIndex = index * 2
    const yIndex = xIndex + 1

    switch (index) {
      case 0:
      case 3:
        newSpline[yIndex] = scaleYOncurve(y)
        break
      case 1:
      case 2:
        newSpline[xIndex] = scaleX(x)
        newSpline[yIndex] = scaleY(y)
        break
    }

    update(newSpline)
  }

  const bind = useDrag(
    ({ xy: [x, y], first, last, event }) => {
      if ("button" in event && event.button === 2) return

      if (first) {
        propsRef.current.onUpdateStart?.()
      }

      updateFromPointer(x, y)

      if (last) {
        propsRef.current.onUpdateEnd?.()
      }
    },
    {
      pointer: { capture: true },
      filterTaps: true,
    }
  )

  return <circle className={className} cx={cx} cy={cy} {...bind()} />
}

const SplineGraph = observer(
  ({
    spline,
    onUpdateStart,
    onUpdateEnd,
    onSplineUpdate,
    onEasingSelect,
    max,
    min,
    height = 1,
    attribute,
  }) => {
    const svgRef = useRef<SVGSVGElement>(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const graphScaleY = scaleLinear().domain([min, max]).range([height, 0])

    const scaledS = spline.map((el, i) => (i % 2 === 0 ? el : graphScaleY(el)))

    const handleProps = {
      svgRef,
      min,
      max,
      spline,
      onUpdateStart,
      onUpdateEnd,
      onSplineUpdate,
    }

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
          <SplineHandle
            {...handleProps}
            index={1}
            cx={scaledS[2]}
            cy={scaledS[3]}
            className="point point--offcurve"
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
          <SplineHandle
            {...handleProps}
            index={2}
            cx={scaledS[4]}
            cy={scaledS[5]}
            className="point point--offcurve"
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

          <SplineHandle
            {...handleProps}
            index={0}
            cx={scaledS[0]}
            cy={scaledS[1]}
            className="point point--oncurve"
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

          <SplineHandle
            {...handleProps}
            index={3}
            cx={scaledS[6]}
            cy={scaledS[7]}
            className="point point--oncurve"
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
