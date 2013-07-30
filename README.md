README for libmad.js
========================

In order to build libmad.js, make sure you have emscripten installed.
Then simply run "make", and the build process will download the lame
source file, extract it, and build the JavaScript version of libmad.

Decoding API
------------

```
createMadDecoder(file, function (decoder) {
  decoder.decodeFrame(function (data, err) {
    if (err) {
      return decoder.close();
    }
    
    // Format can theorically change in each frame.
    // This function returns invalid values if no frame
    // has been decoded.
    var format = decoder.getCurrentFormat(); 
    console.log("Got a frame"!);
    console.log("Frame samplerate: " + format.sampleRate);
    console.log("Frame channels: " + format.channels);
    console.log("Frame bitrate" " + format.bitRate);
    
    console.log("Now processing data");
    // data is an array of Float32Arrays..
  });
});
```

Does it work?
-------------

Certainly so! Check the `examples/` directory for two implementations using the Web Audio API. 

Those examples have been tested and are working in Chrome. Firefox still needs to finish implementing the Web Audio API for it to
work, though.. Also, beware of [this webkit bug](https://bugs.webkit.org/show_bug.cgi?id=112521) when implementing your own stuff..

Author
------

Romain Beauxis <toots@rastageeks.org>

Code derived from libmp3lame-js by:
Andreas Krennmair <ak@synflood.at>

License
-------

libmad.js is published under the license terms as mad.
