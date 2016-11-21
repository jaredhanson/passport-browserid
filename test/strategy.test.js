var BrowserIDStrategy = require('../lib/strategy');
var chai = require('chai');


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
  
});
