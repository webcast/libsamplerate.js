Libsamplerate.js
========================

This repository provides a build of the samplerate conversion library in JavaScript.

Conversion API
------------

```
var resampler = new Samplerate({type: Samplerate.FASTEST});

var result = resampler.process({
  data: buffer, // buffer is a Float32Aray or a Int16Array
  ratio: 1.5,
  last: false
});

var converted = result.data; // same type as buffer above
var used = result.used; // input samples effectively used

// Optional:
converter.setRatio(2.3);
converter.reset();

// Close:
resampler.close();
```

Does it work?
-------------

Certainly so! Check the [savonet/webcast](https://github.com/savonet/webcast) for a working implementation.

Author
------

Romain Beauxis <toots@rastageeks.org>

Code derived from libmp3lame-js by:
Andreas Krennmair <ak@synflood.at>

License
-------

libsamplerate.js is published under the license terms as samplerate.
