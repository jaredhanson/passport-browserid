var BrowserIDStrategy = require('../lib/strategy');
var chai = require('chai');
var sinon = require('sinon');
var fs = require('fs');

var JOHN_MOCKMYIDCOM_ASSERTION = 'eyJhbGciOiJEUzEyOCJ9.eyJwdWJsaWMta2V5Ijp7ImFsZ29yaXRobSI6IkRTIiwieSI6IjkwNjkxYzQ4OWExZmRmNmQzZGFiMDg2NjdiNDFiZDdjMGIxYTc4Y2IyMTZlNjllMWIyMTlkZGFjN2VhZGRjMmRhZTg5NGVlOTU2N2EzNWY3NTA2NTQ5ZDYzNzhmMDliMTBlYjU0ZDIxYjk2Y2I2ZDlhNWEyYWYwZmNmM2EwZDhhZGMxZDhlMTgyNjEyNzg1NjJlM2U5Zjg4YmIzYWEwZDNiODQ2MWI2OTQ1NDBmZmI1MTgyZDUyNzliMmVjM2U0OTlhODI4MTJhMDU0YzUyYjg3ZWVlNDk5OTcwNDMwYTE2ZWJjNDg3OGFiMjBjMTY0NjhjZmU5NzMyZTRkY2Q3ZTkiLCJwIjoiZmY2MDA0ODNkYjZhYmZjNWI0NWVhYjc4NTk0YjM1MzNkNTUwZDlmMWJmMmE5OTJhN2E4ZGFhNmRjMzRmODA0NWFkNGU2ZTBjNDI5ZDMzNGVlZWFhZWZkN2UyM2Q0ODEwYmUwMGU0Y2MxNDkyY2JhMzI1YmE4MWZmMmQ1YTViMzA1YThkMTdlYjNiZjRhMDZhMzQ5ZDM5MmUwMGQzMjk3NDRhNTE3OTM4MDM0NGU4MmExOGM0NzkzMzQzOGY4OTFlMjJhZWVmODEyZDY5YzhmNzVlMzI2Y2I3MGVhMDAwYzNmNzc2ZGZkYmQ2MDQ2MzhjMmVmNzE3ZmMyNmQwMmUxNyIsInEiOiJlMjFlMDRmOTExZDFlZDc5OTEwMDhlY2FhYjNiZjc3NTk4NDMwOWMzIiwiZyI6ImM1MmE0YTBmZjNiN2U2MWZkZjE4NjdjZTg0MTM4MzY5YTYxNTRmNGFmYTkyOTY2ZTNjODI3ZTI1Y2ZhNmNmNTA4YjkwZTVkZTQxOWUxMzM3ZTA3YTJlOWUyYTNjZDVkZWE3MDRkMTc1ZjhlYmY2YWYzOTdkNjllMTEwYjk2YWZiMTdjN2EwMzI1OTMyOWU0ODI5YjBkMDNiYmM3ODk2YjE1YjRhZGU1M2UxMzA4NThjYzM0ZDk2MjY5YWE4OTA0MWY0MDkxMzZjNzI0MmEzODg5NWM5ZDViY2NhZDRmMzg5YWYxZDdhNGJkMTM5OGJkMDcyZGZmYTg5NjIzMzM5N2EifSwicHJpbmNpcGFsIjp7ImVtYWlsIjoiam9obkBtb2NrbXlpZC5jb20ifSwiaWF0IjoxNDc5NzQ3MzM5NjQ1LCJleHAiOjE0Nzk3NTA5Mzk2NDUsImlzcyI6Im1vY2tteWlkLmNvbSJ9.GsDGShd5DYKPIgs05ms3rayPXLENeeW7s8ZMATLxFD4OLuXw4SdIbw~eyJhbGciOiJEUzEyOCJ9.eyJleHAiOjE0Nzk3NDc1Nzk4NjYsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MCJ9.UJPsaJqmM-WrRbSj_BhW_Jy4sm1NcC3GOYURbJ6DNAsMZCsSzLwnzg';
var JAREDHANSON_GMAIL_ASSERTION = 'eyJhbGciOiJSUzI1NiJ9.eyJwdWJsaWMta2V5Ijp7ImFsZ29yaXRobSI6IkRTIiwieSI6IjZmNzlkNGZjNTYwNTAxNmMyOTYzNTc3YWVmM2IzOWY4YTI3ZWM0MTc3NmU3MGU3NTYxYzEyY2Q1MzYyNTM1ZWY0NDA0ZDEyZjNkMmM4OGVmNzk0ZjdkYTY4MzAzYmZhZTg0NGJkZDg5NDZkYjJjZDdjZGI0MjM5OTAwZTUwZmM4OTRhZGQxZGQ0YzE2OWU4MzFkMDdkNWU0NDk2MTE0MjQ5NTM3N2Y1N2JmOTliYTM1ZDlmMmZhYWFjZDE5OGM1ZGI4YmU4ZDVmZGEwNjEzNDFlY2I1ZDBiOGJlMzU4M2U3MmEyYTgxODRhODQ4MWVlYjA3MWU0NTgxYTZmNzBiY2UiLCJwIjoiZmY2MDA0ODNkYjZhYmZjNWI0NWVhYjc4NTk0YjM1MzNkNTUwZDlmMWJmMmE5OTJhN2E4ZGFhNmRjMzRmODA0NWFkNGU2ZTBjNDI5ZDMzNGVlZWFhZWZkN2UyM2Q0ODEwYmUwMGU0Y2MxNDkyY2JhMzI1YmE4MWZmMmQ1YTViMzA1YThkMTdlYjNiZjRhMDZhMzQ5ZDM5MmUwMGQzMjk3NDRhNTE3OTM4MDM0NGU4MmExOGM0NzkzMzQzOGY4OTFlMjJhZWVmODEyZDY5YzhmNzVlMzI2Y2I3MGVhMDAwYzNmNzc2ZGZkYmQ2MDQ2MzhjMmVmNzE3ZmMyNmQwMmUxNyIsInEiOiJlMjFlMDRmOTExZDFlZDc5OTEwMDhlY2FhYjNiZjc3NTk4NDMwOWMzIiwiZyI6ImM1MmE0YTBmZjNiN2U2MWZkZjE4NjdjZTg0MTM4MzY5YTYxNTRmNGFmYTkyOTY2ZTNjODI3ZTI1Y2ZhNmNmNTA4YjkwZTVkZTQxOWUxMzM3ZTA3YTJlOWUyYTNjZDVkZWE3MDRkMTc1ZjhlYmY2YWYzOTdkNjllMTEwYjk2YWZiMTdjN2EwMzI1OTMyOWU0ODI5YjBkMDNiYmM3ODk2YjE1YjRhZGU1M2UxMzA4NThjYzM0ZDk2MjY5YWE4OTA0MWY0MDkxMzZjNzI0MmEzODg5NWM5ZDViY2NhZDRmMzg5YWYxZDdhNGJkMTM5OGJkMDcyZGZmYTg5NjIzMzM5N2EifSwicHJpbmNpcGFsIjp7ImVtYWlsIjoiamFyZWRoYW5zb25AZ21haWwuY29tIn0sImlhdCI6MTQ3OTc2MDA5OTU1MCwiZXhwIjoxNDc5NzYzNzA5NTUwLCJpc3MiOiJnbWFpbC5sb2dpbi5wZXJzb25hLm9yZyJ9.C1gp0ZxjZ_Ik1kzRuEmnbRwNXUnbVhq_pKmAtGKkw7dytxIdM-77a2_vMJuYRhFPdJqLo73zcDdj5HzulBKqHaoUf56Jvoz2gXMD_sGdoupv65aDKOvhBgGrPXsRxBsMd7nzGCi6tLTeMU2rfSS_QdoTMaFUfKC_5BQZjXJygNzFayt2BbRgtm6h3wInx2Nkwm6zMm4FJT7fLFhOCuSCV4qZ4vQXKydw5nxsHqpksLQcIMP028VPPRmm3xPGf_6ZJEXDs3FBlCaFFjIC10dMwOQO9gduC3bhELnogkxaI8i_XVarb5qQ0FEgI9WhFh2SKNthQCJSq8foz9j4xkpwjg~eyJhbGciOiJEUzEyOCJ9.eyJleHAiOjE0Nzk3NjAyMzIwMTEsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MCJ9.Y0uF8zNDNmNh52BynY88Bh3r1zxFk5HQHHlpmD_62hJrAHLBdqH94w';


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
      clock = sinon.useFakeTimers(1479747579866);
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
          req.body['assertion'] = JOHN_MOCKMYIDCOM_ASSERTION;
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
      clock = sinon.useFakeTimers(1479747579866);
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
          req.body['assertion'] = JOHN_MOCKMYIDCOM_ASSERTION;
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
      clock = sinon.useFakeTimers(1479747579866);
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
          req.body['assertion'] = JOHN_MOCKMYIDCOM_ASSERTION;
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
  
  describe('handling a request with an assertion for a gmail.com address issued by Mozilla Persona', function() {
    this.timeout(10000);
    
    var clock;
    
    before(function() {
      clock = sinon.useFakeTimers(1479760232011);
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
          req.body['assertion'] = JAREDHANSON_GMAIL_ASSERTION;
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
  
});
