Samplerate.initialized = new Promise(function (resolve) {
  Module['onRuntimeInitialized'] = function () {
    SamplerateModule = Module;
    samplerateInit();
    resolve();
  }
})

Module["Samplerate"] = Samplerate;
Module["Converter"] = Converter;
