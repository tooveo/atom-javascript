'use strict';

/**
 *
 * This class is the main entry point into this client API.
 *
 * @param {Object} config
 * @param {Number} config.flushInterval - timer for send data in seconds
 * @param {Number} config.bulkLen - number of records in each bulk request
 * @param {Number} config.bulkSize - the Maximum bulk size in bytes. The maximum should be 1MB
 * @param {Number} config.httpMethod - POST/GET
 *
 * Optional for ISAtom main object
 * @param {String} config.endpoint - Endpoint api url
 * @param {String} config.apiVersion - SDK version
 * @param {String} config.auth (optional) - auth key for authentication
 *
 * @constructor
 */
function Tracker(config) {
  this.flushInterval = !!config.flushInterval ? config.flushInterval : 10;
  this.bulkLen = !!config.bulkLen ? config.bulkLen : 10000;
  this.bulkSize = !!config.bulkSize ? config.bulkSize : 64;
  this.httpMethod = !!config.httpMethod ? config.httpMethod : "POST";
  this.accumulated = [];

  this.atom = new IronSourceAtom(config);
}

Tracker.prototype.track = function (stream, data) {
  var self = this;

  if (!this.timer) {
    this.timer = setTimeout(function () {
      self.flush();
    }, self.flushInterval * 1000);
  }

  if (!stream || !data.length) return;
  this.stream = stream;

  this.accumulated.push(data);

  if (this.accumulated.length == this.bulkLen || sizeof(this.accumulated) == this.bulkSize * 1024 ) {
    this.flush();
  }
};

Tracker.prototype.flush = function () {
  var dataToSend;
  var self = this;

  clearTimeout(this.timer);
  if (self.accumulated.length) {
    dataToSend = {
      table: self.stream,
      data: self.accumulated,
      method: self.httpMethod
    };
    self.accumulated.length == 1 ? self.atom.putEvent(dataToSend, callback) :
      self.atom.putEvents(dataToSend, callback)
  }

  this.accumulated = [];
  this.timer = null;
  self.track();
};
