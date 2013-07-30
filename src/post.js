// libmad function wrappers

var float32Len = Module.HEAPF32.BYTES_PER_ELEMENT;
var ptrLen   = Module.HEAP32.BYTES_PER_ELEMENT;

var decoders = {};

Mad = function (opts) {
 this._file = opts.file;
 this._mad = _mad_js_init();

 decoders[this._mad] = this;

 return this;
};

Mad.getDecoder = function (ptr) {
  return decoders[ptr]; 
};

Mad.prototype.close = function () {
  if (!this._mad) {
    throw "closed";
  }
  _mad_js_close(this._mad);

  this._mad = decoders[this._mad] = null;
  return;
};

Mad.prototype.decodeFrame = function(callback) {
  var fill;
  var mad = this._mad;
  var url = this._url;
  this._decode_callback = function () {
    if (_mad_js_decode_frame(mad) === 1) {
      return fill();
    }

    var _chans = _malloc(1);
    var _samples = _malloc(1);
    var _data = _mad_js_pack_frame(mad, _chans, _samples);

    var chans = getValue(_chans, "i8");
    var samples = getValue(_samples, "i16");
    _free(_chans);
    _free(_samples);

    var data = new Array(chans);
    var ptr, chanData, chan;
    for (chan = 0; chan<chans; chan++) {
      ptr = getValue(_data+chan*ptrLen, "*");
      chanData = Module.HEAPF32.subarray(ptr/float32Len, ptr/float32Len+samples);
      data[chan] = new Float32Array(samples);
      data[chan].set(chanData);
      _free(ptr);
    }
    _free(_data);

    return callback(data);
  }
  fill = function () {
    _mad_js_fill_buffer(mad, url);
  };
  return fill();
}

var createMadDecoder = function (file, callback) {
 var header = _malloc(10);
 var headerData = Module.HEAPU8.subarray(header, header+10);
 var reader = new FileReader();
 reader.onload = function(e) {
    headerData.set(new Uint8Array(e.target.result));

    var id3Len = getValue(_mad_js_id3_len(header), "i16");
    _free(header);

    if (id3Len > 0) {
      file = file.slice(10+id3Len);
    }

    var mad = new Mad({file: file});
    return callback(mad);
 }
 reader.readAsArrayBuffer(file.slice(0, 10));
}

return createMadDecoder;

}).call(context)})();
