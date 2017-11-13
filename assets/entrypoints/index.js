import '../style/style.sass'

let remoteServerURL =  'ws://127.0.0.1:3434'
let localVideo, remoteVideo, peerConnection
let connectionConfig = {
  'iceServers': [
      {'url': 'stun:stun.services.mozilla.com'},
      {'url': 'stun:stun.l.google.com:19302'}
      ]
}

function pageReady() {
  localVideo = document.getElementById('local-video')
  remoteVideo = document.getElementById('remote-video')

  let serverConn = new WebSocket(remoteServerURL)
  serverConn.onmessage = gotMessageFromServer
  navigator.getUserMedia({audio: true, video: true}, getUserMediaSuccess, getUserMediaErr)
}

function getUserMediaSuccess(mediaStream) {
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

    // Play video
    let video = document.querySelector('#localvideo')
    video.srcObject = mediaStream
    video.onloadedmetadata = () => {
      video.play()
    }

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
