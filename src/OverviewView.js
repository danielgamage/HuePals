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
import addIcon from "@iconify-icons/ph/folder-plus-duotone"
import restoreIcon from "@iconify-icons/ph/clock-counter-clockwise-duotone"
import heartBold from "@iconify-icons/ph/heart-bold"
import swatchesBold from "@iconify-icons/ph/swatches-bold"

const Styles = styled.div`
  padding: 1rem;
  overflow: auto;
  .themes-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: var(--size-1);
    line-height: 1;
  }
  .themes {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
    grid-auto-rows: 12rem;
    margin-bottom: 1rem;
    grid-gap: 1rem;
  }
`

const App = observer(() => {
  return (
    <Styles className="Overview">
      {[
        {
          label: (
            <>
              <Icon icon={heartBold} /> Favorites
            </>
          ),
          themes: state.themes.filter((theme) => theme.favorite),
        },
        {
          label: (
            <>
              <Icon icon={swatchesBold} /> All
            </>
          ),
          themes: state.themes.filter((theme) => !theme.favorite),
        },
      ]
        .filter((group) => group.themes.length)
        .map((group) => (
          <>
            <h2 className="themes-header">{group.label}</h2>
            <div className="themes">
              {group.themes.map((theme) => (
                <ThemePreview
                  theme={theme}
                  onDoubleClick={() => state.ui.setCurrentTheme(theme)}
                />
              ))}
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
            </div>
          </>
        ))}
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
