import React, { Component, useState, useEffect } from 'react'
import { StaticMap } from 'react-map-gl'
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core'
import { H3HexagonLayer } from '@deck.gl/geo-layers'
import DeckGL from '@deck.gl/react'
import { json } from 'd3-fetch'

// Set your mapbox token here
const MAPBOX_TOKEN = localStorage.getItem('mapbox_token')

// Source data CSV
const DATA_URL = process.env.PUBLIC_URL + '/sf.h3cells.json'

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
})

const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-0.144528, 49.739968, 80000]
})

const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-3.807751, 54.104682, 8000]
})

const lightingEffect = new LightingEffect({
  ambientLight,
  pointLight1,
  pointLight2
})

const material = {
  ambient: 0.64,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [51, 51, 51]
}

const INITIAL_VIEW_STATE = {
  latitude: 37.79443733047938,
  longitude: -122.43654714543031,
  zoom: 10.309433544500877,
  minZoom: 5,
  maxZoom: 15,
  pitch: 44.56258060163604,
  bearing: -23.690792231381856
}

const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
]

const elevationScale = { min: 1, max: 50 }

class H3HexagonView extends Component {
  static get defaultColorRange () {
    return colorRange
  }

  constructor (props) {
    super(props)
    this.state = {
      elevationScale: elevationScale.min
    }
  }

  _renderLayers () {
    const {
      data,
      radius = 1000,
      upperPercentile = 100,
      coverage = 1
    } = this.props

    return [
      /*
      new HexagonLayer({
        id: 'heatmap',
        colorRange,
        coverage,
        data,
        elevationRange: [0, 3000],
        elevationScale: data && data.length ? 50 : 0,
        extruded: true,
        getPosition: d => d,
        onHover: this.props.onHover,
        pickable: Boolean(this.props.onHover),
        radius,
        upperPercentile,
        material,

        transitions: {
          elevationScale: 3000
        }
      })
      */
      new H3HexagonLayer({
        id: 'h3-hexagon-layer',
        data,
        pickable: true,
        wireframe: false,
        filled: true,
        extruded: true,
        elevationScale: 20,
        getHexagon: d => d.hex,
        getFillColor: d => [255, (1 - d.count / 500) * 255, 0],
        getElevation: d => d.count,
        onHover: ({ object, x, y }) => {
          // const tooltip = `${object.hex} count: ${object.count}`
          /* Update tooltip
           http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
        */
        }
      })
    ]
  }

  render () {
    const { mapStyle = 'mapbox://styles/mapbox/dark-v9' } = this.props

    return (
      <DeckGL
        layers={this._renderLayers()}
        effects={[lightingEffect]}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
      >
        <StaticMap
          reuseMaps
          mapStyle={mapStyle}
          preventStyleDiffing={true}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        />
      </DeckGL>
    )
  }
}

export default function H3Hexagon () {
  const [data, setData] = useState()
  useEffect(() => {
    console.log('Jim loading')
    json(DATA_URL).then(data => setData(data))
  }, [])
  if (!data) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ position: 'relative', height: '80vh' }}>
      <H3HexagonView data={data} />
    </div>
  )
}
