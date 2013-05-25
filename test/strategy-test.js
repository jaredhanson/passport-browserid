var vows = require('vows');
var assert = require('assert');
var events = require('events');
var util = require('util');
var BrowserIDStrategy = require('passport-browserid/strategy');
var BadRequestError = require('passport-browserid/errors/badrequesterror');
var VerificationError = require('passport-browserid/errors/verificationerror');


/* MockRequest */

function MockRequest() {
  events.EventEmitter.call(this);
};

util.inherits(MockRequest, events.EventEmitter);

MockRequest.prototype.end = function(data, encoding) {
  this.emit('end', data, encoding);
}

/* MockResponse */

function MockResponse() {
  events.EventEmitter.call(this);
};

util.inherits(MockResponse, events.EventEmitter);


vows.describe('BrowserIDStrategy').addBatch({
  
  'strategy': {
    topic: function() {
      return new BrowserIDStrategy({
          audience: 'https://www.example.com'
        },
        function() {}
      );
    },
    
    'should be named browserid': function (strategy) {
      assert.equal(strategy.name, 'browserid');
    },
  },
  
  'strategy handling a request with an assertion that is verified': {
    topic: function() {
      var mockhttps = {
        request : function(options, callback) {
          var req = new MockRequest();
          var res = new MockResponse();
          
          req.on('end', function(data, encoding) {
            if (options.method === 'POST'
                && options.headers['Content-Type'] === 'application/x-www-form-urlencoded'
                && options.headers['Content-Length']
                && data === 'assertion=secret-assertion-data&audience=https%3A%2F%2Fwww.example.com') {
              res.emit('data', JSON.stringify({
                status: 'okay',
                email: 'johndoe@example.net',
                audience: 'https://www.example.com',
                expires: 1322080163206,
                issuer: 'login.persona.org' })
              );
              res.emit('end');
            }
          })
          
          callback(res);
          return req;
        }
      }
      
      var strategy = new BrowserIDStrategy({
          audience: 'https://www.example.com',
          transport: mockhttps
        },
        function(email, done) {
          done(null, { email: email });
        }
      );
      return strategy;
    },
    
    'after augmenting with actions': {
      topic: function(strategy) {
        var self = this;
        var req = {};
        req.body = {};
        req.body['assertion'] = 'secret-assertion-data';
        strategy.success = function(user) {
          req.user = user;
          self.callback(null, req);
        }
        strategy.fail = function() {
          self.callback(new Error('should not be called'));
        }
        
        process.nextTick(function () {
          strategy.authenticate(req);
        });
      },
      
      'should not call fail' : function(err, req) {
        assert.isNull(err);
      },
      'should authenticate' : function(err, req) {
        assert.equal(req.user.email, 'johndoe@example.net');
      },
    },
  },
  
  'strategy handling a request with an assertion that is verified using req argument to callback': {
    topic: function() {
      var mockhttps = {
        request : function(options, callback) {
          var req = new MockRequest();
          var res = new MockResponse();
          
          req.on('end', function(data, encoding) {
            if (options.method === 'POST'
                && options.headers['Content-Type'] === 'application/x-www-form-urlencoded'
                && options.headers['Content-Length']
                && data === 'assertion=secret-assertion-data&audience=https%3A%2F%2Fwww.example.com') {
              res.emit('data', JSON.stringify({
                status: 'okay',
                email: 'johndoe@example.net',
                audience: 'https://www.example.com',
                expires: 1322080163206,
                issuer: 'login.persona.org' })
              );
              res.emit('end');
            }
          })
          
          callback(res);
          return req;
        }
      }
      
      var strategy = new BrowserIDStrategy({
          audience: 'https://www.example.com',
          passReqToCallback: true,
          transport: mockhttps
        },
        function(req, email, done) {
          done(null, { foo: req.foo, email: email });
        }
      );
      return strategy;
    },
    
    'after augmenting with actions': {
      topic: function(strategy) {
        var self = this;
        var req = {};
        req.foo = 'bar';
        req.body = {};
        req.body['assertion'] = 'secret-assertion-data';
        strategy.success = function(user) {
          req.user = user;
          self.callback(null, req);
        }
        strategy.fail = function() {
          self.callback(new Error('should not be called'));
        }
        
        process.nextTick(function () {
          strategy.authenticate(req);
        });
      },
      
      'should not call fail' : function(err, req) {
        assert.isNull(err);
      },
      'should authenticate' : function(err, req) {
        assert.equal(req.user.email, 'johndoe@example.net');
      },
      'should have request details' : function(err, req) {
        assert.equal(req.user.foo, 'bar');
      },
    },
  },
  
  'strategy handling a request with an assertion that is verified with info': {
    topic: function() {
      var mockhttps = {
        request : function(options, callback) {
          var req = new MockRequest();
          var res = new MockResponse();
          
          req.on('end', function(data, encoding) {
            if (options.method === 'POST'
                && options.headers['Content-Type'] === 'application/x-www-form-urlencoded'
                && options.headers['Content-Length']
                && data === 'assertion=secret-assertion-data&audience=https%3A%2F%2Fwww.example.com') {
              res.emit('data', JSON.stringify({
                status: 'okay',
                email: 'johndoe@example.net',
                audience: 'https://www.example.com',
                expires: 1322080163206,
                issuer: 'login.persona.org' })
              );
              res.emit('end');
            }
          })
          
          callback(res);
          return req;
        }
      }
      
      var strategy = new BrowserIDStrategy({
          audience: 'https://www.example.com',
          transport: mockhttps
        },
        function(email, done) {
          done(null, { email: email }, { message: 'Welcome!' });
        }
      );
      return strategy;
    },
    
    'after augmenting with actions': {
      topic: function(strategy) {
        var self = this;
        var req = {};
        req.body = {};
        req.body['assertion'] = 'secret-assertion-data';
        strategy.success = function(user, info) {
          req.user = user;
          self.callback(null, req, info);
        }
        strategy.fail = function() {
          self.callback(new Error('should not be called'));
        }
        
        process.nextTick(function () {
          strategy.authenticate(req);
        });
      },
      
      'should not call fail' : function(err, req) {
        assert.isNull(err);
      },
      'should authenticate' : function(err, req) {
        assert.equal(req.user.email, 'johndoe@example.net');
      },
      'should pass additional info' : function(err, user, info) {
        assert.equal(info.message, 'Welcome!');
      },
    },
  },
  
  'strategy handling a request with an assertion that is not verified': {
    topic: function() {
      var mockhttps = {
        request : function(options, callback) {
          var req = new MockRequest();
          var res = new MockResponse();
          
          req.on('end', function(data, encoding) {
            res.emit('data', JSON.stringify({
              status: 'failure',
              reason: 'need assertion and audience' })
            );
            res.emit('end');
          })
          
          callback(res);
          return req;
        }
      }
      
      var strategy = new BrowserIDStrategy({
          audience: 'https://www.example.com',
          transport: mockhttps
        },
        function(email, done) {
          done(null, { email: email });
        }
      );
      return strategy;
    },
    
    'after augmenting with actions': {
      topic: function(strategy) {
        var self = this;
        var req = {};
        req.body = {};
        req.body['assertion'] = 'secret-assertion-data';
        strategy.success = function(user) {
          self.callback(new Error('should not be called'));
        }
        strategy.fail = function() {
          self.callback(new Error('should not be called'));
        }
        strategy.error = function(err) {
          self.callback(null, err);
        }
        
        process.nextTick(function () {
          strategy.authenticate(req);
        });
      },
      
      'should not call succes' : function(err, req) {
        assert.isNull(err);
      },
      'should error authentication' : function(err, e) {
        assert.instanceOf(e, Error);
        assert.instanceOf(e, VerificationError);
        assert.equal(e.message, 'need assertion and audience');
      },
    },
  },
  
  'strategy handling a request in which verify returns unexpected content': {
    topic: function() {
      var mockhttps = {
        request : function(options, callback) {
          var req = new MockRequest();
          var res = new MockResponse();
          
          req.on('end', function(data, encoding) {
            res.emit('data', '<html>\
<head><title>411 Length Required</title></head> \
<body bgcolor="white"> \
<center><h1>411 Length Required</h1></center> \
<hr><center>nginx/0.7.65</center> \
</body> \
</html>');
            res.emit('end');
          })
          
          callback(res);
          return req;
        }
      }
      
      var strategy = new BrowserIDStrategy({
          audience: 'https://www.example.com',
          transport: mockhttps
        },
        function(email, done) {
          done(null, { email: email });
        }
      );
      return strategy;
    },
    
    'after augmenting with actions': {
      topic: function(strategy) {
        var self = this;
        var req = {};
        req.body = {};
        req.body['assertion'] = 'secret-assertion-data';
        strategy.success = function(user) {
          self.callback(new Error('should not be called'));
        }
        strategy.fail = function() {
          self.callback(new Error('should not be called'));
        }
        strategy.error = function(err) {
          self.callback(null, err);
        }
        
        process.nextTick(function () {
          strategy.authenticate(req);
        });
      },
      
      'should not call success or fail' : function(err, req) {
        assert.isNull(err);
      },
      'should call error' : function(err, e) {
        assert.isNotNull(e);
        assert.instanceOf(e, Error);
      },
    },
  },
  
  'strategy handling a request that is not validated': {
    topic: function() {
      var mockhttps = {
        request : function(options, callback) {
          var req = new MockRequest();
          var res = new MockResponse();
          
          req.on('end', function(data, encoding) {
            res.emit('data', JSON.stringify({
              status: 'okay',
              email: 'johndoe@example.net',
              audience: 'https://www.example.com',
              expires: 1322080163206,
              issuer: 'login.persona.org' })
            );
            res.emit('end');
          })
          
          callback(res);
          return req;
        }
      }
      
      var strategy = new BrowserIDStrategy({
          audience: 'https://www.example.com',
          transport: mockhttps
        },
        function(email, done) {
          done(null, false);
        }
      );
      return strategy;
    },
    
    'after augmenting with actions': {
      topic: function(strategy) {
        var self = this;
        var req = {};
        req.body = {};
        req.body['assertion'] = 'secret-assertion-data';
        strategy.success = function(user) {
          self.callback(new Error('should not be called'));
        }
        strategy.fail = function() {
          self.callback(null);
        }
        
        process.nextTick(function () {
          strategy.authenticate(req);
        });
      },
      
      'should not call success' : function(err, req) {
        assert.isNull(err);
      },
      'should call fail' : function(err) {
        assert.isTrue(true);
      },
    },
  },
  
  'strategy handling a request that is not validated with info': {
    topic: function() {
      var mockhttps = {
        request : function(options, callback) {
          var req = new MockRequest();
          var res = new MockResponse();
          
          req.on('end', function(data, encoding) {
            res.emit('data', JSON.stringify({
              status: 'okay',
              email: 'johndoe@example.net',
              audience: 'https://www.example.com',
              expires: 1322080163206,
              issuer: 'login.persona.org' })
            );
            res.emit('end');
          })
          
          callback(res);
          return req;
        }
      }
      
      var strategy = new BrowserIDStrategy({
          audience: 'https://www.example.com',
          transport: mockhttps
        },
        function(email, done) {
          done(null, false, { message: 'Domain blacklisted.' });
        }
      );
      return strategy;
    },
    
    'after augmenting with actions': {
      topic: function(strategy) {
        var self = this;
        var req = {};
        req.body = {};
        req.body['assertion'] = 'secret-assertion-data';
        strategy.success = function(user) {
          self.callback(new Error('should not be called'));
        }
        strategy.fail = function(info) {
          self.callback(null, info);
        }
        
        process.nextTick(function () {
          strategy.authenticate(req);
        });
      },
      
      'should not call success' : function(err, req) {
        assert.isNull(err);
      },
      'should call fail' : function(err) {
        assert.isTrue(true);
      },
      'should pass additional info' : function(err, info) {
        assert.equal(info.message, 'Domain blacklisted.');
      },
    },
  },
  
  'strategy handling a request that encounters an error during validation': {
    topic: function() {
      var mockhttps = {
        request : function(options, callback) {
          var req = new MockRequest();
          var res = new MockResponse();
          
          req.on('end', function(data, encoding) {
            res.emit('data', JSON.stringify({
              status: 'okay',
              email: 'johndoe@example.net',
              audience: 'https://www.example.com',
              expires: 1322080163206,
              issuer: 'login.persona.org' })
            );
            res.emit('end');
          })
          
          callback(res);
          return req;
        }
      }
      
      var strategy = new BrowserIDStrategy({
          audience: 'https://www.example.com',
          transport: mockhttps
        },
        function(email, done) {
          done(new Error('something went wrong'));
        }
      );
      return strategy;
    },
    
    'after augmenting with actions': {
      topic: function(strategy) {
        var self = this;
        var req = {};
        req.body = {};
        req.body['assertion'] = 'secret-assertion-data';
        strategy.success = function(user) {
          self.callback(new Error('should not be called'));
        }
        strategy.fail = function() {
          self.callback(new Error('should not be called'));
        }
        strategy.error = function(err) {
          self.callback(null, err);
        }
        
        process.nextTick(function () {
          strategy.authenticate(req);
        });
      },
      
      'should not call success or fail' : function(err, req) {
        assert.isNull(err);
      },
      'should call error' : function(err, e) {
        assert.isNotNull(e);
        assert.instanceOf(e, Error);
      },
    },
  },
  
  'strategy handling a request without a body': {
    topic: function() {
      var strategy = new BrowserIDStrategy({
          audience: 'https://www.example.com'
        },
        function() {}
      );
      return strategy;
    },
    
    'after augmenting with actions': {
      topic: function(strategy) {
        var self = this;
        var req = {};
        strategy.success = function(user) {
          self.callback(new Error('should not be called'));
        }
        strategy.fail = function(info) {
          self.callback(null, info);
        }
        
        process.nextTick(function () {
          strategy.authenticate(req);
        });
      },
      
      'should not call success' : function(err, req) {
        assert.isNull(err);
      },
      'should fail authentication' : function(err) {
        assert.isTrue(true);
      },
      'should pass BadReqestError as additional info' : function(err, info) {
        assert.instanceOf(info, Error);
        assert.instanceOf(info, BadRequestError);
      },
    },
  },
  
  'strategy handling a request with a body, but no assertion': {
    topic: function() {
      var strategy = new BrowserIDStrategy({
          audience: 'https://www.example.com'
        },
        function() {}
      );
      return strategy;
    },
    
    'after augmenting with actions': {
      topic: function(strategy) {
        var self = this;
        var req = {};
        req.body = {};
        strategy.success = function(user) {
          self.callback(new Error('should not be called'));
        }
        strategy.fail = function() {
          self.callback(null);
        }
        
        process.nextTick(function () {
          strategy.authenticate(req);
        });
      },
      
      'should not call success' : function(err, req) {
        assert.isNull(err);
      },
      'should fail authentication' : function(err) {
        assert.isTrue(true);
      },
    },
  },
  
  'strategy constructed without a validate callback': {
    'should throw an error': function (strategy) {
      assert.throws(function() {
        new BrowserIDStrategy({
          audience: 'https://www.example.com'
        });
      });
    },
  },
  
}).export(module);
