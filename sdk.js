'use strict';

/**
 *
 * Constructs an Atom service object.
 *
 * @param {Object} opt
 * @param {String} opt.endpoint - Endpoint api url
 * @param {String} opt.apiVersion - SDK version
 * @param {String} opt.HMAC (optional) - HMAC key for authentication
 *
 * @constructor new IronSourceAtom(options = {}) => Object
 */

function IronSourceAtom(opt) {
    this.options = {
        endpoint: !!opt.endpoint && opt.endpoint.toString() || "https://track.atom-data.io/",
        apiVersion: opt.apiVersion.match(/^V\d+&/g) ? opt.apiVersion : 'V2',
        HMAC: opt.HMAC || ""
    };
}

/**
 *
 * Put a single event to an Atom Stream.
 *
 * @param {Object} params
 * @param {String} params.streamName - stream name (cluster + table + schema)
 * @param {String} params.data - client data
 * @param {String} params.method (optional) - request method (default = "POST")
 * @param {Function} callback - callback client function
 */

IronSourceAtom.prototype.putEvent = function(params, callback) {
    if (!params.data) return;

    params.apiVersion = this.options.apiVersion;
    params.HMAC = this.options.HMAC;
    
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
 * @param {String} params.streamName - stream name (cluster + table + schema)
 * @param {Array} params.data - client data
 * @param {String} params.method (optional) - request method (default = "POST")
 * @param {Function} callback - callback client function
 */

IronSourceAtom.prototype.putEvents = function(params, callback) {
    if (!params.data || !(params.data instanceof Array)) {
        console.error('Empty data or data not array');
        return;
    }
    
    params.apiVersion = this.options.apiVersion;
    params.HMAC = this.options.HMAC;

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

IronSourceAtom.prototype.health = function(callback) {
    var req = new Request(this.options.endpoint, null);

    req.get(callback);
};

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

    this.xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
}

/**
 *
 * Perform an HTTP POST to the Atom endpoint.
 *
 * @param {Function} callback - client callback function
 */

Request.prototype.post = function(callback) {
    var xhr = this.xhr;
    var data = JSON.stringify({
        data: this.params.data,
        streamName: this.params.streamName,
        apiVersion: this.params.apiVersion,
        HMAC: this.params.HMAC
    });

    xhr.open("POST", this.endpoint, true);
    xhr.setRequestHeader("Content-type", this.headers.contentType);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var res;
            if (xhr.status == 200) {
                res = new Response(false, xhr.response, xhr.status);
                !!callback && callback(res.data());
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


Request.prototype.get = function(callback) {
    var xhr = this.xhr;
    var base64Data;
    var data = JSON.stringify({
        streamName: this.params.streamName,
        data: this.params.data,
        apiVersion: this.params.apiVersion,
        HMAC: this.params.HMAC
    });

    try{
        base64Data = btoa(data);
    } catch (e){
        console.log('error=' + e);
    }

    xhr.open("GET", this.endpoint + '?data=' + base64Data, true);
    xhr.setRequestHeader("Content-type", this.headers.contentType);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var res;
            if (xhr.status == 200) {
                res = new Response(false, xhr.response, xhr.status);
                !!callback && callback(res.data());
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
 * @param {Boolean} err - (true) if response have errors
 * @param {String} response - response after request
 * @param {String} status - response status code
 * @constructor
 */

function Response(err, response, status) {
    this.err = err;
    this.response = response;
    this.status = status;
}

/**
 *
 * Returns the de-serialized response data.
 *
 * @returns {Object} - return response data or null if response failed
 */

Response.prototype.data = function() {
    return this.err ? null : {
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

Response.prototype.err = function() {
    return this.err ? {
        data: JSON.parse(this.response),
        status: this.status
    } : null;
};


/**
 *
 * This class is the main entry point into this client API.
 *
 * @param conf
 * @constructor
 */
function Tracker(conf) {}
