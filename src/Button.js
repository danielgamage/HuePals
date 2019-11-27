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
  box-shadow:
    0.5px 1px 0 var(--highlight) inset,
    -0.5px -1px 0 var(--shading) inset,
    0 2px 0 var(--shading),
    0 3px 8px var(--shadow-color);
  color: var(--color);
  padding: 0.5rem 1rem;
  transition: all 0.2s var(--ease-out);
  transform: translateY(-2px);

  &.primary      { --color: var(--blue-2);  --background: var(--blue-7);  --highlight: var(--blue-6);  --shading: var(--blue-8); }
  &, &.secondary { --color: var(--gray-1);  --background: var(--gray-7);  --highlight: var(--gray-6);  --shading: var(--gray-8); }
  &.success      { --color: var(--green-2); --background: var(--green-7); --highlight: var(--green-6); --shading: var(--green-8); }
  &.danger       { --color: var(--red-4);   --background:  var(--gray-7); --highlight: var(--gray-6);  --shading: var(--gray-8); }
  &.warning      { --color: var(--gray-2);  --background: var(--green-7); --highlight: var(--green-4); --shading: var(--red-9); }
  &.info         { --color: var(--gray-2);  --background: var(--green-7); --highlight: var(--green-4); --shading: var(--red-9); }

  &.text {
    box-shadow: none;
  }
  & svg:not(:last-child) {
    margin-right: 0.5em;
  }
  &:hover, &:focus {
    /* background: var(--highlight); */
    outline: 0;
  }
  &:active {
    transition: all 0.1s var(--ease-out);
    transform: translateY(0px);
    background: var(--background);
    box-shadow:
      0.5px 1px var(--highlight) inset,
      -0.5px -1px var(--shading) inset,
      0 0 var(--shading),
      -1px -1px rgba(0,0,0,0.1);
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
