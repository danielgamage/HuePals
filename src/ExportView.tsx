import { useRef } from "react"
import { observer } from "mobx-react"
import state from "./state"
import { Icon } from "@iconify/react"
import copyIcon from "@iconify-icons/solar/clipboard-add-bold-duotone"
import downloadIcon from "@iconify-icons/solar/download-minimalistic-bold-duotone"
import Button from "./Button"
import {copyText} from "./utils/dom"

const ExportView = observer(({ theme }) => {
  const outputEl = useRef(null)

  return (
    <div className="ExportView">
      <div className="options">
        <select
          className="rounded"
          onChange={(e) => state.ui.setExportLanguage(e.target.value)}
          value={state.ui.exportLanguage}
        >
          {["css", "sass", "csv"].map((el) => (
            <option value={el}>{el.toUpperCase()}</option>
          ))}
        </select>
        <select
          className="rounded"
          onChange={(e) => state.ui.setColorspace(e.target.value)}
          value={state.ui.colorspace}
        >
          {["oklch", "lch", "hex", "rgb", "hsl"].map((el) => (
            <option value={el}>{el.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div className="svg">
        <img
          src={theme.svgURI}
          alt="The downloadable SVG swatch"
          width="128px"
          height="128px"
        />
        <div>
          <div className="buttons">
            <Button
              onClick={() => {
                const a = document.createElement("a")
                a.href = theme.svgURI
                a.download = theme.name + ".svg"
                a.click()
              }}
              label={
                <>
                  <Icon height={`${1.25 ** 2}em`} icon={downloadIcon} />
                  <span>Download SVG</span>
                </>
              }
            />

            <Button
              onClick={() => {
                copyText(theme.svgString).then(() => {
                  state.ui.addMessage({
                    body: "Copied to clipboard",
                    status: "success",
                  })
                })
              }}
              label={
                <>
                  <Icon height={`${1.25 ** 2}em`} icon={copyIcon} />
                  <span>
                    Copy SVG code
                  </span>
                </>
              }
            />
          </div>
          <p>
            This SVG can be dragged, copied, or saved and imported in nearly all
            design tools.
          </p>
        </div>
      </div>

      <Button
        onClick={() => {
          copyText(theme.exportText).then(() => {
            state.ui.addMessage({
              body: "Copied to clipboard",
              status: "success",
            })
          })
        }}
        label={
          <>
            <Icon height={`${1.25 ** 2}em`} icon={copyIcon} />
            <span>
              Copy {state.ui.exportLanguage.toUpperCase()}
            </span>
          </>
        }
      />
      <textarea ref={outputEl}>{theme.exportText}</textarea>
      <pre>{theme.exportText}</pre>
    </div>
  )
})

export default ExportView
