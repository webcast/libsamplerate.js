// libmad.js - port of libmp3lame to JavaScript using emscripten
// by Romain Beauxis <toots@rastageeks.org>

createMadDecoder = (function() {
  var Module;
  var context = {};
  return (function() {
