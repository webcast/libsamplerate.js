// libmad.js - port of libmp3lame to JavaScript using emscripten
// by Romain Beauxis <toots@rastageeks.org>
var Mad = (function() {
  var Module;
  var context = {};
  return (function() {
// Note: Some Emscripten settings will significantly limit the speed of the generated code.
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
  Module.test;
} catch(e) {
  this['Module'] = Module = {};
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (typeof module === "object") {
  module.exports = Module;
}
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  if (!Module['arguments']) {
    Module['arguments'] = process['argv'].slice(2);
  }
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (!Module['arguments']) {
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  if (!Module['print']) {
    Module['print'] = function(x) {
      console.log(x);
    };
  }
  if (!Module['printErr']) {
    Module['printErr'] = function(x) {
      console.log(x);
    };
  }
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (!Module['arguments']) {
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  if (!Module['print']) {
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
if (!Module['preRun']) Module['preRun'] = [];
if (!Module['postRun']) Module['postRun'] = [];
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2*i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = globalScope['Module']['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,((Math.min((+(Math.floor((value)/(+(4294967296))))), (+(4294967295))))|0)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var runtimeInitialized = false;
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function addPreRun(func) {
  if (!Module['preRun']) Module['preRun'] = [];
  else if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
  Module['preRun'].push(func);
}
var awaitingMemoryInitializer = false;
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
    runPostSets();
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
  awaitingMemoryInitializer = false;
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 45344;
var _stderr;
var ___progname;
var __ZTVN10__cxxabiv120__si_class_type_infoE;
var __ZTVN10__cxxabiv117__class_type_infoE;
var __ZNSt9bad_allocC1Ev;
var __ZNSt9bad_allocD1Ev;
var __ZNSt20bad_array_new_lengthC1Ev;
var __ZNSt20bad_array_new_lengthD1Ev;
var __ZNSt20bad_array_new_lengthD2Ev;
var _err;
var _errx;
var _warn;
var _warnx;
var _verr;
var _verrx;
var _vwarn;
var _vwarnx;
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var __ZTVN10__cxxabiv120__si_class_type_infoE = __ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var __ZTVN10__cxxabiv117__class_type_infoE = __ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([162,162,22,2,170,120,31,6,160,124,189,9,70,147,177,12,232,53,200,14,73,245,220,15,73,245,220,15,232,53,200,14,70,147,177,12,160,124,189,9,170,120,31,6,162,162,22,2,62,170,178,0,162,162,22,2,98,137,118,3,226,176,207,4,170,120,31,6,132,82,99,7,121,199,152,8,160,124,189,9,173,55,207,10,82,227,203,11,70,147,177,12,7,136,126,13,69,50,49,14,232,53,200,14,181,108,66,15,144,232,158,15,73,245,220,15,253,25,252,15,253,25,252,15,73,245,220,15,144,232,158,15,181,108,66,15,232,53,200,14,69,50,49,14,7,136,126,13,70,147,177,12,82,227,203,11,173,55,207,10,160,124,189,9,121,199,152,8,132,82,99,7,170,120,31,6,226,176,207,4,98,137,118,3,162,162,22,2,62,170,178,0,0,0,0,1,0,2,0,3,3,0,1,1,1,2,1,3,2,1,2,2,2,3,3,1,3,2,3,3,4,2,4,3,16,2,0,0,192,1,0,0,232,1,0,0,120,2,0,0,40,2,0,0,80,2,0,0,224,2,0,0,144,2,0,0,184,2,0,0,72,3,0,0,248,2,0,0,32,3,0,0,176,3,0,0,96,3,0,0,136,3,0,0,176,3,0,0,200,3,0,0,240,3,0,0,176,3,0,0,200,3,0,0,240,3,0,0,176,3,0,0,200,3,0,0,240,3,0,0,168,1,0,0,88,1,0,0,128,1,0,0,0,0,0,0,8,8,8,8,8,8,8,8,8,12,12,12,16,16,16,20,20,20,24,24,24,28,28,28,36,36,36,2,2,2,2,2,2,2,2,2,26,26,26,0,12,12,12,4,4,4,8,8,8,12,12,12,16,16,16,20,20,20,24,24,24,28,28,28,36,36,36,2,2,2,2,2,2,2,2,2,26,26,26,0,12,12,12,12,12,12,16,20,24,28,32,40,48,56,64,76,90,2,2,2,2,2,0,0,4,4,4,4,4,4,4,4,4,4,4,4,6,6,6,6,6,6,10,10,10,12,12,12,14,14,14,16,16,16,20,20,20,26,26,26,66,66,66,0,4,4,4,4,4,4,6,6,4,4,4,6,6,6,6,6,6,10,10,10,12,12,12,14,14,14,16,16,16,20,20,20,26,26,26,66,66,66,0,0,4,4,4,4,4,4,6,6,6,8,10,12,16,18,22,28,34,40,46,54,54,192,0,0,4,4,4,4,4,4,4,4,4,4,4,4,6,6,6,8,8,8,10,10,10,12,12,12,14,14,14,18,18,18,22,22,22,30,30,30,56,56,56,0,4,4,4,4,4,4,6,6,4,4,4,6,6,6,8,8,8,10,10,10,12,12,12,14,14,14,18,18,18,22,22,22,30,30,30,56,56,56,0,0,4,4,4,4,4,4,6,6,8,8,10,12,16,20,24,28,34,42,50,54,76,158,0,0,4,4,4,4,4,4,4,4,4,4,4,4,6,6,6,8,8,8,12,12,12,16,16,16,20,20,20,26,26,26,34,34,34,42,42,42,12,12,12,0,4,4,4,4,4,4,6,6,4,4,4,6,6,6,8,8,8,12,12,12,16,16,16,20,20,20,26,26,26,34,34,34,42,42,42,12,12,12,0,0,4,4,4,4,4,4,6,6,8,10,12,16,20,24,30,38,46,56,68,84,102,26,0,0,4,4,4,4,4,4,4,4,4,6,6,6,8,8,8,10,10,10,12,12,12,14,14,14,18,18,18,24,24,24,32,32,32,44,44,44,12,12,12,0,6,6,6,6,6,6,6,6,6,8,8,8,10,10,10,12,12,12,14,14,14,18,18,18,24,24,24,32,32,32,44,44,44,12,12,12,0,0,0,0,6,6,6,6,6,6,8,10,12,14,16,18,22,26,32,38,46,54,62,70,76,36,0,0,4,4,4,4,4,4,4,4,4,6,6,6,6,6,6,8,8,8,10,10,10,14,14,14,18,18,18,26,26,26,32,32,32,42,42,42,18,18,18,0,6,6,6,6,6,6,6,6,6,6,6,6,8,8,8,10,10,10,14,14,14,18,18,18,26,26,26,32,32,32,42,42,42,18,18,18,0,0,0,0,6,6,6,6,6,6,8,10,12,14,16,20,24,28,32,38,46,52,60,68,58,54,0,0,4,4,4,4,4,4,4,4,4,6,6,6,8,8,8,10,10,10,12,12,12,14,14,14,18,18,18,24,24,24,30,30,30,40,40,40,18,18,18,0,6,6,6,6,6,6,6,6,6,8,8,8,10,10,10,12,12,12,14,14,14,18,18,18,24,24,24,30,30,30,40,40,40,18,18,18,0,0,0,0,0,0,0,32,165,254,101,25,250,162,40,20,0,0,0,16,83,255,178,12,125,81,20,10,0,0,0,8,169,127,89,6,190,40,10,5,0,0,0,4,213,191,44,3,95,20,133,2,0,0,0,2,234,95,150,1,48,138,66,1,0,0,0,1,245,47,203,0,24,69,161,0,0,0,128,0,251,151,101,0,140,162,80,0,0,0,64,0,253,203,50,0,70,81,40,0,0,0,32,0,255,101,25,0,163,40,20,0,0,0,16,0,255,178,12,0,81,20,10,0,0,0,8,0,128,89,6,0,41,10,5,0,0,0,4,0,192,44,3,0,20,133,2,0,0,0,2,0,96,150,1,0,138,66,1,0,0,0,1,0,48,203,0,0,69,161,0,0,0,128,0,0,152,101,0,0,163,80,0,0,0,64,0,0,204,50,0,0,81,40,0,0,0,32,0,0,102,25,0,0,41,20,0,0,0,16,0,0,179,12,0,0,20,10,0,0,0,8,0,0,89,6,0,0,10,5,0,0,0,4,0,0,45,3,0,0,133,2,0,0,0,2,0,0,150,1,0,0,67,1,0,0,0,0,0,0,180,211,224,31,71,221,232,30,48,121,0,29,89,126,54,26,102,158,160,22,248,188,90,18,188,22,134,13,225,62,72,8,215,250,201,2,0,0,0,0,27,0,0,0,7,7,7,6,6,6,6,6,6,6,6,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,30,0,0,0,7,7,7,6,6,6,6,6,6,6,6,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,8,0,0,0,5,5,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,5,5,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,4,4,4,4,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,68,172,0,0,128,187,0,0,0,125,0,0,0,0,0,0,0,0,0,0,0,0,0,20,190,40,10,29,205,165,83,36,169,127,89,38,117,98,70,44,114,140,115,45,129,252,177,46,0,0,0,52,215,32,174,52,148,214,98,53,150,174,29,54,244,71,222,54,122,79,164,55,101,190,55,60,36,200,159,60,190,40,10,61,245,198,118,61,11,140,229,61,97,99,86,62,46,58,201,62,62,255,61,63,188,162,180,63,5,139,22,68,205,165,83,68,106,155,145,68,251,101,208,68,0,0,16,69,81,100,80,69,21,142,145,69,187,120,211,69,243,31,22,70,169,127,89,70,0,148,157,70,76,89,226,70,17,204,39,71,252,232,109,71,227,172,180,71,191,20,252,71,215,14,34,76,117,98,70,76,231,3,107,76,232,241,143,76,63,43,181,76,192,174,218,76,73,123,0,77,198,143,38,77,42,235,76,77,114,140,115,77,165,114,154,77,211,156,193,77,18,10,233,77,130,185,16,78,72,170,56,78,145,219,96,78,144,76,137,78,129,252,177,78,161,234,218,78,54,22,4,79,139,126,45,79,239,34,87,79,184,2,129,79,62,29,171,79,224,113,213,79,0,0,0,84,129,99,21,84,42,227,42,84,177,126,64,84,207,53,86,84,62,8,108,84,187,245,129,84,3,254,151,84,215,32,174,84,246,93,196,84,36,181,218,84,36,38,241,84,188,176,7,85,177,84,30,85,203,17,53,85,212,231,75,85,148,214,98,85,216,221,121,85,108,253,144,85,28,53,168,85,184,132,191,85,14,236,214,85,239,106,238,85,43,1,6,86,150,174,29,86,2,115,53,86,67,78,77,86,45,64,101,86,150,72,125,86,83,103,149,86,61,156,173,86,43,231,197,86,244,71,222,86,115,190,246,86,128,74,15,87,247,235,39,87,178,162,64,87,141,110,89,87,100,79,114,87,20,69,139,87,122,79,164,87,117,110,189,87,226,161,214,87,161,233,239,87,201,162,4,92,202,90,17,92,196,28,30,92,167,232,42,92,101,190,55,92,238,157,68,92,51,135,81,92,38,122,94,92,185,118,107,92,220,124,120,92,131,140,133,92,159,165,146,92,36,200,159,92,2,244,172,92,46,41,186,92,154,103,199,92,58,175,212,92,0,0,226,92,224,89,239,92,206,188,252,92,190,40,10,93,164,157,23,93,115,27,37,93,32,162,50,93,160,49,64,93,231,201,77,93,233,106,91,93,156,20,105,93,245,198,118,93,233,129,132,93,109,69,146,93,118,17,160,93,250,229,173,93,239,194,187,93,74,168,201,93,1,150,215,93,11,140,229,93,93,138,243,93,238,144,1,94,179,159,15,94,165,182,29,94,184,213,43,94,228,252,57,94,31,44,72,94,97,99,86,94,160,162,100,94,212,233,114,94,243,56,129,94,245,143,143,94,209,238,157,94,127,85,172,94,246,195,186,94,46,58,201,94,31,184,215,94,192,61,230,94,9,203,244,94,243,95,3,95,117,252,17,95,135,160,32,95,34,76,47,95,62,255,61,95,211,185,76,95,219,123,91,95,76,69,106,95,32,22,121,95,80,238,135,95,212,205,150,95,165,180,165,95,188,162,180,95,18,152,195,95,160,148,210,95,95,152,225,95,72,163,240,95,84,181,255,95,63,103,7,100,94,247,14,100,5,139,22,100,48,34,30,100,221,188,37,100,7,91,45,100,173,252,52,100,201,161,60,100,90,74,68,100,93,246,75,100,205,165,83,100,169,88,91,100,237,14,99,100,150,200,106,100,162,133,114,100,12,70,122,100,211,9,130,100,244,208,137,100,106,155,145,100,53,105,153,100,80,58,161,100,186,14,169,100,110,230,176,100,108,193,184,100,175,159,192,100,53,129,200,100,251,101,208,100,255,77,216,100,62,57,224,100,182,39,232,100,99,25,240,100,68,14,248,100,85,6,0,101,149,1,8,101,0,0,16,101,148,1,24,101,79,6,32,101,45,14,40,101,46,25,48,101,78,39,56,101,138,56,64,101,226,76,72,101,81,100,80,101,213,126,88,101,110,156,96,101,23,189,104,101,207,224,112,101,147,7,121,101,98,49,129,101,57,94,137,101,21,142,145,101,244,192,153,101,213,246,161,101,181,47,170,101,146,107,178,101,105,170,186,101,57,236,194,101,0,49,203,101,187,120,211,101,104,195,219,101,5,17,228,101,144,97,236,101,7,181,244,101,104,11,253,101,177,100,5,102,224,192,13,102,243,31,22,102,232,129,30,102,188,230,38,102,111,78,47,102,253,184,55,102,102,38,64,102,167,150,72,102,190,9,81,102,169,127,89,102,103,248,97,102,245,115,106,102,82,242,114,102,124,115,123,102,113,247,131,102,47,126,140,102,181,7,149,102,0,148,157,102,15,35,166,102,224,180,174,102,113,73,183,102,192,224,191,102,204,122,200,102,148,23,209,102,20,183,217,102,76,89,226,102,58,254,234,102,220,165,243,102,48,80,252,102,53,253,4,103,234,172,13,103,75,95,22,103,89,20,31,103,17,204,39,103,113,134,48,103,120,67,57,103,37,3,66,103,117,197,74,103,103,138,83,103,250,81,92,103,44,28,101,103,252,232,109,103,103,184,118,103,109,138,127,103,11,95,136,103,65,54,145,103,12,16,154,103,108,236,162,103,95,203,171,103,227,172,180,103,246,144,189,103,152,119,198,103,199,96,207,103,129,76,216,103,197,58,225,103,146,43,234,103,230,30,243,103,191,20,252,103,142,134,2,108,255,3,7,108,176,130,11,108,161,2,16,108,209,131,20,108,64,6,25,108,237,137,29,108,215,14,34,108,254,148,38,108,96,28,43,108,254,164,47,108,215,46,52,108,233,185,56,108,53,70,61,108,185,211,65,108,117,98,70,108,105,242,74,108,147,131,79,108,243,21,84,108,137,169,88,108,83,62,93,108,81,212,97,108,131,107,102,108,231,3,107,108,126,157,111,108,71,56,116,108,64,212,120,108,106,113,125,108,195,15,130,108,76,175,134,108,3,80,139,108,232,241,143,108,251,148,148,108,58,57,153,108,165,222,157,108,60,133,162,108,254,44,167,108,234,213,171,108,0,128,176,108,63,43,181,108,167,215,185,108,55,133,190,108,238,51,195,108,204,227,199,108,209,148,204,108,251,70,209,108,75,250,213,108,192,174,218,108,88,100,223,108,20,27,228,108,243,210,232,108,245,139,237,108,24,70,242,108,93,1,247,108,195,189,251,108,73,123,0,109,239,57,5,109,180,249,9,109,152,186,14,109,154,124,19,109,186,63,24,109,247,3,29,109,80,201,33,109,198,143,38,109,87,87,43,109,3,32,48,109,202,233,52,109,171,180,57,109,166,128,62,109,185,77,67,109,229,27,72,109,42,235,76,109,133,187,81,109,248,140,86,109,129,95,91,109,33,51,96,109,214,7,101,109,160,221,105,109,127,180,110,109,114,140,115,109,120,101,120,109,146,63,125,109,191,26,130,109,253,246,134,109,78,212,139,109,176,178,144,109,34,146,149,109,165,114,154,109,56,84,159,109,218,54,164,109,140,26,169,109,76,255,173,109,26,229,178,109,245,203,183,109,222,179,188,109,211,156,193,109,213,134,198,109,226,113,203,109,251,93,208,109,31,75,213,109,77,57,218,109,133,40,223,109,199,24,228,109,18,10,233,109,102,252,237,109,194,239,242,109,38,228,247,109,146,217,252,109,4,208,1,110,125,199,6,110,253,191,11,110,130,185,16,110,12,180,21,110,156,175,26,110,47,172,31,110,199,169,36,110,99,168,41,110,2,168,46,110,163,168,51,110,72,170,56,110,238,172,61,110,150,176,66,110,63,181,71,110,233,186,76,110,147,193,81,110,61,201,86,110,231,209,91,110,145,219,96,110,57,230,101,110,223,241,106,110,132,254,111,110,38,12,117,110,198,26,122,110,98,42,127,110,251,58,132,110,144,76,137,110,33,95,142,110,174,114,147,110,53,135,152,110,183,156,157,110,51,179,162,110,169,202,167,110,24,227,172,110,129,252,177,110,226,22,183,110,59,50,188,110,141,78,193,110,214,107,198,110,23,138,203,110,78,169,208,110,124,201,213,110,161,234,218,110,187,12,224,110,202,47,229,110,207,83,234,110,200,120,239,110,182,158,244,110,151,197,249,110,109,237,254,110,54,22,4,111,242,63,9,111,160,106,14,111,65,150,19,111,211,194,24,111,88,240,29,111,205,30,35,111,52,78,40,111,139,126,45,111,210,175,50,111,9,226,55,111,48,21,61,111,70,73,66,111,75,126,71,111,62,180,76,111,32,235,81,111,239,34,87,111,172,91,92,111,87,149,97,111,238,207,102,111,114,11,108,111,226,71,113,111,62,133,118,111,133,195,123,111,184,2,129,111,214,66,134,111,222,131,139,111,209,197,144,111,174,8,150,111,116,76,155,111,36,145,160,111,189,214,165,111,62,29,171,111,168,100,176,111,251,172,181,111,53,246,186,111,86,64,192,111,95,139,197,111,78,215,202,111,36,36,208,111,224,113,213,111,131,192,218,111,10,16,224,111,120,96,229,111,202,177,234,111,1,4,240,111,29,87,245,111,28,171,250,111,0,0,0,116,227,170,2,116,56,86,5,116,255,1,8,116,55,174,10,116,224,90,13,116,250,7,16,116,134,181,18,116,129,99,21,116,238,17,24,116,203,192,26,116,24,112,29,116,213,31,32,116,3,208,34,116,160,128,37,116,173,49,40,116,42,227,42,116,22,149,45,116,114,71,48,116,61,250,50,116,118,173,53,116,31,97,56,116,54,21,59,116,188,201,61,116,177,126,64,116,20,52,67,116,229,233,69,116,36,160,72,116,209,86,75,116,236,13,78,116,117,197,80,116,107,125,83,116,207,53,86,116,159,238,88,116,221,167,91,116,136,97,94,116,160,27,97,116,37,214,99,116,22,145,102,116,116,76,105,116,62,8,108,116,116,196,110,116,22,129,113,116,37,62,116,116,159,251,118,116,132,185,121,116,214,119,124,116,147,54,127,116,187,245,129,116,78,181,132,116,76,117,135,116,182,53,138,116,138,246,140,116,200,183,143,116,114,121,146,116,133,59,149,116,3,254,151,116,235,192,154,116,62,132,157,116,250,71,160,116,32,12,163,116,175,208,165,116,168,149,168,116,11,91,171,116,215,32,174,116,12,231,176,116,170,173,179,116,177,116,182,116,33,60,185,116,250,3,188,116,59,204,190,116,228,148,193,116,246,93,196,116,113,39,199,116,83,241,201,116,157,187,204,116,79,134,207,116,105,81,210,116,235,28,213,116,212,232,215,116,36,181,218,116,220,129,221,116,251,78,224,116,129,28,227,116,110,234,229,116,194,184,232,116,124,135,235,116,157,86,238,116,36,38,241,116,18,246,243,116,102,198,246,116,33,151,249,116,65,104,252,116,199,57,255,116,179,11,2,117,5,222,4,117,188,176,7,117,216,131,10,117,91,87,13,117,66,43,16,117,142,255,18,117,64,212,21,117,86,169,24,117,209,126,27,117,177,84,30,117,245,42,33,117,158,1,36,117,171,216,38,117,29,176,41,117,242,135,44,117,44,96,47,117,202,56,50,117,203,17,53,117,48,235,55,117,249,196,58,117,37,159,61,117,181,121,64,117,168,84,67,117,254,47,70,117,183,11,73,117,212,231,75,117,83,196,78,117,52,161,81,117,121,126,84,117,32,92,87,117,42,58,90,117,150,24,93,117,100,247,95,117,148,214,98,117,39,182,101,117,27,150,104,117,113,118,107,117,41,87,110,117,67,56,113,117,190,25,116,117,154,251,118,117,216,221,121,117,119,192,124,117,120,163,127,117,217,134,130,117,155,106,133,117,190,78,136,117,66,51,139,117,39,24,142,117,108,253,144,117,17,227,147,117,23,201,150,117,125,175,153,117,67,150,156,117,106,125,159,117,240,100,162,117,214,76,165,117,28,53,168,117,194,29,171,117,199,6,174,117,43,240,176,117,240,217,179,117,19,196,182,117,149,174,185,117,119,153,188,117,184,132,191,117,87,112,194,117,86,92,197,117,179,72,200,117,110,53,203,117,137,34,206,117,1,16,209,117,216,253,211,117,14,236,214,117,161,218,217,117,147,201,220,117,226,184,223,117,144,168,226,117,155,152,229,117,4,137,232,117,203,121,235,117,239,106,238,117,112,92,241,117,79,78,244,117,139,64,247,117,36,51,250,117,27,38,253,117,110,25,0,118,30,13,3,118,43,1,6,118,149,245,8,118,92,234,11,118,127,223,14,118,254,212,17,118,218,202,20,118,18,193,23,118,166,183,26,118,150,174,29,118,227,165,32,118,139,157,35,118,143,149,38,118,239,141,41,118,170,134,44,118,193,127,47,118,52,121,50,118,2,115,53,118,43,109,56,118,176,103,59,118,144,98,62,118,203,93,65,118,96,89,68,118,81,85,71,118,156,81,74,118,67,78,77,118,68,75,80,118,159,72,83,118,85,70,86,118,101,68,89,118,208,66,92,118,149,65,95,118,180,64,98,118,45,64,101,118,0,64,104,118,45,64,107,118,179,64,110,118,148,65,113,118,206,66,116,118,98,68,119,118,79,70,122,118,150,72,125,118,54,75,128,118,47,78,131,118,129,81,134,118,44,85,137,118,49,89,140,118,142,93,143,118,69,98,146,118,83,103,149,118,187,108,152,118,123,114,155,118,148,120,158,118,5,127,161,118,207,133,164,118,241,140,167,118,107,148,170,118,61,156,173,118,104,164,176,118,234,172,179,118,196,181,182,118,246,190,185,118,128,200,188,118,97,210,191,118,154,220,194,118,43,231,197,118,19,242,200,118,82,253,203,118,233,8,207,118,215,20,210,118,28,33,213,118,184,45,216,118,170,58,219,118,244,71,222,118,149,85,225,118,141,99,228,118,219,113,231,118,127,128,234,118,123,143,237,118,204,158,240,118,117,174,243,118,115,190,246,118,200,206,249,118,114,223,252,118,115,240,255,118,202,1,3,119,119,19,6,119,122,37,9,119,210,55,12,119,128,74,15,119,132,93,18,119,222,112,21,119,141,132,24,119,145,152,27,119,235,172,30,119,154,193,33,119,158,214,36,119,247,235,39,119,166,1,43,119,169,23,46,119,1,46,49,119,174,68,52,119,176,91,55,119,7,115,58,119,178,138,61,119,178,162,64,119,6,187,67,119,175,211,70,119,172,236,73,119,254,5,77,119,163,31,80,119,157,57,83,119,235,83,86,119,141,110,89,119,131,137,92,119,204,164,95,119,106,192,98,119,91,220,101,119,160,248,104,119,56,21,108,119,36,50,111,119,100,79,114,119,247,108,117,119,221,138,120,119,22,169,123,119,163,199,126,119,131,230,129,119,181,5,133,119,59,37,136,119,20,69,139,119,63,101,142,119,190,133,145,119,143,166,148,119,178,199,151,119,41,233,154,119,241,10,158,119,12,45,161,119,122,79,164,119,58,114,167,119,76,149,170,119,176,184,173,119,103,220,176,119,111,0,180,119,202,36,183,119,118,73,186,119,117,110,189,119,197,147,192,119,103,185,195,119,90,223,198,119,159,5,202,119,54,44,205,119,30,83,208,119,87,122,211,119,226,161,214,119,190,201,217,119,236,241,220,119,106,26,224,119,58,67,227,119,90,108,230,119,204,149,233,119,142,191,236,119,161,233,239,119,5,20,243,119,186,62,246,119,192,105,249,119,22,149,252,119,188,192,255,119,89,118,1,124,125,12,3,124,201,162,4,124,61,57,6,124,217,207,7,124,157,102,9,124,137,253,10,124,158,148,12,124,218,43,14,124,62,195,15,124,202,90,17,124,126,242,18,124,90,138,20,124,93,34,22,124,137,186,23,124,220,82,25,124,87,235,26,124,250,131,28,124,196,28,30,124,182,181,31,124,208,78,33,124,17,232,34,124,121,129,36,124,10,27,38,124,194,180,39,124,161,78,41,124,167,232,42,124,214,130,44,124,43,29,46,124,168,183,47,124,76,82,49,124,23,237,50,124,10,136,52,124,36,35,54,124,101,190,55,124,205,89,57,124,93,245,58,124,19,145,60,124,241,44,62,124,246,200,63,124,34,101,65,124,116,1,67,124,238,157,68,124,143,58,70,124,86,215,71,124,69,116,73,124,90,17,75,124,150,174,76,124,249,75,78,124,131,233,79,124,51,135,81,124,10,37,83,124,8,195,84,124,45,97,86,124,120,255,87,124,234,157,89,124,130,60,91,124,65,219,92,124,38,122,94,124,50,25,96,124,100,184,97,124,189,87,99,124,60,247,100,124,226,150,102,124,174,54,104,124,160,214,105,124,185,118,107,124,247,22,109,124,92,183,110,124,232,87,112,124,153,248,113,124,113,153,115,124,111,58,117,124,146,219,118,124,220,124,120,124,76,30,122,124,226,191,123,124,158,97,125,124,128,3,127,124,136,165,128,124,182,71,130,124,10,234,131,124,131,140,133,124,34,47,135,124,232,209,136,124,211,116,138,124,227,23,140,124,26,187,141,124,118,94,143,124,248,1,145,124,159,165,146,124,108,73,148,124,95,237,149,124,119,145,151,124,181,53,153,124,25,218,154,124,161,126,156,124,80,35,158,124,36,200,159,124,29,109,161,124,59,18,163,124,127,183,164,124,232,92,166,124,119,2,168,124,43,168,169,124,4,78,171,124,2,244,172,124,38,154,174,124,110,64,176,124,220,230,177,124,111,141,179,124,39,52,181,124,5,219,182,124,7,130,184,124,46,41,186,124,122,208,187,124,236,119,189,124,130,31,191,124,61,199,192,124,29,111,194,124,34,23,196,124,76,191,197,124,154,103,199,124,13,16,201,124,166,184,202,124,99,97,204,124,68,10,206,124,75,179,207,124,118,92,209,124,197,5,211,124,58,175,212,124,210,88,214,124,144,2,216,124,114,172,217,124,121,86,219,124,164,0,221,124,243,170,222,124,103,85,224,124,0,0,226,124,189,170,227,124,158,85,229,124,163,0,231,124,205,171,232,124,28,87,234,124,142,2,236,124,37,174,237,124,224,89,239,124,191,5,241,124,195,177,242,124,234,93,244,124,54,10,246,124,166,182,247,124,58,99,249,124,242,15,251,124,206,188,252,124,206,105,254,124,243,22,0,125,59,196,1,125,167,113,3,125,55,31,5,125,235,204,6,125,194,122,8,125,190,40,10,125,222,214,11,125,33,133,13,125,136,51,15,125,19,226,16,125,194,144,18,125,148,63,20,125,138,238,21,125,164,157,23,125,225,76,25,125,66,252,26,125,199,171,28,125,111,91,30,125,58,11,32,125,42,187,33,125,61,107,35,125,115,27,37,125,205,203,38,125,74,124,40,125,234,44,42,125,174,221,43,125,150,142,45,125,161,63,47,125,207,240,48,125,32,162,50,125,149,83,52,125,45,5,54,125,232,182,55,125,198,104,57,125,200,26,59,125,237,204,60,125,53,127,62,125,160,49,64,125,46,228,65,125,223,150,67,125,180,73,69,125,171,252,70,125,198,175,72,125,3,99,74,125,99,22,76,125,231,201,77,125,141,125,79,125,86,49,81,125,66,229,82,125,81,153,84,125,131,77,86,125,216,1,88,125,79,182,89,125,233,106,91,125,166,31,93,125,134,212,94,125,136,137,96,125,173,62,98,125,245,243,99,125,96,169,101,125,237,94,103,125,156,20,105,125,111,202,106,125,100,128,108,125,123,54,110,125,181,236,111,125,17,163,113,125,144,89,115,125,50,16,117,125,245,198,118,125,220,125,120,125,228,52,122,125,15,236,123,125,93,163,125,125,204,90,127,125,94,18,129,125,18,202,130,125,233,129,132,125,226,57,134,125,253,241,135,125,58,170,137,125,154,98,139,125,27,27,141,125,191,211,142,125,133,140,144,125,109,69,146,125,119,254,147,125,163,183,149,125,241,112,151,125,97,42,153,125,243,227,154,125,168,157,156,125,126,87,158,125,118,17,160,125,144,203,161,125,204,133,163,125,42,64,165,125,169,250,166,125,75,181,168,125,14,112,170,125,243,42,172,125,250,229,173,125,35,161,175,125,109,92,177,125,217,23,179,125,103,211,180,125,22,143,182,125,231,74,184,125,218,6,186,125,239,194,187,125,37,127,189,125,124,59,191,125,245,247,192,125,144,180,194,125,76,113,196,125,42,46,198,125,41,235,199,125,74,168,201,125,140,101,203,125,239,34,205,125,116,224,206,125,27,158,208,125,226,91,210,125,203,25,212,125,213,215,213,125,1,150,215,125,78,84,217,125,188,18,219,125,76,209,220,125,252,143,222,125,206,78,224,125,193,13,226,125,213,204,227,125,11,140,229,125,97,75,231,125,217,10,233,125,114,202,234,125,43,138,236,125,6,74,238,125,2,10,240,125,31,202,241,125,93,138,243,125,188,74,245,125,60,11,247,125,220,203,248,125,158,140,250,125,129,77,252,125,132,14,254,125,168,207,255,125,238,144,1,126,84,82,3,126,218,19,5,126,130,213,6,126,74,151,8,126,52,89,10,126,61,27,12,126,104,221,13,126,179,159,15,126,31,98,17,126,172,36,19,126,89,231,20,126,39,170,22,126,22,109,24,126,37,48,26,126,84,243,27,126,165,182,29,126,21,122,31,126,167,61,33,126,88,1,35,126,42,197,36,126,29,137,38,126,48,77,40,126,100,17,42,126,184,213,43,126,44,154,45,126,193,94,47,126,118,35,49,126,75,232,50,126,65,173,52,126,87,114,54,126,141,55,56,126,228,252,57,126,91,194,59,126,242,135,61,126,169,77,63,126,128,19,65,126,120,217,66,126,143,159,68,126,199,101,70,126,31,44,72,126,151,242,73,126,47,185,75,126,232,127,77,126,192,70,79,126,184,13,81,126,208,212,82,126,9,156,84,126,97,99,86,126,217,42,88,126,113,242,89,126,41,186,91,126,1,130,93,126,249,73,95,126,17,18,97,126,73,218,98,126,160,162,100,126,23,107,102,126,174,51,104,126,101,252,105,126,60,197,107,126,50,142,109,126,72,87,111,126,126,32,113,126,212,233,114,126,73,179,116,126,222,124,118,126,146,70,120,126,102,16,122,126,90,218,123,126,109,164,125,126,160,110,127,126,243,56,129,126,101,3,131,126,246,205,132,126,168,152,134,126,120,99,136,126,104,46,138,126,120,249,139,126,167,196,141,126,245,143,143,126,99,91,145,126,240,38,147,126,156,242,148,126,104,190,150,126,84,138,152,126,94,86,154,126,136,34,156,126,209,238,157,126,58,187,159,126,193,135,161,126,104,84,163,126,47,33,165,126,20,238,166,126,24,187,168,126,60,136,170,126,127,85,172,126,225,34,174,126,98,240,175,126,3,190,177,126,194,139,179,126,161,89,181,126,158,39,183,126,187,245,184,126,246,195,186,126,81,146,188,126,203,96,190,126,99,47,192,126,27,254,193,126,241,204,195,126,231,155,197,126,251,106,199,126,46,58,201,126,129,9,203,126,242,216,204,126,129,168,206,126,48,120,208,126,254,71,210,126,234,23,212,126,245,231,213,126,31,184,215,126,104,136,217,126,207,88,219,126,85,41,221,126,250,249,222,126,190,202,224,126,160,155,226,126,161,108,228,126,192,61,230,126,254,14,232,126,91,224,233,126,214,177,235,126,112,131,237,126,41,85,239,126,0,39,241,126,245,248,242,126,9,203,244,126,60,157,246,126,141,111,248,126,253,65,250,126,139,20,252,126,55,231,253,126,2,186,255,126,235,140,1,127,243,95,3,127,25,51,5,127,93,6,7,127,192,217,8,127,65,173,10,127,225,128,12,127,159,84,14,127,123,40,16,127,117,252,17,127,141,208,19,127,196,164,21,127,25,121,23,127,140,77,25,127,30,34,27,127,206,246,28,127,155,203,30,127,135,160,32,127,145,117,34,127,185,74,36,127,0,32,38,127,100,245,39,127,231,202,41,127,135,160,43,127,70,118,45,127,34,76,47,127,29,34,49,127,53,248,50,127,108,206,52,127,193,164,54,127,51,123,56,127,196,81,58,127,114,40,60,127,62,255,61,127,40,214,63,127,48,173,65,127,86,132,67,127,154,91,69,127,252,50,71,127,123,10,73,127,24,226,74,127,211,185,76,127,172,145,78,127,163,105,80,127,183,65,82,127,233,25,84,127,57,242,85,127,167,202,87,127,50,163,89,127,219,123,91,127,161,84,93,127,133,45,95,127,135,6,97,127,166,223,98,127,227,184,100,127,62,146,102,127,182,107,104,127,76,69,106,127,255,30,108,127,208,248,109,127,190,210,111,127,202,172,113,127,243,134,115,127,58,97,117,127,158,59,119,127,32,22,121,127,191,240,122,127,124,203,124,127,86,166,126,127,77,129,128,127,98,92,130,127,148,55,132,127,227,18,134,127,80,238,135,127,218,201,137,127,129,165,139,127,70,129,141,127,40,93,143,127,39,57,145,127,67,21,147,127,125,241,148,127,212,205,150,127,72,170,152,127,217,134,154,127,136,99,156,127,83,64,158,127,60,29,160,127,66,250,161,127,101,215,163,127,165,180,165,127,2,146,167,127,125,111,169,127,20,77,171,127,200,42,173,127,154,8,175,127,136,230,176,127,148,196,178,127,188,162,180,127,2,129,182,127,100,95,184,127,228,61,186,127,128,28,188,127,57,251,189,127,15,218,191,127,2,185,193,127,18,152,195,127,63,119,197,127,137,86,199,127,239,53,201,127,115,21,203,127,19,245,204,127,208,212,206,127,170,180,208,127,160,148,210,127,179,116,212,127,228,84,214,127,48,53,216,127,154,21,218,127,32,246,219,127,195,214,221,127,131,183,223,127,95,152,225,127,88,121,227,127,110,90,229,127,160,59,231,127,239,28,233,127,90,254,234,127,226,223,236,127,135,193,238,127,72,163,240,127,38,133,242,127,32,103,244,127,55,73,246,127,106,43,248,127,186,13,250,127,38,240,251,127,175,210,253,127,84,181,255,127,11,204,0,132,122,189,1,132,247,174,2,132,131,160,3,132,28,146,4,132,196,131,5,132,122,117,6,132,63,103,7,132,17,89,8,132,241,74,9,132,224,60,10,132,221,46,11,132,232,32,12,132,1,19,13,132,41,5,14,132,94,247,14,132,161,233,15,132,243,219,16,132,83,206,17,132,193,192,18,132,61,179,19,132,199,165,20,132,95,152,21,132,5,139,22,132,185,125,23,132,124,112,24,132,76,99,25,132,42,86,26,132,23,73,27,132,17,60,28,132,26,47,29,132,48,34,30,132,85,21,31,132,136,8,32,132,200,251,32,132,23,239,33,132,115,226,34,132,222,213,35,132,86,201,36,132,221,188,37,132,113,176,38,132,20,164,39,132,196,151,40,132,131,139,41,132,79,127,42,132,41,115,43,132,17,103,44,132,7,91,45,132,11,79,46,132,29,67,47,132,61,55,48,132,107,43,49,132,166,31,50,132,240,19,51,132,71,8,52,132,173,252,52,132,32,241,53,132,161,229,54,132,47,218,55,132,204,206,56,132,119,195,57,132,47,184,58,132,245,172,59,132,201,161,60,132,171,150,61,132,155,139,62,132,152,128,63,132,163,117,64,132,188,106,65,132,227,95,66,132,24,85,67,132,90,74,68,132,171,63,69,132,8,53,70,132,116,42,71,132,238,31,72,132,117,21,73,132,10,11,74,132,172,0,75,132,93,246,75,132,27,236,76,132,231,225,77,132,192,215,78,132,168,205,79,132,156,195,80,132,159,185,81,132,175,175,82,132,205,165,83,132,249,155,84,132,50,146,85,132,121,136,86,132,206,126,87,132,48,117,88,132,160,107,89,132,30,98,90,132,169,88,91,132,66,79,92,132,233,69,93,132,157,60,94,132,94,51,95,132,46,42,96,132,11,33,97,132,245,23,98,132,237,14,99,132,243,5,100,132,6,253,100,132,39,244,101,132,85,235,102,132,145,226,103,132,219,217,104,132,50,209,105,132,150,200,106,132,9,192,107,132,136,183,108,132,21,175,109,132,176,166,110,132,88,158,111,132,14,150,112,132,209,141,113,132,162,133,114,132,128,125,115,132,108,117,116,132,101,109,117,132,107,101,118,132,127,93,119,132,161,85,120,132,208,77,121,132,12,70,122,132,86,62,123,132,174,54,124,132,18,47,125,132,132,39,126,132,4,32,127,132,145,24,128,132,43,17,129,132,211,9,130,132,136,2,131,132,75,251,131,132,27,244,132,132,248,236,133,132,227,229,134,132,219,222,135,132,225,215,136,132,244,208,137,132,20,202,138,132,65,195,139,132,124,188,140,132,196,181,141,132,26,175,142,132,125,168,143,132,237,161,144,132,106,155,145,132,245,148,146,132,141,142,147,132,51,136,148,132,229,129,149,132,165,123,150,132,115,117,151,132,77,111,152,132,53,105,153,132,42,99,154,132,44,93,155,132,60,87,156,132,89,81,157,132,131,75,158,132,186,69,159,132,254,63,160,132,80,58,161,132,175,52,162,132,27,47,163,132,149,41,164,132,27,36,165,132,175,30,166,132,80,25,167,132,254,19,168,132,186,14,169,132,130,9,170,132,88,4,171,132,59,255,171,132,43,250,172,132,40,245,173,132,50,240,174,132,74,235,175,132,110,230,176,132,160,225,177,132,223,220,178,132,43,216,179,132,132,211,180,132,234,206,181,132,94,202,182,132,222,197,183,132,108,193,184,132,6,189,185,132,174,184,186,132,99,180,187,132,36,176,188,132,243,171,189,132,207,167,190,132,184,163,191,132,175,159,192,132,178,155,193,132,194,151,194,132,223,147,195,132,9,144,196,132,65,140,197,132,133,136,198,132,214,132,199,132,53,129,200,132,160,125,201,132,24,122,202,132,158,118,203,132,48,115,204,132,207,111,205,132,123,108,206,132,53,105,207,132,251,101,208,132,206,98,209,132,174,95,210,132,155,92,211,132,149,89,212,132,156,86,213,132,176,83,214,132,209,80,215,132,255,77,216,132,58,75,217,132,129,72,218,132,214,69,219,132,55,67,220,132,166,64,221,132,33,62,222,132,169,59,223,132,62,57,224,132,224,54,225,132,143,52,226,132,75,50,227,132,19,48,228,132,233,45,229,132,203,43,230,132,186,41,231,132,182,39,232,132,191,37,233,132,212,35,234,132,247,33,235,132,38,32,236,132,98,30,237,132,171,28,238,132,1,27,239,132,99,25,240,132,211,23,241,132,79,22,242,132,216,20,243,132,109,19,244,132,16,18,245,132,191,16,246,132,123,15,247,132,68,14,248,132,25,13,249,132,252,11,250,132,235,10,251,132,231,9,252,132,239,8,253,132,5,8,254,132,39,7,255,132,85,6,0,133,145,5,1,133,217,4,2,133,46,4,3,133,143,3,4,133,254,2,5,133,121,2,6,133,0,2,7,133,149,1,8,133,54,1,9,133,227,0,10,133,158,0,11,133,101,0,12,133,57,0,13,133,25,0,14,133,6,0,15,133,0,0,16,133,6,0,17,133,25,0,18,133,57,0,19,133,101,0,20,133,158,0,21,133,227,0,22,133,53,1,23,133,148,1,24,133,255,1,25,133,119,2,26,133,252,2,27,133,141,3,28,133,42,4,29,133,212,4,30,133,139,5,31,133,79,6,32,133,31,7,33,133,251,7,34,133,228,8,35,133,218,9,36,133,220,10,37,133,234,11,38,133,6,13,39,133,45,14,40,133,98,15,41,133,163,16,42,133,240,17,43,133,74,19,44,133,176,20,45,133,35,22,46,133,162,23,47,133,46,25,48,133,198,26,49,133,107,28,50,133,28,30,51,133,218,31,52,133,164,33,53,133,123,35,54,133,94,37,55,133,78,39,56,133,74,41,57,133,82,43,58,133,103,45,59,133,137,47,60,133,182,49,61,133,241,51,62,133,55,54,63,133,138,56,64,133,234,58,65,133,86,61,66,133,206,63,67,133,83,66,68,133,228,68,69,133,129,71,70,133,43,74,71,133,226,76,72,133,164,79,73,133,115,82,74,133,78,85,75,133,54,88,76,133,42,91,77,133,43,94,78,133,56,97,79,133,81,100,80,133,118,103,81,133,168,106,82,133,230,109,83,133,49,113,84,133,135,116,85,133,234,119,86,133,90,123,87,133,213,126,88,133,94,130,89,133,242,133,90,133,146,137,91,133,63,141,92,133,249,144,93,133,190,148,94,133,144,152,95,133,110,156,96,133,88,160,97,133,79,164,98,133,81,168,99,133,96,172,100,133,124,176,101,133,163,180,102,133,215,184,103,133,23,189,104,133,99,193,105,133,188,197,106,133,32,202,107,133,145,206,108,133,14,211,109,133,152,215,110,133,45,220,111,133,207,224,112,133,125,229,113,133,55,234,114,133,253,238,115,133,208,243,116,133,174,248,117,133,153,253,118,133,144,2,120,133,147,7,121,133,163,12,122,133,190,17,123,133,230,22,124,133,26,28,125,133,89,33,126,133,166,38,127,133,254,43,128,133,98,49,129,133,210,54,130,133,79,60,131,133,216,65,132,133,108,71,133,133,13,77,134,133,186,82,135,133,115,88,136,133,57,94,137,133,10,100,138,133,231,105,139,133,209,111,140,133,198,117,141,133,200,123,142,133,213,129,143,133,239,135,144,133,21,142,145,133,71,148,146,133,132,154,147,133,206,160,148,133,36,167,149,133,134,173,150,133,244,179,151,133,110,186,152,133,244,192,153,133,134,199,154,133,37,206,155,133,207,212,156,133,133,219,157,133,71,226,158,133,21,233,159,133,239,239,160,133,213,246,161,133,199,253,162,133,197,4,164,133,207,11,165,133,229,18,166,133,7,26,167,133,53,33,168,133,111,40,169,133,181,47,170,133,7,55,171,133,101,62,172,133,206,69,173,133,68,77,174,133,198,84,175,133,83,92,176,133,237,99,177,133,146,107,178,133,67,115,179,133,0,123,180,133,201,130,181,133,158,138,182,133,127,146,183,133,108,154,184,133,101,162,185,133,105,170,186,133,122,178,187,133,150,186,188,133,190,194,189,133,242,202,190,133,50,211,191,133,126,219,192,133,214,227,193,133,57,236,194,133,169,244,195,133,36,253,196,133,171,5,198,133,62,14,199,133,221,22,200,133,135,31,201,133,62,40,202,133,0,49,203,133,206,57,204,133,168,66,205,133,141,75,206,133,127,84,207,133,124,93,208,133,133,102,209,133,154,111,210,133,187,120,211,133,231,129,212,133,31,139,213,133,99,148,214,133,179,157,215,133,15,167,216,133,118,176,217,133,233,185,218,133,104,195,219,133,242,204,220,133,137,214,221,133,43,224,222,133,216,233,223,133,146,243,224,133,87,253,225,133,40,7,227,133,5,17,228,133,237,26,229,133,225,36,230,133,225,46,231,133,237,56,232,133,4,67,233,133,39,77,234,133,86,87,235,133,144,97,236,133,214,107,237,133,40,118,238,133,133,128,239,133,238,138,240,133,99,149,241,133,227,159,242,133,111,170,243,133,7,181,244,133,171,191,245,133,90,202,246,133,20,213,247,133,219,223,248,133,173,234,249,133,138,245,250,133,115,0,252,133,104,11,253,133,105,22,254,133,117,33,255,133,141,44,0,134,176,55,1,134,223,66,2,134,25,78,3,134,95,89,4,134,177,100,5,134,15,112,6,134,119,123,7,134,236,134,8,134,108,146,9,134,248,157,10,134,143,169,11,134,50,181,12,134,224,192,13,134,154,204,14,134,96,216,15,134,49,228,16,134,13,240,17,134,245,251,18,134,233,7,20,134,232,19,21,134,243,31,22,134,9,44,23,134,43,56,24,134,88,68,25,134,145,80,26,134,213,92,27,134,37,105,28,134,129,117,29,134,232,129,30,134,90,142,31,134,216,154,32,134,97,167,33,134,246,179,34,134,150,192,35,134,66,205,36,134,249,217,37,134,188,230,38,134,138,243,39,134,100,0,41,134,73,13,42,134,58,26,43,134,54,39,44,134,61,52,45,134,80,65,46,134,111,78,47,134,153,91,48,134,206,104,49,134,15,118,50,134,91,131,51,134,178,144,52,134,21,158,53,134,131,171,54,134,253,184,55,134,130,198,56,134,19,212,57,134,175,225,58,134,86,239,59,134,9,253,60,134,199,10,62,134,145,24,63,134,102,38,64,134,70,52,65,134,50,66,66,134,41,80,67,134,43,94,68,134,57,108,69,134,82,122,70,134,119,136,71,134,167,150,72,134,226,164,73,134,40,179,74,134,122,193,75,134,216,207,76,134,64,222,77,134,180,236,78,134,51,251,79,134,190,9,81,134,84,24,82,134,245,38,83,134,161,53,84,134,89,68,85,134,28,83,86,134,234,97,87,134,196,112,88,134,169,127,89,134,153,142,90,134,149,157,91,134,156,172,92,134,174,187,93,134,203,202,94,134,244,217,95,134,40,233,96,134,103,248,97,134,177,7,99,134,7,23,100,134,104,38,101,134,212,53,102,134,76,69,103,134,206,84,104,134,92,100,105,134,245,115,106,134,154,131,107,134,73,147,108,134,4,163,109,134,202,178,110,134,155,194,111,134,120,210,112,134,95,226,113,134,82,242,114,134,80,2,116,134,90,18,117,134,110,34,118,134,142,50,119,134,185,66,120,134,239,82,121,134,48,99,122,134,124,115,123,134,212,131,124,134,54,148,125,134,164,164,126,134,29,181,127,134,162,197,128,134,49,214,129,134,203,230,130,134,113,247,131,134,34,8,133,134,222,24,134,134,165,41,135,134,119,58,136,134,85,75,137,134,61,92,138,134,49,109,139,134,47,126,140,134,57,143,141,134,78,160,142,134,110,177,143,134,153,194,144,134,207,211,145,134,17,229,146,134,93,246,147,134,181,7,149,134,23,25,150,134,133,42,151,134,254,59,152,134,130,77,153,134,17,95,154,134,171,112,155,134,80,130,156,134,0,148,157,134,187,165,158,134,129,183,159,134,83,201,160,134,47,219,161,134,22,237,162,134,9,255,163,134,6,17,165,134,15,35,166,134,34,53,167,134,65,71,168,134,106,89,169,134,159,107,170,134,223,125,171,134,41,144,172,134,127,162,173,134,224,180,174,134,75,199,175,134,194,217,176,134,67,236,177,134,208,254,178,134,104,17,180,134,10,36,181,134,184,54,182,134,113,73,183,134,52,92,184,134,3,111,185,134,220,129,186,134,193,148,187,134,176,167,188,134,170,186,189,134,176,205,190,134,192,224,191,134,219,243,192,134,2,7,194,134,51,26,195,134,111,45,196,134,182,64,197,134,8,84,198,134,101,103,199,134,204,122,200,134,63,142,201,134,189,161,202,134,69,181,203,134,217,200,204,134,119,220,205,134,32,240,206,134,212,3,208,134,148,23,209,134,94,43,210,134,50,63,211,134,18,83,212,134,253,102,213,134,242,122,214,134,243,142,215,134,254,162,216,134,20,183,217,134,53,203,218,134,97,223,219,134,152,243,220,134,217,7,222,134,38,28,223,134,125,48,224,134,223,68,225,134].concat([76,89,226,134,196,109,227,134,70,130,228,134,212,150,229,134,108,171,230,134,15,192,231,134,189,212,232,134,118,233,233,134,58,254,234,134,8,19,236,134,226,39,237,134,198,60,238,134,180,81,239,134,174,102,240,134,179,123,241,134,194,144,242,134,220,165,243,134,1,187,244,134,48,208,245,134,107,229,246,134,176,250,247,134,0,16,249,134,90,37,250,134,192,58,251,134,48,80,252,134,171,101,253,134,49,123,254,134,194,144,255,134,93,166,0,135,3,188,1,135,180,209,2,135,111,231,3,135,53,253,4,135,6,19,6,135,226,40,7,135,201,62,8,135,186,84,9,135,182,106,10,135,188,128,11,135,206,150,12,135,234,172,13,135,16,195,14,135,66,217,15,135,126,239,16,135,197,5,18,135,23,28,19,135,115,50,20,135,218,72,21,135,75,95,22,135,200,117,23,135,79,140,24,135,224,162,25,135,125,185,26,135,36,208,27,135,214,230,28,135,146,253,29,135,89,20,31,135,43,43,32,135,7,66,33,135,238,88,34,135,224,111,35,135,220,134,36,135,227,157,37,135,244,180,38,135,17,204,39,135,56,227,40,135,105,250,41,135,165,17,43,135,236,40,44,135,61,64,45,135,153,87,46,135,0,111,47,135,113,134,48,135,237,157,49,135,115,181,50,135,4,205,51,135,160,228,52,135,70,252,53,135,247,19,55,135,178,43,56,135,120,67,57,135,73,91,58,135,36,115,59,135,10,139,60,135,250,162,61,135,245,186,62,135,250,210,63,135,10,235,64,135,37,3,66,135,74,27,67,135,122,51,68,135,180,75,69,135,248,99,70,135,72,124,71,135,162,148,72,135,6,173,73,135,117,197,74,135,238,221,75,135,114,246,76,135,1,15,78,135,154,39,79,135,62,64,80,135,236,88,81,135,164,113,82,135,103,138,83,135,53,163,84,135,13,188,85,135,240,212,86,135,221,237,87,135,213,6,89,135,215,31,90,135,227,56,91,135,250,81,92,135,28,107,93,135,72,132,94,135,127,157,95,135,192,182,96,135,11,208,97,135,97,233,98,135,193,2,100,135,44,28,101,135,162,53,102,135,34,79,103,135,172,104,104,135,64,130,105,135,224,155,106,135,137,181,107,135,61,207,108,135,252,232,109,135,197,2,111,135,152,28,112,135,118,54,113,135,94,80,114,135,81,106,115,135,78,132,116,135,85,158,117,135,103,184,118,135,131,210,119,135,170,236,120,135,219,6,122,135,23,33,123,135,93,59,124,135,173,85,125,135,8,112,126,135,109,138,127,135,220,164,128,135,86,191,129,135,218,217,130,135,105,244,131,135,2,15,133,135,165,41,134,135,83,68,135,135,11,95,136,135,206,121,137,135,154,148,138,135,114,175,139,135,83,202,140,135,63,229,141,135,53,0,143,135,54,27,144,135,65,54,145,135,86,81,146,135,118,108,147,135,160,135,148,135,212,162,149,135,19,190,150,135,92,217,151,135,175,244,152,135,12,16,154,135,116,43,155,135,231,70,156,135,99,98,157,135,234,125,158,135,123,153,159,135,22,181,160,135,188,208,161,135,108,236,162,135,39,8,164,135,235,35,165,135,186,63,166,135,147,91,167,135,119,119,168,135,100,147,169,135,92,175,170,135,95,203,171,135,107,231,172,135,130,3,174,135,163,31,175,135,207,59,176,135,4,88,177,135,68,116,178,135,142,144,179,135,227,172,180,135,65,201,181,135,170,229,182,135,29,2,184,135,155,30,185,135,34,59,186,135,180,87,187,135,80,116,188,135,246,144,189,135,167,173,190,135,97,202,191,135,38,231,192,135,245,3,194,135,207,32,195,135,178,61,196,135,160,90,197,135,152,119,198,135,154,148,199,135,167,177,200,135,189,206,201,135,222,235,202,135,9,9,204,135,62,38,205,135,125,67,206,135,199,96,207,135,27,126,208,135,121,155,209,135,225,184,210,135,83,214,211,135,207,243,212,135,86,17,214,135,230,46,215,135,129,76,216,135,38,106,217,135,213,135,218,135,143,165,219,135,82,195,220,135,32,225,221,135,247,254,222,135,217,28,224,135,197,58,225,135,188,88,226,135,188,118,227,135,198,148,228,135,219,178,229,135,249,208,230,135,34,239,231,135,85,13,233,135,146,43,234,135,217,73,235,135,42,104,236,135,134,134,237,135,235,164,238,135,91,195,239,135,212,225,240,135,88,0,242,135,230,30,243,135,126,61,244,135,32,92,245,135,204,122,246,135,130,153,247,135,66,184,248,135,12,215,249,135,225,245,250,135,191,20,252,135,168,51,253,135,154,82,254,135,151,113,255,135,79,72,0,140,215,215,0,140,100,103,1,140,247,246,1,140,142,134,2,140,43,22,3,140,204,165,3,140,115,53,4,140,30,197,4,140,207,84,5,140,132,228,5,140,63,116,6,140,255,3,7,140,195,147,7,140,141,35,8,140,91,179,8,140,47,67,9,140,8,211,9,140,229,98,10,140,200,242,10,140,176,130,11,140,156,18,12,140,142,162,12,140,132,50,13,140,128,194,13,140,129,82,14,140,134,226,14,140,145,114,15,140,161,2,16,140,181,146,16,140,207,34,17,140,237,178,17,140,17,67,18,140,57,211,18,140,103,99,19,140,153,243,19,140,209,131,20,140,13,20,21,140,79,164,21,140,149,52,22,140,225,196,22,140,49,85,23,140,134,229,23,140,225,117,24,140,64,6,25,140,164,150,25,140,13,39,26,140,123,183,26,140,239,71,27,140,103,216,27,140,228,104,28,140,102,249,28,140,237,137,29,140,121,26,30,140,10,171,30,140,159,59,31,140,58,204,31,140,218,92,32,140,127,237,32,140,40,126,33,140,215,14,34,140,138,159,34,140,67,48,35,140,0,193,35,140,195,81,36,140,138,226,36,140,86,115,37,140,40,4,38,140,254,148,38,140,217,37,39,140,185,182,39,140,158,71,40,140,136,216,40,140,118,105,41,140,106,250,41,140,99,139,42,140,96,28,43,140,99,173,43,140,106,62,44,140,119,207,44,140,136,96,45,140,158,241,45,140,185,130,46,140,217,19,47,140,254,164,47,140,40,54,48,140,87,199,48,140,139,88,49,140,195,233,49,140,1,123,50,140,67,12,51,140,138,157,51,140,215,46,52,140,40,192,52,140,126,81,53,140,217,226,53,140,57,116,54,140,158,5,55,140,7,151,55,140,118,40,56,140,233,185,56,140,97,75,57,140,223,220,57,140,97,110,58,140,232,255,58,140,116,145,59,140,5,35,60,140,154,180,60,140,53,70,61,140,212,215,61,140,121,105,62,140,34,251,62,140,208,140,63,140,131,30,64,140,59,176,64,140,247,65,65,140,185,211,65,140,128,101,66,140,75,247,66,140,27,137,67,140,240,26,68,140,202,172,68,140,169,62,69,140,141,208,69,140,117,98,70,140,99,244,70,140,85,134,71,140,76,24,72,140,72,170,72,140,73,60,73,140,79,206,73,140,89,96,74,140,105,242,74,140,125,132,75,140,150,22,76,140,180,168,76,140,215,58,77,140,255,204,77,140,43,95,78,140,93,241,78,140,147,131,79,140,206,21,80,140,14,168,80,140,83,58,81,140,156,204,81,140,235,94,82,140,62,241,82,140,150,131,83,140,243,21,84,140,85,168,84,140,187,58,85,140,39,205,85,140,151,95,86,140,12,242,86,140,134,132,87,140,5,23,88,140,137,169,88,140,17,60,89,140,158,206,89,140,48,97,90,140,199,243,90,140,99,134,91,140,3,25,92,140,169,171,92,140,83,62,93,140,2,209,93,140,182,99,94,140,110,246,94,140,43,137,95,140,238,27,96,140,181,174,96,140,128,65,97,140,81,212,97,140,39,103,98,140,1,250,98,140,224,140,99,140,196,31,100,140,172,178,100,140,154,69,101,140,140,216,101,140,131,107,102,140,127,254,102,140,127,145,103,140,133,36,104,140,143,183,104,140,158,74,105,140,178,221,105,140,202,112,106,140,231,3,107,140,10,151,107,140,49,42,108,140,92,189,108,140,141,80,109,140,194,227,109,140,252,118,110,140,59,10,111,140,126,157,111,140,199,48,112,140,20,196,112,140,102,87,113,140,188,234,113,140,24,126,114,140,120,17,115,140,221,164,115,140,71,56,116,140,181,203,116,140,41,95,117,140,161,242,117,140,29,134,118,140,159,25,119,140,37,173,119,140,176,64,120,140,64,212,120,140,213,103,121,140,110,251,121,140,12,143,122,140,175,34,123,140,87,182,123,140,3,74,124,140,180,221,124,140,106,113,125,140,36,5,126,140,228,152,126,140,168,44,127,140,113,192,127,140,62,84,128,140,17,232,128,140,232,123,129,140,195,15,130,140,164,163,130,140,137,55,131,140,115,203,131,140,98,95,132,140,85,243,132,140,77,135,133,140,74,27,134,140,76,175,134,140,82,67,135,140,93,215,135,140,109,107,136,140,130,255,136,140,155,147,137,140,185,39,138,140,220,187,138,140,3,80,139,140,47,228,139,140,96,120,140,140,150,12,141,140,208,160,141,140,15,53,142,140,83,201,142,140,155,93,143,140,232,241,143,140,58,134,144,140,145,26,145,140,236,174,145,140,76,67,146,140,176,215,146,140,26,108,147,140,136,0,148,140,251,148,148,140,114,41,149,140,238,189,149,140,111,82,150,140,245,230,150,140,127,123,151,140,14,16,152,140,161,164,152,140,58,57,153,140,215,205,153,140,120,98,154,140,31,247,154,140,202,139,155,140,122,32,156,140,46,181,156,140,231,73,157,140,165,222,157,140,103,115,158,140,47,8,159,140,250,156,159,140,203,49,160,140,160,198,160,140,122,91,161,140,89,240,161,140,60,133,162,140,36,26,163,140,16,175,163,140,1,68,164,140,247,216,164,140,242,109,165,140,241,2,166,140,245,151,166,140,254,44,167,140,11,194,167,140,29,87,168,140,51,236,168,140,78,129,169,140,110,22,170,140,147,171,170,140,188,64,171,140,234,213,171,140,28,107,172,140,83,0,173,140,143,149,173,140,208,42,174,140,21,192,174,140,94,85,175,140,173,234,175,140,0,128,176,140,87,21,177,140,180,170,177,140,21,64,178,140,122,213,178,140,228,106,179,140,83,0,180,140,199,149,180,140,63,43,181,140,188,192,181,140,61,86,182,140,195,235,182,140,78,129,183,140,221,22,184,140,113,172,184,140,10,66,185,140,167,215,185,140,73,109,186,140,239,2,187,140,154,152,187,140,74,46,188,140,254,195,188,140,183,89,189,140,116,239,189,140,55,133,190,140,253,26,191,140,201,176,191,140,153,70,192,140,109,220,192,140,71,114,193,140,36,8,194,140,7,158,194,140,238,51,195,140,218,201,195,140,202,95,196,140,191,245,196,140,184,139,197,140,182,33,198,140,185,183,198,140,192,77,199,140,204,227,199,140,221,121,200,140,242,15,201,140,12,166,201,140,42,60,202,140,77,210,202,140,116,104,203,140,160,254,203,140,209,148,204,140,6,43,205,140,64,193,205,140,127,87,206,140,194,237,206,140,9,132,207,140,85,26,208,140,166,176,208,140,251,70,209,140,85,221,209,140,180,115,210,140,23,10,211,140,127,160,211,140,235,54,212,140,92,205,212,140,209,99,213,140,75,250,213,140,202,144,214,140,77,39,215,140,213,189,215,140,97,84,216,140,242,234,216,140,135,129,217,140,33,24,218,140,192,174,218,140,99,69,219,140,10,220,219,140,183,114,220,140,103,9,221,140,29,160,221,140,215,54,222,140,149,205,222,140,88,100,223,140,32,251,223,140,236,145,224,140,188,40,225,140,146,191,225,140,107,86,226,140,74,237,226,140,45,132,227,140,20,27,228,140,0,178,228,140,241,72,229,140,230,223,229,140,223,118,230,140,222,13,231,140,224,164,231,140,231,59,232,140,243,210,232,140,4,106,233,140,24,1,234,140,50,152,234,140,80,47,235,140,114,198,235,140,153,93,236,140,197,244,236,140,245,139,237,140,41,35,238,140,99,186,238,140,160,81,239,140,226,232,239,140,41,128,240,140,116,23,241,140,196,174,241,140,24,70,242,140,113,221,242,140,207,116,243,140,48,12,244,140,151,163,244,140,2,59,245,140,113,210,245,140,229,105,246,140,93,1,247,140,218,152,247,140,92,48,248,140,226,199,248,140,108,95,249,140,251,246,249,140,143,142,250,140,39,38,251,140,195,189,251,140,100,85,252,140,10,237,252,140,180,132,253,140,98,28,254,140,21,180,254,140,205,75,255,140,137,227,255,140,73,123,0,141,14,19,1,141,216,170,1,141,166,66,2,141,120,218,2,141,79,114,3,141,43,10,4,141,11,162,4,141,239,57,5,141,216,209,5,141,197,105,6,141,183,1,7,141,174,153,7,141,169,49,8,141,168,201,8,141,172,97,9,141,180,249,9,141,193,145,10,141,210,41,11,141,232,193,11,141,2,90,12,141,33,242,12,141,68,138,13,141,108,34,14,141,152,186,14,141,201,82,15,141,254,234,15,141,55,131,16,141,117,27,17,141,184,179,17,141,255,75,18,141,74,228,18,141,154,124,19,141,238,20,20,141,71,173,20,141,165,69,21,141,6,222,21,141,109,118,22,141,215,14,23,141,70,167,23,141,186,63,24,141,50,216,24,141,174,112,25,141,47,9,26,141,181,161,26,141,63,58,27,141,205,210,27,141,96,107,28,141,247,3,29,141,146,156,29,141,50,53,30,141,215,205,30,141,128,102,31,141,45,255,31,141,223,151,32,141,149,48,33,141,80,201,33,141,15,98,34,141,211,250,34,141,155,147,35,141,104,44,36,141,56,197,36,141,14,94,37,141,232,246,37,141,198,143,38,141,169,40,39,141,144,193,39,141,123,90,40,141,107,243,40,141,95,140,41,141,88,37,42,141,85,190,42,141,87,87,43,141,93,240,43,141,104,137,44,141,119,34,45,141,138,187,45,141,162,84,46,141,190,237,46,141,222,134,47,141,3,32,48,141,45,185,48,141,91,82,49,141,141,235,49,141,196,132,50,141,255,29,51,141,62,183,51,141,130,80,52,141,202,233,52,141,23,131,53,141,104,28,54,141,190,181,54,141,23,79,55,141,118,232,55,141,217,129,56,141,64,27,57,141,171,180,57,141,27,78,58,141,143,231,58,141,8,129,59,141,133,26,60,141,7,180,60,141,141,77,61,141,23,231,61,141,166,128,62,141,57,26,63,141,208,179,63,141,108,77,64,141,12,231,64,141,177,128,65,141,90,26,66,141,7,180,66,141,185,77,67,141,111,231,67,141,42,129,68,141,233,26,69,141,172,180,69,141,116,78,70,141,64,232,70,141,17,130,71,141,229,27,72,141,191,181,72,141,156,79,73,141,126,233,73,141,100,131,74,141,79,29,75,141,62,183,75,141,50,81,76,141,42,235,76,141,38,133,77,141,38,31,78,141,43,185,78,141,52,83,79,141,66,237,79,141,84,135,80,141,107,33,81,141,133,187,81,141,164,85,82,141,200,239,82,141,240,137,83,141,28,36,84,141,76,190,84,141,129,88,85,141,186,242,85,141,248,140,86,141,58,39,87,141,128,193,87,141,203,91,88,141,26,246,88,141,109,144,89,141,197,42,90,141,33,197,90,141,129,95,91,141,230,249,91,141,79,148,92,141,189,46,93,141,46,201,93,141,165,99,94,141,31,254,94,141,158,152,95,141,33,51,96,141,168,205,96,141,52,104,97,141,196,2,98,141,89,157,98,141,242,55,99,141,143,210,99,141,48,109,100,141,214,7,101,141,128,162,101,141,47,61,102,141,225,215,102,141,152,114,103,141,84,13,104,141,20,168,104,141,216,66,105,141,160,221,105,141,109,120,106,141,62,19,107,141,19,174,107,141,237,72,108,141,203,227,108,141,173,126,109,141,148,25,110,141,127,180,110,141,110,79,111,141,98,234,111,141,90,133,112,141,86,32,113,141,86,187,113,141,91,86,114,141,100,241,114,141,114,140,115,141,132,39,116,141,154,194,116,141,180,93,117,141,211,248,117,141,246,147,118,141,29,47,119,141,73,202,119,141,120,101,120,141,173,0,121,141,229,155,121,141,34,55,122,141,99,210,122,141,168,109,123,141,242,8,124,141,64,164,124,141,146,63,125,141,233,218,125,141,68,118,126,141,163,17,127,141,6,173,127,141,110,72,128,141,218,227,128,141,74,127,129,141,191,26,130,141,56,182,130,141,181,81,131,141,54,237,131,141,188,136,132,141,70,36,133,141,212,191,133,141,103,91,134,141,253,246,134,141,152,146,135,141,56,46,136,141,220,201,136,141,131,101,137,141,48,1,138,141,224,156,138,141,149,56,139,141,78,212,139,141,11,112,140,141,205,11,141,141,147,167,141,141,93,67,142,141,43,223,142,141,254,122,143,141,213,22,144,141,176,178,144,141,143,78,145,141,115,234,145,141,91,134,146,141,71,34,147,141,55,190,147,141,44,90,148,141,37,246,148,141,34,146,149,141,36,46,150,141,42,202,150,141,52,102,151,141,66,2,152,141,84,158,152,141,107,58,153,141,134,214,153,141,165,114,154,141,201,14,155,141,241,170,155,141,29,71,156,141,77,227,156,141,129,127,157,141,186,27,158,141,247,183,158,141,56,84,159,141,126,240,159,141,199,140,160,141,21,41,161,141,103,197,161,141,190,97,162,141,24,254,162,141,119,154,163,141,218,54,164,141,66,211,164,141,173,111,165,141,29,12,166,141,145,168,166,141,10,69,167,141,134,225,167,141,7,126,168,141,140,26,169,141,21,183,169,141,162,83,170,141,52,240,170,141,202,140,171,141,100,41,172,141,2,198,172,141,165,98,173,141,76,255,173,141,247,155,174,141,166,56,175,141,89,213,175,141,17,114,176,141,205,14,177,141,141,171,177,141,81,72,178,141,26,229,178,141,230,129,179,141,183,30,180,141,140,187,180,141,102,88,181,141,67,245,181,141,37,146,182,141,11,47,183,141,245,203,183,141,227,104,184,141,214,5,185,141,205,162,185,141,200,63,186,141,199,220,186,141,202,121,187,141,210,22,188,141,222,179,188,141,238,80,189,141,2,238,189,141,26,139,190,141,55,40,191,141,88,197,191,141,125,98,192,141,166,255,192,141,211,156,193,141,5,58,194,141,58,215,194,141,116,116,195,141,178,17,196,141,245,174,196,141,59,76,197,141,134,233,197,141,213,134,198,141,40,36,199,141,127,193,199,141,218,94,200,141,58,252,200,141,158,153,201,141,6,55,202,141,114,212,202,141,226,113,203,141,87,15,204,141,207,172,204,141,76,74,205,141,205,231,205,141,82,133,206,141,220,34,207,141,105,192,207,141,251,93,208,141,145,251,208,141,43,153,209,141,201,54,210,141,108,212,210,141,18,114,211,141,189,15,212,141,108,173,212,141,31,75,213,141,214,232,213,141,145,134,214,141,81,36,215,141,21,194,215,141,220,95,216,141,168,253,216,141,121,155,217,141,77,57,218,141,38,215,218,141,2,117,219,141,227,18,220,141,200,176,220,141,177,78,221,141,158,236,221,141,144,138,222,141,133,40,223,141,127,198,223,141,125,100,224,141,127,2,225,141,133,160,225,141,143,62,226,141,158,220,226,141,176,122,227,141,199,24,228,141,226,182,228,141,1,85,229,141,36,243,229,141,76,145,230,141,119,47,231,141,167,205,231,141,218,107,232,141,18,10,233,141,78,168,233,141,142,70,234,141,211,228,234,141,27,131,235,141,104,33,236,141,184,191,236,141,13,94,237,141,102,252,237,141,195,154,238,141,36,57,239,141,138,215,239,141,243,117,240,141,97,20,241,141,211,178,241,141,72,81,242,141,194,239,242,141,64,142,243,141,195,44,244,141,73,203,244,141,211,105,245,141,98,8,246,141,245,166,246,141,139,69,247,141,38,228,247,141,197,130,248,141,105,33,249,141,16,192,249,141,187,94,250,141,107,253,250,141,30,156,251,141,214,58,252,141,146,217,252,141,82,120,253,141,22,23,254,141,222,181,254,141,170,84,255,141,123,243,255,141,79,146,0,142,40,49,1,142,4,208,1,142,229,110,2,142,202,13,3,142,179,172,3,142,160,75,4,142,145,234,4,142,135,137,5,142,128,40,6,142,125,199,6,142,127,102,7,142,133,5,8,142,143,164,8,142,156,67,9,142,174,226,9,142,196,129,10,142,223,32,11,142,253,191,11,142,31,95,12,142,70,254,12,142,112,157,13,142,159,60,14,142,209,219,14,142,8,123,15,142,67,26,16,142,130,185,16,142,197,88,17,142,12,248,17,142,87,151,18,142,166,54,19,142,250,213,19,142,81,117,20,142,173,20,21,142,12,180,21,142,112,83,22,142,216,242,22,142,67,146,23,142,179,49,24,142,39,209,24,142,159,112,25,142,27,16,26,142,156,175,26,142,32,79,27,142,168,238,27,142,52,142,28,142,197,45,29,142,89,205,29,142,242,108,30,142,143,12,31,142,47,172,31,142,212,75,32,142,125,235,32,142,42,139,33,142,219,42,34,142,144,202,34,142,73,106,35,142,6,10,36,142,199,169,36,142,141,73,37,142,86,233,37,142,35,137,38,142,245,40,39,142,202,200,39,142,164,104,40,142,129,8,41,142,99,168,41,142,73,72,42,142,50,232,42,142,32,136,43,142,18,40,44,142,8,200,44,142,2,104,45,142,0,8,46,142,2,168,46,142,8,72,47,142,18,232,47,142,32,136,48,142,50,40,49,142,73,200,49,142,99,104,50,142,129,8,51,142,163,168,51,142,202,72,52,142,244,232,52,142,35,137,53,142,85,41,54,142,140,201,54,142,198,105,55,142,5,10,56,142,72,170,56,142,142,74,57,142,217,234,57,142,40,139,58,142,123,43,59,142,209,203,59,142,44,108,60,142,139,12,61,142,238,172,61,142,85,77,62,142,192,237,62,142,47,142,63,142,162,46,64,142,25,207,64,142,148,111,65,142,19,16,66,142,150,176,66,142,29,81,67,142,168,241,67,142,55,146,68,142,202,50,69,142,97,211,69,142,252,115,70,142,156,20,71,142,63,181,71,142,230,85,72,142,145,246,72,142,64,151,73,142,244,55,74,142,171,216,74,142,102,121,75,142,37,26,76,142,233,186,76,142,176,91,77,142,123,252,77,142,75,157,78,142,30,62,79,142,245,222,79,142,208,127,80,142,176,32,81,142,147,193,81,142,122,98,82,142,102,3,83,142,85,164,83,142,72,69,84,142,64,230,84,142,59,135,85,142,58,40,86,142,61,201,86,142,69,106,87,142,80,11,88,142,95,172,88,142,115,77,89,142,138,238,89,142,165,143,90,142,196,48,91,142,231,209,91,142,15,115,92,142,58,20,93,142,105,181,93,142,156,86,94,142,211,247,94,142,14,153,95,142,78,58,96,142,145,219,96,142,216,124,97,142,35,30,98,142,114,191,98,142,197,96,99,142,28,2,100,142,119,163,100,142,214,68,101,142,57,230,101,142,160,135,102,142,11,41,103,142,121,202,103,142,236,107,104,142,99,13,105,142,222,174,105,142,93,80,106,142,223,241,106,142,102,147,107,142,241,52,108,142,127,214,108,142,18,120,109,142,169,25,110,142,67,187,110,142,226,92,111,142,132,254,111,142,42,160,112,142,213,65,113,142,131,227,113,142,53,133,114,142,236,38,115,142,166,200,115,142,100,106,116,142,38,12,117,142,236,173,117,142,182,79,118,142,132,241,118,142,86,147,119,142,44,53,120,142,6,215,120,142,228,120,121,142,198,26,122,142,172,188,122,142,149,94,123,142,131,0,124,142,117,162,124,142,106,68,125,142,100,230,125,142,97,136,126,142,98,42,127,142,104,204,127,142,113,110,128,142,126,16,129,142,143,178,129,142,164,84,130,142,189,246,130,142,218,152,131,142,251,58,132,142,32,221,132,142,73,127,133,142,118,33,134,142,166,195,134,142,219,101,135,142,20,8,136,142,80,170,136,142,144,76,137,142,213,238,137,142,29,145,138,142,105,51,139,142,185,213,139,142,14,120,140,142,102,26,141,142,193,188,141,142,33,95,142,142,133,1,143,142,237,163,143,142,88,70,144,142,200,232,144,142,60,139,145,142,179,45,146,142,46,208,146,142,174,114,147,142,49,21,148,142,184,183,148,142,67,90,149,142,210,252,149,142,101,159,150,142,251,65,151,142,150,228,151,142,53,135,152,142,215,41,153,142,126,204,153,142,40,111,154,142,214,17,155,142,137,180,155,142,63,87,156,142,249,249,156,142,183,156,157,142,120,63,158,142,62,226,158,142,8,133,159,142,213,39,160,142,167,202,160,142,124,109,161,142,85,16,162,142,51,179,162,142,20,86,163,142,249,248,163,142,226,155,164,142,206,62,165,142,191,225,165,142,180,132,166,142,172,39,167,142,169,202,167,142,169,109,168,142,173,16,169,142,181,179,169,142,193,86,170,142,209,249,170,142,229,156,171,142,252,63,172,142,24,227,172,142,55,134,173,142,91,41,174,142,130,204,174,142,173,111,175,142,220,18,176,142,15,182,176,142,70,89,177,142,129,252,177,142,191,159,178,142,2,67,179,142,72,230,179,142,146,137,180,142,224,44,181,142,50,208,181,142,136,115,182,142,226,22,183,142,63,186,183,142,161,93,184,142,6,1,185,142,112,164,185,142,221,71,186,142,78,235,186,142,195,142,187,142,59,50,188,142,184,213,188,142,57,121,189,142,189,28,190,142,69,192,190,142,209,99,191,142,97,7,192,142,245,170,192,142,141,78,193,142,41,242,193,142,200,149,194,142,108,57,195,142,19,221,195,142,190,128,196,142,109,36,197,142,32,200,197,142,214,107,198,142,145,15,199,142,79,179,199,142,18,87,200,142,216,250,200,142,162,158,201,142,112,66,202,142,65,230,202,142,23,138,203,142,240,45,204,142,206,209,204,142,175,117,205,142,148,25,206,142,125,189,206,142,105,97,207,142,90,5,208,142,78,169,208,142,71,77,209,142,67,241,209,142,67,149,210,142,71,57,211,142,78,221,211,142,90,129,212,142,105,37,213,142,124,201,213,142,147,109,214,142,174,17,215,142,205,181,215,142,240,89,216,142,22,254,216,142,64,162,217,142,111,70,218,142,161,234,218,142,214,142,219,142,16,51,220,142,77,215,220,142,143,123,221,142,212,31,222,142,29,196,222,142,106,104,223,142,187,12,224,142,15,177,224,142,103,85,225,142,196,249,225,142,36,158,226,142,135,66,227,142,239,230,227,142,91,139,228,142,202,47,229,142,61,212,229,142,180,120,230,142,47,29,231,142,174,193,231,142,48,102,232,142,183,10,233,142,65,175,233,142,207,83,234,142,96,248,234,142,246,156,235,142,143,65,236,142,45,230,236,142,206,138,237,142,115,47,238,142,27,212,238,142,200,120,239,142,120,29,240,142,44,194,240,142,228,102,241,142,160,11,242,142,96,176,242,142,35,85,243,142,235,249,243,142,182,158,244,142,133,67,245,142,87,232,245,142,46,141,246,142,8,50,247,142,230,214,247,142,200,123,248,142,174,32,249,142,151,197,249,142,133,106,250,142,118,15,251,142,107,180,251,142,100,89,252,142,96,254,252,142,97,163,253,142,101,72,254,142,109,237,254,142,121,146,255,142,136,55,0,143,156,220,0,143,179,129,1,143,206,38,2,143,237,203,2,143,15,113,3,143,54,22,4,143,96,187,4,143,142,96,5,143,192,5,6,143,245,170,6,143,47,80,7,143,108,245,7,143,173,154,8,143,242,63,9,143,58,229,9,143,134,138,10,143,215,47,11,143,42,213,11,143,130,122,12,143,222,31,13,143,61,197,13,143,160,106,14,143,7,16,15,143,113,181,15,143,224,90,16,143,82,0,17,143,200,165,17,143,66,75,18,143,191,240,18,143,65,150,19,143,198,59,20,143,79,225,20,143,219,134,21,143,108,44,22,143,0,210,22,143,152,119,23,143,52,29,24,143,211,194,24,143,119,104,25,143,30,14,26,143,201,179,26,143,119,89,27,143,42,255,27,143,224,164,28,143,154,74,29,143,88,240,29,143,25,150,30,143,222,59,31,143,168,225,31,143,116,135,32,143,69,45,33,143,25,211,33,143,241,120,34,143,205,30,35,143,173,196,35,143,144,106,36,143,119,16,37,143,98,182,37,143,81,92,38,143,68,2,39,143,58,168,39,143,52,78,40,143,49,244,40,143,51,154,41,143,56,64,42,143,65,230,42,143,78,140,43,143,94,50,44,143,115,216,44,143,139,126,45,143,167,36,46,143,198,202,46,143,233,112,47,143,16,23,48,143,59,189,48,143,106,99,49,143,156,9,50,143,210,175,50,143,12,86,51,143,73,252,51,143,139,162,52,143,208,72,53,143,24,239,53,143,101,149,54,143,181,59,55,143,9,226,55,143,97,136,56,143,188,46,57,143,28,213,57,143,127,123,58,143,229,33,59,143,80,200,59,143,190,110,60,143,48,21,61,143,166,187,61,143,31,98,62,143,156,8,63,143,29,175,63,143,162,85,64,143,42,252,64,143,182,162,65,143,70,73,66,143,217,239,66,143,113,150,67,143,12,61,68,143,170,227,68,143,77,138,69,143,243,48,70,143,157,215,70,143,75,126,71,143,252,36,72,143,177,203,72,143,106,114,73,143,39,25,74,143,231,191,74,143,171,102,75,143,115,13,76,143,62,180,76,143,13,91,77,143,224,1,78,143,183,168,78,143,145,79,79,143,111,246,79,143,81,157,80,143,55,68,81,143,32,235,81,143,13,146,82,143,253,56,83,143,242,223,83,143,234,134,84,143,230,45,85,143,229,212,85,143,232,123,86,143,239,34,87,143,250,201,87,143,8,113,88,143,26,24,89,143,48,191,89,143,74,102,90,143,103,13,91,143,136,180,91,143,172,91,92,143,213,2,93,143,1,170,93,143,48,81,94,143,100,248,94,143,155,159,95,143,214,70,96,143,20,238,96,143,87,149,97,143,157,60,98,143,230,227,98,143,52,139,99,143,133,50,100,143,217,217,100,143,50,129,101,143,142,40,102,143,238,207,102,143,81,119,103,143,185,30,104,143,36,198,104,143,146,109,105,143,5,21,106,143,123,188,106,143,244,99,107,143,114,11,108,143,243,178,108,143,120,90,109,143,0,2,110,143,140,169,110,143,28,81,111,143,176,248,111,143,71,160,112,143,226,71,113,143,128,239,113,143,35,151,114,143,201,62,115,143,114,230,115,143,32,142,116,143,209,53,117,143,133,221,117,143,62,133,118,143,250,44,119,143,186,212,119,143,125,124,120,143,68,36,121,143,15,204,121,143,221,115,122,143,175,27,123,143,133,195,123,143,95,107,124,143,60,19,125,143,29,187,125,143,1,99,126,143,233,10,127,143,213,178,127,143,197,90,128,143,184,2,129,143,175,170,129,143,170,82,130,143,168,250,130,143,170,162,131,143,175,74,132,143,184,242,132,143,197,154,133,143,214,66,134,143,234,234,134,143,2,147,135,143,30,59,136,143,61,227,136,143,96,139,137,143,134,51,138,143,176,219,138,143,222,131,139,143,16,44,140,143,69,212,140,143,126,124,141,143,186,36,142,143,251,204,142,143,62,117,143,143,134,29,144,143,209,197,144,143,32,110,145,143,114,22,146,143,200,190,146,143,34,103,147,143,128,15,148,143,225,183,148,143,69,96,149,143,174,8,150,143,26,177,150,143,138,89,151,143,253,1,152,143,116,170,152,143,238,82,153,143,109,251,153,143,239,163,154,143,116,76,155,143,253,244,155,143,138,157,156,143,27,70,157,143,175,238,157,143,71,151,158,143,226,63,159,143,129,232,159,143,36,145,160,143,202,57,161,143,116,226,161,143,34,139,162,143,211,51,163,143,136,220,163,143,65,133,164,143,253,45,165,143,189,214,165,143,128,127,166,143,71,40,167,143,18,209,167,143,225,121,168,143,179,34,169,143,136,203,169,143,98,116,170,143,62,29,171,143,31,198,171,143,3,111,172,143,235,23,173,143,214,192,173,143,198,105,174,143,184,18,175,143,175,187,175,143,168,100,176,143,166,13,177,143,167,182,177,143,172,95,178,143,181,8,179,143,193,177,179,143,208,90,180,143,228,3,181,143,251,172,181,143,21,86,182,143,51,255,182,143,85,168,183,143,123,81,184,143,164,250,184,143,208,163,185,143,1,77,186,143,53,246,186,143,108,159,187,143,167,72,188,143,230,241,188,143,40,155,189,143,110,68,190,143,184,237,190,143,5,151,191,143,86,64,192,143,170,233,192,143,2,147,193,143,94,60,194,143,189,229,194,143,32,143,195,143,135,56,196,143,241,225,196,143,95,139,197,143,208,52,198,143,69,222,198,143,189,135,199,143,57,49,200,143,185,218,200,143,60,132,201,143,195,45,202,143,78,215,202,143,220,128,203,143,110,42,204,143,3,212,204,143,156,125,205,143,57,39,206,143,217,208,206,143,125,122,207,143,36,36,208,143,207,205,208,143,126,119,209,143,48,33,210,143,229,202,210,143,159,116,211,143,92,30,212,143,28,200,212,143,224,113,213,143,168,27,214,143,115,197,214,143,66,111,215,143,21,25,216,143,235,194,216,143,196,108,217,143,162,22,218,143,131,192,218,143,103,106,219,143,79,20,220,143,59,190,220,143,42,104,221,143,29,18,222,143,19,188,222,143,13,102,223,143,10,16,224,143,12,186,224,143,16,100,225,143,25,14,226,143,36,184,226,143,52,98,227,143,71,12,228,143,94,182,228,143,120,96,229,143,149,10,230,143,183,180,230,143,220,94,231,143,4,9,232,143,48,179,232,143,96,93,233,143,147,7,234,143,202,177,234,143,4,92,235,143,66,6,236,143,132,176,236,143,201,90,237,143,18,5,238,143,94,175,238,143,174,89,239,143,1,4,240,143,88,174,240,143,179,88,241,143,17,3,242,143,114,173,242,143,216,87,243,143,64,2,244,143,173,172,244,143,29,87,245,143,144,1,246,143,7,172,246,143,130,86,247,143,0,1,248,143,130,171,248,143,7,86,249,143,144,0,250,143,28,171,250,143,172,85,251,143,64,0,252,143,215,170,252,143,114,85,253,143,16,0,254,143,178,170,254,143,87,85,255,143,0,0,0,148,86,85,0,148,174,170,0,148,8,0,1,148,99,85,1,148,193,170,1,148,32,0,2,148,129,85,2,148,227,170,2,148,72,0,3,148,174,85,3,148,22,171,3,148,128,0,4,148,235,85,4,148,89,171,4,148,200,0,5,148,56,86,5,148,171,171,5,148,31,1,6,148,150,86,6,148,14,172,6,148,135,1,7,148,3,87,7,148,128,172,7,148,255,1,8,148,128,87,8,148,2,173,8,148,135,2,9,148,13,88,9,148,149,173,9,148,30,3,10,148,170,88,10,148,55,174,10,148,198,3,11,148,87,89,11,148,233,174,11,148,126,4,12,148,20,90,12,148,171,175,12,148,69,5,13,148,224,90,13,148,125,176,13,148,28,6,14,148,189,91,14,148,95,177,14,148,3,7,15,148,169,92,15,148,81,178,15,148,250,7,16,148,166,93,16,148,83,179,16,148,1,9,17,148,178,94,17,148,100,180,17,148,24,10,18,148,206,95,18,148,134,181,18,148,63,11,19,148,250,96,19,148,183,182,19,148,117,12,20,148,54,98,20,148,248,183,20,148,188,13,21,148,129,99,21,148,73,185,21,148,18,15,22,148,221,100,22,148,170,186,22,148,120,16,23,148,72,102,23,148,26,188,23,148,238,17,24,148,195,103,24,148,155,189,24,148,116,19,25,148,78,105,25,148,43,191,25,148,9,21,26,148,233,106,26,148,203,192,26,148,174,22,27,148,148,108,27,148,123,194,27,148,99,24,28,148,78,110,28,148,58,196,28,148,40,26,29,148,24,112,29,148,10,198,29,148,253,27,30,148,242,113,30,148,233,199,30,148,225,29,31,148,220,115,31,148,216,201,31,148,213,31,32,148,213,117,32,148,214,203,32,148,217,33,33,148,222,119,33,148,229,205,33,148,237,35,34,148,247,121,34,148,3,208,34,148,17,38,35,148,32,124,35,148,49,210,35,148,68,40,36,148,88,126,36,148,110,212,36,148,135,42,37,148,160,128,37,148,188,214,37,148,217,44,38,148,248,130,38,148,25,217,38,148,59,47,39,148,96,133,39,148,134,219,39,148,173,49,40,148,215,135,40,148,2,222,40,148,47,52,41,148,94,138,41,148,142,224,41,148,192,54,42,148,244,140,42,148,42,227,42,148,98,57,43,148,155,143,43,148,214,229,43,148,18,60,44,148,81,146,44,148,145,232,44,148,211,62,45,148,22,149,45,148,92,235,45,148,163,65,46,148,236,151,46,148,54,238,46,148,130,68,47,148,209,154,47,148,32,241,47,148,114,71,48,148,197,157,48,148,26,244,48,148,113,74,49,148,201,160,49,148,35,247,49,148,127,77,50,148,221,163,50,148,61,250,50,148,158,80,51,148,1,167,51,148,101,253,51,148,204,83,52,148,52,170,52,148,157,0,53,148,9,87,53,148,118,173,53,148,229,3,54,148,86,90,54,148,201,176,54,148,61,7,55,148,179,93,55,148,42,180,55,148,164,10,56,148,31,97,56,148,156,183,56,148,26,14,57,148,155,100,57,148,29,187,57,148,161,17,58,148,38,104,58,148,173,190,58,148,54,21,59,148,193,107,59,148,77,194,59,148,220,24,60,148,108,111,60,148,253,197,60,148,145,28,61,148,38,115,61,148,188,201,61,148,85,32,62,148,239,118,62,148,139,205,62,148,41,36,63,148,200,122,63,148,105,209,63,148,12,40,64,148,177,126,64,148,87,213,64,148,255,43,65,148,169,130,65,148,85,217,65,148,2,48,66,148,177,134,66,148,97,221,66,148,20,52,67,148,200,138,67,148,126,225,67,148,53,56,68,148,239,142,68,148,170,229,68,148,102,60,69,148,37,147,69,148,229,233,69,148,167,64,70,148,106,151,70,148,48,238,70,148,247,68,71,148,192,155,71,148,138,242,71,148,86,73,72,148,36,160,72,148,244,246,72,148,197,77,73,148,152,164,73,148,109,251,73,148,67,82,74,148,28,169,74,148,246,255,74,148,209,86,75,148,175,173,75,148,142,4,76,148,111,91,76,148,81,178,76,148,53,9,77,148,27,96,77,148,3,183,77,148,236,13,78,148,215,100,78,148,196,187,78,148,179,18,79,148,163,105,79,148,149,192,79,148,136,23,80,148,126,110,80,148,117,197,80,148,110,28,81,148,104,115,81,148,100,202,81,148,98,33,82,148,98,120,82,148,99,207,82,148,102,38,83,148,107,125,83,148,114,212,83,148,122,43,84,148,132,130,84,148,143,217,84,148,156,48,85,148,171,135,85,148,188,222,85,148,207,53,86,148,227,140,86,148,249,227,86,148,16,59,87,148,41,146,87,148,68,233,87,148,97,64,88,148,127,151,88,148,159,238,88,148,193,69,89,148,229,156,89,148,10,244,89,148,49,75,90,148,89,162,90,148,132,249,90,148,176,80,91,148,221,167,91,148,13,255,91,148,62,86,92,148,113,173,92,148,165,4,93,148,220,91,93,148,19,179,93,148,77,10,94,148,136,97,94,148,197,184,94,148,4,16,95,148,69,103,95,148,135,190,95,148,203,21,96,148,16,109,96,148,87,196,96,148,160,27,97,148,235,114,97,148,55,202,97,148,133,33,98,148,213,120,98,148,38,208,98,148,122,39,99,148,206,126,99,148,37,214,99,148,125,45,100,148,215,132,100,148,51,220,100,148,144,51,101,148,239,138,101,148,80,226,101,148,178,57,102,148,22,145,102,148,124,232,102,148,227,63,103,148,77,151,103,148,183,238,103,148,36,70,104,148,146,157,104,148,2,245,104,148,116,76,105,148,231,163,105,148,92,251,105,148,211,82,106,148,75,170,106,148,197,1,107,148,65,89,107,148,191,176,107,148,62,8,108,148,191,95,108,148,65,183,108,148,197,14,109,148,75,102,109,148,211,189,109,148,92,21,110,148,231,108,110,148,116,196,110,148,2,28,111,148,146,115,111,148,36,203,111,148,184,34,112,148,77,122,112,148,228,209,112,148,124,41,113,148,22,129,113,148,178,216,113,148,80,48,114,148,239,135,114,148,144,223,114,148,51,55,115,148,215,142,115,148,125,230,115,148,37,62,116,148,206,149,116,148,121,237,116,148,38,69,117,148,212,156,117,148,132,244,117,148,54,76,118,148,234,163,118,148,159,251,118,148,86,83,119,148,14,171,119,148,200,2,120,148,132,90,120,148,66,178,120,148,1,10,121,148,194,97,121,148,132,185,121,148,73,17,122,148,15,105,122,148,214,192,122,148,160,24,123,148,107,112,123,148,55,200,123,148,6,32,124,148,214,119,124,148,168,207,124,148,123,39,125,148,80,127,125,148,39,215,125,148,255,46,126,148,217,134,126,148,181,222,126,148,147,54,127,148,114,142,127,148,83,230,127,148,53,62,128,148,25,150,128,148,255,237,128,148,231,69,129,148,208,157,129,148,187,245,129,148,167,77,130,148,149,165,130,148,133,253,130,148,119,85,131,148,106,173,131,148,95,5,132,148,86,93,132,148,78,181,132,148,72,13,133,148,68,101,133,148,65,189,133,148,64,21,134,148,64,109,134,148,67,197,134,148,71,29,135,148,76,117,135,148,84,205,135,148,93,37,136,148,103,125,136,148,116,213,136,148,130,45,137,148,145,133,137,148,163,221,137,148,182,53,138,148,202,141,138,148,225,229,138,148,249,61,139,148,18,150,139,148,46,238,139,148,75,70,140,148,105,158,140,148,138,246,140,148,172,78,141,148,207,166,141,148,245,254,141,148,28,87,142,148,68,175,142,148,111,7,143,148,155,95,143,148,200,183,143,148,248,15,144,148,41,104,144,148,91,192,144,148,144,24,145,148,198,112,145,148,253,200,145,148,55,33,146,148,114,121,146,148,174,209,146,148,237,41,147,148,44,130,147,148,110,218,147,148,177,50,148,148,246,138,148,148,61,227,148,148,133,59,149,148,207,147,149,148,27,236,149,148,104,68,150,148,183,156,150,148,8,245,150,148,90,77,151,148,174,165,151,148,3,254,151,148,90,86,152,148,179,174,152,148,14,7,153,148,106,95,153,148,200,183,153,148,39,16,154,148,137,104,154,148,235,192,154,148,80,25,155,148,182,113,155,148,30,202,155,148,135,34,156,148,242,122,156,148,95,211,156,148,206,43,157,148,62,132,157,148,175,220,157,148,35,53,158,148,152,141,158,148,14,230,158,148,135,62,159,148,1,151,159,148,124,239,159,148,250,71,160,148,121,160,160,148,249,248,160,148,124,81,161,148,255,169,161,148,133,2,162,148,12,91,162,148,149,179,162,148,32,12,163,148,172,100,163,148,58,189,163,148,201,21,164,148,90,110,164,148,237,198,164,148,129,31,165,148,24,120,165,148,175,208,165,148,73,41,166,148,228,129,166,148,128,218,166,148,31,51,167,148,191,139,167,148,96,228,167,148,3,61,168,148,168,149,168,148,79,238,168,148,247,70,169,148,161,159,169,148,76,248,169,148,250,80,170,148,168,169,170,148,89,2,171,148,11,91,171,148,191,179,171,148,116,12,172,148,43,101,172,148,228,189,172,148,158,22,173,148,90,111,173,148,24,200,173,148,215,32,174,148,152,121,174,148,90,210,174,148,30,43,175,148,228,131,175,148,172,220,175,148,117,53,176,148,64,142,176,148,12,231,176,148,218,63,177,148,170,152,177,148,123,241,177,148,78,74,178,148,34,163,178,148,249,251,178,148,209,84,179,148,170,173,179,148,133,6,180,148,98,95,180,148,64,184,180,148,32,17,181,148,2,106,181,148,230,194,181,148,203,27,182,148,177,116,182,148,153,205,182,148,131,38,183,148,111,127,183,148,92,216,183,148,75,49,184,148,59,138,184,148,45,227,184,148,33,60,185,148,22,149,185,148,13,238,185,148,6,71,186,148,0,160,186,148,252,248,186,148,250,81,187,148,249,170,187,148,250,3,188,148,252,92,188,148,0,182,188,148,6,15,189,148,13,104,189,148,22,193,189,148,33,26,190,148,45,115,190,148,59,204,190,148,74,37,191,148,91,126,191,148,110,215,191,148,131,48,192,148,153,137,192,148,176,226,192,148,202,59,193,148,228,148,193,148,1,238,193,148,31,71,194,148,63,160,194,148,96,249,194,148,131,82,195,148,168,171,195,148,206,4,196,148,246,93,196,148,32,183,196,148,75,16,197,148,120,105,197,148,167,194,197,148,215,27,198,148,8,117,198,148,60,206,198,148,113,39,199,148,167,128,199,148,223,217,199,148,25,51,200,148,85,140,200,148,146,229,200,148,209,62,201,148,17,152,201,148,83,241,201,148,151,74,202,148,220,163,202,148,35,253,202,148,107,86,203,148,181,175,203,148,1,9,204,148,78,98,204,148,157,187,204,148,238,20,205,148,64,110,205,148,148,199,205,148,233,32,206,148,64,122,206,148,153,211,206,148,243,44,207,148,79,134,207,148,173,223,207,148,12,57,208,148,109,146,208,148,207,235,208,148,51,69,209,148,153,158,209,148,0,248,209,148,105,81,210,148,212,170,210,148,64,4,211,148,174,93,211,148,29,183,211,148,142,16,212,148,1,106,212,148,117,195,212,148,235,28,213,148,98,118,213,148,219,207,213,148,86,41,214,148,210,130,214,148,80,220,214,148,208,53,215,148,81,143,215,148,212,232,215,148,88,66,216,148,222,155,216,148,102,245,216,148,239,78,217,148,122,168,217,148,7,2,218,148,149,91,218,148])
.concat([36,181,218,148,182,14,219,148,73,104,219,148,221,193,219,148,115,27,220,148,11,117,220,148,165,206,220,148,64,40,221,148,220,129,221,148,122,219,221,148,26,53,222,148,188,142,222,148,95,232,222,148,3,66,223,148,170,155,223,148,82,245,223,148,251,78,224,148,166,168,224,148,83,2,225,148,1,92,225,148,177,181,225,148,99,15,226,148,22,105,226,148,203,194,226,148,129,28,227,148,57,118,227,148,243,207,227,148,174,41,228,148,107,131,228,148,41,221,228,148,233,54,229,148,171,144,229,148,110,234,229,148,51,68,230,148,249,157,230,148,193,247,230,148,139,81,231,148,86,171,231,148,35,5,232,148,242,94,232,148,194,184,232,148,147,18,233,148,103,108,233,148,59,198,233,148,18,32,234,148,234,121,234,148,196,211,234,148,159,45,235,148,124,135,235,148,91,225,235,148,59,59,236,148,28,149,236,148,0,239,236,148,229,72,237,148,203,162,237,148,179,252,237,148,157,86,238,148,136,176,238,148,117,10,239,148,100,100,239,148,84,190,239,148,70,24,240,148,57,114,240,148,46,204,240,148,36,38,241,148,29,128,241,148,22,218,241,148,18,52,242,148,15,142,242,148,13,232,242,148,13,66,243,148,15,156,243,148,18,246,243,148,23,80,244,148,30,170,244,148,38,4,245,148,48,94,245,148,59,184,245,148,72,18,246,148,86,108,246,148,102,198,246,148,120,32,247,148,139,122,247,148,160,212,247,148,183,46,248,148,207,136,248,148,233,226,248,148,4,61,249,148,33,151,249,148,63,241,249,148,95,75,250,148,129,165,250,148,164,255,250,148,201,89,251,148,239,179,251,148,23,14,252,148,65,104,252,148,108,194,252,148,153,28,253,148,199,118,253,148,247,208,253,148,41,43,254,148,92,133,254,148,145,223,254,148,199,57,255,148,255,147,255,148,56,238,255,148,116,72,0,149,176,162,0,149,239,252,0,149,46,87,1,149,112,177,1,149,179,11,2,149,248,101,2,149,62,192,2,149,134,26,3,149,207,116,3,149,26,207,3,149,103,41,4,149,181,131,4,149,5,222,4,149,86,56,5,149,169,146,5,149,253,236,5,149,84,71,6,149,171,161,6,149,4,252,6,149,95,86,7,149,188,176,7,149,26,11,8,149,121,101,8,149,219,191,8,149,61,26,9,149,162,116,9,149,8,207,9,149,111,41,10,149,216,131,10,149,67,222,10,149,175,56,11,149,29,147,11,149,141,237,11,149,254,71,12,149,113,162,12,149,229,252,12,149,91,87,13,149,210,177,13,149,75,12,14,149,197,102,14,149,65,193,14,149,191,27,15,149,62,118,15,149,191,208,15,149,66,43,16,149,198,133,16,149,75,224,16,149,211,58,17,149,91,149,17,149,230,239,17,149,114,74,18,149,255,164,18,149,142,255,18,149,31,90,19,149,177,180,19,149,69,15,20,149,218,105,20,149,113,196,20,149,10,31,21,149,164,121,21,149,64,212,21,149,221,46,22,149,124,137,22,149,28,228,22,149,190,62,23,149,98,153,23,149,7,244,23,149,174,78,24,149,86,169,24,149,0,4,25,149,171,94,25,149,88,185,25,149,7,20,26,149,183,110,26,149,105,201,26,149,28,36,27,149,209,126,27,149,135,217,27,149,64,52,28,149,249,142,28,149,180,233,28,149,113,68,29,149,47,159,29,149,239,249,29,149,177,84,30,149,116,175,30,149,56,10,31,149,255,100,31,149,198,191,31,149,144,26,32,149,91,117,32,149,39,208,32,149,245,42,33,149,197,133,33,149,150,224,33,149,105,59,34,149,61,150,34,149,19,241,34,149,234,75,35,149,195,166,35,149,158,1,36,149,122,92,36,149,88,183,36,149,55,18,37,149,24,109,37,149,251,199,37,149,223,34,38,149,196,125,38,149,171,216,38,149,148,51,39,149,126,142,39,149,106,233,39,149,87,68,40,149,70,159,40,149,55,250,40,149,41,85,41,149,29,176,41,149,18,11,42,149,9,102,42,149,1,193,42,149,251,27,43,149,247,118,43,149,244,209,43,149,242,44,44,149,242,135,44,149,244,226,44,149,247,61,45,149,252,152,45,149,3,244,45,149,11,79,46,149,20,170,46,149,31,5,47,149,44,96,47,149,58,187,47,149,74,22,48,149,91,113,48,149,110,204,48,149,131,39,49,149,153,130,49,149,176,221,49,149,202,56,50,149,228,147,50,149,1,239,50,149,30,74,51,149,62,165,51,149,95,0,52,149,129,91,52,149,165,182,52,149,203,17,53,149,242,108,53,149,27,200,53,149,69,35,54,149,113,126,54,149,159,217,54,149,206,52,55,149,254,143,55,149,48,235,55,149,100,70,56,149,153,161,56,149,208,252,56,149,8,88,57,149,66,179,57,149,125,14,58,149,186,105,58,149,249,196,58,149,57,32,59,149,123,123,59,149,190,214,59,149,3,50,60,149,73,141,60,149,145,232,60,149,218,67,61,149,37,159,61,149,114,250,61,149,192,85,62,149,15,177,62,149,97,12,63,149,179,103,63,149,8,195,63,149,94,30,64,149,181,121,64,149,14,213,64,149,104,48,65,149,196,139,65,149,34,231,65,149,129,66,66,149,226,157,66,149,68,249,66,149,168,84,67,149,13,176,67,149,116,11,68,149,221,102,68,149,71,194,68,149,178,29,69,149,31,121,69,149,142,212,69,149,254,47,70,149,112,139,70,149,227,230,70,149,88,66,71,149,206,157,71,149,70,249,71,149,192,84,72,149,59,176,72,149,183,11,73,149,53,103,73,149,181,194,73,149,54,30,74,149,185,121,74,149,61,213,74,149,195,48,75,149,75,140,75,149,212,231,75,149,94,67,76,149,234,158,76,149,120,250,76,149,7,86,77,149,151,177,77,149,42,13,78,149,189,104,78,149,83,196,78,149,233,31,79,149,130,123,79,149,28,215,79,149,183,50,80,149,84,142,80,149,243,233,80,149,147,69,81,149,52,161,81,149,216,252,81,149,124,88,82,149,35,180,82,149,202,15,83,149,116,107,83,149,31,199,83,149,203,34,84,149,121,126,84,149,41,218,84,149,218,53,85,149,140,145,85,149,64,237,85,149,246,72,86,149,173,164,86,149,102,0,87,149,32,92,87,149,220,183,87,149,153,19,88,149,88,111,88,149,25,203,88,149,219,38,89,149,158,130,89,149,99,222,89,149,42,58,90,149,242,149,90,149,187,241,90,149,135,77,91,149,83,169,91,149,34,5,92,149,241,96,92,149,195,188,92,149,150,24,93,149,106,116,93,149,64,208,93,149,23,44,94,149,240,135,94,149,203,227,94,149,167,63,95,149,133,155,95,149,100,247,95,149,68,83,96,149,39,175,96,149,10,11,97,149,240,102,97,149,215,194,97,149,191,30,98,149,169,122,98,149,148,214,98,149,129,50,99,149,112,142,99,149,96,234,99,149,81,70,100,149,68,162,100,149,57,254,100,149,47,90,101,149,39,182,101,149,32,18,102,149,26,110,102,149,23,202,102,149,20,38,103,149,20,130,103,149,21,222,103,149,23,58,104,149,27,150,104,149,32,242,104,149,39,78,105,149,48,170,105,149,58,6,106,149,69,98,106,149,82,190,106,149,97,26,107,149,113,118,107,149,131,210,107,149,150,46,108,149,171,138,108,149,193,230,108,149,217,66,109,149,242,158,109,149,13,251,109,149,41,87,110,149,71,179,110,149,102,15,111,149,135,107,111,149,170,199,111,149,205,35,112,149,243,127,112,149,26,220,112,149,67,56,113,149,109,148,113,149,152,240,113,149,197,76,114,149,244,168,114,149,36,5,115,149,86,97,115,149,137,189,115,149,190,25,116,149,244,117,116,149,44,210,116,149,101,46,117,149,160,138,117,149,220,230,117,149,26,67,118,149,89,159,118,149,154,251,118,149,221,87,119,149,33,180,119,149,102,16,120,149,173,108,120,149,245,200,120,149,63,37,121,149,139,129,121,149,216,221,121,149,39,58,122,149,119,150,122,149,200,242,122,149,28,79,123,149,112,171,123,149,198,7,124,149,30,100,124,149,119,192,124,149,210,28,125,149,46,121,125,149,140,213,125,149,235,49,126,149,76,142,126,149,174,234,126,149,18,71,127,149,120,163,127,149,222,255,127,149,71,92,128,149,177,184,128,149,28,21,129,149,137,113,129,149,247,205,129,149,103,42,130,149,217,134,130,149,76,227,130,149,192,63,131,149,54,156,131,149,174,248,131,149,39,85,132,149,161,177,132,149,30,14,133,149,155,106,133,149,26,199,133,149,155,35,134,149,29,128,134,149,161,220,134,149,38,57,135,149,172,149,135,149,53,242,135,149,190,78,136,149,73,171,136,149,214,7,137,149,100,100,137,149,244,192,137,149,133,29,138,149,24,122,138,149,172,214,138,149,66,51,139,149,217,143,139,149,114,236,139,149,12,73,140,149,168,165,140,149,70,2,141,149,228,94,141,149,133,187,141,149,39,24,142,149,202,116,142,149,111,209,142,149,21,46,143,149,189,138,143,149,102,231,143,149,17,68,144,149,190,160,144,149,108,253,144,149,27,90,145,149,204,182,145,149,126,19,146,149,50,112,146,149,232,204,146,149,159,41,147,149,87,134,147,149,17,227,147,149,205,63,148,149,138,156,148,149,72,249,148,149,8,86,149,149,202,178,149,149,140,15,150,149,81,108,150,149,23,201,150,149,222,37,151,149,167,130,151,149,114,223,151,149,62,60,152,149,12,153,152,149,219,245,152,149,171,82,153,149,125,175,153,149,81,12,154,149,38,105,154,149,252,197,154,149,212,34,155,149,174,127,155,149,137,220,155,149,101,57,156,149,67,150,156,149,35,243,156,149,4,80,157,149,230,172,157,149,203,9,158,149,176,102,158,149,151,195,158,149,128,32,159,149,106,125,159,149,85,218,159,149,66,55,160,149,49,148,160,149,33,241,160,149,18,78,161,149,5,171,161,149,250,7,162,149,240,100,162,149,231,193,162,149,225,30,163,149,219,123,163,149,215,216,163,149,213,53,164,149,212,146,164,149,212,239,164,149,214,76,165,149,218,169,165,149,223,6,166,149,229,99,166,149,237,192,166,149,247,29,167,149,2,123,167,149,14,216,167,149,28,53,168,149,44,146,168,149,60,239,168,149,79,76,169,149,99,169,169,149,120,6,170,149,143,99,170,149,168,192,170,149,194,29,171,149,221,122,171,149,250,215,171,149,24,53,172,149,56,146,172,149,90,239,172,149,125,76,173,149,161,169,173,149,199,6,174,149,238,99,174,149,23,193,174,149,65,30,175,149,109,123,175,149,155,216,175,149,201,53,176,149,250,146,176,149,43,240,176,149,95,77,177,149,148,170,177,149,202,7,178,149,2,101,178,149,59,194,178,149,118,31,179,149,178,124,179,149,240,217,179,149,47,55,180,149,111,148,180,149,178,241,180,149,245,78,181,149,58,172,181,149,129,9,182,149,201,102,182,149,19,196,182,149,94,33,183,149,171,126,183,149,249,219,183,149,72,57,184,149,153,150,184,149,236,243,184,149,64,81,185,149,149,174,185,149,236,11,186,149,69,105,186,149,159,198,186,149,250,35,187,149,87,129,187,149,182,222,187,149,22,60,188,149,119,153,188,149,218,246,188,149,62,84,189,149,164,177,189,149,11,15,190,149,116,108,190,149,223,201,190,149,74,39,191,149,184,132,191,149,38,226,191,149,151,63,192,149,8,157,192,149,124,250,192,149,240,87,193,149,102,181,193,149,222,18,194,149,87,112,194,149,210,205,194,149,78,43,195,149,203,136,195,149,75,230,195,149,203,67,196,149,77,161,196,149,209,254,196,149,86,92,197,149,220,185,197,149,100,23,198,149,237,116,198,149,120,210,198,149,5,48,199,149,147,141,199,149,34,235,199,149,179,72,200,149,69,166,200,149,217,3,201,149,110,97,201,149,5,191,201,149,157,28,202,149,55,122,202,149,210,215,202,149,110,53,203,149,13,147,203,149,172,240,203,149,77,78,204,149,240,171,204,149,148,9,205,149,57,103,205,149,224,196,205,149,137,34,206,149,51,128,206,149,222,221,206,149,139,59,207,149,57,153,207,149,233,246,207,149,154,84,208,149,77,178,208,149,1,16,209,149,183,109,209,149,110,203,209,149,39,41,210,149,225,134,210,149,157,228,210,149,90,66,211,149,24,160,211,149,216,253,211,149,154,91,212,149,93,185,212,149,33,23,213,149,231,116,213,149,175,210,213,149,120,48,214,149,66,142,214,149,14,236,214,149,219,73,215,149,170,167,215,149,122,5,216,149,76,99,216,149,31,193,216,149,244,30,217,149,202,124,217,149,161,218,217,149,122,56,218,149,85,150,218,149,49,244,218,149,14,82,219,149,237,175,219,149,206,13,220,149,175,107,220,149,147,201,220,149,120,39,221,149,94,133,221,149,70,227,221,149,47,65,222,149,26,159,222,149,6,253,222,149,243,90,223,149,226,184,223,149,211,22,224,149,197,116,224,149,184,210,224,149,173,48,225,149,164,142,225,149,156,236,225,149,149,74,226,149,144,168,226,149,140,6,227,149,138,100,227,149,137,194,227,149,138,32,228,149,140,126,228,149,143,220,228,149,148,58,229,149,155,152,229,149,163,246,229,149,172,84,230,149,183,178,230,149,196,16,231,149,210,110,231,149,225,204,231,149,242,42,232,149,4,137,232,149,24,231,232,149,45,69,233,149,67,163,233,149,92,1,234,149,117,95,234,149,144,189,234,149,173,27,235,149,203,121,235,149,234,215,235,149,11,54,236,149,45,148,236,149,81,242,236,149,118,80,237,149,157,174,237,149,197,12,238,149,239,106,238,149,26,201,238,149,70,39,239,149,116,133,239,149,164,227,239,149,213,65,240,149,7,160,240,149,59,254,240,149,112,92,241,149,167,186,241,149,223,24,242,149,25,119,242,149,84,213,242,149,144,51,243,149,207,145,243,149,14,240,243,149,79,78,244,149,145,172,244,149,213,10,245,149,27,105,245,149,97,199,245,149,170,37,246,149,243,131,246,149,63,226,246,149,139,64,247,149,217,158,247,149,41,253,247,149,122,91,248,149,204,185,248,149,32,24,249,149,117,118,249,149,204,212,249,149,36,51,250,149,126,145,250,149,217,239,250,149,54,78,251,149,148,172,251,149,243,10,252,149,84,105,252,149,183,199,252,149,27,38,253,149,128,132,253,149,231,226,253,149,79,65,254,149,185,159,254,149,36,254,254,149,145,92,255,149,255,186,255,149,110,25,0,150,223,119,0,150,81,214,0,150,197,52,1,150,59,147,1,150,177,241,1,150,42,80,2,150,163,174,2,150,30,13,3,150,155,107,3,150,25,202,3,150,152,40,4,150,25,135,4,150,156,229,4,150,31,68,5,150,165,162,5,150,43,1,6,150,180,95,6,150,61,190,6,150,200,28,7,150,85,123,7,150,227,217,7,150,114,56,8,150,3,151,8,150,149,245,8,150,41,84,9,150,190,178,9,150,85,17,10,150,237,111,10,150,134,206,10,150,33,45,11,150,190,139,11,150,92,234,11,150,251,72,12,150,156,167,12,150,62,6,13,150,225,100,13,150,135,195,13,150,45,34,14,150,213,128,14,150,127,223,14,150,41,62,15,150,214,156,15,150,131,251,15,150,51,90,16,150,227,184,16,150,149,23,17,150,73,118,17,150,254,212,17,150,180,51,18,150,108,146,18,150,37,241,18,150,224,79,19,150,156,174,19,150,90,13,20,150,25,108,20,150,218,202,20,150,156,41,21,150,95,136,21,150,36,231,21,150,234,69,22,150,178,164,22,150,123,3,23,150,70,98,23,150,18,193,23,150,223,31,24,150,174,126,24,150,126,221,24,150,80,60,25,150,36,155,25,150,248,249,25,150,206,88,26,150,166,183,26,150,127,22,27,150,89,117,27,150,53,212,27,150,19,51,28,150,241,145,28,150,210,240,28,150,179,79,29,150,150,174,29,150,123,13,30,150,97,108,30,150,72,203,30,150,49,42,31,150,27,137,31,150,7,232,31,150,244,70,32,150,227,165,32,150,211,4,33,150,196,99,33,150,183,194,33,150,171,33,34,150,161,128,34,150,152,223,34,150,145,62,35,150,139,157,35,150,134,252,35,150,131,91,36,150,130,186,36,150,129,25,37,150,131,120,37,150,133,215,37,150,137,54,38,150,143,149,38,150,150,244,38,150,158,83,39,150,168,178,39,150,179,17,40,150,192,112,40,150,206,207,40,150,222,46,41,150,239,141,41,150,1,237,41,150,21,76,42,150,42,171,42,150,65,10,43,150,89,105,43,150,115,200,43,150,142,39,44,150,170,134,44,150,200,229,44,150,232,68,45,150,8,164,45,150,42,3,46,150,78,98,46,150,115,193,46,150,154,32,47,150,193,127,47,150,235,222,47,150,22,62,48,150,66,157,48,150,111,252,48,150,158,91,49,150,207,186,49,150,1,26,50,150,52,121,50,150,105,216,50,150,159,55,51,150,215,150,51,150,16,246,51,150,74,85,52,150,134,180,52,150,195,19,53,150,2,115,53,150,66,210,53,150,132,49,54,150,199,144,54,150,11,240,54,150,81,79,55,150,153,174,55,150,225,13,56,150,43,109,56,150,119,204,56,150,196,43,57,150,18,139,57,150,98,234,57,150,180,73,58,150,6,169,58,150,90,8,59,150,176,103,59,150,7,199,59,150,95,38,60,150,185,133,60,150,20,229,60,150,113,68,61,150,207,163,61,150,47,3,62,150,144,98,62,150,242,193,62,150,86,33,63,150,187,128,63,150,34,224,63,150,138,63,64,150,243,158,64,150,94,254,64,150,203,93,65,150,56,189,65,150,167,28,66,150,24,124,66,150,138,219,66,150,253,58,67,150,114,154,67,150,233,249,67,150,96,89,68,150,217,184,68,150,84,24,69,150,208,119,69,150,77,215,69,150,204,54,70,150,76,150,70,150,206,245,70,150,81,85,71,150,213,180,71,150,91,20,72,150,227,115,72,150,107,211,72,150,246,50,73,150,129,146,73,150,14,242,73,150,156,81,74,150,44,177,74,150,190,16,75,150,80,112,75,150,228,207,75,150,122,47,76,150,17,143,76,150,169,238,76,150,67,78,77,150,222,173,77,150,122,13,78,150,24,109,78,150,184,204,78,150,89,44,79,150,251,139,79,150,158,235,79,150,68,75,80,150,234,170,80,150,146,10,81,150,59,106,81,150,230,201,81,150,146,41,82,150,64,137,82,150,239,232,82,150,159,72,83,150,81,168,83,150,4,8,84,150,185,103,84,150,111,199,84,150,38,39,85,150,223,134,85,150,153,230,85,150,85,70,86,150,18,166,86,150,208,5,87,150,144,101,87,150,82,197,87,150,20,37,88,150,217,132,88,150,158,228,88,150,101,68,89,150,46,164,89,150,247,3,90,150,195,99,90,150,143,195,90,150,93,35,91,150,45,131,91,150,254,226,91,150,208,66,92,150,163,162,92,150,121,2,93,150,79,98,93,150,39,194,93,150,0,34,94,150,219,129,94,150,183,225,94,150,149,65,95,150,116,161,95,150,84,1,96,150,54,97,96,150,25,193,96,150,253,32,97,150,227,128,97,150,203,224,97,150,180,64,98,150,158,160,98,150,137,0,99,150,119,96,99,150,101,192,99,150,85,32,100,150,70,128,100,150,57,224,100,150,45,64,101,150,34,160,101,150,25,0,102,150,17,96,102,150,11,192,102,150,6,32,103,150,3,128,103,150,0,224,103,150,0,64,104,150,0,160,104,150,3,0,105,150,6,96,105,150,11,192,105,150,17,32,106,150,25,128,106,150,34,224,106,150,45,64,107,150,57,160,107,150,70,0,108,150,85,96,108,150,101,192,108,150,118,32,109,150,137,128,109,150,158,224,109,150,179,64,110,150,203,160,110,150,227,0,111,150,253,96,111,150,24,193,111,150,53,33,112,150,83,129,112,150,115,225,112,150,148,65,113,150,182,161,113,150,218,1,114,150,255,97,114,150,38,194,114,150,78,34,115,150,119,130,115,150,162,226,115,150,206,66,116,150,252,162,116,150,43,3,117,150,91,99,117,150,141,195,117,150,192,35,118,150,244,131,118,150,42,228,118,150,98,68,119,150,155,164,119,150,213,4,120,150,16,101,120,150,77,197,120,150,140,37,121,150,203,133,121,150,12,230,121,150,79,70,122,150,147,166,122,150,216,6,123,150,31,103,123,150,103,199,123,150,177,39,124,150,252,135,124,150,72,232,124,150,150,72,125,150,229,168,125,150,53,9,126,150,135,105,126,150,218,201,126,150,47,42,127,150,133,138,127,150,221,234,127,150,54,75,128,150,144,171,128,150,235,11,129,150,73,108,129,150,167,204,129,150,7,45,130,150,104,141,130,150,203,237,130,150,47,78,131,150,148,174,131,150,251,14,132,150,99,111,132,150,205,207,132,150,56,48,133,150,164,144,133,150,18,241,133,150,129,81,134,150,242,177,134,150,100,18,135,150,215,114,135,150,76,211,135,150,194,51,136,150,57,148,136,150,178,244,136,150,44,85,137,150,168,181,137,150,37,22,138,150,164,118,138,150,36,215,138,150,165,55,139,150,39,152,139,150,172,248,139,150,49,89,140,150,184,185,140,150,64,26,141,150,202,122,141,150,84,219,141,150,225,59,142,150,111,156,142,150,254,252,142,150,142,93,143,150,32,190,143,150,180,30,144,150,72,127,144,150,222,223,144,150,118,64,145,150,15,161,145,150,169,1,146,150,69,98,146,150,226,194,146,150,128,35,147,150,32,132,147,150,193,228,147,150,99,69,148,150,7,166,148,150,173,6,149,150,83,103,149,150,252,199,149,150,165,40,150,150,80,137,150,150,252,233,150,150,170,74,151,150,89,171,151,150,9,12,152,150,187,108,152,150,110,205,152,150,35,46,153,150,217,142,153,150,144,239,153,150,73,80,154,150,3,177,154,150,191,17,155,150,123,114,155,150,58,211,155,150,249,51,156,150,186,148,156,150,125,245,156,150,65,86,157,150,6,183,157,150,204,23,158,150,148,120,158,150,94,217,158,150,40,58,159,150,244,154,159,150,194,251,159,150,145,92,160,150,97,189,160,150,50,30,161,150,5,127,161,150,218,223,161,150,176,64,162,150,135,161,162,150,95,2,163,150,57,99,163,150,20,196,163,150,241,36,164,150,207,133,164,150,174,230,164,150,143,71,165,150,113,168,165,150,85,9,166,150,58,106,166,150,32,203,166,150,8,44,167,150,241,140,167,150,219,237,167,150,199,78,168,150,180,175,168,150,163,16,169,150,147,113,169,150,132,210,169,150,119,51,170,150,107,148,170,150,97,245,170,150,87,86,171,150,80,183,171,150,73,24,172,150,68,121,172,150,65,218,172,150,62,59,173,150,61,156,173,150,62,253,173,150,64,94,174,150,67,191,174,150,71,32,175,150,77,129,175,150,85,226,175,150,94,67,176,150,104,164,176,150,115,5,177,150,128,102,177,150,142,199,177,150,158,40,178,150,175,137,178,150,193,234,178,150,213,75,179,150,234,172,179,150,0,14,180,150,24,111,180,150,49,208,180,150,76,49,181,150,104,146,181,150,133,243,181,150,164,84,182,150,196,181,182,150,230,22,183,150,8,120,183,150,45,217,183,150,82,58,184,150,121,155,184,150,161,252,184,150,203,93,185,150,246,190,185,150,35,32,186,150,80,129,186,150,128,226,186,150,176,67,187,150,226,164,187,150,21,6,188,150,74,103,188,150,128,200,188,150,183,41,189,150,240,138,189,150,42,236,189,150,102,77,190,150,163,174,190,150,225,15,191,150,32,113,191,150,97,210,191,150,164,51,192,150,231,148,192,150,44,246,192,150,115,87,193,150,187,184,193,150,4,26,194,150,78,123,194,150,154,220,194,150,232,61,195,150,54,159,195,150,134,0,196,150,216,97,196,150,42,195,196,150,127,36,197,150,212,133,197,150,43,231,197,150,131,72,198,150,221,169,198,150,56,11,199,150,148,108,199,150,242,205,199,150,81,47,200,150,177,144,200,150,19,242,200,150,118,83,201,150,218,180,201,150,64,22,202,150,168,119,202,150,16,217,202,150,122,58,203,150,229,155,203,150,82,253,203,150,192,94,204,150,48,192,204,150,160,33,205,150,19,131,205,150,134,228,205,150,251,69,206,150,113,167,206,150,233,8,207,150,98,106,207,150,220,203,207,150,88,45,208,150,213,142,208,150,83,240,208,150,211,81,209,150,84,179,209,150,215,20,210,150,90,118,210,150,224,215,210,150,102,57,211,150,238,154,211,150,119,252,211,150,2,94,212,150,142,191,212,150,28,33,213,150,170,130,213,150,58,228,213,150,204,69,214,150,95,167,214,150,243,8,215,150,136,106,215,150,31,204,215,150,184,45,216,150,81,143,216,150,236,240,216,150,136,82,217,150,38,180,217,150,197,21,218,150,102,119,218,150,7,217,218,150,170,58,219,150,79,156,219,150,245,253,219,150,156,95,220,150,69,193,220,150,238,34,221,150,154,132,221,150,70,230,221,150,244,71,222,150,164,169,222,150,84,11,223,150,6,109,223,150,186,206,223,150,111,48,224,150,37,146,224,150,220,243,224,150,149,85,225,150,79,183,225,150,11,25,226,150,200,122,226,150,134,220,226,150,70,62,227,150,7,160,227,150,201,1,228,150,141,99,228,150,82,197,228,150,24,39,229,150,224,136,229,150,169,234,229,150,115,76,230,150,63,174,230,150,12,16,231,150,219,113,231,150,171,211,231,150,124,53,232,150,78,151,232,150,34,249,232,150,248,90,233,150,206,188,233,150,166,30,234,150,127,128,234,150,90,226,234,150,54,68,235,150,20,166,235,150,242,7,236,150,210,105,236,150,180,203,236,150,151,45,237,150,123,143,237,150,96,241,237,150,71,83,238,150,47,181,238,150,25,23,239,150,4,121,239,150,240,218,239,150,222,60,240,150,204,158,240,150,189,0,241,150,174,98,241,150,161,196,241,150,150,38,242,150,139,136,242,150,130,234,242,150,123,76,243,150,117,174,243,150,112,16,244,150,108,114,244,150,106,212,244,150,105,54,245,150,105,152,245,150,107,250,245,150,110,92,246,150,115,190,246,150,121,32,247,150,128,130,247,150,137,228,247,150,147,70,248,150,158,168,248,150,170,10,249,150,184,108,249,150,200,206,249,150,216,48,250,150,234,146,250,150,254,244,250,150,18,87,251,150,40,185,251,150,64,27,252,150,88,125,252,150,114,223,252,150,142,65,253,150,171,163,253,150,201,5,254,150,232,103,254,150,9,202,254,150,43,44,255,150,79,142,255,150,115,240,255,150,154,82,0,151,193,180,0,151,234,22,1,151,20,121,1,151,64,219,1,151,108,61,2,151,155,159,2,151,202,1,3,151,251,99,3,151,45,198,3,151,97,40,4,151,150,138,4,151,204,236,4,151,4,79,5,151,61,177,5,151,119,19,6,151,179,117,6,151,240,215,6,151,46,58,7,151,110,156,7,151,175,254,7,151,241,96,8,151,53,195,8,151,122,37,9,151,192,135,9,151,8,234,9,151,81,76,10,151,155,174,10,151,231,16,11,151,52,115,11,151,131,213,11,151,210,55,12,151,35,154,12,151,118,252,12,151,202,94,13,151,31,193,13,151,117,35,14,151,205,133,14,151,38,232,14,151,128,74,15,151,220,172,15,151,57,15,16,151,152,113,16,151,248,211,16,151,89,54,17,151,187,152,17,151,31,251,17,151,132,93,18,151,235,191,18,151,83,34,19,151,188,132,19,151,38,231,19,151,146,73,20,151,255,171,20,151,110,14,21,151,222,112,21,151,79,211,21,151,193,53,22,151,53,152,22,151,170,250,22,151,33,93,23,151,153,191,23,151,18,34,24,151,141,132,24,151,9,231,24,151,134,73,25,151,4,172,25,151,132,14,26,151,5,113,26,151,136,211,26,151,12,54,27,151,145,152,27,151,24,251,27,151,159,93,28,151,41,192,28,151,179,34,29,151,63,133,29,151,204,231,29,151,91,74,30,151,235,172,30,151,124,15,31,151,14,114,31,151,162,212,31,151,55,55,32,151,206,153,32,151,102,252,32,151,255,94,33,151,154,193,33,151,54,36,34,151,211,134,34,151,113,233,34,151,17,76,35,151,178,174,35,151,85,17,36,151,249,115,36,151,158,214,36,151,68,57,37,151,236,155,37,151,149,254,37,151,64,97,38,151,236,195,38,151,153,38,39,151,71,137,39,151,247,235,39,151,168,78,40,151,91,177,40,151,15,20,41,151,196,118,41,151,122,217,41,151,50,60,42,151,235,158,42,151,166,1,43,151,97,100,43,151,30,199,43,151,221,41,44,151,157,140,44,151,94,239,44,151,32,82,45,151,228,180,45,151,169,23,46,151,111,122,46,151,55,221,46,151,0,64,47,151,202,162,47,151,150,5,48,151,99,104,48,151,50,203,48,151,1,46,49,151,210,144,49,151,165,243,49,151,120,86,50,151,77,185,50,151,35,28,51,151,251,126,51,151,212,225,51,151,174,68,52,151,138,167,52,151,103,10,53,151,69,109,53,151,37,208,53,151,6,51,54,151,232,149,54,151,203,248,54,151,176,91,55,151,150,190,55,151,126,33,56,151,103,132,56,151,81,231,56,151,61,74,57,151,41,173,57,151,23,16,58,151,7,115,58,151,248,213,58,151,234,56,59,151,221,155,59,151,210,254,59,151,200,97,60,151,191,196,60,151,184,39,61,151,178,138,61,151,174,237,61,151,170,80,62,151,168,179,62,151,168,22,63,151,168,121,63,151,170,220,63,151,173,63,64,151,178,162,64,151,184,5,65,151,191,104,65,151,200,203,65,151,210,46,66,151,221,145,66,151,233,244,66,151,247,87,67,151,6,187,67,151,23,30,68,151,41,129,68,151,60,228,68,151,80,71,69,151,102,170,69,151,125,13,70,151,149,112,70,151,175,211,70,151,202,54,71,151,231,153,71,151,4,253,71,151,35,96,72,151,68,195,72,151,101,38,73,151,136,137,73,151,172,236,73,151,210,79,74,151,249,178,74,151,33,22,75,151,75,121,75,151,117,220,75,151,161,63,76,151,207,162,76,151,254,5,77,151,46,105,77,151,95,204,77,151,146,47,78,151,198,146,78,151,251,245,78,151,50,89,79,151,106,188,79,151,163,31,80,151,222,130,80,151,26,230,80,151,87,73,81,151,150,172,81,151,214,15,82,151,23,115,82,151,89,214,82,151,157,57,83,151,226,156,83,151,41,0,84,151,113,99,84,151,186,198,84,151,4,42,85,151,80,141,85,151,157,240,85,151,235,83,86,151,59,183,86,151,140,26,87,151,222,125,87,151,49,225,87,151,134,68,88,151,221,167,88,151,52,11,89,151,141,110,89,151,231,209,89,151,66,53,90,151,159,152,90,151,253,251,90,151,93,95,91,151,189,194,91,151,31,38,92,151,131,137,92,151,231,236,92,151,77,80,93,151,181,179,93,151,29,23,94,151,135,122,94,151,242,221,94,151,95,65,95,151,204,164,95,151,59,8,96,151,172,107,96,151,30,207,96,151,145,50,97,151,5,150,97,151,123,249,97,151,242,92,98,151,106,192,98,151,227,35,99,151,94,135,99,151,219,234,99,151,88,78,100,151,215,177,100,151,87,21,101,151,216,120,101,151,91,220,101,151,223,63,102,151,100,163,102,151,235,6,103,151,115,106,103,151,252,205,103,151,135,49,104,151,19,149,104,151,160,248,104,151,46,92,105,151,190,191,105,151,79,35,106,151,226,134,106,151,117,234,106,151,10,78,107,151,161,177,107,151,56,21,108,151,209,120,108,151,108,220,108,151,7,64,109,151,164,163,109,151,66,7,110,151,226,106,110,151,130,206,110,151,36,50,111,151,200,149,111,151,108,249,111,151,18,93,112,151,186,192,112,151,98,36,113,151,12,136,113,151,183,235,113,151,100,79,114,151,18,179,114,151,193,22,115,151,113,122,115,151,35,222,115,151,214,65,116,151,138,165,116,151,64,9,117,151,247,108,117,151,175,208,117,151,104,52,118,151,35,152,118,151,223,251,118,151,157,95,119,151,92,195,119,151,28,39,120,151,221,138,120,151,159,238,120,151,99,82,121,151,41,182,121,151,239,25,122,151,183,125,122,151,128,225,122,151,75,69,123,151,22,169,123,151,227,12,124,151,178,112,124,151,129,212,124,151,82,56,125,151,36,156,125,151,248,255,125,151,205,99,126,151,163,199,126,151,122,43,127,151,83,143,127,151,45,243,127,151,8,87,128,151,229,186,128,151,195,30,129,151,162,130,129,151,131,230,129,151,100,74,130,151,71,174,130,151,44,18,131,151,18,118,131,151,249,217,131,151,225,61,132,151,202,161,132,151,181,5,133,151,162,105,133,151,143,205,133,151,126,49,134,151,110,149,134,151,95,249,134,151,82,93,135,151,70,193,135,151,59,37,136,151,50,137,136,151,42,237,136,151,35,81,137,151,29,181,137,151,25,25,138,151,22,125,138,151,20,225,138,151,20,69,139,151,21,169,139,151,23,13,140,151,26,113,140,151,31,213,140,151,37,57,141,151,45,157,141,151,53,1,142,151,63,101,142,151,75,201,142,151,87,45,143,151,101,145,143,151,116,245,143,151,133,89,144,151,150,189,144,151,169,33,145,151,190,133,145,151,211,233,145,151,234,77,146,151,2,178,146,151,28,22,147,151,55,122,147,151,83,222,147,151,112,66,148,151,143,166,148,151,175,10,149,151,208,110,149,151,242,210,149,151,22,55,150,151,59,155,150,151,98,255,150,151,137,99,151,151,178,199,151,151,221,43,152,151,8,144,152,151,53,244,152,151,99,88,153,151,146,188,153,151,195,32,154,151,245,132,154,151,41,233,154,151,93,77,155,151,147,177,155,151,202,21,156,151,3,122,156,151,60,222,156,151,119,66,157,151,180,166,157,151,241,10,158,151,48,111,158,151,112,211,158,151,178,55,159,151,245,155,159,151,57,0,160,151,126,100,160,151,197,200,160,151,12,45,161,151,86,145,161,151,160,245,161,151,236,89,162,151,57,190,162,151,135,34,163,151,215,134,163,151,40,235,163,151,122,79,164,151,206,179,164,151,34,24,165,151,120,124,165,151,208,224,165,151,40,69,166,151,130,169,166,151,221,13,167,151,58,114,167,151,152,214,167,151,247,58,168,151,87,159,168,151,185,3,169,151,28,104,169,151,128,204,169,151,229,48,170,151,76,149,170,151,180,249,170,151,30,94,171,151,136,194,171,151,244,38,172,151,97,139,172,151,208,239,172,151,63,84,173,151,176,184,173,151,35,29,174,151,150,129,174,151,11,230,174,151,129,74,175,151,249,174,175,151,114,19,176,151,236,119,176,151,103,220,176,151,228,64,177,151,97,165,177,151,225,9,178,151,97,110,178,151,227,210,178,151,102,55,179,151,234,155,179,151,111,0,180,151,246,100,180,151,126,201,180,151,8,46,181,151,146,146,181,151,30,247,181,151,172,91,182,151,58,192,182,151,202,36,183,151,91,137,183,151,237,237,183,151,129,82,184,151,22,183,184,151,172,27,185,151,68,128,185,151,220,228,185,151,118,73,186,151,18,174,186,151,174,18,187,151,76,119,187,151,235,219,187,151,140,64,188,151,45,165,188,151,208,9,189,151,117,110,189,151,26,211,189,151,193,55,190,151,105,156,190,151,19,1,191,151,189,101,191,151,105,202,191,151,22,47,192,151,197,147,192,151,117,248,192,151,38,93,193,151,216,193,193,151,139,38,194,151,64,139,194,151,246,239,194,151,174,84,195,151,103,185,195,151,33,30,196,151,220,130,196,151,152,231,196,151,86,76,197,151,21,177,197,151,214,21,198,151,151,122,198,151,90,223,198,151,30,68,199,151,228,168,199,151,170,13,200,151,114,114,200,151,60,215,200,151,6,60,201,151,210,160,201,151,159,5,202,151,109,106,202,151,61,207,202,151,14,52,203,151,224,152,203,151,180,253,203,151,136,98,204,151,94,199,204,151,54,44,205,151,14,145,205,151,232,245,205,151,195,90,206,151,160,191,206,151,125,36,207,151,92,137,207,151,60,238,207,151,30,83,208,151,1,184,208,151,229,28,209,151,202,129,209,151,176,230,209,151,152,75,210,151,129,176,210,151,108,21,211,151,87,122,211,151,68,223,211,151,50,68,212,151,34,169,212,151,19,14,213,151,5,115,213,151,248,215,213,151,236,60,214,151,226,161,214,151,217,6,215,151,210,107,215,151,203,208,215,151,198,53,216,151,194,154,216,151,192,255,216,151,190,100,217,151,190,201,217,151,191,46,218,151,194,147,218,151,198,248,218,151,203,93,219,151,209,194,219,151,217,39,220,151,225,140,220,151,236,241,220,151,247,86,221,151,4,188,221,151,17,33,222,151,33,134,222,151,49,235,222,151,67,80,223,151,86,181,223,151,106,26,224,151,128,127,224,151,150,228,224,151,174,73,225,151,200,174,225,151,226,19,226,151,254,120,226,151,27,222,226,151,58,67,227,151,89,168,227,151,122,13,228,151,156,114,228,151,192,215,228,151,228,60,229,151,10,162,229,151,50,7,230,151,90,108,230,151,132,209,230,151,175,54,231,151,219,155,231,151,9,1,232,151,56,102,232,151,104,203,232,151,153,48,233,151,204,149,233,151,0,251,233,151,53,96,234,151,107,197,234,151,163,42,235,151,220,143,235,151,22,245,235,151,81,90,236,151,142,191,236,151,204,36,237,151,11,138,237,151,76,239,237,151,142,84,238,151,209,185,238,151,21,31,239,151,91,132,239,151,161,233,239,151,233,78,240,151,51,180,240,151,125,25,241,151,201,126,241,151,22,228,241,151,101,73,242,151,181,174,242,151,5,20,243,151,88,121,243,151,171,222,243,151,0,68,244,151,86,169,244,151,173,14,245,151,5,116,245,151,95,217,245,151,186,62,246,151,22,164,246,151,116,9,247,151,211,110,247,151,51,212,247,151,148,57,248,151,247,158,248,151,90,4,249,151,192,105,249,151,38,207,249,151,142,52,250,151,246,153,250,151,96,255,250,151,204,100,251,151,56,202,251,151,166,47,252,151,22,149,252,151,134,250,252,151,248,95,253,151,107,197,253,151,223,42,254,151,84,144,254,151,203,245,254,151,67,91,255,151,188,192,255,151,27,19,0,156,217,69,0,156,151,120,0,156,87,171,0,156,22,222,0,156,215,16,1,156,152,67,1,156,89,118,1,156,28,169,1,156,223,219,1,156,162,14,2,156,102,65,2,156,43,116,2,156,240,166,2,156,182,217,2,156,125,12,3,156,68,63,3,156,12,114,3,156,213,164,3,156,158,215,3,156,104,10,4,156,50,61,4,156,253,111,4,156,201,162,4,156,149,213,4,156,98,8,5,156,48,59,5,156,254,109,5,156,205,160,5,156,156,211,5,156,108,6,6,156,61,57,6,156,14,108,6,156,224,158,6,156,179,209,6,156,134,4,7,156,90,55,7,156,46,106,7,156,3,157,7,156,217,207,7,156,175,2,8,156,134,53,8,156,94,104,8,156,54,155,8,156,15,206,8,156,232,0,9,156,194,51,9,156,157,102,9,156,120,153,9,156,84,204,9,156,49,255,9,156,14,50,10,156,236,100,10,156,203,151,10,156,170,202,10,156,137,253,10,156,106,48,11,156,75,99,11,156,44,150,11,156,14,201,11,156,241,251,11,156,213,46,12,156,185,97,12,156,158,148,12,156,131,199,12,156,105,250,12,156,79,45,13,156,55,96,13,156,30,147,13,156,7,198,13,156,240,248,13,156,218,43,14,156,196,94,14,156,175,145,14,156,155,196,14,156,135,247,14,156,116,42,15,156,97,93,15,156,79,144,15,156,62,195,15,156,45,246,15,156,29,41,16,156,14,92,16,156,255,142,16,156,241,193,16,156,227,244,16,156,214,39,17,156,202,90,17,156,190,141,17,156,179,192,17,156,169,243,17,156,159,38,18,156,150,89,18,156,141,140,18,156,133,191,18,156,126,242,18,156,119,37,19,156,113,88,19,156,108,139,19,156,103,190,19,156,99,241,19,156,95,36,20,156,92,87,20,156,90,138,20,156,88,189,20,156,87,240,20,156,86,35,21,156,87,86,21,156,87,137,21,156,89,188,21,156,91,239,21,156,93,34,22,156,97,85,22,156,100,136,22,156,105,187,22,156,110,238,22,156,116,33,23,156,122,84,23,156,129,135,23,156,137,186,23,156,145,237,23,156,154,32,24,156,163,83,24,156,173,134,24,156,184,185,24,156,195,236,24,156,207,31,25,156,220,82,25,156,233,133,25,156,247,184,25,156,5,236,25,156,21,31,26,156,36,82,26,156,52,133,26,156,69,184,26,156,87,235,26,156,105,30,27,156,124,81,27,156,143,132,27,156,163,183,27,156,184,234,27,156,205,29,28,156,227,80,28,156,250,131,28,156,17,183,28,156,40,234,28,156,65,29,29,156,90,80,29,156,115,131,29,156,142,182,29,156,168,233,29,156,196,28,30,156,224,79,30,156,253,130,30,156,26,182,30,156,56,233,30,156,87,28,31,156,118,79,31,156,150,130,31,156,182,181,31,156,215,232,31,156,249,27,32,156,27,79,32,156,62,130,32,156,97,181,32,156,133,232,32,156,170,27,33,156,208,78,33,156,246,129,33,156,28,181,33,156,67,232,33,156,107,27,34,156,148,78,34,156,189,129,34,156,230,180,34,156,17,232,34,156,60,27,35,156,103,78,35,156,147,129,35,156,192,180,35,156,238,231,35,156,28,27,36,156,74,78,36,156,121,129,36,156,169,180,36,156,218,231,36,156,11,27,37,156,61,78,37,156,111,129,37,156,162,180,37,156,214,231,37,156,10,27,38,156,63,78,38,156,116,129,38,156,170,180,38,156,225,231,38,156,24,27,39,156,80,78,39,156,136,129,39,156,194,180,39,156,251,231,39,156,54,27,40,156,113,78,40,156,172,129,40,156,232,180,40,156,37,232,40,156,99,27,41,156,161,78,41,156,223,129,41,156,31,181,41,156,95,232,41,156,159,27,42,156,224,78,42,156,34,130,42,156,100,181,42,156,167,232,42,156,235,27,43,156,47,79,43,156,116,130,43,156,186,181,43,156,0,233,43,156,70,28,44,156,142,79,44,156,214,130,44,156,30,182,44,156,103,233,44,156,177,28,45,156,251,79,45,156,70,131,45,156,146,182,45,156,222,233,45,156,43,29,46,156,120,80,46,156,198,131,46,156,21,183,46,156,100,234,46,156,180,29,47,156,5,81,47,156,86,132,47,156,168,183,47,156,250,234,47,156,77,30,48,156,161,81,48,156,245,132,48,156,74,184,48,156,159,235,48,156,245,30,49,156,76,82,49,156,163,133,49,156,251,184,49,156,84,236,49,156,173,31,50,156,6,83,50,156,97,134,50,156,188,185,50,156,23,237,50,156,116,32,51,156,208,83,51,156,46,135,51,156,140,186,51,156,234,237,51,156,74,33,52,156,170,84,52,156,10,136,52,156,107,187,52,156,205,238,52,156,47,34,53,156,146,85,53,156,246,136,53,156,90,188,53,156,191,239,53,156,36,35,54,156,138,86,54,156,241,137,54,156,88,189,54,156,192,240,54,156,40,36,55,156,145,87,55,156,251,138,55,156,101,190,55,156,208,241,55,156,60,37,56,156,168,88,56,156,20,140,56,156,130,191,56,156,240,242,56,156,94,38,57,156,205,89,57,156,61,141,57,156,174,192,57,156,31,244,57,156,144,39,58,156,2,91,58,156,117,142,58,156,233,193,58,156,93,245,58,156,210,40,59,156,71,92,59,156,189,143,59,156,51,195,59,156,170,246,59,156,34,42,60,156,154,93,60,156,19,145,60,156,141,196,60,156,7,248,60,156,130,43,61,156,253,94,61,156,121,146,61,156,246,197,61,156,115,249,61,156,241,44,62,156,112,96,62,156,239,147,62,156,110,199,62,156,239,250,62,156,111,46,63,156,241,97,63,156,115,149,63,156,246,200,63,156,121,252,63,156,253,47,64,156,130,99,64,156,7,151,64,156,141,202,64,156,19,254,64,156,154,49,65,156,34,101,65,156,170,152,65,156,51,204,65,156,188,255,65,156,70,51,66,156,209,102,66,156,92,154,66,156,232,205,66,156,116,1,67,156,1,53,67,156,143,104,67,156,29,156,67,156,172,207,67,156,60,3,68,156,204,54,68,156,93,106,68,156,238,157,68,156,128,209,68,156,19,5,69,156,166,56,69,156,57,108,69,156,206,159,69,156,99,211,69,156,248,6,70,156,143,58,70,156,37,110,70,156,189,161,70,156,85,213,70,156,238,8,71,156,135,60,71,156,33,112,71,156,187,163,71,156,86,215,71,156,242,10,72,156,142,62,72,156,43,114,72,156,201,165,72,156,103,217,72,156,5,13,73,156,165,64,73,156,69,116,73,156,229,167,73,156,134,219,73,156,40,15,74,156,202,66,74,156,109,118,74,156,17,170,74,156,181,221,74,156,90,17,75,156,255,68,75,156,165,120,75,156,76,172,75,156,243,223,75,156,155,19,76,156,67,71,76,156,236,122,76,156,150,174,76,156,64,226,76,156,235,21,77,156,151,73,77,156,67,125,77,156,239,176,77,156,157,228,77,156,75,24,78,156,249,75,78,156,168,127,78,156,88,179,78,156,8,231,78,156,185,26,79,156,107,78,79,156,29,130,79,156,207,181,79,156,131,233,79,156,55,29,80,156,235,80,80,156,160,132,80,156,86,184,80,156,13,236,80,156,196,31,81,156,123,83,81,156])
.concat([51,135,81,156,236,186,81,156,165,238,81,156,95,34,82,156,26,86,82,156,213,137,82,156,145,189,82,156,77,241,82,156,10,37,83,156,200,88,83,156,134,140,83,156,69,192,83,156,5,244,83,156,197,39,84,156,133,91,84,156,70,143,84,156,8,195,84,156,203,246,84,156,142,42,85,156,81,94,85,156,22,146,85,156,219,197,85,156,160,249,85,156,102,45,86,156,45,97,86,156,244,148,86,156,188,200,86,156,132,252,86,156,78,48,87,156,23,100,87,156,226,151,87,156,172,203,87,156,120,255,87,156,68,51,88,156,17,103,88,156,222,154,88,156,172,206,88,156,123,2,89,156,74,54,89,156,25,106,89,156,234,157,89,156,187,209,89,156,140,5,90,156,94,57,90,156,49,109,90,156,4,161,90,156,216,212,90,156,173,8,91,156,130,60,91,156,88,112,91,156,46,164,91,156,5,216,91,156,221,11,92,156,181,63,92,156,142,115,92,156,103,167,92,156,65,219,92,156,27,15,93,156,247,66,93,156,210,118,93,156,175,170,93,156,140,222,93,156,105,18,94,156,71,70,94,156,38,122,94,156,6,174,94,156,230,225,94,156,198,21,95,156,167,73,95,156,137,125,95,156,108,177,95,156,79,229,95,156,50,25,96,156,22,77,96,156,251,128,96,156,225,180,96,156,199,232,96,156,173,28,97,156,148,80,97,156,124,132,97,156,100,184,97,156,77,236,97,156,55,32,98,156,33,84,98,156,12,136,98,156,247,187,98,156,227,239,98,156,208,35,99,156,189,87,99,156,171,139,99,156,153,191,99,156,136,243,99,156,120,39,100,156,104,91,100,156,89,143,100,156,74,195,100,156,60,247,100,156,47,43,101,156,34,95,101,156,22,147,101,156,10,199,101,156,255,250,101,156,245,46,102,156,235,98,102,156,226,150,102,156,217,202,102,156,209,254,102,156,202,50,103,156,195,102,103,156,189,154,103,156,183,206,103,156,178,2,104,156,174,54,104,156,170,106,104,156,167,158,104,156,164,210,104,156,162,6,105,156,161,58,105,156,160,110,105,156,160,162,105,156,160,214,105,156,161,10,106,156,163,62,106,156,165,114,106,156,168,166,106,156,171,218,106,156,175,14,107,156,179,66,107,156,185,118,107,156,190,170,107,156,197,222,107,156,204,18,108,156,211,70,108,156,219,122,108,156,228,174,108,156,238,226,108,156,247,22,109,156,2,75,109,156,13,127,109,156,25,179,109,156,37,231,109,156,50,27,110,156,64,79,110,156,78,131,110,156,92,183,110,156,108,235,110,156,124,31,111,156,140,83,111,156,157,135,111,156,175,187,111,156,193,239,111,156,212,35,112,156,232,87,112,156,252,139,112,156,17,192,112,156,38,244,112,156,60,40,113,156,82,92,113,156,105,144,113,156,129,196,113,156,153,248,113,156,178,44,114,156,204,96,114,156,230,148,114,156,0,201,114,156,27,253,114,156,55,49,115,156,84,101,115,156,113,153,115,156,142,205,115,156,173,1,116,156,203,53,116,156,235,105,116,156,11,158,116,156,44,210,116,156,77,6,117,156,111,58,117,156,145,110,117,156,180,162,117,156,215,214,117,156,252,10,118,156,32,63,118,156,70,115,118,156,108,167,118,156,146,219,118,156,186,15,119,156,225,67,119,156,10,120,119,156,51,172,119,156,92,224,119,156,134,20,120,156,177,72,120,156,220,124,120,156,8,177,120,156,53,229,120,156,98,25,121,156,143,77,121,156,190,129,121,156,237,181,121,156,28,234,121,156,76,30,122,156,125,82,122,156,174,134,122,156,224,186,122,156,18,239,122,156,70,35,123,156,121,87,123,156,173,139,123,156,226,191,123,156,24,244,123,156,78,40,124,156,132,92,124,156,187,144,124,156,243,196,124,156,44,249,124,156,101,45,125,156,158,97,125,156,216,149,125,156,19,202,125,156,78,254,125,156,138,50,126,156,199,102,126,156,4,155,126,156,66,207,126,156,128,3,127,156,191,55,127,156,255,107,127,156,63,160,127,156,127,212,127,156,193,8,128,156,2,61,128,156,69,113,128,156,136,165,128,156,204,217,128,156,16,14,129,156,85,66,129,156,154,118,129,156,224,170,129,156,39,223,129,156,110,19,130,156,182,71,130,156,254,123,130,156,71,176,130,156,145,228,130,156,219,24,131,156,38,77,131,156,113,129,131,156,189,181,131,156,10,234,131,156,87,30,132,156,164,82,132,156,243,134,132,156,66,187,132,156,145,239,132,156,225,35,133,156,50,88,133,156,131,140,133,156,213,192,133,156,39,245,133,156,122,41,134,156,206,93,134,156,34,146,134,156,119,198,134,156,204,250,134,156,34,47,135,156,121,99,135,156,208,151,135,156,40,204,135,156,128,0,136,156,217,52,136,156,51,105,136,156,141,157,136,156,232,209,136,156,67,6,137,156,159,58,137,156,251,110,137,156,88,163,137,156,182,215,137,156,20,12,138,156,115,64,138,156,211,116,138,156,51,169,138,156,147,221,138,156,245,17,139,156,86,70,139,156,185,122,139,156,28,175,139,156,127,227,139,156,227,23,140,156,72,76,140,156,173,128,140,156,19,181,140,156,122,233,140,156,225,29,141,156,73,82,141,156,177,134,141,156,26,187,141,156,131,239,141,156,237,35,142,156,88,88,142,156,195,140,142,156,47,193,142,156,155,245,142,156,8,42,143,156,118,94,143,156,228,146,143,156,83,199,143,156,194,251,143,156,50,48,144,156,163,100,144,156,20,153,144,156,134,205,144,156,248,1,145,156,107,54,145,156,222,106,145,156,82,159,145,156,199,211,145,156,60,8,146,156,178,60,146,156,40,113,146,156,159,165,146,156,23,218,146,156,143,14,147,156,8,67,147,156,129,119,147,156,251,171,147,156,118,224,147,156,241,20,148,156,108,73,148,156,233,125,148,156,102,178,148,156,227,230,148,156,97,27,149,156,224,79,149,156,95,132,149,156,223,184,149,156,95,237,149,156,224,33,150,156,98,86,150,156,228,138,150,156,103,191,150,156,234,243,150,156,110,40,151,156,242,92,151,156,119,145,151,156,253,197,151,156,131,250,151,156,10,47,152,156,146,99,152,156,26,152,152,156,162,204,152,156,44,1,153,156,181,53,153,156,64,106,153,156,203,158,153,156,86,211,153,156,226,7,154,156,111,60,154,156,252,112,154,156,138,165,154,156,25,218,154,156,168,14,155,156,55,67,155,156,200,119,155,156,88,172,155,156,234,224,155,156,124,21,156,156,14,74,156,156,161,126,156,156,53,179,156,156,202,231,156,156,94,28,157,156,244,80,157,156,138,133,157,156,33,186,157,156,184,238,157,156,80,35,158,156,232,87,158,156,129,140,158,156,27,193,158,156,181,245,158,156,80,42,159,156,235,94,159,156,135,147,159,156,36,200,159,156,193,252,159,156,94,49,160,156,253,101,160,156,155,154,160,156,59,207,160,156,219,3,161,156,123,56,161,156,29,109,161,156,190,161,161,156,97,214,161,156,4,11,162,156,167,63,162,156,75,116,162,156,240,168,162,156,149,221,162,156,59,18,163,156,226,70,163,156,137,123,163,156,48,176,163,156,216,228,163,156,129,25,164,156,43,78,164,156,213,130,164,156,127,183,164,156,42,236,164,156,214,32,165,156,130,85,165,156,47,138,165,156,221,190,165,156,139,243,165,156,57,40,166,156,232,92,166,156,152,145,166,156,72,198,166,156,249,250,166,156,171,47,167,156,93,100,167,156,16,153,167,156,195,205,167,156,119,2,168,156,43,55,168,156,224,107,168,156,150,160,168,156,76,213,168,156,3,10,169,156,186,62,169,156,114,115,169,156,43,168,169,156,228,220,169,156,157,17,170,156,88,70,170,156,19,123,170,156,206,175,170,156,138,228,170,156,71,25,171,156,4,78,171,156,194,130,171,156,128,183,171,156,63,236,171,156,254,32,172,156,190,85,172,156,127,138,172,156,64,191,172,156,2,244,172,156,197,40,173,156,136,93,173,156,75,146,173,156,15,199,173,156,212,251,173,156,153,48,174,156,95,101,174,156,38,154,174,156,237,206,174,156,180,3,175,156,125,56,175,156,69,109,175,156,15,162,175,156,217,214,175,156,163,11,176,156,110,64,176,156,58,117,176,156,6,170,176,156,211,222,176,156,161,19,177,156,111,72,177,156,61,125,177,156,12,178,177,156,220,230,177,156,173,27,178,156,125,80,178,156,79,133,178,156,33,186,178,156,244,238,178,156,199,35,179,156,155,88,179,156,111,141,179,156,68,194,179,156,26,247,179,156,240,43,180,156,199,96,180,156,158,149,180,156,118,202,180,156,78,255,180,156,39,52,181,156,1,105,181,156,219,157,181,156,182,210,181,156,145,7,182,156,109,60,182,156,74,113,182,156,39,166,182,156,5,219,182,156,227,15,183,156,194,68,183,156,161,121,183,156,129,174,183,156,98,227,183,156,67,24,184,156,36,77,184,156,7,130,184,156,234,182,184,156,205,235,184,156,177,32,185,156,150,85,185,156,123,138,185,156,97,191,185,156,71,244,185,156,46,41,186,156,22,94,186,156,254,146,186,156,230,199,186,156,208,252,186,156,185,49,187,156,164,102,187,156,143,155,187,156,122,208,187,156,102,5,188,156,83,58,188,156,64,111,188,156,46,164,188,156,29,217,188,156,12,14,189,156,251,66,189,156,236,119,189,156,220,172,189,156,206,225,189,156,192,22,190,156,178,75,190,156,165,128,190,156,153,181,190,156,141,234,190,156,130,31,191,156,119,84,191,156,109,137,191,156,100,190,191,156,91,243,191,156,82,40,192,156,75,93,192,156,67,146,192,156,61,199,192,156,55,252,192,156,49,49,193,156,45,102,193,156,40,155,193,156,37,208,193,156,33,5,194,156,31,58,194,156,29,111,194,156,27,164,194,156,27,217,194,156,26,14,195,156,27,67,195,156,28,120,195,156,29,173,195,156,31,226,195,156,34,23,196,156,37,76,196,156,41,129,196,156,45,182,196,156,50,235,196,156,56,32,197,156,62,85,197,156,68,138,197,156,76,191,197,156,83,244,197,156,92,41,198,156,101,94,198,156,110,147,198,156,120,200,198,156,131,253,198,156,142,50,199,156,154,103,199,156,167,156,199,156,180,209,199,156,193,6,200,156,207,59,200,156,222,112,200,156,237,165,200,156,253,218,200,156,13,16,201,156,30,69,201,156,48,122,201,156,66,175,201,156,85,228,201,156,104,25,202,156,124,78,202,156,145,131,202,156,166,184,202,156,187,237,202,156,209,34,203,156,232,87,203,156,0,141,203,156,23,194,203,156,48,247,203,156,73,44,204,156,99,97,204,156,125,150,204,156,152,203,204,156,179,0,205,156,207,53,205,156,235,106,205,156,8,160,205,156,38,213,205,156,68,10,206,156,99,63,206,156,130,116,206,156,162,169,206,156,195,222,206,156,228,19,207,156,6,73,207,156,40,126,207,156,75,179,207,156,110,232,207,156,146,29,208,156,182,82,208,156,219,135,208,156,1,189,208,156,39,242,208,156,78,39,209,156,118,92,209,156,158,145,209,156,198,198,209,156,239,251,209,156,25,49,210,156,67,102,210,156,110,155,210,156,153,208,210,156,197,5,211,156,242,58,211,156,31,112,211,156,77,165,211,156,123,218,211,156,170,15,212,156,217,68,212,156,9,122,212,156,58,175,212,156,107,228,212,156,156,25,213,156,207,78,213,156,1,132,213,156,53,185,213,156,105,238,213,156,157,35,214,156,210,88,214,156,8,142,214,156,62,195,214,156,117,248,214,156,173,45,215,156,229,98,215,156,29,152,215,156,86,205,215,156,144,2,216,156,202,55,216,156,5,109,216,156,64,162,216,156,124,215,216,156,185,12,217,156,246,65,217,156,52,119,217,156,114,172,217,156,177,225,217,156,240,22,218,156,48,76,218,156,113,129,218,156,178,182,218,156,244,235,218,156,54,33,219,156,121,86,219,156,188,139,219,156,0,193,219,156,68,246,219,156,138,43,220,156,207,96,220,156,22,150,220,156,92,203,220,156,164,0,221,156,236,53,221,156,52,107,221,156,125,160,221,156,199,213,221,156,17,11,222,156,92,64,222,156,167,117,222,156,243,170,222,156,64,224,222,156,141,21,223,156,219,74,223,156,41,128,223,156,120,181,223,156,199,234,223,156,23,32,224,156,103,85,224,156,184,138,224,156,10,192,224,156,92,245,224,156,175,42,225,156,2,96,225,156,86,149,225,156,171,202,225,156,0,0,226,156,85,53,226,156,172,106,226,156,2,160,226,156,90,213,226,156,178,10,227,156,10,64,227,156,99,117,227,156,189,170,227,156,23,224,227,156,114,21,228,156,205,74,228,156,41,128,228,156,133,181,228,156,226,234,228,156,64,32,229,156,158,85,229,156,253,138,229,156,92,192,229,156,188,245,229,156,28,43,230,156,125,96,230,156,223,149,230,156,65,203,230,156,163,0,231,156,7,54,231,156,107,107,231,156,207,160,231,156,52,214,231,156,153,11,232,156,0,65,232,156,102,118,232,156,205,171,232,156,53,225,232,156,158,22,233,156,7,76,233,156,112,129,233,156,218,182,233,156,69,236,233,156,176,33,234,156,28,87,234,156,136,140,234,156,245,193,234,156,98,247,234,156,208,44,235,156,63,98,235,156,174,151,235,156,30,205,235,156,142,2,236,156,255,55,236,156,113,109,236,156,227,162,236,156,85,216,236,156,200,13,237,156,60,67,237,156,176,120,237,156,37,174,237,156,154,227,237,156,16,25,238,156,135,78,238,156,254,131,238,156,118,185,238,156,238,238,238,156,103,36,239,156,224,89,239,156,90,143,239,156,213,196,239,156,80,250,239,156,203,47,240,156,71,101,240,156,196,154,240,156,65,208,240,156,191,5,241,156,62,59,241,156,189,112,241,156,60,166,241,156,189,219,241,156,61,17,242,156,191,70,242,156,64,124,242,156,195,177,242,156,70,231,242,156,201,28,243,156,77,82,243,156,210,135,243,156,87,189,243,156,221,242,243,156,100,40,244,156,234,93,244,156,114,147,244,156,250,200,244,156,131,254,244,156,12,52,245,156,150,105,245,156,32,159,245,156,171,212,245,156,54,10,246,156,194,63,246,156,79,117,246,156,220,170,246,156,106,224,246,156,248,21,247,156,135,75,247,156,22,129,247,156,166,182,247,156,55,236,247,156,200,33,248,156,89,87,248,156,236,140,248,156,126,194,248,156,18,248,248,156,166,45,249,156,58,99,249,156,207,152,249,156,101,206,249,156,251,3,250,156,146,57,250,156,41,111,250,156,193,164,250,156,89,218,250,156,242,15,251,156,140,69,251,156,38,123,251,156,193,176,251,156,92,230,251,156,248,27,252,156,148,81,252,156,49,135,252,156,206,188,252,156,108,242,252,156,11,40,253,156,170,93,253,156,74,147,253,156,234,200,253,156,139,254,253,156,44,52,254,156,206,105,254,156,113,159,254,156,20,213,254,156,184,10,255,156,92,64,255,156,1,118,255,156,166,171,255,156,76,225,255,156,243,22,0,157,154,76,0,157,65,130,0,157,233,183,0,157,146,237,0,157,59,35,1,157,229,88,1,157,144,142,1,157,59,196,1,157,230,249,1,157,146,47,2,157,63,101,2,157,236,154,2,157,154,208,2,157,72,6,3,157,247,59,3,157,167,113,3,157,87,167,3,157,7,221,3,157,185,18,4,157,106,72,4,157,29,126,4,157,207,179,4,157,131,233,4,157,55,31,5,157,235,84,5,157,160,138,5,157,86,192,5,157,12,246,5,157,195,43,6,157,122,97,6,157,50,151,6,157,235,204,6,157,164,2,7,157,93,56,7,157,23,110,7,157,210,163,7,157,141,217,7,157,73,15,8,157,6,69,8,157,194,122,8,157,128,176,8,157,62,230,8,157,253,27,9,157,188,81,9,157,124,135,9,157,60,189,9,157,253,242,9,157,190,40,10,157,128,94,10,157,67,148,10,157,6,202,10,157,201,255,10,157,142,53,11,157,82,107,11,157,24,161,11,157,222,214,11,157,164,12,12,157,107,66,12,157,51,120,12,157,251,173,12,157,196,227,12,157,141,25,13,157,0,0,0,0,5,127,131,9,51,79,80,11,205,79,116,13,0,0,0,16,10,254,6,19,102,158,160,22,153,159,232,26,0,0,0,0,111,112,116,105,111,110,32,114,101,113,117,105,114,101,115,32,97,110,32,97,114,103,117,109,101,110,116,32,45,45,32,37,115,0,0,0,0,0,0,0,111,112,116,105,111,110,32,114,101,113,117,105,114,101,115,32,97,110,32,97,114,103,117,109,101,110,116,32,45,45,32,37,99,0,0,0,0,0,0,0,3,0,2,5,85,85,85,21,0,0,0,8,5,0,3,7,154,153,153,25,0,0,0,8,7,0,0,3,146,36,73,18,0,0,0,4,9,0,4,10,28,199,113,28,0,0,0,8,15,0,0,4,17,17,17,17,0,0,0,2,31,0,0,5,8,33,132,16,0,0,0,1,63,0,0,6,16,4,65,16,0,0,128,0,127,0,0,7,129,64,32,16,0,0,64,0,255,0,0,8,16,16,16,16,0,0,32,0,255,1,0,9,2,4,8,16,0,0,16,0,255,3,0,10,0,1,4,16,0,0,8,0,255,7,0,11,64,0,2,16,0,0,4,0,255,15,0,12,16,0,1,16,0,0,2,0,255,31,0,13,4,128,0,16,0,0,1,0,255,63,0,14,1,64,0,16,0,128,0,0,255,127,0,15,0,32,0,16,0,64,0,0,255,255,0,16,0,16,0,16,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,2,2,3,3,3,2,0,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,208,163,0,0,0,0,0,0,0,0,0,0,0,0,0,0,63,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,16,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,5,16,0,0,0,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,0,1,3,4,5,6,7,8,9,10,11,12,13,14,15,0,1,2,3,4,5,6,7,8,9,10,11,12,13,16,0,2,4,5,6,7,8,9,10,11,12,13,14,15,16,0,0,0,0,0,0,6,5,5,5,9,9,9,9,6,9,9,9,6,5,7,3,9,9,12,6,6,9,12,6,11,10,0,0,18,18,0,0,15,18,0,0,7,7,7,0,12,12,12,0,6,15,12,0,6,6,6,3,12,9,9,6,6,12,9,6,8,8,5,0,15,12,9,0,6,18,9,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,111,112,116,105,111,110,32,100,111,101,115,110,39,116,32,116,97,107,101,32,97,110,32,97,114,103,117,109,101,110,116,32,45,45,32,37,46,42,115,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,77,80,69,71,32,65,117,100,105,111,32,68,101,99,111,100,101,114,32,48,46,49,53,46,49,32,40,98,101,116,97,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,140,0,0,96,140,0,0,152,157,0,0,0,0,0,0,136,157,0,0,0,0,3,0,200,145,0,0,0,0,3,0,160,142,0,0,0,0,3,0,0,0,0,0,0,0,0,0,104,142,0,0,0,0,3,0,48,142,0,0,0,0,4,0,176,141,0,0,0,0,4,0,40,141,0,0,0,0,4,0,184,140,0,0,0,0,4,0,184,156,0,0,0,0,4,0,232,155,0,0,0,0,4,0,40,155,0,0,0,0,4,0,8,152,0,0,0,0,4,0,0,0,0,0,0,0,0,0,16,149,0,0,0,0,4,0,232,145,0,0,1,0,4,0,232,145,0,0,2,0,4,0,232,145,0,0,3,0,4,0,232,145,0,0,4,0,4,0,232,145,0,0,6,0,4,0,232,145,0,0,8,0,4,0,232,145,0,0,10,0,4,0,232,145,0,0,13,0,4,0,192,142,0,0,4,0,4,0,192,142,0,0,5,0,4,0,192,142,0,0,6,0,4,0,192,142,0,0,7,0,4,0,192,142,0,0,8,0,4,0,192,142,0,0,9,0,4,0,192,142,0,0,11,0,4,0,192,142,0,0,13,0,4,0,67,111,112,121,114,105,103,104,116,32,40,67,41,32,50,48,48,48,45,50,48,48,52,32,85,110,100,101,114,98,105,116,32,84,101,99,104,110,111,108,111,103,105,101,115,44,32,73,110,99,46,0,0,0,0,0,70,80,77,95,68,69,70,65,85,76,84,32,65,83,79,95,90,69,82,79,67,72,69,67,75,32,0,0,0,0,0,0,85,110,100,101,114,98,105,116,32,84,101,99,104,110,111,108,111,103,105,101,115,44,32,73,110,99,46,32,60,105,110,102,111,64,117,110,100,101,114,98,105,116,46,99,111,109,62,0,85,85,85,21,146,36,73,18,17,17,17,17,8,33,132,16,16,4,65,16,129,64,32,16,16,16,16,16,2,4,8,16,0,1,4,16,64,0,2,16,16,0,1,16,4,128,0,16,1,64,0,16,0,32,0,16,0,0,0,0,47,150,97,3,116,61,219,5,0,0,0,8,140,194,36,10,209,105,158,12,0,0,0,16,0,0,0,0,205,79,116,13,51,79,80,11,5,127,131,9,0,0,0,8,230,39,186,6,154,39,168,5,131,191,193,4,0,0,0,4,243,19,93,3,205,19,212,2,193,223,96,2,0,0,0,2,250,137,174,1,230,9,106,1,225,111,48,1,51,79,80,11,0,0,0,8,154,39,168,5,0,0,0,4,205,19,212,2,0,0,0,2,230,9,106,1,0,0,0,1,243,4,181,0,0,0,128,0,122,130,90,0,0,0,64,0,61,65,45,0,0,0,32,0,158,160,22,0,160,124,189,9,24,202,55,241,94,93,233,253,73,245,220,15,86,135,224,249,186,108,78,243,186,108,78,243,170,120,31,6,73,245,220,15,162,162,22,2,24,202,55,241,96,131,66,246,170,120,31,6,24,202,55,241,232,53,200,14,86,135,224,249,86,135,224,249,232,53,200,14,24,202,55,241,86,135,224,249,170,120,31,6,232,53,200,14,232,53,200,14,170,120,31,6,162,162,22,2,86,135,224,249,160,124,189,9,186,108,78,243,232,53,200,14,183,10,35,240,183,10,35,240,24,202,55,241,186,108,78,243,96,131,66,246,86,135,224,249,94,93,233,253,117,110,107,110,111,119,110,32,111,112,116,105,111,110,32,45,45,32,37,115,0,0,0,0,117,110,107,110,111,119,110,32,111,112,116,105,111,110,32,45,45,32,37,99,0,0,0,0,249,0,121,0,185,0,57,0,217,0,89,0,153,0,25,0,233,0,105,0,169,0,41,0,201,0,73,0,137,0,9,0,4,1,68,1,130,1,162,1,73,0,137,0,41,0,25,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,213,0,245,0,181,0,117,0,229,0,165,0,147,0,147,0,99,0,195,0,83,0,51,0,8,1,6,2,132,2,196,2,2,3,25,2,41,1,41,0,23,1,23,1,7,1,7,1,23,0,23,0,7,0,7,0,34,3,57,5,89,3,66,3,73,4,41,5,89,2,25,5,87,1,87,1,55,4,55,4,71,3,71,3,89,0,9,4,39,4,71,2,55,3,71,0,21,4,21,4,69,1,69,1,37,3,53,2,19,3,19,3,51,1,51,1,5,3,53,0,35,2,3,2,83,5,67,5,83,4,3,5,0,0,0,0,8,1,8,2,25,2,41,1,21,1,21,1,21,1,21,1,7,1,7,1,23,0,23,0,5,0,5,0,5,0,5,0,6,3,132,3,194,3,25,5,89,1,226,3,2,4,41,4,73,2,25,4,71,1,71,1,9,4,73,0,41,3,57,2,25,3,57,1,9,3,57,0,37,2,37,2,37,2,37,2,5,2,5,2,5,2,5,2,37,0,37,0,37,0,37,0,87,5,87,4,69,5,69,5,83,3,83,3,83,3,83,3,53,5,69,4,35,5,35,5,83,2,3,5,51,4,67,3,83,0,51,3,0,0,0,0,8,1,8,2,4,3,25,1,7,1,7,1,23,0,23,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,68,3,130,3,162,3,25,5,89,1,194,3,89,0,226,3,41,4,73,2,23,4,23,4,71,1,71,1,71,0,71,0,9,4,41,3,57,2,9,3,23,3,23,3,55,1,55,1,55,0,55,0,39,2,39,2,21,2,21,2,21,2,21,2,35,1,35,1,5,2,37,0,85,5,69,5,85,4,85,3,51,5,67,4,35,5,83,2,3,5,51,4,67,3,51,3,6,1,130,1,162,1,25,2,41,1,41,0,7,1,7,1,21,1,21,1,21,1,21,1,23,0,23,0,7,0,7,0,55,3,7,3,37,3,37,3,53,2,53,2,53,0,53,0,19,3,51,1,35,2,3,2,136,0,23,1,7,1,23,0,3,0,3,0,3,0,3,0,130,1,57,2,55,1,55,1,25,3,9,3,57,0,41,2,23,2,23,2,39,1,39,1,7,2,7,2,39,0,39,0,51,3,35,3,0,0,0,0,134,0,23,0,21,1,21,1,5,1,5,1,5,0,5,0,39,2,7,2,21,2,21,2,37,1,37,1,37,0,37,0,8,1,8,2,8,3,249,15,8,4,8,5,8,6,8,7,8,8,8,9,6,10,132,10,25,1,9,1,25,0,9,0,233,15,249,14,217,15,249,13,201,15,249,12,185,15,249,11,247,10,247,10,169,15,153,15,247,9,247,9,247,8,247,8,137,15,121,15,247,7,247,7,103,15,103,15,247,6,247,6,87,15,87,15,247,5,247,5,71,15,71,15,247,4,247,4,55,15,55,15,247,3,247,3,39,15,39,15,247,2,247,2,247,1,247,1,25,15,249,0,198,10,70,11,198,11,70,12,200,12,198,13,70,14,198,14,68,15,132,15,196,15,4,16,68,16,132,16,196,16,4,17,68,17,134,17,4,18,68,18,132,18,198,18,68,19,134,19,2,20,36,20,100,20,162,20,196,20,2,21,34,21,66,21,98,21,130,21,162,21,194,21,226,21,2,22,34,22,66,22,98,22,130,22,162,22,194,22,226,22,2,23,36,23,98,23,132,23,121,3,194,23,121,2,73,6,105,4,89,5,121,1,57,6,105,3,73,5,89,4,41,6,105,2,25,6,105,1,226,23,57,5,89,3,73,4,41,5,89,2,25,5,2,24,87,1,87,1,57,4,73,3,39,4,39,4,71,2,71,2,55,3,55,3,23,4,23,4,71,1,71,1,9,4,73,0,39,3,39,3,55,2,55,2,21,3,21,3,21,3,21,3,53,1,53,1,53,1,53,1,7,3,55,0,37,2,37,2,19,2,19,2,19,2,19,2,35,1,35,1,5,2,37,0,3,15,3,15,3,15,3,15,231,14,215,14,231,13,199,14,231,12,215,13,183,14,231,11,199,13,215,12,167,14,231,10,183,13,215,11,199,12,151,14,231,9,167,13,215,10,183,12,199,11,135,14,231,8,151,13,215,9,119,14,231,7,167,12,199,10,199,10,183,11,183,11,135,13,135,13,215,8,215,8,9,14,233,0,7,13,7,13,229,6,229,6,229,6,229,6,103,14,151,12,197,9,197,9,85,14,85,14,181,10,181,10,229,5,229,5,167,11,119,13,213,7,213,7,229,4,229,4,133,12,133,12,197,8,197,8,71,14,39,14,53,14,53,14,101,13,213,6,229,3,149,11,181,9,165,10,229,2,21,14,229,1,85,13,213,5,117,12,197,7,69,13,133,11,181,8,213,4,149,10,165,9,101,12,197,6,53,13,213,3,37,13,213,2,21,13,117,11,181,7,213,1,85,12,197,5,133,10,165,8,149,9,69,12,197,4,101,11,101,11,181,6,181,6,215,0,7,12,53,12,53,12,197,3,117,10,165,7,37,12,197,2,85,11,181,5,21,12,133,9,149,8,197,1,69,11,199,0,7,11,53,11,53,11,183,0,7,10,21,10,21,10,179,4,179,4,101,10,165,6,117,9,117,9,149,7,149,7,167,0,7,9,149,0,149,0,179,3,131,8,37,11,85,10,179,2,179,2,165,5,21,11,181,1,101,9,147,6,163,4,69,10,117,8,131,7,131,7,51,10,163,3,83,9,147,5,35,10,163,2,163,1,99,8,131,6,115,7,67,9,147,4,51,9,147,3,83,8,131,5,35,9,99,7,115,6,147,2,19,9,147,1,67,8,131,4,83,7,115,5,51,8,131,3,99,6,35,8,131,2,19,8,67,7,115,4,131,1,131,1,5,8,133,0,83,6,99,5,19,7,19,7,5,7,117,0,51,7,35,7,3,6,99,0,3,5,83,0,0,0,0,0,134,0,23,1,7,1,23,0,3,0,3,0,3,0,3,0,39,2,7,2,21,2,21,2,37,1,37,1,37,0,37,0,8,1,8,2,8,3,4,4,25,1,9,1,23,0,23,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,70,4,198,4,68,5,249,15,132,5,194,5,232,5,249,2,226,6,25,15,249,1,8,7,8,8,8,9,8,10,8,11,8,12,6,13,134,13,6,14,134,14,6,15,134,15,6,16,132,16,196,16,2,17,36,17,100,17,162,17,89,1,194,17,226,17,2,18,34,18,25,4,73,1,66,18,41,3,57,2,23,3,23,3,55,1,55,1,9,3,57,0,39,2,39,2,21,2,37,1,5,2,37,0,231,15,247,14,215,15,247,13,199,15,247,12,183,15,247,11,165,15,165,15,247,10,151,15,247,9,247,8,133,15,133,15,117,15,245,7,101,15,245,6,85,15,245,5,67,15,67,15,243,4,243,3,243,0,243,0,243,0,243,0,243,0,243,0,243,0,243,0,53,15,53,15,53,15,53,15,104,18,102,19,230,19,102,20,35,15,3,15,228,20,36,21,100,21,162,21,196,21,4,22,66,22,100,22,164,22,228,22,36,23,233,3,98,23,130,23,162,23,194,23,226,23,2,24,34,24,9,13,66,24,98,24,130,24,57,12,162,24,25,12,201,0,194,24,231,2,231,2,41,14,25,14,217,3,41,13,217,2,217,1,57,11,226,24,23,13,23,13,201,4,105,11,201,3,169,7,39,12,39,12,201,2,185,5,201,1,9,12,73,11,185,4,105,10,169,6,183,3,183,3,89,10,169,5,39,11,39,11,183,2,183,2,23,11,23,11,183,1,183,1,9,11,185,0,105,9,153,6,73,10,169,4,121,8,137,7,167,3,167,3,57,10,89,9,39,10,39,10,153,5,105,8,167,1,167,1,137,6,121,7,151,4,151,4,73,9,89,7,103,7,103,7,165,2,165,2,165,2,165,2,21,10,21,10,7,10,167,0,55,9,151,3,87,8,135,5,37,9,37,9,149,2,149,2,119,6,7,9,21,9,21,9,149,1,149,1,151,0,71,8,135,4,119,5,55,8,135,3,103,6,39,8,133,2,133,2,71,7,119,4,21,8,21,8,133,1,133,1,133,0,133,0,7,8,87,6,53,7,53,7,117,3,117,3,103,5,71,6,37,7,37,7,117,2,117,2,103,4,87,5,5,7,5,7,19,7,19,7,19,7,19,7,115,1,115,1,117,0,53,6,101,3,69,5,85,4,37,6,99,2,19,6,99,1,99,1,5,6,101,0,83,3,83,3,53,5,69,4,35,5,83,2,19,5,3,5,51,4,67,3,83,0,35,4,67,2,51,3,3,4,67,0,201,14,2,25,215,14,215,14,231,9,231,9,233,10,217,9,229,14,229,14,229,14,229,14,231,13,231,13,231,11,231,11,181,14,181,14,197,13,197,13,215,12,215,11,165,14,165,14,197,12,197,12,167,13,215,10,119,14,167,12,197,10,197,10,199,9,119,13,85,14,85,14,179,13,179,13,179,13,179,13,147,14,147,14,181,12,197,11,133,14,229,8,149,13,229,7,181,11,133,13,213,8,101,14,227,6,147,12,165,11,181,10,229,5,213,7,67,14,67,14,229,4,133,12,195,8,51,14,99,13,99,13,213,6,149,11,181,9,165,10,227,1,227,1,211,4,211,4,181,8,165,9,115,11,115,11,181,7,213,0,3,14,227,0,83,13,211,5,115,12,195,7,67,13,131,11,147,10,99,12,195,6,51,13,83,12,195,5,131,10,163,8,147,9,67,12,179,6,115,10,83,11,131,9,147,8,115,9,147,7,131,8,227,12,211,13,0,0,0,0,8,1,8,2,8,3,8,4,8,5,6,6,134,6,4,7,66,7,98,7,23,1,23,1,9,1,25,0,7,0,7,0,136,7,136,8,136,9,136,10,136,11,134,12,6,13,136,13,134,14,6,15,134,15,6,16,132,16,198,16,70,17,196,17,4,18,68,18,132,18,196,18,4,19,68,19,132,19,196,19,2,20,34,20,66,20,100,20,162,20,194,20,228,20,34,21,66,21,98,21,153,1,130,21,162,21,194,21,226,21,2,22,41,8,137,2,25,8,137,1,34,22,66,22,98,22,130,22,41,7,121,2,105,4,25,7,89,5,121,1,162,22,57,6,105,3,73,5,89,4,41,6,105,2,25,6,194,22,57,5,103,1,103,1,89,3,73,4,39,5,39,5,87,2,87,2,23,5,23,5,87,1,87,1,9,5,89,0,55,4,55,4,71,3,39,4,71,2,55,3,69,1,69,1,23,4,7,4,37,3,37,3,53,2,53,2,71,0,7,3,21,3,21,3,53,1,53,0,35,2,35,2,19,2,35,1,3,2,35,0,226,22,2,23,233,14,34,23,66,23,98,23,249,11,130,23,217,13,169,15,249,10,185,14,233,11,201,13,217,12,153,15,249,9,233,10,185,13,217,11,137,15,249,8,201,12,153,14,233,9,121,15,249,7,169,13,217,10,185,12,105,15,162,23,199,11,199,11,247,6,247,6,137,14,233,8,89,15,153,13,247,5,247,5,119,14,119,14,231,7,231,7,167,12,167,12,199,10,199,10,183,11,183,11,217,9,137,13,71,15,71,15,247,4,247,4,55,15,55,15,247,3,247,3,215,8,215,8,231,6,231,6,39,15,39,15,247,2,247,2,105,14,249,0,23,15,23,15,247,1,247,1,151,12,151,12,199,9,199,9,87,14,167,11,183,10,231,5,119,13,215,7,71,14,231,4,135,12,199,8,55,14,103,13,215,6,231,3,151,11,183,9,39,14,39,14,167,10,167,10,231,2,231,2,23,14,23,14,231,1,231,1,9,14,233,0,87,13,87,13,215,5,215,5,119,12,199,7,71,13,135,11,213,4,213,4,183,8,151,10,167,9,103,12,199,6,55,13,213,3,213,3,213,2,213,2,39,13,7,13,21,13,21,13,117,11,117,11,181,7,181,7,213,1,213,1,87,12,215,0,197,5,197,5,133,10,133,10,165,8,69,12,197,4,101,11,181,6,181,6,151,9,7,12,53,12,53,12,197,3,197,3,117,10,117,10,165,7,165,7,165,6,165,6,199,0,7,11,195,2,195,2,37,12,85,11,181,5,21,12,133,9,149,8,197,1,69,11,181,4,101,10,53,11,117,9,179,3,179,3,149,7,133,8,37,11,85,10,179,2,179,2,165,5,21,11,179,1,179,1,181,0,101,9,149,6,69,10,165,4,117,8,133,7,53,10,163,3,163,3,83,9,147,5,35,10,163,2,19,10,163,1,5,10,165,0,99,8,99,8,131,6,67,9,147,4,51,9,147,3,147,3,117,7,5,9,83,8,131,5,35,9,99,7,115,6,147,2,19,9,147,0,67,8,131,4,83,7,115,5,51,8,131,3,99,6,67,7,115,4,3,8,131,0,83,6,99,5,51,7,115,3,67,6,3,7,115,0,3,6,99,0,243,15,227,15,243,14,211,15,243,13,195,15,243,12,211,14,227,13,179,15,195,14,227,12,163,14,3,15,8,1,8,2,8,3,4,4,25,1,9,1,23,0,23,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,72,4,72,5,72,6,72,7,72,8,72,9,70,10,198,10,70,11,198,11,70,12,198,12,66,13,100,13,166,13,34,14,68,14,132,14,196,14,4,15,137,1,66,15,98,15,130,15,164,15,226,15,25,5,89,1,2,16,34,16,66,16,25,4,71,1,71,1,9,4,73,0,41,3,57,2,23,3,23,3,55,1,55,1,7,3,7,3,55,0,55,0,39,2,39,2,21,2,37,1,5,2,37,0,104,16,104,17,104,18,102,19,228,19,36,20,102,20,228,20,34,21,68,21,132,21,196,21,4,22,68,22,25,15,249,1,249,0,130,22,162,22,194,22,233,2,226,22,25,14,233,1,2,23,34,23,66,23,98,23,130,23,162,23,201,6,57,13,194,23,41,13,217,2,25,13,185,7,226,23,2,24,201,3,34,24,73,11,215,1,215,1,9,13,217,0,137,10,169,8,73,12,201,4,105,11,185,6,55,12,55,12,39,12,39,12,199,2,199,2,87,11,87,11,185,5,137,9,23,12,23,12,199,1,199,1,153,8,9,12,199,0,199,0,185,4,105,10,169,6,121,9,55,11,55,11,183,3,183,3,137,8,89,10,39,11,39,11,169,5,105,9,167,4,167,4,121,8,137,7,151,4,151,4,121,7,121,6,181,2,181,2,181,2,181,2,21,11,21,11,181,1,181,1,7,11,183,0,151,6,71,10,55,10,167,3,87,9,151,5,37,10,37,10,165,2,165,2,21,10,21,10,165,1,165,1,7,10,103,8,165,0,165,0,135,6,71,9,149,3,149,3,55,9,87,8,135,5,103,7,37,9,37,9,149,2,149,2,87,7,119,5,53,8,53,8,133,3,133,3,103,6,71,7,119,4,87,6,103,5,119,3,19,9,147,1,5,9,149,0,69,8,133,4,117,2,117,2,71,6,103,4,35,8,35,8,35,8,35,8,131,2,19,8,53,7,37,7,19,7,19,7,115,1,115,1,85,5,5,7,117,0,53,6,101,3,69,5,85,4,37,6,101,2,53,5,3,8,131,0,19,6,99,1,3,6,99,0,85,3,69,4,35,5,35,5,83,2,3,5,51,4,67,3,83,0,35,4,67,2,51,3,70,24,249,15,233,15,217,15,233,14,201,15,217,14,185,15,249,11,201,14,217,12,194,24,231,12,231,12,215,13,215,13,249,10,201,13,183,14,183,14,231,11,231,11,151,15,151,15,247,9,247,9,231,10,231,10,183,13,183,13,215,11,215,11,135,15,135,15,247,8,247,8,199,12,199,12,169,14,153,14,135,14,135,14,121,15,121,14,245,7,245,7,245,7,245,7,213,10,213,10,167,13,183,12,199,11,247,6,101,15,101,15,229,8,85,15,149,13,213,9,245,5,229,7,165,12,181,11,69,15,69,15,245,4,245,4,199,10,231,6,245,3,245,3,51,15,51,15,133,13,213,8,35,15,243,2,101,14,149,12,3,15,3,15,197,9,85,14,163,11,163,11,117,13,213,7,67,14,67,14,197,8,213,6,51,14,51,14,179,9,179,9,149,11,165,10,179,10,227,5,227,4,131,12,99,13,227,3,35,14,3,14,227,0,83,13,211,5,115,12,195,7,67,13,131,11,179,8,211,4,147,10,163,9,99,12,211,3,115,11,83,12,195,5,147,9,115,10,163,7,147,7,247,14,247,12,245,13,245,13,227,13,227,13,227,13,227,13,163,15,227,9,0,0,0,0,8,1,8,2,8,3,4,4,70,4,194,4,25,2,41,1,226,4,9,0,23,1,23,1,7,1,7,1,23,0,23,0,4,5,66,5,98,5,130,5,89,6,57,7,162,5,41,7,121,2,73,6,105,4,25,7,121,1,194,5,57,6,105,3,73,5,89,4,73,4,226,5,39,6,39,6,103,2,103,2,103,1,103,1,25,6,105,0,57,5,89,3,41,5,89,2,23,5,23,5,87,1,87,1,55,4,55,4,71,3,71,3,89,0,9,4,39,4,39,4,71,2,71,2,23,4,23,4,53,3,69,1,37,3,53,2,71,0,7,3,53,0,53,0,19,3,19,3,19,3,19,3,51,1,35,2,3,2,35,0,117,7,101,7,115,6,115,6,83,7,115,5,99,6,67,7,115,4,99,5,115,3,83,5,3,7,115,0,3,6,3,5,8,1,8,2,8,3,6,4,25,2,130,4,23,1,23,1,7,1,7,1,23,0,23,0,5,0,5,0,5,0,5,0,164,4,230,4,100,5,162,5,196,5,41,7,121,2,2,6,119,1,119,1,25,7,121,0,57,6,105,3,105,0,34,6,66,6,25,5,103,2,103,2,41,6,9,6,23,6,23,6,103,1,103,1,89,1,57,4,89,0,98,6,41,4,73,2,25,4,73,1,9,4,73,0,39,3,39,3,55,2,55,2,21,3,21,3,21,3,21,3,53,1,53,1,53,1,53,1,7,3,55,0,37,2,37,2,35,1,35,1,35,1,35,1,3,2,35,0,117,7,101,7,117,6,117,5,101,6,101,6,69,7,69,7,117,4,117,4,87,7,87,5,85,6,101,5,51,7,51,7,115,3,67,6,69,5,85,4,53,5,85,3,99,4,3,7,67,4,35,5,83,2,3,5,67,3,51,3,8,1,8,2,4,3,25,1,7,1,7,1,23,0,23,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,70,3,196,3,6,4,130,4,164,4,228,4,36,5,25,7,121,1,98,5,132,5,196,5,25,6,105,1,105,0,2,6,34,6,66,6,25,4,73,1,73,0,41,3,57,2,9,3,23,3,23,3,55,1,55,1,55,0,55,0,39,2,39,2,21,2,37,1,5,2,37,0,119,7,103,7,119,6,87,7,119,5,103,6,69,7,69,7,117,4,85,6,101,5,53,7,117,3,117,3,69,6,69,6,87,5,87,4,101,3,101,3,35,7,115,2,101,4,5,7,115,0,115,0,99,2,99,2,69,5,53,5,3,6,3,6,85,3,69,4,51,6,35,6,37,5,85,2,19,5,19,5,83,1,83,1,53,4,69,3,3,5,83,0,35,4,67,2,51,3,3,4,0,0,0,0,23,1,7,1,21,0,21,0,3,0,3,0,3,0,3,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,20,0,0,0,2,0,0,0,48,0,0,0,0,0,0,0,250,51,248,31,147,234,185,31,32,209,61,31,105,217,132,30,207,107,144,29,139,100,98,28,15,16,253,26,139,38,99,25,164,198,151,23,91,111,158,21,64,249,122,19,243,142,49,17,7,165,198,14,83,241,62,12,197,97,159,9,197,18,237,6,68,69,45,4,124,84,101,1,129,74,184,13,127,157,27,14,207,173,49,15,21,168,187,15,23,164,237,15,200,143,252,15,76,150,255,15,211,248,255,15,0,0,5,128,15,128,10,0,27,128,30,0,20,0,17,128,51,128,54,0,60,0,57,128,40,0,45,128,39,128,34,0,99,128,102,0,108,0,105,128,120,0,125,128,119,128,114,0,80,0,85,128,95,128,90,0,75,128,78,0,68,0,65,128,195,128,198,0,204,0,201,128,216,0,221,128,215,128,210,0,240,0,245,128,255,128,250,0,235,128,238,0,228,0,225,128,160,0,165,128,175,128,170,0,187,128,190,0,180,0,177,128,147,128,150,0,156,0,153,128,136,0,141,128,135,128,130,0,131,129,134,1,140,1,137,129,152,1,157,129,151,129,146,1,176,1,181,129,191,129,186,1,171,129,174,1,164,1,161,129,224,1,229,129,239,129,234,1,251,129,254,1,244,1,241,129,211,129,214,1,220,1,217,129,200,1,205,129,199,129,194,1,64,1,69,129,79,129,74,1,91,129,94,1,84,1,81,129,115,129,118,1,124,1,121,129,104,1,109,129,103,129,98,1,35,129,38,1,44,1,41,129,56,1,61,129,55,129,50,1,16,1,21,129,31,129,26,1,11,129,14,1,4,1,1,129,3,131,6,3,12,3,9,131,24,3,29,131,23,131,18,3,48,3,53,131,63,131,58,3,43,131,46,3,36,3,33,131,96,3,101,131,111,131,106,3,123,131,126,3,116,3,113,131,83,131,86,3,92,3,89,131,72,3,77,131,71,131,66,3,192,3,197,131,207,131,202,3,219,131,222,3,212,3,209,131,243,131,246,3,252,3,249,131,232,3,237,131,231,131,226,3,163,131,166,3,172,3,169,131,184,3,189,131,183,131,178,3,144,3,149,131,159,131,154,3,139,131,142,3,132,3,129,131,128,2,133,130,143,130,138,2,155,130,158,2,148,2,145,130,179,130,182,2,188,2,185,130,168,2,173,130,167,130,162,2,227,130,230,2,236,2,233,130,248,2,253,130,247,130,242,2,208,2,213,130,223,130,218,2,203,130,206,2,196,2,193,130,67,130,70,2,76,2,73,130,88,2,93,130,87,130,82,2,112,2,117,130,127,130,122,2,107,130,110,2,100,2,97,130,32,2,37,130,47,130,42,2])
.concat([59,130,62,2,52,2,49,130,19,130,22,2,28,2,25,130,8,2,13,130,7,130,2,2,25,160,196,247,46,201,115,248,236,103,252,250,47,226,22,253,198,159,124,254,121,52,88,255,185,215,197,255,76,216,240,255,0,0,0,0,0,125,0,0,0,250,0,0,0,119,1,0,0,244,1,0,0,113,2,0,0,238,2,0,0,107,3,0,0,232,3,0,0,101,4,0,0,226,4,0,0,95,5,0,0,220,5,0,0,89,6,0,0,214,6,0,0,0,0,0,0,125,0,0,128,187,0,0,192,218,0,0,0,250,0,0,128,56,1,0,0,119,1,0,128,181,1,0,0,244,1,0,0,113,2,0,0,238,2,0,0,107,3,0,0,232,3,0,0,226,4,0,0,220,5,0,0,0,0,0,0,125,0,0,64,156,0,0,128,187,0,0,192,218,0,0,0,250,0,0,128,56,1,0,0,119,1,0,128,181,1,0,0,244,1,0,0,113,2,0,0,238,2,0,0,107,3,0,0,232,3,0,0,226,4,0,0,0,0,0,0,125,0,0,128,187,0,0,192,218,0,0,0,250,0,0,128,56,1,0,0,119,1,0,128,181,1,0,0,244,1,0,128,50,2,0,0,113,2,0,128,175,2,0,0,238,2,0,0,107,3,0,0,232,3,0,0,0,0,0,64,31,0,0,128,62,0,0,192,93,0,0,0,125,0,0,64,156,0,0,128,187,0,0,192,218,0,0,0,250,0,0,128,56,1,0,0,119,1,0,128,181,1,0,0,244,1,0,128,50,2,0,0,113,2,0,0,0,0,0,2,0,0,0,2,0,3,0,3,0,3,0,3,0,1,0,4,0,2,0,4,0,3,0,4,0,4,0,4,0,5,0,97,109,98,105,103,117,111,117,115,32,111,112,116,105,111,110,32,45,45,32,37,46,42,115,0,0,0,0,0,0,0,0,67,82,67,32,99,104,101,99,107,32,102,97,105,108,101,100,0,0,0,0,0,0,0,0,114,101,115,101,114,118,101,100,32,101,109,112,104,97,115,105,115,32,118,97,108,117,101,0,114,101,115,101,114,118,101,100,32,115,97,109,112,108,101,32,102,114,101,113,117,101,110,99,121,32,118,97,108,117,101,0,80,79,83,73,88,76,89,95,67,79,82,82,69,67,84,0,102,111,114,98,105,100,100,101,110,32,98,105,116,114,97,116,101,32,118,97,108,117,101,0,114,101,115,101,114,118,101,100,32,104,101,97,100,101,114,32,108,97,121,101,114,32,118,97,108,117,101,0,0,0,0,0,108,111,115,116,32,115,121,110,99,104,114,111,110,105,122,97,116,105,111,110,0,0,0,0,109,97,120,32,115,121,115,116,101,109,32,98,121,116,101,115,32,61,32,37,49,48,108,117,10,0,0,0,0,0,0,0,115,116,100,58,58,101,120,99,101,112,116,105,111,110,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,116,105,109,101,114,46,99,0,110,111,116,32,101,110,111,117,103,104,32,109,101,109,111,114,121,0,0,0,0,0,0,0,105,110,32,117,115,101,32,98,121,116,101,115,32,32,32,32,32,61,32,37,49,48,108,117,10,0,0,0,0,0,0,0,37,115,58,32,0,0,0,0,102,97,99,116,111,114,32,33,61,32,48,0,0,0,0,0,37,115,10,0,0,0,0,0,105,110,118,97,108,105,100,32,40,110,117,108,108,41,32,98,117,102,102,101,114,32,112,111,105,110,116,101,114,0,0,0,37,115,10,0,0,0,0,0,105,110,99,111,109,112,97,116,105,98,108,101,32,98,108,111,99,107,95,116,121,112,101,32,102,111,114,32,74,83,0,0,72,117,102,102,109,97,110,32,100,97,116,97,32,111,118,101,114,114,117,110,0,0,0,0,45,98,105,116,115,95,108,101,102,116,32,60,61,32,77,65,68,95,66,85,70,70,69,82,95,71,85,65,82,68,32,42,32,67,72,65,82,95,66,73,84,0,0,0,0,0,0,0,37,115,58,32,0,0,0,0,98,97,100,32,72,117,102,102,109,97,110,32,116,97,98,108,101,32,115,101,108,101,99,116,0,0,0,0,0,0,0,0,98,97,100,32,97,117,100,105,111,32,100,97,116,97,32,108,101,110,103,116,104,0,0,0,0,0,0,0,0,0,0,0,98,97,100,32,109,97,105,110,95,100,97,116,97,95,98,101,103,105,110,32,112,111,105,110,116,101,114,0,0,0,0,0,110,111,32,101,114,114,111,114,0,0,0,0,0,0,0,0,98,97,100,32,115,99,97,108,101,102,97,99,116,111,114,32,115,101,108,101,99,116,105,111,110,32,105,110,102,111,0,0,37,115,58,32,0,0,0,0,114,101,115,101,114,118,101,100,32,98,108,111,99,107,95,116,121,112,101,0,0,0,0,0,98,97,100,95,97,114,114,97,121,95,110,101,119,95,108,101,110,103,116,104,0,0,0,0,98,97,100,32,98,105,103,95,118,97,108,117,101,115,32,99,111,117,110,116,0,0,0,0,115,121,115,116,101,109,32,98,121,116,101,115,32,32,32,32,32,61,32,37,49,48,108,117,10,0,0,0,0,0,0,0,100,101,110,111,109,32,33,61,32,48,0,0,0,0,0,0,98,97,100,32,102,114,97,109,101,32,108,101,110,103,116,104,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,58,32,0,0,0,0,0,0,98,97,100,32,98,105,116,114,97,116,101,47,109,111,100,101,32,99,111,109,98,105,110,97,116,105,111,110,0,0,0,0,105,110,112,117,116,32,98,117,102,102,101,114,32,116,111,111,32,115,109,97,108,108,32,40,111,114,32,69,79,70,41,0,10,0,0,0,0,0,0,0,58,32,0,0,0,0,0,0,98,97,100,32,115,99,97,108,101,102,97,99,116,111,114,32,105,110,100,101,120,0,0,0,37,115,58,32,0,0,0,0,102,111,114,98,105,100,100,101,110,32,98,105,116,32,97,108,108,111,99,97,116,105,111,110,32,118,97,108,117,101,0,0,115,116,114,101,97,109,45,62,109,100,95,108,101,110,32,43,32,109,100,95,108,101,110,32,45,32,115,105,46,109,97,105,110,95,100,97,116,97,95,98,101,103,105,110,32,60,61,32,77,65,68,95,66,85,70,70,69,82,95,77,68,76,69,78,0,0,0,0,0,0,0,0,108,97,121,101,114,51,46,99,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,115,99,97,108,101,95,114,97,116,105,111,110,97,108,0,0,114,101,100,117,99,101,95,114,97,116,105,111,110,97,108,0,109,97,100,95,108,97,121,101,114,95,73,73,73,0,0,0,73,73,73,95,104,117,102,102,100,101,99,111,100,101,0,0,0,0,0,0,112,168,0,0,36,0,0,0,38,0,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,168,0,0,44,0,0,0,10,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,168,0,0,44,0,0,0,12,0,0,0,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,50,48,98,97,100,95,97,114,114,97,121,95,110,101,119,95,108,101,110,103,116,104,0,0,0,0,0,0,0,0,0,0,0,0,48,168,0,0,0,0,0,0,64,168,0,0,112,168,0,0,0,0,0,0,0,0,0,0,80,168,0,0,120,168,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,249,255,255,255,53,0,0,0,141,255,255,255,253,1,0,0,248,250,255,255,108,6,0,0,100,219,255,255,72,73,0,0,156,36,0,0,108,6,0,0,8,5,0,0,253,1,0,0,115,0,0,0,53,0,0,0,7,0,0,0,0,0,0,0,249,255,255,255,53,0,0,0,141,255,255,255,253,1,0,0,248,250,255,255,108,6,0,0,100,219,255,255,72,73,0,0,156,36,0,0,108,6,0,0,8,5,0,0,253,1,0,0,115,0,0,0,53,0,0,0,7,0,0,0,0,0,0,0,248,255,255,255,55,0,0,0,126,255,255,255,244,1,0,0,157,250,255,255,210,5,0,0,150,217,255,255,60,73,0,0,206,34,0,0,248,6,0,0,173,4,0,0,4,2,0,0,100,0,0,0,52,0,0,0,7,0,0,0,0,0,0,0,248,255,255,255,55,0,0,0,126,255,255,255,244,1,0,0,157,250,255,255,210,5,0,0,150,217,255,255,60,73,0,0,206,34,0,0,248,6,0,0,173,4,0,0,4,2,0,0,100,0,0,0,52,0,0,0,7,0,0,0,0,0,0,0,247,255,255,255,56,0,0,0,111,255,255,255,232,1,0,0,66,250,255,255,42,5,0,0,202,215,255,255,26,73,0,0,0,33,0,0,118,7,0,0,82,4,0,0,8,2,0,0,87,0,0,0,51,0,0,0,6,0,0,0,0,0,0,0,247,255,255,255,56,0,0,0,111,255,255,255,232,1,0,0,66,250,255,255,42,5,0,0,202,215,255,255,26,73,0,0,0,33,0,0,118,7,0,0,82,4,0,0,8,2,0,0,87,0,0,0,51,0,0,0,6,0,0,0,0,0,0,0,246,255,255,255,56,0,0,0,95,255,255,255,217,1,0,0,233,249,255,255,116,4,0,0,0,214,255,255,226,72,0,0,51,31,0,0,231,7,0,0,248,3,0,0,10,2,0,0,74,0,0,0,49,0,0,0,5,0,0,0,0,0,0,0,246,255,255,255,56,0,0,0,95,255,255,255,217,1,0,0,233,249,255,255,116,4,0,0,0,214,255,255,226,72,0,0,51,31,0,0,231,7,0,0,248,3,0,0,10,2,0,0,74,0,0,0,49,0,0,0,5,0,0,0,0,0,0,0,246,255,255,255,57,0,0,0,78,255,255,255,200,1,0,0,145,249,255,255,176,3,0,0,59,212,255,255,146,72,0,0,104,29,0,0,75,8,0,0,158,3,0,0,9,2,0,0,61,0,0,0,48,0,0,0,5,0,0,0,0,0,0,0,246,255,255,255,57,0,0,0,78,255,255,255,200,1,0,0,145,249,255,255,176,3,0,0,59,212,255,255,146,72,0,0,104,29,0,0,75,8,0,0,158,3,0,0,9,2,0,0,61,0,0,0,48,0,0,0,5,0,0,0,0,0,0,0,245,255,255,255,57,0,0,0,61,255,255,255,179,1,0,0,58,249,255,255,222,2,0,0,122,210,255,255,45,72,0,0,160,27,0,0,162,8,0,0,70,3,0,0,7,2,0,0,49,0,0,0,46,0,0,0,4,0,0,0,0,0,0,0,245,255,255,255,57,0,0,0,61,255,255,255,179,1,0,0,58,249,255,255,222,2,0,0,122,210,255,255,45,72,0,0,160,27,0,0,162,8,0,0,70,3,0,0,7,2,0,0,49,0,0,0,46,0,0,0,4,0,0,0,0,0,0,0,244,255,255,255,57,0,0,0,44,255,255,255,155,1,0,0,230,248,255,255,253,1,0,0,190,208,255,255,178,71,0,0,221,25,0,0,237,8,0,0,239,2,0,0,2,2,0,0,38,0,0,0,44,0,0,0,4,0,0,0,0,0,0,0,244,255,255,255,57,0,0,0,44,255,255,255,155,1,0,0,230,248,255,255,253,1,0,0,190,208,255,255,178,71,0,0,221,25,0,0,237,8,0,0,239,2,0,0,2,2,0,0,38,0,0,0,44,0,0,0,4,0,0,0,255,255,255,255,243,255,255,255,57,0,0,0,26,255,255,255,128,1,0,0,149,248,255,255,15,1,0,0,10,207,255,255,33,71,0,0,30,24,0,0,43,9,0,0,154,2,0,0,252,1,0,0,28,0,0,0,42,0,0,0,4,0,0,0,255,255,255,255,243,255,255,255,57,0,0,0,26,255,255,255,128,1,0,0,149,248,255,255,15,1,0,0,10,207,255,255,33,71,0,0,30,24,0,0,43,9,0,0,154,2,0,0,252,1,0,0,28,0,0,0,42,0,0,0,4,0,0,0,255,255,255,255,241,255,255,255,56,0,0,0,8,255,255,255,98,1,0,0,70,248,255,255,18,0,0,0,93,205,255,255,122,70,0,0,100,22,0,0,94,9,0,0,71,2,0,0,244,1,0,0,18,0,0,0,40,0,0,0,3,0,0,0,255,255,255,255,241,255,255,255,56,0,0,0,8,255,255,255,98,1,0,0,70,248,255,255,18,0,0,0,93,205,255,255,122,70,0,0,100,22,0,0,94,9,0,0,71,2,0,0,244,1,0,0,18,0,0,0,40,0,0,0,3,0,0,0,255,255,255,255,240,255,255,255,55,0,0,0,246,254,255,255,64,1,0,0,252,247,255,255,6,255,255,255,184,203,255,255,191,69,0,0,177,20,0,0,134,9,0,0,246,1,0,0,235,1,0,0,9,0,0,0,39,0,0,0,3,0,0,0,255,255,255,255,240,255,255,255,55,0,0,0,246,254,255,255,64,1,0,0,252,247,255,255,6,255,255,255,184,203,255,255,191,69,0,0,177,20,0,0,134,9,0,0,246,1,0,0,235,1,0,0,9,0,0,0,39,0,0,0,3,0,0,0,255,255,255,255,239,255,255,255,54,0,0,0,228,254,255,255,27,1,0,0,181,247,255,255,237,253,255,255,29,202,255,255,240,68,0,0,6,19,0,0,162,9,0,0,167,1,0,0,224,1,0,0,1,0,0,0,37,0,0,0,3,0,0,0,255,255,255,255,239,255,255,255,54,0,0,0,228,254,255,255,27,1,0,0,181,247,255,255,237,253,255,255,29,202,255,255,240,68,0,0,6,19,0,0,162,9,0,0,167,1,0,0,224,1,0,0,1,0,0,0,37,0,0,0,3,0,0,0,255,255,255,255,238,255,255,255,52,0,0,0,209,254,255,255,243,0,0,0,115,247,255,255,199,252,255,255,141,200,255,255,12,68,0,0,98,17,0,0,180,9,0,0,91,1,0,0,212,1,0,0,249,255,255,255,35,0,0,0,2,0,0,0,255,255,255,255,238,255,255,255,52,0,0,0,209,254,255,255,243,0,0,0,115,247,255,255,199,252,255,255,141,200,255,255,12,68,0,0,98,17,0,0,180,9,0,0,91,1,0,0,212,1,0,0,249,255,255,255,35,0,0,0,2,0,0,0,255,255,255,255,236,255,255,255,50,0,0,0,191,254,255,255,199,0,0,0,54,247,255,255,147,251,255,255,9,199,255,255,21,67,0,0,199,15,0,0,188,9,0,0,18,1,0,0,198,1,0,0,242,255,255,255,33,0,0,0,2,0,0,0,255,255,255,255,236,255,255,255,50,0,0,0,191,254,255,255,199,0,0,0,54,247,255,255,147,251,255,255,9,199,255,255,21,67,0,0,199,15,0,0,188,9,0,0,18,1,0,0,198,1,0,0,242,255,255,255,33,0,0,0,2,0,0,0,255,255,255,255,235,255,255,255,47,0,0,0,173,254,255,255,151,0,0,0,255,246,255,255,81,250,255,255,144,197,255,255,11,66,0,0,53,14,0,0,186,9,0,0,204,0,0,0,184,1,0,0,235,255,255,255,31,0,0,0,2,0,0,0,255,255,255,255,235,255,255,255,47,0,0,0,173,254,255,255,151,0,0,0,255,246,255,255,81,250,255,255,144,197,255,255,11,66,0,0,53,14,0,0,186,9,0,0,204,0,0,0,184,1,0,0,235,255,255,255,31,0,0,0,2,0,0,0,255,255,255,255,233,255,255,255,44,0,0,0,155,254,255,255,101,0,0,0,206,246,255,255,3,249,255,255,38,196,255,255,240,64,0,0,173,12,0,0,175,9,0,0,136,0,0,0,169,1,0,0,229,255,255,255,29,0,0,0,2,0,0,0,255,255,255,255,233,255,255,255,44,0,0,0,155,254,255,255,101,0,0,0,206,246,255,255,3,249,255,255,38,196,255,255,240,64,0,0,173,12,0,0,175,9,0,0,136,0,0,0,169,1,0,0,229,255,255,255,29,0,0,0,2,0,0,0,255,255,255,255,232,255,255,255,41,0,0,0,137,254,255,255,46,0,0,0,164,246,255,255,169,247,255,255,201,194,255,255,195,63,0,0,48,11,0,0,156,9,0,0,72,0,0,0,153,1,0,0,224,255,255,255,28,0,0,0,2,0,0,0,255,255,255,255,232,255,255,255,41,0,0,0,137,254,255,255,46,0,0,0,164,246,255,255,169,247,255,255,201,194,255,255,195,63,0,0,48,11,0,0,156,9,0,0,72,0,0,0,153,1,0,0,224,255,255,255,28,0,0,0,2,0,0,0,255,255,255,255,230,255,255,255,37,0,0,0,120,254,255,255,245,255,255,255,128,246,255,255,66,246,255,255,123,193,255,255,133,62,0,0,190,9,0,0,128,9,0,0,11,0,0,0,136,1,0,0,219,255,255,255,26,0,0,0,1,0,0,0,255,255,255,255,230,255,255,255,37,0,0,0,120,254,255,255,245,255,255,255,128,246,255,255,66,246,255,255,123,193,255,255,133,62,0,0,190,9,0,0,128,9,0,0,11,0,0,0,136,1,0,0,219,255,255,255,26,0,0,0,1,0,0,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
HEAP32[((43120)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((43128)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((43144)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
__ZNSt9bad_allocC1Ev = 8;
__ZNSt9bad_allocD1Ev = 44;
__ZNSt20bad_array_new_lengthC1Ev = 40;
__ZNSt20bad_array_new_lengthD1Ev = (44);
__ZNSt20bad_array_new_lengthD2Ev = (44);
_err = 42;
_errx = 14;
_warn = 4;
_warnx = 50;
_verr = 26;
_verrx = 18;
_vwarn = 32;
_vwarnx = 30;
}
if (!awaitingMemoryInitializer) runPostSets();
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,ELBIN:75,EDOTDOT:76,EBADMSG:77,EFTYPE:79,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENMFILE:89,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EPROCLIM:130,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,ENOSHARE:136,ECASECLASH:137,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STATIC);var FS={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:true,createFileHandle:function (stream, fd) {
        if (typeof stream === 'undefined') {
          stream = null;
        }
        if (!fd) {
          if (stream && stream.socket) {
            for (var i = 1; i < 64; i++) {
              if (!FS.streams[i]) {
                fd = i;
                break;
              }
            }
            assert(fd, 'ran out of low fds for sockets');
          } else {
            fd = Math.max(FS.streams.length, 64);
            for (var i = FS.streams.length; i < fd; i++) {
              FS.streams[i] = null; // Keep dense
            }
          }
        }
        // Close WebSocket first if we are about to replace the fd (i.e. dup2)
        if (FS.streams[fd] && FS.streams[fd].socket && FS.streams[fd].socket.close) {
          FS.streams[fd].socket.close();
        }
        FS.streams[fd] = stream;
        return fd;
      },removeFileHandle:function (fd) {
        FS.streams[fd] = null;
      },joinPath:function (parts, forceRelative) {
        var ret = parts[0];
        for (var i = 1; i < parts.length; i++) {
          if (ret[ret.length-1] != '/') ret += '/';
          ret += parts[i];
        }
        if (forceRelative && ret[0] == '/') ret = ret.substr(1);
        return ret;
      },absolutePath:function (relative, base) {
        if (typeof relative !== 'string') return null;
        if (base === undefined) base = FS.currentPath;
        if (relative && relative[0] == '/') base = '';
        var full = base + '/' + relative;
        var parts = full.split('/').reverse();
        var absolute = [''];
        while (parts.length) {
          var part = parts.pop();
          if (part == '' || part == '.') {
            // Nothing.
          } else if (part == '..') {
            if (absolute.length > 1) absolute.pop();
          } else {
            absolute.push(part);
          }
        }
        return absolute.length == 1 ? '/' : absolute.join('/');
      },analyzePath:function (path, dontResolveLastLink, linksVisited) {
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        path = FS.absolutePath(path);
        if (path == '/') {
          ret.isRoot = true;
          ret.exists = ret.parentExists = true;
          ret.name = '/';
          ret.path = ret.parentPath = '/';
          ret.object = ret.parentObject = FS.root;
        } else if (path !== null) {
          linksVisited = linksVisited || 0;
          path = path.slice(1).split('/');
          var current = FS.root;
          var traversed = [''];
          while (path.length) {
            if (path.length == 1 && current.isFolder) {
              ret.parentExists = true;
              ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
              ret.parentObject = current;
              ret.name = path[0];
            }
            var target = path.shift();
            if (!current.isFolder) {
              ret.error = ERRNO_CODES.ENOTDIR;
              break;
            } else if (!current.read) {
              ret.error = ERRNO_CODES.EACCES;
              break;
            } else if (!current.contents.hasOwnProperty(target)) {
              ret.error = ERRNO_CODES.ENOENT;
              break;
            }
            current = current.contents[target];
            if (current.link && !(dontResolveLastLink && path.length == 0)) {
              if (linksVisited > 40) { // Usual Linux SYMLOOP_MAX.
                ret.error = ERRNO_CODES.ELOOP;
                break;
              }
              var link = FS.absolutePath(current.link, traversed.join('/'));
              ret = FS.analyzePath([link].concat(path).join('/'),
                                   dontResolveLastLink, linksVisited + 1);
              return ret;
            }
            traversed.push(target);
            if (path.length == 0) {
              ret.exists = true;
              ret.path = traversed.join('/');
              ret.object = current;
            }
          }
        }
        return ret;
      },findObject:function (path, dontResolveLastLink) {
        FS.ensureRoot();
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },createObject:function (parent, name, properties, canRead, canWrite) {
        if (!parent) parent = '/';
        if (typeof parent === 'string') parent = FS.findObject(parent);
        if (!parent) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent path must exist.');
        }
        if (!parent.isFolder) {
          ___setErrNo(ERRNO_CODES.ENOTDIR);
          throw new Error('Parent must be a folder.');
        }
        if (!parent.write && !FS.ignorePermissions) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent folder must be writeable.');
        }
        if (!name || name == '.' || name == '..') {
          ___setErrNo(ERRNO_CODES.ENOENT);
          throw new Error('Name must not be empty.');
        }
        if (parent.contents.hasOwnProperty(name)) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          throw new Error("Can't overwrite object.");
        }
        parent.contents[name] = {
          read: canRead === undefined ? true : canRead,
          write: canWrite === undefined ? false : canWrite,
          timestamp: Date.now(),
          inodeNumber: FS.nextInode++
        };
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            parent.contents[name][key] = properties[key];
          }
        }
        return parent.contents[name];
      },createFolder:function (parent, name, canRead, canWrite) {
        var properties = {isFolder: true, isDevice: false, contents: {}};
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createPath:function (parent, path, canRead, canWrite) {
        var current = FS.findObject(parent);
        if (current === null) throw new Error('Invalid parent.');
        path = path.split('/').reverse();
        while (path.length) {
          var part = path.pop();
          if (!part) continue;
          if (!current.contents.hasOwnProperty(part)) {
            FS.createFolder(current, part, canRead, canWrite);
          }
          current = current.contents[part];
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        properties.isFolder = false;
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        if (typeof data === 'string') {
          var dataArray = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
          data = dataArray;
        }
        var properties = {
          isDevice: false,
          contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
        };
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.init();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },createLink:function (parent, name, target, canRead, canWrite) {
        var properties = {isDevice: false, link: target};
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createDevice:function (parent, name, input, output) {
        if (!(input || output)) {
          throw new Error('A device must have at least one callback defined.');
        }
        var ops = {isDevice: true, input: input, output: output};
        return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },ensureRoot:function () {
        if (FS.root) return;
        // The main file system tree. All the contents are inside this.
        FS.root = {
          read: true,
          write: true,
          isFolder: true,
          isDevice: false,
          timestamp: Date.now(),
          inodeNumber: 1,
          contents: {}
        };
      },init:function (input, output, error) {
        // Make sure we initialize only once.
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureRoot();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input = input || Module['stdin'];
        output = output || Module['stdout'];
        error = error || Module['stderr'];
        // Default handlers.
        var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
        if (!input) {
          stdinOverridden = false;
          input = function() {
            if (!input.cache || !input.cache.length) {
              var result;
              if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');
                if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
              }
              if (!result) result = '';
              input.cache = intArrayFromString(result + '\n', true);
            }
            return input.cache.shift();
          };
        }
        var utf8 = new Runtime.UTF8Processor();
        function simpleOutput(val) {
          if (val === null || val === 10) {
            output.printer(output.buffer.join(''));
            output.buffer = [];
          } else {
            output.buffer.push(utf8.processCChar(val));
          }
        }
        if (!output) {
          stdoutOverridden = false;
          output = simpleOutput;
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = simpleOutput;
        }
        if (!error.printer) error.printer = Module['print'];
        if (!error.buffer) error.buffer = [];
        // Create the temporary folder, if not already created
        try {
          FS.createFolder('/', 'tmp', true, true);
        } catch(e) {}
        // Create the I/O devices.
        var devFolder = FS.createFolder('/', 'dev', true, true);
        var stdin = FS.createDevice(devFolder, 'stdin', input);
        var stdout = FS.createDevice(devFolder, 'stdout', null, output);
        var stderr = FS.createDevice(devFolder, 'stderr', null, error);
        FS.createDevice(devFolder, 'tty', input, output);
        FS.createDevice(devFolder, 'null', function(){}, function(){});
        // Create default streams.
        FS.streams[1] = {
          path: '/dev/stdin',
          object: stdin,
          position: 0,
          isRead: true,
          isWrite: false,
          isAppend: false,
          isTerminal: !stdinOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[2] = {
          path: '/dev/stdout',
          object: stdout,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stdoutOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[3] = {
          path: '/dev/stderr',
          object: stderr,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stderrOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        // TODO: put these low in memory like we used to assert on: assert(Math.max(_stdin, _stdout, _stderr) < 15000); // make sure these are low, we flatten arrays with these
        HEAP32[((_stdin)>>2)]=1;
        HEAP32[((_stdout)>>2)]=2;
        HEAP32[((_stderr)>>2)]=3;
        // Other system paths
        FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
        // Newlib initialization
        for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++) {
          FS.streams[i] = null; // Make sure to keep FS.streams dense
        }
        FS.streams[_stdin] = FS.streams[1];
        FS.streams[_stdout] = FS.streams[2];
        FS.streams[_stderr] = FS.streams[3];
        allocate([ allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*', ALLOC_NORMAL) ], 'void*', ALLOC_NONE, __impure_ptr);
      },quit:function () {
        if (!FS.init.initialized) return;
        // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
        if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output(10);
        if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output(10);
      },standardizePath:function (path) {
        if (path.substr(0, 2) == './') path = path.substr(2);
        return path;
      },deleteFile:function (path) {
        path = FS.analyzePath(path);
        if (!path.parentExists || !path.exists) {
          throw 'Invalid path ' + path;
        }
        delete path.parentObject.contents[path.name];
      }};function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      if (FS.streams[fildes]) {
        if (FS.streams[fildes].currentEntry) {
          _free(FS.streams[fildes].currentEntry);
        }
        FS.streams[fildes] = null;
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }
  function _wait(stat_loc) {
      // pid_t wait(int *stat_loc);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/wait.html
      // Makes no sense in a single-process environment.
      ___setErrNo(ERRNO_CODES.ECHILD);
      return -1;
    }var _waitpid=_wait;
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
  var ___flock_struct_layout={__size__:16,l_type:0,l_whence:2,l_start:4,l_len:8,l_pid:12,l_xxx:14};function _fcntl(fildes, cmd, varargs, dup2) {
      // int fcntl(int fildes, int cmd, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/fcntl.html
      if (!FS.streams[fildes]) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      var stream = FS.streams[fildes];
      switch (cmd) {
        case 0:
          var arg = HEAP32[((varargs)>>2)];
          if (arg < 0) {
            ___setErrNo(ERRNO_CODES.EINVAL);
            return -1;
          }
          var newStream = {};
          for (var member in stream) {
            newStream[member] = stream[member];
          }
          arg = dup2 ? arg : Math.max(arg, FS.streams.length); // dup2 wants exactly arg; fcntl wants a free descriptor >= arg
          FS.createFileHandle(newStream, arg);
          return arg;
        case 1:
        case 2:
          return 0;  // FD_CLOEXEC makes no sense for a single process.
        case 3:
          var flags = 0;
          if (stream.isRead && stream.isWrite) flags = 2;
          else if (!stream.isRead && stream.isWrite) flags = 1;
          else if (stream.isRead && !stream.isWrite) flags = 0;
          if (stream.isAppend) flags |= 8;
          // Synchronization and blocking flags are irrelevant to us.
          return flags;
        case 4:
          var arg = HEAP32[((varargs)>>2)];
          stream.isAppend = Boolean(arg | 8);
          // Synchronization and blocking flags are irrelevant to us.
          return 0;
        case 7:
        case 20:
          var arg = HEAP32[((varargs)>>2)];
          var offset = ___flock_struct_layout.l_type;
          // We're always unlocked.
          HEAP16[(((arg)+(offset))>>1)]=3
          return 0;
        case 8:
        case 9:
        case 21:
        case 22:
          // Pretend that the locking is successful.
          return 0;
        case 6:
        case 5:
          // These are for sockets. We don't have them fully implemented yet.
          ___setErrNo(ERRNO_CODES.EINVAL);
          return -1;
        default:
          ___setErrNo(ERRNO_CODES.EINVAL);
          return -1;
      }
      // Should never be reached. Only to silence strict warnings.
      return -1;
    }
  function _recv(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      if (!info.hasData()) {
        ___setErrNo(ERRNO_CODES.EAGAIN); // no data, and all sockets are nonblocking, so this is the right behavior
        return -1;
      }
      var buffer = info.inQueue.shift();
      if (len < buffer.length) {
        if (info.stream) {
          // This is tcp (reliable), so if not all was read, keep it
          info.inQueue.unshift(buffer.subarray(len));
        }
        buffer = buffer.subarray(0, len);
      }
      HEAPU8.set(buffer, buf);
      return buffer.length;
    }
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var bytesRead = 0;
        while (stream.ungotten.length && nbyte > 0) {
          HEAP8[((buf++)|0)]=stream.ungotten.pop()
          nbyte--;
          bytesRead++;
        }
        var contents = stream.object.contents;
        var size = Math.min(contents.length - offset, nbyte);
        if (contents.subarray) { // typed array
          HEAPU8.set(contents.subarray(offset, offset+size), buf);
        } else
        if (contents.slice) { // normal array
          for (var i = 0; i < size; i++) {
            HEAP8[(((buf)+(i))|0)]=contents[offset + i]
          }
        } else {
          for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
            HEAP8[(((buf)+(i))|0)]=contents.get(offset + i)
          }
        }
        bytesRead += size;
        return bytesRead;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
        return _recv(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var bytesRead;
        if (stream.object.isDevice) {
          if (stream.object.input) {
            bytesRead = 0;
            while (stream.ungotten.length && nbyte > 0) {
              HEAP8[((buf++)|0)]=stream.ungotten.pop()
              nbyte--;
              bytesRead++;
            }
            for (var i = 0; i < nbyte; i++) {
              try {
                var result = stream.object.input();
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
              if (result === undefined && bytesRead === 0) {
                ___setErrNo(ERRNO_CODES.EAGAIN);
                return -1;
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              HEAP8[(((buf)+(i))|0)]=result
            }
            return bytesRead;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var ungotSize = stream.ungotten.length;
          bytesRead = _pread(fildes, buf, nbyte, stream.position);
          if (bytesRead != -1) {
            stream.position += (stream.ungotten.length - ungotSize) + bytesRead;
          }
          return bytesRead;
        }
      }
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var contents = stream.object.contents;
        while (contents.length < offset) contents.push(0);
        for (var i = 0; i < nbyte; i++) {
          contents[offset + i] = HEAPU8[(((buf)+(i))|0)];
        }
        stream.object.timestamp = Date.now();
        return i;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
          return _send(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (stream.object.isDevice) {
          if (stream.object.output) {
            for (var i = 0; i < nbyte; i++) {
              try {
                stream.object.output(HEAP8[(((buf)+(i))|0)]);
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
            }
            stream.object.timestamp = Date.now();
            return i;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
          if (bytesWritten != -1) stream.position += bytesWritten;
          return bytesWritten;
        }
      }
    }
  function _pipe(fildes) {
      // int pipe(int fildes[2]);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/pipe.html
      // It is possible to implement this using two device streams, but pipes make
      // little sense in a single-threaded environment, so we do not support them.
      ___setErrNo(ERRNO_CODES.ENOSYS);
      return -1;
    }
  function _fork() {
      // pid_t fork(void);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fork.html
      // We don't support multiple processes.
      ___setErrNo(ERRNO_CODES.EAGAIN);
      return -1;
    }
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      function ExitStatus() {
        this.name = "ExitStatus";
        this.message = "Program terminated with exit(" + status + ")";
        this.status = status;
        Module.print('Exit Status: ' + status);
      };
      ExitStatus.prototype = new Error();
      ExitStatus.prototype.constructor = ExitStatus;
      exitRuntime();
      ABORT = true;
      throw new ExitStatus();
    }
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
    }
  Module["_memmove"] = _memmove;var _llvm_memmove_p0i8_p0i8_i32=_memmove;
  Module["_strlen"] = _strlen;
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }
  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  function ___gxx_personality_v0() {
    }
  function ___cxa_allocate_exception(size) {
      return _malloc(size);
    }
  function _llvm_eh_exception() {
      return HEAP32[((_llvm_eh_exception.buf)>>2)];
    }
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  function ___resumeException(ptr) {
      if (HEAP32[((_llvm_eh_exception.buf)>>2)] == 0) HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr;
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = HEAP32[((_llvm_eh_exception.buf)>>2)];
      if (throwntype == -1) throwntype = HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=type
      HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=destructor
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }
  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }
  function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      return ptr;
    }
  function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr);
      } catch(e) { // XXX FIXME
      }
    }function ___cxa_end_catch() {
      if (___cxa_end_catch.rethrown) {
        ___cxa_end_catch.rethrown = false;
        return;
      }
      // Clear state flag.
      asm['setThrew'](0);
      // Clear type.
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=0
      // Call destructor if one is registered then clear it.
      var ptr = HEAP32[((_llvm_eh_exception.buf)>>2)];
      var destructor = HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)];
      if (destructor) {
        Runtime.dynCall('vi', destructor, [ptr]);
        HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=0
      }
      // Free ptr if it isn't null.
      if (ptr) {
        ___cxa_free_exception(ptr);
        HEAP32[((_llvm_eh_exception.buf)>>2)]=0
      }
    }
  var _environ=allocate(1, "i32*", ALLOC_STATIC);var ___environ=_environ;function ___buildEnvironment(env) {
      // WARNING: Arbitrary limit!
      var MAX_ENV_VALUES = 64;
      var TOTAL_ENV_SIZE = 1024;
      // Statically allocate memory for the environment.
      var poolPtr;
      var envPtr;
      if (!___buildEnvironment.called) {
        ___buildEnvironment.called = true;
        // Set default values. Use string keys for Closure Compiler compatibility.
        ENV['USER'] = 'root';
        ENV['PATH'] = '/';
        ENV['PWD'] = '/';
        ENV['HOME'] = '/home/emscripten';
        ENV['LANG'] = 'en_US.UTF-8';
        ENV['_'] = './this.program';
        // Allocate memory.
        poolPtr = allocate(TOTAL_ENV_SIZE, 'i8', ALLOC_STATIC);
        envPtr = allocate(MAX_ENV_VALUES * 4,
                          'i8*', ALLOC_STATIC);
        HEAP32[((envPtr)>>2)]=poolPtr
        HEAP32[((_environ)>>2)]=envPtr;
      } else {
        envPtr = HEAP32[((_environ)>>2)];
        poolPtr = HEAP32[((envPtr)>>2)];
      }
      // Collect key=value lines.
      var strings = [];
      var totalSize = 0;
      for (var key in env) {
        if (typeof env[key] === 'string') {
          var line = key + '=' + env[key];
          strings.push(line);
          totalSize += line.length;
        }
      }
      if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error('Environment size exceeded TOTAL_ENV_SIZE!');
      }
      // Make new.
      var ptrSize = 4;
      for (var i = 0; i < strings.length; i++) {
        var line = strings[i];
        for (var j = 0; j < line.length; j++) {
          HEAP8[(((poolPtr)+(j))|0)]=line.charCodeAt(j);
        }
        HEAP8[(((poolPtr)+(j))|0)]=0;
        HEAP32[(((envPtr)+(i * ptrSize))>>2)]=poolPtr;
        poolPtr += line.length + 1;
      }
      HEAP32[(((envPtr)+(strings.length * ptrSize))>>2)]=0;
    }var ENV={};function _getenv(name) {
      // char *getenv(const char *name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/getenv.html
      if (name === 0) return 0;
      name = Pointer_stringify(name);
      if (!ENV.hasOwnProperty(name)) return 0;
      if (_getenv.ret) _free(_getenv.ret);
      _getenv.ret = allocate(intArrayFromString(ENV[name]), 'i8', ALLOC_NORMAL);
      return _getenv.ret;
    }
  function _strchr(ptr, chr) {
      ptr--;
      do {
        ptr++;
        var val = HEAP8[(ptr)];
        if (val == chr) return ptr;
      } while (val);
      return 0;
    }
  function _strncmp(px, py, n) {
      var i = 0;
      while (i < n) {
        var x = HEAPU8[(((px)+(i))|0)];
        var y = HEAPU8[(((py)+(i))|0)];
        if (x == y && x == 0) return 0;
        if (x == 0) return -1;
        if (y == 0) return 1;
        if (x == y) {
          i ++;
          continue;
        } else {
          return x > y ? 1 : -1;
        }
      }
      return 0;
    }
  var _llvm_va_start=undefined;
  function _llvm_va_end() {}
  function _vfprintf(s, f, va_arg) {
      return _fprintf(s, f, HEAP32[((va_arg)>>2)]);
    }
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"No message of desired type",36:"Identifier removed",37:"Channel number out of range",38:"Level 2 not synchronized",39:"Level 3 halted",40:"Level 3 reset",41:"Link number out of range",42:"Protocol driver not attached",43:"No CSI structure available",44:"Level 2 halted",45:"Deadlock condition",46:"No record locks available",50:"Invalid exchange",51:"Invalid request descriptor",52:"Exchange full",53:"No anode",54:"Invalid request code",55:"Invalid slot",56:"File locking deadlock error",57:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",74:"Multihop attempted",75:"Inode is remote (not really error)",76:"Cross mount point (not really error)",77:"Trying to read unreadable message",79:"Inappropriate file type or format",80:"Given log. name not unique",81:"f.d. invalid for this operation",82:"Remote address changed",83:"Can\t access a needed shared lib",84:"Accessing a corrupted shared lib",85:".lib section in a.out corrupted",86:"Attempting to link in too many libs",87:"Attempting to exec a shared library",88:"Function not implemented",89:"No more files",90:"Directory not empty",91:"File or path name too long",92:"Too many symbolic links",95:"Operation not supported on transport endpoint",96:"Protocol family not supported",104:"Connection reset by peer",105:"No buffer space available",106:"Address family not supported by protocol family",107:"Protocol wrong type for socket",108:"Socket operation on non-socket",109:"Protocol not available",110:"Can't send after socket shutdown",111:"Connection refused",112:"Address already in use",113:"Connection aborted",114:"Network is unreachable",115:"Network interface is not configured",116:"Connection timed out",117:"Host is down",118:"Host is unreachable",119:"Connection already in progress",120:"Socket already connected",121:"Destination address required",122:"Message too long",123:"Unknown protocol",124:"Socket type not supported",125:"Address not available",126:"ENETRESET",127:"Socket is already connected",128:"Socket is not connected",129:"TOOMANYREFS",130:"EPROCLIM",131:"EUSERS",132:"EDQUOT",133:"ESTALE",134:"Not supported",135:"No medium (in tape drive)",136:"No such host or network path",137:"Filename exists with different case",138:"EILSEQ",139:"Value too large for defined data type",140:"Operation canceled",141:"State not recoverable",142:"Previous owner died",143:"Streams pipe error"};function _strerror_r(errnum, strerrbuf, buflen) {
      if (errnum in ERRNO_MESSAGES) {
        if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
          return ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          var msg = ERRNO_MESSAGES[errnum];
          for (var i = 0; i < msg.length; i++) {
            HEAP8[(((strerrbuf)+(i))|0)]=msg.charCodeAt(i)
          }
          HEAP8[(((strerrbuf)+(i))|0)]=0
          return 0;
        }
      } else {
        return ___setErrNo(ERRNO_CODES.EINVAL);
      }
    }function _strerror(errnum) {
      if (!_strerror.buffer) _strerror.buffer = _malloc(256);
      _strerror_r(errnum, _strerror.buffer, 256);
      return _strerror.buffer;
    }
  function _exit(status) {
      __exit(status);
    }
  function _isspace(chr) {
      return chr in { 32: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0 };
    }
  var _llvm_memset_p0i8_i64=_memset;
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return -1;
      } else {
        return chr;
      }
    }
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        function getMimetype(name) {
          return {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'bmp': 'image/bmp',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg'
          }[name.substr(name.lastIndexOf('.')+1)];
        }
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/.exec(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x = event.pageX - (window.scrollX + rect.left);
          var y = event.pageY - (window.scrollY + rect.top);
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
___buildEnvironment(ENV);
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var Math_min = Math.min;
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm = (function(global, env, buffer) {
  'use asm';
  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);
  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;
  var __ZTVN10__cxxabiv120__si_class_type_infoE=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;
  var _stderr=env._stderr|0;
  var __ZTVN10__cxxabiv117__class_type_infoE=env.__ZTVN10__cxxabiv117__class_type_infoE|0;
  var ___progname=env.___progname|0;
  var NaN=+env.NaN;
  var Infinity=+env.Infinity;
  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;
  var tempRet0 = 0;
  var tempRet1 = 0;
  var tempRet2 = 0;
  var tempRet3 = 0;
  var tempRet4 = 0;
  var tempRet5 = 0;
  var tempRet6 = 0;
  var tempRet7 = 0;
  var tempRet8 = 0;
  var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var abort=env.abort;
  var assert=env.assert;
  var asmPrintInt=env.asmPrintInt;
  var asmPrintFloat=env.asmPrintFloat;
  var Math_min=env.min;
  var invoke_ii=env.invoke_ii;
  var invoke_vi=env.invoke_vi;
  var invoke_vii=env.invoke_vii;
  var invoke_iiii=env.invoke_iiii;
  var invoke_viii=env.invoke_viii;
  var invoke_v=env.invoke_v;
  var invoke_iii=env.invoke_iii;
  var invoke_viiii=env.invoke_viiii;
  var _strncmp=env._strncmp;
  var _fork=env._fork;
  var _snprintf=env._snprintf;
  var ___cxa_free_exception=env.___cxa_free_exception;
  var ___cxa_throw=env.___cxa_throw;
  var _strerror=env._strerror;
  var _abort=env._abort;
  var _fprintf=env._fprintf;
  var ___cxa_end_catch=env.___cxa_end_catch;
  var _close=env._close;
  var _pread=env._pread;
  var ___buildEnvironment=env.___buildEnvironment;
  var _strchr=env._strchr;
  var _fputc=env._fputc;
  var _sysconf=env._sysconf;
  var ___setErrNo=env.___setErrNo;
  var __reallyNegative=env.__reallyNegative;
  var _llvm_eh_exception=env._llvm_eh_exception;
  var _write=env._write;
  var _exit=env._exit;
  var _sprintf=env._sprintf;
  var ___cxa_find_matching_catch=env.___cxa_find_matching_catch;
  var ___cxa_allocate_exception=env.___cxa_allocate_exception;
  var _isspace=env._isspace;
  var _fcntl=env._fcntl;
  var _read=env._read;
  var ___cxa_is_number_type=env.___cxa_is_number_type;
  var _time=env._time;
  var __formatString=env.__formatString;
  var ___cxa_does_inherit=env.___cxa_does_inherit;
  var _getenv=env._getenv;
  var _vfprintf=env._vfprintf;
  var ___cxa_begin_catch=env.___cxa_begin_catch;
  var _llvm_va_end=env._llvm_va_end;
  var ___assert_func=env.___assert_func;
  var _wait=env._wait;
  var __ZSt18uncaught_exceptionv=env.__ZSt18uncaught_exceptionv;
  var _pwrite=env._pwrite;
  var _recv=env._recv;
  var ___cxa_call_unexpected=env.___cxa_call_unexpected;
  var _sbrk=env._sbrk;
  var _strerror_r=env._strerror_r;
  var ___errno_location=env.___errno_location;
  var ___gxx_personality_v0=env.___gxx_personality_v0;
  var _pipe=env._pipe;
  var _fwrite=env._fwrite;
  var __exit=env.__exit;
  var ___resumeException=env.___resumeException;
// EMSCRIPTEN_START_FUNCS
function stackAlloc(size){size=size|0;var ret=0;ret=STACKTOP;STACKTOP=STACKTOP+size|0;STACKTOP=STACKTOP+7>>3<<3;return ret|0}function stackSave(){return STACKTOP|0}function stackRestore(top){top=top|0;STACKTOP=top}function setThrew(threw,value){threw=threw|0;value=value|0;if((__THREW__|0)==0){__THREW__=threw;threwValue=value}}function copyTempFloat(ptr){ptr=ptr|0;HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1|0]=HEAP8[ptr+1|0];HEAP8[tempDoublePtr+2|0]=HEAP8[ptr+2|0];HEAP8[tempDoublePtr+3|0]=HEAP8[ptr+3|0]}function copyTempDouble(ptr){ptr=ptr|0;HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1|0]=HEAP8[ptr+1|0];HEAP8[tempDoublePtr+2|0]=HEAP8[ptr+2|0];HEAP8[tempDoublePtr+3|0]=HEAP8[ptr+3|0];HEAP8[tempDoublePtr+4|0]=HEAP8[ptr+4|0];HEAP8[tempDoublePtr+5|0]=HEAP8[ptr+5|0];HEAP8[tempDoublePtr+6|0]=HEAP8[ptr+6|0];HEAP8[tempDoublePtr+7|0]=HEAP8[ptr+7|0]}function setTempRet0(value){value=value|0;tempRet0=value}function setTempRet1(value){value=value|0;tempRet1=value}function setTempRet2(value){value=value|0;tempRet2=value}function setTempRet3(value){value=value|0;tempRet3=value}function setTempRet4(value){value=value|0;tempRet4=value}function setTempRet5(value){value=value|0;tempRet5=value}function setTempRet6(value){value=value|0;tempRet6=value}function setTempRet7(value){value=value|0;tempRet7=value}function setTempRet8(value){value=value|0;tempRet8=value}function setTempRet9(value){value=value|0;tempRet9=value}function _mad_bit_init($bitptr,$byte){$bitptr=$bitptr|0;$byte=$byte|0;HEAP32[$bitptr>>2]=$byte;HEAP16[$bitptr+4>>1]=0;HEAP16[$bitptr+6>>1]=8;return}function _mad_bit_length($begin,$end){$begin=$begin|0;$end=$end|0;return(HEAPU16[$begin+6>>1]|0)+8-(HEAPU16[$end+6>>1]|0)+((HEAP32[$end>>2]|0)-((HEAP32[$begin>>2]|0)+1)<<3)|0}function _mad_bit_nextbyte($bitptr){$bitptr=$bitptr|0;var $5=0;$5=HEAP32[$bitptr>>2]|0;return((HEAP16[$bitptr+6>>1]|0)==8?$5:$5+1|0)|0}function _mad_bit_skip($bitptr,$len){$bitptr=$bitptr|0;$len=$len|0;var $2=0,$6=0,$9=0,$10=0,$17=0,$19=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$bitptr|0;HEAP32[$2>>2]=(HEAP32[$2>>2]|0)+($len>>>3);$6=$bitptr+6|0;$9=(HEAPU16[$6>>1]|0)-($len&7)|0;$10=$9&65535;HEAP16[$6>>1]=$10;if(($9&65535)>>>0>8){label=2;break}else{$19=$10;label=3;break};case 2:HEAP32[$2>>2]=(HEAP32[$2>>2]|0)+1;$17=(HEAP16[$6>>1]|0)+8&65535;HEAP16[$6>>1]=$17;$19=$17;label=3;break;case 3:if(($19&65535)<8){label=4;break}else{label=5;break};case 4:HEAP16[$bitptr+4>>1]=HEAPU8[HEAP32[$2>>2]|0]|0;label=5;break;case 5:return}}function _mad_bit_read($bitptr,$len){$bitptr=$bitptr|0;$len=$len|0;var $1=0,$12=0,$14=0,$19=0,$21=0,$25=0,$26=0,$value_032=0,$_031=0,$31=0,$35=0,$36=0,$value_0_lcssa=0,$_0_lcssa=0,$41=0,$_030=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$bitptr+6|0;if((HEAP16[$1>>1]|0)==8){label=2;break}else{label=3;break};case 2:HEAP16[$bitptr+4>>1]=HEAPU8[HEAP32[$bitptr>>2]|0]|0;label=3;break;case 3:$12=HEAPU16[$1>>1]|0;$14=$bitptr+4|0;$19=(1<<$12)+65535&HEAPU16[$14>>1];if($12>>>0>$len>>>0){label=4;break}else{label=5;break};case 4:$21=$12-$len|0;HEAP16[$1>>1]=$21&65535;$_030=$19>>>($21>>>0);label=9;break;case 5:$25=$len-$12|0;$26=$bitptr|0;HEAP32[$26>>2]=(HEAP32[$26>>2]|0)+1;HEAP16[$1>>1]=8;if($25>>>0>7){$_031=$25;$value_032=$19;label=6;break}else{$_0_lcssa=$25;$value_0_lcssa=$19;label=7;break};case 6:$31=HEAP32[$26>>2]|0;HEAP32[$26>>2]=$31+1;$35=HEAPU8[$31]|$value_032<<8;$36=$_031-8|0;if($36>>>0>7){$_031=$36;$value_032=$35;label=6;break}else{$_0_lcssa=$36;$value_0_lcssa=$35;label=7;break};case 7:if(($_0_lcssa|0)==0){$_030=$value_0_lcssa;label=9;break}else{label=8;break};case 8:$41=HEAP8[HEAP32[$26>>2]|0]|0;HEAP16[$14>>1]=$41&255;HEAP16[$1>>1]=(HEAPU16[$1>>1]|0)-$_0_lcssa&65535;$_030=($41&255)>>>((8-$_0_lcssa|0)>>>0)|$value_0_lcssa<<$_0_lcssa;label=9;break;case 9:return $_030|0}return 0}function _mad_decoder_init($decoder,$data,$input_func,$header_func,$filter_func,$output_func,$error_func,$message_func){$decoder=$decoder|0;$data=$data|0;$input_func=$input_func|0;$header_func=$header_func|0;$filter_func=$filter_func|0;$output_func=$output_func|0;$error_func=$error_func|0;$message_func=$message_func|0;HEAP32[$decoder>>2]=-1;HEAP32[$decoder+4>>2]=0;HEAP32[$decoder+8>>2]=0;HEAP32[$decoder+12>>2]=-1;HEAP32[$decoder+16>>2]=-1;HEAP32[$decoder+20>>2]=0;HEAP32[$decoder+24>>2]=$data;HEAP32[$decoder+28>>2]=$input_func;HEAP32[$decoder+32>>2]=$header_func;HEAP32[$decoder+36>>2]=$filter_func;HEAP32[$decoder+40>>2]=$output_func;HEAP32[$decoder+44>>2]=$error_func;HEAP32[$decoder+48>>2]=$message_func;return}function _mad_bit_crc($bitptr,$len,$init){$bitptr=$bitptr|0;$len=$len|0;$init=$init|0;var $1=0,$_028=0,$crc_027=0,$3=0,$11=0,$20=0,$28=0,$36=0,$37=0,$_0_lcssa=0,$crc_0_lcssa=0,$39=0,$crc_1=0,$crc_2=0,$crc_3_ph=0,$_1_ph=0,$_in=0,$crc_326=0,$72=0,$76=0,$crc_3_be=0,$crc_3_lcssa_off0=0,label=0,tempParam=0,__stackBase__=0;__stackBase__=STACKTOP;tempParam=$bitptr;$bitptr=STACKTOP;STACKTOP=STACKTOP+8|0;HEAP32[$bitptr>>2]=HEAP32[tempParam>>2];HEAP32[$bitptr+4>>2]=HEAP32[tempParam+4>>2];label=1;while(1)switch(label|0){case 1:$1=$init&65535;if($len>>>0>31){$crc_027=$1;$_028=$len;label=2;break}else{$crc_0_lcssa=$1;$_0_lcssa=$len;label=3;break};case 2:$3=_mad_bit_read($bitptr,32)|0;$11=(HEAPU16[40480+(($3>>>24^$crc_027>>>8&255)<<1)>>1]|0)^$crc_027<<8;$20=$11<<8^(HEAPU16[40480+((($11>>>8^$3>>>16)&255)<<1)>>1]|0);$28=$20<<8^(HEAPU16[40480+((($20^$3)>>>8&255)<<1)>>1]|0);$36=$28<<8^(HEAPU16[40480+((($28>>>8^$3)&255)<<1)>>1]|0);$37=$_028-32|0;if($37>>>0>31){$crc_027=$36;$_028=$37;label=2;break}else{$crc_0_lcssa=$36;$_0_lcssa=$37;label=3;break};case 3:$39=$_0_lcssa>>>3;if(($39|0)==3){label=4;break}else if(($39|0)==2){$crc_1=$crc_0_lcssa;label=5;break}else if(($39|0)==1){$crc_2=$crc_0_lcssa;label=6;break}else{$_1_ph=$_0_lcssa;$crc_3_ph=$crc_0_lcssa;label=7;break};case 4:$crc_1=(HEAPU16[40480+((((_mad_bit_read($bitptr,8)|0)^$crc_0_lcssa>>>8)&255)<<1)>>1]|0)^$crc_0_lcssa<<8;label=5;break;case 5:$crc_2=(HEAPU16[40480+((($crc_1>>>8^(_mad_bit_read($bitptr,8)|0))&255)<<1)>>1]|0)^$crc_1<<8;label=6;break;case 6:$_1_ph=$_0_lcssa&7;$crc_3_ph=(HEAPU16[40480+((($crc_2>>>8^(_mad_bit_read($bitptr,8)|0))&255)<<1)>>1]|0)^$crc_2<<8;label=7;break;case 7:if(($_1_ph|0)==0){$crc_3_lcssa_off0=$crc_3_ph&65535;label=10;break}else{$crc_326=$crc_3_ph;$_in=$_1_ph;label=8;break};case 8:$72=$_in-1|0;$76=$crc_326<<1;$crc_3_be=(((_mad_bit_read($bitptr,1)|0)^$crc_326>>>15)&1|0)==0?$76:$76^32773;if(($72|0)==0){label=9;break}else{$crc_326=$crc_3_be;$_in=$72;label=8;break};case 9:$crc_3_lcssa_off0=$crc_3_be&65535;label=10;break;case 10:STACKTOP=__stackBase__;return $crc_3_lcssa_off0|0}return 0}function _mad_decoder_finish($decoder){$decoder=$decoder|0;var $status=0,$1=0,$5=0,$9=0,$20=0,$24=0,$27=0,$_0=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+8|0;label=1;while(1)switch(label|0){case 1:$status=__stackBase__|0;$1=$decoder|0;if((HEAP32[$1>>2]|0)==1){label=2;break}else{$_0=0;label=9;break};case 2:$5=$decoder+8|0;if((HEAP32[$5>>2]|0)==0){$_0=0;label=9;break}else{label=3;break};case 3:$9=$decoder+12|0;_close(HEAP32[$9>>2]|0)|0;label=4;break;case 4:if((_wait(HEAP32[$5>>2]|0,$status|0,0)|0)==-1){label=5;break}else{label=7;break};case 5:if((HEAP32[(___errno_location()|0)>>2]|0)==4){label=4;break}else{label=6;break};case 6:HEAP32[$1>>2]=-1;$20=$decoder+16|0;_close(HEAP32[$20>>2]|0)|0;HEAP32[$5>>2]=0;HEAP32[$9>>2]=-1;HEAP32[$20>>2]=-1;$_0=-1;label=9;break;case 7:HEAP32[$1>>2]=-1;$24=$decoder+16|0;_close(HEAP32[$24>>2]|0)|0;HEAP32[$5>>2]=0;HEAP32[$9>>2]=-1;HEAP32[$24>>2]=-1;$27=HEAP32[$status>>2]|0;if(($27&255|0)==0){label=8;break}else{$_0=-1;label=9;break};case 8:$_0=(($27&65280|0)!=0)<<31>>31;label=9;break;case 9:STACKTOP=__stackBase__;return $_0|0}return 0}function _mad_decoder_run($decoder,$mode){$decoder=$decoder|0;$mode=$mode|0;var $run_0_ph=0,$4=0,$6=0,$9=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:HEAP32[$decoder>>2]=$mode;if(($mode|0)==1){label=2;break}else if(($mode|0)==0){$run_0_ph=28;label=3;break}else{$_0=-1;label=5;break};case 2:$run_0_ph=6;label=3;break;case 3:$4=_malloc(22656)|0;$6=$decoder+20|0;HEAP32[$6>>2]=$4;if(($4|0)==0){$_0=-1;label=5;break}else{label=4;break};case 4:$9=FUNCTION_TABLE_ii[$run_0_ph&63]($decoder)|0;_free(HEAP32[$6>>2]|0);HEAP32[$6>>2]=0;$_0=$9;label=5;break;case 5:return $_0|0}return 0}function _run_sync($decoder){$decoder=$decoder|0;var $bad_last_frame=0,$1=0,$6=0,$error_data_0=0,$error_func_0=0,$15=0,$16=0,$17=0,$18=0,$22=0,$23=0,$24=0,$25=0,$26=0,$27=0,$28=0,$29=0,$30=0,$31=0,$32=0,$36=0,$40=0,$48=0,$52=0,$56=0,$61=0,$65=0,$68=0,$72=0,$74=0,$78=0,$79=0,$result_0=0,$_0=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+8|0;label=1;while(1)switch(label|0){case 1:$bad_last_frame=__stackBase__|0;HEAP32[$bad_last_frame>>2]=0;$1=$decoder+28|0;if((HEAP32[$1>>2]|0)==0){$_0=0;label=27;break}else{label=2;break};case 2:$6=HEAP32[$decoder+44>>2]|0;if(($6|0)==0){label=4;break}else{label=3;break};case 3:$error_func_0=$6;$error_data_0=HEAP32[$decoder+24>>2]|0;label=5;break;case 4:$error_func_0=16;$error_data_0=$bad_last_frame;label=5;break;case 5:$15=HEAP32[$decoder+20>>2]|0;$16=$15|0;$17=$15+64|0;$18=$15+9332|0;_mad_stream_init($16);_mad_frame_init($17);_mad_synth_init($18);HEAP32[$15+56>>2]=HEAP32[$decoder+4>>2];$22=$decoder+24|0;$23=$15+60|0;$24=$decoder|0;$25=$decoder+32|0;$26=$15+60|0;$27=$decoder+36|0;$28=$decoder+40|0;$29=$17|0;$30=$15+13432|0;$31=$17|0;$32=$15+60|0;label=6;break;case 6:$36=FUNCTION_TABLE_iii[HEAP32[$1>>2]&63](HEAP32[$22>>2]|0,$16)|0;if(($36|0)==32){label=22;break}else if(($36|0)==16){label=25;break}else if(($36|0)==17){$result_0=-1;label=26;break}else{label=7;break};case 7:if((HEAP32[$24>>2]|0)==1){label=8;break}else{label=9;break};case 8:$40=_check_message($decoder)|0;if(($40|0)==16){label=24;break}else if(($40|0)==17){$result_0=-1;label=26;break}else{label=9;break};case 9:if((HEAP32[$25>>2]|0)==0){label=14;break}else{label=10;break};case 10:if((_mad_header_decode($31,$16)|0)==-1){label=11;break}else{label=13;break};case 11:$48=HEAP32[$32>>2]|0;if(($48&65280|0)==0){$79=$48;label=23;break}else{label=12;break};case 12:$52=FUNCTION_TABLE_iiii[$error_func_0&63]($error_data_0,$16,$17)|0;if(($52|0)==16){label=24;break}else if(($52|0)==17){$result_0=-1;label=26;break}else{label=7;break};case 13:$56=FUNCTION_TABLE_iii[HEAP32[$25>>2]&63](HEAP32[$22>>2]|0,$31)|0;if(($56|0)==32){label=7;break}else if(($56|0)==16){label=24;break}else if(($56|0)==17){$result_0=-1;label=26;break}else{label=14;break};case 14:if((_mad_frame_decode($17,$16)|0)==-1){label=15;break}else{label=17;break};case 15:$61=HEAP32[$26>>2]|0;if(($61&65280|0)==0){$79=$61;label=23;break}else{label=16;break};case 16:$65=FUNCTION_TABLE_iiii[$error_func_0&63]($error_data_0,$16,$17)|0;if(($65|0)==32){label=18;break}else if(($65|0)==16){label=24;break}else if(($65|0)==17){$result_0=-1;label=26;break}else{label=7;break};case 17:HEAP32[$bad_last_frame>>2]=0;label=18;break;case 18:$68=HEAP32[$27>>2]|0;if(($68|0)==0){label=20;break}else{label=19;break};case 19:$72=FUNCTION_TABLE_iiii[$68&63](HEAP32[$22>>2]|0,$16,$17)|0;if(($72|0)==32){label=7;break}else if(($72|0)==16){label=24;break}else if(($72|0)==17){$result_0=-1;label=26;break}else{label=20;break};case 20:_mad_synth_frame($18,$17);$74=HEAP32[$28>>2]|0;if(($74|0)==0){label=7;break}else{label=21;break};case 21:$78=FUNCTION_TABLE_iiii[$74&63](HEAP32[$22>>2]|0,$29,$30)|0;if(($78|0)==16){label=24;break}else if(($78|0)==17){$result_0=-1;label=26;break}else{label=7;break};case 22:$79=HEAP32[$23>>2]|0;label=23;break;case 23:if(($79|0)==1){label=6;break}else{$result_0=-1;label=26;break};case 24:$result_0=0;label=26;break;case 25:$result_0=0;label=26;break;case 26:_mad_frame_finish($17);_mad_stream_finish($16);$_0=$result_0;label=27;break;case 27:STACKTOP=__stackBase__;return $_0|0}return 0}function _mad_decoder_message($decoder,$message,$len){$decoder=$decoder|0;$message=$message|0;$len=$len|0;var $1=0,$_=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+8|0;label=1;while(1)switch(label|0){case 1:$1=__stackBase__|0;HEAP32[$1>>2]=$message;if((HEAP32[$decoder>>2]|0)==1){label=2;break}else{label=4;break};case 2:if((_send(HEAP32[$decoder+16>>2]|0,$message,HEAP32[$len>>2]|0)|0)==0){label=3;break}else{label=4;break};case 3:$_=((_receive(HEAP32[$decoder+12>>2]|0,$1,$len)|0)!=0)<<31>>31;STACKTOP=__stackBase__;return $_|0;case 4:STACKTOP=__stackBase__;return-1|0}return 0}function _send($fd,$message,$size){$fd=$fd|0;$message=$message|0;$size=$size|0;var $1=0,$3=0,$result_0=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+8|0;label=1;while(1)switch(label|0){case 1:$1=__stackBase__|0;HEAP32[$1>>2]=$size;$3=_send_io($fd,$1,4)|0;if(($3|0)==0){label=2;break}else{$result_0=$3;label=3;break};case 2:$result_0=_send_io($fd,$message,HEAP32[$1>>2]|0)|0;label=3;break;case 3:STACKTOP=__stackBase__;return $result_0|0}return 0}function _receive($fd,$message,$size){$fd=$fd|0;$message=$message|0;$size=$size|0;var $actual=0,$6=0,$9=0,$10=0,$storemerge=0,$16=0,$22=0,$result_0_ph=0,$28=0,$33=0,$34=0,$36=0,$37=0,$38=0,$_0=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+264|0;label=1;while(1)switch(label|0){case 1:$actual=__stackBase__|0;if((HEAP32[$message>>2]|0)==0){label=2;break}else{label=3;break};case 2:HEAP32[$size>>2]=0;label=3;break;case 3:$6=_receive_io($fd,$actual,4)|0;if(($6|0)==0){label=4;break}else{$_0=$6;label=15;break};case 4:$9=HEAP32[$actual>>2]|0;$10=HEAP32[$size>>2]|0;if($9>>>0>$10>>>0){label=5;break}else{label=6;break};case 5:$storemerge=$9-$10|0;label=7;break;case 6:HEAP32[$size>>2]=$9;$storemerge=0;label=7;break;case 7:HEAP32[$actual>>2]=$storemerge;$16=HEAP32[$size>>2]|0;if(($16|0)==0){$result_0_ph=$6;label=11;break}else{label=8;break};case 8:if((HEAP32[$message>>2]|0)==0){label=9;break}else{label=10;break};case 9:$22=_malloc($16)|0;HEAP32[$message>>2]=$22;if(($22|0)==0){$_0=17;label=15;break}else{label=10;break};case 10:$result_0_ph=_receive_io_blocking($fd,HEAP32[$message>>2]|0,HEAP32[$size>>2]|0)|0;label=11;break;case 11:$28=HEAP32[$actual>>2]|0;if(($28|0)!=0&($result_0_ph|0)==0){label=12;break}else{$_0=$result_0_ph;label=15;break};case 12:$34=$28;$33=HEAP32[$actual>>2]|0;label=13;break;case 13:$36=$34>>>0>256?256:$34;$37=_receive_io_blocking($fd,__stackBase__+8|0,$36)|0;$38=$33-$36|0;if(($33|0)!=($36|0)&($37|0)==0){$34=$38;$33=$38;label=13;break}else{label=14;break};case 14:HEAP32[$actual>>2]=$38;$_0=$37;label=15;break;case 15:STACKTOP=__stackBase__;return $_0|0}return 0}function _receive_io($fd,$buffer,$len){$fd=$fd|0;$buffer=$buffer|0;$len=$len|0;var $ptr_017=0,$_01116=0,$3=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:if(($len|0)==0){$_0=0;label=7;break}else{$_01116=$len;$ptr_017=$buffer;label=2;break};case 2:label=3;break;case 3:$3=_read($fd|0,$ptr_017|0,$_01116|0)|0;if(($3|0)==(-1|0)){label=4;break}else if(($3|0)==0){$_0=16;label=7;break}else{label=6;break};case 4:if((HEAP32[(___errno_location()|0)>>2]|0)==4){label=3;break}else{label=5;break};case 5:$_0=(HEAP32[(___errno_location()|0)>>2]|0)==11?32:17;label=7;break;case 6:if(($_01116|0)==($3|0)){$_0=0;label=7;break}else{$_01116=$_01116-$3|0;$ptr_017=$ptr_017+$3|0;label=2;break};case 7:return $_0|0}return 0}function _receive_io_blocking($fd,$buffer,$len){$fd=$fd|0;$buffer=$buffer|0;$len=$len|0;var $1=0,$4=0,$11=0,$15=0,$_0=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;label=1;while(1)switch(label|0){case 1:$1=_fcntl($fd|0,3,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+7>>3<<3,HEAP32[tempInt>>2]=0,tempInt)|0)|0;if(($1|0)==-1){$_0=17;label=7;break}else{label=2;break};case 2:$4=$1&-16385;if(($4|0)==($1|0)){label=3;break}else{label=4;break};case 3:$15=_receive_io($fd,$buffer,$len)|0;label=6;break;case 4:if((_fcntl($fd|0,4,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$4,tempInt)|0)|0)==-1){$_0=17;label=7;break}else{label=5;break};case 5:$11=_receive_io($fd,$buffer,$len)|0;if((_fcntl($fd|0,4,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$1,tempInt)|0)|0)==-1){$_0=17;label=7;break}else{$15=$11;label=6;break};case 6:$_0=$15;label=7;break;case 7:STACKTOP=__stackBase__;return $_0|0}return 0}function _send_io($fd,$data,$len){$fd=$fd|0;$data=$data|0;$len=$len|0;var $ptr_015=0,$_01014=0,$3=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:if(($len|0)==0){$_0=0;label=6;break}else{$_01014=$len;$ptr_015=$data;label=2;break};case 2:label=3;break;case 3:$3=_write($fd|0,$ptr_015|0,$_01014|0)|0;if(($3|0)==-1){label=4;break}else{label=5;break};case 4:if((HEAP32[(___errno_location()|0)>>2]|0)==4){label=3;break}else{$_0=17;label=6;break};case 5:if(($_01014|0)==($3|0)){$_0=0;label=6;break}else{$_01014=$_01014-$3|0;$ptr_015=$ptr_015+$3|0;label=2;break};case 6:return $_0|0}return 0}function _error_default($data,$stream,$frame){$data=$data|0;$stream=$stream|0;$frame=$frame|0;var $1=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$data;if((HEAP32[$stream+60>>2]|0)==513){label=2;break}else{$_0=0;label=5;break};case 2:if((HEAP32[$1>>2]|0)==0){label=4;break}else{label=3;break};case 3:_mad_frame_mute($frame);$_0=32;label=5;break;case 4:HEAP32[$1>>2]=1;$_0=32;label=5;break;case 5:return $_0|0}return 0}function _run_async($decoder){$decoder=$decoder|0;var $ptoc=0,$ctop=0,$1=0,$5=0,$7=0,$8=0,$15=0,$34=0,$_0=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+16|0;label=1;while(1)switch(label|0){case 1:$ptoc=__stackBase__|0;$ctop=__stackBase__+8|0;$1=$ptoc|0;if((_pipe($1|0)|0)==-1){$_0=-1;label=12;break}else{label=2;break};case 2:$5=$ctop|0;$7=(_pipe($5|0)|0)==-1;$8=HEAP32[$1>>2]|0;if($7){label=3;break}else{label=4;break};case 3:_close($8|0)|0;_close(HEAP32[$ptoc+4>>2]|0)|0;$_0=-1;label=12;break;case 4:$15=_fcntl($8|0,3,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+7>>3<<3,HEAP32[tempInt>>2]=0,tempInt)|0)|0;if(($15|0)==-1){label=6;break}else{label=5;break};case 5:if((_fcntl(HEAP32[$1>>2]|0,4,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$15|16384,tempInt)|0)|0)==-1){label=6;break}else{label=7;break};case 6:_close(HEAP32[$5>>2]|0)|0;_close(HEAP32[$ctop+4>>2]|0)|0;_close(HEAP32[$1>>2]|0)|0;_close(HEAP32[$ptoc+4>>2]|0)|0;$_0=-1;label=12;break;case 7:$34=_fork()|0;if(($34|0)==-1){label=8;break}else{label=9;break};case 8:_close(HEAP32[$5>>2]|0)|0;_close(HEAP32[$ctop+4>>2]|0)|0;_close(HEAP32[$1>>2]|0)|0;_close(HEAP32[$ptoc+4>>2]|0)|0;$_0=-1;label=12;break;case 9:HEAP32[$decoder+8>>2]=$34;if(($34|0)==0){label=11;break}else{label=10;break};case 10:_close(HEAP32[$1>>2]|0)|0;_close(HEAP32[$ctop+4>>2]|0)|0;HEAP32[$decoder+12>>2]=HEAP32[$5>>2];HEAP32[$decoder+16>>2]=HEAP32[$ptoc+4>>2];$_0=0;label=12;break;case 11:_close(HEAP32[$ptoc+4>>2]|0)|0;_close(HEAP32[$5>>2]|0)|0;HEAP32[$decoder+12>>2]=HEAP32[$1>>2];HEAP32[$decoder+16>>2]=HEAP32[$ctop+4>>2];__exit(_run_sync($decoder)|0);return 0;case 12:STACKTOP=__stackBase__;return $_0|0}return 0}function _mad_f_abs($x){$x=$x|0;return(($x|0)<0?-$x|0:$x)|0}function _mad_frame_mute($frame){$frame=$frame|0;var $s_023=0,$sb_022=0,$4=0,$7=0,$10=0,$s_120=0,$sb_118=0,$18=0,$21=0,label=0;label=1;while(1)switch(label|0){case 1:$s_023=0;label=2;break;case 2:$sb_022=0;label=3;break;case 3:HEAP32[$frame+4656+($s_023<<7)+($sb_022<<2)>>2]=0;HEAP32[$frame+48+($s_023<<7)+($sb_022<<2)>>2]=0;$4=$sb_022+1|0;if($4>>>0<32){$sb_022=$4;label=3;break}else{label=4;break};case 4:$7=$s_023+1|0;if($7>>>0<36){$s_023=$7;label=2;break}else{label=5;break};case 5:$10=$frame+9264|0;if((HEAP32[$10>>2]|0)==0){label=9;break}else{$s_120=0;label=6;break};case 6:$sb_118=0;label=7;break;case 7:HEAP32[(HEAP32[$10>>2]|0)+2304+($sb_118*72&-1)+($s_120<<2)>>2]=0;HEAP32[(HEAP32[$10>>2]|0)+($sb_118*72&-1)+($s_120<<2)>>2]=0;$18=$sb_118+1|0;if($18>>>0<32){$sb_118=$18;label=7;break}else{label=8;break};case 8:$21=$s_120+1|0;if($21>>>0<18){$s_120=$21;label=6;break}else{label=9;break};case 9:return}}function _check_message($decoder){$decoder=$decoder|0;var $message=0,$size=0,$3=0,$7=0,$14=0,$result_0=0,$result_1=0,$24=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+16|0;label=1;while(1)switch(label|0){case 1:$message=__stackBase__|0;$size=__stackBase__+8|0;HEAP32[$message>>2]=0;$3=_receive(HEAP32[$decoder+12>>2]|0,$message,$size)|0;if(($3|0)==0){label=2;break}else{$result_1=$3;label=7;break};case 2:$7=HEAP32[$decoder+48>>2]|0;if(($7|0)==0){label=3;break}else{label=4;break};case 3:HEAP32[$size>>2]=0;$result_0=$3;label=6;break;case 4:$14=FUNCTION_TABLE_iiii[$7&63](HEAP32[$decoder+24>>2]|0,HEAP32[$message>>2]|0,$size)|0;if(($14|0)==32|($14|0)==17){label=5;break}else{$result_0=$14;label=6;break};case 5:HEAP32[$size>>2]=0;$result_0=$14;label=6;break;case 6:$result_1=(_send(HEAP32[$decoder+16>>2]|0,HEAP32[$message>>2]|0,HEAP32[$size>>2]|0)|0)==0?$result_0:17;label=7;break;case 7:$24=HEAP32[$message>>2]|0;if(($24|0)==0){label=9;break}else{label=8;break};case 8:_free($24);label=9;break;case 9:STACKTOP=__stackBase__;return $result_1|0}return 0}function _mad_f_div($x,$y){$x=$x|0;$y=$y|0;var $2=0,$_031=0,$_0=0,$8=0,$_132=0,$_1=0,$bits_039=0,$r_038=0,$q_037=0,$21=0,$22=0,$q_1=0,$r_1=0,$28=0,$bits_0_lcssa=0,$r_0_lcssa=0,$q_0_lcssa=0,$q_0_=0,$_033=0,label=0;label=1;while(1)switch(label|0){case 1:$2=_mad_f_abs(($x|0)/($y|0)&-1)|0;if(($x|0)<0){label=2;break}else{$_0=$y;$_031=$x;label=3;break};case 2:$_0=-$y|0;$_031=-$x|0;label=3;break;case 3:$8=($_031|0)%($_0|0)&-1;if(($_0|0)<0){label=4;break}else{$_1=$_0;$_132=$_031;label=5;break};case 4:$_1=-$_0|0;$_132=-$_031|0;label=5;break;case 5:if(($2|0)>7){label=6;break}else{label=8;break};case 6:if(($2|0)==8&($8|0)==0){label=7;break}else{$_033=0;label=13;break};case 7:if(($_132>>>31|0)==($_1>>>31|0)){$_033=0;label=13;break}else{label=8;break};case 8:if(($8|0)==0){$q_0_lcssa=$2;$r_0_lcssa=0;$bits_0_lcssa=28;label=12;break}else{$q_037=$2;$r_038=$8;$bits_039=28;label=9;break};case 9:$21=$q_037<<1;$22=$r_038<<1;if(($22|0)<($_1|0)){$r_1=$22;$q_1=$21;label=11;break}else{label=10;break};case 10:$r_1=$22-$_1|0;$q_1=$21|1;label=11;break;case 11:$28=$bits_039-1|0;if(($28|0)==0|($r_1|0)==0){$q_0_lcssa=$q_1;$r_0_lcssa=$r_1;$bits_0_lcssa=$28;label=12;break}else{$q_037=$q_1;$r_038=$r_1;$bits_039=$28;label=9;break};case 12:$q_0_=(($r_0_lcssa<<1|0)>=($_1|0)&1)+$q_0_lcssa|0;$_033=(($_132>>>31|0)==($_1>>>31|0)?$q_0_:-$q_0_|0)<<$bits_0_lcssa;label=13;break;case 13:return $_033|0}return 0}function _mad_header_init($header){$header=$header|0;_memset($header|0,0,44);return}function _mad_frame_init($frame){$frame=$frame|0;_mad_header_init($frame|0);HEAP32[$frame+44>>2]=0;HEAP32[$frame+9264>>2]=0;_mad_frame_mute($frame);return}function _mad_frame_finish($frame){$frame=$frame|0;var $1=0,$2=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$frame+9264|0;$2=HEAP32[$1>>2]|0;if(($2|0)==0){label=3;break}else{label=2;break};case 2:_free($2);HEAP32[$1>>2]=0;label=3;break;case 3:return}}function _mad_header_decode($header,$stream){$header=$header|0;$stream=$stream|0;var $1=0,$2=0,$4=0,$9=0,$13=0,$ptr_0=0,$22=0,$23=0,$ptr_1_ph=0,$30=0,$31=0,$32=0,$34=0,$35=0,$36=0,$37=0,$38=0,$39=0,$40=0,$41=0,$42=0,$ptr_1=0,$ptr_2=0,$86=0,$92=0,$94=0,$99=0,$116=0,$_lobit=0,$118=0,$130=0,$132=0,$N_0=0,$138=0,$145=0,$158=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$stream+24|0;$2=HEAP32[$1>>2]|0;$4=HEAP32[$stream+4>>2]|0;if(($2|0)==0){label=2;break}else{label=3;break};case 2:HEAP32[$stream+60>>2]=2;label=43;break;case 3:$9=$stream+8|0;if((HEAP32[$9>>2]|0)==0){$ptr_1_ph=$2;label=9;break}else{label=4;break};case 4:$13=$stream+12|0;if((HEAP32[$13>>2]|0)==0){label=5;break}else{$ptr_0=$2;label=6;break};case 5:$ptr_0=HEAP32[$stream+20>>2]|0;label=6;break;case 6:$22=$4-$ptr_0|0;$23=HEAP32[$9>>2]|0;if($22>>>0<$23>>>0){label=7;break}else{label=8;break};case 7:HEAP32[$9>>2]=$23-$22;HEAP32[$1>>2]=$4;HEAP32[$stream+60>>2]=1;label=43;break;case 8:HEAP32[$9>>2]=0;HEAP32[$13>>2]=1;$ptr_1_ph=$ptr_0+$23|0;label=9;break;case 9:$30=$stream+12|0;$31=$stream+28|0;$32=$stream+20|0;$34=$header+36|0;$35=$header|0;$36=$header+20|0;$37=$header+16|0;$38=$stream+16|0;$39=$header+28|0;$40=$header+28|0;$41=$4;$42=$header+28|0;$ptr_1=$ptr_1_ph;label=10;break;case 10:if((HEAP32[$30>>2]|0)==0){label=16;break}else{label=11;break};case 11:if(($4-$ptr_1|0)<8){label=12;break}else{label=13;break};case 12:HEAP32[$1>>2]=$ptr_1;HEAP32[$stream+60>>2]=1;label=43;break;case 13:if((HEAP8[$ptr_1]|0)==-1){label=14;break}else{label=15;break};case 14:if((HEAP8[$ptr_1+1|0]&-32)<<24>>24==-32){$ptr_2=$ptr_1;label=21;break}else{label=15;break};case 15:HEAP32[$stream+20>>2]=$ptr_1;HEAP32[$1>>2]=$ptr_1+1;HEAP32[$stream+60>>2]=257;label=43;break;case 16:_mad_bit_init($31,$ptr_1);if((_mad_stream_sync($stream)|0)==-1){label=17;break}else{label=20;break};case 17:if(($4-(HEAP32[$1>>2]|0)|0)>7){label=18;break}else{label=19;break};case 18:HEAP32[$1>>2]=$4-8;label=19;break;case 19:HEAP32[$stream+60>>2]=1;label=43;break;case 20:$ptr_2=_mad_bit_nextbyte($31)|0;label=21;break;case 21:HEAP32[$32>>2]=$ptr_2;HEAP32[$1>>2]=$ptr_2+1;_mad_bit_init($stream+28|0,HEAP32[$32>>2]|0);if((_decode_header($header,$stream)|0)==-1){label=43;break}else{label=22;break};case 22:$86=HEAP32[$35>>2]|0;if(($86|0)==3){label=23;break}else if(($86|0)==1){$94=384;label=25;break}else{$92=1152;label=24;break};case 23:$92=(HEAP32[$42>>2]&4096|0)!=0?576:1152;label=24;break;case 24:$94=$92;label=25;break;case 25:_mad_timer_set($34,0,$94,HEAP32[$36>>2]|0);if((HEAP32[$37>>2]|0)==0){label=26;break}else{label=31;break};case 26:$99=HEAP32[$38>>2]|0;if(($99|0)==0){label=29;break}else{label=27;break};case 27:if((HEAP32[$30>>2]|0)==0){label=29;break}else{label=28;break};case 28:if((HEAP32[$35>>2]|0)==3&$99>>>0>64e4){label=29;break}else{label=30;break};case 29:if((_free_bitrate($stream,$header)|0)==-1){label=43;break}else{label=30;break};case 30:HEAP32[$37>>2]=HEAP32[$38>>2];HEAP32[$39>>2]=HEAP32[$39>>2]|1024;label=31;break;case 31:$116=HEAP32[$40>>2]|0;$_lobit=$116>>>7&1;$118=HEAP32[$35>>2]|0;if(($118|0)==1){label=32;break}else if(($118|0)==3){label=33;break}else{$130=144;label=34;break};case 32:$N_0=((((HEAP32[$37>>2]|0)*12&-1)>>>0)/((HEAP32[$36>>2]|0)>>>0)>>>0)+$_lobit<<2;label=35;break;case 33:$130=($116&4096|0)!=0?72:144;label=34;break;case 34:$132=Math_imul(HEAP32[$37>>2]|0,$130)|0;$N_0=(($132>>>0)/((HEAP32[$36>>2]|0)>>>0)>>>0)+$_lobit|0;label=35;break;case 35:$138=HEAP32[$32>>2]|0;if(($N_0+8|0)>>>0>($41-$138|0)>>>0){label=36;break}else{label=37;break};case 36:HEAP32[$1>>2]=$138;HEAP32[$stream+60>>2]=1;label=43;break;case 37:$145=$138+$N_0|0;HEAP32[$1>>2]=$145;if((HEAP32[$30>>2]|0)==0){label=38;break}else{label=42;break};case 38:if((HEAP8[$145]|0)==-1){label=39;break}else{label=40;break};case 39:if((HEAP8[$138+($N_0+1)|0]&-32)<<24>>24==-32){label=41;break}else{label=40;break};case 40:$158=(HEAP32[$32>>2]|0)+1|0;HEAP32[$1>>2]=$158;$ptr_1=$158;label=10;break;case 41:HEAP32[$30>>2]=1;label=42;break;case 42:HEAP32[$40>>2]=HEAP32[$40>>2]|8;$_0=0;label=44;break;case 43:HEAP32[$stream+12>>2]=0;$_0=-1;label=44;break;case 44:return $_0|0}return 0}function _decode_header($header,$stream){$header=$header|0;$stream=$stream|0;var $1=0,$2=0,$3=0,$11=0,$12=0,$21=0,$23=0,$36=0,$44=0,$57=0,$63=0,$64=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$header+28|0;HEAP32[$1>>2]=0;$2=$header+32|0;HEAP32[$2>>2]=0;$3=$stream+28|0;_mad_bit_skip($3,11);if((_mad_bit_read($3,1)|0)==0){label=2;break}else{label=3;break};case 2:HEAP32[$1>>2]=HEAP32[$1>>2]|16384;label=3;break;case 3:$11=(_mad_bit_read($3,1)|0)==0;$12=HEAP32[$1>>2]|0;if($11){label=4;break}else{label=5;break};case 4:HEAP32[$1>>2]=$12|4096;label=7;break;case 5:if(($12&16384|0)==0){label=7;break}else{label=6;break};case 6:HEAP32[$stream+60>>2]=257;$_0=-1;label=31;break;case 7:$21=_mad_bit_read($3,2)|0;$23=$header|0;HEAP32[$23>>2]=4-$21;if(($21|0)==0){label=8;break}else{label=9;break};case 8:HEAP32[$stream+60>>2]=258;$_0=-1;label=31;break;case 9:if((_mad_bit_read($3,1)|0)==0){label=10;break}else{label=11;break};case 10:HEAP32[$1>>2]=HEAP32[$1>>2]|16;HEAP16[$header+24>>1]=_mad_bit_crc($3,16,-1)|0;label=11;break;case 11:$36=_mad_bit_read($3,4)|0;if(($36|0)==15){label=12;break}else{label=13;break};case 12:HEAP32[$stream+60>>2]=259;$_0=-1;label=31;break;case 13:$44=HEAP32[$23>>2]|0;if((HEAP32[$1>>2]&4096|0)==0){label=15;break}else{label=14;break};case 14:HEAP32[$header+16>>2]=HEAP32[41024+((($44>>>1)+3|0)*60&-1)+($36<<2)>>2];label=16;break;case 15:HEAP32[$header+16>>2]=HEAP32[41024+(($44-1|0)*60&-1)+($36<<2)>>2];label=16;break;case 16:$57=_mad_bit_read($3,2)|0;if(($57|0)==3){label=17;break}else{label=18;break};case 17:HEAP32[$stream+60>>2]=260;$_0=-1;label=31;break;case 18:$63=HEAP32[1528+($57<<2)>>2]|0;$64=$header+20|0;HEAP32[$64>>2]=$63;if((HEAP32[$1>>2]&4096|0)==0){label=21;break}else{label=19;break};case 19:HEAP32[$64>>2]=$63>>>1;if((HEAP32[$1>>2]&16384|0)==0){label=21;break}else{label=20;break};case 20:HEAP32[$64>>2]=$63>>>2;label=21;break;case 21:if((_mad_bit_read($3,1)|0)==0){label=23;break}else{label=22;break};case 22:HEAP32[$1>>2]=HEAP32[$1>>2]|128;label=23;break;case 23:if((_mad_bit_read($3,1)|0)==0){label=25;break}else{label=24;break};case 24:HEAP32[$2>>2]=HEAP32[$2>>2]|256;label=25;break;case 25:HEAP32[$header+4>>2]=3-(_mad_bit_read($3,2)|0);HEAP32[$header+8>>2]=_mad_bit_read($3,2)|0;if((_mad_bit_read($3,1)|0)==0){label=27;break}else{label=26;break};case 26:HEAP32[$1>>2]=HEAP32[$1>>2]|32;label=27;break;case 27:if((_mad_bit_read($3,1)|0)==0){label=29;break}else{label=28;break};case 28:HEAP32[$1>>2]=HEAP32[$1>>2]|64;label=29;break;case 29:HEAP32[$header+12>>2]=_mad_bit_read($3,2)|0;if((HEAP32[$1>>2]&16|0)==0){$_0=0;label=31;break}else{label=30;break};case 30:HEAP16[$header+26>>1]=(_mad_bit_read($3,16)|0)&65535;$_0=0;label=31;break;case 31:return $_0|0}return 0}function _free_bitrate($stream,$header){$stream=$stream|0;$header=$header|0;var $peek_stream=0,$peek_header=0,$1=0,$2=0,$3$0=0,$3$1=0,$5=0,$_lobit=0,$7=0,$14=0,$rate_022=0,$33=0,$37=0,$40=0,$44=0,$rate_1_in=0,$rate_1=0,$rate_2=0,$rate_3=0,$_0=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+112|0;label=1;while(1)switch(label|0){case 1:$peek_stream=__stackBase__|0;$peek_header=__stackBase__+64|0;$1=$stream+28|0;$2=$1;$3$0=HEAP32[$2>>2]|0;$3$1=HEAP32[$2+4>>2]|0;$5=HEAP32[$header+28>>2]|0;$_lobit=$5>>>7&1;$7=$header|0;if((HEAP32[$7>>2]|0)==3){label=2;break}else{$14=144;label=3;break};case 2:$14=($5&4096|0)!=0?72:144;label=3;break;case 3:if((_mad_stream_sync($stream)|0)==0){label=5;break}else{label=4;break};case 4:HEAP32[$2>>2]=$3$0;HEAP32[$2+4>>2]=$3$1;label=16;break;case 5:$rate_022=0;label=6;break;case 6:_memcpy($peek_stream|0,$stream|0,64)|0;_memcpy($peek_header|0,$header|0,44)|0;if((_decode_header($peek_header,$peek_stream)|0)==0){label=7;break}else{$rate_2=$rate_022;label=13;break};case 7:$33=HEAP32[$7>>2]|0;if((HEAP32[$peek_header>>2]|0)==($33|0)){label=8;break}else{$rate_2=$rate_022;label=13;break};case 8:$37=HEAP32[$header+20>>2]|0;if((HEAP32[$peek_header+20>>2]|0)==($37|0)){label=9;break}else{$rate_2=$rate_022;label=13;break};case 9:$40=_mad_bit_nextbyte($1)|0;$44=$40-(HEAP32[$stream+20>>2]|0)|0;if(($33|0)==1){label=10;break}else{label=11;break};case 10:$rate_1_in=((Math_imul(4-($_lobit<<2)+$44|0,$37)|0)>>>0)/48>>>0;label=12;break;case 11:$rate_1_in=((Math_imul(($_lobit^1)+$44|0,$37)|0)>>>0)/($14>>>0)>>>0;label=12;break;case 12:$rate_1=($rate_1_in>>>0)/1e3>>>0;if($rate_1_in>>>0>7999){$rate_3=$rate_1;label=14;break}else{$rate_2=$rate_1;label=13;break};case 13:_mad_bit_skip($1,8);if((_mad_stream_sync($stream)|0)==0){$rate_022=$rate_2;label=6;break}else{$rate_3=$rate_2;label=14;break};case 14:HEAP32[$2>>2]=$3$0;HEAP32[$2+4>>2]=$3$1;if($rate_3>>>0<8){label=16;break}else{label=15;break};case 15:if((HEAP32[$7>>2]|0)==3&$rate_3>>>0>640){label=16;break}else{label=17;break};case 16:HEAP32[$stream+60>>2]=257;$_0=-1;label=18;break;case 17:HEAP32[$stream+16>>2]=$rate_3*1e3&-1;$_0=0;label=18;break;case 18:STACKTOP=__stackBase__;return $_0|0}return 0}function _mad_frame_decode($frame,$stream){$frame=$frame|0;$stream=$stream|0;var $next_frame=0,$4=0,$15=0,$38=0,$39=0,$40=0,$41$1=0,$_0=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+8|0;label=1;while(1)switch(label|0){case 1:$next_frame=__stackBase__|0;HEAP32[$frame+44>>2]=HEAP32[$stream+56>>2];$4=$frame+28|0;if((HEAP32[$4>>2]&8|0)==0){label=2;break}else{label=3;break};case 2:if((_mad_header_decode($frame|0,$stream)|0)==-1){label=8;break}else{label=3;break};case 3:HEAP32[$4>>2]=HEAP32[$4>>2]&-9;$15=$frame|0;if((FUNCTION_TABLE_iii[HEAP32[40360+((HEAP32[$15>>2]|0)-1<<2)>>2]&63]($stream,$frame)|0)==-1){label=4;break}else{label=6;break};case 4:if((HEAP32[$stream+60>>2]&65280|0)==0){label=5;break}else{label=8;break};case 5:HEAP32[$stream+24>>2]=HEAP32[$stream+20>>2];label=8;break;case 6:if((HEAP32[$15>>2]|0)==3){$_0=0;label=9;break}else{label=7;break};case 7:_mad_bit_init($next_frame,HEAP32[$stream+24>>2]|0);$38=$stream+28|0;$39=$38;$40=$stream+36|0;$41$1=HEAP32[$39+4>>2]|0;HEAP32[$40>>2]=HEAP32[$39>>2];HEAP32[$40+4>>2]=$41$1;HEAP32[$stream+44>>2]=_mad_bit_length($38,$next_frame)|0;$_0=0;label=9;break;case 8:HEAP32[$stream+44>>2]=0;$_0=-1;label=9;break;case 9:STACKTOP=__stackBase__;return $_0|0}return 0}function _mad_layer_I($stream,$frame){$stream=$stream|0;$frame=$frame|0;var $allocation=0,$scalefactor=0,$2=0,$4=0,$7=0,$bound_0=0,$26=0,$27=0,$29=0,$sb_0109=0,$41=0,$ch_0107=0,$43=0,$_off082=0,$50=0,$53=0,$55=0,$sb_1104=0,$57=0,$_off0=0,$65=0,$sb_2102=0,$ch_1100=0,$80=0,$83=0,$s_096=0,$sb_386=0,$ch_284=0,$87=0,$93=0,$103=0,$105=0,$108=0,$sb_492=0,$111=0,$117=0,$ch_388=0,$128=0,$ch_491=0,$131=0,$133=0,$135=0,$_0=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+128|0;label=1;while(1)switch(label|0){case 1:$allocation=__stackBase__|0;$scalefactor=__stackBase__+64|0;$2=HEAP32[$frame+4>>2]|0;$4=($2|0)!=0?2:1;if(($2|0)==2){label=2;break}else{$bound_0=32;label=3;break};case 2:$7=$frame+28|0;HEAP32[$7>>2]=HEAP32[$7>>2]|256;$bound_0=(HEAP32[$frame+8>>2]<<2)+4|0;label=3;break;case 3:if((HEAP32[$frame+28>>2]&16|0)==0){label=4;break}else{label=6;break};case 4:if(($bound_0|0)==0){label=11;break}else{label=5;break};case 5:$sb_0109=0;label=9;break;case 6:$26=32-$bound_0+(Math_imul($bound_0,$4)|0)<<2;$27=$frame+24|0;$29=_mad_bit_crc($stream+28|0,$26,HEAP16[$27>>1]|0)|0;HEAP16[$27>>1]=$29;if($29<<16>>16==(HEAP16[$frame+26>>1]|0)){label=4;break}else{label=7;break};case 7:if((HEAP32[$frame+44>>2]&1|0)==0){label=8;break}else{label=4;break};case 8:HEAP32[$stream+60>>2]=513;$_0=-1;label=41;break;case 9:$ch_0107=0;label=12;break;case 10:if($bound_0>>>0<32){label=11;break}else{label=17;break};case 11:$41=$stream+28|0;$sb_1104=$bound_0;label=18;break;case 12:$43=_mad_bit_read($stream+28|0,4)|0;if(($43|0)==15){label=13;break}else if(($43|0)==0){$_off082=0;label=15;break}else{label=14;break};case 13:HEAP32[$stream+60>>2]=529;$_0=-1;label=41;break;case 14:$_off082=$43+1&255;label=15;break;case 15:HEAP8[$allocation+($ch_0107<<5)+$sb_0109|0]=$_off082;$50=$ch_0107+1|0;if($50>>>0<$4>>>0){$ch_0107=$50;label=12;break}else{label=16;break};case 16:$53=$sb_0109+1|0;if($53>>>0<$bound_0>>>0){$sb_0109=$53;label=9;break}else{label=10;break};case 17:$55=$stream+28|0;$sb_2102=0;label=22;break;case 18:$57=_mad_bit_read($41,4)|0;if(($57|0)==15){label=19;break}else if(($57|0)==0){$_off0=0;label=21;break}else{label=20;break};case 19:HEAP32[$stream+60>>2]=529;$_0=-1;label=41;break;case 20:$_off0=$57+1&255;label=21;break;case 21:HEAP8[$allocation+32+$sb_1104|0]=$_off0;HEAP8[$allocation+$sb_1104|0]=$_off0;$65=$sb_1104+1|0;if($65>>>0<32){$sb_1104=$65;label=18;break}else{label=17;break};case 22:$ch_1100=0;label=24;break;case 23:$s_096=0;label=28;break;case 24:if((HEAP8[$allocation+($ch_1100<<5)+$sb_2102|0]|0)==0){label=26;break}else{label=25;break};case 25:HEAP8[$scalefactor+($ch_1100<<5)+$sb_2102|0]=(_mad_bit_read($55,6)|0)&255;label=26;break;case 26:$80=$ch_1100+1|0;if($80>>>0<$4>>>0){$ch_1100=$80;label=24;break}else{label=27;break};case 27:$83=$sb_2102+1|0;if($83>>>0<32){$sb_2102=$83;label=22;break}else{label=23;break};case 28:if(($bound_0|0)==0){label=34;break}else{$sb_386=0;label=29;break};case 29:$ch_284=0;label=30;break;case 30:$87=HEAP8[$allocation+($ch_284<<5)+$sb_386|0]|0;if($87<<24>>24==0){$103=0;label=32;break}else{label=31;break};case 31:$93=(_I_sample($stream+28|0,$87&255)|0)+2048>>12;$103=Math_imul((HEAP32[1048+(HEAPU8[$scalefactor+($ch_284<<5)+$sb_386|0]<<2)>>2]|0)+32768>>16,$93)|0;label=32;break;case 32:HEAP32[$frame+48+($ch_284*4608&-1)+($s_096<<7)+($sb_386<<2)>>2]=$103;$105=$ch_284+1|0;if($105>>>0<$4>>>0){$ch_284=$105;label=30;break}else{label=33;break};case 33:$108=$sb_386+1|0;if($108>>>0<$bound_0>>>0){$sb_386=$108;label=29;break}else{label=34;break};case 34:if($bound_0>>>0<32){$sb_492=$bound_0;label=35;break}else{label=40;break};case 35:$111=HEAP8[$allocation+$sb_492|0]|0;if($111<<24>>24==0){$ch_491=0;label=38;break}else{label=36;break};case 36:$117=(_I_sample($stream+28|0,$111&255)|0)+2048>>12;$ch_388=0;label=37;break;case 37:HEAP32[$frame+48+($ch_388*4608&-1)+($s_096<<7)+($sb_492<<2)>>2]=Math_imul((HEAP32[1048+(HEAPU8[$scalefactor+($ch_388<<5)+$sb_492|0]<<2)>>2]|0)+32768>>16,$117)|0;$128=$ch_388+1|0;if($128>>>0<$4>>>0){$ch_388=$128;label=37;break}else{label=39;break};case 38:HEAP32[$frame+48+($ch_491*4608&-1)+($s_096<<7)+($sb_492<<2)>>2]=0;$131=$ch_491+1|0;if($131>>>0<$4>>>0){$ch_491=$131;label=38;break}else{label=39;break};case 39:$133=$sb_492+1|0;if($133>>>0<32){$sb_492=$133;label=35;break}else{label=40;break};case 40:$135=$s_096+1|0;if($135>>>0<12){$s_096=$135;label=28;break}else{$_0=0;label=41;break};case 41:STACKTOP=__stackBase__;return $_0|0}return 0}function _I_sample($ptr,$nb){$ptr=$ptr|0;$nb=$nb|0;var $2=0,$3=0,$4=0;$2=$nb-1|0;$3=1<<$2;$4=(_mad_bit_read($ptr,$nb)|0)^$3;return Math_imul((268435456>>>($2>>>0))+2048+(($4|-($4&$3))<<29-$nb)>>12,(HEAP32[35536+($nb-2<<2)>>2]|0)+32768>>16)|0}function _mad_layer_II($stream,$frame){$stream=$stream|0;$frame=$frame|0;var $start=0,$tmpcast=0,$allocation=0,$scfsi=0,$scalefactor=0,$samples=0,$1=0,$3=0,$4=0,$5=0,$6=0,$14=0,$bitrate_per_channel_0=0,$index_0=0,$36=0,$bound_0=0,$_bound_0=0,$48=0,$49=0,$50$1=0,$sb_0205=0,$ch_0204=0,$63=0,$66=0,$sb_1202=0,$76=0,$79=0,$sb_2199=0,$ch_1197=0,$90=0,$93=0,$100=0,$101=0,$103=0,$sb_3195=0,$114=0,$115=0,$116=0,$117=0,$118=0,$120=0,$ch_2192=0,$127=0,$129=0,$131=0,$145=0,$154=0,$157=0,$gr_0190=0,$159=0,$161=0,$162=0,$sb_4169=0,$ch_3165=0,$166=0,$185=0,$212=0,$215=0,$218=0,$219=0,$sb_5180=0,$222=0,$ch_4173=0,$245=0,$265=0,$ch_5178=0,$272=0,$274=0,$ch_6187=0,$277=0,$_0=0,$281=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+8|0;label=1;while(1)switch(label|0){case 1:$start=__stackBase__|0;$tmpcast=$start;$allocation=STACKTOP;STACKTOP=STACKTOP+64|0;$scfsi=STACKTOP;STACKTOP=STACKTOP+64|0;$scalefactor=STACKTOP;STACKTOP=STACKTOP+192|0;$samples=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;$1=$frame+4|0;$3=(HEAP32[$1>>2]|0)!=0;$4=$3?2:1;$5=$frame+28|0;$6=HEAP32[$5>>2]|0;if(($6&4096|0)==0){label=2;break}else{$index_0=4;label=11;break};case 2:if(($6&1024|0)==0){label=3;break}else{label=10;break};case 3:$14=HEAP32[$frame+16>>2]|0;if($3){label=4;break}else{label=5;break};case 4:$bitrate_per_channel_0=$14>>>1;label=7;break;case 5:if($14>>>0>192e3){label=6;break}else{$bitrate_per_channel_0=$14;label=7;break};case 6:HEAP32[$stream+60>>2]=546;$_0=-1;label=58;break;case 7:if($bitrate_per_channel_0>>>0<48001){label=8;break}else{label=9;break};case 8:$index_0=(HEAP32[$frame+20>>2]|0)==32e3?3:2;label=11;break;case 9:if($bitrate_per_channel_0>>>0<80001){$index_0=0;label=11;break}else{label=10;break};case 10:$index_0=(HEAP32[$frame+20>>2]|0)!=48e3&1;label=11;break;case 11:$36=HEAP32[1344+($index_0*36&-1)>>2]|0;if((HEAP32[$1>>2]|0)==2){label=12;break}else{$bound_0=32;label=13;break};case 12:HEAP32[$5>>2]=HEAP32[$5>>2]|256;$bound_0=(HEAP32[$frame+8>>2]<<2)+4|0;label=13;break;case 13:$_bound_0=$bound_0>>>0>$36>>>0?$36:$bound_0;$48=$stream+28|0;$49=$48;$50$1=HEAP32[$49+4>>2]|0;HEAP32[$start>>2]=HEAP32[$49>>2];HEAP32[$start+4>>2]=$50$1;if(($_bound_0|0)==0){label=14;break}else{$sb_0205=0;label=15;break};case 14:if($_bound_0>>>0<$36>>>0){$sb_1202=$_bound_0;label=19;break}else{label=18;break};case 15:$ch_0204=0;label=16;break;case 16:HEAP8[$allocation+($ch_0204<<5)+$sb_0205|0]=(_mad_bit_read($48,HEAPU16[41328+(HEAPU8[1348+($index_0*36&-1)+$sb_0205|0]<<2)>>1]|0)|0)&255;$63=$ch_0204+1|0;if($63>>>0<$4>>>0){$ch_0204=$63;label=16;break}else{label=17;break};case 17:$66=$sb_0205+1|0;if($66>>>0<$_bound_0>>>0){$sb_0205=$66;label=15;break}else{label=14;break};case 18:if(($36|0)==0){label=25;break}else{$sb_2199=0;label=20;break};case 19:$76=(_mad_bit_read($48,HEAPU16[41328+(HEAPU8[1348+($index_0*36&-1)+$sb_1202|0]<<2)>>1]|0)|0)&255;HEAP8[$allocation+32+$sb_1202|0]=$76;HEAP8[$allocation+$sb_1202|0]=$76;$79=$sb_1202+1|0;if($79>>>0<$36>>>0){$sb_1202=$79;label=19;break}else{label=18;break};case 20:$ch_1197=0;label=21;break;case 21:if((HEAP8[$allocation+($ch_1197<<5)+$sb_2199|0]|0)==0){label=23;break}else{label=22;break};case 22:HEAP8[$scfsi+($ch_1197<<5)+$sb_2199|0]=(_mad_bit_read($48,2)|0)&255;label=23;break;case 23:$90=$ch_1197+1|0;if($90>>>0<$4>>>0){$ch_1197=$90;label=21;break}else{label=24;break};case 24:$93=$sb_2199+1|0;if($93>>>0<$36>>>0){$sb_2199=$93;label=20;break}else{label=25;break};case 25:if((HEAP32[$5>>2]&16|0)==0){label=26;break}else{label=27;break};case 26:if(($36|0)==0){label=31;break}else{$sb_3195=0;label=30;break};case 27:$100=_mad_bit_length($tmpcast,$48)|0;$101=$frame+24|0;$103=_mad_bit_crc($tmpcast,$100,HEAP16[$101>>1]|0)|0;HEAP16[$101>>1]=$103;if($103<<16>>16==(HEAP16[$frame+26>>1]|0)){label=26;break}else{label=28;break};case 28:if((HEAP32[$frame+44>>2]&1|0)==0){label=29;break}else{label=26;break};case 29:HEAP32[$stream+60>>2]=513;$_0=-1;label=58;break;case 30:$ch_2192=0;label=32;break;case 31:$114=($_bound_0|0)==0;$115=$_bound_0>>>0<$36>>>0;$116=$36>>>0<32;$117=$samples|0;$118=$samples|0;$120=128-($36<<2)|0;$gr_0190=0;label=41;break;case 32:if((HEAP8[$allocation+($ch_2192<<5)+$sb_3195|0]|0)==0){label=39;break}else{label=33;break};case 33:$127=(_mad_bit_read($48,6)|0)&255;HEAP8[$scalefactor+($ch_2192*96&-1)+($sb_3195*3&-1)|0]=$127;$129=$scfsi+($ch_2192<<5)+$sb_3195|0;$131=HEAPU8[$129]|0;if(($131|0)==2){label=34;break}else if(($131|0)==0){label=35;break}else if(($131|0)==1|($131|0)==3){label=36;break}else{label=37;break};case 34:HEAP8[$scalefactor+($ch_2192*96&-1)+($sb_3195*3&-1)+1|0]=$127;HEAP8[$scalefactor+($ch_2192*96&-1)+($sb_3195*3&-1)+2|0]=$127;label=37;break;case 35:HEAP8[$scalefactor+($ch_2192*96&-1)+($sb_3195*3&-1)+1|0]=(_mad_bit_read($48,6)|0)&255;label=36;break;case 36:HEAP8[$scalefactor+($ch_2192*96&-1)+($sb_3195*3&-1)+2|0]=(_mad_bit_read($48,6)|0)&255;label=37;break;case 37:$145=HEAPU8[$129]|0;if(($145&1|0)==0){label=39;break}else{label=38;break};case 38:HEAP8[$scalefactor+($ch_2192*96&-1)+($sb_3195*3&-1)+1|0]=HEAP8[$145-1+($scalefactor+($ch_2192*96&-1)+($sb_3195*3&-1))|0]|0;label=39;break;case 39:$154=$ch_2192+1|0;if($154>>>0<$4>>>0){$ch_2192=$154;label=32;break}else{label=40;break};case 40:$157=$sb_3195+1|0;if($157>>>0<$36>>>0){$sb_3195=$157;label=30;break}else{label=31;break};case 41:$159=$gr_0190*3&-1;if($114){label=49;break}else{label=42;break};case 42:$161=$gr_0190*3&-1;$162=$gr_0190*3&-1;$sb_4169=0;label=43;break;case 43:$ch_3165=0;label=44;break;case 44:$166=HEAP8[$allocation+($ch_3165<<5)+$sb_4169|0]|0;if($166<<24>>24==0){label=46;break}else{label=45;break};case 45:_II_samples($48,34488+((HEAPU8[($166&255)-1+(34840+((HEAPU16[41330+(HEAPU8[1348+($index_0*36&-1)+$sb_4169|0]<<2)>>1]|0)*15&-1))|0]|0)*12&-1)|0,$118);$185=(HEAP32[1048+(HEAPU8[($gr_0190>>>2)+($scalefactor+($ch_3165*96&-1)+($sb_4169*3&-1))|0]<<2)>>2]|0)+32768>>16;HEAP32[$frame+48+($ch_3165*4608&-1)+($161<<7)+($sb_4169<<2)>>2]=Math_imul($185,(HEAP32[$samples>>2]|0)+2048>>12)|0;HEAP32[$frame+48+($ch_3165*4608&-1)+($161+1<<7)+($sb_4169<<2)>>2]=Math_imul($185,(HEAP32[$samples+4>>2]|0)+2048>>12)|0;HEAP32[$frame+48+($ch_3165*4608&-1)+($161+2<<7)+($sb_4169<<2)>>2]=Math_imul($185,(HEAP32[$samples+8>>2]|0)+2048>>12)|0;label=47;break;case 46:HEAP32[$frame+48+($ch_3165*4608&-1)+($162<<7)+($sb_4169<<2)>>2]=0;HEAP32[$frame+48+($ch_3165*4608&-1)+($162+1<<7)+($sb_4169<<2)>>2]=0;HEAP32[$frame+48+($ch_3165*4608&-1)+($162+2<<7)+($sb_4169<<2)>>2]=0;label=47;break;case 47:$212=$ch_3165+1|0;if($212>>>0<$4>>>0){$ch_3165=$212;label=44;break}else{label=48;break};case 48:$215=$sb_4169+1|0;if($215>>>0<$_bound_0>>>0){$sb_4169=$215;label=43;break}else{label=49;break};case 49:if($115){label=50;break}else{$ch_6187=0;label=56;break};case 50:$218=$gr_0190*3&-1;$219=$gr_0190*3&-1;$sb_5180=$_bound_0;label=51;break;case 51:$222=HEAP8[$allocation+$sb_5180|0]|0;if($222<<24>>24==0){$ch_5178=0;label=54;break}else{label=52;break};case 52:_II_samples($48,34488+((HEAPU8[($222&255)-1+(34840+((HEAPU16[41330+(HEAPU8[1348+($index_0*36&-1)+$sb_5180|0]<<2)>>1]|0)*15&-1))|0]|0)*12&-1)|0,$117);$ch_4173=0;label=53;break;case 53:$245=(HEAP32[1048+(HEAPU8[($gr_0190>>>2)+($scalefactor+($ch_4173*96&-1)+($sb_5180*3&-1))|0]<<2)>>2]|0)+32768>>16;HEAP32[$frame+48+($ch_4173*4608&-1)+($218<<7)+($sb_5180<<2)>>2]=Math_imul($245,(HEAP32[$samples>>2]|0)+2048>>12)|0;HEAP32[$frame+48+($ch_4173*4608&-1)+($218+1<<7)+($sb_5180<<2)>>2]=Math_imul($245,(HEAP32[$samples+4>>2]|0)+2048>>12)|0;HEAP32[$frame+48+($ch_4173*4608&-1)+($218+2<<7)+($sb_5180<<2)>>2]=Math_imul($245,(HEAP32[$samples+8>>2]|0)+2048>>12)|0;$265=$ch_4173+1|0;if($265>>>0<$4>>>0){$ch_4173=$265;label=53;break}else{label=55;break};case 54:HEAP32[$frame+48+($ch_5178*4608&-1)+($219<<7)+($sb_5180<<2)>>2]=0;HEAP32[$frame+48+($ch_5178*4608&-1)+($219+1<<7)+($sb_5180<<2)>>2]=0;HEAP32[$frame+48+($ch_5178*4608&-1)+($219+2<<7)+($sb_5180<<2)>>2]=0;$272=$ch_5178+1|0;if($272>>>0<$4>>>0){$ch_5178=$272;label=54;break}else{label=55;break};case 55:$274=$sb_5180+1|0;if($274>>>0<$36>>>0){$sb_5180=$274;label=51;break}else{$ch_6187=0;label=56;break};case 56:if($116){label=59;break}else{label=60;break};case 57:$277=$gr_0190+1|0;if($277>>>0<12){$gr_0190=$277;label=41;break}else{$_0=0;label=58;break};case 58:STACKTOP=__stackBase__;return $_0|0;case 59:_memset($frame+48+($ch_6187*4608&-1)+($159<<7)+($36<<2)|0,0,$120|0);_memset($frame+48+($ch_6187*4608&-1)+($159+1<<7)+($36<<2)|0,0,$120|0);_memset($frame+48+($ch_6187*4608&-1)+($159+2<<7)+($36<<2)|0,0,$120|0);label=60;break;case 60:$281=$ch_6187+1|0;if($281>>>0<$4>>>0){$ch_6187=$281;label=56;break}else{label=57;break}}return 0}function _II_samples($ptr,$quantclass,$output){$ptr=$ptr|0;$quantclass=$quantclass|0;$output=$output|0;var $sample=0,$2=0,$6=0,$7=0,$11=0,$14=0,$nb_0=0,$27=0,$28=0,$29=0,$30=0,$33=0,$48=0,$64=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+16|0;label=1;while(1)switch(label|0){case 1:$sample=__stackBase__|0;$2=HEAP8[$quantclass+2|0]|0;$6=HEAPU8[$quantclass+3|0]|0;$7=_mad_bit_read($ptr,$6)|0;if($2<<24>>24==0){label=3;break}else{label=2;break};case 2:$11=HEAPU16[$quantclass>>1]|0;HEAP32[$sample>>2]=($7>>>0)%($11>>>0)>>>0;$14=($7>>>0)/($11>>>0)>>>0;HEAP32[$sample+4>>2]=($14>>>0)%($11>>>0)>>>0;HEAP32[$sample+8>>2]=(($14>>>0)/($11>>>0)>>>0>>>0)%($11>>>0)>>>0;$nb_0=$2&255;label=4;break;case 3:HEAP32[$sample>>2]=$7;HEAP32[$sample+4>>2]=_mad_bit_read($ptr,$6)|0;HEAP32[$sample+8>>2]=_mad_bit_read($ptr,$6)|0;$nb_0=$6;label=4;break;case 4:$27=1<<$nb_0-1;$28=29-$nb_0|0;$29=$quantclass+8|0;$30=$quantclass+4|0;$33=HEAP32[$sample>>2]^$27;HEAP32[$output>>2]=Math_imul((HEAP32[$29>>2]|0)+2048+(($33|-($33&$27))<<$28)>>12,(HEAP32[$30>>2]|0)+32768>>16)|0;$48=HEAP32[$sample+4>>2]^$27;HEAP32[$output+4>>2]=Math_imul((HEAP32[$29>>2]|0)+2048+(($48|-($48&$27))<<$28)>>12,(HEAP32[$30>>2]|0)+32768>>16)|0;$64=HEAP32[$sample+8>>2]^$27;HEAP32[$output+8>>2]=Math_imul((HEAP32[$29>>2]|0)+2048+(($64|-($64&$27))<<$28)>>12,(HEAP32[$30>>2]|0)+32768>>16)|0;STACKTOP=__stackBase__;return}}function _III_sideinfo($ptr,$nch,$lsf,$si,$data_bitlen,$priv_bitlen){$ptr=$ptr|0;$nch=$nch|0;$lsf=$lsf|0;$si=$si|0;$data_bitlen=$data_bitlen|0;$priv_bitlen=$priv_bitlen|0;var $1=0,$2=0,$8=0,$ch_088=0,$19=0,$ngr_0=0,$gr_084=0,$result_083=0,$result_182=0,$ch_180=0,$26=0,$29=0,$result_2=0,$43=0,$47=0,$48=0,$49=0,$result_3=0,$result_4=0,$60=0,$result_5=0,$104=0,$109=0,$result_1_lcssa=0,$111=0,label=0;label=1;while(1)switch(label|0){case 1:HEAP32[$data_bitlen>>2]=0;$1=($lsf|0)!=0;$2=($nch|0)==1;if($1){label=2;break}else{label=3;break};case 2:$8=$2?1:2;label=4;break;case 3:$8=$2?5:3;label=4;break;case 4:HEAP32[$priv_bitlen>>2]=$8;HEAP32[$si>>2]=_mad_bit_read($ptr,$1?8:9)|0;HEAP32[$si+4>>2]=_mad_bit_read($ptr,HEAP32[$priv_bitlen>>2]|0)|0;if($1){$ngr_0=1;label=7;break}else{label=5;break};case 5:if(($nch|0)==0){$ngr_0=2;label=7;break}else{$ch_088=0;label=6;break};case 6:HEAP8[$si+8+$ch_088|0]=(_mad_bit_read($ptr,4)|0)&255;$19=$ch_088+1|0;if($19>>>0<$nch>>>0){$ch_088=$19;label=6;break}else{$ngr_0=2;label=7;break};case 7:$result_083=0;$gr_084=0;label=8;break;case 8:if(($nch|0)==0){$result_1_lcssa=$result_083;label=19;break}else{$ch_180=0;$result_182=$result_083;label=9;break};case 9:$26=$si+10+($gr_084*116&-1)+($ch_180*58&-1)|0;HEAP16[$26>>1]=(_mad_bit_read($ptr,12)|0)&65535;$29=$si+10+($gr_084*116&-1)+($ch_180*58&-1)+2|0;HEAP16[$29>>1]=(_mad_bit_read($ptr,9)|0)&65535;HEAP16[$si+10+($gr_084*116&-1)+($ch_180*58&-1)+4>>1]=(_mad_bit_read($ptr,8)|0)&65535;HEAP16[$si+10+($gr_084*116&-1)+($ch_180*58&-1)+6>>1]=(_mad_bit_read($ptr,$1?9:4)|0)&65535;HEAP32[$data_bitlen>>2]=(HEAP32[$data_bitlen>>2]|0)+(HEAPU16[$26>>1]|0);$result_2=(HEAPU16[$29>>1]|0)>288&($result_182|0)==0?562:$result_182;$43=$si+10+($gr_084*116&-1)+($ch_180*58&-1)+8|0;HEAP8[$43]=0;if((_mad_bit_read($ptr,1)|0)==0){label=17;break}else{label=10;break};case 10:$47=_mad_bit_read($ptr,2)|0;$48=$47&255;$49=$si+10+($gr_084*116&-1)+($ch_180*58&-1)+9|0;HEAP8[$49]=$48;$result_3=($47&255|$result_2|0)==0?563:$result_2;if($48<<24>>24==2&($1^1)){label=11;break}else{$result_4=$result_3;label=12;break};case 11:$result_4=(HEAP8[$si+8+$ch_180|0]|0)!=0&($result_3|0)==0?564:$result_3;label=12;break;case 12:$60=$si+10+($gr_084*116&-1)+($ch_180*58&-1)+16|0;HEAP8[$60]=7;HEAP8[$si+10+($gr_084*116&-1)+($ch_180*58&-1)+17|0]=36;if((_mad_bit_read($ptr,1)|0)==0){label=14;break}else{label=13;break};case 13:HEAP8[$43]=HEAP8[$43]|8;label=16;break;case 14:if((HEAP8[$49]|0)==2){label=15;break}else{label=16;break};case 15:HEAP8[$60]=8;label=16;break;case 16:HEAP8[$si+10+($gr_084*116&-1)+($ch_180*58&-1)+10|0]=(_mad_bit_read($ptr,5)|0)&255;HEAP8[$si+10+($gr_084*116&-1)+($ch_180*58&-1)+11|0]=(_mad_bit_read($ptr,5)|0)&255;HEAP8[$si+10+($gr_084*116&-1)+($ch_180*58&-1)+13|0]=(_mad_bit_read($ptr,3)|0)&255;HEAP8[$si+10+($gr_084*116&-1)+($ch_180*58&-1)+14|0]=(_mad_bit_read($ptr,3)|0)&255;HEAP8[$si+10+($gr_084*116&-1)+($ch_180*58&-1)+15|0]=(_mad_bit_read($ptr,3)|0)&255;$result_5=$result_4;label=18;break;case 17:HEAP8[$si+10+($gr_084*116&-1)+($ch_180*58&-1)+9|0]=0;HEAP8[$si+10+($gr_084*116&-1)+($ch_180*58&-1)+10|0]=(_mad_bit_read($ptr,5)|0)&255;HEAP8[$si+10+($gr_084*116&-1)+($ch_180*58&-1)+11|0]=(_mad_bit_read($ptr,5)|0)&255;HEAP8[$si+10+($gr_084*116&-1)+($ch_180*58&-1)+12|0]=(_mad_bit_read($ptr,5)|0)&255;HEAP8[$si+10+($gr_084*116&-1)+($ch_180*58&-1)+16|0]=(_mad_bit_read($ptr,4)|0)&255;HEAP8[$si+10+($gr_084*116&-1)+($ch_180*58&-1)+17|0]=(_mad_bit_read($ptr,3)|0)&255;$result_5=$result_2;label=18;break;case 18:$104=_mad_bit_read($ptr,$1?2:3)|0;HEAP8[$43]=(HEAPU8[$43]|$104)&255;$109=$ch_180+1|0;if($109>>>0<$nch>>>0){$ch_180=$109;$result_182=$result_5;label=9;break}else{$result_1_lcssa=$result_5;label=19;break};case 19:$111=$gr_084+1|0;if($111>>>0<$ngr_0>>>0){$result_083=$result_1_lcssa;$gr_084=$111;label=8;break}else{label=20;break};case 20:return $result_1_lcssa|0}return 0}function _III_decode($ptr,$frame,$si,$nch){$ptr=$ptr|0;$frame=$frame|0;$si=$si|0;$nch=$nch|0;var $sfbwidth=0,$xr=0,$output=0,$3=0,$4=0,$5=0,$sfreq_0=0,$sfreqi_0=0,$25=0,$26=0,$27=0,$29=0,$32=0,$33=0,$gr_0146=0,$ch_0=0,$40=0,$42=0,$67=0,$part2_length_0=0,$72=0,$83=0,$ch_1137=0,$87=0,$88=0,$91=0,$_117=0,$i_0=0,$132=0,$138=0,$141=0,$l_3127=0,$sb_2126=0,$151=0,$l_4131=0,$sb_3130=0,$161=0,$sb_4134=0,$171=0,$173=0,$175=0,$_0=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+4760|0;label=2;while(1)switch(label|0){case 2:$sfbwidth=__stackBase__|0;$xr=__stackBase__+8|0;$output=__stackBase__+4616|0;$3=$frame+28|0;$4=HEAP32[$3>>2]|0;$5=$4&16384;$sfreq_0=HEAP32[$frame+20>>2]<<($5>>>14);$sfreqi_0=($sfreq_0>>>15&1)+(($5|0)==0?-8:-5)+($sfreq_0>>>7&15)|0;$25=$output|0;$26=$frame+9264|0;$27=$output|0;$29=$output|0;$32=$output|0;$33=$frame+9264|0;$gr_0146=0;label=3;break;case 3:$ch_0=0;label=4;break;case 4:if($ch_0>>>0<$nch>>>0){label=5;break}else{label=13;break};case 5:$40=$si+10+($gr_0146*116&-1)+($ch_0*58&-1)|0;$42=$sfbwidth+($ch_0<<2)|0;HEAP32[$42>>2]=HEAP32[232+($sfreqi_0*12&-1)>>2];if((HEAP8[$si+10+($gr_0146*116&-1)+($ch_0*58&-1)+9|0]|0)==2){label=6;break}else{label=7;break};case 6:HEAP32[$42>>2]=HEAP32[((HEAP8[$si+10+($gr_0146*116&-1)+($ch_0*58&-1)+8|0]&8)==0?236+($sfreqi_0*12&-1)|0:240+($sfreqi_0*12&-1)|0)>>2];label=7;break;case 7:if((HEAP32[$3>>2]&4096|0)==0){label=9;break}else{label=8;break};case 8:$part2_length_0=_III_scalefactors_lsf($ptr,$40,($ch_0|0)==0?0:$si+184|0,HEAP32[$frame+8>>2]|0)|0;label=12;break;case 9:if(($gr_0146|0)==0){$67=0;label=11;break}else{label=10;break};case 10:$67=HEAPU8[$si+8+$ch_0|0]|0;label=11;break;case 11:$part2_length_0=_III_scalefactors($ptr,$40,$si+10+($ch_0*58&-1)|0,$67)|0;label=12;break;case 12:$72=_III_huffdecode($ptr,$xr+($ch_0*2304&-1)|0,$40,HEAP32[$42>>2]|0,$part2_length_0)|0;if(($72|0)==0){$ch_0=$ch_0+1|0;label=4;break}else{$_0=$72;label=44;break};case 13:if((HEAP32[$frame+4>>2]|0)==2){label=14;break}else{label=16;break};case 14:if((HEAP32[$frame+8>>2]|0)==0){label=16;break}else{label=15;break};case 15:$83=_III_stereo($xr|0,$si+10+($gr_0146*116&-1)|0,$frame|0,HEAP32[$sfbwidth>>2]|0)|0;if(($83|0)==0){label=16;break}else{$_0=$83;label=44;break};case 16:if(($nch|0)==0){label=43;break}else{label=17;break};case 17:$ch_1137=0;label=18;break;case 18:$87=$frame+48+($ch_1137*4608&-1)+(($gr_0146*18&-1)<<7)|0;$88=$si+10+($gr_0146*116&-1)+($ch_1137*58&-1)+9|0;$91=$xr+($ch_1137*2304&-1)|0;if((HEAP8[$88]|0)==2){label=19;break}else{label=21;break};case 19:_III_reorder($91,$si+10+($gr_0146*116&-1)+($ch_1137*58&-1)|0,HEAP32[$sfbwidth+($ch_1137<<2)>>2]|0);if((HEAP8[$si+10+($gr_0146*116&-1)+($ch_1137*58&-1)+8|0]&8)==0){label=22;break}else{label=20;break};case 20:_III_aliasreduce($91,36);label=22;break;case 21:_III_aliasreduce($91,576);label=22;break;case 22:if((HEAP8[$88]|0)==2){label=23;break}else{label=24;break};case 23:if((HEAP8[$si+10+($gr_0146*116&-1)+($ch_1137*58&-1)+8|0]&8)==0){label=25;break}else{label=24;break};case 24:$_117=(HEAP8[$si+10+($gr_0146*116&-1)+($ch_1137*58&-1)+8|0]&8)==0?HEAPU8[$88]|0:0;_III_imdct_l($xr+($ch_1137*2304&-1)|0,$32,$_117);_III_overlap($32,(HEAP32[$33>>2]|0)+($ch_1137*2304&-1)|0,$87,0);_III_imdct_l($xr+($ch_1137*2304&-1)+72|0,$32,$_117);_III_overlap($32,(HEAP32[$33>>2]|0)+($ch_1137*2304&-1)+72|0,$87,1);label=26;break;case 25:_III_imdct_s($xr+($ch_1137*2304&-1)|0,$25);_III_overlap($25,(HEAP32[$26>>2]|0)+($ch_1137*2304&-1)|0,$87,0);_III_imdct_s($xr+($ch_1137*2304&-1)+72|0,$25);_III_overlap($25,(HEAP32[$26>>2]|0)+($ch_1137*2304&-1)+72|0,$87,1);label=26;break;case 26:_III_freqinver($87,1);$i_0=576;label=27;break;case 27:if($i_0>>>0>36){label=28;break}else{label=29;break};case 28:$132=$i_0-1|0;if((HEAP32[$xr+($ch_1137*2304&-1)+($132<<2)>>2]|0)==0){$i_0=$132;label=27;break}else{label=29;break};case 29:$138=32-(((576-$i_0|0)>>>0)/18>>>0)|0;$141=$138>>>0>2;if((HEAP8[$88]|0)==2){label=30;break}else{label=31;break};case 30:if($141){$sb_3130=2;$l_4131=36;label=35;break}else{$sb_4134=$138;label=39;break};case 31:if($141){$sb_2126=2;$l_3127=36;label=32;break}else{$sb_4134=$138;label=39;break};case 32:_III_imdct_l($xr+($ch_1137*2304&-1)+($l_3127<<2)|0,$27,HEAPU8[$88]|0);_III_overlap($27,(HEAP32[$frame+9264>>2]|0)+($ch_1137*2304&-1)+($sb_2126*72&-1)|0,$87,$sb_2126);if(($sb_2126&1|0)==0){label=34;break}else{label=33;break};case 33:_III_freqinver($87,$sb_2126);label=34;break;case 34:$151=$sb_2126+1|0;if($151>>>0<$138>>>0){$sb_2126=$151;$l_3127=$l_3127+18|0;label=32;break}else{label=38;break};case 35:_III_imdct_s($xr+($ch_1137*2304&-1)+($l_4131<<2)|0,$29);_III_overlap($29,(HEAP32[$frame+9264>>2]|0)+($ch_1137*2304&-1)+($sb_3130*72&-1)|0,$87,$sb_3130);if(($sb_3130&1|0)==0){label=37;break}else{label=36;break};case 36:_III_freqinver($87,$sb_3130);label=37;break;case 37:$161=$sb_3130+1|0;if($161>>>0<$138>>>0){$sb_3130=$161;$l_4131=$l_4131+18|0;label=35;break}else{label=38;break};case 38:if($138>>>0<32){$sb_4134=$138;label=39;break}else{label=42;break};case 39:_III_overlap_z((HEAP32[$frame+9264>>2]|0)+($ch_1137*2304&-1)+($sb_4134*72&-1)|0,$87,$sb_4134);if(($sb_4134&1|0)==0){label=41;break}else{label=40;break};case 40:_III_freqinver($87,$sb_4134);label=41;break;case 41:$171=$sb_4134+1|0;if($171>>>0<32){$sb_4134=$171;label=39;break}else{label=42;break};case 42:$173=$ch_1137+1|0;if($173>>>0<$nch>>>0){$ch_1137=$173;label=18;break}else{label=43;break};case 43:$175=$gr_0146+1|0;if($175>>>0<(2-($4>>>12&1)|0)>>>0){$gr_0146=$175;label=3;break}else{$_0=0;label=44;break};case 44:STACKTOP=__stackBase__;return $_0|0}return 0}function _mad_layer_III($stream,$frame){$stream=$stream|0;$frame=$frame|0;var $priv_bitlen=0,$data_bitlen=0,$ptr=0,$tmpcast=0,$si=0,$peek=0,$1=0,$5=0,$11=0,$15=0,$23=0,$24=0,$25=0,$34=0,$35=0,$36=0,$37=0,$52=0,$54=0,$result_0=0,$68=0,$result_1=0,$79=0,$83=0,$next_md_begin_0=0,$96=0,$100=0,$101=0,$102=0,$103=0,$_next_md_begin_0=0,$105=0,$108=0,$109$1=0,$112=0,$113=0,$122=0,$125=0,$132=0,$134=0,$frame_used_0=0,$138=0,$141=0,$result_3=0,$147=0,$148$1=0,$153=0,$result_4=0,$163=0,$166=0,$_=0,$170=0,$171=0,$174=0,$181=0,$_0=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+24|0;label=1;while(1)switch(label|0){case 1:$priv_bitlen=__stackBase__|0;$data_bitlen=__stackBase__+8|0;$ptr=__stackBase__+16|0;$tmpcast=$ptr;$si=STACKTOP;STACKTOP=STACKTOP+244|0;STACKTOP=STACKTOP+7>>3<<3;$peek=STACKTOP;STACKTOP=STACKTOP+8|0;$1=$stream+48|0;if((HEAP32[$1>>2]|0)==0){label=2;break}else{label=4;break};case 2:$5=_malloc(2567)|0;HEAP32[$1>>2]=$5;if(($5|0)==0){label=3;break}else{label=4;break};case 3:HEAP32[$stream+60>>2]=49;$_0=-1;label=42;break;case 4:$11=$frame+9264|0;if((HEAP32[$11>>2]|0)==0){label=5;break}else{label=7;break};case 5:$15=_calloc(1152,4)|0;HEAP32[$11>>2]=$15;if(($15|0)==0){label=6;break}else{label=7;break};case 6:HEAP32[$stream+60>>2]=49;$_0=-1;label=42;break;case 7:$23=(HEAP32[$frame+4>>2]|0)!=0;$24=$23?2:1;$25=$frame+28|0;if((HEAP32[$25>>2]&4096|0)==0){label=9;break}else{label=8;break};case 8:$34=$23?17:9;label=10;break;case 9:$34=$23?32:17;label=10;break;case 10:$35=$stream+24|0;$36=HEAP32[$35>>2]|0;$37=$stream+28|0;if(($36-(_mad_bit_nextbyte($37)|0)|0)<($34|0)){label=11;break}else{label=12;break};case 11:HEAP32[$stream+60>>2]=561;HEAP32[$stream+52>>2]=0;$_0=-1;label=42;break;case 12:if((HEAP32[$25>>2]&16|0)==0){$result_0=0;label=16;break}else{label=13;break};case 13:$52=$frame+24|0;$54=_mad_bit_crc($37,$34<<3,HEAP16[$52>>1]|0)|0;HEAP16[$52>>1]=$54;if($54<<16>>16==(HEAP16[$frame+26>>1]|0)){$result_0=0;label=16;break}else{label=14;break};case 14:if((HEAP32[$frame+44>>2]&1|0)==0){label=15;break}else{$result_0=0;label=16;break};case 15:HEAP32[$stream+60>>2]=513;$result_0=-1;label=16;break;case 16:$68=_III_sideinfo($37,$24,HEAP32[$25>>2]&4096,$si,$data_bitlen,$priv_bitlen)|0;if(($68|0)!=0&($result_0|0)==0){label=17;break}else{$result_1=$result_0;label=18;break};case 17:HEAP32[$stream+60>>2]=$68;$result_1=-1;label=18;break;case 18:HEAP32[$25>>2]=HEAP32[$25>>2]|HEAP32[$priv_bitlen>>2];$79=$frame+32|0;HEAP32[$79>>2]=HEAP32[$79>>2]|HEAP32[$si+4>>2];_mad_bit_init($peek,HEAP32[$35>>2]|0);$83=_mad_bit_read($peek,32)|0;if(($83&-1703936|0)==-1966080){label=19;break}else{$next_md_begin_0=0;label=22;break};case 19:if(($83&65536|0)==0){label=20;break}else{label=21;break};case 20:_mad_bit_skip($peek,16);label=21;break;case 21:$next_md_begin_0=_mad_bit_read($peek,$83>>>19&1|8)|0;label=22;break;case 22:$96=HEAP32[$35>>2]|0;$100=$96-(_mad_bit_nextbyte($37)|0)|0;$101=$si|0;$102=HEAP32[$101>>2]|0;$103=$100+$102|0;$_next_md_begin_0=$next_md_begin_0>>>0>$103>>>0?0:$next_md_begin_0;$105=$103-$_next_md_begin_0|0;if(($102|0)==0){label=23;break}else{label=24;break};case 23:$108=$37;$109$1=HEAP32[$108+4>>2]|0;HEAP32[$ptr>>2]=HEAP32[$108>>2];HEAP32[$ptr+4>>2]=$109$1;HEAP32[$stream+52>>2]=0;$frame_used_0=$105;label=31;break;case 24:$112=$stream+52|0;$113=HEAP32[$112>>2]|0;if($102>>>0>$113>>>0){label=25;break}else{label=27;break};case 25:if(($result_1|0)==0){label=26;break}else{$result_4=$result_1;$153=$100;label=35;break};case 26:HEAP32[$stream+60>>2]=565;$result_4=-1;$153=$100;label=35;break;case 27:_mad_bit_init($tmpcast,(HEAP32[$1>>2]|0)+($113-$102)|0);$122=HEAP32[$101>>2]|0;if($105>>>0>$122>>>0){label=28;break}else{$frame_used_0=0;label=31;break};case 28:$125=HEAP32[$112>>2]|0;if(($105-$122+$125|0)>>>0<2568){label=30;break}else{label=29;break};case 29:___assert_func(42408,2633,42928,42336);return 0;case 30:$132=(HEAP32[$1>>2]|0)+$125|0;$134=$105-$122|0;_memcpy($132|0,_mad_bit_nextbyte($37)|0,$134)|0;HEAP32[$112>>2]=(HEAP32[$112>>2]|0)+$134;$frame_used_0=$134;label=31;break;case 31:$138=$100-$frame_used_0|0;if(($result_1|0)==0){label=32;break}else{$result_4=$result_1;$153=$138;label=35;break};case 32:$141=_III_decode($tmpcast,$frame,$si,$24)|0;if(($141|0)==0){$result_3=0;label=34;break}else{label=33;break};case 33:HEAP32[$stream+60>>2]=$141;$result_3=-1;label=34;break;case 34:$147=$stream+36|0;$148$1=HEAP32[$ptr+4>>2]|0;HEAP32[$147>>2]=HEAP32[$ptr>>2];HEAP32[$147+4>>2]=$148$1;HEAP32[$stream+44>>2]=($105<<3)-(HEAP32[$data_bitlen>>2]|0);$result_4=$result_3;$153=$138;label=35;break;case 35:if($153>>>0<$_next_md_begin_0>>>0){label=37;break}else{label=36;break};case 36:_memcpy(HEAP32[$1>>2]|0,(HEAP32[$35>>2]|0)+(-$_next_md_begin_0|0)|0,$_next_md_begin_0)|0;HEAP32[$stream+52>>2]=$_next_md_begin_0;$_0=$result_4;label=42;break;case 37:$163=HEAP32[$101>>2]|0;if($105>>>0<$163>>>0){label=38;break}else{label=40;break};case 38:$166=$163-$105|0;$_=($166+$153|0)>>>0>$_next_md_begin_0>>>0?$_next_md_begin_0-$153|0:$166;$170=$stream+52|0;$171=HEAP32[$170>>2]|0;if($_>>>0<$171>>>0){label=39;break}else{label=41;break};case 39:$174=HEAP32[$1>>2]|0;_memmove($174|0,$174+($171-$_)|0,$_|0);HEAP32[$170>>2]=$_;label=41;break;case 40:HEAP32[$stream+52>>2]=0;label=41;break;case 41:$181=$stream+52|0;_memcpy((HEAP32[$1>>2]|0)+(HEAP32[$181>>2]|0)|0,(HEAP32[$35>>2]|0)+(-$153|0)|0,$153)|0;HEAP32[$181>>2]=(HEAP32[$181>>2]|0)+$153;$_0=$result_4;label=42;break;case 42:STACKTOP=__stackBase__;return $_0|0}return 0}function _III_scalefactors_lsf($ptr,$channel,$gr1ch,$mode_extension){$ptr=$ptr|0;$channel=$channel|0;$gr1ch=$gr1ch|0;$mode_extension=$mode_extension|0;var $start=0,$slen=0,$1=0,$2$1=0,$4=0,$5=0,$16=0,$37=0,$48=0,$55=0,$nsfb_0=0,$i_066=0,$n_165=0,$66=0,$68=0,$n_1_lcssa=0,$72=0,$76=0,$81=0,$91=0,$103=0,$nsfb_1=0,$112=0,$115=0,$i_175=0,$n_474=0,$119=0,$124=0,$126=0,$n_4_lcssa=0,$130=0,$133=0,$134=0,$n_572=0,$138=0,$142=0,$i_066_1=0,$n_165_1=0,$148=0,$150=0,$n_1_lcssa_1=0,$154=0,$i_066_2=0,$n_165_2=0,$162=0,$164=0,$n_1_lcssa_2=0,$168=0,$i_066_3=0,$n_165_3=0,$176=0,$178=0,$n_1_lcssa_3=0,$i_175_1=0,$n_474_1=0,$184=0,$189=0,$191=0,$n_4_lcssa_1=0,$195=0,$198=0,$199=0,$i_175_2=0,$n_474_2=0,$203=0,$208=0,$210=0,$n_4_lcssa_2=0,$214=0,$217=0,$218=0,$i_175_3=0,$n_474_3=0,$222=0,$227=0,$229=0,$n_4_lcssa_3=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+8|0;label=1;while(1)switch(label|0){case 1:$start=__stackBase__|0;$slen=STACKTOP;STACKTOP=STACKTOP+16|0;$1=$ptr;$2$1=HEAP32[$1+4>>2]|0;HEAP32[$start>>2]=HEAP32[$1>>2];HEAP32[$start+4>>2]=$2$1;$4=HEAP16[$channel+6>>1]|0;$5=$4&65535;if((HEAP8[$channel+9|0]|0)==2){label=2;break}else{$16=0;label=3;break};case 2:$16=(HEAP8[$channel+8|0]&8)!=0?2:1;label=3;break;case 3:if(($mode_extension&1|0)==0|($gr1ch|0)==0){label=4;break}else{label=13;break};case 4:if(($4&65535)<400){label=5;break}else{label=6;break};case 5:HEAP32[$slen>>2]=($4&65535)/80>>>0&65535;HEAP32[$slen+4>>2]=($5>>>4>>>0)%5>>>0;HEAP32[$slen+8>>2]=$5>>>2&3;HEAP32[$slen+12>>2]=$5&3;$nsfb_0=34936+($16<<2)|0;label=9;break;case 6:if(($4&65535)<500){label=7;break}else{label=8;break};case 7:$37=$5-400|0;HEAP32[$slen>>2]=($37>>>0)/20>>>0;HEAP32[$slen+4>>2]=($37>>>2>>>0)%5>>>0;HEAP32[$slen+8>>2]=$37&3;HEAP32[$slen+12>>2]=0;$nsfb_0=34948+($16<<2)|0;label=9;break;case 8:$48=$5-500|0;HEAP32[$slen>>2]=($48>>>0)/3>>>0;HEAP32[$slen+4>>2]=($48>>>0)%3>>>0;HEAP32[$slen+8>>2]=0;HEAP32[$slen+12>>2]=0;$55=$channel+8|0;HEAP8[$55]=HEAP8[$55]|4;$nsfb_0=34960+($16<<2)|0;label=9;break;case 9:if((HEAP8[$nsfb_0]|0)==0){$n_1_lcssa=0;label=12;break}else{label=10;break};case 10:$n_165=0;$i_066=0;label=11;break;case 11:$66=$n_165+1|0;HEAP8[$channel+18+$n_165|0]=(_mad_bit_read($ptr,HEAP32[$slen>>2]|0)|0)&255;$68=$i_066+1|0;if($68>>>0<(HEAPU8[$nsfb_0]|0)>>>0){$n_165=$66;$i_066=$68;label=11;break}else{$n_1_lcssa=$66;label=12;break};case 12:$72=$nsfb_0+1|0;if((HEAP8[$72]|0)==0){$n_1_lcssa_1=$n_1_lcssa;label=26;break}else{label=24;break};case 13:$76=$5>>>1;if(($4&65535)<360){label=14;break}else{label=15;break};case 14:HEAP32[$slen>>2]=($4&65535)/72>>>0&65535;$81=($76>>>0)%36>>>0;HEAP32[$slen+4>>2]=($81>>>0)/6>>>0;HEAP32[$slen+8>>2]=($81>>>0)%6>>>0;HEAP32[$slen+12>>2]=0;$nsfb_1=34972+($16<<2)|0;label=18;break;case 15:if(($4&65535)<488){label=16;break}else{label=17;break};case 16:$91=$76-180|0;HEAP32[$slen>>2]=$91>>>4&3;HEAP32[$slen+4>>2]=$91>>>2&3;HEAP32[$slen+8>>2]=$91&3;HEAP32[$slen+12>>2]=0;$nsfb_1=34984+($16<<2)|0;label=18;break;case 17:$103=$76-244|0;HEAP32[$slen>>2]=($103>>>0)/3>>>0;HEAP32[$slen+4>>2]=($103>>>0)%3>>>0;HEAP32[$slen+8>>2]=0;HEAP32[$slen+12>>2]=0;$nsfb_1=34996+($16<<2)|0;label=18;break;case 18:$112=$slen|0;$115=(1<<HEAP32[$112>>2])-1|0;if((HEAP8[$nsfb_1]|0)==0){$n_4_lcssa=0;label=20;break}else{$n_474=0;$i_175=0;label=19;break};case 19:$119=_mad_bit_read($ptr,HEAP32[$112>>2]|0)|0;HEAP8[$channel+18+$n_474|0]=$119&255;$124=$n_474+1|0;HEAP8[$gr1ch+18+$n_474|0]=($119|0)==($115|0)&1;$126=$i_175+1|0;if($126>>>0<(HEAPU8[$nsfb_1]|0)>>>0){$n_474=$124;$i_175=$126;label=19;break}else{$n_4_lcssa=$124;label=20;break};case 20:$130=$slen+4|0;$133=(1<<HEAP32[$130>>2])-1|0;$134=$nsfb_1+1|0;if((HEAP8[$134]|0)==0){$n_4_lcssa_1=$n_4_lcssa;label=34;break}else{$n_474_1=$n_4_lcssa;$i_175_1=0;label=33;break};case 21:HEAP8[$channel+18+$n_572|0]=0;$138=$n_572+1|0;HEAP8[$gr1ch+18+$n_572|0]=0;if($138>>>0<39){$n_572=$138;label=21;break}else{label=23;break};case 22:_memset($channel+18+$n_1_lcssa_3|0,0,39-$n_1_lcssa_3|0);label=23;break;case 23:$142=_mad_bit_length($start,$ptr)|0;STACKTOP=__stackBase__;return $142|0;case 24:$n_165_1=$n_1_lcssa;$i_066_1=0;label=25;break;case 25:$148=$n_165_1+1|0;HEAP8[$channel+18+$n_165_1|0]=(_mad_bit_read($ptr,HEAP32[$slen+4>>2]|0)|0)&255;$150=$i_066_1+1|0;if($150>>>0<(HEAPU8[$72]|0)>>>0){$n_165_1=$148;$i_066_1=$150;label=25;break}else{$n_1_lcssa_1=$148;label=26;break};case 26:$154=$nsfb_0+2|0;if((HEAP8[$154]|0)==0){$n_1_lcssa_2=$n_1_lcssa_1;label=29;break}else{label=27;break};case 27:$n_165_2=$n_1_lcssa_1;$i_066_2=0;label=28;break;case 28:$162=$n_165_2+1|0;HEAP8[$channel+18+$n_165_2|0]=(_mad_bit_read($ptr,HEAP32[$slen+8>>2]|0)|0)&255;$164=$i_066_2+1|0;if($164>>>0<(HEAPU8[$154]|0)>>>0){$n_165_2=$162;$i_066_2=$164;label=28;break}else{$n_1_lcssa_2=$162;label=29;break};case 29:$168=$nsfb_0+3|0;if((HEAP8[$168]|0)==0){$n_1_lcssa_3=$n_1_lcssa_2;label=32;break}else{label=30;break};case 30:$n_165_3=$n_1_lcssa_2;$i_066_3=0;label=31;break;case 31:$176=$n_165_3+1|0;HEAP8[$channel+18+$n_165_3|0]=(_mad_bit_read($ptr,HEAP32[$slen+12>>2]|0)|0)&255;$178=$i_066_3+1|0;if($178>>>0<(HEAPU8[$168]|0)>>>0){$n_165_3=$176;$i_066_3=$178;label=31;break}else{$n_1_lcssa_3=$176;label=32;break};case 32:if($n_1_lcssa_3>>>0<39){label=22;break}else{label=23;break};case 33:$184=_mad_bit_read($ptr,HEAP32[$130>>2]|0)|0;HEAP8[$channel+18+$n_474_1|0]=$184&255;$189=$n_474_1+1|0;HEAP8[$gr1ch+18+$n_474_1|0]=($184|0)==($133|0)&1;$191=$i_175_1+1|0;if($191>>>0<(HEAPU8[$134]|0)>>>0){$n_474_1=$189;$i_175_1=$191;label=33;break}else{$n_4_lcssa_1=$189;label=34;break};case 34:$195=$slen+8|0;$198=(1<<HEAP32[$195>>2])-1|0;$199=$nsfb_1+2|0;if((HEAP8[$199]|0)==0){$n_4_lcssa_2=$n_4_lcssa_1;label=36;break}else{$n_474_2=$n_4_lcssa_1;$i_175_2=0;label=35;break};case 35:$203=_mad_bit_read($ptr,HEAP32[$195>>2]|0)|0;HEAP8[$channel+18+$n_474_2|0]=$203&255;$208=$n_474_2+1|0;HEAP8[$gr1ch+18+$n_474_2|0]=($203|0)==($198|0)&1;$210=$i_175_2+1|0;if($210>>>0<(HEAPU8[$199]|0)>>>0){$n_474_2=$208;$i_175_2=$210;label=35;break}else{$n_4_lcssa_2=$208;label=36;break};case 36:$214=$slen+12|0;$217=(1<<HEAP32[$214>>2])-1|0;$218=$nsfb_1+3|0;if((HEAP8[$218]|0)==0){$n_4_lcssa_3=$n_4_lcssa_2;label=38;break}else{$n_474_3=$n_4_lcssa_2;$i_175_3=0;label=37;break};case 37:$222=_mad_bit_read($ptr,HEAP32[$214>>2]|0)|0;HEAP8[$channel+18+$n_474_3|0]=$222&255;$227=$n_474_3+1|0;HEAP8[$gr1ch+18+$n_474_3|0]=($222|0)==($217|0)&1;$229=$i_175_3+1|0;if($229>>>0<(HEAPU8[$218]|0)>>>0){$n_474_3=$227;$i_175_3=$229;label=37;break}else{$n_4_lcssa_3=$227;label=38;break};case 38:if($n_4_lcssa_3>>>0<39){$n_572=$n_4_lcssa_3;label=21;break}else{label=23;break}}return 0}function _III_scalefactors($ptr,$channel,$gr0ch,$scfsi){$ptr=$ptr|0;$channel=$channel|0;$gr0ch=$gr0ch|0;$scfsi=$scfsi|0;var $start=0,$1=0,$2$1=0,$5=0,$8=0,$11=0,$20=0,$nsfb_074=0,$sfbi_073=0,$22=0,$nsfb_172=0,$sfbi_171=0,$28=0,$176=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+8|0;label=1;while(1)switch(label|0){case 1:$start=__stackBase__|0;$1=$ptr;$2$1=HEAP32[$1+4>>2]|0;HEAP32[$start>>2]=HEAP32[$1>>2];HEAP32[$start+4>>2]=$2$1;$5=HEAPU16[$channel+6>>1]|0;$8=HEAPU8[200+($5<<1)|0]|0;$11=HEAPU8[201+($5<<1)|0]|0;if((HEAP8[$channel+9|0]|0)==2){label=2;break}else{label=5;break};case 2:$20=(HEAP8[$channel+8|0]&8)!=0?17:18;$sfbi_073=0;$nsfb_074=$20;label=3;break;case 3:$22=$nsfb_074-1|0;HEAP8[$channel+18+$sfbi_073|0]=(_mad_bit_read($ptr,$8)|0)&255;if(($22|0)==0){$sfbi_171=$20;$nsfb_172=18;label=4;break}else{$sfbi_073=$sfbi_073+1|0;$nsfb_074=$22;label=3;break};case 4:$28=$nsfb_172-1|0;HEAP8[$channel+18+$sfbi_171|0]=(_mad_bit_read($ptr,$11)|0)&255;if(($28|0)==0){label=18;break}else{$sfbi_171=$sfbi_171+1|0;$nsfb_172=$28;label=4;break};case 5:if(($scfsi&8|0)==0){label=7;break}else{label=6;break};case 6:HEAP8[$channel+18|0]=HEAP8[$gr0ch+18|0]|0;HEAP8[$channel+19|0]=HEAP8[$gr0ch+19|0]|0;HEAP8[$channel+20|0]=HEAP8[$gr0ch+20|0]|0;HEAP8[$channel+21|0]=HEAP8[$gr0ch+21|0]|0;HEAP8[$channel+22|0]=HEAP8[$gr0ch+22|0]|0;HEAP8[$channel+23|0]=HEAP8[$gr0ch+23|0]|0;label=8;break;case 7:HEAP8[$channel+18|0]=(_mad_bit_read($ptr,$8)|0)&255;HEAP8[$channel+19|0]=(_mad_bit_read($ptr,$8)|0)&255;HEAP8[$channel+20|0]=(_mad_bit_read($ptr,$8)|0)&255;HEAP8[$channel+21|0]=(_mad_bit_read($ptr,$8)|0)&255;HEAP8[$channel+22|0]=(_mad_bit_read($ptr,$8)|0)&255;HEAP8[$channel+23|0]=(_mad_bit_read($ptr,$8)|0)&255;label=8;break;case 8:if(($scfsi&4|0)==0){label=10;break}else{label=9;break};case 9:HEAP8[$channel+24|0]=HEAP8[$gr0ch+24|0]|0;HEAP8[$channel+25|0]=HEAP8[$gr0ch+25|0]|0;HEAP8[$channel+26|0]=HEAP8[$gr0ch+26|0]|0;HEAP8[$channel+27|0]=HEAP8[$gr0ch+27|0]|0;HEAP8[$channel+28|0]=HEAP8[$gr0ch+28|0]|0;label=11;break;case 10:HEAP8[$channel+24|0]=(_mad_bit_read($ptr,$8)|0)&255;HEAP8[$channel+25|0]=(_mad_bit_read($ptr,$8)|0)&255;HEAP8[$channel+26|0]=(_mad_bit_read($ptr,$8)|0)&255;HEAP8[$channel+27|0]=(_mad_bit_read($ptr,$8)|0)&255;HEAP8[$channel+28|0]=(_mad_bit_read($ptr,$8)|0)&255;label=11;break;case 11:if(($scfsi&2|0)==0){label=13;break}else{label=12;break};case 12:HEAP8[$channel+29|0]=HEAP8[$gr0ch+29|0]|0;HEAP8[$channel+30|0]=HEAP8[$gr0ch+30|0]|0;HEAP8[$channel+31|0]=HEAP8[$gr0ch+31|0]|0;HEAP8[$channel+32|0]=HEAP8[$gr0ch+32|0]|0;HEAP8[$channel+33|0]=HEAP8[$gr0ch+33|0]|0;label=14;break;case 13:HEAP8[$channel+29|0]=(_mad_bit_read($ptr,$11)|0)&255;HEAP8[$channel+30|0]=(_mad_bit_read($ptr,$11)|0)&255;HEAP8[$channel+31|0]=(_mad_bit_read($ptr,$11)|0)&255;HEAP8[$channel+32|0]=(_mad_bit_read($ptr,$11)|0)&255;HEAP8[$channel+33|0]=(_mad_bit_read($ptr,$11)|0)&255;label=14;break;case 14:if(($scfsi&1|0)==0){label=16;break}else{label=15;break};case 15:HEAP8[$channel+34|0]=HEAP8[$gr0ch+34|0]|0;HEAP8[$channel+35|0]=HEAP8[$gr0ch+35|0]|0;HEAP8[$channel+36|0]=HEAP8[$gr0ch+36|0]|0;HEAP8[$channel+37|0]=HEAP8[$gr0ch+37|0]|0;HEAP8[$channel+38|0]=HEAP8[$gr0ch+38|0]|0;label=17;break;case 16:HEAP8[$channel+34|0]=(_mad_bit_read($ptr,$11)|0)&255;HEAP8[$channel+35|0]=(_mad_bit_read($ptr,$11)|0)&255;HEAP8[$channel+36|0]=(_mad_bit_read($ptr,$11)|0)&255;HEAP8[$channel+37|0]=(_mad_bit_read($ptr,$11)|0)&255;HEAP8[$channel+38|0]=(_mad_bit_read($ptr,$11)|0)&255;label=17;break;case 17:HEAP8[$channel+39|0]=0;label=19;break;case 18:_memset($20+18+($channel+18)|0,0,3);label=19;break;case 19:$176=_mad_bit_length($start,$ptr)|0;STACKTOP=__stackBase__;return $176|0}return 0}function _III_huffdecode($ptr,$xr,$channel,$sfbwidth,$part2_length){$ptr=$ptr|0;$xr=$xr|0;$channel=$channel|0;$sfbwidth=$sfbwidth|0;$part2_length=$part2_length|0;var $exponents=0,$peek=0,$tmpcast=0,$reqcache=0,$4=0,$7=0,$8=0,$9$1=0,$12=0,$15=0,$16=0,$19=0,$21=0,$26=0,$27=0,$28=0,$29=0,$30=0,$32=0,$_in=0,$_0206255=0,$reqhits_0254=0,$startbits_0253=0,$linbits_0252=0,$table_0251=0,$rcount_0250=0,$region_0249=0,$bitcache_0248=0,$sfbound_0247=0,$xrptr_0245=0,$cachesz_0244=0,$bits_left_0243=0,$expptr_0242=0,$exp_0241=0,$47=0,$57=0,$rcount_1=0,$66=0,$69=0,$71=0,$region_1=0,$rcount_2=0,$table_1=0,$linbits_1=0,$startbits_1=0,$80=0,$exp_2=0,$expptr_1=0,$sfbound_1=0,$region_2=0,$rcount_3=0,$table_2=0,$linbits_2=0,$startbits_2=0,$reqhits_2=0,$_1=0,$87=0,$bits_left_1=0,$cachesz_1=0,$bitcache_1=0,$99=0,$100=0,$103=0,$clumpsz_0227=0,$cachesz_2226=0,$104=0,$107=0,$116=0,$117=0,$_lcssa224=0,$_lcssa223=0,$cachesz_2_lcssa=0,$123=0,$126=0,$127=0,$bits_left_2=0,$cachesz_3=0,$bitcache_2=0,$139=0,$147=0,$155=0,$bits_left_3=0,$cachesz_4=0,$bitcache_3=0,$reqhits_3=0,$requantized_0=0,$158=0,$storemerge207=0,$bits_left_4=0,$cachesz_5=0,$bitcache_4=0,$reqhits_4=0,$168=0,$bits_left_5=0,$cachesz_6=0,$bitcache_5=0,$181=0,$189=0,$197=0,$bits_left_6=0,$cachesz_7=0,$bitcache_6=0,$reqhits_5=0,$requantized_1=0,$200=0,$210=0,$218=0,$reqhits_6=0,$requantized_2=0,$221=0,$storemerge=0,$cachesz_8=0,$reqhits_7=0,$230=0,$231=0,$236=0,$244=0,$reqhits_8=0,$requantized_3=0,$247=0,$bits_left_7=0,$cachesz_9=0,$bitcache_7=0,$reqhits_9=0,$255=0,$_0206_lcssa=0,$bitcache_0_lcssa=0,$sfbound_0_lcssa=0,$xrptr_0_lcssa=0,$cachesz_0_lcssa=0,$bits_left_0_lcssa=0,$expptr_0_lcssa=0,$exp_0_lcssa=0,$265=0,$266=0,$267=0,$requantized2_0219=0,$_2218=0,$bitcache_8217=0,$sfbound_2216=0,$xrptr_1215=0,$cachesz_10214=0,$bits_left_8213=0,$expptr_2212=0,$exp_3211=0,$bits_left_9=0,$cachesz_11=0,$bitcache_9=0,$280=0,$283=0,$285=0,$293=0,$cachesz_12=0,$quad_0=0,$302=0,$307=0,$313=0,$314=0,$exp_4=0,$requantized2_1=0,$exp_5=0,$expptr_3=0,$sfbound_3=0,$_3=0,$requantized2_2=0,$325=0,$cachesz_13=0,$332=0,$337=0,$cachesz_14=0,$344=0,$346=0,$352=0,$353=0,$exp_6=0,$requantized2_3=0,$exp_7=0,$expptr_4=0,$sfbound_4=0,$_4=0,$requantized2_4=0,$364=0,$cachesz_15=0,$371=0,$376=0,$cachesz_16=0,$383=0,$385=0,$386=0,$_lcssa=0,$xrptr_1_lcssa=0,$bits_left_8_lcssa=0,$_xrptr_1=0,$393=0,$xrptr_3209=0,$397=0,$_0=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+168|0;label=1;while(1)switch(label|0){case 1:$exponents=__stackBase__|0;$peek=__stackBase__+160|0;$tmpcast=$peek;$reqcache=STACKTOP;STACKTOP=STACKTOP+64|0;$4=(HEAPU16[$channel>>1]|0)-$part2_length|0;if(($4|0)<0){$_0=566;label=74;break}else{label=2;break};case 2:$7=$exponents|0;_III_exponents($channel,$sfbwidth,$7);$8=$ptr;$9$1=HEAP32[$8+4>>2]|0;HEAP32[$peek>>2]=HEAP32[$8>>2];HEAP32[$peek+4>>2]=$9$1;_mad_bit_skip($ptr,$4);$12=HEAPU16[$tmpcast+6>>1]|0;$15=(31-$12&-8)+$12|0;$16=_mad_bit_read($tmpcast,$15)|0;$19=HEAPU8[$channel+10|0]|0;$21=HEAP32[35144+($19<<3)>>2]|0;if(($21|0)==0){$_0=567;label=74;break}else{label=3;break};case 3:$26=$xr+((HEAPU8[$sfbwidth]|0)<<2)|0;$27=$sfbwidth+1|0;$28=$4-$15|0;$29=$exponents+4|0;$30=HEAP32[$7>>2]|0;$32=HEAP16[$channel+2>>1]|0;if($32<<16>>16==0){$exp_0_lcssa=$30;$expptr_0_lcssa=$29;$bits_left_0_lcssa=$28;$cachesz_0_lcssa=$15;$xrptr_0_lcssa=$xr;$sfbound_0_lcssa=$26;$bitcache_0_lcssa=$16;$_0206_lcssa=$27;label=46;break}else{label=4;break};case 4:$exp_0241=$30;$expptr_0242=$29;$bits_left_0243=$28;$cachesz_0244=$15;$xrptr_0245=$xr;$sfbound_0247=$26;$bitcache_0248=$16;$region_0249=0;$rcount_0250=(HEAPU8[$channel+16|0]|0)+1|0;$table_0251=$21;$linbits_0252=HEAPU16[35148+($19<<3)>>1]|0;$startbits_0253=HEAPU16[35150+($19<<3)>>1]|0;$reqhits_0254=0;$_0206255=$27;$_in=$32&65535;label=5;break;case 5:$47=$_in-1|0;if(($cachesz_0244+$bits_left_0243|0)>0){label=6;break}else{$exp_0_lcssa=$exp_0241;$expptr_0_lcssa=$expptr_0242;$bits_left_0_lcssa=$bits_left_0243;$cachesz_0_lcssa=$cachesz_0244;$xrptr_0_lcssa=$xrptr_0245;$sfbound_0_lcssa=$sfbound_0247;$bitcache_0_lcssa=$bitcache_0248;$_0206_lcssa=$_0206255;label=46;break};case 6:if(($xrptr_0245|0)==($sfbound_0247|0)){label=7;break}else{$_1=$_0206255;$reqhits_2=$reqhits_0254;$startbits_2=$startbits_0253;$linbits_2=$linbits_0252;$table_2=$table_0251;$rcount_3=$rcount_0250;$region_2=$region_0249;$sfbound_1=$sfbound_0247;$expptr_1=$expptr_0242;$exp_2=$exp_0241;label=12;break};case 7:$57=$rcount_0250-1|0;if(($57|0)==0){label=8;break}else{$startbits_1=$startbits_0253;$linbits_1=$linbits_0252;$table_1=$table_0251;$rcount_2=$57;$region_1=$region_0249;label=11;break};case 8:if(($region_0249|0)==0){label=9;break}else{$rcount_1=0;label=10;break};case 9:$rcount_1=(HEAPU8[$channel+17|0]|0)+1|0;label=10;break;case 10:$66=$region_0249+1|0;$69=HEAPU8[$channel+10+$66|0]|0;$71=HEAP32[35144+($69<<3)>>2]|0;if(($71|0)==0){$_0=567;label=74;break}else{$startbits_1=HEAPU16[35150+($69<<3)>>1]|0;$linbits_1=HEAPU16[35148+($69<<3)>>1]|0;$table_1=$71;$rcount_2=$rcount_1;$region_1=$66;label=11;break};case 11:$80=HEAP32[$expptr_0242>>2]|0;$_1=$_0206255+1|0;$reqhits_2=($exp_0241|0)==($80|0)?$reqhits_0254:0;$startbits_2=$startbits_1;$linbits_2=$linbits_1;$table_2=$table_1;$rcount_3=$rcount_2;$region_2=$region_1;$sfbound_1=$sfbound_0247+((HEAPU8[$_0206255]|0)<<2)|0;$expptr_1=$expptr_0242+4|0;$exp_2=$80;label=12;break;case 12:if(($cachesz_0244|0)<21){label=13;break}else{$bitcache_1=$bitcache_0248;$cachesz_1=$cachesz_0244;$bits_left_1=$bits_left_0243;label=14;break};case 13:$87=31-$cachesz_0244&-8;$bitcache_1=_mad_bit_read($tmpcast,$87)|0|$bitcache_0248<<$87;$cachesz_1=$87+$cachesz_0244|0;$bits_left_1=$bits_left_0243-$87|0;label=14;break;case 14:$99=$table_2+(($bitcache_1>>>(($cachesz_1-$startbits_2|0)>>>0)&(1<<$startbits_2)-1)<<1)|0;$100=HEAP16[$99>>1]|0;if(($100&1)==0){$cachesz_2226=$cachesz_1;$clumpsz_0227=$startbits_2;$103=$100;label=15;break}else{$cachesz_2_lcssa=$cachesz_1;$_lcssa223=$99;$_lcssa224=$100;label=16;break};case 15:$104=$cachesz_2226-$clumpsz_0227|0;$107=($103&65535)>>>1&7;$116=$table_2+(($bitcache_1>>>(($104-$107|0)>>>0)&(1<<$107)-1)+(($103&65535)>>>4&65535)<<1)|0;$117=HEAP16[$116>>1]|0;if(($117&1)==0){$cachesz_2226=$104;$clumpsz_0227=$107;$103=$117;label=15;break}else{$cachesz_2_lcssa=$104;$_lcssa223=$116;$_lcssa224=$117;label=16;break};case 16:$123=$cachesz_2_lcssa-(($_lcssa224&65535)>>>1&7)|0;$126=($_lcssa224&65535)>>>4&15;$127=$126&65535;if(($linbits_2|0)==0){label=34;break}else{label=17;break};case 17:if(($127|0)==15){label=18;break}else if(($127|0)==0){$reqhits_4=$reqhits_2;$bitcache_4=$bitcache_1;$cachesz_5=$123;$bits_left_4=$bits_left_1;$storemerge207=0;label=25;break}else{label=21;break};case 18:if($123>>>0<($linbits_2+2|0)>>>0){label=19;break}else{$bitcache_2=$bitcache_1;$cachesz_3=$123;$bits_left_2=$bits_left_1;label=20;break};case 19:$bitcache_2=_mad_bit_read($tmpcast,16)|0|$bitcache_1<<16;$cachesz_3=$123+16|0;$bits_left_2=$bits_left_1-16|0;label=20;break;case 20:$139=$cachesz_3-$linbits_2|0;$requantized_0=_III_requantize(($bitcache_2>>>($139>>>0)&(1<<$linbits_2)-1)+$127|0,$exp_2)|0;$reqhits_3=$reqhits_2;$bitcache_3=$bitcache_2;$cachesz_4=$139;$bits_left_3=$bits_left_2;label=24;break;case 21:$147=1<<$127;if(($147&$reqhits_2|0)==0){label=23;break}else{label=22;break};case 22:$requantized_0=HEAP32[$reqcache+($127<<2)>>2]|0;$reqhits_3=$reqhits_2;$bitcache_3=$bitcache_1;$cachesz_4=$123;$bits_left_3=$bits_left_1;label=24;break;case 23:$155=_III_requantize($127,$exp_2)|0;HEAP32[$reqcache+($127<<2)>>2]=$155;$requantized_0=$155;$reqhits_3=$147|$reqhits_2;$bitcache_3=$bitcache_1;$cachesz_4=$123;$bits_left_3=$bits_left_1;label=24;break;case 24:$158=$cachesz_4-1|0;$reqhits_4=$reqhits_3;$bitcache_4=$bitcache_3;$cachesz_5=$158;$bits_left_4=$bits_left_3;$storemerge207=(1<<$158&$bitcache_3|0)!=0?-$requantized_0|0:$requantized_0;label=25;break;case 25:HEAP32[$xrptr_0245>>2]=$storemerge207;$168=(HEAPU16[$_lcssa223>>1]|0)>>>8&15;if(($168|0)==0){label=26;break}else if(($168|0)==15){label=27;break}else{label=30;break};case 26:HEAP32[$xrptr_0245+4>>2]=0;$reqhits_9=$reqhits_4;$bitcache_7=$bitcache_4;$cachesz_9=$cachesz_5;$bits_left_7=$bits_left_4;label=45;break;case 27:if($cachesz_5>>>0<($linbits_2+1|0)>>>0){label=28;break}else{$bitcache_5=$bitcache_4;$cachesz_6=$cachesz_5;$bits_left_5=$bits_left_4;label=29;break};case 28:$bitcache_5=_mad_bit_read($tmpcast,16)|0|$bitcache_4<<16;$cachesz_6=$cachesz_5+16|0;$bits_left_5=$bits_left_4-16|0;label=29;break;case 29:$181=$cachesz_6-$linbits_2|0;$requantized_1=_III_requantize(($bitcache_5>>>($181>>>0)&(1<<$linbits_2)-1)+$168|0,$exp_2)|0;$reqhits_5=$reqhits_4;$bitcache_6=$bitcache_5;$cachesz_7=$181;$bits_left_6=$bits_left_5;label=33;break;case 30:$189=1<<$168;if(($189&$reqhits_4|0)==0){label=32;break}else{label=31;break};case 31:$requantized_1=HEAP32[$reqcache+($168<<2)>>2]|0;$reqhits_5=$reqhits_4;$bitcache_6=$bitcache_4;$cachesz_7=$cachesz_5;$bits_left_6=$bits_left_4;label=33;break;case 32:$197=_III_requantize($168,$exp_2)|0;HEAP32[$reqcache+($168<<2)>>2]=$197;$requantized_1=$197;$reqhits_5=$189|$reqhits_4;$bitcache_6=$bitcache_4;$cachesz_7=$cachesz_5;$bits_left_6=$bits_left_4;label=33;break;case 33:$200=$cachesz_7-1|0;HEAP32[$xrptr_0245+4>>2]=(1<<$200&$bitcache_6|0)!=0?-$requantized_1|0:$requantized_1;$reqhits_9=$reqhits_5;$bitcache_7=$bitcache_6;$cachesz_9=$200;$bits_left_7=$bits_left_6;label=45;break;case 34:if($126<<16>>16==0){$reqhits_7=$reqhits_2;$cachesz_8=$123;$storemerge=0;label=39;break}else{label=35;break};case 35:$210=1<<$127;if(($210&$reqhits_2|0)==0){label=37;break}else{label=36;break};case 36:$requantized_2=HEAP32[$reqcache+($127<<2)>>2]|0;$reqhits_6=$reqhits_2;label=38;break;case 37:$218=_III_requantize($127,$exp_2)|0;HEAP32[$reqcache+($127<<2)>>2]=$218;$requantized_2=$218;$reqhits_6=$210|$reqhits_2;label=38;break;case 38:$221=$123-1|0;$reqhits_7=$reqhits_6;$cachesz_8=$221;$storemerge=(1<<$221&$bitcache_1|0)!=0?-$requantized_2|0:$requantized_2;label=39;break;case 39:HEAP32[$xrptr_0245>>2]=$storemerge;$230=(HEAPU16[$_lcssa223>>1]|0)>>>8&15;$231=$230&65535;if($230<<16>>16==0){label=40;break}else{label=41;break};case 40:HEAP32[$xrptr_0245+4>>2]=0;$reqhits_9=$reqhits_7;$bitcache_7=$bitcache_1;$cachesz_9=$cachesz_8;$bits_left_7=$bits_left_1;label=45;break;case 41:$236=1<<$231;if(($236&$reqhits_7|0)==0){label=43;break}else{label=42;break};case 42:$requantized_3=HEAP32[$reqcache+($231<<2)>>2]|0;$reqhits_8=$reqhits_7;label=44;break;case 43:$244=_III_requantize($231,$exp_2)|0;HEAP32[$reqcache+($231<<2)>>2]=$244;$requantized_3=$244;$reqhits_8=$236|$reqhits_7;label=44;break;case 44:$247=$cachesz_8-1|0;HEAP32[$xrptr_0245+4>>2]=(1<<$247&$bitcache_1|0)!=0?-$requantized_3|0:$requantized_3;$reqhits_9=$reqhits_8;$bitcache_7=$bitcache_1;$cachesz_9=$247;$bits_left_7=$bits_left_1;label=45;break;case 45:$255=$xrptr_0245+8|0;if(($47|0)==0){$exp_0_lcssa=$exp_2;$expptr_0_lcssa=$expptr_1;$bits_left_0_lcssa=$bits_left_7;$cachesz_0_lcssa=$cachesz_9;$xrptr_0_lcssa=$255;$sfbound_0_lcssa=$sfbound_1;$bitcache_0_lcssa=$bitcache_7;$_0206_lcssa=$_1;label=46;break}else{$exp_0241=$exp_2;$expptr_0242=$expptr_1;$bits_left_0243=$bits_left_7;$cachesz_0244=$cachesz_9;$xrptr_0245=$255;$sfbound_0247=$sfbound_1;$bitcache_0248=$bitcache_7;$region_0249=$region_2;$rcount_0250=$rcount_3;$table_0251=$table_2;$linbits_0252=$linbits_2;$startbits_0253=$startbits_2;$reqhits_0254=$reqhits_9;$_0206255=$_1;$_in=$47;label=5;break};case 46:if(($cachesz_0_lcssa+$bits_left_0_lcssa|0)<0){$_0=568;label=74;break}else{label=47;break};case 47:$265=HEAP32[35136+((HEAP8[$channel+8|0]&1)<<2)>>2]|0;$266=$xr+2288|0;$267=$cachesz_0_lcssa+$bits_left_0_lcssa|0;if(($267|0)<1|$xrptr_0_lcssa>>>0>$266>>>0){$bits_left_8_lcssa=$bits_left_0_lcssa;$xrptr_1_lcssa=$xrptr_0_lcssa;$_lcssa=$267;label=70;break}else{label=48;break};case 48:$exp_3211=$exp_0_lcssa;$expptr_2212=$expptr_0_lcssa;$bits_left_8213=$bits_left_0_lcssa;$cachesz_10214=$cachesz_0_lcssa;$xrptr_1215=$xrptr_0_lcssa;$sfbound_2216=$sfbound_0_lcssa;$bitcache_8217=$bitcache_0_lcssa;$_2218=$_0206_lcssa;$requantized2_0219=_III_requantize(1,$exp_0_lcssa)|0;label=49;break;case 49:if(($cachesz_10214|0)<10){label=50;break}else{$bitcache_9=$bitcache_8217;$cachesz_11=$cachesz_10214;$bits_left_9=$bits_left_8213;label=51;break};case 50:$bitcache_9=_mad_bit_read($tmpcast,16)|0|$bitcache_8217<<16;$cachesz_11=$cachesz_10214+16|0;$bits_left_9=$bits_left_8213-16|0;label=51;break;case 51:$280=$cachesz_11-4|0;$283=$265+(($bitcache_9>>>($280>>>0)&15)<<1)|0;$285=HEAP16[$283>>1]|0;if(($285&1)==0){label=52;break}else{$quad_0=$283;$cachesz_12=$cachesz_11;label=53;break};case 52:$293=($285&65535)>>>1&7;$quad_0=$265+(($bitcache_9>>>(($280-$293|0)>>>0)&(1<<$293)-1)+(($285&65535)>>>4&65535)<<1)|0;$cachesz_12=$280;label=53;break;case 53:$302=$quad_0;$307=$cachesz_12-((HEAPU16[$302>>1]|0)>>>1&7)|0;if(($xrptr_1215|0)==($sfbound_2216|0)){label=54;break}else{$requantized2_2=$requantized2_0219;$_3=$_2218;$sfbound_3=$sfbound_2216;$expptr_3=$expptr_2212;$exp_5=$exp_3211;label=57;break};case 54:$313=$sfbound_2216+((HEAPU8[$_2218]|0)<<2)|0;$314=HEAP32[$expptr_2212>>2]|0;if(($exp_3211|0)==($314|0)){$requantized2_1=$requantized2_0219;$exp_4=$exp_3211;label=56;break}else{label=55;break};case 55:$requantized2_1=_III_requantize(1,$314)|0;$exp_4=$314;label=56;break;case 56:$requantized2_2=$requantized2_1;$_3=$_2218+1|0;$sfbound_3=$313;$expptr_3=$expptr_2212+4|0;$exp_5=$exp_4;label=57;break;case 57:if((HEAP16[$302>>1]&16)==0){$332=0;$cachesz_13=$307;label=59;break}else{label=58;break};case 58:$325=$307-1|0;$332=(1<<$325&$bitcache_9|0)!=0?-$requantized2_2|0:$requantized2_2;$cachesz_13=$325;label=59;break;case 59:HEAP32[$xrptr_1215>>2]=$332;if((HEAP16[$302>>1]&32)==0){$344=0;$cachesz_14=$cachesz_13;label=61;break}else{label=60;break};case 60:$337=$cachesz_13-1|0;$344=(1<<$337&$bitcache_9|0)!=0?-$requantized2_2|0:$requantized2_2;$cachesz_14=$337;label=61;break;case 61:HEAP32[$xrptr_1215+4>>2]=$344;$346=$xrptr_1215+8|0;if(($346|0)==($sfbound_3|0)){label=62;break}else{$requantized2_4=$requantized2_2;$_4=$_3;$sfbound_4=$sfbound_3;$expptr_4=$expptr_3;$exp_7=$exp_5;label=65;break};case 62:$352=$sfbound_3+((HEAPU8[$_3]|0)<<2)|0;$353=HEAP32[$expptr_3>>2]|0;if(($exp_5|0)==($353|0)){$requantized2_3=$requantized2_2;$exp_6=$exp_5;label=64;break}else{label=63;break};case 63:$requantized2_3=_III_requantize(1,$353)|0;$exp_6=$353;label=64;break;case 64:$requantized2_4=$requantized2_3;$_4=$_3+1|0;$sfbound_4=$352;$expptr_4=$expptr_3+4|0;$exp_7=$exp_6;label=65;break;case 65:if((HEAP16[$302>>1]&64)==0){$371=0;$cachesz_15=$cachesz_14;label=67;break}else{label=66;break};case 66:$364=$cachesz_14-1|0;$371=(1<<$364&$bitcache_9|0)!=0?-$requantized2_4|0:$requantized2_4;$cachesz_15=$364;label=67;break;case 67:HEAP32[$346>>2]=$371;if((HEAP16[$302>>1]&128)==0){$383=0;$cachesz_16=$cachesz_15;label=69;break}else{label=68;break};case 68:$376=$cachesz_15-1|0;$383=(1<<$376&$bitcache_9|0)!=0?-$requantized2_4|0:$requantized2_4;$cachesz_16=$376;label=69;break;case 69:HEAP32[$xrptr_1215+12>>2]=$383;$385=$xrptr_1215+16|0;$386=$cachesz_16+$bits_left_9|0;if(($386|0)<1|$385>>>0>$266>>>0){$bits_left_8_lcssa=$bits_left_9;$xrptr_1_lcssa=$385;$_lcssa=$386;label=70;break}else{$exp_3211=$exp_7;$expptr_2212=$expptr_4;$bits_left_8213=$bits_left_9;$cachesz_10214=$cachesz_16;$xrptr_1215=$385;$sfbound_2216=$sfbound_4;$bitcache_8217=$bitcache_9;$_2218=$_4;$requantized2_0219=$requantized2_4;label=49;break};case 70:$_xrptr_1=($_lcssa|0)<0?$xrptr_1_lcssa-16|0:$xrptr_1_lcssa;if((-$bits_left_8_lcssa|0)<65){label=71;break}else{label=72;break};case 71:$393=$xr+2304|0;if($_xrptr_1>>>0<$393>>>0){$xrptr_3209=$_xrptr_1;label=73;break}else{$_0=0;label=74;break};case 72:___assert_func(42408,1253,42944,41824);return 0;case 73:HEAP32[$xrptr_3209>>2]=0;HEAP32[$xrptr_3209+4>>2]=0;$397=$xrptr_3209+8|0;if($397>>>0<$393>>>0){$xrptr_3209=$397;label=73;break}else{$_0=0;label=74;break};case 74:STACKTOP=__stackBase__;return $_0|0}return 0}function _III_stereo($xr,$granule,$header,$sfbwidth){$xr=$xr|0;$granule=$granule|0;$header=$header|0;$sfbwidth=$sfbwidth|0;var $modes=0,$bound=0,$3=0,$9=0,$14=0,$15=0,$i_0200=0,$19=0,$25=0,$26=0,$sfbi_0188=0,$l_0187=0,$right_xr_0186=0,$lower_0185=0,$38=0,$41=0,$i_1=0,$lower_1=0,$50=0,$51=0,$l_1208=0,$right_xr_1207=0,$lower_2206=0,$start_0204=0,$sfbi_2181=0,$l_2180=0,$right_xr_2179=0,$w_0178=0,$max_0177=0,$55=0,$58=0,$i_2=0,$max_1=0,$69=0,$lower_2205=0,$start_0203=0,$max_0_lcssa=0,$lower_2_start_0=0,$i_3174=0,$80=0,$i_4172=0,$w_1171=0,$92=0,$sfbi_3197=0,$l_3196=0,$right_xr_3195=0,$bound1_0194=0,$97=0,$100=0,$i_5=0,$bound1_1=0,$110=0,$i_6191=0,$114=0,$123=0,$sfbi_4168=0,$l_4167=0,$126=0,$127=0,$128=0,$129=0,$140=0,$141=0,$i_7164=0,$150=0,$151=0,$152=0,$161=0,$167=0,$170=0,$sfbi_5162=0,$l_5161=0,$173=0,$174=0,$175=0,$176=0,$181=0,$182=0,$188=0,$193=0,$i_8157=0,$197=0,$198=0,$201=0,$205=0,$208=0,$214=0,$sfbi_6154=0,$l_6153=0,$219=0,$220=0,$i_9151=0,$225=0,$226=0,$227=0,$228=0,$229=0,$238=0,$241=0,$_0=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+96|0;label=1;while(1)switch(label|0){case 1:$modes=__stackBase__|0;$bound=__stackBase__+80|0;$3=$granule+67|0;if((HEAP8[$granule+9|0]|0)==(HEAP8[$3]|0)){label=2;break}else{$_0=569;label=59;break};case 2:$9=$granule+66|0;if(((HEAP8[$9]^HEAP8[$granule+8|0])&8)==0){label=3;break}else{$_0=569;label=59;break};case 3:$14=$header+8|0;$15=HEAP32[$14>>2]|0;$i_0200=0;label=4;break;case 4:HEAP16[$modes+($i_0200<<1)>>1]=$15&65535;$19=$i_0200+1|0;if($19>>>0<39){$i_0200=$19;label=4;break}else{label=5;break};case 5:if(($15&1|0)==0){label=54;break}else{label=6;break};case 6:$25=$xr+2304|0;$26=$header+28|0;HEAP32[$26>>2]=HEAP32[$26>>2]|256;if((HEAP8[$3]|0)==2){label=7;break}else{$bound1_0194=0;$right_xr_3195=$25;$l_3196=0;$sfbi_3197=0;label=28;break};case 7:HEAP32[$bound+8>>2]=0;HEAP32[$bound+4>>2]=0;HEAP32[$bound>>2]=0;if((HEAP8[$9]&8)==0){$start_0204=0;$lower_2206=0;$right_xr_1207=$25;$l_1208=0;label=13;break}else{$lower_0185=0;$right_xr_0186=$25;$l_0187=0;$sfbi_0188=0;label=8;break};case 8:$38=$sfbi_0188+1|0;$41=HEAPU8[$sfbwidth+$sfbi_0188|0]|0;$i_1=0;label=9;break;case 9:if($i_1>>>0<$41>>>0){label=10;break}else{$lower_1=$lower_0185;label=11;break};case 10:if((HEAP32[$right_xr_0186+($i_1<<2)>>2]|0)==0){$i_1=$i_1+1|0;label=9;break}else{$lower_1=$38;label=11;break};case 11:$50=$right_xr_0186+($41<<2)|0;$51=$41+$l_0187|0;if($51>>>0<36){$lower_0185=$lower_1;$right_xr_0186=$50;$l_0187=$51;$sfbi_0188=$38;label=8;break}else{label=12;break};case 12:if($51>>>0<576){$start_0204=$38;$lower_2206=$lower_1;$right_xr_1207=$50;$l_1208=$51;label=13;break}else{$max_0_lcssa=0;$start_0203=$38;$lower_2205=$lower_1;label=19;break};case 13:$max_0177=0;$w_0178=0;$right_xr_2179=$right_xr_1207;$l_2180=$l_1208;$sfbi_2181=$start_0204;label=14;break;case 14:$55=$sfbi_2181+1|0;$58=HEAPU8[$sfbwidth+$sfbi_2181|0]|0;$i_2=0;label=15;break;case 15:if($i_2>>>0<$58>>>0){label=16;break}else{$max_1=$max_0177;label=18;break};case 16:if((HEAP32[$right_xr_2179+($i_2<<2)>>2]|0)==0){$i_2=$i_2+1|0;label=15;break}else{label=17;break};case 17:HEAP32[$bound+($w_0178<<2)>>2]=$55;$max_1=$55;label=18;break;case 18:$69=$58+$l_2180|0;if($69>>>0<576){$max_0177=$max_1;$w_0178=(($w_0178+1|0)>>>0)%3>>>0;$right_xr_2179=$right_xr_2179+($58<<2)|0;$l_2180=$69;$sfbi_2181=$55;label=14;break}else{$max_0_lcssa=$max_1;$start_0203=$start_0204;$lower_2205=$lower_2206;label=19;break};case 19:$lower_2_start_0=($max_0_lcssa|0)==0?$lower_2205:$start_0203;if(($lower_2_start_0|0)==0){label=21;break}else{label=20;break};case 20:$i_3174=0;label=22;break;case 21:if($start_0203>>>0<$max_0_lcssa>>>0){$w_1171=0;$i_4172=$start_0203;label=23;break}else{label=33;break};case 22:HEAP16[$modes+($i_3174<<1)>>1]=HEAP32[$14>>2]&65535&-2;$80=$i_3174+1|0;if($80>>>0<$lower_2_start_0>>>0){$i_3174=$80;label=22;break}else{label=21;break};case 23:if($i_4172>>>0<(HEAP32[$bound+($w_1171<<2)>>2]|0)>>>0){label=24;break}else{label=25;break};case 24:HEAP16[$modes+($i_4172<<1)>>1]=HEAP32[$14>>2]&65535&-2;label=25;break;case 25:$92=$i_4172+1|0;if($92>>>0<$max_0_lcssa>>>0){$w_1171=(($w_1171+1|0)>>>0)%3>>>0;$i_4172=$92;label=23;break}else{label=33;break};case 26:if(($bound1_1|0)==0){label=33;break}else{label=27;break};case 27:$i_6191=0;label=32;break;case 28:$97=$sfbi_3197+1|0;$100=HEAPU8[$sfbwidth+$sfbi_3197|0]|0;$i_5=0;label=29;break;case 29:if($i_5>>>0<$100>>>0){label=30;break}else{$bound1_1=$bound1_0194;label=31;break};case 30:if((HEAP32[$right_xr_3195+($i_5<<2)>>2]|0)==0){$i_5=$i_5+1|0;label=29;break}else{$bound1_1=$97;label=31;break};case 31:$110=$100+$l_3196|0;if($110>>>0<576){$bound1_0194=$bound1_1;$right_xr_3195=$right_xr_3195+($100<<2)|0;$l_3196=$110;$sfbi_3197=$97;label=28;break}else{label=26;break};case 32:HEAP16[$modes+($i_6191<<1)>>1]=HEAP32[$14>>2]&65535&-2;$114=$i_6191+1|0;if($114>>>0<$bound1_1>>>0){$i_6191=$114;label=32;break}else{label=33;break};case 33:if((HEAP32[$26>>2]&4096|0)==0){$l_5161=0;$sfbi_5162=0;label=47;break}else{label=34;break};case 34:$123=HEAP16[$granule+64>>1]&1;$l_4167=0;$sfbi_4168=0;label=35;break;case 35:$126=HEAP8[$sfbwidth+$sfbi_4168|0]|0;$127=$126&255;$128=$modes+($sfbi_4168<<1)|0;$129=HEAP16[$128>>1]|0;if(($129&1)==0){label=46;break}else{label=36;break};case 36:if((HEAP8[$granule+192+$sfbi_4168|0]|0)==0){label=38;break}else{label=37;break};case 37:HEAP16[$128>>1]=$129&-2;label=46;break;case 38:$140=HEAP8[$granule+76+$sfbi_4168|0]|0;$141=$140&255;if($126<<24>>24==0){label=46;break}else{label=39;break};case 39:$i_7164=0;label=40;break;case 40:$150=$i_7164+$l_4167|0;$151=$xr+($150<<2)|0;$152=HEAP32[$151>>2]|0;if($140<<24>>24==0){label=41;break}else{label=42;break};case 41:HEAP32[$xr+2304+($150<<2)>>2]=$152;label=45;break;case 42:$161=Math_imul((HEAP32[35624+($123*60&-1)+(($141-1|0)>>>1<<2)>>2]|0)+32768>>16,$152+2048>>12)|0;if(($141&1|0)==0){label=44;break}else{label=43;break};case 43:HEAP32[$151>>2]=$161;HEAP32[$xr+2304+($150<<2)>>2]=$152;label=45;break;case 44:HEAP32[$xr+2304+($150<<2)>>2]=$161;label=45;break;case 45:$167=$i_7164+1|0;if($167>>>0<$127>>>0){$i_7164=$167;label=40;break}else{label=46;break};case 46:$170=$127+$l_4167|0;if($170>>>0<576){$l_4167=$170;$sfbi_4168=$sfbi_4168+1|0;label=35;break}else{label=54;break};case 47:$173=HEAP8[$sfbwidth+$sfbi_5162|0]|0;$174=$173&255;$175=$modes+($sfbi_5162<<1)|0;$176=HEAP16[$175>>1]|0;if(($176&1)==0){label=53;break}else{label=48;break};case 48:$181=HEAP8[$granule+76+$sfbi_5162|0]|0;$182=$181&255;if(($181&255)>6){label=51;break}else{label=49;break};case 49:if($173<<24>>24==0){label=53;break}else{label=50;break};case 50:$188=(HEAP32[35592+($182<<2)>>2]|0)+32768>>16;$193=(HEAP32[35592+(6-$182<<2)>>2]|0)+32768>>16;$i_8157=0;label=52;break;case 51:HEAP16[$175>>1]=$176&-2;label=53;break;case 52:$197=$i_8157+$l_5161|0;$198=$xr+($197<<2)|0;$201=(HEAP32[$198>>2]|0)+2048>>12;HEAP32[$198>>2]=Math_imul($188,$201)|0;HEAP32[$xr+2304+($197<<2)>>2]=Math_imul($193,$201)|0;$205=$i_8157+1|0;if($205>>>0<$174>>>0){$i_8157=$205;label=52;break}else{label=53;break};case 53:$208=$174+$l_5161|0;if($208>>>0<576){$l_5161=$208;$sfbi_5162=$sfbi_5162+1|0;label=47;break}else{label=54;break};case 54:if((HEAP32[$14>>2]&2|0)==0){$_0=0;label=59;break}else{label=55;break};case 55:$214=$header+28|0;HEAP32[$214>>2]=HEAP32[$214>>2]|512;$l_6153=0;$sfbi_6154=0;label=56;break;case 56:$219=HEAP8[$sfbwidth+$sfbi_6154|0]|0;$220=$219&255;if((HEAP16[$modes+($sfbi_6154<<1)>>1]|0)!=2|$219<<24>>24==0){label=58;break}else{$i_9151=0;label=57;break};case 57:$225=$i_9151+$l_6153|0;$226=$xr+($225<<2)|0;$227=HEAP32[$226>>2]|0;$228=$xr+2304+($225<<2)|0;$229=HEAP32[$228>>2]|0;HEAP32[$226>>2]=($227+2048+$229>>12)*2896&-1;HEAP32[$228>>2]=($227+2048-$229>>12)*2896&-1;$238=$i_9151+1|0;if($238>>>0<$220>>>0){$i_9151=$238;label=57;break}else{label=58;break};case 58:$241=$220+$l_6153|0;if($241>>>0<576){$l_6153=$241;$sfbi_6154=$sfbi_6154+1|0;label=56;break}else{$_0=0;label=59;break};case 59:STACKTOP=__stackBase__;return $_0|0}return 0}function _III_aliasreduce($xr,$lines){$xr=$xr|0;$lines=$lines|0;var $_0=0,$_030=0,$xr_pn29=0,$i_027=0,$5=0,$6=0,$7=0,$8=0,$13=0,$14=0,$18=0,$21=0,$32=0,$39=0,label=0;label=1;while(1)switch(label|0){case 1:if(($lines|0)>18){label=2;break}else{label=8;break};case 2:$xr_pn29=$xr;$_030=$xr+72|0;label=4;break;case 3:$_0=$_030+72|0;if($_0>>>0<($xr+($lines<<2)|0)>>>0){$xr_pn29=$_030;$_030=$_0;label=4;break}else{label=8;break};case 4:$i_027=0;label=5;break;case 5:$5=$xr_pn29+(17-$i_027<<2)|0;$6=HEAP32[$5>>2]|0;$7=$xr_pn29+($i_027+18<<2)|0;$8=HEAP32[$7>>2]|0;if(($8|$6|0)==0){label=7;break}else{label=6;break};case 6:$13=$6+2048>>12;$14=40448+($i_027<<2)|0;$18=Math_imul((HEAP32[$14>>2]|0)+32768>>16,$13)|0;$21=40992+($i_027<<2)|0;HEAP32[$5>>2]=(Math_imul((HEAP32[$21>>2]|0)+32768>>16,2048-$8>>12)|0)+$18;$32=Math_imul((HEAP32[$14>>2]|0)+32768>>16,$8+2048>>12)|0;HEAP32[$7>>2]=(Math_imul((HEAP32[$21>>2]|0)+32768>>16,$13)|0)+$32;label=7;break;case 7:$39=$i_027+1|0;if(($39|0)<8){$i_027=$39;label=5;break}else{label=3;break};case 8:return}}function _III_overlap($output,$overlap,$sample,$sb){$output=$output|0;$overlap=$overlap|0;$sample=$sample|0;$sb=$sb|0;var $i_012=0,$4=0,$11=0,label=0;label=1;while(1)switch(label|0){case 1:$i_012=0;label=2;break;case 2:$4=$overlap+($i_012<<2)|0;HEAP32[$sample+($i_012<<7)+($sb<<2)>>2]=(HEAP32[$4>>2]|0)+(HEAP32[$output+($i_012<<2)>>2]|0);HEAP32[$4>>2]=HEAP32[$output+($i_012+18<<2)>>2];$11=$i_012+1|0;if($11>>>0<18){$i_012=$11;label=2;break}else{label=3;break};case 3:return}}function _III_reorder($xr,$channel,$sfbwidth){$xr=$xr|0;$channel=$channel|0;$sfbwidth=$sfbwidth|0;var $tmp=0,$sbw=0,$sw=0,$l_030=0,$_029=0,$5=0,$8=0,$_1=0,$sb_0=0,$13=0,$w_127=0,$f_026=0,$l_125=0,$_224=0,$_3=0,$f_1_in=0,$w_2=0,$27=0,$28=0,$29=0,$31=0,$40=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+2336|0;label=1;while(1)switch(label|0){case 1:$tmp=__stackBase__|0;$sbw=__stackBase__+2304|0;$sw=__stackBase__+2320|0;if((HEAP8[$channel+8|0]&8)==0){$sb_0=0;$_1=$sfbwidth;label=3;break}else{$_029=$sfbwidth;$l_030=0;label=2;break};case 2:$5=$_029+1|0;$8=(HEAPU8[$_029]|0)+$l_030|0;if($8>>>0<36){$_029=$5;$l_030=$8;label=2;break}else{$sb_0=2;$_1=$5;label=3;break};case 3:_memset($sw|0,0,12);HEAP32[$sbw>>2]=$sb_0;HEAP32[$sbw+4>>2]=$sb_0;HEAP32[$sbw+8>>2]=$sb_0;$13=$sb_0*18&-1;$_224=$_1+1|0;$l_125=$13;$f_026=HEAPU8[$_1]|0;$w_127=0;label=4;break;case 4:if(($f_026|0)==0){label=5;break}else{$w_2=$w_127;$f_1_in=$f_026;$_3=$_224;label=6;break};case 5:$w_2=(($w_127+1|0)>>>0)%3>>>0;$f_1_in=HEAPU8[$_224]|0;$_3=$_224+1|0;label=6;break;case 6:$27=HEAP32[$xr+($l_125<<2)>>2]|0;$28=$sw+($w_2<<2)|0;$29=HEAP32[$28>>2]|0;HEAP32[$28>>2]=$29+1;$31=$sbw+($w_2<<2)|0;HEAP32[$tmp+((HEAP32[$31>>2]|0)*72&-1)+($w_2*24&-1)+($29<<2)>>2]=$27;if((HEAP32[$28>>2]|0)==6){label=7;break}else{label=8;break};case 7:HEAP32[$28>>2]=0;HEAP32[$31>>2]=(HEAP32[$31>>2]|0)+1;label=8;break;case 8:$40=$l_125+1|0;if($40>>>0<576){$_224=$_3;$l_125=$40;$f_026=$f_1_in-1|0;$w_127=$w_2;label=4;break}else{label=9;break};case 9:_memcpy($xr+($13<<2)|0,$tmp+($sb_0*72&-1)|0,576-$13<<2)|0;STACKTOP=__stackBase__;return}}function _III_imdct_l($X,$z,$block_type){$X=$X|0;$z=$z|0;$block_type=$block_type|0;var $i_080=0,$1=0,$10=0,$11=0,$20=0,$21=0,$30=0,$31=0,$40=0,$i_187=0,$42=0,$51=0,$52=0,$61=0,$62=0,$71=0,$73=0,$78=0,$83=0,$88=0,$93=0,$98=0,$i_690=0,$104=0,$113=0,$114=0,$123=0,$124=0,$133=0,$135=0,$140=0,$145=0,$150=0,$155=0,$160=0,label=0;label=1;while(1)switch(label|0){case 1:_imdct36($X,$z);if(($block_type|0)==0){$i_080=0;label=2;break}else if(($block_type|0)==1){$i_187=0;label=3;break}else if(($block_type|0)==3){label=4;break}else{label=7;break};case 2:$1=$z+($i_080<<2)|0;HEAP32[$1>>2]=Math_imul((HEAP32[56+($i_080<<2)>>2]|0)+32768>>16,(HEAP32[$1>>2]|0)+2048>>12)|0;$10=$i_080|1;$11=$z+($10<<2)|0;HEAP32[$11>>2]=Math_imul((HEAP32[56+($10<<2)>>2]|0)+32768>>16,(HEAP32[$11>>2]|0)+2048>>12)|0;$20=$i_080|2;$21=$z+($20<<2)|0;HEAP32[$21>>2]=Math_imul((HEAP32[56+($20<<2)>>2]|0)+32768>>16,(HEAP32[$21>>2]|0)+2048>>12)|0;$30=$i_080|3;$31=$z+($30<<2)|0;HEAP32[$31>>2]=Math_imul((HEAP32[56+($30<<2)>>2]|0)+32768>>16,(HEAP32[$31>>2]|0)+2048>>12)|0;$40=$i_080+4|0;if($40>>>0<36){$i_080=$40;label=2;break}else{label=7;break};case 3:$42=$z+($i_187<<2)|0;HEAP32[$42>>2]=Math_imul((HEAP32[56+($i_187<<2)>>2]|0)+32768>>16,(HEAP32[$42>>2]|0)+2048>>12)|0;$51=$i_187+1|0;$52=$z+($51<<2)|0;HEAP32[$52>>2]=Math_imul((HEAP32[56+($51<<2)>>2]|0)+32768>>16,(HEAP32[$52>>2]|0)+2048>>12)|0;$61=$i_187+2|0;$62=$z+($61<<2)|0;HEAP32[$62>>2]=Math_imul((HEAP32[56+($61<<2)>>2]|0)+32768>>16,(HEAP32[$62>>2]|0)+2048>>12)|0;$71=$i_187+3|0;if($71>>>0<18){$i_187=$71;label=3;break}else{label=6;break};case 4:_memset($z|0,0,24);$73=$z+24|0;HEAP32[$73>>2]=((HEAP32[$73>>2]|0)+2048>>12)*535&-1;$78=$z+28|0;HEAP32[$78>>2]=((HEAP32[$78>>2]|0)+2048>>12)*1567&-1;$83=$z+32|0;HEAP32[$83>>2]=((HEAP32[$83>>2]|0)+2048>>12)*2493&-1;$88=$z+36|0;HEAP32[$88>>2]=((HEAP32[$88>>2]|0)+2048>>12)*3250&-1;$93=$z+40|0;HEAP32[$93>>2]=((HEAP32[$93>>2]|0)+2048>>12)*3784&-1;$98=$z+44|0;HEAP32[$98>>2]=((HEAP32[$98>>2]|0)+2048>>12)*4061&-1;$i_690=18;label=5;break;case 5:$104=$z+($i_690<<2)|0;HEAP32[$104>>2]=Math_imul((HEAP32[56+($i_690<<2)>>2]|0)+32768>>16,(HEAP32[$104>>2]|0)+2048>>12)|0;$113=$i_690+1|0;$114=$z+($113<<2)|0;HEAP32[$114>>2]=Math_imul((HEAP32[56+($113<<2)>>2]|0)+32768>>16,(HEAP32[$114>>2]|0)+2048>>12)|0;$123=$i_690+2|0;$124=$z+($123<<2)|0;HEAP32[$124>>2]=Math_imul((HEAP32[56+($123<<2)>>2]|0)+32768>>16,(HEAP32[$124>>2]|0)+2048>>12)|0;$133=$i_690+3|0;if($133>>>0<36){$i_690=$133;label=5;break}else{label=7;break};case 6:$135=$z+96|0;HEAP32[$135>>2]=((HEAP32[$135>>2]|0)+2048>>12)*4061&-1;$140=$z+100|0;HEAP32[$140>>2]=((HEAP32[$140>>2]|0)+2048>>12)*3784&-1;$145=$z+104|0;HEAP32[$145>>2]=((HEAP32[$145>>2]|0)+2048>>12)*3250&-1;$150=$z+108|0;HEAP32[$150>>2]=((HEAP32[$150>>2]|0)+2048>>12)*2493&-1;$155=$z+112|0;HEAP32[$155>>2]=((HEAP32[$155>>2]|0)+2048>>12)*1567&-1;$160=$z+116|0;HEAP32[$160>>2]=((HEAP32[$160>>2]|0)+2048>>12)*535&-1;_memset($z+120|0,0,24);label=7;break;case 7:return}}function _III_imdct_s($X,$z){$X=$X|0;$z=$z|0;var $1=0,$w_093=0,$yptr_092=0,$_091=0,$2=0,$3=0,$4=0,$5=0,$6=0,$s_090=0,$i_089=0,$15=0,$24=0,$33=0,$42=0,$51=0,$60=0,$72=0,$81=0,$90=0,$99=0,$108=0,$117=0,$123=0,$128=0,$i_187=0,$wptr_086=0,$yptr_185=0,$144=0,$148=0,$167=0,$193=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+144|0;label=1;while(1)switch(label|0){case 1:$1=__stackBase__|0;$_091=$X;$yptr_092=$1;$w_093=0;label=2;break;case 2:$2=$_091+4|0;$3=$_091+8|0;$4=$_091+12|0;$5=$_091+16|0;$6=$_091+20|0;$i_089=0;$s_090=35744;label=3;break;case 3:$15=Math_imul((HEAP32[$s_090>>2]|0)+32768>>16,(HEAP32[$_091>>2]|0)+2048>>12)|0;$24=(Math_imul((HEAP32[$s_090+4>>2]|0)+32768>>16,(HEAP32[$2>>2]|0)+2048>>12)|0)+$15|0;$33=$24+(Math_imul((HEAP32[$s_090+8>>2]|0)+32768>>16,(HEAP32[$3>>2]|0)+2048>>12)|0)|0;$42=$33+(Math_imul((HEAP32[$s_090+12>>2]|0)+32768>>16,(HEAP32[$4>>2]|0)+2048>>12)|0)|0;$51=$42+(Math_imul((HEAP32[$s_090+16>>2]|0)+32768>>16,(HEAP32[$5>>2]|0)+2048>>12)|0)|0;$60=$51+(Math_imul((HEAP32[$s_090+20>>2]|0)+32768>>16,(HEAP32[$6>>2]|0)+2048>>12)|0)|0;HEAP32[$yptr_092+($i_089<<2)>>2]=$60;HEAP32[$yptr_092+(5-$i_089<<2)>>2]=-$60;$72=Math_imul((HEAP32[$s_090+24>>2]|0)+32768>>16,(HEAP32[$_091>>2]|0)+2048>>12)|0;$81=(Math_imul((HEAP32[$s_090+28>>2]|0)+32768>>16,(HEAP32[$2>>2]|0)+2048>>12)|0)+$72|0;$90=$81+(Math_imul((HEAP32[$s_090+32>>2]|0)+32768>>16,(HEAP32[$3>>2]|0)+2048>>12)|0)|0;$99=$90+(Math_imul((HEAP32[$s_090+36>>2]|0)+32768>>16,(HEAP32[$4>>2]|0)+2048>>12)|0)|0;$108=$99+(Math_imul((HEAP32[$s_090+40>>2]|0)+32768>>16,(HEAP32[$5>>2]|0)+2048>>12)|0)|0;$117=$108+(Math_imul((HEAP32[$s_090+44>>2]|0)+32768>>16,(HEAP32[$6>>2]|0)+2048>>12)|0)|0;HEAP32[$yptr_092+($i_089+6<<2)>>2]=$117;HEAP32[$yptr_092+(11-$i_089<<2)>>2]=$117;$123=$i_089+1|0;if(($123|0)<3){$i_089=$123;$s_090=$s_090+48|0;label=3;break}else{label=4;break};case 4:$128=$w_093+1|0;if(($128|0)<3){$_091=$_091+24|0;$yptr_092=$yptr_092+48|0;$w_093=$128;label=2;break}else{$yptr_185=$1;$wptr_086=8;$i_187=0;label=5;break};case 5:HEAP32[$z+($i_187<<2)>>2]=0;HEAP32[$z+($i_187+6<<2)>>2]=Math_imul((HEAP32[$wptr_086>>2]|0)+32768>>16,(HEAP32[$yptr_185>>2]|0)+2048>>12)|0;$144=$wptr_086+24|0;$148=Math_imul((HEAP32[$144>>2]|0)+32768>>16,(HEAP32[$yptr_185+24>>2]|0)+2048>>12)|0;HEAP32[$z+($i_187+12<<2)>>2]=(Math_imul((HEAP32[$wptr_086>>2]|0)+32768>>16,(HEAP32[$yptr_185+48>>2]|0)+2048>>12)|0)+$148;$167=Math_imul((HEAP32[$144>>2]|0)+32768>>16,(HEAP32[$yptr_185+72>>2]|0)+2048>>12)|0;HEAP32[$z+($i_187+18<<2)>>2]=(Math_imul((HEAP32[$wptr_086>>2]|0)+32768>>16,(HEAP32[$yptr_185+96>>2]|0)+2048>>12)|0)+$167;HEAP32[$z+($i_187+24<<2)>>2]=Math_imul((HEAP32[$144>>2]|0)+32768>>16,(HEAP32[$yptr_185+120>>2]|0)+2048>>12)|0;HEAP32[$z+($i_187+30<<2)>>2]=0;$193=$i_187+1|0;if(($193|0)<6){$yptr_185=$yptr_185+4|0;$wptr_086=$wptr_086+4|0;$i_187=$193;label=5;break}else{label=6;break};case 6:STACKTOP=__stackBase__;return}}function _III_freqinver($sample,$sb){$sample=$sample|0;$sb=$sb|0;var $tmp2_026=0,$7=0,$tmp2_0=0,$14=0,$tmp2_0_1=0,$21=0,$tmp2_0_2=0,$27=0,$28=0;$tmp2_026=HEAP32[$sample+384+($sb<<2)>>2]|0;HEAP32[$sample+128+($sb<<2)>>2]=-(HEAP32[$sample+128+($sb<<2)>>2]|0);$7=HEAP32[$sample+640+($sb<<2)>>2]|0;HEAP32[$sample+384+($sb<<2)>>2]=-$tmp2_026;$tmp2_0=HEAP32[$sample+896+($sb<<2)>>2]|0;HEAP32[$sample+640+($sb<<2)>>2]=-$7;$14=HEAP32[$sample+1152+($sb<<2)>>2]|0;HEAP32[$sample+896+($sb<<2)>>2]=-$tmp2_0;$tmp2_0_1=HEAP32[$sample+1408+($sb<<2)>>2]|0;HEAP32[$sample+1152+($sb<<2)>>2]=-$14;$21=HEAP32[$sample+1664+($sb<<2)>>2]|0;HEAP32[$sample+1408+($sb<<2)>>2]=-$tmp2_0_1;$tmp2_0_2=HEAP32[$sample+1920+($sb<<2)>>2]|0;HEAP32[$sample+1664+($sb<<2)>>2]=-$21;$27=$sample+2176+($sb<<2)|0;$28=HEAP32[$27>>2]|0;HEAP32[$sample+1920+($sb<<2)>>2]=-$tmp2_0_2;HEAP32[$27>>2]=-$28;return}function _III_overlap_z($overlap,$sample,$sb){$overlap=$overlap|0;$sample=$sample|0;$sb=$sb|0;var $3=0,$6=0,$9=0,$12=0,$15=0,$18=0,$21=0,$24=0,$27=0,$30=0,$33=0,$36=0,$39=0,$42=0,$45=0,$48=0,$51=0;HEAP32[$sample+($sb<<2)>>2]=HEAP32[$overlap>>2];HEAP32[$overlap>>2]=0;$3=$overlap+4|0;HEAP32[$sample+128+($sb<<2)>>2]=HEAP32[$3>>2];HEAP32[$3>>2]=0;$6=$overlap+8|0;HEAP32[$sample+256+($sb<<2)>>2]=HEAP32[$6>>2];HEAP32[$6>>2]=0;$9=$overlap+12|0;HEAP32[$sample+384+($sb<<2)>>2]=HEAP32[$9>>2];HEAP32[$9>>2]=0;$12=$overlap+16|0;HEAP32[$sample+512+($sb<<2)>>2]=HEAP32[$12>>2];HEAP32[$12>>2]=0;$15=$overlap+20|0;HEAP32[$sample+640+($sb<<2)>>2]=HEAP32[$15>>2];HEAP32[$15>>2]=0;$18=$overlap+24|0;HEAP32[$sample+768+($sb<<2)>>2]=HEAP32[$18>>2];HEAP32[$18>>2]=0;$21=$overlap+28|0;HEAP32[$sample+896+($sb<<2)>>2]=HEAP32[$21>>2];HEAP32[$21>>2]=0;$24=$overlap+32|0;HEAP32[$sample+1024+($sb<<2)>>2]=HEAP32[$24>>2];HEAP32[$24>>2]=0;$27=$overlap+36|0;HEAP32[$sample+1152+($sb<<2)>>2]=HEAP32[$27>>2];HEAP32[$27>>2]=0;$30=$overlap+40|0;HEAP32[$sample+1280+($sb<<2)>>2]=HEAP32[$30>>2];HEAP32[$30>>2]=0;$33=$overlap+44|0;HEAP32[$sample+1408+($sb<<2)>>2]=HEAP32[$33>>2];HEAP32[$33>>2]=0;$36=$overlap+48|0;HEAP32[$sample+1536+($sb<<2)>>2]=HEAP32[$36>>2];HEAP32[$36>>2]=0;$39=$overlap+52|0;HEAP32[$sample+1664+($sb<<2)>>2]=HEAP32[$39>>2];HEAP32[$39>>2]=0;$42=$overlap+56|0;HEAP32[$sample+1792+($sb<<2)>>2]=HEAP32[$42>>2];HEAP32[$42>>2]=0;$45=$overlap+60|0;HEAP32[$sample+1920+($sb<<2)>>2]=HEAP32[$45>>2];HEAP32[$45>>2]=0;$48=$overlap+64|0;HEAP32[$sample+2048+($sb<<2)>>2]=HEAP32[$48>>2];HEAP32[$48>>2]=0;$51=$overlap+68|0;HEAP32[$sample+2176+($sb<<2)>>2]=HEAP32[$51>>2];HEAP32[$51>>2]=0;return}function _fastsdct($x,$y){$x=$x|0;$y=$y|0;var $2=0,$4=0,$5=0,$6=0,$8=0,$10=0,$11=0,$12=0,$14=0,$16=0,$17=0,$19=0,$20=0,$21=0,$22=0,$24=0,$28=0,$32=0,$36=0,$45=0,$49=0,$53=0,$57=0,$59=0,$60=0,$62=0;$2=HEAP32[$x+12>>2]|0;$4=HEAP32[$x+20>>2]|0;$5=$4+$2|0;$6=$2-$4|0;$8=HEAP32[$x+24>>2]|0;$10=HEAP32[$x+8>>2]|0;$11=$10+$8|0;$12=$8-$10|0;$14=HEAP32[$x+4>>2]|0;$16=HEAP32[$x+28>>2]|0;$17=$16+$14|0;$19=HEAP32[$x+32>>2]|0;$20=HEAP32[$x>>2]|0;$21=$20+$19|0;$22=$19-$20|0;$24=$11+$5+$21|0;$28=($6+2048+$12>>12)*-5266&-1;$32=($6+2048-$22>>12)*8068&-1;$36=($12+2048+$22>>12)*-2802&-1;$45=($14+2048-$16>>12)*-7094&-1;$49=($11+2048-$21>>12)*-7698&-1;$53=($5+2048-$21>>12)*-1423&-1;$57=($5+2048-$11>>12)*-6275&-1;$59=HEAP32[$x+16>>2]|0;$60=$59+$17|0;$62=($59<<1)-$17|0;HEAP32[$y>>2]=$60+$24;HEAP32[$y+8>>2]=$28-$45+$32;HEAP32[$y+16>>2]=$57-$62+$49;HEAP32[$y+24>>2]=($6+2048-$12+$22>>12)*-7094&-1;HEAP32[$y+32>>2]=$49+$62-$53;HEAP32[$y+40>>2]=$45-$36+$32;HEAP32[$y+48>>2]=$24-($60<<1);HEAP32[$y+56>>2]=$45+$28+$36;HEAP32[$y+64>>2]=$62+$57+$53;return}function _imdct36($x,$y){$x=$x|0;$y=$y|0;var $tmp=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+72|0;$tmp=__stackBase__|0;_dctIV($x,$tmp|0);HEAP32[$y>>2]=HEAP32[$tmp+36>>2];HEAP32[$y+4>>2]=HEAP32[$tmp+40>>2];HEAP32[$y+8>>2]=HEAP32[$tmp+44>>2];HEAP32[$y+12>>2]=HEAP32[$tmp+48>>2];HEAP32[$y+16>>2]=HEAP32[$tmp+52>>2];HEAP32[$y+20>>2]=HEAP32[$tmp+56>>2];HEAP32[$y+24>>2]=HEAP32[$tmp+60>>2];HEAP32[$y+28>>2]=HEAP32[$tmp+64>>2];HEAP32[$y+32>>2]=HEAP32[$tmp+68>>2];HEAP32[$y+36>>2]=-(HEAP32[$tmp+68>>2]|0);HEAP32[$y+40>>2]=-(HEAP32[$tmp+64>>2]|0);HEAP32[$y+44>>2]=-(HEAP32[$tmp+60>>2]|0);HEAP32[$y+48>>2]=-(HEAP32[$tmp+56>>2]|0);HEAP32[$y+52>>2]=-(HEAP32[$tmp+52>>2]|0);HEAP32[$y+56>>2]=-(HEAP32[$tmp+48>>2]|0);HEAP32[$y+60>>2]=-(HEAP32[$tmp+44>>2]|0);HEAP32[$y+64>>2]=-(HEAP32[$tmp+40>>2]|0);HEAP32[$y+68>>2]=-(HEAP32[$tmp+36>>2]|0);HEAP32[$y+72>>2]=-(HEAP32[$tmp+32>>2]|0);HEAP32[$y+76>>2]=-(HEAP32[$tmp+28>>2]|0);HEAP32[$y+80>>2]=-(HEAP32[$tmp+24>>2]|0);HEAP32[$y+84>>2]=-(HEAP32[$tmp+20>>2]|0);HEAP32[$y+88>>2]=-(HEAP32[$tmp+16>>2]|0);HEAP32[$y+92>>2]=-(HEAP32[$tmp+12>>2]|0);HEAP32[$y+96>>2]=-(HEAP32[$tmp+8>>2]|0);HEAP32[$y+100>>2]=-(HEAP32[$tmp+4>>2]|0);HEAP32[$y+104>>2]=-(HEAP32[$tmp>>2]|0);HEAP32[$y+108>>2]=-(HEAP32[$tmp>>2]|0);HEAP32[$y+112>>2]=-(HEAP32[$tmp+4>>2]|0);HEAP32[$y+116>>2]=-(HEAP32[$tmp+8>>2]|0);HEAP32[$y+120>>2]=-(HEAP32[$tmp+12>>2]|0);HEAP32[$y+124>>2]=-(HEAP32[$tmp+16>>2]|0);HEAP32[$y+128>>2]=-(HEAP32[$tmp+20>>2]|0);HEAP32[$y+132>>2]=-(HEAP32[$tmp+24>>2]|0);HEAP32[$y+136>>2]=-(HEAP32[$tmp+28>>2]|0);HEAP32[$y+140>>2]=-(HEAP32[$tmp+32>>2]|0);STACKTOP=__stackBase__;return}function _dctIV($y,$X){$y=$y|0;$X=$X|0;var $tmp=0,$i_045=0,$12=0,$23=0,$34=0,$39=0,$40=0,$43=0,$44=0,$47=0,$48=0,$51=0,$52=0,$55=0,$56=0,$59=0,$60=0,$63=0,$64=0,$67=0,$68=0,$71=0,$72=0,$75=0,$76=0,$79=0,$80=0,$83=0,$84=0,$87=0,$88=0,$91=0,$92=0,$95=0,$96=0,$99=0,$100=0,$103=0,$104=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+72|0;label=1;while(1)switch(label|0){case 1:$tmp=__stackBase__|0;$i_045=0;label=2;break;case 2:HEAP32[$tmp+($i_045<<2)>>2]=Math_imul((HEAP32[40376+($i_045<<2)>>2]|0)+32768>>16,(HEAP32[$y+($i_045<<2)>>2]|0)+2048>>12)|0;$12=$i_045+1|0;HEAP32[$tmp+($12<<2)>>2]=Math_imul((HEAP32[40376+($12<<2)>>2]|0)+32768>>16,(HEAP32[$y+($12<<2)>>2]|0)+2048>>12)|0;$23=$i_045+2|0;HEAP32[$tmp+($23<<2)>>2]=Math_imul((HEAP32[40376+($23<<2)>>2]|0)+32768>>16,(HEAP32[$y+($23<<2)>>2]|0)+2048>>12)|0;$34=$i_045+3|0;if(($34|0)<18){$i_045=$34;label=2;break}else{label=3;break};case 3:_sdctII($tmp|0,$X);$39=(HEAP32[$X>>2]|0)/2&-1;HEAP32[$X>>2]=$39;$40=$X+4|0;$43=((HEAP32[$40>>2]|0)/2&-1)-$39|0;HEAP32[$40>>2]=$43;$44=$X+8|0;$47=((HEAP32[$44>>2]|0)/2&-1)-$43|0;HEAP32[$44>>2]=$47;$48=$X+12|0;$51=((HEAP32[$48>>2]|0)/2&-1)-$47|0;HEAP32[$48>>2]=$51;$52=$X+16|0;$55=((HEAP32[$52>>2]|0)/2&-1)-$51|0;HEAP32[$52>>2]=$55;$56=$X+20|0;$59=((HEAP32[$56>>2]|0)/2&-1)-$55|0;HEAP32[$56>>2]=$59;$60=$X+24|0;$63=((HEAP32[$60>>2]|0)/2&-1)-$59|0;HEAP32[$60>>2]=$63;$64=$X+28|0;$67=((HEAP32[$64>>2]|0)/2&-1)-$63|0;HEAP32[$64>>2]=$67;$68=$X+32|0;$71=((HEAP32[$68>>2]|0)/2&-1)-$67|0;HEAP32[$68>>2]=$71;$72=$X+36|0;$75=((HEAP32[$72>>2]|0)/2&-1)-$71|0;HEAP32[$72>>2]=$75;$76=$X+40|0;$79=((HEAP32[$76>>2]|0)/2&-1)-$75|0;HEAP32[$76>>2]=$79;$80=$X+44|0;$83=((HEAP32[$80>>2]|0)/2&-1)-$79|0;HEAP32[$80>>2]=$83;$84=$X+48|0;$87=((HEAP32[$84>>2]|0)/2&-1)-$83|0;HEAP32[$84>>2]=$87;$88=$X+52|0;$91=((HEAP32[$88>>2]|0)/2&-1)-$87|0;HEAP32[$88>>2]=$91;$92=$X+56|0;$95=((HEAP32[$92>>2]|0)/2&-1)-$91|0;HEAP32[$92>>2]=$95;$96=$X+60|0;$99=((HEAP32[$96>>2]|0)/2&-1)-$95|0;HEAP32[$96>>2]=$99;$100=$X+64|0;$103=((HEAP32[$100>>2]|0)/2&-1)-$99|0;HEAP32[$100>>2]=$103;$104=$X+68|0;HEAP32[$104>>2]=((HEAP32[$104>>2]|0)/2&-1)-$103;STACKTOP=__stackBase__;return}}function _sdctII($x,$X){$x=$x|0;$X=$X|0;var $tmp=0,$54=0,$i_1_neg60=0,$i_159=0,$70=0,$85=0,$100=0,$i_1_neg=0,$106=0,$108=0,$109=0,$111=0,$112=0,$114=0,$115=0,$117=0,$118=0,$120=0,$121=0,$123=0,$124=0,$126=0,$127=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+40|0;label=1;while(1)switch(label|0){case 1:$tmp=__stackBase__|0;HEAP32[$tmp>>2]=(HEAP32[$x+68>>2]|0)+(HEAP32[$x>>2]|0);HEAP32[$tmp+4>>2]=(HEAP32[$x+64>>2]|0)+(HEAP32[$x+4>>2]|0);HEAP32[$tmp+8>>2]=(HEAP32[$x+60>>2]|0)+(HEAP32[$x+8>>2]|0);HEAP32[$tmp+12>>2]=(HEAP32[$x+56>>2]|0)+(HEAP32[$x+12>>2]|0);HEAP32[$tmp+16>>2]=(HEAP32[$x+52>>2]|0)+(HEAP32[$x+16>>2]|0);HEAP32[$tmp+20>>2]=(HEAP32[$x+48>>2]|0)+(HEAP32[$x+20>>2]|0);HEAP32[$tmp+24>>2]=(HEAP32[$x+44>>2]|0)+(HEAP32[$x+24>>2]|0);HEAP32[$tmp+28>>2]=(HEAP32[$x+40>>2]|0)+(HEAP32[$x+28>>2]|0);HEAP32[$tmp+32>>2]=(HEAP32[$x+36>>2]|0)+(HEAP32[$x+32>>2]|0);$54=$tmp|0;_fastsdct($54,$X);$i_159=0;$i_1_neg60=0;label=2;break;case 2:HEAP32[$tmp+($i_159<<2)>>2]=Math_imul((HEAP32[1304+($i_159<<2)>>2]|0)+32768>>16,(HEAP32[$x+($i_159<<2)>>2]|0)+2048-(HEAP32[$x+($i_1_neg60+17<<2)>>2]|0)>>12)|0;$70=$i_159+1|0;HEAP32[$tmp+($70<<2)>>2]=Math_imul((HEAP32[1304+($70<<2)>>2]|0)+32768>>16,(HEAP32[$x+($70<<2)>>2]|0)+2048-(HEAP32[$x+($i_1_neg60+16<<2)>>2]|0)>>12)|0;$85=$i_159+2|0;HEAP32[$tmp+($85<<2)>>2]=Math_imul((HEAP32[1304+($85<<2)>>2]|0)+32768>>16,(HEAP32[$x+($85<<2)>>2]|0)+2048-(HEAP32[$x+($i_1_neg60+15<<2)>>2]|0)>>12)|0;$100=$i_159+3|0;$i_1_neg=-3-$i_159|0;if(($100|0)<9){$i_159=$100;$i_1_neg60=$i_1_neg;label=2;break}else{label=3;break};case 3:_fastsdct($54,$X+4|0);$106=$X+12|0;$108=(HEAP32[$106>>2]|0)-(HEAP32[$X+4>>2]|0)|0;HEAP32[$106>>2]=$108;$109=$X+20|0;$111=(HEAP32[$109>>2]|0)-$108|0;HEAP32[$109>>2]=$111;$112=$X+28|0;$114=(HEAP32[$112>>2]|0)-$111|0;HEAP32[$112>>2]=$114;$115=$X+36|0;$117=(HEAP32[$115>>2]|0)-$114|0;HEAP32[$115>>2]=$117;$118=$X+44|0;$120=(HEAP32[$118>>2]|0)-$117|0;HEAP32[$118>>2]=$120;$121=$X+52|0;$123=(HEAP32[$121>>2]|0)-$120|0;HEAP32[$121>>2]=$123;$124=$X+60|0;$126=(HEAP32[$124>>2]|0)-$123|0;HEAP32[$124>>2]=$126;$127=$X+68|0;HEAP32[$127>>2]=(HEAP32[$127>>2]|0)-$126;STACKTOP=__stackBase__;return}}function _III_exponents($channel,$sfbwidth,$exponents){$channel=$channel|0;$sfbwidth=$sfbwidth|0;$exponents=$exponents|0;var $4=0,$7=0,$10=0,$sfbi_065=0,$l_064=0,$31=0,$35=0,$l_1=0,$sfbi_1=0,$46=0,$51=0,$sfbi_262=0,$l_261=0,$59=0,$66=0,$77=0,$sfbi_370=0,$93=0,$sfbi_467=0,$101=0,label=0;label=1;while(1)switch(label|0){case 1:$4=(HEAPU16[$channel+4>>1]|0)-210|0;$7=HEAPU8[$channel+8|0]|0;$10=($7>>>1&1)+1|0;if((HEAP8[$channel+9|0]|0)==2){label=2;break}else{label=7;break};case 2:if(($7&8|0)==0){$sfbi_1=0;$l_1=0;label=5;break}else{label=3;break};case 3:$l_064=0;$sfbi_065=0;label=4;break;case 4:HEAP32[$exponents+($sfbi_065<<2)>>2]=$4-((HEAPU8[34696+$sfbi_065|0]&$7<<29>>31)+(HEAPU8[$channel+18+$sfbi_065|0]|0)<<$10);$31=$sfbi_065+1|0;$35=(HEAPU8[$sfbwidth+$sfbi_065|0]|0)+$l_064|0;if($35>>>0<36){$l_064=$35;$sfbi_065=$31;label=4;break}else{$sfbi_1=$31;$l_1=$35;label=5;break};case 5:$46=$4-(HEAPU8[$channel+14|0]<<3)|0;$51=$4-(HEAPU8[$channel+15|0]<<3)|0;if($l_1>>>0<576){$l_261=$l_1;$sfbi_262=$sfbi_1;label=6;break}else{label=10;break};case 6:HEAP32[$exponents+($sfbi_262<<2)>>2]=$4-(HEAPU8[$channel+13|0]<<3)-(HEAPU8[$channel+18+$sfbi_262|0]<<$10);$59=$sfbi_262+1|0;HEAP32[$exponents+($59<<2)>>2]=$46-(HEAPU8[$channel+18+$59|0]<<$10);$66=$sfbi_262+2|0;HEAP32[$exponents+($66<<2)>>2]=$51-(HEAPU8[$channel+18+$66|0]<<$10);$77=((HEAPU8[$sfbwidth+$sfbi_262|0]|0)*3&-1)+$l_261|0;if($77>>>0<576){$l_261=$77;$sfbi_262=$sfbi_262+3|0;label=6;break}else{label=10;break};case 7:if(($7&4|0)==0){$sfbi_467=0;label=9;break}else{$sfbi_370=0;label=8;break};case 8:HEAP32[$exponents+($sfbi_370<<2)>>2]=$4-((HEAPU8[34696+$sfbi_370|0]|0)+(HEAPU8[$channel+18+$sfbi_370|0]|0)<<$10);$93=$sfbi_370+1|0;if($93>>>0<22){$sfbi_370=$93;label=8;break}else{label=10;break};case 9:HEAP32[$exponents+($sfbi_467<<2)>>2]=$4-(HEAPU8[$channel+18+$sfbi_467|0]<<$10);$101=$sfbi_467+1|0;if($101>>>0<22){$sfbi_467=$101;label=9;break}else{label=10;break};case 10:return}}function _III_requantize($value,$exp){$value=$value|0;$exp=$exp|0;var $1=0,$6=0,$12=0,$15=0,$requantized_0=0,$37=0,label=0;label=1;while(1)switch(label|0){case 1:$1=($exp|0)%4&-1;$6=HEAP32[1544+($value<<2)>>2]&134217727;$12=((HEAPU16[1546+($value<<2)>>1]|0)>>>11&65535)+(($exp|0)/4&-1)|0;if(($12|0)<0){label=2;break}else{label=4;break};case 2:$15=-$12|0;if($15>>>0>31){$requantized_0=0;label=5;break}else{label=3;break};case 3:$requantized_0=(1<<($12^-1))+$6>>$15;label=5;break;case 4:$requantized_0=($12|0)>4?2147483647:$6<<$12;label=5;break;case 5:if(($1|0)==0){$37=$requantized_0;label=7;break}else{label=6;break};case 6:$37=Math_imul((HEAP32[34376+($1+3<<2)>>2]|0)+32768>>16,$requantized_0+2048>>12)|0;label=7;break;case 7:return $37|0}return 0}function _mad_stream_skip($stream,$length){$stream=$stream|0;$length=$length|0;var $1=0;$1=$stream+8|0;HEAP32[$1>>2]=(HEAP32[$1>>2]|0)+$length;return}function _mad_stream_errorstr($stream){$stream=$stream|0;var $2=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[$stream+60>>2]|0;if(($2|0)==1){label=2;break}else if(($2|0)==2){label=3;break}else if(($2|0)==49){label=4;break}else if(($2|0)==257){label=5;break}else if(($2|0)==258){label=6;break}else if(($2|0)==259){label=7;break}else if(($2|0)==260){label=8;break}else if(($2|0)==261){label=9;break}else if(($2|0)==513){label=10;break}else if(($2|0)==529){label=11;break}else if(($2|0)==545){label=12;break}else if(($2|0)==546){label=13;break}else if(($2|0)==561){label=14;break}else if(($2|0)==562){label=15;break}else if(($2|0)==563){label=16;break}else if(($2|0)==564){label=17;break}else if(($2|0)==565){label=18;break}else if(($2|0)==566){label=19;break}else if(($2|0)==567){label=20;break}else if(($2|0)==568){label=21;break}else if(($2|0)==569){label=22;break}else if(($2|0)==0){$_0=41976;label=24;break}else{label=23;break};case 2:$_0=42224;label=24;break;case 3:$_0=41728;label=24;break;case 4:$_0=41640;label=24;break;case 5:$_0=41544;label=24;break;case 6:$_0=41512;label=24;break;case 7:$_0=41488;label=24;break;case 8:$_0=41440;label=24;break;case 9:$_0=41416;label=24;break;case 10:$_0=41392;label=24;break;case 11:$_0=42304;label=24;break;case 12:$_0=42272;label=24;break;case 13:$_0=42192;label=24;break;case 14:$_0=42152;label=24;break;case 15:$_0=42080;label=24;break;case 16:$_0=42032;label=24;break;case 17:$_0=41992;label=24;break;case 18:$_0=41944;label=24;break;case 19:$_0=41912;label=24;break;case 20:$_0=41880;label=24;break;case 21:$_0=41800;label=24;break;case 22:$_0=41768;label=24;break;case 23:$_0=0;label=24;break;case 24:return $_0|0}return 0}function _mad_synth_mute($synth){$synth=$synth|0;var $s_021=0,$32=0,$s_021_1=0,$66=0,label=0;label=2;while(1)switch(label|0){case 2:$s_021=0;label=3;break;case 3:HEAP32[$synth+1536+($s_021<<5)>>2]=0;HEAP32[$synth+1024+($s_021<<5)>>2]=0;HEAP32[$synth+512+($s_021<<5)>>2]=0;HEAP32[$synth+($s_021<<5)>>2]=0;HEAP32[$synth+1536+($s_021<<5)+4>>2]=0;HEAP32[$synth+1024+($s_021<<5)+4>>2]=0;HEAP32[$synth+512+($s_021<<5)+4>>2]=0;HEAP32[$synth+($s_021<<5)+4>>2]=0;HEAP32[$synth+1536+($s_021<<5)+8>>2]=0;HEAP32[$synth+1024+($s_021<<5)+8>>2]=0;HEAP32[$synth+512+($s_021<<5)+8>>2]=0;HEAP32[$synth+($s_021<<5)+8>>2]=0;HEAP32[$synth+1536+($s_021<<5)+12>>2]=0;HEAP32[$synth+1024+($s_021<<5)+12>>2]=0;HEAP32[$synth+512+($s_021<<5)+12>>2]=0;HEAP32[$synth+($s_021<<5)+12>>2]=0;HEAP32[$synth+1536+($s_021<<5)+16>>2]=0;HEAP32[$synth+1024+($s_021<<5)+16>>2]=0;HEAP32[$synth+512+($s_021<<5)+16>>2]=0;HEAP32[$synth+($s_021<<5)+16>>2]=0;HEAP32[$synth+1536+($s_021<<5)+20>>2]=0;HEAP32[$synth+1024+($s_021<<5)+20>>2]=0;HEAP32[$synth+512+($s_021<<5)+20>>2]=0;HEAP32[$synth+($s_021<<5)+20>>2]=0;HEAP32[$synth+1536+($s_021<<5)+24>>2]=0;HEAP32[$synth+1024+($s_021<<5)+24>>2]=0;HEAP32[$synth+512+($s_021<<5)+24>>2]=0;HEAP32[$synth+($s_021<<5)+24>>2]=0;HEAP32[$synth+1536+($s_021<<5)+28>>2]=0;HEAP32[$synth+1024+($s_021<<5)+28>>2]=0;HEAP32[$synth+512+($s_021<<5)+28>>2]=0;HEAP32[$synth+($s_021<<5)+28>>2]=0;$32=$s_021+1|0;if($32>>>0<16){$s_021=$32;label=3;break}else{$s_021_1=0;label=4;break};case 4:HEAP32[$synth+3584+($s_021_1<<5)>>2]=0;HEAP32[$synth+3072+($s_021_1<<5)>>2]=0;HEAP32[$synth+2560+($s_021_1<<5)>>2]=0;HEAP32[$synth+2048+($s_021_1<<5)>>2]=0;HEAP32[$synth+3584+($s_021_1<<5)+4>>2]=0;HEAP32[$synth+3072+($s_021_1<<5)+4>>2]=0;HEAP32[$synth+2560+($s_021_1<<5)+4>>2]=0;HEAP32[$synth+2048+($s_021_1<<5)+4>>2]=0;HEAP32[$synth+3584+($s_021_1<<5)+8>>2]=0;HEAP32[$synth+3072+($s_021_1<<5)+8>>2]=0;HEAP32[$synth+2560+($s_021_1<<5)+8>>2]=0;HEAP32[$synth+2048+($s_021_1<<5)+8>>2]=0;HEAP32[$synth+3584+($s_021_1<<5)+12>>2]=0;HEAP32[$synth+3072+($s_021_1<<5)+12>>2]=0;HEAP32[$synth+2560+($s_021_1<<5)+12>>2]=0;HEAP32[$synth+2048+($s_021_1<<5)+12>>2]=0;HEAP32[$synth+3584+($s_021_1<<5)+16>>2]=0;HEAP32[$synth+3072+($s_021_1<<5)+16>>2]=0;HEAP32[$synth+2560+($s_021_1<<5)+16>>2]=0;HEAP32[$synth+2048+($s_021_1<<5)+16>>2]=0;HEAP32[$synth+3584+($s_021_1<<5)+20>>2]=0;HEAP32[$synth+3072+($s_021_1<<5)+20>>2]=0;HEAP32[$synth+2560+($s_021_1<<5)+20>>2]=0;HEAP32[$synth+2048+($s_021_1<<5)+20>>2]=0;HEAP32[$synth+3584+($s_021_1<<5)+24>>2]=0;HEAP32[$synth+3072+($s_021_1<<5)+24>>2]=0;HEAP32[$synth+2560+($s_021_1<<5)+24>>2]=0;HEAP32[$synth+2048+($s_021_1<<5)+24>>2]=0;HEAP32[$synth+3584+($s_021_1<<5)+28>>2]=0;HEAP32[$synth+3072+($s_021_1<<5)+28>>2]=0;HEAP32[$synth+2560+($s_021_1<<5)+28>>2]=0;HEAP32[$synth+2048+($s_021_1<<5)+28>>2]=0;$66=$s_021_1+1|0;if($66>>>0<16){$s_021_1=$66;label=4;break}else{label=5;break};case 5:return}}function _mad_stream_init($stream){$stream=$stream|0;_memset($stream|0,0,28);_mad_bit_init($stream+28|0,0);_mad_bit_init($stream+36|0,0);_memset($stream+44|0,0,20);return}function _mad_stream_finish($stream){$stream=$stream|0;var $1=0,$2=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$stream+48|0;$2=HEAP32[$1>>2]|0;if(($2|0)==0){label=3;break}else{label=2;break};case 2:_free($2|0);HEAP32[$1>>2]=0;label=3;break;case 3:return}}function _mad_stream_buffer($stream,$buffer,$length){$stream=$stream|0;$buffer=$buffer|0;$length=$length|0;HEAP32[$stream>>2]=$buffer;HEAP32[$stream+4>>2]=$buffer+$length;HEAP32[$stream+20>>2]=$buffer;HEAP32[$stream+24>>2]=$buffer;HEAP32[$stream+12>>2]=1;_mad_bit_init($stream+28|0,$buffer);return}function _mad_stream_sync($stream){$stream=$stream|0;var $1=0,$2=0,$4=0,$5=0,$ptr_011=0,$13=0,$ptr_0_lcssa=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$stream+28|0;$2=_mad_bit_nextbyte($1)|0;$4=HEAP32[$stream+4>>2]|0;$5=$4-1|0;if($2>>>0<$5>>>0){$ptr_011=$2;label=2;break}else{$ptr_0_lcssa=$2;label=5;break};case 2:if((HEAP8[$ptr_011]|0)==-1){label=3;break}else{label=4;break};case 3:if((HEAP8[$ptr_011+1|0]&-32)<<24>>24==-32){$ptr_0_lcssa=$ptr_011;label=5;break}else{label=4;break};case 4:$13=$ptr_011+1|0;if($13>>>0<$5>>>0){$ptr_011=$13;label=2;break}else{$ptr_0_lcssa=$13;label=5;break};case 5:if(($4-$ptr_0_lcssa|0)<8){$_0=-1;label=7;break}else{label=6;break};case 6:_mad_bit_init($1,$ptr_0_lcssa);$_0=0;label=7;break;case 7:return $_0|0}return 0}function _mad_synth_init($synth){$synth=$synth|0;_mad_synth_mute($synth);_memset($synth+4096|0,0,12);return}function _mad_synth_frame($synth,$frame){$synth=$synth|0;$frame=$frame|0;var $4=0,$6=0,$13=0,$15=0,$18=0,$23=0,$synth_frame_0=0,$34=0,label=0;label=1;while(1)switch(label|0){case 1:$4=(HEAP32[$frame+4>>2]|0)!=0?2:1;$6=HEAP32[$frame>>2]|0;if(($6|0)==3){label=2;break}else if(($6|0)==1){$15=12;label=4;break}else{$13=36;label=3;break};case 2:$13=(HEAP32[$frame+28>>2]&4096|0)!=0?18:36;label=3;break;case 3:$15=$13;label=4;break;case 4:$18=$synth+4100|0;HEAP32[$18>>2]=HEAP32[$frame+20>>2];HEAP16[$synth+4104>>1]=$4&65535;$23=$synth+4106|0;HEAP16[$23>>1]=$15<<5&65535;if((HEAP32[$frame+44>>2]&2|0)==0){$synth_frame_0=52;label=6;break}else{label=5;break};case 5:HEAP32[$18>>2]=(HEAP32[$18>>2]|0)>>>1;HEAP16[$23>>1]=(HEAPU16[$23>>1]|0)>>>1;$synth_frame_0=22;label=6;break;case 6:FUNCTION_TABLE_viiii[$synth_frame_0&63]($synth,$frame,$4,$15);$34=$synth+4096|0;HEAP32[$34>>2]=(HEAP32[$34>>2]|0)+$15&15;return}}function _synth_full($synth,$frame,$nch,$ns){$synth=$synth|0;$frame=$frame|0;$nch=$nch|0;$ns=$ns|0;var $indvars_iv326_in=0,$indvars_iv_in=0,$ch_0301=0,$indvars_iv326=0,$phase_0300=0,$s_0299=0,$pcm1_0298=0,$10=0,$11=0,$13=0,$15=0,$16=0,$17=0,$23=0,$_sum=0,$28=0,$_sum212=0,$33=0,$_sum213=0,$38=0,$_sum214=0,$43=0,$_sum215=0,$48=0,$_sum216=0,$53=0,$_sum217=0,$58=0,$64=0,$_sum218=0,$70=0,$_sum219=0,$76=0,$_sum220=0,$82=0,$_sum221=0,$88=0,$_sum222=0,$94=0,$_sum223=0,$100=0,$_sum224=0,$111=0,$pcm1_0298_pn=0,$Dptr_0296=0,$fo_0295=0,$fe_0294=0,$pcm2_0293=0,$sb_0292=0,$pcm1_1297=0,$113=0,$116=0,$119=0,$120=0,$124=0,$125=0,$129=0,$130=0,$134=0,$135=0,$139=0,$140=0,$144=0,$145=0,$149=0,$150=0,$154=0,$156=0,$161=0,$162=0,$167=0,$168=0,$173=0,$174=0,$179=0,$180=0,$185=0,$186=0,$191=0,$192=0,$197=0,$198=0,$207=0,$212=0,$217=0,$222=0,$227=0,$232=0,$237=0,$242=0,$247=0,$252=0,$257=0,$262=0,$267=0,$272=0,$277=0,$286=0,$292=0,$298=0,$304=0,$310=0,$316=0,$322=0,$328=0,$340=0,$342=0,label=0;label=1;while(1)switch(label|0){case 1:if(($nch|0)==0){label=9;break}else{label=2;break};case 2:$ch_0301=0;$indvars_iv_in=$synth+1504|0;$indvars_iv326_in=$synth+1472|0;label=3;break;case 3:$indvars_iv326=$indvars_iv326_in;if(($ns|0)==0){label=8;break}else{label=4;break};case 4:$pcm1_0298=$synth+4108+($ch_0301*4608&-1)|0;$s_0299=0;$phase_0300=HEAP32[$synth+4096>>2]|0;label=5;break;case 5:$10=$phase_0300&1;$11=$synth+($ch_0301<<11)+($10<<9)|0;_dct32($frame+48+($ch_0301*4608&-1)+($s_0299<<7)|0,$phase_0300>>>1,$11,$synth+($ch_0301<<11)+1024+($10<<9)|0);$13=$phase_0300&-2;$15=$phase_0300+15&14;$16=$15|1;$17=$10^1;$23=Math_imul(HEAP32[43176+($16<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($17<<9)>>2]|0)|0;$_sum=$16+14|0;$28=Math_imul(HEAP32[43176+($_sum<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($17<<9)+4>>2]|0)|0;$_sum212=$16+12|0;$33=Math_imul(HEAP32[43176+($_sum212<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($17<<9)+8>>2]|0)|0;$_sum213=$16+10|0;$38=Math_imul(HEAP32[43176+($_sum213<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($17<<9)+12>>2]|0)|0;$_sum214=$16+8|0;$43=Math_imul(HEAP32[43176+($_sum214<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($17<<9)+16>>2]|0)|0;$_sum215=$16+6|0;$48=Math_imul(HEAP32[43176+($_sum215<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($17<<9)+20>>2]|0)|0;$_sum216=$16+4|0;$53=Math_imul(HEAP32[43176+($_sum216<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($17<<9)+24>>2]|0)|0;$_sum217=$16+2|0;$58=Math_imul(HEAP32[43176+($_sum217<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($17<<9)+28>>2]|0)|0;$64=(Math_imul(HEAP32[43176+($13<<2)>>2]|0,HEAP32[$11>>2]|0)|0)-($28+$23+$33+$38+$43+$48+$53+$58)|0;$_sum218=$13+14|0;$70=$64+(Math_imul(HEAP32[43176+($_sum218<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($10<<9)+4>>2]|0)|0)|0;$_sum219=$13+12|0;$76=$70+(Math_imul(HEAP32[43176+($_sum219<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($10<<9)+8>>2]|0)|0)|0;$_sum220=$13+10|0;$82=$76+(Math_imul(HEAP32[43176+($_sum220<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($10<<9)+12>>2]|0)|0)|0;$_sum221=$13+8|0;$88=$82+(Math_imul(HEAP32[43176+($_sum221<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($10<<9)+16>>2]|0)|0)|0;$_sum222=$13+6|0;$94=$88+(Math_imul(HEAP32[43176+($_sum222<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($10<<9)+20>>2]|0)|0)|0;$_sum223=$13+4|0;$100=$94+(Math_imul(HEAP32[43176+($_sum223<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($10<<9)+24>>2]|0)|0)|0;$_sum224=$13+2|0;HEAP32[$pcm1_0298>>2]=$100+(Math_imul(HEAP32[43176+($_sum224<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($10<<9)+28>>2]|0)|0)>>2;$111=$phase_0300&1^1;$sb_0292=1;$pcm2_0293=$pcm1_0298+124|0;$fe_0294=$11;$fo_0295=$synth+($ch_0301<<11)+1024+($17<<9)|0;$Dptr_0296=43176;$pcm1_0298_pn=$pcm1_0298;label=6;break;case 6:$pcm1_1297=$pcm1_0298_pn+4|0;$113=$fe_0294+32|0;$116=$fo_0295|0;$119=Math_imul(HEAP32[$Dptr_0296+128+($16<<2)>>2]|0,HEAP32[$116>>2]|0)|0;$120=$fo_0295+4|0;$124=Math_imul(HEAP32[$Dptr_0296+128+($_sum<<2)>>2]|0,HEAP32[$120>>2]|0)|0;$125=$fo_0295+8|0;$129=Math_imul(HEAP32[$Dptr_0296+128+($_sum212<<2)>>2]|0,HEAP32[$125>>2]|0)|0;$130=$fo_0295+12|0;$134=Math_imul(HEAP32[$Dptr_0296+128+($_sum213<<2)>>2]|0,HEAP32[$130>>2]|0)|0;$135=$fo_0295+16|0;$139=Math_imul(HEAP32[$Dptr_0296+128+($_sum214<<2)>>2]|0,HEAP32[$135>>2]|0)|0;$140=$fo_0295+20|0;$144=Math_imul(HEAP32[$Dptr_0296+128+($_sum215<<2)>>2]|0,HEAP32[$140>>2]|0)|0;$145=$fo_0295+24|0;$149=Math_imul(HEAP32[$Dptr_0296+128+($_sum216<<2)>>2]|0,HEAP32[$145>>2]|0)|0;$150=$fo_0295+28|0;$154=Math_imul(HEAP32[$Dptr_0296+128+($_sum217<<2)>>2]|0,HEAP32[$150>>2]|0)|0;$156=$fe_0294+60|0;$161=(Math_imul(HEAP32[$Dptr_0296+128+($_sum224<<2)>>2]|0,HEAP32[$156>>2]|0)|0)-($124+$119+$129+$134+$139+$144+$149+$154)|0;$162=$fe_0294+56|0;$167=$161+(Math_imul(HEAP32[$Dptr_0296+128+($_sum223<<2)>>2]|0,HEAP32[$162>>2]|0)|0)|0;$168=$fe_0294+52|0;$173=$167+(Math_imul(HEAP32[$Dptr_0296+128+($_sum222<<2)>>2]|0,HEAP32[$168>>2]|0)|0)|0;$174=$fe_0294+48|0;$179=$173+(Math_imul(HEAP32[$Dptr_0296+128+($_sum221<<2)>>2]|0,HEAP32[$174>>2]|0)|0)|0;$180=$fe_0294+44|0;$185=$179+(Math_imul(HEAP32[$Dptr_0296+128+($_sum220<<2)>>2]|0,HEAP32[$180>>2]|0)|0)|0;$186=$fe_0294+40|0;$191=$185+(Math_imul(HEAP32[$Dptr_0296+128+($_sum219<<2)>>2]|0,HEAP32[$186>>2]|0)|0)|0;$192=$fe_0294+36|0;$197=$191+(Math_imul(HEAP32[$Dptr_0296+128+($_sum218<<2)>>2]|0,HEAP32[$192>>2]|0)|0)|0;$198=$113|0;HEAP32[$pcm1_1297>>2]=$197+(Math_imul(HEAP32[$Dptr_0296+128+($13<<2)>>2]|0,HEAP32[$198>>2]|0)|0)>>2;$207=Math_imul(HEAP32[$Dptr_0296+128+(15-$13<<2)>>2]|0,HEAP32[$198>>2]|0)|0;$212=(Math_imul(HEAP32[$Dptr_0296+128+(17-$13<<2)>>2]|0,HEAP32[$192>>2]|0)|0)+$207|0;$217=$212+(Math_imul(HEAP32[$Dptr_0296+128+(19-$13<<2)>>2]|0,HEAP32[$186>>2]|0)|0)|0;$222=$217+(Math_imul(HEAP32[$Dptr_0296+128+(21-$13<<2)>>2]|0,HEAP32[$180>>2]|0)|0)|0;$227=$222+(Math_imul(HEAP32[$Dptr_0296+128+(23-$13<<2)>>2]|0,HEAP32[$174>>2]|0)|0)|0;$232=$227+(Math_imul(HEAP32[$Dptr_0296+128+(25-$13<<2)>>2]|0,HEAP32[$168>>2]|0)|0)|0;$237=$232+(Math_imul(HEAP32[$Dptr_0296+128+(27-$13<<2)>>2]|0,HEAP32[$162>>2]|0)|0)|0;$242=$237+(Math_imul(HEAP32[$Dptr_0296+128+(29-$13<<2)>>2]|0,HEAP32[$156>>2]|0)|0)|0;$247=$242+(Math_imul(HEAP32[$Dptr_0296+128+(29-$16<<2)>>2]|0,HEAP32[$150>>2]|0)|0)|0;$252=$247+(Math_imul(HEAP32[$Dptr_0296+128+(27-$16<<2)>>2]|0,HEAP32[$145>>2]|0)|0)|0;$257=$252+(Math_imul(HEAP32[$Dptr_0296+128+(25-$16<<2)>>2]|0,HEAP32[$140>>2]|0)|0)|0;$262=$257+(Math_imul(HEAP32[$Dptr_0296+128+(23-$16<<2)>>2]|0,HEAP32[$135>>2]|0)|0)|0;$267=$262+(Math_imul(HEAP32[$Dptr_0296+128+(21-$16<<2)>>2]|0,HEAP32[$130>>2]|0)|0)|0;$272=$267+(Math_imul(HEAP32[$Dptr_0296+128+(19-$16<<2)>>2]|0,HEAP32[$125>>2]|0)|0)|0;$277=$272+(Math_imul(HEAP32[$Dptr_0296+128+(17-$16<<2)>>2]|0,HEAP32[$120>>2]|0)|0)|0;HEAP32[$pcm2_0293>>2]=$277+(Math_imul(HEAP32[$Dptr_0296+128+(($15^14)<<2)>>2]|0,HEAP32[$116>>2]|0)|0)>>2;$286=$sb_0292+1|0;if($286>>>0<16){$sb_0292=$286;$pcm2_0293=$pcm2_0293-4|0;$fe_0294=$113;$fo_0295=$fo_0295+32|0;$Dptr_0296=$Dptr_0296+128|0;$pcm1_0298_pn=$pcm1_1297;label=6;break}else{label=7;break};case 7:$292=Math_imul(HEAP32[45224+($16<<2)>>2]|0,HEAP32[$indvars_iv_in+($111<<9)>>2]|0)|0;$298=$292+(Math_imul(HEAP32[45224+($_sum<<2)>>2]|0,HEAP32[$indvars_iv326+($111<<9)+36>>2]|0)|0)|0;$304=$298+(Math_imul(HEAP32[45224+($_sum212<<2)>>2]|0,HEAP32[$indvars_iv326+($111<<9)+40>>2]|0)|0)|0;$310=$304+(Math_imul(HEAP32[45224+($_sum213<<2)>>2]|0,HEAP32[$indvars_iv326+($111<<9)+44>>2]|0)|0)|0;$316=$310+(Math_imul(HEAP32[45224+($_sum214<<2)>>2]|0,HEAP32[$indvars_iv326+($111<<9)+48>>2]|0)|0)|0;$322=$316+(Math_imul(HEAP32[45224+($_sum215<<2)>>2]|0,HEAP32[$indvars_iv326+($111<<9)+52>>2]|0)|0)|0;$328=$322+(Math_imul(HEAP32[45224+($_sum216<<2)>>2]|0,HEAP32[$indvars_iv326+($111<<9)+56>>2]|0)|0)|0;HEAP32[$pcm1_0298+64>>2]=-($328+(Math_imul(HEAP32[45224+($_sum217<<2)>>2]|0,HEAP32[$indvars_iv326+($111<<9)+60>>2]|0)|0)|0)>>2;$340=$s_0299+1|0;if($340>>>0<$ns>>>0){$pcm1_0298=$pcm1_0298+128|0;$s_0299=$340;$phase_0300=$phase_0300+1&15;label=5;break}else{label=8;break};case 8:$342=$ch_0301+1|0;if($342>>>0<$nch>>>0){$ch_0301=$342;$indvars_iv_in=$indvars_iv_in+2048|0;$indvars_iv326_in=$indvars_iv326_in+2048|0;label=3;break}else{label=9;break};case 9:return}}function _synth_half($synth,$frame,$nch,$ns){$synth=$synth|0;$frame=$frame|0;$nch=$nch|0;$ns=$ns|0;var $indvars_iv325_in=0,$indvars_iv_in=0,$ch_0301=0,$indvars_iv325=0,$phase_0300=0,$s_0299=0,$pcm1_0298=0,$10=0,$11=0,$13=0,$15=0,$16=0,$17=0,$23=0,$_sum=0,$28=0,$_sum213=0,$33=0,$_sum214=0,$38=0,$_sum215=0,$43=0,$_sum216=0,$48=0,$_sum217=0,$53=0,$_sum218=0,$58=0,$64=0,$_sum219=0,$70=0,$_sum220=0,$76=0,$_sum221=0,$82=0,$_sum222=0,$88=0,$_sum223=0,$94=0,$_sum224=0,$100=0,$_sum225=0,$112=0,$Dptr_0297=0,$fo_0296=0,$fe_0295=0,$pcm2_0294=0,$pcm1_1293=0,$sb_0292=0,$114=0,$120=0,$123=0,$124=0,$128=0,$129=0,$133=0,$134=0,$138=0,$139=0,$143=0,$144=0,$148=0,$149=0,$153=0,$154=0,$158=0,$160=0,$165=0,$166=0,$171=0,$172=0,$177=0,$178=0,$183=0,$184=0,$189=0,$190=0,$195=0,$196=0,$201=0,$202=0,$212=0,$217=0,$222=0,$227=0,$232=0,$237=0,$242=0,$247=0,$252=0,$257=0,$262=0,$267=0,$272=0,$277=0,$282=0,$pcm1_2=0,$pcm2_1=0,$292=0,$298=0,$304=0,$310=0,$316=0,$322=0,$328=0,$334=0,$346=0,$348=0,label=0;label=1;while(1)switch(label|0){case 1:if(($nch|0)==0){label=11;break}else{label=2;break};case 2:$ch_0301=0;$indvars_iv_in=$synth+1504|0;$indvars_iv325_in=$synth+1472|0;label=3;break;case 3:$indvars_iv325=$indvars_iv325_in;if(($ns|0)==0){label=10;break}else{label=4;break};case 4:$pcm1_0298=$synth+4108+($ch_0301*4608&-1)|0;$s_0299=0;$phase_0300=HEAP32[$synth+4096>>2]|0;label=5;break;case 5:$10=$phase_0300&1;$11=$synth+($ch_0301<<11)+($10<<9)|0;_dct32($frame+48+($ch_0301*4608&-1)+($s_0299<<7)|0,$phase_0300>>>1,$11,$synth+($ch_0301<<11)+1024+($10<<9)|0);$13=$phase_0300&-2;$15=$phase_0300+15&14;$16=$15|1;$17=$10^1;$23=Math_imul(HEAP32[43176+($16<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($17<<9)>>2]|0)|0;$_sum=$16+14|0;$28=Math_imul(HEAP32[43176+($_sum<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($17<<9)+4>>2]|0)|0;$_sum213=$16+12|0;$33=Math_imul(HEAP32[43176+($_sum213<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($17<<9)+8>>2]|0)|0;$_sum214=$16+10|0;$38=Math_imul(HEAP32[43176+($_sum214<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($17<<9)+12>>2]|0)|0;$_sum215=$16+8|0;$43=Math_imul(HEAP32[43176+($_sum215<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($17<<9)+16>>2]|0)|0;$_sum216=$16+6|0;$48=Math_imul(HEAP32[43176+($_sum216<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($17<<9)+20>>2]|0)|0;$_sum217=$16+4|0;$53=Math_imul(HEAP32[43176+($_sum217<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($17<<9)+24>>2]|0)|0;$_sum218=$16+2|0;$58=Math_imul(HEAP32[43176+($_sum218<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($17<<9)+28>>2]|0)|0;$64=(Math_imul(HEAP32[43176+($13<<2)>>2]|0,HEAP32[$11>>2]|0)|0)-($28+$23+$33+$38+$43+$48+$53+$58)|0;$_sum219=$13+14|0;$70=$64+(Math_imul(HEAP32[43176+($_sum219<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($10<<9)+4>>2]|0)|0)|0;$_sum220=$13+12|0;$76=$70+(Math_imul(HEAP32[43176+($_sum220<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($10<<9)+8>>2]|0)|0)|0;$_sum221=$13+10|0;$82=$76+(Math_imul(HEAP32[43176+($_sum221<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($10<<9)+12>>2]|0)|0)|0;$_sum222=$13+8|0;$88=$82+(Math_imul(HEAP32[43176+($_sum222<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($10<<9)+16>>2]|0)|0)|0;$_sum223=$13+6|0;$94=$88+(Math_imul(HEAP32[43176+($_sum223<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($10<<9)+20>>2]|0)|0)|0;$_sum224=$13+4|0;$100=$94+(Math_imul(HEAP32[43176+($_sum224<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($10<<9)+24>>2]|0)|0)|0;$_sum225=$13+2|0;HEAP32[$pcm1_0298>>2]=$100+(Math_imul(HEAP32[43176+($_sum225<<2)>>2]|0,HEAP32[$synth+($ch_0301<<11)+($10<<9)+28>>2]|0)|0)>>2;$112=$phase_0300&1^1;$sb_0292=1;$pcm1_1293=$pcm1_0298+4|0;$pcm2_0294=$pcm1_0298+60|0;$fe_0295=$11;$fo_0296=$synth+($ch_0301<<11)+1024+($17<<9)|0;$Dptr_0297=43176;label=6;break;case 6:$114=$fe_0295+32|0;if(($sb_0292&1|0)==0){label=7;break}else{$pcm2_1=$pcm2_0294;$pcm1_2=$pcm1_1293;label=8;break};case 7:$120=$fo_0296|0;$123=Math_imul(HEAP32[$Dptr_0297+128+($16<<2)>>2]|0,HEAP32[$120>>2]|0)|0;$124=$fo_0296+4|0;$128=Math_imul(HEAP32[$Dptr_0297+128+($_sum<<2)>>2]|0,HEAP32[$124>>2]|0)|0;$129=$fo_0296+8|0;$133=Math_imul(HEAP32[$Dptr_0297+128+($_sum213<<2)>>2]|0,HEAP32[$129>>2]|0)|0;$134=$fo_0296+12|0;$138=Math_imul(HEAP32[$Dptr_0297+128+($_sum214<<2)>>2]|0,HEAP32[$134>>2]|0)|0;$139=$fo_0296+16|0;$143=Math_imul(HEAP32[$Dptr_0297+128+($_sum215<<2)>>2]|0,HEAP32[$139>>2]|0)|0;$144=$fo_0296+20|0;$148=Math_imul(HEAP32[$Dptr_0297+128+($_sum216<<2)>>2]|0,HEAP32[$144>>2]|0)|0;$149=$fo_0296+24|0;$153=Math_imul(HEAP32[$Dptr_0297+128+($_sum217<<2)>>2]|0,HEAP32[$149>>2]|0)|0;$154=$fo_0296+28|0;$158=Math_imul(HEAP32[$Dptr_0297+128+($_sum218<<2)>>2]|0,HEAP32[$154>>2]|0)|0;$160=$fe_0295+60|0;$165=(Math_imul(HEAP32[$Dptr_0297+128+($_sum225<<2)>>2]|0,HEAP32[$160>>2]|0)|0)-($128+$123+$133+$138+$143+$148+$153+$158)|0;$166=$fe_0295+56|0;$171=$165+(Math_imul(HEAP32[$Dptr_0297+128+($_sum224<<2)>>2]|0,HEAP32[$166>>2]|0)|0)|0;$172=$fe_0295+52|0;$177=$171+(Math_imul(HEAP32[$Dptr_0297+128+($_sum223<<2)>>2]|0,HEAP32[$172>>2]|0)|0)|0;$178=$fe_0295+48|0;$183=$177+(Math_imul(HEAP32[$Dptr_0297+128+($_sum222<<2)>>2]|0,HEAP32[$178>>2]|0)|0)|0;$184=$fe_0295+44|0;$189=$183+(Math_imul(HEAP32[$Dptr_0297+128+($_sum221<<2)>>2]|0,HEAP32[$184>>2]|0)|0)|0;$190=$fe_0295+40|0;$195=$189+(Math_imul(HEAP32[$Dptr_0297+128+($_sum220<<2)>>2]|0,HEAP32[$190>>2]|0)|0)|0;$196=$fe_0295+36|0;$201=$195+(Math_imul(HEAP32[$Dptr_0297+128+($_sum219<<2)>>2]|0,HEAP32[$196>>2]|0)|0)|0;$202=$114|0;HEAP32[$pcm1_1293>>2]=$201+(Math_imul(HEAP32[$Dptr_0297+128+($13<<2)>>2]|0,HEAP32[$202>>2]|0)|0)>>2;$212=Math_imul(HEAP32[$Dptr_0297+128+(29-$16<<2)>>2]|0,HEAP32[$154>>2]|0)|0;$217=(Math_imul(HEAP32[$Dptr_0297+128+(27-$16<<2)>>2]|0,HEAP32[$149>>2]|0)|0)+$212|0;$222=$217+(Math_imul(HEAP32[$Dptr_0297+128+(25-$16<<2)>>2]|0,HEAP32[$144>>2]|0)|0)|0;$227=$222+(Math_imul(HEAP32[$Dptr_0297+128+(23-$16<<2)>>2]|0,HEAP32[$139>>2]|0)|0)|0;$232=$227+(Math_imul(HEAP32[$Dptr_0297+128+(21-$16<<2)>>2]|0,HEAP32[$134>>2]|0)|0)|0;$237=$232+(Math_imul(HEAP32[$Dptr_0297+128+(19-$16<<2)>>2]|0,HEAP32[$129>>2]|0)|0)|0;$242=$237+(Math_imul(HEAP32[$Dptr_0297+128+(17-$16<<2)>>2]|0,HEAP32[$124>>2]|0)|0)|0;$247=$242+(Math_imul(HEAP32[$Dptr_0297+128+(($15^14)<<2)>>2]|0,HEAP32[$120>>2]|0)|0)|0;$252=$247+(Math_imul(HEAP32[$Dptr_0297+128+(15-$13<<2)>>2]|0,HEAP32[$202>>2]|0)|0)|0;$257=$252+(Math_imul(HEAP32[$Dptr_0297+128+(17-$13<<2)>>2]|0,HEAP32[$196>>2]|0)|0)|0;$262=$257+(Math_imul(HEAP32[$Dptr_0297+128+(19-$13<<2)>>2]|0,HEAP32[$190>>2]|0)|0)|0;$267=$262+(Math_imul(HEAP32[$Dptr_0297+128+(21-$13<<2)>>2]|0,HEAP32[$184>>2]|0)|0)|0;$272=$267+(Math_imul(HEAP32[$Dptr_0297+128+(23-$13<<2)>>2]|0,HEAP32[$178>>2]|0)|0)|0;$277=$272+(Math_imul(HEAP32[$Dptr_0297+128+(25-$13<<2)>>2]|0,HEAP32[$172>>2]|0)|0)|0;$282=$277+(Math_imul(HEAP32[$Dptr_0297+128+(27-$13<<2)>>2]|0,HEAP32[$166>>2]|0)|0)|0;HEAP32[$pcm2_0294>>2]=$282+(Math_imul(HEAP32[$Dptr_0297+128+(29-$13<<2)>>2]|0,HEAP32[$160>>2]|0)|0)>>2;$pcm2_1=$pcm2_0294-4|0;$pcm1_2=$pcm1_1293+4|0;label=8;break;case 8:$292=$sb_0292+1|0;if($292>>>0<16){$sb_0292=$292;$pcm1_1293=$pcm1_2;$pcm2_0294=$pcm2_1;$fe_0295=$114;$fo_0296=$fo_0296+32|0;$Dptr_0297=$Dptr_0297+128|0;label=6;break}else{label=9;break};case 9:$298=Math_imul(HEAP32[45224+($16<<2)>>2]|0,HEAP32[$indvars_iv_in+($112<<9)>>2]|0)|0;$304=$298+(Math_imul(HEAP32[45224+($_sum<<2)>>2]|0,HEAP32[$indvars_iv325+($112<<9)+36>>2]|0)|0)|0;$310=$304+(Math_imul(HEAP32[45224+($_sum213<<2)>>2]|0,HEAP32[$indvars_iv325+($112<<9)+40>>2]|0)|0)|0;$316=$310+(Math_imul(HEAP32[45224+($_sum214<<2)>>2]|0,HEAP32[$indvars_iv325+($112<<9)+44>>2]|0)|0)|0;$322=$316+(Math_imul(HEAP32[45224+($_sum215<<2)>>2]|0,HEAP32[$indvars_iv325+($112<<9)+48>>2]|0)|0)|0;$328=$322+(Math_imul(HEAP32[45224+($_sum216<<2)>>2]|0,HEAP32[$indvars_iv325+($112<<9)+52>>2]|0)|0)|0;$334=$328+(Math_imul(HEAP32[45224+($_sum217<<2)>>2]|0,HEAP32[$indvars_iv325+($112<<9)+56>>2]|0)|0)|0;HEAP32[$pcm1_2>>2]=-($334+(Math_imul(HEAP32[45224+($_sum218<<2)>>2]|0,HEAP32[$indvars_iv325+($112<<9)+60>>2]|0)|0)|0)>>2;$346=$s_0299+1|0;if($346>>>0<$ns>>>0){$pcm1_0298=$pcm1_2+32|0;$s_0299=$346;$phase_0300=$phase_0300+1&15;label=5;break}else{label=10;break};case 10:$348=$ch_0301+1|0;if($348>>>0<$nch>>>0){$ch_0301=$348;$indvars_iv_in=$indvars_iv_in+2048|0;$indvars_iv325_in=$indvars_iv325_in+2048|0;label=3;break}else{label=11;break};case 11:return}}function _dct32($in,$slot,$lo,$hi){$in=$in|0;$slot=$slot|0;$lo=$lo|0;$hi=$hi|0;var $1=0,$3=0,$4=0,$8=0,$10=0,$12=0,$13=0,$17=0,$18=0,$22=0,$23=0,$27=0,$29=0,$31=0,$32=0,$36=0,$38=0,$40=0,$41=0,$45=0,$46=0,$50=0,$51=0,$55=0,$57=0,$59=0,$60=0,$64=0,$66=0,$68=0,$69=0,$73=0,$74=0,$78=0,$79=0,$83=0,$85=0,$87=0,$88=0,$92=0,$94=0,$96=0,$97=0,$101=0,$102=0,$106=0,$107=0,$111=0,$113=0,$115=0,$116=0,$120=0,$122=0,$124=0,$125=0,$129=0,$130=0,$134=0,$135=0,$139=0,$141=0,$143=0,$144=0,$148=0,$150=0,$152=0,$153=0,$157=0,$158=0,$162=0,$163=0,$167=0,$169=0,$171=0,$172=0,$176=0,$178=0,$180=0,$181=0,$185=0,$186=0,$190=0,$191=0,$195=0,$197=0,$199=0,$200=0,$204=0,$206=0,$208=0,$209=0,$213=0,$214=0,$218=0,$219=0,$223=0,$224=0,$228=0,$229=0,$233=0,$234=0,$238=0,$239=0,$243=0,$244=0,$248=0,$249=0,$253=0,$254=0,$258=0,$259=0,$263=0,$264=0,$268=0,$269=0,$273=0,$274=0,$278=0,$279=0,$283=0,$284=0,$288=0,$289=0,$293=0,$294=0,$298=0,$299=0,$303=0,$304=0,$305=0,$317=0,$318=0,$319=0,$323=0,$324=0,$325=0,$329=0,$330=0,$331=0,$333=0,$337=0,$338=0,$339=0,$343=0,$344=0,$345=0,$347=0,$351=0,$352=0,$353=0,$355=0,$359=0,$360=0,$361=0,$363=0,$365=0,$372=0,$376=0,$377=0,$392=0,$396=0,$397=0,$399=0,$406=0,$410=0,$411=0,$413=0,$420=0,$424=0,$425=0,$427=0,$429=0,$436=0,$440=0,$441=0,$443=0,$451=0,$468=0,$472=0,$473=0,$475=0,$477=0,$485=0,$489=0,$493=0,$494=0,$496=0,$498=0,$506=0,$514=0,$516=0,$526=0,$545=0,$549=0,$550=0,$552=0,$554=0,$559=0,$561=0,$569=0,$574=0,$579=0,$587=0,$589=0,$591=0,$601=0,$611=0,$613=0,$625=0;$1=HEAP32[$in>>2]|0;$3=HEAP32[$in+124>>2]|0;$4=$3+$1|0;$8=($1+2048-$3>>12)*4091&-1;$10=HEAP32[$in+60>>2]|0;$12=HEAP32[$in+64>>2]|0;$13=$12+$10|0;$17=($10+2048-$12>>12)*201&-1;$18=$17+$8|0;$22=($8+2048-$17>>12)*4076&-1;$23=$13+$4|0;$27=($4+2048-$13>>12)*4076&-1;$29=HEAP32[$in+28>>2]|0;$31=HEAP32[$in+96>>2]|0;$32=$31+$29|0;$36=($29+2048-$31>>12)*3035&-1;$38=HEAP32[$in+32>>2]|0;$40=HEAP32[$in+92>>2]|0;$41=$40+$38|0;$45=($38+2048-$40>>12)*2751&-1;$46=$45+$36|0;$50=($36+2048-$45>>12)*401&-1;$51=$41+$32|0;$55=($32+2048-$41>>12)*401&-1;$57=HEAP32[$in+12>>2]|0;$59=HEAP32[$in+112>>2]|0;$60=$59+$57|0;$64=($57+2048-$59>>12)*3857&-1;$66=HEAP32[$in+48>>2]|0;$68=HEAP32[$in+76>>2]|0;$69=$68+$66|0;$73=($66+2048-$68>>12)*1380&-1;$74=$73+$64|0;$78=($64+2048-$73>>12)*3166&-1;$79=$69+$60|0;$83=($60+2048-$69>>12)*3166&-1;$85=HEAP32[$in+16>>2]|0;$87=HEAP32[$in+108>>2]|0;$88=$87+$85|0;$92=($85+2048-$87>>12)*3703&-1;$94=HEAP32[$in+44>>2]|0;$96=HEAP32[$in+80>>2]|0;$97=$96+$94|0;$101=($94+2048-$96>>12)*1751&-1;$102=$101+$92|0;$106=($92+2048-$101>>12)*2598&-1;$107=$97+$88|0;$111=($88+2048-$97>>12)*2598&-1;$113=HEAP32[$in+4>>2]|0;$115=HEAP32[$in+120>>2]|0;$116=$115+$113|0;$120=($113+2048-$115>>12)*4052&-1;$122=HEAP32[$in+56>>2]|0;$124=HEAP32[$in+68>>2]|0;$125=$124+$122|0;$129=($122+2048-$124>>12)*601&-1;$130=$129+$120|0;$134=($120+2048-$129>>12)*3920&-1;$135=$125+$116|0;$139=($116+2048-$125>>12)*3920&-1;$141=HEAP32[$in+24>>2]|0;$143=HEAP32[$in+100>>2]|0;$144=$143+$141|0;$148=($141+2048-$143>>12)*3290&-1;$150=HEAP32[$in+36>>2]|0;$152=HEAP32[$in+88>>2]|0;$153=$152+$150|0;$157=($150+2048-$152>>12)*2440&-1;$158=$157+$148|0;$162=($148+2048-$157>>12)*1189&-1;$163=$153+$144|0;$167=($144+2048-$153>>12)*1189&-1;$169=HEAP32[$in+8>>2]|0;$171=HEAP32[$in+116>>2]|0;$172=$171+$169|0;$176=($169+2048-$171>>12)*3973&-1;$178=HEAP32[$in+52>>2]|0;$180=HEAP32[$in+72>>2]|0;$181=$180+$178|0;$185=($178+2048-$180>>12)*995&-1;$186=$185+$176|0;$190=($176+2048-$185>>12)*3612&-1;$191=$181+$172|0;$195=($172+2048-$181>>12)*3612&-1;$197=HEAP32[$in+20>>2]|0;$199=HEAP32[$in+104>>2]|0;$200=$199+$197|0;$204=($197+2048-$199>>12)*3513&-1;$206=HEAP32[$in+40>>2]|0;$208=HEAP32[$in+84>>2]|0;$209=$208+$206|0;$213=($206+2048-$208>>12)*2106&-1;$214=$213+$204|0;$218=($204+2048-$213>>12)*1931&-1;$219=$209+$200|0;$223=($200+2048-$209>>12)*1931&-1;$224=$51+$23|0;$228=($23+2048-$51>>12)*4017&-1;$229=$107+$79|0;$233=($79+2048-$107>>12)*799&-1;$234=$163+$135|0;$238=($135+2048-$163>>12)*3406&-1;$239=$219+$191|0;$243=($191+2048-$219>>12)*2276&-1;$244=$46+$18|0;$248=($18+2048-$46>>12)*4017&-1;$249=$102+$74|0;$253=($74+2048-$102>>12)*799&-1;$254=$158+$130|0;$258=($130+2048-$158>>12)*3406&-1;$259=$214+$186|0;$263=($186+2048-$214>>12)*2276&-1;$264=$55+$27|0;$268=($27+2048-$55>>12)*4017&-1;$269=$111+$83|0;$273=($83+2048-$111>>12)*799&-1;$274=$167+$139|0;$278=($139+2048-$167>>12)*3406&-1;$279=$223+$195|0;$283=($195+2048-$223>>12)*2276&-1;$284=$50+$22|0;$288=($22+2048-$50>>12)*4017&-1;$289=$106+$78|0;$293=($78+2048-$106>>12)*799&-1;$294=$162+$134|0;$298=($134+2048-$162>>12)*3406&-1;$299=$218+$190|0;$303=($190+2048-$218>>12)*2276&-1;$304=$229+$224|0;$305=$239+$234|0;HEAP32[$hi+480+($slot<<2)>>2]=$304+2048+$305>>12;HEAP32[$lo+($slot<<2)>>2]=(($304+2048-$305>>12)*2896&-1)+2048>>12;$317=$249+$244|0;$318=$259+$254|0;$319=$318+$317|0;HEAP32[$hi+448+($slot<<2)>>2]=$319+2048>>12;$323=$269+$264|0;$324=$279+$274|0;$325=$324+$323|0;HEAP32[$hi+416+($slot<<2)>>2]=$325+2048>>12;$329=$289+$284|0;$330=$299+$294|0;$331=$330+$329|0;$333=($331<<1)-$319|0;HEAP32[$hi+384+($slot<<2)>>2]=$333+2048>>12;$337=$233+$228|0;$338=$243+$238|0;$339=$338+$337|0;HEAP32[$hi+352+($slot<<2)>>2]=$339+2048>>12;$343=$253+$248|0;$344=$263+$258|0;$345=$344+$343|0;$347=($345<<1)-$333|0;HEAP32[$hi+320+($slot<<2)>>2]=$347+2048>>12;$351=$273+$268|0;$352=$283+$278|0;$353=$352+$351|0;$355=($353<<1)-$325|0;HEAP32[$hi+288+($slot<<2)>>2]=$355+2048>>12;$359=$293+$288|0;$360=$303+$298|0;$361=$360+$359|0;$363=($361<<1)-$331|0;$365=($363<<1)-$347|0;HEAP32[$hi+256+($slot<<2)>>2]=$365+2048>>12;$372=($224+2048-$229>>12)*3784&-1;$376=($234+2048-$239>>12)*1567&-1;$377=$376+$372|0;HEAP32[$hi+224+($slot<<2)>>2]=$377+2048>>12;HEAP32[$lo+256+($slot<<2)>>2]=2048-$377+(($372+2048-$376>>12)*5792&-1)>>12;$392=($244+2048-$249>>12)*3784&-1;$396=($254+2048-$259>>12)*1567&-1;$397=$396+$392|0;$399=($397<<1)-$365|0;HEAP32[$hi+192+($slot<<2)>>2]=$399+2048>>12;$406=($264+2048-$269>>12)*3784&-1;$410=($274+2048-$279>>12)*1567&-1;$411=$410+$406|0;$413=($411<<1)-$355|0;HEAP32[$hi+160+($slot<<2)>>2]=$413+2048>>12;$420=($284+2048-$289>>12)*3784&-1;$424=($294+2048-$299>>12)*1567&-1;$425=$424+$420|0;$427=($425<<1)-$363|0;$429=($427<<1)-$399|0;HEAP32[$hi+128+($slot<<2)>>2]=$429+2048>>12;$436=($228+2048-$233>>12)*3784&-1;$440=($238+2048-$243>>12)*1567&-1;$441=$440+$436|0;$443=($441<<1)-$339|0;HEAP32[$hi+96+($slot<<2)>>2]=$443+2048>>12;$451=(($337+2048-$338>>12)*5792&-1)-$443|0;HEAP32[$lo+128+($slot<<2)>>2]=$451+2048>>12;HEAP32[$lo+384+($slot<<2)>>2]=2048-$451+((($436+2048-$440>>12)*5792&-1)-$441<<1)>>12;$468=($248+2048-$253>>12)*3784&-1;$472=($258+2048-$263>>12)*1567&-1;$473=$472+$468|0;$475=($473<<1)-$345|0;$477=($475<<1)-$429|0;HEAP32[$hi+64+($slot<<2)>>2]=$477+2048>>12;$485=(($343+2048-$344>>12)*5792&-1)-$475|0;$489=($268+2048-$273>>12)*3784&-1;$493=($278+2048-$283>>12)*1567&-1;$494=$493+$489|0;$496=($494<<1)-$353|0;$498=($496<<1)-$413|0;HEAP32[$hi+32+($slot<<2)>>2]=$498+2048>>12;$506=(($323+2048-$324>>12)*5792&-1)-$498|0;HEAP32[$lo+64+($slot<<2)>>2]=$506+2048>>12;$514=(($351+2048-$352>>12)*5792&-1)-$496|0;$516=($514<<1)-$506|0;HEAP32[$lo+192+($slot<<2)>>2]=$516+2048>>12;$526=((($406+2048-$410>>12)*5792&-1)-$411<<1)-$516|0;HEAP32[$lo+320+($slot<<2)>>2]=$526+2048>>12;HEAP32[$lo+448+($slot<<2)>>2]=(((($489+2048-$493>>12)*5792&-1)-$494<<1)-$514<<1)+2048-$526>>12;$545=($288+2048-$293>>12)*3784&-1;$549=($298+2048-$303>>12)*1567&-1;$550=$549+$545|0;$552=($550<<1)-$361|0;$554=($552<<1)-$427|0;$559=(($329+2048-$330>>12)*5792&-1)-$554|0;$561=($554<<1)-$477|0;HEAP32[$hi+($slot<<2)>>2]=$561+2048>>12;$569=(($317+2048-$318>>12)*5792&-1)-$561|0;HEAP32[$lo+32+($slot<<2)>>2]=$569+2048>>12;$574=($559<<1)-$569|0;HEAP32[$lo+96+($slot<<2)>>2]=$574+2048>>12;$579=($485<<1)-$574|0;HEAP32[$lo+160+($slot<<2)>>2]=$579+2048>>12;$587=(($359+2048-$360>>12)*5792&-1)-$552|0;$589=($587<<1)-$559|0;$591=($589<<1)-$579|0;HEAP32[$lo+224+($slot<<2)>>2]=$591+2048>>12;$601=((($392+2048-$396>>12)*5792&-1)-$397<<1)-$591|0;HEAP32[$lo+288+($slot<<2)>>2]=$601+2048>>12;$611=((($420+2048-$424>>12)*5792&-1)-$425<<1)-$589|0;$613=($611<<1)-$601|0;HEAP32[$lo+352+($slot<<2)>>2]=$613+2048>>12;$625=(((($468+2048-$472>>12)*5792&-1)-$473<<1)-$485<<1)-$613|0;HEAP32[$lo+416+($slot<<2)>>2]=$625+2048>>12;HEAP32[$lo+480+($slot<<2)>>2]=((((($545+2048-$549>>12)*5792&-1)-$550<<1)-$587<<1)-$611<<1)+2048-$625>>12;return}function _mad_timer_compare($timer1,$timer2){$timer1=$timer1|0;$timer2=$timer2|0;var $5=0,$14=0,$_0=0,label=0,tempParam=0,__stackBase__=0;__stackBase__=STACKTOP;tempParam=$timer1;$timer1=STACKTOP;STACKTOP=STACKTOP+8|0;HEAP32[$timer1>>2]=HEAP32[tempParam>>2];HEAP32[$timer1+4>>2]=HEAP32[tempParam+4>>2];tempParam=$timer2;$timer2=STACKTOP;STACKTOP=STACKTOP+8|0;HEAP32[$timer2>>2]=HEAP32[tempParam>>2];HEAP32[$timer2+4>>2]=HEAP32[tempParam+4>>2];label=1;while(1)switch(label|0){case 1:$5=(HEAP32[$timer1>>2]|0)-(HEAP32[$timer2>>2]|0)|0;if(($5|0)<0){$_0=-1;label=5;break}else{label=2;break};case 2:if(($5|0)>0){$_0=1;label=5;break}else{label=3;break};case 3:$14=(HEAP32[$timer1+4>>2]|0)-(HEAP32[$timer2+4>>2]|0)|0;if(($14|0)<0){$_0=-1;label=5;break}else{label=4;break};case 4:$_0=($14|0)>0&1;label=5;break;case 5:STACKTOP=__stackBase__;return $_0|0}return 0}function _mad_timer_negate($timer){$timer=$timer|0;var $1=0,$2=0,$4=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$timer|0;$2=HEAP32[$1>>2]|0;HEAP32[$1>>2]=-$2;$4=$timer+4|0;if((HEAP32[$4>>2]|0)==0){label=3;break}else{label=2;break};case 2:HEAP32[$1>>2]=$2^-1;HEAP32[$4>>2]=3528e5-(HEAP32[$4>>2]|0);label=3;break;case 3:return}}function _reduce_timer($timer){$timer=$timer|0;var $1=0,$4=0;$1=$timer+4|0;$4=$timer|0;HEAP32[$4>>2]=(HEAP32[$4>>2]|0)+(((HEAP32[$1>>2]|0)>>>0)/3528e5>>>0);HEAP32[$1>>2]=((HEAP32[$1>>2]|0)>>>0)%3528e5>>>0;return}function _mad_timer_abs($agg_result,$timer){$agg_result=$agg_result|0;$timer=$timer|0;var $6=0,$7=0,$8$1=0,label=0,tempParam=0,__stackBase__=0;__stackBase__=STACKTOP;tempParam=$timer;$timer=STACKTOP;STACKTOP=STACKTOP+8|0;HEAP32[$timer>>2]=HEAP32[tempParam>>2];HEAP32[$timer+4>>2]=HEAP32[tempParam+4>>2];label=1;while(1)switch(label|0){case 1:if((HEAP32[$timer>>2]|0)<0){label=2;break}else{label=3;break};case 2:_mad_timer_negate($timer);label=3;break;case 3:$6=$timer;$7=$agg_result;$8$1=HEAP32[$6+4>>2]|0;HEAP32[$7>>2]=HEAP32[$6>>2];HEAP32[$7+4>>2]=$8$1;STACKTOP=__stackBase__;return}}function _mad_timer_set($timer,$seconds,$numer,$denom){$timer=$timer|0;$seconds=$seconds|0;$numer=$numer|0;$denom=$denom|0;var $1=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$timer|0;HEAP32[$1>>2]=$seconds;if($numer>>>0>=$denom>>>0&($denom|0)!=0){label=2;break}else{$_0=$numer;label=3;break};case 2:HEAP32[$1>>2]=(($numer>>>0)/($denom>>>0)>>>0)+$seconds;$_0=($numer>>>0)%($denom>>>0)>>>0;label=3;break;case 3:if(($denom|0)==0|($denom|0)==1){label=4;break}else if(($denom|0)==3528e5){label=5;break}else if(($denom|0)==1e3){label=6;break}else if(($denom|0)==8e3){label=7;break}else if(($denom|0)==11025){label=8;break}else if(($denom|0)==12e3){label=9;break}else if(($denom|0)==16e3){label=10;break}else if(($denom|0)==22050){label=11;break}else if(($denom|0)==24e3){label=12;break}else if(($denom|0)==32e3){label=13;break}else if(($denom|0)==44100){label=14;break}else if(($denom|0)==48e3){label=15;break}else{label=16;break};case 4:HEAP32[$timer+4>>2]=0;label=17;break;case 5:HEAP32[$timer+4>>2]=$_0;label=17;break;case 6:HEAP32[$timer+4>>2]=$_0*352800&-1;label=17;break;case 7:HEAP32[$timer+4>>2]=$_0*44100&-1;label=17;break;case 8:HEAP32[$timer+4>>2]=$_0*32e3&-1;label=17;break;case 9:HEAP32[$timer+4>>2]=$_0*29400&-1;label=17;break;case 10:HEAP32[$timer+4>>2]=$_0*22050&-1;label=17;break;case 11:HEAP32[$timer+4>>2]=$_0*16e3&-1;label=17;break;case 12:HEAP32[$timer+4>>2]=$_0*14700&-1;label=17;break;case 13:HEAP32[$timer+4>>2]=$_0*11025&-1;label=17;break;case 14:HEAP32[$timer+4>>2]=$_0*8e3&-1;label=17;break;case 15:HEAP32[$timer+4>>2]=$_0*7350&-1;label=17;break;case 16:HEAP32[$timer+4>>2]=_scale_rational($_0,$denom,3528e5)|0;label=17;break;case 17:if((HEAP32[$timer+4>>2]|0)>>>0>352799999){label=18;break}else{label=19;break};case 18:_reduce_timer($timer);label=19;break;case 19:return}}function _mad_timer_add($timer,$incr){$timer=$timer|0;$incr=$incr|0;var $3=0,$8=0,$10=0,label=0,tempParam=0,__stackBase__=0;__stackBase__=STACKTOP;tempParam=$incr;$incr=STACKTOP;STACKTOP=STACKTOP+8|0;HEAP32[$incr>>2]=HEAP32[tempParam>>2];HEAP32[$incr+4>>2]=HEAP32[tempParam+4>>2];label=1;while(1)switch(label|0){case 1:$3=$timer|0;HEAP32[$3>>2]=(HEAP32[$3>>2]|0)+(HEAP32[$incr>>2]|0);$8=$timer+4|0;$10=(HEAP32[$8>>2]|0)+(HEAP32[$incr+4>>2]|0)|0;HEAP32[$8>>2]=$10;if($10>>>0>352799999){label=2;break}else{label=3;break};case 2:_reduce_timer($timer);label=3;break;case 3:STACKTOP=__stackBase__;return}}function _mad_timer_multiply($timer,$scalar){$timer=$timer|0;$scalar=$scalar|0;var $addend=0,$tmpcast=0,$factor_0=0,$5=0,$6$1=0,$factor_19=0,$12=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+8|0;label=1;while(1)switch(label|0){case 1:$addend=__stackBase__|0;$tmpcast=$addend;if(($scalar|0)<0){label=2;break}else{$factor_0=$scalar;label=3;break};case 2:_mad_timer_negate($timer);$factor_0=-$scalar|0;label=3;break;case 3:$5=$timer;$6$1=HEAP32[$5+4>>2]|0;HEAP32[$addend>>2]=HEAP32[$5>>2];HEAP32[$addend+4>>2]=$6$1;HEAP32[$5>>2]=0;HEAP32[$5+4>>2]=0;if(($factor_0|0)==0){label=7;break}else{$factor_19=$factor_0;label=4;break};case 4:if(($factor_19&1|0)==0){label=6;break}else{label=5;break};case 5:_mad_timer_add($timer,$tmpcast);label=6;break;case 6:_mad_timer_add($tmpcast,$tmpcast);$12=$factor_19>>>1;if(($12|0)==0){label=7;break}else{$factor_19=$12;label=4;break};case 7:STACKTOP=__stackBase__;return}}function _scale_rational($numer,$denom,$scale){$numer=$numer|0;$denom=$denom|0;$scale=$scale|0;var $1=0,$2=0,$3=0,$4=0,$8=0,$10=0,$13=0,$22=0,$_0=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+24|0;label=1;while(1)switch(label|0){case 1:$1=__stackBase__|0;$2=__stackBase__+8|0;$3=__stackBase__+16|0;HEAP32[$1>>2]=$numer;HEAP32[$2>>2]=$denom;HEAP32[$3>>2]=$scale;_reduce_rational($1,$2);_reduce_rational($3,$2);$4=HEAP32[$2>>2]|0;if(($4|0)==0){label=2;break}else{label=3;break};case 2:___assert_func(41632|0,144,42896|0,42136|0);return 0;case 3:$8=HEAP32[$3>>2]|0;$10=HEAP32[$1>>2]|0;if($4>>>0<$8>>>0){label=4;break}else{label=5;break};case 4:$13=Math_imul(($8>>>0)/($4>>>0)>>>0,$10)|0;$_0=(((Math_imul(($8>>>0)%($4>>>0)>>>0,$10)|0)>>>0)/($4>>>0)>>>0)+$13|0;label=8;break;case 5:if($4>>>0<$10>>>0){label=6;break}else{label=7;break};case 6:$22=Math_imul(($10>>>0)/($4>>>0)>>>0,$8)|0;$_0=(((Math_imul(($10>>>0)%($4>>>0)>>>0,$8)|0)>>>0)/($4>>>0)>>>0)+$22|0;label=8;break;case 7:$_0=((Math_imul($10,$8)|0)>>>0)/($4>>>0)>>>0;label=8;break;case 8:STACKTOP=__stackBase__;return $_0|0}return 0}function _gcd($num1,$num2){$num1=$num1|0;$num2=$num2|0;var $_07=0,$_056=0,$2=0,$_0_lcssa=0,label=0;label=1;while(1)switch(label|0){case 1:if(($num2|0)==0){$_0_lcssa=$num1;label=3;break}else{$_056=$num2;$_07=$num1;label=2;break};case 2:$2=($_07>>>0)%($_056>>>0)>>>0;if(($2|0)==0){$_0_lcssa=$_056;label=3;break}else{$_07=$_056;$_056=$2;label=2;break};case 3:return $_0_lcssa|0}return 0}function _mad_timer_count($timer,$units){$timer=$timer|0;$units=$units|0;var $15=0,$25=0,$_0=0,label=0,tempParam=0,__stackBase__=0;__stackBase__=STACKTOP;tempParam=$timer;$timer=STACKTOP;STACKTOP=STACKTOP+8|0;HEAP32[$timer>>2]=HEAP32[tempParam>>2];HEAP32[$timer+4>>2]=HEAP32[tempParam+4>>2];label=1;while(1)switch(label|0){case 1:if(($units|0)==(-2|0)){label=2;break}else if(($units|0)==(-1|0)){label=3;break}else if(($units|0)==0){label=4;break}else if(($units|0)==10|($units|0)==100|($units|0)==1e3|($units|0)==8e3|($units|0)==11025|($units|0)==12e3|($units|0)==16e3|($units|0)==22050|($units|0)==24e3|($units|0)==32e3|($units|0)==44100|($units|0)==48e3|($units|0)==24|($units|0)==25|($units|0)==30|($units|0)==48|($units|0)==50|($units|0)==60|($units|0)==75){label=5;break}else if(($units|0)==(-24|0)|($units|0)==(-25|0)|($units|0)==(-30|0)|($units|0)==(-48|0)|($units|0)==(-50|0)|($units|0)==(-60|0)){label=6;break}else{$_0=0;label=7;break};case 2:$_0=(HEAP32[$timer>>2]|0)/3600&-1;label=7;break;case 3:$_0=(HEAP32[$timer>>2]|0)/60&-1;label=7;break;case 4:$_0=HEAP32[$timer>>2]|0;label=7;break;case 5:$15=Math_imul(HEAP32[$timer>>2]|0,$units)|0;$_0=(_scale_rational(HEAP32[$timer+4>>2]|0,3528e5,$units)|0)+$15|0;label=7;break;case 6:$25=(((_mad_timer_count($timer,-$units|0)|0)*1e3&-1)+1e3|0)/1001&-1;STACKTOP=__stackBase__;return $25|0;case 7:STACKTOP=__stackBase__;return $_0|0}return 0}function _mad_timer_fraction($timer,$denom){$timer=$timer|0;$denom=$denom|0;var $1=0,$2=0,$3$1=0,$6=0,$_0=0,label=0,tempParam=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+8|0;tempParam=$timer;$timer=STACKTOP;STACKTOP=STACKTOP+8|0;HEAP32[$timer>>2]=HEAP32[tempParam>>2];HEAP32[$timer+4>>2]=HEAP32[tempParam+4>>2];label=1;while(1)switch(label|0){case 1:$1=__stackBase__|0;_mad_timer_abs($1,$timer);$2=$timer;$3$1=HEAP32[$1+4>>2]|0;HEAP32[$2>>2]=HEAP32[$1>>2];HEAP32[$2+4>>2]=$3$1;if(($denom|0)==0){label=2;break}else if(($denom|0)==3528e5){label=4;break}else{label=5;break};case 2:$6=HEAP32[$timer+4>>2]|0;if(($6|0)==0){$_0=352800001;label=6;break}else{label=3;break};case 3:$_0=3528e5/($6>>>0)>>>0;label=6;break;case 4:$_0=HEAP32[$timer+4>>2]|0;label=6;break;case 5:$_0=_scale_rational(HEAP32[$timer+4>>2]|0,3528e5,$denom)|0;label=6;break;case 6:STACKTOP=__stackBase__;return $_0|0}return 0}function _mad_timer_string($timer,$dest,$format,$units,$fracunits,$subparts){$timer=$timer|0;$dest=$dest|0;$format=$format|0;$units=$units|0;$fracunits=$fracunits|0;$subparts=$subparts|0;var $1=0,$2=0,$3$1=0,$5=0,$7=0,$9=0,$14=0,$15=0,$17=0,$19=0,$21=0,$frame_0=0,$frac_0=0,$sub_0=0,$seconds_0=0,$sub_1=0,$48=0,label=0,tempParam=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+8|0;tempParam=$timer;$timer=STACKTOP;STACKTOP=STACKTOP+8|0;HEAP32[$timer>>2]=HEAP32[tempParam>>2];HEAP32[$timer+4>>2]=HEAP32[tempParam+4>>2];label=1;while(1)switch(label|0){case 1:$1=__stackBase__|0;_mad_timer_abs($1,$timer);$2=$timer;$3$1=HEAP32[$1+4>>2]|0;HEAP32[$2>>2]=HEAP32[$1>>2];HEAP32[$2+4>>2]=$3$1;$5=HEAP32[$timer>>2]|0;if(($fracunits|0)==10|($fracunits|0)==100|($fracunits|0)==1e3|($fracunits|0)==8e3|($fracunits|0)==11025|($fracunits|0)==12e3|($fracunits|0)==16e3|($fracunits|0)==22050|($fracunits|0)==24e3|($fracunits|0)==32e3|($fracunits|0)==44100|($fracunits|0)==48e3|($fracunits|0)==24|($fracunits|0)==25|($fracunits|0)==30|($fracunits|0)==48|($fracunits|0)==50|($fracunits|0)==60|($fracunits|0)==75){label=2;break}else if(($fracunits|0)==(-60|0)|($fracunits|0)==(-50|0)|($fracunits|0)==(-48|0)|($fracunits|0)==(-24|0)|($fracunits|0)==(-25|0)|($fracunits|0)==(-30|0)){label=3;break}else{$seconds_0=$5;$sub_0=0;$frac_0=0;label=6;break};case 2:$7=3528e5/($fracunits>>>0)>>>0;$9=HEAP32[$timer+4>>2]|0;$seconds_0=$5;$sub_0=_scale_rational(($9>>>0)%($7>>>0)>>>0,$7,$subparts)|0;$frac_0=($9>>>0)/($7>>>0)>>>0;label=6;break;case 3:$14=_mad_timer_count($timer,$fracunits)|0;$15=-$fracunits|0;$17=($fracunits*-600&-1)-18|0;$19=($14>>>0)%($17>>>0)>>>0;$21=((($14>>>0)/($17>>>0)>>>0)*18&-1)+$14|0;if($19>>>0>2){label=4;break}else{$frame_0=$21;label=5;break};case 4:$frame_0=((($19-2|0)>>>0)/(($17>>>0)/10>>>0>>>0)>>>0<<1)+$21|0;label=5;break;case 5:$seconds_0=($frame_0>>>0)/($15>>>0)>>>0;$sub_0=0;$frac_0=($frame_0>>>0)%($15>>>0)>>>0;label=6;break;case 6:if(($units|0)==(-2|0)){label=7;break}else if(($units|0)==(-1|0)){label=8;break}else if(($units|0)==0){label=9;break}else if(($units|0)==(-24|0)|($units|0)==(-25|0)|($units|0)==(-30|0)|($units|0)==(-48|0)|($units|0)==(-50|0)|($units|0)==(-60|0)){label=10;break}else if(($units|0)==10|($units|0)==100|($units|0)==1e3|($units|0)==8e3|($units|0)==11025|($units|0)==12e3|($units|0)==16e3|($units|0)==22050|($units|0)==24e3|($units|0)==32e3|($units|0)==44100|($units|0)==48e3|($units|0)==24|($units|0)==25|($units|0)==30|($units|0)==48|($units|0)==50|($units|0)==60|($units|0)==75){$sub_1=$sub_0;label=11;break}else{label=12;break};case 7:_sprintf($dest|0,$format|0,(tempInt=STACKTOP,STACKTOP=STACKTOP+40|0,HEAP32[tempInt>>2]=($seconds_0>>>0)/3600>>>0,HEAP32[tempInt+8>>2]=(($seconds_0>>>0)/60>>>0>>>0)%60>>>0,HEAP32[tempInt+16>>2]=($seconds_0>>>0)%60>>>0,HEAP32[tempInt+24>>2]=$frac_0,HEAP32[tempInt+32>>2]=$sub_0,tempInt)|0)|0;label=12;break;case 8:_sprintf($dest|0,$format|0,(tempInt=STACKTOP,STACKTOP=STACKTOP+32|0,HEAP32[tempInt>>2]=($seconds_0>>>0)/60>>>0,HEAP32[tempInt+8>>2]=($seconds_0>>>0)%60>>>0,HEAP32[tempInt+16>>2]=$frac_0,HEAP32[tempInt+24>>2]=$sub_0,tempInt)|0)|0;label=12;break;case 9:_sprintf($dest|0,$format|0,(tempInt=STACKTOP,STACKTOP=STACKTOP+24|0,HEAP32[tempInt>>2]=$seconds_0,HEAP32[tempInt+8>>2]=$frac_0,HEAP32[tempInt+16>>2]=$sub_0,tempInt)|0)|0;label=12;break;case 10:$sub_1=($fracunits|0)<0?0:$sub_0;label=11;break;case 11:$48=_mad_timer_count($timer,$units)|0;_sprintf($dest|0,$format|0,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=$48,HEAP32[tempInt+8>>2]=$sub_1,tempInt)|0)|0;label=12;break;case 12:STACKTOP=__stackBase__;return}}function _reduce_rational($numer,$denom){$numer=$numer|0;$denom=$denom|0;var $1=0,$3=0,label=0;label=1;while(1)switch(label|0){case 1:$1=HEAP32[$numer>>2]|0;$3=_gcd($1,HEAP32[$denom>>2]|0)|0;if(($3|0)==0){label=2;break}else{label=3;break};case 2:___assert_func(41632|0,127,42912|0,41704|0);case 3:HEAP32[$numer>>2]=($1>>>0)/($3>>>0)>>>0;HEAP32[$denom>>2]=((HEAP32[$denom>>2]|0)>>>0)/($3>>>0)>>>0;return}}function _malloc($bytes){$bytes=$bytes|0;var $8=0,$9=0,$10=0,$11=0,$17=0,$18=0,$20=0,$21=0,$22=0,$23=0,$24=0,$35=0,$40=0,$45=0,$56=0,$59=0,$62=0,$64=0,$65=0,$67=0,$69=0,$71=0,$73=0,$75=0,$77=0,$79=0,$82=0,$83=0,$85=0,$86=0,$87=0,$88=0,$89=0,$100=0,$105=0,$106=0,$109=0,$117=0,$120=0,$121=0,$122=0,$124=0,$125=0,$126=0,$133=0,$F4_0=0,$149=0,$155=0,$159=0,$nb_0=0,$162=0,$165=0,$166=0,$169=0,$184=0,$191=0,$194=0,$195=0,$196=0,$mem_0=0,label=0;label=1;while(1)switch(label|0){case 1:if($bytes>>>0<245){label=2;break}else{label=29;break};case 2:if($bytes>>>0<11){$8=16;label=4;break}else{label=3;break};case 3:$8=$bytes+11&-8;label=4;break;case 4:$9=$8>>>3;$10=HEAP32[10606]|0;$11=$10>>>($9>>>0);if(($11&3|0)==0){label=12;break}else{label=5;break};case 5:$17=($11&1^1)+$9|0;$18=$17<<1;$20=42464+($18<<2)|0;$21=42464+($18+2<<2)|0;$22=HEAP32[$21>>2]|0;$23=$22+8|0;$24=HEAP32[$23>>2]|0;if(($20|0)==($24|0)){label=6;break}else{label=7;break};case 6:HEAP32[10606]=$10&(1<<$17^-1);label=11;break;case 7:if($24>>>0<(HEAP32[10610]|0)>>>0){label=10;break}else{label=8;break};case 8:$35=$24+12|0;if((HEAP32[$35>>2]|0)==($22|0)){label=9;break}else{label=10;break};case 9:HEAP32[$35>>2]=$20;HEAP32[$21>>2]=$24;label=11;break;case 10:_abort();return 0;return 0;case 11:$40=$17<<3;HEAP32[$22+4>>2]=$40|3;$45=$22+($40|4)|0;HEAP32[$45>>2]=HEAP32[$45>>2]|1;$mem_0=$23;label=40;break;case 12:if($8>>>0>(HEAP32[10608]|0)>>>0){label=13;break}else{$nb_0=$8;label=32;break};case 13:if(($11|0)==0){label=27;break}else{label=14;break};case 14:$56=2<<$9;$59=$11<<$9&($56|-$56);$62=($59&-$59)-1|0;$64=$62>>>12&16;$65=$62>>>($64>>>0);$67=$65>>>5&8;$69=$65>>>($67>>>0);$71=$69>>>2&4;$73=$69>>>($71>>>0);$75=$73>>>1&2;$77=$73>>>($75>>>0);$79=$77>>>1&1;$82=($67|$64|$71|$75|$79)+($77>>>($79>>>0))|0;$83=$82<<1;$85=42464+($83<<2)|0;$86=42464+($83+2<<2)|0;$87=HEAP32[$86>>2]|0;$88=$87+8|0;$89=HEAP32[$88>>2]|0;if(($85|0)==($89|0)){label=15;break}else{label=16;break};case 15:HEAP32[10606]=$10&(1<<$82^-1);label=20;break;case 16:if($89>>>0<(HEAP32[10610]|0)>>>0){label=19;break}else{label=17;break};case 17:$100=$89+12|0;if((HEAP32[$100>>2]|0)==($87|0)){label=18;break}else{label=19;break};case 18:HEAP32[$100>>2]=$85;HEAP32[$86>>2]=$89;label=20;break;case 19:_abort();return 0;return 0;case 20:$105=$82<<3;$106=$105-$8|0;HEAP32[$87+4>>2]=$8|3;$109=$87;HEAP32[$109+($8|4)>>2]=$106|1;HEAP32[$109+$105>>2]=$106;$117=HEAP32[10608]|0;if(($117|0)==0){label=26;break}else{label=21;break};case 21:$120=HEAP32[10611]|0;$121=$117>>>3;$122=$121<<1;$124=42464+($122<<2)|0;$125=HEAP32[10606]|0;$126=1<<$121;if(($125&$126|0)==0){label=22;break}else{label=23;break};case 22:HEAP32[10606]=$125|$126;$F4_0=$124;label=25;break;case 23:$133=HEAP32[42464+($122+2<<2)>>2]|0;if($133>>>0<(HEAP32[10610]|0)>>>0){label=24;break}else{$F4_0=$133;label=25;break};case 24:_abort();return 0;return 0;case 25:HEAP32[42464+($122+2<<2)>>2]=$120;HEAP32[$F4_0+12>>2]=$120;HEAP32[$120+8>>2]=$F4_0;HEAP32[$120+12>>2]=$124;label=26;break;case 26:HEAP32[10608]=$106;HEAP32[10611]=$109+$8;$mem_0=$88;label=40;break;case 27:if((HEAP32[10607]|0)==0){$nb_0=$8;label=32;break}else{label=28;break};case 28:$149=_tmalloc_small($8)|0;if(($149|0)==0){$nb_0=$8;label=32;break}else{$mem_0=$149;label=40;break};case 29:if($bytes>>>0>4294967231){$nb_0=-1;label=32;break}else{label=30;break};case 30:$155=$bytes+11&-8;if((HEAP32[10607]|0)==0){$nb_0=$155;label=32;break}else{label=31;break};case 31:$159=_tmalloc_large($155)|0;if(($159|0)==0){$nb_0=$155;label=32;break}else{$mem_0=$159;label=40;break};case 32:$162=HEAP32[10608]|0;if($nb_0>>>0>$162>>>0){label=37;break}else{label=33;break};case 33:$165=$162-$nb_0|0;$166=HEAP32[10611]|0;if($165>>>0>15){label=34;break}else{label=35;break};case 34:$169=$166;HEAP32[10611]=$169+$nb_0;HEAP32[10608]=$165;HEAP32[$169+($nb_0+4)>>2]=$165|1;HEAP32[$169+$162>>2]=$165;HEAP32[$166+4>>2]=$nb_0|3;label=36;break;case 35:HEAP32[10608]=0;HEAP32[10611]=0;HEAP32[$166+4>>2]=$162|3;$184=$166+($162+4)|0;HEAP32[$184>>2]=HEAP32[$184>>2]|1;label=36;break;case 36:$mem_0=$166+8|0;label=40;break;case 37:$191=HEAP32[10609]|0;if($nb_0>>>0<$191>>>0){label=38;break}else{label=39;break};case 38:$194=$191-$nb_0|0;HEAP32[10609]=$194;$195=HEAP32[10612]|0;$196=$195;HEAP32[10612]=$196+$nb_0;HEAP32[$196+($nb_0+4)>>2]=$194|1;HEAP32[$195+4>>2]=$nb_0|3;$mem_0=$195+8|0;label=40;break;case 39:$mem_0=_sys_alloc($nb_0)|0;label=40;break;case 40:return $mem_0|0}return 0}function _tmalloc_small($nb){$nb=$nb|0;var $1=0,$4=0,$6=0,$7=0,$9=0,$11=0,$13=0,$15=0,$17=0,$19=0,$21=0,$26=0,$rsize_0=0,$v_0=0,$t_0=0,$33=0,$37=0,$39=0,$43=0,$44=0,$46=0,$47=0,$50=0,$55=0,$57=0,$61=0,$65=0,$69=0,$74=0,$75=0,$78=0,$79=0,$RP_0=0,$R_0=0,$81=0,$85=0,$CP_0=0,$R_1=0,$98=0,$100=0,$114=0,$130=0,$142=0,$156=0,$160=0,$171=0,$174=0,$175=0,$176=0,$178=0,$179=0,$180=0,$187=0,$F1_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=HEAP32[10607]|0;$4=($1&-$1)-1|0;$6=$4>>>12&16;$7=$4>>>($6>>>0);$9=$7>>>5&8;$11=$7>>>($9>>>0);$13=$11>>>2&4;$15=$11>>>($13>>>0);$17=$15>>>1&2;$19=$15>>>($17>>>0);$21=$19>>>1&1;$26=HEAP32[42728+(($9|$6|$13|$17|$21)+($19>>>($21>>>0))<<2)>>2]|0;$t_0=$26;$v_0=$26;$rsize_0=(HEAP32[$26+4>>2]&-8)-$nb|0;label=2;break;case 2:$33=HEAP32[$t_0+16>>2]|0;if(($33|0)==0){label=3;break}else{$39=$33;label=4;break};case 3:$37=HEAP32[$t_0+20>>2]|0;if(($37|0)==0){label=5;break}else{$39=$37;label=4;break};case 4:$43=(HEAP32[$39+4>>2]&-8)-$nb|0;$44=$43>>>0<$rsize_0>>>0;$t_0=$39;$v_0=$44?$39:$v_0;$rsize_0=$44?$43:$rsize_0;label=2;break;case 5:$46=$v_0;$47=HEAP32[10610]|0;if($46>>>0<$47>>>0){label=51;break}else{label=6;break};case 6:$50=$46+$nb|0;if($46>>>0<$50>>>0){label=7;break}else{label=51;break};case 7:$55=HEAP32[$v_0+24>>2]|0;$57=HEAP32[$v_0+12>>2]|0;if(($57|0)==($v_0|0)){label=13;break}else{label=8;break};case 8:$61=HEAP32[$v_0+8>>2]|0;if($61>>>0<$47>>>0){label=12;break}else{label=9;break};case 9:$65=$61+12|0;if((HEAP32[$65>>2]|0)==($v_0|0)){label=10;break}else{label=12;break};case 10:$69=$57+8|0;if((HEAP32[$69>>2]|0)==($v_0|0)){label=11;break}else{label=12;break};case 11:HEAP32[$65>>2]=$57;HEAP32[$69>>2]=$61;$R_1=$57;label=21;break;case 12:_abort();return 0;return 0;case 13:$74=$v_0+20|0;$75=HEAP32[$74>>2]|0;if(($75|0)==0){label=14;break}else{$R_0=$75;$RP_0=$74;label=15;break};case 14:$78=$v_0+16|0;$79=HEAP32[$78>>2]|0;if(($79|0)==0){$R_1=0;label=21;break}else{$R_0=$79;$RP_0=$78;label=15;break};case 15:$81=$R_0+20|0;if((HEAP32[$81>>2]|0)==0){label=16;break}else{$CP_0=$81;label=17;break};case 16:$85=$R_0+16|0;if((HEAP32[$85>>2]|0)==0){label=18;break}else{$CP_0=$85;label=17;break};case 17:$R_0=HEAP32[$CP_0>>2]|0;$RP_0=$CP_0;label=15;break;case 18:if($RP_0>>>0<(HEAP32[10610]|0)>>>0){label=20;break}else{label=19;break};case 19:HEAP32[$RP_0>>2]=0;$R_1=$R_0;label=21;break;case 20:_abort();return 0;return 0;case 21:if(($55|0)==0){label=41;break}else{label=22;break};case 22:$98=$v_0+28|0;$100=42728+(HEAP32[$98>>2]<<2)|0;if(($v_0|0)==(HEAP32[$100>>2]|0)){label=23;break}else{label=25;break};case 23:HEAP32[$100>>2]=$R_1;if(($R_1|0)==0){label=24;break}else{label=31;break};case 24:HEAP32[10607]=HEAP32[10607]&(1<<HEAP32[$98>>2]^-1);label=41;break;case 25:if($55>>>0<(HEAP32[10610]|0)>>>0){label=29;break}else{label=26;break};case 26:$114=$55+16|0;if((HEAP32[$114>>2]|0)==($v_0|0)){label=27;break}else{label=28;break};case 27:HEAP32[$114>>2]=$R_1;label=30;break;case 28:HEAP32[$55+20>>2]=$R_1;label=30;break;case 29:_abort();return 0;return 0;case 30:if(($R_1|0)==0){label=41;break}else{label=31;break};case 31:if($R_1>>>0<(HEAP32[10610]|0)>>>0){label=40;break}else{label=32;break};case 32:HEAP32[$R_1+24>>2]=$55;$130=HEAP32[$v_0+16>>2]|0;if(($130|0)==0){label=36;break}else{label=33;break};case 33:if($130>>>0<(HEAP32[10610]|0)>>>0){label=35;break}else{label=34;break};case 34:HEAP32[$R_1+16>>2]=$130;HEAP32[$130+24>>2]=$R_1;label=36;break;case 35:_abort();return 0;return 0;case 36:$142=HEAP32[$v_0+20>>2]|0;if(($142|0)==0){label=41;break}else{label=37;break};case 37:if($142>>>0<(HEAP32[10610]|0)>>>0){label=39;break}else{label=38;break};case 38:HEAP32[$R_1+20>>2]=$142;HEAP32[$142+24>>2]=$R_1;label=41;break;case 39:_abort();return 0;return 0;case 40:_abort();return 0;return 0;case 41:if($rsize_0>>>0<16){label=42;break}else{label=43;break};case 42:$156=$rsize_0+$nb|0;HEAP32[$v_0+4>>2]=$156|3;$160=$46+($156+4)|0;HEAP32[$160>>2]=HEAP32[$160>>2]|1;label=50;break;case 43:HEAP32[$v_0+4>>2]=$nb|3;HEAP32[$46+($nb+4)>>2]=$rsize_0|1;HEAP32[$46+($rsize_0+$nb)>>2]=$rsize_0;$171=HEAP32[10608]|0;if(($171|0)==0){label=49;break}else{label=44;break};case 44:$174=HEAP32[10611]|0;$175=$171>>>3;$176=$175<<1;$178=42464+($176<<2)|0;$179=HEAP32[10606]|0;$180=1<<$175;if(($179&$180|0)==0){label=45;break}else{label=46;break};case 45:HEAP32[10606]=$179|$180;$F1_0=$178;label=48;break;case 46:$187=HEAP32[42464+($176+2<<2)>>2]|0;if($187>>>0<(HEAP32[10610]|0)>>>0){label=47;break}else{$F1_0=$187;label=48;break};case 47:_abort();return 0;return 0;case 48:HEAP32[42464+($176+2<<2)>>2]=$174;HEAP32[$F1_0+12>>2]=$174;HEAP32[$174+8>>2]=$F1_0;HEAP32[$174+12>>2]=$178;label=49;break;case 49:HEAP32[10608]=$rsize_0;HEAP32[10611]=$50;label=50;break;case 50:return $v_0+8|0;case 51:_abort();return 0;return 0}return 0}function _tmalloc_large($nb){$nb=$nb|0;var $1=0,$2=0,$9=0,$10=0,$13=0,$15=0,$18=0,$23=0,$idx_0=0,$31=0,$39=0,$rst_0=0,$sizebits_0=0,$t_0=0,$rsize_0=0,$v_0=0,$44=0,$45=0,$rsize_1=0,$v_1=0,$51=0,$54=0,$rst_1=0,$t_1=0,$rsize_2=0,$v_2=0,$62=0,$66=0,$71=0,$73=0,$74=0,$76=0,$78=0,$80=0,$82=0,$84=0,$86=0,$88=0,$t_2_ph=0,$v_330=0,$rsize_329=0,$t_228=0,$98=0,$99=0,$_rsize_3=0,$t_2_v_3=0,$101=0,$104=0,$v_3_lcssa=0,$rsize_3_lcssa=0,$112=0,$113=0,$116=0,$117=0,$121=0,$123=0,$127=0,$131=0,$135=0,$140=0,$141=0,$144=0,$145=0,$RP_0=0,$R_0=0,$147=0,$151=0,$CP_0=0,$R_1=0,$164=0,$166=0,$180=0,$196=0,$208=0,$222=0,$226=0,$237=0,$240=0,$242=0,$243=0,$244=0,$251=0,$F5_0=0,$264=0,$265=0,$272=0,$273=0,$276=0,$278=0,$281=0,$286=0,$I7_0=0,$293=0,$300=0,$301=0,$320=0,$T_0=0,$K12_0=0,$329=0,$330=0,$346=0,$347=0,$349=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=-$nb|0;$2=$nb>>>8;if(($2|0)==0){$idx_0=0;label=4;break}else{label=2;break};case 2:if($nb>>>0>16777215){$idx_0=31;label=4;break}else{label=3;break};case 3:$9=($2+1048320|0)>>>16&8;$10=$2<<$9;$13=($10+520192|0)>>>16&4;$15=$10<<$13;$18=($15+245760|0)>>>16&2;$23=14-($13|$9|$18)+($15<<$18>>>15)|0;$idx_0=$nb>>>(($23+7|0)>>>0)&1|$23<<1;label=4;break;case 4:$31=HEAP32[42728+($idx_0<<2)>>2]|0;if(($31|0)==0){$v_2=0;$rsize_2=$1;$t_1=0;label=11;break}else{label=5;break};case 5:if(($idx_0|0)==31){$39=0;label=7;break}else{label=6;break};case 6:$39=25-($idx_0>>>1)|0;label=7;break;case 7:$v_0=0;$rsize_0=$1;$t_0=$31;$sizebits_0=$nb<<$39;$rst_0=0;label=8;break;case 8:$44=HEAP32[$t_0+4>>2]&-8;$45=$44-$nb|0;if($45>>>0<$rsize_0>>>0){label=9;break}else{$v_1=$v_0;$rsize_1=$rsize_0;label=10;break};case 9:if(($44|0)==($nb|0)){$v_2=$t_0;$rsize_2=$45;$t_1=$t_0;label=11;break}else{$v_1=$t_0;$rsize_1=$45;label=10;break};case 10:$51=HEAP32[$t_0+20>>2]|0;$54=HEAP32[$t_0+16+($sizebits_0>>>31<<2)>>2]|0;$rst_1=($51|0)==0|($51|0)==($54|0)?$rst_0:$51;if(($54|0)==0){$v_2=$v_1;$rsize_2=$rsize_1;$t_1=$rst_1;label=11;break}else{$v_0=$v_1;$rsize_0=$rsize_1;$t_0=$54;$sizebits_0=$sizebits_0<<1;$rst_0=$rst_1;label=8;break};case 11:if(($t_1|0)==0&($v_2|0)==0){label=12;break}else{$t_2_ph=$t_1;label=14;break};case 12:$62=2<<$idx_0;$66=HEAP32[10607]&($62|-$62);if(($66|0)==0){$t_2_ph=$t_1;label=14;break}else{label=13;break};case 13:$71=($66&-$66)-1|0;$73=$71>>>12&16;$74=$71>>>($73>>>0);$76=$74>>>5&8;$78=$74>>>($76>>>0);$80=$78>>>2&4;$82=$78>>>($80>>>0);$84=$82>>>1&2;$86=$82>>>($84>>>0);$88=$86>>>1&1;$t_2_ph=HEAP32[42728+(($76|$73|$80|$84|$88)+($86>>>($88>>>0))<<2)>>2]|0;label=14;break;case 14:if(($t_2_ph|0)==0){$rsize_3_lcssa=$rsize_2;$v_3_lcssa=$v_2;label=17;break}else{$t_228=$t_2_ph;$rsize_329=$rsize_2;$v_330=$v_2;label=15;break};case 15:$98=(HEAP32[$t_228+4>>2]&-8)-$nb|0;$99=$98>>>0<$rsize_329>>>0;$_rsize_3=$99?$98:$rsize_329;$t_2_v_3=$99?$t_228:$v_330;$101=HEAP32[$t_228+16>>2]|0;if(($101|0)==0){label=16;break}else{$t_228=$101;$rsize_329=$_rsize_3;$v_330=$t_2_v_3;label=15;break};case 16:$104=HEAP32[$t_228+20>>2]|0;if(($104|0)==0){$rsize_3_lcssa=$_rsize_3;$v_3_lcssa=$t_2_v_3;label=17;break}else{$t_228=$104;$rsize_329=$_rsize_3;$v_330=$t_2_v_3;label=15;break};case 17:if(($v_3_lcssa|0)==0){$_0=0;label=82;break}else{label=18;break};case 18:if($rsize_3_lcssa>>>0<((HEAP32[10608]|0)-$nb|0)>>>0){label=19;break}else{$_0=0;label=82;break};case 19:$112=$v_3_lcssa;$113=HEAP32[10610]|0;if($112>>>0<$113>>>0){label=81;break}else{label=20;break};case 20:$116=$112+$nb|0;$117=$116;if($112>>>0<$116>>>0){label=21;break}else{label=81;break};case 21:$121=HEAP32[$v_3_lcssa+24>>2]|0;$123=HEAP32[$v_3_lcssa+12>>2]|0;if(($123|0)==($v_3_lcssa|0)){label=27;break}else{label=22;break};case 22:$127=HEAP32[$v_3_lcssa+8>>2]|0;if($127>>>0<$113>>>0){label=26;break}else{label=23;break};case 23:$131=$127+12|0;if((HEAP32[$131>>2]|0)==($v_3_lcssa|0)){label=24;break}else{label=26;break};case 24:$135=$123+8|0;if((HEAP32[$135>>2]|0)==($v_3_lcssa|0)){label=25;break}else{label=26;break};case 25:HEAP32[$131>>2]=$123;HEAP32[$135>>2]=$127;$R_1=$123;label=35;break;case 26:_abort();return 0;return 0;case 27:$140=$v_3_lcssa+20|0;$141=HEAP32[$140>>2]|0;if(($141|0)==0){label=28;break}else{$R_0=$141;$RP_0=$140;label=29;break};case 28:$144=$v_3_lcssa+16|0;$145=HEAP32[$144>>2]|0;if(($145|0)==0){$R_1=0;label=35;break}else{$R_0=$145;$RP_0=$144;label=29;break};case 29:$147=$R_0+20|0;if((HEAP32[$147>>2]|0)==0){label=30;break}else{$CP_0=$147;label=31;break};case 30:$151=$R_0+16|0;if((HEAP32[$151>>2]|0)==0){label=32;break}else{$CP_0=$151;label=31;break};case 31:$R_0=HEAP32[$CP_0>>2]|0;$RP_0=$CP_0;label=29;break;case 32:if($RP_0>>>0<(HEAP32[10610]|0)>>>0){label=34;break}else{label=33;break};case 33:HEAP32[$RP_0>>2]=0;$R_1=$R_0;label=35;break;case 34:_abort();return 0;return 0;case 35:if(($121|0)==0){label=55;break}else{label=36;break};case 36:$164=$v_3_lcssa+28|0;$166=42728+(HEAP32[$164>>2]<<2)|0;if(($v_3_lcssa|0)==(HEAP32[$166>>2]|0)){label=37;break}else{label=39;break};case 37:HEAP32[$166>>2]=$R_1;if(($R_1|0)==0){label=38;break}else{label=45;break};case 38:HEAP32[10607]=HEAP32[10607]&(1<<HEAP32[$164>>2]^-1);label=55;break;case 39:if($121>>>0<(HEAP32[10610]|0)>>>0){label=43;break}else{label=40;break};case 40:$180=$121+16|0;if((HEAP32[$180>>2]|0)==($v_3_lcssa|0)){label=41;break}else{label=42;break};case 41:HEAP32[$180>>2]=$R_1;label=44;break;case 42:HEAP32[$121+20>>2]=$R_1;label=44;break;case 43:_abort();return 0;return 0;case 44:if(($R_1|0)==0){label=55;break}else{label=45;break};case 45:if($R_1>>>0<(HEAP32[10610]|0)>>>0){label=54;break}else{label=46;break};case 46:HEAP32[$R_1+24>>2]=$121;$196=HEAP32[$v_3_lcssa+16>>2]|0;if(($196|0)==0){label=50;break}else{label=47;break};case 47:if($196>>>0<(HEAP32[10610]|0)>>>0){label=49;break}else{label=48;break};case 48:HEAP32[$R_1+16>>2]=$196;HEAP32[$196+24>>2]=$R_1;label=50;break;case 49:_abort();return 0;return 0;case 50:$208=HEAP32[$v_3_lcssa+20>>2]|0;if(($208|0)==0){label=55;break}else{label=51;break};case 51:if($208>>>0<(HEAP32[10610]|0)>>>0){label=53;break}else{label=52;break};case 52:HEAP32[$R_1+20>>2]=$208;HEAP32[$208+24>>2]=$R_1;label=55;break;case 53:_abort();return 0;return 0;case 54:_abort();return 0;return 0;case 55:if($rsize_3_lcssa>>>0<16){label=56;break}else{label=57;break};case 56:$222=$rsize_3_lcssa+$nb|0;HEAP32[$v_3_lcssa+4>>2]=$222|3;$226=$112+($222+4)|0;HEAP32[$226>>2]=HEAP32[$226>>2]|1;label=80;break;case 57:HEAP32[$v_3_lcssa+4>>2]=$nb|3;HEAP32[$112+($nb+4)>>2]=$rsize_3_lcssa|1;HEAP32[$112+($rsize_3_lcssa+$nb)>>2]=$rsize_3_lcssa;$237=$rsize_3_lcssa>>>3;if($rsize_3_lcssa>>>0<256){label=58;break}else{label=63;break};case 58:$240=$237<<1;$242=42464+($240<<2)|0;$243=HEAP32[10606]|0;$244=1<<$237;if(($243&$244|0)==0){label=59;break}else{label=60;break};case 59:HEAP32[10606]=$243|$244;$F5_0=$242;label=62;break;case 60:$251=HEAP32[42464+($240+2<<2)>>2]|0;if($251>>>0<(HEAP32[10610]|0)>>>0){label=61;break}else{$F5_0=$251;label=62;break};case 61:_abort();return 0;return 0;case 62:HEAP32[42464+($240+2<<2)>>2]=$117;HEAP32[$F5_0+12>>2]=$117;HEAP32[$112+($nb+8)>>2]=$F5_0;HEAP32[$112+($nb+12)>>2]=$242;label=80;break;case 63:$264=$116;$265=$rsize_3_lcssa>>>8;if(($265|0)==0){$I7_0=0;label=66;break}else{label=64;break};case 64:if($rsize_3_lcssa>>>0>16777215){$I7_0=31;label=66;break}else{label=65;break};case 65:$272=($265+1048320|0)>>>16&8;$273=$265<<$272;$276=($273+520192|0)>>>16&4;$278=$273<<$276;$281=($278+245760|0)>>>16&2;$286=14-($276|$272|$281)+($278<<$281>>>15)|0;$I7_0=$rsize_3_lcssa>>>(($286+7|0)>>>0)&1|$286<<1;label=66;break;case 66:$293=42728+($I7_0<<2)|0;HEAP32[$112+($nb+28)>>2]=$I7_0;HEAP32[$112+($nb+20)>>2]=0;HEAP32[$112+($nb+16)>>2]=0;$300=HEAP32[10607]|0;$301=1<<$I7_0;if(($300&$301|0)==0){label=67;break}else{label=68;break};case 67:HEAP32[10607]=$300|$301;HEAP32[$293>>2]=$264;HEAP32[$112+($nb+24)>>2]=$293;HEAP32[$112+($nb+12)>>2]=$264;HEAP32[$112+($nb+8)>>2]=$264;label=80;break;case 68:if(($I7_0|0)==31){$320=0;label=70;break}else{label=69;break};case 69:$320=25-($I7_0>>>1)|0;label=70;break;case 70:$K12_0=$rsize_3_lcssa<<$320;$T_0=HEAP32[$293>>2]|0;label=71;break;case 71:if((HEAP32[$T_0+4>>2]&-8|0)==($rsize_3_lcssa|0)){label=76;break}else{label=72;break};case 72:$329=$T_0+16+($K12_0>>>31<<2)|0;$330=HEAP32[$329>>2]|0;if(($330|0)==0){label=73;break}else{$K12_0=$K12_0<<1;$T_0=$330;label=71;break};case 73:if($329>>>0<(HEAP32[10610]|0)>>>0){label=75;break}else{label=74;break};case 74:HEAP32[$329>>2]=$264;HEAP32[$112+($nb+24)>>2]=$T_0;HEAP32[$112+($nb+12)>>2]=$264;HEAP32[$112+($nb+8)>>2]=$264;label=80;break;case 75:_abort();return 0;return 0;case 76:$346=$T_0+8|0;$347=HEAP32[$346>>2]|0;$349=HEAP32[10610]|0;if($T_0>>>0<$349>>>0){label=79;break}else{label=77;break};case 77:if($347>>>0<$349>>>0){label=79;break}else{label=78;break};case 78:HEAP32[$347+12>>2]=$264;HEAP32[$346>>2]=$264;HEAP32[$112+($nb+8)>>2]=$347;HEAP32[$112+($nb+12)>>2]=$T_0;HEAP32[$112+($nb+24)>>2]=0;label=80;break;case 79:_abort();return 0;return 0;case 80:$_0=$v_3_lcssa+8|0;label=82;break;case 81:_abort();return 0;return 0;case 82:return $_0|0}return 0}function _sys_alloc($nb){$nb=$nb|0;var $6=0,$10=0,$13=0,$16=0,$17=0,$25=0,$29=0,$31=0,$34=0,$35=0,$36=0,$ssize_0=0,$46=0,$47=0,$51=0,$57=0,$58=0,$61=0,$66=0,$69=0,$75=0,$ssize_1=0,$br_0=0,$tsize_0=0,$tbase_0=0,$84=0,$89=0,$ssize_2=0,$tsize_0172326=0,$tsize_1=0,$105=0,$106=0,$110=0,$112=0,$_tbase_1=0,$tbase_232=0,$tsize_231=0,$115=0,$123=0,$sp_044=0,$132=0,$133=0,$134=0,$135=0,$139=0,$147=0,$sp_137=0,$160=0,$161=0,$165=0,$172=0,$177=0,$180=0,$181=0,$182=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[8766]|0)==0){label=2;break}else{label=3;break};case 2:_init_mparams();label=3;break;case 3:$6=HEAP32[8768]|0;$10=$nb+47+$6&-$6;if($10>>>0>$nb>>>0){label=4;break}else{$_0=0;label=51;break};case 4:$13=HEAP32[10716]|0;if(($13|0)==0){label=6;break}else{label=5;break};case 5:$16=HEAP32[10714]|0;$17=$16+$10|0;if($17>>>0<=$16>>>0|$17>>>0>$13>>>0){$_0=0;label=51;break}else{label=6;break};case 6:if((HEAP32[10717]&4|0)==0){label=7;break}else{$tsize_1=0;label=26;break};case 7:$25=HEAP32[10612]|0;if(($25|0)==0){label=9;break}else{label=8;break};case 8:$29=_segment_holding($25)|0;if(($29|0)==0){label=9;break}else{label=16;break};case 9:$31=_sbrk(0)|0;if(($31|0)==-1){$tsize_0172326=0;label=25;break}else{label=10;break};case 10:$34=$31;$35=HEAP32[8767]|0;$36=$35-1|0;if(($36&$34|0)==0){$ssize_0=$10;label=12;break}else{label=11;break};case 11:$ssize_0=$10-$34+($36+$34&-$35)|0;label=12;break;case 12:$46=HEAP32[10714]|0;$47=$46+$ssize_0|0;if($ssize_0>>>0>$nb>>>0&$ssize_0>>>0<2147483647){label=13;break}else{$tsize_0172326=0;label=25;break};case 13:$51=HEAP32[10716]|0;if(($51|0)==0){label=15;break}else{label=14;break};case 14:if($47>>>0<=$46>>>0|$47>>>0>$51>>>0){$tsize_0172326=0;label=25;break}else{label=15;break};case 15:$57=_sbrk($ssize_0|0)|0;$58=($57|0)==($31|0);$tbase_0=$58?$31:-1;$tsize_0=$58?$ssize_0:0;$br_0=$57;$ssize_1=$ssize_0;label=18;break;case 16:$61=HEAP32[8768]|0;$66=$nb+47-(HEAP32[10609]|0)+$61&-$61;if($66>>>0<2147483647){label=17;break}else{$tsize_0172326=0;label=25;break};case 17:$69=_sbrk($66|0)|0;$75=($69|0)==((HEAP32[$29>>2]|0)+(HEAP32[$29+4>>2]|0)|0);$tbase_0=$75?$69:-1;$tsize_0=$75?$66:0;$br_0=$69;$ssize_1=$66;label=18;break;case 18:if(($tbase_0|0)==-1){label=19;break}else{$tsize_231=$tsize_0;$tbase_232=$tbase_0;label=29;break};case 19:if(($br_0|0)!=-1&$ssize_1>>>0<2147483647&$ssize_1>>>0<($nb+48|0)>>>0){label=20;break}else{$ssize_2=$ssize_1;label=24;break};case 20:$84=HEAP32[8768]|0;$89=$nb+47-$ssize_1+$84&-$84;if($89>>>0<2147483647){label=21;break}else{$ssize_2=$ssize_1;label=24;break};case 21:if((_sbrk($89|0)|0)==-1){label=23;break}else{label=22;break};case 22:$ssize_2=$89+$ssize_1|0;label=24;break;case 23:_sbrk(-$ssize_1|0)|0;$tsize_0172326=$tsize_0;label=25;break;case 24:if(($br_0|0)==-1){$tsize_0172326=$tsize_0;label=25;break}else{$tsize_231=$ssize_2;$tbase_232=$br_0;label=29;break};case 25:HEAP32[10717]=HEAP32[10717]|4;$tsize_1=$tsize_0172326;label=26;break;case 26:if($10>>>0<2147483647){label=27;break}else{label=50;break};case 27:$105=_sbrk($10|0)|0;$106=_sbrk(0)|0;if(($106|0)!=-1&($105|0)!=-1&$105>>>0<$106>>>0){label=28;break}else{label=50;break};case 28:$110=$106-$105|0;$112=$110>>>0>($nb+40|0)>>>0;$_tbase_1=$112?$105:-1;if(($_tbase_1|0)==-1){label=50;break}else{$tsize_231=$112?$110:$tsize_1;$tbase_232=$_tbase_1;label=29;break};case 29:$115=(HEAP32[10714]|0)+$tsize_231|0;HEAP32[10714]=$115;if($115>>>0>(HEAP32[10715]|0)>>>0){label=30;break}else{label=31;break};case 30:HEAP32[10715]=$115;label=31;break;case 31:if((HEAP32[10612]|0)==0){label=32;break}else{$sp_044=42872;label=35;break};case 32:$123=HEAP32[10610]|0;if(($123|0)==0|$tbase_232>>>0<$123>>>0){label=33;break}else{label=34;break};case 33:HEAP32[10610]=$tbase_232;label=34;break;case 34:HEAP32[10718]=$tbase_232;HEAP32[10719]=$tsize_231;HEAP32[10721]=0;HEAP32[10615]=HEAP32[8766];HEAP32[10614]=-1;_init_bins();_init_top($tbase_232,$tsize_231-40|0);label=48;break;case 35:$132=HEAP32[$sp_044>>2]|0;$133=$sp_044+4|0;$134=HEAP32[$133>>2]|0;$135=$132+$134|0;if(($tbase_232|0)==($135|0)){label=37;break}else{label=36;break};case 36:$139=HEAP32[$sp_044+8>>2]|0;if(($139|0)==0){label=40;break}else{$sp_044=$139;label=35;break};case 37:if((HEAP32[$sp_044+12>>2]&8|0)==0){label=38;break}else{label=40;break};case 38:$147=HEAP32[10612]|0;if($147>>>0>=$132>>>0&$147>>>0<$135>>>0){label=39;break}else{label=40;break};case 39:HEAP32[$133>>2]=$134+$tsize_231;_init_top(HEAP32[10612]|0,(HEAP32[10609]|0)+$tsize_231|0);label=48;break;case 40:if($tbase_232>>>0<(HEAP32[10610]|0)>>>0){label=41;break}else{label=42;break};case 41:HEAP32[10610]=$tbase_232;label=42;break;case 42:$sp_137=42872;label=43;break;case 43:$160=$sp_137|0;$161=HEAP32[$160>>2]|0;if(($161|0)==($tbase_232+$tsize_231|0)){label=45;break}else{label=44;break};case 44:$165=HEAP32[$sp_137+8>>2]|0;if(($165|0)==0){label=47;break}else{$sp_137=$165;label=43;break};case 45:if((HEAP32[$sp_137+12>>2]&8|0)==0){label=46;break}else{label=47;break};case 46:HEAP32[$160>>2]=$tbase_232;$172=$sp_137+4|0;HEAP32[$172>>2]=(HEAP32[$172>>2]|0)+$tsize_231;$_0=_prepend_alloc($tbase_232,$161,$nb)|0;label=51;break;case 47:_add_segment($tbase_232,$tsize_231);label=48;break;case 48:$177=HEAP32[10609]|0;if($177>>>0>$nb>>>0){label=49;break}else{label=50;break};case 49:$180=$177-$nb|0;HEAP32[10609]=$180;$181=HEAP32[10612]|0;$182=$181;HEAP32[10612]=$182+$nb;HEAP32[$182+($nb+4)>>2]=$180|1;HEAP32[$181+4>>2]=$nb|3;$_0=$181+8|0;label=51;break;case 50:HEAP32[(___errno_location()|0)>>2]=12;$_0=0;label=51;break;case 51:return $_0|0}return 0}function _free($mem){$mem=$mem|0;var $3=0,$5=0,$10=0,$11=0,$14=0,$15=0,$16=0,$21=0,$_sum233=0,$24=0,$25=0,$26=0,$32=0,$37=0,$40=0,$43=0,$71=0,$74=0,$77=0,$82=0,$86=0,$90=0,$96=0,$97=0,$101=0,$102=0,$RP_0=0,$R_0=0,$104=0,$108=0,$CP_0=0,$R_1=0,$122=0,$124=0,$138=0,$155=0,$168=0,$181=0,$psize_0=0,$p_0=0,$193=0,$197=0,$198=0,$208=0,$224=0,$231=0,$232=0,$237=0,$240=0,$243=0,$272=0,$275=0,$278=0,$283=0,$288=0,$292=0,$298=0,$299=0,$303=0,$304=0,$RP9_0=0,$R7_0=0,$306=0,$310=0,$CP10_0=0,$R7_1=0,$324=0,$326=0,$340=0,$357=0,$370=0,$psize_1=0,$396=0,$399=0,$401=0,$402=0,$403=0,$410=0,$F16_0=0,$421=0,$422=0,$429=0,$430=0,$433=0,$435=0,$438=0,$443=0,$I18_0=0,$450=0,$454=0,$455=0,$470=0,$T_0=0,$K19_0=0,$479=0,$480=0,$493=0,$494=0,$496=0,$508=0,label=0;label=1;while(1)switch(label|0){case 1:if(($mem|0)==0){label=141;break}else{label=2;break};case 2:$3=$mem-8|0;$5=HEAP32[10610]|0;if($3>>>0<$5>>>0){label=140;break}else{label=3;break};case 3:$10=HEAP32[$mem-4>>2]|0;$11=$10&3;if(($11|0)==1){label=140;break}else{label=4;break};case 4:$14=$10&-8;$15=$mem+($14-8)|0;$16=$15;if(($10&1|0)==0){label=5;break}else{$p_0=$3;$psize_0=$14;label=56;break};case 5:$21=HEAP32[$3>>2]|0;if(($11|0)==0){label=141;break}else{label=6;break};case 6:$_sum233=-8-$21|0;$24=$mem+$_sum233|0;$25=$24;$26=$21+$14|0;if($24>>>0<$5>>>0){label=140;break}else{label=7;break};case 7:if(($25|0)==(HEAP32[10611]|0)){label=54;break}else{label=8;break};case 8:$32=$21>>>3;if($21>>>0<256){label=9;break}else{label=20;break};case 9:$37=HEAP32[$mem+($_sum233+8)>>2]|0;$40=HEAP32[$mem+($_sum233+12)>>2]|0;$43=42464+($32<<1<<2)|0;if(($37|0)==($43|0)){label=12;break}else{label=10;break};case 10:if($37>>>0<$5>>>0){label=19;break}else{label=11;break};case 11:if((HEAP32[$37+12>>2]|0)==($25|0)){label=12;break}else{label=19;break};case 12:if(($40|0)==($37|0)){label=13;break}else{label=14;break};case 13:HEAP32[10606]=HEAP32[10606]&(1<<$32^-1);$p_0=$25;$psize_0=$26;label=56;break;case 14:if(($40|0)==($43|0)){label=17;break}else{label=15;break};case 15:if($40>>>0<(HEAP32[10610]|0)>>>0){label=18;break}else{label=16;break};case 16:if((HEAP32[$40+8>>2]|0)==($25|0)){label=17;break}else{label=18;break};case 17:HEAP32[$37+12>>2]=$40;HEAP32[$40+8>>2]=$37;$p_0=$25;$psize_0=$26;label=56;break;case 18:_abort();case 19:_abort();case 20:$71=$24;$74=HEAP32[$mem+($_sum233+24)>>2]|0;$77=HEAP32[$mem+($_sum233+12)>>2]|0;if(($77|0)==($71|0)){label=26;break}else{label=21;break};case 21:$82=HEAP32[$mem+($_sum233+8)>>2]|0;if($82>>>0<$5>>>0){label=25;break}else{label=22;break};case 22:$86=$82+12|0;if((HEAP32[$86>>2]|0)==($71|0)){label=23;break}else{label=25;break};case 23:$90=$77+8|0;if((HEAP32[$90>>2]|0)==($71|0)){label=24;break}else{label=25;break};case 24:HEAP32[$86>>2]=$77;HEAP32[$90>>2]=$82;$R_1=$77;label=34;break;case 25:_abort();case 26:$96=$mem+($_sum233+20)|0;$97=HEAP32[$96>>2]|0;if(($97|0)==0){label=27;break}else{$R_0=$97;$RP_0=$96;label=28;break};case 27:$101=$mem+($_sum233+16)|0;$102=HEAP32[$101>>2]|0;if(($102|0)==0){$R_1=0;label=34;break}else{$R_0=$102;$RP_0=$101;label=28;break};case 28:$104=$R_0+20|0;if((HEAP32[$104>>2]|0)==0){label=29;break}else{$CP_0=$104;label=30;break};case 29:$108=$R_0+16|0;if((HEAP32[$108>>2]|0)==0){label=31;break}else{$CP_0=$108;label=30;break};case 30:$R_0=HEAP32[$CP_0>>2]|0;$RP_0=$CP_0;label=28;break;case 31:if($RP_0>>>0<(HEAP32[10610]|0)>>>0){label=33;break}else{label=32;break};case 32:HEAP32[$RP_0>>2]=0;$R_1=$R_0;label=34;break;case 33:_abort();case 34:if(($74|0)==0){$p_0=$25;$psize_0=$26;label=56;break}else{label=35;break};case 35:$122=$mem+($_sum233+28)|0;$124=42728+(HEAP32[$122>>2]<<2)|0;if(($71|0)==(HEAP32[$124>>2]|0)){label=36;break}else{label=38;break};case 36:HEAP32[$124>>2]=$R_1;if(($R_1|0)==0){label=37;break}else{label=44;break};case 37:HEAP32[10607]=HEAP32[10607]&(1<<HEAP32[$122>>2]^-1);$p_0=$25;$psize_0=$26;label=56;break;case 38:if($74>>>0<(HEAP32[10610]|0)>>>0){label=42;break}else{label=39;break};case 39:$138=$74+16|0;if((HEAP32[$138>>2]|0)==($71|0)){label=40;break}else{label=41;break};case 40:HEAP32[$138>>2]=$R_1;label=43;break;case 41:HEAP32[$74+20>>2]=$R_1;label=43;break;case 42:_abort();case 43:if(($R_1|0)==0){$p_0=$25;$psize_0=$26;label=56;break}else{label=44;break};case 44:if($R_1>>>0<(HEAP32[10610]|0)>>>0){label=53;break}else{label=45;break};case 45:HEAP32[$R_1+24>>2]=$74;$155=HEAP32[$mem+($_sum233+16)>>2]|0;if(($155|0)==0){label=49;break}else{label=46;break};case 46:if($155>>>0<(HEAP32[10610]|0)>>>0){label=48;break}else{label=47;break};case 47:HEAP32[$R_1+16>>2]=$155;HEAP32[$155+24>>2]=$R_1;label=49;break;case 48:_abort();case 49:$168=HEAP32[$mem+($_sum233+20)>>2]|0;if(($168|0)==0){$p_0=$25;$psize_0=$26;label=56;break}else{label=50;break};case 50:if($168>>>0<(HEAP32[10610]|0)>>>0){label=52;break}else{label=51;break};case 51:HEAP32[$R_1+20>>2]=$168;HEAP32[$168+24>>2]=$R_1;$p_0=$25;$psize_0=$26;label=56;break;case 52:_abort();case 53:_abort();case 54:$181=$mem+($14-4)|0;if((HEAP32[$181>>2]&3|0)==3){label=55;break}else{$p_0=$25;$psize_0=$26;label=56;break};case 55:HEAP32[10608]=$26;HEAP32[$181>>2]=HEAP32[$181>>2]&-2;HEAP32[$mem+($_sum233+4)>>2]=$26|1;HEAP32[$15>>2]=$26;label=141;break;case 56:$193=$p_0;if($193>>>0<$15>>>0){label=57;break}else{label=140;break};case 57:$197=$mem+($14-4)|0;$198=HEAP32[$197>>2]|0;if(($198&1|0)==0){label=140;break}else{label=58;break};case 58:if(($198&2|0)==0){label=59;break}else{label=114;break};case 59:if(($16|0)==(HEAP32[10612]|0)){label=60;break}else{label=64;break};case 60:$208=(HEAP32[10609]|0)+$psize_0|0;HEAP32[10609]=$208;HEAP32[10612]=$p_0;HEAP32[$p_0+4>>2]=$208|1;if(($p_0|0)==(HEAP32[10611]|0)){label=61;break}else{label=62;break};case 61:HEAP32[10611]=0;HEAP32[10608]=0;label=62;break;case 62:if($208>>>0>(HEAP32[10613]|0)>>>0){label=63;break}else{label=141;break};case 63:_sys_trim(0)|0;label=141;break;case 64:if(($16|0)==(HEAP32[10611]|0)){label=65;break}else{label=66;break};case 65:$224=(HEAP32[10608]|0)+$psize_0|0;HEAP32[10608]=$224;HEAP32[10611]=$p_0;HEAP32[$p_0+4>>2]=$224|1;HEAP32[$193+$224>>2]=$224;label=141;break;case 66:$231=($198&-8)+$psize_0|0;$232=$198>>>3;if($198>>>0<256){label=67;break}else{label=78;break};case 67:$237=HEAP32[$mem+$14>>2]|0;$240=HEAP32[$mem+($14|4)>>2]|0;$243=42464+($232<<1<<2)|0;if(($237|0)==($243|0)){label=70;break}else{label=68;break};case 68:if($237>>>0<(HEAP32[10610]|0)>>>0){label=77;break}else{label=69;break};case 69:if((HEAP32[$237+12>>2]|0)==($16|0)){label=70;break}else{label=77;break};case 70:if(($240|0)==($237|0)){label=71;break}else{label=72;break};case 71:HEAP32[10606]=HEAP32[10606]&(1<<$232^-1);label=112;break;case 72:if(($240|0)==($243|0)){label=75;break}else{label=73;break};case 73:if($240>>>0<(HEAP32[10610]|0)>>>0){label=76;break}else{label=74;break};case 74:if((HEAP32[$240+8>>2]|0)==($16|0)){label=75;break}else{label=76;break};case 75:HEAP32[$237+12>>2]=$240;HEAP32[$240+8>>2]=$237;label=112;break;case 76:_abort();case 77:_abort();case 78:$272=$15;$275=HEAP32[$mem+($14+16)>>2]|0;$278=HEAP32[$mem+($14|4)>>2]|0;if(($278|0)==($272|0)){label=84;break}else{label=79;break};case 79:$283=HEAP32[$mem+$14>>2]|0;if($283>>>0<(HEAP32[10610]|0)>>>0){label=83;break}else{label=80;break};case 80:$288=$283+12|0;if((HEAP32[$288>>2]|0)==($272|0)){label=81;break}else{label=83;break};case 81:$292=$278+8|0;if((HEAP32[$292>>2]|0)==($272|0)){label=82;break}else{label=83;break};case 82:HEAP32[$288>>2]=$278;HEAP32[$292>>2]=$283;$R7_1=$278;label=92;break;case 83:_abort();case 84:$298=$mem+($14+12)|0;$299=HEAP32[$298>>2]|0;if(($299|0)==0){label=85;break}else{$R7_0=$299;$RP9_0=$298;label=86;break};case 85:$303=$mem+($14+8)|0;$304=HEAP32[$303>>2]|0;if(($304|0)==0){$R7_1=0;label=92;break}else{$R7_0=$304;$RP9_0=$303;label=86;break};case 86:$306=$R7_0+20|0;if((HEAP32[$306>>2]|0)==0){label=87;break}else{$CP10_0=$306;label=88;break};case 87:$310=$R7_0+16|0;if((HEAP32[$310>>2]|0)==0){label=89;break}else{$CP10_0=$310;label=88;break};case 88:$R7_0=HEAP32[$CP10_0>>2]|0;$RP9_0=$CP10_0;label=86;break;case 89:if($RP9_0>>>0<(HEAP32[10610]|0)>>>0){label=91;break}else{label=90;break};case 90:HEAP32[$RP9_0>>2]=0;$R7_1=$R7_0;label=92;break;case 91:_abort();case 92:if(($275|0)==0){label=112;break}else{label=93;break};case 93:$324=$mem+($14+20)|0;$326=42728+(HEAP32[$324>>2]<<2)|0;if(($272|0)==(HEAP32[$326>>2]|0)){label=94;break}else{label=96;break};case 94:HEAP32[$326>>2]=$R7_1;if(($R7_1|0)==0){label=95;break}else{label=102;break};case 95:HEAP32[10607]=HEAP32[10607]&(1<<HEAP32[$324>>2]^-1);label=112;break;case 96:if($275>>>0<(HEAP32[10610]|0)>>>0){label=100;break}else{label=97;break};case 97:$340=$275+16|0;if((HEAP32[$340>>2]|0)==($272|0)){label=98;break}else{label=99;break};case 98:HEAP32[$340>>2]=$R7_1;label=101;break;case 99:HEAP32[$275+20>>2]=$R7_1;label=101;break;case 100:_abort();case 101:if(($R7_1|0)==0){label=112;break}else{label=102;break};case 102:if($R7_1>>>0<(HEAP32[10610]|0)>>>0){label=111;break}else{label=103;break};case 103:HEAP32[$R7_1+24>>2]=$275;$357=HEAP32[$mem+($14+8)>>2]|0;if(($357|0)==0){label=107;break}else{label=104;break};case 104:if($357>>>0<(HEAP32[10610]|0)>>>0){label=106;break}else{label=105;break};case 105:HEAP32[$R7_1+16>>2]=$357;HEAP32[$357+24>>2]=$R7_1;label=107;break;case 106:_abort();case 107:$370=HEAP32[$mem+($14+12)>>2]|0;if(($370|0)==0){label=112;break}else{label=108;break};case 108:if($370>>>0<(HEAP32[10610]|0)>>>0){label=110;break}else{label=109;break};case 109:HEAP32[$R7_1+20>>2]=$370;HEAP32[$370+24>>2]=$R7_1;label=112;break;case 110:_abort();case 111:_abort();case 112:HEAP32[$p_0+4>>2]=$231|1;HEAP32[$193+$231>>2]=$231;if(($p_0|0)==(HEAP32[10611]|0)){label=113;break}else{$psize_1=$231;label=115;break};case 113:HEAP32[10608]=$231;label=141;break;case 114:HEAP32[$197>>2]=$198&-2;HEAP32[$p_0+4>>2]=$psize_0|1;HEAP32[$193+$psize_0>>2]=$psize_0;$psize_1=$psize_0;label=115;break;case 115:$396=$psize_1>>>3;if($psize_1>>>0<256){label=116;break}else{label=121;break};case 116:$399=$396<<1;$401=42464+($399<<2)|0;$402=HEAP32[10606]|0;$403=1<<$396;if(($402&$403|0)==0){label=117;break}else{label=118;break};case 117:HEAP32[10606]=$402|$403;$F16_0=$401;label=120;break;case 118:$410=HEAP32[42464+($399+2<<2)>>2]|0;if($410>>>0<(HEAP32[10610]|0)>>>0){label=119;break}else{$F16_0=$410;label=120;break};case 119:_abort();case 120:HEAP32[42464+($399+2<<2)>>2]=$p_0;HEAP32[$F16_0+12>>2]=$p_0;HEAP32[$p_0+8>>2]=$F16_0;HEAP32[$p_0+12>>2]=$401;label=141;break;case 121:$421=$p_0;$422=$psize_1>>>8;if(($422|0)==0){$I18_0=0;label=124;break}else{label=122;break};case 122:if($psize_1>>>0>16777215){$I18_0=31;label=124;break}else{label=123;break};case 123:$429=($422+1048320|0)>>>16&8;$430=$422<<$429;$433=($430+520192|0)>>>16&4;$435=$430<<$433;$438=($435+245760|0)>>>16&2;$443=14-($433|$429|$438)+($435<<$438>>>15)|0;$I18_0=$psize_1>>>(($443+7|0)>>>0)&1|$443<<1;label=124;break;case 124:$450=42728+($I18_0<<2)|0;HEAP32[$p_0+28>>2]=$I18_0;HEAP32[$p_0+20>>2]=0;HEAP32[$p_0+16>>2]=0;$454=HEAP32[10607]|0;$455=1<<$I18_0;if(($454&$455|0)==0){label=125;break}else{label=126;break};case 125:HEAP32[10607]=$454|$455;HEAP32[$450>>2]=$421;HEAP32[$p_0+24>>2]=$450;HEAP32[$p_0+12>>2]=$p_0;HEAP32[$p_0+8>>2]=$p_0;label=138;break;case 126:if(($I18_0|0)==31){$470=0;label=128;break}else{label=127;break};case 127:$470=25-($I18_0>>>1)|0;label=128;break;case 128:$K19_0=$psize_1<<$470;$T_0=HEAP32[$450>>2]|0;label=129;break;case 129:if((HEAP32[$T_0+4>>2]&-8|0)==($psize_1|0)){label=134;break}else{label=130;break};case 130:$479=$T_0+16+($K19_0>>>31<<2)|0;$480=HEAP32[$479>>2]|0;if(($480|0)==0){label=131;break}else{$K19_0=$K19_0<<1;$T_0=$480;label=129;break};case 131:if($479>>>0<(HEAP32[10610]|0)>>>0){label=133;break}else{label=132;break};case 132:HEAP32[$479>>2]=$421;HEAP32[$p_0+24>>2]=$T_0;HEAP32[$p_0+12>>2]=$p_0;HEAP32[$p_0+8>>2]=$p_0;label=138;break;case 133:_abort();case 134:$493=$T_0+8|0;$494=HEAP32[$493>>2]|0;$496=HEAP32[10610]|0;if($T_0>>>0<$496>>>0){label=137;break}else{label=135;break};case 135:if($494>>>0<$496>>>0){label=137;break}else{label=136;break};case 136:HEAP32[$494+12>>2]=$421;HEAP32[$493>>2]=$421;HEAP32[$p_0+8>>2]=$494;HEAP32[$p_0+12>>2]=$T_0;HEAP32[$p_0+24>>2]=0;label=138;break;case 137:_abort();case 138:$508=(HEAP32[10614]|0)-1|0;HEAP32[10614]=$508;if(($508|0)==0){label=139;break}else{label=141;break};case 139:_release_unused_segments();label=141;break;case 140:_abort();case 141:return}}function _release_unused_segments(){var $sp_0_in=0,$sp_0=0,label=0;label=1;while(1)switch(label|0){case 1:$sp_0_in=42880;label=2;break;case 2:$sp_0=HEAP32[$sp_0_in>>2]|0;if(($sp_0|0)==0){label=3;break}else{$sp_0_in=$sp_0+8|0;label=2;break};case 3:HEAP32[10614]=-1;return}}function _sys_trim($pad){$pad=$pad|0;var $7=0,$11=0,$14=0,$20=0,$22=0,$28=0,$39=0,$40=0,$46=0,$49=0,$released_2=0,label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[8766]|0)==0){label=2;break}else{label=3;break};case 2:_init_mparams();label=3;break;case 3:if($pad>>>0<4294967232){label=4;break}else{$released_2=0;label=13;break};case 4:$7=HEAP32[10612]|0;if(($7|0)==0){$released_2=0;label=13;break}else{label=5;break};case 5:$11=HEAP32[10609]|0;if($11>>>0>($pad+40|0)>>>0){label=6;break}else{label=11;break};case 6:$14=HEAP32[8768]|0;$20=Math_imul((((-40-$pad-1+$11+$14|0)>>>0)/($14>>>0)>>>0)-1|0,$14)|0;$22=_segment_holding($7)|0;if((HEAP32[$22+12>>2]&8|0)==0){label=7;break}else{label=11;break};case 7:$28=_sbrk(0)|0;if(($28|0)==((HEAP32[$22>>2]|0)+(HEAP32[$22+4>>2]|0)|0)){label=8;break}else{label=11;break};case 8:$39=_sbrk(-($20>>>0>2147483646?-2147483648-$14|0:$20)|0)|0;$40=_sbrk(0)|0;if(($39|0)!=-1&$40>>>0<$28>>>0){label=9;break}else{label=11;break};case 9:$46=$28-$40|0;if(($28|0)==($40|0)){label=11;break}else{label=10;break};case 10:$49=$22+4|0;HEAP32[$49>>2]=(HEAP32[$49>>2]|0)-$46;HEAP32[10714]=(HEAP32[10714]|0)-$46;_init_top(HEAP32[10612]|0,(HEAP32[10609]|0)-$46|0);$released_2=($28|0)!=($40|0)&1;label=13;break;case 11:if((HEAP32[10609]|0)>>>0>(HEAP32[10613]|0)>>>0){label=12;break}else{$released_2=0;label=13;break};case 12:HEAP32[10613]=-1;$released_2=0;label=13;break;case 13:return $released_2|0}return 0}function _calloc($n_elements,$elem_size){$n_elements=$n_elements|0;$elem_size=$elem_size|0;var $3=0,$req_0=0,$10=0,label=0;label=1;while(1)switch(label|0){case 1:if(($n_elements|0)==0){$req_0=0;label=4;break}else{label=2;break};case 2:$3=Math_imul($elem_size,$n_elements)|0;if(($elem_size|$n_elements)>>>0>65535){label=3;break}else{$req_0=$3;label=4;break};case 3:$req_0=(($3>>>0)/($n_elements>>>0)>>>0|0)==($elem_size|0)?$3:-1;label=4;break;case 4:$10=_malloc($req_0)|0;if(($10|0)==0){label=7;break}else{label=5;break};case 5:if((HEAP32[$10-4>>2]&3|0)==0){label=7;break}else{label=6;break};case 6:_memset($10|0,0,$req_0|0);label=7;break;case 7:return $10|0}return 0}function _realloc($oldmem,$bytes){$oldmem=$oldmem|0;$bytes=$bytes|0;var $14=0,$17=0,$23=0,$28=0,$33=0,$mem_0=0,label=0;label=1;while(1)switch(label|0){case 1:if(($oldmem|0)==0){label=2;break}else{label=3;break};case 2:$mem_0=_malloc($bytes)|0;label=11;break;case 3:if($bytes>>>0>4294967231){label=4;break}else{label=5;break};case 4:HEAP32[(___errno_location()|0)>>2]=12;$mem_0=0;label=11;break;case 5:if($bytes>>>0<11){$14=16;label=7;break}else{label=6;break};case 6:$14=$bytes+11&-8;label=7;break;case 7:$17=_try_realloc_chunk($oldmem-8|0,$14)|0;if(($17|0)==0){label=9;break}else{label=8;break};case 8:$mem_0=$17+8|0;label=11;break;case 9:$23=_malloc($bytes)|0;if(($23|0)==0){$mem_0=0;label=11;break}else{label=10;break};case 10:$28=HEAP32[$oldmem-4>>2]|0;$33=($28&-8)-(($28&3|0)==0?8:4)|0;_memcpy($23|0,$oldmem|0,$33>>>0<$bytes>>>0?$33:$bytes)|0;_free($oldmem);$mem_0=$23;label=11;break;case 11:return $mem_0|0}return 0}function _realloc_in_place($oldmem,$bytes){$oldmem=$oldmem|0;$bytes=$bytes|0;var $12=0,$14=0,label=0;label=1;while(1)switch(label|0){case 1:if(($oldmem|0)==0){label=7;break}else{label=2;break};case 2:if($bytes>>>0>4294967231){label=3;break}else{label=4;break};case 3:HEAP32[(___errno_location()|0)>>2]=12;label=7;break;case 4:if($bytes>>>0<11){$12=16;label=6;break}else{label=5;break};case 5:$12=$bytes+11&-8;label=6;break;case 6:$14=$oldmem-8|0;return((_try_realloc_chunk($14,$12)|0)==($14|0)?$oldmem:0)|0;case 7:return 0}return 0}function _memalign($alignment,$bytes){$alignment=$alignment|0;$bytes=$bytes|0;var $_0=0,label=0;label=1;while(1)switch(label|0){case 1:if($alignment>>>0<9){label=2;break}else{label=3;break};case 2:$_0=_malloc($bytes)|0;label=4;break;case 3:$_0=_internal_memalign($alignment,$bytes)|0;label=4;break;case 4:return $_0|0}return 0}function _internal_memalign($alignment,$bytes){$alignment=$alignment|0;$bytes=$bytes|0;var $_alignment=0,$a_0=0,$_1=0,$17=0,$20=0,$23=0,$24=0,$26=0,$34=0,$35=0,$37=0,$43=0,$44=0,$46=0,$48=0,$49=0,$51=0,$63=0,$69=0,$77=0,$p_0=0,$81=0,$82=0,$86=0,$90=0,$91=0,$101=0,$mem_0=0,label=0;label=1;while(1)switch(label|0){case 1:$_alignment=$alignment>>>0<16?16:$alignment;if(($_alignment-1&$_alignment|0)==0){$_1=$_alignment;label=3;break}else{$a_0=16;label=2;break};case 2:if($a_0>>>0<$_alignment>>>0){$a_0=$a_0<<1;label=2;break}else{$_1=$a_0;label=3;break};case 3:if((-64-$_1|0)>>>0>$bytes>>>0){label=5;break}else{label=4;break};case 4:HEAP32[(___errno_location()|0)>>2]=12;$mem_0=0;label=18;break;case 5:if($bytes>>>0<11){$17=16;label=7;break}else{label=6;break};case 6:$17=$bytes+11&-8;label=7;break;case 7:$20=_malloc($_1+12+$17|0)|0;if(($20|0)==0){$mem_0=0;label=18;break}else{label=8;break};case 8:$23=$20-8|0;$24=$23;$26=$_1-1|0;if(($20&$26|0)==0){$p_0=$24;label=14;break}else{label=9;break};case 9:$34=$20+$26&-$_1;$35=$34-8|0;$37=$23;if(($35-$37|0)>>>0>15){$43=$35;label=11;break}else{label=10;break};case 10:$43=$34+($_1-8)|0;label=11;break;case 11:$44=$43;$46=$43-$37|0;$48=$20-4|0;$49=HEAP32[$48>>2]|0;$51=($49&-8)-$46|0;if(($49&3|0)==0){label=12;break}else{label=13;break};case 12:HEAP32[$43>>2]=(HEAP32[$23>>2]|0)+$46;HEAP32[$43+4>>2]=$51;$p_0=$44;label=14;break;case 13:$63=$43+4|0;HEAP32[$63>>2]=$51|HEAP32[$63>>2]&1|2;$69=$43+($51+4)|0;HEAP32[$69>>2]=HEAP32[$69>>2]|1;HEAP32[$48>>2]=$46|HEAP32[$48>>2]&1|2;$77=$20+($46-4)|0;HEAP32[$77>>2]=HEAP32[$77>>2]|1;_dispose_chunk($24,$46);$p_0=$44;label=14;break;case 14:$81=$p_0+4|0;$82=HEAP32[$81>>2]|0;if(($82&3|0)==0){label=17;break}else{label=15;break};case 15:$86=$82&-8;if($86>>>0>($17+16|0)>>>0){label=16;break}else{label=17;break};case 16:$90=$86-$17|0;$91=$p_0;HEAP32[$81>>2]=$17|$82&1|2;HEAP32[$91+($17|4)>>2]=$90|3;$101=$91+($86|4)|0;HEAP32[$101>>2]=HEAP32[$101>>2]|1;_dispose_chunk($91+$17|0,$90);label=17;break;case 17:$mem_0=$p_0+8|0;label=18;break;case 18:return $mem_0|0}return 0}function _posix_memalign($pp,$alignment,$bytes){$pp=$pp|0;$alignment=$alignment|0;$bytes=$bytes|0;var $5=0,$mem_0=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:if(($alignment|0)==8){label=2;break}else{label=3;break};case 2:$mem_0=_malloc($bytes)|0;label=7;break;case 3:$5=$alignment>>>2;if(($alignment&3|0)!=0|($5|0)==0){$_0=22;label=9;break}else{label=4;break};case 4:if(($5+1073741823&$5|0)==0){label=5;break}else{$_0=22;label=9;break};case 5:if((-64-$alignment|0)>>>0<$bytes>>>0){$_0=12;label=9;break}else{label=6;break};case 6:$mem_0=_internal_memalign($alignment>>>0<16?16:$alignment,$bytes)|0;label=7;break;case 7:if(($mem_0|0)==0){$_0=12;label=9;break}else{label=8;break};case 8:HEAP32[$pp>>2]=$mem_0;$_0=0;label=9;break;case 9:return $_0|0}return 0}function _valloc($bytes){$bytes=$bytes|0;var label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[8766]|0)==0){label=2;break}else{label=3;break};case 2:_init_mparams();label=3;break;case 3:return _memalign(HEAP32[8767]|0,$bytes)|0}return 0}function _try_realloc_chunk($p,$nb){$p=$p|0;$nb=$nb|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$10=0,$15=0,$16=0,$25=0,$43=0,$46=0,$60=0,$63=0,$77=0,$85=0,$storemerge27=0,$storemerge=0,$94=0,$97=0,$98=0,$103=0,$106=0,$109=0,$137=0,$140=0,$143=0,$148=0,$152=0,$156=0,$162=0,$163=0,$167=0,$168=0,$RP_0=0,$R_0=0,$170=0,$174=0,$CP_0=0,$R_1=0,$188=0,$190=0,$204=0,$221=0,$234=0,$253=0,$267=0,$newp_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$p+4|0;$2=HEAP32[$1>>2]|0;$3=$2&-8;$4=$p;$5=$4+$3|0;$6=$5;$7=HEAP32[10610]|0;if($4>>>0<$7>>>0){label=69;break}else{label=2;break};case 2:$10=$2&3;if(($10|0)!=1&$4>>>0<$5>>>0){label=3;break}else{label=69;break};case 3:$15=$4+($3|4)|0;$16=HEAP32[$15>>2]|0;if(($16&1|0)==0){label=69;break}else{label=4;break};case 4:if(($10|0)==0){label=5;break}else{label=6;break};case 5:$newp_0=_mmap_resize($p,$nb)|0;label=70;break;case 6:if($3>>>0<$nb>>>0){label=9;break}else{label=7;break};case 7:$25=$3-$nb|0;if($25>>>0>15){label=8;break}else{$newp_0=$p;label=70;break};case 8:HEAP32[$1>>2]=$2&1|$nb|2;HEAP32[$4+($nb+4)>>2]=$25|3;HEAP32[$15>>2]=HEAP32[$15>>2]|1;_dispose_chunk($4+$nb|0,$25);$newp_0=$p;label=70;break;case 9:if(($6|0)==(HEAP32[10612]|0)){label=10;break}else{label=12;break};case 10:$43=(HEAP32[10609]|0)+$3|0;if($43>>>0>$nb>>>0){label=11;break}else{$newp_0=0;label=70;break};case 11:$46=$43-$nb|0;HEAP32[$1>>2]=$2&1|$nb|2;HEAP32[$4+($nb+4)>>2]=$46|1;HEAP32[10612]=$4+$nb;HEAP32[10609]=$46;$newp_0=$p;label=70;break;case 12:if(($6|0)==(HEAP32[10611]|0)){label=13;break}else{label=18;break};case 13:$60=(HEAP32[10608]|0)+$3|0;if($60>>>0<$nb>>>0){$newp_0=0;label=70;break}else{label=14;break};case 14:$63=$60-$nb|0;if($63>>>0>15){label=15;break}else{label=16;break};case 15:HEAP32[$1>>2]=$2&1|$nb|2;HEAP32[$4+($nb+4)>>2]=$63|1;HEAP32[$4+$60>>2]=$63;$77=$4+($60+4)|0;HEAP32[$77>>2]=HEAP32[$77>>2]&-2;$storemerge=$4+$nb|0;$storemerge27=$63;label=17;break;case 16:HEAP32[$1>>2]=$2&1|$60|2;$85=$4+($60+4)|0;HEAP32[$85>>2]=HEAP32[$85>>2]|1;$storemerge=0;$storemerge27=0;label=17;break;case 17:HEAP32[10608]=$storemerge27;HEAP32[10611]=$storemerge;$newp_0=$p;label=70;break;case 18:if(($16&2|0)==0){label=19;break}else{$newp_0=0;label=70;break};case 19:$94=($16&-8)+$3|0;if($94>>>0<$nb>>>0){$newp_0=0;label=70;break}else{label=20;break};case 20:$97=$94-$nb|0;$98=$16>>>3;if($16>>>0<256){label=21;break}else{label=32;break};case 21:$103=HEAP32[$4+($3+8)>>2]|0;$106=HEAP32[$4+($3+12)>>2]|0;$109=42464+($98<<1<<2)|0;if(($103|0)==($109|0)){label=24;break}else{label=22;break};case 22:if($103>>>0<$7>>>0){label=31;break}else{label=23;break};case 23:if((HEAP32[$103+12>>2]|0)==($6|0)){label=24;break}else{label=31;break};case 24:if(($106|0)==($103|0)){label=25;break}else{label=26;break};case 25:HEAP32[10606]=HEAP32[10606]&(1<<$98^-1);label=66;break;case 26:if(($106|0)==($109|0)){label=29;break}else{label=27;break};case 27:if($106>>>0<(HEAP32[10610]|0)>>>0){label=30;break}else{label=28;break};case 28:if((HEAP32[$106+8>>2]|0)==($6|0)){label=29;break}else{label=30;break};case 29:HEAP32[$103+12>>2]=$106;HEAP32[$106+8>>2]=$103;label=66;break;case 30:_abort();return 0;return 0;case 31:_abort();return 0;return 0;case 32:$137=$5;$140=HEAP32[$4+($3+24)>>2]|0;$143=HEAP32[$4+($3+12)>>2]|0;if(($143|0)==($137|0)){label=38;break}else{label=33;break};case 33:$148=HEAP32[$4+($3+8)>>2]|0;if($148>>>0<$7>>>0){label=37;break}else{label=34;break};case 34:$152=$148+12|0;if((HEAP32[$152>>2]|0)==($137|0)){label=35;break}else{label=37;break};case 35:$156=$143+8|0;if((HEAP32[$156>>2]|0)==($137|0)){label=36;break}else{label=37;break};case 36:HEAP32[$152>>2]=$143;HEAP32[$156>>2]=$148;$R_1=$143;label=46;break;case 37:_abort();return 0;return 0;case 38:$162=$4+($3+20)|0;$163=HEAP32[$162>>2]|0;if(($163|0)==0){label=39;break}else{$R_0=$163;$RP_0=$162;label=40;break};case 39:$167=$4+($3+16)|0;$168=HEAP32[$167>>2]|0;if(($168|0)==0){$R_1=0;label=46;break}else{$R_0=$168;$RP_0=$167;label=40;break};case 40:$170=$R_0+20|0;if((HEAP32[$170>>2]|0)==0){label=41;break}else{$CP_0=$170;label=42;break};case 41:$174=$R_0+16|0;if((HEAP32[$174>>2]|0)==0){label=43;break}else{$CP_0=$174;label=42;break};case 42:$R_0=HEAP32[$CP_0>>2]|0;$RP_0=$CP_0;label=40;break;case 43:if($RP_0>>>0<(HEAP32[10610]|0)>>>0){label=45;break}else{label=44;break};case 44:HEAP32[$RP_0>>2]=0;$R_1=$R_0;label=46;break;case 45:_abort();return 0;return 0;case 46:if(($140|0)==0){label=66;break}else{label=47;break};case 47:$188=$4+($3+28)|0;$190=42728+(HEAP32[$188>>2]<<2)|0;if(($137|0)==(HEAP32[$190>>2]|0)){label=48;break}else{label=50;break};case 48:HEAP32[$190>>2]=$R_1;if(($R_1|0)==0){label=49;break}else{label=56;break};case 49:HEAP32[10607]=HEAP32[10607]&(1<<HEAP32[$188>>2]^-1);label=66;break;case 50:if($140>>>0<(HEAP32[10610]|0)>>>0){label=54;break}else{label=51;break};case 51:$204=$140+16|0;if((HEAP32[$204>>2]|0)==($137|0)){label=52;break}else{label=53;break};case 52:HEAP32[$204>>2]=$R_1;label=55;break;case 53:HEAP32[$140+20>>2]=$R_1;label=55;break;case 54:_abort();return 0;return 0;case 55:if(($R_1|0)==0){label=66;break}else{label=56;break};case 56:if($R_1>>>0<(HEAP32[10610]|0)>>>0){label=65;break}else{label=57;break};case 57:HEAP32[$R_1+24>>2]=$140;$221=HEAP32[$4+($3+16)>>2]|0;if(($221|0)==0){label=61;break}else{label=58;break};case 58:if($221>>>0<(HEAP32[10610]|0)>>>0){label=60;break}else{label=59;break};case 59:HEAP32[$R_1+16>>2]=$221;HEAP32[$221+24>>2]=$R_1;label=61;break;case 60:_abort();return 0;return 0;case 61:$234=HEAP32[$4+($3+20)>>2]|0;if(($234|0)==0){label=66;break}else{label=62;break};case 62:if($234>>>0<(HEAP32[10610]|0)>>>0){label=64;break}else{label=63;break};case 63:HEAP32[$R_1+20>>2]=$234;HEAP32[$234+24>>2]=$R_1;label=66;break;case 64:_abort();return 0;return 0;case 65:_abort();return 0;return 0;case 66:if($97>>>0<16){label=67;break}else{label=68;break};case 67:HEAP32[$1>>2]=$94|HEAP32[$1>>2]&1|2;$253=$4+($94|4)|0;HEAP32[$253>>2]=HEAP32[$253>>2]|1;$newp_0=$p;label=70;break;case 68:HEAP32[$1>>2]=HEAP32[$1>>2]&1|$nb|2;HEAP32[$4+($nb+4)>>2]=$97|3;$267=$4+($94|4)|0;HEAP32[$267>>2]=HEAP32[$267>>2]|1;_dispose_chunk($4+$nb|0,$97);$newp_0=$p;label=70;break;case 69:_abort();return 0;return 0;case 70:return $newp_0|0}return 0}function _malloc_footprint(){return HEAP32[10714]|0}function _malloc_max_footprint(){return HEAP32[10715]|0}function _malloc_footprint_limit(){var $1=0;$1=HEAP32[10716]|0;return(($1|0)==0?-1:$1)|0}function _malloc_set_footprint_limit($bytes){$bytes=$bytes|0;var $3=0,$result_0=0,label=0;label=1;while(1)switch(label|0){case 1:if(($bytes|0)==-1){$result_0=0;label=3;break}else{label=2;break};case 2:$3=HEAP32[8768]|0;$result_0=$bytes-1+$3&-$3;label=3;break;case 3:HEAP32[10716]=$result_0;return $result_0|0}return 0}function _malloc_usable_size($mem){$mem=$mem|0;var $5=0,$6=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:if(($mem|0)==0){$_0=0;label=4;break}else{label=2;break};case 2:$5=HEAP32[$mem-4>>2]|0;$6=$5&3;if(($6|0)==1){$_0=0;label=4;break}else{label=3;break};case 3:$_0=($5&-8)-(($6|0)==0?8:4)|0;label=4;break;case 4:return $_0|0}return 0}function _pvalloc($bytes){$bytes=$bytes|0;var $5=0,label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[8766]|0)==0){label=2;break}else{label=3;break};case 2:_init_mparams();label=3;break;case 3:$5=HEAP32[8767]|0;return _memalign($5,$bytes-1+$5&-$5)|0}return 0}function _independent_calloc($n_elements,$elem_size,$chunks){$n_elements=$n_elements|0;$elem_size=$elem_size|0;$chunks=$chunks|0;var $sz=0,$1=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+8|0;$sz=__stackBase__|0;HEAP32[$sz>>2]=$elem_size;$1=_ialloc($n_elements,$sz,3,$chunks)|0;STACKTOP=__stackBase__;return $1|0}function _ialloc($n_elements,$sizes,$opts,$chunks){$n_elements=$n_elements|0;$sizes=$sizes|0;$opts=$opts|0;$chunks=$chunks|0;var $6=0,$13=0,$array_size_0=0,$marray_0=0,$23=0,$29=0,$i_08=0,$contents_size_07=0,$32=0,$38=0,$39=0,$40=0,$contents_size_1=0,$element_size_0=0,$44=0,$47=0,$51=0,$remainder_size_0=0,$marray_1=0,$67=0,$i_15=0,$remainder_size_14=0,$p_0_in3=0,$73=0,$size_0=0,$79=0,$83=0,$84=0,$remainder_size_1_lcssa=0,$p_0_in_lcssa=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[8766]|0)==0){label=2;break}else{label=3;break};case 2:_init_mparams();label=3;break;case 3:$6=($n_elements|0)==0;if(($chunks|0)==0){label=5;break}else{label=4;break};case 4:if($6){$_0=$chunks;label=29;break}else{$marray_0=$chunks;$array_size_0=0;label=9;break};case 5:if($6){label=6;break}else{label=7;break};case 6:$_0=_malloc(0)|0;label=29;break;case 7:$13=$n_elements<<2;if($13>>>0<11){$marray_0=0;$array_size_0=16;label=9;break}else{label=8;break};case 8:$marray_0=0;$array_size_0=$13+11&-8;label=9;break;case 9:if(($opts&1|0)==0){label=10;break}else{label=11;break};case 10:if(($n_elements|0)==0){$element_size_0=0;$contents_size_1=0;label=17;break}else{$contents_size_07=0;$i_08=0;label=14;break};case 11:$23=HEAP32[$sizes>>2]|0;if($23>>>0<11){$29=16;label=13;break}else{label=12;break};case 12:$29=$23+11&-8;label=13;break;case 13:$element_size_0=$29;$contents_size_1=Math_imul($29,$n_elements)|0;label=17;break;case 14:$32=HEAP32[$sizes+($i_08<<2)>>2]|0;if($32>>>0<11){$38=16;label=16;break}else{label=15;break};case 15:$38=$32+11&-8;label=16;break;case 16:$39=$38+$contents_size_07|0;$40=$i_08+1|0;if(($40|0)==($n_elements|0)){$element_size_0=0;$contents_size_1=$39;label=17;break}else{$contents_size_07=$39;$i_08=$40;label=14;break};case 17:$44=_malloc($array_size_0-4+$contents_size_1|0)|0;if(($44|0)==0){$_0=0;label=29;break}else{label=18;break};case 18:$47=$44-8|0;$51=HEAP32[$44-4>>2]&-8;if(($opts&2|0)==0){label=20;break}else{label=19;break};case 19:_memset($44|0,0,-4-$array_size_0+$51|0);label=20;break;case 20:if(($marray_0|0)==0){label=21;break}else{$marray_1=$marray_0;$remainder_size_0=$51;label=22;break};case 21:HEAP32[$44+($contents_size_1-4)>>2]=$51-$contents_size_1|3;$marray_1=$44+$contents_size_1|0;$remainder_size_0=$contents_size_1;label=22;break;case 22:HEAP32[$marray_1>>2]=$44;$67=$n_elements-1|0;if(($67|0)==0){$p_0_in_lcssa=$47;$remainder_size_1_lcssa=$remainder_size_0;label=28;break}else{label=23;break};case 23:$p_0_in3=$47;$remainder_size_14=$remainder_size_0;$i_15=0;label=24;break;case 24:if(($element_size_0|0)==0){label=25;break}else{$size_0=$element_size_0;label=27;break};case 25:$73=HEAP32[$sizes+($i_15<<2)>>2]|0;if($73>>>0<11){$size_0=16;label=27;break}else{label=26;break};case 26:$size_0=$73+11&-8;label=27;break;case 27:$79=$remainder_size_14-$size_0|0;HEAP32[$p_0_in3+4>>2]=$size_0|3;$83=$p_0_in3+$size_0|0;$84=$i_15+1|0;HEAP32[$marray_1+($84<<2)>>2]=$p_0_in3+($size_0+8);if(($84|0)==($67|0)){$p_0_in_lcssa=$83;$remainder_size_1_lcssa=$79;label=28;break}else{$p_0_in3=$83;$remainder_size_14=$79;$i_15=$84;label=24;break};case 28:HEAP32[$p_0_in_lcssa+4>>2]=$remainder_size_1_lcssa|3;$_0=$marray_1;label=29;break;case 29:return $_0|0}return 0}function _independent_comalloc($n_elements,$sizes,$chunks){$n_elements=$n_elements|0;$sizes=$sizes|0;$chunks=$chunks|0;return _ialloc($n_elements,$sizes,0,$chunks)|0}function _bulk_free($array,$nelem){$array=$array|0;$nelem=$nelem|0;_internal_bulk_free($array,$nelem);return 0}function _malloc_trim($pad){$pad=$pad|0;var label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[8766]|0)==0){label=2;break}else{label=3;break};case 2:_init_mparams();label=3;break;case 3:return _sys_trim($pad)|0}return 0}function _mallinfo($agg_result){$agg_result=$agg_result|0;_internal_mallinfo($agg_result);return}function _internal_mallinfo($agg_result){$agg_result=$agg_result|0;var $9=0,$s_011=0,$sum_010=0,$mfree_09=0,$nfree_08=0,$12=0,$13=0,$15=0,$22=0,$23=0,$24=0,$29=0,$q_0_in5=0,$sum_14=0,$mfree_13=0,$nfree_12=0,$35=0,$36=0,$39=0,$40=0,$nfree_2=0,$mfree_2=0,$49=0,$50=0,$sum_1_lcssa=0,$mfree_1_lcssa=0,$nfree_1_lcssa=0,$53=0,$56=0,$nm_sroa_7_0=0,$nm_sroa_6_0=0,$nm_sroa_4_0=0,$nm_sroa_3_0=0,$nm_sroa_1_0=0,$nm_sroa_0_0=0,$nm_sroa_8_0=0,$62=0,label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[8766]|0)==0){label=2;break}else{label=3;break};case 2:_init_mparams();label=3;break;case 3:if((HEAP32[10612]|0)==0){$nm_sroa_8_0=0;$nm_sroa_0_0=0;$nm_sroa_1_0=0;$nm_sroa_3_0=0;$nm_sroa_4_0=0;$nm_sroa_6_0=0;$nm_sroa_7_0=0;label=16;break}else{label=4;break};case 4:$9=(HEAP32[10609]|0)+40|0;$nfree_08=1;$mfree_09=$9;$sum_010=$9;$s_011=42872;label=5;break;case 5:$12=$s_011|0;$13=HEAP32[$12>>2]|0;$15=$13+8|0;if(($15&7|0)==0){$22=0;label=7;break}else{label=6;break};case 6:$22=-$15&7;label=7;break;case 7:$23=$13+$22|0;$24=HEAP32[$12>>2]|0;if($23>>>0<$24>>>0){$nfree_1_lcssa=$nfree_08;$mfree_1_lcssa=$mfree_09;$sum_1_lcssa=$sum_010;label=14;break}else{label=8;break};case 8:$nfree_12=$nfree_08;$mfree_13=$mfree_09;$sum_14=$sum_010;$q_0_in5=$23;$29=$24;label=9;break;case 9:if($q_0_in5>>>0>=($29+(HEAP32[$s_011+4>>2]|0)|0)>>>0|($q_0_in5|0)==(HEAP32[10612]|0)){$nfree_1_lcssa=$nfree_12;$mfree_1_lcssa=$mfree_13;$sum_1_lcssa=$sum_14;label=14;break}else{label=10;break};case 10:$35=$q_0_in5+4|0;$36=HEAP32[$35>>2]|0;if(($36|0)==7){$nfree_1_lcssa=$nfree_12;$mfree_1_lcssa=$mfree_13;$sum_1_lcssa=$sum_14;label=14;break}else{label=11;break};case 11:$39=$36&-8;$40=$39+$sum_14|0;if(($36&3|0)==1){label=12;break}else{$mfree_2=$mfree_13;$nfree_2=$nfree_12;label=13;break};case 12:$mfree_2=$39+$mfree_13|0;$nfree_2=$nfree_12+1|0;label=13;break;case 13:$49=$q_0_in5+(HEAP32[$35>>2]&-8)|0;$50=HEAP32[$12>>2]|0;if($49>>>0<$50>>>0){$nfree_1_lcssa=$nfree_2;$mfree_1_lcssa=$mfree_2;$sum_1_lcssa=$40;label=14;break}else{$nfree_12=$nfree_2;$mfree_13=$mfree_2;$sum_14=$40;$q_0_in5=$49;$29=$50;label=9;break};case 14:$53=HEAP32[$s_011+8>>2]|0;if(($53|0)==0){label=15;break}else{$nfree_08=$nfree_1_lcssa;$mfree_09=$mfree_1_lcssa;$sum_010=$sum_1_lcssa;$s_011=$53;label=5;break};case 15:$56=HEAP32[10714]|0;$nm_sroa_8_0=HEAP32[10609]|0;$nm_sroa_0_0=$sum_1_lcssa;$nm_sroa_1_0=$nfree_1_lcssa;$nm_sroa_3_0=$56-$sum_1_lcssa|0;$nm_sroa_4_0=HEAP32[10715]|0;$nm_sroa_6_0=$56-$mfree_1_lcssa|0;$nm_sroa_7_0=$mfree_1_lcssa;label=16;break;case 16:HEAP32[$agg_result>>2]=$nm_sroa_0_0;HEAP32[$agg_result+4>>2]=$nm_sroa_1_0;$62=$agg_result+8|0;HEAP32[$62>>2]=0;HEAP32[$62+4>>2]=0;HEAP32[$agg_result+16>>2]=$nm_sroa_3_0;HEAP32[$agg_result+20>>2]=$nm_sroa_4_0;HEAP32[$agg_result+24>>2]=0;HEAP32[$agg_result+28>>2]=$nm_sroa_6_0;HEAP32[$agg_result+32>>2]=$nm_sroa_7_0;HEAP32[$agg_result+36>>2]=$nm_sroa_8_0;return}}function _malloc_stats(){_internal_malloc_stats();return}function _internal_malloc_stats(){var $9=0,$s_06=0,$used_05=0,$14=0,$15=0,$17=0,$24=0,$25=0,$26=0,$31=0,$q_0_in4=0,$used_13=0,$37=0,$38=0,$used_2=0,$49=0,$50=0,$used_1_lcssa=0,$53=0,$maxfp_0=0,$fp_0=0,$used_3=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;label=1;while(1)switch(label|0){case 1:if((HEAP32[8766]|0)==0){label=2;break}else{label=3;break};case 2:_init_mparams();label=3;break;case 3:if((HEAP32[10612]|0)==0){$used_3=0;$fp_0=0;$maxfp_0=0;label=15;break}else{label=4;break};case 4:$9=HEAP32[10714]|0;$used_05=$9-40-(HEAP32[10609]|0)|0;$s_06=42872;label=5;break;case 5:$14=$s_06|0;$15=HEAP32[$14>>2]|0;$17=$15+8|0;if(($17&7|0)==0){$24=0;label=7;break}else{label=6;break};case 6:$24=-$17&7;label=7;break;case 7:$25=$15+$24|0;$26=HEAP32[$14>>2]|0;if($25>>>0<$26>>>0){$used_1_lcssa=$used_05;label=14;break}else{label=8;break};case 8:$used_13=$used_05;$q_0_in4=$25;$31=$26;label=9;break;case 9:if($q_0_in4>>>0>=($31+(HEAP32[$s_06+4>>2]|0)|0)>>>0|($q_0_in4|0)==(HEAP32[10612]|0)){$used_1_lcssa=$used_13;label=14;break}else{label=10;break};case 10:$37=$q_0_in4+4|0;$38=HEAP32[$37>>2]|0;if(($38|0)==7){$used_1_lcssa=$used_13;label=14;break}else{label=11;break};case 11:if(($38&3|0)==1){label=12;break}else{$used_2=$used_13;label=13;break};case 12:$used_2=$used_13-($38&-8)|0;label=13;break;case 13:$49=$q_0_in4+(HEAP32[$37>>2]&-8)|0;$50=HEAP32[$14>>2]|0;if($49>>>0<$50>>>0){$used_1_lcssa=$used_2;label=14;break}else{$used_13=$used_2;$q_0_in4=$49;$31=$50;label=9;break};case 14:$53=HEAP32[$s_06+8>>2]|0;if(($53|0)==0){$used_3=$used_1_lcssa;$fp_0=$9;$maxfp_0=HEAP32[10715]|0;label=15;break}else{$used_05=$used_1_lcssa;$s_06=$53;label=5;break};case 15:_fprintf(HEAP32[_stderr>>2]|0,41568,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$maxfp_0,tempInt)|0)|0;_fprintf(HEAP32[_stderr>>2]|0,42104,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$fp_0,tempInt)|0)|0;_fprintf(HEAP32[_stderr>>2]|0,41664,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$used_3,tempInt)|0)|0;STACKTOP=__stackBase__;return}}function _mallopt($param_number,$value){$param_number=$param_number|0;$value=$value|0;return _change_mparam($param_number,$value)|0}function _change_mparam($param_number,$value){$param_number=$param_number|0;$value=$value|0;var $_0=0,label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[8766]|0)==0){label=2;break}else{label=3;break};case 2:_init_mparams();label=3;break;case 3:if(($param_number|0)==(-1|0)){label=4;break}else if(($param_number|0)==(-2|0)){label=5;break}else if(($param_number|0)==(-3|0)){label=8;break}else{$_0=0;label=9;break};case 4:HEAP32[8770]=$value;$_0=1;label=9;break;case 5:if((HEAP32[8767]|0)>>>0>$value>>>0){$_0=0;label=9;break}else{label=6;break};case 6:if(($value-1&$value|0)==0){label=7;break}else{$_0=0;label=9;break};case 7:HEAP32[8768]=$value;$_0=1;label=9;break;case 8:HEAP32[8769]=$value;$_0=1;label=9;break;case 9:return $_0|0}return 0}function _init_mparams(){var $4=0,label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[8766]|0)==0){label=2;break}else{label=5;break};case 2:$4=_sysconf(8)|0;if(($4-1&$4|0)==0){label=4;break}else{label=3;break};case 3:_abort();case 4:HEAP32[8768]=$4;HEAP32[8767]=$4;HEAP32[8769]=-1;HEAP32[8770]=2097152;HEAP32[8771]=0;HEAP32[10717]=0;HEAP32[8766]=(_time(0)|0)&-16^1431655768;label=5;break;case 5:return}}function _internal_bulk_free($array,$nelem){$array=$array|0;$nelem=$nelem|0;var $1=0,$a_07=0,$3=0,$6=0,$9=0,$11=0,$15=0,$19=0,$_sum=0,$31=0,$36=0,$41=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$array+($nelem<<2)|0;if(($nelem|0)==0){label=11;break}else{$a_07=$array;label=2;break};case 2:$3=HEAP32[$a_07>>2]|0;if(($3|0)==0){label=10;break}else{label=3;break};case 3:$6=$3-8|0;$9=$3-4|0;$11=HEAP32[$9>>2]&-8;HEAP32[$a_07>>2]=0;if($6>>>0<(HEAP32[10610]|0)>>>0){label=9;break}else{label=4;break};case 4:$15=HEAP32[$9>>2]|0;if(($15&3|0)==1){label=9;break}else{label=5;break};case 5:$19=$a_07+4|0;$_sum=$15-8&-8;if(($19|0)==($1|0)){label=8;break}else{label=6;break};case 6:if((HEAP32[$19>>2]|0)==($3+($_sum+8)|0)){label=7;break}else{label=8;break};case 7:$31=(HEAP32[$3+($_sum|4)>>2]&-8)+$11|0;HEAP32[$9>>2]=$15&1|$31|2;$36=$3+($31-4)|0;HEAP32[$36>>2]=HEAP32[$36>>2]|1;HEAP32[$19>>2]=$3;label=10;break;case 8:_dispose_chunk($6,$11);label=10;break;case 9:_abort();case 10:$41=$a_07+4|0;if(($41|0)==($1|0)){label=11;break}else{$a_07=$41;label=2;break};case 11:if((HEAP32[10609]|0)>>>0>(HEAP32[10613]|0)>>>0){label=12;break}else{label=13;break};case 12:_sys_trim(0)|0;label=13;break;case 13:return}}function _mmap_resize($oldp,$nb){$oldp=$oldp|0;$nb=$nb|0;var $3=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$3=HEAP32[$oldp+4>>2]&-8;if($nb>>>0<256){$_0=0;label=5;break}else{label=2;break};case 2:if($3>>>0<($nb+4|0)>>>0){label=4;break}else{label=3;break};case 3:if(($3-$nb|0)>>>0>HEAP32[8768]<<1>>>0){label=4;break}else{$_0=$oldp;label=5;break};case 4:$_0=0;label=5;break;case 5:return $_0|0}return 0}function _segment_holding($addr){$addr=$addr|0;var $sp_0=0,$3=0,$12=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$sp_0=42872;label=2;break;case 2:$3=HEAP32[$sp_0>>2]|0;if($3>>>0>$addr>>>0){label=4;break}else{label=3;break};case 3:if(($3+(HEAP32[$sp_0+4>>2]|0)|0)>>>0>$addr>>>0){$_0=$sp_0;label=5;break}else{label=4;break};case 4:$12=HEAP32[$sp_0+8>>2]|0;if(($12|0)==0){$_0=0;label=5;break}else{$sp_0=$12;label=2;break};case 5:return $_0|0}return 0}function _dispose_chunk($p,$psize){$p=$p|0;$psize=$psize|0;var $1=0,$2=0,$3=0,$5=0,$10=0,$15=0,$16=0,$17=0,$18=0,$24=0,$29=0,$32=0,$35=0,$63=0,$66=0,$69=0,$74=0,$78=0,$82=0,$_sum28=0,$88=0,$89=0,$93=0,$94=0,$RP_0=0,$R_0=0,$96=0,$100=0,$CP_0=0,$R_1=0,$114=0,$116=0,$130=0,$_sum31=0,$147=0,$160=0,$173=0,$_0277=0,$_0=0,$186=0,$190=0,$191=0,$199=0,$210=0,$218=0,$219=0,$224=0,$227=0,$230=0,$258=0,$261=0,$264=0,$269=0,$273=0,$277=0,$283=0,$284=0,$288=0,$289=0,$RP9_0=0,$R7_0=0,$291=0,$295=0,$CP10_0=0,$R7_1=0,$309=0,$311=0,$325=0,$342=0,$355=0,$_1=0,$383=0,$386=0,$388=0,$389=0,$390=0,$397=0,$F16_0=0,$408=0,$409=0,$416=0,$417=0,$420=0,$422=0,$425=0,$430=0,$I19_0=0,$437=0,$441=0,$442=0,$457=0,$T_0=0,$K20_0=0,$466=0,$467=0,$480=0,$481=0,$483=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$p;$2=$1+$psize|0;$3=$2;$5=HEAP32[$p+4>>2]|0;if(($5&1|0)==0){label=2;break}else{$_0=$p;$_0277=$psize;label=54;break};case 2:$10=HEAP32[$p>>2]|0;if(($5&3|0)==0){label=134;break}else{label=3;break};case 3:$15=$1+(-$10|0)|0;$16=$15;$17=$10+$psize|0;$18=HEAP32[10610]|0;if($15>>>0<$18>>>0){label=53;break}else{label=4;break};case 4:if(($16|0)==(HEAP32[10611]|0)){label=51;break}else{label=5;break};case 5:$24=$10>>>3;if($10>>>0<256){label=6;break}else{label=17;break};case 6:$29=HEAP32[$1+(8-$10)>>2]|0;$32=HEAP32[$1+(12-$10)>>2]|0;$35=42464+($24<<1<<2)|0;if(($29|0)==($35|0)){label=9;break}else{label=7;break};case 7:if($29>>>0<$18>>>0){label=16;break}else{label=8;break};case 8:if((HEAP32[$29+12>>2]|0)==($16|0)){label=9;break}else{label=16;break};case 9:if(($32|0)==($29|0)){label=10;break}else{label=11;break};case 10:HEAP32[10606]=HEAP32[10606]&(1<<$24^-1);$_0=$16;$_0277=$17;label=54;break;case 11:if(($32|0)==($35|0)){label=14;break}else{label=12;break};case 12:if($32>>>0<(HEAP32[10610]|0)>>>0){label=15;break}else{label=13;break};case 13:if((HEAP32[$32+8>>2]|0)==($16|0)){label=14;break}else{label=15;break};case 14:HEAP32[$29+12>>2]=$32;HEAP32[$32+8>>2]=$29;$_0=$16;$_0277=$17;label=54;break;case 15:_abort();case 16:_abort();case 17:$63=$15;$66=HEAP32[$1+(24-$10)>>2]|0;$69=HEAP32[$1+(12-$10)>>2]|0;if(($69|0)==($63|0)){label=23;break}else{label=18;break};case 18:$74=HEAP32[$1+(8-$10)>>2]|0;if($74>>>0<$18>>>0){label=22;break}else{label=19;break};case 19:$78=$74+12|0;if((HEAP32[$78>>2]|0)==($63|0)){label=20;break}else{label=22;break};case 20:$82=$69+8|0;if((HEAP32[$82>>2]|0)==($63|0)){label=21;break}else{label=22;break};case 21:HEAP32[$78>>2]=$69;HEAP32[$82>>2]=$74;$R_1=$69;label=31;break;case 22:_abort();case 23:$_sum28=16-$10|0;$88=$1+($_sum28+4)|0;$89=HEAP32[$88>>2]|0;if(($89|0)==0){label=24;break}else{$R_0=$89;$RP_0=$88;label=25;break};case 24:$93=$1+$_sum28|0;$94=HEAP32[$93>>2]|0;if(($94|0)==0){$R_1=0;label=31;break}else{$R_0=$94;$RP_0=$93;label=25;break};case 25:$96=$R_0+20|0;if((HEAP32[$96>>2]|0)==0){label=26;break}else{$CP_0=$96;label=27;break};case 26:$100=$R_0+16|0;if((HEAP32[$100>>2]|0)==0){label=28;break}else{$CP_0=$100;label=27;break};case 27:$R_0=HEAP32[$CP_0>>2]|0;$RP_0=$CP_0;label=25;break;case 28:if($RP_0>>>0<(HEAP32[10610]|0)>>>0){label=30;break}else{label=29;break};case 29:HEAP32[$RP_0>>2]=0;$R_1=$R_0;label=31;break;case 30:_abort();case 31:if(($66|0)==0){$_0=$16;$_0277=$17;label=54;break}else{label=32;break};case 32:$114=$1+(28-$10)|0;$116=42728+(HEAP32[$114>>2]<<2)|0;if(($63|0)==(HEAP32[$116>>2]|0)){label=33;break}else{label=35;break};case 33:HEAP32[$116>>2]=$R_1;if(($R_1|0)==0){label=34;break}else{label=41;break};case 34:HEAP32[10607]=HEAP32[10607]&(1<<HEAP32[$114>>2]^-1);$_0=$16;$_0277=$17;label=54;break;case 35:if($66>>>0<(HEAP32[10610]|0)>>>0){label=39;break}else{label=36;break};case 36:$130=$66+16|0;if((HEAP32[$130>>2]|0)==($63|0)){label=37;break}else{label=38;break};case 37:HEAP32[$130>>2]=$R_1;label=40;break;case 38:HEAP32[$66+20>>2]=$R_1;label=40;break;case 39:_abort();case 40:if(($R_1|0)==0){$_0=$16;$_0277=$17;label=54;break}else{label=41;break};case 41:if($R_1>>>0<(HEAP32[10610]|0)>>>0){label=50;break}else{label=42;break};case 42:HEAP32[$R_1+24>>2]=$66;$_sum31=16-$10|0;$147=HEAP32[$1+$_sum31>>2]|0;if(($147|0)==0){label=46;break}else{label=43;break};case 43:if($147>>>0<(HEAP32[10610]|0)>>>0){label=45;break}else{label=44;break};case 44:HEAP32[$R_1+16>>2]=$147;HEAP32[$147+24>>2]=$R_1;label=46;break;case 45:_abort();case 46:$160=HEAP32[$1+($_sum31+4)>>2]|0;if(($160|0)==0){$_0=$16;$_0277=$17;label=54;break}else{label=47;break};case 47:if($160>>>0<(HEAP32[10610]|0)>>>0){label=49;break}else{label=48;break};case 48:HEAP32[$R_1+20>>2]=$160;HEAP32[$160+24>>2]=$R_1;$_0=$16;$_0277=$17;label=54;break;case 49:_abort();case 50:_abort();case 51:$173=$1+($psize+4)|0;if((HEAP32[$173>>2]&3|0)==3){label=52;break}else{$_0=$16;$_0277=$17;label=54;break};case 52:HEAP32[10608]=$17;HEAP32[$173>>2]=HEAP32[$173>>2]&-2;HEAP32[$1+(4-$10)>>2]=$17|1;HEAP32[$2>>2]=$17;label=134;break;case 53:_abort();case 54:$186=HEAP32[10610]|0;if($2>>>0<$186>>>0){label=133;break}else{label=55;break};case 55:$190=$1+($psize+4)|0;$191=HEAP32[$190>>2]|0;if(($191&2|0)==0){label=56;break}else{label=109;break};case 56:if(($3|0)==(HEAP32[10612]|0)){label=57;break}else{label=59;break};case 57:$199=(HEAP32[10609]|0)+$_0277|0;HEAP32[10609]=$199;HEAP32[10612]=$_0;HEAP32[$_0+4>>2]=$199|1;if(($_0|0)==(HEAP32[10611]|0)){label=58;break}else{label=134;break};case 58:HEAP32[10611]=0;HEAP32[10608]=0;label=134;break;case 59:if(($3|0)==(HEAP32[10611]|0)){label=60;break}else{label=61;break};case 60:$210=(HEAP32[10608]|0)+$_0277|0;HEAP32[10608]=$210;HEAP32[10611]=$_0;HEAP32[$_0+4>>2]=$210|1;HEAP32[$_0+$210>>2]=$210;label=134;break;case 61:$218=($191&-8)+$_0277|0;$219=$191>>>3;if($191>>>0<256){label=62;break}else{label=73;break};case 62:$224=HEAP32[$1+($psize+8)>>2]|0;$227=HEAP32[$1+($psize+12)>>2]|0;$230=42464+($219<<1<<2)|0;if(($224|0)==($230|0)){label=65;break}else{label=63;break};case 63:if($224>>>0<$186>>>0){label=72;break}else{label=64;break};case 64:if((HEAP32[$224+12>>2]|0)==($3|0)){label=65;break}else{label=72;break};case 65:if(($227|0)==($224|0)){label=66;break}else{label=67;break};case 66:HEAP32[10606]=HEAP32[10606]&(1<<$219^-1);label=107;break;case 67:if(($227|0)==($230|0)){label=70;break}else{label=68;break};case 68:if($227>>>0<(HEAP32[10610]|0)>>>0){label=71;break}else{label=69;break};case 69:if((HEAP32[$227+8>>2]|0)==($3|0)){label=70;break}else{label=71;break};case 70:HEAP32[$224+12>>2]=$227;HEAP32[$227+8>>2]=$224;label=107;break;case 71:_abort();case 72:_abort();case 73:$258=$2;$261=HEAP32[$1+($psize+24)>>2]|0;$264=HEAP32[$1+($psize+12)>>2]|0;if(($264|0)==($258|0)){label=79;break}else{label=74;break};case 74:$269=HEAP32[$1+($psize+8)>>2]|0;if($269>>>0<$186>>>0){label=78;break}else{label=75;break};case 75:$273=$269+12|0;if((HEAP32[$273>>2]|0)==($258|0)){label=76;break}else{label=78;break};case 76:$277=$264+8|0;if((HEAP32[$277>>2]|0)==($258|0)){label=77;break}else{label=78;break};case 77:HEAP32[$273>>2]=$264;HEAP32[$277>>2]=$269;$R7_1=$264;label=87;break;case 78:_abort();case 79:$283=$1+($psize+20)|0;$284=HEAP32[$283>>2]|0;if(($284|0)==0){label=80;break}else{$R7_0=$284;$RP9_0=$283;label=81;break};case 80:$288=$1+($psize+16)|0;$289=HEAP32[$288>>2]|0;if(($289|0)==0){$R7_1=0;label=87;break}else{$R7_0=$289;$RP9_0=$288;label=81;break};case 81:$291=$R7_0+20|0;if((HEAP32[$291>>2]|0)==0){label=82;break}else{$CP10_0=$291;label=83;break};case 82:$295=$R7_0+16|0;if((HEAP32[$295>>2]|0)==0){label=84;break}else{$CP10_0=$295;label=83;break};case 83:$R7_0=HEAP32[$CP10_0>>2]|0;$RP9_0=$CP10_0;label=81;break;case 84:if($RP9_0>>>0<(HEAP32[10610]|0)>>>0){label=86;break}else{label=85;break};case 85:HEAP32[$RP9_0>>2]=0;$R7_1=$R7_0;label=87;break;case 86:_abort();case 87:if(($261|0)==0){label=107;break}else{label=88;break};case 88:$309=$1+($psize+28)|0;$311=42728+(HEAP32[$309>>2]<<2)|0;if(($258|0)==(HEAP32[$311>>2]|0)){label=89;break}else{label=91;break};case 89:HEAP32[$311>>2]=$R7_1;if(($R7_1|0)==0){label=90;break}else{label=97;break};case 90:HEAP32[10607]=HEAP32[10607]&(1<<HEAP32[$309>>2]^-1);label=107;break;case 91:if($261>>>0<(HEAP32[10610]|0)>>>0){label=95;break}else{label=92;break};case 92:$325=$261+16|0;if((HEAP32[$325>>2]|0)==($258|0)){label=93;break}else{label=94;break};case 93:HEAP32[$325>>2]=$R7_1;label=96;break;case 94:HEAP32[$261+20>>2]=$R7_1;label=96;break;case 95:_abort();case 96:if(($R7_1|0)==0){label=107;break}else{label=97;break};case 97:if($R7_1>>>0<(HEAP32[10610]|0)>>>0){label=106;break}else{label=98;break};case 98:HEAP32[$R7_1+24>>2]=$261;$342=HEAP32[$1+($psize+16)>>2]|0;if(($342|0)==0){label=102;break}else{label=99;break};case 99:if($342>>>0<(HEAP32[10610]|0)>>>0){label=101;break}else{label=100;break};case 100:HEAP32[$R7_1+16>>2]=$342;HEAP32[$342+24>>2]=$R7_1;label=102;break;case 101:_abort();case 102:$355=HEAP32[$1+($psize+20)>>2]|0;if(($355|0)==0){label=107;break}else{label=103;break};case 103:if($355>>>0<(HEAP32[10610]|0)>>>0){label=105;break}else{label=104;break};case 104:HEAP32[$R7_1+20>>2]=$355;HEAP32[$355+24>>2]=$R7_1;label=107;break;case 105:_abort();case 106:_abort();case 107:HEAP32[$_0+4>>2]=$218|1;HEAP32[$_0+$218>>2]=$218;if(($_0|0)==(HEAP32[10611]|0)){label=108;break}else{$_1=$218;label=110;break};case 108:HEAP32[10608]=$218;label=134;break;case 109:HEAP32[$190>>2]=$191&-2;HEAP32[$_0+4>>2]=$_0277|1;HEAP32[$_0+$_0277>>2]=$_0277;$_1=$_0277;label=110;break;case 110:$383=$_1>>>3;if($_1>>>0<256){label=111;break}else{label=116;break};case 111:$386=$383<<1;$388=42464+($386<<2)|0;$389=HEAP32[10606]|0;$390=1<<$383;if(($389&$390|0)==0){label=112;break}else{label=113;break};case 112:HEAP32[10606]=$389|$390;$F16_0=$388;label=115;break;case 113:$397=HEAP32[42464+($386+2<<2)>>2]|0;if($397>>>0<(HEAP32[10610]|0)>>>0){label=114;break}else{$F16_0=$397;label=115;break};case 114:_abort();case 115:HEAP32[42464+($386+2<<2)>>2]=$_0;HEAP32[$F16_0+12>>2]=$_0;HEAP32[$_0+8>>2]=$F16_0;HEAP32[$_0+12>>2]=$388;label=134;break;case 116:$408=$_0;$409=$_1>>>8;if(($409|0)==0){$I19_0=0;label=119;break}else{label=117;break};case 117:if($_1>>>0>16777215){$I19_0=31;label=119;break}else{label=118;break};case 118:$416=($409+1048320|0)>>>16&8;$417=$409<<$416;$420=($417+520192|0)>>>16&4;$422=$417<<$420;$425=($422+245760|0)>>>16&2;$430=14-($420|$416|$425)+($422<<$425>>>15)|0;$I19_0=$_1>>>(($430+7|0)>>>0)&1|$430<<1;label=119;break;case 119:$437=42728+($I19_0<<2)|0;HEAP32[$_0+28>>2]=$I19_0;HEAP32[$_0+20>>2]=0;HEAP32[$_0+16>>2]=0;$441=HEAP32[10607]|0;$442=1<<$I19_0;if(($441&$442|0)==0){label=120;break}else{label=121;break};case 120:HEAP32[10607]=$441|$442;HEAP32[$437>>2]=$408;HEAP32[$_0+24>>2]=$437;HEAP32[$_0+12>>2]=$_0;HEAP32[$_0+8>>2]=$_0;label=134;break;case 121:if(($I19_0|0)==31){$457=0;label=123;break}else{label=122;break};case 122:$457=25-($I19_0>>>1)|0;label=123;break;case 123:$K20_0=$_1<<$457;$T_0=HEAP32[$437>>2]|0;label=124;break;case 124:if((HEAP32[$T_0+4>>2]&-8|0)==($_1|0)){label=129;break}else{label=125;break};case 125:$466=$T_0+16+($K20_0>>>31<<2)|0;$467=HEAP32[$466>>2]|0;if(($467|0)==0){label=126;break}else{$K20_0=$K20_0<<1;$T_0=$467;label=124;break};case 126:if($466>>>0<(HEAP32[10610]|0)>>>0){label=128;break}else{label=127;break};case 127:HEAP32[$466>>2]=$408;HEAP32[$_0+24>>2]=$T_0;HEAP32[$_0+12>>2]=$_0;HEAP32[$_0+8>>2]=$_0;label=134;break;case 128:_abort();case 129:$480=$T_0+8|0;$481=HEAP32[$480>>2]|0;$483=HEAP32[10610]|0;if($T_0>>>0<$483>>>0){label=132;break}else{label=130;break};case 130:if($481>>>0<$483>>>0){label=132;break}else{label=131;break};case 131:HEAP32[$481+12>>2]=$408;HEAP32[$480>>2]=$408;HEAP32[$_0+8>>2]=$481;HEAP32[$_0+12>>2]=$T_0;HEAP32[$_0+24>>2]=0;label=134;break;case 132:_abort();case 133:_abort();case 134:return}}function _init_top($p,$psize){$p=$p|0;$psize=$psize|0;var $1=0,$3=0,$10=0,$13=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$p;$3=$p+8|0;if(($3&7|0)==0){$10=0;label=3;break}else{label=2;break};case 2:$10=-$3&7;label=3;break;case 3:$13=$psize-$10|0;HEAP32[10612]=$1+$10;HEAP32[10609]=$13;HEAP32[$1+($10+4)>>2]=$13|1;HEAP32[$1+($psize+4)>>2]=40;HEAP32[10613]=HEAP32[8770];return}}function _init_bins(){var $i_02=0,$2=0,$4=0,$7=0,label=0;label=1;while(1)switch(label|0){case 1:$i_02=0;label=2;break;case 2:$2=$i_02<<1;$4=42464+($2<<2)|0;HEAP32[42464+($2+3<<2)>>2]=$4;HEAP32[42464+($2+2<<2)>>2]=$4;$7=$i_02+1|0;if($7>>>0<32){$i_02=$7;label=2;break}else{label=3;break};case 3:return}}function _mmap_alloc(){}function _prepend_alloc($newbase,$oldbase,$nb){$newbase=$newbase|0;$oldbase=$oldbase|0;$nb=$nb|0;var $2=0,$9=0,$12=0,$19=0,$20=0,$21=0,$_sum=0,$25=0,$26=0,$27=0,$35=0,$44=0,$53=0,$57=0,$58=0,$63=0,$66=0,$69=0,$98=0,$101=0,$104=0,$109=0,$114=0,$118=0,$_sum67=0,$124=0,$125=0,$129=0,$130=0,$RP_0=0,$R_0=0,$132=0,$136=0,$CP_0=0,$R_1=0,$150=0,$152=0,$166=0,$_sum3233=0,$183=0,$196=0,$qsize_0=0,$oldfirst_0=0,$212=0,$220=0,$223=0,$225=0,$226=0,$227=0,$234=0,$F4_0=0,$247=0,$248=0,$255=0,$256=0,$259=0,$261=0,$264=0,$269=0,$I7_0=0,$276=0,$283=0,$284=0,$303=0,$T_0=0,$K8_0=0,$312=0,$313=0,$329=0,$330=0,$332=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$newbase+8|0;if(($2&7|0)==0){$9=0;label=3;break}else{label=2;break};case 2:$9=-$2&7;label=3;break;case 3:$12=$oldbase+8|0;if(($12&7|0)==0){$19=0;label=5;break}else{label=4;break};case 4:$19=-$12&7;label=5;break;case 5:$20=$oldbase+$19|0;$21=$20;$_sum=$9+$nb|0;$25=$newbase+$_sum|0;$26=$25;$27=$20-($newbase+$9)-$nb|0;HEAP32[$newbase+($9+4)>>2]=$nb|3;if(($21|0)==(HEAP32[10612]|0)){label=6;break}else{label=7;break};case 6:$35=(HEAP32[10609]|0)+$27|0;HEAP32[10609]=$35;HEAP32[10612]=$26;HEAP32[$newbase+($_sum+4)>>2]=$35|1;label=80;break;case 7:if(($21|0)==(HEAP32[10611]|0)){label=8;break}else{label=9;break};case 8:$44=(HEAP32[10608]|0)+$27|0;HEAP32[10608]=$44;HEAP32[10611]=$26;HEAP32[$newbase+($_sum+4)>>2]=$44|1;HEAP32[$newbase+($44+$_sum)>>2]=$44;label=80;break;case 9:$53=HEAP32[$oldbase+($19+4)>>2]|0;if(($53&3|0)==1){label=10;break}else{$oldfirst_0=$21;$qsize_0=$27;label=57;break};case 10:$57=$53&-8;$58=$53>>>3;if($53>>>0<256){label=11;break}else{label=22;break};case 11:$63=HEAP32[$oldbase+($19|8)>>2]|0;$66=HEAP32[$oldbase+($19+12)>>2]|0;$69=42464+($58<<1<<2)|0;if(($63|0)==($69|0)){label=14;break}else{label=12;break};case 12:if($63>>>0<(HEAP32[10610]|0)>>>0){label=21;break}else{label=13;break};case 13:if((HEAP32[$63+12>>2]|0)==($21|0)){label=14;break}else{label=21;break};case 14:if(($66|0)==($63|0)){label=15;break}else{label=16;break};case 15:HEAP32[10606]=HEAP32[10606]&(1<<$58^-1);label=56;break;case 16:if(($66|0)==($69|0)){label=19;break}else{label=17;break};case 17:if($66>>>0<(HEAP32[10610]|0)>>>0){label=20;break}else{label=18;break};case 18:if((HEAP32[$66+8>>2]|0)==($21|0)){label=19;break}else{label=20;break};case 19:HEAP32[$63+12>>2]=$66;HEAP32[$66+8>>2]=$63;label=56;break;case 20:_abort();return 0;return 0;case 21:_abort();return 0;return 0;case 22:$98=$20;$101=HEAP32[$oldbase+($19|24)>>2]|0;$104=HEAP32[$oldbase+($19+12)>>2]|0;if(($104|0)==($98|0)){label=28;break}else{label=23;break};case 23:$109=HEAP32[$oldbase+($19|8)>>2]|0;if($109>>>0<(HEAP32[10610]|0)>>>0){label=27;break}else{label=24;break};case 24:$114=$109+12|0;if((HEAP32[$114>>2]|0)==($98|0)){label=25;break}else{label=27;break};case 25:$118=$104+8|0;if((HEAP32[$118>>2]|0)==($98|0)){label=26;break}else{label=27;break};case 26:HEAP32[$114>>2]=$104;HEAP32[$118>>2]=$109;$R_1=$104;label=36;break;case 27:_abort();return 0;return 0;case 28:$_sum67=$19|16;$124=$oldbase+($_sum67+4)|0;$125=HEAP32[$124>>2]|0;if(($125|0)==0){label=29;break}else{$R_0=$125;$RP_0=$124;label=30;break};case 29:$129=$oldbase+$_sum67|0;$130=HEAP32[$129>>2]|0;if(($130|0)==0){$R_1=0;label=36;break}else{$R_0=$130;$RP_0=$129;label=30;break};case 30:$132=$R_0+20|0;if((HEAP32[$132>>2]|0)==0){label=31;break}else{$CP_0=$132;label=32;break};case 31:$136=$R_0+16|0;if((HEAP32[$136>>2]|0)==0){label=33;break}else{$CP_0=$136;label=32;break};case 32:$R_0=HEAP32[$CP_0>>2]|0;$RP_0=$CP_0;label=30;break;case 33:if($RP_0>>>0<(HEAP32[10610]|0)>>>0){label=35;break}else{label=34;break};case 34:HEAP32[$RP_0>>2]=0;$R_1=$R_0;label=36;break;case 35:_abort();return 0;return 0;case 36:if(($101|0)==0){label=56;break}else{label=37;break};case 37:$150=$oldbase+($19+28)|0;$152=42728+(HEAP32[$150>>2]<<2)|0;if(($98|0)==(HEAP32[$152>>2]|0)){label=38;break}else{label=40;break};case 38:HEAP32[$152>>2]=$R_1;if(($R_1|0)==0){label=39;break}else{label=46;break};case 39:HEAP32[10607]=HEAP32[10607]&(1<<HEAP32[$150>>2]^-1);label=56;break;case 40:if($101>>>0<(HEAP32[10610]|0)>>>0){label=44;break}else{label=41;break};case 41:$166=$101+16|0;if((HEAP32[$166>>2]|0)==($98|0)){label=42;break}else{label=43;break};case 42:HEAP32[$166>>2]=$R_1;label=45;break;case 43:HEAP32[$101+20>>2]=$R_1;label=45;break;case 44:_abort();return 0;return 0;case 45:if(($R_1|0)==0){label=56;break}else{label=46;break};case 46:if($R_1>>>0<(HEAP32[10610]|0)>>>0){label=55;break}else{label=47;break};case 47:HEAP32[$R_1+24>>2]=$101;$_sum3233=$19|16;$183=HEAP32[$oldbase+$_sum3233>>2]|0;if(($183|0)==0){label=51;break}else{label=48;break};case 48:if($183>>>0<(HEAP32[10610]|0)>>>0){label=50;break}else{label=49;break};case 49:HEAP32[$R_1+16>>2]=$183;HEAP32[$183+24>>2]=$R_1;label=51;break;case 50:_abort();return 0;return 0;case 51:$196=HEAP32[$oldbase+($_sum3233+4)>>2]|0;if(($196|0)==0){label=56;break}else{label=52;break};case 52:if($196>>>0<(HEAP32[10610]|0)>>>0){label=54;break}else{label=53;break};case 53:HEAP32[$R_1+20>>2]=$196;HEAP32[$196+24>>2]=$R_1;label=56;break;case 54:_abort();return 0;return 0;case 55:_abort();return 0;return 0;case 56:$oldfirst_0=$oldbase+($57|$19)|0;$qsize_0=$57+$27|0;label=57;break;case 57:$212=$oldfirst_0+4|0;HEAP32[$212>>2]=HEAP32[$212>>2]&-2;HEAP32[$newbase+($_sum+4)>>2]=$qsize_0|1;HEAP32[$newbase+($qsize_0+$_sum)>>2]=$qsize_0;$220=$qsize_0>>>3;if($qsize_0>>>0<256){label=58;break}else{label=63;break};case 58:$223=$220<<1;$225=42464+($223<<2)|0;$226=HEAP32[10606]|0;$227=1<<$220;if(($226&$227|0)==0){label=59;break}else{label=60;break};case 59:HEAP32[10606]=$226|$227;$F4_0=$225;label=62;break;case 60:$234=HEAP32[42464+($223+2<<2)>>2]|0;if($234>>>0<(HEAP32[10610]|0)>>>0){label=61;break}else{$F4_0=$234;label=62;break};case 61:_abort();return 0;return 0;case 62:HEAP32[42464+($223+2<<2)>>2]=$26;HEAP32[$F4_0+12>>2]=$26;HEAP32[$newbase+($_sum+8)>>2]=$F4_0;HEAP32[$newbase+($_sum+12)>>2]=$225;label=80;break;case 63:$247=$25;$248=$qsize_0>>>8;if(($248|0)==0){$I7_0=0;label=66;break}else{label=64;break};case 64:if($qsize_0>>>0>16777215){$I7_0=31;label=66;break}else{label=65;break};case 65:$255=($248+1048320|0)>>>16&8;$256=$248<<$255;$259=($256+520192|0)>>>16&4;$261=$256<<$259;$264=($261+245760|0)>>>16&2;$269=14-($259|$255|$264)+($261<<$264>>>15)|0;$I7_0=$qsize_0>>>(($269+7|0)>>>0)&1|$269<<1;label=66;break;case 66:$276=42728+($I7_0<<2)|0;HEAP32[$newbase+($_sum+28)>>2]=$I7_0;HEAP32[$newbase+($_sum+20)>>2]=0;HEAP32[$newbase+($_sum+16)>>2]=0;$283=HEAP32[10607]|0;$284=1<<$I7_0;if(($283&$284|0)==0){label=67;break}else{label=68;break};case 67:HEAP32[10607]=$283|$284;HEAP32[$276>>2]=$247;HEAP32[$newbase+($_sum+24)>>2]=$276;HEAP32[$newbase+($_sum+12)>>2]=$247;HEAP32[$newbase+($_sum+8)>>2]=$247;label=80;break;case 68:if(($I7_0|0)==31){$303=0;label=70;break}else{label=69;break};case 69:$303=25-($I7_0>>>1)|0;label=70;break;case 70:$K8_0=$qsize_0<<$303;$T_0=HEAP32[$276>>2]|0;label=71;break;case 71:if((HEAP32[$T_0+4>>2]&-8|0)==($qsize_0|0)){label=76;break}else{label=72;break};case 72:$312=$T_0+16+($K8_0>>>31<<2)|0;$313=HEAP32[$312>>2]|0;if(($313|0)==0){label=73;break}else{$K8_0=$K8_0<<1;$T_0=$313;label=71;break};case 73:if($312>>>0<(HEAP32[10610]|0)>>>0){label=75;break}else{label=74;break};case 74:HEAP32[$312>>2]=$247;HEAP32[$newbase+($_sum+24)>>2]=$T_0;HEAP32[$newbase+($_sum+12)>>2]=$247;HEAP32[$newbase+($_sum+8)>>2]=$247;label=80;break;case 75:_abort();return 0;return 0;case 76:$329=$T_0+8|0;$330=HEAP32[$329>>2]|0;$332=HEAP32[10610]|0;if($T_0>>>0<$332>>>0){label=79;break}else{label=77;break};case 77:if($330>>>0<$332>>>0){label=79;break}else{label=78;break};case 78:HEAP32[$330+12>>2]=$247;HEAP32[$329>>2]=$247;HEAP32[$newbase+($_sum+8)>>2]=$330;HEAP32[$newbase+($_sum+12)>>2]=$T_0;HEAP32[$newbase+($_sum+24)>>2]=0;label=80;break;case 79:_abort();return 0;return 0;case 80:return $newbase+($9|8)|0}return 0}function _add_segment($tbase,$tsize){$tbase=$tbase|0;$tsize=$tsize|0;var $1=0,$2=0,$3=0,$5=0,$7=0,$8=0,$10=0,$17=0,$18=0,$22=0,$23=0,$30=0,$33=0,$34=0,$42=0,$45=0,$51=0,$54=0,$56=0,$57=0,$58=0,$65=0,$F_0=0,$76=0,$77=0,$84=0,$85=0,$88=0,$90=0,$93=0,$98=0,$I1_0=0,$105=0,$109=0,$110=0,$125=0,$T_0=0,$K2_0=0,$134=0,$135=0,$148=0,$149=0,$151=0,label=0;label=1;while(1)switch(label|0){case 1:$1=HEAP32[10612]|0;$2=$1;$3=_segment_holding($2)|0;$5=HEAP32[$3>>2]|0;$7=HEAP32[$3+4>>2]|0;$8=$5+$7|0;$10=$5+($7-39)|0;if(($10&7|0)==0){$17=0;label=3;break}else{label=2;break};case 2:$17=-$10&7;label=3;break;case 3:$18=$5+($7-47+$17)|0;$22=$18>>>0<($1+16|0)>>>0?$2:$18;$23=$22+8|0;_init_top($tbase,$tsize-40|0);HEAP32[$22+4>>2]=27;HEAP32[$23>>2]=HEAP32[10718];HEAP32[$23+4>>2]=HEAP32[42876>>2];HEAP32[$23+8>>2]=HEAP32[42880>>2];HEAP32[$23+12>>2]=HEAP32[42884>>2];HEAP32[10718]=$tbase;HEAP32[10719]=$tsize;HEAP32[10721]=0;HEAP32[10720]=$23;$30=$22+28|0;HEAP32[$30>>2]=7;if(($22+32|0)>>>0<$8>>>0){$33=$30;label=4;break}else{label=5;break};case 4:$34=$33+4|0;HEAP32[$34>>2]=7;if(($33+8|0)>>>0<$8>>>0){$33=$34;label=4;break}else{label=5;break};case 5:if(($22|0)==($2|0)){label=29;break}else{label=6;break};case 6:$42=$22-$1|0;$45=$2+($42+4)|0;HEAP32[$45>>2]=HEAP32[$45>>2]&-2;HEAP32[$1+4>>2]=$42|1;HEAP32[$2+$42>>2]=$42;$51=$42>>>3;if($42>>>0<256){label=7;break}else{label=12;break};case 7:$54=$51<<1;$56=42464+($54<<2)|0;$57=HEAP32[10606]|0;$58=1<<$51;if(($57&$58|0)==0){label=8;break}else{label=9;break};case 8:HEAP32[10606]=$57|$58;$F_0=$56;label=11;break;case 9:$65=HEAP32[42464+($54+2<<2)>>2]|0;if($65>>>0<(HEAP32[10610]|0)>>>0){label=10;break}else{$F_0=$65;label=11;break};case 10:_abort();case 11:HEAP32[42464+($54+2<<2)>>2]=$1;HEAP32[$F_0+12>>2]=$1;HEAP32[$1+8>>2]=$F_0;HEAP32[$1+12>>2]=$56;label=29;break;case 12:$76=$1;$77=$42>>>8;if(($77|0)==0){$I1_0=0;label=15;break}else{label=13;break};case 13:if($42>>>0>16777215){$I1_0=31;label=15;break}else{label=14;break};case 14:$84=($77+1048320|0)>>>16&8;$85=$77<<$84;$88=($85+520192|0)>>>16&4;$90=$85<<$88;$93=($90+245760|0)>>>16&2;$98=14-($88|$84|$93)+($90<<$93>>>15)|0;$I1_0=$42>>>(($98+7|0)>>>0)&1|$98<<1;label=15;break;case 15:$105=42728+($I1_0<<2)|0;HEAP32[$1+28>>2]=$I1_0;HEAP32[$1+20>>2]=0;HEAP32[$1+16>>2]=0;$109=HEAP32[10607]|0;$110=1<<$I1_0;if(($109&$110|0)==0){label=16;break}else{label=17;break};case 16:HEAP32[10607]=$109|$110;HEAP32[$105>>2]=$76;HEAP32[$1+24>>2]=$105;HEAP32[$1+12>>2]=$1;HEAP32[$1+8>>2]=$1;label=29;break;case 17:if(($I1_0|0)==31){$125=0;label=19;break}else{label=18;break};case 18:$125=25-($I1_0>>>1)|0;label=19;break;case 19:$K2_0=$42<<$125;$T_0=HEAP32[$105>>2]|0;label=20;break;case 20:if((HEAP32[$T_0+4>>2]&-8|0)==($42|0)){label=25;break}else{label=21;break};case 21:$134=$T_0+16+($K2_0>>>31<<2)|0;$135=HEAP32[$134>>2]|0;if(($135|0)==0){label=22;break}else{$K2_0=$K2_0<<1;$T_0=$135;label=20;break};case 22:if($134>>>0<(HEAP32[10610]|0)>>>0){label=24;break}else{label=23;break};case 23:HEAP32[$134>>2]=$76;HEAP32[$1+24>>2]=$T_0;HEAP32[$1+12>>2]=$1;HEAP32[$1+8>>2]=$1;label=29;break;case 24:_abort();case 25:$148=$T_0+8|0;$149=HEAP32[$148>>2]|0;$151=HEAP32[10610]|0;if($T_0>>>0<$151>>>0){label=28;break}else{label=26;break};case 26:if($149>>>0<$151>>>0){label=28;break}else{label=27;break};case 27:HEAP32[$149+12>>2]=$76;HEAP32[$148>>2]=$76;HEAP32[$1+8>>2]=$149;HEAP32[$1+12>>2]=$T_0;HEAP32[$1+24>>2]=0;label=29;break;case 28:_abort();case 29:return}}function __ZNSt9bad_allocD2Ev($this){$this=$this|0;return}function __ZNSt9exceptionD2Ev($this){$this=$this|0;return}function __ZNKSt9bad_alloc4whatEv($this){$this=$this|0;return 41616|0}function __ZNKSt20bad_array_new_length4whatEv($this){$this=$this|0;return 42056|0}function __ZNSt9exceptionD1Ev($this){$this=$this|0;return}function __ZNKSt9exception4whatEv($this){$this=$this|0;return 41600|0}function __ZSt15get_new_handlerv(){return(tempValue=HEAP32[10792]|0,HEAP32[10792]=tempValue+0,tempValue)|0}function __ZSt15set_new_handlerPFvvE($handler){$handler=$handler|0;return(tempValue=HEAP32[10792]|0,HEAP32[10792]=$handler,tempValue)|0}function __ZNSt9bad_allocC2Ev($this){$this=$this|0;HEAP32[$this>>2]=43e3;return}function __ZdlPv($ptr){$ptr=$ptr|0;var label=0;label=1;while(1)switch(label|0){case 1:if(($ptr|0)==0){label=3;break}else{label=2;break};case 2:_free($ptr);label=3;break;case 3:return}}function __ZdlPvRKSt9nothrow_t($ptr,$0){$ptr=$ptr|0;$0=$0|0;__ZdlPv($ptr);return}function __ZdaPv($ptr){$ptr=$ptr|0;__ZdlPv($ptr);return}function __ZdaPvRKSt9nothrow_t($ptr,$0){$ptr=$ptr|0;$0=$0|0;__ZdaPv($ptr);return}function __ZNSt9bad_allocD0Ev($this){$this=$this|0;__ZdlPv($this);return}function __ZNSt20bad_array_new_lengthC2Ev($this){$this=$this|0;__ZNSt9bad_allocC2Ev($this|0);HEAP32[$this>>2]=43032;return}function __ZNSt20bad_array_new_lengthD0Ev($this){$this=$this|0;__ZdlPv($this);return}function __ZNSt9exceptionD0Ev($this){$this=$this|0;__ZdlPv($this);return}function _getopt($nargc,$nargv,$options){$nargc=$nargc|0;$nargv=$nargv|0;$options=$options|0;return _getopt_internal($nargc,$nargv,$options,0,0,0)|0}function _getopt_internal($nargc,$nargv,$options,$long_options,$idx,$flags){$nargc=$nargc|0;$nargv=$nargv|0;$options=$options|0;$long_options=$long_options|0;$idx=$idx|0;$flags=$flags|0;var $16=0,$_0=0,$26=0,$_060=0,$37=0,$40=0,$42=0,$56=0,$70=0,$78=0,$83=0,$103=0,$104=0,$117=0,$129=0,$131=0,$143=0,$144=0,$short_too_0=0,$151=0,$155=0,$156=0,$157=0,$158=0,$163=0,$197=0,$214=0,$227=0,$237=0,$_059=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;label=1;while(1)switch(label|0){case 1:if(($options|0)==0){$_059=-1;label=83;break}else{label=2;break};case 2:if((HEAP32[8704]|0)==0){label=3;break}else{label=4;break};case 3:HEAP32[8700]=1;HEAP32[8704]=1;label=4;break;case 4:if((HEAP32[10088]|0)==-1|(HEAP32[8700]|0)!=0){label=5;break}else{label=6;break};case 5:HEAP32[10088]=(_getenv(41472)|0)!=0&1;label=6;break;case 6:$16=HEAP8[$options]|0;if($16<<24>>24==45){label=7;break}else{label=8;break};case 7:$_0=$flags|2;label=9;break;case 8:$_0=(HEAP32[10088]|0)!=0|$16<<24>>24==43?$flags&-2:$flags;label=9;break;case 9:$26=HEAP8[$options]|0;if(($26<<24>>24|0)==43|($26<<24>>24|0)==45){label=10;break}else{$_060=$options;label=11;break};case 10:$_060=$options+1|0;label=11;break;case 11:HEAP32[8708]=0;if((HEAP32[8700]|0)==0){label=14;break}else{label=12;break};case 12:HEAP32[8754]=-1;HEAP32[8752]=-1;label=13;break;case 13:if((HEAP32[8700]|0)==0){label=14;break}else{label=15;break};case 14:if((HEAP8[HEAP32[8698]|0]|0)==0){label=15;break}else{label=40;break};case 15:HEAP32[8700]=0;$37=HEAP32[8704]|0;if(($37|0)<($nargc|0)){label=21;break}else{label=16;break};case 16:HEAP32[8698]=41936;$40=HEAP32[8754]|0;$42=HEAP32[8752]|0;if(($40|0)==-1){label=18;break}else{label=17;break};case 17:_permute_args($42,$40,HEAP32[8704]|0,$nargv);HEAP32[8704]=(HEAP32[8752]|0)-(HEAP32[8754]|0)+(HEAP32[8704]|0);label=20;break;case 18:if(($42|0)==-1){label=20;break}else{label=19;break};case 19:HEAP32[8704]=$42;label=20;break;case 20:HEAP32[8754]=-1;HEAP32[8752]=-1;$_059=-1;label=83;break;case 21:$56=HEAP32[$nargv+($37<<2)>>2]|0;HEAP32[8698]=$56;if((HEAP8[$56]|0)==45){label=22;break}else{label=24;break};case 22:if((HEAP8[$56+1|0]|0)==0){label=23;break}else{label=32;break};case 23:if((_strchr($_060|0,45)|0)==0){label=24;break}else{label=32;break};case 24:HEAP32[8698]=41936;if(($_0&2|0)==0){label=26;break}else{label=25;break};case 25:$70=HEAP32[8704]|0;HEAP32[8704]=$70+1;HEAP32[8708]=HEAP32[$nargv+($70<<2)>>2];$_059=1;label=83;break;case 26:if(($_0&1|0)==0){$_059=-1;label=83;break}else{label=27;break};case 27:$78=HEAP32[8752]|0;if(($78|0)==-1){label=28;break}else{label=29;break};case 28:HEAP32[8752]=HEAP32[8704];label=31;break;case 29:$83=HEAP32[8754]|0;if(($83|0)==-1){label=31;break}else{label=30;break};case 30:_permute_args($78,$83,HEAP32[8704]|0,$nargv);HEAP32[8752]=(HEAP32[8704]|0)-(HEAP32[8754]|0)+(HEAP32[8752]|0);HEAP32[8754]=-1;label=31;break;case 31:HEAP32[8704]=(HEAP32[8704]|0)+1;label=13;break;case 32:if((HEAP32[8752]|0)!=-1&(HEAP32[8754]|0)==-1){label=33;break}else{label=34;break};case 33:HEAP32[8754]=HEAP32[8704];label=34;break;case 34:$103=HEAP32[8698]|0;$104=$103+1|0;if((HEAP8[$104]|0)==0){label=40;break}else{label=35;break};case 35:HEAP32[8698]=$104;if((HEAP8[$104]|0)==45){label=36;break}else{label=40;break};case 36:if((HEAP8[$103+2|0]|0)==0){label=37;break}else{label=40;break};case 37:HEAP32[8704]=(HEAP32[8704]|0)+1;HEAP32[8698]=41936;$117=HEAP32[8754]|0;if(($117|0)==-1){label=39;break}else{label=38;break};case 38:_permute_args(HEAP32[8752]|0,$117,HEAP32[8704]|0,$nargv);HEAP32[8704]=(HEAP32[8752]|0)-(HEAP32[8754]|0)+(HEAP32[8704]|0);label=39;break;case 39:HEAP32[8754]=-1;HEAP32[8752]=-1;$_059=-1;label=83;break;case 40:$129=($long_options|0)!=0;if($129){label=41;break}else{label=49;break};case 41:$131=HEAP32[8698]|0;if(($131|0)==(HEAP32[$nargv+(HEAP32[8704]<<2)>>2]|0)){label=49;break}else{label=42;break};case 42:if((HEAP8[$131]|0)==45){label=44;break}else{label=43;break};case 43:if(($_0&4|0)==0){label=49;break}else{label=44;break};case 44:$143=HEAP32[8698]|0;$144=HEAP8[$143]|0;if(($144<<24>>24|0)==45){label=45;break}else if(($144<<24>>24|0)==58){$short_too_0=0;label=47;break}else{label=46;break};case 45:HEAP32[8698]=$143+1;$short_too_0=0;label=47;break;case 46:$short_too_0=(_strchr($_060|0,$144<<24>>24|0)|0)!=0&1;label=47;break;case 47:$151=_parse_long_options($nargv,$_060,$long_options,$idx,$short_too_0)|0;if(($151|0)==-1){label=49;break}else{label=48;break};case 48:HEAP32[8698]=41936;$_059=$151;label=83;break;case 49:$155=HEAP32[8698]|0;$156=$155+1|0;HEAP32[8698]=$156;$157=HEAP8[$155]|0;$158=$157<<24>>24;if(($157<<24>>24|0)==45){label=50;break}else if(($157<<24>>24|0)==58){label=54;break}else{label=51;break};case 50:if((HEAP8[$156]|0)==0){label=51;break}else{label=53;break};case 51:$163=_strchr($_060|0,$158|0)|0;if(($163|0)==0){label=52;break}else{label=60;break};case 52:if($157<<24>>24==45){label=53;break}else{label=54;break};case 53:if((HEAP8[HEAP32[8698]|0]|0)==0){$_059=-1;label=83;break}else{label=54;break};case 54:if((HEAP8[HEAP32[8698]|0]|0)==0){label=55;break}else{label=56;break};case 55:HEAP32[8704]=(HEAP32[8704]|0)+1;label=56;break;case 56:if((HEAP32[8706]|0)==0){label=59;break}else{label=57;break};case 57:if((HEAP8[$_060]|0)==58){label=59;break}else{label=58;break};case 58:__warnx(35912,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$158,tempInt)|0);label=59;break;case 59:HEAP32[8702]=$158;$_059=63;label=83;break;case 60:if($129&$157<<24>>24==87){label=61;break}else{label=70;break};case 61:if((HEAP8[$163+1|0]|0)==59){label=62;break}else{label=70;break};case 62:if((HEAP8[HEAP32[8698]|0]|0)==0){label=63;break}else{label=69;break};case 63:$197=(HEAP32[8704]|0)+1|0;HEAP32[8704]=$197;if(($197|0)<($nargc|0)){label=68;break}else{label=64;break};case 64:HEAP32[8698]=41936;if((HEAP32[8706]|0)==0){label=67;break}else{label=65;break};case 65:if((HEAP8[$_060]|0)==58){label=67;break}else{label=66;break};case 66:__warnx(34448,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$158,tempInt)|0);label=67;break;case 67:HEAP32[8702]=$158;$_059=(HEAP8[$_060]|0)==58?58:63;label=83;break;case 68:HEAP32[8698]=HEAP32[$nargv+($197<<2)>>2];label=69;break;case 69:$214=_parse_long_options($nargv,$_060,$long_options,$idx,0)|0;HEAP32[8698]=41936;$_059=$214;label=83;break;case 70:if((HEAP8[$163+1|0]|0)==58){label=73;break}else{label=71;break};case 71:if((HEAP8[HEAP32[8698]|0]|0)==0){label=72;break}else{$_059=$158;label=83;break};case 72:HEAP32[8704]=(HEAP32[8704]|0)+1;$_059=$158;label=83;break;case 73:HEAP32[8708]=0;$227=HEAP32[8698]|0;if((HEAP8[$227]|0)==0){label=75;break}else{label=74;break};case 74:HEAP32[8708]=$227;label=82;break;case 75:if((HEAP8[$163+2|0]|0)==58){label=82;break}else{label=76;break};case 76:$237=(HEAP32[8704]|0)+1|0;HEAP32[8704]=$237;if(($237|0)<($nargc|0)){label=81;break}else{label=77;break};case 77:HEAP32[8698]=41936;if((HEAP32[8706]|0)==0){label=80;break}else{label=78;break};case 78:if((HEAP8[$_060]|0)==58){label=80;break}else{label=79;break};case 79:__warnx(34448,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$158,tempInt)|0);label=80;break;case 80:HEAP32[8702]=$158;$_059=(HEAP8[$_060]|0)==58?58:63;label=83;break;case 81:HEAP32[8708]=HEAP32[$nargv+($237<<2)>>2];label=82;break;case 82:HEAP32[8698]=41936;HEAP32[8704]=(HEAP32[8704]|0)+1;$_059=$158;label=83;break;case 83:STACKTOP=__stackBase__;return $_059|0}return 0}function _getopt_long($nargc,$nargv,$options,$long_options,$idx){$nargc=$nargc|0;$nargv=$nargv|0;$options=$options|0;$long_options=$long_options|0;$idx=$idx|0;return _getopt_internal($nargc,$nargv,$options,$long_options,$idx,1)|0}function _getopt_long_only($nargc,$nargv,$options,$long_options,$idx){$nargc=$nargc|0;$nargv=$nargv|0;$options=$options|0;$long_options=$long_options|0;$idx=$idx|0;return _getopt_internal($nargc,$nargv,$options,$long_options,$idx,5)|0}function _permute_args($panonopt_start,$panonopt_end,$opt_end,$nargv){$panonopt_start=$panonopt_start|0;$panonopt_end=$panonopt_end|0;$opt_end=$opt_end|0;$nargv=$nargv|0;var $1=0,$2=0,$3=0,$5=0,$i_026=0,$10=0,$11=0,$pos_025=0,$j_024=0,$pos_1=0,$14=0,$15=0,$17=0,$19=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$panonopt_end-$panonopt_start|0;$2=$opt_end-$panonopt_end|0;$3=_gcd54($1,$2)|0;$5=($opt_end-$panonopt_start|0)/($3|0)&-1;if(($3|0)>0){label=2;break}else{label=7;break};case 2:$i_026=0;label=3;break;case 3:$10=$i_026+$panonopt_end|0;if(($5|0)>0){label=4;break}else{label=6;break};case 4:$11=$nargv+($10<<2)|0;$j_024=0;$pos_025=$10;label=5;break;case 5:$pos_1=(($pos_025|0)<($panonopt_end|0)?$2:-$1|0)+$pos_025|0;$14=$nargv+($pos_1<<2)|0;$15=HEAP32[$14>>2]|0;HEAP32[$14>>2]=HEAP32[$11>>2];HEAP32[$11>>2]=$15;$17=$j_024+1|0;if(($17|0)<($5|0)){$j_024=$17;$pos_025=$pos_1;label=5;break}else{label=6;break};case 6:$19=$i_026+1|0;if(($19|0)<($3|0)){$i_026=$19;label=3;break}else{label=7;break};case 7:return}}function __Znwj($size){$size=$size|0;var $3=0,$6=0,$lpad_phi$0=0,$lpad_phi$1=0,$15=0,label=0;label=1;while(1)switch(label|0){case 1:label=2;break;case 2:$3=_malloc(($size|0)==0?1:$size)|0;if(($3|0)==0){label=3;break}else{label=10;break};case 3:$6=__ZSt15get_new_handlerv()|0;if(($6|0)==0){label=9;break}else{label=4;break};case 4:FUNCTION_TABLE_v[$6&63]();label=2;break;case 5:$lpad_phi$1=0;$lpad_phi$0=0;label=7;break;case 6:$lpad_phi$1=0;$lpad_phi$0=0;label=7;break;case 7:if(($lpad_phi$1|0)<0){label=8;break}else{label=11;break};case 8:___cxa_call_unexpected($lpad_phi$0|0);return 0;case 9:$15=___cxa_allocate_exception(4)|0;__ZNSt9bad_allocC2Ev($15);___cxa_throw($15|0,43128,44);label=12;break;case 10:return $3|0;case 11:abort();case 12:return 0}return 0}function __ZnwjRKSt9nothrow_t($size,$0){$size=$size|0;$0=$0|0;var $p_0=0,label=0;label=1;while(1)switch(label|0){case 1:$p_0=__Znwj($size)|0;label=3;break;case 2:___cxa_begin_catch(0)|0;___cxa_end_catch();$p_0=0;label=3;break;case 3:return $p_0|0;case 4:___cxa_call_unexpected(0);return 0}return 0}function __Znaj($size){$size=$size|0;var label=0;label=1;while(1)switch(label|0){case 1:label=2;break;case 2:return __Znwj($size)|0;case 3:if(0<0){label=4;break}else{label=5;break};case 4:___cxa_call_unexpected(0);return 0;case 5:abort()}return 0}function __ZnajRKSt9nothrow_t($size,$0){$size=$size|0;$0=$0|0;var $p_0=0,label=0;label=1;while(1)switch(label|0){case 1:$p_0=__Znaj($size)|0;label=3;break;case 2:___cxa_begin_catch(0)|0;___cxa_end_catch();$p_0=0;label=3;break;case 3:return $p_0|0;case 4:___cxa_call_unexpected(0);return 0}return 0}function __ZSt17__throw_bad_allocv(){var $1=0;$1=___cxa_allocate_exception(4)|0;__ZNSt9bad_allocC2Ev($1);___cxa_throw($1|0,43128,44)}function _gcd54($a,$b){$a=$a|0;$b=$b|0;var $1=0,$c_07=0,$_06=0,$3=0,$_0_lcssa=0,label=0;label=1;while(1)switch(label|0){case 1:$1=($a|0)%($b|0)&-1;if(($1|0)==0){$_0_lcssa=$b;label=3;break}else{$_06=$b;$c_07=$1;label=2;break};case 2:$3=($_06|0)%($c_07|0)&-1;if(($3|0)==0){$_0_lcssa=$c_07;label=3;break}else{$_06=$c_07;$c_07=$3;label=2;break};case 3:return $_0_lcssa|0}return 0}function _parse_long_options($nargv,$options,$long_options,$idx,$short_too){$nargv=$nargv|0;$options=$options|0;$long_options=$long_options|0;$idx=$idx|0;$short_too=$short_too|0;var $1=0,$4=0,$has_equal_0=0,$current_argv_len_0=0,$15=0,$20=0,$match_066=0,$i_065=0,$match_1=0,$38=0,$40=0,$match_2=0,$44=0,$45=0,$47=0,$storemerge62=0,$72=0,$storemerge=0,$118=0,$121=0,$_0=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;label=1;while(1)switch(label|0){case 1:$1=HEAP32[8698]|0;HEAP32[8704]=(HEAP32[8704]|0)+1;$4=_strchr($1|0,61)|0;if(($4|0)==0){label=3;break}else{label=2;break};case 2:$current_argv_len_0=$4-$1|0;$has_equal_0=$4+1|0;label=4;break;case 3:$current_argv_len_0=_strlen($1|0)|0;$has_equal_0=0;label=4;break;case 4:$15=HEAP32[$long_options>>2]|0;if(($15|0)==0){label=35;break}else{label=5;break};case 5:$i_065=0;$match_066=-1;$20=$15;label=6;break;case 6:if((_strncmp($1|0,$20|0,$current_argv_len_0|0)|0)==0){label=7;break}else{$match_1=$match_066;label=14;break};case 7:if((_strlen($20|0)|0)==($current_argv_len_0|0)){$match_2=$i_065;label=15;break}else{label=8;break};case 8:if(($short_too|0)!=0&($current_argv_len_0|0)==1){$match_1=$match_066;label=14;break}else{label=9;break};case 9:if(($match_066|0)==-1){$match_1=$i_065;label=14;break}else{label=10;break};case 10:if((HEAP32[8706]|0)==0){label=13;break}else{label=11;break};case 11:if((HEAP8[$options]|0)==58){label=13;break}else{label=12;break};case 12:__warnx(41360,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=$current_argv_len_0,HEAP32[tempInt+8>>2]=$1,tempInt)|0);label=13;break;case 13:HEAP32[8702]=0;$_0=63;label=45;break;case 14:$38=$i_065+1|0;$40=HEAP32[$long_options+($38<<4)>>2]|0;if(($40|0)==0){$match_2=$match_1;label=15;break}else{$i_065=$38;$match_066=$match_1;$20=$40;label=6;break};case 15:if(($match_2|0)==-1){label=35;break}else{label=16;break};case 16:$44=$long_options+($match_2<<4)+4|0;$45=HEAP32[$44>>2]|0;$47=($has_equal_0|0)==0;if(($45|0)!=0|$47){label=23;break}else{label=17;break};case 17:if((HEAP32[8706]|0)==0){label=20;break}else{label=18;break};case 18:if((HEAP8[$options]|0)==58){label=20;break}else{label=19;break};case 19:__warnx(35024,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=$current_argv_len_0,HEAP32[tempInt+8>>2]=$1,tempInt)|0);label=20;break;case 20:if((HEAP32[$long_options+($match_2<<4)+8>>2]|0)==0){label=21;break}else{$storemerge62=0;label=22;break};case 21:$storemerge62=HEAP32[$long_options+($match_2<<4)+12>>2]|0;label=22;break;case 22:HEAP32[8702]=$storemerge62;$_0=(HEAP8[$options]|0)==58?58:63;label=45;break;case 23:if(($45-1|0)>>>0<2){label=24;break}else{label=28;break};case 24:if($47){label=26;break}else{label=25;break};case 25:HEAP32[8708]=$has_equal_0;label=28;break;case 26:if(($45|0)==1){label=27;break}else{label=28;break};case 27:$72=HEAP32[8704]|0;HEAP32[8704]=$72+1;HEAP32[8708]=HEAP32[$nargv+($72<<2)>>2];label=28;break;case 28:if((HEAP32[$44>>2]|0)==1&(HEAP32[8708]|0)==0){label=29;break}else{label=41;break};case 29:if((HEAP32[8706]|0)==0){label=32;break}else{label=30;break};case 30:if((HEAP8[$options]|0)==58){label=32;break}else{label=31;break};case 31:__warnx(34408,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$1,tempInt)|0);label=32;break;case 32:if((HEAP32[$long_options+($match_2<<4)+8>>2]|0)==0){label=33;break}else{$storemerge=0;label=34;break};case 33:$storemerge=HEAP32[$long_options+($match_2<<4)+12>>2]|0;label=34;break;case 34:HEAP32[8702]=$storemerge;HEAP32[8704]=(HEAP32[8704]|0)-1;$_0=(HEAP8[$options]|0)==58?58:63;label=45;break;case 35:if(($short_too|0)==0){label=37;break}else{label=36;break};case 36:HEAP32[8704]=(HEAP32[8704]|0)-1;$_0=-1;label=45;break;case 37:if((HEAP32[8706]|0)==0){label=40;break}else{label=38;break};case 38:if((HEAP8[$options]|0)==58){label=40;break}else{label=39;break};case 39:__warnx(35888,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$1,tempInt)|0);label=40;break;case 40:HEAP32[8702]=0;$_0=63;label=45;break;case 41:if(($idx|0)==0){label=43;break}else{label=42;break};case 42:HEAP32[$idx>>2]=$match_2;label=43;break;case 43:$118=HEAP32[$long_options+($match_2<<4)+8>>2]|0;$121=HEAP32[$long_options+($match_2<<4)+12>>2]|0;if(($118|0)==0){$_0=$121;label=45;break}else{label=44;break};case 44:HEAP32[$118>>2]=$121;$_0=0;label=45;break;case 45:STACKTOP=__stackBase__;return $_0|0}return 0}function __warn($fmt,varrp){$fmt=$fmt|0;varrp=varrp|0;var $ap=0,$2=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+16|0;$ap=__stackBase__|0;$2=$ap;HEAP32[$2>>2]=varrp;HEAP32[$2+4>>2]=0;__vwarn($fmt,$ap|0);STACKTOP=__stackBase__;return}function __warnx($fmt,varrp){$fmt=$fmt|0;varrp=varrp|0;var $ap=0,$2=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+16|0;$ap=__stackBase__|0;$2=$ap;HEAP32[$2>>2]=varrp;HEAP32[$2+4>>2]=0;__vwarnx($fmt,$ap|0);STACKTOP=__stackBase__;return}function __vwarn($fmt,$ap){$fmt=$fmt|0;$ap=$ap|0;var $2=0,$4=0,$13=0,$14=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;label=1;while(1)switch(label|0){case 1:$2=HEAP32[(___errno_location()|0)>>2]|0;$4=HEAP32[___progname>>2]|0;_fprintf(HEAP32[_stderr>>2]|0,41872,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$4,tempInt)|0)|0;if(($fmt|0)==0){label=3;break}else{label=2;break};case 2:_vfprintf(HEAP32[_stderr>>2]|0,$fmt|0,$ap|0)|0;_fwrite(42184,2,1,HEAP32[_stderr>>2]|0)|0;label=3;break;case 3:$13=HEAP32[_stderr>>2]|0;$14=_strerror($2|0)|0;_fprintf($13|0,41720,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$14,tempInt)|0)|0;STACKTOP=__stackBase__;return}}function __vwarnx($fmt,$ap){$fmt=$fmt|0;$ap=$ap|0;var $2=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;label=1;while(1)switch(label|0){case 1:$2=HEAP32[___progname>>2]|0;_fprintf(HEAP32[_stderr>>2]|0,41696,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$2,tempInt)|0)|0;if(($fmt|0)==0){label=3;break}else{label=2;break};case 2:_vfprintf(HEAP32[_stderr>>2]|0,$fmt|0,$ap|0)|0;label=3;break;case 3:_fputc(10,HEAP32[_stderr>>2]|0)|0;STACKTOP=__stackBase__;return}}function _strtod($string,$endPtr){$string=$string|0;$endPtr=$endPtr|0;var $p_0=0,$8=0,$sign_0=0,$p_2=0,$p_3=0,$mantSize_0=0,$decPt_0=0,$15=0,$decPt_1=0,$25=0,$26=0,$mantSize_1=0,$28=0,$fracExp_0=0,$mantSize_2=0,$p_4_lcssa99=0,$mantSize_3_lcssa98=0,$frac1_0_lcssa97=0.0,$frac1_085=0,$mantSize_384=0,$p_483=0,$33=0,$34=0,$p_5=0,$c_0_in=0,$42=0,$43=0,$frac2_078=0,$mantSize_477=0,$p_676=0,$46=0,$47=0,$p_7=0,$c_1_in=0,$55=0,$56=0,$frac1_0_lcssa96=0.0,$frac2_0_lcssa=0.0,$59=0.0,$60=0,$62=0,$63=0,$expSign_0_ph=0,$p_9_ph=0,$exp_071=0,$p_970=0,$74=0,$75=0,$expSign_1=0,$p_10=0,$exp_1=0,$exp_2=0,$exp_3=0,$exp_566=0,$d_065=0,$dblExp_064=0.0,$dblExp_1=0.0,$91=0,$dblExp_0_lcssa=0.0,$fraction_0=0.0,$p_11=0,$_0=0.0,label=0;label=1;while(1)switch(label|0){case 1:$p_0=$string;label=2;break;case 2:if((_isspace(HEAP8[$p_0]|0)|0)==0){label=3;break}else{$p_0=$p_0+1|0;label=2;break};case 3:$8=HEAP8[$p_0]|0;if(($8<<24>>24|0)==45){label=4;break}else if(($8<<24>>24|0)==43){label=5;break}else{$p_2=$p_0;$sign_0=0;label=6;break};case 4:$p_2=$p_0+1|0;$sign_0=1;label=6;break;case 5:$p_2=$p_0+1|0;$sign_0=0;label=6;break;case 6:$decPt_0=-1;$mantSize_0=0;$p_3=$p_2;label=7;break;case 7:$15=HEAP8[$p_3]|0;if((($15<<24>>24)-48|0)>>>0<10){$decPt_1=$decPt_0;label=9;break}else{label=8;break};case 8:if($15<<24>>24!=46|($decPt_0|0)>-1){label=10;break}else{$decPt_1=$mantSize_0;label=9;break};case 9:$decPt_0=$decPt_1;$mantSize_0=$mantSize_0+1|0;$p_3=$p_3+1|0;label=7;break;case 10:$25=$p_3+(-$mantSize_0|0)|0;$26=($decPt_0|0)<0;$mantSize_1=(($26^1)<<31>>31)+$mantSize_0|0;$28=($mantSize_1|0)>18;$fracExp_0=($28?-18:-$mantSize_1|0)+($26?$mantSize_0:$decPt_0)|0;$mantSize_2=$28?18:$mantSize_1;if(($mantSize_2|0)==0){$p_11=$string;$fraction_0=0.0;label=37;break}else{label=11;break};case 11:if(($mantSize_2|0)>9){$p_483=$25;$mantSize_384=$mantSize_2;$frac1_085=0;label=15;break}else{label=13;break};case 12:$frac1_0_lcssa97=+($42|0)*1.0e9;$mantSize_3_lcssa98=9;$p_4_lcssa99=$p_5;label=14;break;case 13:if(($mantSize_2|0)>0){$frac1_0_lcssa97=0.0;$mantSize_3_lcssa98=$mantSize_2;$p_4_lcssa99=$25;label=14;break}else{$frac2_0_lcssa=0.0;$frac1_0_lcssa96=0.0;label=22;break};case 14:$p_676=$p_4_lcssa99;$mantSize_477=$mantSize_3_lcssa98;$frac2_078=0;label=18;break;case 15:$33=HEAP8[$p_483]|0;$34=$p_483+1|0;if($33<<24>>24==46){label=16;break}else{$c_0_in=$33;$p_5=$34;label=17;break};case 16:$c_0_in=HEAP8[$34]|0;$p_5=$p_483+2|0;label=17;break;case 17:$42=($frac1_085*10&-1)-48+($c_0_in<<24>>24)|0;$43=$mantSize_384-1|0;if(($43|0)>9){$p_483=$p_5;$mantSize_384=$43;$frac1_085=$42;label=15;break}else{label=12;break};case 18:$46=HEAP8[$p_676]|0;$47=$p_676+1|0;if($46<<24>>24==46){label=19;break}else{$c_1_in=$46;$p_7=$47;label=20;break};case 19:$c_1_in=HEAP8[$47]|0;$p_7=$p_676+2|0;label=20;break;case 20:$55=($frac2_078*10&-1)-48+($c_1_in<<24>>24)|0;$56=$mantSize_477-1|0;if(($56|0)>0){$p_676=$p_7;$mantSize_477=$56;$frac2_078=$55;label=18;break}else{label=21;break};case 21:$frac2_0_lcssa=+($55|0);$frac1_0_lcssa96=$frac1_0_lcssa97;label=22;break;case 22:$59=$frac1_0_lcssa96+$frac2_0_lcssa;$60=HEAP8[$p_3]|0;if(($60<<24>>24|0)==69|($60<<24>>24|0)==101){label=23;break}else{$exp_1=0;$p_10=$p_3;$expSign_1=0;label=28;break};case 23:$62=$p_3+1|0;$63=HEAP8[$62]|0;if(($63<<24>>24|0)==45){label=24;break}else if(($63<<24>>24|0)==43){label=25;break}else{$p_9_ph=$62;$expSign_0_ph=0;label=26;break};case 24:$p_9_ph=$p_3+2|0;$expSign_0_ph=1;label=26;break;case 25:$p_9_ph=$p_3+2|0;$expSign_0_ph=0;label=26;break;case 26:if(((HEAP8[$p_9_ph]|0)-48|0)>>>0<10){$p_970=$p_9_ph;$exp_071=0;label=27;break}else{$exp_1=0;$p_10=$p_9_ph;$expSign_1=$expSign_0_ph;label=28;break};case 27:$74=($exp_071*10&-1)-48+(HEAP8[$p_970]|0)|0;$75=$p_970+1|0;if(((HEAP8[$75]|0)-48|0)>>>0<10){$p_970=$75;$exp_071=$74;label=27;break}else{$exp_1=$74;$p_10=$75;$expSign_1=$expSign_0_ph;label=28;break};case 28:$exp_2=$fracExp_0+(($expSign_1|0)==0?$exp_1:-$exp_1|0)|0;$exp_3=($exp_2|0)<0?-$exp_2|0:$exp_2;if(($exp_3|0)>511){label=29;break}else{label=30;break};case 29:HEAP32[(___errno_location()|0)>>2]=34;$dblExp_064=1.0;$d_065=34720;$exp_566=511;label=31;break;case 30:if(($exp_3|0)==0){$dblExp_0_lcssa=1.0;label=34;break}else{$dblExp_064=1.0;$d_065=34720;$exp_566=$exp_3;label=31;break};case 31:if(($exp_566&1|0)==0){$dblExp_1=$dblExp_064;label=33;break}else{label=32;break};case 32:$dblExp_1=$dblExp_064*+HEAPF64[$d_065>>3];label=33;break;case 33:$91=$exp_566>>1;if(($91|0)==0){$dblExp_0_lcssa=$dblExp_1;label=34;break}else{$dblExp_064=$dblExp_1;$d_065=$d_065+8|0;$exp_566=$91;label=31;break};case 34:if(($exp_2|0)>-1){label=36;break}else{label=35;break};case 35:$p_11=$p_10;$fraction_0=$59/$dblExp_0_lcssa;label=37;break;case 36:$p_11=$p_10;$fraction_0=$59*$dblExp_0_lcssa;label=37;break;case 37:if(($endPtr|0)==0){label=39;break}else{label=38;break};case 38:HEAP32[$endPtr>>2]=$p_11;label=39;break;case 39:if(($sign_0|0)==0){$_0=$fraction_0;label=41;break}else{label=40;break};case 40:$_0=-0.0-$fraction_0;label=41;break;case 41:return+$_0}return 0.0}function _strtold($nptr,$endptr){$nptr=$nptr|0;$endptr=$endptr|0;return+(+_strtod($nptr,$endptr))}function _strtof($nptr,$endptr){$nptr=$nptr|0;$endptr=$endptr|0;return+(+_strtod($nptr,$endptr))}function _strtod_l($nptr,$endptr,$loc){$nptr=$nptr|0;$endptr=$endptr|0;$loc=$loc|0;return+(+_strtod($nptr,$endptr))}function _strtold_l($nptr,$endptr,$loc){$nptr=$nptr|0;$endptr=$endptr|0;$loc=$loc|0;return+(+_strtold($nptr,$endptr))}function _atof($str){$str=$str|0;return+(+_strtod($str,0))}function __err($eval,$fmt,varrp){$eval=$eval|0;$fmt=$fmt|0;varrp=varrp|0;var $ap=0,$2=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+16|0;$ap=__stackBase__|0;$2=$ap;HEAP32[$2>>2]=varrp;HEAP32[$2+4>>2]=0;__verr($eval,$fmt,$ap|0)}function __errx($eval,$fmt,varrp){$eval=$eval|0;$fmt=$fmt|0;varrp=varrp|0;var $ap=0,$2=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+16|0;$ap=__stackBase__|0;$2=$ap;HEAP32[$2>>2]=varrp;HEAP32[$2+4>>2]=0;__verrx($eval,$fmt,$ap|0)}function __verr($eval,$fmt,$ap){$eval=$eval|0;$fmt=$fmt|0;$ap=$ap|0;var $2=0,$4=0,$13=0,$14=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[(___errno_location()|0)>>2]|0;$4=HEAP32[___progname>>2]|0;_fprintf(HEAP32[_stderr>>2]|0,42296,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$4,tempInt)|0)|0;if(($fmt|0)==0){label=3;break}else{label=2;break};case 2:_vfprintf(HEAP32[_stderr>>2]|0,$fmt|0,$ap|0)|0;_fwrite(42264,2,1,HEAP32[_stderr>>2]|0)|0;label=3;break;case 3:$13=HEAP32[_stderr>>2]|0;$14=_strerror($2|0)|0;_fprintf($13|0,41760,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$14,tempInt)|0)|0;_exit($eval|0)}}function __verrx($eval,$fmt,$ap){$eval=$eval|0;$fmt=$fmt|0;$ap=$ap|0;var $2=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[___progname>>2]|0;_fprintf(HEAP32[_stderr>>2]|0,42024,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$2,tempInt)|0)|0;if(($fmt|0)==0){label=3;break}else{label=2;break};case 2:_vfprintf(HEAP32[_stderr>>2]|0,$fmt|0,$ap|0)|0;label=3;break;case 3:_fputc(10,HEAP32[_stderr>>2]|0)|0;_exit($eval|0)}}function _memcpy(dest,src,num){dest=dest|0;src=src|0;num=num|0;var ret=0;ret=dest|0;if((dest&3)==(src&3)){while(dest&3){if((num|0)==0)return ret|0;HEAP8[dest]=HEAP8[src]|0;dest=dest+1|0;src=src+1|0;num=num-1|0}while((num|0)>=4){HEAP32[dest>>2]=HEAP32[src>>2];dest=dest+4|0;src=src+4|0;num=num-4|0}}while((num|0)>0){HEAP8[dest]=HEAP8[src]|0;dest=dest+1|0;src=src+1|0;num=num-1|0}return ret|0}function _memmove(dest,src,num){dest=dest|0;src=src|0;num=num|0;if((src|0)<(dest|0)&(dest|0)<(src+num|0)){src=src+num|0;dest=dest+num|0;while((num|0)>0){dest=dest-1|0;src=src-1|0;num=num-1|0;HEAP8[dest]=HEAP8[src]|0}}else{_memcpy(dest,src,num)|0}}function _strlen(ptr){ptr=ptr|0;var curr=0;curr=ptr;while(HEAP8[curr]|0){curr=curr+1|0}return curr-ptr|0}function _memset(ptr,value,num){ptr=ptr|0;value=value|0;num=num|0;var stop=0,value4=0,stop4=0,unaligned=0;stop=ptr+num|0;if((num|0)>=20){value=value&255;unaligned=ptr&3;value4=value|value<<8|value<<16|value<<24;stop4=stop&~3;if(unaligned){unaligned=ptr+4-unaligned|0;while((ptr|0)<(unaligned|0)){HEAP8[ptr]=value;ptr=ptr+1|0}}while((ptr|0)<(stop4|0)){HEAP32[ptr>>2]=value4;ptr=ptr+4|0}}while((ptr|0)<(stop|0)){HEAP8[ptr]=value;ptr=ptr+1|0}}function dynCall_ii(index,a1){index=index|0;a1=a1|0;return FUNCTION_TABLE_ii[index&63](a1|0)|0}function dynCall_vi(index,a1){index=index|0;a1=a1|0;FUNCTION_TABLE_vi[index&63](a1|0)}function dynCall_vii(index,a1,a2){index=index|0;a1=a1|0;a2=a2|0;FUNCTION_TABLE_vii[index&63](a1|0,a2|0)}function dynCall_iiii(index,a1,a2,a3){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;return FUNCTION_TABLE_iiii[index&63](a1|0,a2|0,a3|0)|0}function dynCall_viii(index,a1,a2,a3){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;FUNCTION_TABLE_viii[index&63](a1|0,a2|0,a3|0)}function dynCall_v(index){index=index|0;FUNCTION_TABLE_v[index&63]()}function dynCall_iii(index,a1,a2){index=index|0;a1=a1|0;a2=a2|0;return FUNCTION_TABLE_iii[index&63](a1|0,a2|0)|0}function dynCall_viiii(index,a1,a2,a3,a4){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;a4=a4|0;FUNCTION_TABLE_viiii[index&63](a1|0,a2|0,a3|0,a4|0)}function b0(p0){p0=p0|0;abort(0);return 0}function b1(p0){p0=p0|0;abort(1)}function b2(p0,p1){p0=p0|0;p1=p1|0;abort(2)}function b3(p0,p1,p2){p0=p0|0;p1=p1|0;p2=p2|0;abort(3);return 0}function b4(p0,p1,p2){p0=p0|0;p1=p1|0;p2=p2|0;abort(4)}function b5(){abort(5)}function b6(p0,p1){p0=p0|0;p1=p1|0;abort(6);return 0}function b7(p0,p1,p2,p3){p0=p0|0;p1=p1|0;p2=p2|0;p3=p3|0;abort(7)}
// EMSCRIPTEN_END_FUNCS
  var FUNCTION_TABLE_ii = [b0,b0,b0,b0,b0,b0,_run_async,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,__ZNKSt9bad_alloc4whatEv,b0,b0,b0,_run_sync,b0,b0
  ,b0,b0,b0,__ZNKSt9exception4whatEv,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,__ZNKSt20bad_array_new_length4whatEv,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0];
  var FUNCTION_TABLE_vi = [b1,b1,b1,b1,b1,b1,b1,b1,__ZNSt9bad_allocC2Ev,b1,__ZNSt9bad_allocD0Ev
  ,b1,__ZNSt20bad_array_new_lengthD0Ev,b1,b1,b1,b1,b1,b1,b1,b1
  ,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1
  ,b1,b1,b1,b1,b1,__ZNSt9exceptionD1Ev,b1,__ZNSt9exceptionD0Ev,b1,__ZNSt20bad_array_new_lengthC2Ev,b1,b1,b1,__ZNSt9bad_allocD2Ev,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1];
  var FUNCTION_TABLE_vii = [b2,b2,b2,b2,__warn,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,__vwarnx
  ,b2,__vwarn,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,__warnx,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2];
  var FUNCTION_TABLE_iiii = [b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,_error_default,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3];
  var FUNCTION_TABLE_viii = [b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,__errx,b4,b4,b4,__verrx,b4,b4
  ,b4,b4,b4,b4,b4,__verr,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,__err,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4];
  var FUNCTION_TABLE_v = [b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5];
  var FUNCTION_TABLE_iii = [b6,b6,_mad_layer_II,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,_mad_layer_I
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,_mad_layer_III,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6];
  var FUNCTION_TABLE_viiii = [b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,_synth_half,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,_synth_full,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7];
  return { _strlen: _strlen, _free: _free, _realloc: _realloc, _memmove: _memmove, _memset: _memset, _malloc: _malloc, _memcpy: _memcpy, _calloc: _calloc, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, setTempRet1: setTempRet1, setTempRet2: setTempRet2, setTempRet3: setTempRet3, setTempRet4: setTempRet4, setTempRet5: setTempRet5, setTempRet6: setTempRet6, setTempRet7: setTempRet7, setTempRet8: setTempRet8, setTempRet9: setTempRet9, dynCall_ii: dynCall_ii, dynCall_vi: dynCall_vi, dynCall_vii: dynCall_vii, dynCall_iiii: dynCall_iiii, dynCall_viii: dynCall_viii, dynCall_v: dynCall_v, dynCall_iii: dynCall_iii, dynCall_viiii: dynCall_viiii };
})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_ii": invoke_ii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iiii": invoke_iiii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_iii": invoke_iii, "invoke_viiii": invoke_viiii, "_strncmp": _strncmp, "_fork": _fork, "_snprintf": _snprintf, "___cxa_free_exception": ___cxa_free_exception, "___cxa_throw": ___cxa_throw, "_strerror": _strerror, "_abort": _abort, "_fprintf": _fprintf, "___cxa_end_catch": ___cxa_end_catch, "_close": _close, "_pread": _pread, "___buildEnvironment": ___buildEnvironment, "_strchr": _strchr, "_fputc": _fputc, "_sysconf": _sysconf, "___setErrNo": ___setErrNo, "__reallyNegative": __reallyNegative, "_llvm_eh_exception": _llvm_eh_exception, "_write": _write, "_exit": _exit, "_sprintf": _sprintf, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "___cxa_allocate_exception": ___cxa_allocate_exception, "_isspace": _isspace, "_fcntl": _fcntl, "_read": _read, "___cxa_is_number_type": ___cxa_is_number_type, "_time": _time, "__formatString": __formatString, "___cxa_does_inherit": ___cxa_does_inherit, "_getenv": _getenv, "_vfprintf": _vfprintf, "___cxa_begin_catch": ___cxa_begin_catch, "_llvm_va_end": _llvm_va_end, "___assert_func": ___assert_func, "_wait": _wait, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "_pwrite": _pwrite, "_recv": _recv, "___cxa_call_unexpected": ___cxa_call_unexpected, "_sbrk": _sbrk, "_strerror_r": _strerror_r, "___errno_location": ___errno_location, "___gxx_personality_v0": ___gxx_personality_v0, "_pipe": _pipe, "_fwrite": _fwrite, "__exit": __exit, "___resumeException": ___resumeException, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity, "__ZTVN10__cxxabiv120__si_class_type_infoE": __ZTVN10__cxxabiv120__si_class_type_infoE, "_stderr": _stderr, "__ZTVN10__cxxabiv117__class_type_infoE": __ZTVN10__cxxabiv117__class_type_infoE, "___progname": ___progname }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _calloc = Module["_calloc"] = asm["_calloc"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
Module['callMain'] = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(!Module['preRun'] || Module['preRun'].length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  var ret;
  var initialStackTop = STACKTOP;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e.name == 'ExitStatus') {
      return e.status;
    } else if (e == 'SimulateInfiniteLoop') {
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    STACKTOP = initialStackTop;
  }
  return ret;
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    var ret = 0;
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      ret = Module['callMain'](args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
  // {{MODULE_ADDITIONS}}
// libmad function wrappers
var isNode = typeof process === "object" && typeof require === "function";
Mad = {};
if (isNode) {
  module.exports = Mad;
}
return Mad;
}).call(context)})();
