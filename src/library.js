mergeInto(LibraryManager.library, {
  _mad_js_raise: function (error) {
    throw Pointer_stringify(error);
  },
  _mad_js_read: function (mf, buf, position, len, rem) {
    var file = Mad.getDecoder(mf)._file;

    if (position+len>file.size) {
      return Mad.getDecoder(mf)._decode_callback("End of File");
    }

    var data = Module.HEAPU8.subarray(buf, buf+len);

    var reader = new FileReader();
    reader.onload = function(e) {
      data.set(new Uint8Array(e.target.result));
      return _mad_js_after_read(mf, len, rem);
    }

    reader.readAsArrayBuffer(file.slice(position, position+len));
  },
  _mad_js_decode_callback: function (mf) {
    Mad.getDecoder(mf)._decode_callback();
  }
});
