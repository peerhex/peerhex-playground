import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import styled from 'styled-components'
import LineLayerExample from './line-layer/LineLayerExample'
import ThreeDHeatmap from './3d-heatmap/ThreeDHeatmap'
import H3Hexagon from './h3-hexagon/H3Hexagon'
import MVTExample from './mvt/H3HexagonMVT'
import TileExample from './tile/H3HexagonTile'

function Home () {
  return <h2>Home</h2>
}

const StyledList = styled.ul`
  display: flex;
`
const StyledItem = styled.li`
	display: block;
	margin: 0 0.5rem;
`

export default function App () {
  return (
    <Router>
      <div>
        <nav>
          <StyledList>
            <StyledItem>
              <Link to='/'>Home</Link>
            </StyledItem>
            <StyledItem>
              <Link to='/mvt'>MVT</Link>
            </StyledItem>
          </StyledList>
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
          <Route path='/mvt'>
            <MVTExample />
          </Route>
          <Route path='/tile'>
            <TileExample />
          </Route>
          <Route path='/'>
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}
