// libsamplerate function wrappers

var isNode = typeof process === "object" && typeof require === "function";

var float32Len = Module.HEAPF32.BYTES_PER_ELEMENT;
var int32Len = Module.HEAP32.BYTES_PER_ELEMENT;
var int16Len = Module.HEAP16.BYTES_PER_ELEMENT;
var int8Len = Module.HEAP8.BYTES_PER_ELEMENT;

function Samplerate(args) {
  var type = args.type || Samplerate.LINEAR;
  var _err = _malloc(int16Len);
  var err;

  this._src = _src_new(type, 1, err);
  if (this._src === 0) {
    err = getValue(_err, "i16");
    _free(_err);
    this._onError(err);
    return;
  }

  _free(_err);

  this._written = _malloc(int32Len);
  this._used = _malloc(int32Len);

  return this;
};

Samplerate.MEDIUM_QUALITY = 1;
Samplerate.FASTEST = 2;
Samplerate.ZERO_ORDER_HOLD = 3;
Samplerate.LINEAR = 4;

Samplerate.prototype._onError = function (e) {
  throw _src_strerror(e);
};

Samplerate.prototype.close = function () {
  if (!this._src) {
    throw "closed";
  }

  _free(this._written);
  _free(this._used);
  _src_delete(this._src);
  this._src = this._written = this._used = null;
  return;
};

Samplerate.prototype.reset = function () {
  if (!this._src) {
    throw "closed";
  }

  _src_reset(this._src);
  return;
};

Samplerate.prototype.setRatio = function (ratio) {
  if (!this._src) {
    throw "closed";
  }

  var err = _src_set_ratio(this._src, ratio);
  if (err !== 0) {
    this._onError(err);
    return;
  } 

  return;
};

function clip(x) {
  return (x > 1 ? 1 : (x < -1 ? -1 : x));
}

function convertInt16(buf) {
  var samples = buf.length;
  var ret = new Float32(samples);

  var i;

  for (i=0;i<samples;i++) {
    ret[i] = clip(parseFloat(buf[i]) / 32767.0);
  }
  return ret;
}

function convertFloat32(buf) {
  var samples = buf.length;
  var ret = new Int16Array(samples);

  var i;
  for (i=0;i<samples;i++) {
    ret[i] = parseInt(clip(buf[i]) * 32767);
  }
  return ret;
}

Samplerate.prototype.process = function (args) {
  var data = args.data;
  var ratio = args.ratio;
  var last = args.last || false;

  if (data instanceof Int16Array) {
    data = convertInt16(data);
  }

  var inputSamples = data.length;
  var outputSamples = Math.ceil(inputSamples*ratio);
  
  var _input  = _malloc(inputSamples*float32Len);
  var _output = _malloc(outputSamples*float32Len);

  var input = Module.HEAPF32.subarray(_input/float32Len, _input/float32Len+inputSamples);
  var output = Module.HEAPF32.subarray(_output/float32Len, _output/float32Len+outputSamples);

  input.set(data);

  last = last ? 1 : 0;
  var err = _src_js_process(this._src, 
                            _input, inputSamples,
                            _output, outputSamples,
                            ratio, last, 
                            this._used,
                            this._written); 

  _free(_input);
  if (err) {
    _free(_output);
    this._onError(err);
    return;
  }

  var written = getValue(this._written, "i32");
  var result = new Float32Array(written);
  result.set(output.subarray(0, written));

  _free(_output);

  if (data instanceof Int16Array) {
    result = convertFloat32(result);
  }

  var ret = {
    data: result,
    used: getValue(this._used, "i32")
  };
  return ret;
};

if (isNode) {
  module.exports = Samplerate;
}

return Samplerate;

}).call(context)})();
