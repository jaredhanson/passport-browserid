/**
 * Module dependencies.
 */
var passport = require('passport-strategy')
  , jwcrypto = require('browserid-crypto')
  , pki = require('./pki')
  , wellknown = require('./keychain/browserid').wellknown
  , util = require('util')
  , BadRequestError = require('./errors/badrequesterror')
  , VerificationError = require('./errors/verificationerror');


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
  if (!options.audience) throw new Error('BrowserID authentication requires an audience option');
  if (!verify) throw new Error('BrowserID authentication strategy requires a verify function');
  
  passport.Strategy.call(this);
  this.name = 'browserid';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
  
  this._audience = options.audience;
  this._assertionField = options.assertionField || 'assertion';
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
    return this.fail(new BadRequestError('Missing assertion'));
  }

  // Get the Backed Identity Assertion from the request.  This is a sequence
  // (typically just one) of Identity Certificates followed by an
  // Identity Assertion.
  var assertion = req.body[this._assertionField];
  
  try {
    // debug logging used to inspect the components of the assertion
    /*
    var bida = jwcrypto.cert.unbundle(assertion);
    console.log(bida);
    var idcert = jwcrypto.extractComponents(bida.certs[0]);
    console.log(idcert);
    var idassert = jwcrypto.extractComponents(bida.signedAssertion);
    console.log(idassert);
    */
    
    // Ask `jwcrypto` to verify the Backed Identity Assertion.
    var now = new Date();
    jwcrypto.cert.verifyBundle(assertion, now, pki.root, function(err, certArray, payload, assertionParams) {
      if (err) { return self.error(err); }
      
      if (certArray.length > 1) {
        return self.error(new Error("certificate chaining is not yet allowed"));
      }
      
      // TODO: Audience checking
      
      // root issuer is in the first cert
      var rootIssuer = certArray[0].assertionParams.issuer;
      // principal is in the last cert
      var principal = certArray[certArray.length - 1].certParams.principal;
      var email = principal.email;
      if (!email) {
        return self.error(new Error("missing email in identity certificate"));
      }
      var domain = email.replace(/^.*@/, '');
      
      // FIXME: What is the best practice for checking delegation when fallback
      //        IdPs are involved?  For example, issuer is login.persona.org
      //        but domain is gmail.com.  There's no delegation chain from gmail.com
      //        to login.persona.org, so this check would always fail.
      /*
      if (rootIssuer != domain) {
        console.log('CHECKING DELEGATION: ' + domain + ' > ' + rootIssuer);
        
        wellknown(domain, function(err, _, chain) {
          if (err) { return self.error(err); }
          
          var authority = chain[chain.length - 1];
          var ok = (authority === domain);
        });
      }
      */
      
      function done(err, user, info) {
        if (err) { return self.error(err); }
        if (!user) { return self.fail(info); }
        self.success(user, info);
      }
      
      if (self._passReqToCallback) {
        var arity = self._verify.length;
        if (arity == 4) {
          self._verify(req, email, rootIssuer, done);
        } else {
          self._verify(req, email, done);
        }
      } else {
        var arity = self._verify.length;
        if (arity == 3) {
          self._verify(email, rootIssuer, done);
        } else {
          self._verify(email, done);
        }
      }
    });
  } catch (ex) {
    return self.error(ex);
  }
}


/**
 * Expose `Strategy`.
 */ 
module.exports = Strategy;
