(function(window, document, undefined) {

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
  var API_VERSION = "V1"; // The atom API endpoint version (don't change it)
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
 * @apiVersion 1.1.1
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
 *    "err": "Permission denied",
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
 */

IronSourceAtom.prototype.putEvent = function (params, callback) {
  params = params || {};
  if (!params.stream) return callback('Stream is required', null, 400);
  if (!params.data) return callback('Data is required', null, 400);

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
 * @apiVersion 1.1.1
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
 *    "err": "Error message", 
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
    if (params.method.toUpperCase() == 'GET') {
      return callback('GET is not a valid method for putEvents', null, 400);
    }
  }

  params.apiVersion = this.options.apiVersion;
  params.auth = this.options.auth;

  var req = new Request(this.options.endpoint + 'bulk', params);

  return req.post(callback);
};

/**
 *
 * Sends a /GET health check to the Atom endpoint.
 *
 * @param {Function} callback - client callback function
 */

IronSourceAtom.prototype.health = function (callback) {
  var req = new Request(this.options.endpoint + 'health', "health");
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
  if (params !== "health") {
    // If we delivered some params and it's not a string we try to stringify it.
    if ((typeof params.data !== 'string' && !(params.data instanceof String))) {
      try {
        this.params.data = JSON.stringify(this.params.data);
      } catch (e) {
        console.error("data is invalid - can't be stringified", e);
        throw e
      }
    }
    this.headers = {
      contentType: "application/json;charset=UTF-8"
    };
  }
  this.xhr = (XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
}

/**
 *
 * Perform an HTTP POST to the Atom endpoint.
 *
 * @param {Function} callback - client callback function
 */

Request.prototype.post = function (callback) {

  if (!this.params.stream || !this.params.data) {
    return callback("Stream and Data fields are required", null, 400);
  }

  var xhr = this.xhr;
  var payload = JSON.stringify({
    data: this.params.data,
    table: this.params.stream,
    apiVersion: this.params.apiVersion,
    auth: !!this.params.auth ? CryptoJS.HmacSHA256(this.params.data, this.params.auth).toString(CryptoJS.enc.Hex) : ""
  });

  xhr.open("POST", this.endpoint, true);
  xhr.setRequestHeader("Content-type", this.headers.contentType);
  xhr.setRequestHeader("x-ironsource-atom-sdk-type", "atom-js");
  xhr.setRequestHeader("x-ironsource-atom-sdk-version", "2.0.0");

  xhr.onerror = function () {
    if (xhr.status == 0) {
      callback("No connection to server", null, 500);
    }
  };

  xhr.onreadystatechange = function (event) {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      var res;
      if (xhr.status == 200) {
        res = new Response(null, xhr.response, xhr.status);
        callback(null, res.data(), xhr.status);
      }
      else if (xhr.status >= 400 && xhr.status < 600) {
        res = new Response(xhr.response, null, xhr.status);
        callback(res.err(), null, xhr.status);
      }
    }
  };
  xhr.send(payload);
};

/**
 *
 * Perform an HTTP GET to the Atom endpoint.
 *
 * @param {Function} callback - client callback function
 */


Request.prototype.get = function (callback) {
  if (!this.params.stream || !this.params.data) {
    return callback("Stream and Data fields are required", null, null);
  }

  var xhr = this.xhr;
  var base64Data;
  var data = JSON.stringify({
    table: this.params.stream,
    data: this.params.data,
    apiVersion: this.params.apiVersion,
    auth: !!this.params.auth ? CryptoJS.HmacSHA256(this.params.data, this.params.auth).toString(CryptoJS.enc.Hex) : ""
  });

  try {
    base64Data = btoa(data);
  } catch (e) {
  }

  xhr.open("GET", this.endpoint + '?data=' + base64Data, true);
  xhr.setRequestHeader("Content-type", this.headers.contentType);
  xhr.setRequestHeader("x-ironsource-atom-sdk-type", "atom-js");
  xhr.setRequestHeader("x-ironsource-atom-sdk-version", "1.1.1");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      var res;

      if (xhr.status >= 200 && xhr.status < 400) {
        res = new Response(null, xhr.response, xhr.status);
        !!callback && callback(null, res.data(), xhr.status);
      }
      else {
        res = new Response(xhr.response, null, xhr.status);
        !!callback && callback(res.err(), null, xhr.status);
      }
    }
  };

  xhr.send();
};


Request.prototype.health = function (callback) {
  var xhr = this.xhr;

  xhr.open("GET", this.endpoint, true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      var res;

      if (xhr.status == 200) {
        res = new Response(null, xhr.response, xhr.status);
        !!callback && callback(null, res.data(), xhr.status);
      } else {
        res = new Response(xhr.response, null, xhr.status);
        !!callback && callback(res.err(), null, xhr.status);
      }
    }
  };

  xhr.send();
};


/**
 *
 * Object with response data
 *
 * @param {Boolean} error - (true) if response has errors
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
 *
 * @returns {Object} -return response  "error" with status or null if no errors
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
 *
 * @param {Object} params
 * @param {Number} params.flushInterval - data sending interval
 * @param {Number} params.bulkLen - number of records in each bulk request
 * @param {Number} params.bulkSize - the maximum bulk size in KB.
 * Optional for ISAtom main object:
 * @param {String} params.endpoint - Endpoint api url
 * @param {String} params.auth (optional) - key for hmac authentication
 *
 * @constructor
 */
function Tracker(params) {
  var self = this;
  params = params || {};
  this.params = params;
  this.params.flushInterval = !!params.flushInterval ? params.flushInterval * 1000 : 30000;
  this.params.bulkLen = !!params.bulkLen ? params.bulkLen : 20;
  this.params.bulkSize = !!params.bulkSize ? params.bulkSize * 1024 : 5 * 1024;
  this.params.auth = !!params.auth ? params.auth : ''; // Default auth for all streams
  this.retryTimeout = 1000;

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
 *
 * Start track events
 *
 * @api {post} endpoint/bulk track Accumulate and send events to server
 * @apiVersion 1.1.1
 * @apiGroup Atom
 * @apiParam {String} stream Stream name for saving data in db table
 * @apiParam {All} data Event data for saving
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
 *    "data": "Some data"
 * }
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

    // Solves a bug in the
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
// handle situation if user load sdk sync 
window.ironSourceAtomInit = window.ironSourceAtomInit || function() {};

// run user code after load sdk lib
window.ironSourceAtomInit();

/**
 * Helper function for sending tracker bulks to Atom.
 * @param tasks
 * @param callback
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
}(window, document));
