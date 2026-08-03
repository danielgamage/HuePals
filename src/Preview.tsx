import { observer } from "mobx-react"

const App = observer(({ theme }) => {
  const firstColor = theme.colors[0]
  if (!firstColor) {
    return <div className="Preview" />
  }

  return (
    <div className="Preview">
      <div className="colors">
        <div className="row-labels">
          {firstColor.shades.map((_color, i) => (
            <div className="row-label" key={i}>
              {i + 1}
            </div>
          ))}
        </div>
        {theme.colors.map((color) => (
          <div className="color" key={color.id}>
            <div className="column-label">{color.name}</div>
            {color.shades.map((shade, i) => (
              <div
                className="shade rounded"
                key={i}
                style={{ "--color": shade.hsl }}
              >
                <div
                  className="swatch"
                  style={{
                    "--base-color":
                      theme.baseColor && theme.baseColor.shades[i].hsl,
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
})

export default App
