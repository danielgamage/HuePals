import React, { useState } from "react"
import "./App.css"
import { observer } from "mobx-react"
import state from "./state"
import styled from "styled-components"
import { applyPatch } from "mobx-state-tree"
import EditorView from "./EditorView"
import Preview from "./Preview"
import ExportView from "./ExportView"
import OverviewView from "./OverviewView"
import LabeledCheckbox from "./LabeledCheckbox"
import Button from "./Button"
import { Icon } from "@iconify/react"
import houseIcon from "@iconify-icons/ph/house-line-bold"
import slidersIcon from "@iconify-icons/ph/sliders-bold"
import circlesIcon from "@iconify-icons/ph/circles-four-bold"
import shareBold from "@iconify-icons/ph/share-bold"
import eyeIcon from "@iconify-icons/ph/eye-fill"
import eyeOffIcon from "@iconify-icons/ph/eye-slash-fill"

const Styles = styled.div`
  display: flex;
  height: 100%;
  flex-flow: column;
  background: var(--body-background);
  background-color: var(--body-background);
  color: var(--fg-1);
  user-select: none;
  font-family: var(--sans);
  .tabs {
    display: flex;
    height: 3rem;
    padding: 0 2rem;
    background-color: var(--body-background);
    box-shadow: var(--shadow-beveled), var(--shadow-elevated);
    z-index: 100;
  }
  .tab-item {
    display: flex;
    align-items: center;
    line-height: 3rem;
    font-size: var(--size-1);
    padding: 0 0.5rem;
    font-weight: 700;
    &.inactive {
      color: var(--fg-3);
      svg {
        color: var(--fg-4);
      }
    }
    &.active {
      box-shadow: 0 -0.15em var(--fg-3) inset;
    }
    &:active {
      background: var(--fg-5);
    }
    input {
      opacity: 0;
      position: absolute;
      width: 0;
      height: 0;
    }
    svg {
      color: var(--fg-2);
      /* height: 1.25em; */
      /* width: 1.25em; */
      margin-right: 0.5rem;
    }
  }
  .swatch {
    width: 2rem;
    height: 2rem;
    position: relative;
    border-radius: 1rem;
    background: linear-gradient(
      to right,
      var(--base-color, var(--color)),
      var(--base-color, var(--color)) 49%,
      var(--color) 51%
    );
    flex: 0 0 auto;
    overflow: hidden;
  }
  .messages {
    margin-left: auto;
  }
  .message {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    box-shadow: 0 2px 8px var(--shadow-color);

    &.success {
      background: var(--green-8);
      color: var(--green-1);
    }
  }
  .app-footer {
    padding: 1rem;
    position: absolute;
    display: flex;
    align-items: center;
    gap: 1rem;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4rem;
    padding: 0 2rem;
    background: var(--bg-2);
    z-index: 1;
    transition: 0.3s var(--ease-out) height;
    background-color: var(--body-background);
    box-shadow: var(--shadow-beveled), var(--shadow-elevated);
    --unchecked-icon-color: var(--fg-4);
    --checked-icon-color: var(--fg-2);
  }
  .shade-count {
    width: 3rem;
    margin-left: 0.5rem;
    box-shadow: var(--shadow-recessed);
    background-color: var(--shadow-5);
  }
`

const App = observer(() => {
  return (
    <Styles
      className={`App ${
        state.ui.currentTheme &&
        state.ui.currentTheme.backgroundShade &&
        state.ui.currentTheme.backgroundShade.l > 50
          ? "theme--light"
          : "theme--dark"
      }`}
      style={{
        "--body-background":
          state.ui.currentTheme &&
          state.ui.currentTheme.backgroundShade &&
          state.ui.currentTheme.backgroundShade.hex,
      }}
    >
      <div className="tabs">
        {[
          { label: "Overview", icon: houseIcon },
          !!state.ui.currentTheme && { label: "Editor", icon: slidersIcon },
          !!state.ui.currentTheme && { label: "Preview", icon: circlesIcon },
          !!state.ui.currentTheme && { label: "Export", icon: shareBold },
        ]
          .filter(Boolean)
          .map((tab) => {
            const value = tab.label.toLowerCase()
            return (
              <label
                className={`tab-item ${
                  state.ui.tab === value ? "active" : "inactive"
                }`}
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
      {(() => {
        switch (state.ui.view) {
          case "overview":
            return <OverviewView />
          case "editor":
            return <EditorView {...{ theme: state.ui.currentTheme }} />
          case "preview":
            return <Preview {...{ theme: state.ui.currentTheme }} />
          case "export":
            return <ExportView {...{ theme: state.ui.currentTheme }} />
          default:
            return <OverviewView />
        }
      })()}
      {state.ui.view !== "overview" && (
        <footer className={`app-footer`}>
          <label>
            Shades:
            <input
              className="shade-count"
              type="number"
              min="3"
              onChange={(e) => {
                const value = parseInt(e.target.value)
                if (value >= 3 && value <= 16) {
                  applyPatch(state.ui.currentTheme, {
                    op: "add",
                    path: "./interpolationCount",
                    value: value,
                  })
                }
              }}
              value={state.ui.currentTheme.interpolationCount}
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
          <div className="messages">
            {state.ui.visibleMessages.map((message) => (
              <div className={`message ${message.status}`}>{message.body}</div>
            ))}
          </div>
        </footer>
      )}
    </Styles>
  )
})

export default App
