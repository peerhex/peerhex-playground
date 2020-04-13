import React, { useEffect, useState } from 'react'
import Libp2p from 'libp2p'
import WebRTCStar from 'libp2p-webrtc-star'
import Secio from 'libp2p-secio'
import Mplex from 'libp2p-mplex'
import PeerInfo from 'peer-info'
import produce from 'immer'

export default function WebRTCPanel ({ peerId }) {
  const [listening, setListening] = useState(false)
  const [logs] = useState([])
  const [_, forceUpdate] = useState(0)
  const [peers, setPeers] = useState({})
  const [libp2p, setLibp2p] = useState(null)

  useEffect(() => {
    if (!listening) return
    async function run () {
      const libp2p = await Libp2p.create({
        peerInfo: new PeerInfo(peerId),
        modules: {
          transport: [WebRTCStar],
          connEncryption: [Secio],
          streamMuxer: [Mplex]
        },
        config: {
          peerDiscovery: {
            autoDial: false
          }
        }
      })
      // setPeerId(libp2p.peerInfo.id.toB58String())

      const webrtcAddr = '/ip4/0.0.0.0/tcp/9090/wss/p2p-webrtc-star'
      libp2p.peerInfo.multiaddrs.add(webrtcAddr)

      libp2p.on('peer:discovery', peerInfo => {
        log(`Found peer ${peerInfo.id.toB58String()}`)
        setPeers(addPeer(peerInfo))
      })

      // Listen for new connections to peers
      libp2p.on('peer:connect', peerInfo => {
        log(`Connected to ${peerInfo.id.toB58String()}`)
        setPeers(updatePeer(peerInfo, peer => { peer.connected = true }))
      })

      // Listen for peers disconnecting
      libp2p.on('peer:disconnect', peerInfo => {
        log(`Disconnected from ${peerInfo.id.toB58String()}`)
        setPeers(updatePeer(peerInfo, peer => { peer.connected = false }))
      })

      await libp2p.start()
      setLibp2p(libp2p)
    }
    run()
  }, [listening, peerId])

  function log (txt) {
    logs.push(txt)
    forceUpdate(Date.now())
  }

  function addPeer (peerInfo) {
    const nextPeers = produce(peers, draftPeers => {
      const peerId = peerInfo.id.toB58String()
      if (!draftPeers[peerId]) {
        draftPeers[peerId] = {
          peerInfo: peerInfo,
          connected: false
        }
      }
    })
    return nextPeers
  }

  function updatePeer (peerInfo, updatePeerFunc) {
    let nextPeers = addPeer(peerInfo)
    nextPeers = produce(nextPeers, draftPeers => {
      const peerId = peerInfo.id.toB58String()
      const peer = draftPeers[peerId]
      updatePeerFunc(peer)
    })
    return nextPeers
  }

  if (!listening) {
    return (
      <div>
        Not listening
        <button onClick={() => setListening(true)}>Listen</button>
      </div>
    )
  }

  return (
    <div>
      <h3>Peers</h3>
      <ul>
        {Object.keys(peers).map(peerId => {
          const peer = peers[peerId]
          return (
            <li key={peerId}>
              {peerId.slice(-3)} {peer.connected ? 'Connected' : 'Disconnected'}
              {!peer.connected &&
                  <button onClick={connect}>Connect</button>
                }
            </li>
          )
          function connect () {
            console.log('Jim connect', peerId, peer)
            async function dial () {
              log(`Dialing ${peerId}`)
              const conn = await libp2p.dial(peer.peerInfo)
              log(`Dialed ${peerId}`)
              console.log('Jim dialed', peerId, conn)
            }
            dial()
          }
        })}
      </ul>
      <h3>Logs</h3>
      {logs.map((line, i) => <div key={i}>{line}</div>)}
    </div>
  )
}
