import React, {useState} from 'react';
import './App.css';
import { observer } from 'mobx-react';
import state from './state'
import styled from 'styled-components'
import { applyPatch } from 'mobx-state-tree';
import { Icon } from '@iconify/react';
import Button from './Button';
import deleteIcon from '@iconify/icons-ic/outline-delete';
import warningIcon from '@iconify/icons-ic/baseline-warning';
import paletteIcon from '@iconify/icons-ic/outline-palette';
import roundFavorite from '@iconify/icons-ic/round-favorite';

const Styles = styled.div`
position: relative;
box-shadow: var(--box-shadow);
border-radius: 4px;
background: var(--gray-6);
overflow: hidden;
display: flex;
flex-direction: column;

.title {
  display: flex;
  margin: 0;
  padding: 0.5rem;
  font-size: var(--size-1);
  line-height: 1rem;
  input {
    width: 100%;
    flex: 1 1 auto;
  }
}

.colors {
  display: flex;
  flex-flow: row;
  flex: 1 1 auto;
}
.color {
  display: flex;
  flex-flow: column;
  flex: 1 1 auto;
}
.shade {
  flex: 1 1 auto;
  background: var(--color);
}
`

const App = observer(({theme, onDoubleClick}) => {
  return (
    <Styles className="ThemePreview" onDoubleClick={onDoubleClick}>
      <h2 className="title">
        <input
          type="text"
          value={theme.name}
          onInput={(e)=> {applyPatch(theme, {op: 'add', path: './name', value: e.target.value})}}
        />
      </h2>
      <div className="colors">
        {theme.colors.map(color => (
          <div className="color">
            {color.shades.map(shade => (
              <div className="shade" style={{"--color": shade.hex}} />
            ))}
          </div>
        ))}
      </div>
      <footer>
        <Button onClick={() => theme.toggleFavorite()} label={<Icon icon={roundFavorite} />} />
        <Button onClick={() => theme.remove()} label={<Icon icon={deleteIcon} />} confirmLabel={<Icon icon={warningIcon} />} />
      </footer>
    </Styles>
  );
})

export default App;
