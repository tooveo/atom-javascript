'use strict';
var btoa = require('btoa');

function ISAtomMock(options) {
  var i = 0;
  this.putEvents = this.putEvent = function (params, callback) {
    switch (options.status) {
      case 200:
      default:
        return callback(null, '{ "Status": "OK" }', 200);
      case 500:
        if (++i == 3) {
          return callback(null, '{ "Status": "OK" }', 200);
        }
        return callback('Service Unavailable', null, 500);
      case 401:
        return callback('"Auth Error ' + params.data, null, 401);
    }
  };
}

module.exports = {
  ISAtomMock: ISAtomMock
};