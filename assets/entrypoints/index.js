import '../style/style.sass'

console.log('Hello')
navigator.mediaDevices.getUserMedia({audio: true, video: true})
.then( (mediaStream) => {
  // Extract and control the microphone stream
  let audioContext = new AudioContext()
  let sourceStream = audioContext.createMediaStreamSource(mediaStream)

  // Create gainNode
  let gain = audioContext.createGain()
  gain.gain.value = 0.1


  // Connect the stream to the and the gainNode to the destination
  sourceStream.connect(gain)
  gain.connect(audioContext.destination)

  //mediaStream.getAudioTracks()[0].enabled = true

  let micStream = audioContext.createMediaStreamDestination().stream

  // Play video
  let video = document.querySelector('video')
  video.src = window.URL.createObjectURL(mediaStream)
  video.onloadedmetadata = () => {
    video.play()
  }

  // Play audio
  let audio = document.querySelector('audio')
  audio.src = window.URL.createObject(micStream)
  audio.onloadedmetadata = () => {
    audio.play()
  }

  // Adjust microphone volume
  gain.gain.value = 0.1;

}).catch( (err) => {
  console.log(err.name + ": " + err.message)
})