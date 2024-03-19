import { useRef } from "react"
import { observer } from "mobx-react"
import state from "./state"
import styled from "styled-components"
import { Icon } from "@iconify/react"
import copyIcon from "@iconify-icons/solar/clipboard-add-bold-duotone"
import downloadIcon from "@iconify-icons/solar/download-minimalistic-bold-duotone"
import Button from "./Button"
import {copyText} from "./utils/dom"

const Styles = styled.div`
  height: 100%;
  padding-bottom: 3rem;
  flex: 1 1 auto;
  overflow: auto;
  user-select: text;
  padding: 2rem;

  textarea {
    width: 0;
    height: 0;
    opacity: 0;
    position: absolute;
    pointer-events: none;
  }
  .options {
    margin-bottom: 1rem;
    & > * {
      margin-right: 1rem;
    }
  }
  .svg {
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
    gap: 1rem;
    .buttons {
      display: flex;
      gap: 1rem;
    }
  }
  img {
    margin-bottom: 1rem;
    display: block;
  }
  p {
    color: var(--fg-4);
    max-width: 36ch;
  }
`

const ExportView = observer(({ theme }) => {
  const outputEl = useRef(null)

  return (
    <Styles className="ExportView">
      <div className="options">
        <select
          onChange={(e) => state.ui.setExportLanguage(e.target.value)}
          value={state.ui.exportLanguage}
        >
          {["css", "sass", "csv"].map((el) => (
            <option value={el}>{el.toUpperCase()}</option>
          ))}
        </select>
        <select
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
    </Styles>
  )
})

export default ExportView
