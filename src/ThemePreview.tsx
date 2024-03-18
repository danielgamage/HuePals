import "./App.css"
import { observer } from "mobx-react"
import state from "./state"
import styled from "styled-components"
import { applyPatch } from "mobx-state-tree"
import { Icon } from "@iconify/react"
import Button from "./Button"
import deleteIcon from "@iconify-icons/solar/trash-bin-2-bold"
import warningIcon from "@iconify-icons/solar/danger-triangle-bold-duotone"
import heartIcon from "@iconify-icons/solar/heart-linear"
import heartFilledIcon from "@iconify-icons/solar/heart-bold"

const Styles = styled.div`
  position: relative;
  box-shadow: var(--shadow-beveled), var(--shadow-elevated);
  border-radius: var(--radius);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .title {
    display: flex;
    margin: 0;
    padding: 0.5rem;
    font-size: var(--size-1);
    line-height: 1rem;
    input {
      width: 100%;
      flex: 1 1 auto;
      background: var(--shadow-5);
      box-shadow: var(--shadow-recessed);
    }
  }

  .colors {
    display: flex;
    flex-flow: row;
    flex: 1 1 auto;
  }
  .color {
    display: flex;
    flex-flow: column;
    flex: 1 1 auto;
  }
  .shade {
    flex: 1 1 auto;
    background: var(--color);
  }
  .Button {
    padding: 1rem;
  }
`

const App = observer(({ theme, onDoubleClick }) => {
  return (
    <Styles className="ThemePreview" onDoubleClick={onDoubleClick}>
      <h2 className="title">
        <input
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
    </Styles>
  )
})

export default App
