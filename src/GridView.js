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
}
.column-label {
  position: absolute;
  bottom: 100%;
  right: 0;
  transform: translate(-1rem, -1rem) rotate(45deg);
  transform-origin: bottom right;
}
`

const App = observer(() => {
  return (
    <Styles className="GridView">
      <div className="colors">
        <div className="row-labels">
          {state.colors[0].shades.map((color, i) => (
            <div className="row-label">{i + 1}</div>
          ))}
        </div>
        {state.colors.map(color => (
          <div className="color">
            <div className="column-label">{color.name}</div>
            {color.shades.map((shade, i, arr) => (
              <div className={`shade`} style={{"--color": shade.hsl}} >
                <div
                  className="swatch"
                  style={{"--base-color": state.baseColor && state.baseColor.shades[i].hsl}}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </Styles>
  );
})

export default App;
