import { observer } from "mobx-react"
import { applyPatch } from "mobx-state-tree"
import { Icon } from "@iconify/react"
import Button from "./Button"
import deleteIcon from "@iconify-icons/solar/trash-bin-2-bold"
import warningIcon from "@iconify-icons/solar/danger-triangle-bold-duotone"
import heartIcon from "@iconify-icons/solar/heart-linear"
import heartFilledIcon from "@iconify-icons/solar/heart-bold"

const App = observer(({ theme, onDoubleClick }) => {
  return (
    <div className="ThemePreview rounded" onDoubleClick={onDoubleClick}>
      <h2 className="title">
        <input
          className="rounded"
          type="text"
          value={theme.name}
          onInput={(e) => {
            applyPatch(theme, {
              op: "add",
              path: "./name",
              value: e.target.value,
            })
          }}
        />
      </h2>
      <div className="colors">
        {theme.colors.map((color) => (
          <div className="color">
            {color.shades.map((shade) => (
              <div className="shade" style={{ "--color": shade.oklch }} />
            ))}
          </div>
        ))}
      </div>
      <footer>
        <Button
          status="text danger"
          onClick={() => theme.toggleFavorite()}
          label={<Icon icon={theme.favorite ? heartFilledIcon : heartIcon} />}
        />
        <Button
          status="text danger"
          onClick={() => theme.remove()}
          label={<Icon icon={deleteIcon} />}
          confirmLabel={<Icon icon={warningIcon} />}
        />
      </footer>
    </div>
  )
})

export default App
