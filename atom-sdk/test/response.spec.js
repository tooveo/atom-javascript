'use strict';

var Response = require('../../dist/sdk').Response;
var expect = require('chai').expect;
var sinon = require('sinon');

describe('Response class test', function () {
  it('should return correct response data with no errors', function () {
    var response = new Response(null, "{\"key\": \"some data\"}", 200);

    expect(response.err()).to.be.null;
    expect(response.data()).to.be.eql({
      key: "some data"
    })
  });

  it('should return response object with error', function () {
    var response = new Response("authError: some data", null , 401);

    expect(response.data()).to.be.null;
    expect(response.err()).to.be.eql("authError: some data")
  });
});