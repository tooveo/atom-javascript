(function(window, document, undefined) {

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

/**
 * Handles all requests to ironSource atom
 * @constructor
 * @param {Object} params - Request class parameters.
 * @param {String} params.endpoint - The Atom endpoint we send to.
 * @param {String} params.skdType - Atom SDK type header
 * @param {String} params.sdkVersion - Atom SDK version header
 * @param {(String|Array|Object)} params.data - Payload that will be delivered to Atom.
 * @param {String} params.stream - Atom stream name
 * @param {String} [params.auth] - Atom Stream HMAC auth key
 * @param {String} [params.method] - HTTP send method
 */

function Request(params) {
  this.params = params || {};

  // If we delivered some params and it's not a string we try to stringify it.
  if ((typeof params.data !== 'string' && !(params.data instanceof String))) {
    try {
      this.params.data = JSON.stringify(this.params.data);
    } catch (e) {
      throw new Error("data is invalid - can't be stringified");
    }
  }

  this.headers = {
    contentType: "application/json;charset=UTF-8",
    sdkType: this.params.sdkType,
    sdkVersion: this.params.sdkVersion
  };

  // Shitty old explorer 9 browser, no support for headers at XDomainRequest
  if ('XDomainRequest' in window && window.XDomainRequest !== null) {
    // IE9 CORS support only same protocol end to end (HTTP->HTTP, HTTPS->HTTPS)
    this.params.endpoint = this.params.endpoint.replace(/^(http|https):/, location.protocol);
    this.xhr = new XDomainRequest();
    this.oldBrowser = true;
  } else {
    this.xhr = new XMLHttpRequest();
    this.oldBrowser = false;
  }
}

/**
 * Perform an HTTP POST to the Atom endpoint.
 * @param {atomCallback} callback - The callback that handles the response.
 */

Request.prototype.post = function (callback) {

  if (!this.params.stream || !this.params.data) {
    return callback("Stream and Data fields are required", null, 400);
  }

  var payload = JSON.stringify({
    data: this.params.data,
    table: this.params.stream,
    apiVersion: this.params.apiVersion,
    auth: !!this.params.auth ? CryptoJS.HmacSHA256(this.params.data, this.params.auth).toString(CryptoJS.enc.Hex) : ""
  });

  this._sendRequest(payload, "POST", callback);

};

/**
 *
 * Perform an HTTP GET to the Atom endpoint.
 * @param {atomCallback} callback - The callback that handles the response.
 */

Request.prototype.get = function (callback) {
  if (!this.params.stream || !this.params.data) {
    return callback("Stream and Data fields are required", null, null);
  }

  var base64Payload;
  var data = JSON.stringify({
    table: this.params.stream,
    data: this.params.data,
    apiVersion: this.params.apiVersion,
    auth: !!this.params.auth ? CryptoJS.HmacSHA256(this.params.data, this.params.auth).toString(CryptoJS.enc.Hex) : ""
  });

  try {
    base64Payload = Base64.encode(data);
  } catch (e) {
    /* istanbul ignore next */
    throw new Error("Can't encode Base64 data: " + e);
  }

  this._sendRequest(base64Payload, "GET", callback);

};

/**
 * Preform a health check on Atom Endpoint
 * @param {atomCallback} callback - The callback that handles the response.
 */
Request.prototype.health = function (callback) {
  this._sendRequest('health', 'GET', callback);
};


Request.prototype._sendRequest = function (payload, method, callback) {
  var xhr = this.xhr;
  var getURL = payload == "health" ? this.params.endpoint + 'health' : this.params.endpoint + '?data=' + payload;

  // IE9 support with XDomainRequest - request must be HTTP/HTTPS from origin to dest.
  if (this.oldBrowser) {
    var response;
    xhr.open(method, this.params.endpoint);
    xhr.onload = function () {
      console.log("[ONLOAD]: " + xhr.responseText);
      response = new Response(null, xhr.responseText, 200);
      callback(null, response.data(), response.status);
    };

    xhr.onprogress = function () {
    }; // prevent aborting (bug in IE9)

    xhr.ontimeout = function () {
      console.log("[TIMEOUT]: GOT 500");
      response = new Response("No connection to server", null, 500);
      callback(response.err(), null, response.status);
    };

    xhr.onerror = function () {
      // There is no way to get the error code in IE9 so we return 500 in order to retry
      console.log("[ERROR]: GOT 500");
      response = new Response("Service Unavailable", null, 500);
      callback(response.err(), null, response.status);
    };

    if (method === 'POST') {
      xhr.open("POST", this.params.endpoint);
      xhr.send(payload);
    } else {
      xhr.open("GET", getURL);
      xhr.send();
    }

  } else {
    // Better browsers that use XMLHTTPRequest func and support headers
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status == 200) {
          response = new Response(null, xhr.response, xhr.status);
          callback(null, response.data(), response.status);
        } else if (xhr.status >= 400 && xhr.status < 600) {
          response = new Response(xhr.response, null, xhr.status);
          callback(response.err(), null, response.status);
        } else if (xhr.status == 0) {
          response = new Response("No connection to server", null, 500);
          callback(response.err(), null, 500);
        }
      }
    };

    if (method === 'POST') {
      xhr.open("POST", this.params.endpoint, true);
      this._setRequestHeaders();
      xhr.send(payload);
    } else {
      xhr.open("GET", getURL, true);
      this._setRequestHeaders();
      xhr.send();
    }
  }
};

