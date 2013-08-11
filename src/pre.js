// libsamplerate.js - port of libsamplerate to JavaScript using emscripten
// by Romain Beauxis <toots@rastageeks.org>

Samplerate = (function() {
  var Module;
  var context = {};
  return (function() {
