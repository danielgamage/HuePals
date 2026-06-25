import "./App.scss"
import { observer } from "mobx-react"
import state from "./state"
import { applyPatch } from "mobx-state-tree"
import EditorView from "./EditorView"
import Preview from "./Preview"
import ExportView from "./ExportView"
import OverviewView from "./OverviewView"
import LabeledCheckbox from "./LabeledCheckbox"
import { Icon } from "@iconify/react"
import houseIcon from "@iconify-icons/solar/home-2-bold-duotone"
import slidersIcon from "@iconify-icons/solar/pen-new-round-bold-duotone"
import circlesIcon from "@iconify-icons/solar/widget-3-bold-duotone"
import shareBold from "@iconify-icons/solar/screen-share-bold-duotone"
import eyeIcon from "@iconify-icons/solar/eye-bold"
import eyeOffIcon from "@iconify-icons/solar/eye-closed-bold"
import chevron from "@iconify-icons/solar/alt-arrow-right-linear"
import threeDotsVertical from "@iconify-icons/solar/filters-bold-duotone"
import undo from "@iconify-icons/solar/undo-left-round-bold"
import redo from "@iconify-icons/solar/undo-right-round-bold"

const App = observer(() => {
  const currentTheme = state.ui.currentTheme
  return (
    <div
      className={`App ${
        currentTheme?.backgroundShade?.l >= 0.49
          ? "theme--light"
          : "theme--dark"
      }`}
      style={{
        "--body-background": currentTheme?.backgroundShade?.oklch,
      }}
    >
      <div className="appBar">
        <div className="breadcrumbs">
          <div className="tabs main">
            {[{ label: "Overview", icon: houseIcon }]
              .filter(Boolean)
              .map((tab) => {
                const value = tab.label.toLowerCase()
                return (
                  <label
                    className={`tab-item ${
                      state.ui.tab === value ? "active" : "inactive"
                    }`}
                    key={value}
                  >
                    <input
                      type="radio"
                      checked={state.ui.tab === value}
                      value={value}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (value === "overview") {
                            state.ui.setCurrentTheme(null)
                          }
                          state.ui.setTab(e.target.value)
                        }
                      }}
                    />
                    <Icon icon={tab.icon} /> {tab.label}
                  </label>
                )
              })}
          </div>
          {currentTheme && (
            <>
              <Icon icon={chevron} className="chevron" />
              <div className="activeThemeLabel">
                <div>
                  <div className="thumbnail rounded">
                    {currentTheme.colors.map((shade) => (
                      <div className="thumbnailColumn">
                        {shade.interpolations.map((interpolation) => (
                          <div
                            className="thumbnailSwatch"
                            style={{
                              "--color": interpolation?.oklch,
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                {currentTheme.name}
              </div>
            </>
          )}
        </div>
        {!!currentTheme && (
          <div className="activeTheme">
            <div className="tabs sub">
              {[
                { label: "Editor", icon: slidersIcon },
                { label: "Preview", icon: circlesIcon },
                { label: "Export", icon: shareBold },
              ].map((tab) => {
                const value = tab.label.toLowerCase()
                return (
                  <label
                    className={`tab-item ${
                      state.ui.tab === value ? "active" : "inactive"
                    }`}
                    key={value}
                  >
                    <input
                      type="radio"
                      checked={state.ui.tab === value}
                      value={value}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (value === "overview") {
                            state.ui.setCurrentTheme(null)
                          }
                          state.ui.setTab(e.target.value)
                        }
                      }}
                    />
                    <Icon icon={tab.icon} /> {tab.label}
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </div>
      {(() => {
        switch (state.ui.view) {
          case "overview":
            return <OverviewView />
          case "editor":
            return <EditorView {...{ theme: currentTheme }} />
          case "preview":
            return <Preview {...{ theme: currentTheme }} />
          case "export":
            return <ExportView {...{ theme: currentTheme }} />
          default:
            return <OverviewView />
        }
      })()}
      {state.ui.view !== "overview" && (
        <footer className={`app-footer`}>
          <label>
            <Icon icon={threeDotsVertical} />
            Shades:
            <input
              className="shade-count rounded"
              type="number"
              min="3"
              onChange={(e) => {
                const value = parseInt(e.target.value)
                if (value >= 3 && value <= 16) {
                  applyPatch(currentTheme, {
                    op: "add",
                    path: "./interpolationCount",
                    value: value,
                  })
                }
              }}
              value={currentTheme.interpolationCount}
            />
          </label>
          <LabeledCheckbox
            value={state.ui.isGraphVisible}
            onChange={(v) => {
              applyPatch(state.ui, {
                op: "add",
                path: "./isGraphVisible",
                value: v,
              })
            }}
            checkedLabel={
              <>
                <Icon icon={eyeIcon} /> Graphs
              </>
            }
            uncheckedLabel={
              <>
                <Icon icon={eyeOffIcon} /> Graphs
              </>
            }
          />
          <div className="history">
            <button onClick={() => {currentTheme?.history.undo()}} disabled={!currentTheme?.history.canUndo}>
              <Icon icon={undo} />
            </button>
            <button onClick={() => {currentTheme?.history.redo()}} disabled={!currentTheme?.history.canRedo}>
              <Icon icon={redo} />
            </button>
          </div>
          <div className="messages">
            {state.ui.visibleMessages.map((message) => (
              <div className={`message rounded ${message.status}`}>{message.body}</div>
            ))}
          </div>
        </footer>
      )}
    </div>
  )
})

export default App