Request.prototype._setRequestHeaders = function () {
  this.xhr.setRequestHeader("Content-type", this.headers.contentType);
  this.xhr.setRequestHeader("x-ironsource-atom-sdk-type", this.headers.sdkType);
  this.xhr.setRequestHeader("x-ironsource-atom-sdk-version", this.headers.sdkVersion);
};

/**
 *
 * Constructs an Object with response data
 * @param {Object|String} error - Error if exist, else null
 * @param {Object|String} response - return response data or null if response failed
 * @param {Number} status - response status code
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
 * @returns {Object|String} - return response data or null if response failed
 */

Response.prototype.data = function () {
  if (this.error) {
    return null;
  }
  try {
    return JSON.parse(this.response);
  } catch (e) {
    return this.response
  }
};

/**
 *
 * Returns the de-serialized response error data.
 * @returns {Object|String} - return response "error" or null if no error exists.
 */

Response.prototype.err = function () {
  try {
    return JSON.parse(this.error);
  } catch (e) {
    return this.error;
  }
};

'use strict';

/**
 *
 * This class implements a tracker for tracking events to ironSource atom
 * @param {Object} params
 * @param {Number} [params.flushInterval=30 seconds] - Data sending interval
 * @param {Number} [params.bulkLen=20] - Number of records in each bulk request
 * @param {Number} [params.bulkSize=40KB] - The maximum bulk size in KB.
 *
 * Optional for ISAtom main object:
 * @param {String} [params.endpoint] - Endpoint api url
 * @param {String} [params.auth] - Key for hmac authentication
 * @constructor
 */
function Tracker(params) {
  var self = this;
  this.retryTimeout = 1000;
  params = params || {};
  this.params = params;
  this.params.flushInterval = params.flushInterval ? params.flushInterval * 1000 : 10000;
  this.params.bulkLen = params.bulkLen ? params.bulkLen : 3;
  this.params.bulkSize = params.bulkSize ? params.bulkSize * 1024 : 10 * 1024;
  this.params.auth = params.auth ? params.auth : ''; // Default auth for all streams

  // Dict of accumulated records: (stream -> [data array])
  this.accumulated = {};
  this.atom = new IronSourceAtom(params);

  //Flush everything every {flushInterval} seconds
  if (!this.timer) {
    this.timer = setInterval(function () {
      self.flush();
    }, this.params.flushInterval);
  }
}

window.IronSourceAtom.Tracker = Tracker;

/**
 * Atom Callback function
 * @callback trackerCallback
 * @param {Array} data - Array with responce from server: [{err,data,status}...]
 */

/**
 * Start tracking events to ironSource Atom
 * @param {String} stream - Atom stream name
 * @param {String|Object} data - data to be tracked to atom.
 *
 * @example
 * var options = {
 *    endpoint: "https://track.atom-data.io/",
 *    auth: "YOUR_HMAC_AUTH_KEY", // Optional, depends on your stream config
 *    flushInterval: 10, // Optional, Tracker flush interval in seconds (default: 30 seconds)
 *    bulkLen: 50, // Optional, Number of events per bulk (batch) (default: 20)
 *    bulkSize: 20 // Optional, Size of each bulk in KB (default: 40KB)
 * }
 *
 * var tracker = new IronSourceAtom.Tracker(options); // Init a new tracker
 * var stream = "MY_STREAM_NAME", // Your target stream name
 * var data = {id: 1, string_col: "String"} // Data that matches your DB structure
 * tracker.track(stream, data); // Start tracking and empty on the described above conditions
 *
 */

