import React, {useRef} from 'react';
import { observer } from 'mobx-react';
import state from './state'
import styled from 'styled-components'
const Styles = styled.div`
  height: 100%;
  padding-bottom: 3rem;
  flex: 1 1 auto;
  overflow: auto;
  user-select: text;
  padding: 2rem;

  .tabs {
    display: flex;
    height: 3rem;
    border-bottom: 1px solid var(--gray-8);
  }
  .tab-item {
    line-height: 3rem;
    font-size: var(--size-1);
    padding: 0 0.5rem;
    font-weight: 700;
    &.inactive {
      color: var(--gray-5);
    }
    &.active {
      border-bottom: 0.15em solid var(--gray-1);
    }
    input {
      opacity: 0;
      position: absolute;
      width: 0;
      height: 0;
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
      0 0 8px var(--gray-10);
  }
  textarea {
    width: 0;
    height: 0;
    opacity: 0;
    position: absolute;
    pointer-events: none;
  }
  .options {
    margin-bottom: 1rem;
  }
`

const ExportView = observer(() => {
  const outputEl = useRef(null);
  return (
    <Styles className="ExportView">
      <div className="options">
        <select onChange={e => state.ui.setExportLanguage(e.target.value)} value={state.ui.exportLanguage}>
          {["css", "sass", "csv"].map(el => (
            <option value={el}>{el}</option>
            ))}
        </select>
        <select onChange={e => state.ui.setColorspace(e.target.value)} value={state.ui.colorspace}>
          {["hex", "rgb", "hsl",].map(el => (
            <option value={el}>{el}</option>
          ))}
        </select>
      </div>

      <button onClick={() => {
        outputEl.current.select()
        document.execCommand('copy')
        state.ui.addMessage({
          body: 'Copied to clipboard',
          status: 'success'
        })
      }}>Copy to clipboard</button>
      <textarea ref={outputEl}>{state.exportText}</textarea>
      <pre>
        {state.exportText}
      </pre>
    </Styles>
  );
})

export default ExportView;
