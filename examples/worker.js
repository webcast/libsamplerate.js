var window;

importScripts("libmad.js");

var chans = 2;
var mad;
var format;
var file;

var createDecoder = function() {
  createMadDecoder(file, function (dec) {
    mad = dec;
    decode();
  });
};

var concat = function(a, b) {
  if (typeof b === "undefined") {
    return a;
  }
  var ret = new Float32Array(a.length+b.length);
  ret.set(a);
  ret.subarray(a.length).set(b);
  return ret;
};

var buflen = 4096;
var decoded = new Array(chans);
var buf = new Array(chans);
var chan;
for (chan = 0; chan < chans; chan++) {
  decoded[chan] = new Float32Array;
}

var fillBuffer = function() {
  var chan;
  for (chan = 0; chan < decoded.length; chan++) {
    buf[chan] = decoded[chan].subarray(0, buflen);
    decoded[chan] = decoded[chan].subarray(buflen);
  }
  postMessage(buf);

  decode();
};

var decode = function() {
  if (decoded[0].length >= buflen) {
    return fillBuffer();
  }
  mad.decodeFrame(function (data, err) {
    if (err) {
      return createDecoder();
    }

    var chan;
    if (!format) {
      format = mad.getCurrentFormat();
    }

    for (chan = 0; chan < decoded.length; chan++) {
      decoded[chan] = concat(decoded[chan], data[chan]);
    }
    decode();
  });
};

this.onmessage = function (e) {
  var type = e.data.type;
  var arg = e.data.arg;
  if (type === "file") {
    return file = arg;
  }

  if (type === "start") {
    return createDecoder();
  }
};
