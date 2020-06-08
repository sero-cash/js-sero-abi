var utils = require('../utils/utils');
var coder = require('./solidity/coder');
var SolidityEvent = require('./contract/event');
var SolidityFunction = require('./contract/function');
var randombytes = require('randombytes')
var erros = require('./contract/errors')
var Web3EthAbi = require('./web3-abi');
var abiCoder = require('./abiv2');

/**
 * Should be called to encode constructor params
 *
 * @method encodeConstructorParams
 * @param {Array} abi
 * @param {Array} constructor params
 */
var encodeConstructorParams = function (abi, params) {
    return abi.filter(function (json) {
        return json.type === 'constructor' && json.inputs.length === params.length;
    }).map(function (json) {
        return json.inputs.map(function (input) {
            return input.type;
        });
    }).map(function (types) {
        var addressParams = coder.addressParams(types,params)
        if (addressParams) {
            addressParams.forEach(function(a){
                if (a.length!=192){
                    throw errors.InvalidAddressParam(a);
                }
            });
        }
        return coder.encodeParams(types, params);
    })[0] || '';
};

var encodeConstructorPrefix = function (abi, params) {
    var rand =utils.bytesToHex(new randombytes(16));
    var defaultRandPrefix= '0x'+utils.padRight(rand.substr(2),36)
    return abi.filter(function (json) {
        return json.type === 'constructor' && json.inputs.length === params.length;
    }).map(function (json) {
        return json.inputs.map(function (input) {
            return input.type;
        });
    }).map(function (types) {
        return coder.addressPrefix(types, params,rand);
    })[0] || defaultRandPrefix
};


/**
 * Should be called to add functions to contract object
 *
 * @method addFunctionsToContract
 * @param {Contract} contract
 * @param {Array} abi
 */
var addFunctionsToContract = function (contract) {
    contract.abi.filter(function (json) {
        return json.type === 'function';
    }).map(function (json) {
        return new SolidityFunction(json, contract.address);
    }).forEach(function (f) {
        f.attachToContract(contract);
    });
};


/**
 * Should be called to create new ContractFactory instance
 *
 * @method ContractFactory
 * @param {Array} abi
 */
var ContractFactory = function (abi,data) {
    this.abi = abi;
    this.data = data
    // addFunctionsToContract(this);
    // addEventsToContract(this);
};

ContractFactory.prototype.at = function (address) {
    this.address = address;
    addFunctionsToContract(this);
};



ContractFactory.prototype.isPayable = function (method) {
    var abi={}
    if (method) {
         abi = this.abi.filter(function (json) {
            return json.type === "function" && json.name === method;
        })[0] || {};
    }else{
         abi = this.abi.filter(function (json) {
            return json.type === 'constructor';
        })[0] || {};
    }
    if (abi.payable){
        return true;
    }else {
        return false;
    }

}



ContractFactory.prototype.encodeConstructorParams =function(){
    var args = Array.prototype.slice.call(arguments);
    var last = args[args.length - 1];
    if (utils.isObject(last) && !utils.isArray(last)) {
        options = args.pop();
    }
    var constructorAbi = this.abi.filter(function (json) {
        return json.type === 'constructor';
    })[0];

    if (!constructorAbi){
        throw erros.ConstructorIsNull()
    }
    if (constructorAbi.inputs.length != args.length){
        throw erros.InvalidParamsLength(constructorAbi.inputs.length,args.length);
    }
    var prefix= encodeConstructorPrefix(this.abi,args)
    var bytes = encodeConstructorParams(this.abi, args);
    var constructData=prefix+this.data.substr(2)+bytes
    return constructData

}

ContractFactory.prototype.packData =function(method,params,v2){
    if (v2){
        var contractHex = utils.bs58ToHex(this.address,true);
        var rand = contractHex.substr(0,34);
        var types= this.abi.filter(function (json) {
            return json.type === 'function' && json.name === method;
        })[0]
        if (types){
            var data = abiCoder.encodeParameters(types.inputs,params,rand);
            console.log("data>>>",data )
            var prefix = abiCoder.encodeParametersPrefix(types.inputs,params,rand);
            var sign = abiCoder.encodeFunctionSignature(types).substr(2);
            return prefix+sign+data;
        }else {
            throw new Error("method not exist");
        }


    }else {
        if (!params){
            params = [];
        }
        var that=this;
        var result = this.abi.filter(function (json) {
            return json.type === 'function' && json.name === method;
        }).map(function (json) {
            return new SolidityFunction(json, that.address);
        }).map(function (f) {
            return f.toPayload(params);
        })[0]

        return result.data;
    }

}



ContractFactory.prototype.unPackData=function(method,outData){
    var that=this;
    var result = this.abi.filter(function (json) {
        return json.type === 'function' && json.name === method;
    }).map(function (json) {
        return new SolidityFunction(json, that.address);
    }).map(function (f) {
        return f.unpackOutput(outData);
    })[0]

    return result;
}

ContractFactory.prototype.unPackDataEx=function(method,outData){
    var result = this.abi.filter(function (json) {
        return json.type === 'function' && json.name === method;
    }).map(function (json) {
        return Web3EthAbi.decodeParameters(json.outputs,outData);
    })[0];
    return result;
}

ContractFactory.prototype.unPackAddressData=function(method,outData){
    var that=this;
    var result = this.abi.filter(function (json) {
        return json.type === 'function' && json.name === method;
    }).map(function (json) {
        return new SolidityFunction(json, that.address);
    }).map(function (f) {
        return f.unpackOutputAddress(outData);
    })[0]
    return result;
}

ContractFactory.prototype.unPackEventData = function(event,log){
    var that=this;
    var result = this.abi.filter(function (json) {
        return json.type === 'event' && json.name === event;
    }).map(function (json) {
        return new SolidityEvent(json, that.address);
    }).map(function (f) {
        return f.unpackOutput(log);
    })[0]
    return result;
}

ContractFactory.prototype.unPackEventAddressData = function(event,log){
    var that=this;
    var result = this.abi.filter(function (json) {
        return json.type === 'event' && json.name === event;
    }).map(function (json) {
        return new SolidityEvent(json, that.address);
    }).map(function (f) {
        return f.unpackOutputAddress(log);
    })[0]
    return result;
}


module.exports = ContractFactory;
