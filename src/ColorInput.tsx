import { observer } from "mobx-react"

const ColorInput = observer(({ baseColor, ...props }) => {
  return (
    <label className="ColorInput">
      <div
        className="swatch"
        style={{ "--color": props.value, "--base-color": baseColor }}
      />
      <input type="color" {...props} />
    </label>
  )
})

export default ColorInput
