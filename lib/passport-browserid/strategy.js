/**
 * Module dependencies.
 */
var passport = require('passport')
  , https = require('https')
  , querystring = require('querystring')
  , util = require('util')


function Strategy(options, validate) {
  if (!options.audience) throw new Error('BrowserID authentication requires an audience option');
  if (!validate) throw new Error('BrowserID authentication strategy requires a validate function');
  
  passport.Strategy.call(this);
  this.name = 'browserid';
  this._validate = validate;
  
  this._audience = options.audience;
  this._assertionField = options.assertionField || 'assertion';
  
  // options used to inject mock objects for testing purposes
  this._https = options.transport || https;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);


Strategy.prototype.authenticate = function(req) {
  var self = this;
  
  if (!req.body || !req.body[this._assertionField]) {
    return this.fail();
  }

  var assertion = req.body[this._assertionField];
  
  var query = querystring.stringify({ assertion: assertion, audience: this._audience });
  var headers = {};
  headers['Host'] = 'browserid.org';
  headers['Content-Type'] = 'application/x-www-form-urlencoded';
  headers['Content-Length'] = query.length;
  
  var options = {
    host: 'browserid.org',
    port: 443,
    path: '/verify',
    method: 'POST',
    headers: headers
  };
  var req = this._https.request(options, function(res) {
    var data = '';
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on('end', function() {
      try {
        var result = JSON.parse(data);
        if (result.status === 'okay') {
          return verified(result)
        } else {
          // TODO: Implement a mechanism in Passport to provide errors when
          //       authentication failures occur.
          // return self.fail(new Error(result.reason));
          return self.fail();
        }
      } catch(err) {
        return self.error(err);
      }
    });
    res.on('error', function(err) {
      return self.error(err);
    });
  });
  req.end(query, 'utf8');
  
  // TODO: Check that the audience matches this server, according to the Host
  //       header.  Also, implement an option to disable this check (defaulting
  //       to false).
  
  function verified(result) {
    self._validate(result.email, function(err, user) {
      if (err) { return self.error(err); }
      if (!user) { return self.fail(); }
      self.success(user);
    });
  }
}


/**
 * Expose `Strategy`.
 */ 
module.exports = Strategy;
