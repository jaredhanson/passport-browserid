/**
 * Module dependencies.
 */
var https = require('https')
  , jwcrypto = require('jwcrypto');

var WELL_KNOWN_PATH = '/.well-known/browserid';

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
module.exports = function() {
  
  return function(issuer, done) {
    
    function fetch(issuer, cb) {
      var segments = issuer.split(':')
        , host = segments[0]
        , port = segments[1] ? parseInt(segments[1]) : 443;
      
      var headers = {};
      headers['Host'] = host;
      headers['Accept'] = 'application/json';
  
      var options = {
        host: host,
        port: port,
        path: WELL_KNOWN_PATH,
        method: 'GET',
        headers: headers
      };
      
      //console.log('ISSUING REQUEST');
      //console.log(options)
  
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
            if (typeof doc.authority !== 'object') {
              return cb(new Error("Malformed authority in support document."));
            }
            
            // TODO: Implement support for fetching support document from authority.
          }
          if (!doc['public-key']) {
            return cb(new Error("Missing public key in support document."));
          }
          return cb(null, doc['public-key']);
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
