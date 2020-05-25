var Serojs = require('./lib/index');

// dont override global variable
if (typeof window !== 'undefined' && typeof window.Serojs === 'undefined') {
    window.Serojs = Serojs;
}

module.exports = Serojs;
