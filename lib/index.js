
var contract = require('./abi/index');
var rlp = require('rlp');

var getAddress = require('../js-sero-utils/utils').getAddress;

var createContract = function (abi,data){
    var factory= new contract(abi,data);
    return  factory;
};

var callContract = function (abi,address) {
    var factory= new contract(abi);
    factory.at(address);
    return  factory;
};


var pkrToContractAddr = function (pkr){
    return getAddress(pkr);
}

module.exports = {
    createContract:createContract,
    callContract:callContract,
    pkrToContractAddr:pkrToContractAddr,
};
