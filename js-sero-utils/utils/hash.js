'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashMessage = exports.id = exports.namehash = void 0;
var errors = __importStar(require("../errors"));
var bytes_1 = require("./bytes");
var utf8_1 = require("./utf8");
var keccak256_1 = require("./keccak256");
///////////////////////////////
var Zeros = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
var Partition = new RegExp("^((.*)\\.)?([^.]+)$");
var UseSTD3ASCIIRules = new RegExp("^[a-z0-9.-]*$");
function namehash(name) {
    if (typeof (name) !== 'string') {
        errors.throwError('invalid address - ' + String(name), errors.INVALID_ARGUMENT, {
            argument: 'name',
            value: name
        });
    }
    name = name.toLowerCase();
    // Supporting the full UTF-8 space requires additional (and large)
    // libraries, so for now we simply do not support them.
    // It should be fairly easy in the future to support systems with
    // String.normalize, but that is future work.
    if (!name.match(UseSTD3ASCIIRules)) {
        errors.throwError('contains invalid UseSTD3ASCIIRules characters', errors.INVALID_ARGUMENT, {
            argument: 'name',
            value: name
        });
    }
    var result = Zeros;
    while (name.length) {
        var partition = name.match(Partition);
        var label = utf8_1.toUtf8Bytes(partition[3]);
        result = keccak256_1.keccak256(bytes_1.concat([result, keccak256_1.keccak256(label)]));
        name = partition[2] || '';
    }
    return bytes_1.hexlify(result);
}
exports.namehash = namehash;
function id(text) {
    return keccak256_1.keccak256(utf8_1.toUtf8Bytes(text));
}
exports.id = id;
function hashMessage(message) {
    return keccak256_1.keccak256(bytes_1.concat([
        utf8_1.toUtf8Bytes('\x19Ethereum Signed Message:\n'),
        utf8_1.toUtf8Bytes(String(message.length)),
        ((typeof (message) === 'string') ? utf8_1.toUtf8Bytes(message) : message)
    ]));
}
exports.hashMessage = hashMessage;
