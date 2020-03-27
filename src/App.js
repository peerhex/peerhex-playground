import React from 'react'
import DeckGL from '@deck.gl/react'
import { LineLayer } from '@deck.gl/layers'

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
function App () {
  const layers = [new LineLayer({ id: 'line-layer', data })]

  return <DeckGL viewState={viewState} layers={layers} />
}

export default App