Tracker.prototype.track = function (stream, data) {
  var self = this;
  if (stream === undefined || stream.length == 0 || data.length == 0 || data === undefined) {
    throw new Error('Stream name and data are required parameters');
  }

  // Init the stream backlog (stream -> [data array])
  if (!(stream in self.accumulated)) {
    self.accumulated[stream] = [];
  }

  // Store the data as an array of strings
  if ((typeof data !== 'string' && !(data instanceof String))) {
    try {
      self.accumulated[stream].push(JSON.stringify(data))
    } catch (e) {
      /* istanbul ignore next */
      throw new Error("Invalid Data - can't be stringified", e);
    }
  } else {
    self.accumulated[stream].push(data);
  }

  // Flush on a certain bulk length or bulk size (in bytes)
  if (self.accumulated[stream].length >= self.params.bulkLen
    || _byteCount(self.accumulated[stream]) >= self.params.bulkSize) {
    self.flush(stream);
  }
};

/**
 * Flush accumulated events to ironSource Atom
 * @param {String} targetStream - atom stream name
 * @param {trackerCallback} callback - The callback that handles the response.
 *
 * @example
 *
 *  // To Flush all events:
 *  tracker.flush(null, function (results) {
 *    //returns an array of results, for example:
 *    //data is: {"a":[{key: "value"}],"b":[{key: "value"}]}
 *    //result: [{"err":"Auth Error: \"a\"","data":null,"status":401} ,{"err":null,"data":{"Status":"OK"},"status":200}]
 *    NOTE: the results will be in the same order as the data.
 *  }); // Send accumulated data immediately

 // If you don't need the results, just do:
 tracker.flush();
 // OR to flush a single stream (optional callback)
 tracker.flush(stream);
 */

Tracker.prototype.flush = function (targetStream, callback) {
  var self = this;
  var timeout = this.retryTimeout;

  if (!callback) {
    callback = function (err, data) {
      return err ? new Error(err) : data;
    };
  }

  var tasks = [];

  if (targetStream) {
    if (self.accumulated[targetStream].length >= 1) {
      tasks.push(function (taskCb) {
        _send(targetStream, self.accumulated[targetStream], timeout, taskCb, true);
      });
    }
  } else {
    for (var stream in self.accumulated) {
      if (self.accumulated[stream].length >= 1) {
        // The IIFE is here to create a separate scope so we don't get the stream as closure from the upper func.
        // DO NOT REMOVE IT unless you find a nicer way to copy the stream by value without jqeury/es6.
        (function (stream) {
          tasks.push(function (taskCb) {
            return _send(stream, self.accumulated[stream], timeout, taskCb, true);
          });
        })(stream);
      }
    }
  }
  return taskMap(tasks, callback);

  function _send(sendStream, sendData, timeout, callback, firstRun) {

    // In order to prevent the deletion of the data on each function call
    if (firstRun) {
      self.accumulated[sendStream] = [];
      firstRun = false;
    }

    // check return
    return self.atom.putEvents({"stream": sendStream, "data": sendData}, function (err, data, status) {
      if (err != null && status >= 500) {
        // Exponential back off + jitter - retry for 20 minutes max
        if (timeout < 20 * 60 * 1000) {
          setTimeout(function () {
            timeout = timeout * 2 + Math.floor((Math.random() * 1000) + 100);
            _send(sendStream, sendData, timeout, callback, firstRun);
          }, timeout);
          return;
        } else {
          // Case server didn't respond for too much time
          return callback('Timeout - No response from server', null, 408);
        }
      }
      return callback(err, data, status);
    })
  }
};

