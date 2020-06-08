'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var errors = require("../errors");
var bignumber_1 = require("./bignumber");
var bs58 = require('bs58');
var blake2b = require('blake2b');
function padLeft(string, chars, sign) {
    return new Array(chars - string.length + 1).join(sign ? sign : "0") + string;
}
exports.padLeft = padLeft;
;
function isStrictAddress(address) {
    var b = bs58.decode(address);
    if (b.length != 96) {
        return false;
    }
    return true;
}
exports.isStrictAddress = isStrictAddress;
;
function getAddress(address) {
    if (isStrictAddress(address)) {
        var a = bs58.decode(address);
        var bf = Buffer.from("CZERO.HPKR.HASH\0");
        var hash = blake2b(20, null, null, bf);
        var out = hash.update(a);
        var result = out.digest('hex');
        return '0x' + result;
    }
    else {
        errors.throwError('invalid address', errors.INVALID_ARGUMENT, { arg: 'address', value: address });
    }
    return null;
}
exports.getAddress = getAddress;
function base58ToHex(address) {
    return bs58.decode(address).toString('hex');
}
exports.base58ToHex = base58ToHex;
function jionBase58ToHex(addrs) {
    var result = [];
    addrs.forEach(function (addr) {
        result.push(base58ToHex(addr));
    });
    return result.join("");
}
exports.jionBase58ToHex = jionBase58ToHex;
function encodeAddrLength(len) {
    if (len > 250) {
        errors.throwError('invalid address len', "must less than 250", { arg: 'len', value: len });
    }
    var result = padLeft(new bignumber_1.BigNumber(len).toHexString().substr(2), 4, '0');
    console.log(result);
    return result;
}
exports.encodeAddrLength = encodeAddrLength;
