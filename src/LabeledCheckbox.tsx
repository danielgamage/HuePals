import "./App.css"
import styled from "styled-components"

const Root = styled.label`
  display: flex;
  gap: 0.4rem;
  align-items: center;
  input {
    position: absolute;
    opacity: 0;
  }
  &.checked {
    color: var(--checked-color, var(--fg-1));
    svg {
      color: var(--checked-icon-color, var(--fg-2));
    }
  }
  &.unchecked {
    color: var(--unchecked-color, var(--fg-1));
    svg {
      color: var(--unchecked-icon-color, var(--fg-4));
    }
  }
`

const LabeledCheckbox = (props: {
  value: boolean
  name: string
  type: "checkbox"
  onChange: (v: boolean) => void
  checkedLabel: string
  uncheckedLabel: string
}) => {
  return (
    <Root
      className={`LabeledCheckbox ${props.value ? "checked" : "unchecked"}`}
    >
      <input
        type={props.type || "checkbox"}
        name={props.name}
        checked={props.value}
        onChange={(e) => props.onChange(e.target.checked)}
      />
      {props.value ? props.checkedLabel : props.uncheckedLabel}
    </Root>
  )
}

export default LabeledCheckbox
