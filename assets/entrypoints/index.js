import $ from 'jquery'
import '../style/style.sass'

const uuidv1 = require('uuid/v1')

let localVideo
let remoteVideo
let peerConnection
let uuid
let serverConnection
let localStream
let micStream

let peerConnectionConfig = {
  'iceServers': [
    {'urls': 'stun:stun.services.mozilla.com'},
    {'urls': 'stun:stun.l.google.com:19302'},
  ]
}

function pageReady() {
  uuid = uuidv1()
  document.getElementById('start-button').onclick = () => {start(true)}

  localVideo = document.getElementById('local-video')
  remoteVideo = document.getElementById('remote-video')
  serverConnection = new WebSocket('wss://challenge.rowanmeara.com:3001')
  serverConnection.onmessage = gotMessageFromServer

  let constraints = {
    video: true,
    audio: true,
  }

  if(navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints).then(getUserMediaSuccess).catch(errorHandler)
  } else {
    alert('Your browser does not support getUserMedia API')
  }
}

function getUserMediaSuccess(stream) {
  console.log('Entered User Media Function')
  localVideo.src = window.URL.createObjectURL(stream)

  // Extract the media stream
  let audioContext = new AudioContext()
  let sourceStream = audioContext.createMediaStreamSource(stream)

  // Connect the stream to the gainNode and the gainNode to the destination
  let gain = audioContext.createGain()
  sourceStream.connect(gain)
  let destination = audioContext.createMediaStreamDestination()
  gain.connect(destination)

  let micStream = destination.stream

  let micAudioTrack = micStream.getAudioTracks()[0]
  stream.addTrack(micAudioTrack)
  let originalAudioTrack = stream.getAudioTracks()[0]
  stream.removeTrack(originalAudioTrack)

  // Adjust microphone volume
  let range = document.querySelector('#micvolume')
  gain.gain.value = 0.5
  range.oninput = () => {
    gain.gain.value = range.value / 100
  }
  localStream = stream
}

function start(isCaller) {
  peerConnection = new RTCPeerConnection(peerConnectionConfig)
  peerConnection.onicecandidate = gotIceCandidate
  peerConnection.onaddstream = gotRemoteStream
  peerConnection.addStream(localStream)

  if(isCaller) {
    peerConnection.createOffer().then(createdDescription).catch(errorHandler)
  }
}

function gotMessageFromServer(message) {
  if(!peerConnection) start(false)

  let signal = JSON.parse(message.data)

  // Ignore messages from ourself
  if(signal.uuid === uuid) return

  if(signal.sdp) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function() {
      // Only create answers in response to offers
      if(signal.sdp.type === 'offer') {
        peerConnection.createAnswer().then(createdDescription).catch(errorHandler)
      }
    }).catch(errorHandler)
  } else if(signal.ice) {
    peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler)
  }
}

function gotIceCandidate(event) {
  if(event.candidate !== null) {
    serverConnection.send(JSON.stringify({'ice': event.candidate, 'uuid': uuid}))
  }
}

function createdDescription(description) {
  console.log('got description')

  peerConnection.setLocalDescription(description).then(function() {
    serverConnection.send(JSON.stringify({'sdp': peerConnection.localDescription, 'uuid': uuid}))
  }).catch(errorHandler)
}

function gotRemoteStream(event) {
  console.log('got remote stream')
  remoteVideo.src = window.URL.createObjectURL(event.stream)
  remoteVideo.onloadedmetadata = () => {
    remoteVideo.play()
  }
}

function errorHandler(error) {
  console.log(error)
}


$(document).ready(pageReady)