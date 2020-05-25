/*
    This file is part of contract.js.

    contract.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    contract.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with contract.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file function.js
 * @author Marek Kotewicz <marek@ethdev.com>
 * @date 2015
 */

var coder = require('../solidity/coder');
var utils = require('../../utils/utils');
var errors = require('./errors');
var sha3 = require('../../utils/sha3');
/**
 * This prototype should be used to call/sendTransaction to solidity functions
 */
var SolidityFunction = function (json, address) {
    this._inputTypes = json.inputs.map(function (i) {
        return i.type;
    });
    this._outputTypes = json.outputs.map(function (i) {
        return i.type;
    });
    this._constant = json.constant;
    this._payable = json.payable;
    this._name = utils.transformToFullName(json);
    this._address = address;
};

/**
 * Should be called to check if the number of arguments is correct
 *
 * @method validateArgs
 * @param {Array} arguments
 * @throws {Error} if it is not
 */
SolidityFunction.prototype.validateArgs = function (args) {
    if (!this._address){
        throw errors.ContractAddressIsNull();
    }
    var inputArgs = args.filter(function (a) {
      // filter the options object but not arguments that are arrays
      return !(utils.isObject(a) === true && utils.isArray(a) === false);
    });
    if (inputArgs.length !== this._inputTypes.length) {
        throw errors.InvalidNumberOfSolidityArgs();
    }
};


SolidityFunction.prototype.validateAddress = function (args) {

    var addressParams = coder.addressParams(this._inputTypes,args)
    if (addressParams) {
        addressParams.forEach(function(a){
            if (a.length!=192){
                throw errors.InvalidAddressParam(a);
            }
        });
    }
};



/**
 * Should be used to create payload from arguments
 *
 * @method toPayload
 * @param {Array} solidity function params
 * @param {Object} optional payload options
 */
SolidityFunction.prototype.toPayload = function (args) {
    var options = {};
    if (args.length > this._inputTypes.length && utils.isObject(args[args.length -1])) {
        options = args[args.length - 1];
    }
    this.validateArgs(args);
    this.validateAddress(args);
    var rand = this.getRand();
    var prefix = coder.addressPrefix(this._inputTypes,args,rand)
    options.to = this._address;
    options.data = prefix + this.signature() + coder.encodeParams(this._inputTypes, args);
    return options;
};

SolidityFunction.prototype.getRand = function() {
   var contractHex = utils.bs58ToHex(this._address,true);
   return contractHex.substr(0,34);
}

/**
 * Should be used to get function signature
 *
 * @method signature
 * @return {String} function signature
 */
SolidityFunction.prototype.signature = function () {
    return sha3(this._name).slice(0, 8);
};


SolidityFunction.prototype.unpackOutput = function (output) {
    if (!output) {
        return;
    }

    output = output.length >= 2 ? output.slice(2) : output;
    var result = coder.decodeParams(this._outputTypes, output);
    return result.length === 1 ? result[0] : result;
};

SolidityFunction.prototype.unpackOutputAddress = function (output) {
    if (!output) {
        return;
    }
    output = output.length >= 2 ? output.slice(2) : output;
    var result = coder.decodeAddressParams(this._outputTypes, output);
    return result.length === 1 ? result[0] : result;
};


/**
 * Return the encoded data of the call
 *
 * @method getData
 * @return {String} the encoded data
 */
SolidityFunction.prototype.getData = function () {
    var args = Array.prototype.slice.call(arguments);
    var payload = this.toPayload(args);

    return payload.data;
};

/**
 * Should be used to get function display name
 *
 * @method displayName
 * @return {String} display name of the function
 */
SolidityFunction.prototype.displayName = function () {
    return utils.extractDisplayName(this._name);
};

/**
 * Should be used to get function type name
 *
 * @method typeName
 * @return {String} type name of the function
 */
SolidityFunction.prototype.typeName = function () {
    return utils.extractTypeName(this._name);
};


SolidityFunction.prototype.IsConstant = function () {
    return this._constant
};

/**
 * Should be called to attach function to contract
 *
 * @method attachToContract
 * @param {Contract}
 */
SolidityFunction.prototype.attachToContract = function (contract) {
    var execute =  this.getData.bind(this);
    execute.getData=this.getData.bind(this);
    execute.unpackOutput=this.unpackOutput.bind(this)
    execute.unpackOutputAddress=this.unpackOutputAddress.bind(this)
    var displayName = this.displayName();
    if (!contract[displayName]) {
        contract[displayName] = execute;
    }
    contract[displayName][this.typeName()] = execute; // circular!!!!
};

module.exports = SolidityFunction;
