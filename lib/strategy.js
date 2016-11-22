/**
 * Module dependencies.
 */
var passport = require('passport-strategy')
  , BrowserID = require('browserid-local-verify')
  , util = require('util');


/**
 * `Strategy` constructor.
 *
 * The BrowserID authentication strategy authenticates requests using the
 * navigator.id JavaScript API and the BrowserID protocol to verify assertions.
 *
 * BrowserID provides a federated and decentralized universal login system for
 * the web, based on email addresses as an identity token.  Authenticating in
 * this this manner involves a sequence of events, including prompting the user,
 * via their user agent, for an assertion of email address ownership.  Once this
 * assertion is obtained, it can be verified and the user can be authenticated.
 *
 * Applications must supply a `verify` callback which accepts an `email`
 * address, and then calls the `done` callback supplying a `user`, which should
 * be set to `false` if the credentials are not valid.  If an exception occured,
 * `err` should be set.
 *
 * Options:
 *   - `audience`        the website requesting and verifying an identity assertion
 *   - `assertionField`  field name where the assertion is found, defaults to 'assertion'
 *   - `passReqToCallback`     when `true`, `req` is the first argument to the verify callback (default: `false`)
 *
 * Examples:
 *
 *     passport.use(new BrowserIDStrategy({
 *         audience: 'http://www.example.com'
 *       },
 *       function(email, done) {
 *         User.findByEmail(email, function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  if (!verify) throw new TypeError('BrowserIDStrategy requires a verify callback');
  if (!options.audience) throw new TypeError('BrowserIDStrategy requires an audience option');
  
  passport.Strategy.call(this);
  this.name = 'browserid';
  this._verify = verify;
  
  var opts = {};
  if (options.trustedIssuers) { opts.trustedIssuers = options.trustedIssuers; }
  if (options.httpRequest) { opts.httpRequest = options.httpRequest; }
  this._browserID = new BrowserID(opts);
  
  this._audience = options.audience;
  this._assertionField = options.assertionField || 'assertion';
  this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);


/**
 * Authenticate request by verifying a BrowserID assertion.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req) {
  var self = this;
  
  if (!req.body || !req.body[this._assertionField]) {
    return this.fail({ message: 'Missing assertion' }, 400);
  }

  // Get the Backed Identity Assertion from the request.  This is a sequence
  // (typically just one) of Identity Certificates followed by an
  // Identity Assertion.
  var assertion = req.body[this._assertionField];
  
  this._browserID.verify({
    assertion: assertion,
    audience: this._audience
  }, function(err, result) {
    if (err) {
      var status;
      
      if (typeof err == 'string') {
        // HACK: `browserid-local-verify` yeilds all errors as string, so we need
        //       to inspect the message to determine useful status.
        if (err.indexOf('audience mismatch') == 0 ||
            err.indexOf('expired') == 0) {
          status = 403;
        }
        err = new Error(err);
      }
      
      if (status) {
        return self.fail({ message: err.message }, status);
      }
      return self.error(err);
    }
    
    function done(err, user, info) {
      if (err) { return self.error(err); }
      if (!user) { return self.fail(info); }
      self.success(user, info);
    }
    
    try {
      if (self._passReqToCallback) {
        var arity = self._verify.length;
        if (arity == 4) {
          self._verify(req, result.email, result.issuer, done);
        } else {
          self._verify(req, result.email, done);
        }
      } else {
        var arity = self._verify.length;
        if (arity == 3) {
          self._verify(result.email, result.issuer, done);
        } else {
          self._verify(result.email, done);
        }
      }
    } catch (ex) {
      return self.error(ex);
    }
  });
}


/**
 * Expose `Strategy`.
 */ 
module.exports = Strategy;
