import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import LineLayerExample from './line-layer/LineLayerExample'
import ThreeDHeatmap from './3d-heatmap/ThreeDHeatmap'
import H3Hexagon from './h3-hexagon/H3Hexagon'

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
              <Link to='/line-layer'>Line Layer</Link>
            </li>
            <li>
              <Link to='/3d-heatmap'>3D Heatmap</Link>
            </li>
            <li>
              <Link to='/h3-hexagon'>H3 Hexagon</Link>
            </li>
          </ul>
        </nav>
        <Switch>
          <Route path='/line-layer'>
            <LineLayerExample />
          </Route>
          <Route path='/3d-heatmap'>
            <ThreeDHeatmap />
          </Route>
          <Route path='/h3-hexagon'>
            <H3Hexagon />
          </Route>
          <Route path='/'>
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}
