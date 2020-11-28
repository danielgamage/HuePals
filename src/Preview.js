import React from 'react';
import logo from './logo.svg';
import './App.css';
import { observer } from 'mobx-react';
import state from './state'
import styled from 'styled-components'
import {
  line, curveBasis
} from 'd3-shape'
import SplineGraph from './SplineGraph'
import Button from './Button'
import { applyPatch } from 'mobx-state-tree';
import ColorInput from './ColorInput'

const Styles = styled.div`
display: flex;
height: 100%;
flex-flow: column;
padding: 1rem 1rem 4rem;
overflow: auto;
.colors {
  display: flex;
  flex: 1 1 auto;
  padding-top: 6rem;
}
.color {
  position: relative;
  scroll-snap-align: start;
  flex: 0 0 auto;
  & + .color {
    margin-left: 1rem;
  }
}
.title{
  display: flex;
  align-items: center;
  margin: 0 0 1rem;
  input[type=text] {
    all: unset;
    width: 100%;
    margin-left: 0.5rem;
  }
  .checkbox {
    cursor: pointer;
    input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }
    .viz {
      width: 1rem;
      height: 1rem;
      border: 2px solid var(--gray-8);
      border-radius: 1rem;
    }
    input:checked + .viz {
      border-color: var(--gray-2);
    }
  }
}
.shade {
  position: relative;
  display: flex;
  text-align: left;
  white-space: nowrap;
  align-items: center;
  border-radius: 4px;
  & + .shade {
    margin-top: 1rem;
  }
}
.row-labels {
  padding-right: 1rem;
}
.row-label {
  width: 3rem;
  display: block;
  line-height: 2rem;
  margin-bottom: 1rem;
  text-align: right;
  white-space: nowrap;
}
.column-label {
  position: absolute;
  bottom: 100%;
  right: 0;
  transform: translate(-1rem, -1rem) rotate(45deg);
  transform-origin: bottom right;
  white-space: nowrap;
}
.playground {
  max-width: 30rem;
  line-height: 2rem;
  user-select: text;
  font-size: var(--size-0);
  line-height: var(--size-2);
  em {
    font-size: var(--size-1);
  }
  *:focus {
    outline: 0;
  }
}
`

const App = observer(({theme}) => {
  const size = 2
  const padding = 1
  const withPadding = (count) => (count * size) + ((count - 1) * padding)
  const colorCount = theme.colors.length
  const shadeCount = theme.colors[0].shades.length

  return (
    <Styles className="Preview">
      <div className="colors">
        <div className="row-labels">
          {theme.colors[0].shades.map((color, i) => (
            <div className="row-label">{i + 1}</div>
          ))}
        </div>
        {theme.colors.map(color => (
          <div className="color">
            <div className="column-label">{color.name}</div>
            {color.shades.map((shade, i, arr) => (
              <div className={`shade`} style={{"--color": shade.hsl}} >
                <div
                  className="swatch"
                  style={{"--base-color": theme.baseColor && theme.baseColor.shades[i].hsl}}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="playground">
        <h1 contentEditable spellCheck="false">Lorem ipsum</h1>
        <p><em contentEditable spellCheck="false">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Laudantium sit in libero debitis dolorem accusantium nam beatae, doloribus, assumenda, inventore cum placeat nihil unde perspiciatis harum consectetur veniam! Harum, officiis!
        </em></p>
        <blockquote contentEditable spellCheck="false">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Laudantium sit in libero debitis dolorem accusantium nam beatae, doloribus, assumenda, inventore cum placeat nihil unde perspiciatis harum consectetur veniam! Harum, officiis!</blockquote>
        <p contentEditable spellCheck="false">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Laudantium sit in libero debitis dolorem accusantium nam beatae, doloribus, assumenda, inventore cum placeat nihil unde perspiciatis harum consectetur veniam! Harum, officiis!</p>
        <h4 contentEditable spellCheck="false">Lorem ipsum</h4>
        <p contentEditable spellCheck="false">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Laudantium sit in libero debitis dolorem accusantium nam beatae, doloribus, assumenda, inventore cum placeat nihil unde perspiciatis harum consectetur veniam! Harum, officiis!</p>
        <Button
          className="add-button"
          onClick={() => {}}
          label={<span contentEditable spellCheck="false">
            <span>Add Color</span>
          </span>}
        />
      </div>
    </Styles>
  );
})

export default App;
