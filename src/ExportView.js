import React, {useRef} from 'react';
import { observer } from 'mobx-react';
import state from './state'
import styled from 'styled-components'
import { Icon } from '@iconify/react';
import copyIcon from '@iconify/icons-ic/outline-content-copy';
import Button from './Button'

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
`

const ExportView = observer(({theme}) => {
  const outputEl = useRef(null);
  return (
    <Styles className="ExportView">
      <div className="options">
        <select onChange={e => state.ui.setExportLanguage(e.target.value)} value={state.ui.exportLanguage}>
          {["css", "sass", "csv"].map(el => (
            <option value={el}>{el.toUpperCase()}</option>
          ))}
        </select>
        <select onChange={e => state.ui.setColorspace(e.target.value)} value={state.ui.colorspace}>
          {["hex", "rgb", "hsl",].map(el => (
            <option value={el}>{el.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <Button
        onClick={() => {
          outputEl.current.select()
          document.execCommand('copy')
          state.ui.addMessage({
            body: 'Copied to clipboard',
            status: 'success'
          })
        }}
        label={<>
          <Icon height={`${1.25 ** 2}em`} icon={copyIcon}/>
          <span>Copy to clipboard</span>
        </>}
      />
      <textarea ref={outputEl}>{theme.exportText}</textarea>
      <pre>
        {theme.exportText}
      </pre>
    </Styles>
  );
})

export default ExportView;
