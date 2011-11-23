var vows = require('vows');
var assert = require('assert');
var events = require('events');
var util = require('util');
var BrowserIDStrategy = require('passport-browserid/strategy');


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
  
  'strategy handling a request with a valid assertion': {
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
                issuer: 'browserid.org' })
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
  
  'strategy handling a request with an assertion that fails verify': {
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
          self.callback(null);
        }
        
        process.nextTick(function () {
          strategy.authenticate(req);
        });
      },
      
      'should not call succes' : function(err, req) {
        assert.isNull(err);
      },
      'should fail authentication' : function(err) {
        assert.isTrue(true);
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
