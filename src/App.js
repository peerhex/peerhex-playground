import React from 'react'
import DeckGL from '@deck.gl/react'
import { LineLayer } from '@deck.gl/layers'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'

// Viewport settings
const viewState = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13,
  pitch: 0,
  bearing: 0
}

// Data to be used by the LineLayer
const data = [
  {
    sourcePosition: [-122.41669, 37.7853],
    targetPosition: [-122.41669, 37.781]
  },
  {
    sourcePosition: [-122.41669, 37.781],
    targetPosition: [-122.42669, 37.781]
  },
  {
    sourcePosition: [-122.42669, 37.781],
    targetPosition: [-122.41669, 37.7853]
  }
]

// DeckGL react component
function LineLayerExample () {
  const layers = [new LineLayer({ id: 'line-layer', data })]

  return (
    <div style={{ position: 'relative', height: '80vh' }}>
      <DeckGL viewState={viewState} layers={layers} />
    </div>
  )
}

function Home () {
  return <h2>Home</h2>
}

export default function App () {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to='/'>Home</Link>
            </li>
            <li>
              <Link to='/about'>About</Link>
            </li>
            <li>
              <Link to='/users'>Users</Link>
            </li>
            <li>
              <Link to='/line-layer'>Line Layer Example</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path='/about'>
            <About />
          </Route>
          <Route path='/users'>
            <Users />
          </Route>
          <Route path='/line-layer'>
            <LineLayerExample />
          </Route>
          <Route path='/'>
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}
