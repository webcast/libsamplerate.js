// libsamplerate function wrappers

var SamplerateModule;
var float32Len;
var int32Len;
var int16Len;
var int8Len;

function samplerateInit() {
  float32Len = SamplerateModule.HEAPF32.BYTES_PER_ELEMENT;
  int32Len = SamplerateModule.HEAP32.BYTES_PER_ELEMENT;
  int16Len = SamplerateModule.HEAP16.BYTES_PER_ELEMENT;
  int8Len = SamplerateModule.HEAP8.BYTES_PER_ELEMENT;
}

var Converter = {
  '0': 'BEST_QUALITY',
  '1': 'MEDIUM_QUALITY',
  '2': 'FASTEST',
  '3': 'ZERO_ORDER_HOLD',
  '4': 'LINEAR',
  BEST_QUALITY: 0,
  MEDIUM_QUALITY: 1,
  FASTEST: 2,
  ZERO_ORDER_HOLD: 3,
  LINEAR: 4
};

function Samplerate(args) {
  var type = args.type || Samplerate.LINEAR;
  var _err = SamplerateModule._malloc(int16Len);
  var err;

  this._src = SamplerateModule._src_new(type, 1, err);
  if (this._src === 0) {
    err = SamplerateModule.getValue(_err, "i16");
    SamplerateModule._free(_err);
    this._onError(err);
    return;
  }

  SamplerateModule._free(_err);

  this._written = SamplerateModule._malloc(int32Len);
  this._used = SamplerateModule._malloc(int32Len);

  return this;
};

Samplerate.prototype._onError = function (e) {
  throw _src_strerror(e);
};

Samplerate.prototype.close = function () {
  if (!this._src) {
    throw "closed";
  }

  SamplerateModule._free(this._written);
  SamplerateModule._free(this._used);
  SamplerateModule._src_delete(this._src);
  this._src = this._written = this._used = null;
  return;
};

Samplerate.prototype.reset = function () {
  if (!this._src) {
    throw "closed";
  }

  SamplerateModule._src_reset(this._src);
  return;
};

function clip(x) {
  return (x > 1 ? 1 : (x < -1 ? -1 : x));
}

function convertInt16(buf) {
  var samples = buf.length;
  var ret = new Float32Array(samples);

  var i;

  for (i=0;i<samples;i++) {
    ret[i] = clip(buf[i] / 32767.0);
  }
  return ret;
}

function convertFloat32(buf) {
  var samples = buf.length;
  var ret = new Int16Array(samples);

  var i;
  for (i=0;i<samples;i++) {
    ret[i] = clip(buf[i]) * 32767;
  }
  return ret;
}

Samplerate.prototype.process = function (args) {
  var data = args.data;
  var ratio = args.ratio;
  var last = args.last || false;
  var isInt16 = data instanceof Int16Array;

  if (isInt16) {
    data = convertInt16(data);
  }

  var inputSamples = data.length;
  var outputSamples = Math.ceil(inputSamples*ratio);
  
  var _input  = SamplerateModule._malloc(inputSamples*float32Len);
  var _output = SamplerateModule._malloc(outputSamples*float32Len);

  var input = SamplerateModule.HEAPF32.subarray(_input/float32Len, _input/float32Len+inputSamples);
  var output = SamplerateModule.HEAPF32.subarray(_output/float32Len, _output/float32Len+outputSamples);

  input.set(data);

  last = last ? 1 : 0;
  var err = SamplerateModule._src_js_process(
    this._src, 
    _input, inputSamples,
    _output, outputSamples,
    ratio, last, 
    this._used,
    this._written); 

  SamplerateModule._free(_input);
  if (err) {
    SamplerateModule._free(_output);
    this._onError(err);
    return;
  }

  var written = SamplerateModule.getValue(this._written, "i32");
  var result = new Float32Array(written);
  result.set(output.subarray(0, written));

  SamplerateModule._free(_output);

  if (isInt16) {
    result = convertFloat32(result);
  }

  var ret = {
    data: result,
    used: SamplerateModule.getValue(this._used, "i32")
  };
  return ret;
};

Samplerate.isValidRatio = function (ratio) {
  return !!SamplerateModule._src_is_valid_ratio(ratio);
}
var createModule = require("./libsamplerate_browser_stubs").default;

Samplerate.initialized = (createModule()).then(function (Module) {
  SamplerateModule = Module;
  samplerateInit();
});

module.exports.Samplerate = Samplerate;
module.exports.Converter = Converter;
