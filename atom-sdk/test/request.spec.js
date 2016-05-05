'use strict';

function getXMLHttpRequest() {
  return global.XMLHttpRequest || require('jsdom').jsdom('', {
      url: 'http://localhost'
    }).defaultView.XMLHttpRequest;
}

function setupServer(sinon, before, after) {
  var server;
  before(function() {
    server = sinon.fakeServer.create({
      autoRespond: true
    });
    server.respondWith('POST', '/endpoint', [
      200,
      {
        'Content-Type': 'application/json'
      },
      '{"success": "true"}'
    ]);
  });
  after(function() {
    server.restore();
  });
}
global.XMLHttpRequest = getXMLHttpRequest();

var Request = require('../../dist/sdk').Request;
var expect = require('chai').expect;
var sinon = require('sinon');
var mock = require("./mock/is.mock");
var btoa = require('btoa');
global.btoa = btoa;

describe('request server', function() {
  setupServer(sinon, before, after);
  
  it('should send POST request', function(done) {
    var params = {
      table: "tableName",
      data: "analyticsData"
    };
    var req = new Request('/endpoint', params);

    req.post(function(res) {
      expect(res.data).to.be.eql({
        success: "true"
      });
      done();
    });
    
  });

  it('should send GET request', function(done) {
      done();
  });
});
