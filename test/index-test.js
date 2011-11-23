var vows = require('vows');
var assert = require('assert');
var util = require('util');
var browserid = require('passport-browserid');


vows.describe('passport-browserid').addBatch({
  
  'module': {
    'should report a version': function (x) {
      assert.isString(browserid.version);
    },
  },
  
}).export(module);
