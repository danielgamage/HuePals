import React, {useState} from 'react';
import './App.css';
import { observer } from 'mobx-react';
import state from './state'
import styled from 'styled-components'
import { applyPatch } from 'mobx-state-tree';
import EditorView from './EditorView'
import Preview from './Preview'
import ExportView from './ExportView'
import Button from './Button'
import { Icon } from '@iconify/react';
import tuneIcon from '@iconify/icons-ic/baseline-tune';
import styleIcon from '@iconify/icons-ic/outline-style';
import importExportIcon from '@iconify/icons-ic/baseline-import-export';
import restoreIcon from '@iconify/icons-ic/baseline-restore';

const Styles = styled.div`
display: flex;
height: 100%;
flex-flow: column;
padding-bottom: 3rem;

.tabs {
  display: flex;
  height: 3rem;
  padding: 0 2rem;
  border-bottom: 1px solid var(--gray-6);
  box-shadow: var(--box-shadow);
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
    color: var(--gray-3);
    svg {
      color: var(--gray-4);
    }
  }
  &.active {
    box-shadow: 0 -0.15em var(--gray-1) inset;
  }
  &:active {
    background: var(--gray-7);
  }
  input {
    opacity: 0;
    position: absolute;
    width: 0;
    height: 0;
  }
  svg {
    color: var(--gray-2);
    /* height: 1.25em; */
    /* width: 1.25em; */
    margin-right: 0.5rem;
  }
}
.swatch {
  width: 2rem;
  height: 2rem;
  border-radius: 1rem;
  background: var(--color);
  flex: 0 0 auto;
  box-shadow:
    0 0 0 3px inset var(--base-color),
    var(--box-shadow);
}
.app-footer {
  border-top: 1px solid var(--gray-8);
  padding: 1rem;
  position: absolute;
  display: flex;
  align-items: center;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4rem;
  padding: 0 2rem;
  background: var(--gray-8);
  z-index: 1;
  transition: 0.3s var(--ease-out) height;
  box-shadow: 0 -2px 8px var(--gray-10);
  & > * + * {
    margin-left: 1rem;
  }
}
.shade-count {
  width: 3rem;
  margin-left: 0.5rem;
}
.messages {
  margin-left: auto;
}
.message {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 8px var(--gray-10);

  &.success {
    background: var(--green-8);
    color: var(--green-1);
  }
}

`

const App = observer(() => {
  return (
    <Styles className="App">
      <div className="tabs">
        {[
          { label: 'Editor', icon: tuneIcon },
          { label: 'Grid', icon: styleIcon },
          { label: 'Export', icon: importExportIcon }
        ].map(tab => {
          const value = tab.label.toLowerCase()
          return (
            <label className={`tab-item ${state.ui.tab === value ? 'active' : 'inactive'}`}>
              <input
                type="radio"
                checked={state.ui.tab === value}
                value={value}
                onChange={e => { if (e.target.checked) {
                  state.ui.setTab(e.target.value)
                }}}
              />
              <Icon icon={tab.icon} /> {tab.label}
            </label>
          )
        })}
      </div>
      {(() => {
        switch (state.ui.tab) {
          case 'editor': return <EditorView />
          case 'grid': return <Preview />
          case 'export': return <ExportView />
          default: return <EditorView />
        }
      })()}
      <footer className={`app-footer`}>
        <Button
          status="danger"
          onClick={() => {state.resetStore()}}
          label={<>
            <Icon height={`${1.25 ** 2}em`} icon={restoreIcon} />
            <span>Reset All</span>
          </>}
          confirmLabel={<>
            <Icon height={`${1.25 ** 2}em`} icon={restoreIcon} />
            <span>Are you sure?</span>
          </>}
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
                applyPatch(state, {op: 'add', path: './interpolationCount', value: value})
              }
            }}
            value={state.interpolationCount}
          />
        </label>
        <div className="messages">
          {state.ui.visibleMessages.map(message => (
            <div className={`message ${message.status}`}>{message.body}</div>
          ))}
        </div>
      </footer>
    </Styles>
  );
})

export default App;
