import type { ReactNode } from "react"

const LabeledCheckbox = (props: {
  value: boolean
  name?: string
  type?: "checkbox"
  onChange: (v: boolean) => void
  checkedLabel: ReactNode
  uncheckedLabel: ReactNode
}) => {
  return (
    <label
      className={`LabeledCheckbox ${props.value ? "checked" : "unchecked"}`}
    >
      <input
        type={props.type || "checkbox"}
        name={props.name}
        checked={props.value}
        onChange={(e) => props.onChange(e.target.checked)}
      />
      {props.value ? props.checkedLabel : props.uncheckedLabel}
    </label>
  )
}

export default LabeledCheckbox
