import $ from 'jquery'
import '../style/style.sass'

// let remoteServerURL =  'ws://127.0.0.1:3434'
let remoteServerURL = 'wss://challenge.rowanmeara.com/websocket'
let localVideo, remoteVideo, peerConnection, localStream, serverConn
let peerConnectionConfig = {
  'iceServers': [
    {'url': 'stun:stun.services.mozilla.com'},
    {'url': 'stun:stun.l.google.com:19302'}
  ]
}

function pageReady() {
  localVideo = document.getElementById('local-video')
  remoteVideo = document.getElementById('remote-video')
  document.getElementById('start-button').onclick = () => {connectToPeer(true)};


  serverConn = new WebSocket(remoteServerURL)
  serverConn.onmessage = gotMessageFromServer
  navigator.getUserMedia({audio: true, video: true}, getUserMediaSuccess, getUserMediaErr)
}

function getUserMediaSuccess(mediaStream) {
  // Play local video
  localStream = mediaStream
  localVideo.srcObject = mediaStream
  localVideo.onloadedmetadata = () => { localVideo.play() }
  return
  // Extract the media stream
  let audioContext = new AudioContext()
  let sourceStream = audioContext.createMediaStreamSource(mediaStream)

  // Connect the stream to the gainNode and the gainNode to the destination
  let gain = audioContext.createGain()
  sourceStream.connect(gain)
  gain.connect(audioContext.destination)

  let micStream = audioContext.createMediaStreamDestination().stream


  let micAudioTrack = micStream.getAudioTracks()[0];
  mediaStream.addTrack(micAudioTrack)
  let originalAudioTrack = mediaStream.getAudioTracks()[0];
  mediaStream.removeTrack(originalAudioTrack)



  // Adjust microphone volume
  let range = document.querySelector('#micvolume')
  gain.gain.value = 0.5
  range.oninput = () => {
    gain.gain.value = range.value / 100
  }
}

function getUserMediaErr(err) {
  console.log(err.name + ": " + err.message)
}

function connectToPeer(isCaller) {
  peerConnection = new RTCPeerConnection(peerConnectionConfig)
  peerConnection.onicecandidate = gotIceCandidate
  peerConnection.onaddstream = gotRemoteStream
  peerConnection.addStream(localStream)

  if(isCaller) {
    peerConnection.createOffer(gotDescription, getUserMediaErr)
  }

}

function gotDescription(description) {
  console.log('got description')
  peerConnection.setLocalDescription(description, () => {
    serverConn.send(JSON.stringify({'sdp': description}), getUserMediaErr)
  })
}

function gotIceCandidate(event) {
  if(event.candidate !== null) {
    serverConn.send(JSON.stringify({'ice': event.candidate}))
  }
}

function gotRemoteStream(event) {
  console.log('Got Remote Stream')
  remoteVideo.src = window.URL.createObjectURL(event.stream)
}
function gotMessageFromServer() {
  if(!peerConnection) connect(false)

  let signal = JSON.parse(message.data)
  if(signal.sdp) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp), function() {
      if(signal.sdp.type === 'offer') {
        peerConnection.createAnswer(gotDescription, createAnswerError);
      }
    })
  } else if(signal.ice) {
    peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice));
  }
}



$(document).ready(pageReady)