import React, { useRef } from "react"
import logo from "./logo.svg"
import { observer } from "mobx-react"
import state from "./state"
import styled from "styled-components"
import { line, curveBundle } from "d3-shape"
import { scaleLinear } from "d3-scale"

const Styles = styled.label`
  cursor: pointer;

  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
`

const ColorInput = observer((props) => {
  return (
    <Styles className="ColorInput">
      <div
        className="swatch"
        style={{ "--color": props.value, "--base-color": props.baseColor }}
      />
      <input type="color" {...props} />
    </Styles>
  )
})

export default ColorInput
