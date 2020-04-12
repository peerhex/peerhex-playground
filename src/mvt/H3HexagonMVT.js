import React, { useState, useEffect, useMemo } from 'react'
import { FlyToInterpolator } from 'react-map-gl'
import { geoToH3 } from 'h3-js'
import produce from 'immer'
import { useLocation } from 'react-router-dom'
import locations from './locations'
import H3HexagonView from './h3-hexagon-view'
import ResolutionSelect from './resolution-select'
import LocationPicker from './location-picker'
import getPeerIdFromH3HexAndSecret from './deterministic-peer-id'

// var array = new Uint8Array(64); crypto.getRandomValues(array)
// Array.from(array).map(b => b.toString(16).padStart(2, "0")).join('')
const secretHex =
  '105471fbca3674e6b45709a56381891e133618ada169e52496907d461be55760' +
  '02998949f060111889810320f8ff4f57b58734c187896ecf4daa44baeba9553f'

export default function H3HexagonMVT () {
  const [resolution, setResolution] = useState(8)
  const [dataSolid, setDataSolid] = useState([])
  const [dataClear, setDataClear] = useState([])
  const [nextColor, setNextColor] = useState(0)
  const location = useLocation()
  const [initialViewState, setInitialViewState] = useState({
    ...locations.sfo,
    maxZoom: 20,
    minZoom: 1
  })
  const [viewState, setViewState] = useState({})
  const [solidOrClear, setSolidOrClear] = useState('solid')
  const [selectedHex, setSelectedHex] = useState()
  const [peerId, setPeerId] = useState()
  useEffect(() => {
    if (selectedHex) {
      async function run () {
        const peerId = await getPeerIdFromH3HexAndSecret(
          selectedHex[1],
          secretHex
        )
        setPeerId(peerId)
      }
      run()
    }
  }, [selectedHex])

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
    const data = solidOrClear === 'solid' ? dataSolid : dataClear
    const nextData = produce(data, draft => {
      draft.push(newDataPoint)
    })
    if (solidOrClear === 'solid') {
      setDataSolid(nextData)
    } else {
      setDataClear(nextData)
    }
  }

  function pickHexSolid (hex) {
    setSelectedHex(['solid', hex])
  }

  function pickHexClear (hex) {
    setSelectedHex(['clear', hex])
  }

  function removeHexSolid (hexToRemove) {
    const nextData = produce(dataSolid, draft => {
      draft.splice(
        0,
        draft.length,
        ...draft.filter(({ hex }) => hex !== hexToRemove)
      )
    })
    setDataSolid(nextData)
  }

  function removeHexClear (hexToRemove) {
    const nextData = produce(dataClear, draft => {
      draft.splice(
        0,
        draft.length,
        ...draft.filter(({ hex }) => hex !== hexToRemove)
      )
    })
    setDataClear(nextData)
  }

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <ResolutionSelect
          resolution={resolution}
          setResolution={setResolution}
        />
        <LocationPicker flatten={flatten} />
      </div>
      <div style={{ display: 'flex' }}>
        <div
          style={{
            position: 'relative',
            width: '55vw',
            height: '80vh',
            background: '#64828c'
          }}
        >
          <H3HexagonView
            dataSolid={dataSolid}
            dataClear={dataClear}
            initialViewState={initialViewState}
            pushLatLng={pushLatLng}
            removeHexSolid={pickHexSolid}
            removeHexClear={pickHexClear}
            setViewState={setViewState}
            selectedHex={selectedHex}
          />
        </div>
        <div>
          <h3>Selected</h3>
          {selectedHex && (
            <>
              <div>
                Hex: {selectedHex[1]} {selectedHex[0]}
              </div>
              <div style={{ fontSize: 'small' }}>
                PeerID: {peerId && peerId.toB58String()}
              </div>
              <div>
                <button
                  onClick={() => {
                    if (selectedHex[0] === 'solid') {
                      removeHexSolid(selectedHex[1])
                    } else {
                      removeHexClear(selectedHex[1])
                    }
                    setSelectedHex(null)
                  }}
                >
                  Delete
                </button>
                <button onClick={() => setSelectedHex(null)}>Deselect</button>
              </div>
            </>
          )}
        </div>
      </div>
      <form>
        <label>
          <input
            type='radio'
            name='solidOrClear'
            value='solid'
            checked={solidOrClear === 'solid'}
            onChange={() => setSolidOrClear('solid')}
          />
          Solid
        </label>
        <label>
          <input
            type='radio'
            name='solidOrClear'
            value='clear'
            checked={solidOrClear === 'clear'}
            onChange={() => setSolidOrClear('clear')}
          />
          Clear
        </label>
      </form>
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
