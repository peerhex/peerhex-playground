import React, { useEffect, useState, useReducer } from 'react'
import Libp2p from 'libp2p'
import WebRTCStar from 'libp2p-webrtc-star'
import Secio from 'libp2p-secio'
import Mplex from 'libp2p-mplex'
import PeerInfo from 'peer-info'
import peersReducer from './peers-reducer'
import logsReducer from './logs-reducer'
import useListener from './useListener'

export default function WebRTCPanel ({
  peerId,
  listeners,
  dispatchListenersAction
}) {
  const [listener, create, log] = useListener(peerId, listeners, dispatchListenersAction)

  if (!listener) {
    return (
      <div>
        Not listening
        <button
          onClick={create}
        >
          Listen
        </button>
      </div>
    )
  }

  const { peers, logs } = listener
  return (
    <div>
      <h3>Peers</h3>
      <ul>
        {Object.keys(peers).map(peerId => {
          const peer = peers[peerId]
          return (
            <li key={peerId}>
              {peerId.slice(-3)} {peer.connected ? 'Connected' : 'Disconnected'}
              {!peer.connected && <button onClick={connect}>Connect</button>}
            </li>
          )
          function connect () {
            async function dial () {
              log(`Dialing ${peerId}`)
              // await libp2p.dial(peer.peerInfo)
              log(`Dialed ${peerId}`)
            }
            dial()
          }
        })}
      </ul>
      <h3>Logs</h3>
      {logs.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  )
}