function _byteCount(string) {
  return encodeURI(string).split(/%..|./).length - 1;
}
/* istanbul ignore next */
if(true){var CryptoJS=CryptoJS||function(t,n){var i={},e=i.lib={},r=e.Base=function(){function t(){}return{extend:function(n){t.prototype=this;var i=new t;return n&&i.mixIn(n),i.hasOwnProperty("init")||(i.init=function(){i.$super.init.apply(this,arguments)}),i.init.prototype=i,i.$super=this,i},create:function(){var t=this.extend();return t.init.apply(t,arguments),t},init:function(){},mixIn:function(t){for(var n in t)t.hasOwnProperty(n)&&(this[n]=t[n]);t.hasOwnProperty("toString")&&(this.toString=t.toString)},clone:function(){return this.init.prototype.extend(this)}}}(),s=e.WordArray=r.extend({init:function(t,i){t=this.words=t||[],i!=n?this.sigBytes=i:this.sigBytes=4*t.length},toString:function(t){return(t||a).stringify(this)},concat:function(t){var n=this.words,i=t.words,e=this.sigBytes,r=t.sigBytes;if(this.clamp(),e%4)for(var s=0;r>s;s++){var o=i[s>>>2]>>>24-s%4*8&255;n[e+s>>>2]|=o<<24-(e+s)%4*8}else for(var s=0;r>s;s+=4)n[e+s>>>2]=i[s>>>2];return this.sigBytes+=r,this},clamp:function(){var n=this.words,i=this.sigBytes;n[i>>>2]&=4294967295<<32-i%4*8,n.length=t.ceil(i/4)},clone:function(){var t=r.clone.call(this);return t.words=this.words.slice(0),t},random:function(n){for(var i,e=[],r=function(n){var n=n,i=987654321,e=4294967295;return function(){i=36969*(65535&i)+(i>>16)&e,n=18e3*(65535&n)+(n>>16)&e;var r=(i<<16)+n&e;return r/=4294967296,r+=.5,r*(t.random()>.5?1:-1)}},o=0;n>o;o+=4){var a=r(4294967296*(i||t.random()));i=987654071*a(),e.push(4294967296*a()|0)}return new s.init(e,n)}}),o=i.enc={},a=o.Hex={stringify:function(t){for(var n=t.words,i=t.sigBytes,e=[],r=0;i>r;r++){var s=n[r>>>2]>>>24-r%4*8&255;e.push((s>>>4).toString(16)),e.push((15&s).toString(16))}return e.join("")},parse:function(t){for(var n=t.length,i=[],e=0;n>e;e+=2)i[e>>>3]|=parseInt(t.substr(e,2),16)<<24-e%8*4;return new s.init(i,n/2)}},c=o.Latin1={stringify:function(t){for(var n=t.words,i=t.sigBytes,e=[],r=0;i>r;r++){var s=n[r>>>2]>>>24-r%4*8&255;e.push(String.fromCharCode(s))}return e.join("")},parse:function(t){for(var n=t.length,i=[],e=0;n>e;e++)i[e>>>2]|=(255&t.charCodeAt(e))<<24-e%4*8;return new s.init(i,n)}},h=o.Utf8={stringify:function(t){try{return decodeURIComponent(escape(c.stringify(t)))}catch(n){throw new Error("Malformed UTF-8 data")}},parse:function(t){return c.parse(unescape(encodeURIComponent(t)))}},u=e.BufferedBlockAlgorithm=r.extend({reset:function(){this._data=new s.init,this._nDataBytes=0},_append:function(t){"string"==typeof t&&(t=h.parse(t)),this._data.concat(t),this._nDataBytes+=t.sigBytes},_process:function(n){var i=this._data,e=i.words,r=i.sigBytes,o=this.blockSize,a=4*o,c=r/a;c=n?t.ceil(c):t.max((0|c)-this._minBufferSize,0);var h=c*o,u=t.min(4*h,r);if(h){for(var f=0;h>f;f+=o)this._doProcessBlock(e,f);var l=e.splice(0,h);i.sigBytes-=u}return new s.init(l,u)},clone:function(){var t=r.clone.call(this);return t._data=this._data.clone(),t},_minBufferSize:0}),f=(e.Hasher=u.extend({cfg:r.extend(),init:function(t){this.cfg=this.cfg.extend(t),this.reset()},reset:function(){u.reset.call(this),this._doReset()},update:function(t){return this._append(t),this._process(),this},finalize:function(t){t&&this._append(t);var n=this._doFinalize();return n},blockSize:16,_createHelper:function(t){return function(n,i){return new t.init(i).finalize(n)}},_createHmacHelper:function(t){return function(n,i){return new f.HMAC.init(t,i).finalize(n)}}}),i.algo={});return i}(Math);!function(t){var n=CryptoJS,i=n.lib,e=i.WordArray,r=i.Hasher,s=n.algo,o=[],a=[];!function(){function n(n){for(var i=t.sqrt(n),e=2;i>=e;e++)if(!(n%e))return!1;return!0}function i(t){return 4294967296*(t-(0|t))|0}for(var e=2,r=0;64>r;)n(e)&&(8>r&&(o[r]=i(t.pow(e,.5))),a[r]=i(t.pow(e,1/3)),r++),e++}();var c=[],h=s.SHA256=r.extend({_doReset:function(){this._hash=new e.init(o.slice(0))},_doProcessBlock:function(t,n){for(var i=this._hash.words,e=i[0],r=i[1],s=i[2],o=i[3],h=i[4],u=i[5],f=i[6],l=i[7],p=0;64>p;p++){if(16>p)c[p]=0|t[n+p];else{var d=c[p-15],y=(d<<25|d>>>7)^(d<<14|d>>>18)^d>>>3,g=c[p-2],v=(g<<15|g>>>17)^(g<<13|g>>>19)^g>>>10;c[p]=y+c[p-7]+v+c[p-16]}var _=h&u^~h&f,w=e&r^e&s^r&s,B=(e<<30|e>>>2)^(e<<19|e>>>13)^(e<<10|e>>>22),m=(h<<26|h>>>6)^(h<<21|h>>>11)^(h<<7|h>>>25),S=l+m+_+a[p]+c[p],H=B+w;l=f,f=u,u=h,h=o+S|0,o=s,s=r,r=e,e=S+H|0}i[0]=i[0]+e|0,i[1]=i[1]+r|0,i[2]=i[2]+s|0,i[3]=i[3]+o|0,i[4]=i[4]+h|0,i[5]=i[5]+u|0,i[6]=i[6]+f|0,i[7]=i[7]+l|0},_doFinalize:function(){var n=this._data,i=n.words,e=8*this._nDataBytes,r=8*n.sigBytes;return i[r>>>5]|=128<<24-r%32,i[(r+64>>>9<<4)+14]=t.floor(e/4294967296),i[(r+64>>>9<<4)+15]=e,n.sigBytes=4*i.length,this._process(),this._hash},clone:function(){var t=r.clone.call(this);return t._hash=this._hash.clone(),t}});n.SHA256=r._createHelper(h),n.HmacSHA256=r._createHmacHelper(h)}(Math),function(){var t=CryptoJS,n=t.lib,i=n.Base,e=t.enc,r=e.Utf8,s=t.algo;s.HMAC=i.extend({init:function(t,n){t=this._hasher=new t.init,"string"==typeof n&&(n=r.parse(n));var i=t.blockSize,e=4*i;n.sigBytes>e&&(n=t.finalize(n)),n.clamp();for(var s=this._oKey=n.clone(),o=this._iKey=n.clone(),a=s.words,c=o.words,h=0;i>h;h++)a[h]^=1549556828,c[h]^=909522486;s.sigBytes=o.sigBytes=e,this.reset()},reset:function(){var t=this._hasher;t.reset(),t.update(this._iKey)},update:function(t){return this._hasher.update(t),this},finalize:function(t){var n=this._hasher,i=n.finalize(t);n.reset();var e=n.finalize(this._oKey.clone().concat(i));return e}})}();}
/* istanbul ignore next */

// Handles situation if the sdk is loaded synchronously
window.ironSourceAtomInit = window.ironSourceAtomInit || function() {};

// Run this function on sdk async loading
window.ironSourceAtomInit();

/**
 * Helper function for sending tracker bulks to Atom.
 * @param tasks - array of functions with a callback(err,data,status)
 * @param callback - the final callback that will be called when all tasks are done
 */

function taskMap(tasks, callback) {
  var results = [];
  var inFlight = tasks.length;

  function _handleTask(task, i) {
    task(function (err, data, status) {
      results[i] = {
        "err": err,
        "data": data,
        "status": status
      };
      // If all tasks are done we use the callback
      if (--inFlight === 0) {
        return callback(results)
      }
    });
  }

  for (var i = 0; i < tasks.length; i++) {
    _handleTask(tasks[i], i)
  }
}

var Base64 = {_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var c3=0;var c2=0;var r=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};
}(window, document));
