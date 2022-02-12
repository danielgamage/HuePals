import React, { useState } from "react"
import "./App.css"
import { observer } from "mobx-react"
import state from "./state"
import styled from "styled-components"
import { applyPatch } from "mobx-state-tree"
import EditorView from "./EditorView"
import Preview from "./Preview"
import ExportView from "./ExportView"
import Button from "./Button"
import { Icon } from "@iconify/react"
import tuneIcon from "@iconify/icons-ic/baseline-tune"
import styleIcon from "@iconify/icons-ic/outline-style"
import importExportIcon from "@iconify/icons-ic/baseline-import-export"
import restoreIcon from "@iconify/icons-ic/baseline-restore"

const Styles = styled.div`
  display: flex;
  height: 100%;
  flex-flow: column;
  padding-bottom: 3rem;
`

const App = observer(() => {
  return (
    <Styles className="App">
      <div className="tabs">
        {[
          { label: "Editor", icon: tuneIcon },
          { label: "Grid", icon: styleIcon },
          { label: "Export", icon: importExportIcon },
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
                    state.ui.setTab(e.target.value)
                  }
                }}
              />
              <Icon icon={tab.icon} /> {tab.label}
            </label>
          )
        })}
      </div>
      {(() => {
        switch (state.ui.tab) {
          case "editor":
            return <EditorView />
          case "grid":
            return <Preview />
          case "export":
            return <ExportView />
          default:
            return <EditorView />
        }
      })()}
      <footer className={`app-footer`}>
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
        <label>
          Shades:
          <input
            className="shade-count"
            type="number"
            min="3"
            onChange={(e) => {
              const value = parseInt(e.target.value)
              if (value >= 3 && value <= 16) {
                applyPatch(state, {
                  op: "add",
                  path: "./interpolationCount",
                  value: value,
                })
              }
            }}
            value={state.interpolationCount}
          />
        </label>
        <div className="messages">
          {state.ui.visibleMessages.map((message) => (
            <div className={`message ${message.status}`}>{message.body}</div>
          ))}
        </div>
      </footer>
    </Styles>
  )
})

export default App
