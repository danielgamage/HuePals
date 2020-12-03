import React, { useState } from "react"
import "./App.css"
import { observer } from "mobx-react"
import state from "./state"
import styled from "styled-components"
import { applyPatch } from "mobx-state-tree"
import EditorView from "./EditorView"
import Preview from "./Preview"
import ExportView from "./ExportView"
import ThemePreview from "./ThemePreview"
import Button from "./Button"
import { Icon } from "@iconify/react"
import addIcon from "@iconify/icons-ic/round-add-circle-outline"
import restoreIcon from "@iconify-icons/ph/clock-counter-clockwise-fill"

const Styles = styled.div`
  padding: 1rem;
  overflow: auto;
  .themes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    grid-auto-rows: 12rem;
    margin-bottom: 1rem;
    grid-gap: 1rem;
  }
`

const App = observer(() => {
  return (
    <Styles className="Overview">
      <div className="themes">
        {state.themes.map((theme) => (
          <ThemePreview
            theme={theme}
            onDoubleClick={() => state.ui.setCurrentTheme(theme)}
          />
        ))}
        <Button
          status="primary"
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
    </Styles>
  )
})

export default App
