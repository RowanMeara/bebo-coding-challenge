/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__style_style_sass__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__style_style_sass___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__style_style_sass__);


let localVideo, remoteVideo, peerConnection
let connectionConfig = {
  'iceServers': [
      {'url': 'stun:stun.services.mozilla.com'},
      {'url': 'stun:stun.l.google.com:19302'}
      ]
}

navigator.getUserMedia({audio: true, video: true}, (mediaStream) => {
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


}, (err) => {
  console.log(err.name + ": " + err.message)
})

/***/ }),
/* 1 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })
/******/ ]);