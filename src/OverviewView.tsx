import { useRef } from "react"
import { observer } from "mobx-react"
import state from "./state"
import ThemePreview from "./ThemePreview"
import Button from "./Button"
import { Icon } from "@iconify/react"
import addIcon from "@iconify-icons/solar/folder-2-bold-duotone"
import restoreIcon from "@iconify-icons/solar/clock-circle-bold-duotone"
import heartBold from "@iconify-icons/solar/heart-bold"
import swatchesBold from "@iconify-icons/solar/palette-bold-duotone"
import downloadIcon from "@iconify-icons/solar/download-minimalistic-bold-duotone"
import copyIcon from "@iconify-icons/solar/clipboard-add-bold-duotone"
import uploadIcon from "@iconify-icons/solar/upload-bold-duotone"
import { copyText } from "./utils/dom"
import {
  applyImportJson,
  downloadJson,
  serializeSnapshot,
} from "./utils/jsonState"

const App = observer(() => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const storeJson = serializeSnapshot(state)

  const handleImportFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const kind = applyImportJson(state, reader.result as string)
        state.ui.addMessage({
          body:
            kind === "store"
              ? "Imported full store"
              : "Imported theme",
          status: "success",
        })
      } catch (err) {
        if (err instanceof Error && err.message === "Import cancelled") {
          return
        }
        state.ui.addMessage({
          body: "Invalid JSON file",
          status: "danger",
        })
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="Overview">
      {[
        {
          key: "favorites",
          label: (
            <>
              <Icon icon={heartBold} /> Favorites
            </>
          ),
          themes: state.themes.filter((theme) => theme.favorite),
        },
        {
          key: "all",
          label: (
            <>
              <Icon icon={swatchesBold} /> All
            </>
          ),
          themes: state.themes.filter((theme) => !theme.favorite),
        },
      ].map(
        (group) => {
          if (group.key === "favorites" && !group.themes.length) return null
          return (<>
            <h2 className="themes-header">{group.label}</h2>
            <div className="themes">
              {group.themes.map((theme) => (
                <ThemePreview
                  theme={theme}
                  onClick={() => state.ui.setCurrentTheme(theme)}
                />
              ))}
              {group.key === "all" && (
                <Button
                  onClick={() => {
                    state.addTheme()
                  }}
                  label={
                    <>
                      <Icon height={`${1.25 ** 2}em`} icon={addIcon} />
                      <span>New Theme</span>
                    </>
                  }
                />
              )}
            </div>
          </>)
        }
      )}
      <div className="data-controls">
        <Button
          onClick={() => {
            downloadJson("huepals.json", storeJson)
          }}
          label={
            <>
              <Icon height={`${1.25 ** 2}em`} icon={downloadIcon} />
              <span>Export JSON</span>
            </>
          }
        />
        <Button
          onClick={() => {
            copyText(storeJson).then(() => {
              state.ui.addMessage({
                body: "Copied to clipboard",
                status: "success",
              })
            })
          }}
          label={
            <>
              <Icon height={`${1.25 ** 2}em`} icon={copyIcon} />
              <span>Copy JSON</span>
            </>
          }
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          label={
            <>
              <Icon height={`${1.25 ** 2}em`} icon={uploadIcon} />
              <span>Import JSON</span>
            </>
          }
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImportFile(file)
            e.target.value = ""
          }}
        />
      </div>
      <Button
        status="danger"
        onClick={() => {
          state.resetStore()
        }}
        label={
          <>
            <Icon height={`${1.25 ** 2}em`} icon={restoreIcon} />
            <span>Reset All</span>
          </>
        }
        confirmLabel={
          <>
            <Icon height={`${1.25 ** 2}em`} icon={restoreIcon} />
            <span>Are you sure?</span>
          </>
        }
      />
    </div>
  )
})

export default App
