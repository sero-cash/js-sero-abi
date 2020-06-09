'use strict';


import errors = require('../errors');

import { BigNumber } from './bignumber';

var bs58 = require('bs58');
var blake2b = require('blake2b');

export function padLeft(string:string, chars:number, sign:string) {
    return new Array(chars - string.length + 1).join(sign ? sign : "0") + string;
};

export function isStrictAddress (address:string) {
    var b = bs58.decode(address);
    if ( b.length != 96 ){
        return false;
    }
    return true ;
};

export function getAddress(address: string): string {

    if (isStrictAddress(address)) {

        var a = bs58.decode(address);

        var bf= Buffer.from("CZERO.HPKR.HASH\0")

        var hash= blake2b(20,null,null,bf);

        var out=hash.update(a);

        var result = out.digest('hex');

        return '0x'+result;
    }else {
        errors.throwError('invalid address', errors.INVALID_ARGUMENT, { arg: 'address', value: address });
    }

    return null;
}

export function shortAddress(address: string): string {

    if (typeof(address) !== 'string') {
        errors.throwError('invalid address', errors.INVALID_ARGUMENT, {arg: 'address', value: address});
    }

    if (!address.match(/^(0x)?[0-9a-fA-F]{40}$/)) {
        errors.throwError('invalid address', errors.INVALID_ARGUMENT, {arg: 'address', value: address});
    }
    return address
}

export function base58ToHex(address:string) :string {
    return bs58.decode(address).toString('hex');
}

export function jionBase58ToHex(addrs:Array<string>) :string {

    var result:Array<string> = [];

    addrs.forEach(function(addr){
        result.push(base58ToHex(addr));
    })
    return result.join("");

}

export function encodeAddrLength(len:number):string {
    if (len>250){
        errors.throwError('invalid address len', "must less than 250", { arg: 'len', value: len });
    }
    var result:string =  padLeft(new BigNumber(len).toHexString().substr(2),4,'0');
    console.log(result);
    return result;
}
