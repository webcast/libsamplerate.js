// libmad function wrappers

var float32Len = Module.HEAPF32.BYTES_PER_ELEMENT;
var ptrLen   = Module.HEAP32.BYTES_PER_ELEMENT;

var decoders = {};

Mad = function (opts) {
 this._file = opts.file;
 this._mad = _mad_js_init();
 this._processing = false;
 this._pending = [];
 this._channels = _malloc(1);
 this._samples = _malloc(1);
 this._samplerate = _malloc(2);
 this._bitrate = _malloc(2);

 decoders[this._mad] = this;

 return this;
};

Mad.getDecoder = function (ptr) {
  return decoders[ptr]; 
};

Mad.prototype.getCurrentFormat = function () {
  if (!this._mad) {
    throw "closed";
  }

  return {
    channels: getValue(this._channels, "i8"),
    sampleRate: getValue(this._samplerate, "i32"),
    bitRate: getValue(this._bitrate, "i32")
  }
};

Mad.prototype.close = function () {
  if (!this._mad) {
    throw "closed";
  }

  _mad_js_close(this._mad);
  _free(this._channels);
  _free(this._samples);
  _free(this._samplerate);
  _free(this._bitrate);

  this._mad = decoders[this._mad] = null;
  this._processing = false;
  this._pending = [];
  return;
};

Mad.prototype.decodeFrame = function(callback) {
  if (!this._mad) {
    return callback(null, "closed");
  }

  var mad = this;
  var _mad = this._mad;

  if (this._processing) {
    this._pending.push(function () {
      mad.decodeFrame(callback);
    });
    return;
  }

  this._processing = true;

  var fill = function () {
    _mad_js_fill_buffer(_mad);
  };

  this._decode_callback = function (err) {
    if (err) {
      mad.close();
      return callback(null, err);
    }

    if (_mad_js_decode_frame(_mad) === 1) {
      return fill();
    }

    var _data = _mad_js_pack_frame(_mad, mad._channels, mad._samples, mad._samplerate, mad._bitrate);

    var chans = getValue(mad._channels, "i8");
    var samples = getValue(mad._samples, "i16");

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

    callback(data);

    this._processing = false;
    var pending = this._pending.shift();
    if (pending == null) {
      return;
    }
    return pending();
  };

  return fill();
}

var createMadDecoder = function (file, callback) {
 var header = _malloc(10);
 var headerData = Module.HEAPU8.subarray(header, header+10);
 var reader = new FileReader();
 reader.onload = function(e) {
    headerData.set(new Uint8Array(e.target.result));

    var id3Len = _mad_js_id3_len(header);
    _free(header);

    if (id3Len > 0) {
      file = file.slice(10+id3Len);
    }

    var mad = new Mad({file: file});
    return callback(mad);
 }
 reader.readAsArrayBuffer(file.slice(0, 10));
};

return createMadDecoder;

}).call(context)})();
