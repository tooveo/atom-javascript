'use strict';

var ISAtom = require('../../dist/sdk').IronSourceAtom;
var expect = require('chai').expect;
var sinon = require('sinon');

describe('Check Atom class methods', function () {
  var opt = {
    // endpoint: '/'
  };
  var atom = new ISAtom(opt);

  it('should generate new class instance', function () {
    expect(atom.options.endpoint).to.be.equal("https://track.atom-data.io/");
    expect(atom.options.apiVersion).to.be.equal("V1");
    expect(atom.options.auth).to.be.equal("");
  });

  describe('Check requests', function () {
    var param = {
      table: 'staging.ic.ic_pixel_logs',
      data: "foo"
        // "{\"name\": \"iron\", \"last_name\": \"Beast\"}",
    };

    beforeEach(function () {
      this.xhr = sinon.useFakeXMLHttpRequest();
      
      this.requests = [];
      this.xhr.onCreate = function (xhr) {
        this.requests.push(xhr);
      }.bind(this);
      
      global.XMLHttpRequest = sinon.useFakeXMLHttpRequest();
    });

    afterEach(function() {
        this.xhr.restore();
    });

    it('should send POST request with putEvent method', function () {
      var callback = sinon.spy();
      
      atom.putEvent(param, callback);
      this.requests[0].respond(200,
        {"Content-Type": "application/json"},
        '{"table": "staging.ic.ic_pixel_logs", "data": "test"}');
      
      sinon.assert.calledWith(callback, {"table": "staging.ic.ic_pixel_logs", "data": "test"});
    });

    it('should send send GET request with putEvent method', function () {
    });

  });

  it('should take err response after xhr request', function () {

  });

  it('should take data from response after xhr request', function () {

  });

  it('should send health request', function () {
    
  });
});