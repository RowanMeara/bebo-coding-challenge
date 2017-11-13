import '../style/style.sass'

console.log('Hello')
navigator.mediaDevices.getUserMedia({audio: true, video: true})
.then( (mediaStream) => {
  let video = document.querySelector('video')
  video.src = window.URL.createObjectURL(mediaStream)
  video.onloadedmetadata = () => {
    video.play()
  }
}).catch( (err) => {
  console.log(err.name + ": " + err.message)
})