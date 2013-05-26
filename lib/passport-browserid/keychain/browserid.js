/**
 * Module dependencies.
 */
var https = require('https')
  , jwcrypto = require('jwcrypto');

var WELL_KNOWN_PATH = '/.well-known/browserid';
var MAX_DELEGATIONS = 6;

/**
 * Load public key from BrowserID support document.
 *
 * BrowserID IdPs store their public key in a support document that resides
 * at the well-known location `/.well-known/browserid`.  When verifying
 * assertions, this document is loaded in order to obtain the public key.
 *
 * References:
 *   - [.well-known-browserid](https://developer.mozilla.org/en-US/docs/Mozilla/Persona/.well-known-browserid)
 *   - [BrowserID](https://github.com/mozilla/id-specs/blob/prod/browserid/index.md)
 *
 * @return {Function}
 * @api protected
 */
exports = module.exports = function() {
  
  return function(issuer, done) {
    
    function fetch(domain, chain, cb) {
      if (typeof chain == 'function') {
        cb = chain;
        chain = [ domain ];
      }
      
      var headers = {};
      headers['Host'] = domain;
      headers['Accept'] = 'application/json';
  
      var options = {
        host: domain,
        path: WELL_KNOWN_PATH,
        method: 'GET',
        headers: headers
      };
  
      var req = https.request(options, function(res) {
        var data = '';
    
        res.on('data', function(chunk) {
          data += chunk;
        });
        res.on('end', function() {
          if (res.statusCode !== 200) {
            return cb(new Error("Issuer is not a BrowserID IdP. Non-200 status code for support document."));
          }
          if (res.headers['content-type'].indexOf('application/json') !== 0) {
            return cb(new Error("Issuer is not a BrowserID IdP. Non \"application/json\" content type for support document."));
          }
      
          var doc;
          try {
            doc = JSON.parse(data);
          } catch (ex) {
            return cb(ex);
          }
          
          if (typeof doc !== 'object') {
            return cb(new Error("Support document must contain a JSON object."));
          }
          
          
          if (doc.authority) {
            if (typeof doc.authority !== 'string') {
              return cb(new Error("Malformed authority in support document."));
            }
            
            var authority = doc.authority;
            
            // check for cycles in delegation
            if (chain.indexOf(authority) !== -1) {
              return cb(new Error("Circular reference in delegation chain: " + chain.join(" > ")));
            }
            chain.push(doc.authority);
            
            if (chain.length > MAX_DELEGATIONS) {
              return cb(new Error("Maximum number of delegations exceeded: " + chain.join(" > ")));
            }
            
            return fetch(doc.authority, chain, cb);
          }
          if (!doc['public-key']) {
            return cb(new Error("Missing public key in support document."));
          }
          return cb(null, doc['public-key'], chain);
        });
      });
      req.on('error', function(err) {
        cb(err);
      });
      req.end();
    }
  
    fetch(issuer, done);
  }
}

exports.wellknown = exports();
