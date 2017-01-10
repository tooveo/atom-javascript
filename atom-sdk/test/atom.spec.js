'use strict';

var ISAtom = require('../../dist/sdk').IronSourceAtom;
var expect = require('chai').expect;
var Request = require('../../dist/sdk').Request;
var Response = require('../../dist/sdk').Response;
var sinon = require('sinon');

describe('Atom class test', function () {

  var SDK_VERSION = "1.5.1";
  var SDK_TYPE = "atom-js";
  var API_VERSION = 'V1';
  var END_POINT = 'https://track.atom-data.io/';

  describe("Constructor Tests", function () {

    it('should generate new IronSourceAtom object with default values', function () {
      var atom = new ISAtom();

      expect(atom.options).to.eql({
        endpoint: END_POINT,
        apiVersion: API_VERSION,
        auth: "",
        sdkVersion: SDK_VERSION,
        sdkType: SDK_TYPE
      });
    });

    it('should generate new IronSourceAtom object with custom values', function () {
      var options = {
        endpoint: "/some-url",
        auth: "aM<dy2gchHsad07*hdACY",
        apiVersion: API_VERSION,
        sdkVersion: "1.2.0",
        sdkType: "atom-js-session",
      };
      var atom = new ISAtom(options);
      var expectedOption = (function (options) {
        options.sdkVersion = SDK_VERSION + "+" + options.sdkVersion;
        options.sdkType = SDK_TYPE + "+" + options.sdkType;
        return options;
      })(options);
      expect(atom.options).to.eql(expectedOption);
    });
  });

  describe("putEvent, putEvents and health methods test", function () {

    beforeEach(function () {
      sinon.stub(Request.prototype, "get", function () {
        console.log(this.params);
        return this.params;
      });

      sinon.stub(Request.prototype, "post", function () {
        console.log(this.params);
        return this.params;
      });

      sinon.stub(Request.prototype, "health", function (callback) {
        var res = new Response(null, 'ok', 200);
        return callback(null, res.data(), res.status);
      });

    });

    it('should generate right data for POST & GET requests on putEvent method', function () {
      var options = {
        auth: "auth-key"
      };

      var atom = new ISAtom(options);
      var params = {
        stream: 'table',
        data: 'data'
      };

      expect(atom.putEvent(params)).to.be.eql({
        stream: "table",
        data: 'data',
        apiVersion: API_VERSION,
        auth: "auth-key",
        sdkVersion: SDK_VERSION,
        sdkType: SDK_TYPE,
        endpoint: sinon.xhr.supportsCORS ? END_POINT : END_POINT.replace(/^(http|https):/, location.protocol)
      });

      atom = new ISAtom(options);
      params = {
        stream: 'table',
        data: 'data',
        method: 'GET'
      };

      expect(atom.putEvent(params)).to.be.eql({
        stream: "table",
        data: 'data',
        apiVersion: API_VERSION,
        auth: "auth-key",
        sdkVersion: SDK_VERSION,
        sdkType: SDK_TYPE,
        method: 'GET',
        endpoint: sinon.xhr.supportsCORS ? END_POINT : END_POINT.replace(/^(http|https):/, location.protocol)
      });
    });


    it('should generate right data for POST requests on putEvents method', function () {
      var options = {
        auth: "auth-key"
      };

      var atom = new ISAtom(options);
      var params = {
        stream: 'table',
        data: ["data"]
      };

      expect(atom.putEvents(params)).to.be.eql({
        stream: "table",
        data: '[\"data\"]',
        apiVersion: API_VERSION,
        auth: "auth-key",
        sdkVersion: SDK_VERSION,
        sdkType: SDK_TYPE,
        endpoint: (sinon.xhr.supportsCORS ? END_POINT : END_POINT.replace(/^(http|https):/, location.protocol)) + "bulk"
      });
    });

    it('should return error for putEvent/putEvents on wrong params', function () {
      var atom = new ISAtom();

      atom.putEvent({stream: "test"}, function (err) {
        expect(err).to.be.eql('Data is required');
      });

      atom.putEvent({}, function (err) {
        expect(err).to.be.eql('Stream is required');
      });

      atom.putEvents({stream: "test"}, function (err) {
        expect(err).to.be.eql('Data (must be not empty array) is required');
      });

      atom.putEvents({data: ['some data']}, function (err) {
        expect(err).to.be.eql('Stream is required');
      });

      atom.putEvents({stream: 'test', data: ['some data'], method: 'GET'}, function (err) {
        expect(err).to.be.eql('GET is not a valid method for putEvents');
      });

    });

    it('should generate right data for Health method', function () {
      var atom = new ISAtom();
      atom.health(function (err, data, status) {
        expect(err).to.be.null;
        expect(data).to.be.eql('ok');
        expect(status).to.be.eql(200);
      });
    });

    afterEach(function () {
      Request.prototype.post.restore();
      Request.prototype.get.restore();
      Request.prototype.health.restore();
    });

  });
});