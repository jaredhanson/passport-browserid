/**
 * Module dependencies.
 */
var passport = require('passport')
  , util = require('util')


function Strategy(options, validate) {
  passport.Strategy.call(this);
  this.name = 'browserid';
  this._validate = validate;
  
  this._assertionField = options.assertionField || 'assertion';
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);


Strategy.prototype.authenticate = function(req) {
  console.log('BrowserIDStrategy#authenticate');
  console.log('  body: ' + util.inspect(req.body));
  
  if (!req.body || !req.body[this._assertionField]) {
    return this.fail();
  }

  var assertion = req.body[this._assertionField];

  var self = this;
  
  /*
  this.verify(assertion, function(err, user) {
    if (err) { return self.error(err); }
    if (!user) { return self.fail(); }
    self.success(user);
  });
  */
}


/**
 * Expose `Strategy`.
 */ 
module.exports = Strategy;
