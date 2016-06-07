'use strict';

/**
 *
 * Constructs an Atom service object.
 * 
 * @param {Object} opt
 * @param {String} opt.endpoint - Endpoint api url
 * @param {String} opt.auth (optional) - auth key for authentication
 *
 * @constructor new IronSourceAtom(options = {}) => Object
 */

function IronSourceAtom(opt) {
  opt = opt || {};
  var END_POINT = "https://track.atom-data.io/";
  var API_VERSION = "1.1.0";
  this.options = {
    endpoint: !!opt.endpoint && opt.endpoint.toString() || END_POINT,
    apiVersion: API_VERSION,
    auth: !!opt.auth ? opt.auth : ""
  };
}

window.IronSourceAtom = IronSourceAtom; 

/**
 *
 * Put a single event to an Atom Stream.
 * @api {get/post} https://track.atom-data.io/ putEvent Send single data to Atom server
 * @apiVersion 1.0.1
 * @apiGroup Atom
 * @apiParam {String} stream Stream name for saving data in db table
 * @apiParam {String} data Data for saving 
 * @apiParam {String} method POST or GET method for do request
 * 
 * @apiSuccess {Null} err Server response error 
 * @apiSuccess {Object} data Server response data
 * @apiSuccess {String} status Server response status
 * 
 * @apiError {Object} err Server response error
 * @apiError {Null} data Server response data
 * @apiError {String} status Server response status
 * 
 * @apiErrorExample Error-Response:
 *  HTTP 401 Permission Denied
 *  {
 *    "err": {
 *      "message": "Permission denied",
 *      "status": 401
 *    },
 *    "data": null,
 *
 *  }
 * 
 * @apiSuccessExample Response:
 * HTTP 200 OK
 * {
 *    "err": null,
 *    "data": "success"
 *    "status": 200
 * }
 *
 * @apiParamExample {json} Request-Example:
 * {
 *    "stream": "streamName",
 *    "data":  "{\"name\": \"iron\", \"last_name\": \"Source\"}"
 * }
 *
 */

IronSourceAtom.prototype.putEvent = function (params, callback) {
  params = params || {};
  if (!params.table) return callback('Stream is required', null);
  if (!params.data) return callback('Data is required', null);

  params.apiVersion = this.options.apiVersion;
  params.auth = this.options.auth;

  var req = new Request(this.options.endpoint, params);

  return (!!params.method && params.method.toUpperCase() === "GET") ?
    req.get(callback) : req.post(callback);
};


/**
 *
 * Put a bulk of events to Atom.
 *
 * @api {get/post} https://track.atom-data.io/bulk putEvents Send multiple events data to Atom server
 * @apiVersion 1.0.1
 * @apiGroup Atom
 * @apiParam {String} stream Stream name for saving data in db table
 * @apiParam {Array} data Multiple event data for saving
 * @apiParam {String} method POST or GET method for do request
 *
 * @apiSuccess {Null} err Server response error
 * @apiSuccess {Object} data Server response data
 * @apiSuccess {String} status Server response status
 *
 * @apiError {Object} err Server response error
 * @apiError {Null} data Server response data
 * @apiError {String} status Server response status
 *
 * @apiErrorExample Error-Response:
 *  HTTP 401 Permission Denied
 *  {
 *    "err": 
 *    {
 *      "message": "Error message", 
 *      "status": 401 
 *    },
 *    "data": null
 *  }
 *
 * @apiSuccessExample Response:
 * HTTP 200 OK
 * {
 *    "err": null,
 *    "data": "success"
 * }
 * @apiParamExample {json} Request-Example:
 * {
 *    "stream": "streamName",
 *    "data":  ["{\"name\": \"iron\", \"last_name\": \"Source\"}",
 *            "{\"name\": \"iron2\", \"last_name\": \"Source2\"}"]
 *
 * }
 *
 */

IronSourceAtom.prototype.putEvents = function (params, callback) {
  params = params || {};
  if (!params.table) {
    return callback('Stream is required', null);
  }
  
  if (!params.data || !(params.data instanceof Array) || !params.data.length) {
    return callback('Data (must be not empty array) is required', null);
  }

  params.apiVersion = this.options.apiVersion;
  params.auth = this.options.auth;

  var req = new Request(this.options.endpoint + '/bulk', params);

  return (!!params.method && params.method.toUpperCase() === "GET") ?
    req.get(callback) : req.post(callback);
};

/**
 *
 * Sends a /GET health check to the Atom endpoint.
 *
 * @param {Function} callback - client callback function
 */

IronSourceAtom.prototype.health = function (callback) {
  var req = new Request(this.options.endpoint, {table: 'health_check', data: "null"});
  
  return req.get(callback);
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    IronSourceAtom: IronSourceAtom,
    Request: Request,
    Response: Response,
    Tracker: Tracker
  };
}
