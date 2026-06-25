import { useRef, useState, type RefObject } from "react"
import { useDrag } from "@use-gesture/react"
import { observer } from "mobx-react"
import { scaleLinear } from "d3-scale"
import { easings } from "./utils/easings"

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
      <div className={`SplineGraph rounded ${attribute} ${isMenuOpen && "menu-open"}`}>
        {attribute === "hue" && <div className="viz rainbow rounded" />}
        {attribute === "saturation" && <div className="viz saturation rounded" />}
        {attribute === "lightness" && <div className="viz lightness rounded" />}
        <svg
          className="splineGraph rounded"
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
      </div>
    )
  }
)

export default SplineGraph
