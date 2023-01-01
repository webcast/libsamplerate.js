var createModule = require("./libsamplerate_browser_stubs").default;

Samplerate.initialized = (createModule()).then(function (Module) {
  SamplerateModule = Module;
  samplerateInit();
});

module.exports.Samplerate = Samplerate;
module.exports.Converter = Converter;
