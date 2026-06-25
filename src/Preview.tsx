import { observer } from "mobx-react"

const App = observer(({ theme }) => {
  return (
    <div className="Preview">
      <div className="colors">
        <div className="row-labels">
          {theme.colors[0].shades.map((_color, i) => (
            <div className="row-label">{i + 1}</div>
          ))}
        </div>
        {theme.colors.map((color) => (
          <div className="color">
            <div className="column-label">{color.name}</div>
            {color.shades.map((shade, i) => (
              <div className="shade rounded" style={{ "--color": shade.hsl }}>
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
