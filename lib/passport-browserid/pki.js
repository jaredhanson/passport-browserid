/**
 * Module dependencies.
 */
var jwcrypto = require('browserid-crypto')
  , wellknown = require('./keychain/browserid').wellknown;

/**
 * Register algorithms.
 */
require("browserid-crypto/lib/algs/rs");
require("browserid-crypto/lib/algs/ds");


/**
 * Load the public key of the root certificate authority specified by `issuer`.
 *
 * @param {String} issuer
 * @param {Function} done
 * @api protected
 */
exports.root = function(issuer, done) {
  exports.loadPublicKey(issuer, function(err, pubKey) {
    if (err) { return done(err); }
    
    // TODO: Implement method of saving public keys.
    
    try {
      pubKey = jwcrypto.loadPublicKeyFromObject(pubKey);
    } catch (ex) {
      return done(new Error("Malformed public key in support document: " + ex.toString()));
    }
    return done(null, pubKey);
  });
}


var loaders = [];

exports.loadPublicKey = function(issuer, done) {
  if (typeof issuer === 'function') {
    return loaders.push(issuer);
  }
  
  // private implementation that traverses the chain of loaders, attempting to
  // load a public key
  var stack = loaders;
  (function pass(i, err, pk) {
    // error or key was obtained, done
    if (err || pk) { return done(err, pk); }
    
    var layer = stack[i];
    if (!layer) {
      // Locally-implemented methods of loading a public key did not obtain a
      // result.  Proceed to protocol-defined mechanisms in an attempt to
      // load the issuer's public key.
      return wellknown(issuer, done);
    }
    
    try {
      layer(issuer, function(e, k) { pass(i + 1, e, k); } )
    } catch (ex) {
      return done(ex);
    }
  })(0);
}
