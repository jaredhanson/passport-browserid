var BrowserIDStrategy = require('../lib/strategy');
var Assertions = require('./fixtures/assertions')
var chai = require('chai');
var sinon = require('sinon');
var fs = require('fs');


describe('Strategy', function() {
  
  describe('constructed', function() {
    var strategy = new BrowserIDStrategy({
      audience: 'https://www.example.com'
    }, function() {});
    
    it('should be named browserid', function() {
      expect(strategy.name).to.equal('browserid');
    });
  });
  
  describe('constructed without a verify callback', function() {
    it('should throw', function() {
      expect(function() {
        var strategy = new BrowserIDStrategy({
          audience: 'https://www.example.com'
        });
      }).to.throw(TypeError, 'BrowserIDStrategy requires a verify callback');
    });
  }); // without a verify callback
  
  describe('constructed without an audience option', function() {
    it('should throw', function() {
      expect(function() {
        var strategy = new BrowserIDStrategy({
        }, function() {});
      }).to.throw(TypeError, 'BrowserIDStrategy requires an audience option');
    });
  }); // without a verify callback
  
  describe('handling a request with an assertion that is verified by email', function() {
    this.timeout(10000);
    
    var clock;
    
    before(function() {
      clock = sinon.useFakeTimers(1479747579866 - 1000);
    });
  
    after(function() {
      clock.restore();
    });
    
    
    var user
      , info;
    
    var strategy = new BrowserIDStrategy({
        audience: 'http://localhost:8080',
        httpRequest: function(domain, path, cb) {
          expect(domain).to.equal('mockmyid.com');
          expect(path).to.equal('/.well-known/browserid?domain=mockmyid.com');
          
          var headers = {
            server: 'nginx/1.6.1',
            date: 'Mon, 21 Nov 2016 18:29:48 GMT',
            'content-type': 'application/json',
            'content-length': '1025',
            'last-modified': 'Tue, 09 Sep 2014 15:01:47 GMT',
            connection: 'close',
            etag: '"540f165b-401"',
            expires: 'Mon, 21 Nov 2016 19:29:48 GMT',
            'cache-control': 'max-age=3600',
            'accept-ranges': 'bytes',
            'strict-transport-security': 'max-age=16000000; preload;'
          };
          var body = fs.readFileSync(__dirname + '/fixtures/mockmyid.com/browserid', 'utf8');
          return cb(null, 200, headers, body);
        }
      },
      function(email, done) {
        done(null, { email: email });
      }
    );
    
    before(function(done) {
      sinon.spy(strategy._browserID, 'lookup');
      
      chai.passport.use(strategy)
        .success(function(u, i) {
          user = u;
          info = i;
          done();
        })
        .req(function(req) {
          req.body = {};
          req.body['assertion'] = Assertions.JOHN_MOCKMYIDCOM;
        })
        .error(function(err) {
          done(err);
        })
        .authenticate();
    });
    
    after(function() {
      strategy._browserID.lookup.restore();
    });

    it('should call Verifier#lookup to obtain details about issuer', function() {
      expect(strategy._browserID.lookup).to.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(0);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('mockmyid.com');
      expect(call.args[0].principalDomain).to.equal('mockmyid.com');
    });
    
    it('should call Verifier#lookup to obtain details about authority for princial domain', function() {
      expect(strategy._browserID.lookup).to.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(1);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('mockmyid.com');
      expect(call.args[0].principalDomain).to.equal('mockmyid.com');
    });

    it('should yield user', function() {
      expect(user).to.be.an.object;
      expect(user.email).to.equal('john@mockmyid.com');
    });
    
    it('should not yield info', function() {
      expect(info).to.be.undefined;
    });
  }); // handling a request with an assertion that is verified by email
  
  describe('handling a request with an assertion that is verified by email and issuer', function() {
    this.timeout(10000);
    
    var clock;
    
    before(function() {
      clock = sinon.useFakeTimers(1479747579866 - 1000);
    });
  
    after(function() {
      clock.restore();
    });
    
    
    var user
      , info;
    
    var strategy = new BrowserIDStrategy({
        audience: 'http://localhost:8080',
        httpRequest: function(domain, path, cb) {
          expect(domain).to.equal('mockmyid.com');
          expect(path).to.equal('/.well-known/browserid?domain=mockmyid.com');
          
          var headers = {
            server: 'nginx/1.6.1',
            date: 'Mon, 21 Nov 2016 18:29:48 GMT',
            'content-type': 'application/json',
            'content-length': '1025',
            'last-modified': 'Tue, 09 Sep 2014 15:01:47 GMT',
            connection: 'close',
            etag: '"540f165b-401"',
            expires: 'Mon, 21 Nov 2016 19:29:48 GMT',
            'cache-control': 'max-age=3600',
            'accept-ranges': 'bytes',
            'strict-transport-security': 'max-age=16000000; preload;'
          };
          var body = fs.readFileSync(__dirname + '/fixtures/mockmyid.com/browserid', 'utf8');
          return cb(null, 200, headers, body);
        }
      },
      function(email, issuer, done) {
        done(null, { email: email, issuer: issuer });
      }
    );
    
    before(function(done) {
      sinon.spy(strategy._browserID, 'lookup');
      
      chai.passport.use(strategy)
        .success(function(u, i) {
          user = u;
          info = i;
          done();
        })
        .req(function(req) {
          req.body = {};
          req.body['assertion'] = Assertions.JOHN_MOCKMYIDCOM;
        })
        .error(function(err) {
          done(err);
        })
        .authenticate();
    });
    
    after(function() {
      strategy._browserID.lookup.restore();
    });

    it('should call Verifier#lookup to obtain details about issuer', function() {
      expect(strategy._browserID.lookup).to.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(0);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('mockmyid.com');
      expect(call.args[0].principalDomain).to.equal('mockmyid.com');
    });
    
    it('should call Verifier#lookup to obtain details about authority for princial domain', function() {
      expect(strategy._browserID.lookup).to.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(1);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('mockmyid.com');
      expect(call.args[0].principalDomain).to.equal('mockmyid.com');
    });

    it('should yield user', function() {
      expect(user).to.be.an.object;
      expect(user.email).to.equal('john@mockmyid.com');
      expect(user.issuer).to.equal('mockmyid.com');
    });
    
    it('should not yield info', function() {
      expect(info).to.be.undefined;
    });
  }); // handling a request with an assertion that is verified by email and issuer
  
  describe('handling a request with an assertion that is verified by email and yeilds info', function() {
    this.timeout(10000);
    
    var clock;
    
    before(function() {
      clock = sinon.useFakeTimers(1479747579866 - 1000);
    });
  
    after(function() {
      clock.restore();
    });
    
    
    var user
      , info;
    
    var strategy = new BrowserIDStrategy({
        audience: 'http://localhost:8080',
        httpRequest: function(domain, path, cb) {
          expect(domain).to.equal('mockmyid.com');
          expect(path).to.equal('/.well-known/browserid?domain=mockmyid.com');
          
          var headers = {
            server: 'nginx/1.6.1',
            date: 'Mon, 21 Nov 2016 18:29:48 GMT',
            'content-type': 'application/json',
            'content-length': '1025',
            'last-modified': 'Tue, 09 Sep 2014 15:01:47 GMT',
            connection: 'close',
            etag: '"540f165b-401"',
            expires: 'Mon, 21 Nov 2016 19:29:48 GMT',
            'cache-control': 'max-age=3600',
            'accept-ranges': 'bytes',
            'strict-transport-security': 'max-age=16000000; preload;'
          };
          var body = fs.readFileSync(__dirname + '/fixtures/mockmyid.com/browserid', 'utf8');
          return cb(null, 200, headers, body);
        }
      },
      function(email, done) {
        done(null, { email: email }, { message: 'Welcome!' });
      }
    );
    
    before(function(done) {
      sinon.spy(strategy._browserID, 'lookup');
      
      chai.passport.use(strategy)
        .success(function(u, i) {
          user = u;
          info = i;
          done();
        })
        .req(function(req) {
          req.body = {};
          req.body['assertion'] = Assertions.JOHN_MOCKMYIDCOM;
        })
        .error(function(err) {
          done(err);
        })
        .authenticate();
    });
    
    after(function() {
      strategy._browserID.lookup.restore();
    });

    it('should call Verifier#lookup to obtain details about issuer', function() {
      expect(strategy._browserID.lookup).to.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(0);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('mockmyid.com');
      expect(call.args[0].principalDomain).to.equal('mockmyid.com');
    });
    
    it('should call Verifier#lookup to obtain details about authority for princial domain', function() {
      expect(strategy._browserID.lookup).to.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(1);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('mockmyid.com');
      expect(call.args[0].principalDomain).to.equal('mockmyid.com');
    });

    it('should yield user', function() {
      expect(user).to.be.an.object;
      expect(user.email).to.equal('john@mockmyid.com');
    });
    
    it('should yeild info', function() {
      expect(info).to.be.an.object;
      expect(info.message).to.equal('Welcome!');
    });
  }); // handling a request with an assertion that is verified by email and yeilds info
  
  describe('handling a request with an assertion that is verified by email, in passReqToCallbackMode', function() {
    this.timeout(10000);
    
    var clock;
    
    before(function() {
      clock = sinon.useFakeTimers(1479747579866 - 1000);
    });
  
    after(function() {
      clock.restore();
    });
    
    
    var user
      , info;
    
    var strategy = new BrowserIDStrategy({
        audience: 'http://localhost:8080',
        passReqToCallback: true,
        httpRequest: function(domain, path, cb) {
          expect(domain).to.equal('mockmyid.com');
          expect(path).to.equal('/.well-known/browserid?domain=mockmyid.com');
          
          var headers = {
            server: 'nginx/1.6.1',
            date: 'Mon, 21 Nov 2016 18:29:48 GMT',
            'content-type': 'application/json',
            'content-length': '1025',
            'last-modified': 'Tue, 09 Sep 2014 15:01:47 GMT',
            connection: 'close',
            etag: '"540f165b-401"',
            expires: 'Mon, 21 Nov 2016 19:29:48 GMT',
            'cache-control': 'max-age=3600',
            'accept-ranges': 'bytes',
            'strict-transport-security': 'max-age=16000000; preload;'
          };
          var body = fs.readFileSync(__dirname + '/fixtures/mockmyid.com/browserid', 'utf8');
          return cb(null, 200, headers, body);
        }
      },
      function(req, email, done) {
        expect(req.method).to.equal('POST');
        
        done(null, { email: email });
      }
    );
    
    before(function(done) {
      sinon.spy(strategy._browserID, 'lookup');
      
      chai.passport.use(strategy)
        .success(function(u, i) {
          user = u;
          info = i;
          done();
        })
        .req(function(req) {
          req.method = 'POST';
          req.body = {};
          req.body['assertion'] = Assertions.JOHN_MOCKMYIDCOM;
        })
        .error(function(err) {
          done(err);
        })
        .authenticate();
    });
    
    after(function() {
      strategy._browserID.lookup.restore();
    });

    it('should call Verifier#lookup to obtain details about issuer', function() {
      expect(strategy._browserID.lookup).to.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(0);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('mockmyid.com');
      expect(call.args[0].principalDomain).to.equal('mockmyid.com');
    });
    
    it('should call Verifier#lookup to obtain details about authority for princial domain', function() {
      expect(strategy._browserID.lookup).to.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(1);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('mockmyid.com');
      expect(call.args[0].principalDomain).to.equal('mockmyid.com');
    });

    it('should yield user', function() {
      expect(user).to.be.an.object;
      expect(user.email).to.equal('john@mockmyid.com');
    });
    
    it('should not yield info', function() {
      expect(info).to.be.undefined;
    });
  }); // handling a request with an assertion that is verified by email, in passReqToCallbackMode
  
  describe('handling a request with an assertion that is verified by email and issuer, in passReqToCallbackMode', function() {
    this.timeout(10000);
    
    var clock;
    
    before(function() {
      clock = sinon.useFakeTimers(1479747579866 - 1000);
    });
  
    after(function() {
      clock.restore();
    });
    
    
    var user
      , info;
    
    var strategy = new BrowserIDStrategy({
        audience: 'http://localhost:8080',
        passReqToCallback: true,
        httpRequest: function(domain, path, cb) {
          expect(domain).to.equal('mockmyid.com');
          expect(path).to.equal('/.well-known/browserid?domain=mockmyid.com');
          
          var headers = {
            server: 'nginx/1.6.1',
            date: 'Mon, 21 Nov 2016 18:29:48 GMT',
            'content-type': 'application/json',
            'content-length': '1025',
            'last-modified': 'Tue, 09 Sep 2014 15:01:47 GMT',
            connection: 'close',
            etag: '"540f165b-401"',
            expires: 'Mon, 21 Nov 2016 19:29:48 GMT',
            'cache-control': 'max-age=3600',
            'accept-ranges': 'bytes',
            'strict-transport-security': 'max-age=16000000; preload;'
          };
          var body = fs.readFileSync(__dirname + '/fixtures/mockmyid.com/browserid', 'utf8');
          return cb(null, 200, headers, body);
        }
      },
      function(req, email, issuer, done) {
        expect(req.method).to.equal('POST');
        
        done(null, { email: email, issuer: issuer });
      }
    );
    
    before(function(done) {
      sinon.spy(strategy._browserID, 'lookup');
      
      chai.passport.use(strategy)
        .success(function(u, i) {
          user = u;
          info = i;
          done();
        })
        .req(function(req) {
          req.method = 'POST';
          req.body = {};
          req.body['assertion'] = Assertions.JOHN_MOCKMYIDCOM;
        })
        .error(function(err) {
          done(err);
        })
        .authenticate();
    });
    
    after(function() {
      strategy._browserID.lookup.restore();
    });

    it('should call Verifier#lookup to obtain details about issuer', function() {
      expect(strategy._browserID.lookup).to.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(0);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('mockmyid.com');
      expect(call.args[0].principalDomain).to.equal('mockmyid.com');
    });
    
    it('should call Verifier#lookup to obtain details about authority for princial domain', function() {
      expect(strategy._browserID.lookup).to.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(1);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('mockmyid.com');
      expect(call.args[0].principalDomain).to.equal('mockmyid.com');
    });

    it('should yield user', function() {
      expect(user).to.be.an.object;
      expect(user.email).to.equal('john@mockmyid.com');
      expect(user.issuer).to.equal('mockmyid.com');
    });
    
    it('should not yield info', function() {
      expect(info).to.be.undefined;
    });
  }); // handling a request with an assertion that is verified by email and issuer, in passReqToCallbackMode
  
  describe('failing authentication from application-layer identity verification', function() {
    this.timeout(10000);
    
    var clock;
    
    before(function() {
      clock = sinon.useFakeTimers(1479747579866 - 1000);
    });
  
    after(function() {
      clock.restore();
    });
    
    
    var user
      , info;
    
    var strategy = new BrowserIDStrategy({
        audience: 'http://localhost:8080',
        httpRequest: function(domain, path, cb) {
          expect(domain).to.equal('mockmyid.com');
          expect(path).to.equal('/.well-known/browserid?domain=mockmyid.com');
          
          var headers = {
            server: 'nginx/1.6.1',
            date: 'Mon, 21 Nov 2016 18:29:48 GMT',
            'content-type': 'application/json',
            'content-length': '1025',
            'last-modified': 'Tue, 09 Sep 2014 15:01:47 GMT',
            connection: 'close',
            etag: '"540f165b-401"',
            expires: 'Mon, 21 Nov 2016 19:29:48 GMT',
            'cache-control': 'max-age=3600',
            'accept-ranges': 'bytes',
            'strict-transport-security': 'max-age=16000000; preload;'
          };
          var body = fs.readFileSync(__dirname + '/fixtures/mockmyid.com/browserid', 'utf8');
          return cb(null, 200, headers, body);
        }
      },
      function(email, done) {
        done(null, false);
      }
    );
    
    before(function(done) {
      sinon.spy(strategy._browserID, 'lookup');
      
      chai.passport.use(strategy)
        .fail(function(i) {
          info = i;
          done();
        })
        .req(function(req) {
          req.body = {};
          req.body['assertion'] = Assertions.JOHN_MOCKMYIDCOM;
        })
        .error(function(err) {
          done(err);
        })
        .authenticate();
    });
    
    after(function() {
      strategy._browserID.lookup.restore();
    });

    it('should call Verifier#lookup to obtain details about issuer', function() {
      expect(strategy._browserID.lookup).to.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(0);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('mockmyid.com');
      expect(call.args[0].principalDomain).to.equal('mockmyid.com');
    });
    
    it('should call Verifier#lookup to obtain details about authority for princial domain', function() {
      expect(strategy._browserID.lookup).to.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(1);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('mockmyid.com');
      expect(call.args[0].principalDomain).to.equal('mockmyid.com');
    });

    it('should not yield info', function() {
      expect(info).to.be.undefined;
    });
  }); // failing authentication from application-layer identity verification
  
  describe('failing authentication and yeilding info from application-layer identity verification', function() {
    this.timeout(10000);
    
    var clock;
    
    before(function() {
      clock = sinon.useFakeTimers(1479747579866 - 1000);
    });
  
    after(function() {
      clock.restore();
    });
    
    
    var user
      , info;
    
    var strategy = new BrowserIDStrategy({
        audience: 'http://localhost:8080',
        httpRequest: function(domain, path, cb) {
          expect(domain).to.equal('mockmyid.com');
          expect(path).to.equal('/.well-known/browserid?domain=mockmyid.com');
          
          var headers = {
            server: 'nginx/1.6.1',
            date: 'Mon, 21 Nov 2016 18:29:48 GMT',
            'content-type': 'application/json',
            'content-length': '1025',
            'last-modified': 'Tue, 09 Sep 2014 15:01:47 GMT',
            connection: 'close',
            etag: '"540f165b-401"',
            expires: 'Mon, 21 Nov 2016 19:29:48 GMT',
            'cache-control': 'max-age=3600',
            'accept-ranges': 'bytes',
            'strict-transport-security': 'max-age=16000000; preload;'
          };
          var body = fs.readFileSync(__dirname + '/fixtures/mockmyid.com/browserid', 'utf8');
          return cb(null, 200, headers, body);
        }
      },
      function(email, done) {
        done(null, false, { message: 'Invite required' });
      }
    );
    
    before(function(done) {
      sinon.spy(strategy._browserID, 'lookup');
      
      chai.passport.use(strategy)
        .fail(function(i) {
          info = i;
          done();
        })
        .req(function(req) {
          req.body = {};
          req.body['assertion'] = Assertions.JOHN_MOCKMYIDCOM;
        })
        .error(function(err) {
          done(err);
        })
        .authenticate();
    });
    
    after(function() {
      strategy._browserID.lookup.restore();
    });

    it('should call Verifier#lookup to obtain details about issuer', function() {
      expect(strategy._browserID.lookup).to.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(0);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('mockmyid.com');
      expect(call.args[0].principalDomain).to.equal('mockmyid.com');
    });
    
    it('should call Verifier#lookup to obtain details about authority for princial domain', function() {
      expect(strategy._browserID.lookup).to.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(1);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('mockmyid.com');
      expect(call.args[0].principalDomain).to.equal('mockmyid.com');
    });

    it('should yeild info', function() {
      expect(info).to.be.an.object;
      expect(info.message).to.equal('Invite required');
    });
  }); // failing authentication and yeilding info from application-layer identity verification
  
  describe('failing authentication due to audience mismatch', function() {
    this.timeout(10000);
    
    var clock;
    
    before(function() {
      clock = sinon.useFakeTimers(1479747579866 - 1000);
    });
  
    after(function() {
      clock.restore();
    });
    
    
    var info
      , status;
    
    var strategy = new BrowserIDStrategy({
        audience: 'http://example.com:8080',
        httpRequest: function(domain, path, cb) {
          expect(domain).to.equal('mockmyid.com');
          expect(path).to.equal('/.well-known/browserid?domain=mockmyid.com');
          
          var headers = {
            server: 'nginx/1.6.1',
            date: 'Mon, 21 Nov 2016 18:29:48 GMT',
            'content-type': 'application/json',
            'content-length': '1025',
            'last-modified': 'Tue, 09 Sep 2014 15:01:47 GMT',
            connection: 'close',
            etag: '"540f165b-401"',
            expires: 'Mon, 21 Nov 2016 19:29:48 GMT',
            'cache-control': 'max-age=3600',
            'accept-ranges': 'bytes',
            'strict-transport-security': 'max-age=16000000; preload;'
          };
          var body = fs.readFileSync(__dirname + '/fixtures/mockmyid.com/browserid', 'utf8');
          return cb(null, 200, headers, body);
        }
      },
      function(email, done) {
        done(null, false);
      }
    );
    
    before(function(done) {
      sinon.spy(strategy._browserID, 'lookup');
      
      chai.passport.use(strategy)
        .fail(function(i, s) {
          info = i;
          status = s;
          done();
        })
        .req(function(req) {
          req.body = {};
          req.body['assertion'] = Assertions.JOHN_MOCKMYIDCOM;
        })
        .error(function(err) {
          done(err);
        })
        .authenticate();
    });
    
    it('should fail with info and status', function() {
      expect(info).to.be.an.object;
      expect(info.message).to.equal('audience mismatch: domain mismatch');
      expect(status).to.equal(403);
    });
  }); // failing authentication due to audience mismatch
  
  describe('failing authentication due to expired assertion', function() {
    this.timeout(10000);
    
    var clock;
    
    before(function() {
      clock = sinon.useFakeTimers(1479841275063);
    });
  
    after(function() {
      clock.restore();
    });
    
    
    var info
      , status;
    
    var strategy = new BrowserIDStrategy({
        audience: 'http://example.com:8080',
        httpRequest: function(domain, path, cb) {
          expect(domain).to.equal('mockmyid.com');
          expect(path).to.equal('/.well-known/browserid?domain=mockmyid.com');
          
          var headers = {
            server: 'nginx/1.6.1',
            date: 'Mon, 21 Nov 2016 18:29:48 GMT',
            'content-type': 'application/json',
            'content-length': '1025',
            'last-modified': 'Tue, 09 Sep 2014 15:01:47 GMT',
            connection: 'close',
            etag: '"540f165b-401"',
            expires: 'Mon, 21 Nov 2016 19:29:48 GMT',
            'cache-control': 'max-age=3600',
            'accept-ranges': 'bytes',
            'strict-transport-security': 'max-age=16000000; preload;'
          };
          var body = fs.readFileSync(__dirname + '/fixtures/mockmyid.com/browserid', 'utf8');
          return cb(null, 200, headers, body);
        }
      },
      function(email, done) {
        done(null, false);
      }
    );
    
    before(function(done) {
      sinon.spy(strategy._browserID, 'lookup');
      
      chai.passport.use(strategy)
        .fail(function(i, s) {
          info = i;
          status = s;
          done();
        })
        .req(function(req) {
          req.body = {};
          req.body['assertion'] = Assertions.JOHN_MOCKMYIDCOM;
        })
        .error(function(err) {
          done(err);
        })
        .authenticate();
    });
    
    it('should fail with info and status', function() {
      expect(info).to.be.an.object;
      expect(info.message).to.equal('expired');
      expect(status).to.equal(403);
    });
  }); // failing authentication due to expired assertion
  
  describe('failing authentication due to missing assertion', function() {
    this.timeout(10000);
    
    var clock;
    
    before(function() {
      clock = sinon.useFakeTimers(1479841275063);
    });
  
    after(function() {
      clock.restore();
    });
    
    
    var info
      , status;
    
    var strategy = new BrowserIDStrategy({
        audience: 'http://example.com:8080',
        httpRequest: function(domain, path, cb) {
          expect(domain).to.equal('mockmyid.com');
          expect(path).to.equal('/.well-known/browserid?domain=mockmyid.com');
          
          var headers = {
            server: 'nginx/1.6.1',
            date: 'Mon, 21 Nov 2016 18:29:48 GMT',
            'content-type': 'application/json',
            'content-length': '1025',
            'last-modified': 'Tue, 09 Sep 2014 15:01:47 GMT',
            connection: 'close',
            etag: '"540f165b-401"',
            expires: 'Mon, 21 Nov 2016 19:29:48 GMT',
            'cache-control': 'max-age=3600',
            'accept-ranges': 'bytes',
            'strict-transport-security': 'max-age=16000000; preload;'
          };
          var body = fs.readFileSync(__dirname + '/fixtures/mockmyid.com/browserid', 'utf8');
          return cb(null, 200, headers, body);
        }
      },
      function(email, done) {
        done(null, false);
      }
    );
    
    before(function(done) {
      sinon.spy(strategy._browserID, 'lookup');
      
      chai.passport.use(strategy)
        .fail(function(i, s) {
          info = i;
          status = s;
          done();
        })
        .req(function(req) {
          req.body = {};
        })
        .error(function(err) {
          done(err);
        })
        .authenticate();
    });
    
    it('should fail with info and status', function() {
      expect(info).to.be.an.object;
      expect(info.message).to.equal('Missing assertion');
      expect(status).to.equal(400);
    });
  }); // failing authentication due to missing assertion
  
  describe('encountering an error during application-layer identity verification', function() {
    this.timeout(10000);
    
    var clock;
    
    before(function() {
      clock = sinon.useFakeTimers(1479747579866 - 1000);
    });
  
    after(function() {
      clock.restore();
    });
    
    
    var error
      , user
      , info;
    
    var strategy = new BrowserIDStrategy({
        audience: 'http://localhost:8080',
        httpRequest: function(domain, path, cb) {
          expect(domain).to.equal('mockmyid.com');
          expect(path).to.equal('/.well-known/browserid?domain=mockmyid.com');
          
          var headers = {
            server: 'nginx/1.6.1',
            date: 'Mon, 21 Nov 2016 18:29:48 GMT',
            'content-type': 'application/json',
            'content-length': '1025',
            'last-modified': 'Tue, 09 Sep 2014 15:01:47 GMT',
            connection: 'close',
            etag: '"540f165b-401"',
            expires: 'Mon, 21 Nov 2016 19:29:48 GMT',
            'cache-control': 'max-age=3600',
            'accept-ranges': 'bytes',
            'strict-transport-security': 'max-age=16000000; preload;'
          };
          var body = fs.readFileSync(__dirname + '/fixtures/mockmyid.com/browserid', 'utf8');
          return cb(null, 200, headers, body);
        }
      },
      function(email, done) {
        done(new Error('something went wrong'));
      }
    );
    
    before(function(done) {
      sinon.spy(strategy._browserID, 'lookup');
      
      chai.passport.use(strategy)
        .fail(function(i) {
          info = i;
          done();
        })
        .req(function(req) {
          req.body = {};
          req.body['assertion'] = Assertions.JOHN_MOCKMYIDCOM;
        })
        .error(function(err) {
          error = err;
          done();
        })
        .authenticate();
    });
    
    after(function() {
      strategy._browserID.lookup.restore();
    });

    it('should error', function() {
      expect(error).to.be.an.instanceof(Error)
      expect(error.message).to.equal('something went wrong')
    });

    it('should call Verifier#lookup to obtain details about issuer', function() {
      expect(strategy._browserID.lookup).to.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(0);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('mockmyid.com');
      expect(call.args[0].principalDomain).to.equal('mockmyid.com');
    });
    
    it('should call Verifier#lookup to obtain details about authority for princial domain', function() {
      expect(strategy._browserID.lookup).to.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(1);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('mockmyid.com');
      expect(call.args[0].principalDomain).to.equal('mockmyid.com');
    });

    it('should not yield user', function() {
      expect(user).to.be.undefined;
    });
    
    it('should not yeild info', function() {
      expect(info).to.be.undefined;
    });
  }); // encountering an error during application-layer identity verification
  
  describe('encountering an exception during application-layer identity verification', function() {
    this.timeout(10000);
    
    var clock;
    
    before(function() {
      clock = sinon.useFakeTimers(1479747579866 - 1000);
    });
  
    after(function() {
      clock.restore();
    });
    
    
    var error
      , user
      , info;
    
    var strategy = new BrowserIDStrategy({
        audience: 'http://localhost:8080',
        httpRequest: function(domain, path, cb) {
          expect(domain).to.equal('mockmyid.com');
          expect(path).to.equal('/.well-known/browserid?domain=mockmyid.com');
          
          var headers = {
            server: 'nginx/1.6.1',
            date: 'Mon, 21 Nov 2016 18:29:48 GMT',
            'content-type': 'application/json',
            'content-length': '1025',
            'last-modified': 'Tue, 09 Sep 2014 15:01:47 GMT',
            connection: 'close',
            etag: '"540f165b-401"',
            expires: 'Mon, 21 Nov 2016 19:29:48 GMT',
            'cache-control': 'max-age=3600',
            'accept-ranges': 'bytes',
            'strict-transport-security': 'max-age=16000000; preload;'
          };
          var body = fs.readFileSync(__dirname + '/fixtures/mockmyid.com/browserid', 'utf8');
          return cb(null, 200, headers, body);
        }
      },
      function(email, done) {
        throw new Error('something went horribly wrong');
      }
    );
    
    before(function(done) {
      sinon.spy(strategy._browserID, 'lookup');
      
      chai.passport.use(strategy)
        .fail(function(i) {
          info = i;
          done();
        })
        .req(function(req) {
          req.body = {};
          req.body['assertion'] = Assertions.JOHN_MOCKMYIDCOM;
        })
        .error(function(err) {
          error = err;
          done();
        })
        .authenticate();
    });
    
    after(function() {
      strategy._browserID.lookup.restore();
    });

    it('should error', function() {
      expect(error).to.be.an.instanceof(Error)
      expect(error.message).to.equal('something went horribly wrong')
    });

    it('should call Verifier#lookup to obtain details about issuer', function() {
      expect(strategy._browserID.lookup).to.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(0);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('mockmyid.com');
      expect(call.args[0].principalDomain).to.equal('mockmyid.com');
    });
    
    it('should call Verifier#lookup to obtain details about authority for princial domain', function() {
      expect(strategy._browserID.lookup).to.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(1);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('mockmyid.com');
      expect(call.args[0].principalDomain).to.equal('mockmyid.com');
    });

    it('should not yield user', function() {
      expect(user).to.be.undefined;
    });
    
    it('should not yeild info', function() {
      expect(info).to.be.undefined;
    });
  }); // encountering an exception during application-layer identity verification
  
  describe('handling a request with an assertion for a gmail.com address issued by Mozilla Persona', function() {
    this.timeout(10000);
    
    var clock;
    
    before(function() {
      clock = sinon.useFakeTimers(1479760232011 - 1000);
    });
  
    after(function() {
      clock.restore();
    });
    
    
    var user
      , info;
    
    var strategy = new BrowserIDStrategy({
        audience: 'http://localhost:8080',
        trustedIssuers: [ 'gmail.login.persona.org' ],
        httpRequest: function(domain, path, cb) {
          expect(domain).to.equal('gmail.login.persona.org');
          expect(path).to.equal('/.well-known/browserid?domain=gmail.com');
          
          var headers = {
            'cache-control': 'public, max-age=0',
            'content-type': 'application/json; charset=utf-8',
            date: 'Mon, 21 Nov 2016 20:35:46 GMT',
            etag: 'W/"2da-220ee0ba"',
            'strict-transport-security': 'max-age=10886400; includeSubdomains',
            vary: 'Accept-Encoding, Accept-Language',
            'x-frame-options': 'DENY',
            'x-powered-by': 'Express',
            'content-length': '730',
            connection: 'Close'
          };
          var body = fs.readFileSync(__dirname + '/fixtures/gmail.login.persona.org/browserid', 'utf8');
          return cb(null, 200, headers, body);
        }
      },
      function(email, issuer, done) {
        done(null, { email: email, issuer: issuer });
      }
    );
    
    before(function(done) {
      sinon.spy(strategy._browserID, 'lookup');
      
      chai.passport.use(strategy)
        .success(function(u, i) {
          user = u;
          info = i;
          done();
        })
        .req(function(req) {
          req.body = {};
          req.body['assertion'] = Assertions.JAREDHANSON_GMAILCOM;
        })
        .error(function(err) {
          done(err);
        })
        .authenticate();
    });
    
    after(function() {
      strategy._browserID.lookup.restore();
    });

    it('should call Verifier#lookup to obtain details about issuer', function() {
      expect(strategy._browserID.lookup).to.have.been.calledOnce;
      var call = strategy._browserID.lookup.getCall(0);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('gmail.login.persona.org');
      expect(call.args[0].principalDomain).to.equal('gmail.com');
    });
    
    it('should not call Verifier#lookup to obtain details about authority for princial domain', function() {
      expect(strategy._browserID.lookup).to.not.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(1);
      expect(call).to.be.null;
    });

    it('should yield user', function() {
      expect(user).to.be.an.object;
      expect(user.email).to.equal('jaredhanson@gmail.com');
      expect(user.issuer).to.equal('gmail.login.persona.org');
    });
    
    it('should not yield info', function() {
      expect(info).to.be.undefined;
    });
  }); // handling a request with an assertion for a gmail.com address verified by Mozilla Persona
  
  describe('handling a request with an assertion for a yahoo.com address issued by Mozilla Persona', function() {
    this.timeout(10000);
    
    var clock;
    
    before(function() {
      clock = sinon.useFakeTimers(1479763746267 - 1000);
    });
  
    after(function() {
      clock.restore();
    });
    
    
    var user
      , info;
    
    var strategy = new BrowserIDStrategy({
        audience: 'http://localhost:8080',
        trustedIssuers: [ 'yahoo.login.persona.org' ],
        httpRequest: function(domain, path, cb) {
          expect(domain).to.equal('yahoo.login.persona.org');
          expect(path).to.equal('/.well-known/browserid?domain=yahoo.com');
          
          var headers = {
            'cache-control': 'max-age=120',
            'content-type': 'application/json',
            date: 'Mon, 21 Nov 2016 21:27:09 GMT',
            'last-modified': 'Fri, 15 Jul 2016 15:40:27 GMT',
            vary: 'Accept-Encoding, Accept-Language',
            'x-powered-by': 'Express',
            'content-length': '751',
            connection: 'Close'
          };
          var body = fs.readFileSync(__dirname + '/fixtures/yahoo.login.persona.org/browserid', 'utf8');
          return cb(null, 200, headers, body);
        }
      },
      function(email, issuer, done) {
        done(null, { email: email, issuer: issuer });
      }
    );
    
    before(function(done) {
      sinon.spy(strategy._browserID, 'lookup');
      
      chai.passport.use(strategy)
        .success(function(u, i) {
          user = u;
          info = i;
          done();
        })
        .req(function(req) {
          req.body = {};
          req.body['assertion'] = Assertions.JAREDDHANSON_YAHOOCOM;
        })
        .error(function(err) {
          done(err);
        })
        .authenticate();
    });
    
    after(function() {
      strategy._browserID.lookup.restore();
    });

    it('should call Verifier#lookup to obtain details about issuer', function() {
      expect(strategy._browserID.lookup).to.have.been.calledOnce;
      var call = strategy._browserID.lookup.getCall(0);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('yahoo.login.persona.org');
      expect(call.args[0].principalDomain).to.equal('yahoo.com');
    });
    
    it('should not call Verifier#lookup to obtain details about authority for princial domain', function() {
      expect(strategy._browserID.lookup).to.not.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(1);
      expect(call).to.be.null;
    });

    it('should yield user', function() {
      expect(user).to.be.an.object;
      expect(user.email).to.equal('jared_d_hanson@yahoo.com');
      expect(user.issuer).to.equal('yahoo.login.persona.org');
    });
    
    it('should not yield info', function() {
      expect(info).to.be.undefined;
    });
  }); // handling a request with an assertion for a yahoo.com address verified by Mozilla Persona
  
  describe('handling a request with an assertion for a hotmail.com address issued by Mozilla Persona', function() {
    this.timeout(10000);
    
    var clock;
    
    before(function() {
      clock = sinon.useFakeTimers(1479764927846 - 1000);
    });
  
    after(function() {
      clock.restore();
    });
    
    
    var user
      , info;
    
    var strategy = new BrowserIDStrategy({
        audience: 'http://localhost:8080',
        trustedIssuers: [ 'login.persona.org' ],
        httpRequest: function(domain, path, cb) {
          expect(domain).to.equal('login.persona.org');
          expect(path).to.equal('/.well-known/browserid?domain=hotmail.com');
          
          var headers = {
            'cache-control': 'public, max-age=10',
            'content-type': 'application/json; charset=utf-8',
            date: 'Mon, 21 Nov 2016 21:46:50 GMT',
            'strict-transport-security': 'max-age=10886400; includeSubdomains',
            'x-content-type-options': 'nosniff',
            'x-frame-options': 'DENY',
            'x-powered-by': 'Express',
            'content-length': '729',
            connection: 'Close'
          };
          var body = fs.readFileSync(__dirname + '/fixtures/login.persona.org/browserid-nofragment', 'utf8');
          return cb(null, 200, headers, body);
        }
      },
      function(email, issuer, done) {
        done(null, { email: email, issuer: issuer });
      }
    );
    
    before(function(done) {
      sinon.spy(strategy._browserID, 'lookup');
      
      chai.passport.use(strategy)
        .success(function(u, i) {
          user = u;
          info = i;
          done();
        })
        .req(function(req) {
          req.body = {};
          req.body['assertion'] = Assertions.JAREDHANSON_HOTMAILCOM;
        })
        .error(function(err) {
          done(err);
        })
        .authenticate();
    });
    
    after(function() {
      strategy._browserID.lookup.restore();
    });

    it('should call Verifier#lookup to obtain details about issuer', function() {
      expect(strategy._browserID.lookup).to.have.been.calledOnce;
      var call = strategy._browserID.lookup.getCall(0);
      expect(call.args[0]).to.be.an('object');
      expect(call.args[0].domain).to.equal('login.persona.org');
      expect(call.args[0].principalDomain).to.equal('hotmail.com');
    });
    
    it('should not call Verifier#lookup to obtain details about authority for princial domain', function() {
      expect(strategy._browserID.lookup).to.not.have.been.calledTwice;
      var call = strategy._browserID.lookup.getCall(1);
      expect(call).to.be.null;
    });

    it('should yield user', function() {
      expect(user).to.be.an.object;
      expect(user.email).to.equal('jared.hanson@hotmail.com');
      expect(user.issuer).to.equal('login.persona.org');
    });
    
    it('should not yield info', function() {
      expect(info).to.be.undefined;
    });
  }); // handling a request with an assertion for a hotmail.com address verified by Mozilla Persona
  
});
