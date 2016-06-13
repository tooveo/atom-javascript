'use strict';
var btoa = require('btoa');

function ISAtomMock(opt) {
  opt = opt || {};
  this.options = {
    endpoint: "/some-url",
    apiVersion: "V1",
    auth: "auth-key"
  };
  
  this.putEvents = this.putEvent = function(params, callback) {
    var req = new RequestMock(this.options.endpoint, params);
    
    params.apiVersion = this.options.apiVersion;
    params.auth = this.options.auth;
    
    return (!!params.method && params.method.toUpperCase() === "GET") ?
      req.get(callback) : req.post(callback);
  };
}

function RequestMock(url, params) {
  this.get = function(cb) {
    var data = JSON.stringify({
      table: params.stream,
      data: params.data,
      apiVersion: params.apiVersion,
      auth: params.auth
    });
    
    return btoa(data);
  };
  this.post = function(cb) {
    return params;
  }
}

module.exports = {
  RequestMock: RequestMock,
  ISAtomMock: ISAtomMock
};