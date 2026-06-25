import { useState } from "react"
import { observer } from "mobx-react"
import classnames from "classnames"

const Button = observer(
  ({
    status,
    className,
    label,
    confirmLabel,
    onClick,
  }: {
    status?: string
    className?: string
    label: React.ReactNode
    confirmLabel?: React.ReactNode
    onClick: () => void
  }) => {
    const requiresConfirmation = !!confirmLabel
    const [clickedOnce, setClicked] = useState(false)

    return (
      <button
        type="button"
        className={classnames("Button", "rounded", className, status)}
        onClick={() => {
          if (!requiresConfirmation || clickedOnce) {
            onClick()
            setClicked(false)
          } else {
            setClicked(true)

            // Unset after 5s
            setTimeout(() => {
              setClicked(false)
            }, 5000)
          }
        }}
      >
        {clickedOnce ? confirmLabel : label}
      </button>
    )
  }
)

export default Button
