/**
 * Module dependencies.
 */
var Strategy = require('./strategy')
  , pki = require('./pki')


/**
 * Framework version.
 */
require('pkginfo')(module, 'version');

/**
 * Expose constructors.
 */
exports.Strategy = Strategy;

/**
 * Export configuration functions.
 */
exports.loadPublicKey = function(fn) {
  pki.loadPublicKey(fn);
}
