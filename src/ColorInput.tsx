import { observer } from "mobx-react"
import styled from "styled-components"

const Styles = styled.label`
  cursor: pointer;

  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
`

const ColorInput = observer(({ baseColor, ...props }) => {
  return (
    <Styles className="ColorInput">
      <div
        className="swatch"
        style={{ "--color": props.value, "--base-color": baseColor }}
      />
      <input type="color" {...{ props }} />
    </Styles>
  )
})

export default ColorInput
