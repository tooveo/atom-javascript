'use strict';

var Request = require('../../dist/sdk').Request;
var expect = require('chai').expect;
var sinon = require('sinon');
var mock = require("./mock/is.mock");

describe('request server', function() {
  var server;
  // global.XMLHttpRequest = sinon.useFakeXMLHttpRequest();
  
  beforeEach(function() {
    server = sinon.fakeServer.create();
    server.autoRespond = true;
  });
  
  afterEach(function() {
    server.restore();
  });

  
  it('should send POST request', function(done) {
    
      done();
  });

  it('should send GET request', function(done) {
      done();
  });
});
