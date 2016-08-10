'use strict';

var ISAtom = require('../../dist/sdk').IronSourceAtom;
var expect = require('chai').expect;
var Request = require('../../dist/sdk').Request;
var sinon = require('sinon');

describe('Atom class test', function () {

  describe("Constructor Tests", function () {

    it('should generate new IronSourceAtom object with default values', function () {
      var atom = new ISAtom();

      expect(atom.options).to.eql({
        endpoint: "https://track.atom-data.io/",
        apiVersion: "V1",
        auth: ""
      })
    });

    it('should generate new IronSourceAtom object with custom values', function () {
      var opt = {
        endpoint: "/some-url",
        auth: "aM<dy2gchHsad07*hdACY",
        apiVersion: 'V1'
      };
      var atom = new ISAtom(opt);

      expect(atom.options).to.eql(opt);
    });
  });

  describe("putEvent and putEvents test", function () {

    beforeEach(function () {
      sinon.stub(Request.prototype, "get", function () {
        return this.params;
      });

      sinon.stub(Request.prototype, "post", function () {
        return this.params;
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
        apiVersion: "V1",
        auth: "auth-key"
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
        apiVersion: "V1",
        auth: "auth-key",
        method: 'GET'
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
        apiVersion: "V1",
        auth: "auth-key"
      });
    });

    it('should return error for putEvent/putEvents if missing required params', function () {
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
    });

    afterEach(function () {
      Request.prototype.post.restore();
      Request.prototype.get.restore();
    });
  });

});