import React, { Component, useState, useEffect } from 'react'
import { StaticMap, FlyToInterpolator } from 'react-map-gl'
import {
  AmbientLight,
  PointLight,
  LightingEffect,
  MapView
} from '@deck.gl/core'
import { H3HexagonLayer, MVTLayer } from '@deck.gl/geo-layers'
import DeckGL from '@deck.gl/react'
import { json } from 'd3-fetch'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { color as d3Color } from 'd3-color'
import { geoToH3 } from 'h3-js'
import styled from 'styled-components'
import produce from 'immer'
import { useLocation } from 'react-router-dom'
import throttle from 'lodash.throttle'

const StyledA = styled.a`
  margin-left: 0.3rem;
`

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

const locations = {
  sfo: {
    latitude: 37.79443733047938,
    longitude: -122.43654714543031,
    zoom: 10.309433544500877,
    pitch: 0,
    bearing: 0
  },
  yvr: {
    latitude: 49.17087900116923,
    longitude: -122.92988500998378,
    zoom: 9.141296450560473,
    bearing: 0,
    pitch: 0
  },
  lhr: {
    latitude: 51.498984876179385,
    longitude: -0.1057782563021147,
    zoom: 9.100393077982318,
    bearing: 0,
    pitch: 0
  },
  hnd: {
    latitude: 35.65413533768077,
    longitude: 139.6114107561246,
    zoom: 8.740076143620461,
    bearing: 0,
    pitch: 0
  },
  jfk: {
    latitude: 40.689201086853856,
    longitude: -73.86562457283067,
    zoom: 8.804948261063815,
    bearing: 0,
    pitch: 0
  },
  bom: {
    latitude: 18.988895831432906,
    longitude: 72.95952634665996,
    zoom: 10.06773829665424,
    bearing: 0,
    pitch: 0
  },
  tfn: {
    latitude: 28.32645764033052,
    longitude: -16.553379709316278,
    zoom: 8.249584835501196,
    bearing: 0,
    pitch: 0
  }
}

class H3HexagonView extends Component {
  static get defaultColorRange () {
    return colorRange
  }

  constructor (props) {
    super(props)
    this.updateViewState = throttle(this._updateViewState.bind(this), 1000)
    this.state = {
      elevationScale: elevationScale.min,
      viewState: {}
    }
  }

  _renderLayers () {
    const { data } = this.props

    return [
      new H3HexagonLayer({
        id: 'h3-hexagon-layer',
        data,
        pickable: true,
        wireframe: false,
        filled: true,
        extruded: true,
        elevationScale: 20,
        getHexagon: d => d.hex,
        getFillColor: d => colors[d.colorIndex],
        getElevation: d => d.count,
        onClick: info => {
          if (info && info.object) {
            this.props.removeHex(info.object.hex)
            return true
          }
        }
      }),
      new MVTLayer({
        // data: `https://a.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/{z}/{x}/{y}.vector.pbf?access_token=${MAPBOX_TOKEN}`,
        // data: `http://localhost:5000/satellite-lowres/{z}/{x}/{y}.pbf`,
        // data: `http://localhost:5000/canary/{z}/{x}/{y}.pbf`,
        // data: `http://tile.stamen.com/toner/{z}/{x}/{y}.png`,
        // data: `http://localhost:5000/world_countries/{z}/{x}/{y}.pbf`,
        // data: `http://localhost:5000/states_provinces/{z}/{x}/{y}.pbf`,
        // data: `http://localhost:7000/ne_10m_admin_1_states_provinces.mbtiles/{z}/{x}/{y}.pbf`,
        // data: `http://localhost:5000/states_provinces_unzipped/{z}/{x}/{y}.pbf`,
        data: `https://ipfs.io/ipfs/bafybeigyfjxrsxrlt2emeyvm3gihb7wvkbcqiel7xfa37yf4o4me6phua4/states_provinces/{z}/{x}/{y}.pbf`,

        minZoom: 0,
        // maxZoom: 23,
        maxZoom: 5,
        getLineColor: [192, 192, 192],
        getFillColor: [140, 170, 180],

        getLineWidth: f => {
          switch (f.properties.class) {
            case 'street':
              return 6
            case 'motorway':
              return 10
            default:
              return 1
          }
        },
        lineWidthMinPixels: 1
      })
    ]
  }

