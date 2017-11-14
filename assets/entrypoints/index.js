import $ from 'jquery'
import '../style/style.sass'

let localVideo
let remoteVideo
let peerConnection
let uuid
let serverConnection
let localStream

let peerConnectionConfig = {
  'iceServers': [
    {'urls': 'stun:stun.services.mozilla.com'},
    {'urls': 'stun:stun.l.google.com:19302'},
  ]
}

//let webSocketURL = 'wss://challenge.rowanmeara.com/websocket'
let webSocketURL = 'wss://' + window.location.hostname + ':3434'

function pageReady() {
  uuid = getUuid()
  document.getElementById('start-button').onclick = () => {start(true)}


  localVideo = document.getElementById('local-video')
  remoteVideo = document.getElementById('remote-video')



  serverConnection = new WebSocket(webSocketURL)
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
  localStream = stream
  localVideo.src = window.URL.createObjectURL(stream)
  return
  return
  // Extract the media stream
  let audioContext = new AudioContext()
  let sourceStream = audioContext.createMediaStreamSource(mediaStream)

  // Connect the stream to the gainNode and the gainNode to the destination
  let gain = audioContext.createGain()
  sourceStream.connect(gain)
  gain.connect(audioContext.destination)

  let micStream = audioContext.createMediaStreamDestination().stream


  let micAudioTrack = micStream.getAudioTracks()[0]
  mediaStream.addTrack(micAudioTrack)
  let originalAudioTrack = mediaStream.getAudioTracks()[0]
  mediaStream.removeTrack(originalAudioTrack)



  // Adjust microphone volume
  let range = document.querySelector('#micvolume')
  gain.gain.value = 0.5
  range.oninput = () => {
    gain.gain.value = range.value / 100
  }

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
  if(signal.uuid == uuid) return

  if(signal.sdp) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function() {
      // Only create answers in response to offers
      if(signal.sdp.type == 'offer') {
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
}

function errorHandler(error) {
  console.log(error)
}

// Taken from http://stackoverflow.com/a/105074/515584
// Strictly speaking, it's not a real UUID, but it gets the job done here
function getUuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
}



$(document).ready(pageReady)