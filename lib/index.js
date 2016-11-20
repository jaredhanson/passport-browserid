// Load modules.
var Strategy = require('./strategy')
  , pki = require('./pki')


// Expose Strategy.
exports = module.exports = Strategy;

// Exports.
exports.Strategy = Strategy;

/**
 * Export configuration functions.
 */
exports.loadPublicKey = function(fn) {
  pki.loadPublicKey(fn);
}
