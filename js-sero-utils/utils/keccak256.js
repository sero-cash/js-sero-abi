'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.keccak256 = void 0;
var sha3 = require("js-sha3");
var bytes_1 = require("./bytes");
function keccak256(data) {
    return '0x' + sha3.keccak_256(bytes_1.arrayify(data));
}
exports.keccak256 = keccak256;
