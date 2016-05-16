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

    server.respondWith(/endpoint(\?data=.*)?/, [
      200,
      {
        'Content-Type': 'application/json'
      },
      '{"success": "true"}'
    ]);
    
    server.respondWith(/err(\?data=.*)?/, [
      401,
      {
        'Content-Type': 'application/json'
      },
      '{"error": "No permission for this table"}'
    ]);
    
    server.respondWith(/server-err(\?data=.*)?/, [
      500,
      {
        'Content-Type': 'application/json'
      },
      '{"error": "Server error"}'
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
      expect(res.err.error).to.be.not.eql(null);
      expect(res.status).to.be.eql(401);
      done();
    });
  });

  it('should handle GET request error', function(done) {
    var req = new Request('/err', params);

    req.get(function(res) {
      expect(res.err.error).to.be.not.eql(null);
      expect(res.status).to.be.eql(401);
      done();
    });
  });
  
  it('should throw error after 2min resend request to server with 500+ status', function(done){
    var req = new Request('/server-err', params);
    var resp;
    var clock = sinon.useFakeTimers();
    
    (function() {
      req.post(function (res) {
        resp = res;
      });
      clock.tick(12010);
      expect(resp).to.be.undefined;
      clock.tick(1201000);
      expect(resp.status).to.be.eql(500);
      done();      
    })();
    clock.restore();
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
