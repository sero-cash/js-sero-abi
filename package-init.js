/* jshint ignore:start */


// Browser environment
if(typeof window !== 'undefined') {
    Serojs = (typeof window.SeroContract !== 'undefined') ? window.Serojs : require('serojs');
    BigNumber = (typeof window.BigNumber !== 'undefined') ? window.BigNumber : require('bignumber.js');
}


// Node environment
if(typeof global !== 'undefined') {
    Serojs = (typeof global.Serojs !== 'undefined') ? global.Serojs : require('serojs-abi');
    BigNumber = (typeof global.BigNumber !== 'undefined') ? global.BigNumber : require('bignumber.js');
}

/* jshint ignore:end */
