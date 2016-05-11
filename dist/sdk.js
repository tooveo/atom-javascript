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
  var API_VERSION = "V1";
  this.options = {
    endpoint: !!opt.endpoint && opt.endpoint.toString() || END_POINT,
    apiVersion: API_VERSION,
    auth: !!opt.auth ? opt.auth : ""
  };
}

/**
 *
 * Put a single event to an Atom Stream.
 * @api {get/post} https://track.atom-data.io/ putEvent Send single data to Atom server
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
 *    "err": {"Target Stream": "Permission denied",
 *    "data": null,
 *    "status": 401    
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
 * @param {Object} params
 * @param {String} params.table - target db table (cluster + table + schema)
 * @param {String} params.data - client data
 * @param {String} params.method (optional) - request method (default = "POST")
 * @param {Function} callback - callback client function
 */

IronSourceAtom.prototype.putEvent = function (params, callback) {
  params = params || {};
  if (!params.table) throw new Error('Stream is required');
  if (!params.data) throw new Error('Data is required');

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
 *    "err": {"Target Stream": "Permission denied",
 *    "data": null,
 *    "status": 401
 *  }
 *
 * @apiSuccessExample Response:
 * HTTP 200 OK
 * {
 *    "err": null,
 *    "data": "success"
 *    "status": 200
 * }
 * @apiParamExample {json} Request-Example:
 * {
 *    "stream": "streamName",
 *    "data":  ["{\"name\": \"iron\", \"last_name\": \"Source\"}",
 *            "{\"name\": \"iron2\", \"last_name\": \"Source2\"}"]
 *
 * }
 *
 * @param {Object} params
 * @param {String} params.table - target db table (cluster + table + schema)
 * @param {Array} params.data - client data
 * @param {String} params.method (optional) - request method (default = "POST")
 * @param {Function} callback - callback client function
 */

IronSourceAtom.prototype.putEvents = function (params, callback) {
  params = params || {};
  if (!params.data || !(params.data instanceof Array) || !params.data.length) {
    throw new Error('Data (must be not empty array) is required');
  }
  if (!params.table) {
    throw new Error('Table is required');
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
    Response: Response
  };
}

/**
 *  Helper function for calculate data size in bytes
 *  
 * @param {object/string/number/array} object - Data for calculate
 * @returns {number} - Size in bytes
 */
function sizeof(object) {
  var objects = [object];
  var size = 0;
  
  for (var index = 0; index < objects.length; index++) {
    switch (typeof objects[index]) {
      case 'boolean':
        size += 4;
        break;
      
      case 'number':
        size += 8;
        break;
      
      case 'string':
        size += 2 * objects[index].length;
        break;
      
      case 'object':
        if (Object.prototype.toString.call(objects[index]) != '[object Array]') {
          for (var key in objects[index]) size += 2 * key.length;
        }
        for (var key in objects[index]) {
          var processed = false;
          
          for (var search = 0; search < objects.length; search++) {
            if (objects[search] === objects[index][key]) {
              processed = true;
              break;
            }
          }
          if (!processed) objects.push(objects[index][key]);
        }
        
    }
  }
  return size;
}

/**
 *
 * All requests made through the SDK are asynchronous and use a callback interface.
 *
 * @param {String} endpoint - the Atom endpoint to send data to
 * @param {Object} params - the params that are needed to construct the request.
 * @constructor
 */

function Request(endpoint, params) {
  this.endpoint = endpoint.toString() || "";
  this.params = params || {};
  this.headers = {
    contentType: "application/json;charset=UTF-8"
  };

  this.timer = 1000;
  this.xhr = (XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
}

/**
 *
 * Perform an HTTP POST to the Atom endpoint.
 *
 * @param {Function} callback - client callback function
 */

Request.prototype.post = function (callback) {
  if (!this.params.table || !this.params.data) {
    throw new Error ("Table and data required fields for send event");
  }
  var xhr = this.xhr;
  var data = JSON.stringify({
    data: this.params.data,
    table: this.params.table,
    apiVersion: this.params.apiVersion,
    auth: this.params.auth
  });
  var self = this;
  
  xhr.open("POST", this.endpoint, true);
  xhr.setRequestHeader("Content-type", this.headers.contentType);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      var res;
      if (xhr.status >= 200 && xhr.status < 300) {
        res = new Response(false, xhr.response, xhr.status);
        !!callback && callback(res.data());
      }
      else if (xhr.status >= 500) {
        if (self.timer >= 2 * 60 * 1000) {
          res = new Response(true, xhr.response, xhr.status);
          !!callback && callback(res.err());
        } else {
          setTimeout(function(){
            self.timer = self.timer * 2;
            self.post(callback);
          }, self.timer);
        }
      }
      else {
        res = new Response(true, xhr.response, xhr.status);
        !!callback && callback(res.err());
      }
    }
  };

  xhr.send(data);
};

/**
 *
 * Perform an HTTP GET to the Atom endpoint.
 *
 * @param {Function} callback - client callback function
 */


Request.prototype.get = function (callback) {
  if (!this.params.table || !this.params.data) {
    throw new Error ("Table and data required fields for send event");
  }
  var xhr = this.xhr;
  var base64Data;
  var data = JSON.stringify({
    table: this.params.table,
    data: this.params.data,
    apiVersion: this.params.apiVersion,
    auth: this.params.auth
  });
  var self = this;

  try {
    base64Data = btoa(data);
  } catch (e) {
    console.log('error=' + e);
  }

  xhr.open("GET", this.endpoint + '?data=' + base64Data, true);
  xhr.setRequestHeader("Content-type", this.headers.contentType);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      var res;
      
      if (xhr.status >= 200 && xhr.status < 300) {
        res = new Response(false, xhr.response, xhr.status);
        !!callback && callback(res.data());
      }
      else if (xhr.status >= 500) {
        if (self.timer >= 2 * 60 * 1000) {
          res = new Response(true, xhr.response, xhr.status);
          !!callback && callback(res.err());
        }
        else {
          setTimeout(function () {
            self.timer = self.timer * 2;
            self.get(callback);
          }, self.timer);
        }
      }
      else {
        res = new Response(true, xhr.response, xhr.status);
        !!callback && callback(res.err());
      }
    }
  };

  xhr.send();
};

/**
 *
 * Object with response data
 *
 * @param {Boolean} error - (true) if response have errors
 * @param {String} response - response after request
 * @param {String} status - response status code
 * @constructor
 */
function Response(error, response, status) {
  this.error = error;
  this.response = response;
  this.status = status;
}

/**
 *
 * Returns the de-serialized response data.
 *
 * @returns {Object} - return response data or null if response failed
 */

Response.prototype.data = function () {
  return this.error ? null : {
    err: null,
    data: JSON.parse(this.response),
    status: this.status
  }
};

/**
 *
 * Returns the de-serialized response error data.
 *
 * @returns {Object} -return response  "error" or null if no errors
 */

Response.prototype.err = function () {
  try {
    return this.error ? {
      err: JSON.parse(this.response),
      data: null,
      status: this.status
    } : null;
  } catch (e) {
    return this.error ? {
      err: this.response,
      data: null,
      status: this.status
    } : null;  
  }  
};

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
