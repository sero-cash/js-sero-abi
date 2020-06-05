(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Web3EthAbi = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

exports.byteLength = byteLength;
exports.toByteArray = toByteArray;
exports.fromByteArray = fromByteArray;
var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i];
  revLookup[code.charCodeAt(i)] = i;
} // Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications


revLookup['-'.charCodeAt(0)] = 62;
revLookup['_'.charCodeAt(0)] = 63;

function getLens(b64) {
  var len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4');
  } // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42


  var validLen = b64.indexOf('=');
  if (validLen === -1) validLen = len;
  var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
  return [validLen, placeHoldersLen];
} // base64 is 4/3 + up to two characters of the original data


function byteLength(b64) {
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}

function _byteLength(b64, validLen, placeHoldersLen) {
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}

function toByteArray(b64) {
  var tmp;
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
  var curByte = 0; // if there are placeholders, only get up to the last complete 4 chars

  var len = placeHoldersLen > 0 ? validLen - 4 : validLen;

  for (var i = 0; i < len; i += 4) {
    tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
    arr[curByte++] = tmp >> 16 & 0xFF;
    arr[curByte++] = tmp >> 8 & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }

  if (placeHoldersLen === 2) {
    tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
    arr[curByte++] = tmp & 0xFF;
  }

  if (placeHoldersLen === 1) {
    tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
    arr[curByte++] = tmp >> 8 & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }

  return arr;
}

function tripletToBase64(num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
}

function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];

  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16 & 0xFF0000) + (uint8[i + 1] << 8 & 0xFF00) + (uint8[i + 2] & 0xFF);
    output.push(tripletToBase64(tmp));
  }

  return output.join('');
}

function fromByteArray(uint8) {
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes

  var parts = [];
  var maxChunkLength = 16383; // must be multiple of 3
  // go through the array every three bytes, we'll deal with trailing stuff later

  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
  } // pad the end with zeros, but make sure to not forget the extra bytes


  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 0x3F] + '==');
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 0x3F] + lookup[tmp << 2 & 0x3F] + '=');
  }

  return parts.join('');
}

},{}],2:[function(require,module,exports){
"use strict";

},{}],3:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

/* eslint-disable no-proto */
'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var base64 = require('base64-js');

var ieee754 = require('ieee754');

exports.Buffer = Buffer;
exports.SlowBuffer = SlowBuffer;
exports.INSPECT_MAX_BYTES = 50;
var K_MAX_LENGTH = 0x7fffffff;
exports.kMaxLength = K_MAX_LENGTH;
/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */

Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' && typeof console.error === 'function') {
  console.error('This browser lacks typed array (Uint8Array) support which is required by ' + '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.');
}

function typedArraySupport() {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1);
    arr.__proto__ = {
      __proto__: Uint8Array.prototype,
      foo: function foo() {
        return 42;
      }
    };
    return arr.foo() === 42;
  } catch (e) {
    return false;
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function get() {
    if (!Buffer.isBuffer(this)) return undefined;
    return this.buffer;
  }
});
Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function get() {
    if (!Buffer.isBuffer(this)) return undefined;
    return this.byteOffset;
  }
});

function createBuffer(length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"');
  } // Return an augmented `Uint8Array` instance


  var buf = new Uint8Array(length);
  buf.__proto__ = Buffer.prototype;
  return buf;
}
/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */


function Buffer(arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError('The "string" argument must be of type string. Received type number');
    }

    return allocUnsafe(arg);
  }

  return from(arg, encodingOrOffset, length);
} // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97


if (typeof Symbol !== 'undefined' && Symbol.species != null && Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  });
}

Buffer.poolSize = 8192; // not used by this implementation

function from(value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset);
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value);
  }

  if (value == null) {
    throw TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + _typeof(value));
  }

  if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
    return fromArrayBuffer(value, encodingOrOffset, length);
  }

  if (typeof value === 'number') {
    throw new TypeError('The "value" argument must not be of type number. Received type number');
  }

  var valueOf = value.valueOf && value.valueOf();

  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length);
  }

  var b = fromObject(value);
  if (b) return b;

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length);
  }

  throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + _typeof(value));
}
/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/


Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length);
}; // Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148


Buffer.prototype.__proto__ = Uint8Array.prototype;
Buffer.__proto__ = Uint8Array;

function assertSize(size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number');
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"');
  }
}

function alloc(size, fill, encoding) {
  assertSize(size);

  if (size <= 0) {
    return createBuffer(size);
  }

  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string' ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
  }

  return createBuffer(size);
}
/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/


Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding);
};

function allocUnsafe(size) {
  assertSize(size);
  return createBuffer(size < 0 ? 0 : checked(size) | 0);
}
/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */


Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size);
};
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */


Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size);
};

function fromString(string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8';
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding);
  }

  var length = byteLength(string, encoding) | 0;
  var buf = createBuffer(length);
  var actual = buf.write(string, encoding);

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual);
  }

  return buf;
}

function fromArrayLike(array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0;
  var buf = createBuffer(length);

  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255;
  }

  return buf;
}

function fromArrayBuffer(array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds');
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds');
  }

  var buf;

  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array);
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset);
  } else {
    buf = new Uint8Array(array, byteOffset, length);
  } // Return an augmented `Uint8Array` instance


  buf.__proto__ = Buffer.prototype;
  return buf;
}

function fromObject(obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0;
    var buf = createBuffer(len);

    if (buf.length === 0) {
      return buf;
    }

    obj.copy(buf, 0, 0, len);
    return buf;
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0);
    }

    return fromArrayLike(obj);
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data);
  }
}

function checked(length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes');
  }

  return length | 0;
}

function SlowBuffer(length) {
  if (+length != length) {
    // eslint-disable-line eqeqeq
    length = 0;
  }

  return Buffer.alloc(+length);
}

Buffer.isBuffer = function isBuffer(b) {
  return b != null && b._isBuffer === true && b !== Buffer.prototype; // so Buffer.isBuffer(Buffer.prototype) will be false
};

Buffer.compare = function compare(a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);

  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
  }

  if (a === b) return 0;
  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
};

Buffer.isEncoding = function isEncoding(encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true;

    default:
      return false;
  }
};

Buffer.concat = function concat(list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers');
  }

  if (list.length === 0) {
    return Buffer.alloc(0);
  }

  var i;

  if (length === undefined) {
    length = 0;

    for (i = 0; i < list.length; ++i) {
      length += list[i].length;
    }
  }

  var buffer = Buffer.allocUnsafe(length);
  var pos = 0;

  for (i = 0; i < list.length; ++i) {
    var buf = list[i];

    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf);
    }

    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers');
    }

    buf.copy(buffer, pos);
    pos += buf.length;
  }

  return buffer;
};

function byteLength(string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length;
  }

  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength;
  }

  if (typeof string !== 'string') {
    throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' + 'Received type ' + _typeof(string));
  }

  var len = string.length;
  var mustMatch = arguments.length > 2 && arguments[2] === true;
  if (!mustMatch && len === 0) return 0; // Use a for loop to avoid recursion

  var loweredCase = false;

  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len;

      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length;

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2;

      case 'hex':
        return len >>> 1;

      case 'base64':
        return base64ToBytes(string).length;

      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length; // assume utf8
        }

        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}

Buffer.byteLength = byteLength;

function slowToString(encoding, start, end) {
  var loweredCase = false; // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.
  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.

  if (start === undefined || start < 0) {
    start = 0;
  } // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.


  if (start > this.length) {
    return '';
  }

  if (end === undefined || end > this.length) {
    end = this.length;
  }

  if (end <= 0) {
    return '';
  } // Force coersion to uint32. This will also coerce falsey/NaN values to 0.


  end >>>= 0;
  start >>>= 0;

  if (end <= start) {
    return '';
  }

  if (!encoding) encoding = 'utf8';

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end);

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end);

      case 'ascii':
        return asciiSlice(this, start, end);

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end);

      case 'base64':
        return base64Slice(this, start, end);

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end);

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
        encoding = (encoding + '').toLowerCase();
        loweredCase = true;
    }
  }
} // This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154


Buffer.prototype._isBuffer = true;

function swap(b, n, m) {
  var i = b[n];
  b[n] = b[m];
  b[m] = i;
}

Buffer.prototype.swap16 = function swap16() {
  var len = this.length;

  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits');
  }

  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1);
  }

  return this;
};

Buffer.prototype.swap32 = function swap32() {
  var len = this.length;

  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits');
  }

  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3);
    swap(this, i + 1, i + 2);
  }

  return this;
};

Buffer.prototype.swap64 = function swap64() {
  var len = this.length;

  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits');
  }

  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7);
    swap(this, i + 1, i + 6);
    swap(this, i + 2, i + 5);
    swap(this, i + 3, i + 4);
  }

  return this;
};

Buffer.prototype.toString = function toString() {
  var length = this.length;
  if (length === 0) return '';
  if (arguments.length === 0) return utf8Slice(this, 0, length);
  return slowToString.apply(this, arguments);
};

Buffer.prototype.toLocaleString = Buffer.prototype.toString;

Buffer.prototype.equals = function equals(b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer');
  if (this === b) return true;
  return Buffer.compare(this, b) === 0;
};

Buffer.prototype.inspect = function inspect() {
  var str = '';
  var max = exports.INSPECT_MAX_BYTES;
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim();
  if (this.length > max) str += ' ... ';
  return '<Buffer ' + str + '>';
};

Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength);
  }

  if (!Buffer.isBuffer(target)) {
    throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. ' + 'Received type ' + _typeof(target));
  }

  if (start === undefined) {
    start = 0;
  }

  if (end === undefined) {
    end = target ? target.length : 0;
  }

  if (thisStart === undefined) {
    thisStart = 0;
  }

  if (thisEnd === undefined) {
    thisEnd = this.length;
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index');
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0;
  }

  if (thisStart >= thisEnd) {
    return -1;
  }

  if (start >= end) {
    return 1;
  }

  start >>>= 0;
  end >>>= 0;
  thisStart >>>= 0;
  thisEnd >>>= 0;
  if (this === target) return 0;
  var x = thisEnd - thisStart;
  var y = end - start;
  var len = Math.min(x, y);
  var thisCopy = this.slice(thisStart, thisEnd);
  var targetCopy = target.slice(start, end);

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i];
      y = targetCopy[i];
      break;
    }
  }

  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
}; // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf


function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1; // Normalize byteOffset

  if (typeof byteOffset === 'string') {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff;
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000;
  }

  byteOffset = +byteOffset; // Coerce to Number.

  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : buffer.length - 1;
  } // Normalize byteOffset: negative offsets start from the end of the buffer


  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;

  if (byteOffset >= buffer.length) {
    if (dir) return -1;else byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0;else return -1;
  } // Normalize val


  if (typeof val === 'string') {
    val = Buffer.from(val, encoding);
  } // Finally, search either indexOf (if dir is true) or lastIndexOf


  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1;
    }

    return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
  } else if (typeof val === 'number') {
    val = val & 0xFF; // Search for a byte value [0-255]

    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
      }
    }

    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
  }

  throw new TypeError('val must be string, number or Buffer');
}

function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
  var indexSize = 1;
  var arrLength = arr.length;
  var valLength = val.length;

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase();

    if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1;
      }

      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }

  function read(buf, i) {
    if (indexSize === 1) {
      return buf[i];
    } else {
      return buf.readUInt16BE(i * indexSize);
    }
  }

  var i;

  if (dir) {
    var foundIndex = -1;

    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i;
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
      } else {
        if (foundIndex !== -1) i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;

    for (i = byteOffset; i >= 0; i--) {
      var found = true;

      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false;
          break;
        }
      }

      if (found) return i;
    }
  }

  return -1;
}

Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1;
};

Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
};

Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
};

function hexWrite(buf, string, offset, length) {
  offset = Number(offset) || 0;
  var remaining = buf.length - offset;

  if (!length) {
    length = remaining;
  } else {
    length = Number(length);

    if (length > remaining) {
      length = remaining;
    }
  }

  var strLen = string.length;

  if (length > strLen / 2) {
    length = strLen / 2;
  }

  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16);
    if (numberIsNaN(parsed)) return i;
    buf[offset + i] = parsed;
  }

  return i;
}

function utf8Write(buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
}

function asciiWrite(buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length);
}

function latin1Write(buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length);
}

function base64Write(buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length);
}

function ucs2Write(buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
}

Buffer.prototype.write = function write(string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8';
    length = this.length;
    offset = 0; // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset;
    length = this.length;
    offset = 0; // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0;

    if (isFinite(length)) {
      length = length >>> 0;
      if (encoding === undefined) encoding = 'utf8';
    } else {
      encoding = length;
      length = undefined;
    }
  } else {
    throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
  }

  var remaining = this.length - offset;
  if (length === undefined || length > remaining) length = remaining;

  if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds');
  }

  if (!encoding) encoding = 'utf8';
  var loweredCase = false;

  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length);

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length);

      case 'ascii':
        return asciiWrite(this, string, offset, length);

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length);

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length);

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length);

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
};

Buffer.prototype.toJSON = function toJSON() {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  };
};

function base64Slice(buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf);
  } else {
    return base64.fromByteArray(buf.slice(start, end));
  }
}

function utf8Slice(buf, start, end) {
  end = Math.min(buf.length, end);
  var res = [];
  var i = start;

  while (i < end) {
    var firstByte = buf[i];
    var codePoint = null;
    var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint;

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte;
          }

          break;

        case 2:
          secondByte = buf[i + 1];

          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;

            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint;
            }
          }

          break;

        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];

          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;

            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint;
            }
          }

          break;

        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];

          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;

            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint;
            }
          }

      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD;
      bytesPerSequence = 1;
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000;
      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
      codePoint = 0xDC00 | codePoint & 0x3FF;
    }

    res.push(codePoint);
    i += bytesPerSequence;
  }

  return decodeCodePointsArray(res);
} // Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety


var MAX_ARGUMENTS_LENGTH = 0x1000;

function decodeCodePointsArray(codePoints) {
  var len = codePoints.length;

  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
  } // Decode in chunks to avoid "call stack size exceeded".


  var res = '';
  var i = 0;

  while (i < len) {
    res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
  }

  return res;
}

function asciiSlice(buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F);
  }

  return ret;
}

function latin1Slice(buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }

  return ret;
}

function hexSlice(buf, start, end) {
  var len = buf.length;
  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;
  var out = '';

  for (var i = start; i < end; ++i) {
    out += toHex(buf[i]);
  }

  return out;
}

function utf16leSlice(buf, start, end) {
  var bytes = buf.slice(start, end);
  var res = '';

  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }

  return res;
}

Buffer.prototype.slice = function slice(start, end) {
  var len = this.length;
  start = ~~start;
  end = end === undefined ? len : ~~end;

  if (start < 0) {
    start += len;
    if (start < 0) start = 0;
  } else if (start > len) {
    start = len;
  }

  if (end < 0) {
    end += len;
    if (end < 0) end = 0;
  } else if (end > len) {
    end = len;
  }

  if (end < start) end = start;
  var newBuf = this.subarray(start, end); // Return an augmented `Uint8Array` instance

  newBuf.__proto__ = Buffer.prototype;
  return newBuf;
};
/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */


function checkOffset(offset, ext, length) {
  if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
}

Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);
  var val = this[offset];
  var mul = 1;
  var i = 0;

  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  return val;
};

Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;

  if (!noAssert) {
    checkOffset(offset, byteLength, this.length);
  }

  var val = this[offset + --byteLength];
  var mul = 1;

  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul;
  }

  return val;
};

Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 1, this.length);
  return this[offset];
};

Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] | this[offset + 1] << 8;
};

Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] << 8 | this[offset + 1];
};

Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
};

Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
};

Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);
  var val = this[offset];
  var mul = 1;
  var i = 0;

  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  mul *= 0x80;
  if (val >= mul) val -= Math.pow(2, 8 * byteLength);
  return val;
};

Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);
  var i = byteLength;
  var mul = 1;
  var val = this[offset + --i];

  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul;
  }

  mul *= 0x80;
  if (val >= mul) val -= Math.pow(2, 8 * byteLength);
  return val;
};

Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 1, this.length);
  if (!(this[offset] & 0x80)) return this[offset];
  return (0xff - this[offset] + 1) * -1;
};

Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset] | this[offset + 1] << 8;
  return val & 0x8000 ? val | 0xFFFF0000 : val;
};

Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset + 1] | this[offset] << 8;
  return val & 0x8000 ? val | 0xFFFF0000 : val;
};

Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
};

Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
};

Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return ieee754.read(this, offset, true, 23, 4);
};

Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return ieee754.read(this, offset, false, 23, 4);
};

Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 8, this.length);
  return ieee754.read(this, offset, true, 52, 8);
};

Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 8, this.length);
  return ieee754.read(this, offset, false, 52, 8);
};

function checkInt(buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
  if (offset + ext > buf.length) throw new RangeError('Index out of range');
}

Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;

  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var mul = 1;
  var i = 0;
  this[offset] = value & 0xFF;

  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = value / mul & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;

  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var i = byteLength - 1;
  var mul = 1;
  this[offset + i] = value & 0xFF;

  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = value / mul & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
  this[offset] = value & 0xff;
  return offset + 1;
};

Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  this[offset] = value & 0xff;
  this[offset + 1] = value >>> 8;
  return offset + 2;
};

Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  this[offset] = value >>> 8;
  this[offset + 1] = value & 0xff;
  return offset + 2;
};

Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  this[offset + 3] = value >>> 24;
  this[offset + 2] = value >>> 16;
  this[offset + 1] = value >>> 8;
  this[offset] = value & 0xff;
  return offset + 4;
};

Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  this[offset] = value >>> 24;
  this[offset + 1] = value >>> 16;
  this[offset + 2] = value >>> 8;
  this[offset + 3] = value & 0xff;
  return offset + 4;
};

Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset >>> 0;

  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);
    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = 0;
  var mul = 1;
  var sub = 0;
  this[offset] = value & 0xFF;

  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1;
    }

    this[offset + i] = (value / mul >> 0) - sub & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset >>> 0;

  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);
    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = byteLength - 1;
  var mul = 1;
  var sub = 0;
  this[offset + i] = value & 0xFF;

  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1;
    }

    this[offset + i] = (value / mul >> 0) - sub & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
  if (value < 0) value = 0xff + value + 1;
  this[offset] = value & 0xff;
  return offset + 1;
};

Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  this[offset] = value & 0xff;
  this[offset + 1] = value >>> 8;
  return offset + 2;
};

Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  this[offset] = value >>> 8;
  this[offset + 1] = value & 0xff;
  return offset + 2;
};

Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  this[offset] = value & 0xff;
  this[offset + 1] = value >>> 8;
  this[offset + 2] = value >>> 16;
  this[offset + 3] = value >>> 24;
  return offset + 4;
};

Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (value < 0) value = 0xffffffff + value + 1;
  this[offset] = value >>> 24;
  this[offset + 1] = value >>> 16;
  this[offset + 2] = value >>> 8;
  this[offset + 3] = value & 0xff;
  return offset + 4;
};

function checkIEEE754(buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range');
  if (offset < 0) throw new RangeError('Index out of range');
}

function writeFloat(buf, value, offset, littleEndian, noAssert) {
  value = +value;
  offset = offset >>> 0;

  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  ieee754.write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4;
}

Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert);
};

Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert);
};

function writeDouble(buf, value, offset, littleEndian, noAssert) {
  value = +value;
  offset = offset >>> 0;

  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  ieee754.write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8;
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert);
};

Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert);
}; // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)


Buffer.prototype.copy = function copy(target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer');
  if (!start) start = 0;
  if (!end && end !== 0) end = this.length;
  if (targetStart >= target.length) targetStart = target.length;
  if (!targetStart) targetStart = 0;
  if (end > 0 && end < start) end = start; // Copy 0 bytes; we're done

  if (end === start) return 0;
  if (target.length === 0 || this.length === 0) return 0; // Fatal error conditions

  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds');
  }

  if (start < 0 || start >= this.length) throw new RangeError('Index out of range');
  if (end < 0) throw new RangeError('sourceEnd out of bounds'); // Are we oob?

  if (end > this.length) end = this.length;

  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }

  var len = end - start;

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end);
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start];
    }
  } else {
    Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
  }

  return len;
}; // Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])


Buffer.prototype.fill = function fill(val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start;
      start = 0;
      end = this.length;
    } else if (typeof end === 'string') {
      encoding = end;
      end = this.length;
    }

    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string');
    }

    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding);
    }

    if (val.length === 1) {
      var code = val.charCodeAt(0);

      if (encoding === 'utf8' && code < 128 || encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code;
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255;
  } // Invalid ranges are not set to a default, so can range check early.


  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index');
  }

  if (end <= start) {
    return this;
  }

  start = start >>> 0;
  end = end === undefined ? this.length : end >>> 0;
  if (!val) val = 0;
  var i;

  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val;
    }
  } else {
    var bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
    var len = bytes.length;

    if (len === 0) {
      throw new TypeError('The value "' + val + '" is invalid for argument "value"');
    }

    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len];
    }
  }

  return this;
}; // HELPER FUNCTIONS
// ================


var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;

function base64clean(str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]; // Node strips out invalid characters like \n and \t from the string, base64-js does not

  str = str.trim().replace(INVALID_BASE64_RE, ''); // Node converts strings with length < 2 to ''

  if (str.length < 2) return ''; // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not

  while (str.length % 4 !== 0) {
    str = str + '=';
  }

  return str;
}

function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(string, units) {
  units = units || Infinity;
  var codePoint;
  var length = string.length;
  var leadSurrogate = null;
  var bytes = [];

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i); // is surrogate component

    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue;
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue;
        } // valid lead


        leadSurrogate = codePoint;
        continue;
      } // 2 leads in a row


      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        leadSurrogate = codePoint;
        continue;
      } // valid surrogate pair


      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
    }

    leadSurrogate = null; // encode utf8

    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break;
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break;
      bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break;
      bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break;
      bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
    } else {
      throw new Error('Invalid code point');
    }
  }

  return bytes;
}

function asciiToBytes(str) {
  var byteArray = [];

  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF);
  }

  return byteArray;
}

function utf16leToBytes(str, units) {
  var c, hi, lo;
  var byteArray = [];

  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break;
    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }

  return byteArray;
}

function base64ToBytes(str) {
  return base64.toByteArray(base64clean(str));
}

function blitBuffer(src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if (i + offset >= dst.length || i >= src.length) break;
    dst[i + offset] = src[i];
  }

  return i;
} // ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166


function isInstance(obj, type) {
  return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
}

function numberIsNaN(obj) {
  // For IE11 support
  return obj !== obj; // eslint-disable-line no-self-compare
}

}).call(this,require("buffer").Buffer)

},{"base64-js":1,"buffer":3,"ieee754":4}],4:[function(require,module,exports){
"use strict";

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? nBytes - 1 : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];
  i += d;
  e = s & (1 << -nBits) - 1;
  s >>= -nBits;
  nBits += eLen;

  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;

  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : (s ? -1 : 1) * Infinity;
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }

  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  var i = isLE ? 0 : nBytes - 1;
  var d = isLE ? 1 : -1;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);

    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }

    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }

    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = e << mLen | m;
  eLen += mLen;

  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128;
};

},{}],5:[function(require,module,exports){
"use strict";

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer);
};

function isBuffer(obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj);
} // For Node v0.10 support. Remove this eventually.


function isSlowBuffer(obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0));
}

},{}],6:[function(require,module,exports){
"use strict";

// shim for using process in browser
var process = module.exports = {}; // cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
  throw new Error('setTimeout has not been defined');
}

function defaultClearTimeout() {
  throw new Error('clearTimeout has not been defined');
}

(function () {
  try {
    if (typeof setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
    } else {
      cachedSetTimeout = defaultSetTimout;
    }
  } catch (e) {
    cachedSetTimeout = defaultSetTimout;
  }

  try {
    if (typeof clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
    } else {
      cachedClearTimeout = defaultClearTimeout;
    }
  } catch (e) {
    cachedClearTimeout = defaultClearTimeout;
  }
})();

function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    //normal enviroments in sane situations
    return setTimeout(fun, 0);
  } // if setTimeout wasn't available but was latter defined


  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}

function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    //normal enviroments in sane situations
    return clearTimeout(marker);
  } // if clearTimeout wasn't available but was latter defined


  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }

  draining = false;

  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }

  if (queue.length) {
    drainQueue();
  }
}

function drainQueue() {
  if (draining) {
    return;
  }

  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;

  while (len) {
    currentQueue = queue;
    queue = [];

    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }

    queueIndex = -1;
    len = queue.length;
  }

  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}

process.nextTick = function (fun) {
  var args = new Array(arguments.length - 1);

  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }

  queue.push(new Item(fun, args));

  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
}; // v8 likes predictible objects


function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}

Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) {
  return [];
};

process.binding = function (name) {
  throw new Error('process.binding is not supported');
};

process.cwd = function () {
  return '/';
};

process.chdir = function (dir) {
  throw new Error('process.chdir is not supported');
};

process.umask = function () {
  return 0;
};

},{}],7:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var runtime = function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.

  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.

    generator._invoke = makeInvokeMethod(innerFn, self, context);
    return generator;
  }

  exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.

  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.

  var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.

  function Generator() {}

  function GeneratorFunction() {}

  function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.


  var IteratorPrototype = {};

  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

  if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction"; // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.

  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      prototype[method] = function (arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function (genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
    // do is to check its .name property.
    (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
  };

  exports.mark = function (genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;

      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }

    genFun.prototype = Object.create(Gp);
    return genFun;
  }; // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.


  exports.awrap = function (arg) {
    return {
      __await: arg
    };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);

      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;

        if (value && _typeof(value) === "object" && hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function (value) {
            invoke("next", value, resolve, reject);
          }, function (err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function (unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function (error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function (resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise = // If enqueue has been called before, then we want to wait until
      // all previous Promises have been resolved before calling invoke,
      // so that results are always delivered in the correct order. If
      // enqueue has not been called before, then it is important to
      // call invoke immediately, without waiting on a callback to fire,
      // so that the async generator function has the opportunity to do
      // any necessary setup in a predictable way. This predictability
      // is why the Promise constructor synchronously invokes its
      // executor callback, and why async functions synchronously
      // execute code before the first await. Since we implement simple
      // async functions in terms of async generators, it is especially
      // important to get this right, even though it requires care.
      previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
      // invocations of the iterator.
      callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
    } // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).


    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };

  exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.

  exports.async = function (innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));
    return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
    : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;
    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        } // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;

        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);

          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;
        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);
        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;
        var record = tryCatch(innerFn, self, context);

        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done ? GenStateCompleted : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };
        } else if (record.type === "throw") {
          state = GenStateCompleted; // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.

          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  } // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.


  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];

    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError("The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (!info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

      context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.

      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }
    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    } // The delegate iterator is finished, so forget it and continue with
    // the outer generator.


    context.delegate = null;
    return ContinueSentinel;
  } // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.


  defineIteratorMethods(Gp);
  Gp[toStringTagSymbol] = "Generator"; // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.

  Gp[iteratorSymbol] = function () {
    return this;
  };

  Gp.toString = function () {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{
      tryLoc: "root"
    }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function (object) {
    var keys = [];

    for (var key in object) {
      keys.push(key);
    }

    keys.reverse(); // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.

    return function next() {
      while (keys.length) {
        var key = keys.pop();

        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      } // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.


      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];

      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1,
            next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;
          return next;
        };

        return next.next = next;
      }
    } // Return an iterator with no values.


    return {
      next: doneResult
    };
  }

  exports.values = values;

  function doneResult() {
    return {
      value: undefined,
      done: true
    };
  }

  Context.prototype = {
    constructor: Context,
    reset: function reset(skipTempReset) {
      this.prev = 0;
      this.next = 0; // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.

      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;
      this.method = "next";
      this.arg = undefined;
      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },
    stop: function stop() {
      this.done = true;
      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;

      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },
    dispatchException: function dispatchException(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;

      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }
          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },
    abrupt: function abrupt(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },
    complete: function complete(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" || record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },
    finish: function finish(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },
    "catch": function _catch(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;

          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }

          return thrown;
        }
      } // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.


      throw new Error("illegal catch attempt");
    },
    delegateYield: function delegateYield(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  }; // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.

  return exports;
}( // If this script is executing as a CommonJS module, use module.exports
// as the regeneratorRuntime namespace. Otherwise create a new empty
// object. Either way, the resulting object will be used to initialize
// the regeneratorRuntime variable at the top of this file.
(typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" ? module.exports : {});

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = "abi/5.0.0-beta.153";

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
}); // See: https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI

var bytes_1 = require("@ethersproject/bytes");

var properties_1 = require("@ethersproject/properties");

var logger_1 = require("@ethersproject/logger");

var _version_1 = require("./_version");

var logger = new logger_1.Logger(_version_1.version);

var abstract_coder_1 = require("./coders/abstract-coder");

var address_1 = require("./coders/address");

var array_1 = require("./coders/array");

var boolean_1 = require("./coders/boolean");

var bytes_2 = require("./coders/bytes");

var fixed_bytes_1 = require("./coders/fixed-bytes");

var null_1 = require("./coders/null");

var number_1 = require("./coders/number");

var string_1 = require("./coders/string");

var tuple_1 = require("./coders/tuple");

var fragments_1 = require("./fragments");

var paramTypeBytes = new RegExp(/^bytes([0-9]*)$/);
var paramTypeNumber = new RegExp(/^(u?int)([0-9]*)$/);

var AbiCoder =
/** @class */
function () {
  function AbiCoder(coerceFunc) {
    var _newTarget = this.constructor;
    logger.checkNew(_newTarget, AbiCoder);
    properties_1.defineReadOnly(this, "coerceFunc", coerceFunc || null);
  }

  AbiCoder.prototype._getCoder = function (param) {
    var _this = this;

    switch (param.baseType) {
      case "address":
        return new address_1.AddressCoder(param.name);

      case "bool":
        return new boolean_1.BooleanCoder(param.name);

      case "string":
        return new string_1.StringCoder(param.name);

      case "bytes":
        return new bytes_2.BytesCoder(param.name);

      case "array":
        return new array_1.ArrayCoder(this._getCoder(param.arrayChildren), param.arrayLength, param.name);

      case "tuple":
        return new tuple_1.TupleCoder((param.components || []).map(function (component) {
          return _this._getCoder(component);
        }), param.name);

      case "":
        return new null_1.NullCoder(param.name);
    } // u?int[0-9]*


    var match = param.type.match(paramTypeNumber);

    if (match) {
      var size = parseInt(match[2] || "256");

      if (size === 0 || size > 256 || size % 8 !== 0) {
        logger.throwArgumentError("invalid " + match[1] + " bit length", "param", param);
      }

      return new number_1.NumberCoder(size / 8, match[1] === "int", param.name);
    } // bytes[0-9]+


    match = param.type.match(paramTypeBytes);

    if (match) {
      var size = parseInt(match[1]);

      if (size === 0 || size > 32) {
        logger.throwArgumentError("invalid bytes length", "param", param);
      }

      return new fixed_bytes_1.FixedBytesCoder(size, param.name);
    }

    return logger.throwArgumentError("invalid type", "type", param.type);
  };

  AbiCoder.prototype._getWordSize = function () {
    return 32;
  };

  AbiCoder.prototype._getReader = function (data) {
    return new abstract_coder_1.Reader(data, this._getWordSize(), this.coerceFunc);
  };

  AbiCoder.prototype._getWriter = function () {
    return new abstract_coder_1.Writer(this._getWordSize());
  };

  AbiCoder.prototype.encode = function (types, values) {
    var _this = this;

    if (types.length !== values.length) {
      logger.throwError("types/values length mismatch", logger_1.Logger.errors.INVALID_ARGUMENT, {
        count: {
          types: types.length,
          values: values.length
        },
        value: {
          types: types,
          values: values
        }
      });
    }

    var coders = types.map(function (type) {
      return _this._getCoder(fragments_1.ParamType.from(type));
    });
    var coder = new tuple_1.TupleCoder(coders, "_");

    var writer = this._getWriter();

    coder.encode(writer, values);
    return writer.data;
  };

  AbiCoder.prototype.decode = function (types, data) {
    var _this = this;

    var coders = types.map(function (type) {
      return _this._getCoder(fragments_1.ParamType.from(type));
    });
    var coder = new tuple_1.TupleCoder(coders, "_");
    return coder.decode(this._getReader(bytes_1.arrayify(data)));
  };

  return AbiCoder;
}();

exports.AbiCoder = AbiCoder;
exports.defaultAbiCoder = new AbiCoder();

},{"./_version":8,"./coders/abstract-coder":10,"./coders/address":11,"./coders/array":13,"./coders/boolean":14,"./coders/bytes":15,"./coders/fixed-bytes":16,"./coders/null":17,"./coders/number":18,"./coders/string":19,"./coders/tuple":20,"./fragments":21,"@ethersproject/bytes":31,"@ethersproject/logger":37,"@ethersproject/properties":39}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var bytes_1 = require("@ethersproject/bytes");

var bignumber_1 = require("@ethersproject/bignumber");

var properties_1 = require("@ethersproject/properties");

var logger_1 = require("@ethersproject/logger");

var _version_1 = require("../_version");

var logger = new logger_1.Logger(_version_1.version);

function checkResultErrors(result) {
  // Find the first error (if any)
  var errors = [];

  var checkErrors = function checkErrors(path, object) {
    if (!Array.isArray(object)) {
      return;
    }

    for (var key in object) {
      var childPath = path.slice();
      childPath.push(key);

      try {
        checkErrors(childPath, object[key]);
      } catch (error) {
        errors.push({
          path: childPath,
          error: error
        });
      }
    }
  };

  checkErrors([], result);
  return errors;
}

exports.checkResultErrors = checkResultErrors;

var Coder =
/** @class */
function () {
  function Coder(name, type, localName, dynamic) {
    // @TODO: defineReadOnly these
    this.name = name;
    this.type = type;
    this.localName = localName;
    this.dynamic = dynamic;
  }

  Coder.prototype._throwError = function (message, value) {
    logger.throwArgumentError(message, this.localName, value);
  };

  return Coder;
}();

exports.Coder = Coder;

var Writer =
/** @class */
function () {
  function Writer(wordSize) {
    properties_1.defineReadOnly(this, "wordSize", wordSize || 32);
    this._data = bytes_1.arrayify([]);
    this._padding = new Uint8Array(wordSize);
  }

  Object.defineProperty(Writer.prototype, "data", {
    get: function get() {
      return bytes_1.hexlify(this._data);
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(Writer.prototype, "length", {
    get: function get() {
      return this._data.length;
    },
    enumerable: true,
    configurable: true
  });

  Writer.prototype._writeData = function (data) {
    this._data = bytes_1.concat([this._data, data]);
    return data.length;
  }; // Arrayish items; padded on the right to wordSize


  Writer.prototype.writeBytes = function (value) {
    var bytes = bytes_1.arrayify(value);

    if (bytes.length % this.wordSize) {
      bytes = bytes_1.concat([bytes, this._padding.slice(bytes.length % this.wordSize)]);
    }

    return this._writeData(bytes);
  };

  Writer.prototype._getValue = function (value) {
    var bytes = bytes_1.arrayify(bignumber_1.BigNumber.from(value));

    if (bytes.length > this.wordSize) {
      logger.throwError("value out-of-bounds", logger_1.Logger.errors.BUFFER_OVERRUN, {
        length: this.wordSize,
        offset: bytes.length
      });
    }

    if (bytes.length % this.wordSize) {
      bytes = bytes_1.concat([this._padding.slice(bytes.length % this.wordSize), bytes]);
    }

    return bytes;
  }; // BigNumberish items; padded on the left to wordSize


  Writer.prototype.writeValue = function (value) {
    return this._writeData(this._getValue(value));
  };

  Writer.prototype.writeUpdatableValue = function () {
    var _this = this;

    var offset = this.length;
    this.writeValue(0);
    return function (value) {
      _this._data.set(_this._getValue(value), offset);
    };
  };

  return Writer;
}();

exports.Writer = Writer;

var Reader =
/** @class */
function () {
  function Reader(data, wordSize, coerceFunc) {
    properties_1.defineReadOnly(this, "_data", bytes_1.arrayify(data));
    properties_1.defineReadOnly(this, "wordSize", wordSize || 32);
    properties_1.defineReadOnly(this, "_coerceFunc", coerceFunc);
    this._offset = 0;
  }

  Object.defineProperty(Reader.prototype, "data", {
    get: function get() {
      return bytes_1.hexlify(this._data);
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(Reader.prototype, "consumed", {
    get: function get() {
      return this._offset;
    },
    enumerable: true,
    configurable: true
  }); // The default Coerce function

  Reader.coerce = function (name, value) {
    var match = name.match("^u?int([0-9]+)$");

    if (match && parseInt(match[1]) <= 48) {
      value = value.toNumber();
    }

    return value;
  };

  Reader.prototype.coerce = function (name, value) {
    if (this._coerceFunc) {
      return this._coerceFunc(name, value);
    }

    return Reader.coerce(name, value);
  };

  Reader.prototype._peekBytes = function (offset, length) {
    var alignedLength = Math.ceil(length / this.wordSize) * this.wordSize;

    if (this._offset + alignedLength > this._data.length) {
      logger.throwError("data out-of-bounds", logger_1.Logger.errors.BUFFER_OVERRUN, {
        length: this._data.length,
        offset: this._offset + alignedLength
      });
    }

    return this._data.slice(this._offset, this._offset + alignedLength);
  };

  Reader.prototype.subReader = function (offset) {
    return new Reader(this._data.slice(this._offset + offset), this.wordSize, this._coerceFunc);
  };

  Reader.prototype.readBytes = function (length) {
    var bytes = this._peekBytes(0, length);

    this._offset += bytes.length; // @TODO: Make sure the length..end bytes are all 0?

    return bytes.slice(0, length);
  };

  Reader.prototype.readValue = function () {
    return bignumber_1.BigNumber.from(this.readBytes(this.wordSize));
  };

  return Reader;
}();

exports.Reader = Reader;

},{"../_version":8,"@ethersproject/bignumber":29,"@ethersproject/bytes":31,"@ethersproject/logger":37,"@ethersproject/properties":39}],11:[function(require,module,exports){
"use strict";

var __extends = void 0 && (void 0).__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var address_1 = require("@ethersproject/address");

var bytes_1 = require("@ethersproject/bytes");

var abstract_coder_1 = require("./abstract-coder");

var AddressCoder =
/** @class */
function (_super) {
  __extends(AddressCoder, _super);

  function AddressCoder(localName) {
    return _super.call(this, "address", "address", localName, false) || this;
  }

  AddressCoder.prototype.encode = function (writer, value) {
    try {
      address_1.getAddress(value);
    } catch (error) {
      this._throwError(error.message, value);
    }

    return writer.writeValue(value);
  };

  AddressCoder.prototype.decode = function (reader) {
    return address_1.getAddress(bytes_1.hexZeroPad(reader.readValue().toHexString(), 20));
  };

  return AddressCoder;
}(abstract_coder_1.Coder);

exports.AddressCoder = AddressCoder;

},{"./abstract-coder":10,"@ethersproject/address":25,"@ethersproject/bytes":31}],12:[function(require,module,exports){
"use strict";

var __extends = void 0 && (void 0).__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var abstract_coder_1 = require("./abstract-coder"); // Clones the functionality of an existing Coder, but without a localName


var AnonymousCoder =
/** @class */
function (_super) {
  __extends(AnonymousCoder, _super);

  function AnonymousCoder(coder) {
    var _this = _super.call(this, coder.name, coder.type, undefined, coder.dynamic) || this;

    _this.coder = coder;
    return _this;
  }

  AnonymousCoder.prototype.encode = function (writer, value) {
    return this.coder.encode(writer, value);
  };

  AnonymousCoder.prototype.decode = function (reader) {
    return this.coder.decode(reader);
  };

  return AnonymousCoder;
}(abstract_coder_1.Coder);

exports.AnonymousCoder = AnonymousCoder;

},{"./abstract-coder":10}],13:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var __extends = void 0 && (void 0).__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var logger_1 = require("@ethersproject/logger");

var _version_1 = require("../_version");

var logger = new logger_1.Logger(_version_1.version);

var abstract_coder_1 = require("./abstract-coder");

var anonymous_1 = require("./anonymous");

function pack(writer, coders, values) {
  if (Array.isArray(values)) {// do nothing
  } else if (values && _typeof(values) === "object") {
    var arrayValues_1 = [];
    coders.forEach(function (coder) {
      arrayValues_1.push(values[coder.localName]);
    });
    values = arrayValues_1;
  } else {
    logger.throwArgumentError("invalid tuple value", "tuple", values);
  }

  if (coders.length !== values.length) {
    logger.throwArgumentError("types/value length mismatch", "tuple", values);
  }

  var staticWriter = new abstract_coder_1.Writer(writer.wordSize);
  var dynamicWriter = new abstract_coder_1.Writer(writer.wordSize);
  var updateFuncs = [];
  coders.forEach(function (coder, index) {
    var value = values[index];

    if (coder.dynamic) {
      // Get current dynamic offset (for the future pointer)
      var dynamicOffset_1 = dynamicWriter.length; // Encode the dynamic value into the dynamicWriter

      coder.encode(dynamicWriter, value); // Prepare to populate the correct offset once we are done

      var updateFunc_1 = staticWriter.writeUpdatableValue();
      updateFuncs.push(function (baseOffset) {
        updateFunc_1(baseOffset + dynamicOffset_1);
      });
    } else {
      coder.encode(staticWriter, value);
    }
  }); // Backfill all the dynamic offsets, now that we know the static length

  updateFuncs.forEach(function (func) {
    func(staticWriter.length);
  });
  var length = writer.writeBytes(staticWriter.data);
  length += writer.writeBytes(dynamicWriter.data);
  return length;
}

exports.pack = pack;

function unpack(reader, coders) {
  var values = []; // A reader anchored to this base

  var baseReader = reader.subReader(0); // The amount of dynamic data read; to consume later to synchronize

  var dynamicLength = 0;
  coders.forEach(function (coder) {
    var value = null;

    if (coder.dynamic) {
      var offset = reader.readValue();
      var offsetReader = baseReader.subReader(offset.toNumber());

      try {
        value = coder.decode(offsetReader);
      } catch (error) {
        // Cannot recover from this
        if (error.code === logger_1.Logger.errors.BUFFER_OVERRUN) {
          throw error;
        }

        value = error;
        value.baseType = coder.name;
        value.name = coder.localName;
        value.type = coder.type;
      }

      dynamicLength += offsetReader.consumed;
    } else {
      try {
        value = coder.decode(reader);
      } catch (error) {
        // Cannot recover from this
        if (error.code === logger_1.Logger.errors.BUFFER_OVERRUN) {
          throw error;
        }

        value = error;
        value.baseType = coder.name;
        value.name = coder.localName;
        value.type = coder.type;
      }
    }

    if (value != undefined) {
      values.push(value);
    }
  }); // @TODO: get rid of this an see if it still works?
  // Consume the dynamic components in the main reader

  reader.readBytes(dynamicLength); // Add any named parameters (i.e. tuples)

  coders.forEach(function (coder, index) {
    var name = coder.localName;

    if (!name) {
      return;
    }

    if (name === "length") {
      name = "_length";
    }

    if (values[name] != null) {
      return;
    }

    var value = values[index];

    if (value instanceof Error) {
      Object.defineProperty(values, name, {
        get: function get() {
          throw value;
        }
      });
    } else {
      values[name] = value;
    }
  });

  var _loop_1 = function _loop_1(i) {
    var value = values[i];

    if (value instanceof Error) {
      Object.defineProperty(values, i, {
        get: function get() {
          throw value;
        }
      });
    }
  };

  for (var i = 0; i < values.length; i++) {
    _loop_1(i);
  }

  return Object.freeze(values);
}

exports.unpack = unpack;

var ArrayCoder =
/** @class */
function (_super) {
  __extends(ArrayCoder, _super);

  function ArrayCoder(coder, length, localName) {
    var _this = this;

    var type = coder.type + "[" + (length >= 0 ? length : "") + "]";
    var dynamic = length === -1 || coder.dynamic;
    _this = _super.call(this, "array", type, localName, dynamic) || this;
    _this.coder = coder;
    _this.length = length;
    return _this;
  }

  ArrayCoder.prototype.encode = function (writer, value) {
    if (!Array.isArray(value)) {
      this._throwError("expected array value", value);
    }

    var count = this.length;

    if (count === -1) {
      count = value.length;
      writer.writeValue(value.length);
    }

    logger.checkArgumentCount(count, value.length, "coder array" + (this.localName ? " " + this.localName : ""));
    var coders = [];

    for (var i = 0; i < value.length; i++) {
      coders.push(this.coder);
    }

    return pack(writer, coders, value);
  };

  ArrayCoder.prototype.decode = function (reader) {
    var count = this.length;

    if (count === -1) {
      count = reader.readValue().toNumber();
    }

    var coders = [];

    for (var i = 0; i < count; i++) {
      coders.push(new anonymous_1.AnonymousCoder(this.coder));
    }

    return reader.coerce(this.name, unpack(reader, coders));
  };

  return ArrayCoder;
}(abstract_coder_1.Coder);

exports.ArrayCoder = ArrayCoder;

},{"../_version":8,"./abstract-coder":10,"./anonymous":12,"@ethersproject/logger":37}],14:[function(require,module,exports){
"use strict";

var __extends = void 0 && (void 0).__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var abstract_coder_1 = require("./abstract-coder");

var BooleanCoder =
/** @class */
function (_super) {
  __extends(BooleanCoder, _super);

  function BooleanCoder(localName) {
    return _super.call(this, "bool", "bool", localName, false) || this;
  }

  BooleanCoder.prototype.encode = function (writer, value) {
    return writer.writeValue(value ? 1 : 0);
  };

  BooleanCoder.prototype.decode = function (reader) {
    return reader.coerce(this.type, !reader.readValue().isZero());
  };

  return BooleanCoder;
}(abstract_coder_1.Coder);

exports.BooleanCoder = BooleanCoder;

},{"./abstract-coder":10}],15:[function(require,module,exports){
"use strict";

var __extends = void 0 && (void 0).__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var bytes_1 = require("@ethersproject/bytes");

var abstract_coder_1 = require("./abstract-coder");

var DynamicBytesCoder =
/** @class */
function (_super) {
  __extends(DynamicBytesCoder, _super);

  function DynamicBytesCoder(type, localName) {
    return _super.call(this, type, type, localName, true) || this;
  }

  DynamicBytesCoder.prototype.encode = function (writer, value) {
    value = bytes_1.arrayify(value);
    var length = writer.writeValue(value.length);
    length += writer.writeBytes(value);
    return length;
  };

  DynamicBytesCoder.prototype.decode = function (reader) {
    return reader.readBytes(reader.readValue().toNumber());
  };

  return DynamicBytesCoder;
}(abstract_coder_1.Coder);

exports.DynamicBytesCoder = DynamicBytesCoder;

var BytesCoder =
/** @class */
function (_super) {
  __extends(BytesCoder, _super);

  function BytesCoder(localName) {
    return _super.call(this, "bytes", localName) || this;
  }

  BytesCoder.prototype.decode = function (reader) {
    return reader.coerce(this.name, bytes_1.hexlify(_super.prototype.decode.call(this, reader)));
  };

  return BytesCoder;
}(DynamicBytesCoder);

exports.BytesCoder = BytesCoder;

},{"./abstract-coder":10,"@ethersproject/bytes":31}],16:[function(require,module,exports){
"use strict";

var __extends = void 0 && (void 0).__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var bytes_1 = require("@ethersproject/bytes");

var abstract_coder_1 = require("./abstract-coder"); // @TODO: Merge this with bytes


var FixedBytesCoder =
/** @class */
function (_super) {
  __extends(FixedBytesCoder, _super);

  function FixedBytesCoder(size, localName) {
    var _this = this;

    var name = "bytes" + String(size);
    _this = _super.call(this, name, name, localName, false) || this;
    _this.size = size;
    return _this;
  }

  FixedBytesCoder.prototype.encode = function (writer, value) {
    var data = bytes_1.arrayify(value);

    if (data.length !== this.size) {
      this._throwError("incorrect data length", value);
    }

    return writer.writeBytes(data);
  };

  FixedBytesCoder.prototype.decode = function (reader) {
    return reader.coerce(this.name, bytes_1.hexlify(reader.readBytes(this.size)));
  };

  return FixedBytesCoder;
}(abstract_coder_1.Coder);

exports.FixedBytesCoder = FixedBytesCoder;

},{"./abstract-coder":10,"@ethersproject/bytes":31}],17:[function(require,module,exports){
"use strict";

var __extends = void 0 && (void 0).__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var abstract_coder_1 = require("./abstract-coder");

var NullCoder =
/** @class */
function (_super) {
  __extends(NullCoder, _super);

  function NullCoder(localName) {
    return _super.call(this, "null", "", localName, false) || this;
  }

  NullCoder.prototype.encode = function (writer, value) {
    if (value != null) {
      this._throwError("not null", value);
    }

    return writer.writeBytes([]);
  };

  NullCoder.prototype.decode = function (reader) {
    reader.readBytes(0);
    return reader.coerce(this.name, null);
  };

  return NullCoder;
}(abstract_coder_1.Coder);

exports.NullCoder = NullCoder;

},{"./abstract-coder":10}],18:[function(require,module,exports){
"use strict";

var __extends = void 0 && (void 0).__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var bignumber_1 = require("@ethersproject/bignumber");

var constants_1 = require("@ethersproject/constants");

var abstract_coder_1 = require("./abstract-coder");

var NumberCoder =
/** @class */
function (_super) {
  __extends(NumberCoder, _super);

  function NumberCoder(size, signed, localName) {
    var _this = this;

    var name = (signed ? "int" : "uint") + size * 8;
    _this = _super.call(this, name, name, localName, false) || this;
    _this.size = size;
    _this.signed = signed;
    return _this;
  }

  NumberCoder.prototype.encode = function (writer, value) {
    var v = bignumber_1.BigNumber.from(value); // Check bounds are safe for encoding

    var maxUintValue = constants_1.MaxUint256.mask(writer.wordSize * 8);

    if (this.signed) {
      var bounds = maxUintValue.mask(this.size * 8 - 1);

      if (v.gt(bounds) || v.lt(bounds.add(constants_1.One).mul(constants_1.NegativeOne))) {
        this._throwError("value out-of-bounds", value);
      }
    } else if (v.lt(constants_1.Zero) || v.gt(maxUintValue.mask(this.size * 8))) {
      this._throwError("value out-of-bounds", value);
    }

    v = v.toTwos(this.size * 8).mask(this.size * 8);

    if (this.signed) {
      v = v.fromTwos(this.size * 8).toTwos(8 * writer.wordSize);
    }

    return writer.writeValue(v);
  };

  NumberCoder.prototype.decode = function (reader) {
    var value = reader.readValue().mask(this.size * 8);

    if (this.signed) {
      value = value.fromTwos(this.size * 8);
    }

    return reader.coerce(this.name, value);
  };

  return NumberCoder;
}(abstract_coder_1.Coder);

exports.NumberCoder = NumberCoder;

},{"./abstract-coder":10,"@ethersproject/bignumber":29,"@ethersproject/constants":32}],19:[function(require,module,exports){
"use strict";

var __extends = void 0 && (void 0).__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var strings_1 = require("@ethersproject/strings");

var bytes_1 = require("./bytes");

var StringCoder =
/** @class */
function (_super) {
  __extends(StringCoder, _super);

  function StringCoder(localName) {
    return _super.call(this, "string", localName) || this;
  }

  StringCoder.prototype.encode = function (writer, value) {
    return _super.prototype.encode.call(this, writer, strings_1.toUtf8Bytes(value));
  };

  StringCoder.prototype.decode = function (reader) {
    return strings_1.toUtf8String(_super.prototype.decode.call(this, reader));
  };

  return StringCoder;
}(bytes_1.DynamicBytesCoder);

exports.StringCoder = StringCoder;

},{"./bytes":15,"@ethersproject/strings":45}],20:[function(require,module,exports){
"use strict";

var __extends = void 0 && (void 0).__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var abstract_coder_1 = require("./abstract-coder");

var array_1 = require("./array");

var TupleCoder =
/** @class */
function (_super) {
  __extends(TupleCoder, _super);

  function TupleCoder(coders, localName) {
    var _this = this;

    var dynamic = false;
    var types = [];
    coders.forEach(function (coder) {
      if (coder.dynamic) {
        dynamic = true;
      }

      types.push(coder.type);
    });
    var type = "tuple(" + types.join(",") + ")";
    _this = _super.call(this, "tuple", type, localName, dynamic) || this;
    _this.coders = coders;
    return _this;
  }

  TupleCoder.prototype.encode = function (writer, value) {
    return array_1.pack(writer, this.coders, value);
  };

  TupleCoder.prototype.decode = function (reader) {
    return reader.coerce(this.name, array_1.unpack(reader, this.coders));
  };

  return TupleCoder;
}(abstract_coder_1.Coder);

exports.TupleCoder = TupleCoder;

},{"./abstract-coder":10,"./array":13}],21:[function(require,module,exports){
"use strict";

var __extends = void 0 && (void 0).__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var bignumber_1 = require("@ethersproject/bignumber");

var properties_1 = require("@ethersproject/properties");

var logger_1 = require("@ethersproject/logger");

var _version_1 = require("./_version");

var logger = new logger_1.Logger(_version_1.version);
;
var _constructorGuard = {};
var ModifiersBytes = {
  calldata: true,
  memory: true,
  storage: true
};
var ModifiersNest = {
  calldata: true,
  memory: true
};

function checkModifier(type, name) {
  if (type === "bytes" || type === "string") {
    if (ModifiersBytes[name]) {
      return true;
    }
  } else if (type === "address") {
    if (name === "payable") {
      return true;
    }
  } else if (type.indexOf("[") >= 0 || type === "tuple") {
    if (ModifiersNest[name]) {
      return true;
    }
  }

  if (ModifiersBytes[name] || name === "payable") {
    logger.throwArgumentError("invalid modifier", "name", name);
  }

  return false;
} // @TODO: Make sure that children of an indexed tuple are marked with a null indexed


function parseParamType(param, allowIndexed) {
  var originalParam = param;

  function throwError(i) {
    logger.throwArgumentError("unexpected character at position " + i, "param", param);
  }

  param = param.replace(/\s/g, " ");

  function newNode(parent) {
    var node = {
      type: "",
      name: "",
      parent: parent,
      state: {
        allowType: true
      }
    };

    if (allowIndexed) {
      node.indexed = false;
    }

    return node;
  }

  var parent = {
    type: "",
    name: "",
    state: {
      allowType: true
    }
  };
  var node = parent;

  for (var i = 0; i < param.length; i++) {
    var c = param[i];

    switch (c) {
      case "(":
        if (node.state.allowType && node.type === "") {
          node.type = "tuple";
        } else if (!node.state.allowParams) {
          throwError(i);
        }

        node.state.allowType = false;
        node.type = verifyType(node.type);
        node.components = [newNode(node)];
        node = node.components[0];
        break;

      case ")":
        delete node.state;

        if (node.name === "indexed") {
          if (!allowIndexed) {
            throwError(i);
          }

          node.indexed = true;
          node.name = "";
        }

        if (checkModifier(node.type, node.name)) {
          node.name = "";
        }

        node.type = verifyType(node.type);
        var child = node;
        node = node.parent;

        if (!node) {
          throwError(i);
        }

        delete child.parent;
        node.state.allowParams = false;
        node.state.allowName = true;
        node.state.allowArray = true;
        break;

      case ",":
        delete node.state;

        if (node.name === "indexed") {
          if (!allowIndexed) {
            throwError(i);
          }

          node.indexed = true;
          node.name = "";
        }

        if (checkModifier(node.type, node.name)) {
          node.name = "";
        }

        node.type = verifyType(node.type);
        var sibling = newNode(node.parent); //{ type: "", name: "", parent: node.parent, state: { allowType: true } };

        node.parent.components.push(sibling);
        delete node.parent;
        node = sibling;
        break;
      // Hit a space...

      case " ":
        // If reading type, the type is done and may read a param or name
        if (node.state.allowType) {
          if (node.type !== "") {
            node.type = verifyType(node.type);
            delete node.state.allowType;
            node.state.allowName = true;
            node.state.allowParams = true;
          }
        } // If reading name, the name is done


        if (node.state.allowName) {
          if (node.name !== "") {
            if (node.name === "indexed") {
              if (!allowIndexed) {
                throwError(i);
              }

              if (node.indexed) {
                throwError(i);
              }

              node.indexed = true;
              node.name = "";
            } else if (checkModifier(node.type, node.name)) {
              node.name = "";
            } else {
              node.state.allowName = false;
            }
          }
        }

        break;

      case "[":
        if (!node.state.allowArray) {
          throwError(i);
        }

        node.type += c;
        node.state.allowArray = false;
        node.state.allowName = false;
        node.state.readArray = true;
        break;

      case "]":
        if (!node.state.readArray) {
          throwError(i);
        }

        node.type += c;
        node.state.readArray = false;
        node.state.allowArray = true;
        node.state.allowName = true;
        break;

      default:
        if (node.state.allowType) {
          node.type += c;
          node.state.allowParams = true;
          node.state.allowArray = true;
        } else if (node.state.allowName) {
          node.name += c;
          delete node.state.allowArray;
        } else if (node.state.readArray) {
          node.type += c;
        } else {
          throwError(i);
        }

    }
  }

  if (node.parent) {
    logger.throwArgumentError("unexpected eof", "param", param);
  }

  delete parent.state;

  if (node.name === "indexed") {
    if (!allowIndexed) {
      throwError(originalParam.length - 7);
    }

    if (node.indexed) {
      throwError(originalParam.length - 7);
    }

    node.indexed = true;
    node.name = "";
  } else if (checkModifier(node.type, node.name)) {
    node.name = "";
  }

  parent.type = verifyType(parent.type);
  return parent;
}

function populate(object, params) {
  for (var key in params) {
    properties_1.defineReadOnly(object, key, params[key]);
  }
}

exports.FormatTypes = Object.freeze({
  // Bare formatting, as is needed for computing a sighash of an event or function
  sighash: "sighash",
  // Human-Readable with Minimal spacing and without names (compact human-readable)
  minimal: "minimal",
  // Human-Readble with nice spacing, including all names
  full: "full",
  // JSON-format a la Solidity
  json: "json"
});
var paramTypeArray = new RegExp(/^(.*)\[([0-9]*)\]$/);

var ParamType =
/** @class */
function () {
  function ParamType(constructorGuard, params) {
    if (constructorGuard !== _constructorGuard) {
      logger.throwError("use fromString", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
        operation: "new ParamType()"
      });
    }

    populate(this, params);
    var match = this.type.match(paramTypeArray);

    if (match) {
      populate(this, {
        arrayLength: parseInt(match[2] || "-1"),
        arrayChildren: ParamType.fromObject({
          type: match[1],
          components: this.components
        }),
        baseType: "array"
      });
    } else {
      populate(this, {
        arrayLength: null,
        arrayChildren: null,
        baseType: this.components != null ? "tuple" : this.type
      });
    }

    this._isParamType = true;
    Object.freeze(this);
  } // Format the parameter fragment
  //   - sighash: "(uint256,address)"
  //   - minimal: "tuple(uint256,address) indexed"
  //   - full:    "tuple(uint256 foo, addres bar) indexed baz"


  ParamType.prototype.format = function (format) {
    if (!format) {
      format = exports.FormatTypes.sighash;
    }

    if (!exports.FormatTypes[format]) {
      logger.throwArgumentError("invalid format type", "format", format);
    }

    if (format === exports.FormatTypes.json) {
      var result_1 = {
        type: this.baseType === "tuple" ? "tuple" : this.type,
        name: this.name || undefined
      };

      if (typeof this.indexed === "boolean") {
        result_1.indexed = this.indexed;
      }

      if (this.components) {
        result_1.components = this.components.map(function (comp) {
          return JSON.parse(comp.format(format));
        });
      }

      return JSON.stringify(result_1);
    }

    var result = ""; // Array

    if (this.baseType === "array") {
      result += this.arrayChildren.format(format);
      result += "[" + (this.arrayLength < 0 ? "" : String(this.arrayLength)) + "]";
    } else {
      if (this.baseType === "tuple") {
        if (format !== exports.FormatTypes.sighash) {
          result += this.type;
        }

        result += "(" + this.components.map(function (comp) {
          return comp.format(format);
        }).join(format === exports.FormatTypes.full ? ", " : ",") + ")";
      } else {
        result += this.type;
      }
    }

    if (format !== exports.FormatTypes.sighash) {
      if (this.indexed === true) {
        result += " indexed";
      }

      if (format === exports.FormatTypes.full && this.name) {
        result += " " + this.name;
      }
    }

    return result;
  };

  ParamType.from = function (value, allowIndexed) {
    if (typeof value === "string") {
      return ParamType.fromString(value, allowIndexed);
    }

    return ParamType.fromObject(value);
  };

  ParamType.fromObject = function (value) {
    if (ParamType.isParamType(value)) {
      return value;
    }

    return new ParamType(_constructorGuard, {
      name: value.name || null,
      type: verifyType(value.type),
      indexed: value.indexed == null ? null : !!value.indexed,
      components: value.components ? value.components.map(ParamType.fromObject) : null
    });
  };

  ParamType.fromString = function (value, allowIndexed) {
    function ParamTypify(node) {
      return ParamType.fromObject({
        name: node.name,
        type: node.type,
        indexed: node.indexed,
        components: node.components
      });
    }

    return ParamTypify(parseParamType(value, !!allowIndexed));
  };

  ParamType.isParamType = function (value) {
    return !!(value != null && value._isParamType);
  };

  return ParamType;
}();

exports.ParamType = ParamType;
;

function parseParams(value, allowIndex) {
  return splitNesting(value).map(function (param) {
    return ParamType.fromString(param, allowIndex);
  });
}

var Fragment =
/** @class */
function () {
  function Fragment(constructorGuard, params) {
    if (constructorGuard !== _constructorGuard) {
      logger.throwError("use a static from method", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
        operation: "new Fragment()"
      });
    }

    populate(this, params);
    this._isFragment = true;
    Object.freeze(this);
  }

  Fragment.from = function (value) {
    if (Fragment.isFragment(value)) {
      return value;
    }

    if (typeof value === "string") {
      return Fragment.fromString(value);
    }

    return Fragment.fromObject(value);
  };

  Fragment.fromObject = function (value) {
    if (Fragment.isFragment(value)) {
      return value;
    }

    switch (value.type) {
      case "function":
        return FunctionFragment.fromObject(value);

      case "event":
        return EventFragment.fromObject(value);

      case "constructor":
        return ConstructorFragment.fromObject(value);

      case "fallback":
      case "receive":
        // @TODO: Something? Maybe return a FunctionFragment? A custom DefaultFunctionFragment?
        return null;
    }

    return logger.throwArgumentError("invalid fragment object", "value", value);
  };

  Fragment.fromString = function (value) {
    // Make sure the "returns" is surrounded by a space and all whitespace is exactly one space
    value = value.replace(/\s/g, " ");
    value = value.replace(/\(/g, " (").replace(/\)/g, ") ").replace(/\s+/g, " ");
    value = value.trim();

    if (value.split(" ")[0] === "event") {
      return EventFragment.fromString(value.substring(5).trim());
    } else if (value.split(" ")[0] === "function") {
      return FunctionFragment.fromString(value.substring(8).trim());
    } else if (value.split("(")[0].trim() === "constructor") {
      return ConstructorFragment.fromString(value.trim());
    }

    return logger.throwArgumentError("unsupported fragment", "value", value);
  };

  Fragment.isFragment = function (value) {
    return !!(value && value._isFragment);
  };

  return Fragment;
}();

exports.Fragment = Fragment;

var EventFragment =
/** @class */
function (_super) {
  __extends(EventFragment, _super);

  function EventFragment() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  EventFragment.prototype.format = function (format) {
    if (!format) {
      format = exports.FormatTypes.sighash;
    }

    if (!exports.FormatTypes[format]) {
      logger.throwArgumentError("invalid format type", "format", format);
    }

    if (format === exports.FormatTypes.json) {
      return JSON.stringify({
        type: "event",
        anonymous: this.anonymous,
        name: this.name,
        inputs: this.inputs.map(function (input) {
          return JSON.parse(input.format(format));
        })
      });
    }

    var result = "";

    if (format !== exports.FormatTypes.sighash) {
      result += "event ";
    }

    result += this.name + "(" + this.inputs.map(function (input) {
      return input.format(format);
    }).join(format === exports.FormatTypes.full ? ", " : ",") + ") ";

    if (format !== exports.FormatTypes.sighash) {
      if (this.anonymous) {
        result += "anonymous ";
      }
    }

    return result.trim();
  };

  EventFragment.from = function (value) {
    if (typeof value === "string") {
      return EventFragment.fromString(value);
    }

    return EventFragment.fromObject(value);
  };

  EventFragment.fromObject = function (value) {
    if (EventFragment.isEventFragment(value)) {
      return value;
    }

    if (value.type !== "event") {
      logger.throwArgumentError("invalid event object", "value", value);
    }

    var params = {
      name: verifyIdentifier(value.name),
      anonymous: value.anonymous,
      inputs: value.inputs ? value.inputs.map(ParamType.fromObject) : [],
      type: "event"
    };
    return new EventFragment(_constructorGuard, params);
  };

  EventFragment.fromString = function (value) {
    var match = value.match(regexParen);

    if (!match) {
      logger.throwArgumentError("invalid event string", "value", value);
    }

    var anonymous = false;
    match[3].split(" ").forEach(function (modifier) {
      switch (modifier.trim()) {
        case "anonymous":
          anonymous = true;
          break;

        case "":
          break;

        default:
          logger.warn("unknown modifier: " + modifier);
      }
    });
    return EventFragment.fromObject({
      name: match[1].trim(),
      anonymous: anonymous,
      inputs: parseParams(match[2], true),
      type: "event"
    });
  };

  EventFragment.isEventFragment = function (value) {
    return value && value._isFragment && value.type === "event";
  };

  return EventFragment;
}(Fragment);

exports.EventFragment = EventFragment;

function parseGas(value, params) {
  params.gas = null;
  var comps = value.split("@");

  if (comps.length !== 1) {
    if (comps.length > 2) {
      logger.throwArgumentError("invalid human-readable ABI signature", "value", value);
    }

    if (!comps[1].match(/^[0-9]+$/)) {
      logger.throwArgumentError("invalid human-readable ABI signature gas", "value", value);
    }

    params.gas = bignumber_1.BigNumber.from(comps[1]);
    return comps[0];
  }

  return value;
}

function parseModifiers(value, params) {
  params.constant = false;
  params.payable = false;
  params.stateMutability = "nonpayable";
  value.split(" ").forEach(function (modifier) {
    switch (modifier.trim()) {
      case "constant":
        params.constant = true;
        break;

      case "payable":
        params.payable = true;
        params.stateMutability = "payable";
        break;

      case "pure":
        params.constant = true;
        params.stateMutability = "pure";
        break;

      case "view":
        params.constant = true;
        params.stateMutability = "view";
        break;

      case "external":
      case "public":
      case "":
        break;

      default:
        console.log("unknown modifier: " + modifier);
    }
  });
}

function verifyState(value) {
  var result = {
    constant: false,
    payable: true,
    stateMutability: "payable"
  };

  if (value.stateMutability != null) {
    result.stateMutability = value.stateMutability; // Set (and check things are consistent) the constant property

    result.constant = result.stateMutability === "view" || result.stateMutability === "pure";

    if (value.constant != null) {
      if (!!value.constant !== result.constant) {
        logger.throwArgumentError("cannot have constant function with mutability " + result.stateMutability, "value", value);
      }
    } // Set (and check things are consistent) the payable property


    result.payable = result.stateMutability === "payable";

    if (value.payable != null) {
      if (!!value.payable !== result.payable) {
        logger.throwArgumentError("cannot have payable function with mutability " + result.stateMutability, "value", value);
      }
    }
  } else if (value.payable != null) {
    result.payable = !!value.payable; // If payable we can assume non-constant; otherwise we can't assume

    if (value.constant == null && !result.payable && value.type !== "constructor") {
      logger.throwArgumentError("unable to determine stateMutability", "value", value);
    }

    result.constant = !!value.constant;

    if (result.constant) {
      result.stateMutability = "view";
    } else {
      result.stateMutability = result.payable ? "payable" : "nonpayable";
    }

    if (result.payable && result.constant) {
      logger.throwArgumentError("cannot have constant payable function", "value", value);
    }
  } else if (value.constant != null) {
    result.constant = !!value.constant;
    result.payable = !result.constant;
    result.stateMutability = result.constant ? "view" : "payable";
  } else if (value.type !== "constructor") {
    logger.throwArgumentError("unable to determine stateMutability", "value", value);
  }

  return result;
}

var ConstructorFragment =
/** @class */
function (_super) {
  __extends(ConstructorFragment, _super);

  function ConstructorFragment() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  ConstructorFragment.prototype.format = function (format) {
    if (!format) {
      format = exports.FormatTypes.sighash;
    }

    if (!exports.FormatTypes[format]) {
      logger.throwArgumentError("invalid format type", "format", format);
    }

    if (format === exports.FormatTypes.json) {
      return JSON.stringify({
        type: "constructor",
        stateMutability: this.stateMutability !== "nonpayable" ? this.stateMutability : undefined,
        payble: this.payable,
        gas: this.gas ? this.gas.toNumber() : undefined,
        inputs: this.inputs.map(function (input) {
          return JSON.parse(input.format(format));
        })
      });
    }

    if (format === exports.FormatTypes.sighash) {
      logger.throwError("cannot format a constructor for sighash", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
        operation: "format(sighash)"
      });
    }

    var result = "constructor(" + this.inputs.map(function (input) {
      return input.format(format);
    }).join(format === exports.FormatTypes.full ? ", " : ",") + ") ";

    if (this.stateMutability && this.stateMutability !== "nonpayable") {
      result += this.stateMutability + " ";
    }

    return result.trim();
  };

  ConstructorFragment.from = function (value) {
    if (typeof value === "string") {
      return ConstructorFragment.fromString(value);
    }

    return ConstructorFragment.fromObject(value);
  };

  ConstructorFragment.fromObject = function (value) {
    if (ConstructorFragment.isConstructorFragment(value)) {
      return value;
    }

    if (value.type !== "constructor") {
      logger.throwArgumentError("invalid constructor object", "value", value);
    }

    var state = verifyState(value);

    if (state.constant) {
      logger.throwArgumentError("constructor cannot be constant", "value", value);
    }

    var params = {
      name: null,
      type: value.type,
      inputs: value.inputs ? value.inputs.map(ParamType.fromObject) : [],
      payable: state.payable,
      stateMutability: state.stateMutability,
      gas: value.gas ? bignumber_1.BigNumber.from(value.gas) : null
    };
    return new ConstructorFragment(_constructorGuard, params);
  };

  ConstructorFragment.fromString = function (value) {
    var params = {
      type: "constructor"
    };
    value = parseGas(value, params);
    var parens = value.match(regexParen);

    if (!parens || parens[1].trim() !== "constructor") {
      logger.throwArgumentError("invalid constructor string", "value", value);
    }

    params.inputs = parseParams(parens[2].trim(), false);
    parseModifiers(parens[3].trim(), params);
    return ConstructorFragment.fromObject(params);
  };

  ConstructorFragment.isConstructorFragment = function (value) {
    return value && value._isFragment && value.type === "constructor";
  };

  return ConstructorFragment;
}(Fragment);

exports.ConstructorFragment = ConstructorFragment;

var FunctionFragment =
/** @class */
function (_super) {
  __extends(FunctionFragment, _super);

  function FunctionFragment() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  FunctionFragment.prototype.format = function (format) {
    if (!format) {
      format = exports.FormatTypes.sighash;
    }

    if (!exports.FormatTypes[format]) {
      logger.throwArgumentError("invalid format type", "format", format);
    }

    if (format === exports.FormatTypes.json) {
      return JSON.stringify({
        type: "function",
        name: this.name,
        constant: this.constant,
        stateMutability: this.stateMutability !== "nonpayable" ? this.stateMutability : undefined,
        payble: this.payable,
        gas: this.gas ? this.gas.toNumber() : undefined,
        inputs: this.inputs.map(function (input) {
          return JSON.parse(input.format(format));
        }),
        ouputs: this.outputs.map(function (output) {
          return JSON.parse(output.format(format));
        })
      });
    }

    var result = "";

    if (format !== exports.FormatTypes.sighash) {
      result += "function ";
    }

    result += this.name + "(" + this.inputs.map(function (input) {
      return input.format(format);
    }).join(format === exports.FormatTypes.full ? ", " : ",") + ") ";

    if (format !== exports.FormatTypes.sighash) {
      if (this.stateMutability) {
        if (this.stateMutability !== "nonpayable") {
          result += this.stateMutability + " ";
        }
      } else if (this.constant) {
        result += "view ";
      }

      if (this.outputs && this.outputs.length) {
        result += "returns (" + this.outputs.map(function (output) {
          return output.format(format);
        }).join(", ") + ") ";
      }

      if (this.gas != null) {
        result += "@" + this.gas.toString() + " ";
      }
    }

    return result.trim();
  };

  FunctionFragment.from = function (value) {
    if (typeof value === "string") {
      return FunctionFragment.fromString(value);
    }

    return FunctionFragment.fromObject(value);
  };

  FunctionFragment.fromObject = function (value) {
    if (FunctionFragment.isFunctionFragment(value)) {
      return value;
    }

    if (value.type !== "function") {
      logger.throwArgumentError("invalid function object", "value", value);
    }

    var state = verifyState(value);
    var params = {
      type: value.type,
      name: verifyIdentifier(value.name),
      constant: state.constant,
      inputs: value.inputs ? value.inputs.map(ParamType.fromObject) : [],
      outputs: value.outputs ? value.outputs.map(ParamType.fromObject) : [],
      payable: state.payable,
      stateMutability: state.stateMutability,
      gas: value.gas ? bignumber_1.BigNumber.from(value.gas) : null
    };
    return new FunctionFragment(_constructorGuard, params);
  };

  FunctionFragment.fromString = function (value) {
    var params = {
      type: "function"
    };
    value = parseGas(value, params);
    var comps = value.split(" returns ");

    if (comps.length > 2) {
      logger.throwArgumentError("invalid function string", "value", value);
    }

    var parens = comps[0].match(regexParen);

    if (!parens) {
      logger.throwArgumentError("invalid function signature", "value", value);
    }

    params.name = parens[1].trim();

    if (params.name) {
      verifyIdentifier(params.name);
    }

    params.inputs = parseParams(parens[2], false);
    parseModifiers(parens[3].trim(), params); // We have outputs

    if (comps.length > 1) {
      var returns = comps[1].match(regexParen);

      if (returns[1].trim() != "" || returns[3].trim() != "") {
        logger.throwArgumentError("unexpected tokens", "value", value);
      }

      params.outputs = parseParams(returns[2], false);
    } else {
      params.outputs = [];
    }

    return FunctionFragment.fromObject(params);
  };

  FunctionFragment.isFunctionFragment = function (value) {
    return value && value._isFragment && value.type === "function";
  };

  return FunctionFragment;
}(ConstructorFragment);

exports.FunctionFragment = FunctionFragment; //export class ErrorFragment extends Fragment {
//}
//export class StructFragment extends Fragment {
//}

function verifyType(type) {
  // These need to be transformed to their full description
  if (type.match(/^uint($|[^1-9])/)) {
    type = "uint256" + type.substring(4);
  } else if (type.match(/^int($|[^1-9])/)) {
    type = "int256" + type.substring(3);
  } // @TODO: more verification


  return type;
}

var regexIdentifier = new RegExp("^[A-Za-z_][A-Za-z0-9_]*$");

function verifyIdentifier(value) {
  if (!value || !value.match(regexIdentifier)) {
    logger.throwArgumentError("invalid identifier \"" + value + "\"", "value", value);
  }

  return value;
}

var regexParen = new RegExp("^([^)(]*)\\((.*)\\)([^)(]*)$");

function splitNesting(value) {
  value = value.trim();
  var result = [];
  var accum = "";
  var depth = 0;

  for (var offset = 0; offset < value.length; offset++) {
    var c = value[offset];

    if (c === "," && depth === 0) {
      result.push(accum);
      accum = "";
    } else {
      accum += c;

      if (c === "(") {
        depth++;
      } else if (c === ")") {
        depth--;

        if (depth === -1) {
          logger.throwArgumentError("unbalanced parenthesis", "value", value);
        }
      }
    }
  }

  if (accum) {
    result.push(accum);
  }

  return result;
}

},{"./_version":8,"@ethersproject/bignumber":29,"@ethersproject/logger":37,"@ethersproject/properties":39}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var fragments_1 = require("./fragments");

exports.ConstructorFragment = fragments_1.ConstructorFragment;
exports.EventFragment = fragments_1.EventFragment;
exports.FormatTypes = fragments_1.FormatTypes;
exports.Fragment = fragments_1.Fragment;
exports.FunctionFragment = fragments_1.FunctionFragment;
exports.ParamType = fragments_1.ParamType;

var abi_coder_1 = require("./abi-coder");

exports.AbiCoder = abi_coder_1.AbiCoder;
exports.defaultAbiCoder = abi_coder_1.defaultAbiCoder;

var interface_1 = require("./interface");

exports.checkResultErrors = interface_1.checkResultErrors;
exports.Indexed = interface_1.Indexed;
exports.Interface = interface_1.Interface;
exports.LogDescription = interface_1.LogDescription;
exports.TransactionDescription = interface_1.TransactionDescription;

},{"./abi-coder":9,"./fragments":21,"./interface":23}],23:[function(require,module,exports){
"use strict";

var __extends = void 0 && (void 0).__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var address_1 = require("@ethersproject/address");

var bignumber_1 = require("@ethersproject/bignumber");

var bytes_1 = require("@ethersproject/bytes");

var hash_1 = require("@ethersproject/hash");

var keccak256_1 = require("@ethersproject/keccak256");

var properties_1 = require("@ethersproject/properties");

var abi_coder_1 = require("./abi-coder");

var abstract_coder_1 = require("./coders/abstract-coder");

exports.checkResultErrors = abstract_coder_1.checkResultErrors;

var fragments_1 = require("./fragments");

var logger_1 = require("@ethersproject/logger");

var _version_1 = require("./_version");

var logger = new logger_1.Logger(_version_1.version);

var LogDescription =
/** @class */
function (_super) {
  __extends(LogDescription, _super);

  function LogDescription() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  return LogDescription;
}(properties_1.Description);

exports.LogDescription = LogDescription;

var TransactionDescription =
/** @class */
function (_super) {
  __extends(TransactionDescription, _super);

  function TransactionDescription() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  return TransactionDescription;
}(properties_1.Description);

exports.TransactionDescription = TransactionDescription;

var Indexed =
/** @class */
function (_super) {
  __extends(Indexed, _super);

  function Indexed() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  Indexed.isIndexed = function (value) {
    return !!(value && value._isIndexed);
  };

  return Indexed;
}(properties_1.Description);

exports.Indexed = Indexed;

function wrapAccessError(property, error) {
  var wrap = new Error("deferred error during ABI decoding triggered accessing " + property);
  wrap.error = error;
  return wrap;
}

function checkNames(fragment, type, params) {
  params.reduce(function (accum, param) {
    if (param.name) {
      if (accum[param.name]) {
        logger.throwArgumentError("duplicate " + type + " parameter " + JSON.stringify(param.name) + " in " + fragment.format("full"), "fragment", fragment);
      }

      accum[param.name] = true;
    }

    return accum;
  }, {});
}

var Interface =
/** @class */
function () {
  function Interface(fragments) {
    var _newTarget = this.constructor;

    var _this = this;

    logger.checkNew(_newTarget, Interface);
    var abi = [];

    if (typeof fragments === "string") {
      abi = JSON.parse(fragments);
    } else {
      abi = fragments;
    }

    properties_1.defineReadOnly(this, "fragments", abi.map(function (fragment) {
      return fragments_1.Fragment.from(fragment);
    }).filter(function (fragment) {
      return fragment != null;
    }));
    properties_1.defineReadOnly(this, "_abiCoder", properties_1.getStatic(_newTarget, "getAbiCoder")());
    properties_1.defineReadOnly(this, "functions", {});
    properties_1.defineReadOnly(this, "errors", {});
    properties_1.defineReadOnly(this, "events", {});
    properties_1.defineReadOnly(this, "structs", {}); // Add all fragments by their signature

    this.fragments.forEach(function (fragment) {
      var bucket = null;

      switch (fragment.type) {
        case "constructor":
          if (_this.deploy) {
            logger.warn("duplicate definition - constructor");
            return;
          }

          checkNames(fragment, "input", fragment.inputs);
          properties_1.defineReadOnly(_this, "deploy", fragment);
          return;

        case "function":
          checkNames(fragment, "input", fragment.inputs);
          checkNames(fragment, "output", fragment.outputs);
          bucket = _this.functions;
          break;

        case "event":
          checkNames(fragment, "input", fragment.inputs);
          bucket = _this.events;
          break;

        default:
          return;
      }

      var signature = fragment.format();

      if (bucket[signature]) {
        logger.warn("duplicate definition - " + signature);
        return;
      }

      bucket[signature] = fragment;
    }); // If we do not have a constructor add a default

    if (!this.deploy) {
      properties_1.defineReadOnly(this, "deploy", fragments_1.ConstructorFragment.from({
        payable: false,
        type: "constructor"
      }));
    }

    properties_1.defineReadOnly(this, "_isInterface", true);
  }

  Interface.prototype.format = function (format) {
    if (!format) {
      format = fragments_1.FormatTypes.full;
    }

    if (format === fragments_1.FormatTypes.sighash) {
      logger.throwArgumentError("interface does not support formatting sighash", "format", format);
    }

    var abi = this.fragments.map(function (fragment) {
      return fragment.format(format);
    }); // We need to re-bundle the JSON fragments a bit

    if (format === fragments_1.FormatTypes.json) {
      return JSON.stringify(abi.map(function (j) {
        return JSON.parse(j);
      }));
    }

    return abi;
  }; // Sub-classes can override these to handle other blockchains


  Interface.getAbiCoder = function () {
    return abi_coder_1.defaultAbiCoder;
  };

  Interface.getAddress = function (address) {
    return address_1.getAddress(address);
  };

  Interface.getSighash = function (functionFragment) {
    return bytes_1.hexDataSlice(hash_1.id(functionFragment.format()), 0, 4);
  };

  Interface.getEventTopic = function (eventFragment) {
    return hash_1.id(eventFragment.format());
  }; // Find a function definition by any means necessary (unless it is ambiguous)


  Interface.prototype.getFunction = function (nameOrSignatureOrSighash) {
    if (bytes_1.isHexString(nameOrSignatureOrSighash)) {
      for (var name_1 in this.functions) {
        if (nameOrSignatureOrSighash === this.getSighash(name_1)) {
          return this.functions[name_1];
        }
      }

      logger.throwArgumentError("no matching function", "sighash", nameOrSignatureOrSighash);
    } // It is a bare name, look up the function (will return null if ambiguous)


    if (nameOrSignatureOrSighash.indexOf("(") === -1) {
      var name_2 = nameOrSignatureOrSighash.trim();
      var matching = Object.keys(this.functions).filter(function (f) {
        return f.split("("
        /* fix:) */
        )[0] === name_2;
      });

      if (matching.length === 0) {
        logger.throwArgumentError("no matching function", "name", name_2);
      } else if (matching.length > 1) {
        logger.throwArgumentError("multiple matching functions", "name", name_2);
      }

      return this.functions[matching[0]];
    } // Normlize the signature and lookup the function


    var result = this.functions[fragments_1.FunctionFragment.fromString(nameOrSignatureOrSighash).format()];

    if (!result) {
      logger.throwArgumentError("no matching function", "signature", nameOrSignatureOrSighash);
    }

    return result;
  }; // Find an event definition by any means necessary (unless it is ambiguous)


  Interface.prototype.getEvent = function (nameOrSignatureOrTopic) {
    if (bytes_1.isHexString(nameOrSignatureOrTopic)) {
      var topichash = nameOrSignatureOrTopic.toLowerCase();

      for (var name_3 in this.events) {
        if (topichash === this.getEventTopic(name_3)) {
          return this.events[name_3];
        }
      }

      logger.throwArgumentError("no matching event", "topichash", topichash);
    } // It is a bare name, look up the function (will return null if ambiguous)


    if (nameOrSignatureOrTopic.indexOf("(") === -1) {
      var name_4 = nameOrSignatureOrTopic.trim();
      var matching = Object.keys(this.events).filter(function (f) {
        return f.split("("
        /* fix:) */
        )[0] === name_4;
      });

      if (matching.length === 0) {
        logger.throwArgumentError("no matching event", "name", name_4);
      } else if (matching.length > 1) {
        logger.throwArgumentError("multiple matching events", "name", name_4);
      }

      return this.events[matching[0]];
    } // Normlize the signature and lookup the function


    var result = this.events[fragments_1.EventFragment.fromString(nameOrSignatureOrTopic).format()];

    if (!result) {
      logger.throwArgumentError("no matching event", "signature", nameOrSignatureOrTopic);
    }

    return result;
  }; // Get the sighash (the bytes4 selector) used by Solidity to identify a function


  Interface.prototype.getSighash = function (functionFragment) {
    if (typeof functionFragment === "string") {
      functionFragment = this.getFunction(functionFragment);
    }

    return properties_1.getStatic(this.constructor, "getSighash")(functionFragment);
  }; // Get the topic (the bytes32 hash) used by Solidity to identify an event


  Interface.prototype.getEventTopic = function (eventFragment) {
    if (typeof eventFragment === "string") {
      eventFragment = this.getEvent(eventFragment);
    }

    return properties_1.getStatic(this.constructor, "getEventTopic")(eventFragment);
  };

  Interface.prototype._decodeParams = function (params, data) {
    return this._abiCoder.decode(params, data);
  };

  Interface.prototype._encodeParams = function (params, values) {
    return this._abiCoder.encode(params, values);
  };

  Interface.prototype.encodeDeploy = function (values) {
    return this._encodeParams(this.deploy.inputs, values || []);
  }; // Decode the data for a function call (e.g. tx.data)


  Interface.prototype.decodeFunctionData = function (functionFragment, data) {
    if (typeof functionFragment === "string") {
      functionFragment = this.getFunction(functionFragment);
    }

    var bytes = bytes_1.arrayify(data);

    if (bytes_1.hexlify(bytes.slice(0, 4)) !== this.getSighash(functionFragment)) {
      logger.throwArgumentError("data signature does not match function " + functionFragment.name + ".", "data", bytes_1.hexlify(bytes));
    }

    return this._decodeParams(functionFragment.inputs, bytes.slice(4));
  }; // Encode the data for a function call (e.g. tx.data)


  Interface.prototype.encodeFunctionData = function (functionFragment, values) {
    if (typeof functionFragment === "string") {
      functionFragment = this.getFunction(functionFragment);
    }

    return bytes_1.hexlify(bytes_1.concat([this.getSighash(functionFragment), this._encodeParams(functionFragment.inputs, values || [])]));
  }; // Decode the result from a function call (e.g. from eth_call)


  Interface.prototype.decodeFunctionResult = function (functionFragment, data) {
    if (typeof functionFragment === "string") {
      functionFragment = this.getFunction(functionFragment);
    }

    var bytes = bytes_1.arrayify(data);
    var reason = null;
    var errorSignature = null;

    switch (bytes.length % this._abiCoder._getWordSize()) {
      case 0:
        try {
          return this._abiCoder.decode(functionFragment.outputs, bytes);
        } catch (error) {}

        break;

      case 4:
        if (bytes_1.hexlify(bytes.slice(0, 4)) === "0x08c379a0") {
          errorSignature = "Error(string)";
          reason = this._abiCoder.decode(["string"], bytes.slice(4))[0];
        }

        break;
    }

    return logger.throwError("call revert exception", logger_1.Logger.errors.CALL_EXCEPTION, {
      method: functionFragment.format(),
      errorSignature: errorSignature,
      errorArgs: [reason],
      reason: reason
    });
  }; // Encode the result for a function call (e.g. for eth_call)


  Interface.prototype.encodeFunctionResult = function (functionFragment, values) {
    if (typeof functionFragment === "string") {
      functionFragment = this.getFunction(functionFragment);
    }

    return bytes_1.hexlify(this._abiCoder.encode(functionFragment.outputs, values || []));
  }; // Create the filter for the event with search criteria (e.g. for eth_filterLog)


  Interface.prototype.encodeFilterTopics = function (eventFragment, values) {
    var _this = this;

    if (typeof eventFragment === "string") {
      eventFragment = this.getEvent(eventFragment);
    }

    if (values.length > eventFragment.inputs.length) {
      logger.throwError("too many arguments for " + eventFragment.format(), logger_1.Logger.errors.UNEXPECTED_ARGUMENT, {
        argument: "values",
        value: values
      });
    }

    var topics = [];

    if (!eventFragment.anonymous) {
      topics.push(this.getEventTopic(eventFragment));
    }

    var encodeTopic = function encodeTopic(param, value) {
      if (param.type === "string") {
        return hash_1.id(value);
      } else if (param.type === "bytes") {
        return keccak256_1.keccak256(bytes_1.hexlify(value));
      } // Check addresses are valid


      if (param.type === "address") {
        _this._abiCoder.encode(["address"], [value]);
      }

      return bytes_1.hexZeroPad(bytes_1.hexlify(value), 32);
    };

    values.forEach(function (value, index) {
      var param = eventFragment.inputs[index];

      if (!param.indexed) {
        if (value != null) {
          logger.throwArgumentError("cannot filter non-indexed parameters; must be null", "contract." + param.name, value);
        }

        return;
      }

      if (value == null) {
        topics.push(null);
      } else if (param.baseType === "array" || param.baseType === "tuple") {
        logger.throwArgumentError("filtering with tuples or arrays not supported", "contract." + param.name, value);
      } else if (Array.isArray(value)) {
        topics.push(value.map(function (value) {
          return encodeTopic(param, value);
        }));
      } else {
        topics.push(encodeTopic(param, value));
      }
    }); // Trim off trailing nulls

    while (topics.length && topics[topics.length - 1] === null) {
      topics.pop();
    }

    return topics;
  };

  Interface.prototype.encodeEventLog = function (eventFragment, values) {
    var _this = this;

    if (typeof eventFragment === "string") {
      eventFragment = this.getEvent(eventFragment);
    }

    var topics = [];
    var dataTypes = [];
    var dataValues = [];

    if (!eventFragment.anonymous) {
      topics.push(this.getEventTopic(eventFragment));
    }

    if (values.length !== eventFragment.inputs.length) {
      logger.throwArgumentError("event arguments/values mismatch", "values", values);
    }

    eventFragment.inputs.forEach(function (param, index) {
      var value = values[index];

      if (param.indexed) {
        if (param.type === "string") {
          topics.push(hash_1.id(value));
        } else if (param.type === "bytes") {
          topics.push(keccak256_1.keccak256(value));
        } else if (param.baseType === "tuple" || param.baseType === "array") {
          // @TOOD
          throw new Error("not implemented");
        } else {
          topics.push(_this._abiCoder.encode([param.type], [value]));
        }
      } else {
        dataTypes.push(param);
        dataValues.push(value);
      }
    });
    return {
      data: this._abiCoder.encode(dataTypes, dataValues),
      topics: topics
    };
  }; // Decode a filter for the event and the search criteria


  Interface.prototype.decodeEventLog = function (eventFragment, data, topics) {
    if (typeof eventFragment === "string") {
      eventFragment = this.getEvent(eventFragment);
    }

    if (topics != null && !eventFragment.anonymous) {
      var topicHash = this.getEventTopic(eventFragment);

      if (!bytes_1.isHexString(topics[0], 32) || topics[0].toLowerCase() !== topicHash) {
        logger.throwError("fragment/topic mismatch", logger_1.Logger.errors.INVALID_ARGUMENT, {
          argument: "topics[0]",
          expected: topicHash,
          value: topics[0]
        });
      }

      topics = topics.slice(1);
    }

    var indexed = [];
    var nonIndexed = [];
    var dynamic = [];
    eventFragment.inputs.forEach(function (param, index) {
      if (param.indexed) {
        if (param.type === "string" || param.type === "bytes" || param.baseType === "tuple" || param.baseType === "array") {
          indexed.push(fragments_1.ParamType.fromObject({
            type: "bytes32",
            name: param.name
          }));
          dynamic.push(true);
        } else {
          indexed.push(param);
          dynamic.push(false);
        }
      } else {
        nonIndexed.push(param);
        dynamic.push(false);
      }
    });
    var resultIndexed = topics != null ? this._abiCoder.decode(indexed, bytes_1.concat(topics)) : null;

    var resultNonIndexed = this._abiCoder.decode(nonIndexed, data);

    var result = [];
    var nonIndexedIndex = 0,
        indexedIndex = 0;
    eventFragment.inputs.forEach(function (param, index) {
      if (param.indexed) {
        if (resultIndexed == null) {
          result[index] = new Indexed({
            _isIndexed: true,
            hash: null
          });
        } else if (dynamic[index]) {
          result[index] = new Indexed({
            _isIndexed: true,
            hash: resultIndexed[indexedIndex++]
          });
        } else {
          try {
            result[index] = resultIndexed[indexedIndex++];
          } catch (error) {
            result[index] = error;
          }
        }
      } else {
        try {
          result[index] = resultNonIndexed[nonIndexedIndex++];
        } catch (error) {
          result[index] = error;
        }
      } // Add the keyword argument if named and safe


      if (param.name && result[param.name] == null) {
        var value_1 = result[index]; // Make error named values throw on access

        if (value_1 instanceof Error) {
          Object.defineProperty(result, param.name, {
            get: function get() {
              throw wrapAccessError("property " + JSON.stringify(param.name), value_1);
            }
          });
        } else {
          result[param.name] = value_1;
        }
      }
    });

    var _loop_1 = function _loop_1(i) {
      var value = result[i];

      if (value instanceof Error) {
        Object.defineProperty(result, i, {
          get: function get() {
            throw wrapAccessError("index " + i, value);
          }
        });
      }
    }; // Make all error indexed values throw on access


    for (var i = 0; i < result.length; i++) {
      _loop_1(i);
    }

    return Object.freeze(result);
  }; // Given a transaction, find the matching function fragment (if any) and
  // determine all its properties and call parameters


  Interface.prototype.parseTransaction = function (tx) {
    var fragment = this.getFunction(tx.data.substring(0, 10).toLowerCase());

    if (!fragment) {
      return null;
    }

    return new TransactionDescription({
      args: this._abiCoder.decode(fragment.inputs, "0x" + tx.data.substring(10)),
      functionFragment: fragment,
      name: fragment.name,
      signature: fragment.format(),
      sighash: this.getSighash(fragment),
      value: bignumber_1.BigNumber.from(tx.value || "0")
    });
  }; // Given an event log, find the matching event fragment (if any) and
  // determine all its properties and values


  Interface.prototype.parseLog = function (log) {
    var fragment = this.getEvent(log.topics[0]);

    if (!fragment || fragment.anonymous) {
      return null;
    } // @TODO: If anonymous, and the only method, and the input count matches, should we parse?
    //        Probably not, because just because it is the only event in the ABI does
    //        not mean we have the full ABI; maybe jsut a fragment?


    return new LogDescription({
      eventFragment: fragment,
      name: fragment.name,
      signature: fragment.format(),
      topic: this.getEventTopic(fragment),
      args: this.decodeEventLog(fragment, log.data, log.topics)
    });
  };
  /*
  static from(value: Array<Fragment | string | JsonAbi> | string | Interface) {
      if (Interface.isInterface(value)) {
          return value;
      }
      if (typeof(value) === "string") {
          return new Interface(JSON.parse(value));
      }
      return new Interface(value);
  }
  */


  Interface.isInterface = function (value) {
    return !!(value && value._isInterface);
  };

  return Interface;
}();

exports.Interface = Interface;

},{"./_version":8,"./abi-coder":9,"./coders/abstract-coder":10,"./fragments":21,"@ethersproject/address":25,"@ethersproject/bignumber":29,"@ethersproject/bytes":31,"@ethersproject/hash":34,"@ethersproject/keccak256":35,"@ethersproject/logger":37,"@ethersproject/properties":39}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = "address/5.0.0-beta.134";

},{}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
}); // We use this for base 36 maths

var bn_js_1 = require("bn.js");

var bytes_1 = require("@ethersproject/bytes");

var bignumber_1 = require("@ethersproject/bignumber");

var keccak256_1 = require("@ethersproject/keccak256");

var rlp_1 = require("@ethersproject/rlp");

var logger_1 = require("@ethersproject/logger");

var _version_1 = require("./_version");

var logger = new logger_1.Logger(_version_1.version);

function getChecksumAddress(address) {
  if (!bytes_1.isHexString(address, 20)) {
    logger.throwArgumentError("invalid address", "address", address);
  }

  address = address.toLowerCase();
  var chars = address.substring(2).split("");
  var expanded = new Uint8Array(40);

  for (var i = 0; i < 40; i++) {
    expanded[i] = chars[i].charCodeAt(0);
  }

  var hashed = bytes_1.arrayify(keccak256_1.keccak256(expanded));

  for (var i = 0; i < 40; i += 2) {
    if (hashed[i >> 1] >> 4 >= 8) {
      chars[i] = chars[i].toUpperCase();
    }

    if ((hashed[i >> 1] & 0x0f) >= 8) {
      chars[i + 1] = chars[i + 1].toUpperCase();
    }
  }

  return "0x" + chars.join("");
} // Shims for environments that are missing some required constants and functions


var MAX_SAFE_INTEGER = 0x1fffffffffffff;

function log10(x) {
  if (Math.log10) {
    return Math.log10(x);
  }

  return Math.log(x) / Math.LN10;
} // See: https://en.wikipedia.org/wiki/International_Bank_Account_Number
// Create lookup table


var ibanLookup = {};

for (var i = 0; i < 10; i++) {
  ibanLookup[String(i)] = String(i);
}

for (var i = 0; i < 26; i++) {
  ibanLookup[String.fromCharCode(65 + i)] = String(10 + i);
} // How many decimal digits can we process? (for 64-bit float, this is 15)


var safeDigits = Math.floor(log10(MAX_SAFE_INTEGER));

function ibanChecksum(address) {
  address = address.toUpperCase();
  address = address.substring(4) + address.substring(0, 2) + "00";
  var expanded = address.split("").map(function (c) {
    return ibanLookup[c];
  }).join(""); // Javascript can handle integers safely up to 15 (decimal) digits

  while (expanded.length >= safeDigits) {
    var block = expanded.substring(0, safeDigits);
    expanded = parseInt(block, 10) % 97 + expanded.substring(block.length);
  }

  var checksum = String(98 - parseInt(expanded, 10) % 97);

  while (checksum.length < 2) {
    checksum = "0" + checksum;
  }

  return checksum;
}

;

function getAddress(address) {
  var result = null;

  if (typeof address !== "string") {
    logger.throwArgumentError("invalid address", "address", address);
  }

  if (address.match(/^(0x)?[0-9a-fA-F]{40}$/)) {
    // Missing the 0x prefix
    if (address.substring(0, 2) !== "0x") {
      address = "0x" + address;
    }

    result = getChecksumAddress(address); // It is a checksummed address with a bad checksum

    if (address.match(/([A-F].*[a-f])|([a-f].*[A-F])/) && result !== address) {
      logger.throwArgumentError("bad address checksum", "address", address);
    } // Maybe ICAP? (we only support direct mode)

  } else if (address.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {
    // It is an ICAP address with a bad checksum
    if (address.substring(2, 4) !== ibanChecksum(address)) {
      logger.throwArgumentError("bad icap checksum", "address", address);
    }

    result = new bn_js_1.BN(address.substring(4), 36).toString(16);

    while (result.length < 40) {
      result = "0" + result;
    }

    result = getChecksumAddress("0x" + result);
  } else {
    logger.throwArgumentError("invalid address", "address", address);
  }

  return result;
}

exports.getAddress = getAddress;

function isAddress(address) {
  try {
    getAddress(address);
    return true;
  } catch (error) {}

  return false;
}

exports.isAddress = isAddress;

function getIcapAddress(address) {
  var base36 = new bn_js_1.BN(getAddress(address).substring(2), 16).toString(36).toUpperCase();

  while (base36.length < 30) {
    base36 = "0" + base36;
  }

  return "XE" + ibanChecksum("XE00" + base36) + base36;
}

exports.getIcapAddress = getIcapAddress; // http://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed

function getContractAddress(transaction) {
  var from = null;

  try {
    from = getAddress(transaction.from);
  } catch (error) {
    logger.throwArgumentError("missing from address", "transaction", transaction);
  }

  var nonce = bytes_1.stripZeros(bytes_1.arrayify(bignumber_1.BigNumber.from(transaction.nonce).toHexString()));
  return getAddress(bytes_1.hexDataSlice(keccak256_1.keccak256(rlp_1.encode([from, nonce])), 12));
}

exports.getContractAddress = getContractAddress;

function getCreate2Address(from, salt, initCodeHash) {
  if (bytes_1.hexDataLength(salt) !== 32) {
    logger.throwArgumentError("salt must be 32 bytes", "salt", salt);
  }

  if (bytes_1.hexDataLength(initCodeHash) !== 32) {
    logger.throwArgumentError("initCodeHash must be 32 bytes", "initCodeHash", initCodeHash);
  }

  return getAddress(bytes_1.hexDataSlice(keccak256_1.keccak256(bytes_1.concat(["0xff", getAddress(from), salt, initCodeHash])), 12));
}

exports.getCreate2Address = getCreate2Address;

},{"./_version":24,"@ethersproject/bignumber":29,"@ethersproject/bytes":31,"@ethersproject/keccak256":35,"@ethersproject/logger":37,"@ethersproject/rlp":41,"bn.js":47}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = "bignumber/5.0.0-beta.138";

},{}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 *  BigNumber
 *
 *  A wrapper around the BN.js object. We use the BN.js library
 *  because it is used by elliptic, so it is required regardles.
 *
 */

var bn_js_1 = require("bn.js");

var bytes_1 = require("@ethersproject/bytes");

var logger_1 = require("@ethersproject/logger");

var _version_1 = require("./_version");

var logger = new logger_1.Logger(_version_1.version);
var _constructorGuard = {};
var MAX_SAFE = 0x1fffffffffffff;

function isBigNumberish(value) {
  return value != null && (BigNumber.isBigNumber(value) || typeof value === "number" && value % 1 === 0 || typeof value === "string" && !!value.match(/^-?[0-9]+$/) || bytes_1.isHexString(value) || typeof value === "bigint" || bytes_1.isBytes(value));
}

exports.isBigNumberish = isBigNumberish;

var BigNumber =
/** @class */
function () {
  function BigNumber(constructorGuard, hex) {
    var _newTarget = this.constructor;
    logger.checkNew(_newTarget, BigNumber);

    if (constructorGuard !== _constructorGuard) {
      logger.throwError("cannot call constructor directly; use BigNumber.from", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
        operation: "new (BigNumber)"
      });
    }

    this._hex = hex;
    this._isBigNumber = true;
    Object.freeze(this);
  }

  BigNumber.prototype.fromTwos = function (value) {
    return toBigNumber(toBN(this).fromTwos(value));
  };

  BigNumber.prototype.toTwos = function (value) {
    return toBigNumber(toBN(this).toTwos(value));
  };

  BigNumber.prototype.abs = function () {
    if (this._hex[0] === "-") {
      return BigNumber.from(this._hex.substring(1));
    }

    return this;
  };

  BigNumber.prototype.add = function (other) {
    return toBigNumber(toBN(this).add(toBN(other)));
  };

  BigNumber.prototype.sub = function (other) {
    return toBigNumber(toBN(this).sub(toBN(other)));
  };

  BigNumber.prototype.div = function (other) {
    var o = BigNumber.from(other);

    if (o.isZero()) {
      throwFault("division by zero", "div");
    }

    return toBigNumber(toBN(this).div(toBN(other)));
  };

  BigNumber.prototype.mul = function (other) {
    return toBigNumber(toBN(this).mul(toBN(other)));
  };

  BigNumber.prototype.mod = function (other) {
    var value = toBN(other);

    if (value.isNeg()) {
      throwFault("cannot modulo negative values", "mod");
    }

    return toBigNumber(toBN(this).umod(value));
  };

  BigNumber.prototype.pow = function (other) {
    return toBigNumber(toBN(this).pow(toBN(other)));
  };

  BigNumber.prototype.and = function (other) {
    var value = toBN(other);

    if (this.isNegative() || value.isNeg()) {
      throwFault("cannot 'and' negative values", "and");
    }

    return toBigNumber(toBN(this).and(value));
  };

  BigNumber.prototype.or = function (other) {
    var value = toBN(other);

    if (this.isNegative() || value.isNeg()) {
      throwFault("cannot 'or' negative values", "or");
    }

    return toBigNumber(toBN(this).or(value));
  };

  BigNumber.prototype.xor = function (other) {
    var value = toBN(other);

    if (this.isNegative() || value.isNeg()) {
      throwFault("cannot 'xor' negative values", "xor");
    }

    return toBigNumber(toBN(this).xor(value));
  };

  BigNumber.prototype.mask = function (value) {
    if (this.isNegative() || value < 0) {
      throwFault("cannot mask negative values", "mask");
    }

    return toBigNumber(toBN(this).maskn(value));
  };

  BigNumber.prototype.shl = function (value) {
    if (this.isNegative() || value < 0) {
      throwFault("cannot shift negative values", "shl");
    }

    return toBigNumber(toBN(this).shln(value));
  };

  BigNumber.prototype.shr = function (value) {
    if (this.isNegative() || value < 0) {
      throwFault("cannot shift negative values", "shr");
    }

    return toBigNumber(toBN(this).shrn(value));
  };

  BigNumber.prototype.eq = function (other) {
    return toBN(this).eq(toBN(other));
  };

  BigNumber.prototype.lt = function (other) {
    return toBN(this).lt(toBN(other));
  };

  BigNumber.prototype.lte = function (other) {
    return toBN(this).lte(toBN(other));
  };

  BigNumber.prototype.gt = function (other) {
    return toBN(this).gt(toBN(other));
  };

  BigNumber.prototype.gte = function (other) {
    return toBN(this).gte(toBN(other));
  };

  BigNumber.prototype.isNegative = function () {
    return this._hex[0] === "-";
  };

  BigNumber.prototype.isZero = function () {
    return toBN(this).isZero();
  };

  BigNumber.prototype.toNumber = function () {
    try {
      return toBN(this).toNumber();
    } catch (error) {
      throwFault("overflow", "toNumber", this.toString());
    }

    return null;
  };

  BigNumber.prototype.toString = function () {
    // Lots of people expect this, which we do not support, so check
    if (arguments.length !== 0) {
      logger.throwError("bigNumber.toString does not accept parameters", logger_1.Logger.errors.UNEXPECTED_ARGUMENT, {});
    }

    return toBN(this).toString(10);
  };

  BigNumber.prototype.toHexString = function () {
    return this._hex;
  };

  BigNumber.from = function (value) {
    if (value instanceof BigNumber) {
      return value;
    }

    if (typeof value === "string") {
      if (value.match(/-?0x[0-9a-f]+/i)) {
        return new BigNumber(_constructorGuard, toHex(value));
      }

      if (value.match(/^-?[0-9]+$/)) {
        return new BigNumber(_constructorGuard, toHex(new bn_js_1.BN(value)));
      }

      return logger.throwArgumentError("invalid BigNumber string", "value", value);
    }

    if (typeof value === "number") {
      if (value % 1) {
        throwFault("underflow", "BigNumber.from", value);
      }

      if (value >= MAX_SAFE || value <= -MAX_SAFE) {
        throwFault("overflow", "BigNumber.from", value);
      }

      return BigNumber.from(String(value));
    }

    if (typeof value === "bigint") {
      return BigNumber.from(value.toString());
    }

    if (bytes_1.isBytes(value)) {
      return BigNumber.from(bytes_1.hexlify(value));
    }

    if (value._hex && bytes_1.isHexString(value._hex)) {
      return BigNumber.from(value._hex);
    }

    if (value.toHexString) {
      value = value.toHexString();

      if (typeof value === "string") {
        return BigNumber.from(value);
      }
    }

    return logger.throwArgumentError("invalid BigNumber value", "value", value);
  };

  BigNumber.isBigNumber = function (value) {
    return !!(value && value._isBigNumber);
  };

  return BigNumber;
}();

exports.BigNumber = BigNumber; // Normalize the hex string

function toHex(value) {
  // For BN, call on the hex string
  if (typeof value !== "string") {
    return toHex(value.toString(16));
  } // If negative, prepend the negative sign to the normalized positive value


  if (value[0] === "-") {
    // Strip off the negative sign
    value = value.substring(1); // Cannot have mulitple negative signs (e.g. "--0x04")

    if (value[0] === "-") {
      logger.throwArgumentError("invalid hex", "value", value);
    } // Call toHex on the positive component


    value = toHex(value); // Do not allow "-0x00"

    if (value === "0x00") {
      return value;
    } // Negate the value


    return "-" + value;
  } // Add a "0x" prefix if missing


  if (value.substring(0, 2) !== "0x") {
    value = "0x" + value;
  } // Normalize zero


  if (value === "0x") {
    return "0x00";
  } // Make the string even length


  if (value.length % 2) {
    value = "0x0" + value.substring(2);
  } // Trim to smallest even-length string


  while (value.length > 4 && value.substring(0, 4) === "0x00") {
    value = "0x" + value.substring(4);
  }

  return value;
}

function toBigNumber(value) {
  return BigNumber.from(toHex(value));
}

function toBN(value) {
  var hex = BigNumber.from(value).toHexString();

  if (hex[0] === "-") {
    return new bn_js_1.BN("-" + hex.substring(3), 16);
  }

  return new bn_js_1.BN(hex.substring(2), 16);
}

function throwFault(fault, operation, value) {
  var params = {
    fault: fault,
    operation: operation
  };

  if (value != null) {
    params.value = value;
  }

  return logger.throwError(fault, logger_1.Logger.errors.NUMERIC_FAULT, params);
}

},{"./_version":26,"@ethersproject/bytes":31,"@ethersproject/logger":37,"bn.js":47}],28:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var bytes_1 = require("@ethersproject/bytes");

var logger_1 = require("@ethersproject/logger");

var _version_1 = require("./_version");

var logger = new logger_1.Logger(_version_1.version);

var bignumber_1 = require("./bignumber");

var _constructorGuard = {};
var Zero = bignumber_1.BigNumber.from(0);
var NegativeOne = bignumber_1.BigNumber.from(-1);

function throwFault(message, fault, operation, value) {
  var params = {
    fault: fault,
    operation: operation
  };

  if (value !== undefined) {
    params.value = value;
  }

  return logger.throwError(message, logger_1.Logger.errors.NUMERIC_FAULT, params);
} // Constant to pull zeros from for multipliers


var zeros = "0";

while (zeros.length < 256) {
  zeros += zeros;
} // Returns a string "1" followed by decimal "0"s


function getMultiplier(decimals) {
  if (typeof decimals !== "number") {
    try {
      decimals = bignumber_1.BigNumber.from(decimals).toNumber();
    } catch (e) {}
  }

  if (typeof decimals === "number" && decimals >= 0 && decimals <= 256 && !(decimals % 1)) {
    return "1" + zeros.substring(0, decimals);
  }

  return logger.throwArgumentError("invalid decimal size", "decimals", decimals);
}

function formatFixed(value, decimals) {
  if (decimals == null) {
    decimals = 0;
  }

  var multiplier = getMultiplier(decimals); // Make sure wei is a big number (convert as necessary)

  value = bignumber_1.BigNumber.from(value);
  var negative = value.lt(Zero);

  if (negative) {
    value = value.mul(NegativeOne);
  }

  var fraction = value.mod(multiplier).toString();

  while (fraction.length < multiplier.length - 1) {
    fraction = "0" + fraction;
  } // Strip training 0


  fraction = fraction.match(/^([0-9]*[1-9]|0)(0*)/)[1];
  var whole = value.div(multiplier).toString();
  value = whole + "." + fraction;

  if (negative) {
    value = "-" + value;
  }

  return value;
}

exports.formatFixed = formatFixed;

function parseFixed(value, decimals) {
  if (decimals == null) {
    decimals = 0;
  }

  var multiplier = getMultiplier(decimals);

  if (typeof value !== "string" || !value.match(/^-?[0-9.,]+$/)) {
    logger.throwArgumentError("invalid decimal value", "value", value);
  }

  if (multiplier.length - 1 === 0) {
    return bignumber_1.BigNumber.from(value);
  } // Is it negative?


  var negative = value.substring(0, 1) === "-";

  if (negative) {
    value = value.substring(1);
  }

  if (value === ".") {
    logger.throwArgumentError("missing value", "value", value);
  } // Split it into a whole and fractional part


  var comps = value.split(".");

  if (comps.length > 2) {
    logger.throwArgumentError("too many decimal points", "value", value);
  }

  var whole = comps[0],
      fraction = comps[1];

  if (!whole) {
    whole = "0";
  }

  if (!fraction) {
    fraction = "0";
  } // Prevent underflow


  if (fraction.length > multiplier.length - 1) {
    throwFault("fractional component exceeds decimals", "underflow", "parseFixed");
  } // Fully pad the string with zeros to get to wei


  while (fraction.length < multiplier.length - 1) {
    fraction += "0";
  }

  var wholeValue = bignumber_1.BigNumber.from(whole);
  var fractionValue = bignumber_1.BigNumber.from(fraction);
  var wei = wholeValue.mul(multiplier).add(fractionValue);

  if (negative) {
    wei = wei.mul(NegativeOne);
  }

  return wei;
}

exports.parseFixed = parseFixed;

var FixedFormat =
/** @class */
function () {
  function FixedFormat(constructorGuard, signed, width, decimals) {
    this.signed = signed;
    this.width = width;
    this.decimals = decimals;
    this.name = (signed ? "" : "u") + "fixed" + String(width) + "x" + String(decimals);
    this._multiplier = getMultiplier(decimals);
    Object.freeze(this);
  }

  FixedFormat.from = function (value) {
    if (value instanceof FixedFormat) {
      return value;
    }

    var signed = true;
    var width = 128;
    var decimals = 18;

    if (typeof value === "string") {
      if (value === "fixed") {// defaults...
      } else if (value === "ufixed") {
        signed = false;
      } else if (value != null) {
        var match = value.match(/^(u?)fixed([0-9]+)x([0-9]+)$/);

        if (!match) {
          logger.throwArgumentError("invalid fixed format", "format", value);
        }

        signed = match[1] !== "u";
        width = parseInt(match[2]);
        decimals = parseInt(match[3]);
      }
    } else if (value) {
      var check = function check(key, type, defaultValue) {
        if (value[key] == null) {
          return defaultValue;
        }

        if (_typeof(value[key]) !== type) {
          logger.throwArgumentError("invalid fixed format (" + key + " not " + type + ")", "format." + key, value[key]);
        }

        return value[key];
      };

      signed = check("signed", "boolean", signed);
      width = check("width", "number", width);
      decimals = check("decimals", "number", decimals);
    }

    if (width % 8) {
      logger.throwArgumentError("invalid fixed format width (not byte aligned)", "format.width", width);
    }

    if (decimals > 80) {
      logger.throwArgumentError("invalid fixed format (decimals too large)", "format.decimals", decimals);
    }

    return new FixedFormat(_constructorGuard, signed, width, decimals);
  };

  return FixedFormat;
}();

exports.FixedFormat = FixedFormat;

var FixedNumber =
/** @class */
function () {
  function FixedNumber(constructorGuard, hex, value, format) {
    var _newTarget = this.constructor;
    logger.checkNew(_newTarget, FixedNumber);
    this.format = format;
    this._hex = hex;
    this._value = value;
    this._isFixedNumber = true;
    Object.freeze(this);
  }

  FixedNumber.prototype._checkFormat = function (other) {
    if (this.format.name !== other.format.name) {
      logger.throwArgumentError("incompatible format; use fixedNumber.toFormat", "other", other);
    }
  };

  FixedNumber.prototype.addUnsafe = function (other) {
    this._checkFormat(other);

    var a = parseFixed(this._value, this.format.decimals);
    var b = parseFixed(other._value, other.format.decimals);
    return FixedNumber.fromValue(a.add(b), this.format.decimals, this.format);
  };

  FixedNumber.prototype.subUnsafe = function (other) {
    this._checkFormat(other);

    var a = parseFixed(this._value, this.format.decimals);
    var b = parseFixed(other._value, other.format.decimals);
    return FixedNumber.fromValue(a.sub(b), this.format.decimals, this.format);
  };

  FixedNumber.prototype.mulUnsafe = function (other) {
    this._checkFormat(other);

    var a = parseFixed(this._value, this.format.decimals);
    var b = parseFixed(other._value, other.format.decimals);
    return FixedNumber.fromValue(a.mul(b).div(this.format._multiplier), this.format.decimals, this.format);
  };

  FixedNumber.prototype.divUnsafe = function (other) {
    this._checkFormat(other);

    var a = parseFixed(this._value, this.format.decimals);
    var b = parseFixed(other._value, other.format.decimals);
    return FixedNumber.fromValue(a.mul(this.format._multiplier).div(b), this.format.decimals, this.format);
  }; // @TODO: Support other rounding algorithms


  FixedNumber.prototype.round = function (decimals) {
    if (decimals == null) {
      decimals = 0;
    }

    if (decimals < 0 || decimals > 80 || decimals % 1) {
      logger.throwArgumentError("invalid decimal count", "decimals", decimals);
    } // If we are already in range, we're done


    var comps = this.toString().split(".");

    if (comps[1].length <= decimals) {
      return this;
    } // Bump the value up by the 0.00...0005


    var bump = "0." + zeros.substring(0, decimals) + "5";
    comps = this.addUnsafe(FixedNumber.fromString(bump, this.format))._value.split("."); // Now it is safe to truncate

    return FixedNumber.fromString(comps[0] + "." + comps[1].substring(0, decimals));
  };

  FixedNumber.prototype.toString = function () {
    return this._value;
  };

  FixedNumber.prototype.toHexString = function (width) {
    if (width == null) {
      return this._hex;
    }

    if (width % 8) {
      logger.throwArgumentError("invalid byte width", "width", width);
    }

    var hex = bignumber_1.BigNumber.from(this._hex).fromTwos(this.format.width).toTwos(width).toHexString();
    return bytes_1.hexZeroPad(hex, width / 8);
  };

  FixedNumber.prototype.toUnsafeFloat = function () {
    return parseFloat(this.toString());
  };

  FixedNumber.prototype.toFormat = function (format) {
    return FixedNumber.fromString(this._value, format);
  };

  FixedNumber.fromValue = function (value, decimals, format) {
    // If decimals looks more like a format, and there is no format, shift the parameters
    if (format == null && decimals != null && !bignumber_1.isBigNumberish(decimals)) {
      format = decimals;
      decimals = null;
    }

    if (decimals == null) {
      decimals = 0;
    }

    if (format == null) {
      format = "fixed";
    }

    return FixedNumber.fromString(formatFixed(value, decimals), FixedFormat.from(format));
  };

  FixedNumber.fromString = function (value, format) {
    if (format == null) {
      format = "fixed";
    }

    var fixedFormat = FixedFormat.from(format);
    var numeric = parseFixed(value, fixedFormat.decimals);

    if (!fixedFormat.signed && numeric.lt(Zero)) {
      throwFault("unsigned value cannot be negative", "overflow", "value", value);
    }

    var hex = null;

    if (fixedFormat.signed) {
      hex = numeric.toTwos(fixedFormat.width).toHexString();
    } else {
      hex = numeric.toHexString();
      hex = bytes_1.hexZeroPad(hex, fixedFormat.width / 8);
    }

    var decimal = formatFixed(numeric, fixedFormat.decimals);
    return new FixedNumber(_constructorGuard, hex, decimal, fixedFormat);
  };

  FixedNumber.fromBytes = function (value, format) {
    if (format == null) {
      format = "fixed";
    }

    var fixedFormat = FixedFormat.from(format);

    if (bytes_1.arrayify(value).length > fixedFormat.width / 8) {
      throw new Error("overflow");
    }

    var numeric = bignumber_1.BigNumber.from(value);

    if (fixedFormat.signed) {
      numeric = numeric.fromTwos(fixedFormat.width);
    }

    var hex = numeric.toTwos((fixedFormat.signed ? 0 : 1) + fixedFormat.width).toHexString();
    var decimal = formatFixed(numeric, fixedFormat.decimals);
    return new FixedNumber(_constructorGuard, hex, decimal, fixedFormat);
  };

  FixedNumber.from = function (value, format) {
    if (typeof value === "string") {
      return FixedNumber.fromString(value, format);
    }

    if (bytes_1.isBytes(value)) {
      return FixedNumber.fromBytes(value, format);
    }

    try {
      return FixedNumber.fromValue(value, 0, format);
    } catch (error) {
      // Allow NUMERIC_FAULT to bubble up
      if (error.code !== logger_1.Logger.errors.INVALID_ARGUMENT) {
        throw error;
      }
    }

    return logger.throwArgumentError("invalid FixedNumber value", "value", value);
  };

  FixedNumber.isFixedNumber = function (value) {
    return !!(value && value._isFixedNumber);
  };

  return FixedNumber;
}();

exports.FixedNumber = FixedNumber;

},{"./_version":26,"./bignumber":27,"@ethersproject/bytes":31,"@ethersproject/logger":37}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var bignumber_1 = require("./bignumber");

exports.BigNumber = bignumber_1.BigNumber;

var fixednumber_1 = require("./fixednumber");

exports.formatFixed = fixednumber_1.formatFixed;
exports.FixedFormat = fixednumber_1.FixedFormat;
exports.FixedNumber = fixednumber_1.FixedNumber;
exports.parseFixed = fixednumber_1.parseFixed;

},{"./bignumber":27,"./fixednumber":28}],30:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = "bytes/5.0.0-beta.137";

},{}],31:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var logger_1 = require("@ethersproject/logger");

var _version_1 = require("./_version");

var logger = new logger_1.Logger(_version_1.version); ///////////////////////////////

function isHexable(value) {
  return !!value.toHexString;
}

function addSlice(array) {
  if (array.slice) {
    return array;
  }

  array.slice = function () {
    var args = Array.prototype.slice.call(arguments);
    return addSlice(new Uint8Array(Array.prototype.slice.apply(array, args)));
  };

  return array;
}

function isBytesLike(value) {
  return isHexString(value) && !(value.length % 2) || isBytes(value);
}

exports.isBytesLike = isBytesLike;

function isBytes(value) {
  if (value == null) {
    return false;
  }

  if (value.constructor === Uint8Array) {
    return true;
  }

  if (typeof value === "string") {
    return false;
  }

  if (value.length == null) {
    return false;
  }

  for (var i = 0; i < value.length; i++) {
    var v = value[i];

    if (v < 0 || v >= 256 || v % 1) {
      return false;
    }
  }

  return true;
}

exports.isBytes = isBytes;

function arrayify(value, options) {
  if (!options) {
    options = {};
  }

  if (typeof value === "number") {
    logger.checkSafeUint53(value, "invalid arrayify value");
    var result = [];

    while (value) {
      result.unshift(value & 0xff);
      value = parseInt(String(value / 256));
    }

    if (result.length === 0) {
      result.push(0);
    }

    return addSlice(new Uint8Array(result));
  }

  if (options.allowMissingPrefix && typeof value === "string" && value.substring(0, 2) !== "0x") {
    value = "0x" + value;
  }

  if (isHexable(value)) {
    value = value.toHexString();
  }

  if (isHexString(value)) {
    var hex = value.substring(2);

    if (hex.length % 2) {
      if (options.hexPad === "left") {
        hex = "0x0" + hex.substring(2);
      } else if (options.hexPad === "right") {
        hex += "0";
      } else {
        logger.throwArgumentError("hex data is odd-length", "value", value);
      }
    }

    var result = [];

    for (var i = 0; i < hex.length; i += 2) {
      result.push(parseInt(hex.substring(i, i + 2), 16));
    }

    return addSlice(new Uint8Array(result));
  }

  if (isBytes(value)) {
    return addSlice(new Uint8Array(value));
  }

  return logger.throwArgumentError("invalid arrayify value", "value", value);
}

exports.arrayify = arrayify;

function concat(items) {
  var objects = items.map(function (item) {
    return arrayify(item);
  });
  var length = objects.reduce(function (accum, item) {
    return accum + item.length;
  }, 0);
  var result = new Uint8Array(length);
  objects.reduce(function (offset, object) {
    result.set(object, offset);
    return offset + object.length;
  }, 0);
  return addSlice(result);
}

exports.concat = concat;

function stripZeros(value) {
  var result = arrayify(value);

  if (result.length === 0) {
    return result;
  } // Find the first non-zero entry


  var start = 0;

  while (start < result.length && result[start] === 0) {
    start++;
  } // If we started with zeros, strip them


  if (start) {
    result = result.slice(start);
  }

  return result;
}

exports.stripZeros = stripZeros;

function zeroPad(value, length) {
  value = arrayify(value);

  if (value.length > length) {
    logger.throwArgumentError("value out of range", "value", arguments[0]);
  }

  var result = new Uint8Array(length);
  result.set(value, length - value.length);
  return addSlice(result);
}

exports.zeroPad = zeroPad;

function isHexString(value, length) {
  if (typeof value !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
    return false;
  }

  if (length && value.length !== 2 + 2 * length) {
    return false;
  }

  return true;
}

exports.isHexString = isHexString;
var HexCharacters = "0123456789abcdef";

function hexlify(value, options) {
  if (!options) {
    options = {};
  }

  if (typeof value === "number") {
    logger.checkSafeUint53(value, "invalid hexlify value");
    var hex = "";

    while (value) {
      hex = HexCharacters[value & 0x0f] + hex;
      value = Math.floor(value / 16);
    }

    if (hex.length) {
      if (hex.length % 2) {
        hex = "0" + hex;
      }

      return "0x" + hex;
    }

    return "0x00";
  }

  if (options.allowMissingPrefix && typeof value === "string" && value.substring(0, 2) !== "0x") {
    value = "0x" + value;
  }

  if (isHexable(value)) {
    return value.toHexString();
  }

  if (isHexString(value)) {
    if (value.length % 2) {
      if (options.hexPad === "left") {
        value = "0x0" + value.substring(2);
      } else if (options.hexPad === "right") {
        value += "0";
      } else {
        logger.throwArgumentError("hex data is odd-length", "value", value);
      }
    }

    return value.toLowerCase();
  }

  if (isBytes(value)) {
    var result = "0x";

    for (var i = 0; i < value.length; i++) {
      var v = value[i];
      result += HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f];
    }

    return result;
  }

  return logger.throwArgumentError("invalid hexlify value", "value", value);
}

exports.hexlify = hexlify;
/*
function unoddify(value: BytesLike | Hexable | number): BytesLike | Hexable | number {
    if (typeof(value) === "string" && value.length % 2 && value.substring(0, 2) === "0x") {
        return "0x0" + value.substring(2);
    }
    return value;
}
*/

function hexDataLength(data) {
  if (typeof data !== "string") {
    data = hexlify(data);
  } else if (!isHexString(data) || data.length % 2) {
    return null;
  }

  return (data.length - 2) / 2;
}

exports.hexDataLength = hexDataLength;

function hexDataSlice(data, offset, endOffset) {
  if (typeof data !== "string") {
    data = hexlify(data);
  } else if (!isHexString(data) || data.length % 2) {
    logger.throwArgumentError("invalid hexData", "value", data);
  }

  offset = 2 + 2 * offset;

  if (endOffset != null) {
    return "0x" + data.substring(offset, 2 + 2 * endOffset);
  }

  return "0x" + data.substring(offset);
}

exports.hexDataSlice = hexDataSlice;

function hexConcat(items) {
  var result = "0x";
  items.forEach(function (item) {
    result += hexlify(item).substring(2);
  });
  return result;
}

exports.hexConcat = hexConcat;

function hexValue(value) {
  var trimmed = hexStripZeros(hexlify(value, {
    hexPad: "left"
  }));

  if (trimmed === "0x") {
    return "0x0";
  }

  return trimmed;
}

exports.hexValue = hexValue;

function hexStripZeros(value) {
  if (typeof value !== "string") {
    value = hexlify(value);
  }

  if (!isHexString(value)) {
    logger.throwArgumentError("invalid hex string", "value", value);
  }

  value = value.substring(2);
  var offset = 0;

  while (offset < value.length && value[offset] === "0") {
    offset++;
  }

  return "0x" + value.substring(offset);
}

exports.hexStripZeros = hexStripZeros;

function hexZeroPad(value, length) {
  if (typeof value !== "string") {
    value = hexlify(value);
  } else if (!isHexString(value)) {
    logger.throwArgumentError("invalid hex string", "value", value);
  }

  if (value.length > 2 * length + 2) {
    logger.throwArgumentError("value out of range", "value", arguments[1]);
  }

  while (value.length < 2 * length + 2) {
    value = "0x0" + value.substring(2);
  }

  return value;
}

exports.hexZeroPad = hexZeroPad;

function splitSignature(signature) {
  var result = {
    r: "0x",
    s: "0x",
    _vs: "0x",
    recoveryParam: 0,
    v: 0
  };

  if (isBytesLike(signature)) {
    var bytes = arrayify(signature);

    if (bytes.length !== 65) {
      logger.throwArgumentError("invalid signature string; must be 65 bytes", "signature", signature);
    } // Get the r, s and v


    result.r = hexlify(bytes.slice(0, 32));
    result.s = hexlify(bytes.slice(32, 64));
    result.v = bytes[64]; // Compute recoveryParam from v

    result.recoveryParam = 1 - result.v % 2; // Allow a recid to be used as the v

    if (result.v < 27) {
      if (result.v === 0 || result.v === 1) {
        result.v += 27;
      } else {
        logger.throwArgumentError("signature invalid v byte", "signature", signature);
      }
    } // Compute _vs from recoveryParam and s


    if (result.recoveryParam) {
      bytes[32] |= 0x80;
    }

    result._vs = hexlify(bytes.slice(32, 64));
  } else {
    result.r = signature.r;
    result.s = signature.s;
    result.v = signature.v;
    result.recoveryParam = signature.recoveryParam;
    result._vs = signature._vs; // If the _vs is available, use it to populate missing s, v and recoveryParam
    // and verify non-missing s, v and recoveryParam

    if (result._vs != null) {
      var vs_1 = zeroPad(arrayify(result._vs), 32);
      result._vs = hexlify(vs_1); // Set or check the recid

      var recoveryParam = vs_1[0] >= 128 ? 1 : 0;

      if (result.recoveryParam == null) {
        result.recoveryParam = recoveryParam;
      } else if (result.recoveryParam !== recoveryParam) {
        logger.throwArgumentError("signature recoveryParam mismatch _vs", "signature", signature);
      } // Set or check the s


      vs_1[0] &= 0x7f;
      var s = hexlify(vs_1);

      if (result.s == null) {
        result.s = s;
      } else if (result.s !== s) {
        logger.throwArgumentError("signature v mismatch _vs", "signature", signature);
      }
    } // Use recid and v to populate each other


    if (result.recoveryParam == null) {
      if (result.v == null) {
        logger.throwArgumentError("signature missing v and recoveryParam", "signature", signature);
      } else {
        result.recoveryParam = 1 - result.v % 2;
      }
    } else {
      if (result.v == null) {
        result.v = 27 + result.recoveryParam;
      } else if (result.recoveryParam !== 1 - result.v % 2) {
        logger.throwArgumentError("signature recoveryParam mismatch v", "signature", signature);
      }
    }

    if (result.r == null || !isHexString(result.r)) {
      logger.throwArgumentError("signature missing or invalid r", "signature", signature);
    } else {
      result.r = hexZeroPad(result.r, 32);
    }

    if (result.s == null || !isHexString(result.s)) {
      logger.throwArgumentError("signature missing or invalid s", "signature", signature);
    } else {
      result.s = hexZeroPad(result.s, 32);
    }

    var vs = arrayify(result.s);

    if (vs[0] >= 128) {
      logger.throwArgumentError("signature s out of range", "signature", signature);
    }

    if (result.recoveryParam) {
      vs[0] |= 0x80;
    }

    var _vs = hexlify(vs);

    if (result._vs) {
      if (!isHexString(result._vs)) {
        logger.throwArgumentError("signature invalid _vs", "signature", signature);
      }

      result._vs = hexZeroPad(result._vs, 32);
    } // Set or check the _vs


    if (result._vs == null) {
      result._vs = _vs;
    } else if (result._vs !== _vs) {
      logger.throwArgumentError("signature _vs mismatch v and s", "signature", signature);
    }
  }

  return result;
}

exports.splitSignature = splitSignature;

function joinSignature(signature) {
  signature = splitSignature(signature);
  return hexlify(concat([signature.r, signature.s, signature.recoveryParam ? "0x1c" : "0x1b"]));
}

exports.joinSignature = joinSignature;

},{"./_version":30,"@ethersproject/logger":37}],32:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var bignumber_1 = require("@ethersproject/bignumber");

var AddressZero = "0x0000000000000000000000000000000000000000";
exports.AddressZero = AddressZero;
var HashZero = "0x0000000000000000000000000000000000000000000000000000000000000000";
exports.HashZero = HashZero; // NFKC (composed)             // (decomposed)

var EtherSymbol = "\u039E"; // "\uD835\uDF63";

exports.EtherSymbol = EtherSymbol;
var NegativeOne = bignumber_1.BigNumber.from(-1);
exports.NegativeOne = NegativeOne;
var Zero = bignumber_1.BigNumber.from(0);
exports.Zero = Zero;
var One = bignumber_1.BigNumber.from(1);
exports.One = One;
var Two = bignumber_1.BigNumber.from(2);
exports.Two = Two;
var WeiPerEther = bignumber_1.BigNumber.from("1000000000000000000");
exports.WeiPerEther = WeiPerEther;
var MaxUint256 = bignumber_1.BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
exports.MaxUint256 = MaxUint256;

},{"@ethersproject/bignumber":29}],33:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = "hash/5.0.0-beta.133";

},{}],34:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var bytes_1 = require("@ethersproject/bytes");

var strings_1 = require("@ethersproject/strings");

var keccak256_1 = require("@ethersproject/keccak256");

var logger_1 = require("@ethersproject/logger");

var _version_1 = require("./_version");

var logger = new logger_1.Logger(_version_1.version); ///////////////////////////////

var Zeros = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
var Partition = new RegExp("^((.*)\\.)?([^.]+)$");

function isValidName(name) {
  try {
    var comps = name.split(".");

    for (var i = 0; i < comps.length; i++) {
      if (strings_1.nameprep(comps[i]).length === 0) {
        throw new Error("empty");
      }
    }

    return true;
  } catch (error) {}

  return false;
}

exports.isValidName = isValidName;

function namehash(name) {
  if (typeof name !== "string") {
    logger.throwArgumentError("invalid address - " + String(name), "name", name);
  }

  var result = Zeros;

  while (name.length) {
    var partition = name.match(Partition);
    var label = strings_1.toUtf8Bytes(strings_1.nameprep(partition[3]));
    result = keccak256_1.keccak256(bytes_1.concat([result, keccak256_1.keccak256(label)]));
    name = partition[2] || "";
  }

  return bytes_1.hexlify(result);
}

exports.namehash = namehash;

function id(text) {
  return keccak256_1.keccak256(strings_1.toUtf8Bytes(text));
}

exports.id = id;
exports.messagePrefix = "\x19Ethereum Signed Message:\n";

function hashMessage(message) {
  if (typeof message === "string") {
    message = strings_1.toUtf8Bytes(message);
  }

  return keccak256_1.keccak256(bytes_1.concat([strings_1.toUtf8Bytes(exports.messagePrefix), strings_1.toUtf8Bytes(String(message.length)), message]));
}

exports.hashMessage = hashMessage;

},{"./_version":33,"@ethersproject/bytes":31,"@ethersproject/keccak256":35,"@ethersproject/logger":37,"@ethersproject/strings":45}],35:[function(require,module,exports){
"use strict";

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var js_sha3_1 = __importDefault(require("js-sha3"));

var bytes_1 = require("@ethersproject/bytes");

function keccak256(data) {
  return '0x' + js_sha3_1.default.keccak_256(bytes_1.arrayify(data));
}

exports.keccak256 = keccak256;

},{"@ethersproject/bytes":31,"js-sha3":48}],36:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = "logger/5.0.0-beta.137";

},{}],37:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _permanentCensorErrors = false;
var _censorErrors = false;
var LogLevels = {
  debug: 1,
  "default": 2,
  info: 2,
  warning: 3,
  error: 4,
  off: 5
};
var _logLevel = LogLevels["default"];

var _version_1 = require("./_version");

var _globalLogger = null;

function _checkNormalize() {
  try {
    var missing_1 = []; // Make sure all forms of normalization are supported

    ["NFD", "NFC", "NFKD", "NFKC"].forEach(function (form) {
      try {
        if ("test".normalize(form) !== "test") {
          throw new Error("bad normalize");
        }

        ;
      } catch (error) {
        missing_1.push(form);
      }
    });

    if (missing_1.length) {
      throw new Error("missing " + missing_1.join(", "));
    }

    if (String.fromCharCode(0xe9).normalize("NFD") !== String.fromCharCode(0x65, 0x0301)) {
      throw new Error("broken implementation");
    }
  } catch (error) {
    return error.message;
  }

  return null;
}

var _normalizeError = _checkNormalize();

var LogLevel;

(function (LogLevel) {
  LogLevel["DEBUG"] = "DEBUG";
  LogLevel["INFO"] = "INFO";
  LogLevel["WARNING"] = "WARNING";
  LogLevel["ERROR"] = "ERROR";
  LogLevel["OFF"] = "OFF";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));

var ErrorCode;

(function (ErrorCode) {
  ///////////////////
  // Generic Errors
  // Unknown Error
  ErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR"; // Not Implemented

  ErrorCode["NOT_IMPLEMENTED"] = "NOT_IMPLEMENTED"; // Unsupported Operation
  //   - operation

  ErrorCode["UNSUPPORTED_OPERATION"] = "UNSUPPORTED_OPERATION"; // Network Error (i.e. Ethereum Network, such as an invalid chain ID)

  ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR"; // Some sort of bad response from the server

  ErrorCode["SERVER_ERROR"] = "SERVER_ERROR"; // Timeout

  ErrorCode["TIMEOUT"] = "TIMEOUT"; ///////////////////
  // Operational  Errors
  // Buffer Overrun

  ErrorCode["BUFFER_OVERRUN"] = "BUFFER_OVERRUN"; // Numeric Fault
  //   - operation: the operation being executed
  //   - fault: the reason this faulted

  ErrorCode["NUMERIC_FAULT"] = "NUMERIC_FAULT"; ///////////////////
  // Argument Errors
  // Missing new operator to an object
  //  - name: The name of the class

  ErrorCode["MISSING_NEW"] = "MISSING_NEW"; // Invalid argument (e.g. value is incompatible with type) to a function:
  //   - argument: The argument name that was invalid
  //   - value: The value of the argument

  ErrorCode["INVALID_ARGUMENT"] = "INVALID_ARGUMENT"; // Missing argument to a function:
  //   - count: The number of arguments received
  //   - expectedCount: The number of arguments expected

  ErrorCode["MISSING_ARGUMENT"] = "MISSING_ARGUMENT"; // Too many arguments
  //   - count: The number of arguments received
  //   - expectedCount: The number of arguments expected

  ErrorCode["UNEXPECTED_ARGUMENT"] = "UNEXPECTED_ARGUMENT"; ///////////////////
  // Blockchain Errors
  // Call exception
  //  - transaction: the transaction
  //  - address?: the contract address
  //  - args?: The arguments passed into the function
  //  - method?: The Solidity method signature
  //  - errorSignature?: The EIP848 error signature
  //  - errorArgs?: The EIP848 error parameters
  //  - reason: The reason (only for EIP848 "Error(string)")

  ErrorCode["CALL_EXCEPTION"] = "CALL_EXCEPTION"; // Insufficien funds (< value + gasLimit * gasPrice)
  //   - transaction: the transaction attempted

  ErrorCode["INSUFFICIENT_FUNDS"] = "INSUFFICIENT_FUNDS"; // Nonce has already been used
  //   - transaction: the transaction attempted

  ErrorCode["NONCE_EXPIRED"] = "NONCE_EXPIRED"; // The replacement fee for the transaction is too low
  //   - transaction: the transaction attempted

  ErrorCode["REPLACEMENT_UNDERPRICED"] = "REPLACEMENT_UNDERPRICED"; // The gas limit could not be estimated
  //   - transaction: the transaction passed to estimateGas

  ErrorCode["UNPREDICTABLE_GAS_LIMIT"] = "UNPREDICTABLE_GAS_LIMIT";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));

;

var Logger =
/** @class */
function () {
  function Logger(version) {
    Object.defineProperty(this, "version", {
      enumerable: true,
      value: version,
      writable: false
    });
  }

  Logger.prototype._log = function (logLevel, args) {
    var level = logLevel.toLowerCase();

    if (LogLevels[level] == null) {
      this.throwArgumentError("invalid log level name", "logLevel", logLevel);
    }

    if (_logLevel > LogLevels[level]) {
      return;
    }

    console.log.apply(console, args);
  };

  Logger.prototype.debug = function () {
    var args = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }

    this._log(Logger.levels.DEBUG, args);
  };

  Logger.prototype.info = function () {
    var args = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }

    this._log(Logger.levels.INFO, args);
  };

  Logger.prototype.warn = function () {
    var args = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }

    this._log(Logger.levels.WARNING, args);
  };

  Logger.prototype.makeError = function (message, code, params) {
    // Errors are being censored
    if (_censorErrors) {
      return this.makeError("censored error", code, {});
    }

    if (!code) {
      code = Logger.errors.UNKNOWN_ERROR;
    }

    if (!params) {
      params = {};
    }

    var messageDetails = [];
    Object.keys(params).forEach(function (key) {
      try {
        messageDetails.push(key + "=" + JSON.stringify(params[key]));
      } catch (error) {
        messageDetails.push(key + "=" + JSON.stringify(params[key].toString()));
      }
    });
    messageDetails.push("code=" + code);
    messageDetails.push("version=" + this.version);
    var reason = message;

    if (messageDetails.length) {
      message += " (" + messageDetails.join(", ") + ")";
    } // @TODO: Any??


    var error = new Error(message);
    error.reason = reason;
    error.code = code;
    Object.keys(params).forEach(function (key) {
      error[key] = params[key];
    });
    return error;
  };

  Logger.prototype.throwError = function (message, code, params) {
    throw this.makeError(message, code, params);
  };

  Logger.prototype.throwArgumentError = function (message, name, value) {
    return this.throwError(message, Logger.errors.INVALID_ARGUMENT, {
      argument: name,
      value: value
    });
  };

  Logger.prototype.checkNormalize = function (message) {
    if (message == null) {
      message = "platform missing String.prototype.normalize";
    }

    if (_normalizeError) {
      this.throwError("platform missing String.prototype.normalize", Logger.errors.UNSUPPORTED_OPERATION, {
        operation: "String.prototype.normalize",
        form: _normalizeError
      });
    }
  };

  Logger.prototype.checkSafeUint53 = function (value, message) {
    if (typeof value !== "number") {
      return;
    }

    if (message == null) {
      message = "value not safe";
    }

    if (value < 0 || value >= 0x1fffffffffffff) {
      this.throwError(message, Logger.errors.NUMERIC_FAULT, {
        operation: "checkSafeInteger",
        fault: "out-of-safe-range",
        value: value
      });
    }

    if (value % 1) {
      this.throwError(message, Logger.errors.NUMERIC_FAULT, {
        operation: "checkSafeInteger",
        fault: "non-integer",
        value: value
      });
    }
  };

  Logger.prototype.checkArgumentCount = function (count, expectedCount, message) {
    if (message) {
      message = ": " + message;
    } else {
      message = "";
    }

    if (count < expectedCount) {
      this.throwError("missing argument" + message, Logger.errors.MISSING_ARGUMENT, {
        count: count,
        expectedCount: expectedCount
      });
    }

    if (count > expectedCount) {
      this.throwError("too many arguments" + message, Logger.errors.UNEXPECTED_ARGUMENT, {
        count: count,
        expectedCount: expectedCount
      });
    }
  };

  Logger.prototype.checkNew = function (target, kind) {
    if (target === Object || target == null) {
      this.throwError("missing new", Logger.errors.MISSING_NEW, {
        name: kind.name
      });
    }
  };

  Logger.prototype.checkAbstract = function (target, kind) {
    if (target === kind) {
      this.throwError("cannot instantiate abstract class " + JSON.stringify(kind.name) + " directly; use a sub-class", Logger.errors.UNSUPPORTED_OPERATION, {
        name: target.name,
        operation: "new"
      });
    } else if (target === Object || target == null) {
      this.throwError("missing new", Logger.errors.MISSING_NEW, {
        name: kind.name
      });
    }
  };

  Logger.globalLogger = function () {
    if (!_globalLogger) {
      _globalLogger = new Logger(_version_1.version);
    }

    return _globalLogger;
  };

  Logger.setCensorship = function (censorship, permanent) {
    if (!censorship && permanent) {
      this.globalLogger().throwError("cannot permanently disable censorship", Logger.errors.UNSUPPORTED_OPERATION, {
        operation: "setCensorship"
      });
    }

    if (_permanentCensorErrors) {
      if (!censorship) {
        return;
      }

      this.globalLogger().throwError("error censorship permanent", Logger.errors.UNSUPPORTED_OPERATION, {
        operation: "setCensorship"
      });
    }

    _censorErrors = !!censorship;
    _permanentCensorErrors = !!permanent;
  };

  Logger.setLogLevel = function (logLevel) {
    var level = LogLevels[logLevel];

    if (level == null) {
      Logger.globalLogger().warn("invalid log level - " + logLevel);
      return;
    }

    _logLevel = level;
  };

  Logger.errors = ErrorCode;
  Logger.levels = LogLevel;
  return Logger;
}();

exports.Logger = Logger;

},{"./_version":36}],38:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = "properties/5.0.0-beta.140";

},{}],39:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = void 0 && (void 0).__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var logger_1 = require("@ethersproject/logger");

var _version_1 = require("./_version");

var logger = new logger_1.Logger(_version_1.version);

function defineReadOnly(object, name, value) {
  Object.defineProperty(object, name, {
    enumerable: true,
    value: value,
    writable: false
  });
}

exports.defineReadOnly = defineReadOnly; // Crawl up the constructor chain to find a static method

function getStatic(ctor, key) {
  for (var i = 0; i < 32; i++) {
    if (ctor[key]) {
      return ctor[key];
    }

    if (!ctor.prototype || _typeof(ctor.prototype) !== "object") {
      break;
    }

    ctor = Object.getPrototypeOf(ctor.prototype).constructor;
  }

  return null;
}

exports.getStatic = getStatic;

function resolveProperties(object) {
  return __awaiter(this, void 0, void 0, function () {
    var promises, results;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          promises = Object.keys(object).map(function (key) {
            var value = object[key];
            return Promise.resolve(value).then(function (v) {
              return {
                key: key,
                value: v
              };
            });
          });
          return [4
          /*yield*/
          , Promise.all(promises)];

        case 1:
          results = _a.sent();
          return [2
          /*return*/
          , results.reduce(function (accum, result) {
            accum[result.key] = result.value;
            return accum;
          }, {})];
      }
    });
  });
}

exports.resolveProperties = resolveProperties;

function checkProperties(object, properties) {
  if (!object || _typeof(object) !== "object") {
    logger.throwArgumentError("invalid object", "object", object);
  }

  Object.keys(object).forEach(function (key) {
    if (!properties[key]) {
      logger.throwArgumentError("invalid object key - " + key, "transaction:" + key, object);
    }
  });
}

exports.checkProperties = checkProperties;

function shallowCopy(object) {
  var result = {};

  for (var key in object) {
    result[key] = object[key];
  }

  return result;
}

exports.shallowCopy = shallowCopy;
var opaque = {
  bigint: true,
  boolean: true,
  "function": true,
  number: true,
  string: true
};

function _isFrozen(object) {
  // Opaque objects are not mutable, so safe to copy by assignment
  if (object === undefined || object === null || opaque[_typeof(object)]) {
    return true;
  }

  if (Array.isArray(object) || _typeof(object) === "object") {
    if (!Object.isFrozen(object)) {
      return false;
    }

    var keys = Object.keys(object);

    for (var i = 0; i < keys.length; i++) {
      if (!_isFrozen(object[keys[i]])) {
        return false;
      }
    }

    return true;
  }

  return logger.throwArgumentError("Cannot deepCopy " + _typeof(object), "object", object);
} // Returns a new copy of object, such that no properties may be replaced.
// New properties may be added only to objects.


function _deepCopy(object) {
  if (_isFrozen(object)) {
    return object;
  } // Arrays are mutable, so we need to create a copy


  if (Array.isArray(object)) {
    return Object.freeze(object.map(function (item) {
      return deepCopy(item);
    }));
  }

  if (_typeof(object) === "object") {
    var result = {};

    for (var key in object) {
      var value = object[key];

      if (value === undefined) {
        continue;
      }

      defineReadOnly(result, key, deepCopy(value));
    }

    return result;
  }

  return logger.throwArgumentError("Cannot deepCopy " + _typeof(object), "object", object);
}

function deepCopy(object) {
  return _deepCopy(object);
}

exports.deepCopy = deepCopy;

var Description =
/** @class */
function () {
  function Description(info) {
    for (var key in info) {
      this[key] = deepCopy(info[key]);
    }
  }

  return Description;
}();

exports.Description = Description;

},{"./_version":38,"@ethersproject/logger":37}],40:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = "rlp/5.0.0-beta.132";

},{}],41:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
}); //See: https://github.com/ethereum/wiki/wiki/RLP

var bytes_1 = require("@ethersproject/bytes");

var logger_1 = require("@ethersproject/logger");

var _version_1 = require("./_version");

var logger = new logger_1.Logger(_version_1.version);

function arrayifyInteger(value) {
  var result = [];

  while (value) {
    result.unshift(value & 0xff);
    value >>= 8;
  }

  return result;
}

function unarrayifyInteger(data, offset, length) {
  var result = 0;

  for (var i = 0; i < length; i++) {
    result = result * 256 + data[offset + i];
  }

  return result;
}

function _encode(object) {
  if (Array.isArray(object)) {
    var payload_1 = [];
    object.forEach(function (child) {
      payload_1 = payload_1.concat(_encode(child));
    });

    if (payload_1.length <= 55) {
      payload_1.unshift(0xc0 + payload_1.length);
      return payload_1;
    }

    var length_1 = arrayifyInteger(payload_1.length);
    length_1.unshift(0xf7 + length_1.length);
    return length_1.concat(payload_1);
  }

  if (!bytes_1.isBytesLike(object)) {
    logger.throwArgumentError("RLP object must be BytesLike", "object", object);
  }

  var data = Array.prototype.slice.call(bytes_1.arrayify(object));

  if (data.length === 1 && data[0] <= 0x7f) {
    return data;
  } else if (data.length <= 55) {
    data.unshift(0x80 + data.length);
    return data;
  }

  var length = arrayifyInteger(data.length);
  length.unshift(0xb7 + length.length);
  return length.concat(data);
}

function encode(object) {
  return bytes_1.hexlify(_encode(object));
}

exports.encode = encode;

function _decodeChildren(data, offset, childOffset, length) {
  var result = [];

  while (childOffset < offset + 1 + length) {
    var decoded = _decode(data, childOffset);

    result.push(decoded.result);
    childOffset += decoded.consumed;

    if (childOffset > offset + 1 + length) {
      logger.throwError("child data too short", logger_1.Logger.errors.BUFFER_OVERRUN, {});
    }
  }

  return {
    consumed: 1 + length,
    result: result
  };
} // returns { consumed: number, result: Object }


function _decode(data, offset) {
  if (data.length === 0) {
    logger.throwError("data too short", logger_1.Logger.errors.BUFFER_OVERRUN, {});
  } // Array with extra length prefix


  if (data[offset] >= 0xf8) {
    var lengthLength = data[offset] - 0xf7;

    if (offset + 1 + lengthLength > data.length) {
      logger.throwError("data short segment too short", logger_1.Logger.errors.BUFFER_OVERRUN, {});
    }

    var length_2 = unarrayifyInteger(data, offset + 1, lengthLength);

    if (offset + 1 + lengthLength + length_2 > data.length) {
      logger.throwError("data long segment too short", logger_1.Logger.errors.BUFFER_OVERRUN, {});
    }

    return _decodeChildren(data, offset, offset + 1 + lengthLength, lengthLength + length_2);
  } else if (data[offset] >= 0xc0) {
    var length_3 = data[offset] - 0xc0;

    if (offset + 1 + length_3 > data.length) {
      logger.throwError("data array too short", logger_1.Logger.errors.BUFFER_OVERRUN, {});
    }

    return _decodeChildren(data, offset, offset + 1, length_3);
  } else if (data[offset] >= 0xb8) {
    var lengthLength = data[offset] - 0xb7;

    if (offset + 1 + lengthLength > data.length) {
      logger.throwError("data array too short", logger_1.Logger.errors.BUFFER_OVERRUN, {});
    }

    var length_4 = unarrayifyInteger(data, offset + 1, lengthLength);

    if (offset + 1 + lengthLength + length_4 > data.length) {
      logger.throwError("data array too short", logger_1.Logger.errors.BUFFER_OVERRUN, {});
    }

    var result = bytes_1.hexlify(data.slice(offset + 1 + lengthLength, offset + 1 + lengthLength + length_4));
    return {
      consumed: 1 + lengthLength + length_4,
      result: result
    };
  } else if (data[offset] >= 0x80) {
    var length_5 = data[offset] - 0x80;

    if (offset + 1 + length_5 > data.length) {
      logger.throwError("data too short", logger_1.Logger.errors.BUFFER_OVERRUN, {});
    }

    var result = bytes_1.hexlify(data.slice(offset + 1, offset + 1 + length_5));
    return {
      consumed: 1 + length_5,
      result: result
    };
  }

  return {
    consumed: 1,
    result: bytes_1.hexlify(data[offset])
  };
}

function decode(data) {
  var bytes = bytes_1.arrayify(data);

  var decoded = _decode(bytes, 0);

  if (decoded.consumed !== bytes.length) {
    logger.throwArgumentError("invalid rlp data", "data", data);
  }

  return decoded.result;
}

exports.decode = decode;

},{"./_version":40,"@ethersproject/bytes":31,"@ethersproject/logger":37}],42:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = "strings/5.0.0-beta.136";

},{}],43:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var constants_1 = require("@ethersproject/constants");

var bytes_1 = require("@ethersproject/bytes");

var utf8_1 = require("./utf8");

function formatBytes32String(text) {
  // Get the bytes
  var bytes = utf8_1.toUtf8Bytes(text); // Check we have room for null-termination

  if (bytes.length > 31) {
    throw new Error("bytes32 string must be less than 32 bytes");
  } // Zero-pad (implicitly null-terminates)


  return bytes_1.hexlify(bytes_1.concat([bytes, constants_1.HashZero]).slice(0, 32));
}

exports.formatBytes32String = formatBytes32String;

function parseBytes32String(bytes) {
  var data = bytes_1.arrayify(bytes); // Must be 32 bytes with a null-termination

  if (data.length !== 32) {
    throw new Error("invalid bytes32 - not 32 bytes long");
  }

  if (data[31] !== 0) {
    throw new Error("invalid bytes32 string - no null terminator");
  } // Find the null termination


  var length = 31;

  while (data[length - 1] === 0) {
    length--;
  } // Determine the string value


  return utf8_1.toUtf8String(data.slice(0, length));
}

exports.parseBytes32String = parseBytes32String;

},{"./utf8":46,"@ethersproject/bytes":31,"@ethersproject/constants":32}],44:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var utf8_1 = require("./utf8");

function bytes2(data) {
  if (data.length % 4 !== 0) {
    throw new Error("bad data");
  }

  var result = [];

  for (var i = 0; i < data.length; i += 4) {
    result.push(parseInt(data.substring(i, i + 4), 16));
  }

  return result;
}

function createTable(data, func) {
  if (!func) {
    func = function func(value) {
      return [parseInt(value, 16)];
    };
  }

  var lo = 0;
  var result = {};
  data.split(",").forEach(function (pair) {
    var comps = pair.split(":");
    lo += parseInt(comps[0], 16);
    result[lo] = func(comps[1]);
  });
  return result;
}

function createRangeTable(data) {
  var hi = 0;
  return data.split(",").map(function (v) {
    var comps = v.split("-");

    if (comps.length === 1) {
      comps[1] = "0";
    } else if (comps[1] === "") {
      comps[1] = "1";
    }

    var lo = hi + parseInt(comps[0], 16);
    hi = parseInt(comps[1], 16);
    return {
      l: lo,
      h: hi
    };
  });
}

function matchMap(value, ranges) {
  var lo = 0;

  for (var i = 0; i < ranges.length; i++) {
    var range = ranges[i];
    lo += range.l;

    if (value >= lo && value <= lo + range.h && (value - lo) % (range.d || 1) === 0) {
      if (range.e && range.e.indexOf(value - lo) !== -1) {
        continue;
      }

      return range;
    }
  }

  return null;
}

var Table_A_1_ranges = createRangeTable("221,13-1b,5f-,40-10,51-f,11-3,3-3,2-2,2-4,8,2,15,2d,28-8,88,48,27-,3-5,11-20,27-,8,28,3-5,12,18,b-a,1c-4,6-16,2-d,2-2,2,1b-4,17-9,8f-,10,f,1f-2,1c-34,33-14e,4,36-,13-,6-2,1a-f,4,9-,3-,17,8,2-2,5-,2,8-,3-,4-8,2-3,3,6-,16-6,2-,7-3,3-,17,8,3,3,3-,2,6-3,3-,4-a,5,2-6,10-b,4,8,2,4,17,8,3,6-,b,4,4-,2-e,2-4,b-10,4,9-,3-,17,8,3-,5-,9-2,3-,4-7,3-3,3,4-3,c-10,3,7-2,4,5-2,3,2,3-2,3-2,4-2,9,4-3,6-2,4,5-8,2-e,d-d,4,9,4,18,b,6-3,8,4,5-6,3-8,3-3,b-11,3,9,4,18,b,6-3,8,4,5-6,3-6,2,3-3,b-11,3,9,4,18,11-3,7-,4,5-8,2-7,3-3,b-11,3,13-2,19,a,2-,8-2,2-3,7,2,9-11,4-b,3b-3,1e-24,3,2-,3,2-,2-5,5,8,4,2,2-,3,e,4-,6,2,7-,b-,3-21,49,23-5,1c-3,9,25,10-,2-2f,23,6,3,8-2,5-5,1b-45,27-9,2a-,2-3,5b-4,45-4,53-5,8,40,2,5-,8,2,5-,28,2,5-,20,2,5-,8,2,5-,8,8,18,20,2,5-,8,28,14-5,1d-22,56-b,277-8,1e-2,52-e,e,8-a,18-8,15-b,e,4,3-b,5e-2,b-15,10,b-5,59-7,2b-555,9d-3,5b-5,17-,7-,27-,7-,9,2,2,2,20-,36,10,f-,7,14-,4,a,54-3,2-6,6-5,9-,1c-10,13-1d,1c-14,3c-,10-6,32-b,240-30,28-18,c-14,a0,115-,3,66-,b-76,5,5-,1d,24,2,5-2,2,8-,35-2,19,f-10,1d-3,311-37f,1b,5a-b,d7-19,d-3,41,57-,68-4,29-3,5f,29-37,2e-2,25-c,2c-2,4e-3,30,78-3,64-,20,19b7-49,51a7-59,48e-2,38-738,2ba5-5b,222f-,3c-94,8-b,6-4,1b,6,2,3,3,6d-20,16e-f,41-,37-7,2e-2,11-f,5-b,18-,b,14,5-3,6,88-,2,bf-2,7-,7-,7-,4-2,8,8-9,8-2ff,20,5-b,1c-b4,27-,27-cbb1,f7-9,28-2,b5-221,56,48,3-,2-,3-,5,d,2,5,3,42,5-,9,8,1d,5,6,2-2,8,153-3,123-3,33-27fd,a6da-5128,21f-5df,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3,2-1d,61-ff7d"); // @TODO: Make this relative...

var Table_B_1_flags = "ad,34f,1806,180b,180c,180d,200b,200c,200d,2060,feff".split(",").map(function (v) {
  return parseInt(v, 16);
});
var Table_B_2_ranges = [{
  h: 25,
  s: 32,
  l: 65
}, {
  h: 30,
  s: 32,
  e: [23],
  l: 127
}, {
  h: 54,
  s: 1,
  e: [48],
  l: 64,
  d: 2
}, {
  h: 14,
  s: 1,
  l: 57,
  d: 2
}, {
  h: 44,
  s: 1,
  l: 17,
  d: 2
}, {
  h: 10,
  s: 1,
  e: [2, 6, 8],
  l: 61,
  d: 2
}, {
  h: 16,
  s: 1,
  l: 68,
  d: 2
}, {
  h: 84,
  s: 1,
  e: [18, 24, 66],
  l: 19,
  d: 2
}, {
  h: 26,
  s: 32,
  e: [17],
  l: 435
}, {
  h: 22,
  s: 1,
  l: 71,
  d: 2
}, {
  h: 15,
  s: 80,
  l: 40
}, {
  h: 31,
  s: 32,
  l: 16
}, {
  h: 32,
  s: 1,
  l: 80,
  d: 2
}, {
  h: 52,
  s: 1,
  l: 42,
  d: 2
}, {
  h: 12,
  s: 1,
  l: 55,
  d: 2
}, {
  h: 40,
  s: 1,
  e: [38],
  l: 15,
  d: 2
}, {
  h: 14,
  s: 1,
  l: 48,
  d: 2
}, {
  h: 37,
  s: 48,
  l: 49
}, {
  h: 148,
  s: 1,
  l: 6351,
  d: 2
}, {
  h: 88,
  s: 1,
  l: 160,
  d: 2
}, {
  h: 15,
  s: 16,
  l: 704
}, {
  h: 25,
  s: 26,
  l: 854
}, {
  h: 25,
  s: 32,
  l: 55915
}, {
  h: 37,
  s: 40,
  l: 1247
}, {
  h: 25,
  s: -119711,
  l: 53248
}, {
  h: 25,
  s: -119763,
  l: 52
}, {
  h: 25,
  s: -119815,
  l: 52
}, {
  h: 25,
  s: -119867,
  e: [1, 4, 5, 7, 8, 11, 12, 17],
  l: 52
}, {
  h: 25,
  s: -119919,
  l: 52
}, {
  h: 24,
  s: -119971,
  e: [2, 7, 8, 17],
  l: 52
}, {
  h: 24,
  s: -120023,
  e: [2, 7, 13, 15, 16, 17],
  l: 52
}, {
  h: 25,
  s: -120075,
  l: 52
}, {
  h: 25,
  s: -120127,
  l: 52
}, {
  h: 25,
  s: -120179,
  l: 52
}, {
  h: 25,
  s: -120231,
  l: 52
}, {
  h: 25,
  s: -120283,
  l: 52
}, {
  h: 25,
  s: -120335,
  l: 52
}, {
  h: 24,
  s: -119543,
  e: [17],
  l: 56
}, {
  h: 24,
  s: -119601,
  e: [17],
  l: 58
}, {
  h: 24,
  s: -119659,
  e: [17],
  l: 58
}, {
  h: 24,
  s: -119717,
  e: [17],
  l: 58
}, {
  h: 24,
  s: -119775,
  e: [17],
  l: 58
}];
var Table_B_2_lut_abs = createTable("b5:3bc,c3:ff,7:73,2:253,5:254,3:256,1:257,5:259,1:25b,3:260,1:263,2:269,1:268,5:26f,1:272,2:275,7:280,3:283,5:288,3:28a,1:28b,5:292,3f:195,1:1bf,29:19e,125:3b9,8b:3b2,1:3b8,1:3c5,3:3c6,1:3c0,1a:3ba,1:3c1,1:3c3,2:3b8,1:3b5,1bc9:3b9,1c:1f76,1:1f77,f:1f7a,1:1f7b,d:1f78,1:1f79,1:1f7c,1:1f7d,107:63,5:25b,4:68,1:68,1:68,3:69,1:69,1:6c,3:6e,4:70,1:71,1:72,1:72,1:72,7:7a,2:3c9,2:7a,2:6b,1:e5,1:62,1:63,3:65,1:66,2:6d,b:3b3,1:3c0,6:64,1b574:3b8,1a:3c3,20:3b8,1a:3c3,20:3b8,1a:3c3,20:3b8,1a:3c3,20:3b8,1a:3c3");
var Table_B_2_lut_rel = createTable("179:1,2:1,2:1,5:1,2:1,a:4f,a:1,8:1,2:1,2:1,3:1,5:1,3:1,4:1,2:1,3:1,4:1,8:2,1:1,2:2,1:1,2:2,27:2,195:26,2:25,1:25,1:25,2:40,2:3f,1:3f,33:1,11:-6,1:-9,1ac7:-3a,6d:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,9:-8,1:-8,1:-8,1:-8,1:-8,1:-8,b:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,9:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,9:-8,1:-8,1:-8,1:-8,1:-8,1:-8,c:-8,2:-8,2:-8,2:-8,9:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,49:-8,1:-8,1:-4a,1:-4a,d:-56,1:-56,1:-56,1:-56,d:-8,1:-8,f:-8,1:-8,3:-7");
var Table_B_2_complex = createTable("df:00730073,51:00690307,19:02BC006E,a7:006A030C,18a:002003B9,16:03B903080301,20:03C503080301,1d7:05650582,190f:00680331,1:00740308,1:0077030A,1:0079030A,1:006102BE,b6:03C50313,2:03C503130300,2:03C503130301,2:03C503130342,2a:1F0003B9,1:1F0103B9,1:1F0203B9,1:1F0303B9,1:1F0403B9,1:1F0503B9,1:1F0603B9,1:1F0703B9,1:1F0003B9,1:1F0103B9,1:1F0203B9,1:1F0303B9,1:1F0403B9,1:1F0503B9,1:1F0603B9,1:1F0703B9,1:1F2003B9,1:1F2103B9,1:1F2203B9,1:1F2303B9,1:1F2403B9,1:1F2503B9,1:1F2603B9,1:1F2703B9,1:1F2003B9,1:1F2103B9,1:1F2203B9,1:1F2303B9,1:1F2403B9,1:1F2503B9,1:1F2603B9,1:1F2703B9,1:1F6003B9,1:1F6103B9,1:1F6203B9,1:1F6303B9,1:1F6403B9,1:1F6503B9,1:1F6603B9,1:1F6703B9,1:1F6003B9,1:1F6103B9,1:1F6203B9,1:1F6303B9,1:1F6403B9,1:1F6503B9,1:1F6603B9,1:1F6703B9,3:1F7003B9,1:03B103B9,1:03AC03B9,2:03B10342,1:03B1034203B9,5:03B103B9,6:1F7403B9,1:03B703B9,1:03AE03B9,2:03B70342,1:03B7034203B9,5:03B703B9,6:03B903080300,1:03B903080301,3:03B90342,1:03B903080342,b:03C503080300,1:03C503080301,1:03C10313,2:03C50342,1:03C503080342,b:1F7C03B9,1:03C903B9,1:03CE03B9,2:03C90342,1:03C9034203B9,5:03C903B9,ac:00720073,5b:00B00063,6:00B00066,d:006E006F,a:0073006D,1:00740065006C,1:0074006D,124f:006800700061,2:00610075,2:006F0076,b:00700061,1:006E0061,1:03BC0061,1:006D0061,1:006B0061,1:006B0062,1:006D0062,1:00670062,3:00700066,1:006E0066,1:03BC0066,4:0068007A,1:006B0068007A,1:006D0068007A,1:00670068007A,1:00740068007A,15:00700061,1:006B00700061,1:006D00700061,1:006700700061,8:00700076,1:006E0076,1:03BC0076,1:006D0076,1:006B0076,1:006D0076,1:00700077,1:006E0077,1:03BC0077,1:006D0077,1:006B0077,1:006D0077,1:006B03C9,1:006D03C9,2:00620071,3:00632215006B0067,1:0063006F002E,1:00640062,1:00670079,2:00680070,2:006B006B,1:006B006D,9:00700068,2:00700070006D,1:00700072,2:00730076,1:00770062,c723:00660066,1:00660069,1:0066006C,1:006600660069,1:00660066006C,1:00730074,1:00730074,d:05740576,1:05740565,1:0574056B,1:057E0576,1:0574056D", bytes2);
var Table_C_ranges = createRangeTable("80-20,2a0-,39c,32,f71,18e,7f2-f,19-7,30-4,7-5,f81-b,5,a800-20ff,4d1-1f,110,fa-6,d174-7,2e84-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,2,1f-5f,ff7f-20001");

function flatten(values) {
  return values.reduce(function (accum, value) {
    value.forEach(function (value) {
      accum.push(value);
    });
    return accum;
  }, []);
}

function _nameprepTableA1(codepoint) {
  return !!matchMap(codepoint, Table_A_1_ranges);
}

exports._nameprepTableA1 = _nameprepTableA1;

function _nameprepTableB2(codepoint) {
  var range = matchMap(codepoint, Table_B_2_ranges);

  if (range) {
    return [codepoint + range.s];
  }

  var codes = Table_B_2_lut_abs[codepoint];

  if (codes) {
    return codes;
  }

  var shift = Table_B_2_lut_rel[codepoint];

  if (shift) {
    return [codepoint + shift[0]];
  }

  var complex = Table_B_2_complex[codepoint];

  if (complex) {
    return complex;
  }

  return null;
}

exports._nameprepTableB2 = _nameprepTableB2;

function _nameprepTableC(codepoint) {
  return !!matchMap(codepoint, Table_C_ranges);
}

exports._nameprepTableC = _nameprepTableC;

function nameprep(value) {
  // This allows platforms with incomplete normalize to bypass
  // it for very basic names which the built-in toLowerCase
  // will certainly handle correctly
  if (value.match(/^[a-z0-9-]*$/i) && value.length <= 59) {
    return value.toLowerCase();
  } // Get the code points (keeping the current normalization)


  var codes = utf8_1.toUtf8CodePoints(value);
  codes = flatten(codes.map(function (code) {
    // Substitute Table B.1 (Maps to Nothing)
    if (Table_B_1_flags.indexOf(code) >= 0) {
      return [];
    }

    if (code >= 0xfe00 && code <= 0xfe0f) {
      return [];
    } // Substitute Table B.2 (Case Folding)


    var codesTableB2 = _nameprepTableB2(code);

    if (codesTableB2) {
      return codesTableB2;
    } // No Substitution


    return [code];
  })); // Normalize using form KC

  codes = utf8_1.toUtf8CodePoints(utf8_1._toUtf8String(codes), utf8_1.UnicodeNormalizationForm.NFKC); // Prohibit Tables C.1.2, C.2.2, C.3, C.4, C.5, C.6, C.7, C.8, C.9

  codes.forEach(function (code) {
    if (_nameprepTableC(code)) {
      throw new Error("STRINGPREP_CONTAINS_PROHIBITED");
    }
  }); // Prohibit Unassigned Code Points (Table A.1)

  codes.forEach(function (code) {
    if (_nameprepTableA1(code)) {
      throw new Error("STRINGPREP_CONTAINS_UNASSIGNED");
    }
  }); // IDNA extras

  var name = utf8_1._toUtf8String(codes); // IDNA: 4.2.3.1


  if (name.substring(0, 1) === "-" || name.substring(2, 4) === "--" || name.substring(name.length - 1) === "-") {
    throw new Error("invalid hyphen");
  } // IDNA: 4.2.4


  if (name.length > 63) {
    throw new Error("too long");
  }

  return name;
}

exports.nameprep = nameprep;

},{"./utf8":46}],45:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var bytes32_1 = require("./bytes32");

exports.formatBytes32String = bytes32_1.formatBytes32String;
exports.parseBytes32String = bytes32_1.parseBytes32String;

var idna_1 = require("./idna");

exports.nameprep = idna_1.nameprep;

var utf8_1 = require("./utf8");

exports._toEscapedUtf8String = utf8_1._toEscapedUtf8String;
exports.toUtf8Bytes = utf8_1.toUtf8Bytes;
exports.toUtf8CodePoints = utf8_1.toUtf8CodePoints;
exports.toUtf8String = utf8_1.toUtf8String;
exports.UnicodeNormalizationForm = utf8_1.UnicodeNormalizationForm;
exports.Utf8ErrorFuncs = utf8_1.Utf8ErrorFuncs;
exports.Utf8ErrorReason = utf8_1.Utf8ErrorReason;

},{"./bytes32":43,"./idna":44,"./utf8":46}],46:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var bytes_1 = require("@ethersproject/bytes");

var logger_1 = require("@ethersproject/logger");

var _version_1 = require("./_version");

var logger = new logger_1.Logger(_version_1.version); ///////////////////////////////

var UnicodeNormalizationForm;

(function (UnicodeNormalizationForm) {
  UnicodeNormalizationForm["current"] = "";
  UnicodeNormalizationForm["NFC"] = "NFC";
  UnicodeNormalizationForm["NFD"] = "NFD";
  UnicodeNormalizationForm["NFKC"] = "NFKC";
  UnicodeNormalizationForm["NFKD"] = "NFKD";
})(UnicodeNormalizationForm = exports.UnicodeNormalizationForm || (exports.UnicodeNormalizationForm = {}));

;
var Utf8ErrorReason;

(function (Utf8ErrorReason) {
  // A continuation byte was present where there was nothing to continue
  // - offset = the index the codepoint began in
  Utf8ErrorReason["UNEXPECTED_CONTINUE"] = "unexpected continuation byte"; // An invalid (non-continuation) byte to start a UTF-8 codepoint was found
  // - offset = the index the codepoint began in

  Utf8ErrorReason["BAD_PREFIX"] = "bad codepoint prefix"; // The string is too short to process the expected codepoint
  // - offset = the index the codepoint began in

  Utf8ErrorReason["OVERRUN"] = "string overrun"; // A missing continuation byte was expected but not found
  // - offset = the index the continuation byte was expected at

  Utf8ErrorReason["MISSING_CONTINUE"] = "missing continuation byte"; // The computed code point is outside the range for UTF-8
  // - offset       = start of this codepoint
  // - badCodepoint = the computed codepoint; outside the UTF-8 range

  Utf8ErrorReason["OUT_OF_RANGE"] = "out of UTF-8 range"; // UTF-8 strings may not contain UTF-16 surrogate pairs
  // - offset       = start of this codepoint
  // - badCodepoint = the computed codepoint; inside the UTF-16 surrogate range

  Utf8ErrorReason["UTF16_SURROGATE"] = "UTF-16 surrogate"; // The string is an overlong reperesentation
  // - offset       = start of this codepoint
  // - badCodepoint = the computed codepoint; already bounds checked

  Utf8ErrorReason["OVERLONG"] = "overlong representation";
})(Utf8ErrorReason = exports.Utf8ErrorReason || (exports.Utf8ErrorReason = {}));

;

function errorFunc(reason, offset, bytes, output, badCodepoint) {
  return logger.throwArgumentError("invalid codepoint at offset " + offset + "; " + reason, "bytes", bytes);
}

function ignoreFunc(reason, offset, bytes, output, badCodepoint) {
  // If there is an invalid prefix (including stray continuation), skip any additional continuation bytes
  if (reason === Utf8ErrorReason.BAD_PREFIX || reason === Utf8ErrorReason.UNEXPECTED_CONTINUE) {
    var i = 0;

    for (var o = offset + 1; o < bytes.length; o++) {
      if (bytes[o] >> 6 !== 0x02) {
        break;
      }

      i++;
    }

    return i;
  } // This byte runs us past the end of the string, so just jump to the end
  // (but the first byte was read already read and therefore skipped)


  if (reason === Utf8ErrorReason.OVERRUN) {
    return bytes.length - offset - 1;
  } // Nothing to skip


  return 0;
}

function replaceFunc(reason, offset, bytes, output, badCodepoint) {
  // Overlong representations are otherwise "valid" code points; just non-deistingtished
  if (reason === Utf8ErrorReason.OVERLONG) {
    output.push(badCodepoint);
    return 0;
  } // Put the replacement character into the output


  output.push(0xfffd); // Otherwise, process as if ignoring errors

  return ignoreFunc(reason, offset, bytes, output, badCodepoint);
} // Common error handing strategies


exports.Utf8ErrorFuncs = Object.freeze({
  error: errorFunc,
  ignore: ignoreFunc,
  replace: replaceFunc
}); // http://stackoverflow.com/questions/13356493/decode-utf-8-with-javascript#13691499

function getUtf8CodePoints(bytes, onError) {
  if (onError == null) {
    onError = exports.Utf8ErrorFuncs.error;
  }

  bytes = bytes_1.arrayify(bytes);
  var result = [];
  var i = 0; // Invalid bytes are ignored

  while (i < bytes.length) {
    var c = bytes[i++]; // 0xxx xxxx

    if (c >> 7 === 0) {
      result.push(c);
      continue;
    } // Multibyte; how many bytes left for this character?


    var extraLength = null;
    var overlongMask = null; // 110x xxxx 10xx xxxx

    if ((c & 0xe0) === 0xc0) {
      extraLength = 1;
      overlongMask = 0x7f; // 1110 xxxx 10xx xxxx 10xx xxxx
    } else if ((c & 0xf0) === 0xe0) {
      extraLength = 2;
      overlongMask = 0x7ff; // 1111 0xxx 10xx xxxx 10xx xxxx 10xx xxxx
    } else if ((c & 0xf8) === 0xf0) {
      extraLength = 3;
      overlongMask = 0xffff;
    } else {
      if ((c & 0xc0) === 0x80) {
        i += onError(Utf8ErrorReason.UNEXPECTED_CONTINUE, i - 1, bytes, result);
      } else {
        i += onError(Utf8ErrorReason.BAD_PREFIX, i - 1, bytes, result);
      }

      continue;
    } // Do we have enough bytes in our data?


    if (i - 1 + extraLength >= bytes.length) {
      i += onError(Utf8ErrorReason.OVERRUN, i - 1, bytes, result);
      continue;
    } // Remove the length prefix from the char


    var res = c & (1 << 8 - extraLength - 1) - 1;

    for (var j = 0; j < extraLength; j++) {
      var nextChar = bytes[i]; // Invalid continuation byte

      if ((nextChar & 0xc0) != 0x80) {
        i += onError(Utf8ErrorReason.MISSING_CONTINUE, i, bytes, result);
        res = null;
        break;
      }

      ;
      res = res << 6 | nextChar & 0x3f;
      i++;
    } // See above loop for invalid contimuation byte


    if (res === null) {
      continue;
    } // Maximum code point


    if (res > 0x10ffff) {
      i += onError(Utf8ErrorReason.OUT_OF_RANGE, i - 1 - extraLength, bytes, result, res);
      continue;
    } // Reserved for UTF-16 surrogate halves


    if (res >= 0xd800 && res <= 0xdfff) {
      i += onError(Utf8ErrorReason.UTF16_SURROGATE, i - 1 - extraLength, bytes, result, res);
      continue;
    } // Check for overlong sequences (more bytes than needed)


    if (res <= overlongMask) {
      i += onError(Utf8ErrorReason.OVERLONG, i - 1 - extraLength, bytes, result, res);
      continue;
    }

    result.push(res);
  }

  return result;
} // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array


function toUtf8Bytes(str, form) {
  if (form === void 0) {
    form = UnicodeNormalizationForm.current;
  }

  if (form != UnicodeNormalizationForm.current) {
    logger.checkNormalize();
    str = str.normalize(form);
  }

  var result = [];

  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);

    if (c < 0x80) {
      result.push(c);
    } else if (c < 0x800) {
      result.push(c >> 6 | 0xc0);
      result.push(c & 0x3f | 0x80);
    } else if ((c & 0xfc00) == 0xd800) {
      i++;
      var c2 = str.charCodeAt(i);

      if (i >= str.length || (c2 & 0xfc00) !== 0xdc00) {
        throw new Error("invalid utf-8 string");
      } // Surrogate Pair


      var pair = 0x10000 + ((c & 0x03ff) << 10) + (c2 & 0x03ff);
      result.push(pair >> 18 | 0xf0);
      result.push(pair >> 12 & 0x3f | 0x80);
      result.push(pair >> 6 & 0x3f | 0x80);
      result.push(pair & 0x3f | 0x80);
    } else {
      result.push(c >> 12 | 0xe0);
      result.push(c >> 6 & 0x3f | 0x80);
      result.push(c & 0x3f | 0x80);
    }
  }

  return bytes_1.arrayify(result);
}

exports.toUtf8Bytes = toUtf8Bytes;
;

function escapeChar(value) {
  var hex = "0000" + value.toString(16);
  return "\\u" + hex.substring(hex.length - 4);
}

function _toEscapedUtf8String(bytes, onError) {
  return '"' + getUtf8CodePoints(bytes, onError).map(function (codePoint) {
    if (codePoint < 256) {
      switch (codePoint) {
        case 8:
          return "\\b";

        case 9:
          return "\\t";

        case 10:
          return "\\n";

        case 13:
          return "\\r";

        case 34:
          return "\\\"";

        case 92:
          return "\\\\";
      }

      if (codePoint >= 32 && codePoint < 127) {
        return String.fromCharCode(codePoint);
      }
    }

    if (codePoint <= 0xffff) {
      return escapeChar(codePoint);
    }

    codePoint -= 0x10000;
    return escapeChar((codePoint >> 10 & 0x3ff) + 0xd800) + escapeChar((codePoint & 0x3ff) + 0xdc00);
  }).join("") + '"';
}

exports._toEscapedUtf8String = _toEscapedUtf8String;

function _toUtf8String(codePoints) {
  return codePoints.map(function (codePoint) {
    if (codePoint <= 0xffff) {
      return String.fromCharCode(codePoint);
    }

    codePoint -= 0x10000;
    return String.fromCharCode((codePoint >> 10 & 0x3ff) + 0xd800, (codePoint & 0x3ff) + 0xdc00);
  }).join("");
}

exports._toUtf8String = _toUtf8String;

function toUtf8String(bytes, onError) {
  return _toUtf8String(getUtf8CodePoints(bytes, onError));
}

exports.toUtf8String = toUtf8String;

function toUtf8CodePoints(str, form) {
  if (form === void 0) {
    form = UnicodeNormalizationForm.current;
  }

  return getUtf8CodePoints(toUtf8Bytes(str, form));
}

exports.toUtf8CodePoints = toUtf8CodePoints;

},{"./_version":42,"@ethersproject/bytes":31,"@ethersproject/logger":37}],47:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (module, exports) {
  'use strict'; // Utils

  function assert(val, msg) {
    if (!val) throw new Error(msg || 'Assertion failed');
  } // Could use `inherits` module, but don't want to move from single file
  // architecture yet.


  function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;

    var TempCtor = function TempCtor() {};

    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  } // BN


  function BN(number, base, endian) {
    if (BN.isBN(number)) {
      return number;
    }

    this.negative = 0;
    this.words = null;
    this.length = 0; // Reduction context

    this.red = null;

    if (number !== null) {
      if (base === 'le' || base === 'be') {
        endian = base;
        base = 10;
      }

      this._init(number || 0, base || 10, endian || 'be');
    }
  }

  if (_typeof(module) === 'object') {
    module.exports = BN;
  } else {
    exports.BN = BN;
  }

  BN.BN = BN;
  BN.wordSize = 26;
  var Buffer;

  try {
    Buffer = require('buffer').Buffer;
  } catch (e) {}

  BN.isBN = function isBN(num) {
    if (num instanceof BN) {
      return true;
    }

    return num !== null && _typeof(num) === 'object' && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
  };

  BN.max = function max(left, right) {
    if (left.cmp(right) > 0) return left;
    return right;
  };

  BN.min = function min(left, right) {
    if (left.cmp(right) < 0) return left;
    return right;
  };

  BN.prototype._init = function init(number, base, endian) {
    if (typeof number === 'number') {
      return this._initNumber(number, base, endian);
    }

    if (_typeof(number) === 'object') {
      return this._initArray(number, base, endian);
    }

    if (base === 'hex') {
      base = 16;
    }

    assert(base === (base | 0) && base >= 2 && base <= 36);
    number = number.toString().replace(/\s+/g, '');
    var start = 0;

    if (number[0] === '-') {
      start++;
    }

    if (base === 16) {
      this._parseHex(number, start);
    } else {
      this._parseBase(number, base, start);
    }

    if (number[0] === '-') {
      this.negative = 1;
    }

    this.strip();
    if (endian !== 'le') return;

    this._initArray(this.toArray(), base, endian);
  };

  BN.prototype._initNumber = function _initNumber(number, base, endian) {
    if (number < 0) {
      this.negative = 1;
      number = -number;
    }

    if (number < 0x4000000) {
      this.words = [number & 0x3ffffff];
      this.length = 1;
    } else if (number < 0x10000000000000) {
      this.words = [number & 0x3ffffff, number / 0x4000000 & 0x3ffffff];
      this.length = 2;
    } else {
      assert(number < 0x20000000000000); // 2 ^ 53 (unsafe)

      this.words = [number & 0x3ffffff, number / 0x4000000 & 0x3ffffff, 1];
      this.length = 3;
    }

    if (endian !== 'le') return; // Reverse the bytes

    this._initArray(this.toArray(), base, endian);
  };

  BN.prototype._initArray = function _initArray(number, base, endian) {
    // Perhaps a Uint8Array
    assert(typeof number.length === 'number');

    if (number.length <= 0) {
      this.words = [0];
      this.length = 1;
      return this;
    }

    this.length = Math.ceil(number.length / 3);
    this.words = new Array(this.length);

    for (var i = 0; i < this.length; i++) {
      this.words[i] = 0;
    }

    var j, w;
    var off = 0;

    if (endian === 'be') {
      for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
        w = number[i] | number[i - 1] << 8 | number[i - 2] << 16;
        this.words[j] |= w << off & 0x3ffffff;
        this.words[j + 1] = w >>> 26 - off & 0x3ffffff;
        off += 24;

        if (off >= 26) {
          off -= 26;
          j++;
        }
      }
    } else if (endian === 'le') {
      for (i = 0, j = 0; i < number.length; i += 3) {
        w = number[i] | number[i + 1] << 8 | number[i + 2] << 16;
        this.words[j] |= w << off & 0x3ffffff;
        this.words[j + 1] = w >>> 26 - off & 0x3ffffff;
        off += 24;

        if (off >= 26) {
          off -= 26;
          j++;
        }
      }
    }

    return this.strip();
  };

  function parseHex(str, start, end) {
    var r = 0;
    var len = Math.min(str.length, end);

    for (var i = start; i < len; i++) {
      var c = str.charCodeAt(i) - 48;
      r <<= 4; // 'a' - 'f'

      if (c >= 49 && c <= 54) {
        r |= c - 49 + 0xa; // 'A' - 'F'
      } else if (c >= 17 && c <= 22) {
        r |= c - 17 + 0xa; // '0' - '9'
      } else {
        r |= c & 0xf;
      }
    }

    return r;
  }

  BN.prototype._parseHex = function _parseHex(number, start) {
    // Create possibly bigger array to ensure that it fits the number
    this.length = Math.ceil((number.length - start) / 6);
    this.words = new Array(this.length);

    for (var i = 0; i < this.length; i++) {
      this.words[i] = 0;
    }

    var j, w; // Scan 24-bit chunks and add them to the number

    var off = 0;

    for (i = number.length - 6, j = 0; i >= start; i -= 6) {
      w = parseHex(number, i, i + 6);
      this.words[j] |= w << off & 0x3ffffff; // NOTE: `0x3fffff` is intentional here, 26bits max shift + 24bit hex limb

      this.words[j + 1] |= w >>> 26 - off & 0x3fffff;
      off += 24;

      if (off >= 26) {
        off -= 26;
        j++;
      }
    }

    if (i + 6 !== start) {
      w = parseHex(number, start, i + 6);
      this.words[j] |= w << off & 0x3ffffff;
      this.words[j + 1] |= w >>> 26 - off & 0x3fffff;
    }

    this.strip();
  };

  function parseBase(str, start, end, mul) {
    var r = 0;
    var len = Math.min(str.length, end);

    for (var i = start; i < len; i++) {
      var c = str.charCodeAt(i) - 48;
      r *= mul; // 'a'

      if (c >= 49) {
        r += c - 49 + 0xa; // 'A'
      } else if (c >= 17) {
        r += c - 17 + 0xa; // '0' - '9'
      } else {
        r += c;
      }
    }

    return r;
  }

  BN.prototype._parseBase = function _parseBase(number, base, start) {
    // Initialize as zero
    this.words = [0];
    this.length = 1; // Find length of limb in base

    for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base) {
      limbLen++;
    }

    limbLen--;
    limbPow = limbPow / base | 0;
    var total = number.length - start;
    var mod = total % limbLen;
    var end = Math.min(total, total - mod) + start;
    var word = 0;

    for (var i = start; i < end; i += limbLen) {
      word = parseBase(number, i, i + limbLen, base);
      this.imuln(limbPow);

      if (this.words[0] + word < 0x4000000) {
        this.words[0] += word;
      } else {
        this._iaddn(word);
      }
    }

    if (mod !== 0) {
      var pow = 1;
      word = parseBase(number, i, number.length, base);

      for (i = 0; i < mod; i++) {
        pow *= base;
      }

      this.imuln(pow);

      if (this.words[0] + word < 0x4000000) {
        this.words[0] += word;
      } else {
        this._iaddn(word);
      }
    }
  };

  BN.prototype.copy = function copy(dest) {
    dest.words = new Array(this.length);

    for (var i = 0; i < this.length; i++) {
      dest.words[i] = this.words[i];
    }

    dest.length = this.length;
    dest.negative = this.negative;
    dest.red = this.red;
  };

  BN.prototype.clone = function clone() {
    var r = new BN(null);
    this.copy(r);
    return r;
  };

  BN.prototype._expand = function _expand(size) {
    while (this.length < size) {
      this.words[this.length++] = 0;
    }

    return this;
  }; // Remove leading `0` from `this`


  BN.prototype.strip = function strip() {
    while (this.length > 1 && this.words[this.length - 1] === 0) {
      this.length--;
    }

    return this._normSign();
  };

  BN.prototype._normSign = function _normSign() {
    // -0 = 0
    if (this.length === 1 && this.words[0] === 0) {
      this.negative = 0;
    }

    return this;
  };

  BN.prototype.inspect = function inspect() {
    return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
  };
  /*
   var zeros = [];
  var groupSizes = [];
  var groupBases = [];
   var s = '';
  var i = -1;
  while (++i < BN.wordSize) {
    zeros[i] = s;
    s += '0';
  }
  groupSizes[0] = 0;
  groupSizes[1] = 0;
  groupBases[0] = 0;
  groupBases[1] = 0;
  var base = 2 - 1;
  while (++base < 36 + 1) {
    var groupSize = 0;
    var groupBase = 1;
    while (groupBase < (1 << BN.wordSize) / base) {
      groupBase *= base;
      groupSize += 1;
    }
    groupSizes[base] = groupSize;
    groupBases[base] = groupBase;
  }
   */


  var zeros = ['', '0', '00', '000', '0000', '00000', '000000', '0000000', '00000000', '000000000', '0000000000', '00000000000', '000000000000', '0000000000000', '00000000000000', '000000000000000', '0000000000000000', '00000000000000000', '000000000000000000', '0000000000000000000', '00000000000000000000', '000000000000000000000', '0000000000000000000000', '00000000000000000000000', '000000000000000000000000', '0000000000000000000000000'];
  var groupSizes = [0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
  var groupBases = [0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216, 43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625, 16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149, 24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176];

  BN.prototype.toString = function toString(base, padding) {
    base = base || 10;
    padding = padding | 0 || 1;
    var out;

    if (base === 16 || base === 'hex') {
      out = '';
      var off = 0;
      var carry = 0;

      for (var i = 0; i < this.length; i++) {
        var w = this.words[i];
        var word = ((w << off | carry) & 0xffffff).toString(16);
        carry = w >>> 24 - off & 0xffffff;

        if (carry !== 0 || i !== this.length - 1) {
          out = zeros[6 - word.length] + word + out;
        } else {
          out = word + out;
        }

        off += 2;

        if (off >= 26) {
          off -= 26;
          i--;
        }
      }

      if (carry !== 0) {
        out = carry.toString(16) + out;
      }

      while (out.length % padding !== 0) {
        out = '0' + out;
      }

      if (this.negative !== 0) {
        out = '-' + out;
      }

      return out;
    }

    if (base === (base | 0) && base >= 2 && base <= 36) {
      // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
      var groupSize = groupSizes[base]; // var groupBase = Math.pow(base, groupSize);

      var groupBase = groupBases[base];
      out = '';
      var c = this.clone();
      c.negative = 0;

      while (!c.isZero()) {
        var r = c.modn(groupBase).toString(base);
        c = c.idivn(groupBase);

        if (!c.isZero()) {
          out = zeros[groupSize - r.length] + r + out;
        } else {
          out = r + out;
        }
      }

      if (this.isZero()) {
        out = '0' + out;
      }

      while (out.length % padding !== 0) {
        out = '0' + out;
      }

      if (this.negative !== 0) {
        out = '-' + out;
      }

      return out;
    }

    assert(false, 'Base should be between 2 and 36');
  };

  BN.prototype.toNumber = function toNumber() {
    var ret = this.words[0];

    if (this.length === 2) {
      ret += this.words[1] * 0x4000000;
    } else if (this.length === 3 && this.words[2] === 0x01) {
      // NOTE: at this stage it is known that the top bit is set
      ret += 0x10000000000000 + this.words[1] * 0x4000000;
    } else if (this.length > 2) {
      assert(false, 'Number can only safely store up to 53 bits');
    }

    return this.negative !== 0 ? -ret : ret;
  };

  BN.prototype.toJSON = function toJSON() {
    return this.toString(16);
  };

  BN.prototype.toBuffer = function toBuffer(endian, length) {
    assert(typeof Buffer !== 'undefined');
    return this.toArrayLike(Buffer, endian, length);
  };

  BN.prototype.toArray = function toArray(endian, length) {
    return this.toArrayLike(Array, endian, length);
  };

  BN.prototype.toArrayLike = function toArrayLike(ArrayType, endian, length) {
    var byteLength = this.byteLength();
    var reqLength = length || Math.max(1, byteLength);
    assert(byteLength <= reqLength, 'byte array longer than desired length');
    assert(reqLength > 0, 'Requested array length <= 0');
    this.strip();
    var littleEndian = endian === 'le';
    var res = new ArrayType(reqLength);
    var b, i;
    var q = this.clone();

    if (!littleEndian) {
      // Assume big-endian
      for (i = 0; i < reqLength - byteLength; i++) {
        res[i] = 0;
      }

      for (i = 0; !q.isZero(); i++) {
        b = q.andln(0xff);
        q.iushrn(8);
        res[reqLength - i - 1] = b;
      }
    } else {
      for (i = 0; !q.isZero(); i++) {
        b = q.andln(0xff);
        q.iushrn(8);
        res[i] = b;
      }

      for (; i < reqLength; i++) {
        res[i] = 0;
      }
    }

    return res;
  };

  if (Math.clz32) {
    BN.prototype._countBits = function _countBits(w) {
      return 32 - Math.clz32(w);
    };
  } else {
    BN.prototype._countBits = function _countBits(w) {
      var t = w;
      var r = 0;

      if (t >= 0x1000) {
        r += 13;
        t >>>= 13;
      }

      if (t >= 0x40) {
        r += 7;
        t >>>= 7;
      }

      if (t >= 0x8) {
        r += 4;
        t >>>= 4;
      }

      if (t >= 0x02) {
        r += 2;
        t >>>= 2;
      }

      return r + t;
    };
  }

  BN.prototype._zeroBits = function _zeroBits(w) {
    // Short-cut
    if (w === 0) return 26;
    var t = w;
    var r = 0;

    if ((t & 0x1fff) === 0) {
      r += 13;
      t >>>= 13;
    }

    if ((t & 0x7f) === 0) {
      r += 7;
      t >>>= 7;
    }

    if ((t & 0xf) === 0) {
      r += 4;
      t >>>= 4;
    }

    if ((t & 0x3) === 0) {
      r += 2;
      t >>>= 2;
    }

    if ((t & 0x1) === 0) {
      r++;
    }

    return r;
  }; // Return number of used bits in a BN


  BN.prototype.bitLength = function bitLength() {
    var w = this.words[this.length - 1];

    var hi = this._countBits(w);

    return (this.length - 1) * 26 + hi;
  };

  function toBitArray(num) {
    var w = new Array(num.bitLength());

    for (var bit = 0; bit < w.length; bit++) {
      var off = bit / 26 | 0;
      var wbit = bit % 26;
      w[bit] = (num.words[off] & 1 << wbit) >>> wbit;
    }

    return w;
  } // Number of trailing zero bits


  BN.prototype.zeroBits = function zeroBits() {
    if (this.isZero()) return 0;
    var r = 0;

    for (var i = 0; i < this.length; i++) {
      var b = this._zeroBits(this.words[i]);

      r += b;
      if (b !== 26) break;
    }

    return r;
  };

  BN.prototype.byteLength = function byteLength() {
    return Math.ceil(this.bitLength() / 8);
  };

  BN.prototype.toTwos = function toTwos(width) {
    if (this.negative !== 0) {
      return this.abs().inotn(width).iaddn(1);
    }

    return this.clone();
  };

  BN.prototype.fromTwos = function fromTwos(width) {
    if (this.testn(width - 1)) {
      return this.notn(width).iaddn(1).ineg();
    }

    return this.clone();
  };

  BN.prototype.isNeg = function isNeg() {
    return this.negative !== 0;
  }; // Return negative clone of `this`


  BN.prototype.neg = function neg() {
    return this.clone().ineg();
  };

  BN.prototype.ineg = function ineg() {
    if (!this.isZero()) {
      this.negative ^= 1;
    }

    return this;
  }; // Or `num` with `this` in-place


  BN.prototype.iuor = function iuor(num) {
    while (this.length < num.length) {
      this.words[this.length++] = 0;
    }

    for (var i = 0; i < num.length; i++) {
      this.words[i] = this.words[i] | num.words[i];
    }

    return this.strip();
  };

  BN.prototype.ior = function ior(num) {
    assert((this.negative | num.negative) === 0);
    return this.iuor(num);
  }; // Or `num` with `this`


  BN.prototype.or = function or(num) {
    if (this.length > num.length) return this.clone().ior(num);
    return num.clone().ior(this);
  };

  BN.prototype.uor = function uor(num) {
    if (this.length > num.length) return this.clone().iuor(num);
    return num.clone().iuor(this);
  }; // And `num` with `this` in-place


  BN.prototype.iuand = function iuand(num) {
    // b = min-length(num, this)
    var b;

    if (this.length > num.length) {
      b = num;
    } else {
      b = this;
    }

    for (var i = 0; i < b.length; i++) {
      this.words[i] = this.words[i] & num.words[i];
    }

    this.length = b.length;
    return this.strip();
  };

  BN.prototype.iand = function iand(num) {
    assert((this.negative | num.negative) === 0);
    return this.iuand(num);
  }; // And `num` with `this`


  BN.prototype.and = function and(num) {
    if (this.length > num.length) return this.clone().iand(num);
    return num.clone().iand(this);
  };

  BN.prototype.uand = function uand(num) {
    if (this.length > num.length) return this.clone().iuand(num);
    return num.clone().iuand(this);
  }; // Xor `num` with `this` in-place


  BN.prototype.iuxor = function iuxor(num) {
    // a.length > b.length
    var a;
    var b;

    if (this.length > num.length) {
      a = this;
      b = num;
    } else {
      a = num;
      b = this;
    }

    for (var i = 0; i < b.length; i++) {
      this.words[i] = a.words[i] ^ b.words[i];
    }

    if (this !== a) {
      for (; i < a.length; i++) {
        this.words[i] = a.words[i];
      }
    }

    this.length = a.length;
    return this.strip();
  };

  BN.prototype.ixor = function ixor(num) {
    assert((this.negative | num.negative) === 0);
    return this.iuxor(num);
  }; // Xor `num` with `this`


  BN.prototype.xor = function xor(num) {
    if (this.length > num.length) return this.clone().ixor(num);
    return num.clone().ixor(this);
  };

  BN.prototype.uxor = function uxor(num) {
    if (this.length > num.length) return this.clone().iuxor(num);
    return num.clone().iuxor(this);
  }; // Not ``this`` with ``width`` bitwidth


  BN.prototype.inotn = function inotn(width) {
    assert(typeof width === 'number' && width >= 0);
    var bytesNeeded = Math.ceil(width / 26) | 0;
    var bitsLeft = width % 26; // Extend the buffer with leading zeroes

    this._expand(bytesNeeded);

    if (bitsLeft > 0) {
      bytesNeeded--;
    } // Handle complete words


    for (var i = 0; i < bytesNeeded; i++) {
      this.words[i] = ~this.words[i] & 0x3ffffff;
    } // Handle the residue


    if (bitsLeft > 0) {
      this.words[i] = ~this.words[i] & 0x3ffffff >> 26 - bitsLeft;
    } // And remove leading zeroes


    return this.strip();
  };

  BN.prototype.notn = function notn(width) {
    return this.clone().inotn(width);
  }; // Set `bit` of `this`


  BN.prototype.setn = function setn(bit, val) {
    assert(typeof bit === 'number' && bit >= 0);
    var off = bit / 26 | 0;
    var wbit = bit % 26;

    this._expand(off + 1);

    if (val) {
      this.words[off] = this.words[off] | 1 << wbit;
    } else {
      this.words[off] = this.words[off] & ~(1 << wbit);
    }

    return this.strip();
  }; // Add `num` to `this` in-place


  BN.prototype.iadd = function iadd(num) {
    var r; // negative + positive

    if (this.negative !== 0 && num.negative === 0) {
      this.negative = 0;
      r = this.isub(num);
      this.negative ^= 1;
      return this._normSign(); // positive + negative
    } else if (this.negative === 0 && num.negative !== 0) {
      num.negative = 0;
      r = this.isub(num);
      num.negative = 1;
      return r._normSign();
    } // a.length > b.length


    var a, b;

    if (this.length > num.length) {
      a = this;
      b = num;
    } else {
      a = num;
      b = this;
    }

    var carry = 0;

    for (var i = 0; i < b.length; i++) {
      r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
      this.words[i] = r & 0x3ffffff;
      carry = r >>> 26;
    }

    for (; carry !== 0 && i < a.length; i++) {
      r = (a.words[i] | 0) + carry;
      this.words[i] = r & 0x3ffffff;
      carry = r >>> 26;
    }

    this.length = a.length;

    if (carry !== 0) {
      this.words[this.length] = carry;
      this.length++; // Copy the rest of the words
    } else if (a !== this) {
      for (; i < a.length; i++) {
        this.words[i] = a.words[i];
      }
    }

    return this;
  }; // Add `num` to `this`


  BN.prototype.add = function add(num) {
    var res;

    if (num.negative !== 0 && this.negative === 0) {
      num.negative = 0;
      res = this.sub(num);
      num.negative ^= 1;
      return res;
    } else if (num.negative === 0 && this.negative !== 0) {
      this.negative = 0;
      res = num.sub(this);
      this.negative = 1;
      return res;
    }

    if (this.length > num.length) return this.clone().iadd(num);
    return num.clone().iadd(this);
  }; // Subtract `num` from `this` in-place


  BN.prototype.isub = function isub(num) {
    // this - (-num) = this + num
    if (num.negative !== 0) {
      num.negative = 0;
      var r = this.iadd(num);
      num.negative = 1;
      return r._normSign(); // -this - num = -(this + num)
    } else if (this.negative !== 0) {
      this.negative = 0;
      this.iadd(num);
      this.negative = 1;
      return this._normSign();
    } // At this point both numbers are positive


    var cmp = this.cmp(num); // Optimization - zeroify

    if (cmp === 0) {
      this.negative = 0;
      this.length = 1;
      this.words[0] = 0;
      return this;
    } // a > b


    var a, b;

    if (cmp > 0) {
      a = this;
      b = num;
    } else {
      a = num;
      b = this;
    }

    var carry = 0;

    for (var i = 0; i < b.length; i++) {
      r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
      carry = r >> 26;
      this.words[i] = r & 0x3ffffff;
    }

    for (; carry !== 0 && i < a.length; i++) {
      r = (a.words[i] | 0) + carry;
      carry = r >> 26;
      this.words[i] = r & 0x3ffffff;
    } // Copy rest of the words


    if (carry === 0 && i < a.length && a !== this) {
      for (; i < a.length; i++) {
        this.words[i] = a.words[i];
      }
    }

    this.length = Math.max(this.length, i);

    if (a !== this) {
      this.negative = 1;
    }

    return this.strip();
  }; // Subtract `num` from `this`


  BN.prototype.sub = function sub(num) {
    return this.clone().isub(num);
  };

  function smallMulTo(self, num, out) {
    out.negative = num.negative ^ self.negative;
    var len = self.length + num.length | 0;
    out.length = len;
    len = len - 1 | 0; // Peel one iteration (compiler can't do it, because of code complexity)

    var a = self.words[0] | 0;
    var b = num.words[0] | 0;
    var r = a * b;
    var lo = r & 0x3ffffff;
    var carry = r / 0x4000000 | 0;
    out.words[0] = lo;

    for (var k = 1; k < len; k++) {
      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
      // note that ncarry could be >= 0x3ffffff
      var ncarry = carry >>> 26;
      var rword = carry & 0x3ffffff;
      var maxJ = Math.min(k, num.length - 1);

      for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
        var i = k - j | 0;
        a = self.words[i] | 0;
        b = num.words[j] | 0;
        r = a * b + rword;
        ncarry += r / 0x4000000 | 0;
        rword = r & 0x3ffffff;
      }

      out.words[k] = rword | 0;
      carry = ncarry | 0;
    }

    if (carry !== 0) {
      out.words[k] = carry | 0;
    } else {
      out.length--;
    }

    return out.strip();
  } // TODO(indutny): it may be reasonable to omit it for users who don't need
  // to work with 256-bit numbers, otherwise it gives 20% improvement for 256-bit
  // multiplication (like elliptic secp256k1).


  var comb10MulTo = function comb10MulTo(self, num, out) {
    var a = self.words;
    var b = num.words;
    var o = out.words;
    var c = 0;
    var lo;
    var mid;
    var hi;
    var a0 = a[0] | 0;
    var al0 = a0 & 0x1fff;
    var ah0 = a0 >>> 13;
    var a1 = a[1] | 0;
    var al1 = a1 & 0x1fff;
    var ah1 = a1 >>> 13;
    var a2 = a[2] | 0;
    var al2 = a2 & 0x1fff;
    var ah2 = a2 >>> 13;
    var a3 = a[3] | 0;
    var al3 = a3 & 0x1fff;
    var ah3 = a3 >>> 13;
    var a4 = a[4] | 0;
    var al4 = a4 & 0x1fff;
    var ah4 = a4 >>> 13;
    var a5 = a[5] | 0;
    var al5 = a5 & 0x1fff;
    var ah5 = a5 >>> 13;
    var a6 = a[6] | 0;
    var al6 = a6 & 0x1fff;
    var ah6 = a6 >>> 13;
    var a7 = a[7] | 0;
    var al7 = a7 & 0x1fff;
    var ah7 = a7 >>> 13;
    var a8 = a[8] | 0;
    var al8 = a8 & 0x1fff;
    var ah8 = a8 >>> 13;
    var a9 = a[9] | 0;
    var al9 = a9 & 0x1fff;
    var ah9 = a9 >>> 13;
    var b0 = b[0] | 0;
    var bl0 = b0 & 0x1fff;
    var bh0 = b0 >>> 13;
    var b1 = b[1] | 0;
    var bl1 = b1 & 0x1fff;
    var bh1 = b1 >>> 13;
    var b2 = b[2] | 0;
    var bl2 = b2 & 0x1fff;
    var bh2 = b2 >>> 13;
    var b3 = b[3] | 0;
    var bl3 = b3 & 0x1fff;
    var bh3 = b3 >>> 13;
    var b4 = b[4] | 0;
    var bl4 = b4 & 0x1fff;
    var bh4 = b4 >>> 13;
    var b5 = b[5] | 0;
    var bl5 = b5 & 0x1fff;
    var bh5 = b5 >>> 13;
    var b6 = b[6] | 0;
    var bl6 = b6 & 0x1fff;
    var bh6 = b6 >>> 13;
    var b7 = b[7] | 0;
    var bl7 = b7 & 0x1fff;
    var bh7 = b7 >>> 13;
    var b8 = b[8] | 0;
    var bl8 = b8 & 0x1fff;
    var bh8 = b8 >>> 13;
    var b9 = b[9] | 0;
    var bl9 = b9 & 0x1fff;
    var bh9 = b9 >>> 13;
    out.negative = self.negative ^ num.negative;
    out.length = 19;
    /* k = 0 */

    lo = Math.imul(al0, bl0);
    mid = Math.imul(al0, bh0);
    mid = mid + Math.imul(ah0, bl0) | 0;
    hi = Math.imul(ah0, bh0);
    var w0 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w0 >>> 26) | 0;
    w0 &= 0x3ffffff;
    /* k = 1 */

    lo = Math.imul(al1, bl0);
    mid = Math.imul(al1, bh0);
    mid = mid + Math.imul(ah1, bl0) | 0;
    hi = Math.imul(ah1, bh0);
    lo = lo + Math.imul(al0, bl1) | 0;
    mid = mid + Math.imul(al0, bh1) | 0;
    mid = mid + Math.imul(ah0, bl1) | 0;
    hi = hi + Math.imul(ah0, bh1) | 0;
    var w1 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w1 >>> 26) | 0;
    w1 &= 0x3ffffff;
    /* k = 2 */

    lo = Math.imul(al2, bl0);
    mid = Math.imul(al2, bh0);
    mid = mid + Math.imul(ah2, bl0) | 0;
    hi = Math.imul(ah2, bh0);
    lo = lo + Math.imul(al1, bl1) | 0;
    mid = mid + Math.imul(al1, bh1) | 0;
    mid = mid + Math.imul(ah1, bl1) | 0;
    hi = hi + Math.imul(ah1, bh1) | 0;
    lo = lo + Math.imul(al0, bl2) | 0;
    mid = mid + Math.imul(al0, bh2) | 0;
    mid = mid + Math.imul(ah0, bl2) | 0;
    hi = hi + Math.imul(ah0, bh2) | 0;
    var w2 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w2 >>> 26) | 0;
    w2 &= 0x3ffffff;
    /* k = 3 */

    lo = Math.imul(al3, bl0);
    mid = Math.imul(al3, bh0);
    mid = mid + Math.imul(ah3, bl0) | 0;
    hi = Math.imul(ah3, bh0);
    lo = lo + Math.imul(al2, bl1) | 0;
    mid = mid + Math.imul(al2, bh1) | 0;
    mid = mid + Math.imul(ah2, bl1) | 0;
    hi = hi + Math.imul(ah2, bh1) | 0;
    lo = lo + Math.imul(al1, bl2) | 0;
    mid = mid + Math.imul(al1, bh2) | 0;
    mid = mid + Math.imul(ah1, bl2) | 0;
    hi = hi + Math.imul(ah1, bh2) | 0;
    lo = lo + Math.imul(al0, bl3) | 0;
    mid = mid + Math.imul(al0, bh3) | 0;
    mid = mid + Math.imul(ah0, bl3) | 0;
    hi = hi + Math.imul(ah0, bh3) | 0;
    var w3 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w3 >>> 26) | 0;
    w3 &= 0x3ffffff;
    /* k = 4 */

    lo = Math.imul(al4, bl0);
    mid = Math.imul(al4, bh0);
    mid = mid + Math.imul(ah4, bl0) | 0;
    hi = Math.imul(ah4, bh0);
    lo = lo + Math.imul(al3, bl1) | 0;
    mid = mid + Math.imul(al3, bh1) | 0;
    mid = mid + Math.imul(ah3, bl1) | 0;
    hi = hi + Math.imul(ah3, bh1) | 0;
    lo = lo + Math.imul(al2, bl2) | 0;
    mid = mid + Math.imul(al2, bh2) | 0;
    mid = mid + Math.imul(ah2, bl2) | 0;
    hi = hi + Math.imul(ah2, bh2) | 0;
    lo = lo + Math.imul(al1, bl3) | 0;
    mid = mid + Math.imul(al1, bh3) | 0;
    mid = mid + Math.imul(ah1, bl3) | 0;
    hi = hi + Math.imul(ah1, bh3) | 0;
    lo = lo + Math.imul(al0, bl4) | 0;
    mid = mid + Math.imul(al0, bh4) | 0;
    mid = mid + Math.imul(ah0, bl4) | 0;
    hi = hi + Math.imul(ah0, bh4) | 0;
    var w4 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w4 >>> 26) | 0;
    w4 &= 0x3ffffff;
    /* k = 5 */

    lo = Math.imul(al5, bl0);
    mid = Math.imul(al5, bh0);
    mid = mid + Math.imul(ah5, bl0) | 0;
    hi = Math.imul(ah5, bh0);
    lo = lo + Math.imul(al4, bl1) | 0;
    mid = mid + Math.imul(al4, bh1) | 0;
    mid = mid + Math.imul(ah4, bl1) | 0;
    hi = hi + Math.imul(ah4, bh1) | 0;
    lo = lo + Math.imul(al3, bl2) | 0;
    mid = mid + Math.imul(al3, bh2) | 0;
    mid = mid + Math.imul(ah3, bl2) | 0;
    hi = hi + Math.imul(ah3, bh2) | 0;
    lo = lo + Math.imul(al2, bl3) | 0;
    mid = mid + Math.imul(al2, bh3) | 0;
    mid = mid + Math.imul(ah2, bl3) | 0;
    hi = hi + Math.imul(ah2, bh3) | 0;
    lo = lo + Math.imul(al1, bl4) | 0;
    mid = mid + Math.imul(al1, bh4) | 0;
    mid = mid + Math.imul(ah1, bl4) | 0;
    hi = hi + Math.imul(ah1, bh4) | 0;
    lo = lo + Math.imul(al0, bl5) | 0;
    mid = mid + Math.imul(al0, bh5) | 0;
    mid = mid + Math.imul(ah0, bl5) | 0;
    hi = hi + Math.imul(ah0, bh5) | 0;
    var w5 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w5 >>> 26) | 0;
    w5 &= 0x3ffffff;
    /* k = 6 */

    lo = Math.imul(al6, bl0);
    mid = Math.imul(al6, bh0);
    mid = mid + Math.imul(ah6, bl0) | 0;
    hi = Math.imul(ah6, bh0);
    lo = lo + Math.imul(al5, bl1) | 0;
    mid = mid + Math.imul(al5, bh1) | 0;
    mid = mid + Math.imul(ah5, bl1) | 0;
    hi = hi + Math.imul(ah5, bh1) | 0;
    lo = lo + Math.imul(al4, bl2) | 0;
    mid = mid + Math.imul(al4, bh2) | 0;
    mid = mid + Math.imul(ah4, bl2) | 0;
    hi = hi + Math.imul(ah4, bh2) | 0;
    lo = lo + Math.imul(al3, bl3) | 0;
    mid = mid + Math.imul(al3, bh3) | 0;
    mid = mid + Math.imul(ah3, bl3) | 0;
    hi = hi + Math.imul(ah3, bh3) | 0;
    lo = lo + Math.imul(al2, bl4) | 0;
    mid = mid + Math.imul(al2, bh4) | 0;
    mid = mid + Math.imul(ah2, bl4) | 0;
    hi = hi + Math.imul(ah2, bh4) | 0;
    lo = lo + Math.imul(al1, bl5) | 0;
    mid = mid + Math.imul(al1, bh5) | 0;
    mid = mid + Math.imul(ah1, bl5) | 0;
    hi = hi + Math.imul(ah1, bh5) | 0;
    lo = lo + Math.imul(al0, bl6) | 0;
    mid = mid + Math.imul(al0, bh6) | 0;
    mid = mid + Math.imul(ah0, bl6) | 0;
    hi = hi + Math.imul(ah0, bh6) | 0;
    var w6 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w6 >>> 26) | 0;
    w6 &= 0x3ffffff;
    /* k = 7 */

    lo = Math.imul(al7, bl0);
    mid = Math.imul(al7, bh0);
    mid = mid + Math.imul(ah7, bl0) | 0;
    hi = Math.imul(ah7, bh0);
    lo = lo + Math.imul(al6, bl1) | 0;
    mid = mid + Math.imul(al6, bh1) | 0;
    mid = mid + Math.imul(ah6, bl1) | 0;
    hi = hi + Math.imul(ah6, bh1) | 0;
    lo = lo + Math.imul(al5, bl2) | 0;
    mid = mid + Math.imul(al5, bh2) | 0;
    mid = mid + Math.imul(ah5, bl2) | 0;
    hi = hi + Math.imul(ah5, bh2) | 0;
    lo = lo + Math.imul(al4, bl3) | 0;
    mid = mid + Math.imul(al4, bh3) | 0;
    mid = mid + Math.imul(ah4, bl3) | 0;
    hi = hi + Math.imul(ah4, bh3) | 0;
    lo = lo + Math.imul(al3, bl4) | 0;
    mid = mid + Math.imul(al3, bh4) | 0;
    mid = mid + Math.imul(ah3, bl4) | 0;
    hi = hi + Math.imul(ah3, bh4) | 0;
    lo = lo + Math.imul(al2, bl5) | 0;
    mid = mid + Math.imul(al2, bh5) | 0;
    mid = mid + Math.imul(ah2, bl5) | 0;
    hi = hi + Math.imul(ah2, bh5) | 0;
    lo = lo + Math.imul(al1, bl6) | 0;
    mid = mid + Math.imul(al1, bh6) | 0;
    mid = mid + Math.imul(ah1, bl6) | 0;
    hi = hi + Math.imul(ah1, bh6) | 0;
    lo = lo + Math.imul(al0, bl7) | 0;
    mid = mid + Math.imul(al0, bh7) | 0;
    mid = mid + Math.imul(ah0, bl7) | 0;
    hi = hi + Math.imul(ah0, bh7) | 0;
    var w7 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w7 >>> 26) | 0;
    w7 &= 0x3ffffff;
    /* k = 8 */

    lo = Math.imul(al8, bl0);
    mid = Math.imul(al8, bh0);
    mid = mid + Math.imul(ah8, bl0) | 0;
    hi = Math.imul(ah8, bh0);
    lo = lo + Math.imul(al7, bl1) | 0;
    mid = mid + Math.imul(al7, bh1) | 0;
    mid = mid + Math.imul(ah7, bl1) | 0;
    hi = hi + Math.imul(ah7, bh1) | 0;
    lo = lo + Math.imul(al6, bl2) | 0;
    mid = mid + Math.imul(al6, bh2) | 0;
    mid = mid + Math.imul(ah6, bl2) | 0;
    hi = hi + Math.imul(ah6, bh2) | 0;
    lo = lo + Math.imul(al5, bl3) | 0;
    mid = mid + Math.imul(al5, bh3) | 0;
    mid = mid + Math.imul(ah5, bl3) | 0;
    hi = hi + Math.imul(ah5, bh3) | 0;
    lo = lo + Math.imul(al4, bl4) | 0;
    mid = mid + Math.imul(al4, bh4) | 0;
    mid = mid + Math.imul(ah4, bl4) | 0;
    hi = hi + Math.imul(ah4, bh4) | 0;
    lo = lo + Math.imul(al3, bl5) | 0;
    mid = mid + Math.imul(al3, bh5) | 0;
    mid = mid + Math.imul(ah3, bl5) | 0;
    hi = hi + Math.imul(ah3, bh5) | 0;
    lo = lo + Math.imul(al2, bl6) | 0;
    mid = mid + Math.imul(al2, bh6) | 0;
    mid = mid + Math.imul(ah2, bl6) | 0;
    hi = hi + Math.imul(ah2, bh6) | 0;
    lo = lo + Math.imul(al1, bl7) | 0;
    mid = mid + Math.imul(al1, bh7) | 0;
    mid = mid + Math.imul(ah1, bl7) | 0;
    hi = hi + Math.imul(ah1, bh7) | 0;
    lo = lo + Math.imul(al0, bl8) | 0;
    mid = mid + Math.imul(al0, bh8) | 0;
    mid = mid + Math.imul(ah0, bl8) | 0;
    hi = hi + Math.imul(ah0, bh8) | 0;
    var w8 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w8 >>> 26) | 0;
    w8 &= 0x3ffffff;
    /* k = 9 */

    lo = Math.imul(al9, bl0);
    mid = Math.imul(al9, bh0);
    mid = mid + Math.imul(ah9, bl0) | 0;
    hi = Math.imul(ah9, bh0);
    lo = lo + Math.imul(al8, bl1) | 0;
    mid = mid + Math.imul(al8, bh1) | 0;
    mid = mid + Math.imul(ah8, bl1) | 0;
    hi = hi + Math.imul(ah8, bh1) | 0;
    lo = lo + Math.imul(al7, bl2) | 0;
    mid = mid + Math.imul(al7, bh2) | 0;
    mid = mid + Math.imul(ah7, bl2) | 0;
    hi = hi + Math.imul(ah7, bh2) | 0;
    lo = lo + Math.imul(al6, bl3) | 0;
    mid = mid + Math.imul(al6, bh3) | 0;
    mid = mid + Math.imul(ah6, bl3) | 0;
    hi = hi + Math.imul(ah6, bh3) | 0;
    lo = lo + Math.imul(al5, bl4) | 0;
    mid = mid + Math.imul(al5, bh4) | 0;
    mid = mid + Math.imul(ah5, bl4) | 0;
    hi = hi + Math.imul(ah5, bh4) | 0;
    lo = lo + Math.imul(al4, bl5) | 0;
    mid = mid + Math.imul(al4, bh5) | 0;
    mid = mid + Math.imul(ah4, bl5) | 0;
    hi = hi + Math.imul(ah4, bh5) | 0;
    lo = lo + Math.imul(al3, bl6) | 0;
    mid = mid + Math.imul(al3, bh6) | 0;
    mid = mid + Math.imul(ah3, bl6) | 0;
    hi = hi + Math.imul(ah3, bh6) | 0;
    lo = lo + Math.imul(al2, bl7) | 0;
    mid = mid + Math.imul(al2, bh7) | 0;
    mid = mid + Math.imul(ah2, bl7) | 0;
    hi = hi + Math.imul(ah2, bh7) | 0;
    lo = lo + Math.imul(al1, bl8) | 0;
    mid = mid + Math.imul(al1, bh8) | 0;
    mid = mid + Math.imul(ah1, bl8) | 0;
    hi = hi + Math.imul(ah1, bh8) | 0;
    lo = lo + Math.imul(al0, bl9) | 0;
    mid = mid + Math.imul(al0, bh9) | 0;
    mid = mid + Math.imul(ah0, bl9) | 0;
    hi = hi + Math.imul(ah0, bh9) | 0;
    var w9 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w9 >>> 26) | 0;
    w9 &= 0x3ffffff;
    /* k = 10 */

    lo = Math.imul(al9, bl1);
    mid = Math.imul(al9, bh1);
    mid = mid + Math.imul(ah9, bl1) | 0;
    hi = Math.imul(ah9, bh1);
    lo = lo + Math.imul(al8, bl2) | 0;
    mid = mid + Math.imul(al8, bh2) | 0;
    mid = mid + Math.imul(ah8, bl2) | 0;
    hi = hi + Math.imul(ah8, bh2) | 0;
    lo = lo + Math.imul(al7, bl3) | 0;
    mid = mid + Math.imul(al7, bh3) | 0;
    mid = mid + Math.imul(ah7, bl3) | 0;
    hi = hi + Math.imul(ah7, bh3) | 0;
    lo = lo + Math.imul(al6, bl4) | 0;
    mid = mid + Math.imul(al6, bh4) | 0;
    mid = mid + Math.imul(ah6, bl4) | 0;
    hi = hi + Math.imul(ah6, bh4) | 0;
    lo = lo + Math.imul(al5, bl5) | 0;
    mid = mid + Math.imul(al5, bh5) | 0;
    mid = mid + Math.imul(ah5, bl5) | 0;
    hi = hi + Math.imul(ah5, bh5) | 0;
    lo = lo + Math.imul(al4, bl6) | 0;
    mid = mid + Math.imul(al4, bh6) | 0;
    mid = mid + Math.imul(ah4, bl6) | 0;
    hi = hi + Math.imul(ah4, bh6) | 0;
    lo = lo + Math.imul(al3, bl7) | 0;
    mid = mid + Math.imul(al3, bh7) | 0;
    mid = mid + Math.imul(ah3, bl7) | 0;
    hi = hi + Math.imul(ah3, bh7) | 0;
    lo = lo + Math.imul(al2, bl8) | 0;
    mid = mid + Math.imul(al2, bh8) | 0;
    mid = mid + Math.imul(ah2, bl8) | 0;
    hi = hi + Math.imul(ah2, bh8) | 0;
    lo = lo + Math.imul(al1, bl9) | 0;
    mid = mid + Math.imul(al1, bh9) | 0;
    mid = mid + Math.imul(ah1, bl9) | 0;
    hi = hi + Math.imul(ah1, bh9) | 0;
    var w10 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w10 >>> 26) | 0;
    w10 &= 0x3ffffff;
    /* k = 11 */

    lo = Math.imul(al9, bl2);
    mid = Math.imul(al9, bh2);
    mid = mid + Math.imul(ah9, bl2) | 0;
    hi = Math.imul(ah9, bh2);
    lo = lo + Math.imul(al8, bl3) | 0;
    mid = mid + Math.imul(al8, bh3) | 0;
    mid = mid + Math.imul(ah8, bl3) | 0;
    hi = hi + Math.imul(ah8, bh3) | 0;
    lo = lo + Math.imul(al7, bl4) | 0;
    mid = mid + Math.imul(al7, bh4) | 0;
    mid = mid + Math.imul(ah7, bl4) | 0;
    hi = hi + Math.imul(ah7, bh4) | 0;
    lo = lo + Math.imul(al6, bl5) | 0;
    mid = mid + Math.imul(al6, bh5) | 0;
    mid = mid + Math.imul(ah6, bl5) | 0;
    hi = hi + Math.imul(ah6, bh5) | 0;
    lo = lo + Math.imul(al5, bl6) | 0;
    mid = mid + Math.imul(al5, bh6) | 0;
    mid = mid + Math.imul(ah5, bl6) | 0;
    hi = hi + Math.imul(ah5, bh6) | 0;
    lo = lo + Math.imul(al4, bl7) | 0;
    mid = mid + Math.imul(al4, bh7) | 0;
    mid = mid + Math.imul(ah4, bl7) | 0;
    hi = hi + Math.imul(ah4, bh7) | 0;
    lo = lo + Math.imul(al3, bl8) | 0;
    mid = mid + Math.imul(al3, bh8) | 0;
    mid = mid + Math.imul(ah3, bl8) | 0;
    hi = hi + Math.imul(ah3, bh8) | 0;
    lo = lo + Math.imul(al2, bl9) | 0;
    mid = mid + Math.imul(al2, bh9) | 0;
    mid = mid + Math.imul(ah2, bl9) | 0;
    hi = hi + Math.imul(ah2, bh9) | 0;
    var w11 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w11 >>> 26) | 0;
    w11 &= 0x3ffffff;
    /* k = 12 */

    lo = Math.imul(al9, bl3);
    mid = Math.imul(al9, bh3);
    mid = mid + Math.imul(ah9, bl3) | 0;
    hi = Math.imul(ah9, bh3);
    lo = lo + Math.imul(al8, bl4) | 0;
    mid = mid + Math.imul(al8, bh4) | 0;
    mid = mid + Math.imul(ah8, bl4) | 0;
    hi = hi + Math.imul(ah8, bh4) | 0;
    lo = lo + Math.imul(al7, bl5) | 0;
    mid = mid + Math.imul(al7, bh5) | 0;
    mid = mid + Math.imul(ah7, bl5) | 0;
    hi = hi + Math.imul(ah7, bh5) | 0;
    lo = lo + Math.imul(al6, bl6) | 0;
    mid = mid + Math.imul(al6, bh6) | 0;
    mid = mid + Math.imul(ah6, bl6) | 0;
    hi = hi + Math.imul(ah6, bh6) | 0;
    lo = lo + Math.imul(al5, bl7) | 0;
    mid = mid + Math.imul(al5, bh7) | 0;
    mid = mid + Math.imul(ah5, bl7) | 0;
    hi = hi + Math.imul(ah5, bh7) | 0;
    lo = lo + Math.imul(al4, bl8) | 0;
    mid = mid + Math.imul(al4, bh8) | 0;
    mid = mid + Math.imul(ah4, bl8) | 0;
    hi = hi + Math.imul(ah4, bh8) | 0;
    lo = lo + Math.imul(al3, bl9) | 0;
    mid = mid + Math.imul(al3, bh9) | 0;
    mid = mid + Math.imul(ah3, bl9) | 0;
    hi = hi + Math.imul(ah3, bh9) | 0;
    var w12 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w12 >>> 26) | 0;
    w12 &= 0x3ffffff;
    /* k = 13 */

    lo = Math.imul(al9, bl4);
    mid = Math.imul(al9, bh4);
    mid = mid + Math.imul(ah9, bl4) | 0;
    hi = Math.imul(ah9, bh4);
    lo = lo + Math.imul(al8, bl5) | 0;
    mid = mid + Math.imul(al8, bh5) | 0;
    mid = mid + Math.imul(ah8, bl5) | 0;
    hi = hi + Math.imul(ah8, bh5) | 0;
    lo = lo + Math.imul(al7, bl6) | 0;
    mid = mid + Math.imul(al7, bh6) | 0;
    mid = mid + Math.imul(ah7, bl6) | 0;
    hi = hi + Math.imul(ah7, bh6) | 0;
    lo = lo + Math.imul(al6, bl7) | 0;
    mid = mid + Math.imul(al6, bh7) | 0;
    mid = mid + Math.imul(ah6, bl7) | 0;
    hi = hi + Math.imul(ah6, bh7) | 0;
    lo = lo + Math.imul(al5, bl8) | 0;
    mid = mid + Math.imul(al5, bh8) | 0;
    mid = mid + Math.imul(ah5, bl8) | 0;
    hi = hi + Math.imul(ah5, bh8) | 0;
    lo = lo + Math.imul(al4, bl9) | 0;
    mid = mid + Math.imul(al4, bh9) | 0;
    mid = mid + Math.imul(ah4, bl9) | 0;
    hi = hi + Math.imul(ah4, bh9) | 0;
    var w13 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w13 >>> 26) | 0;
    w13 &= 0x3ffffff;
    /* k = 14 */

    lo = Math.imul(al9, bl5);
    mid = Math.imul(al9, bh5);
    mid = mid + Math.imul(ah9, bl5) | 0;
    hi = Math.imul(ah9, bh5);
    lo = lo + Math.imul(al8, bl6) | 0;
    mid = mid + Math.imul(al8, bh6) | 0;
    mid = mid + Math.imul(ah8, bl6) | 0;
    hi = hi + Math.imul(ah8, bh6) | 0;
    lo = lo + Math.imul(al7, bl7) | 0;
    mid = mid + Math.imul(al7, bh7) | 0;
    mid = mid + Math.imul(ah7, bl7) | 0;
    hi = hi + Math.imul(ah7, bh7) | 0;
    lo = lo + Math.imul(al6, bl8) | 0;
    mid = mid + Math.imul(al6, bh8) | 0;
    mid = mid + Math.imul(ah6, bl8) | 0;
    hi = hi + Math.imul(ah6, bh8) | 0;
    lo = lo + Math.imul(al5, bl9) | 0;
    mid = mid + Math.imul(al5, bh9) | 0;
    mid = mid + Math.imul(ah5, bl9) | 0;
    hi = hi + Math.imul(ah5, bh9) | 0;
    var w14 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w14 >>> 26) | 0;
    w14 &= 0x3ffffff;
    /* k = 15 */

    lo = Math.imul(al9, bl6);
    mid = Math.imul(al9, bh6);
    mid = mid + Math.imul(ah9, bl6) | 0;
    hi = Math.imul(ah9, bh6);
    lo = lo + Math.imul(al8, bl7) | 0;
    mid = mid + Math.imul(al8, bh7) | 0;
    mid = mid + Math.imul(ah8, bl7) | 0;
    hi = hi + Math.imul(ah8, bh7) | 0;
    lo = lo + Math.imul(al7, bl8) | 0;
    mid = mid + Math.imul(al7, bh8) | 0;
    mid = mid + Math.imul(ah7, bl8) | 0;
    hi = hi + Math.imul(ah7, bh8) | 0;
    lo = lo + Math.imul(al6, bl9) | 0;
    mid = mid + Math.imul(al6, bh9) | 0;
    mid = mid + Math.imul(ah6, bl9) | 0;
    hi = hi + Math.imul(ah6, bh9) | 0;
    var w15 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w15 >>> 26) | 0;
    w15 &= 0x3ffffff;
    /* k = 16 */

    lo = Math.imul(al9, bl7);
    mid = Math.imul(al9, bh7);
    mid = mid + Math.imul(ah9, bl7) | 0;
    hi = Math.imul(ah9, bh7);
    lo = lo + Math.imul(al8, bl8) | 0;
    mid = mid + Math.imul(al8, bh8) | 0;
    mid = mid + Math.imul(ah8, bl8) | 0;
    hi = hi + Math.imul(ah8, bh8) | 0;
    lo = lo + Math.imul(al7, bl9) | 0;
    mid = mid + Math.imul(al7, bh9) | 0;
    mid = mid + Math.imul(ah7, bl9) | 0;
    hi = hi + Math.imul(ah7, bh9) | 0;
    var w16 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w16 >>> 26) | 0;
    w16 &= 0x3ffffff;
    /* k = 17 */

    lo = Math.imul(al9, bl8);
    mid = Math.imul(al9, bh8);
    mid = mid + Math.imul(ah9, bl8) | 0;
    hi = Math.imul(ah9, bh8);
    lo = lo + Math.imul(al8, bl9) | 0;
    mid = mid + Math.imul(al8, bh9) | 0;
    mid = mid + Math.imul(ah8, bl9) | 0;
    hi = hi + Math.imul(ah8, bh9) | 0;
    var w17 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w17 >>> 26) | 0;
    w17 &= 0x3ffffff;
    /* k = 18 */

    lo = Math.imul(al9, bl9);
    mid = Math.imul(al9, bh9);
    mid = mid + Math.imul(ah9, bl9) | 0;
    hi = Math.imul(ah9, bh9);
    var w18 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w18 >>> 26) | 0;
    w18 &= 0x3ffffff;
    o[0] = w0;
    o[1] = w1;
    o[2] = w2;
    o[3] = w3;
    o[4] = w4;
    o[5] = w5;
    o[6] = w6;
    o[7] = w7;
    o[8] = w8;
    o[9] = w9;
    o[10] = w10;
    o[11] = w11;
    o[12] = w12;
    o[13] = w13;
    o[14] = w14;
    o[15] = w15;
    o[16] = w16;
    o[17] = w17;
    o[18] = w18;

    if (c !== 0) {
      o[19] = c;
      out.length++;
    }

    return out;
  }; // Polyfill comb


  if (!Math.imul) {
    comb10MulTo = smallMulTo;
  }

  function bigMulTo(self, num, out) {
    out.negative = num.negative ^ self.negative;
    out.length = self.length + num.length;
    var carry = 0;
    var hncarry = 0;

    for (var k = 0; k < out.length - 1; k++) {
      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
      // note that ncarry could be >= 0x3ffffff
      var ncarry = hncarry;
      hncarry = 0;
      var rword = carry & 0x3ffffff;
      var maxJ = Math.min(k, num.length - 1);

      for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
        var i = k - j;
        var a = self.words[i] | 0;
        var b = num.words[j] | 0;
        var r = a * b;
        var lo = r & 0x3ffffff;
        ncarry = ncarry + (r / 0x4000000 | 0) | 0;
        lo = lo + rword | 0;
        rword = lo & 0x3ffffff;
        ncarry = ncarry + (lo >>> 26) | 0;
        hncarry += ncarry >>> 26;
        ncarry &= 0x3ffffff;
      }

      out.words[k] = rword;
      carry = ncarry;
      ncarry = hncarry;
    }

    if (carry !== 0) {
      out.words[k] = carry;
    } else {
      out.length--;
    }

    return out.strip();
  }

  function jumboMulTo(self, num, out) {
    var fftm = new FFTM();
    return fftm.mulp(self, num, out);
  }

  BN.prototype.mulTo = function mulTo(num, out) {
    var res;
    var len = this.length + num.length;

    if (this.length === 10 && num.length === 10) {
      res = comb10MulTo(this, num, out);
    } else if (len < 63) {
      res = smallMulTo(this, num, out);
    } else if (len < 1024) {
      res = bigMulTo(this, num, out);
    } else {
      res = jumboMulTo(this, num, out);
    }

    return res;
  }; // Cooley-Tukey algorithm for FFT
  // slightly revisited to rely on looping instead of recursion


  function FFTM(x, y) {
    this.x = x;
    this.y = y;
  }

  FFTM.prototype.makeRBT = function makeRBT(N) {
    var t = new Array(N);
    var l = BN.prototype._countBits(N) - 1;

    for (var i = 0; i < N; i++) {
      t[i] = this.revBin(i, l, N);
    }

    return t;
  }; // Returns binary-reversed representation of `x`


  FFTM.prototype.revBin = function revBin(x, l, N) {
    if (x === 0 || x === N - 1) return x;
    var rb = 0;

    for (var i = 0; i < l; i++) {
      rb |= (x & 1) << l - i - 1;
      x >>= 1;
    }

    return rb;
  }; // Performs "tweedling" phase, therefore 'emulating'
  // behaviour of the recursive algorithm


  FFTM.prototype.permute = function permute(rbt, rws, iws, rtws, itws, N) {
    for (var i = 0; i < N; i++) {
      rtws[i] = rws[rbt[i]];
      itws[i] = iws[rbt[i]];
    }
  };

  FFTM.prototype.transform = function transform(rws, iws, rtws, itws, N, rbt) {
    this.permute(rbt, rws, iws, rtws, itws, N);

    for (var s = 1; s < N; s <<= 1) {
      var l = s << 1;
      var rtwdf = Math.cos(2 * Math.PI / l);
      var itwdf = Math.sin(2 * Math.PI / l);

      for (var p = 0; p < N; p += l) {
        var rtwdf_ = rtwdf;
        var itwdf_ = itwdf;

        for (var j = 0; j < s; j++) {
          var re = rtws[p + j];
          var ie = itws[p + j];
          var ro = rtws[p + j + s];
          var io = itws[p + j + s];
          var rx = rtwdf_ * ro - itwdf_ * io;
          io = rtwdf_ * io + itwdf_ * ro;
          ro = rx;
          rtws[p + j] = re + ro;
          itws[p + j] = ie + io;
          rtws[p + j + s] = re - ro;
          itws[p + j + s] = ie - io;
          /* jshint maxdepth : false */

          if (j !== l) {
            rx = rtwdf * rtwdf_ - itwdf * itwdf_;
            itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
            rtwdf_ = rx;
          }
        }
      }
    }
  };

  FFTM.prototype.guessLen13b = function guessLen13b(n, m) {
    var N = Math.max(m, n) | 1;
    var odd = N & 1;
    var i = 0;

    for (N = N / 2 | 0; N; N = N >>> 1) {
      i++;
    }

    return 1 << i + 1 + odd;
  };

  FFTM.prototype.conjugate = function conjugate(rws, iws, N) {
    if (N <= 1) return;

    for (var i = 0; i < N / 2; i++) {
      var t = rws[i];
      rws[i] = rws[N - i - 1];
      rws[N - i - 1] = t;
      t = iws[i];
      iws[i] = -iws[N - i - 1];
      iws[N - i - 1] = -t;
    }
  };

  FFTM.prototype.normalize13b = function normalize13b(ws, N) {
    var carry = 0;

    for (var i = 0; i < N / 2; i++) {
      var w = Math.round(ws[2 * i + 1] / N) * 0x2000 + Math.round(ws[2 * i] / N) + carry;
      ws[i] = w & 0x3ffffff;

      if (w < 0x4000000) {
        carry = 0;
      } else {
        carry = w / 0x4000000 | 0;
      }
    }

    return ws;
  };

  FFTM.prototype.convert13b = function convert13b(ws, len, rws, N) {
    var carry = 0;

    for (var i = 0; i < len; i++) {
      carry = carry + (ws[i] | 0);
      rws[2 * i] = carry & 0x1fff;
      carry = carry >>> 13;
      rws[2 * i + 1] = carry & 0x1fff;
      carry = carry >>> 13;
    } // Pad with zeroes


    for (i = 2 * len; i < N; ++i) {
      rws[i] = 0;
    }

    assert(carry === 0);
    assert((carry & ~0x1fff) === 0);
  };

  FFTM.prototype.stub = function stub(N) {
    var ph = new Array(N);

    for (var i = 0; i < N; i++) {
      ph[i] = 0;
    }

    return ph;
  };

  FFTM.prototype.mulp = function mulp(x, y, out) {
    var N = 2 * this.guessLen13b(x.length, y.length);
    var rbt = this.makeRBT(N);

    var _ = this.stub(N);

    var rws = new Array(N);
    var rwst = new Array(N);
    var iwst = new Array(N);
    var nrws = new Array(N);
    var nrwst = new Array(N);
    var niwst = new Array(N);
    var rmws = out.words;
    rmws.length = N;
    this.convert13b(x.words, x.length, rws, N);
    this.convert13b(y.words, y.length, nrws, N);
    this.transform(rws, _, rwst, iwst, N, rbt);
    this.transform(nrws, _, nrwst, niwst, N, rbt);

    for (var i = 0; i < N; i++) {
      var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
      iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
      rwst[i] = rx;
    }

    this.conjugate(rwst, iwst, N);
    this.transform(rwst, iwst, rmws, _, N, rbt);
    this.conjugate(rmws, _, N);
    this.normalize13b(rmws, N);
    out.negative = x.negative ^ y.negative;
    out.length = x.length + y.length;
    return out.strip();
  }; // Multiply `this` by `num`


  BN.prototype.mul = function mul(num) {
    var out = new BN(null);
    out.words = new Array(this.length + num.length);
    return this.mulTo(num, out);
  }; // Multiply employing FFT


  BN.prototype.mulf = function mulf(num) {
    var out = new BN(null);
    out.words = new Array(this.length + num.length);
    return jumboMulTo(this, num, out);
  }; // In-place Multiplication


  BN.prototype.imul = function imul(num) {
    return this.clone().mulTo(num, this);
  };

  BN.prototype.imuln = function imuln(num) {
    assert(typeof num === 'number');
    assert(num < 0x4000000); // Carry

    var carry = 0;

    for (var i = 0; i < this.length; i++) {
      var w = (this.words[i] | 0) * num;
      var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
      carry >>= 26;
      carry += w / 0x4000000 | 0; // NOTE: lo is 27bit maximum

      carry += lo >>> 26;
      this.words[i] = lo & 0x3ffffff;
    }

    if (carry !== 0) {
      this.words[i] = carry;
      this.length++;
    }

    return this;
  };

  BN.prototype.muln = function muln(num) {
    return this.clone().imuln(num);
  }; // `this` * `this`


  BN.prototype.sqr = function sqr() {
    return this.mul(this);
  }; // `this` * `this` in-place


  BN.prototype.isqr = function isqr() {
    return this.imul(this.clone());
  }; // Math.pow(`this`, `num`)


  BN.prototype.pow = function pow(num) {
    var w = toBitArray(num);
    if (w.length === 0) return new BN(1); // Skip leading zeroes

    var res = this;

    for (var i = 0; i < w.length; i++, res = res.sqr()) {
      if (w[i] !== 0) break;
    }

    if (++i < w.length) {
      for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
        if (w[i] === 0) continue;
        res = res.mul(q);
      }
    }

    return res;
  }; // Shift-left in-place


  BN.prototype.iushln = function iushln(bits) {
    assert(typeof bits === 'number' && bits >= 0);
    var r = bits % 26;
    var s = (bits - r) / 26;
    var carryMask = 0x3ffffff >>> 26 - r << 26 - r;
    var i;

    if (r !== 0) {
      var carry = 0;

      for (i = 0; i < this.length; i++) {
        var newCarry = this.words[i] & carryMask;
        var c = (this.words[i] | 0) - newCarry << r;
        this.words[i] = c | carry;
        carry = newCarry >>> 26 - r;
      }

      if (carry) {
        this.words[i] = carry;
        this.length++;
      }
    }

    if (s !== 0) {
      for (i = this.length - 1; i >= 0; i--) {
        this.words[i + s] = this.words[i];
      }

      for (i = 0; i < s; i++) {
        this.words[i] = 0;
      }

      this.length += s;
    }

    return this.strip();
  };

  BN.prototype.ishln = function ishln(bits) {
    // TODO(indutny): implement me
    assert(this.negative === 0);
    return this.iushln(bits);
  }; // Shift-right in-place
  // NOTE: `hint` is a lowest bit before trailing zeroes
  // NOTE: if `extended` is present - it will be filled with destroyed bits


  BN.prototype.iushrn = function iushrn(bits, hint, extended) {
    assert(typeof bits === 'number' && bits >= 0);
    var h;

    if (hint) {
      h = (hint - hint % 26) / 26;
    } else {
      h = 0;
    }

    var r = bits % 26;
    var s = Math.min((bits - r) / 26, this.length);
    var mask = 0x3ffffff ^ 0x3ffffff >>> r << r;
    var maskedWords = extended;
    h -= s;
    h = Math.max(0, h); // Extended mode, copy masked part

    if (maskedWords) {
      for (var i = 0; i < s; i++) {
        maskedWords.words[i] = this.words[i];
      }

      maskedWords.length = s;
    }

    if (s === 0) {// No-op, we should not move anything at all
    } else if (this.length > s) {
      this.length -= s;

      for (i = 0; i < this.length; i++) {
        this.words[i] = this.words[i + s];
      }
    } else {
      this.words[0] = 0;
      this.length = 1;
    }

    var carry = 0;

    for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
      var word = this.words[i] | 0;
      this.words[i] = carry << 26 - r | word >>> r;
      carry = word & mask;
    } // Push carried bits as a mask


    if (maskedWords && carry !== 0) {
      maskedWords.words[maskedWords.length++] = carry;
    }

    if (this.length === 0) {
      this.words[0] = 0;
      this.length = 1;
    }

    return this.strip();
  };

  BN.prototype.ishrn = function ishrn(bits, hint, extended) {
    // TODO(indutny): implement me
    assert(this.negative === 0);
    return this.iushrn(bits, hint, extended);
  }; // Shift-left


  BN.prototype.shln = function shln(bits) {
    return this.clone().ishln(bits);
  };

  BN.prototype.ushln = function ushln(bits) {
    return this.clone().iushln(bits);
  }; // Shift-right


  BN.prototype.shrn = function shrn(bits) {
    return this.clone().ishrn(bits);
  };

  BN.prototype.ushrn = function ushrn(bits) {
    return this.clone().iushrn(bits);
  }; // Test if n bit is set


  BN.prototype.testn = function testn(bit) {
    assert(typeof bit === 'number' && bit >= 0);
    var r = bit % 26;
    var s = (bit - r) / 26;
    var q = 1 << r; // Fast case: bit is much higher than all existing words

    if (this.length <= s) return false; // Check bit and return

    var w = this.words[s];
    return !!(w & q);
  }; // Return only lowers bits of number (in-place)


  BN.prototype.imaskn = function imaskn(bits) {
    assert(typeof bits === 'number' && bits >= 0);
    var r = bits % 26;
    var s = (bits - r) / 26;
    assert(this.negative === 0, 'imaskn works only with positive numbers');

    if (this.length <= s) {
      return this;
    }

    if (r !== 0) {
      s++;
    }

    this.length = Math.min(s, this.length);

    if (r !== 0) {
      var mask = 0x3ffffff ^ 0x3ffffff >>> r << r;
      this.words[this.length - 1] &= mask;
    }

    return this.strip();
  }; // Return only lowers bits of number


  BN.prototype.maskn = function maskn(bits) {
    return this.clone().imaskn(bits);
  }; // Add plain number `num` to `this`


  BN.prototype.iaddn = function iaddn(num) {
    assert(typeof num === 'number');
    assert(num < 0x4000000);
    if (num < 0) return this.isubn(-num); // Possible sign change

    if (this.negative !== 0) {
      if (this.length === 1 && (this.words[0] | 0) < num) {
        this.words[0] = num - (this.words[0] | 0);
        this.negative = 0;
        return this;
      }

      this.negative = 0;
      this.isubn(num);
      this.negative = 1;
      return this;
    } // Add without checks


    return this._iaddn(num);
  };

  BN.prototype._iaddn = function _iaddn(num) {
    this.words[0] += num; // Carry

    for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
      this.words[i] -= 0x4000000;

      if (i === this.length - 1) {
        this.words[i + 1] = 1;
      } else {
        this.words[i + 1]++;
      }
    }

    this.length = Math.max(this.length, i + 1);
    return this;
  }; // Subtract plain number `num` from `this`


  BN.prototype.isubn = function isubn(num) {
    assert(typeof num === 'number');
    assert(num < 0x4000000);
    if (num < 0) return this.iaddn(-num);

    if (this.negative !== 0) {
      this.negative = 0;
      this.iaddn(num);
      this.negative = 1;
      return this;
    }

    this.words[0] -= num;

    if (this.length === 1 && this.words[0] < 0) {
      this.words[0] = -this.words[0];
      this.negative = 1;
    } else {
      // Carry
      for (var i = 0; i < this.length && this.words[i] < 0; i++) {
        this.words[i] += 0x4000000;
        this.words[i + 1] -= 1;
      }
    }

    return this.strip();
  };

  BN.prototype.addn = function addn(num) {
    return this.clone().iaddn(num);
  };

  BN.prototype.subn = function subn(num) {
    return this.clone().isubn(num);
  };

  BN.prototype.iabs = function iabs() {
    this.negative = 0;
    return this;
  };

  BN.prototype.abs = function abs() {
    return this.clone().iabs();
  };

  BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
    var len = num.length + shift;
    var i;

    this._expand(len);

    var w;
    var carry = 0;

    for (i = 0; i < num.length; i++) {
      w = (this.words[i + shift] | 0) + carry;
      var right = (num.words[i] | 0) * mul;
      w -= right & 0x3ffffff;
      carry = (w >> 26) - (right / 0x4000000 | 0);
      this.words[i + shift] = w & 0x3ffffff;
    }

    for (; i < this.length - shift; i++) {
      w = (this.words[i + shift] | 0) + carry;
      carry = w >> 26;
      this.words[i + shift] = w & 0x3ffffff;
    }

    if (carry === 0) return this.strip(); // Subtraction overflow

    assert(carry === -1);
    carry = 0;

    for (i = 0; i < this.length; i++) {
      w = -(this.words[i] | 0) + carry;
      carry = w >> 26;
      this.words[i] = w & 0x3ffffff;
    }

    this.negative = 1;
    return this.strip();
  };

  BN.prototype._wordDiv = function _wordDiv(num, mode) {
    var shift = this.length - num.length;
    var a = this.clone();
    var b = num; // Normalize

    var bhi = b.words[b.length - 1] | 0;

    var bhiBits = this._countBits(bhi);

    shift = 26 - bhiBits;

    if (shift !== 0) {
      b = b.ushln(shift);
      a.iushln(shift);
      bhi = b.words[b.length - 1] | 0;
    } // Initialize quotient


    var m = a.length - b.length;
    var q;

    if (mode !== 'mod') {
      q = new BN(null);
      q.length = m + 1;
      q.words = new Array(q.length);

      for (var i = 0; i < q.length; i++) {
        q.words[i] = 0;
      }
    }

    var diff = a.clone()._ishlnsubmul(b, 1, m);

    if (diff.negative === 0) {
      a = diff;

      if (q) {
        q.words[m] = 1;
      }
    }

    for (var j = m - 1; j >= 0; j--) {
      var qj = (a.words[b.length + j] | 0) * 0x4000000 + (a.words[b.length + j - 1] | 0); // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
      // (0x7ffffff)

      qj = Math.min(qj / bhi | 0, 0x3ffffff);

      a._ishlnsubmul(b, qj, j);

      while (a.negative !== 0) {
        qj--;
        a.negative = 0;

        a._ishlnsubmul(b, 1, j);

        if (!a.isZero()) {
          a.negative ^= 1;
        }
      }

      if (q) {
        q.words[j] = qj;
      }
    }

    if (q) {
      q.strip();
    }

    a.strip(); // Denormalize

    if (mode !== 'div' && shift !== 0) {
      a.iushrn(shift);
    }

    return {
      div: q || null,
      mod: a
    };
  }; // NOTE: 1) `mode` can be set to `mod` to request mod only,
  //       to `div` to request div only, or be absent to
  //       request both div & mod
  //       2) `positive` is true if unsigned mod is requested


  BN.prototype.divmod = function divmod(num, mode, positive) {
    assert(!num.isZero());

    if (this.isZero()) {
      return {
        div: new BN(0),
        mod: new BN(0)
      };
    }

    var div, mod, res;

    if (this.negative !== 0 && num.negative === 0) {
      res = this.neg().divmod(num, mode);

      if (mode !== 'mod') {
        div = res.div.neg();
      }

      if (mode !== 'div') {
        mod = res.mod.neg();

        if (positive && mod.negative !== 0) {
          mod.iadd(num);
        }
      }

      return {
        div: div,
        mod: mod
      };
    }

    if (this.negative === 0 && num.negative !== 0) {
      res = this.divmod(num.neg(), mode);

      if (mode !== 'mod') {
        div = res.div.neg();
      }

      return {
        div: div,
        mod: res.mod
      };
    }

    if ((this.negative & num.negative) !== 0) {
      res = this.neg().divmod(num.neg(), mode);

      if (mode !== 'div') {
        mod = res.mod.neg();

        if (positive && mod.negative !== 0) {
          mod.isub(num);
        }
      }

      return {
        div: res.div,
        mod: mod
      };
    } // Both numbers are positive at this point
    // Strip both numbers to approximate shift value


    if (num.length > this.length || this.cmp(num) < 0) {
      return {
        div: new BN(0),
        mod: this
      };
    } // Very short reduction


    if (num.length === 1) {
      if (mode === 'div') {
        return {
          div: this.divn(num.words[0]),
          mod: null
        };
      }

      if (mode === 'mod') {
        return {
          div: null,
          mod: new BN(this.modn(num.words[0]))
        };
      }

      return {
        div: this.divn(num.words[0]),
        mod: new BN(this.modn(num.words[0]))
      };
    }

    return this._wordDiv(num, mode);
  }; // Find `this` / `num`


  BN.prototype.div = function div(num) {
    return this.divmod(num, 'div', false).div;
  }; // Find `this` % `num`


  BN.prototype.mod = function mod(num) {
    return this.divmod(num, 'mod', false).mod;
  };

  BN.prototype.umod = function umod(num) {
    return this.divmod(num, 'mod', true).mod;
  }; // Find Round(`this` / `num`)


  BN.prototype.divRound = function divRound(num) {
    var dm = this.divmod(num); // Fast case - exact division

    if (dm.mod.isZero()) return dm.div;
    var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;
    var half = num.ushrn(1);
    var r2 = num.andln(1);
    var cmp = mod.cmp(half); // Round down

    if (cmp < 0 || r2 === 1 && cmp === 0) return dm.div; // Round up

    return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
  };

  BN.prototype.modn = function modn(num) {
    assert(num <= 0x3ffffff);
    var p = (1 << 26) % num;
    var acc = 0;

    for (var i = this.length - 1; i >= 0; i--) {
      acc = (p * acc + (this.words[i] | 0)) % num;
    }

    return acc;
  }; // In-place division by number


  BN.prototype.idivn = function idivn(num) {
    assert(num <= 0x3ffffff);
    var carry = 0;

    for (var i = this.length - 1; i >= 0; i--) {
      var w = (this.words[i] | 0) + carry * 0x4000000;
      this.words[i] = w / num | 0;
      carry = w % num;
    }

    return this.strip();
  };

  BN.prototype.divn = function divn(num) {
    return this.clone().idivn(num);
  };

  BN.prototype.egcd = function egcd(p) {
    assert(p.negative === 0);
    assert(!p.isZero());
    var x = this;
    var y = p.clone();

    if (x.negative !== 0) {
      x = x.umod(p);
    } else {
      x = x.clone();
    } // A * x + B * y = x


    var A = new BN(1);
    var B = new BN(0); // C * x + D * y = y

    var C = new BN(0);
    var D = new BN(1);
    var g = 0;

    while (x.isEven() && y.isEven()) {
      x.iushrn(1);
      y.iushrn(1);
      ++g;
    }

    var yp = y.clone();
    var xp = x.clone();

    while (!x.isZero()) {
      for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1) {
        ;
      }

      if (i > 0) {
        x.iushrn(i);

        while (i-- > 0) {
          if (A.isOdd() || B.isOdd()) {
            A.iadd(yp);
            B.isub(xp);
          }

          A.iushrn(1);
          B.iushrn(1);
        }
      }

      for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1) {
        ;
      }

      if (j > 0) {
        y.iushrn(j);

        while (j-- > 0) {
          if (C.isOdd() || D.isOdd()) {
            C.iadd(yp);
            D.isub(xp);
          }

          C.iushrn(1);
          D.iushrn(1);
        }
      }

      if (x.cmp(y) >= 0) {
        x.isub(y);
        A.isub(C);
        B.isub(D);
      } else {
        y.isub(x);
        C.isub(A);
        D.isub(B);
      }
    }

    return {
      a: C,
      b: D,
      gcd: y.iushln(g)
    };
  }; // This is reduced incarnation of the binary EEA
  // above, designated to invert members of the
  // _prime_ fields F(p) at a maximal speed


  BN.prototype._invmp = function _invmp(p) {
    assert(p.negative === 0);
    assert(!p.isZero());
    var a = this;
    var b = p.clone();

    if (a.negative !== 0) {
      a = a.umod(p);
    } else {
      a = a.clone();
    }

    var x1 = new BN(1);
    var x2 = new BN(0);
    var delta = b.clone();

    while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
      for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1) {
        ;
      }

      if (i > 0) {
        a.iushrn(i);

        while (i-- > 0) {
          if (x1.isOdd()) {
            x1.iadd(delta);
          }

          x1.iushrn(1);
        }
      }

      for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1) {
        ;
      }

      if (j > 0) {
        b.iushrn(j);

        while (j-- > 0) {
          if (x2.isOdd()) {
            x2.iadd(delta);
          }

          x2.iushrn(1);
        }
      }

      if (a.cmp(b) >= 0) {
        a.isub(b);
        x1.isub(x2);
      } else {
        b.isub(a);
        x2.isub(x1);
      }
    }

    var res;

    if (a.cmpn(1) === 0) {
      res = x1;
    } else {
      res = x2;
    }

    if (res.cmpn(0) < 0) {
      res.iadd(p);
    }

    return res;
  };

  BN.prototype.gcd = function gcd(num) {
    if (this.isZero()) return num.abs();
    if (num.isZero()) return this.abs();
    var a = this.clone();
    var b = num.clone();
    a.negative = 0;
    b.negative = 0; // Remove common factor of two

    for (var shift = 0; a.isEven() && b.isEven(); shift++) {
      a.iushrn(1);
      b.iushrn(1);
    }

    do {
      while (a.isEven()) {
        a.iushrn(1);
      }

      while (b.isEven()) {
        b.iushrn(1);
      }

      var r = a.cmp(b);

      if (r < 0) {
        // Swap `a` and `b` to make `a` always bigger than `b`
        var t = a;
        a = b;
        b = t;
      } else if (r === 0 || b.cmpn(1) === 0) {
        break;
      }

      a.isub(b);
    } while (true);

    return b.iushln(shift);
  }; // Invert number in the field F(num)


  BN.prototype.invm = function invm(num) {
    return this.egcd(num).a.umod(num);
  };

  BN.prototype.isEven = function isEven() {
    return (this.words[0] & 1) === 0;
  };

  BN.prototype.isOdd = function isOdd() {
    return (this.words[0] & 1) === 1;
  }; // And first word and num


  BN.prototype.andln = function andln(num) {
    return this.words[0] & num;
  }; // Increment at the bit position in-line


  BN.prototype.bincn = function bincn(bit) {
    assert(typeof bit === 'number');
    var r = bit % 26;
    var s = (bit - r) / 26;
    var q = 1 << r; // Fast case: bit is much higher than all existing words

    if (this.length <= s) {
      this._expand(s + 1);

      this.words[s] |= q;
      return this;
    } // Add bit and propagate, if needed


    var carry = q;

    for (var i = s; carry !== 0 && i < this.length; i++) {
      var w = this.words[i] | 0;
      w += carry;
      carry = w >>> 26;
      w &= 0x3ffffff;
      this.words[i] = w;
    }

    if (carry !== 0) {
      this.words[i] = carry;
      this.length++;
    }

    return this;
  };

  BN.prototype.isZero = function isZero() {
    return this.length === 1 && this.words[0] === 0;
  };

  BN.prototype.cmpn = function cmpn(num) {
    var negative = num < 0;
    if (this.negative !== 0 && !negative) return -1;
    if (this.negative === 0 && negative) return 1;
    this.strip();
    var res;

    if (this.length > 1) {
      res = 1;
    } else {
      if (negative) {
        num = -num;
      }

      assert(num <= 0x3ffffff, 'Number is too big');
      var w = this.words[0] | 0;
      res = w === num ? 0 : w < num ? -1 : 1;
    }

    if (this.negative !== 0) return -res | 0;
    return res;
  }; // Compare two numbers and return:
  // 1 - if `this` > `num`
  // 0 - if `this` == `num`
  // -1 - if `this` < `num`


  BN.prototype.cmp = function cmp(num) {
    if (this.negative !== 0 && num.negative === 0) return -1;
    if (this.negative === 0 && num.negative !== 0) return 1;
    var res = this.ucmp(num);
    if (this.negative !== 0) return -res | 0;
    return res;
  }; // Unsigned comparison


  BN.prototype.ucmp = function ucmp(num) {
    // At this point both numbers have the same sign
    if (this.length > num.length) return 1;
    if (this.length < num.length) return -1;
    var res = 0;

    for (var i = this.length - 1; i >= 0; i--) {
      var a = this.words[i] | 0;
      var b = num.words[i] | 0;
      if (a === b) continue;

      if (a < b) {
        res = -1;
      } else if (a > b) {
        res = 1;
      }

      break;
    }

    return res;
  };

  BN.prototype.gtn = function gtn(num) {
    return this.cmpn(num) === 1;
  };

  BN.prototype.gt = function gt(num) {
    return this.cmp(num) === 1;
  };

  BN.prototype.gten = function gten(num) {
    return this.cmpn(num) >= 0;
  };

  BN.prototype.gte = function gte(num) {
    return this.cmp(num) >= 0;
  };

  BN.prototype.ltn = function ltn(num) {
    return this.cmpn(num) === -1;
  };

  BN.prototype.lt = function lt(num) {
    return this.cmp(num) === -1;
  };

  BN.prototype.lten = function lten(num) {
    return this.cmpn(num) <= 0;
  };

  BN.prototype.lte = function lte(num) {
    return this.cmp(num) <= 0;
  };

  BN.prototype.eqn = function eqn(num) {
    return this.cmpn(num) === 0;
  };

  BN.prototype.eq = function eq(num) {
    return this.cmp(num) === 0;
  }; //
  // A reduce context, could be using montgomery or something better, depending
  // on the `m` itself.
  //


  BN.red = function red(num) {
    return new Red(num);
  };

  BN.prototype.toRed = function toRed(ctx) {
    assert(!this.red, 'Already a number in reduction context');
    assert(this.negative === 0, 'red works only with positives');
    return ctx.convertTo(this)._forceRed(ctx);
  };

  BN.prototype.fromRed = function fromRed() {
    assert(this.red, 'fromRed works only with numbers in reduction context');
    return this.red.convertFrom(this);
  };

  BN.prototype._forceRed = function _forceRed(ctx) {
    this.red = ctx;
    return this;
  };

  BN.prototype.forceRed = function forceRed(ctx) {
    assert(!this.red, 'Already a number in reduction context');
    return this._forceRed(ctx);
  };

  BN.prototype.redAdd = function redAdd(num) {
    assert(this.red, 'redAdd works only with red numbers');
    return this.red.add(this, num);
  };

  BN.prototype.redIAdd = function redIAdd(num) {
    assert(this.red, 'redIAdd works only with red numbers');
    return this.red.iadd(this, num);
  };

  BN.prototype.redSub = function redSub(num) {
    assert(this.red, 'redSub works only with red numbers');
    return this.red.sub(this, num);
  };

  BN.prototype.redISub = function redISub(num) {
    assert(this.red, 'redISub works only with red numbers');
    return this.red.isub(this, num);
  };

  BN.prototype.redShl = function redShl(num) {
    assert(this.red, 'redShl works only with red numbers');
    return this.red.shl(this, num);
  };

  BN.prototype.redMul = function redMul(num) {
    assert(this.red, 'redMul works only with red numbers');

    this.red._verify2(this, num);

    return this.red.mul(this, num);
  };

  BN.prototype.redIMul = function redIMul(num) {
    assert(this.red, 'redMul works only with red numbers');

    this.red._verify2(this, num);

    return this.red.imul(this, num);
  };

  BN.prototype.redSqr = function redSqr() {
    assert(this.red, 'redSqr works only with red numbers');

    this.red._verify1(this);

    return this.red.sqr(this);
  };

  BN.prototype.redISqr = function redISqr() {
    assert(this.red, 'redISqr works only with red numbers');

    this.red._verify1(this);

    return this.red.isqr(this);
  }; // Square root over p


  BN.prototype.redSqrt = function redSqrt() {
    assert(this.red, 'redSqrt works only with red numbers');

    this.red._verify1(this);

    return this.red.sqrt(this);
  };

  BN.prototype.redInvm = function redInvm() {
    assert(this.red, 'redInvm works only with red numbers');

    this.red._verify1(this);

    return this.red.invm(this);
  }; // Return negative clone of `this` % `red modulo`


  BN.prototype.redNeg = function redNeg() {
    assert(this.red, 'redNeg works only with red numbers');

    this.red._verify1(this);

    return this.red.neg(this);
  };

  BN.prototype.redPow = function redPow(num) {
    assert(this.red && !num.red, 'redPow(normalNum)');

    this.red._verify1(this);

    return this.red.pow(this, num);
  }; // Prime numbers with efficient reduction


  var primes = {
    k256: null,
    p224: null,
    p192: null,
    p25519: null
  }; // Pseudo-Mersenne prime

  function MPrime(name, p) {
    // P = 2 ^ N - K
    this.name = name;
    this.p = new BN(p, 16);
    this.n = this.p.bitLength();
    this.k = new BN(1).iushln(this.n).isub(this.p);
    this.tmp = this._tmp();
  }

  MPrime.prototype._tmp = function _tmp() {
    var tmp = new BN(null);
    tmp.words = new Array(Math.ceil(this.n / 13));
    return tmp;
  };

  MPrime.prototype.ireduce = function ireduce(num) {
    // Assumes that `num` is less than `P^2`
    // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
    var r = num;
    var rlen;

    do {
      this.split(r, this.tmp);
      r = this.imulK(r);
      r = r.iadd(this.tmp);
      rlen = r.bitLength();
    } while (rlen > this.n);

    var cmp = rlen < this.n ? -1 : r.ucmp(this.p);

    if (cmp === 0) {
      r.words[0] = 0;
      r.length = 1;
    } else if (cmp > 0) {
      r.isub(this.p);
    } else {
      r.strip();
    }

    return r;
  };

  MPrime.prototype.split = function split(input, out) {
    input.iushrn(this.n, 0, out);
  };

  MPrime.prototype.imulK = function imulK(num) {
    return num.imul(this.k);
  };

  function K256() {
    MPrime.call(this, 'k256', 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
  }

  inherits(K256, MPrime);

  K256.prototype.split = function split(input, output) {
    // 256 = 9 * 26 + 22
    var mask = 0x3fffff;
    var outLen = Math.min(input.length, 9);

    for (var i = 0; i < outLen; i++) {
      output.words[i] = input.words[i];
    }

    output.length = outLen;

    if (input.length <= 9) {
      input.words[0] = 0;
      input.length = 1;
      return;
    } // Shift by 9 limbs


    var prev = input.words[9];
    output.words[output.length++] = prev & mask;

    for (i = 10; i < input.length; i++) {
      var next = input.words[i] | 0;
      input.words[i - 10] = (next & mask) << 4 | prev >>> 22;
      prev = next;
    }

    prev >>>= 22;
    input.words[i - 10] = prev;

    if (prev === 0 && input.length > 10) {
      input.length -= 10;
    } else {
      input.length -= 9;
    }
  };

  K256.prototype.imulK = function imulK(num) {
    // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
    num.words[num.length] = 0;
    num.words[num.length + 1] = 0;
    num.length += 2; // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390

    var lo = 0;

    for (var i = 0; i < num.length; i++) {
      var w = num.words[i] | 0;
      lo += w * 0x3d1;
      num.words[i] = lo & 0x3ffffff;
      lo = w * 0x40 + (lo / 0x4000000 | 0);
    } // Fast length reduction


    if (num.words[num.length - 1] === 0) {
      num.length--;

      if (num.words[num.length - 1] === 0) {
        num.length--;
      }
    }

    return num;
  };

  function P224() {
    MPrime.call(this, 'p224', 'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
  }

  inherits(P224, MPrime);

  function P192() {
    MPrime.call(this, 'p192', 'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
  }

  inherits(P192, MPrime);

  function P25519() {
    // 2 ^ 255 - 19
    MPrime.call(this, '25519', '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
  }

  inherits(P25519, MPrime);

  P25519.prototype.imulK = function imulK(num) {
    // K = 0x13
    var carry = 0;

    for (var i = 0; i < num.length; i++) {
      var hi = (num.words[i] | 0) * 0x13 + carry;
      var lo = hi & 0x3ffffff;
      hi >>>= 26;
      num.words[i] = lo;
      carry = hi;
    }

    if (carry !== 0) {
      num.words[num.length++] = carry;
    }

    return num;
  }; // Exported mostly for testing purposes, use plain name instead


  BN._prime = function prime(name) {
    // Cached version of prime
    if (primes[name]) return primes[name];
    var prime;

    if (name === 'k256') {
      prime = new K256();
    } else if (name === 'p224') {
      prime = new P224();
    } else if (name === 'p192') {
      prime = new P192();
    } else if (name === 'p25519') {
      prime = new P25519();
    } else {
      throw new Error('Unknown prime ' + name);
    }

    primes[name] = prime;
    return prime;
  }; //
  // Base reduction engine
  //


  function Red(m) {
    if (typeof m === 'string') {
      var prime = BN._prime(m);

      this.m = prime.p;
      this.prime = prime;
    } else {
      assert(m.gtn(1), 'modulus must be greater than 1');
      this.m = m;
      this.prime = null;
    }
  }

  Red.prototype._verify1 = function _verify1(a) {
    assert(a.negative === 0, 'red works only with positives');
    assert(a.red, 'red works only with red numbers');
  };

  Red.prototype._verify2 = function _verify2(a, b) {
    assert((a.negative | b.negative) === 0, 'red works only with positives');
    assert(a.red && a.red === b.red, 'red works only with red numbers');
  };

  Red.prototype.imod = function imod(a) {
    if (this.prime) return this.prime.ireduce(a)._forceRed(this);
    return a.umod(this.m)._forceRed(this);
  };

  Red.prototype.neg = function neg(a) {
    if (a.isZero()) {
      return a.clone();
    }

    return this.m.sub(a)._forceRed(this);
  };

  Red.prototype.add = function add(a, b) {
    this._verify2(a, b);

    var res = a.add(b);

    if (res.cmp(this.m) >= 0) {
      res.isub(this.m);
    }

    return res._forceRed(this);
  };

  Red.prototype.iadd = function iadd(a, b) {
    this._verify2(a, b);

    var res = a.iadd(b);

    if (res.cmp(this.m) >= 0) {
      res.isub(this.m);
    }

    return res;
  };

  Red.prototype.sub = function sub(a, b) {
    this._verify2(a, b);

    var res = a.sub(b);

    if (res.cmpn(0) < 0) {
      res.iadd(this.m);
    }

    return res._forceRed(this);
  };

  Red.prototype.isub = function isub(a, b) {
    this._verify2(a, b);

    var res = a.isub(b);

    if (res.cmpn(0) < 0) {
      res.iadd(this.m);
    }

    return res;
  };

  Red.prototype.shl = function shl(a, num) {
    this._verify1(a);

    return this.imod(a.ushln(num));
  };

  Red.prototype.imul = function imul(a, b) {
    this._verify2(a, b);

    return this.imod(a.imul(b));
  };

  Red.prototype.mul = function mul(a, b) {
    this._verify2(a, b);

    return this.imod(a.mul(b));
  };

  Red.prototype.isqr = function isqr(a) {
    return this.imul(a, a.clone());
  };

  Red.prototype.sqr = function sqr(a) {
    return this.mul(a, a);
  };

  Red.prototype.sqrt = function sqrt(a) {
    if (a.isZero()) return a.clone();
    var mod3 = this.m.andln(3);
    assert(mod3 % 2 === 1); // Fast case

    if (mod3 === 3) {
      var pow = this.m.add(new BN(1)).iushrn(2);
      return this.pow(a, pow);
    } // Tonelli-Shanks algorithm (Totally unoptimized and slow)
    //
    // Find Q and S, that Q * 2 ^ S = (P - 1)


    var q = this.m.subn(1);
    var s = 0;

    while (!q.isZero() && q.andln(1) === 0) {
      s++;
      q.iushrn(1);
    }

    assert(!q.isZero());
    var one = new BN(1).toRed(this);
    var nOne = one.redNeg(); // Find quadratic non-residue
    // NOTE: Max is such because of generalized Riemann hypothesis.

    var lpow = this.m.subn(1).iushrn(1);
    var z = this.m.bitLength();
    z = new BN(2 * z * z).toRed(this);

    while (this.pow(z, lpow).cmp(nOne) !== 0) {
      z.redIAdd(nOne);
    }

    var c = this.pow(z, q);
    var r = this.pow(a, q.addn(1).iushrn(1));
    var t = this.pow(a, q);
    var m = s;

    while (t.cmp(one) !== 0) {
      var tmp = t;

      for (var i = 0; tmp.cmp(one) !== 0; i++) {
        tmp = tmp.redSqr();
      }

      assert(i < m);
      var b = this.pow(c, new BN(1).iushln(m - i - 1));
      r = r.redMul(b);
      c = b.redSqr();
      t = t.redMul(c);
      m = i;
    }

    return r;
  };

  Red.prototype.invm = function invm(a) {
    var inv = a._invmp(this.m);

    if (inv.negative !== 0) {
      inv.negative = 0;
      return this.imod(inv).redNeg();
    } else {
      return this.imod(inv);
    }
  };

  Red.prototype.pow = function pow(a, num) {
    if (num.isZero()) return new BN(1).toRed(this);
    if (num.cmpn(1) === 0) return a.clone();
    var windowSize = 4;
    var wnd = new Array(1 << windowSize);
    wnd[0] = new BN(1).toRed(this);
    wnd[1] = a;

    for (var i = 2; i < wnd.length; i++) {
      wnd[i] = this.mul(wnd[i - 1], a);
    }

    var res = wnd[0];
    var current = 0;
    var currentLen = 0;
    var start = num.bitLength() % 26;

    if (start === 0) {
      start = 26;
    }

    for (i = num.length - 1; i >= 0; i--) {
      var word = num.words[i];

      for (var j = start - 1; j >= 0; j--) {
        var bit = word >> j & 1;

        if (res !== wnd[0]) {
          res = this.sqr(res);
        }

        if (bit === 0 && current === 0) {
          currentLen = 0;
          continue;
        }

        current <<= 1;
        current |= bit;
        currentLen++;
        if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;
        res = this.mul(res, wnd[current]);
        currentLen = 0;
        current = 0;
      }

      start = 26;
    }

    return res;
  };

  Red.prototype.convertTo = function convertTo(num) {
    var r = num.umod(this.m);
    return r === num ? r.clone() : r;
  };

  Red.prototype.convertFrom = function convertFrom(num) {
    var res = num.clone();
    res.red = null;
    return res;
  }; //
  // Montgomery method engine
  //


  BN.mont = function mont(num) {
    return new Mont(num);
  };

  function Mont(m) {
    Red.call(this, m);
    this.shift = this.m.bitLength();

    if (this.shift % 26 !== 0) {
      this.shift += 26 - this.shift % 26;
    }

    this.r = new BN(1).iushln(this.shift);
    this.r2 = this.imod(this.r.sqr());
    this.rinv = this.r._invmp(this.m);
    this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
    this.minv = this.minv.umod(this.r);
    this.minv = this.r.sub(this.minv);
  }

  inherits(Mont, Red);

  Mont.prototype.convertTo = function convertTo(num) {
    return this.imod(num.ushln(this.shift));
  };

  Mont.prototype.convertFrom = function convertFrom(num) {
    var r = this.imod(num.mul(this.rinv));
    r.red = null;
    return r;
  };

  Mont.prototype.imul = function imul(a, b) {
    if (a.isZero() || b.isZero()) {
      a.words[0] = 0;
      a.length = 1;
      return a;
    }

    var t = a.imul(b);
    var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
    var u = t.isub(c).iushrn(this.shift);
    var res = u;

    if (u.cmp(this.m) >= 0) {
      res = u.isub(this.m);
    } else if (u.cmpn(0) < 0) {
      res = u.iadd(this.m);
    }

    return res._forceRed(this);
  };

  Mont.prototype.mul = function mul(a, b) {
    if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);
    var t = a.mul(b);
    var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
    var u = t.isub(c).iushrn(this.shift);
    var res = u;

    if (u.cmp(this.m) >= 0) {
      res = u.isub(this.m);
    } else if (u.cmpn(0) < 0) {
      res = u.iadd(this.m);
    }

    return res._forceRed(this);
  };

  Mont.prototype.invm = function invm(a) {
    // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
    var res = this.imod(a._invmp(this.m).mul(this.r2));
    return res._forceRed(this);
  };
})(typeof module === 'undefined' || module, void 0);

},{"buffer":2}],48:[function(require,module,exports){
(function (process,global){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * [js-sha3]{@link https://github.com/emn178/js-sha3}
 *
 * @version 0.5.7
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2015-2016
 * @license MIT
 */

/*jslint bitwise: true */
(function () {
  'use strict';

  var root = (typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' ? window : {};
  var NODE_JS = !root.JS_SHA3_NO_NODE_JS && (typeof process === "undefined" ? "undefined" : _typeof(process)) === 'object' && process.versions && process.versions.node;

  if (NODE_JS) {
    root = global;
  }

  var COMMON_JS = !root.JS_SHA3_NO_COMMON_JS && (typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object' && module.exports;
  var HEX_CHARS = '0123456789abcdef'.split('');
  var SHAKE_PADDING = [31, 7936, 2031616, 520093696];
  var KECCAK_PADDING = [1, 256, 65536, 16777216];
  var PADDING = [6, 1536, 393216, 100663296];
  var SHIFT = [0, 8, 16, 24];
  var RC = [1, 0, 32898, 0, 32906, 2147483648, 2147516416, 2147483648, 32907, 0, 2147483649, 0, 2147516545, 2147483648, 32777, 2147483648, 138, 0, 136, 0, 2147516425, 0, 2147483658, 0, 2147516555, 0, 139, 2147483648, 32905, 2147483648, 32771, 2147483648, 32770, 2147483648, 128, 2147483648, 32778, 0, 2147483658, 2147483648, 2147516545, 2147483648, 32896, 2147483648, 2147483649, 0, 2147516424, 2147483648];
  var BITS = [224, 256, 384, 512];
  var SHAKE_BITS = [128, 256];
  var OUTPUT_TYPES = ['hex', 'buffer', 'arrayBuffer', 'array'];

  var createOutputMethod = function createOutputMethod(bits, padding, outputType) {
    return function (message) {
      return new Keccak(bits, padding, bits).update(message)[outputType]();
    };
  };

  var createShakeOutputMethod = function createShakeOutputMethod(bits, padding, outputType) {
    return function (message, outputBits) {
      return new Keccak(bits, padding, outputBits).update(message)[outputType]();
    };
  };

  var createMethod = function createMethod(bits, padding) {
    var method = createOutputMethod(bits, padding, 'hex');

    method.create = function () {
      return new Keccak(bits, padding, bits);
    };

    method.update = function (message) {
      return method.create().update(message);
    };

    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createOutputMethod(bits, padding, type);
    }

    return method;
  };

  var createShakeMethod = function createShakeMethod(bits, padding) {
    var method = createShakeOutputMethod(bits, padding, 'hex');

    method.create = function (outputBits) {
      return new Keccak(bits, padding, outputBits);
    };

    method.update = function (message, outputBits) {
      return method.create(outputBits).update(message);
    };

    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createShakeOutputMethod(bits, padding, type);
    }

    return method;
  };

  var algorithms = [{
    name: 'keccak',
    padding: KECCAK_PADDING,
    bits: BITS,
    createMethod: createMethod
  }, {
    name: 'sha3',
    padding: PADDING,
    bits: BITS,
    createMethod: createMethod
  }, {
    name: 'shake',
    padding: SHAKE_PADDING,
    bits: SHAKE_BITS,
    createMethod: createShakeMethod
  }];
  var methods = {},
      methodNames = [];

  for (var i = 0; i < algorithms.length; ++i) {
    var algorithm = algorithms[i];
    var bits = algorithm.bits;

    for (var j = 0; j < bits.length; ++j) {
      var methodName = algorithm.name + '_' + bits[j];
      methodNames.push(methodName);
      methods[methodName] = algorithm.createMethod(bits[j], algorithm.padding);
    }
  }

  function Keccak(bits, padding, outputBits) {
    this.blocks = [];
    this.s = [];
    this.padding = padding;
    this.outputBits = outputBits;
    this.reset = true;
    this.block = 0;
    this.start = 0;
    this.blockCount = 1600 - (bits << 1) >> 5;
    this.byteCount = this.blockCount << 2;
    this.outputBlocks = outputBits >> 5;
    this.extraBytes = (outputBits & 31) >> 3;

    for (var i = 0; i < 50; ++i) {
      this.s[i] = 0;
    }
  }

  Keccak.prototype.update = function (message) {
    var notString = typeof message !== 'string';

    if (notString && message.constructor === ArrayBuffer) {
      message = new Uint8Array(message);
    }

    var length = message.length,
        blocks = this.blocks,
        byteCount = this.byteCount,
        blockCount = this.blockCount,
        index = 0,
        s = this.s,
        i,
        code;

    while (index < length) {
      if (this.reset) {
        this.reset = false;
        blocks[0] = this.block;

        for (i = 1; i < blockCount + 1; ++i) {
          blocks[i] = 0;
        }
      }

      if (notString) {
        for (i = this.start; index < length && i < byteCount; ++index) {
          blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
        }
      } else {
        for (i = this.start; index < length && i < byteCount; ++index) {
          code = message.charCodeAt(index);

          if (code < 0x80) {
            blocks[i >> 2] |= code << SHIFT[i++ & 3];
          } else if (code < 0x800) {
            blocks[i >> 2] |= (0xc0 | code >> 6) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
          } else if (code < 0xd800 || code >= 0xe000) {
            blocks[i >> 2] |= (0xe0 | code >> 12) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | code >> 6 & 0x3f) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
          } else {
            code = 0x10000 + ((code & 0x3ff) << 10 | message.charCodeAt(++index) & 0x3ff);
            blocks[i >> 2] |= (0xf0 | code >> 18) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | code >> 12 & 0x3f) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | code >> 6 & 0x3f) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
          }
        }
      }

      this.lastByteIndex = i;

      if (i >= byteCount) {
        this.start = i - byteCount;
        this.block = blocks[blockCount];

        for (i = 0; i < blockCount; ++i) {
          s[i] ^= blocks[i];
        }

        f(s);
        this.reset = true;
      } else {
        this.start = i;
      }
    }

    return this;
  };

  Keccak.prototype.finalize = function () {
    var blocks = this.blocks,
        i = this.lastByteIndex,
        blockCount = this.blockCount,
        s = this.s;
    blocks[i >> 2] |= this.padding[i & 3];

    if (this.lastByteIndex === this.byteCount) {
      blocks[0] = blocks[blockCount];

      for (i = 1; i < blockCount + 1; ++i) {
        blocks[i] = 0;
      }
    }

    blocks[blockCount - 1] |= 0x80000000;

    for (i = 0; i < blockCount; ++i) {
      s[i] ^= blocks[i];
    }

    f(s);
  };

  Keccak.prototype.toString = Keccak.prototype.hex = function () {
    this.finalize();
    var blockCount = this.blockCount,
        s = this.s,
        outputBlocks = this.outputBlocks,
        extraBytes = this.extraBytes,
        i = 0,
        j = 0;
    var hex = '',
        block;

    while (j < outputBlocks) {
      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
        block = s[i];
        hex += HEX_CHARS[block >> 4 & 0x0F] + HEX_CHARS[block & 0x0F] + HEX_CHARS[block >> 12 & 0x0F] + HEX_CHARS[block >> 8 & 0x0F] + HEX_CHARS[block >> 20 & 0x0F] + HEX_CHARS[block >> 16 & 0x0F] + HEX_CHARS[block >> 28 & 0x0F] + HEX_CHARS[block >> 24 & 0x0F];
      }

      if (j % blockCount === 0) {
        f(s);
        i = 0;
      }
    }

    if (extraBytes) {
      block = s[i];

      if (extraBytes > 0) {
        hex += HEX_CHARS[block >> 4 & 0x0F] + HEX_CHARS[block & 0x0F];
      }

      if (extraBytes > 1) {
        hex += HEX_CHARS[block >> 12 & 0x0F] + HEX_CHARS[block >> 8 & 0x0F];
      }

      if (extraBytes > 2) {
        hex += HEX_CHARS[block >> 20 & 0x0F] + HEX_CHARS[block >> 16 & 0x0F];
      }
    }

    return hex;
  };

  Keccak.prototype.arrayBuffer = function () {
    this.finalize();
    var blockCount = this.blockCount,
        s = this.s,
        outputBlocks = this.outputBlocks,
        extraBytes = this.extraBytes,
        i = 0,
        j = 0;
    var bytes = this.outputBits >> 3;
    var buffer;

    if (extraBytes) {
      buffer = new ArrayBuffer(outputBlocks + 1 << 2);
    } else {
      buffer = new ArrayBuffer(bytes);
    }

    var array = new Uint32Array(buffer);

    while (j < outputBlocks) {
      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
        array[j] = s[i];
      }

      if (j % blockCount === 0) {
        f(s);
      }
    }

    if (extraBytes) {
      array[i] = s[i];
      buffer = buffer.slice(0, bytes);
    }

    return buffer;
  };

  Keccak.prototype.buffer = Keccak.prototype.arrayBuffer;

  Keccak.prototype.digest = Keccak.prototype.array = function () {
    this.finalize();
    var blockCount = this.blockCount,
        s = this.s,
        outputBlocks = this.outputBlocks,
        extraBytes = this.extraBytes,
        i = 0,
        j = 0;
    var array = [],
        offset,
        block;

    while (j < outputBlocks) {
      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
        offset = j << 2;
        block = s[i];
        array[offset] = block & 0xFF;
        array[offset + 1] = block >> 8 & 0xFF;
        array[offset + 2] = block >> 16 & 0xFF;
        array[offset + 3] = block >> 24 & 0xFF;
      }

      if (j % blockCount === 0) {
        f(s);
      }
    }

    if (extraBytes) {
      offset = j << 2;
      block = s[i];

      if (extraBytes > 0) {
        array[offset] = block & 0xFF;
      }

      if (extraBytes > 1) {
        array[offset + 1] = block >> 8 & 0xFF;
      }

      if (extraBytes > 2) {
        array[offset + 2] = block >> 16 & 0xFF;
      }
    }

    return array;
  };

  var f = function f(s) {
    var h, l, n, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17, b18, b19, b20, b21, b22, b23, b24, b25, b26, b27, b28, b29, b30, b31, b32, b33, b34, b35, b36, b37, b38, b39, b40, b41, b42, b43, b44, b45, b46, b47, b48, b49;

    for (n = 0; n < 48; n += 2) {
      c0 = s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];
      c1 = s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];
      c2 = s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];
      c3 = s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];
      c4 = s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];
      c5 = s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];
      c6 = s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];
      c7 = s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];
      c8 = s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];
      c9 = s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];
      h = c8 ^ (c2 << 1 | c3 >>> 31);
      l = c9 ^ (c3 << 1 | c2 >>> 31);
      s[0] ^= h;
      s[1] ^= l;
      s[10] ^= h;
      s[11] ^= l;
      s[20] ^= h;
      s[21] ^= l;
      s[30] ^= h;
      s[31] ^= l;
      s[40] ^= h;
      s[41] ^= l;
      h = c0 ^ (c4 << 1 | c5 >>> 31);
      l = c1 ^ (c5 << 1 | c4 >>> 31);
      s[2] ^= h;
      s[3] ^= l;
      s[12] ^= h;
      s[13] ^= l;
      s[22] ^= h;
      s[23] ^= l;
      s[32] ^= h;
      s[33] ^= l;
      s[42] ^= h;
      s[43] ^= l;
      h = c2 ^ (c6 << 1 | c7 >>> 31);
      l = c3 ^ (c7 << 1 | c6 >>> 31);
      s[4] ^= h;
      s[5] ^= l;
      s[14] ^= h;
      s[15] ^= l;
      s[24] ^= h;
      s[25] ^= l;
      s[34] ^= h;
      s[35] ^= l;
      s[44] ^= h;
      s[45] ^= l;
      h = c4 ^ (c8 << 1 | c9 >>> 31);
      l = c5 ^ (c9 << 1 | c8 >>> 31);
      s[6] ^= h;
      s[7] ^= l;
      s[16] ^= h;
      s[17] ^= l;
      s[26] ^= h;
      s[27] ^= l;
      s[36] ^= h;
      s[37] ^= l;
      s[46] ^= h;
      s[47] ^= l;
      h = c6 ^ (c0 << 1 | c1 >>> 31);
      l = c7 ^ (c1 << 1 | c0 >>> 31);
      s[8] ^= h;
      s[9] ^= l;
      s[18] ^= h;
      s[19] ^= l;
      s[28] ^= h;
      s[29] ^= l;
      s[38] ^= h;
      s[39] ^= l;
      s[48] ^= h;
      s[49] ^= l;
      b0 = s[0];
      b1 = s[1];
      b32 = s[11] << 4 | s[10] >>> 28;
      b33 = s[10] << 4 | s[11] >>> 28;
      b14 = s[20] << 3 | s[21] >>> 29;
      b15 = s[21] << 3 | s[20] >>> 29;
      b46 = s[31] << 9 | s[30] >>> 23;
      b47 = s[30] << 9 | s[31] >>> 23;
      b28 = s[40] << 18 | s[41] >>> 14;
      b29 = s[41] << 18 | s[40] >>> 14;
      b20 = s[2] << 1 | s[3] >>> 31;
      b21 = s[3] << 1 | s[2] >>> 31;
      b2 = s[13] << 12 | s[12] >>> 20;
      b3 = s[12] << 12 | s[13] >>> 20;
      b34 = s[22] << 10 | s[23] >>> 22;
      b35 = s[23] << 10 | s[22] >>> 22;
      b16 = s[33] << 13 | s[32] >>> 19;
      b17 = s[32] << 13 | s[33] >>> 19;
      b48 = s[42] << 2 | s[43] >>> 30;
      b49 = s[43] << 2 | s[42] >>> 30;
      b40 = s[5] << 30 | s[4] >>> 2;
      b41 = s[4] << 30 | s[5] >>> 2;
      b22 = s[14] << 6 | s[15] >>> 26;
      b23 = s[15] << 6 | s[14] >>> 26;
      b4 = s[25] << 11 | s[24] >>> 21;
      b5 = s[24] << 11 | s[25] >>> 21;
      b36 = s[34] << 15 | s[35] >>> 17;
      b37 = s[35] << 15 | s[34] >>> 17;
      b18 = s[45] << 29 | s[44] >>> 3;
      b19 = s[44] << 29 | s[45] >>> 3;
      b10 = s[6] << 28 | s[7] >>> 4;
      b11 = s[7] << 28 | s[6] >>> 4;
      b42 = s[17] << 23 | s[16] >>> 9;
      b43 = s[16] << 23 | s[17] >>> 9;
      b24 = s[26] << 25 | s[27] >>> 7;
      b25 = s[27] << 25 | s[26] >>> 7;
      b6 = s[36] << 21 | s[37] >>> 11;
      b7 = s[37] << 21 | s[36] >>> 11;
      b38 = s[47] << 24 | s[46] >>> 8;
      b39 = s[46] << 24 | s[47] >>> 8;
      b30 = s[8] << 27 | s[9] >>> 5;
      b31 = s[9] << 27 | s[8] >>> 5;
      b12 = s[18] << 20 | s[19] >>> 12;
      b13 = s[19] << 20 | s[18] >>> 12;
      b44 = s[29] << 7 | s[28] >>> 25;
      b45 = s[28] << 7 | s[29] >>> 25;
      b26 = s[38] << 8 | s[39] >>> 24;
      b27 = s[39] << 8 | s[38] >>> 24;
      b8 = s[48] << 14 | s[49] >>> 18;
      b9 = s[49] << 14 | s[48] >>> 18;
      s[0] = b0 ^ ~b2 & b4;
      s[1] = b1 ^ ~b3 & b5;
      s[10] = b10 ^ ~b12 & b14;
      s[11] = b11 ^ ~b13 & b15;
      s[20] = b20 ^ ~b22 & b24;
      s[21] = b21 ^ ~b23 & b25;
      s[30] = b30 ^ ~b32 & b34;
      s[31] = b31 ^ ~b33 & b35;
      s[40] = b40 ^ ~b42 & b44;
      s[41] = b41 ^ ~b43 & b45;
      s[2] = b2 ^ ~b4 & b6;
      s[3] = b3 ^ ~b5 & b7;
      s[12] = b12 ^ ~b14 & b16;
      s[13] = b13 ^ ~b15 & b17;
      s[22] = b22 ^ ~b24 & b26;
      s[23] = b23 ^ ~b25 & b27;
      s[32] = b32 ^ ~b34 & b36;
      s[33] = b33 ^ ~b35 & b37;
      s[42] = b42 ^ ~b44 & b46;
      s[43] = b43 ^ ~b45 & b47;
      s[4] = b4 ^ ~b6 & b8;
      s[5] = b5 ^ ~b7 & b9;
      s[14] = b14 ^ ~b16 & b18;
      s[15] = b15 ^ ~b17 & b19;
      s[24] = b24 ^ ~b26 & b28;
      s[25] = b25 ^ ~b27 & b29;
      s[34] = b34 ^ ~b36 & b38;
      s[35] = b35 ^ ~b37 & b39;
      s[44] = b44 ^ ~b46 & b48;
      s[45] = b45 ^ ~b47 & b49;
      s[6] = b6 ^ ~b8 & b0;
      s[7] = b7 ^ ~b9 & b1;
      s[16] = b16 ^ ~b18 & b10;
      s[17] = b17 ^ ~b19 & b11;
      s[26] = b26 ^ ~b28 & b20;
      s[27] = b27 ^ ~b29 & b21;
      s[36] = b36 ^ ~b38 & b30;
      s[37] = b37 ^ ~b39 & b31;
      s[46] = b46 ^ ~b48 & b40;
      s[47] = b47 ^ ~b49 & b41;
      s[8] = b8 ^ ~b0 & b2;
      s[9] = b9 ^ ~b1 & b3;
      s[18] = b18 ^ ~b10 & b12;
      s[19] = b19 ^ ~b11 & b13;
      s[28] = b28 ^ ~b20 & b22;
      s[29] = b29 ^ ~b21 & b23;
      s[38] = b38 ^ ~b30 & b32;
      s[39] = b39 ^ ~b31 & b33;
      s[48] = b48 ^ ~b40 & b42;
      s[49] = b49 ^ ~b41 & b43;
      s[0] ^= RC[n];
      s[1] ^= RC[n + 1];
    }
  };

  if (COMMON_JS) {
    module.exports = methods;
  } else {
    for (var i = 0; i < methodNames.length; ++i) {
      root[methodNames[i]] = methods[methodNames[i]];
    }
  }
})();

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":6}],49:[function(require,module,exports){
(function (global){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

//     Underscore.js 1.9.1
//     http://underscorejs.org
//     (c) 2009-2018 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
(function () {
  // Baseline setup
  // --------------
  // Establish the root object, `window` (`self`) in the browser, `global`
  // on the server, or `this` in some virtual machines. We use `self`
  // instead of `window` for `WebWorker` support.
  var root = (typeof self === "undefined" ? "undefined" : _typeof(self)) == 'object' && self.self === self && self || (typeof global === "undefined" ? "undefined" : _typeof(global)) == 'object' && global.global === global && global || this || {}; // Save the previous value of the `_` variable.

  var previousUnderscore = root._; // Save bytes in the minified (but not gzipped) version:

  var ArrayProto = Array.prototype,
      ObjProto = Object.prototype;
  var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null; // Create quick reference variables for speed access to core prototypes.

  var push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty; // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.

  var nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeCreate = Object.create; // Naked function reference for surrogate-prototype-swapping.

  var Ctor = function Ctor() {}; // Create a safe reference to the Underscore object for use below.


  var _ = function _(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  }; // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for their old module API. If we're in
  // the browser, add `_` as a global object.
  // (`nodeType` is checked to ensure that `module`
  // and `exports` are not HTML elements.)


  if (typeof exports != 'undefined' && !exports.nodeType) {
    if (typeof module != 'undefined' && !module.nodeType && module.exports) {
      exports = module.exports = _;
    }

    exports._ = _;
  } else {
    root._ = _;
  } // Current version.


  _.VERSION = '1.9.1'; // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.

  var optimizeCb = function optimizeCb(func, context, argCount) {
    if (context === void 0) return func;

    switch (argCount == null ? 3 : argCount) {
      case 1:
        return function (value) {
          return func.call(context, value);
        };
      // The 2-argument case is omitted because we’re not using it.

      case 3:
        return function (value, index, collection) {
          return func.call(context, value, index, collection);
        };

      case 4:
        return function (accumulator, value, index, collection) {
          return func.call(context, accumulator, value, index, collection);
        };
    }

    return function () {
      return func.apply(context, arguments);
    };
  };

  var builtinIteratee; // An internal function to generate callbacks that can be applied to each
  // element in a collection, returning the desired result — either `identity`,
  // an arbitrary callback, a property matcher, or a property accessor.

  var cb = function cb(value, context, argCount) {
    if (_.iteratee !== builtinIteratee) return _.iteratee(value, context);
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value) && !_.isArray(value)) return _.matcher(value);
    return _.property(value);
  }; // External wrapper for our callback generator. Users may customize
  // `_.iteratee` if they want additional predicate/iteratee shorthand styles.
  // This abstraction hides the internal-only argCount argument.


  _.iteratee = builtinIteratee = function builtinIteratee(value, context) {
    return cb(value, context, Infinity);
  }; // Some functions take a variable number of arguments, or a few expected
  // arguments at the beginning and then a variable number of values to operate
  // on. This helper accumulates all remaining arguments past the function’s
  // argument length (or an explicit `startIndex`), into an array that becomes
  // the last argument. Similar to ES6’s "rest parameter".


  var restArguments = function restArguments(func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex;
    return function () {
      var length = Math.max(arguments.length - startIndex, 0),
          rest = Array(length),
          index = 0;

      for (; index < length; index++) {
        rest[index] = arguments[index + startIndex];
      }

      switch (startIndex) {
        case 0:
          return func.call(this, rest);

        case 1:
          return func.call(this, arguments[0], rest);

        case 2:
          return func.call(this, arguments[0], arguments[1], rest);
      }

      var args = Array(startIndex + 1);

      for (index = 0; index < startIndex; index++) {
        args[index] = arguments[index];
      }

      args[startIndex] = rest;
      return func.apply(this, args);
    };
  }; // An internal function for creating a new object that inherits from another.


  var baseCreate = function baseCreate(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor();
    Ctor.prototype = null;
    return result;
  };

  var shallowProperty = function shallowProperty(key) {
    return function (obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  var has = function has(obj, path) {
    return obj != null && hasOwnProperty.call(obj, path);
  };

  var deepGet = function deepGet(obj, path) {
    var length = path.length;

    for (var i = 0; i < length; i++) {
      if (obj == null) return void 0;
      obj = obj[path[i]];
    }

    return length ? obj : void 0;
  }; // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object.
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094


  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = shallowProperty('length');

  var isArrayLike = function isArrayLike(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  }; // Collection Functions
  // --------------------
  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.


  _.each = _.forEach = function (obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;

    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);

      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }

    return obj;
  }; // Return the results of applying the iteratee to each element.


  _.map = _.collect = function (obj, iteratee, context) {
    iteratee = cb(iteratee, context);

    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);

    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }

    return results;
  }; // Create a reducing function iterating left or right.


  var createReduce = function createReduce(dir) {
    // Wrap code that reassigns argument variables in a separate function than
    // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
    var reducer = function reducer(obj, iteratee, memo, initial) {
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;

      if (!initial) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }

      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }

      return memo;
    };

    return function (obj, iteratee, memo, context) {
      var initial = arguments.length >= 3;
      return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
    };
  }; // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.


  _.reduce = _.foldl = _.inject = createReduce(1); // The right-associative version of reduce, also known as `foldr`.

  _.reduceRight = _.foldr = createReduce(-1); // Return the first value which passes a truth test. Aliased as `detect`.

  _.find = _.detect = function (obj, predicate, context) {
    var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey;
    var key = keyFinder(obj, predicate, context);
    if (key !== void 0 && key !== -1) return obj[key];
  }; // Return all the elements that pass a truth test.
  // Aliased as `select`.


  _.filter = _.select = function (obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);

    _.each(obj, function (value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });

    return results;
  }; // Return all the elements for which a truth test fails.


  _.reject = function (obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  }; // Determine whether all of the elements match a truth test.
  // Aliased as `all`.


  _.every = _.all = function (obj, predicate, context) {
    predicate = cb(predicate, context);

    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;

    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }

    return true;
  }; // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.


  _.some = _.any = function (obj, predicate, context) {
    predicate = cb(predicate, context);

    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;

    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }

    return false;
  }; // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.


  _.contains = _.includes = _.include = function (obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  }; // Invoke a method (with arguments) on every item in a collection.


  _.invoke = restArguments(function (obj, path, args) {
    var contextPath, func;

    if (_.isFunction(path)) {
      func = path;
    } else if (_.isArray(path)) {
      contextPath = path.slice(0, -1);
      path = path[path.length - 1];
    }

    return _.map(obj, function (context) {
      var method = func;

      if (!method) {
        if (contextPath && contextPath.length) {
          context = deepGet(context, contextPath);
        }

        if (context == null) return void 0;
        method = context[path];
      }

      return method == null ? method : method.apply(context, args);
    });
  }); // Convenience version of a common use case of `map`: fetching a property.

  _.pluck = function (obj, key) {
    return _.map(obj, _.property(key));
  }; // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.


  _.where = function (obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  }; // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.


  _.findWhere = function (obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  }; // Return the maximum element (or element-based computation).


  _.max = function (obj, iteratee, context) {
    var result = -Infinity,
        lastComputed = -Infinity,
        value,
        computed;

    if (iteratee == null || typeof iteratee == 'number' && _typeof(obj[0]) != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);

      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];

        if (value != null && value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);

      _.each(obj, function (v, index, list) {
        computed = iteratee(v, index, list);

        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }

    return result;
  }; // Return the minimum element (or element-based computation).


  _.min = function (obj, iteratee, context) {
    var result = Infinity,
        lastComputed = Infinity,
        value,
        computed;

    if (iteratee == null || typeof iteratee == 'number' && _typeof(obj[0]) != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);

      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];

        if (value != null && value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);

      _.each(obj, function (v, index, list) {
        computed = iteratee(v, index, list);

        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }

    return result;
  }; // Shuffle a collection.


  _.shuffle = function (obj) {
    return _.sample(obj, Infinity);
  }; // Sample **n** random values from a collection using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.


  _.sample = function (obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }

    var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj);
    var length = getLength(sample);
    n = Math.max(Math.min(n, length), 0);
    var last = length - 1;

    for (var index = 0; index < n; index++) {
      var rand = _.random(index, last);

      var temp = sample[index];
      sample[index] = sample[rand];
      sample[rand] = temp;
    }

    return sample.slice(0, n);
  }; // Sort the object's values by a criterion produced by an iteratee.


  _.sortBy = function (obj, iteratee, context) {
    var index = 0;
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function (value, key, list) {
      return {
        value: value,
        index: index++,
        criteria: iteratee(value, key, list)
      };
    }).sort(function (left, right) {
      var a = left.criteria;
      var b = right.criteria;

      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }

      return left.index - right.index;
    }), 'value');
  }; // An internal function used for aggregate "group by" operations.


  var group = function group(behavior, partition) {
    return function (obj, iteratee, context) {
      var result = partition ? [[], []] : {};
      iteratee = cb(iteratee, context);

      _.each(obj, function (value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });

      return result;
    };
  }; // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.


  _.groupBy = group(function (result, value, key) {
    if (has(result, key)) result[key].push(value);else result[key] = [value];
  }); // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.

  _.indexBy = group(function (result, value, key) {
    result[key] = value;
  }); // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.

  _.countBy = group(function (result, value, key) {
    if (has(result, key)) result[key]++;else result[key] = 1;
  });
  var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g; // Safely create a real, live array from anything iterable.

  _.toArray = function (obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);

    if (_.isString(obj)) {
      // Keep surrogate pair characters together
      return obj.match(reStrSymbol);
    }

    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  }; // Return the number of elements in an object.


  _.size = function (obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  }; // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.


  _.partition = group(function (result, value, pass) {
    result[pass ? 0 : 1].push(value);
  }, true); // Array Functions
  // ---------------
  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.

  _.first = _.head = _.take = function (array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  }; // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.


  _.initial = function (array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  }; // Get the last element of an array. Passing **n** will return the last N
  // values in the array.


  _.last = function (array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  }; // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.


  _.rest = _.tail = _.drop = function (array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  }; // Trim out all falsy values from an array.


  _.compact = function (array) {
    return _.filter(array, Boolean);
  }; // Internal implementation of a recursive `flatten` function.


  var flatten = function flatten(input, shallow, strict, output) {
    output = output || [];
    var idx = output.length;

    for (var i = 0, length = getLength(input); i < length; i++) {
      var value = input[i];

      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        // Flatten current level of array or arguments object.
        if (shallow) {
          var j = 0,
              len = value.length;

          while (j < len) {
            output[idx++] = value[j++];
          }
        } else {
          flatten(value, shallow, strict, output);
          idx = output.length;
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }

    return output;
  }; // Flatten out an array, either recursively (by default), or just one level.


  _.flatten = function (array, shallow) {
    return flatten(array, shallow, false);
  }; // Return a version of the array that does not contain the specified value(s).


  _.without = restArguments(function (array, otherArrays) {
    return _.difference(array, otherArrays);
  }); // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // The faster algorithm will not work with an iteratee if the iteratee
  // is not a one-to-one function, so providing an iteratee will disable
  // the faster algorithm.
  // Aliased as `unique`.

  _.uniq = _.unique = function (array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }

    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];

    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;

      if (isSorted && !iteratee) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }

    return result;
  }; // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.


  _.union = restArguments(function (arrays) {
    return _.uniq(flatten(arrays, true, true));
  }); // Produce an array that contains every item shared between all the
  // passed-in arrays.

  _.intersection = function (array) {
    var result = [];
    var argsLength = arguments.length;

    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      var j;

      for (j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }

      if (j === argsLength) result.push(item);
    }

    return result;
  }; // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.


  _.difference = restArguments(function (array, rest) {
    rest = flatten(rest, true, true);
    return _.filter(array, function (value) {
      return !_.contains(rest, value);
    });
  }); // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices.

  _.unzip = function (array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }

    return result;
  }; // Zip together multiple lists into a single array -- elements that share
  // an index go together.


  _.zip = restArguments(_.unzip); // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values. Passing by pairs is the reverse of _.pairs.

  _.object = function (list, values) {
    var result = {};

    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }

    return result;
  }; // Generator function to create the findIndex and findLastIndex functions.


  var createPredicateIndexFinder = function createPredicateIndexFinder(dir) {
    return function (array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;

      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }

      return -1;
    };
  }; // Returns the first index on an array-like that passes a predicate test.


  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1); // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.

  _.sortedIndex = function (array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0,
        high = getLength(array);

    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1;else high = mid;
    }

    return low;
  }; // Generator function to create the indexOf and lastIndexOf functions.


  var createIndexFinder = function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function (array, item, idx) {
      var i = 0,
          length = getLength(array);

      if (typeof idx == 'number') {
        if (dir > 0) {
          i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }

      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }

      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }

      return -1;
    };
  }; // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.


  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex); // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).

  _.range = function (start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }

    if (!step) {
      step = stop < start ? -1 : 1;
    }

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  }; // Chunk a single array into multiple arrays, each containing `count` or fewer
  // items.


  _.chunk = function (array, count) {
    if (count == null || count < 1) return [];
    var result = [];
    var i = 0,
        length = array.length;

    while (i < length) {
      result.push(slice.call(array, i, i += count));
    }

    return result;
  }; // Function (ahem) Functions
  // ------------------
  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments.


  var executeBound = function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  }; // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.


  _.bind = restArguments(function (func, context, args) {
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var bound = restArguments(function (callArgs) {
      return executeBound(func, bound, context, this, args.concat(callArgs));
    });
    return bound;
  }); // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder by default, allowing any combination of arguments to be
  // pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.

  _.partial = restArguments(function (func, boundArgs) {
    var placeholder = _.partial.placeholder;

    var bound = function bound() {
      var position = 0,
          length = boundArgs.length;
      var args = Array(length);

      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
      }

      while (position < arguments.length) {
        args.push(arguments[position++]);
      }

      return executeBound(func, bound, this, this, args);
    };

    return bound;
  });
  _.partial.placeholder = _; // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.

  _.bindAll = restArguments(function (obj, keys) {
    keys = flatten(keys, false, false);
    var index = keys.length;
    if (index < 1) throw new Error('bindAll must be passed function names');

    while (index--) {
      var key = keys[index];
      obj[key] = _.bind(obj[key], obj);
    }
  }); // Memoize an expensive function by storing its results.

  _.memoize = function (func, hasher) {
    var memoize = function memoize(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };

    memoize.cache = {};
    return memoize;
  }; // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.


  _.delay = restArguments(function (func, wait, args) {
    return setTimeout(function () {
      return func.apply(null, args);
    }, wait);
  }); // Defers a function, scheduling it to run after the current call stack has
  // cleared.

  _.defer = _.partial(_.delay, _, 1); // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.

  _.throttle = function (func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};

    var later = function later() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    var throttled = function throttled() {
      var now = _.now();

      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;

      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }

        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }

      return result;
    };

    throttled.cancel = function () {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };

    return throttled;
  }; // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.


  _.debounce = function (func, wait, immediate) {
    var timeout, result;

    var later = function later(context, args) {
      timeout = null;
      if (args) result = func.apply(context, args);
    };

    var debounced = restArguments(function (args) {
      if (timeout) clearTimeout(timeout);

      if (immediate) {
        var callNow = !timeout;
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(this, args);
      } else {
        timeout = _.delay(later, wait, this, args);
      }

      return result;
    });

    debounced.cancel = function () {
      clearTimeout(timeout);
      timeout = null;
    };

    return debounced;
  }; // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.


  _.wrap = function (func, wrapper) {
    return _.partial(wrapper, func);
  }; // Returns a negated version of the passed-in predicate.


  _.negate = function (predicate) {
    return function () {
      return !predicate.apply(this, arguments);
    };
  }; // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.


  _.compose = function () {
    var args = arguments;
    var start = args.length - 1;
    return function () {
      var i = start;
      var result = args[start].apply(this, arguments);

      while (i--) {
        result = args[i].call(this, result);
      }

      return result;
    };
  }; // Returns a function that will only be executed on and after the Nth call.


  _.after = function (times, func) {
    return function () {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  }; // Returns a function that will only be executed up to (but not including) the Nth call.


  _.before = function (times, func) {
    var memo;
    return function () {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }

      if (times <= 1) func = null;
      return memo;
    };
  }; // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.


  _.once = _.partial(_.before, 2);
  _.restArguments = restArguments; // Object Functions
  // ----------------
  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.

  var hasEnumBug = !{
    toString: null
  }.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  var collectNonEnumProps = function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto; // Constructor is a special case.

    var prop = 'constructor';
    if (has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];

      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }; // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`.


  _.keys = function (obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];

    for (var key in obj) {
      if (has(obj, key)) keys.push(key);
    } // Ahem, IE < 9.


    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  }; // Retrieve all the property names of an object.


  _.allKeys = function (obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];

    for (var key in obj) {
      keys.push(key);
    } // Ahem, IE < 9.


    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  }; // Retrieve the values of an object's properties.


  _.values = function (obj) {
    var keys = _.keys(obj);

    var length = keys.length;
    var values = Array(length);

    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }

    return values;
  }; // Returns the results of applying the iteratee to each element of the object.
  // In contrast to _.map it returns an object.


  _.mapObject = function (obj, iteratee, context) {
    iteratee = cb(iteratee, context);

    var keys = _.keys(obj),
        length = keys.length,
        results = {};

    for (var index = 0; index < length; index++) {
      var currentKey = keys[index];
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
    }

    return results;
  }; // Convert an object into a list of `[key, value]` pairs.
  // The opposite of _.object.


  _.pairs = function (obj) {
    var keys = _.keys(obj);

    var length = keys.length;
    var pairs = Array(length);

    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }

    return pairs;
  }; // Invert the keys and values of an object. The values must be serializable.


  _.invert = function (obj) {
    var result = {};

    var keys = _.keys(obj);

    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }

    return result;
  }; // Return a sorted list of the function names available on the object.
  // Aliased as `methods`.


  _.functions = _.methods = function (obj) {
    var names = [];

    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }

    return names.sort();
  }; // An internal function for creating assigner functions.


  var createAssigner = function createAssigner(keysFunc, defaults) {
    return function (obj) {
      var length = arguments.length;
      if (defaults) obj = Object(obj);
      if (length < 2 || obj == null) return obj;

      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;

        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!defaults || obj[key] === void 0) obj[key] = source[key];
        }
      }

      return obj;
    };
  }; // Extend a given object with all the properties in passed-in object(s).


  _.extend = createAssigner(_.allKeys); // Assigns a given object with all the own properties in the passed-in object(s).
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)

  _.extendOwn = _.assign = createAssigner(_.keys); // Returns the first key on an object that passes a predicate test.

  _.findKey = function (obj, predicate, context) {
    predicate = cb(predicate, context);

    var keys = _.keys(obj),
        key;

    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  }; // Internal pick helper function to determine if `obj` has key `key`.


  var keyInObj = function keyInObj(value, key, obj) {
    return key in obj;
  }; // Return a copy of the object only containing the whitelisted properties.


  _.pick = restArguments(function (obj, keys) {
    var result = {},
        iteratee = keys[0];
    if (obj == null) return result;

    if (_.isFunction(iteratee)) {
      if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
      keys = _.allKeys(obj);
    } else {
      iteratee = keyInObj;
      keys = flatten(keys, false, false);
      obj = Object(obj);
    }

    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }

    return result;
  }); // Return a copy of the object without the blacklisted properties.

  _.omit = restArguments(function (obj, keys) {
    var iteratee = keys[0],
        context;

    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
      if (keys.length > 1) context = keys[1];
    } else {
      keys = _.map(flatten(keys, false, false), String);

      iteratee = function iteratee(value, key) {
        return !_.contains(keys, key);
      };
    }

    return _.pick(obj, iteratee, context);
  }); // Fill in a given object with default properties.

  _.defaults = createAssigner(_.allKeys, true); // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.

  _.create = function (prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  }; // Create a (shallow-cloned) duplicate of an object.


  _.clone = function (obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  }; // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.


  _.tap = function (obj, interceptor) {
    interceptor(obj);
    return obj;
  }; // Returns whether an object has a given set of `key:value` pairs.


  _.isMatch = function (object, attrs) {
    var keys = _.keys(attrs),
        length = keys.length;

    if (object == null) return !length;
    var obj = Object(object);

    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }

    return true;
  }; // Internal recursive comparison function for `isEqual`.


  var eq, deepEq;

  eq = function eq(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b; // `null` or `undefined` only equal to itself (strict comparison).

    if (a == null || b == null) return false; // `NaN`s are equivalent, but non-reflexive.

    if (a !== a) return b !== b; // Exhaust primitive checks

    var type = _typeof(a);

    if (type !== 'function' && type !== 'object' && _typeof(b) != 'object') return false;
    return deepEq(a, b, aStack, bStack);
  }; // Internal recursive comparison function for `isEqual`.


  deepEq = function deepEq(a, b, aStack, bStack) {
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped; // Compare `[[Class]]` names.

    var className = toString.call(a);
    if (className !== toString.call(b)) return false;

    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]': // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')

      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;

      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN.
        if (+a !== +a) return +b !== +b; // An `egal` comparison is performed for other numeric values.

        return +a === 0 ? 1 / +a === 1 / b : +a === +b;

      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;

      case '[object Symbol]':
        return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
    }

    var areArrays = className === '[object Array]';

    if (!areArrays) {
      if (_typeof(a) != 'object' || _typeof(b) != 'object') return false; // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.

      var aCtor = a.constructor,
          bCtor = b.constructor;

      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor) && 'constructor' in a && 'constructor' in b) {
        return false;
      }
    } // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.


    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;

    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    } // Add the first object to the stack of traversed objects.


    aStack.push(a);
    bStack.push(b); // Recursively compare objects and arrays.

    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false; // Deep compare the contents, ignoring non-numeric properties.

      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a),
          key;

      length = keys.length; // Ensure that both objects contain the same number of properties before comparing deep equality.

      if (_.keys(b).length !== length) return false;

      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    } // Remove the first object from the stack of traversed objects.


    aStack.pop();
    bStack.pop();
    return true;
  }; // Perform a deep comparison to check if two objects are equal.


  _.isEqual = function (a, b) {
    return eq(a, b);
  }; // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.


  _.isEmpty = function (obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  }; // Is a given value a DOM element?


  _.isElement = function (obj) {
    return !!(obj && obj.nodeType === 1);
  }; // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray


  _.isArray = nativeIsArray || function (obj) {
    return toString.call(obj) === '[object Array]';
  }; // Is a given variable an object?


  _.isObject = function (obj) {
    var type = _typeof(obj);

    return type === 'function' || type === 'object' && !!obj;
  }; // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.


  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'], function (name) {
    _['is' + name] = function (obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  }); // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.


  if (!_.isArguments(arguments)) {
    _.isArguments = function (obj) {
      return has(obj, 'callee');
    };
  } // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).


  var nodelist = root.document && root.document.childNodes;

  if (typeof /./ != 'function' && (typeof Int8Array === "undefined" ? "undefined" : _typeof(Int8Array)) != 'object' && typeof nodelist != 'function') {
    _.isFunction = function (obj) {
      return typeof obj == 'function' || false;
    };
  } // Is a given object a finite number?


  _.isFinite = function (obj) {
    return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj));
  }; // Is the given value `NaN`?


  _.isNaN = function (obj) {
    return _.isNumber(obj) && isNaN(obj);
  }; // Is a given value a boolean?


  _.isBoolean = function (obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  }; // Is a given value equal to null?


  _.isNull = function (obj) {
    return obj === null;
  }; // Is a given variable undefined?


  _.isUndefined = function (obj) {
    return obj === void 0;
  }; // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).


  _.has = function (obj, path) {
    if (!_.isArray(path)) {
      return has(obj, path);
    }

    var length = path.length;

    for (var i = 0; i < length; i++) {
      var key = path[i];

      if (obj == null || !hasOwnProperty.call(obj, key)) {
        return false;
      }

      obj = obj[key];
    }

    return !!length;
  }; // Utility Functions
  // -----------------
  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.


  _.noConflict = function () {
    root._ = previousUnderscore;
    return this;
  }; // Keep the identity function around for default iteratees.


  _.identity = function (value) {
    return value;
  }; // Predicate-generating functions. Often useful outside of Underscore.


  _.constant = function (value) {
    return function () {
      return value;
    };
  };

  _.noop = function () {}; // Creates a function that, when passed an object, will traverse that object’s
  // properties down the given `path`, specified as an array of keys or indexes.


  _.property = function (path) {
    if (!_.isArray(path)) {
      return shallowProperty(path);
    }

    return function (obj) {
      return deepGet(obj, path);
    };
  }; // Generates a function for a given object that returns a given property.


  _.propertyOf = function (obj) {
    if (obj == null) {
      return function () {};
    }

    return function (path) {
      return !_.isArray(path) ? obj[path] : deepGet(obj, path);
    };
  }; // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.


  _.matcher = _.matches = function (attrs) {
    attrs = _.extendOwn({}, attrs);
    return function (obj) {
      return _.isMatch(obj, attrs);
    };
  }; // Run a function **n** times.


  _.times = function (n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);

    for (var i = 0; i < n; i++) {
      accum[i] = iteratee(i);
    }

    return accum;
  }; // Return a random integer between min and max (inclusive).


  _.random = function (min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }

    return min + Math.floor(Math.random() * (max - min + 1));
  }; // A (possibly faster) way to get the current timestamp as an integer.


  _.now = Date.now || function () {
    return new Date().getTime();
  }; // List of HTML entities for escaping.


  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };

  var unescapeMap = _.invert(escapeMap); // Functions for escaping and unescaping strings to/from HTML interpolation.


  var createEscaper = function createEscaper(map) {
    var escaper = function escaper(match) {
      return map[match];
    }; // Regexes for identifying a key that needs to be escaped.


    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function (string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };

  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap); // Traverses the children of `obj` along `path`. If a child is a function, it
  // is invoked with its parent as context. Returns the value of the final
  // child, or `fallback` if any child is undefined.

  _.result = function (obj, path, fallback) {
    if (!_.isArray(path)) path = [path];
    var length = path.length;

    if (!length) {
      return _.isFunction(fallback) ? fallback.call(obj) : fallback;
    }

    for (var i = 0; i < length; i++) {
      var prop = obj == null ? void 0 : obj[path[i]];

      if (prop === void 0) {
        prop = fallback;
        i = length; // Ensure we don't continue iterating.
      }

      obj = _.isFunction(prop) ? prop.call(obj) : prop;
    }

    return obj;
  }; // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.


  var idCounter = 0;

  _.uniqueId = function (prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  }; // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.


  _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  }; // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.

  var noMatch = /(.)^/; // Certain characters need to be escaped so that they can be put into a
  // string literal.

  var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    "\u2028": 'u2028',
    "\u2029": 'u2029'
  };
  var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function escapeChar(match) {
    return '\\' + escapes[match];
  }; // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.


  _.template = function (text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings); // Combine delimiters into one regular expression via alternation.

    var matcher = RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g'); // Compile the template source, escaping string literals appropriately.

    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      } // Adobe VMs need the match returned to produce the correct offset.


      return match;
    });
    source += "';\n"; // If a variable is not specified, place data values in local scope.

    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
    source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + 'return __p;\n';
    var render;

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function template(data) {
      return render.call(this, data, _);
    }; // Provide the compiled source as a convenience for precompilation.


    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';
    return template;
  }; // Add a "chain" function. Start chaining a wrapped Underscore object.


  _.chain = function (obj) {
    var instance = _(obj);

    instance._chain = true;
    return instance;
  }; // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  // Helper function to continue chaining intermediate results.


  var chainResult = function chainResult(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  }; // Add your own custom functions to the Underscore object.


  _.mixin = function (obj) {
    _.each(_.functions(obj), function (name) {
      var func = _[name] = obj[name];

      _.prototype[name] = function () {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return chainResult(this, func.apply(_, args));
      };
    });

    return _;
  }; // Add all of the Underscore functions to the wrapper object.


  _.mixin(_); // Add all mutator Array functions to the wrapper.


  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
    var method = ArrayProto[name];

    _.prototype[name] = function () {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return chainResult(this, obj);
    };
  }); // Add all accessor Array functions to the wrapper.


  _.each(['concat', 'join', 'slice'], function (name) {
    var method = ArrayProto[name];

    _.prototype[name] = function () {
      return chainResult(this, method.apply(this._wrapped, arguments));
    };
  }); // Extracts the result from a wrapped and chained object.


  _.prototype.value = function () {
    return this._wrapped;
  }; // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.


  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function () {
    return String(this._wrapped);
  }; // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.


  if (typeof define == 'function' && define.amd) {
    define('underscore', [], function () {
      return _;
    });
  }
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],50:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"buffer":2,"dup":47}],51:[function(require,module,exports){
"use strict";

// This was ported from https://github.com/emn178/js-sha3, with some minor
// modifications and pruning. It is licensed under MIT:
//
// Copyright 2015-2016 Chen, Yi-Cyuan
//  
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
var HEX_CHARS = '0123456789abcdef'.split('');
var KECCAK_PADDING = [1, 256, 65536, 16777216];
var SHIFT = [0, 8, 16, 24];
var RC = [1, 0, 32898, 0, 32906, 2147483648, 2147516416, 2147483648, 32907, 0, 2147483649, 0, 2147516545, 2147483648, 32777, 2147483648, 138, 0, 136, 0, 2147516425, 0, 2147483658, 0, 2147516555, 0, 139, 2147483648, 32905, 2147483648, 32771, 2147483648, 32770, 2147483648, 128, 2147483648, 32778, 0, 2147483658, 2147483648, 2147516545, 2147483648, 32896, 2147483648, 2147483649, 0, 2147516424, 2147483648];

var Keccak = function Keccak(bits) {
  return {
    blocks: [],
    reset: true,
    block: 0,
    start: 0,
    blockCount: 1600 - (bits << 1) >> 5,
    outputBlocks: bits >> 5,
    s: function (s) {
      return [].concat(s, s, s, s, s);
    }([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  };
};

var update = function update(state, message) {
  var length = message.length,
      blocks = state.blocks,
      byteCount = state.blockCount << 2,
      blockCount = state.blockCount,
      outputBlocks = state.outputBlocks,
      s = state.s,
      index = 0,
      i,
      code; // update

  while (index < length) {
    if (state.reset) {
      state.reset = false;
      blocks[0] = state.block;

      for (i = 1; i < blockCount + 1; ++i) {
        blocks[i] = 0;
      }
    }

    if (typeof message !== "string") {
      for (i = state.start; index < length && i < byteCount; ++index) {
        blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
      }
    } else {
      for (i = state.start; index < length && i < byteCount; ++index) {
        code = message.charCodeAt(index);

        if (code < 0x80) {
          blocks[i >> 2] |= code << SHIFT[i++ & 3];
        } else if (code < 0x800) {
          blocks[i >> 2] |= (0xc0 | code >> 6) << SHIFT[i++ & 3];
          blocks[i >> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
        } else if (code < 0xd800 || code >= 0xe000) {
          blocks[i >> 2] |= (0xe0 | code >> 12) << SHIFT[i++ & 3];
          blocks[i >> 2] |= (0x80 | code >> 6 & 0x3f) << SHIFT[i++ & 3];
          blocks[i >> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
        } else {
          code = 0x10000 + ((code & 0x3ff) << 10 | message.charCodeAt(++index) & 0x3ff);
          blocks[i >> 2] |= (0xf0 | code >> 18) << SHIFT[i++ & 3];
          blocks[i >> 2] |= (0x80 | code >> 12 & 0x3f) << SHIFT[i++ & 3];
          blocks[i >> 2] |= (0x80 | code >> 6 & 0x3f) << SHIFT[i++ & 3];
          blocks[i >> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
        }
      }
    }

    state.lastByteIndex = i;

    if (i >= byteCount) {
      state.start = i - byteCount;
      state.block = blocks[blockCount];

      for (i = 0; i < blockCount; ++i) {
        s[i] ^= blocks[i];
      }

      f(s);
      state.reset = true;
    } else {
      state.start = i;
    }
  } // finalize


  i = state.lastByteIndex;
  blocks[i >> 2] |= KECCAK_PADDING[i & 3];

  if (state.lastByteIndex === byteCount) {
    blocks[0] = blocks[blockCount];

    for (i = 1; i < blockCount + 1; ++i) {
      blocks[i] = 0;
    }
  }

  blocks[blockCount - 1] |= 0x80000000;

  for (i = 0; i < blockCount; ++i) {
    s[i] ^= blocks[i];
  }

  f(s); // toString

  var hex = '',
      i = 0,
      j = 0,
      block;

  while (j < outputBlocks) {
    for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
      block = s[i];
      hex += HEX_CHARS[block >> 4 & 0x0F] + HEX_CHARS[block & 0x0F] + HEX_CHARS[block >> 12 & 0x0F] + HEX_CHARS[block >> 8 & 0x0F] + HEX_CHARS[block >> 20 & 0x0F] + HEX_CHARS[block >> 16 & 0x0F] + HEX_CHARS[block >> 28 & 0x0F] + HEX_CHARS[block >> 24 & 0x0F];
    }

    if (j % blockCount === 0) {
      f(s);
      i = 0;
    }
  }

  return "0x" + hex;
};

var f = function f(s) {
  var h, l, n, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17, b18, b19, b20, b21, b22, b23, b24, b25, b26, b27, b28, b29, b30, b31, b32, b33, b34, b35, b36, b37, b38, b39, b40, b41, b42, b43, b44, b45, b46, b47, b48, b49;

  for (n = 0; n < 48; n += 2) {
    c0 = s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];
    c1 = s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];
    c2 = s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];
    c3 = s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];
    c4 = s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];
    c5 = s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];
    c6 = s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];
    c7 = s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];
    c8 = s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];
    c9 = s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];
    h = c8 ^ (c2 << 1 | c3 >>> 31);
    l = c9 ^ (c3 << 1 | c2 >>> 31);
    s[0] ^= h;
    s[1] ^= l;
    s[10] ^= h;
    s[11] ^= l;
    s[20] ^= h;
    s[21] ^= l;
    s[30] ^= h;
    s[31] ^= l;
    s[40] ^= h;
    s[41] ^= l;
    h = c0 ^ (c4 << 1 | c5 >>> 31);
    l = c1 ^ (c5 << 1 | c4 >>> 31);
    s[2] ^= h;
    s[3] ^= l;
    s[12] ^= h;
    s[13] ^= l;
    s[22] ^= h;
    s[23] ^= l;
    s[32] ^= h;
    s[33] ^= l;
    s[42] ^= h;
    s[43] ^= l;
    h = c2 ^ (c6 << 1 | c7 >>> 31);
    l = c3 ^ (c7 << 1 | c6 >>> 31);
    s[4] ^= h;
    s[5] ^= l;
    s[14] ^= h;
    s[15] ^= l;
    s[24] ^= h;
    s[25] ^= l;
    s[34] ^= h;
    s[35] ^= l;
    s[44] ^= h;
    s[45] ^= l;
    h = c4 ^ (c8 << 1 | c9 >>> 31);
    l = c5 ^ (c9 << 1 | c8 >>> 31);
    s[6] ^= h;
    s[7] ^= l;
    s[16] ^= h;
    s[17] ^= l;
    s[26] ^= h;
    s[27] ^= l;
    s[36] ^= h;
    s[37] ^= l;
    s[46] ^= h;
    s[47] ^= l;
    h = c6 ^ (c0 << 1 | c1 >>> 31);
    l = c7 ^ (c1 << 1 | c0 >>> 31);
    s[8] ^= h;
    s[9] ^= l;
    s[18] ^= h;
    s[19] ^= l;
    s[28] ^= h;
    s[29] ^= l;
    s[38] ^= h;
    s[39] ^= l;
    s[48] ^= h;
    s[49] ^= l;
    b0 = s[0];
    b1 = s[1];
    b32 = s[11] << 4 | s[10] >>> 28;
    b33 = s[10] << 4 | s[11] >>> 28;
    b14 = s[20] << 3 | s[21] >>> 29;
    b15 = s[21] << 3 | s[20] >>> 29;
    b46 = s[31] << 9 | s[30] >>> 23;
    b47 = s[30] << 9 | s[31] >>> 23;
    b28 = s[40] << 18 | s[41] >>> 14;
    b29 = s[41] << 18 | s[40] >>> 14;
    b20 = s[2] << 1 | s[3] >>> 31;
    b21 = s[3] << 1 | s[2] >>> 31;
    b2 = s[13] << 12 | s[12] >>> 20;
    b3 = s[12] << 12 | s[13] >>> 20;
    b34 = s[22] << 10 | s[23] >>> 22;
    b35 = s[23] << 10 | s[22] >>> 22;
    b16 = s[33] << 13 | s[32] >>> 19;
    b17 = s[32] << 13 | s[33] >>> 19;
    b48 = s[42] << 2 | s[43] >>> 30;
    b49 = s[43] << 2 | s[42] >>> 30;
    b40 = s[5] << 30 | s[4] >>> 2;
    b41 = s[4] << 30 | s[5] >>> 2;
    b22 = s[14] << 6 | s[15] >>> 26;
    b23 = s[15] << 6 | s[14] >>> 26;
    b4 = s[25] << 11 | s[24] >>> 21;
    b5 = s[24] << 11 | s[25] >>> 21;
    b36 = s[34] << 15 | s[35] >>> 17;
    b37 = s[35] << 15 | s[34] >>> 17;
    b18 = s[45] << 29 | s[44] >>> 3;
    b19 = s[44] << 29 | s[45] >>> 3;
    b10 = s[6] << 28 | s[7] >>> 4;
    b11 = s[7] << 28 | s[6] >>> 4;
    b42 = s[17] << 23 | s[16] >>> 9;
    b43 = s[16] << 23 | s[17] >>> 9;
    b24 = s[26] << 25 | s[27] >>> 7;
    b25 = s[27] << 25 | s[26] >>> 7;
    b6 = s[36] << 21 | s[37] >>> 11;
    b7 = s[37] << 21 | s[36] >>> 11;
    b38 = s[47] << 24 | s[46] >>> 8;
    b39 = s[46] << 24 | s[47] >>> 8;
    b30 = s[8] << 27 | s[9] >>> 5;
    b31 = s[9] << 27 | s[8] >>> 5;
    b12 = s[18] << 20 | s[19] >>> 12;
    b13 = s[19] << 20 | s[18] >>> 12;
    b44 = s[29] << 7 | s[28] >>> 25;
    b45 = s[28] << 7 | s[29] >>> 25;
    b26 = s[38] << 8 | s[39] >>> 24;
    b27 = s[39] << 8 | s[38] >>> 24;
    b8 = s[48] << 14 | s[49] >>> 18;
    b9 = s[49] << 14 | s[48] >>> 18;
    s[0] = b0 ^ ~b2 & b4;
    s[1] = b1 ^ ~b3 & b5;
    s[10] = b10 ^ ~b12 & b14;
    s[11] = b11 ^ ~b13 & b15;
    s[20] = b20 ^ ~b22 & b24;
    s[21] = b21 ^ ~b23 & b25;
    s[30] = b30 ^ ~b32 & b34;
    s[31] = b31 ^ ~b33 & b35;
    s[40] = b40 ^ ~b42 & b44;
    s[41] = b41 ^ ~b43 & b45;
    s[2] = b2 ^ ~b4 & b6;
    s[3] = b3 ^ ~b5 & b7;
    s[12] = b12 ^ ~b14 & b16;
    s[13] = b13 ^ ~b15 & b17;
    s[22] = b22 ^ ~b24 & b26;
    s[23] = b23 ^ ~b25 & b27;
    s[32] = b32 ^ ~b34 & b36;
    s[33] = b33 ^ ~b35 & b37;
    s[42] = b42 ^ ~b44 & b46;
    s[43] = b43 ^ ~b45 & b47;
    s[4] = b4 ^ ~b6 & b8;
    s[5] = b5 ^ ~b7 & b9;
    s[14] = b14 ^ ~b16 & b18;
    s[15] = b15 ^ ~b17 & b19;
    s[24] = b24 ^ ~b26 & b28;
    s[25] = b25 ^ ~b27 & b29;
    s[34] = b34 ^ ~b36 & b38;
    s[35] = b35 ^ ~b37 & b39;
    s[44] = b44 ^ ~b46 & b48;
    s[45] = b45 ^ ~b47 & b49;
    s[6] = b6 ^ ~b8 & b0;
    s[7] = b7 ^ ~b9 & b1;
    s[16] = b16 ^ ~b18 & b10;
    s[17] = b17 ^ ~b19 & b11;
    s[26] = b26 ^ ~b28 & b20;
    s[27] = b27 ^ ~b29 & b21;
    s[36] = b36 ^ ~b38 & b30;
    s[37] = b37 ^ ~b39 & b31;
    s[46] = b46 ^ ~b48 & b40;
    s[47] = b47 ^ ~b49 & b41;
    s[8] = b8 ^ ~b0 & b2;
    s[9] = b9 ^ ~b1 & b3;
    s[18] = b18 ^ ~b10 & b12;
    s[19] = b19 ^ ~b11 & b13;
    s[28] = b28 ^ ~b20 & b22;
    s[29] = b29 ^ ~b21 & b23;
    s[38] = b38 ^ ~b30 & b32;
    s[39] = b39 ^ ~b31 & b33;
    s[48] = b48 ^ ~b40 & b42;
    s[49] = b49 ^ ~b41 & b43;
    s[0] ^= RC[n];
    s[1] ^= RC[n + 1];
  }
};

var keccak = function keccak(bits) {
  return function (str) {
    var msg;

    if (str.slice(0, 2) === "0x") {
      msg = [];

      for (var i = 2, l = str.length; i < l; i += 2) {
        msg.push(parseInt(str.slice(i, i + 2), 16));
      }
    } else {
      msg = str;
    }

    return update(Keccak(bits, bits), msg);
  };
};

module.exports = {
  keccak256: keccak(256),
  keccak512: keccak(512),
  keccak256s: keccak(256),
  keccak512s: keccak(512)
};

},{}],52:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var utils_1 = require("./utils");
/**
 * Returns true if the bloom is a valid bloom
 * @param bloom The bloom
 */


function isBloom(bloom) {
  if (typeof bloom !== 'string') {
    return false;
  }

  if (!/^(0x)?[0-9a-f]{512}$/i.test(bloom)) {
    return false;
  }

  if (/^(0x)?[0-9a-f]{512}$/.test(bloom) || /^(0x)?[0-9A-F]{512}$/.test(bloom)) {
    return true;
  }

  return false;
}

exports.isBloom = isBloom;
/**
 * Returns true if the value is part of the given bloom
 * note: false positives are possible.
 * @param bloom encoded bloom
 * @param value The value
 */

function isInBloom(bloom, value) {
  if (_typeof(value) === 'object' && value.constructor === Uint8Array) {
    value = utils_1.bytesToHex(value);
  }

  var hash = utils_1.keccak256(value).replace('0x', '');

  for (var i = 0; i < 12; i += 4) {
    // calculate bit position in bloom filter that must be active
    var bitpos = (parseInt(hash.substr(i, 2), 16) << 8) + parseInt(hash.substr(i + 2, 2), 16) & 2047; // test if bitpos in bloom is active

    var code = codePointToInt(bloom.charCodeAt(bloom.length - 1 - Math.floor(bitpos / 4)));
    var offset = 1 << bitpos % 4;

    if ((code & offset) !== offset) {
      return false;
    }
  }

  return true;
}

exports.isInBloom = isInBloom;
/**
 * Code points to int
 * @param codePoint The code point
 */

function codePointToInt(codePoint) {
  if (codePoint >= 48 && codePoint <= 57) {
    /* ['0'..'9'] -> [0..9] */
    return codePoint - 48;
  }

  if (codePoint >= 65 && codePoint <= 70) {
    /* ['A'..'F'] -> [10..15] */
    return codePoint - 55;
  }

  if (codePoint >= 97 && codePoint <= 102) {
    /* ['a'..'f'] -> [10..15] */
    return codePoint - 87;
  }

  throw new Error('invalid bloom');
}
/**
 * Returns true if the ethereum users address is part of the given bloom.
 * note: false positives are possible.
 * @param bloom encoded bloom
 * @param address the address to test
 */


function isUserEthereumAddressInBloom(bloom, ethereumAddress) {
  if (!isBloom(bloom)) {
    throw new Error('Invalid bloom given');
  }

  if (!isAddress(ethereumAddress)) {
    throw new Error("Invalid ethereum address given: \"".concat(ethereumAddress, "\""));
  } // you have to pad the ethereum address to 32 bytes
  // else the bloom filter does not work
  // this is only if your matching the USERS
  // ethereum address. Contract address do not need this
  // hence why we have 2 methods
  // (0x is not in the 2nd parameter of padleft so 64 chars is fine)


  var address = utils_1.padLeft(ethereumAddress, 64);
  return isInBloom(bloom, address);
}

exports.isUserEthereumAddressInBloom = isUserEthereumAddressInBloom;
/**
 * Returns true if the contract address is part of the given bloom.
 * note: false positives are possible.
 * @param bloom encoded bloom
 * @param contractAddress the contract address to test
 */

function isContractAddressInBloom(bloom, contractAddress) {
  if (!isBloom(bloom)) {
    throw new Error('Invalid bloom given');
  }

  if (!isAddress(contractAddress)) {
    throw new Error("Invalid contract address given: \"".concat(contractAddress, "\""));
  }

  return isInBloom(bloom, contractAddress);
}

exports.isContractAddressInBloom = isContractAddressInBloom;
/**
 * Returns true if the topic is part of the given bloom.
 * note: false positives are possible.
 * @param bloom encoded bloom
 * @param topic the topic encoded hex
 */

function isTopicInBloom(bloom, topic) {
  if (!isBloom(bloom)) {
    throw new Error('Invalid bloom given');
  }

  if (!isTopic(topic)) {
    throw new Error('Invalid topic');
  }

  return isInBloom(bloom, topic);
}

exports.isTopicInBloom = isTopicInBloom;
/**
 * Checks if its a valid topic
 * @param topic encoded hex topic
 */

function isTopic(topic) {
  if (typeof topic !== 'string') {
    return false;
  }

  if (!/^(0x)?[0-9a-f]{64}$/i.test(topic)) {
    return false;
  } else if (/^(0x)?[0-9a-f]{64}$/.test(topic) || /^(0x)?[0-9A-F]{64}$/.test(topic)) {
    return true;
  }

  return false;
}

exports.isTopic = isTopic;
/**
 * Is valid address
 * @param address The address
 */

function isAddress(address) {
  if (typeof address !== 'string') {
    return false;
  }

  if (address.match(/^(0x)?[0-9a-fA-F]{40}$/)) {
    return true;
  }

  if (address.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {
    return true;
  }

  return false;
}

exports.isAddress = isAddress;

},{"./utils":53}],53:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var sha3 = require("js-sha3");
/**
 * Keccak256 hash
 * @param data The data
 */


function keccak256(data) {
  return '0x' + sha3.keccak_256(toByteArray(data));
}

exports.keccak256 = keccak256;
/**
 * Adding padding to string on the left
 * @param value The value
 * @param chars The chars
 */

exports.padLeft = function (value, chars) {
  var hasPrefix = /^0x/i.test(value) || typeof value === 'number';
  value = value.toString().replace(/^0x/i, '');
  var padding = chars - value.length + 1 >= 0 ? chars - value.length + 1 : 0;
  return (hasPrefix ? '0x' : '') + new Array(padding).join('0') + value;
};
/**
 * Convert bytes to hex
 * @param bytes The bytes
 */


function bytesToHex(bytes) {
  var hex = [];

  for (var i = 0; i < bytes.length; i++) {
    hex.push((bytes[i] >>> 4).toString(16));
    hex.push((bytes[i] & 0xf).toString(16));
  }

  return "0x".concat(hex.join('').replace(/^0+/, ''));
}

exports.bytesToHex = bytesToHex;
/**
 * To byte array
 * @param value The value
 */

function toByteArray(value) {
  if (value == null) {
    throw new Error('cannot convert null value to array');
  }

  if (typeof value === 'string') {
    var match = value.match(/^(0x)?[0-9a-fA-F]*$/);

    if (!match) {
      throw new Error('invalid hexidecimal string');
    }

    if (match[1] !== '0x') {
      throw new Error('hex string must have 0x prefix');
    }

    value = value.substring(2);

    if (value.length % 2) {
      value = '0' + value;
    }

    var result = [];

    for (var i = 0; i < value.length; i += 2) {
      result.push(parseInt(value.substr(i, 2), 16));
    }

    return addSlice(new Uint8Array(result));
  }

  if (isByteArray(value)) {
    return addSlice(new Uint8Array(value));
  }

  throw new Error('invalid arrayify value');
}

exports.toByteArray = toByteArray;
/**
 * Is byte array
 * @param value The value
 */

function isByteArray(value) {
  if (!value || parseInt(String(value.length)) != value.length || typeof value === 'string') {
    return false;
  }

  for (var i = 0; i < value.length; i++) {
    var v = value[i];

    if (v < 0 || v >= 256 || parseInt(String(v)) != v) {
      return false;
    }
  }

  return true;
}
/**
 * Add slice to array
 * @param array The array
 */


function addSlice(array) {
  if (array.slice) {
    return array;
  }

  array.slice = function () {
    var args = Array.prototype.slice.call(arguments);
    return addSlice(new Uint8Array(Array.prototype.slice.apply(array, args)));
  };

  return array;
}

},{"js-sha3":57}],54:[function(require,module,exports){
'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var BN = require('bn.js');

var numberToBN = require('number-to-bn');

var zero = new BN(0);
var negative1 = new BN(-1); // complete ethereum unit map

var unitMap = {
  'noether': '0',
  // eslint-disable-line
  'wei': '1',
  // eslint-disable-line
  'kwei': '1000',
  // eslint-disable-line
  'Kwei': '1000',
  // eslint-disable-line
  'babbage': '1000',
  // eslint-disable-line
  'femtoether': '1000',
  // eslint-disable-line
  'mwei': '1000000',
  // eslint-disable-line
  'Mwei': '1000000',
  // eslint-disable-line
  'lovelace': '1000000',
  // eslint-disable-line
  'picoether': '1000000',
  // eslint-disable-line
  'gwei': '1000000000',
  // eslint-disable-line
  'Gwei': '1000000000',
  // eslint-disable-line
  'shannon': '1000000000',
  // eslint-disable-line
  'nanoether': '1000000000',
  // eslint-disable-line
  'nano': '1000000000',
  // eslint-disable-line
  'szabo': '1000000000000',
  // eslint-disable-line
  'microether': '1000000000000',
  // eslint-disable-line
  'micro': '1000000000000',
  // eslint-disable-line
  'finney': '1000000000000000',
  // eslint-disable-line
  'milliether': '1000000000000000',
  // eslint-disable-line
  'milli': '1000000000000000',
  // eslint-disable-line
  'ether': '1000000000000000000',
  // eslint-disable-line
  'kether': '1000000000000000000000',
  // eslint-disable-line
  'grand': '1000000000000000000000',
  // eslint-disable-line
  'mether': '1000000000000000000000000',
  // eslint-disable-line
  'gether': '1000000000000000000000000000',
  // eslint-disable-line
  'tether': '1000000000000000000000000000000'
};
/**
 * Returns value of unit in Wei
 *
 * @method getValueOfUnit
 * @param {String} unit the unit to convert to, default ether
 * @returns {BigNumber} value of the unit (in Wei)
 * @throws error if the unit is not correct:w
 */

function getValueOfUnit(unitInput) {
  var unit = unitInput ? unitInput.toLowerCase() : 'ether';
  var unitValue = unitMap[unit]; // eslint-disable-line

  if (typeof unitValue !== 'string') {
    throw new Error('[ethjs-unit] the unit provided ' + unitInput + ' doesn\'t exists, please use the one of the following units ' + JSON.stringify(unitMap, null, 2));
  }

  return new BN(unitValue, 10);
}

function numberToString(arg) {
  if (typeof arg === 'string') {
    if (!arg.match(/^-?[0-9.]+$/)) {
      throw new Error('while converting number to string, invalid number value \'' + arg + '\', should be a number matching (^-?[0-9.]+).');
    }

    return arg;
  } else if (typeof arg === 'number') {
    return String(arg);
  } else if (_typeof(arg) === 'object' && arg.toString && (arg.toTwos || arg.dividedToIntegerBy)) {
    if (arg.toPrecision) {
      return String(arg.toPrecision());
    } else {
      // eslint-disable-line
      return arg.toString(10);
    }
  }

  throw new Error('while converting number to string, invalid number value \'' + arg + '\' type ' + _typeof(arg) + '.');
}

function fromWei(weiInput, unit, optionsInput) {
  var wei = numberToBN(weiInput); // eslint-disable-line

  var negative = wei.lt(zero); // eslint-disable-line

  var base = getValueOfUnit(unit);
  var baseLength = unitMap[unit].length - 1 || 1;
  var options = optionsInput || {};

  if (negative) {
    wei = wei.mul(negative1);
  }

  var fraction = wei.mod(base).toString(10); // eslint-disable-line

  while (fraction.length < baseLength) {
    fraction = '0' + fraction;
  }

  if (!options.pad) {
    fraction = fraction.match(/^([0-9]*[1-9]|0)(0*)/)[1];
  }

  var whole = wei.div(base).toString(10); // eslint-disable-line

  if (options.commify) {
    whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  var value = '' + whole + (fraction == '0' ? '' : '.' + fraction); // eslint-disable-line

  if (negative) {
    value = '-' + value;
  }

  return value;
}

function toWei(etherInput, unit) {
  var ether = numberToString(etherInput); // eslint-disable-line

  var base = getValueOfUnit(unit);
  var baseLength = unitMap[unit].length - 1 || 1; // Is it negative?

  var negative = ether.substring(0, 1) === '-'; // eslint-disable-line

  if (negative) {
    ether = ether.substring(1);
  }

  if (ether === '.') {
    throw new Error('[ethjs-unit] while converting number ' + etherInput + ' to wei, invalid value');
  } // Split it into a whole and fractional part


  var comps = ether.split('.'); // eslint-disable-line

  if (comps.length > 2) {
    throw new Error('[ethjs-unit] while converting number ' + etherInput + ' to wei,  too many decimal points');
  }

  var whole = comps[0],
      fraction = comps[1]; // eslint-disable-line

  if (!whole) {
    whole = '0';
  }

  if (!fraction) {
    fraction = '0';
  }

  if (fraction.length > baseLength) {
    throw new Error('[ethjs-unit] while converting number ' + etherInput + ' to wei, too many decimal places');
  }

  while (fraction.length < baseLength) {
    fraction += '0';
  }

  whole = new BN(whole);
  fraction = new BN(fraction);
  var wei = whole.mul(base).add(fraction); // eslint-disable-line

  if (negative) {
    wei = wei.mul(negative1);
  }

  return new BN(wei.toString(10), 10);
}

module.exports = {
  unitMap: unitMap,
  numberToString: numberToString,
  getValueOfUnit: getValueOfUnit,
  fromWei: fromWei,
  toWei: toWei
};

},{"bn.js":55,"number-to-bn":59}],55:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (module, exports) {
  'use strict'; // Utils

  function assert(val, msg) {
    if (!val) throw new Error(msg || 'Assertion failed');
  } // Could use `inherits` module, but don't want to move from single file
  // architecture yet.


  function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;

    var TempCtor = function TempCtor() {};

    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  } // BN


  function BN(number, base, endian) {
    if (BN.isBN(number)) {
      return number;
    }

    this.negative = 0;
    this.words = null;
    this.length = 0; // Reduction context

    this.red = null;

    if (number !== null) {
      if (base === 'le' || base === 'be') {
        endian = base;
        base = 10;
      }

      this._init(number || 0, base || 10, endian || 'be');
    }
  }

  if (_typeof(module) === 'object') {
    module.exports = BN;
  } else {
    exports.BN = BN;
  }

  BN.BN = BN;
  BN.wordSize = 26;
  var Buffer;

  try {
    Buffer = require('buf' + 'fer').Buffer;
  } catch (e) {}

  BN.isBN = function isBN(num) {
    if (num instanceof BN) {
      return true;
    }

    return num !== null && _typeof(num) === 'object' && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
  };

  BN.max = function max(left, right) {
    if (left.cmp(right) > 0) return left;
    return right;
  };

  BN.min = function min(left, right) {
    if (left.cmp(right) < 0) return left;
    return right;
  };

  BN.prototype._init = function init(number, base, endian) {
    if (typeof number === 'number') {
      return this._initNumber(number, base, endian);
    }

    if (_typeof(number) === 'object') {
      return this._initArray(number, base, endian);
    }

    if (base === 'hex') {
      base = 16;
    }

    assert(base === (base | 0) && base >= 2 && base <= 36);
    number = number.toString().replace(/\s+/g, '');
    var start = 0;

    if (number[0] === '-') {
      start++;
    }

    if (base === 16) {
      this._parseHex(number, start);
    } else {
      this._parseBase(number, base, start);
    }

    if (number[0] === '-') {
      this.negative = 1;
    }

    this.strip();
    if (endian !== 'le') return;

    this._initArray(this.toArray(), base, endian);
  };

  BN.prototype._initNumber = function _initNumber(number, base, endian) {
    if (number < 0) {
      this.negative = 1;
      number = -number;
    }

    if (number < 0x4000000) {
      this.words = [number & 0x3ffffff];
      this.length = 1;
    } else if (number < 0x10000000000000) {
      this.words = [number & 0x3ffffff, number / 0x4000000 & 0x3ffffff];
      this.length = 2;
    } else {
      assert(number < 0x20000000000000); // 2 ^ 53 (unsafe)

      this.words = [number & 0x3ffffff, number / 0x4000000 & 0x3ffffff, 1];
      this.length = 3;
    }

    if (endian !== 'le') return; // Reverse the bytes

    this._initArray(this.toArray(), base, endian);
  };

  BN.prototype._initArray = function _initArray(number, base, endian) {
    // Perhaps a Uint8Array
    assert(typeof number.length === 'number');

    if (number.length <= 0) {
      this.words = [0];
      this.length = 1;
      return this;
    }

    this.length = Math.ceil(number.length / 3);
    this.words = new Array(this.length);

    for (var i = 0; i < this.length; i++) {
      this.words[i] = 0;
    }

    var j, w;
    var off = 0;

    if (endian === 'be') {
      for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
        w = number[i] | number[i - 1] << 8 | number[i - 2] << 16;
        this.words[j] |= w << off & 0x3ffffff;
        this.words[j + 1] = w >>> 26 - off & 0x3ffffff;
        off += 24;

        if (off >= 26) {
          off -= 26;
          j++;
        }
      }
    } else if (endian === 'le') {
      for (i = 0, j = 0; i < number.length; i += 3) {
        w = number[i] | number[i + 1] << 8 | number[i + 2] << 16;
        this.words[j] |= w << off & 0x3ffffff;
        this.words[j + 1] = w >>> 26 - off & 0x3ffffff;
        off += 24;

        if (off >= 26) {
          off -= 26;
          j++;
        }
      }
    }

    return this.strip();
  };

  function parseHex(str, start, end) {
    var r = 0;
    var len = Math.min(str.length, end);

    for (var i = start; i < len; i++) {
      var c = str.charCodeAt(i) - 48;
      r <<= 4; // 'a' - 'f'

      if (c >= 49 && c <= 54) {
        r |= c - 49 + 0xa; // 'A' - 'F'
      } else if (c >= 17 && c <= 22) {
        r |= c - 17 + 0xa; // '0' - '9'
      } else {
        r |= c & 0xf;
      }
    }

    return r;
  }

  BN.prototype._parseHex = function _parseHex(number, start) {
    // Create possibly bigger array to ensure that it fits the number
    this.length = Math.ceil((number.length - start) / 6);
    this.words = new Array(this.length);

    for (var i = 0; i < this.length; i++) {
      this.words[i] = 0;
    }

    var j, w; // Scan 24-bit chunks and add them to the number

    var off = 0;

    for (i = number.length - 6, j = 0; i >= start; i -= 6) {
      w = parseHex(number, i, i + 6);
      this.words[j] |= w << off & 0x3ffffff; // NOTE: `0x3fffff` is intentional here, 26bits max shift + 24bit hex limb

      this.words[j + 1] |= w >>> 26 - off & 0x3fffff;
      off += 24;

      if (off >= 26) {
        off -= 26;
        j++;
      }
    }

    if (i + 6 !== start) {
      w = parseHex(number, start, i + 6);
      this.words[j] |= w << off & 0x3ffffff;
      this.words[j + 1] |= w >>> 26 - off & 0x3fffff;
    }

    this.strip();
  };

  function parseBase(str, start, end, mul) {
    var r = 0;
    var len = Math.min(str.length, end);

    for (var i = start; i < len; i++) {
      var c = str.charCodeAt(i) - 48;
      r *= mul; // 'a'

      if (c >= 49) {
        r += c - 49 + 0xa; // 'A'
      } else if (c >= 17) {
        r += c - 17 + 0xa; // '0' - '9'
      } else {
        r += c;
      }
    }

    return r;
  }

  BN.prototype._parseBase = function _parseBase(number, base, start) {
    // Initialize as zero
    this.words = [0];
    this.length = 1; // Find length of limb in base

    for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base) {
      limbLen++;
    }

    limbLen--;
    limbPow = limbPow / base | 0;
    var total = number.length - start;
    var mod = total % limbLen;
    var end = Math.min(total, total - mod) + start;
    var word = 0;

    for (var i = start; i < end; i += limbLen) {
      word = parseBase(number, i, i + limbLen, base);
      this.imuln(limbPow);

      if (this.words[0] + word < 0x4000000) {
        this.words[0] += word;
      } else {
        this._iaddn(word);
      }
    }

    if (mod !== 0) {
      var pow = 1;
      word = parseBase(number, i, number.length, base);

      for (i = 0; i < mod; i++) {
        pow *= base;
      }

      this.imuln(pow);

      if (this.words[0] + word < 0x4000000) {
        this.words[0] += word;
      } else {
        this._iaddn(word);
      }
    }
  };

  BN.prototype.copy = function copy(dest) {
    dest.words = new Array(this.length);

    for (var i = 0; i < this.length; i++) {
      dest.words[i] = this.words[i];
    }

    dest.length = this.length;
    dest.negative = this.negative;
    dest.red = this.red;
  };

  BN.prototype.clone = function clone() {
    var r = new BN(null);
    this.copy(r);
    return r;
  };

  BN.prototype._expand = function _expand(size) {
    while (this.length < size) {
      this.words[this.length++] = 0;
    }

    return this;
  }; // Remove leading `0` from `this`


  BN.prototype.strip = function strip() {
    while (this.length > 1 && this.words[this.length - 1] === 0) {
      this.length--;
    }

    return this._normSign();
  };

  BN.prototype._normSign = function _normSign() {
    // -0 = 0
    if (this.length === 1 && this.words[0] === 0) {
      this.negative = 0;
    }

    return this;
  };

  BN.prototype.inspect = function inspect() {
    return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
  };
  /*
   var zeros = [];
  var groupSizes = [];
  var groupBases = [];
   var s = '';
  var i = -1;
  while (++i < BN.wordSize) {
    zeros[i] = s;
    s += '0';
  }
  groupSizes[0] = 0;
  groupSizes[1] = 0;
  groupBases[0] = 0;
  groupBases[1] = 0;
  var base = 2 - 1;
  while (++base < 36 + 1) {
    var groupSize = 0;
    var groupBase = 1;
    while (groupBase < (1 << BN.wordSize) / base) {
      groupBase *= base;
      groupSize += 1;
    }
    groupSizes[base] = groupSize;
    groupBases[base] = groupBase;
  }
   */


  var zeros = ['', '0', '00', '000', '0000', '00000', '000000', '0000000', '00000000', '000000000', '0000000000', '00000000000', '000000000000', '0000000000000', '00000000000000', '000000000000000', '0000000000000000', '00000000000000000', '000000000000000000', '0000000000000000000', '00000000000000000000', '000000000000000000000', '0000000000000000000000', '00000000000000000000000', '000000000000000000000000', '0000000000000000000000000'];
  var groupSizes = [0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
  var groupBases = [0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216, 43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625, 16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149, 24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176];

  BN.prototype.toString = function toString(base, padding) {
    base = base || 10;
    padding = padding | 0 || 1;
    var out;

    if (base === 16 || base === 'hex') {
      out = '';
      var off = 0;
      var carry = 0;

      for (var i = 0; i < this.length; i++) {
        var w = this.words[i];
        var word = ((w << off | carry) & 0xffffff).toString(16);
        carry = w >>> 24 - off & 0xffffff;

        if (carry !== 0 || i !== this.length - 1) {
          out = zeros[6 - word.length] + word + out;
        } else {
          out = word + out;
        }

        off += 2;

        if (off >= 26) {
          off -= 26;
          i--;
        }
      }

      if (carry !== 0) {
        out = carry.toString(16) + out;
      }

      while (out.length % padding !== 0) {
        out = '0' + out;
      }

      if (this.negative !== 0) {
        out = '-' + out;
      }

      return out;
    }

    if (base === (base | 0) && base >= 2 && base <= 36) {
      // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
      var groupSize = groupSizes[base]; // var groupBase = Math.pow(base, groupSize);

      var groupBase = groupBases[base];
      out = '';
      var c = this.clone();
      c.negative = 0;

      while (!c.isZero()) {
        var r = c.modn(groupBase).toString(base);
        c = c.idivn(groupBase);

        if (!c.isZero()) {
          out = zeros[groupSize - r.length] + r + out;
        } else {
          out = r + out;
        }
      }

      if (this.isZero()) {
        out = '0' + out;
      }

      while (out.length % padding !== 0) {
        out = '0' + out;
      }

      if (this.negative !== 0) {
        out = '-' + out;
      }

      return out;
    }

    assert(false, 'Base should be between 2 and 36');
  };

  BN.prototype.toNumber = function toNumber() {
    var ret = this.words[0];

    if (this.length === 2) {
      ret += this.words[1] * 0x4000000;
    } else if (this.length === 3 && this.words[2] === 0x01) {
      // NOTE: at this stage it is known that the top bit is set
      ret += 0x10000000000000 + this.words[1] * 0x4000000;
    } else if (this.length > 2) {
      assert(false, 'Number can only safely store up to 53 bits');
    }

    return this.negative !== 0 ? -ret : ret;
  };

  BN.prototype.toJSON = function toJSON() {
    return this.toString(16);
  };

  BN.prototype.toBuffer = function toBuffer(endian, length) {
    assert(typeof Buffer !== 'undefined');
    return this.toArrayLike(Buffer, endian, length);
  };

  BN.prototype.toArray = function toArray(endian, length) {
    return this.toArrayLike(Array, endian, length);
  };

  BN.prototype.toArrayLike = function toArrayLike(ArrayType, endian, length) {
    var byteLength = this.byteLength();
    var reqLength = length || Math.max(1, byteLength);
    assert(byteLength <= reqLength, 'byte array longer than desired length');
    assert(reqLength > 0, 'Requested array length <= 0');
    this.strip();
    var littleEndian = endian === 'le';
    var res = new ArrayType(reqLength);
    var b, i;
    var q = this.clone();

    if (!littleEndian) {
      // Assume big-endian
      for (i = 0; i < reqLength - byteLength; i++) {
        res[i] = 0;
      }

      for (i = 0; !q.isZero(); i++) {
        b = q.andln(0xff);
        q.iushrn(8);
        res[reqLength - i - 1] = b;
      }
    } else {
      for (i = 0; !q.isZero(); i++) {
        b = q.andln(0xff);
        q.iushrn(8);
        res[i] = b;
      }

      for (; i < reqLength; i++) {
        res[i] = 0;
      }
    }

    return res;
  };

  if (Math.clz32) {
    BN.prototype._countBits = function _countBits(w) {
      return 32 - Math.clz32(w);
    };
  } else {
    BN.prototype._countBits = function _countBits(w) {
      var t = w;
      var r = 0;

      if (t >= 0x1000) {
        r += 13;
        t >>>= 13;
      }

      if (t >= 0x40) {
        r += 7;
        t >>>= 7;
      }

      if (t >= 0x8) {
        r += 4;
        t >>>= 4;
      }

      if (t >= 0x02) {
        r += 2;
        t >>>= 2;
      }

      return r + t;
    };
  }

  BN.prototype._zeroBits = function _zeroBits(w) {
    // Short-cut
    if (w === 0) return 26;
    var t = w;
    var r = 0;

    if ((t & 0x1fff) === 0) {
      r += 13;
      t >>>= 13;
    }

    if ((t & 0x7f) === 0) {
      r += 7;
      t >>>= 7;
    }

    if ((t & 0xf) === 0) {
      r += 4;
      t >>>= 4;
    }

    if ((t & 0x3) === 0) {
      r += 2;
      t >>>= 2;
    }

    if ((t & 0x1) === 0) {
      r++;
    }

    return r;
  }; // Return number of used bits in a BN


  BN.prototype.bitLength = function bitLength() {
    var w = this.words[this.length - 1];

    var hi = this._countBits(w);

    return (this.length - 1) * 26 + hi;
  };

  function toBitArray(num) {
    var w = new Array(num.bitLength());

    for (var bit = 0; bit < w.length; bit++) {
      var off = bit / 26 | 0;
      var wbit = bit % 26;
      w[bit] = (num.words[off] & 1 << wbit) >>> wbit;
    }

    return w;
  } // Number of trailing zero bits


  BN.prototype.zeroBits = function zeroBits() {
    if (this.isZero()) return 0;
    var r = 0;

    for (var i = 0; i < this.length; i++) {
      var b = this._zeroBits(this.words[i]);

      r += b;
      if (b !== 26) break;
    }

    return r;
  };

  BN.prototype.byteLength = function byteLength() {
    return Math.ceil(this.bitLength() / 8);
  };

  BN.prototype.toTwos = function toTwos(width) {
    if (this.negative !== 0) {
      return this.abs().inotn(width).iaddn(1);
    }

    return this.clone();
  };

  BN.prototype.fromTwos = function fromTwos(width) {
    if (this.testn(width - 1)) {
      return this.notn(width).iaddn(1).ineg();
    }

    return this.clone();
  };

  BN.prototype.isNeg = function isNeg() {
    return this.negative !== 0;
  }; // Return negative clone of `this`


  BN.prototype.neg = function neg() {
    return this.clone().ineg();
  };

  BN.prototype.ineg = function ineg() {
    if (!this.isZero()) {
      this.negative ^= 1;
    }

    return this;
  }; // Or `num` with `this` in-place


  BN.prototype.iuor = function iuor(num) {
    while (this.length < num.length) {
      this.words[this.length++] = 0;
    }

    for (var i = 0; i < num.length; i++) {
      this.words[i] = this.words[i] | num.words[i];
    }

    return this.strip();
  };

  BN.prototype.ior = function ior(num) {
    assert((this.negative | num.negative) === 0);
    return this.iuor(num);
  }; // Or `num` with `this`


  BN.prototype.or = function or(num) {
    if (this.length > num.length) return this.clone().ior(num);
    return num.clone().ior(this);
  };

  BN.prototype.uor = function uor(num) {
    if (this.length > num.length) return this.clone().iuor(num);
    return num.clone().iuor(this);
  }; // And `num` with `this` in-place


  BN.prototype.iuand = function iuand(num) {
    // b = min-length(num, this)
    var b;

    if (this.length > num.length) {
      b = num;
    } else {
      b = this;
    }

    for (var i = 0; i < b.length; i++) {
      this.words[i] = this.words[i] & num.words[i];
    }

    this.length = b.length;
    return this.strip();
  };

  BN.prototype.iand = function iand(num) {
    assert((this.negative | num.negative) === 0);
    return this.iuand(num);
  }; // And `num` with `this`


  BN.prototype.and = function and(num) {
    if (this.length > num.length) return this.clone().iand(num);
    return num.clone().iand(this);
  };

  BN.prototype.uand = function uand(num) {
    if (this.length > num.length) return this.clone().iuand(num);
    return num.clone().iuand(this);
  }; // Xor `num` with `this` in-place


  BN.prototype.iuxor = function iuxor(num) {
    // a.length > b.length
    var a;
    var b;

    if (this.length > num.length) {
      a = this;
      b = num;
    } else {
      a = num;
      b = this;
    }

    for (var i = 0; i < b.length; i++) {
      this.words[i] = a.words[i] ^ b.words[i];
    }

    if (this !== a) {
      for (; i < a.length; i++) {
        this.words[i] = a.words[i];
      }
    }

    this.length = a.length;
    return this.strip();
  };

  BN.prototype.ixor = function ixor(num) {
    assert((this.negative | num.negative) === 0);
    return this.iuxor(num);
  }; // Xor `num` with `this`


  BN.prototype.xor = function xor(num) {
    if (this.length > num.length) return this.clone().ixor(num);
    return num.clone().ixor(this);
  };

  BN.prototype.uxor = function uxor(num) {
    if (this.length > num.length) return this.clone().iuxor(num);
    return num.clone().iuxor(this);
  }; // Not ``this`` with ``width`` bitwidth


  BN.prototype.inotn = function inotn(width) {
    assert(typeof width === 'number' && width >= 0);
    var bytesNeeded = Math.ceil(width / 26) | 0;
    var bitsLeft = width % 26; // Extend the buffer with leading zeroes

    this._expand(bytesNeeded);

    if (bitsLeft > 0) {
      bytesNeeded--;
    } // Handle complete words


    for (var i = 0; i < bytesNeeded; i++) {
      this.words[i] = ~this.words[i] & 0x3ffffff;
    } // Handle the residue


    if (bitsLeft > 0) {
      this.words[i] = ~this.words[i] & 0x3ffffff >> 26 - bitsLeft;
    } // And remove leading zeroes


    return this.strip();
  };

  BN.prototype.notn = function notn(width) {
    return this.clone().inotn(width);
  }; // Set `bit` of `this`


  BN.prototype.setn = function setn(bit, val) {
    assert(typeof bit === 'number' && bit >= 0);
    var off = bit / 26 | 0;
    var wbit = bit % 26;

    this._expand(off + 1);

    if (val) {
      this.words[off] = this.words[off] | 1 << wbit;
    } else {
      this.words[off] = this.words[off] & ~(1 << wbit);
    }

    return this.strip();
  }; // Add `num` to `this` in-place


  BN.prototype.iadd = function iadd(num) {
    var r; // negative + positive

    if (this.negative !== 0 && num.negative === 0) {
      this.negative = 0;
      r = this.isub(num);
      this.negative ^= 1;
      return this._normSign(); // positive + negative
    } else if (this.negative === 0 && num.negative !== 0) {
      num.negative = 0;
      r = this.isub(num);
      num.negative = 1;
      return r._normSign();
    } // a.length > b.length


    var a, b;

    if (this.length > num.length) {
      a = this;
      b = num;
    } else {
      a = num;
      b = this;
    }

    var carry = 0;

    for (var i = 0; i < b.length; i++) {
      r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
      this.words[i] = r & 0x3ffffff;
      carry = r >>> 26;
    }

    for (; carry !== 0 && i < a.length; i++) {
      r = (a.words[i] | 0) + carry;
      this.words[i] = r & 0x3ffffff;
      carry = r >>> 26;
    }

    this.length = a.length;

    if (carry !== 0) {
      this.words[this.length] = carry;
      this.length++; // Copy the rest of the words
    } else if (a !== this) {
      for (; i < a.length; i++) {
        this.words[i] = a.words[i];
      }
    }

    return this;
  }; // Add `num` to `this`


  BN.prototype.add = function add(num) {
    var res;

    if (num.negative !== 0 && this.negative === 0) {
      num.negative = 0;
      res = this.sub(num);
      num.negative ^= 1;
      return res;
    } else if (num.negative === 0 && this.negative !== 0) {
      this.negative = 0;
      res = num.sub(this);
      this.negative = 1;
      return res;
    }

    if (this.length > num.length) return this.clone().iadd(num);
    return num.clone().iadd(this);
  }; // Subtract `num` from `this` in-place


  BN.prototype.isub = function isub(num) {
    // this - (-num) = this + num
    if (num.negative !== 0) {
      num.negative = 0;
      var r = this.iadd(num);
      num.negative = 1;
      return r._normSign(); // -this - num = -(this + num)
    } else if (this.negative !== 0) {
      this.negative = 0;
      this.iadd(num);
      this.negative = 1;
      return this._normSign();
    } // At this point both numbers are positive


    var cmp = this.cmp(num); // Optimization - zeroify

    if (cmp === 0) {
      this.negative = 0;
      this.length = 1;
      this.words[0] = 0;
      return this;
    } // a > b


    var a, b;

    if (cmp > 0) {
      a = this;
      b = num;
    } else {
      a = num;
      b = this;
    }

    var carry = 0;

    for (var i = 0; i < b.length; i++) {
      r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
      carry = r >> 26;
      this.words[i] = r & 0x3ffffff;
    }

    for (; carry !== 0 && i < a.length; i++) {
      r = (a.words[i] | 0) + carry;
      carry = r >> 26;
      this.words[i] = r & 0x3ffffff;
    } // Copy rest of the words


    if (carry === 0 && i < a.length && a !== this) {
      for (; i < a.length; i++) {
        this.words[i] = a.words[i];
      }
    }

    this.length = Math.max(this.length, i);

    if (a !== this) {
      this.negative = 1;
    }

    return this.strip();
  }; // Subtract `num` from `this`


  BN.prototype.sub = function sub(num) {
    return this.clone().isub(num);
  };

  function smallMulTo(self, num, out) {
    out.negative = num.negative ^ self.negative;
    var len = self.length + num.length | 0;
    out.length = len;
    len = len - 1 | 0; // Peel one iteration (compiler can't do it, because of code complexity)

    var a = self.words[0] | 0;
    var b = num.words[0] | 0;
    var r = a * b;
    var lo = r & 0x3ffffff;
    var carry = r / 0x4000000 | 0;
    out.words[0] = lo;

    for (var k = 1; k < len; k++) {
      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
      // note that ncarry could be >= 0x3ffffff
      var ncarry = carry >>> 26;
      var rword = carry & 0x3ffffff;
      var maxJ = Math.min(k, num.length - 1);

      for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
        var i = k - j | 0;
        a = self.words[i] | 0;
        b = num.words[j] | 0;
        r = a * b + rword;
        ncarry += r / 0x4000000 | 0;
        rword = r & 0x3ffffff;
      }

      out.words[k] = rword | 0;
      carry = ncarry | 0;
    }

    if (carry !== 0) {
      out.words[k] = carry | 0;
    } else {
      out.length--;
    }

    return out.strip();
  } // TODO(indutny): it may be reasonable to omit it for users who don't need
  // to work with 256-bit numbers, otherwise it gives 20% improvement for 256-bit
  // multiplication (like elliptic secp256k1).


  var comb10MulTo = function comb10MulTo(self, num, out) {
    var a = self.words;
    var b = num.words;
    var o = out.words;
    var c = 0;
    var lo;
    var mid;
    var hi;
    var a0 = a[0] | 0;
    var al0 = a0 & 0x1fff;
    var ah0 = a0 >>> 13;
    var a1 = a[1] | 0;
    var al1 = a1 & 0x1fff;
    var ah1 = a1 >>> 13;
    var a2 = a[2] | 0;
    var al2 = a2 & 0x1fff;
    var ah2 = a2 >>> 13;
    var a3 = a[3] | 0;
    var al3 = a3 & 0x1fff;
    var ah3 = a3 >>> 13;
    var a4 = a[4] | 0;
    var al4 = a4 & 0x1fff;
    var ah4 = a4 >>> 13;
    var a5 = a[5] | 0;
    var al5 = a5 & 0x1fff;
    var ah5 = a5 >>> 13;
    var a6 = a[6] | 0;
    var al6 = a6 & 0x1fff;
    var ah6 = a6 >>> 13;
    var a7 = a[7] | 0;
    var al7 = a7 & 0x1fff;
    var ah7 = a7 >>> 13;
    var a8 = a[8] | 0;
    var al8 = a8 & 0x1fff;
    var ah8 = a8 >>> 13;
    var a9 = a[9] | 0;
    var al9 = a9 & 0x1fff;
    var ah9 = a9 >>> 13;
    var b0 = b[0] | 0;
    var bl0 = b0 & 0x1fff;
    var bh0 = b0 >>> 13;
    var b1 = b[1] | 0;
    var bl1 = b1 & 0x1fff;
    var bh1 = b1 >>> 13;
    var b2 = b[2] | 0;
    var bl2 = b2 & 0x1fff;
    var bh2 = b2 >>> 13;
    var b3 = b[3] | 0;
    var bl3 = b3 & 0x1fff;
    var bh3 = b3 >>> 13;
    var b4 = b[4] | 0;
    var bl4 = b4 & 0x1fff;
    var bh4 = b4 >>> 13;
    var b5 = b[5] | 0;
    var bl5 = b5 & 0x1fff;
    var bh5 = b5 >>> 13;
    var b6 = b[6] | 0;
    var bl6 = b6 & 0x1fff;
    var bh6 = b6 >>> 13;
    var b7 = b[7] | 0;
    var bl7 = b7 & 0x1fff;
    var bh7 = b7 >>> 13;
    var b8 = b[8] | 0;
    var bl8 = b8 & 0x1fff;
    var bh8 = b8 >>> 13;
    var b9 = b[9] | 0;
    var bl9 = b9 & 0x1fff;
    var bh9 = b9 >>> 13;
    out.negative = self.negative ^ num.negative;
    out.length = 19;
    /* k = 0 */

    lo = Math.imul(al0, bl0);
    mid = Math.imul(al0, bh0);
    mid = mid + Math.imul(ah0, bl0) | 0;
    hi = Math.imul(ah0, bh0);
    var w0 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w0 >>> 26) | 0;
    w0 &= 0x3ffffff;
    /* k = 1 */

    lo = Math.imul(al1, bl0);
    mid = Math.imul(al1, bh0);
    mid = mid + Math.imul(ah1, bl0) | 0;
    hi = Math.imul(ah1, bh0);
    lo = lo + Math.imul(al0, bl1) | 0;
    mid = mid + Math.imul(al0, bh1) | 0;
    mid = mid + Math.imul(ah0, bl1) | 0;
    hi = hi + Math.imul(ah0, bh1) | 0;
    var w1 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w1 >>> 26) | 0;
    w1 &= 0x3ffffff;
    /* k = 2 */

    lo = Math.imul(al2, bl0);
    mid = Math.imul(al2, bh0);
    mid = mid + Math.imul(ah2, bl0) | 0;
    hi = Math.imul(ah2, bh0);
    lo = lo + Math.imul(al1, bl1) | 0;
    mid = mid + Math.imul(al1, bh1) | 0;
    mid = mid + Math.imul(ah1, bl1) | 0;
    hi = hi + Math.imul(ah1, bh1) | 0;
    lo = lo + Math.imul(al0, bl2) | 0;
    mid = mid + Math.imul(al0, bh2) | 0;
    mid = mid + Math.imul(ah0, bl2) | 0;
    hi = hi + Math.imul(ah0, bh2) | 0;
    var w2 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w2 >>> 26) | 0;
    w2 &= 0x3ffffff;
    /* k = 3 */

    lo = Math.imul(al3, bl0);
    mid = Math.imul(al3, bh0);
    mid = mid + Math.imul(ah3, bl0) | 0;
    hi = Math.imul(ah3, bh0);
    lo = lo + Math.imul(al2, bl1) | 0;
    mid = mid + Math.imul(al2, bh1) | 0;
    mid = mid + Math.imul(ah2, bl1) | 0;
    hi = hi + Math.imul(ah2, bh1) | 0;
    lo = lo + Math.imul(al1, bl2) | 0;
    mid = mid + Math.imul(al1, bh2) | 0;
    mid = mid + Math.imul(ah1, bl2) | 0;
    hi = hi + Math.imul(ah1, bh2) | 0;
    lo = lo + Math.imul(al0, bl3) | 0;
    mid = mid + Math.imul(al0, bh3) | 0;
    mid = mid + Math.imul(ah0, bl3) | 0;
    hi = hi + Math.imul(ah0, bh3) | 0;
    var w3 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w3 >>> 26) | 0;
    w3 &= 0x3ffffff;
    /* k = 4 */

    lo = Math.imul(al4, bl0);
    mid = Math.imul(al4, bh0);
    mid = mid + Math.imul(ah4, bl0) | 0;
    hi = Math.imul(ah4, bh0);
    lo = lo + Math.imul(al3, bl1) | 0;
    mid = mid + Math.imul(al3, bh1) | 0;
    mid = mid + Math.imul(ah3, bl1) | 0;
    hi = hi + Math.imul(ah3, bh1) | 0;
    lo = lo + Math.imul(al2, bl2) | 0;
    mid = mid + Math.imul(al2, bh2) | 0;
    mid = mid + Math.imul(ah2, bl2) | 0;
    hi = hi + Math.imul(ah2, bh2) | 0;
    lo = lo + Math.imul(al1, bl3) | 0;
    mid = mid + Math.imul(al1, bh3) | 0;
    mid = mid + Math.imul(ah1, bl3) | 0;
    hi = hi + Math.imul(ah1, bh3) | 0;
    lo = lo + Math.imul(al0, bl4) | 0;
    mid = mid + Math.imul(al0, bh4) | 0;
    mid = mid + Math.imul(ah0, bl4) | 0;
    hi = hi + Math.imul(ah0, bh4) | 0;
    var w4 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w4 >>> 26) | 0;
    w4 &= 0x3ffffff;
    /* k = 5 */

    lo = Math.imul(al5, bl0);
    mid = Math.imul(al5, bh0);
    mid = mid + Math.imul(ah5, bl0) | 0;
    hi = Math.imul(ah5, bh0);
    lo = lo + Math.imul(al4, bl1) | 0;
    mid = mid + Math.imul(al4, bh1) | 0;
    mid = mid + Math.imul(ah4, bl1) | 0;
    hi = hi + Math.imul(ah4, bh1) | 0;
    lo = lo + Math.imul(al3, bl2) | 0;
    mid = mid + Math.imul(al3, bh2) | 0;
    mid = mid + Math.imul(ah3, bl2) | 0;
    hi = hi + Math.imul(ah3, bh2) | 0;
    lo = lo + Math.imul(al2, bl3) | 0;
    mid = mid + Math.imul(al2, bh3) | 0;
    mid = mid + Math.imul(ah2, bl3) | 0;
    hi = hi + Math.imul(ah2, bh3) | 0;
    lo = lo + Math.imul(al1, bl4) | 0;
    mid = mid + Math.imul(al1, bh4) | 0;
    mid = mid + Math.imul(ah1, bl4) | 0;
    hi = hi + Math.imul(ah1, bh4) | 0;
    lo = lo + Math.imul(al0, bl5) | 0;
    mid = mid + Math.imul(al0, bh5) | 0;
    mid = mid + Math.imul(ah0, bl5) | 0;
    hi = hi + Math.imul(ah0, bh5) | 0;
    var w5 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w5 >>> 26) | 0;
    w5 &= 0x3ffffff;
    /* k = 6 */

    lo = Math.imul(al6, bl0);
    mid = Math.imul(al6, bh0);
    mid = mid + Math.imul(ah6, bl0) | 0;
    hi = Math.imul(ah6, bh0);
    lo = lo + Math.imul(al5, bl1) | 0;
    mid = mid + Math.imul(al5, bh1) | 0;
    mid = mid + Math.imul(ah5, bl1) | 0;
    hi = hi + Math.imul(ah5, bh1) | 0;
    lo = lo + Math.imul(al4, bl2) | 0;
    mid = mid + Math.imul(al4, bh2) | 0;
    mid = mid + Math.imul(ah4, bl2) | 0;
    hi = hi + Math.imul(ah4, bh2) | 0;
    lo = lo + Math.imul(al3, bl3) | 0;
    mid = mid + Math.imul(al3, bh3) | 0;
    mid = mid + Math.imul(ah3, bl3) | 0;
    hi = hi + Math.imul(ah3, bh3) | 0;
    lo = lo + Math.imul(al2, bl4) | 0;
    mid = mid + Math.imul(al2, bh4) | 0;
    mid = mid + Math.imul(ah2, bl4) | 0;
    hi = hi + Math.imul(ah2, bh4) | 0;
    lo = lo + Math.imul(al1, bl5) | 0;
    mid = mid + Math.imul(al1, bh5) | 0;
    mid = mid + Math.imul(ah1, bl5) | 0;
    hi = hi + Math.imul(ah1, bh5) | 0;
    lo = lo + Math.imul(al0, bl6) | 0;
    mid = mid + Math.imul(al0, bh6) | 0;
    mid = mid + Math.imul(ah0, bl6) | 0;
    hi = hi + Math.imul(ah0, bh6) | 0;
    var w6 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w6 >>> 26) | 0;
    w6 &= 0x3ffffff;
    /* k = 7 */

    lo = Math.imul(al7, bl0);
    mid = Math.imul(al7, bh0);
    mid = mid + Math.imul(ah7, bl0) | 0;
    hi = Math.imul(ah7, bh0);
    lo = lo + Math.imul(al6, bl1) | 0;
    mid = mid + Math.imul(al6, bh1) | 0;
    mid = mid + Math.imul(ah6, bl1) | 0;
    hi = hi + Math.imul(ah6, bh1) | 0;
    lo = lo + Math.imul(al5, bl2) | 0;
    mid = mid + Math.imul(al5, bh2) | 0;
    mid = mid + Math.imul(ah5, bl2) | 0;
    hi = hi + Math.imul(ah5, bh2) | 0;
    lo = lo + Math.imul(al4, bl3) | 0;
    mid = mid + Math.imul(al4, bh3) | 0;
    mid = mid + Math.imul(ah4, bl3) | 0;
    hi = hi + Math.imul(ah4, bh3) | 0;
    lo = lo + Math.imul(al3, bl4) | 0;
    mid = mid + Math.imul(al3, bh4) | 0;
    mid = mid + Math.imul(ah3, bl4) | 0;
    hi = hi + Math.imul(ah3, bh4) | 0;
    lo = lo + Math.imul(al2, bl5) | 0;
    mid = mid + Math.imul(al2, bh5) | 0;
    mid = mid + Math.imul(ah2, bl5) | 0;
    hi = hi + Math.imul(ah2, bh5) | 0;
    lo = lo + Math.imul(al1, bl6) | 0;
    mid = mid + Math.imul(al1, bh6) | 0;
    mid = mid + Math.imul(ah1, bl6) | 0;
    hi = hi + Math.imul(ah1, bh6) | 0;
    lo = lo + Math.imul(al0, bl7) | 0;
    mid = mid + Math.imul(al0, bh7) | 0;
    mid = mid + Math.imul(ah0, bl7) | 0;
    hi = hi + Math.imul(ah0, bh7) | 0;
    var w7 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w7 >>> 26) | 0;
    w7 &= 0x3ffffff;
    /* k = 8 */

    lo = Math.imul(al8, bl0);
    mid = Math.imul(al8, bh0);
    mid = mid + Math.imul(ah8, bl0) | 0;
    hi = Math.imul(ah8, bh0);
    lo = lo + Math.imul(al7, bl1) | 0;
    mid = mid + Math.imul(al7, bh1) | 0;
    mid = mid + Math.imul(ah7, bl1) | 0;
    hi = hi + Math.imul(ah7, bh1) | 0;
    lo = lo + Math.imul(al6, bl2) | 0;
    mid = mid + Math.imul(al6, bh2) | 0;
    mid = mid + Math.imul(ah6, bl2) | 0;
    hi = hi + Math.imul(ah6, bh2) | 0;
    lo = lo + Math.imul(al5, bl3) | 0;
    mid = mid + Math.imul(al5, bh3) | 0;
    mid = mid + Math.imul(ah5, bl3) | 0;
    hi = hi + Math.imul(ah5, bh3) | 0;
    lo = lo + Math.imul(al4, bl4) | 0;
    mid = mid + Math.imul(al4, bh4) | 0;
    mid = mid + Math.imul(ah4, bl4) | 0;
    hi = hi + Math.imul(ah4, bh4) | 0;
    lo = lo + Math.imul(al3, bl5) | 0;
    mid = mid + Math.imul(al3, bh5) | 0;
    mid = mid + Math.imul(ah3, bl5) | 0;
    hi = hi + Math.imul(ah3, bh5) | 0;
    lo = lo + Math.imul(al2, bl6) | 0;
    mid = mid + Math.imul(al2, bh6) | 0;
    mid = mid + Math.imul(ah2, bl6) | 0;
    hi = hi + Math.imul(ah2, bh6) | 0;
    lo = lo + Math.imul(al1, bl7) | 0;
    mid = mid + Math.imul(al1, bh7) | 0;
    mid = mid + Math.imul(ah1, bl7) | 0;
    hi = hi + Math.imul(ah1, bh7) | 0;
    lo = lo + Math.imul(al0, bl8) | 0;
    mid = mid + Math.imul(al0, bh8) | 0;
    mid = mid + Math.imul(ah0, bl8) | 0;
    hi = hi + Math.imul(ah0, bh8) | 0;
    var w8 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w8 >>> 26) | 0;
    w8 &= 0x3ffffff;
    /* k = 9 */

    lo = Math.imul(al9, bl0);
    mid = Math.imul(al9, bh0);
    mid = mid + Math.imul(ah9, bl0) | 0;
    hi = Math.imul(ah9, bh0);
    lo = lo + Math.imul(al8, bl1) | 0;
    mid = mid + Math.imul(al8, bh1) | 0;
    mid = mid + Math.imul(ah8, bl1) | 0;
    hi = hi + Math.imul(ah8, bh1) | 0;
    lo = lo + Math.imul(al7, bl2) | 0;
    mid = mid + Math.imul(al7, bh2) | 0;
    mid = mid + Math.imul(ah7, bl2) | 0;
    hi = hi + Math.imul(ah7, bh2) | 0;
    lo = lo + Math.imul(al6, bl3) | 0;
    mid = mid + Math.imul(al6, bh3) | 0;
    mid = mid + Math.imul(ah6, bl3) | 0;
    hi = hi + Math.imul(ah6, bh3) | 0;
    lo = lo + Math.imul(al5, bl4) | 0;
    mid = mid + Math.imul(al5, bh4) | 0;
    mid = mid + Math.imul(ah5, bl4) | 0;
    hi = hi + Math.imul(ah5, bh4) | 0;
    lo = lo + Math.imul(al4, bl5) | 0;
    mid = mid + Math.imul(al4, bh5) | 0;
    mid = mid + Math.imul(ah4, bl5) | 0;
    hi = hi + Math.imul(ah4, bh5) | 0;
    lo = lo + Math.imul(al3, bl6) | 0;
    mid = mid + Math.imul(al3, bh6) | 0;
    mid = mid + Math.imul(ah3, bl6) | 0;
    hi = hi + Math.imul(ah3, bh6) | 0;
    lo = lo + Math.imul(al2, bl7) | 0;
    mid = mid + Math.imul(al2, bh7) | 0;
    mid = mid + Math.imul(ah2, bl7) | 0;
    hi = hi + Math.imul(ah2, bh7) | 0;
    lo = lo + Math.imul(al1, bl8) | 0;
    mid = mid + Math.imul(al1, bh8) | 0;
    mid = mid + Math.imul(ah1, bl8) | 0;
    hi = hi + Math.imul(ah1, bh8) | 0;
    lo = lo + Math.imul(al0, bl9) | 0;
    mid = mid + Math.imul(al0, bh9) | 0;
    mid = mid + Math.imul(ah0, bl9) | 0;
    hi = hi + Math.imul(ah0, bh9) | 0;
    var w9 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w9 >>> 26) | 0;
    w9 &= 0x3ffffff;
    /* k = 10 */

    lo = Math.imul(al9, bl1);
    mid = Math.imul(al9, bh1);
    mid = mid + Math.imul(ah9, bl1) | 0;
    hi = Math.imul(ah9, bh1);
    lo = lo + Math.imul(al8, bl2) | 0;
    mid = mid + Math.imul(al8, bh2) | 0;
    mid = mid + Math.imul(ah8, bl2) | 0;
    hi = hi + Math.imul(ah8, bh2) | 0;
    lo = lo + Math.imul(al7, bl3) | 0;
    mid = mid + Math.imul(al7, bh3) | 0;
    mid = mid + Math.imul(ah7, bl3) | 0;
    hi = hi + Math.imul(ah7, bh3) | 0;
    lo = lo + Math.imul(al6, bl4) | 0;
    mid = mid + Math.imul(al6, bh4) | 0;
    mid = mid + Math.imul(ah6, bl4) | 0;
    hi = hi + Math.imul(ah6, bh4) | 0;
    lo = lo + Math.imul(al5, bl5) | 0;
    mid = mid + Math.imul(al5, bh5) | 0;
    mid = mid + Math.imul(ah5, bl5) | 0;
    hi = hi + Math.imul(ah5, bh5) | 0;
    lo = lo + Math.imul(al4, bl6) | 0;
    mid = mid + Math.imul(al4, bh6) | 0;
    mid = mid + Math.imul(ah4, bl6) | 0;
    hi = hi + Math.imul(ah4, bh6) | 0;
    lo = lo + Math.imul(al3, bl7) | 0;
    mid = mid + Math.imul(al3, bh7) | 0;
    mid = mid + Math.imul(ah3, bl7) | 0;
    hi = hi + Math.imul(ah3, bh7) | 0;
    lo = lo + Math.imul(al2, bl8) | 0;
    mid = mid + Math.imul(al2, bh8) | 0;
    mid = mid + Math.imul(ah2, bl8) | 0;
    hi = hi + Math.imul(ah2, bh8) | 0;
    lo = lo + Math.imul(al1, bl9) | 0;
    mid = mid + Math.imul(al1, bh9) | 0;
    mid = mid + Math.imul(ah1, bl9) | 0;
    hi = hi + Math.imul(ah1, bh9) | 0;
    var w10 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w10 >>> 26) | 0;
    w10 &= 0x3ffffff;
    /* k = 11 */

    lo = Math.imul(al9, bl2);
    mid = Math.imul(al9, bh2);
    mid = mid + Math.imul(ah9, bl2) | 0;
    hi = Math.imul(ah9, bh2);
    lo = lo + Math.imul(al8, bl3) | 0;
    mid = mid + Math.imul(al8, bh3) | 0;
    mid = mid + Math.imul(ah8, bl3) | 0;
    hi = hi + Math.imul(ah8, bh3) | 0;
    lo = lo + Math.imul(al7, bl4) | 0;
    mid = mid + Math.imul(al7, bh4) | 0;
    mid = mid + Math.imul(ah7, bl4) | 0;
    hi = hi + Math.imul(ah7, bh4) | 0;
    lo = lo + Math.imul(al6, bl5) | 0;
    mid = mid + Math.imul(al6, bh5) | 0;
    mid = mid + Math.imul(ah6, bl5) | 0;
    hi = hi + Math.imul(ah6, bh5) | 0;
    lo = lo + Math.imul(al5, bl6) | 0;
    mid = mid + Math.imul(al5, bh6) | 0;
    mid = mid + Math.imul(ah5, bl6) | 0;
    hi = hi + Math.imul(ah5, bh6) | 0;
    lo = lo + Math.imul(al4, bl7) | 0;
    mid = mid + Math.imul(al4, bh7) | 0;
    mid = mid + Math.imul(ah4, bl7) | 0;
    hi = hi + Math.imul(ah4, bh7) | 0;
    lo = lo + Math.imul(al3, bl8) | 0;
    mid = mid + Math.imul(al3, bh8) | 0;
    mid = mid + Math.imul(ah3, bl8) | 0;
    hi = hi + Math.imul(ah3, bh8) | 0;
    lo = lo + Math.imul(al2, bl9) | 0;
    mid = mid + Math.imul(al2, bh9) | 0;
    mid = mid + Math.imul(ah2, bl9) | 0;
    hi = hi + Math.imul(ah2, bh9) | 0;
    var w11 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w11 >>> 26) | 0;
    w11 &= 0x3ffffff;
    /* k = 12 */

    lo = Math.imul(al9, bl3);
    mid = Math.imul(al9, bh3);
    mid = mid + Math.imul(ah9, bl3) | 0;
    hi = Math.imul(ah9, bh3);
    lo = lo + Math.imul(al8, bl4) | 0;
    mid = mid + Math.imul(al8, bh4) | 0;
    mid = mid + Math.imul(ah8, bl4) | 0;
    hi = hi + Math.imul(ah8, bh4) | 0;
    lo = lo + Math.imul(al7, bl5) | 0;
    mid = mid + Math.imul(al7, bh5) | 0;
    mid = mid + Math.imul(ah7, bl5) | 0;
    hi = hi + Math.imul(ah7, bh5) | 0;
    lo = lo + Math.imul(al6, bl6) | 0;
    mid = mid + Math.imul(al6, bh6) | 0;
    mid = mid + Math.imul(ah6, bl6) | 0;
    hi = hi + Math.imul(ah6, bh6) | 0;
    lo = lo + Math.imul(al5, bl7) | 0;
    mid = mid + Math.imul(al5, bh7) | 0;
    mid = mid + Math.imul(ah5, bl7) | 0;
    hi = hi + Math.imul(ah5, bh7) | 0;
    lo = lo + Math.imul(al4, bl8) | 0;
    mid = mid + Math.imul(al4, bh8) | 0;
    mid = mid + Math.imul(ah4, bl8) | 0;
    hi = hi + Math.imul(ah4, bh8) | 0;
    lo = lo + Math.imul(al3, bl9) | 0;
    mid = mid + Math.imul(al3, bh9) | 0;
    mid = mid + Math.imul(ah3, bl9) | 0;
    hi = hi + Math.imul(ah3, bh9) | 0;
    var w12 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w12 >>> 26) | 0;
    w12 &= 0x3ffffff;
    /* k = 13 */

    lo = Math.imul(al9, bl4);
    mid = Math.imul(al9, bh4);
    mid = mid + Math.imul(ah9, bl4) | 0;
    hi = Math.imul(ah9, bh4);
    lo = lo + Math.imul(al8, bl5) | 0;
    mid = mid + Math.imul(al8, bh5) | 0;
    mid = mid + Math.imul(ah8, bl5) | 0;
    hi = hi + Math.imul(ah8, bh5) | 0;
    lo = lo + Math.imul(al7, bl6) | 0;
    mid = mid + Math.imul(al7, bh6) | 0;
    mid = mid + Math.imul(ah7, bl6) | 0;
    hi = hi + Math.imul(ah7, bh6) | 0;
    lo = lo + Math.imul(al6, bl7) | 0;
    mid = mid + Math.imul(al6, bh7) | 0;
    mid = mid + Math.imul(ah6, bl7) | 0;
    hi = hi + Math.imul(ah6, bh7) | 0;
    lo = lo + Math.imul(al5, bl8) | 0;
    mid = mid + Math.imul(al5, bh8) | 0;
    mid = mid + Math.imul(ah5, bl8) | 0;
    hi = hi + Math.imul(ah5, bh8) | 0;
    lo = lo + Math.imul(al4, bl9) | 0;
    mid = mid + Math.imul(al4, bh9) | 0;
    mid = mid + Math.imul(ah4, bl9) | 0;
    hi = hi + Math.imul(ah4, bh9) | 0;
    var w13 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w13 >>> 26) | 0;
    w13 &= 0x3ffffff;
    /* k = 14 */

    lo = Math.imul(al9, bl5);
    mid = Math.imul(al9, bh5);
    mid = mid + Math.imul(ah9, bl5) | 0;
    hi = Math.imul(ah9, bh5);
    lo = lo + Math.imul(al8, bl6) | 0;
    mid = mid + Math.imul(al8, bh6) | 0;
    mid = mid + Math.imul(ah8, bl6) | 0;
    hi = hi + Math.imul(ah8, bh6) | 0;
    lo = lo + Math.imul(al7, bl7) | 0;
    mid = mid + Math.imul(al7, bh7) | 0;
    mid = mid + Math.imul(ah7, bl7) | 0;
    hi = hi + Math.imul(ah7, bh7) | 0;
    lo = lo + Math.imul(al6, bl8) | 0;
    mid = mid + Math.imul(al6, bh8) | 0;
    mid = mid + Math.imul(ah6, bl8) | 0;
    hi = hi + Math.imul(ah6, bh8) | 0;
    lo = lo + Math.imul(al5, bl9) | 0;
    mid = mid + Math.imul(al5, bh9) | 0;
    mid = mid + Math.imul(ah5, bl9) | 0;
    hi = hi + Math.imul(ah5, bh9) | 0;
    var w14 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w14 >>> 26) | 0;
    w14 &= 0x3ffffff;
    /* k = 15 */

    lo = Math.imul(al9, bl6);
    mid = Math.imul(al9, bh6);
    mid = mid + Math.imul(ah9, bl6) | 0;
    hi = Math.imul(ah9, bh6);
    lo = lo + Math.imul(al8, bl7) | 0;
    mid = mid + Math.imul(al8, bh7) | 0;
    mid = mid + Math.imul(ah8, bl7) | 0;
    hi = hi + Math.imul(ah8, bh7) | 0;
    lo = lo + Math.imul(al7, bl8) | 0;
    mid = mid + Math.imul(al7, bh8) | 0;
    mid = mid + Math.imul(ah7, bl8) | 0;
    hi = hi + Math.imul(ah7, bh8) | 0;
    lo = lo + Math.imul(al6, bl9) | 0;
    mid = mid + Math.imul(al6, bh9) | 0;
    mid = mid + Math.imul(ah6, bl9) | 0;
    hi = hi + Math.imul(ah6, bh9) | 0;
    var w15 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w15 >>> 26) | 0;
    w15 &= 0x3ffffff;
    /* k = 16 */

    lo = Math.imul(al9, bl7);
    mid = Math.imul(al9, bh7);
    mid = mid + Math.imul(ah9, bl7) | 0;
    hi = Math.imul(ah9, bh7);
    lo = lo + Math.imul(al8, bl8) | 0;
    mid = mid + Math.imul(al8, bh8) | 0;
    mid = mid + Math.imul(ah8, bl8) | 0;
    hi = hi + Math.imul(ah8, bh8) | 0;
    lo = lo + Math.imul(al7, bl9) | 0;
    mid = mid + Math.imul(al7, bh9) | 0;
    mid = mid + Math.imul(ah7, bl9) | 0;
    hi = hi + Math.imul(ah7, bh9) | 0;
    var w16 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w16 >>> 26) | 0;
    w16 &= 0x3ffffff;
    /* k = 17 */

    lo = Math.imul(al9, bl8);
    mid = Math.imul(al9, bh8);
    mid = mid + Math.imul(ah9, bl8) | 0;
    hi = Math.imul(ah9, bh8);
    lo = lo + Math.imul(al8, bl9) | 0;
    mid = mid + Math.imul(al8, bh9) | 0;
    mid = mid + Math.imul(ah8, bl9) | 0;
    hi = hi + Math.imul(ah8, bh9) | 0;
    var w17 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w17 >>> 26) | 0;
    w17 &= 0x3ffffff;
    /* k = 18 */

    lo = Math.imul(al9, bl9);
    mid = Math.imul(al9, bh9);
    mid = mid + Math.imul(ah9, bl9) | 0;
    hi = Math.imul(ah9, bh9);
    var w18 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
    c = (hi + (mid >>> 13) | 0) + (w18 >>> 26) | 0;
    w18 &= 0x3ffffff;
    o[0] = w0;
    o[1] = w1;
    o[2] = w2;
    o[3] = w3;
    o[4] = w4;
    o[5] = w5;
    o[6] = w6;
    o[7] = w7;
    o[8] = w8;
    o[9] = w9;
    o[10] = w10;
    o[11] = w11;
    o[12] = w12;
    o[13] = w13;
    o[14] = w14;
    o[15] = w15;
    o[16] = w16;
    o[17] = w17;
    o[18] = w18;

    if (c !== 0) {
      o[19] = c;
      out.length++;
    }

    return out;
  }; // Polyfill comb


  if (!Math.imul) {
    comb10MulTo = smallMulTo;
  }

  function bigMulTo(self, num, out) {
    out.negative = num.negative ^ self.negative;
    out.length = self.length + num.length;
    var carry = 0;
    var hncarry = 0;

    for (var k = 0; k < out.length - 1; k++) {
      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
      // note that ncarry could be >= 0x3ffffff
      var ncarry = hncarry;
      hncarry = 0;
      var rword = carry & 0x3ffffff;
      var maxJ = Math.min(k, num.length - 1);

      for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
        var i = k - j;
        var a = self.words[i] | 0;
        var b = num.words[j] | 0;
        var r = a * b;
        var lo = r & 0x3ffffff;
        ncarry = ncarry + (r / 0x4000000 | 0) | 0;
        lo = lo + rword | 0;
        rword = lo & 0x3ffffff;
        ncarry = ncarry + (lo >>> 26) | 0;
        hncarry += ncarry >>> 26;
        ncarry &= 0x3ffffff;
      }

      out.words[k] = rword;
      carry = ncarry;
      ncarry = hncarry;
    }

    if (carry !== 0) {
      out.words[k] = carry;
    } else {
      out.length--;
    }

    return out.strip();
  }

  function jumboMulTo(self, num, out) {
    var fftm = new FFTM();
    return fftm.mulp(self, num, out);
  }

  BN.prototype.mulTo = function mulTo(num, out) {
    var res;
    var len = this.length + num.length;

    if (this.length === 10 && num.length === 10) {
      res = comb10MulTo(this, num, out);
    } else if (len < 63) {
      res = smallMulTo(this, num, out);
    } else if (len < 1024) {
      res = bigMulTo(this, num, out);
    } else {
      res = jumboMulTo(this, num, out);
    }

    return res;
  }; // Cooley-Tukey algorithm for FFT
  // slightly revisited to rely on looping instead of recursion


  function FFTM(x, y) {
    this.x = x;
    this.y = y;
  }

  FFTM.prototype.makeRBT = function makeRBT(N) {
    var t = new Array(N);
    var l = BN.prototype._countBits(N) - 1;

    for (var i = 0; i < N; i++) {
      t[i] = this.revBin(i, l, N);
    }

    return t;
  }; // Returns binary-reversed representation of `x`


  FFTM.prototype.revBin = function revBin(x, l, N) {
    if (x === 0 || x === N - 1) return x;
    var rb = 0;

    for (var i = 0; i < l; i++) {
      rb |= (x & 1) << l - i - 1;
      x >>= 1;
    }

    return rb;
  }; // Performs "tweedling" phase, therefore 'emulating'
  // behaviour of the recursive algorithm


  FFTM.prototype.permute = function permute(rbt, rws, iws, rtws, itws, N) {
    for (var i = 0; i < N; i++) {
      rtws[i] = rws[rbt[i]];
      itws[i] = iws[rbt[i]];
    }
  };

  FFTM.prototype.transform = function transform(rws, iws, rtws, itws, N, rbt) {
    this.permute(rbt, rws, iws, rtws, itws, N);

    for (var s = 1; s < N; s <<= 1) {
      var l = s << 1;
      var rtwdf = Math.cos(2 * Math.PI / l);
      var itwdf = Math.sin(2 * Math.PI / l);

      for (var p = 0; p < N; p += l) {
        var rtwdf_ = rtwdf;
        var itwdf_ = itwdf;

        for (var j = 0; j < s; j++) {
          var re = rtws[p + j];
          var ie = itws[p + j];
          var ro = rtws[p + j + s];
          var io = itws[p + j + s];
          var rx = rtwdf_ * ro - itwdf_ * io;
          io = rtwdf_ * io + itwdf_ * ro;
          ro = rx;
          rtws[p + j] = re + ro;
          itws[p + j] = ie + io;
          rtws[p + j + s] = re - ro;
          itws[p + j + s] = ie - io;
          /* jshint maxdepth : false */

          if (j !== l) {
            rx = rtwdf * rtwdf_ - itwdf * itwdf_;
            itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
            rtwdf_ = rx;
          }
        }
      }
    }
  };

  FFTM.prototype.guessLen13b = function guessLen13b(n, m) {
    var N = Math.max(m, n) | 1;
    var odd = N & 1;
    var i = 0;

    for (N = N / 2 | 0; N; N = N >>> 1) {
      i++;
    }

    return 1 << i + 1 + odd;
  };

  FFTM.prototype.conjugate = function conjugate(rws, iws, N) {
    if (N <= 1) return;

    for (var i = 0; i < N / 2; i++) {
      var t = rws[i];
      rws[i] = rws[N - i - 1];
      rws[N - i - 1] = t;
      t = iws[i];
      iws[i] = -iws[N - i - 1];
      iws[N - i - 1] = -t;
    }
  };

  FFTM.prototype.normalize13b = function normalize13b(ws, N) {
    var carry = 0;

    for (var i = 0; i < N / 2; i++) {
      var w = Math.round(ws[2 * i + 1] / N) * 0x2000 + Math.round(ws[2 * i] / N) + carry;
      ws[i] = w & 0x3ffffff;

      if (w < 0x4000000) {
        carry = 0;
      } else {
        carry = w / 0x4000000 | 0;
      }
    }

    return ws;
  };

  FFTM.prototype.convert13b = function convert13b(ws, len, rws, N) {
    var carry = 0;

    for (var i = 0; i < len; i++) {
      carry = carry + (ws[i] | 0);
      rws[2 * i] = carry & 0x1fff;
      carry = carry >>> 13;
      rws[2 * i + 1] = carry & 0x1fff;
      carry = carry >>> 13;
    } // Pad with zeroes


    for (i = 2 * len; i < N; ++i) {
      rws[i] = 0;
    }

    assert(carry === 0);
    assert((carry & ~0x1fff) === 0);
  };

  FFTM.prototype.stub = function stub(N) {
    var ph = new Array(N);

    for (var i = 0; i < N; i++) {
      ph[i] = 0;
    }

    return ph;
  };

  FFTM.prototype.mulp = function mulp(x, y, out) {
    var N = 2 * this.guessLen13b(x.length, y.length);
    var rbt = this.makeRBT(N);

    var _ = this.stub(N);

    var rws = new Array(N);
    var rwst = new Array(N);
    var iwst = new Array(N);
    var nrws = new Array(N);
    var nrwst = new Array(N);
    var niwst = new Array(N);
    var rmws = out.words;
    rmws.length = N;
    this.convert13b(x.words, x.length, rws, N);
    this.convert13b(y.words, y.length, nrws, N);
    this.transform(rws, _, rwst, iwst, N, rbt);
    this.transform(nrws, _, nrwst, niwst, N, rbt);

    for (var i = 0; i < N; i++) {
      var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
      iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
      rwst[i] = rx;
    }

    this.conjugate(rwst, iwst, N);
    this.transform(rwst, iwst, rmws, _, N, rbt);
    this.conjugate(rmws, _, N);
    this.normalize13b(rmws, N);
    out.negative = x.negative ^ y.negative;
    out.length = x.length + y.length;
    return out.strip();
  }; // Multiply `this` by `num`


  BN.prototype.mul = function mul(num) {
    var out = new BN(null);
    out.words = new Array(this.length + num.length);
    return this.mulTo(num, out);
  }; // Multiply employing FFT


  BN.prototype.mulf = function mulf(num) {
    var out = new BN(null);
    out.words = new Array(this.length + num.length);
    return jumboMulTo(this, num, out);
  }; // In-place Multiplication


  BN.prototype.imul = function imul(num) {
    return this.clone().mulTo(num, this);
  };

  BN.prototype.imuln = function imuln(num) {
    assert(typeof num === 'number');
    assert(num < 0x4000000); // Carry

    var carry = 0;

    for (var i = 0; i < this.length; i++) {
      var w = (this.words[i] | 0) * num;
      var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
      carry >>= 26;
      carry += w / 0x4000000 | 0; // NOTE: lo is 27bit maximum

      carry += lo >>> 26;
      this.words[i] = lo & 0x3ffffff;
    }

    if (carry !== 0) {
      this.words[i] = carry;
      this.length++;
    }

    return this;
  };

  BN.prototype.muln = function muln(num) {
    return this.clone().imuln(num);
  }; // `this` * `this`


  BN.prototype.sqr = function sqr() {
    return this.mul(this);
  }; // `this` * `this` in-place


  BN.prototype.isqr = function isqr() {
    return this.imul(this.clone());
  }; // Math.pow(`this`, `num`)


  BN.prototype.pow = function pow(num) {
    var w = toBitArray(num);
    if (w.length === 0) return new BN(1); // Skip leading zeroes

    var res = this;

    for (var i = 0; i < w.length; i++, res = res.sqr()) {
      if (w[i] !== 0) break;
    }

    if (++i < w.length) {
      for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
        if (w[i] === 0) continue;
        res = res.mul(q);
      }
    }

    return res;
  }; // Shift-left in-place


  BN.prototype.iushln = function iushln(bits) {
    assert(typeof bits === 'number' && bits >= 0);
    var r = bits % 26;
    var s = (bits - r) / 26;
    var carryMask = 0x3ffffff >>> 26 - r << 26 - r;
    var i;

    if (r !== 0) {
      var carry = 0;

      for (i = 0; i < this.length; i++) {
        var newCarry = this.words[i] & carryMask;
        var c = (this.words[i] | 0) - newCarry << r;
        this.words[i] = c | carry;
        carry = newCarry >>> 26 - r;
      }

      if (carry) {
        this.words[i] = carry;
        this.length++;
      }
    }

    if (s !== 0) {
      for (i = this.length - 1; i >= 0; i--) {
        this.words[i + s] = this.words[i];
      }

      for (i = 0; i < s; i++) {
        this.words[i] = 0;
      }

      this.length += s;
    }

    return this.strip();
  };

  BN.prototype.ishln = function ishln(bits) {
    // TODO(indutny): implement me
    assert(this.negative === 0);
    return this.iushln(bits);
  }; // Shift-right in-place
  // NOTE: `hint` is a lowest bit before trailing zeroes
  // NOTE: if `extended` is present - it will be filled with destroyed bits


  BN.prototype.iushrn = function iushrn(bits, hint, extended) {
    assert(typeof bits === 'number' && bits >= 0);
    var h;

    if (hint) {
      h = (hint - hint % 26) / 26;
    } else {
      h = 0;
    }

    var r = bits % 26;
    var s = Math.min((bits - r) / 26, this.length);
    var mask = 0x3ffffff ^ 0x3ffffff >>> r << r;
    var maskedWords = extended;
    h -= s;
    h = Math.max(0, h); // Extended mode, copy masked part

    if (maskedWords) {
      for (var i = 0; i < s; i++) {
        maskedWords.words[i] = this.words[i];
      }

      maskedWords.length = s;
    }

    if (s === 0) {// No-op, we should not move anything at all
    } else if (this.length > s) {
      this.length -= s;

      for (i = 0; i < this.length; i++) {
        this.words[i] = this.words[i + s];
      }
    } else {
      this.words[0] = 0;
      this.length = 1;
    }

    var carry = 0;

    for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
      var word = this.words[i] | 0;
      this.words[i] = carry << 26 - r | word >>> r;
      carry = word & mask;
    } // Push carried bits as a mask


    if (maskedWords && carry !== 0) {
      maskedWords.words[maskedWords.length++] = carry;
    }

    if (this.length === 0) {
      this.words[0] = 0;
      this.length = 1;
    }

    return this.strip();
  };

  BN.prototype.ishrn = function ishrn(bits, hint, extended) {
    // TODO(indutny): implement me
    assert(this.negative === 0);
    return this.iushrn(bits, hint, extended);
  }; // Shift-left


  BN.prototype.shln = function shln(bits) {
    return this.clone().ishln(bits);
  };

  BN.prototype.ushln = function ushln(bits) {
    return this.clone().iushln(bits);
  }; // Shift-right


  BN.prototype.shrn = function shrn(bits) {
    return this.clone().ishrn(bits);
  };

  BN.prototype.ushrn = function ushrn(bits) {
    return this.clone().iushrn(bits);
  }; // Test if n bit is set


  BN.prototype.testn = function testn(bit) {
    assert(typeof bit === 'number' && bit >= 0);
    var r = bit % 26;
    var s = (bit - r) / 26;
    var q = 1 << r; // Fast case: bit is much higher than all existing words

    if (this.length <= s) return false; // Check bit and return

    var w = this.words[s];
    return !!(w & q);
  }; // Return only lowers bits of number (in-place)


  BN.prototype.imaskn = function imaskn(bits) {
    assert(typeof bits === 'number' && bits >= 0);
    var r = bits % 26;
    var s = (bits - r) / 26;
    assert(this.negative === 0, 'imaskn works only with positive numbers');

    if (this.length <= s) {
      return this;
    }

    if (r !== 0) {
      s++;
    }

    this.length = Math.min(s, this.length);

    if (r !== 0) {
      var mask = 0x3ffffff ^ 0x3ffffff >>> r << r;
      this.words[this.length - 1] &= mask;
    }

    return this.strip();
  }; // Return only lowers bits of number


  BN.prototype.maskn = function maskn(bits) {
    return this.clone().imaskn(bits);
  }; // Add plain number `num` to `this`


  BN.prototype.iaddn = function iaddn(num) {
    assert(typeof num === 'number');
    assert(num < 0x4000000);
    if (num < 0) return this.isubn(-num); // Possible sign change

    if (this.negative !== 0) {
      if (this.length === 1 && (this.words[0] | 0) < num) {
        this.words[0] = num - (this.words[0] | 0);
        this.negative = 0;
        return this;
      }

      this.negative = 0;
      this.isubn(num);
      this.negative = 1;
      return this;
    } // Add without checks


    return this._iaddn(num);
  };

  BN.prototype._iaddn = function _iaddn(num) {
    this.words[0] += num; // Carry

    for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
      this.words[i] -= 0x4000000;

      if (i === this.length - 1) {
        this.words[i + 1] = 1;
      } else {
        this.words[i + 1]++;
      }
    }

    this.length = Math.max(this.length, i + 1);
    return this;
  }; // Subtract plain number `num` from `this`


  BN.prototype.isubn = function isubn(num) {
    assert(typeof num === 'number');
    assert(num < 0x4000000);
    if (num < 0) return this.iaddn(-num);

    if (this.negative !== 0) {
      this.negative = 0;
      this.iaddn(num);
      this.negative = 1;
      return this;
    }

    this.words[0] -= num;

    if (this.length === 1 && this.words[0] < 0) {
      this.words[0] = -this.words[0];
      this.negative = 1;
    } else {
      // Carry
      for (var i = 0; i < this.length && this.words[i] < 0; i++) {
        this.words[i] += 0x4000000;
        this.words[i + 1] -= 1;
      }
    }

    return this.strip();
  };

  BN.prototype.addn = function addn(num) {
    return this.clone().iaddn(num);
  };

  BN.prototype.subn = function subn(num) {
    return this.clone().isubn(num);
  };

  BN.prototype.iabs = function iabs() {
    this.negative = 0;
    return this;
  };

  BN.prototype.abs = function abs() {
    return this.clone().iabs();
  };

  BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
    var len = num.length + shift;
    var i;

    this._expand(len);

    var w;
    var carry = 0;

    for (i = 0; i < num.length; i++) {
      w = (this.words[i + shift] | 0) + carry;
      var right = (num.words[i] | 0) * mul;
      w -= right & 0x3ffffff;
      carry = (w >> 26) - (right / 0x4000000 | 0);
      this.words[i + shift] = w & 0x3ffffff;
    }

    for (; i < this.length - shift; i++) {
      w = (this.words[i + shift] | 0) + carry;
      carry = w >> 26;
      this.words[i + shift] = w & 0x3ffffff;
    }

    if (carry === 0) return this.strip(); // Subtraction overflow

    assert(carry === -1);
    carry = 0;

    for (i = 0; i < this.length; i++) {
      w = -(this.words[i] | 0) + carry;
      carry = w >> 26;
      this.words[i] = w & 0x3ffffff;
    }

    this.negative = 1;
    return this.strip();
  };

  BN.prototype._wordDiv = function _wordDiv(num, mode) {
    var shift = this.length - num.length;
    var a = this.clone();
    var b = num; // Normalize

    var bhi = b.words[b.length - 1] | 0;

    var bhiBits = this._countBits(bhi);

    shift = 26 - bhiBits;

    if (shift !== 0) {
      b = b.ushln(shift);
      a.iushln(shift);
      bhi = b.words[b.length - 1] | 0;
    } // Initialize quotient


    var m = a.length - b.length;
    var q;

    if (mode !== 'mod') {
      q = new BN(null);
      q.length = m + 1;
      q.words = new Array(q.length);

      for (var i = 0; i < q.length; i++) {
        q.words[i] = 0;
      }
    }

    var diff = a.clone()._ishlnsubmul(b, 1, m);

    if (diff.negative === 0) {
      a = diff;

      if (q) {
        q.words[m] = 1;
      }
    }

    for (var j = m - 1; j >= 0; j--) {
      var qj = (a.words[b.length + j] | 0) * 0x4000000 + (a.words[b.length + j - 1] | 0); // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
      // (0x7ffffff)

      qj = Math.min(qj / bhi | 0, 0x3ffffff);

      a._ishlnsubmul(b, qj, j);

      while (a.negative !== 0) {
        qj--;
        a.negative = 0;

        a._ishlnsubmul(b, 1, j);

        if (!a.isZero()) {
          a.negative ^= 1;
        }
      }

      if (q) {
        q.words[j] = qj;
      }
    }

    if (q) {
      q.strip();
    }

    a.strip(); // Denormalize

    if (mode !== 'div' && shift !== 0) {
      a.iushrn(shift);
    }

    return {
      div: q || null,
      mod: a
    };
  }; // NOTE: 1) `mode` can be set to `mod` to request mod only,
  //       to `div` to request div only, or be absent to
  //       request both div & mod
  //       2) `positive` is true if unsigned mod is requested


  BN.prototype.divmod = function divmod(num, mode, positive) {
    assert(!num.isZero());

    if (this.isZero()) {
      return {
        div: new BN(0),
        mod: new BN(0)
      };
    }

    var div, mod, res;

    if (this.negative !== 0 && num.negative === 0) {
      res = this.neg().divmod(num, mode);

      if (mode !== 'mod') {
        div = res.div.neg();
      }

      if (mode !== 'div') {
        mod = res.mod.neg();

        if (positive && mod.negative !== 0) {
          mod.iadd(num);
        }
      }

      return {
        div: div,
        mod: mod
      };
    }

    if (this.negative === 0 && num.negative !== 0) {
      res = this.divmod(num.neg(), mode);

      if (mode !== 'mod') {
        div = res.div.neg();
      }

      return {
        div: div,
        mod: res.mod
      };
    }

    if ((this.negative & num.negative) !== 0) {
      res = this.neg().divmod(num.neg(), mode);

      if (mode !== 'div') {
        mod = res.mod.neg();

        if (positive && mod.negative !== 0) {
          mod.isub(num);
        }
      }

      return {
        div: res.div,
        mod: mod
      };
    } // Both numbers are positive at this point
    // Strip both numbers to approximate shift value


    if (num.length > this.length || this.cmp(num) < 0) {
      return {
        div: new BN(0),
        mod: this
      };
    } // Very short reduction


    if (num.length === 1) {
      if (mode === 'div') {
        return {
          div: this.divn(num.words[0]),
          mod: null
        };
      }

      if (mode === 'mod') {
        return {
          div: null,
          mod: new BN(this.modn(num.words[0]))
        };
      }

      return {
        div: this.divn(num.words[0]),
        mod: new BN(this.modn(num.words[0]))
      };
    }

    return this._wordDiv(num, mode);
  }; // Find `this` / `num`


  BN.prototype.div = function div(num) {
    return this.divmod(num, 'div', false).div;
  }; // Find `this` % `num`


  BN.prototype.mod = function mod(num) {
    return this.divmod(num, 'mod', false).mod;
  };

  BN.prototype.umod = function umod(num) {
    return this.divmod(num, 'mod', true).mod;
  }; // Find Round(`this` / `num`)


  BN.prototype.divRound = function divRound(num) {
    var dm = this.divmod(num); // Fast case - exact division

    if (dm.mod.isZero()) return dm.div;
    var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;
    var half = num.ushrn(1);
    var r2 = num.andln(1);
    var cmp = mod.cmp(half); // Round down

    if (cmp < 0 || r2 === 1 && cmp === 0) return dm.div; // Round up

    return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
  };

  BN.prototype.modn = function modn(num) {
    assert(num <= 0x3ffffff);
    var p = (1 << 26) % num;
    var acc = 0;

    for (var i = this.length - 1; i >= 0; i--) {
      acc = (p * acc + (this.words[i] | 0)) % num;
    }

    return acc;
  }; // In-place division by number


  BN.prototype.idivn = function idivn(num) {
    assert(num <= 0x3ffffff);
    var carry = 0;

    for (var i = this.length - 1; i >= 0; i--) {
      var w = (this.words[i] | 0) + carry * 0x4000000;
      this.words[i] = w / num | 0;
      carry = w % num;
    }

    return this.strip();
  };

  BN.prototype.divn = function divn(num) {
    return this.clone().idivn(num);
  };

  BN.prototype.egcd = function egcd(p) {
    assert(p.negative === 0);
    assert(!p.isZero());
    var x = this;
    var y = p.clone();

    if (x.negative !== 0) {
      x = x.umod(p);
    } else {
      x = x.clone();
    } // A * x + B * y = x


    var A = new BN(1);
    var B = new BN(0); // C * x + D * y = y

    var C = new BN(0);
    var D = new BN(1);
    var g = 0;

    while (x.isEven() && y.isEven()) {
      x.iushrn(1);
      y.iushrn(1);
      ++g;
    }

    var yp = y.clone();
    var xp = x.clone();

    while (!x.isZero()) {
      for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1) {
        ;
      }

      if (i > 0) {
        x.iushrn(i);

        while (i-- > 0) {
          if (A.isOdd() || B.isOdd()) {
            A.iadd(yp);
            B.isub(xp);
          }

          A.iushrn(1);
          B.iushrn(1);
        }
      }

      for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1) {
        ;
      }

      if (j > 0) {
        y.iushrn(j);

        while (j-- > 0) {
          if (C.isOdd() || D.isOdd()) {
            C.iadd(yp);
            D.isub(xp);
          }

          C.iushrn(1);
          D.iushrn(1);
        }
      }

      if (x.cmp(y) >= 0) {
        x.isub(y);
        A.isub(C);
        B.isub(D);
      } else {
        y.isub(x);
        C.isub(A);
        D.isub(B);
      }
    }

    return {
      a: C,
      b: D,
      gcd: y.iushln(g)
    };
  }; // This is reduced incarnation of the binary EEA
  // above, designated to invert members of the
  // _prime_ fields F(p) at a maximal speed


  BN.prototype._invmp = function _invmp(p) {
    assert(p.negative === 0);
    assert(!p.isZero());
    var a = this;
    var b = p.clone();

    if (a.negative !== 0) {
      a = a.umod(p);
    } else {
      a = a.clone();
    }

    var x1 = new BN(1);
    var x2 = new BN(0);
    var delta = b.clone();

    while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
      for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1) {
        ;
      }

      if (i > 0) {
        a.iushrn(i);

        while (i-- > 0) {
          if (x1.isOdd()) {
            x1.iadd(delta);
          }

          x1.iushrn(1);
        }
      }

      for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1) {
        ;
      }

      if (j > 0) {
        b.iushrn(j);

        while (j-- > 0) {
          if (x2.isOdd()) {
            x2.iadd(delta);
          }

          x2.iushrn(1);
        }
      }

      if (a.cmp(b) >= 0) {
        a.isub(b);
        x1.isub(x2);
      } else {
        b.isub(a);
        x2.isub(x1);
      }
    }

    var res;

    if (a.cmpn(1) === 0) {
      res = x1;
    } else {
      res = x2;
    }

    if (res.cmpn(0) < 0) {
      res.iadd(p);
    }

    return res;
  };

  BN.prototype.gcd = function gcd(num) {
    if (this.isZero()) return num.abs();
    if (num.isZero()) return this.abs();
    var a = this.clone();
    var b = num.clone();
    a.negative = 0;
    b.negative = 0; // Remove common factor of two

    for (var shift = 0; a.isEven() && b.isEven(); shift++) {
      a.iushrn(1);
      b.iushrn(1);
    }

    do {
      while (a.isEven()) {
        a.iushrn(1);
      }

      while (b.isEven()) {
        b.iushrn(1);
      }

      var r = a.cmp(b);

      if (r < 0) {
        // Swap `a` and `b` to make `a` always bigger than `b`
        var t = a;
        a = b;
        b = t;
      } else if (r === 0 || b.cmpn(1) === 0) {
        break;
      }

      a.isub(b);
    } while (true);

    return b.iushln(shift);
  }; // Invert number in the field F(num)


  BN.prototype.invm = function invm(num) {
    return this.egcd(num).a.umod(num);
  };

  BN.prototype.isEven = function isEven() {
    return (this.words[0] & 1) === 0;
  };

  BN.prototype.isOdd = function isOdd() {
    return (this.words[0] & 1) === 1;
  }; // And first word and num


  BN.prototype.andln = function andln(num) {
    return this.words[0] & num;
  }; // Increment at the bit position in-line


  BN.prototype.bincn = function bincn(bit) {
    assert(typeof bit === 'number');
    var r = bit % 26;
    var s = (bit - r) / 26;
    var q = 1 << r; // Fast case: bit is much higher than all existing words

    if (this.length <= s) {
      this._expand(s + 1);

      this.words[s] |= q;
      return this;
    } // Add bit and propagate, if needed


    var carry = q;

    for (var i = s; carry !== 0 && i < this.length; i++) {
      var w = this.words[i] | 0;
      w += carry;
      carry = w >>> 26;
      w &= 0x3ffffff;
      this.words[i] = w;
    }

    if (carry !== 0) {
      this.words[i] = carry;
      this.length++;
    }

    return this;
  };

  BN.prototype.isZero = function isZero() {
    return this.length === 1 && this.words[0] === 0;
  };

  BN.prototype.cmpn = function cmpn(num) {
    var negative = num < 0;
    if (this.negative !== 0 && !negative) return -1;
    if (this.negative === 0 && negative) return 1;
    this.strip();
    var res;

    if (this.length > 1) {
      res = 1;
    } else {
      if (negative) {
        num = -num;
      }

      assert(num <= 0x3ffffff, 'Number is too big');
      var w = this.words[0] | 0;
      res = w === num ? 0 : w < num ? -1 : 1;
    }

    if (this.negative !== 0) return -res | 0;
    return res;
  }; // Compare two numbers and return:
  // 1 - if `this` > `num`
  // 0 - if `this` == `num`
  // -1 - if `this` < `num`


  BN.prototype.cmp = function cmp(num) {
    if (this.negative !== 0 && num.negative === 0) return -1;
    if (this.negative === 0 && num.negative !== 0) return 1;
    var res = this.ucmp(num);
    if (this.negative !== 0) return -res | 0;
    return res;
  }; // Unsigned comparison


  BN.prototype.ucmp = function ucmp(num) {
    // At this point both numbers have the same sign
    if (this.length > num.length) return 1;
    if (this.length < num.length) return -1;
    var res = 0;

    for (var i = this.length - 1; i >= 0; i--) {
      var a = this.words[i] | 0;
      var b = num.words[i] | 0;
      if (a === b) continue;

      if (a < b) {
        res = -1;
      } else if (a > b) {
        res = 1;
      }

      break;
    }

    return res;
  };

  BN.prototype.gtn = function gtn(num) {
    return this.cmpn(num) === 1;
  };

  BN.prototype.gt = function gt(num) {
    return this.cmp(num) === 1;
  };

  BN.prototype.gten = function gten(num) {
    return this.cmpn(num) >= 0;
  };

  BN.prototype.gte = function gte(num) {
    return this.cmp(num) >= 0;
  };

  BN.prototype.ltn = function ltn(num) {
    return this.cmpn(num) === -1;
  };

  BN.prototype.lt = function lt(num) {
    return this.cmp(num) === -1;
  };

  BN.prototype.lten = function lten(num) {
    return this.cmpn(num) <= 0;
  };

  BN.prototype.lte = function lte(num) {
    return this.cmp(num) <= 0;
  };

  BN.prototype.eqn = function eqn(num) {
    return this.cmpn(num) === 0;
  };

  BN.prototype.eq = function eq(num) {
    return this.cmp(num) === 0;
  }; //
  // A reduce context, could be using montgomery or something better, depending
  // on the `m` itself.
  //


  BN.red = function red(num) {
    return new Red(num);
  };

  BN.prototype.toRed = function toRed(ctx) {
    assert(!this.red, 'Already a number in reduction context');
    assert(this.negative === 0, 'red works only with positives');
    return ctx.convertTo(this)._forceRed(ctx);
  };

  BN.prototype.fromRed = function fromRed() {
    assert(this.red, 'fromRed works only with numbers in reduction context');
    return this.red.convertFrom(this);
  };

  BN.prototype._forceRed = function _forceRed(ctx) {
    this.red = ctx;
    return this;
  };

  BN.prototype.forceRed = function forceRed(ctx) {
    assert(!this.red, 'Already a number in reduction context');
    return this._forceRed(ctx);
  };

  BN.prototype.redAdd = function redAdd(num) {
    assert(this.red, 'redAdd works only with red numbers');
    return this.red.add(this, num);
  };

  BN.prototype.redIAdd = function redIAdd(num) {
    assert(this.red, 'redIAdd works only with red numbers');
    return this.red.iadd(this, num);
  };

  BN.prototype.redSub = function redSub(num) {
    assert(this.red, 'redSub works only with red numbers');
    return this.red.sub(this, num);
  };

  BN.prototype.redISub = function redISub(num) {
    assert(this.red, 'redISub works only with red numbers');
    return this.red.isub(this, num);
  };

  BN.prototype.redShl = function redShl(num) {
    assert(this.red, 'redShl works only with red numbers');
    return this.red.shl(this, num);
  };

  BN.prototype.redMul = function redMul(num) {
    assert(this.red, 'redMul works only with red numbers');

    this.red._verify2(this, num);

    return this.red.mul(this, num);
  };

  BN.prototype.redIMul = function redIMul(num) {
    assert(this.red, 'redMul works only with red numbers');

    this.red._verify2(this, num);

    return this.red.imul(this, num);
  };

  BN.prototype.redSqr = function redSqr() {
    assert(this.red, 'redSqr works only with red numbers');

    this.red._verify1(this);

    return this.red.sqr(this);
  };

  BN.prototype.redISqr = function redISqr() {
    assert(this.red, 'redISqr works only with red numbers');

    this.red._verify1(this);

    return this.red.isqr(this);
  }; // Square root over p


  BN.prototype.redSqrt = function redSqrt() {
    assert(this.red, 'redSqrt works only with red numbers');

    this.red._verify1(this);

    return this.red.sqrt(this);
  };

  BN.prototype.redInvm = function redInvm() {
    assert(this.red, 'redInvm works only with red numbers');

    this.red._verify1(this);

    return this.red.invm(this);
  }; // Return negative clone of `this` % `red modulo`


  BN.prototype.redNeg = function redNeg() {
    assert(this.red, 'redNeg works only with red numbers');

    this.red._verify1(this);

    return this.red.neg(this);
  };

  BN.prototype.redPow = function redPow(num) {
    assert(this.red && !num.red, 'redPow(normalNum)');

    this.red._verify1(this);

    return this.red.pow(this, num);
  }; // Prime numbers with efficient reduction


  var primes = {
    k256: null,
    p224: null,
    p192: null,
    p25519: null
  }; // Pseudo-Mersenne prime

  function MPrime(name, p) {
    // P = 2 ^ N - K
    this.name = name;
    this.p = new BN(p, 16);
    this.n = this.p.bitLength();
    this.k = new BN(1).iushln(this.n).isub(this.p);
    this.tmp = this._tmp();
  }

  MPrime.prototype._tmp = function _tmp() {
    var tmp = new BN(null);
    tmp.words = new Array(Math.ceil(this.n / 13));
    return tmp;
  };

  MPrime.prototype.ireduce = function ireduce(num) {
    // Assumes that `num` is less than `P^2`
    // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
    var r = num;
    var rlen;

    do {
      this.split(r, this.tmp);
      r = this.imulK(r);
      r = r.iadd(this.tmp);
      rlen = r.bitLength();
    } while (rlen > this.n);

    var cmp = rlen < this.n ? -1 : r.ucmp(this.p);

    if (cmp === 0) {
      r.words[0] = 0;
      r.length = 1;
    } else if (cmp > 0) {
      r.isub(this.p);
    } else {
      r.strip();
    }

    return r;
  };

  MPrime.prototype.split = function split(input, out) {
    input.iushrn(this.n, 0, out);
  };

  MPrime.prototype.imulK = function imulK(num) {
    return num.imul(this.k);
  };

  function K256() {
    MPrime.call(this, 'k256', 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
  }

  inherits(K256, MPrime);

  K256.prototype.split = function split(input, output) {
    // 256 = 9 * 26 + 22
    var mask = 0x3fffff;
    var outLen = Math.min(input.length, 9);

    for (var i = 0; i < outLen; i++) {
      output.words[i] = input.words[i];
    }

    output.length = outLen;

    if (input.length <= 9) {
      input.words[0] = 0;
      input.length = 1;
      return;
    } // Shift by 9 limbs


    var prev = input.words[9];
    output.words[output.length++] = prev & mask;

    for (i = 10; i < input.length; i++) {
      var next = input.words[i] | 0;
      input.words[i - 10] = (next & mask) << 4 | prev >>> 22;
      prev = next;
    }

    prev >>>= 22;
    input.words[i - 10] = prev;

    if (prev === 0 && input.length > 10) {
      input.length -= 10;
    } else {
      input.length -= 9;
    }
  };

  K256.prototype.imulK = function imulK(num) {
    // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
    num.words[num.length] = 0;
    num.words[num.length + 1] = 0;
    num.length += 2; // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390

    var lo = 0;

    for (var i = 0; i < num.length; i++) {
      var w = num.words[i] | 0;
      lo += w * 0x3d1;
      num.words[i] = lo & 0x3ffffff;
      lo = w * 0x40 + (lo / 0x4000000 | 0);
    } // Fast length reduction


    if (num.words[num.length - 1] === 0) {
      num.length--;

      if (num.words[num.length - 1] === 0) {
        num.length--;
      }
    }

    return num;
  };

  function P224() {
    MPrime.call(this, 'p224', 'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
  }

  inherits(P224, MPrime);

  function P192() {
    MPrime.call(this, 'p192', 'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
  }

  inherits(P192, MPrime);

  function P25519() {
    // 2 ^ 255 - 19
    MPrime.call(this, '25519', '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
  }

  inherits(P25519, MPrime);

  P25519.prototype.imulK = function imulK(num) {
    // K = 0x13
    var carry = 0;

    for (var i = 0; i < num.length; i++) {
      var hi = (num.words[i] | 0) * 0x13 + carry;
      var lo = hi & 0x3ffffff;
      hi >>>= 26;
      num.words[i] = lo;
      carry = hi;
    }

    if (carry !== 0) {
      num.words[num.length++] = carry;
    }

    return num;
  }; // Exported mostly for testing purposes, use plain name instead


  BN._prime = function prime(name) {
    // Cached version of prime
    if (primes[name]) return primes[name];
    var prime;

    if (name === 'k256') {
      prime = new K256();
    } else if (name === 'p224') {
      prime = new P224();
    } else if (name === 'p192') {
      prime = new P192();
    } else if (name === 'p25519') {
      prime = new P25519();
    } else {
      throw new Error('Unknown prime ' + name);
    }

    primes[name] = prime;
    return prime;
  }; //
  // Base reduction engine
  //


  function Red(m) {
    if (typeof m === 'string') {
      var prime = BN._prime(m);

      this.m = prime.p;
      this.prime = prime;
    } else {
      assert(m.gtn(1), 'modulus must be greater than 1');
      this.m = m;
      this.prime = null;
    }
  }

  Red.prototype._verify1 = function _verify1(a) {
    assert(a.negative === 0, 'red works only with positives');
    assert(a.red, 'red works only with red numbers');
  };

  Red.prototype._verify2 = function _verify2(a, b) {
    assert((a.negative | b.negative) === 0, 'red works only with positives');
    assert(a.red && a.red === b.red, 'red works only with red numbers');
  };

  Red.prototype.imod = function imod(a) {
    if (this.prime) return this.prime.ireduce(a)._forceRed(this);
    return a.umod(this.m)._forceRed(this);
  };

  Red.prototype.neg = function neg(a) {
    if (a.isZero()) {
      return a.clone();
    }

    return this.m.sub(a)._forceRed(this);
  };

  Red.prototype.add = function add(a, b) {
    this._verify2(a, b);

    var res = a.add(b);

    if (res.cmp(this.m) >= 0) {
      res.isub(this.m);
    }

    return res._forceRed(this);
  };

  Red.prototype.iadd = function iadd(a, b) {
    this._verify2(a, b);

    var res = a.iadd(b);

    if (res.cmp(this.m) >= 0) {
      res.isub(this.m);
    }

    return res;
  };

  Red.prototype.sub = function sub(a, b) {
    this._verify2(a, b);

    var res = a.sub(b);

    if (res.cmpn(0) < 0) {
      res.iadd(this.m);
    }

    return res._forceRed(this);
  };

  Red.prototype.isub = function isub(a, b) {
    this._verify2(a, b);

    var res = a.isub(b);

    if (res.cmpn(0) < 0) {
      res.iadd(this.m);
    }

    return res;
  };

  Red.prototype.shl = function shl(a, num) {
    this._verify1(a);

    return this.imod(a.ushln(num));
  };

  Red.prototype.imul = function imul(a, b) {
    this._verify2(a, b);

    return this.imod(a.imul(b));
  };

  Red.prototype.mul = function mul(a, b) {
    this._verify2(a, b);

    return this.imod(a.mul(b));
  };

  Red.prototype.isqr = function isqr(a) {
    return this.imul(a, a.clone());
  };

  Red.prototype.sqr = function sqr(a) {
    return this.mul(a, a);
  };

  Red.prototype.sqrt = function sqrt(a) {
    if (a.isZero()) return a.clone();
    var mod3 = this.m.andln(3);
    assert(mod3 % 2 === 1); // Fast case

    if (mod3 === 3) {
      var pow = this.m.add(new BN(1)).iushrn(2);
      return this.pow(a, pow);
    } // Tonelli-Shanks algorithm (Totally unoptimized and slow)
    //
    // Find Q and S, that Q * 2 ^ S = (P - 1)


    var q = this.m.subn(1);
    var s = 0;

    while (!q.isZero() && q.andln(1) === 0) {
      s++;
      q.iushrn(1);
    }

    assert(!q.isZero());
    var one = new BN(1).toRed(this);
    var nOne = one.redNeg(); // Find quadratic non-residue
    // NOTE: Max is such because of generalized Riemann hypothesis.

    var lpow = this.m.subn(1).iushrn(1);
    var z = this.m.bitLength();
    z = new BN(2 * z * z).toRed(this);

    while (this.pow(z, lpow).cmp(nOne) !== 0) {
      z.redIAdd(nOne);
    }

    var c = this.pow(z, q);
    var r = this.pow(a, q.addn(1).iushrn(1));
    var t = this.pow(a, q);
    var m = s;

    while (t.cmp(one) !== 0) {
      var tmp = t;

      for (var i = 0; tmp.cmp(one) !== 0; i++) {
        tmp = tmp.redSqr();
      }

      assert(i < m);
      var b = this.pow(c, new BN(1).iushln(m - i - 1));
      r = r.redMul(b);
      c = b.redSqr();
      t = t.redMul(c);
      m = i;
    }

    return r;
  };

  Red.prototype.invm = function invm(a) {
    var inv = a._invmp(this.m);

    if (inv.negative !== 0) {
      inv.negative = 0;
      return this.imod(inv).redNeg();
    } else {
      return this.imod(inv);
    }
  };

  Red.prototype.pow = function pow(a, num) {
    if (num.isZero()) return new BN(1);
    if (num.cmpn(1) === 0) return a.clone();
    var windowSize = 4;
    var wnd = new Array(1 << windowSize);
    wnd[0] = new BN(1).toRed(this);
    wnd[1] = a;

    for (var i = 2; i < wnd.length; i++) {
      wnd[i] = this.mul(wnd[i - 1], a);
    }

    var res = wnd[0];
    var current = 0;
    var currentLen = 0;
    var start = num.bitLength() % 26;

    if (start === 0) {
      start = 26;
    }

    for (i = num.length - 1; i >= 0; i--) {
      var word = num.words[i];

      for (var j = start - 1; j >= 0; j--) {
        var bit = word >> j & 1;

        if (res !== wnd[0]) {
          res = this.sqr(res);
        }

        if (bit === 0 && current === 0) {
          currentLen = 0;
          continue;
        }

        current <<= 1;
        current |= bit;
        currentLen++;
        if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;
        res = this.mul(res, wnd[current]);
        currentLen = 0;
        current = 0;
      }

      start = 26;
    }

    return res;
  };

  Red.prototype.convertTo = function convertTo(num) {
    var r = num.umod(this.m);
    return r === num ? r.clone() : r;
  };

  Red.prototype.convertFrom = function convertFrom(num) {
    var res = num.clone();
    res.red = null;
    return res;
  }; //
  // Montgomery method engine
  //


  BN.mont = function mont(num) {
    return new Mont(num);
  };

  function Mont(m) {
    Red.call(this, m);
    this.shift = this.m.bitLength();

    if (this.shift % 26 !== 0) {
      this.shift += 26 - this.shift % 26;
    }

    this.r = new BN(1).iushln(this.shift);
    this.r2 = this.imod(this.r.sqr());
    this.rinv = this.r._invmp(this.m);
    this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
    this.minv = this.minv.umod(this.r);
    this.minv = this.r.sub(this.minv);
  }

  inherits(Mont, Red);

  Mont.prototype.convertTo = function convertTo(num) {
    return this.imod(num.ushln(this.shift));
  };

  Mont.prototype.convertFrom = function convertFrom(num) {
    var r = this.imod(num.mul(this.rinv));
    r.red = null;
    return r;
  };

  Mont.prototype.imul = function imul(a, b) {
    if (a.isZero() || b.isZero()) {
      a.words[0] = 0;
      a.length = 1;
      return a;
    }

    var t = a.imul(b);
    var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
    var u = t.isub(c).iushrn(this.shift);
    var res = u;

    if (u.cmp(this.m) >= 0) {
      res = u.isub(this.m);
    } else if (u.cmpn(0) < 0) {
      res = u.iadd(this.m);
    }

    return res._forceRed(this);
  };

  Mont.prototype.mul = function mul(a, b) {
    if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);
    var t = a.mul(b);
    var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
    var u = t.isub(c).iushrn(this.shift);
    var res = u;

    if (u.cmp(this.m) >= 0) {
      res = u.isub(this.m);
    } else if (u.cmpn(0) < 0) {
      res = u.iadd(this.m);
    }

    return res._forceRed(this);
  };

  Mont.prototype.invm = function invm(a) {
    // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
    var res = this.imod(a._invmp(this.m).mul(this.r2));
    return res._forceRed(this);
  };
})(typeof module === 'undefined' || module, void 0);

},{}],56:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Returns a `Boolean` on whether or not the a `String` starts with '0x'
 * @param {String} str the string input value
 * @return {Boolean} a boolean if it is or is not hex prefixed
 * @throws if the str input is not a string
 */
module.exports = function isHexPrefixed(str) {
  if (typeof str !== 'string') {
    throw new Error("[is-hex-prefixed] value must be type 'string', is currently type " + _typeof(str) + ", while checking isHexPrefixed.");
  }

  return str.slice(0, 2) === '0x';
};

},{}],57:[function(require,module,exports){
(function (process,global){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * [js-sha3]{@link https://github.com/emn178/js-sha3}
 *
 * @version 0.8.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2015-2018
 * @license MIT
 */

/*jslint bitwise: true */
(function () {
  'use strict';

  var INPUT_ERROR = 'input is invalid type';
  var FINALIZE_ERROR = 'finalize already called';
  var WINDOW = (typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object';
  var root = WINDOW ? window : {};

  if (root.JS_SHA3_NO_WINDOW) {
    WINDOW = false;
  }

  var WEB_WORKER = !WINDOW && (typeof self === "undefined" ? "undefined" : _typeof(self)) === 'object';
  var NODE_JS = !root.JS_SHA3_NO_NODE_JS && (typeof process === "undefined" ? "undefined" : _typeof(process)) === 'object' && process.versions && process.versions.node;

  if (NODE_JS) {
    root = global;
  } else if (WEB_WORKER) {
    root = self;
  }

  var COMMON_JS = !root.JS_SHA3_NO_COMMON_JS && (typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object' && module.exports;
  var AMD = typeof define === 'function' && define.amd;
  var ARRAY_BUFFER = !root.JS_SHA3_NO_ARRAY_BUFFER && typeof ArrayBuffer !== 'undefined';
  var HEX_CHARS = '0123456789abcdef'.split('');
  var SHAKE_PADDING = [31, 7936, 2031616, 520093696];
  var CSHAKE_PADDING = [4, 1024, 262144, 67108864];
  var KECCAK_PADDING = [1, 256, 65536, 16777216];
  var PADDING = [6, 1536, 393216, 100663296];
  var SHIFT = [0, 8, 16, 24];
  var RC = [1, 0, 32898, 0, 32906, 2147483648, 2147516416, 2147483648, 32907, 0, 2147483649, 0, 2147516545, 2147483648, 32777, 2147483648, 138, 0, 136, 0, 2147516425, 0, 2147483658, 0, 2147516555, 0, 139, 2147483648, 32905, 2147483648, 32771, 2147483648, 32770, 2147483648, 128, 2147483648, 32778, 0, 2147483658, 2147483648, 2147516545, 2147483648, 32896, 2147483648, 2147483649, 0, 2147516424, 2147483648];
  var BITS = [224, 256, 384, 512];
  var SHAKE_BITS = [128, 256];
  var OUTPUT_TYPES = ['hex', 'buffer', 'arrayBuffer', 'array', 'digest'];
  var CSHAKE_BYTEPAD = {
    '128': 168,
    '256': 136
  };

  if (root.JS_SHA3_NO_NODE_JS || !Array.isArray) {
    Array.isArray = function (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    };
  }

  if (ARRAY_BUFFER && (root.JS_SHA3_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
    ArrayBuffer.isView = function (obj) {
      return _typeof(obj) === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer;
    };
  }

  var createOutputMethod = function createOutputMethod(bits, padding, outputType) {
    return function (message) {
      return new Keccak(bits, padding, bits).update(message)[outputType]();
    };
  };

  var createShakeOutputMethod = function createShakeOutputMethod(bits, padding, outputType) {
    return function (message, outputBits) {
      return new Keccak(bits, padding, outputBits).update(message)[outputType]();
    };
  };

  var createCshakeOutputMethod = function createCshakeOutputMethod(bits, padding, outputType) {
    return function (message, outputBits, n, s) {
      return methods['cshake' + bits].update(message, outputBits, n, s)[outputType]();
    };
  };

  var createKmacOutputMethod = function createKmacOutputMethod(bits, padding, outputType) {
    return function (key, message, outputBits, s) {
      return methods['kmac' + bits].update(key, message, outputBits, s)[outputType]();
    };
  };

  var createOutputMethods = function createOutputMethods(method, createMethod, bits, padding) {
    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createMethod(bits, padding, type);
    }

    return method;
  };

  var createMethod = function createMethod(bits, padding) {
    var method = createOutputMethod(bits, padding, 'hex');

    method.create = function () {
      return new Keccak(bits, padding, bits);
    };

    method.update = function (message) {
      return method.create().update(message);
    };

    return createOutputMethods(method, createOutputMethod, bits, padding);
  };

  var createShakeMethod = function createShakeMethod(bits, padding) {
    var method = createShakeOutputMethod(bits, padding, 'hex');

    method.create = function (outputBits) {
      return new Keccak(bits, padding, outputBits);
    };

    method.update = function (message, outputBits) {
      return method.create(outputBits).update(message);
    };

    return createOutputMethods(method, createShakeOutputMethod, bits, padding);
  };

  var createCshakeMethod = function createCshakeMethod(bits, padding) {
    var w = CSHAKE_BYTEPAD[bits];
    var method = createCshakeOutputMethod(bits, padding, 'hex');

    method.create = function (outputBits, n, s) {
      if (!n && !s) {
        return methods['shake' + bits].create(outputBits);
      } else {
        return new Keccak(bits, padding, outputBits).bytepad([n, s], w);
      }
    };

    method.update = function (message, outputBits, n, s) {
      return method.create(outputBits, n, s).update(message);
    };

    return createOutputMethods(method, createCshakeOutputMethod, bits, padding);
  };

  var createKmacMethod = function createKmacMethod(bits, padding) {
    var w = CSHAKE_BYTEPAD[bits];
    var method = createKmacOutputMethod(bits, padding, 'hex');

    method.create = function (key, outputBits, s) {
      return new Kmac(bits, padding, outputBits).bytepad(['KMAC', s], w).bytepad([key], w);
    };

    method.update = function (key, message, outputBits, s) {
      return method.create(key, outputBits, s).update(message);
    };

    return createOutputMethods(method, createKmacOutputMethod, bits, padding);
  };

  var algorithms = [{
    name: 'keccak',
    padding: KECCAK_PADDING,
    bits: BITS,
    createMethod: createMethod
  }, {
    name: 'sha3',
    padding: PADDING,
    bits: BITS,
    createMethod: createMethod
  }, {
    name: 'shake',
    padding: SHAKE_PADDING,
    bits: SHAKE_BITS,
    createMethod: createShakeMethod
  }, {
    name: 'cshake',
    padding: CSHAKE_PADDING,
    bits: SHAKE_BITS,
    createMethod: createCshakeMethod
  }, {
    name: 'kmac',
    padding: CSHAKE_PADDING,
    bits: SHAKE_BITS,
    createMethod: createKmacMethod
  }];
  var methods = {},
      methodNames = [];

  for (var i = 0; i < algorithms.length; ++i) {
    var algorithm = algorithms[i];
    var bits = algorithm.bits;

    for (var j = 0; j < bits.length; ++j) {
      var methodName = algorithm.name + '_' + bits[j];
      methodNames.push(methodName);
      methods[methodName] = algorithm.createMethod(bits[j], algorithm.padding);

      if (algorithm.name !== 'sha3') {
        var newMethodName = algorithm.name + bits[j];
        methodNames.push(newMethodName);
        methods[newMethodName] = methods[methodName];
      }
    }
  }

  function Keccak(bits, padding, outputBits) {
    this.blocks = [];
    this.s = [];
    this.padding = padding;
    this.outputBits = outputBits;
    this.reset = true;
    this.finalized = false;
    this.block = 0;
    this.start = 0;
    this.blockCount = 1600 - (bits << 1) >> 5;
    this.byteCount = this.blockCount << 2;
    this.outputBlocks = outputBits >> 5;
    this.extraBytes = (outputBits & 31) >> 3;

    for (var i = 0; i < 50; ++i) {
      this.s[i] = 0;
    }
  }

  Keccak.prototype.update = function (message) {
    if (this.finalized) {
      throw new Error(FINALIZE_ERROR);
    }

    var notString,
        type = _typeof(message);

    if (type !== 'string') {
      if (type === 'object') {
        if (message === null) {
          throw new Error(INPUT_ERROR);
        } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
          message = new Uint8Array(message);
        } else if (!Array.isArray(message)) {
          if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
            throw new Error(INPUT_ERROR);
          }
        }
      } else {
        throw new Error(INPUT_ERROR);
      }

      notString = true;
    }

    var blocks = this.blocks,
        byteCount = this.byteCount,
        length = message.length,
        blockCount = this.blockCount,
        index = 0,
        s = this.s,
        i,
        code;

    while (index < length) {
      if (this.reset) {
        this.reset = false;
        blocks[0] = this.block;

        for (i = 1; i < blockCount + 1; ++i) {
          blocks[i] = 0;
        }
      }

      if (notString) {
        for (i = this.start; index < length && i < byteCount; ++index) {
          blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
        }
      } else {
        for (i = this.start; index < length && i < byteCount; ++index) {
          code = message.charCodeAt(index);

          if (code < 0x80) {
            blocks[i >> 2] |= code << SHIFT[i++ & 3];
          } else if (code < 0x800) {
            blocks[i >> 2] |= (0xc0 | code >> 6) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
          } else if (code < 0xd800 || code >= 0xe000) {
            blocks[i >> 2] |= (0xe0 | code >> 12) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | code >> 6 & 0x3f) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
          } else {
            code = 0x10000 + ((code & 0x3ff) << 10 | message.charCodeAt(++index) & 0x3ff);
            blocks[i >> 2] |= (0xf0 | code >> 18) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | code >> 12 & 0x3f) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | code >> 6 & 0x3f) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
          }
        }
      }

      this.lastByteIndex = i;

      if (i >= byteCount) {
        this.start = i - byteCount;
        this.block = blocks[blockCount];

        for (i = 0; i < blockCount; ++i) {
          s[i] ^= blocks[i];
        }

        f(s);
        this.reset = true;
      } else {
        this.start = i;
      }
    }

    return this;
  };

  Keccak.prototype.encode = function (x, right) {
    var o = x & 255,
        n = 1;
    var bytes = [o];
    x = x >> 8;
    o = x & 255;

    while (o > 0) {
      bytes.unshift(o);
      x = x >> 8;
      o = x & 255;
      ++n;
    }

    if (right) {
      bytes.push(n);
    } else {
      bytes.unshift(n);
    }

    this.update(bytes);
    return bytes.length;
  };

  Keccak.prototype.encodeString = function (str) {
    var notString,
        type = _typeof(str);

    if (type !== 'string') {
      if (type === 'object') {
        if (str === null) {
          throw new Error(INPUT_ERROR);
        } else if (ARRAY_BUFFER && str.constructor === ArrayBuffer) {
          str = new Uint8Array(str);
        } else if (!Array.isArray(str)) {
          if (!ARRAY_BUFFER || !ArrayBuffer.isView(str)) {
            throw new Error(INPUT_ERROR);
          }
        }
      } else {
        throw new Error(INPUT_ERROR);
      }

      notString = true;
    }

    var bytes = 0,
        length = str.length;

    if (notString) {
      bytes = length;
    } else {
      for (var i = 0; i < str.length; ++i) {
        var code = str.charCodeAt(i);

        if (code < 0x80) {
          bytes += 1;
        } else if (code < 0x800) {
          bytes += 2;
        } else if (code < 0xd800 || code >= 0xe000) {
          bytes += 3;
        } else {
          code = 0x10000 + ((code & 0x3ff) << 10 | str.charCodeAt(++i) & 0x3ff);
          bytes += 4;
        }
      }
    }

    bytes += this.encode(bytes * 8);
    this.update(str);
    return bytes;
  };

  Keccak.prototype.bytepad = function (strs, w) {
    var bytes = this.encode(w);

    for (var i = 0; i < strs.length; ++i) {
      bytes += this.encodeString(strs[i]);
    }

    var paddingBytes = w - bytes % w;
    var zeros = [];
    zeros.length = paddingBytes;
    this.update(zeros);
    return this;
  };

  Keccak.prototype.finalize = function () {
    if (this.finalized) {
      return;
    }

    this.finalized = true;
    var blocks = this.blocks,
        i = this.lastByteIndex,
        blockCount = this.blockCount,
        s = this.s;
    blocks[i >> 2] |= this.padding[i & 3];

    if (this.lastByteIndex === this.byteCount) {
      blocks[0] = blocks[blockCount];

      for (i = 1; i < blockCount + 1; ++i) {
        blocks[i] = 0;
      }
    }

    blocks[blockCount - 1] |= 0x80000000;

    for (i = 0; i < blockCount; ++i) {
      s[i] ^= blocks[i];
    }

    f(s);
  };

  Keccak.prototype.toString = Keccak.prototype.hex = function () {
    this.finalize();
    var blockCount = this.blockCount,
        s = this.s,
        outputBlocks = this.outputBlocks,
        extraBytes = this.extraBytes,
        i = 0,
        j = 0;
    var hex = '',
        block;

    while (j < outputBlocks) {
      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
        block = s[i];
        hex += HEX_CHARS[block >> 4 & 0x0F] + HEX_CHARS[block & 0x0F] + HEX_CHARS[block >> 12 & 0x0F] + HEX_CHARS[block >> 8 & 0x0F] + HEX_CHARS[block >> 20 & 0x0F] + HEX_CHARS[block >> 16 & 0x0F] + HEX_CHARS[block >> 28 & 0x0F] + HEX_CHARS[block >> 24 & 0x0F];
      }

      if (j % blockCount === 0) {
        f(s);
        i = 0;
      }
    }

    if (extraBytes) {
      block = s[i];
      hex += HEX_CHARS[block >> 4 & 0x0F] + HEX_CHARS[block & 0x0F];

      if (extraBytes > 1) {
        hex += HEX_CHARS[block >> 12 & 0x0F] + HEX_CHARS[block >> 8 & 0x0F];
      }

      if (extraBytes > 2) {
        hex += HEX_CHARS[block >> 20 & 0x0F] + HEX_CHARS[block >> 16 & 0x0F];
      }
    }

    return hex;
  };

  Keccak.prototype.arrayBuffer = function () {
    this.finalize();
    var blockCount = this.blockCount,
        s = this.s,
        outputBlocks = this.outputBlocks,
        extraBytes = this.extraBytes,
        i = 0,
        j = 0;
    var bytes = this.outputBits >> 3;
    var buffer;

    if (extraBytes) {
      buffer = new ArrayBuffer(outputBlocks + 1 << 2);
    } else {
      buffer = new ArrayBuffer(bytes);
    }

    var array = new Uint32Array(buffer);

    while (j < outputBlocks) {
      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
        array[j] = s[i];
      }

      if (j % blockCount === 0) {
        f(s);
      }
    }

    if (extraBytes) {
      array[i] = s[i];
      buffer = buffer.slice(0, bytes);
    }

    return buffer;
  };

  Keccak.prototype.buffer = Keccak.prototype.arrayBuffer;

  Keccak.prototype.digest = Keccak.prototype.array = function () {
    this.finalize();
    var blockCount = this.blockCount,
        s = this.s,
        outputBlocks = this.outputBlocks,
        extraBytes = this.extraBytes,
        i = 0,
        j = 0;
    var array = [],
        offset,
        block;

    while (j < outputBlocks) {
      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
        offset = j << 2;
        block = s[i];
        array[offset] = block & 0xFF;
        array[offset + 1] = block >> 8 & 0xFF;
        array[offset + 2] = block >> 16 & 0xFF;
        array[offset + 3] = block >> 24 & 0xFF;
      }

      if (j % blockCount === 0) {
        f(s);
      }
    }

    if (extraBytes) {
      offset = j << 2;
      block = s[i];
      array[offset] = block & 0xFF;

      if (extraBytes > 1) {
        array[offset + 1] = block >> 8 & 0xFF;
      }

      if (extraBytes > 2) {
        array[offset + 2] = block >> 16 & 0xFF;
      }
    }

    return array;
  };

  function Kmac(bits, padding, outputBits) {
    Keccak.call(this, bits, padding, outputBits);
  }

  Kmac.prototype = new Keccak();

  Kmac.prototype.finalize = function () {
    this.encode(this.outputBits, true);
    return Keccak.prototype.finalize.call(this);
  };

  var f = function f(s) {
    var h, l, n, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17, b18, b19, b20, b21, b22, b23, b24, b25, b26, b27, b28, b29, b30, b31, b32, b33, b34, b35, b36, b37, b38, b39, b40, b41, b42, b43, b44, b45, b46, b47, b48, b49;

    for (n = 0; n < 48; n += 2) {
      c0 = s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];
      c1 = s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];
      c2 = s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];
      c3 = s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];
      c4 = s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];
      c5 = s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];
      c6 = s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];
      c7 = s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];
      c8 = s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];
      c9 = s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];
      h = c8 ^ (c2 << 1 | c3 >>> 31);
      l = c9 ^ (c3 << 1 | c2 >>> 31);
      s[0] ^= h;
      s[1] ^= l;
      s[10] ^= h;
      s[11] ^= l;
      s[20] ^= h;
      s[21] ^= l;
      s[30] ^= h;
      s[31] ^= l;
      s[40] ^= h;
      s[41] ^= l;
      h = c0 ^ (c4 << 1 | c5 >>> 31);
      l = c1 ^ (c5 << 1 | c4 >>> 31);
      s[2] ^= h;
      s[3] ^= l;
      s[12] ^= h;
      s[13] ^= l;
      s[22] ^= h;
      s[23] ^= l;
      s[32] ^= h;
      s[33] ^= l;
      s[42] ^= h;
      s[43] ^= l;
      h = c2 ^ (c6 << 1 | c7 >>> 31);
      l = c3 ^ (c7 << 1 | c6 >>> 31);
      s[4] ^= h;
      s[5] ^= l;
      s[14] ^= h;
      s[15] ^= l;
      s[24] ^= h;
      s[25] ^= l;
      s[34] ^= h;
      s[35] ^= l;
      s[44] ^= h;
      s[45] ^= l;
      h = c4 ^ (c8 << 1 | c9 >>> 31);
      l = c5 ^ (c9 << 1 | c8 >>> 31);
      s[6] ^= h;
      s[7] ^= l;
      s[16] ^= h;
      s[17] ^= l;
      s[26] ^= h;
      s[27] ^= l;
      s[36] ^= h;
      s[37] ^= l;
      s[46] ^= h;
      s[47] ^= l;
      h = c6 ^ (c0 << 1 | c1 >>> 31);
      l = c7 ^ (c1 << 1 | c0 >>> 31);
      s[8] ^= h;
      s[9] ^= l;
      s[18] ^= h;
      s[19] ^= l;
      s[28] ^= h;
      s[29] ^= l;
      s[38] ^= h;
      s[39] ^= l;
      s[48] ^= h;
      s[49] ^= l;
      b0 = s[0];
      b1 = s[1];
      b32 = s[11] << 4 | s[10] >>> 28;
      b33 = s[10] << 4 | s[11] >>> 28;
      b14 = s[20] << 3 | s[21] >>> 29;
      b15 = s[21] << 3 | s[20] >>> 29;
      b46 = s[31] << 9 | s[30] >>> 23;
      b47 = s[30] << 9 | s[31] >>> 23;
      b28 = s[40] << 18 | s[41] >>> 14;
      b29 = s[41] << 18 | s[40] >>> 14;
      b20 = s[2] << 1 | s[3] >>> 31;
      b21 = s[3] << 1 | s[2] >>> 31;
      b2 = s[13] << 12 | s[12] >>> 20;
      b3 = s[12] << 12 | s[13] >>> 20;
      b34 = s[22] << 10 | s[23] >>> 22;
      b35 = s[23] << 10 | s[22] >>> 22;
      b16 = s[33] << 13 | s[32] >>> 19;
      b17 = s[32] << 13 | s[33] >>> 19;
      b48 = s[42] << 2 | s[43] >>> 30;
      b49 = s[43] << 2 | s[42] >>> 30;
      b40 = s[5] << 30 | s[4] >>> 2;
      b41 = s[4] << 30 | s[5] >>> 2;
      b22 = s[14] << 6 | s[15] >>> 26;
      b23 = s[15] << 6 | s[14] >>> 26;
      b4 = s[25] << 11 | s[24] >>> 21;
      b5 = s[24] << 11 | s[25] >>> 21;
      b36 = s[34] << 15 | s[35] >>> 17;
      b37 = s[35] << 15 | s[34] >>> 17;
      b18 = s[45] << 29 | s[44] >>> 3;
      b19 = s[44] << 29 | s[45] >>> 3;
      b10 = s[6] << 28 | s[7] >>> 4;
      b11 = s[7] << 28 | s[6] >>> 4;
      b42 = s[17] << 23 | s[16] >>> 9;
      b43 = s[16] << 23 | s[17] >>> 9;
      b24 = s[26] << 25 | s[27] >>> 7;
      b25 = s[27] << 25 | s[26] >>> 7;
      b6 = s[36] << 21 | s[37] >>> 11;
      b7 = s[37] << 21 | s[36] >>> 11;
      b38 = s[47] << 24 | s[46] >>> 8;
      b39 = s[46] << 24 | s[47] >>> 8;
      b30 = s[8] << 27 | s[9] >>> 5;
      b31 = s[9] << 27 | s[8] >>> 5;
      b12 = s[18] << 20 | s[19] >>> 12;
      b13 = s[19] << 20 | s[18] >>> 12;
      b44 = s[29] << 7 | s[28] >>> 25;
      b45 = s[28] << 7 | s[29] >>> 25;
      b26 = s[38] << 8 | s[39] >>> 24;
      b27 = s[39] << 8 | s[38] >>> 24;
      b8 = s[48] << 14 | s[49] >>> 18;
      b9 = s[49] << 14 | s[48] >>> 18;
      s[0] = b0 ^ ~b2 & b4;
      s[1] = b1 ^ ~b3 & b5;
      s[10] = b10 ^ ~b12 & b14;
      s[11] = b11 ^ ~b13 & b15;
      s[20] = b20 ^ ~b22 & b24;
      s[21] = b21 ^ ~b23 & b25;
      s[30] = b30 ^ ~b32 & b34;
      s[31] = b31 ^ ~b33 & b35;
      s[40] = b40 ^ ~b42 & b44;
      s[41] = b41 ^ ~b43 & b45;
      s[2] = b2 ^ ~b4 & b6;
      s[3] = b3 ^ ~b5 & b7;
      s[12] = b12 ^ ~b14 & b16;
      s[13] = b13 ^ ~b15 & b17;
      s[22] = b22 ^ ~b24 & b26;
      s[23] = b23 ^ ~b25 & b27;
      s[32] = b32 ^ ~b34 & b36;
      s[33] = b33 ^ ~b35 & b37;
      s[42] = b42 ^ ~b44 & b46;
      s[43] = b43 ^ ~b45 & b47;
      s[4] = b4 ^ ~b6 & b8;
      s[5] = b5 ^ ~b7 & b9;
      s[14] = b14 ^ ~b16 & b18;
      s[15] = b15 ^ ~b17 & b19;
      s[24] = b24 ^ ~b26 & b28;
      s[25] = b25 ^ ~b27 & b29;
      s[34] = b34 ^ ~b36 & b38;
      s[35] = b35 ^ ~b37 & b39;
      s[44] = b44 ^ ~b46 & b48;
      s[45] = b45 ^ ~b47 & b49;
      s[6] = b6 ^ ~b8 & b0;
      s[7] = b7 ^ ~b9 & b1;
      s[16] = b16 ^ ~b18 & b10;
      s[17] = b17 ^ ~b19 & b11;
      s[26] = b26 ^ ~b28 & b20;
      s[27] = b27 ^ ~b29 & b21;
      s[36] = b36 ^ ~b38 & b30;
      s[37] = b37 ^ ~b39 & b31;
      s[46] = b46 ^ ~b48 & b40;
      s[47] = b47 ^ ~b49 & b41;
      s[8] = b8 ^ ~b0 & b2;
      s[9] = b9 ^ ~b1 & b3;
      s[18] = b18 ^ ~b10 & b12;
      s[19] = b19 ^ ~b11 & b13;
      s[28] = b28 ^ ~b20 & b22;
      s[29] = b29 ^ ~b21 & b23;
      s[38] = b38 ^ ~b30 & b32;
      s[39] = b39 ^ ~b31 & b33;
      s[48] = b48 ^ ~b40 & b42;
      s[49] = b49 ^ ~b41 & b43;
      s[0] ^= RC[n];
      s[1] ^= RC[n + 1];
    }
  };

  if (COMMON_JS) {
    module.exports = methods;
  } else {
    for (i = 0; i < methodNames.length; ++i) {
      root[methodNames[i]] = methods[methodNames[i]];
    }

    if (AMD) {
      define(function () {
        return methods;
      });
    }
  }
})();

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":6}],58:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],59:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var BN = require('bn.js');

var stripHexPrefix = require('strip-hex-prefix');
/**
 * Returns a BN object, converts a number value to a BN
 * @param {String|Number|Object} `arg` input a string number, hex string number, number, BigNumber or BN object
 * @return {Object} `output` BN object of the number
 * @throws if the argument is not an array, object that isn't a bignumber, not a string number or number
 */


module.exports = function numberToBN(arg) {
  if (typeof arg === 'string' || typeof arg === 'number') {
    var multiplier = new BN(1); // eslint-disable-line

    var formattedString = String(arg).toLowerCase().trim();
    var isHexPrefixed = formattedString.substr(0, 2) === '0x' || formattedString.substr(0, 3) === '-0x';
    var stringArg = stripHexPrefix(formattedString); // eslint-disable-line

    if (stringArg.substr(0, 1) === '-') {
      stringArg = stripHexPrefix(stringArg.slice(1));
      multiplier = new BN(-1, 10);
    }

    stringArg = stringArg === '' ? '0' : stringArg;

    if (!stringArg.match(/^-?[0-9]+$/) && stringArg.match(/^[0-9A-Fa-f]+$/) || stringArg.match(/^[a-fA-F]+$/) || isHexPrefixed === true && stringArg.match(/^[0-9A-Fa-f]+$/)) {
      return new BN(stringArg, 16).mul(multiplier);
    }

    if ((stringArg.match(/^-?[0-9]+$/) || stringArg === '') && isHexPrefixed === false) {
      return new BN(stringArg, 10).mul(multiplier);
    }
  } else if (_typeof(arg) === 'object' && arg.toString && !arg.pop && !arg.push) {
    if (arg.toString(10).match(/^-?[0-9]+$/) && (arg.mul || arg.dividedToIntegerBy)) {
      return new BN(arg.toString(10), 10);
    }
  }

  throw new Error('[number-to-bn] while converting number ' + JSON.stringify(arg) + ' to BN.js instance, error: invalid number value. Value must be an integer, hex string, BN or BigNumber instance. Note, decimals are not supported.');
};

},{"bn.js":58,"strip-hex-prefix":62}],60:[function(require,module,exports){
(function (process,global){
'use strict'; // limit of Crypto.getRandomValues()
// https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues

var MAX_BYTES = 65536; // Node supports requesting up to this number of bytes
// https://github.com/nodejs/node/blob/master/lib/internal/crypto/random.js#L48

var MAX_UINT32 = 4294967295;

function oldBrowser() {
  throw new Error('Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11');
}

var Buffer = require('safe-buffer').Buffer;

var crypto = global.crypto || global.msCrypto;

if (crypto && crypto.getRandomValues) {
  module.exports = randomBytes;
} else {
  module.exports = oldBrowser;
}

function randomBytes(size, cb) {
  // phantomjs needs to throw
  if (size > MAX_UINT32) throw new RangeError('requested too many random bytes');
  var bytes = Buffer.allocUnsafe(size);

  if (size > 0) {
    // getRandomValues fails on IE if size == 0
    if (size > MAX_BYTES) {
      // this is the max bytes crypto.getRandomValues
      // can do at once see https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
      for (var generated = 0; generated < size; generated += MAX_BYTES) {
        // buffer.slice automatically checks if the end is past the end of
        // the buffer so we don't have to here
        crypto.getRandomValues(bytes.slice(generated, generated + MAX_BYTES));
      }
    } else {
      crypto.getRandomValues(bytes);
    }
  }

  if (typeof cb === 'function') {
    return process.nextTick(function () {
      cb(null, bytes);
    });
  }

  return bytes;
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":6,"safe-buffer":61}],61:[function(require,module,exports){
"use strict";

/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer');

var Buffer = buffer.Buffer; // alternative to using Object.keys for old browsers

function copyProps(src, dst) {
  for (var key in src) {
    dst[key] = src[key];
  }
}

if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer;
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports);
  exports.Buffer = SafeBuffer;
}

function SafeBuffer(arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length);
}

SafeBuffer.prototype = Object.create(Buffer.prototype); // Copy static methods from Buffer

copyProps(Buffer, SafeBuffer);

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number');
  }

  return Buffer(arg, encodingOrOffset, length);
};

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }

  var buf = Buffer(size);

  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding);
    } else {
      buf.fill(fill);
    }
  } else {
    buf.fill(0);
  }

  return buf;
};

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }

  return Buffer(size);
};

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }

  return buffer.SlowBuffer(size);
};

},{"buffer":3}],62:[function(require,module,exports){
"use strict";

var isHexPrefixed = require('is-hex-prefixed');
/**
 * Removes '0x' from a given `String` is present
 * @param {String} str the string value
 * @return {String|Optional} a string by pass if necessary
 */


module.exports = function stripHexPrefix(str) {
  if (typeof str !== 'string') {
    return str;
  }

  return isHexPrefixed(str) ? str.slice(2) : str;
};

},{"is-hex-prefixed":56}],63:[function(require,module,exports){
(function (global){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

//     Underscore.js 1.9.1
//     http://underscorejs.org
//     (c) 2009-2018 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
(function () {
  // Baseline setup
  // --------------
  // Establish the root object, `window` (`self`) in the browser, `global`
  // on the server, or `this` in some virtual machines. We use `self`
  // instead of `window` for `WebWorker` support.
  var root = (typeof self === "undefined" ? "undefined" : _typeof(self)) == 'object' && self.self === self && self || (typeof global === "undefined" ? "undefined" : _typeof(global)) == 'object' && global.global === global && global || this || {}; // Save the previous value of the `_` variable.

  var previousUnderscore = root._; // Save bytes in the minified (but not gzipped) version:

  var ArrayProto = Array.prototype,
      ObjProto = Object.prototype;
  var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null; // Create quick reference variables for speed access to core prototypes.

  var push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty; // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.

  var nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeCreate = Object.create; // Naked function reference for surrogate-prototype-swapping.

  var Ctor = function Ctor() {}; // Create a safe reference to the Underscore object for use below.


  var _ = function _(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  }; // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for their old module API. If we're in
  // the browser, add `_` as a global object.
  // (`nodeType` is checked to ensure that `module`
  // and `exports` are not HTML elements.)


  if (typeof exports != 'undefined' && !exports.nodeType) {
    if (typeof module != 'undefined' && !module.nodeType && module.exports) {
      exports = module.exports = _;
    }

    exports._ = _;
  } else {
    root._ = _;
  } // Current version.


  _.VERSION = '1.9.1'; // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.

  var optimizeCb = function optimizeCb(func, context, argCount) {
    if (context === void 0) return func;

    switch (argCount == null ? 3 : argCount) {
      case 1:
        return function (value) {
          return func.call(context, value);
        };
      // The 2-argument case is omitted because we’re not using it.

      case 3:
        return function (value, index, collection) {
          return func.call(context, value, index, collection);
        };

      case 4:
        return function (accumulator, value, index, collection) {
          return func.call(context, accumulator, value, index, collection);
        };
    }

    return function () {
      return func.apply(context, arguments);
    };
  };

  var builtinIteratee; // An internal function to generate callbacks that can be applied to each
  // element in a collection, returning the desired result — either `identity`,
  // an arbitrary callback, a property matcher, or a property accessor.

  var cb = function cb(value, context, argCount) {
    if (_.iteratee !== builtinIteratee) return _.iteratee(value, context);
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value) && !_.isArray(value)) return _.matcher(value);
    return _.property(value);
  }; // External wrapper for our callback generator. Users may customize
  // `_.iteratee` if they want additional predicate/iteratee shorthand styles.
  // This abstraction hides the internal-only argCount argument.


  _.iteratee = builtinIteratee = function builtinIteratee(value, context) {
    return cb(value, context, Infinity);
  }; // Some functions take a variable number of arguments, or a few expected
  // arguments at the beginning and then a variable number of values to operate
  // on. This helper accumulates all remaining arguments past the function’s
  // argument length (or an explicit `startIndex`), into an array that becomes
  // the last argument. Similar to ES6’s "rest parameter".


  var restArguments = function restArguments(func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex;
    return function () {
      var length = Math.max(arguments.length - startIndex, 0),
          rest = Array(length),
          index = 0;

      for (; index < length; index++) {
        rest[index] = arguments[index + startIndex];
      }

      switch (startIndex) {
        case 0:
          return func.call(this, rest);

        case 1:
          return func.call(this, arguments[0], rest);

        case 2:
          return func.call(this, arguments[0], arguments[1], rest);
      }

      var args = Array(startIndex + 1);

      for (index = 0; index < startIndex; index++) {
        args[index] = arguments[index];
      }

      args[startIndex] = rest;
      return func.apply(this, args);
    };
  }; // An internal function for creating a new object that inherits from another.


  var baseCreate = function baseCreate(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor();
    Ctor.prototype = null;
    return result;
  };

  var shallowProperty = function shallowProperty(key) {
    return function (obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  var has = function has(obj, path) {
    return obj != null && hasOwnProperty.call(obj, path);
  };

  var deepGet = function deepGet(obj, path) {
    var length = path.length;

    for (var i = 0; i < length; i++) {
      if (obj == null) return void 0;
      obj = obj[path[i]];
    }

    return length ? obj : void 0;
  }; // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object.
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094


  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = shallowProperty('length');

  var isArrayLike = function isArrayLike(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  }; // Collection Functions
  // --------------------
  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.


  _.each = _.forEach = function (obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;

    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);

      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }

    return obj;
  }; // Return the results of applying the iteratee to each element.


  _.map = _.collect = function (obj, iteratee, context) {
    iteratee = cb(iteratee, context);

    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);

    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }

    return results;
  }; // Create a reducing function iterating left or right.


  var createReduce = function createReduce(dir) {
    // Wrap code that reassigns argument variables in a separate function than
    // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
    var reducer = function reducer(obj, iteratee, memo, initial) {
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;

      if (!initial) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }

      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }

      return memo;
    };

    return function (obj, iteratee, memo, context) {
      var initial = arguments.length >= 3;
      return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
    };
  }; // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.


  _.reduce = _.foldl = _.inject = createReduce(1); // The right-associative version of reduce, also known as `foldr`.

  _.reduceRight = _.foldr = createReduce(-1); // Return the first value which passes a truth test. Aliased as `detect`.

  _.find = _.detect = function (obj, predicate, context) {
    var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey;
    var key = keyFinder(obj, predicate, context);
    if (key !== void 0 && key !== -1) return obj[key];
  }; // Return all the elements that pass a truth test.
  // Aliased as `select`.


  _.filter = _.select = function (obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);

    _.each(obj, function (value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });

    return results;
  }; // Return all the elements for which a truth test fails.


  _.reject = function (obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  }; // Determine whether all of the elements match a truth test.
  // Aliased as `all`.


  _.every = _.all = function (obj, predicate, context) {
    predicate = cb(predicate, context);

    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;

    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }

    return true;
  }; // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.


  _.some = _.any = function (obj, predicate, context) {
    predicate = cb(predicate, context);

    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;

    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }

    return false;
  }; // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.


  _.contains = _.includes = _.include = function (obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  }; // Invoke a method (with arguments) on every item in a collection.


  _.invoke = restArguments(function (obj, path, args) {
    var contextPath, func;

    if (_.isFunction(path)) {
      func = path;
    } else if (_.isArray(path)) {
      contextPath = path.slice(0, -1);
      path = path[path.length - 1];
    }

    return _.map(obj, function (context) {
      var method = func;

      if (!method) {
        if (contextPath && contextPath.length) {
          context = deepGet(context, contextPath);
        }

        if (context == null) return void 0;
        method = context[path];
      }

      return method == null ? method : method.apply(context, args);
    });
  }); // Convenience version of a common use case of `map`: fetching a property.

  _.pluck = function (obj, key) {
    return _.map(obj, _.property(key));
  }; // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.


  _.where = function (obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  }; // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.


  _.findWhere = function (obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  }; // Return the maximum element (or element-based computation).


  _.max = function (obj, iteratee, context) {
    var result = -Infinity,
        lastComputed = -Infinity,
        value,
        computed;

    if (iteratee == null || typeof iteratee == 'number' && _typeof(obj[0]) != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);

      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];

        if (value != null && value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);

      _.each(obj, function (v, index, list) {
        computed = iteratee(v, index, list);

        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }

    return result;
  }; // Return the minimum element (or element-based computation).


  _.min = function (obj, iteratee, context) {
    var result = Infinity,
        lastComputed = Infinity,
        value,
        computed;

    if (iteratee == null || typeof iteratee == 'number' && _typeof(obj[0]) != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);

      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];

        if (value != null && value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);

      _.each(obj, function (v, index, list) {
        computed = iteratee(v, index, list);

        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }

    return result;
  }; // Shuffle a collection.


  _.shuffle = function (obj) {
    return _.sample(obj, Infinity);
  }; // Sample **n** random values from a collection using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.


  _.sample = function (obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }

    var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj);
    var length = getLength(sample);
    n = Math.max(Math.min(n, length), 0);
    var last = length - 1;

    for (var index = 0; index < n; index++) {
      var rand = _.random(index, last);

      var temp = sample[index];
      sample[index] = sample[rand];
      sample[rand] = temp;
    }

    return sample.slice(0, n);
  }; // Sort the object's values by a criterion produced by an iteratee.


  _.sortBy = function (obj, iteratee, context) {
    var index = 0;
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function (value, key, list) {
      return {
        value: value,
        index: index++,
        criteria: iteratee(value, key, list)
      };
    }).sort(function (left, right) {
      var a = left.criteria;
      var b = right.criteria;

      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }

      return left.index - right.index;
    }), 'value');
  }; // An internal function used for aggregate "group by" operations.


  var group = function group(behavior, partition) {
    return function (obj, iteratee, context) {
      var result = partition ? [[], []] : {};
      iteratee = cb(iteratee, context);

      _.each(obj, function (value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });

      return result;
    };
  }; // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.


  _.groupBy = group(function (result, value, key) {
    if (has(result, key)) result[key].push(value);else result[key] = [value];
  }); // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.

  _.indexBy = group(function (result, value, key) {
    result[key] = value;
  }); // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.

  _.countBy = group(function (result, value, key) {
    if (has(result, key)) result[key]++;else result[key] = 1;
  });
  var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g; // Safely create a real, live array from anything iterable.

  _.toArray = function (obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);

    if (_.isString(obj)) {
      // Keep surrogate pair characters together
      return obj.match(reStrSymbol);
    }

    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  }; // Return the number of elements in an object.


  _.size = function (obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  }; // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.


  _.partition = group(function (result, value, pass) {
    result[pass ? 0 : 1].push(value);
  }, true); // Array Functions
  // ---------------
  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.

  _.first = _.head = _.take = function (array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  }; // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.


  _.initial = function (array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  }; // Get the last element of an array. Passing **n** will return the last N
  // values in the array.


  _.last = function (array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  }; // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.


  _.rest = _.tail = _.drop = function (array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  }; // Trim out all falsy values from an array.


  _.compact = function (array) {
    return _.filter(array, Boolean);
  }; // Internal implementation of a recursive `flatten` function.


  var flatten = function flatten(input, shallow, strict, output) {
    output = output || [];
    var idx = output.length;

    for (var i = 0, length = getLength(input); i < length; i++) {
      var value = input[i];

      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        // Flatten current level of array or arguments object.
        if (shallow) {
          var j = 0,
              len = value.length;

          while (j < len) {
            output[idx++] = value[j++];
          }
        } else {
          flatten(value, shallow, strict, output);
          idx = output.length;
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }

    return output;
  }; // Flatten out an array, either recursively (by default), or just one level.


  _.flatten = function (array, shallow) {
    return flatten(array, shallow, false);
  }; // Return a version of the array that does not contain the specified value(s).


  _.without = restArguments(function (array, otherArrays) {
    return _.difference(array, otherArrays);
  }); // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // The faster algorithm will not work with an iteratee if the iteratee
  // is not a one-to-one function, so providing an iteratee will disable
  // the faster algorithm.
  // Aliased as `unique`.

  _.uniq = _.unique = function (array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }

    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];

    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;

      if (isSorted && !iteratee) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }

    return result;
  }; // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.


  _.union = restArguments(function (arrays) {
    return _.uniq(flatten(arrays, true, true));
  }); // Produce an array that contains every item shared between all the
  // passed-in arrays.

  _.intersection = function (array) {
    var result = [];
    var argsLength = arguments.length;

    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      var j;

      for (j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }

      if (j === argsLength) result.push(item);
    }

    return result;
  }; // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.


  _.difference = restArguments(function (array, rest) {
    rest = flatten(rest, true, true);
    return _.filter(array, function (value) {
      return !_.contains(rest, value);
    });
  }); // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices.

  _.unzip = function (array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }

    return result;
  }; // Zip together multiple lists into a single array -- elements that share
  // an index go together.


  _.zip = restArguments(_.unzip); // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values. Passing by pairs is the reverse of _.pairs.

  _.object = function (list, values) {
    var result = {};

    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }

    return result;
  }; // Generator function to create the findIndex and findLastIndex functions.


  var createPredicateIndexFinder = function createPredicateIndexFinder(dir) {
    return function (array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;

      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }

      return -1;
    };
  }; // Returns the first index on an array-like that passes a predicate test.


  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1); // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.

  _.sortedIndex = function (array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0,
        high = getLength(array);

    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1;else high = mid;
    }

    return low;
  }; // Generator function to create the indexOf and lastIndexOf functions.


  var createIndexFinder = function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function (array, item, idx) {
      var i = 0,
          length = getLength(array);

      if (typeof idx == 'number') {
        if (dir > 0) {
          i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }

      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }

      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }

      return -1;
    };
  }; // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.


  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex); // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).

  _.range = function (start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }

    if (!step) {
      step = stop < start ? -1 : 1;
    }

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  }; // Chunk a single array into multiple arrays, each containing `count` or fewer
  // items.


  _.chunk = function (array, count) {
    if (count == null || count < 1) return [];
    var result = [];
    var i = 0,
        length = array.length;

    while (i < length) {
      result.push(slice.call(array, i, i += count));
    }

    return result;
  }; // Function (ahem) Functions
  // ------------------
  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments.


  var executeBound = function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  }; // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.


  _.bind = restArguments(function (func, context, args) {
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var bound = restArguments(function (callArgs) {
      return executeBound(func, bound, context, this, args.concat(callArgs));
    });
    return bound;
  }); // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder by default, allowing any combination of arguments to be
  // pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.

  _.partial = restArguments(function (func, boundArgs) {
    var placeholder = _.partial.placeholder;

    var bound = function bound() {
      var position = 0,
          length = boundArgs.length;
      var args = Array(length);

      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
      }

      while (position < arguments.length) {
        args.push(arguments[position++]);
      }

      return executeBound(func, bound, this, this, args);
    };

    return bound;
  });
  _.partial.placeholder = _; // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.

  _.bindAll = restArguments(function (obj, keys) {
    keys = flatten(keys, false, false);
    var index = keys.length;
    if (index < 1) throw new Error('bindAll must be passed function names');

    while (index--) {
      var key = keys[index];
      obj[key] = _.bind(obj[key], obj);
    }
  }); // Memoize an expensive function by storing its results.

  _.memoize = function (func, hasher) {
    var memoize = function memoize(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };

    memoize.cache = {};
    return memoize;
  }; // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.


  _.delay = restArguments(function (func, wait, args) {
    return setTimeout(function () {
      return func.apply(null, args);
    }, wait);
  }); // Defers a function, scheduling it to run after the current call stack has
  // cleared.

  _.defer = _.partial(_.delay, _, 1); // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.

  _.throttle = function (func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};

    var later = function later() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    var throttled = function throttled() {
      var now = _.now();

      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;

      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }

        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }

      return result;
    };

    throttled.cancel = function () {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };

    return throttled;
  }; // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.


  _.debounce = function (func, wait, immediate) {
    var timeout, result;

    var later = function later(context, args) {
      timeout = null;
      if (args) result = func.apply(context, args);
    };

    var debounced = restArguments(function (args) {
      if (timeout) clearTimeout(timeout);

      if (immediate) {
        var callNow = !timeout;
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(this, args);
      } else {
        timeout = _.delay(later, wait, this, args);
      }

      return result;
    });

    debounced.cancel = function () {
      clearTimeout(timeout);
      timeout = null;
    };

    return debounced;
  }; // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.


  _.wrap = function (func, wrapper) {
    return _.partial(wrapper, func);
  }; // Returns a negated version of the passed-in predicate.


  _.negate = function (predicate) {
    return function () {
      return !predicate.apply(this, arguments);
    };
  }; // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.


  _.compose = function () {
    var args = arguments;
    var start = args.length - 1;
    return function () {
      var i = start;
      var result = args[start].apply(this, arguments);

      while (i--) {
        result = args[i].call(this, result);
      }

      return result;
    };
  }; // Returns a function that will only be executed on and after the Nth call.


  _.after = function (times, func) {
    return function () {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  }; // Returns a function that will only be executed up to (but not including) the Nth call.


  _.before = function (times, func) {
    var memo;
    return function () {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }

      if (times <= 1) func = null;
      return memo;
    };
  }; // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.


  _.once = _.partial(_.before, 2);
  _.restArguments = restArguments; // Object Functions
  // ----------------
  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.

  var hasEnumBug = !{
    toString: null
  }.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  var collectNonEnumProps = function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto; // Constructor is a special case.

    var prop = 'constructor';
    if (has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];

      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }; // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`.


  _.keys = function (obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];

    for (var key in obj) {
      if (has(obj, key)) keys.push(key);
    } // Ahem, IE < 9.


    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  }; // Retrieve all the property names of an object.


  _.allKeys = function (obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];

    for (var key in obj) {
      keys.push(key);
    } // Ahem, IE < 9.


    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  }; // Retrieve the values of an object's properties.


  _.values = function (obj) {
    var keys = _.keys(obj);

    var length = keys.length;
    var values = Array(length);

    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }

    return values;
  }; // Returns the results of applying the iteratee to each element of the object.
  // In contrast to _.map it returns an object.


  _.mapObject = function (obj, iteratee, context) {
    iteratee = cb(iteratee, context);

    var keys = _.keys(obj),
        length = keys.length,
        results = {};

    for (var index = 0; index < length; index++) {
      var currentKey = keys[index];
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
    }

    return results;
  }; // Convert an object into a list of `[key, value]` pairs.
  // The opposite of _.object.


  _.pairs = function (obj) {
    var keys = _.keys(obj);

    var length = keys.length;
    var pairs = Array(length);

    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }

    return pairs;
  }; // Invert the keys and values of an object. The values must be serializable.


  _.invert = function (obj) {
    var result = {};

    var keys = _.keys(obj);

    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }

    return result;
  }; // Return a sorted list of the function names available on the object.
  // Aliased as `methods`.


  _.functions = _.methods = function (obj) {
    var names = [];

    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }

    return names.sort();
  }; // An internal function for creating assigner functions.


  var createAssigner = function createAssigner(keysFunc, defaults) {
    return function (obj) {
      var length = arguments.length;
      if (defaults) obj = Object(obj);
      if (length < 2 || obj == null) return obj;

      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;

        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!defaults || obj[key] === void 0) obj[key] = source[key];
        }
      }

      return obj;
    };
  }; // Extend a given object with all the properties in passed-in object(s).


  _.extend = createAssigner(_.allKeys); // Assigns a given object with all the own properties in the passed-in object(s).
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)

  _.extendOwn = _.assign = createAssigner(_.keys); // Returns the first key on an object that passes a predicate test.

  _.findKey = function (obj, predicate, context) {
    predicate = cb(predicate, context);

    var keys = _.keys(obj),
        key;

    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  }; // Internal pick helper function to determine if `obj` has key `key`.


  var keyInObj = function keyInObj(value, key, obj) {
    return key in obj;
  }; // Return a copy of the object only containing the whitelisted properties.


  _.pick = restArguments(function (obj, keys) {
    var result = {},
        iteratee = keys[0];
    if (obj == null) return result;

    if (_.isFunction(iteratee)) {
      if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
      keys = _.allKeys(obj);
    } else {
      iteratee = keyInObj;
      keys = flatten(keys, false, false);
      obj = Object(obj);
    }

    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }

    return result;
  }); // Return a copy of the object without the blacklisted properties.

  _.omit = restArguments(function (obj, keys) {
    var iteratee = keys[0],
        context;

    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
      if (keys.length > 1) context = keys[1];
    } else {
      keys = _.map(flatten(keys, false, false), String);

      iteratee = function iteratee(value, key) {
        return !_.contains(keys, key);
      };
    }

    return _.pick(obj, iteratee, context);
  }); // Fill in a given object with default properties.

  _.defaults = createAssigner(_.allKeys, true); // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.

  _.create = function (prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  }; // Create a (shallow-cloned) duplicate of an object.


  _.clone = function (obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  }; // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.


  _.tap = function (obj, interceptor) {
    interceptor(obj);
    return obj;
  }; // Returns whether an object has a given set of `key:value` pairs.


  _.isMatch = function (object, attrs) {
    var keys = _.keys(attrs),
        length = keys.length;

    if (object == null) return !length;
    var obj = Object(object);

    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }

    return true;
  }; // Internal recursive comparison function for `isEqual`.


  var eq, deepEq;

  eq = function eq(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b; // `null` or `undefined` only equal to itself (strict comparison).

    if (a == null || b == null) return false; // `NaN`s are equivalent, but non-reflexive.

    if (a !== a) return b !== b; // Exhaust primitive checks

    var type = _typeof(a);

    if (type !== 'function' && type !== 'object' && _typeof(b) != 'object') return false;
    return deepEq(a, b, aStack, bStack);
  }; // Internal recursive comparison function for `isEqual`.


  deepEq = function deepEq(a, b, aStack, bStack) {
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped; // Compare `[[Class]]` names.

    var className = toString.call(a);
    if (className !== toString.call(b)) return false;

    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]': // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')

      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;

      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN.
        if (+a !== +a) return +b !== +b; // An `egal` comparison is performed for other numeric values.

        return +a === 0 ? 1 / +a === 1 / b : +a === +b;

      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;

      case '[object Symbol]':
        return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
    }

    var areArrays = className === '[object Array]';

    if (!areArrays) {
      if (_typeof(a) != 'object' || _typeof(b) != 'object') return false; // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.

      var aCtor = a.constructor,
          bCtor = b.constructor;

      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor) && 'constructor' in a && 'constructor' in b) {
        return false;
      }
    } // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.


    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;

    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    } // Add the first object to the stack of traversed objects.


    aStack.push(a);
    bStack.push(b); // Recursively compare objects and arrays.

    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false; // Deep compare the contents, ignoring non-numeric properties.

      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a),
          key;

      length = keys.length; // Ensure that both objects contain the same number of properties before comparing deep equality.

      if (_.keys(b).length !== length) return false;

      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    } // Remove the first object from the stack of traversed objects.


    aStack.pop();
    bStack.pop();
    return true;
  }; // Perform a deep comparison to check if two objects are equal.


  _.isEqual = function (a, b) {
    return eq(a, b);
  }; // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.


  _.isEmpty = function (obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  }; // Is a given value a DOM element?


  _.isElement = function (obj) {
    return !!(obj && obj.nodeType === 1);
  }; // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray


  _.isArray = nativeIsArray || function (obj) {
    return toString.call(obj) === '[object Array]';
  }; // Is a given variable an object?


  _.isObject = function (obj) {
    var type = _typeof(obj);

    return type === 'function' || type === 'object' && !!obj;
  }; // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.


  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'], function (name) {
    _['is' + name] = function (obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  }); // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.


  if (!_.isArguments(arguments)) {
    _.isArguments = function (obj) {
      return has(obj, 'callee');
    };
  } // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).


  var nodelist = root.document && root.document.childNodes;

  if (typeof /./ != 'function' && (typeof Int8Array === "undefined" ? "undefined" : _typeof(Int8Array)) != 'object' && typeof nodelist != 'function') {
    _.isFunction = function (obj) {
      return typeof obj == 'function' || false;
    };
  } // Is a given object a finite number?


  _.isFinite = function (obj) {
    return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj));
  }; // Is the given value `NaN`?


  _.isNaN = function (obj) {
    return _.isNumber(obj) && isNaN(obj);
  }; // Is a given value a boolean?


  _.isBoolean = function (obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  }; // Is a given value equal to null?


  _.isNull = function (obj) {
    return obj === null;
  }; // Is a given variable undefined?


  _.isUndefined = function (obj) {
    return obj === void 0;
  }; // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).


  _.has = function (obj, path) {
    if (!_.isArray(path)) {
      return has(obj, path);
    }

    var length = path.length;

    for (var i = 0; i < length; i++) {
      var key = path[i];

      if (obj == null || !hasOwnProperty.call(obj, key)) {
        return false;
      }

      obj = obj[key];
    }

    return !!length;
  }; // Utility Functions
  // -----------------
  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.


  _.noConflict = function () {
    root._ = previousUnderscore;
    return this;
  }; // Keep the identity function around for default iteratees.


  _.identity = function (value) {
    return value;
  }; // Predicate-generating functions. Often useful outside of Underscore.


  _.constant = function (value) {
    return function () {
      return value;
    };
  };

  _.noop = function () {}; // Creates a function that, when passed an object, will traverse that object’s
  // properties down the given `path`, specified as an array of keys or indexes.


  _.property = function (path) {
    if (!_.isArray(path)) {
      return shallowProperty(path);
    }

    return function (obj) {
      return deepGet(obj, path);
    };
  }; // Generates a function for a given object that returns a given property.


  _.propertyOf = function (obj) {
    if (obj == null) {
      return function () {};
    }

    return function (path) {
      return !_.isArray(path) ? obj[path] : deepGet(obj, path);
    };
  }; // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.


  _.matcher = _.matches = function (attrs) {
    attrs = _.extendOwn({}, attrs);
    return function (obj) {
      return _.isMatch(obj, attrs);
    };
  }; // Run a function **n** times.


  _.times = function (n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);

    for (var i = 0; i < n; i++) {
      accum[i] = iteratee(i);
    }

    return accum;
  }; // Return a random integer between min and max (inclusive).


  _.random = function (min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }

    return min + Math.floor(Math.random() * (max - min + 1));
  }; // A (possibly faster) way to get the current timestamp as an integer.


  _.now = Date.now || function () {
    return new Date().getTime();
  }; // List of HTML entities for escaping.


  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };

  var unescapeMap = _.invert(escapeMap); // Functions for escaping and unescaping strings to/from HTML interpolation.


  var createEscaper = function createEscaper(map) {
    var escaper = function escaper(match) {
      return map[match];
    }; // Regexes for identifying a key that needs to be escaped.


    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function (string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };

  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap); // Traverses the children of `obj` along `path`. If a child is a function, it
  // is invoked with its parent as context. Returns the value of the final
  // child, or `fallback` if any child is undefined.

  _.result = function (obj, path, fallback) {
    if (!_.isArray(path)) path = [path];
    var length = path.length;

    if (!length) {
      return _.isFunction(fallback) ? fallback.call(obj) : fallback;
    }

    for (var i = 0; i < length; i++) {
      var prop = obj == null ? void 0 : obj[path[i]];

      if (prop === void 0) {
        prop = fallback;
        i = length; // Ensure we don't continue iterating.
      }

      obj = _.isFunction(prop) ? prop.call(obj) : prop;
    }

    return obj;
  }; // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.


  var idCounter = 0;

  _.uniqueId = function (prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  }; // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.


  _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  }; // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.

  var noMatch = /(.)^/; // Certain characters need to be escaped so that they can be put into a
  // string literal.

  var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    "\u2028": 'u2028',
    "\u2029": 'u2029'
  };
  var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function escapeChar(match) {
    return '\\' + escapes[match];
  }; // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.


  _.template = function (text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings); // Combine delimiters into one regular expression via alternation.

    var matcher = RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g'); // Compile the template source, escaping string literals appropriately.

    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      } // Adobe VMs need the match returned to produce the correct offset.


      return match;
    });
    source += "';\n"; // If a variable is not specified, place data values in local scope.

    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
    source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + 'return __p;\n';
    var render;

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function template(data) {
      return render.call(this, data, _);
    }; // Provide the compiled source as a convenience for precompilation.


    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';
    return template;
  }; // Add a "chain" function. Start chaining a wrapped Underscore object.


  _.chain = function (obj) {
    var instance = _(obj);

    instance._chain = true;
    return instance;
  }; // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  // Helper function to continue chaining intermediate results.


  var chainResult = function chainResult(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  }; // Add your own custom functions to the Underscore object.


  _.mixin = function (obj) {
    _.each(_.functions(obj), function (name) {
      var func = _[name] = obj[name];

      _.prototype[name] = function () {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return chainResult(this, func.apply(_, args));
      };
    });

    return _;
  }; // Add all of the Underscore functions to the wrapper object.


  _.mixin(_); // Add all mutator Array functions to the wrapper.


  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
    var method = ArrayProto[name];

    _.prototype[name] = function () {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return chainResult(this, obj);
    };
  }); // Add all accessor Array functions to the wrapper.


  _.each(['concat', 'join', 'slice'], function (name) {
    var method = ArrayProto[name];

    _.prototype[name] = function () {
      return chainResult(this, method.apply(this._wrapped, arguments));
    };
  }); // Extracts the result from a wrapped and chained object.


  _.prototype.value = function () {
    return this._wrapped;
  }; // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.


  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function () {
    return String(this._wrapped);
  }; // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.


  if (typeof define == 'function' && define.amd) {
    define('underscore', [], function () {
      return _;
    });
  }
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],64:[function(require,module,exports){
"use strict";

/*! https://mths.be/utf8js v3.0.0 by @mathias */
;

(function (root) {
  var stringFromCharCode = String.fromCharCode; // Taken from https://mths.be/punycode

  function ucs2decode(string) {
    var output = [];
    var counter = 0;
    var length = string.length;
    var value;
    var extra;

    while (counter < length) {
      value = string.charCodeAt(counter++);

      if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
        // high surrogate, and there is a next character
        extra = string.charCodeAt(counter++);

        if ((extra & 0xFC00) == 0xDC00) {
          // low surrogate
          output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
        } else {
          // unmatched surrogate; only append this code unit, in case the next
          // code unit is the high surrogate of a surrogate pair
          output.push(value);
          counter--;
        }
      } else {
        output.push(value);
      }
    }

    return output;
  } // Taken from https://mths.be/punycode


  function ucs2encode(array) {
    var length = array.length;
    var index = -1;
    var value;
    var output = '';

    while (++index < length) {
      value = array[index];

      if (value > 0xFFFF) {
        value -= 0x10000;
        output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
        value = 0xDC00 | value & 0x3FF;
      }

      output += stringFromCharCode(value);
    }

    return output;
  }

  function checkScalarValue(codePoint) {
    if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
      throw Error('Lone surrogate U+' + codePoint.toString(16).toUpperCase() + ' is not a scalar value');
    }
  }
  /*--------------------------------------------------------------------------*/


  function createByte(codePoint, shift) {
    return stringFromCharCode(codePoint >> shift & 0x3F | 0x80);
  }

  function encodeCodePoint(codePoint) {
    if ((codePoint & 0xFFFFFF80) == 0) {
      // 1-byte sequence
      return stringFromCharCode(codePoint);
    }

    var symbol = '';

    if ((codePoint & 0xFFFFF800) == 0) {
      // 2-byte sequence
      symbol = stringFromCharCode(codePoint >> 6 & 0x1F | 0xC0);
    } else if ((codePoint & 0xFFFF0000) == 0) {
      // 3-byte sequence
      checkScalarValue(codePoint);
      symbol = stringFromCharCode(codePoint >> 12 & 0x0F | 0xE0);
      symbol += createByte(codePoint, 6);
    } else if ((codePoint & 0xFFE00000) == 0) {
      // 4-byte sequence
      symbol = stringFromCharCode(codePoint >> 18 & 0x07 | 0xF0);
      symbol += createByte(codePoint, 12);
      symbol += createByte(codePoint, 6);
    }

    symbol += stringFromCharCode(codePoint & 0x3F | 0x80);
    return symbol;
  }

  function utf8encode(string) {
    var codePoints = ucs2decode(string);
    var length = codePoints.length;
    var index = -1;
    var codePoint;
    var byteString = '';

    while (++index < length) {
      codePoint = codePoints[index];
      byteString += encodeCodePoint(codePoint);
    }

    return byteString;
  }
  /*--------------------------------------------------------------------------*/


  function readContinuationByte() {
    if (byteIndex >= byteCount) {
      throw Error('Invalid byte index');
    }

    var continuationByte = byteArray[byteIndex] & 0xFF;
    byteIndex++;

    if ((continuationByte & 0xC0) == 0x80) {
      return continuationByte & 0x3F;
    } // If we end up here, it’s not a continuation byte


    throw Error('Invalid continuation byte');
  }

  function decodeSymbol() {
    var byte1;
    var byte2;
    var byte3;
    var byte4;
    var codePoint;

    if (byteIndex > byteCount) {
      throw Error('Invalid byte index');
    }

    if (byteIndex == byteCount) {
      return false;
    } // Read first byte


    byte1 = byteArray[byteIndex] & 0xFF;
    byteIndex++; // 1-byte sequence (no continuation bytes)

    if ((byte1 & 0x80) == 0) {
      return byte1;
    } // 2-byte sequence


    if ((byte1 & 0xE0) == 0xC0) {
      byte2 = readContinuationByte();
      codePoint = (byte1 & 0x1F) << 6 | byte2;

      if (codePoint >= 0x80) {
        return codePoint;
      } else {
        throw Error('Invalid continuation byte');
      }
    } // 3-byte sequence (may include unpaired surrogates)


    if ((byte1 & 0xF0) == 0xE0) {
      byte2 = readContinuationByte();
      byte3 = readContinuationByte();
      codePoint = (byte1 & 0x0F) << 12 | byte2 << 6 | byte3;

      if (codePoint >= 0x0800) {
        checkScalarValue(codePoint);
        return codePoint;
      } else {
        throw Error('Invalid continuation byte');
      }
    } // 4-byte sequence


    if ((byte1 & 0xF8) == 0xF0) {
      byte2 = readContinuationByte();
      byte3 = readContinuationByte();
      byte4 = readContinuationByte();
      codePoint = (byte1 & 0x07) << 0x12 | byte2 << 0x0C | byte3 << 0x06 | byte4;

      if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
        return codePoint;
      }
    }

    throw Error('Invalid UTF-8 detected');
  }

  var byteArray;
  var byteCount;
  var byteIndex;

  function utf8decode(byteString) {
    byteArray = ucs2decode(byteString);
    byteCount = byteArray.length;
    byteIndex = 0;
    var codePoints = [];
    var tmp;

    while ((tmp = decodeSymbol()) !== false) {
      codePoints.push(tmp);
    }

    return ucs2encode(codePoints);
  }
  /*--------------------------------------------------------------------------*/


  root.version = '3.0.0';
  root.encode = utf8encode;
  root.decode = utf8decode;
})(typeof exports === 'undefined' ? (void 0).utf8 = {} : exports);

},{}],65:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
 This file is part of web3.js.

 web3.js is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 web3.js is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @file utils.js
 * @author Marek Kotewicz <marek@parity.io>
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */
var _ = require('underscore');

var ethjsUnit = require('ethjs-unit');

var utils = require('./utils.js');

var soliditySha3 = require('./soliditySha3.js');

var randombytes = require('randombytes');
/**
 * Fires an error in an event emitter and callback and returns the eventemitter
 *
 * @method _fireError
 * @param {Object} error a string, a error, or an object with {message, data}
 * @param {Object} emitter
 * @param {Function} reject
 * @param {Function} callback
 * @param {any} optionalData
 * @return {Object} the emitter
 */


var _fireError = function _fireError(error, emitter, reject, callback, optionalData) {
  /*jshint maxcomplexity: 10 */
  // add data if given
  if (_.isObject(error) && !(error instanceof Error) && error.data) {
    if (_.isObject(error.data) || _.isArray(error.data)) {
      error.data = JSON.stringify(error.data, null, 2);
    }

    error = error.message + "\n" + error.data;
  }

  if (_.isString(error)) {
    error = new Error(error);
  }

  if (_.isFunction(callback)) {
    callback(error, optionalData);
  }

  if (_.isFunction(reject)) {
    // suppress uncatched error if an error listener is present
    // OR suppress uncatched error if an callback listener is present
    if (emitter && _.isFunction(emitter.listeners) && emitter.listeners('error').length || _.isFunction(callback)) {
      emitter.catch(function () {});
    } // reject later, to be able to return emitter


    setTimeout(function () {
      reject(error);
    }, 1);
  }

  if (emitter && _.isFunction(emitter.emit)) {
    // emit later, to be able to return emitter
    setTimeout(function () {
      emitter.emit('error', error, optionalData);
      emitter.removeAllListeners();
    }, 1);
  }

  return emitter;
};
/**
 * Should be used to create full function/event name from json abi
 *
 * @method _jsonInterfaceMethodToString
 * @param {Object} json
 * @return {String} full function/event name
 */


var _jsonInterfaceMethodToString = function _jsonInterfaceMethodToString(json) {
  if (_.isObject(json) && json.name && json.name.indexOf('(') !== -1) {
    return json.name;
  }

  return json.name + '(' + _flattenTypes(false, json.inputs).join(',') + ')';
};
/**
 * Should be used to flatten json abi inputs/outputs into an array of type-representing-strings
 *
 * @method _flattenTypes
 * @param {bool} includeTuple
 * @param {Object} puts
 * @return {Array} parameters as strings
 */


var _flattenTypes = function _flattenTypes(includeTuple, puts) {
  // console.log("entered _flattenTypes. inputs/outputs: " + puts)
  var types = [];
  puts.forEach(function (param) {
    if (_typeof(param.components) === 'object') {
      if (param.type.substring(0, 5) !== 'tuple') {
        throw new Error('components found but type is not tuple; report on GitHub');
      }

      var suffix = '';
      var arrayBracket = param.type.indexOf('[');

      if (arrayBracket >= 0) {
        suffix = param.type.substring(arrayBracket);
      }

      var result = _flattenTypes(includeTuple, param.components); // console.log("result should have things: " + result)


      if (_.isArray(result) && includeTuple) {
        // console.log("include tuple word, and its an array. joining...: " + result.types)
        types.push('tuple(' + result.join(',') + ')' + suffix);
      } else if (!includeTuple) {
        // console.log("don't include tuple, but its an array. joining...: " + result)
        types.push('(' + result.join(',') + ')' + suffix);
      } else {
        // console.log("its a single type within a tuple: " + result.types)
        types.push('(' + result + ')');
      }
    } else {
      // console.log("its a type and not directly in a tuple: " + param.type)
      types.push(param.type);
    }
  });
  return types;
};
/**
 * Returns a random hex string by the given bytes size
 *
 * @param {Number} size
 * @returns {string}
 */


var randomHex = function randomHex(size) {
  return '0x' + randombytes(size).toString('hex');
};
/**
 * Should be called to get ascii from it's hex representation
 *
 * @method hexToAscii
 * @param {String} hex
 * @returns {String} ascii string representation of hex value
 */


var hexToAscii = function hexToAscii(hex) {
  if (!utils.isHexStrict(hex)) throw new Error('The parameter must be a valid HEX string.');
  var str = "";
  var i = 0,
      l = hex.length;

  if (hex.substring(0, 2) === '0x') {
    i = 2;
  }

  for (; i < l; i += 2) {
    var code = parseInt(hex.substr(i, 2), 16);
    str += String.fromCharCode(code);
  }

  return str;
};
/**
 * Should be called to get hex representation (prefixed by 0x) of ascii string
 *
 * @method asciiToHex
 * @param {String} str
 * @returns {String} hex representation of input string
 */


var asciiToHex = function asciiToHex(str) {
  if (!str) return "0x00";
  var hex = "";

  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i);
    var n = code.toString(16);
    hex += n.length < 2 ? '0' + n : n;
  }

  return "0x" + hex;
};
/**
 * Returns value of unit in Wei
 *
 * @method getUnitValue
 * @param {String} unit the unit to convert to, default ether
 * @returns {BN} value of the unit (in Wei)
 * @throws error if the unit is not correct:w
 */


var getUnitValue = function getUnitValue(unit) {
  unit = unit ? unit.toLowerCase() : 'ether';

  if (!ethjsUnit.unitMap[unit]) {
    throw new Error('This unit "' + unit + '" doesn\'t exist, please use the one of the following units' + JSON.stringify(ethjsUnit.unitMap, null, 2));
  }

  return unit;
};
/**
 * Takes a number of wei and converts it to any other ether unit.
 *
 * Possible units are:
 *   SI Short   SI Full        Effigy       Other
 * - kwei       femtoether     babbage
 * - mwei       picoether      lovelace
 * - gwei       nanoether      shannon      nano
 * - --         microether     szabo        micro
 * - --         milliether     finney       milli
 * - ether      --             --
 * - kether                    --           grand
 * - mether
 * - gether
 * - tether
 *
 * @method fromWei
 * @param {Number|String} number can be a number, number string or a HEX of a decimal
 * @param {String} unit the unit to convert to, default ether
 * @return {String|Object} When given a BN object it returns one as well, otherwise a number
 */


var fromWei = function fromWei(number, unit) {
  unit = getUnitValue(unit);

  if (!utils.isBN(number) && !_.isString(number)) {
    throw new Error('Please pass numbers as strings or BN objects to avoid precision errors.');
  }

  return utils.isBN(number) ? ethjsUnit.fromWei(number, unit) : ethjsUnit.fromWei(number, unit).toString(10);
};
/**
 * Takes a number of a unit and converts it to wei.
 *
 * Possible units are:
 *   SI Short   SI Full        Effigy       Other
 * - kwei       femtoether     babbage
 * - mwei       picoether      lovelace
 * - gwei       nanoether      shannon      nano
 * - --         microether     szabo        micro
 * - --         microether     szabo        micro
 * - --         milliether     finney       milli
 * - ether      --             --
 * - kether                    --           grand
 * - mether
 * - gether
 * - tether
 *
 * @method toWei
 * @param {Number|String|BN} number can be a number, number string or a HEX of a decimal
 * @param {String} unit the unit to convert from, default ether
 * @return {String|Object} When given a BN object it returns one as well, otherwise a number
 */


var toWei = function toWei(number, unit) {
  unit = getUnitValue(unit);

  if (!utils.isBN(number) && !_.isString(number)) {
    throw new Error('Please pass numbers as strings or BN objects to avoid precision errors.');
  }

  return utils.isBN(number) ? ethjsUnit.toWei(number, unit) : ethjsUnit.toWei(number, unit).toString(10);
};
/**
 * Converts to a checksum address
 *
 * @method toChecksumAddress
 * @param {String} address the given HEX address
 * @return {String}
 */


var toChecksumAddress = function toChecksumAddress(address) {
  if (typeof address === 'undefined') return '';
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) throw new Error('Given address "' + address + '" is not a valid Ethereum address.');
  address = address.toLowerCase().replace(/^0x/i, '');
  var addressHash = utils.sha3(address).replace(/^0x/i, '');
  var checksumAddress = '0x';

  for (var i = 0; i < address.length; i++) {
    // If ith character is 9 to f then make it uppercase
    if (parseInt(addressHash[i], 16) > 7) {
      checksumAddress += address[i].toUpperCase();
    } else {
      checksumAddress += address[i];
    }
  }

  return checksumAddress;
};

module.exports = {
  _fireError: _fireError,
  _jsonInterfaceMethodToString: _jsonInterfaceMethodToString,
  _flattenTypes: _flattenTypes,
  // extractDisplayName: extractDisplayName,
  // extractTypeName: extractTypeName,
  randomHex: randomHex,
  _: _,
  BN: utils.BN,
  isBN: utils.isBN,
  isBigNumber: utils.isBigNumber,
  isHex: utils.isHex,
  isHexStrict: utils.isHexStrict,
  sha3: utils.sha3,
  sha3Raw: utils.sha3Raw,
  keccak256: utils.sha3,
  soliditySha3: soliditySha3.soliditySha3,
  soliditySha3Raw: soliditySha3.soliditySha3Raw,
  isAddress: utils.isAddress,
  checkAddressChecksum: utils.checkAddressChecksum,
  toChecksumAddress: toChecksumAddress,
  toHex: utils.toHex,
  toBN: utils.toBN,
  bytesToHex: utils.bytesToHex,
  hexToBytes: utils.hexToBytes,
  hexToNumberString: utils.hexToNumberString,
  hexToNumber: utils.hexToNumber,
  toDecimal: utils.hexToNumber,
  // alias
  numberToHex: utils.numberToHex,
  fromDecimal: utils.numberToHex,
  // alias
  hexToUtf8: utils.hexToUtf8,
  hexToString: utils.hexToUtf8,
  toUtf8: utils.hexToUtf8,
  utf8ToHex: utils.utf8ToHex,
  stringToHex: utils.utf8ToHex,
  fromUtf8: utils.utf8ToHex,
  hexToAscii: hexToAscii,
  toAscii: hexToAscii,
  asciiToHex: asciiToHex,
  fromAscii: asciiToHex,
  unitMap: ethjsUnit.unitMap,
  toWei: toWei,
  fromWei: fromWei,
  padLeft: utils.leftPad,
  leftPad: utils.leftPad,
  padRight: utils.rightPad,
  rightPad: utils.rightPad,
  toTwosComplement: utils.toTwosComplement,
  isBloom: utils.isBloom,
  isUserEthereumAddressInBloom: utils.isUserEthereumAddressInBloom,
  isContractAddressInBloom: utils.isContractAddressInBloom,
  isTopic: utils.isTopic,
  isTopicInBloom: utils.isTopicInBloom,
  isInBloom: utils.isInBloom
};

},{"./soliditySha3.js":66,"./utils.js":67,"ethjs-unit":54,"randombytes":60,"underscore":63}],66:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
 This file is part of web3.js.

 web3.js is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 web3.js is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @file soliditySha3.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */
var _ = require('underscore');

var BN = require('bn.js');

var utils = require('./utils.js');

var _elementaryName = function _elementaryName(name) {
  /*jshint maxcomplexity:false */
  if (name.startsWith('int[')) {
    return 'int256' + name.slice(3);
  } else if (name === 'int') {
    return 'int256';
  } else if (name.startsWith('uint[')) {
    return 'uint256' + name.slice(4);
  } else if (name === 'uint') {
    return 'uint256';
  } else if (name.startsWith('fixed[')) {
    return 'fixed128x128' + name.slice(5);
  } else if (name === 'fixed') {
    return 'fixed128x128';
  } else if (name.startsWith('ufixed[')) {
    return 'ufixed128x128' + name.slice(6);
  } else if (name === 'ufixed') {
    return 'ufixed128x128';
  }

  return name;
}; // Parse N from type<N>


var _parseTypeN = function _parseTypeN(type) {
  var typesize = /^\D+(\d+).*$/.exec(type);
  return typesize ? parseInt(typesize[1], 10) : null;
}; // Parse N from type[<N>]


var _parseTypeNArray = function _parseTypeNArray(type) {
  var arraySize = /^\D+\d*\[(\d+)\]$/.exec(type);
  return arraySize ? parseInt(arraySize[1], 10) : null;
};

var _parseNumber = function _parseNumber(arg) {
  var type = _typeof(arg);

  if (type === 'string') {
    if (utils.isHexStrict(arg)) {
      return new BN(arg.replace(/0x/i, ''), 16);
    } else {
      return new BN(arg, 10);
    }
  } else if (type === 'number') {
    return new BN(arg);
  } else if (utils.isBigNumber(arg)) {
    return new BN(arg.toString(10));
  } else if (utils.isBN(arg)) {
    return arg;
  } else {
    throw new Error(arg + ' is not a number');
  }
};

var _solidityPack = function _solidityPack(type, value, arraySize) {
  /*jshint maxcomplexity:false */
  var size, num;
  type = _elementaryName(type);

  if (type === 'bytes') {
    if (value.replace(/^0x/i, '').length % 2 !== 0) {
      throw new Error('Invalid bytes characters ' + value.length);
    }

    return value;
  } else if (type === 'string') {
    return utils.utf8ToHex(value);
  } else if (type === 'bool') {
    return value ? '01' : '00';
  } else if (type.startsWith('address')) {
    if (arraySize) {
      size = 64;
    } else {
      size = 40;
    }

    if (!utils.isAddress(value)) {
      throw new Error(value + ' is not a valid address, or the checksum is invalid.');
    }

    return utils.leftPad(value.toLowerCase(), size);
  }

  size = _parseTypeN(type);

  if (type.startsWith('bytes')) {
    if (!size) {
      throw new Error('bytes[] not yet supported in solidity');
    } // must be 32 byte slices when in an array


    if (arraySize) {
      size = 32;
    }

    if (size < 1 || size > 32 || size < value.replace(/^0x/i, '').length / 2) {
      throw new Error('Invalid bytes' + size + ' for ' + value);
    }

    return utils.rightPad(value, size * 2);
  } else if (type.startsWith('uint')) {
    if (size % 8 || size < 8 || size > 256) {
      throw new Error('Invalid uint' + size + ' size');
    }

    num = _parseNumber(value);

    if (num.bitLength() > size) {
      throw new Error('Supplied uint exceeds width: ' + size + ' vs ' + num.bitLength());
    }

    if (num.lt(new BN(0))) {
      throw new Error('Supplied uint ' + num.toString() + ' is negative');
    }

    return size ? utils.leftPad(num.toString('hex'), size / 8 * 2) : num;
  } else if (type.startsWith('int')) {
    if (size % 8 || size < 8 || size > 256) {
      throw new Error('Invalid int' + size + ' size');
    }

    num = _parseNumber(value);

    if (num.bitLength() > size) {
      throw new Error('Supplied int exceeds width: ' + size + ' vs ' + num.bitLength());
    }

    if (num.lt(new BN(0))) {
      return num.toTwos(size).toString('hex');
    } else {
      return size ? utils.leftPad(num.toString('hex'), size / 8 * 2) : num;
    }
  } else {
    // FIXME: support all other types
    throw new Error('Unsupported or invalid type: ' + type);
  }
};

var _processSoliditySha3Args = function _processSoliditySha3Args(arg) {
  /*jshint maxcomplexity:false */
  if (_.isArray(arg)) {
    throw new Error('Autodetection of array types is not supported.');
  }

  var type,
      value = '';
  var hexArg, arraySize; // if type is given

  if (_.isObject(arg) && (arg.hasOwnProperty('v') || arg.hasOwnProperty('t') || arg.hasOwnProperty('value') || arg.hasOwnProperty('type'))) {
    type = arg.hasOwnProperty('t') ? arg.t : arg.type;
    value = arg.hasOwnProperty('v') ? arg.v : arg.value; // otherwise try to guess the type
  } else {
    type = utils.toHex(arg, true);
    value = utils.toHex(arg);

    if (!type.startsWith('int') && !type.startsWith('uint')) {
      type = 'bytes';
    }
  }

  if ((type.startsWith('int') || type.startsWith('uint')) && typeof value === 'string' && !/^(-)?0x/i.test(value)) {
    value = new BN(value);
  } // get the array size


  if (_.isArray(value)) {
    arraySize = _parseTypeNArray(type);

    if (arraySize && value.length !== arraySize) {
      throw new Error(type + ' is not matching the given array ' + JSON.stringify(value));
    } else {
      arraySize = value.length;
    }
  }

  if (_.isArray(value)) {
    hexArg = value.map(function (val) {
      return _solidityPack(type, val, arraySize).toString('hex').replace('0x', '');
    });
    return hexArg.join('');
  } else {
    hexArg = _solidityPack(type, value, arraySize);
    return hexArg.toString('hex').replace('0x', '');
  }
};
/**
 * Hashes solidity values to a sha3 hash using keccak 256
 *
 * @method soliditySha3
 * @return {Object} the sha3
 */


var soliditySha3 = function soliditySha3() {
  /*jshint maxcomplexity:false */
  var args = Array.prototype.slice.call(arguments);

  var hexArgs = _.map(args, _processSoliditySha3Args); // console.log(args, hexArgs);
  // console.log('0x'+ hexArgs.join(''));


  return utils.sha3('0x' + hexArgs.join(''));
};
/**
 * Hashes solidity values to a sha3 hash using keccak 256 but does return the hash of value `null` instead of `null`
 *
 * @method soliditySha3Raw
 * @return {Object} the sha3
 */


var soliditySha3Raw = function soliditySha3Raw() {
  return utils.sha3Raw('0x' + _.map(Array.prototype.slice.call(arguments), _processSoliditySha3Args).join(''));
};

module.exports = {
  soliditySha3: soliditySha3,
  soliditySha3Raw: soliditySha3Raw
};

},{"./utils.js":67,"bn.js":50,"underscore":63}],67:[function(require,module,exports){
(function (Buffer){
"use strict";

/*
 This file is part of web3.js.

 web3.js is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 web3.js is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @file utils.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */
var _ = require('underscore');

var BN = require('bn.js');

var numberToBN = require('number-to-bn');

var utf8 = require('utf8');

var Hash = require("eth-lib/lib/hash");

var ethereumBloomFilters = require('ethereum-bloom-filters');
/**
 * Returns true if object is BN, otherwise false
 *
 * @method isBN
 * @param {Object} object
 * @return {Boolean}
 */


var isBN = function isBN(object) {
  return BN.isBN(object);
};
/**
 * Returns true if object is BigNumber, otherwise false
 *
 * @method isBigNumber
 * @param {Object} object
 * @return {Boolean}
 */


var isBigNumber = function isBigNumber(object) {
  return object && object.constructor && object.constructor.name === 'BigNumber';
};
/**
 * Takes an input and transforms it into an BN
 *
 * @method toBN
 * @param {Number|String|BN} number, string, HEX string or BN
 * @return {BN} BN
 */


var toBN = function toBN(number) {
  try {
    return numberToBN.apply(null, arguments);
  } catch (e) {
    throw new Error(e + ' Given value: "' + number + '"');
  }
};
/**
 * Takes and input transforms it into BN and if it is negative value, into two's complement
 *
 * @method toTwosComplement
 * @param {Number|String|BN} number
 * @return {String}
 */


var toTwosComplement = function toTwosComplement(number) {
  return '0x' + toBN(number).toTwos(256).toString(16, 64);
};
/**
 * Checks if the given string is an address
 *
 * @method isAddress
 * @param {String} address the given HEX address
 * @return {Boolean}
 */


var isAddress = function isAddress(address) {
  // check if it has the basic requirements of an address
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    return false; // If it's ALL lowercase or ALL upppercase
  } else if (/^(0x|0X)?[0-9a-f]{40}$/.test(address) || /^(0x|0X)?[0-9A-F]{40}$/.test(address)) {
    return true; // Otherwise check each case
  } else {
    return checkAddressChecksum(address);
  }
};
/**
 * Checks if the given string is a checksummed address
 *
 * @method checkAddressChecksum
 * @param {String} address the given HEX address
 * @return {Boolean}
 */


var checkAddressChecksum = function checkAddressChecksum(address) {
  // Check each case
  address = address.replace(/^0x/i, '');
  var addressHash = sha3(address.toLowerCase()).replace(/^0x/i, '');

  for (var i = 0; i < 40; i++) {
    // the nth letter should be uppercase if the nth digit of casemap is 1
    if (parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i] || parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i]) {
      return false;
    }
  }

  return true;
};
/**
 * Should be called to pad string to expected length
 *
 * @method leftPad
 * @param {String} string to be padded
 * @param {Number} chars that result string should have
 * @param {String} sign, by default 0
 * @returns {String} right aligned string
 */


var leftPad = function leftPad(string, chars, sign) {
  var hasPrefix = /^0x/i.test(string) || typeof string === 'number';
  string = string.toString(16).replace(/^0x/i, '');
  var padding = chars - string.length + 1 >= 0 ? chars - string.length + 1 : 0;
  return (hasPrefix ? '0x' : '') + new Array(padding).join(sign ? sign : "0") + string;
};
/**
 * Should be called to pad string to expected length
 *
 * @method rightPad
 * @param {String} string to be padded
 * @param {Number} chars that result string should have
 * @param {String} sign, by default 0
 * @returns {String} right aligned string
 */


var rightPad = function rightPad(string, chars, sign) {
  var hasPrefix = /^0x/i.test(string) || typeof string === 'number';
  string = string.toString(16).replace(/^0x/i, '');
  var padding = chars - string.length + 1 >= 0 ? chars - string.length + 1 : 0;
  return (hasPrefix ? '0x' : '') + string + new Array(padding).join(sign ? sign : "0");
};
/**
 * Should be called to get hex representation (prefixed by 0x) of utf8 string
 *
 * @method utf8ToHex
 * @param {String} str
 * @returns {String} hex representation of input string
 */


var utf8ToHex = function utf8ToHex(str) {
  str = utf8.encode(str);
  var hex = ""; // remove \u0000 padding from either side

  str = str.replace(/^(?:\u0000)*/, '');
  str = str.split("").reverse().join("");
  str = str.replace(/^(?:\u0000)*/, '');
  str = str.split("").reverse().join("");

  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i); // if (code !== 0) {

    var n = code.toString(16);
    hex += n.length < 2 ? '0' + n : n; // }
  }

  return "0x" + hex;
};
/**
 * Should be called to get utf8 from it's hex representation
 *
 * @method hexToUtf8
 * @param {String} hex
 * @returns {String} ascii string representation of hex value
 */


var hexToUtf8 = function hexToUtf8(hex) {
  if (!isHexStrict(hex)) throw new Error('The parameter "' + hex + '" must be a valid HEX string.');
  var str = "";
  var code = 0;
  hex = hex.replace(/^0x/i, ''); // remove 00 padding from either side

  hex = hex.replace(/^(?:00)*/, '');
  hex = hex.split("").reverse().join("");
  hex = hex.replace(/^(?:00)*/, '');
  hex = hex.split("").reverse().join("");
  var l = hex.length;

  for (var i = 0; i < l; i += 2) {
    code = parseInt(hex.substr(i, 2), 16); // if (code !== 0) {

    str += String.fromCharCode(code); // }
  }

  return utf8.decode(str);
};
/**
 * Converts value to it's number representation
 *
 * @method hexToNumber
 * @param {String|Number|BN} value
 * @return {String}
 */


var hexToNumber = function hexToNumber(value) {
  if (!value) {
    return value;
  }

  if (_.isString(value) && !isHexStrict(value)) {
    throw new Error('Given value "' + value + '" is not a valid hex string.');
  }

  return toBN(value).toNumber();
};
/**
 * Converts value to it's decimal representation in string
 *
 * @method hexToNumberString
 * @param {String|Number|BN} value
 * @return {String}
 */


var hexToNumberString = function hexToNumberString(value) {
  if (!value) return value;

  if (_.isString(value) && !isHexStrict(value)) {
    throw new Error('Given value "' + value + '" is not a valid hex string.');
  }

  return toBN(value).toString(10);
};
/**
 * Converts value to it's hex representation
 *
 * @method numberToHex
 * @param {String|Number|BN} value
 * @return {String}
 */


var numberToHex = function numberToHex(value) {
  if (_.isNull(value) || _.isUndefined(value)) {
    return value;
  }

  if (!isFinite(value) && !isHexStrict(value)) {
    throw new Error('Given input "' + value + '" is not a number.');
  }

  var number = toBN(value);
  var result = number.toString(16);
  return number.lt(new BN(0)) ? '-0x' + result.substr(1) : '0x' + result;
};
/**
 * Convert a byte array to a hex string
 *
 * Note: Implementation from crypto-js
 *
 * @method bytesToHex
 * @param {Array} bytes
 * @return {String} the hex string
 */


var bytesToHex = function bytesToHex(bytes) {
  for (var hex = [], i = 0; i < bytes.length; i++) {
    /* jshint ignore:start */
    hex.push((bytes[i] >>> 4).toString(16));
    hex.push((bytes[i] & 0xF).toString(16));
    /* jshint ignore:end */
  }

  return '0x' + hex.join("");
};
/**
 * Convert a hex string to a byte array
 *
 * Note: Implementation from crypto-js
 *
 * @method hexToBytes
 * @param {string} hex
 * @return {Array} the byte array
 */


var hexToBytes = function hexToBytes(hex) {
  hex = hex.toString(16);

  if (!isHexStrict(hex)) {
    throw new Error('Given value "' + hex + '" is not a valid hex string.');
  }

  hex = hex.replace(/^0x/i, '');

  for (var bytes = [], c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }

  return bytes;
};
/**
 * Auto converts any given value into it's hex representation.
 *
 * And even stringifys objects before.
 *
 * @method toHex
 * @param {String|Number|BN|Object|Buffer} value
 * @param {Boolean} returnType
 * @return {String}
 */


var toHex = function toHex(value, returnType) {
  /*jshint maxcomplexity: false */
  if (isAddress(value)) {
    return returnType ? 'address' : '0x' + value.toLowerCase().replace(/^0x/i, '');
  }

  if (_.isBoolean(value)) {
    return returnType ? 'bool' : value ? '0x01' : '0x00';
  }

  if (Buffer.isBuffer(value)) {
    return '0x' + value.toString('hex');
  }

  if (_.isObject(value) && !isBigNumber(value) && !isBN(value)) {
    return returnType ? 'string' : utf8ToHex(JSON.stringify(value));
  } // if its a negative number, pass it through numberToHex


  if (_.isString(value)) {
    if (value.indexOf('-0x') === 0 || value.indexOf('-0X') === 0) {
      return returnType ? 'int256' : numberToHex(value);
    } else if (value.indexOf('0x') === 0 || value.indexOf('0X') === 0) {
      return returnType ? 'bytes' : value;
    } else if (!isFinite(value)) {
      return returnType ? 'string' : utf8ToHex(value);
    }
  }

  return returnType ? value < 0 ? 'int256' : 'uint256' : numberToHex(value);
};
/**
 * Check if string is HEX, requires a 0x in front
 *
 * @method isHexStrict
 * @param {String} hex to be checked
 * @returns {Boolean}
 */


var isHexStrict = function isHexStrict(hex) {
  return (_.isString(hex) || _.isNumber(hex)) && /^(-)?0x[0-9a-f]*$/i.test(hex);
};
/**
 * Check if string is HEX
 *
 * @method isHex
 * @param {String} hex to be checked
 * @returns {Boolean}
 */


var isHex = function isHex(hex) {
  return (_.isString(hex) || _.isNumber(hex)) && /^(-0x|0x)?[0-9a-f]*$/i.test(hex);
};
/**
 * Returns true if given string is a valid Ethereum block header bloom.
 *
 * @method isBloom
 * @param {String} bloom encoded bloom filter
 * @return {Boolean}
 */


var isBloom = function isBloom(bloom) {
  return ethereumBloomFilters.isBloom(bloom);
};
/**
 * Returns true if the ethereum users address is part of the given bloom 
 * note: false positives are possible.
 *
 * @method isUserEthereumAddressInBloom
 * @param {String} ethereumAddress encoded bloom filter
 * @param {String} bloom ethereum addresss
 * @return {Boolean}
 */


var isUserEthereumAddressInBloom = function isUserEthereumAddressInBloom(bloom, ethereumAddress) {
  return ethereumBloomFilters.isUserEthereumAddressInBloom(bloom, ethereumAddress);
};
/**
 * Returns true if the contract address is part of the given bloom 
 * note: false positives are possible.
 *
 * @method isUserEthereumAddressInBloom
 * @param {String} bloom encoded bloom filter
 * @param {String} contractAddress contract addresss
 * @return {Boolean}
 */


var isContractAddressInBloom = function isContractAddressInBloom(bloom, contractAddress) {
  return ethereumBloomFilters.isContractAddressInBloom(bloom, contractAddress);
};
/**
 * Returns true if given string is a valid log topic.
 *
 * @method isTopic
 * @param {String} topic encoded topic
 * @return {Boolean}
 */


var isTopic = function isTopic(topic) {
  return ethereumBloomFilters.isTopic(topic);
};
/**
 * Returns true if the topic is part of the given bloom
 * note: false positives are possible.
 *
 * @method isTopicInBloom
 * @param {String} bloom encoded bloom filter
 * @param {String} topic encoded topic
 * @return {Boolean}
 */


var isTopicInBloom = function isTopicInBloom(bloom, topic) {
  return ethereumBloomFilters.isTopicInBloom(bloom, topic);
};
/**
 * Returns true if the value is part of the given bloom
 * note: false positives are possible.
 *
 * @method isInBloom
 * @param {String} bloom encoded bloom filter
 * @param {String | Uint8Array} topic encoded value
 * @return {Boolean}
 */


var isInBloom = function isInBloom(bloom, topic) {
  return ethereumBloomFilters.isInBloom(bloom, topic);
};
/**
 * Hashes values to a sha3 hash using keccak 256
 *
 * To hash a HEX string the hex must have 0x in front.
 *
 * @method sha3
 * @return {String} the sha3 string
 */


var SHA3_NULL_S = '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470';

var sha3 = function sha3(value) {
  if (isBN(value)) {
    value = value.toString();
  }

  if (isHexStrict(value) && /^0x/i.test(value.toString())) {
    value = hexToBytes(value);
  }

  var returnValue = Hash.keccak256(value); // jshint ignore:line

  if (returnValue === SHA3_NULL_S) {
    return null;
  } else {
    return returnValue;
  }
}; // expose the under the hood keccak256


sha3._Hash = Hash;
/**
 * @method sha3Raw
 *
 * @param value
 *
 * @returns {string}
 */

var sha3Raw = function sha3Raw(value) {
  value = sha3(value);

  if (value === null) {
    return SHA3_NULL_S;
  }

  return value;
};

module.exports = {
  BN: BN,
  isBN: isBN,
  isBigNumber: isBigNumber,
  toBN: toBN,
  isAddress: isAddress,
  isBloom: isBloom,
  isUserEthereumAddressInBloom: isUserEthereumAddressInBloom,
  isContractAddressInBloom: isContractAddressInBloom,
  isTopic: isTopic,
  isTopicInBloom: isTopicInBloom,
  isInBloom: isInBloom,
  checkAddressChecksum: checkAddressChecksum,
  utf8ToHex: utf8ToHex,
  hexToUtf8: hexToUtf8,
  hexToNumber: hexToNumber,
  hexToNumberString: hexToNumberString,
  numberToHex: numberToHex,
  toHex: toHex,
  hexToBytes: hexToBytes,
  bytesToHex: bytesToHex,
  isHex: isHex,
  isHexStrict: isHexStrict,
  leftPad: leftPad,
  rightPad: rightPad,
  toTwosComplement: toTwosComplement,
  sha3: sha3,
  sha3Raw: sha3Raw
};

}).call(this,{"isBuffer":require("../../../node_modules/is-buffer/index.js")})

},{"../../../node_modules/is-buffer/index.js":5,"bn.js":50,"eth-lib/lib/hash":51,"ethereum-bloom-filters":52,"number-to-bn":59,"underscore":63,"utf8":64}],"BN":[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"buffer":2,"dup":47}],"Web3EthAbi":[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
 This file is part of web3.js.

 web3.js is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 web3.js is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @file index.js
 * @author Marek Kotewicz <marek@parity.io>
 * @author Fabian Vogelsteller <fabian@frozeman.de>
 * @date 2018
 */
var Buffer = require('buffer').Buffer;

var _ = require('underscore');

var utils = require('web3-utils');

var EthersAbiCoder = require('@ethersproject/abi').AbiCoder;

var ParamType = require('@ethersproject/abi').ParamType;

var ethersAbiCoder = new EthersAbiCoder(function (type, value) {
  if (type.match(/^u?int/) && !_.isArray(value) && (!_.isObject(value) || value.constructor.name !== 'BN')) {
    return value.toString();
  }

  return value;
}); // result method

function Result() {}
/**
 * ABICoder prototype should be used to encode/decode solidity params of any type
 */


var ABICoder = function ABICoder() {};
/**
 * Encodes the function name to its ABI representation, which are the first 4 bytes of the sha3 of the function name including  types.
 *
 * @method encodeFunctionSignature
 * @param {String|Object} functionName
 * @return {String} encoded function name
 */


ABICoder.prototype.encodeFunctionSignature = function (functionName) {
  if (_.isObject(functionName)) {
    functionName = utils._jsonInterfaceMethodToString(functionName);
  }

  return utils.sha3(functionName).slice(0, 10);
};
/**
 * Encodes the function name to its ABI representation, which are the first 4 bytes of the sha3 of the function name including  types.
 *
 * @method encodeEventSignature
 * @param {String|Object} functionName
 * @return {String} encoded function name
 */


ABICoder.prototype.encodeEventSignature = function (functionName) {
  if (_.isObject(functionName)) {
    functionName = utils._jsonInterfaceMethodToString(functionName);
  }

  return utils.sha3(functionName);
};
/**
 * Should be used to encode plain param
 *
 * @method encodeParameter
 *
 * @param {String|Object} type
 * @param {any} param
 *
 * @return {String} encoded plain param
 */


ABICoder.prototype.encodeParameter = function (type, param) {
  return this.encodeParameters([type], [param]);
};
/**
 * Should be used to encode list of params
 *
 * @method encodeParameters
 *
 * @param {Array<String|Object>} types
 * @param {Array<any>} params
 *
 * @return {String} encoded list of params
 */


ABICoder.prototype.encodeParameters = function (types, params) {
  var bytesToEvenLength = function bytesToEvenLength(param) {
    if (Buffer.isBuffer(param)) {
      param = utils.toHex(param);
    } // bitwise AND operator returns true if odd


    if (param.length & 1) {
      return '0x0' + param.substring(2);
    }

    return param;
  };

  var bytes32ToFixedLength = function bytes32ToFixedLength(param) {
    if (Buffer.isBuffer(param)) {
      param = utils.toHex(param);
    }

    if (param.length < 66) {
      // 66 includes `0x`
      return utils.rightPad(param, 64);
    }

    return param;
  };

  return ethersAbiCoder.encode(this.mapTypes(types), params.map(function (param, index) {
    var type = types[index];

    if (_typeof(type) === 'object' && type.type) {
      // We may get a named type of shape {name, type}
      type = type.type;
    } // Format BN to string


    if (utils.isBN(param) || utils.isBigNumber(param)) {
      return param.toString(10);
    } // Convert odd-length bytes to even


    if (type === 'bytes') {
      param = bytesToEvenLength(param);
    } else if (type === 'bytes[]') {
      param = param.map(function (p) {
        return bytesToEvenLength(p);
      });
    } // Convert bytes32 to fixed length


    if (type === 'bytes32') {
      param = bytes32ToFixedLength(param);
    } else if (type === 'bytes32[]') {
      param = param.map(function (p) {
        return bytes32ToFixedLength(p);
      });
    } // Format tuples for above rules


    if (typeof type === 'string' && type.includes('tuple')) {
      var _coder = ethersAbiCoder._getCoder(ParamType.from(type));

      var modifyParams = function modifyParams(coder, param) {
        coder.coders.forEach(function (c, i) {
          if (c.name === 'bytes') {
            param[i] = bytesToEvenLength(param[i]);
          } else if (c.name === 'bytes32') {
            param[i] = bytes32ToFixedLength(param[i]);
          } else if (c.name === 'tuple') {
            modifyParams(c, param[i]);
          }
        });
      };

      modifyParams(_coder, param);
    }

    return param;
  }));
};
/**
 * Map types if simplified format is used
 *
 * @method mapTypes
 * @param {Array} types
 * @return {Array}
 */


ABICoder.prototype.mapTypes = function (types) {
  var self = this;
  var mappedTypes = [];
  types.forEach(function (type) {
    if (self.isSimplifiedStructFormat(type)) {
      var structName = Object.keys(type)[0];
      mappedTypes.push(Object.assign(self.mapStructNameAndType(structName), {
        components: self.mapStructToCoderFormat(type[structName])
      }));
      return;
    }

    mappedTypes.push(type);
  });
  return mappedTypes;
};
/**
 * Check if type is simplified struct format
 *
 * @method isSimplifiedStructFormat
 * @param {string | Object} type
 * @returns {boolean}
 */


ABICoder.prototype.isSimplifiedStructFormat = function (type) {
  return _typeof(type) === 'object' && typeof type.components === 'undefined' && typeof type.name === 'undefined';
};
/**
 * Maps the correct tuple type and name when the simplified format in encode/decodeParameter is used
 *
 * @method mapStructNameAndType
 * @param {string} structName
 * @return {{type: string, name: *}}
 */


ABICoder.prototype.mapStructNameAndType = function (structName) {
  var type = 'tuple';

  if (structName.indexOf('[]') > -1) {
    type = 'tuple[]';
    structName = structName.slice(0, -2);
  }

  return {
    type: type,
    name: structName
  };
};
/**
 * Maps the simplified format in to the expected format of the ABICoder
 *
 * @method mapStructToCoderFormat
 * @param {Object} struct
 * @return {Array}
 */


ABICoder.prototype.mapStructToCoderFormat = function (struct) {
  var self = this;
  var components = [];
  Object.keys(struct).forEach(function (key) {
    if (_typeof(struct[key]) === 'object') {
      components.push(Object.assign(self.mapStructNameAndType(key), {
        components: self.mapStructToCoderFormat(struct[key])
      }));
      return;
    }

    components.push({
      name: key,
      type: struct[key]
    });
  });
  return components;
};
/**
 * Encodes a function call from its json interface and parameters.
 *
 * @method encodeFunctionCall
 * @param {Array} jsonInterface
 * @param {Array} params
 * @return {String} The encoded ABI for this function call
 */


ABICoder.prototype.encodeFunctionCall = function (jsonInterface, params) {
  return this.encodeFunctionSignature(jsonInterface) + this.encodeParameters(jsonInterface.inputs, params).replace('0x', '');
};
/**
 * Should be used to decode bytes to plain param
 *
 * @method decodeParameter
 * @param {String} type
 * @param {String} bytes
 * @return {Object} plain param
 */


ABICoder.prototype.decodeParameter = function (type, bytes) {
  return this.decodeParameters([type], bytes)[0];
};
/**
 * Should be used to decode list of params
 *
 * @method decodeParameter
 * @param {Array} outputs
 * @param {String} bytes
 * @return {Array} array of plain params
 */


ABICoder.prototype.decodeParameters = function (outputs, bytes) {
  if (outputs.length > 0 && (!bytes || bytes === '0x' || bytes === '0X')) {
    throw new Error('Returned values aren\'t valid, did it run Out of Gas? ' + 'You might also see this error if you are not using the ' + 'correct ABI for the contract you are retrieving data from, ' + 'requesting data from a block number that does not exist, ' + 'or querying a node which is not fully synced.');
  }

  var res = ethersAbiCoder.decode(this.mapTypes(outputs), '0x' + bytes.replace(/0x/i, ''));
  var returnValue = new Result();
  returnValue.__length__ = 0;
  outputs.forEach(function (output, i) {
    var decodedValue = res[returnValue.__length__];
    decodedValue = decodedValue === '0x' ? null : decodedValue;
    returnValue[i] = decodedValue;

    if (_.isObject(output) && output.name) {
      returnValue[output.name] = decodedValue;
    }

    returnValue.__length__++;
  });
  return returnValue;
};
/**
 * Decodes events non- and indexed parameters.
 *
 * @method decodeLog
 * @param {Object} inputs
 * @param {String} data
 * @param {Array} topics
 * @return {Array} array of plain params
 */


ABICoder.prototype.decodeLog = function (inputs, data, topics) {
  var _this = this;

  topics = _.isArray(topics) ? topics : [topics];
  data = data || '';
  var notIndexedInputs = [];
  var indexedParams = [];
  var topicCount = 0; // TODO check for anonymous logs?

  inputs.forEach(function (input, i) {
    if (input.indexed) {
      indexedParams[i] = ['bool', 'int', 'uint', 'address', 'fixed', 'ufixed'].find(function (staticType) {
        return input.type.indexOf(staticType) !== -1;
      }) ? _this.decodeParameter(input.type, topics[topicCount]) : topics[topicCount];
      topicCount++;
    } else {
      notIndexedInputs[i] = input;
    }
  });
  var nonIndexedData = data;
  var notIndexedParams = nonIndexedData ? this.decodeParameters(notIndexedInputs, nonIndexedData) : [];
  var returnValue = new Result();
  returnValue.__length__ = 0;
  inputs.forEach(function (res, i) {
    returnValue[i] = res.type === 'string' ? '' : null;

    if (typeof notIndexedParams[i] !== 'undefined') {
      returnValue[i] = notIndexedParams[i];
    }

    if (typeof indexedParams[i] !== 'undefined') {
      returnValue[i] = indexedParams[i];
    }

    if (res.name) {
      returnValue[res.name] = returnValue[i];
    }

    returnValue.__length__++;
  });
  return returnValue;
};

var coder = new ABICoder();
module.exports = coder;

},{"@ethersproject/abi":22,"buffer":3,"underscore":49,"web3-utils":65}]},{},[7,"Web3EthAbi"])("Web3EthAbi")
});
//# sourceMappingURL=web3-eth-abi.js.map
