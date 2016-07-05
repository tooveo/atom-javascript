'use strict';

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
global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

var Request = require('../../dist/sdk').Request;
var ISAtom = require('../../dist/sdk').IronSourceAtom;
var expect = require('chai').expect;
var sinon = require('sinon');
var mock = require("./mock/is.mock");
var btoa = require('btoa');
var assert = require('assert');
global.btoa = btoa;

describe('Testing Request class and methods', function() {
  setupServer(sinon, before, after);
  
  var params = {
    stream: "tableName",
    data: "analyticsData"
  };
  
  it('should send POST request', function(done) {    
    var req = new Request('/endpoint', params);
    
    req.post(function(err, data) {
      expect(data).to.be.eql({
        success: "true"
      });
      done();
    });
  });

  it('should send GET request', function(done) {
    var req = new Request('/endpoint', params);
    
      req.get(function(err, data) {
        expect(data).to.be.eql({
          success: "true"
        });
        done();
      });
  });

  it('should handle POST request error', function(done) {
    var req = new Request('/err', params);

    req.post(function(err, data) {
      expect(err).to.be.not.eql(null);
      expect(err.status).to.be.eql(401);
      done();
    });
  });

  it('should handle GET request error', function(done) {
    var req = new Request('/err', params);

    req.get(function(err, data) {
      expect(err).to.be.not.eql(null);
      expect(err.status).to.be.eql(401);
      done();
    });
  });
  
  describe('should return throw error if params don`t have stream or data attr', function() {
    var req = new Request('/endpoint', {});
    
    it('err for POST method', function() {
        req.post(function(err){
          expect(err).to.be.eql('Stream and data required fields for send event')
        });
    });
    
    it('err for GET method', function() {
        req.get(function(err){
          expect(err).to.be.eql('Stream and data required fields for send event')
        });
    });
    
  });
  
  it('should check real params for putEvent', function(done) {
    var atom = new ISAtom({"endpoint": '/endpoint'});
    var params = {
      stream: 'table',
      data: 'data',
      method: 'GET'
    };
    
    atom.putEvent(params, function(err, data){
      expect(params.apiVersion).to.be.not.undefined;
      expect(params.auth).to.be.not.undefined;
      done();
    });
  });
  
  it('should check real params for putEvents', function(done) {
    var atom = new ISAtom({"endpoint": '/endpoint'});
    var params = {
      stream: 'table',
      data: ['data']
      
    };
   
    atom.putEvents(params, function(err, data){
      expect(params.apiVersion).to.be.not.undefined;
      expect(params.auth).to.be.not.undefined;
      done();
    });
  });

  

  it('should check health method', function(done) {
    var atom = new ISAtom({"endpoint": '/endpoint'});

    atom.health(function(err, data, status){
      expect(status).to.be.not.eql(500);
      expect(status).to.be.not.eql(404);
      done();
    })
  })
});
