'use strict';

/**
 *
 * Constructs an Atom service object.
 * @constructor
 * @param {Object} [options] - options for Atom class
 * @param {String} [options.endpoint] - Atom API url
 * @param {String} [options.auth] - Auth key for authentication
 * @param {String} [options.apiVersion] - Atom API version (shouldn't be changed).
 * @param {String} [options.sdkVersion] - Atom SDK Version
 * @param {String} [options.sdkType] - Atom SDK Type
 *
 */

function IronSourceAtom(options) {
  options = options || {};
  var END_POINT = "https://track.atom-data.io/";
  var API_VERSION = "V1"; // The atom API endpoint version (don't change it)
  var SDK_VERSION = "1.5.1";
  var SDK_TYPE = "atom-js";
  this.options = {
    endpoint: options.endpoint || END_POINT,
    apiVersion: API_VERSION,
    auth: options.auth || "",
    sdkVersion: options.sdkVersion ? SDK_VERSION + "+" + options.sdkVersion : SDK_VERSION,
    sdkType: options.sdkType ? SDK_TYPE + "+" + options.sdkType : SDK_TYPE
  };
}

window.IronSourceAtom = IronSourceAtom;

/**
 * Atom Callback function
 * @callback atomCallback
 * @param {String} error - error if exists else null
 * @param {Object} data - response from server
 * @param {Integer} status - response status from server
 */

/**
 * putEvent - Put a single event to an Atom stream.
 * @param {Object} params - parameters that the function can take
 * @param {String} params.stream - atom stream name
 * @param {(String|Object)} params.data - data (stringified data or object)
 * @param {String} [params.method=POST] - HTTP method (POST or GET)
 * @param {String} [params.endpoint] - Atom API endpoint
 * @param {String} [params.auth] - Atom stream HMAC auth key
 * @param {atomCallback} callback - The callback that handles the response.
 *
 * @example Request-Example:
 *
 * var stream = "MY.ATOM.STREAM";
 * var data = {
 *     event_name: "JS-SDK-PUT-EVENT-TEST",
 *     string_value: String(number),
 *     int_value: Math.round(number),
 *     float_value: number,
 *     ts: new Date()
 * };
 *
 * var atom = new IronSourceAtom();
 * var params = {
 *    data: data,
 *    stream: stream,
 *    method: 'GET' // default is POST
 * };
 *
 *
 * atom.putEvent(params,
 *  function (err, data, status) {
 *  .....
 * });
 */

IronSourceAtom.prototype.putEvent = function (params, callback) {
  params = params || {};
  if (!params.stream) return callback('Stream is required', null, 400);
  if (!params.data) return callback('Data is required', null, 400);

  params.apiVersion = this.options.apiVersion;
  params.sdkVersion = this.options.sdkVersion;
  params.sdkType = this.options.sdkType;
  params.auth = params.auth || this.options.auth;
  params.endpoint = params.endpoint || this.options.endpoint;

  var req = new Request(params);

  return (!!params.method && params.method.toUpperCase() === "GET") ?
    req.get(callback) : req.post(callback);
};

/**
 * putEvents - Put a bulk of events to Atom.
 *
 * @param {Object} params - parameters that the function can take
 * @param {String} params.stream - atom stream name
 * @param {Array} params.data - Multiple events in an an array
 * @param {String} [params.method=POST] - HTTP method (bulk events are sent by POST only)
 * @param {atomCallback} callback - The callback that handles the response.
 *
 * @example Request-Example:
 *
 * var stream = "MY.ATOM.STREAM";
 * var data = [
 * {"event_name":"JS-SDK-PUT-EVENTS-TEST","string_value":"67.217","int_value":67,"float_value":67.21,"ts":"2016-08-14T12:54:55.839Z"},
 * {"event_name":"JS-SDK-PUT-EVENTS-TEST","string_value":"2046.43","int_value":20,"float_value":2046.43,"ts":"2016-08-14T12:54:55.839Z"];
 * var atom = new IronSourceAtom();
 * atom.putEvents({ data: data, stream: stream },
 *  function (err, data, status) {
 *  .....
 * });
 */

IronSourceAtom.prototype.putEvents = function (params, callback) {
  params = params || {};
  if (!params.stream) {
    return callback('Stream is required', null, 400);
  }

  if (!params.data || !(params.data instanceof Array) || !params.data.length) {
    return callback('Data (must be not empty array) is required', null, 400);
  }

  if (params.method) {
    // Even though it will only send post we want to notify the client that he is not sending right.
    if (params.method.toUpperCase() == 'GET') {
      return callback('GET is not a valid method for putEvents', null, 400);
    }
  }

  params.apiVersion = this.options.apiVersion;
  params.auth = this.options.auth;
  params.sdkVersion = this.options.sdkVersion;
  params.sdkType = this.options.sdkType;
  params.endpoint = this.options.endpoint + 'bulk';

  var req = new Request(params);

  return req.post(callback);
};

/**
 *
 * Sends a /GET health check to the Atom endpoint
 * @param {atomCallback} callback - The callback that handles the response.
 */

IronSourceAtom.prototype.health = function (callback) {
  var params = this.options;
  var req = new Request(params);
  return req.health(callback);
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    IronSourceAtom: IronSourceAtom,
    Request: Request,
    Response: Response,
    Tracker: Tracker,
    taskMap: taskMap
  };
}
