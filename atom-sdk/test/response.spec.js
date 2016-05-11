'use strict';

var Response = require('../../dist/sdk').Response;
var expect = require('chai').expect;
var sinon = require('sinon');

describe('Test for Response class', function() {
  it('should return correct response data with no errors', function() {
    var response = new Response(false, "{\"key\": \"some data\"}", 200);

    expect(response.err()).to.be.null;
    expect(response.data()).to.be.eql({
      err: null,
      data: {key: "some data"},
      status: 200
    })
  });
  
  it('should return response object with error', function() {
    var response = new Response(true, "{\"authError\": \"some data\"}", 401);

    expect(response.data()).to.be.null;
    expect(response.err()).to.be.eql({
      err: {authError: "some data"},
      data: null,
      status: 401
    })
  });
});