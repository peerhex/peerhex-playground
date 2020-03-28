import React, { Component, useState, useEffect } from 'react'
import { StaticMap } from 'react-map-gl'
import {
  AmbientLight,
  PointLight,
  LightingEffect,
  MapView
} from '@deck.gl/core'
import { H3HexagonLayer } from '@deck.gl/geo-layers'
import DeckGL from '@deck.gl/react'
import { json } from 'd3-fetch'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { color as d3Color } from 'd3-color'
import { geoToH3 } from 'h3-js'
import produce from 'immer'

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
  minZoom: 1,
  maxZoom: 20,
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

const colors = schemeCategory10.map(colorName => {
  const { r, g, b } = d3Color(colorName)
  return [r, g, b]
})

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
        // getFillColor: d => [255, (1 - d.count / 500) * 255, 0],
        getFillColor: d => colors[d.colorIndex],
        getElevation: d => d.count,
        onHover: ({ object, x, y }) => {
          // const tooltip = `${object.hex} count: ${object.count}`
          /* Update tooltip
           http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
        */
        },
        onClick: info => {
          console.log('Jim click', info)
          if (info && info.object) {
            this.props.removeHex(info.object.hex)
            return true
          }
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
        onClick={this.onClick.bind(this)}
        views={new MapView({ repeat: true })}
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

  onClick (info) {
    console.log('Jim onClick deckgl', info)
    const {
      lngLat: [lng, lat]
    } = info
    this.props.pushLatLng(lat, lng)
  }
}

export default function H3Hexagon () {
  const [resolution, setResolution] = useState(8)
  const [data, setData] = useState([])
  const [nextColor, setNextColor] = useState(0)
  useEffect(() => {
    console.log('Jim loading')
    json(DATA_URL).then(data => {
      let colorIndex = nextColor
      for (let item of data) {
        item.colorIndex = colorIndex++ % 10
        console.log('Jim item', item, schemeCategory10[item.colorIndex])
      }
      setNextColor(colorIndex)
      setData(data)
    })
  }, [])

  function pushLatLng (lat, lng) {
    const hex = geoToH3(lat, lng, resolution)
    const colorIndex = nextColor % 10
    const newDataPoint = {
      hex,
      // count: 30 * (9.682 - Math.log((resolution + 1) * 1000)),
      count:
        1000 * (1 / Math.log((resolution + 2) * (resolution + 2)) / 10) - 17.5,
      colorIndex
    }
    setNextColor(colorIndex + 1)
    const nextData = produce(data, draft => {
      draft.push(newDataPoint)
    })
    setData(nextData)
  }

  function removeHex (hexToRemove) {
    console.log('Jim removeHex', hexToRemove)
    const nextData = produce(data, draft => {
      draft.splice(
        0,
        draft.length,
        ...draft.filter(({ hex }) => hex !== hexToRemove)
      )
    })
    setData(nextData)
  }

  function handleChange (event) {
    setResolution(Number(event.target.value))
  }

  return (
    <div>
      Resolution:{' '}
      <select onChange={handleChange} value={resolution}>
        <option value='0'>0</option>
        <option value='1'>1</option>
        <option value='2'>2</option>
        <option value='3'>3</option>
        <option value='4'>4</option>
        <option value='5'>5</option>
        <option value='6'>6</option>
        <option value='7'>7</option>
        <option value='8'>8</option>
        <option value='9'>9</option>
        <option value='10'>10</option>
        <option value='11'>11</option>
        <option value='12'>12</option>
        <option value='13'>13</option>
        <option value='14'>14</option>
        <option value='15'>15</option>
      </select>
      <div style={{ position: 'relative', height: '80vh' }}>
        <H3HexagonView
          data={data}
          pushLatLng={pushLatLng}
          removeHex={removeHex}
        />
      </div>
    </div>
  )
}