  _updateViewState (viewState) {
    const nextViewState = produce(this.state.viewState, draft => {
      for (const key in viewState) {
        draft[key] = viewState[key]
      }
    })
    if (nextViewState != this.state.viewState) {
      this.setState({ viewState: nextViewState })
      this.props.setViewState(nextViewState)
    }
  }

  render () {
    const { mapStyle = 'mapbox://styles/mapbox/dark-v9' } = this.props

    return (
      <DeckGL
        layers={this._renderLayers()}
        effects={[lightingEffect]}
        initialViewState={this.props.initialViewState}
        controller={true}
        onClick={this.onClick.bind(this)}
        views={new MapView({ repeat: true })}
      >
        {({ viewState }) => this.updateViewState(viewState)}
      </DeckGL>
    )
  }
  /*
        <StaticMap
          reuseMaps
          mapStyle={mapStyle}
          preventStyleDiffing={true}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        />
        */

  onClick (info) {
    const {
      lngLat: [lng, lat]
    } = info
    this.props.pushLatLng(lat, lng)
  }
}

export default function H3HexagonMVT () {
  const [resolution, setResolution] = useState(8)
  const [data, setData] = useState([])
  const [nextColor, setNextColor] = useState(0)
  const location = useLocation()
  const [initialViewState, setInitialViewState] = useState({
    ...locations.sfo,
    maxZoom: 20,
    minZoom: 1
  })
  const [viewState, setViewState] = useState({})

  useEffect(() => {
    /*
    json(DATA_URL).then(data => {
      let colorIndex = nextColor
      for (let item of data) {
        item.colorIndex = colorIndex++ % 10
      }
      setNextColor(colorIndex)
      setData(data)
    })
    */
    setData([])
  }, [])

  useEffect(() => {
    const key = location.hash.slice(1)
    if (locations[key]) {
      const initialViewState = {
        ...locations[key],
        transitionInterpolator: new FlyToInterpolator({
          speed: 1.5
        }),
        transitionDuration: 'auto',
        maxZoom: 20,
        minZoom: 1
      }
      setInitialViewState(initialViewState)
    }
  }, [location])

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
      <div style={{ display: 'flex' }}>
        <div>
          Resolution:{' '}
          <select onChange={handleChange} value={resolution}>
            <option value='0'>0 Global Region</option>
            <option value='1'>1 Large Region</option>
            <option value='2'>2 Medium Region</option>
            <option value='3'>3 Small Region</option>
            <option value='4'>4 Metro</option>
            <option value='5'>5 City</option>
            <option value='6'>6 Borough / Ward</option>
            <option value='7'>7 Large Neighbourhood</option>
            <option value='8'>8 Medium Neighbourhood</option>
            <option value='9'>9 Small Neighbourhood</option>
            <option value='10'>10 City Block</option>
            <option value='11'>11 Large Building</option>
            <option value='12'>12 Medium Building</option>
            <option value='13'>13 Small Building / Shop</option>
            <option value='14'>14 Group of People</option>
            <option value='15'>15 Person</option>
          </select>
        </div>
        <div>
          <StyledA href='#sfo'>SFO</StyledA>
          <StyledA href='#yvr'>YVR</StyledA>
          <StyledA href='#lhr'>LHR</StyledA>
          <StyledA href='#hnd'>HND</StyledA>
          <StyledA href='#jfk'>JFK</StyledA>
          <StyledA href='#bom'>BOM</StyledA>
          <StyledA href='#tfn'>TFN</StyledA>
          <StyledA href='#' onClick={flatten}>
            Flat
          </StyledA>
        </div>
      </div>
      <div style={{ position: 'relative', height: '80vh' }}>
        <H3HexagonView
          data={data}
          initialViewState={initialViewState}
          pushLatLng={pushLatLng}
          removeHex={removeHex}
          setViewState={setViewState}
        />
      </div>
    </div>
  )

  function flatten (event) {
    const initialViewState = {
      ...viewState,
      pitch: 0,
      bearing: 0,
      transitionInterpolator: new FlyToInterpolator(),
      transitionDuration: 1000
    }
    setInitialViewState(initialViewState)
    event.preventDefault()
  }
}
