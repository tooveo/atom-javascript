'use strict';

/**
 *
 * Constructs an Atom service object.
 *
 * @param {Object} opt
 * @param {String} opt.endpoint - Endpoint api url
 * @param {String} opt.apiVersion - SDK version
 * @param {String} opt.auth (optional) - auth key for authentication
 *
 * @constructor new IronSourceAtom(options = {}) => Object
 */

function IronSourceAtom(opt) {
  var END_POINT = "https://track.atom-data.io/";
  var API_VERSION = "V1";
  this.options = {
    endpoint: !!opt.endpoint && opt.endpoint.toString() || END_POINT,
    apiVersion: !!opt.apiVersion && opt.apiVersion.match(/^V\d+&/g) ? opt.apiVersion : API_VERSION,
    auth: opt.auth || ""
  };
}

/**
 *
 * Put a single event to an Atom Stream.
 *
 * @param {Object} params
 * @param {String} params.table - target db table (cluster + table + schema)
 * @param {String} params.data - client data
 * @param {String} params.method (optional) - request method (default = "POST")
 * @param {Function} callback - callback client function
 */

IronSourceAtom.prototype.putEvent = function (params, callback) {
  if (!params.data) return;

  params.apiVersion = this.options.apiVersion;
  params.auth = this.options.auth;

  var req = new Request(this.options.endpoint, params);

  (!!params.method && params.method.toUpperCase() === "GET") ?
    req.get(callback) :
    req.post(callback);
};


/**
 *
 * Put a bulk of events to Atom.
 *
 * @param {Object} params
 * @param {String} params.table - target db table (cluster + table + schema)
 * @param {Array} params.data - client data
 * @param {String} params.method (optional) - request method (default = "POST")
 * @param {Function} callback - callback client function
 */

IronSourceAtom.prototype.putEvents = function (params, callback) {
  if (!params.data || !(params.data instanceof Array)) {
    console.error('Empty data or data not array');
    return;
  }

  params.apiVersion = this.options.apiVersion;
  params.auth = this.options.auth;

  var req = new Request(this.options.endpoint + '/bulk', params);

  (!!params.method && params.method.toUpperCase() === "GET") ?
    req.get(callback) : req.post(callback);
};

/**
 *
 * Sends a /GET health check to the Atom endpoint.
 *
 * @param {Function} callback - client callback function
 */

IronSourceAtom.prototype.health = function (callback) {
  var req = new Request(this.options.endpoint, null);

  req.get(callback);
};

module.exports = {
  IronSourceAtom: IronSourceAtom
};