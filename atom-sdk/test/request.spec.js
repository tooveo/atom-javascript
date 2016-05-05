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

    server.respondWith('/endpoint', [
      200,
      {
        'Content-Type': 'application/json'
      },
      '{"success": "true"}'
    ]);
    server.respondWith(/endpoint\?data=.*/, [
      200,
      {
        'Content-Type': 'application/json'
      },
      '{"success": "true"}'
    ]);
    server.respondWith('/err', [
      401,
      {
        'Content-Type': 'application/json'
      },
      '{"error": "No permission for this table"}'
    ])
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
var assert = require('assert');
global.btoa = btoa;

describe('Testing Request class and methods', function() {
  setupServer(sinon, before, after);
  var params = {
    table: "tableName",
    data: "analyticsData"
  };
  
  it('should send POST request', function(done) {    
    var req = new Request('/endpoint', params);
    
    req.post(function(res) {
      expect(res.data).to.be.eql({
        success: "true"
      });
      done();
    });
  });

  it('should send GET request', function(done) {
      var req = new Request('/endpoint', params);
    
      req.get(function(res) {
        expect(res.data).to.be.eql({
          success: "true"
        });
        done();
      });
  });

  it('should handle POST request error', function(done) {
    var req = new Request('/err', params);

    req.post(function(res) {
      expect(res.status).to.be.not.eql(200);
      done();
    });
  });

  it('should handle GET request error', function(done) {
    var req = new Request('/err', params);

    req.get(function(res) {
      expect(res.status).to.be.not.eql(200);
      done();
    });
  });

  describe('should return throw error if params don`t have table or data attr', function() {
    var req = new Request('/endpoint', {});
    it('err for POST method', function() {
      expect(function(){
        req.post();
      }).to.throw("Table and data required fields for send event");
    });
    
    it('err for GET method', function() {
      expect(function(){
        req.get();
      }).to.throw("Table and data required fields for send event");  
    });
    
  });
});
