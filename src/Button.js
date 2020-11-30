import React, {useState} from 'react';
import './App.css';
import { observer } from 'mobx-react';
import styled from 'styled-components'

const Styles = styled.button`
  padding: 0.5rem 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--background);
  border: 0;
  border-radius: 4px;
  color: inherit;
  font: inherit;
  font-weight: 700;
  box-shadow: var(--shadow-beveled), var(--shadow-elevated);
  color: var(--color);
  padding: 0.5rem 1rem;

  &.primary      { --color: var(--blue-2);  --background: var(--blue-7);  }
  &, &.secondary { --color: var(--fg-2);    --background: var(--body-background); }
  &.success      { --color: var(--green-2); --background: var(--green-7); }
  &.danger       { --color: var(--red-4);   --background:  var(--gray-7); }
  &.warning      { --color: var(--gray-2);  --background: var(--green-7); }
  &.info         { --color: var(--gray-2);  --background: var(--green-7); }

  &.text {
    transform: none;
    background: none;
    box-shadow: none;
  }
  &:not(.text) {
    & svg:not(:last-child) {
      margin-right: 0.5em;
    }
    &:hover, &:focus {
      /* background: var(--highlight); */
      outline: 0;
    }
    &:active {
      transition: all 0.1s var(--ease-out);
      transform: translateY(1px);
      background: var(--background);
      box-shadow:
        0.5px 1px var(--highlight) inset,
        -0.5px -1px var(--shading) inset,
        0 0 var(--shading),
        -1px -1px rgba(0,0,0,0.1);
    }
  }

`

const App = observer(({status, className, label, confirmLabel, children, onClick}) => {
  const requiresConfirmation = !!confirmLabel
  const [clickedOnce, setClicked] = useState(false)

  return (
    <Styles
      className={`Button ${className} ${status}`}
      onClick={() => {
        if (!requiresConfirmation || clickedOnce) {
          onClick()
          setClicked(false)
        } else {
          setClicked(true)

          // Unset after 5s
          setTimeout(() => {
            setClicked(false)
          }, 5000)
        }
      }}
    >
      {clickedOnce
        ? confirmLabel
        : label
      }
    </Styles>
  );
})

export default App;
