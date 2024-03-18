import React from "react"
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
import { Icon } from "@iconify/react"
import houseIcon from "@iconify-icons/solar/home-2-bold-duotone"
import slidersIcon from "@iconify-icons/solar/pen-new-round-bold-duotone"
import circlesIcon from "@iconify-icons/solar/widget-3-bold-duotone"
import shareBold from "@iconify-icons/solar/screen-share-bold-duotone"
import eyeIcon from "@iconify-icons/solar/eye-bold"
import eyeOffIcon from "@iconify-icons/solar/eye-closed-bold"
import chevron from "@iconify-icons/solar/alt-arrow-right-linear"
import threeDotsVertical from "@iconify-icons/solar/filters-bold-duotone"

const Styles = styled.div`
  display: flex;
  height: 100%;
  flex-flow: column;
  background: var(--body-background);
  background-color: var(--body-background);
  color: var(--fg-1);
  user-select: none;
  font-family: var(--sans);
  .appBar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--body-background);
    box-shadow: var(--shadow-beveled), var(--shadow-elevated);
    z-index: 100;
    padding: 0 1rem;
  }
  .activeTheme {
    display: flex;
    align-items: center;
  }
  .activeThemeLabel {
    font-weight: 700;
    display: flex;
    gap: 0.5rem;
    height: 100%;
    align-items: center;
    padding-inline: 1rem;
  }
  .thumbnail {
    display: flex;
    width: calc(2rem * 16 / 9);
    height: 2rem;
    border-radius: 0.25rem;
    background: rgba(0, 0, 0, 0.1);
    overflow: hidden;
    box-shadow: var(--shadow-recessed);
  }
  .thumbnailColumn {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
  }
  .thumbnailSwatch {
    background: var(--color);
    flex: 1 1 auto;
  }
  .chevron {
    color: var(--fg-4);
    height: 1rem;
    width: 1rem;
  }
  .tabs {
    display: flex;
    height: 3rem;
  }
  .breadcrumbs {
    display: flex;
    align-items: center;
  }
  .tab-item {
    display: flex;
    align-items: center;
    line-height: 3rem;
    position: relative;
    font-size: var(--size-0);
    padding: 0 0.8rem 0 0.6rem;
    gap: 0.4rem;
    font-weight: 700;
    &.inactive {
      color: var(--fg-3);
      svg {
        color: var(--fg-4);
      }
    }
    &::after {
      background: rgba(0, 0, 0, 0.2);
      opacity: 0;
      z-index: -1;
    }
    &.active,
    &:active {
      &::after {
        content: "";
        position: absolute;
        inset: 0.5rem 0.25rem;
        border-radius: 0.25rem;
        opacity: 1;
      }
    }
    input {
      opacity: 0;
      position: absolute;
      width: 0;
      height: 0;
    }
    svg {
      color: var(--fg-2);
      height: 24px;
      width: 24px;
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
    border-radius: var(--radius);
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
    height: 3rem;
    padding: 0 2rem;
    background: var(--bg-2);
    z-index: 1;
    transition: 0.3s var(--ease-out) height;
    background-color: var(--body-background);
    box-shadow: var(--shadow-beveled), var(--shadow-elevated);
    --unchecked-icon-color: var(--fg-4);
    --checked-icon-color: var(--fg-2);
    label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
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
        state.ui.currentTheme?.backgroundShade?.l >= 0.49
          ? "theme--light"
          : "theme--dark"
      }`}
      style={{
        "--body-background": state.ui.currentTheme?.backgroundShade?.oklch,
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
          {state.ui.currentTheme && (
            <>
              <Icon icon={chevron} className="chevron" />
              <div className="activeThemeLabel">
                <div>
                  <div className="thumbnail">
                    {state.ui.currentTheme.colors.map((shade) => (
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
                {state.ui.currentTheme.name}
              </div>
            </>
          )}
        </div>
        {!!state.ui.currentTheme && (
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
            <Icon icon={threeDotsVertical} />
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
