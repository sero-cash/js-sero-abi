
module.exports = {
    InvalidParamsLength: function (need,have) {
        return new Error('invalid params length need ' + need +",but have "+ have);
    },
    ConstructorIsNull: function () {
        return new Error('contract consturctor not exists');
    },
    MethodNotExists: function () {
        return new Error('contract method not exists');
    },
    ContractAddressIsNull: function () {
        return new Error('contract address can not be null');
    },
    InvalidAddressParam: function(a) {
        return new Error('ivalid params address param='+a);
    },
    InvalidNumberOfSolidityArgs: function () {
        return new Error('Invalid number of arguments to Solidity function');
    },
    InvalidNumberOfRPCParams: function () {
        return new Error('Invalid number of input parameters to RPC method');
    },
    InvalidConnection: function (host){
        return new Error('CONNECTION ERROR: Couldn\'t connect to node '+ host +'.');
    },
    InvalidProvider: function () {
        return new Error('Provider not set or invalid');
    },
    InvalidResponse: function (result){
        var message = !!result && !!result.error && !!result.error.message ? result.error.message : 'Invalid JSON RPC response: ' + JSON.stringify(result);
        return new Error(message);
    },
    ConnectionTimeout: function (ms){
        return new Error('CONNECTION TIMEOUT: timeout of ' + ms + ' ms achived');
    }
};
