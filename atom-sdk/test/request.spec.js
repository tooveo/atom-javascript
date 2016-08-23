'use strict';

var Request = require('../../dist/sdk').Request;
var expect = require('chai').expect;
var sinon = require('sinon');
var assert = require('assert');

describe('Request class test', function () {

  describe('Request class methods', function () {

    _setupServer(sinon, before, after);

    var params = {
      stream: "tableName",
      data: "analyticsData"
    };

    it('should send a valid POST request', function (done) {
      params.endpoint = '/ok';
      var req = new Request(params);
      req.post(function (err, data, status) {
        expect(data).to.be.eql({Status: "OK"});
        expect(status).to.be.eql(200);
        done();
      });
    });

    it('should send a valid GET request', function (done) {
      params.endpoint = '/ok';
      var req = new Request(params);
      req.get(function (err, data, status) {
        expect(data).to.be.eql({Status: "OK"});
        expect(status).to.be.eql(200);
        done();
      });
    });

    it('should generate a valid GET request', function (done) {
      params.endpoint = '/get';
      var req = new Request(params);
      req.get(function (err, data, status) {
        data = data.split("=")[1];
        expect(data).to.eql("eyJ0YWJsZSI6InRhYmxlTmFtZSIsImRhdGEiOiJhbmFseXRpY3NEYXRhIiwiYXV0aCI6IiJ9");
        expect(status).to.be.eql(200);
        done();
      });
    });

    it('should handle POST request auth error', function (done) {
      params.endpoint = '/auth-error';
      var req = new Request(params);
      req.post(function (err, data, status) {
        expect(err).to.be.eql('Auth Error: "testStream"');
        expect(status).to.be.eql(401);
        done();
      });
    });

    it('should handle GET request auth error', function (done) {
      params.endpoint = '/auth-error';
      var req = new Request(params);
      req.get(function (err, data, status) {
        expect(err).to.be.eql('Auth Error: "testStream"');
        expect(status).to.be.eql(401);
        done();
      });
    });

    it('should handle POST request server error', function (done) {
      params.endpoint = '/server-error';
      var req = new Request(params);
      req.post(function (err, data, status) {
        expect(err).to.be.eql('Service Unavailable');
        expect(status).to.be.eql(503);
        done();
      });
    });

    it('should handle GET request server error', function (done) {
      params.endpoint = '/server-error';
      var req = new Request(params);
      req.get(function (err, data, status) {
        expect(err).to.be.eql('Service Unavailable');
        expect(status).to.be.eql(503);
        done();
      });
    });

    it('should check health method', function (done) {
      params.endpoint = '/health/';
      var req = new Request(params);
      req.health(function (err, data, status) {
        expect(status).to.be.eql(200);
        expect(data).to.be.eql('up');
        done();
      })
    });

    it('should do the hmac encryption correctly', function (done) {
      params = {
        stream: "tableName",
        data: "analyticsData",
        auth: "TestHMAC",
        endpoint: '/encrypt'
      };
      var req = new Request(params);
      req.post(function (err, data, status) {
        expect(status).to.be.eql(200);
        expect(data).to.be.eql({
          data: 'analyticsData',
          table: 'tableName',
          auth: '608e0a9306b8c7c99edfd9b9b13799c8d3349c6976fca5d7c0fdac588970fb21'
        });
        done();
      })
    });

    it('should handle connection error on POST request', function (done) {
      params.endpoint = '/no-connection';
      var req = new Request(params);
      req.post(function (err, data, status) {
        expect(status).to.be.eql(500);
        expect(data).to.be.null;
        expect(err).to.be.eql("No connection to server");
        done();
      })
    });

    it('should handle connection error on GET request', function (done) {
      params.endpoint = '/no-connection';
      var req = new Request(params);
      req.get(function (err, data, status) {
        expect(status).to.be.eql(500);
        expect(data).to.be.null;
        expect(err).to.be.eql("No connection to server");
        done();
      })
    });


  });

  describe('Request class argument assertion', function () {

    var req = new Request({endpoint: '/endpoint'});

    it('should return an error on missing arguments at post method', function () {
      req.post(function (err) {
        expect(err).to.be.eql('Stream and Data fields are required')
      });
    });

    it('should return an error on missing arguments at get method', function () {
      req.get(function (err) {
        expect(err).to.be.eql('Stream and Data fields are required')
      });
    });

    it('should return an error on invalid data', function () {
      var obj = {};
      obj.a = {b: obj};
      var testFunc = function () {
        new Request({endpoint: '/endpoint', data: obj})
      };
      expect(testFunc).to.throw('data is invalid - can\'t be stringified');
    });
  });

});

function _setupServer(sinon, before, after) {
  var server;

  before(function () {

    // Creates a new server. This function also calls sinon.useFakeXMLHttpRequest().
    server = sinon.fakeServer.create({
      autoRespond: true
    });

    server.respondWith(/ok(\?data=.*)?/, [200, {'Content-Type': 'application/json'}, '{ "Status": "OK" }']);

    server.respondWith(/auth-error(\?data=.*)?/, [401, {'Content-Type': 'text/plain'}, 'Auth Error: "testStream"']);

    server.respondWith("/health/health", [200, {'Content-Type': 'text/plain'}, "up"]);

    server.respondWith(/no-connection(\?data=.*)?/, [0, {'Content-Type': 'text/plain'}, "ERROR: No connection to server"]);

    server.respondWith(/server-error(\?data=.*)?/, [503, {'Content-Type': 'text/plain'}, 'Service Unavailable']);

    server.respondWith("/encrypt", function (request) {
      return request.respond(200, {'Content-Type': 'application/json'}, request.requestBody);
    });

    server.respondWith(/get\?data=.*/, function (request) {
      return request.respond(200, {'Content-Type': 'application/json'}, request.url);
    });


  });

  after(function () {
    server.restore();
  });
}
