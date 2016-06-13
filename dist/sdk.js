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
  if (!params.stream) return callback('Stream is required', null);
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
  if (!params.stream) {
    return callback('Stream is required', null);
  }
  
  if (!params.data || !(params.data instanceof Array) || !params.data.length) {
    return callback('Data (must be not empty array) is required', null);
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
  this.params.data = JSON.stringify(this.params.data);
  this.headers = {
    contentType: "application/json;charset=UTF-8"
  };

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
    return callback("Stream and data required fields for send event", null);
  }
  
  var xhr = this.xhr;
  var data = JSON.stringify({
    data: this.params.data,
    table: this.params.stream,
    apiVersion: this.params.apiVersion,
    auth: !!this.params.auth ? CryptoJS.HmacSHA256(this.params.data, this.params.auth).toString(CryptoJS.enc.Hex) : ""
  });
  
  xhr.open("POST", this.endpoint, true);
  xhr.setRequestHeader("Content-type", this.headers.contentType);
  xhr.setRequestHeader("x-ironsource-atom-sdk-type", "js");
  xhr.setRequestHeader("x-ironsource-atom-sdk-version", "1.1.0");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      var res;
      if (xhr.status >= 200 && xhr.status < 400) {
        res = new Response(false, xhr.response, xhr.status);
        !!callback && callback(null, res.data());
      }
      else {
        res = new Response(true, xhr.response, xhr.status);
        !!callback && callback(res.err(), null);
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
  if (!this.params.stream || !this.params.data) {
    return callback("Stream and data required fields for send event", null);
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
  } catch (e) {}

  xhr.open("GET", this.endpoint + '?data=' + base64Data, true);
  xhr.setRequestHeader("Content-type", this.headers.contentType);
  xhr.setRequestHeader("x-ironsource-atom-sdk-type", "js");
  xhr.setRequestHeader("x-ironsource-atom-sdk-version", "1.1.0");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      var res;
      
      if (xhr.status >= 200 && xhr.status < 400) {
        res = new Response(false, xhr.response, xhr.status);
        !!callback && callback(null, res.data());
      }
      else {
        res = new Response(true, xhr.response, xhr.status);
        !!callback && callback(res.err(), null);
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
  return this.error ? null : JSON.parse(this.response)
};

/**
 *
 * Returns the de-serialized response error data.
 *
 * @returns {Object} -return response  "error" with status or null if no errors
 */

Response.prototype.err = function () {  
  return {
    message: this.response,
    status: this.status
  }
};

'use strict';

/**
 *
 * This class is the main entry point into this client API.
 *
 * @param {Object} params
 * @param {Number} params.flushInterval - timer for send data in seconds
 * @param {Number} params.bulkLen - number of records in each bulk request
 * @param {Number} params.bulkSize - the Maximum bulk size in Kb.
 *
 * Optional for ISAtom main object
 * @param {String} params.endpoint - Endpoint api url
 * @param {String} params.auth (optional) - auth key for authentication
 *
 * @constructor
 */
function Tracker(params) {
  params = params || {};
  this.params = params;
  this.params.flushInterval = !!params.flushInterval ? params.flushInterval * 1000 : 10000;
  this.params.bulkLen = !!params.bulkLen ? params.bulkLen : 10000;
  this.params.bulkSize = !!params.bulkSize ? params.bulkSize * 1024:  64 * 1024;

  this.accumulated = {};
  this.atom = new IronSourceAtom(params);
  this.timer = null;
}

window.Tracker = Tracker;

/**
 *
 * Start track events
 *
 * @api {post} endpoint/bulk track Accumulate and send events to server
 * @apiVersion 1.1.0
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

Tracker.prototype.track = function (stream, data, callback) {
  var self = this;
  this.callback = callback || function (err, data) {
      return err ? new Error(err) : null;
    };
  
  if (stream == undefined || data == undefined || !data.length) {
    return self.callback('Stream or data empty', null);
  }

  if (!self.accumulated[stream]) self.accumulated[stream] = [];

  self.accumulated[stream].push(data);

  if (self.accumulated[stream].length >= self.params.bulkLen || sizeof(self.accumulated[stream]) >= self.params.bulkSize) {
    self.flush(stream);
  }

  else if (!self.timer) {
    self.timer = setTimeout(function() {
      self.flush();
    }, self.params.flushInterval);
  }
};

Tracker.prototype.flush = function(batchStream, batchData, timeout) {
  var self = this;
  timeout = timeout || 1000;

  if (!!batchStream && !!batchData) {
    // for send or retry method
    send(batchStream, batchData, timeout);
  }

  else if (!!batchStream && !batchData) {
    // send with custom stream when >= len || size
    if (self.accumulated[batchStream].length >= 1) send(batchStream, self.accumulated[batchStream]);
  }

  else {
    //send all when no params
    for(var key in self.accumulated) {
      if (self.accumulated[key].length >= 1) self.flush(key, self.accumulated[key]);
      self.accumulated[key] = [];
    }
    self.timer = null;
  }
  /* istanbul ignore next */
  function send (stream, data, timeout) {
    return self.atom.putEvents({"stream": stream, "data": data}, function(err, body) {
      if (err != null) {
        if (err.status >= 500) {
          if (timeout < 10 * 60 * 1000) {
            setTimeout(function() {
              timeout = timeout * 2;
              self.flush(stream, data, timeout);
            }, timeout);
          } else {
            //some handler for err after 10min retry fail
            return self.callback('Server not response more then 10min.', null);
          }
        } else {
          return self.callback(err, null);
        }
      }
      else {
        self.callback(null, body);
      }
    })
  }
};
/* istanbul ignore next */
if(true){var CryptoJS=CryptoJS||function(t,r){var e={},i=e.lib={},n=i.Base=function(){function t(){}return{extend:function(r){t.prototype=this;var e=new t;return r&&e.mixIn(r),e.hasOwnProperty("init")||(e.init=function(){e.$super.init.apply(this,arguments)}),e.init.prototype=e,e.$super=this,e},create:function(){var t=this.extend();return t.init.apply(t,arguments),t},init:function(){},mixIn:function(t){for(var r in t)t.hasOwnProperty(r)&&(this[r]=t[r]);t.hasOwnProperty("toString")&&(this.toString=t.toString)},clone:function(){return this.init.prototype.extend(this)}}}(),o=i.WordArray=n.extend({init:function(t,e){t=this.words=t||[],e!=r?this.sigBytes=e:this.sigBytes=4*t.length},toString:function(t){return(t||a).stringify(this)},concat:function(t){var r=this.words,e=t.words,i=this.sigBytes,n=t.sigBytes;if(this.clamp(),i%4)for(var o=0;n>o;o++){var s=e[o>>>2]>>>24-o%4*8&255;r[i+o>>>2]|=s<<24-(i+o)%4*8}else for(var o=0;n>o;o+=4)r[i+o>>>2]=e[o>>>2];return this.sigBytes+=n,this},clamp:function(){var r=this.words,e=this.sigBytes;r[e>>>2]&=4294967295<<32-e%4*8,r.length=t.ceil(e/4)},clone:function(){var t=n.clone.call(this);return t.words=this.words.slice(0),t},random:function(r){for(var e,i=[],n=function(r){var r=r,e=987654321,i=4294967295;return function(){e=36969*(65535&e)+(e>>16)&i,r=18e3*(65535&r)+(r>>16)&i;var n=(e<<16)+r&i;return n/=4294967296,n+=.5,n*(t.random()>.5?1:-1)}},s=0;r>s;s+=4){var a=n(4294967296*(e||t.random()));e=987654071*a(),i.push(4294967296*a()|0)}return new o.init(i,r)}}),s=e.enc={},a=s.Hex={stringify:function(t){for(var r=t.words,e=t.sigBytes,i=[],n=0;e>n;n++){var o=r[n>>>2]>>>24-n%4*8&255;i.push((o>>>4).toString(16)),i.push((15&o).toString(16))}return i.join("")},parse:function(t){for(var r=t.length,e=[],i=0;r>i;i+=2)e[i>>>3]|=parseInt(t.substr(i,2),16)<<24-i%8*4;return new o.init(e,r/2)}},c=s.Latin1={stringify:function(t){for(var r=t.words,e=t.sigBytes,i=[],n=0;e>n;n++){var o=r[n>>>2]>>>24-n%4*8&255;i.push(String.fromCharCode(o))}return i.join("")},parse:function(t){for(var r=t.length,e=[],i=0;r>i;i++)e[i>>>2]|=(255&t.charCodeAt(i))<<24-i%4*8;return new o.init(e,r)}},h=s.Utf8={stringify:function(t){try{return decodeURIComponent(escape(c.stringify(t)))}catch(r){throw new Error("Malformed UTF-8 data")}},parse:function(t){return c.parse(unescape(encodeURIComponent(t)))}},l=i.BufferedBlockAlgorithm=n.extend({reset:function(){this._data=new o.init,this._nDataBytes=0},_append:function(t){"string"==typeof t&&(t=h.parse(t)),this._data.concat(t),this._nDataBytes+=t.sigBytes},_process:function(r){var e=this._data,i=e.words,n=e.sigBytes,s=this.blockSize,a=4*s,c=n/a;c=r?t.ceil(c):t.max((0|c)-this._minBufferSize,0);var h=c*s,l=t.min(4*h,n);if(h){for(var f=0;h>f;f+=s)this._doProcessBlock(i,f);var u=i.splice(0,h);e.sigBytes-=l}return new o.init(u,l)},clone:function(){var t=n.clone.call(this);return t._data=this._data.clone(),t},_minBufferSize:0}),f=(i.Hasher=l.extend({cfg:n.extend(),init:function(t){this.cfg=this.cfg.extend(t),this.reset()},reset:function(){l.reset.call(this),this._doReset()},update:function(t){return this._append(t),this._process(),this},finalize:function(t){t&&this._append(t);var r=this._doFinalize();return r},blockSize:16,_createHelper:function(t){return function(r,e){return new t.init(e).finalize(r)}},_createHmacHelper:function(t){return function(r,e){return new f.HMAC.init(t,e).finalize(r)}}}),e.algo={});return e}(Math);!function(){var t=CryptoJS,r=t.lib,e=r.WordArray,i=t.enc;i.Base64={stringify:function(t){var r=t.words,e=t.sigBytes,i=this._map;t.clamp();for(var n=[],o=0;e>o;o+=3)for(var s=r[o>>>2]>>>24-o%4*8&255,a=r[o+1>>>2]>>>24-(o+1)%4*8&255,c=r[o+2>>>2]>>>24-(o+2)%4*8&255,h=s<<16|a<<8|c,l=0;4>l&&e>o+.75*l;l++)n.push(i.charAt(h>>>6*(3-l)&63));var f=i.charAt(64);if(f)for(;n.length%4;)n.push(f);return n.join("")},parse:function(t){var r=t.length,i=this._map,n=i.charAt(64);if(n){var o=t.indexOf(n);-1!=o&&(r=o)}for(var s=[],a=0,c=0;r>c;c++)if(c%4){var h=i.indexOf(t.charAt(c-1))<<c%4*2,l=i.indexOf(t.charAt(c))>>>6-c%4*2,f=h|l;s[a>>>2]|=f<<24-a%4*8,a++}return e.create(s,a)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}}(),function(t){function r(t,r,e,i,n,o,s){var a=t+(r&e|~r&i)+n+s;return(a<<o|a>>>32-o)+r}function e(t,r,e,i,n,o,s){var a=t+(r&i|e&~i)+n+s;return(a<<o|a>>>32-o)+r}function i(t,r,e,i,n,o,s){var a=t+(r^e^i)+n+s;return(a<<o|a>>>32-o)+r}function n(t,r,e,i,n,o,s){var a=t+(e^(r|~i))+n+s;return(a<<o|a>>>32-o)+r}var o=CryptoJS,s=o.lib,a=s.WordArray,c=s.Hasher,h=o.algo,l=[];!function(){for(var r=0;64>r;r++)l[r]=4294967296*t.abs(t.sin(r+1))|0}();var f=h.MD5=c.extend({_doReset:function(){this._hash=new a.init([1732584193,4023233417,2562383102,271733878])},_doProcessBlock:function(t,o){for(var s=0;16>s;s++){var a=o+s,c=t[a];t[a]=16711935&(c<<8|c>>>24)|4278255360&(c<<24|c>>>8)}var h=this._hash.words,f=t[o+0],u=t[o+1],d=t[o+2],p=t[o+3],v=t[o+4],_=t[o+5],y=t[o+6],g=t[o+7],B=t[o+8],S=t[o+9],w=t[o+10],k=t[o+11],C=t[o+12],x=t[o+13],m=t[o+14],b=t[o+15],H=h[0],z=h[1],A=h[2],D=h[3];H=r(H,z,A,D,f,7,l[0]),D=r(D,H,z,A,u,12,l[1]),A=r(A,D,H,z,d,17,l[2]),z=r(z,A,D,H,p,22,l[3]),H=r(H,z,A,D,v,7,l[4]),D=r(D,H,z,A,_,12,l[5]),A=r(A,D,H,z,y,17,l[6]),z=r(z,A,D,H,g,22,l[7]),H=r(H,z,A,D,B,7,l[8]),D=r(D,H,z,A,S,12,l[9]),A=r(A,D,H,z,w,17,l[10]),z=r(z,A,D,H,k,22,l[11]),H=r(H,z,A,D,C,7,l[12]),D=r(D,H,z,A,x,12,l[13]),A=r(A,D,H,z,m,17,l[14]),z=r(z,A,D,H,b,22,l[15]),H=e(H,z,A,D,u,5,l[16]),D=e(D,H,z,A,y,9,l[17]),A=e(A,D,H,z,k,14,l[18]),z=e(z,A,D,H,f,20,l[19]),H=e(H,z,A,D,_,5,l[20]),D=e(D,H,z,A,w,9,l[21]),A=e(A,D,H,z,b,14,l[22]),z=e(z,A,D,H,v,20,l[23]),H=e(H,z,A,D,S,5,l[24]),D=e(D,H,z,A,m,9,l[25]),A=e(A,D,H,z,p,14,l[26]),z=e(z,A,D,H,B,20,l[27]),H=e(H,z,A,D,x,5,l[28]),D=e(D,H,z,A,d,9,l[29]),A=e(A,D,H,z,g,14,l[30]),z=e(z,A,D,H,C,20,l[31]),H=i(H,z,A,D,_,4,l[32]),D=i(D,H,z,A,B,11,l[33]),A=i(A,D,H,z,k,16,l[34]),z=i(z,A,D,H,m,23,l[35]),H=i(H,z,A,D,u,4,l[36]),D=i(D,H,z,A,v,11,l[37]),A=i(A,D,H,z,g,16,l[38]),z=i(z,A,D,H,w,23,l[39]),H=i(H,z,A,D,x,4,l[40]),D=i(D,H,z,A,f,11,l[41]),A=i(A,D,H,z,p,16,l[42]),z=i(z,A,D,H,y,23,l[43]),H=i(H,z,A,D,S,4,l[44]),D=i(D,H,z,A,C,11,l[45]),A=i(A,D,H,z,b,16,l[46]),z=i(z,A,D,H,d,23,l[47]),H=n(H,z,A,D,f,6,l[48]),D=n(D,H,z,A,g,10,l[49]),A=n(A,D,H,z,m,15,l[50]),z=n(z,A,D,H,_,21,l[51]),H=n(H,z,A,D,C,6,l[52]),D=n(D,H,z,A,p,10,l[53]),A=n(A,D,H,z,w,15,l[54]),z=n(z,A,D,H,u,21,l[55]),H=n(H,z,A,D,B,6,l[56]),D=n(D,H,z,A,b,10,l[57]),A=n(A,D,H,z,y,15,l[58]),z=n(z,A,D,H,x,21,l[59]),H=n(H,z,A,D,v,6,l[60]),D=n(D,H,z,A,k,10,l[61]),A=n(A,D,H,z,d,15,l[62]),z=n(z,A,D,H,S,21,l[63]),h[0]=h[0]+H|0,h[1]=h[1]+z|0,h[2]=h[2]+A|0,h[3]=h[3]+D|0},_doFinalize:function(){var r=this._data,e=r.words,i=8*this._nDataBytes,n=8*r.sigBytes;e[n>>>5]|=128<<24-n%32;var o=t.floor(i/4294967296),s=i;e[(n+64>>>9<<4)+15]=16711935&(o<<8|o>>>24)|4278255360&(o<<24|o>>>8),e[(n+64>>>9<<4)+14]=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),r.sigBytes=4*(e.length+1),this._process();for(var a=this._hash,c=a.words,h=0;4>h;h++){var l=c[h];c[h]=16711935&(l<<8|l>>>24)|4278255360&(l<<24|l>>>8)}return a},clone:function(){var t=c.clone.call(this);return t._hash=this._hash.clone(),t}});o.MD5=c._createHelper(f),o.HmacMD5=c._createHmacHelper(f)}(Math),function(){var t=CryptoJS,r=t.lib,e=r.WordArray,i=r.Hasher,n=t.algo,o=[],s=n.SHA1=i.extend({_doReset:function(){this._hash=new e.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(t,r){for(var e=this._hash.words,i=e[0],n=e[1],s=e[2],a=e[3],c=e[4],h=0;80>h;h++){if(16>h)o[h]=0|t[r+h];else{var l=o[h-3]^o[h-8]^o[h-14]^o[h-16];o[h]=l<<1|l>>>31}var f=(i<<5|i>>>27)+c+o[h];f+=20>h?(n&s|~n&a)+1518500249:40>h?(n^s^a)+1859775393:60>h?(n&s|n&a|s&a)-1894007588:(n^s^a)-899497514,c=a,a=s,s=n<<30|n>>>2,n=i,i=f}e[0]=e[0]+i|0,e[1]=e[1]+n|0,e[2]=e[2]+s|0,e[3]=e[3]+a|0,e[4]=e[4]+c|0},_doFinalize:function(){var t=this._data,r=t.words,e=8*this._nDataBytes,i=8*t.sigBytes;return r[i>>>5]|=128<<24-i%32,r[(i+64>>>9<<4)+14]=Math.floor(e/4294967296),r[(i+64>>>9<<4)+15]=e,t.sigBytes=4*r.length,this._process(),this._hash},clone:function(){var t=i.clone.call(this);return t._hash=this._hash.clone(),t}});t.SHA1=i._createHelper(s),t.HmacSHA1=i._createHmacHelper(s)}(),function(t){var r=CryptoJS,e=r.lib,i=e.WordArray,n=e.Hasher,o=r.algo,s=[],a=[];!function(){function r(r){for(var e=t.sqrt(r),i=2;e>=i;i++)if(!(r%i))return!1;return!0}function e(t){return 4294967296*(t-(0|t))|0}for(var i=2,n=0;64>n;)r(i)&&(8>n&&(s[n]=e(t.pow(i,.5))),a[n]=e(t.pow(i,1/3)),n++),i++}();var c=[],h=o.SHA256=n.extend({_doReset:function(){this._hash=new i.init(s.slice(0))},_doProcessBlock:function(t,r){for(var e=this._hash.words,i=e[0],n=e[1],o=e[2],s=e[3],h=e[4],l=e[5],f=e[6],u=e[7],d=0;64>d;d++){if(16>d)c[d]=0|t[r+d];else{var p=c[d-15],v=(p<<25|p>>>7)^(p<<14|p>>>18)^p>>>3,_=c[d-2],y=(_<<15|_>>>17)^(_<<13|_>>>19)^_>>>10;c[d]=v+c[d-7]+y+c[d-16]}var g=h&l^~h&f,B=i&n^i&o^n&o,S=(i<<30|i>>>2)^(i<<19|i>>>13)^(i<<10|i>>>22),w=(h<<26|h>>>6)^(h<<21|h>>>11)^(h<<7|h>>>25),k=u+w+g+a[d]+c[d],C=S+B;u=f,f=l,l=h,h=s+k|0,s=o,o=n,n=i,i=k+C|0}e[0]=e[0]+i|0,e[1]=e[1]+n|0,e[2]=e[2]+o|0,e[3]=e[3]+s|0,e[4]=e[4]+h|0,e[5]=e[5]+l|0,e[6]=e[6]+f|0,e[7]=e[7]+u|0},_doFinalize:function(){var r=this._data,e=r.words,i=8*this._nDataBytes,n=8*r.sigBytes;return e[n>>>5]|=128<<24-n%32,e[(n+64>>>9<<4)+14]=t.floor(i/4294967296),e[(n+64>>>9<<4)+15]=i,r.sigBytes=4*e.length,this._process(),this._hash},clone:function(){var t=n.clone.call(this);return t._hash=this._hash.clone(),t}});r.SHA256=n._createHelper(h),r.HmacSHA256=n._createHmacHelper(h)}(Math),function(){function t(t){return t<<8&4278255360|t>>>8&16711935}var r=CryptoJS,e=r.lib,i=e.WordArray,n=r.enc;n.Utf16=n.Utf16BE={stringify:function(t){for(var r=t.words,e=t.sigBytes,i=[],n=0;e>n;n+=2){var o=r[n>>>2]>>>16-n%4*8&65535;i.push(String.fromCharCode(o))}return i.join("")},parse:function(t){for(var r=t.length,e=[],n=0;r>n;n++)e[n>>>1]|=t.charCodeAt(n)<<16-n%2*16;return i.create(e,2*r)}};n.Utf16LE={stringify:function(r){for(var e=r.words,i=r.sigBytes,n=[],o=0;i>o;o+=2){var s=t(e[o>>>2]>>>16-o%4*8&65535);n.push(String.fromCharCode(s))}return n.join("")},parse:function(r){for(var e=r.length,n=[],o=0;e>o;o++)n[o>>>1]|=t(r.charCodeAt(o)<<16-o%2*16);return i.create(n,2*e)}}}(),function(){if("function"==typeof ArrayBuffer){var t=CryptoJS,r=t.lib,e=r.WordArray,i=e.init,n=e.init=function(t){if(t instanceof ArrayBuffer&&(t=new Uint8Array(t)),(t instanceof Int8Array||"undefined"!=typeof Uint8ClampedArray&&t instanceof Uint8ClampedArray||t instanceof Int16Array||t instanceof Uint16Array||t instanceof Int32Array||t instanceof Uint32Array||t instanceof Float32Array||t instanceof Float64Array)&&(t=new Uint8Array(t.buffer,t.byteOffset,t.byteLength)),t instanceof Uint8Array){for(var r=t.byteLength,e=[],n=0;r>n;n++)e[n>>>2]|=t[n]<<24-n%4*8;i.call(this,e,r)}else i.apply(this,arguments)};n.prototype=e}}(),function(t){function r(t,r,e){return t^r^e}function e(t,r,e){return t&r|~t&e}function i(t,r,e){return(t|~r)^e}function n(t,r,e){return t&e|r&~e}function o(t,r,e){return t^(r|~e)}function s(t,r){return t<<r|t>>>32-r}var a=CryptoJS,c=a.lib,h=c.WordArray,l=c.Hasher,f=a.algo,u=h.create([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13]),d=h.create([5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11]),p=h.create([11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6]),v=h.create([8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]),_=h.create([0,1518500249,1859775393,2400959708,2840853838]),y=h.create([1352829926,1548603684,1836072691,2053994217,0]),g=f.RIPEMD160=l.extend({_doReset:function(){this._hash=h.create([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(t,a){for(var c=0;16>c;c++){var h=a+c,l=t[h];t[h]=16711935&(l<<8|l>>>24)|4278255360&(l<<24|l>>>8)}var f,g,B,S,w,k,C,x,m,b,H=this._hash.words,z=_.words,A=y.words,D=u.words,J=d.words,E=p.words,R=v.words;k=f=H[0],C=g=H[1],x=B=H[2],m=S=H[3],b=w=H[4];for(var M,c=0;80>c;c+=1)M=f+t[a+D[c]]|0,M+=16>c?r(g,B,S)+z[0]:32>c?e(g,B,S)+z[1]:48>c?i(g,B,S)+z[2]:64>c?n(g,B,S)+z[3]:o(g,B,S)+z[4],M=0|M,M=s(M,E[c]),M=M+w|0,f=w,w=S,S=s(B,10),B=g,g=M,M=k+t[a+J[c]]|0,M+=16>c?o(C,x,m)+A[0]:32>c?n(C,x,m)+A[1]:48>c?i(C,x,m)+A[2]:64>c?e(C,x,m)+A[3]:r(C,x,m)+A[4],M=0|M,M=s(M,R[c]),M=M+b|0,k=b,b=m,m=s(x,10),x=C,C=M;M=H[1]+B+m|0,H[1]=H[2]+S+b|0,H[2]=H[3]+w+k|0,H[3]=H[4]+f+C|0,H[4]=H[0]+g+x|0,H[0]=M},_doFinalize:function(){var t=this._data,r=t.words,e=8*this._nDataBytes,i=8*t.sigBytes;r[i>>>5]|=128<<24-i%32,r[(i+64>>>9<<4)+14]=16711935&(e<<8|e>>>24)|4278255360&(e<<24|e>>>8),t.sigBytes=4*(r.length+1),this._process();for(var n=this._hash,o=n.words,s=0;5>s;s++){var a=o[s];o[s]=16711935&(a<<8|a>>>24)|4278255360&(a<<24|a>>>8)}return n},clone:function(){var t=l.clone.call(this);return t._hash=this._hash.clone(),t}});a.RIPEMD160=l._createHelper(g),a.HmacRIPEMD160=l._createHmacHelper(g)}(Math),function(){var t=CryptoJS,r=t.lib,e=r.Base,i=t.enc,n=i.Utf8,o=t.algo;o.HMAC=e.extend({init:function(t,r){t=this._hasher=new t.init,"string"==typeof r&&(r=n.parse(r));var e=t.blockSize,i=4*e;r.sigBytes>i&&(r=t.finalize(r)),r.clamp();for(var o=this._oKey=r.clone(),s=this._iKey=r.clone(),a=o.words,c=s.words,h=0;e>h;h++)a[h]^=1549556828,c[h]^=909522486;o.sigBytes=s.sigBytes=i,this.reset()},reset:function(){var t=this._hasher;t.reset(),t.update(this._iKey)},update:function(t){return this._hasher.update(t),this},finalize:function(t){var r=this._hasher,e=r.finalize(t);r.reset();var i=r.finalize(this._oKey.clone().concat(e));return i}})}(),function(){var t=CryptoJS,r=t.lib,e=r.Base,i=r.WordArray,n=t.algo,o=n.SHA1,s=n.HMAC,a=n.PBKDF2=e.extend({cfg:e.extend({keySize:4,hasher:o,iterations:1}),init:function(t){this.cfg=this.cfg.extend(t)},compute:function(t,r){for(var e=this.cfg,n=s.create(e.hasher,t),o=i.create(),a=i.create([1]),c=o.words,h=a.words,l=e.keySize,f=e.iterations;c.length<l;){var u=n.update(r).finalize(a);n.reset();for(var d=u.words,p=d.length,v=u,_=1;f>_;_++){v=n.finalize(v),n.reset();for(var y=v.words,g=0;p>g;g++)d[g]^=y[g]}o.concat(u),h[0]++}return o.sigBytes=4*l,o}});t.PBKDF2=function(t,r,e){return a.create(e).compute(t,r)}}(),function(){var t=CryptoJS,r=t.lib,e=r.Base,i=r.WordArray,n=t.algo,o=n.MD5,s=n.EvpKDF=e.extend({cfg:e.extend({keySize:4,hasher:o,iterations:1}),init:function(t){this.cfg=this.cfg.extend(t)},compute:function(t,r){for(var e=this.cfg,n=e.hasher.create(),o=i.create(),s=o.words,a=e.keySize,c=e.iterations;s.length<a;){h&&n.update(h);var h=n.update(t).finalize(r);n.reset();for(var l=1;c>l;l++)h=n.finalize(h),n.reset();o.concat(h)}return o.sigBytes=4*a,o}});t.EvpKDF=function(t,r,e){return s.create(e).compute(t,r)}}(),function(){var t=CryptoJS,r=t.lib,e=r.WordArray,i=t.algo,n=i.SHA256,o=i.SHA224=n.extend({_doReset:function(){this._hash=new e.init([3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428])},_doFinalize:function(){var t=n._doFinalize.call(this);return t.sigBytes-=4,t}});t.SHA224=n._createHelper(o),t.HmacSHA224=n._createHmacHelper(o)}(),function(t){var r=CryptoJS,e=r.lib,i=e.Base,n=e.WordArray,o=r.x64={};o.Word=i.extend({init:function(t,r){this.high=t,this.low=r}}),o.WordArray=i.extend({init:function(r,e){r=this.words=r||[],e!=t?this.sigBytes=e:this.sigBytes=8*r.length},toX32:function(){for(var t=this.words,r=t.length,e=[],i=0;r>i;i++){var o=t[i];e.push(o.high),e.push(o.low)}return n.create(e,this.sigBytes)},clone:function(){for(var t=i.clone.call(this),r=t.words=this.words.slice(0),e=r.length,n=0;e>n;n++)r[n]=r[n].clone();return t}})}(),function(t){var r=CryptoJS,e=r.lib,i=e.WordArray,n=e.Hasher,o=r.x64,s=o.Word,a=r.algo,c=[],h=[],l=[];!function(){for(var t=1,r=0,e=0;24>e;e++){c[t+5*r]=(e+1)*(e+2)/2%64;var i=r%5,n=(2*t+3*r)%5;t=i,r=n}for(var t=0;5>t;t++)for(var r=0;5>r;r++)h[t+5*r]=r+(2*t+3*r)%5*5;for(var o=1,a=0;24>a;a++){for(var f=0,u=0,d=0;7>d;d++){if(1&o){var p=(1<<d)-1;32>p?u^=1<<p:f^=1<<p-32}128&o?o=o<<1^113:o<<=1}l[a]=s.create(f,u)}}();var f=[];!function(){for(var t=0;25>t;t++)f[t]=s.create()}();var u=a.SHA3=n.extend({cfg:n.cfg.extend({outputLength:512}),_doReset:function(){for(var t=this._state=[],r=0;25>r;r++)t[r]=new s.init;this.blockSize=(1600-2*this.cfg.outputLength)/32},_doProcessBlock:function(t,r){for(var e=this._state,i=this.blockSize/2,n=0;i>n;n++){var o=t[r+2*n],s=t[r+2*n+1];o=16711935&(o<<8|o>>>24)|4278255360&(o<<24|o>>>8),s=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8);var a=e[n];a.high^=s,a.low^=o}for(var u=0;24>u;u++){for(var d=0;5>d;d++){for(var p=0,v=0,_=0;5>_;_++){var a=e[d+5*_];p^=a.high,v^=a.low}var y=f[d];y.high=p,y.low=v}for(var d=0;5>d;d++)for(var g=f[(d+4)%5],B=f[(d+1)%5],S=B.high,w=B.low,p=g.high^(S<<1|w>>>31),v=g.low^(w<<1|S>>>31),_=0;5>_;_++){var a=e[d+5*_];a.high^=p,a.low^=v}for(var k=1;25>k;k++){var a=e[k],C=a.high,x=a.low,m=c[k];if(32>m)var p=C<<m|x>>>32-m,v=x<<m|C>>>32-m;else var p=x<<m-32|C>>>64-m,v=C<<m-32|x>>>64-m;var b=f[h[k]];b.high=p,b.low=v}var H=f[0],z=e[0];H.high=z.high,H.low=z.low;for(var d=0;5>d;d++)for(var _=0;5>_;_++){var k=d+5*_,a=e[k],A=f[k],D=f[(d+1)%5+5*_],J=f[(d+2)%5+5*_];a.high=A.high^~D.high&J.high,a.low=A.low^~D.low&J.low}var a=e[0],E=l[u];a.high^=E.high,a.low^=E.low}},_doFinalize:function(){var r=this._data,e=r.words,n=(8*this._nDataBytes,8*r.sigBytes),o=32*this.blockSize;e[n>>>5]|=1<<24-n%32,e[(t.ceil((n+1)/o)*o>>>5)-1]|=128,r.sigBytes=4*e.length,this._process();for(var s=this._state,a=this.cfg.outputLength/8,c=a/8,h=[],l=0;c>l;l++){var f=s[l],u=f.high,d=f.low;u=16711935&(u<<8|u>>>24)|4278255360&(u<<24|u>>>8),d=16711935&(d<<8|d>>>24)|4278255360&(d<<24|d>>>8),h.push(d),h.push(u)}return new i.init(h,a)},clone:function(){for(var t=n.clone.call(this),r=t._state=this._state.slice(0),e=0;25>e;e++)r[e]=r[e].clone();return t}});r.SHA3=n._createHelper(u),r.HmacSHA3=n._createHmacHelper(u)}(Math),function(){function t(){return o.create.apply(o,arguments)}var r=CryptoJS,e=r.lib,i=e.Hasher,n=r.x64,o=n.Word,s=n.WordArray,a=r.algo,c=[t(1116352408,3609767458),t(1899447441,602891725),t(3049323471,3964484399),t(3921009573,2173295548),t(961987163,4081628472),t(1508970993,3053834265),t(2453635748,2937671579),t(2870763221,3664609560),t(3624381080,2734883394),t(310598401,1164996542),t(607225278,1323610764),t(1426881987,3590304994),t(1925078388,4068182383),t(2162078206,991336113),t(2614888103,633803317),t(3248222580,3479774868),t(3835390401,2666613458),t(4022224774,944711139),t(264347078,2341262773),t(604807628,2007800933),t(770255983,1495990901),t(1249150122,1856431235),t(1555081692,3175218132),t(1996064986,2198950837),t(2554220882,3999719339),t(2821834349,766784016),t(2952996808,2566594879),t(3210313671,3203337956),t(3336571891,1034457026),t(3584528711,2466948901),t(113926993,3758326383),t(338241895,168717936),t(666307205,1188179964),t(773529912,1546045734),t(1294757372,1522805485),t(1396182291,2643833823),t(1695183700,2343527390),t(1986661051,1014477480),t(2177026350,1206759142),t(2456956037,344077627),t(2730485921,1290863460),t(2820302411,3158454273),t(3259730800,3505952657),t(3345764771,106217008),t(3516065817,3606008344),t(3600352804,1432725776),t(4094571909,1467031594),t(275423344,851169720),t(430227734,3100823752),t(506948616,1363258195),t(659060556,3750685593),t(883997877,3785050280),t(958139571,3318307427),t(1322822218,3812723403),t(1537002063,2003034995),t(1747873779,3602036899),t(1955562222,1575990012),t(2024104815,1125592928),t(2227730452,2716904306),t(2361852424,442776044),t(2428436474,593698344),t(2756734187,3733110249),t(3204031479,2999351573),t(3329325298,3815920427),t(3391569614,3928383900),t(3515267271,566280711),t(3940187606,3454069534),t(4118630271,4000239992),t(116418474,1914138554),t(174292421,2731055270),t(289380356,3203993006),t(460393269,320620315),t(685471733,587496836),t(852142971,1086792851),t(1017036298,365543100),t(1126000580,2618297676),t(1288033470,3409855158),t(1501505948,4234509866),t(1607167915,987167468),t(1816402316,1246189591)],h=[];!function(){for(var r=0;80>r;r++)h[r]=t()}();var l=a.SHA512=i.extend({_doReset:function(){this._hash=new s.init([new o.init(1779033703,4089235720),new o.init(3144134277,2227873595),new o.init(1013904242,4271175723),new o.init(2773480762,1595750129),new o.init(1359893119,2917565137),new o.init(2600822924,725511199),new o.init(528734635,4215389547),new o.init(1541459225,327033209)])},_doProcessBlock:function(t,r){for(var e=this._hash.words,i=e[0],n=e[1],o=e[2],s=e[3],a=e[4],l=e[5],f=e[6],u=e[7],d=i.high,p=i.low,v=n.high,_=n.low,y=o.high,g=o.low,B=s.high,S=s.low,w=a.high,k=a.low,C=l.high,x=l.low,m=f.high,b=f.low,H=u.high,z=u.low,A=d,D=p,J=v,E=_,R=y,M=g,F=B,P=S,W=w,O=k,U=C,I=x,K=m,X=b,L=H,j=z,N=0;80>N;N++){var T=h[N];if(16>N)var Z=T.high=0|t[r+2*N],q=T.low=0|t[r+2*N+1];else{var G=h[N-15],$=G.high,Q=G.low,V=($>>>1|Q<<31)^($>>>8|Q<<24)^$>>>7,Y=(Q>>>1|$<<31)^(Q>>>8|$<<24)^(Q>>>7|$<<25),tt=h[N-2],rt=tt.high,et=tt.low,it=(rt>>>19|et<<13)^(rt<<3|et>>>29)^rt>>>6,nt=(et>>>19|rt<<13)^(et<<3|rt>>>29)^(et>>>6|rt<<26),ot=h[N-7],st=ot.high,at=ot.low,ct=h[N-16],ht=ct.high,lt=ct.low,q=Y+at,Z=V+st+(Y>>>0>q>>>0?1:0),q=q+nt,Z=Z+it+(nt>>>0>q>>>0?1:0),q=q+lt,Z=Z+ht+(lt>>>0>q>>>0?1:0);T.high=Z,T.low=q}var ft=W&U^~W&K,ut=O&I^~O&X,dt=A&J^A&R^J&R,pt=D&E^D&M^E&M,vt=(A>>>28|D<<4)^(A<<30|D>>>2)^(A<<25|D>>>7),_t=(D>>>28|A<<4)^(D<<30|A>>>2)^(D<<25|A>>>7),yt=(W>>>14|O<<18)^(W>>>18|O<<14)^(W<<23|O>>>9),gt=(O>>>14|W<<18)^(O>>>18|W<<14)^(O<<23|W>>>9),Bt=c[N],St=Bt.high,wt=Bt.low,kt=j+gt,Ct=L+yt+(j>>>0>kt>>>0?1:0),kt=kt+ut,Ct=Ct+ft+(ut>>>0>kt>>>0?1:0),kt=kt+wt,Ct=Ct+St+(wt>>>0>kt>>>0?1:0),kt=kt+q,Ct=Ct+Z+(q>>>0>kt>>>0?1:0),xt=_t+pt,mt=vt+dt+(_t>>>0>xt>>>0?1:0);L=K,j=X,K=U,X=I,U=W,I=O,O=P+kt|0,W=F+Ct+(P>>>0>O>>>0?1:0)|0,F=R,P=M,R=J,M=E,J=A,E=D,D=kt+xt|0,A=Ct+mt+(kt>>>0>D>>>0?1:0)|0}p=i.low=p+D,i.high=d+A+(D>>>0>p>>>0?1:0),_=n.low=_+E,n.high=v+J+(E>>>0>_>>>0?1:0),g=o.low=g+M,o.high=y+R+(M>>>0>g>>>0?1:0),S=s.low=S+P,s.high=B+F+(P>>>0>S>>>0?1:0),k=a.low=k+O,a.high=w+W+(O>>>0>k>>>0?1:0),x=l.low=x+I,l.high=C+U+(I>>>0>x>>>0?1:0),b=f.low=b+X,f.high=m+K+(X>>>0>b>>>0?1:0),z=u.low=z+j,u.high=H+L+(j>>>0>z>>>0?1:0)},_doFinalize:function(){var t=this._data,r=t.words,e=8*this._nDataBytes,i=8*t.sigBytes;r[i>>>5]|=128<<24-i%32,r[(i+128>>>10<<5)+30]=Math.floor(e/4294967296),r[(i+128>>>10<<5)+31]=e,t.sigBytes=4*r.length,this._process();var n=this._hash.toX32();return n},clone:function(){var t=i.clone.call(this);return t._hash=this._hash.clone(),t},blockSize:32});r.SHA512=i._createHelper(l),r.HmacSHA512=i._createHmacHelper(l)}(),function(){var t=CryptoJS,r=t.x64,e=r.Word,i=r.WordArray,n=t.algo,o=n.SHA512,s=n.SHA384=o.extend({_doReset:function(){this._hash=new i.init([new e.init(3418070365,3238371032),new e.init(1654270250,914150663),new e.init(2438529370,812702999),new e.init(355462360,4144912697),new e.init(1731405415,4290775857),new e.init(2394180231,1750603025),new e.init(3675008525,1694076839),new e.init(1203062813,3204075428)])},_doFinalize:function(){var t=o._doFinalize.call(this);return t.sigBytes-=16,t}});t.SHA384=o._createHelper(s),t.HmacSHA384=o._createHmacHelper(s)}(),CryptoJS.lib.Cipher||function(t){var r=CryptoJS,e=r.lib,i=e.Base,n=e.WordArray,o=e.BufferedBlockAlgorithm,s=r.enc,a=(s.Utf8,s.Base64),c=r.algo,h=c.EvpKDF,l=e.Cipher=o.extend({cfg:i.extend(),createEncryptor:function(t,r){return this.create(this._ENC_XFORM_MODE,t,r)},createDecryptor:function(t,r){return this.create(this._DEC_XFORM_MODE,t,r)},init:function(t,r,e){this.cfg=this.cfg.extend(e),this._xformMode=t,this._key=r,this.reset()},reset:function(){o.reset.call(this),this._doReset()},process:function(t){return this._append(t),this._process()},finalize:function(t){t&&this._append(t);var r=this._doFinalize();return r},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(){function t(t){return"string"==typeof t?k:B}return function(r){return{encrypt:function(e,i,n){return t(i).encrypt(r,e,i,n)},decrypt:function(e,i,n){return t(i).decrypt(r,e,i,n)}}}}()}),f=(e.StreamCipher=l.extend({_doFinalize:function(){var t=this._process(!0);return t},blockSize:1}),r.mode={}),u=e.BlockCipherMode=i.extend({createEncryptor:function(t,r){return this.Encryptor.create(t,r)},createDecryptor:function(t,r){return this.Decryptor.create(t,r)},init:function(t,r){this._cipher=t,this._iv=r}}),d=f.CBC=function(){function r(r,e,i){var n=this._iv;if(n){var o=n;this._iv=t}else var o=this._prevBlock;for(var s=0;i>s;s++)r[e+s]^=o[s]}var e=u.extend();return e.Encryptor=e.extend({processBlock:function(t,e){var i=this._cipher,n=i.blockSize;r.call(this,t,e,n),i.encryptBlock(t,e),this._prevBlock=t.slice(e,e+n)}}),e.Decryptor=e.extend({processBlock:function(t,e){var i=this._cipher,n=i.blockSize,o=t.slice(e,e+n);i.decryptBlock(t,e),r.call(this,t,e,n),this._prevBlock=o}}),e}(),p=r.pad={},v=p.Pkcs7={pad:function(t,r){for(var e=4*r,i=e-t.sigBytes%e,o=i<<24|i<<16|i<<8|i,s=[],a=0;i>a;a+=4)s.push(o);var c=n.create(s,i);t.concat(c)},unpad:function(t){var r=255&t.words[t.sigBytes-1>>>2];t.sigBytes-=r}},_=(e.BlockCipher=l.extend({cfg:l.cfg.extend({mode:d,padding:v}),reset:function(){l.reset.call(this);var t=this.cfg,r=t.iv,e=t.mode;if(this._xformMode==this._ENC_XFORM_MODE)var i=e.createEncryptor;else{var i=e.createDecryptor;this._minBufferSize=1}this._mode=i.call(e,this,r&&r.words)},_doProcessBlock:function(t,r){this._mode.processBlock(t,r)},_doFinalize:function(){var t=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){t.pad(this._data,this.blockSize);var r=this._process(!0)}else{var r=this._process(!0);t.unpad(r)}return r},blockSize:4}),e.CipherParams=i.extend({init:function(t){this.mixIn(t)},toString:function(t){return(t||this.formatter).stringify(this)}})),y=r.format={},g=y.OpenSSL={stringify:function(t){var r=t.ciphertext,e=t.salt;if(e)var i=n.create([1398893684,1701076831]).concat(e).concat(r);else var i=r;return i.toString(a)},parse:function(t){var r=a.parse(t),e=r.words;if(1398893684==e[0]&&1701076831==e[1]){var i=n.create(e.slice(2,4));e.splice(0,4),r.sigBytes-=16}return _.create({ciphertext:r,salt:i})}},B=e.SerializableCipher=i.extend({cfg:i.extend({format:g}),encrypt:function(t,r,e,i){i=this.cfg.extend(i);var n=t.createEncryptor(e,i),o=n.finalize(r),s=n.cfg;return _.create({ciphertext:o,key:e,iv:s.iv,algorithm:t,mode:s.mode,padding:s.padding,blockSize:t.blockSize,formatter:i.format})},decrypt:function(t,r,e,i){i=this.cfg.extend(i),r=this._parse(r,i.format);var n=t.createDecryptor(e,i).finalize(r.ciphertext);return n},_parse:function(t,r){return"string"==typeof t?r.parse(t,this):t}}),S=r.kdf={},w=S.OpenSSL={execute:function(t,r,e,i){i||(i=n.random(8));var o=h.create({keySize:r+e}).compute(t,i),s=n.create(o.words.slice(r),4*e);return o.sigBytes=4*r,_.create({key:o,iv:s,salt:i})}},k=e.PasswordBasedCipher=B.extend({cfg:B.cfg.extend({kdf:w}),encrypt:function(t,r,e,i){i=this.cfg.extend(i);var n=i.kdf.execute(e,t.keySize,t.ivSize);i.iv=n.iv;var o=B.encrypt.call(this,t,r,n.key,i);return o.mixIn(n),o},decrypt:function(t,r,e,i){i=this.cfg.extend(i),r=this._parse(r,i.format);var n=i.kdf.execute(e,t.keySize,t.ivSize,r.salt);i.iv=n.iv;var o=B.decrypt.call(this,t,r,n.key,i);return o}})}(),CryptoJS.mode.CFB=function(){function t(t,r,e,i){var n=this._iv;if(n){var o=n.slice(0);this._iv=void 0}else var o=this._prevBlock;i.encryptBlock(o,0);for(var s=0;e>s;s++)t[r+s]^=o[s]}var r=CryptoJS.lib.BlockCipherMode.extend();return r.Encryptor=r.extend({processBlock:function(r,e){var i=this._cipher,n=i.blockSize;t.call(this,r,e,n,i),this._prevBlock=r.slice(e,e+n)}}),r.Decryptor=r.extend({processBlock:function(r,e){var i=this._cipher,n=i.blockSize,o=r.slice(e,e+n);t.call(this,r,e,n,i),this._prevBlock=o}}),r}(),CryptoJS.mode.ECB=function(){var t=CryptoJS.lib.BlockCipherMode.extend();return t.Encryptor=t.extend({processBlock:function(t,r){this._cipher.encryptBlock(t,r)}}),t.Decryptor=t.extend({processBlock:function(t,r){this._cipher.decryptBlock(t,r)}}),t}(),CryptoJS.pad.AnsiX923={pad:function(t,r){var e=t.sigBytes,i=4*r,n=i-e%i,o=e+n-1;t.clamp(),t.words[o>>>2]|=n<<24-o%4*8,t.sigBytes+=n},unpad:function(t){var r=255&t.words[t.sigBytes-1>>>2];t.sigBytes-=r}},CryptoJS.pad.Iso10126={pad:function(t,r){var e=4*r,i=e-t.sigBytes%e;t.concat(CryptoJS.lib.WordArray.random(i-1)).concat(CryptoJS.lib.WordArray.create([i<<24],1))},unpad:function(t){var r=255&t.words[t.sigBytes-1>>>2];t.sigBytes-=r}},CryptoJS.pad.Iso97971={pad:function(t,r){t.concat(CryptoJS.lib.WordArray.create([2147483648],1)),CryptoJS.pad.ZeroPadding.pad(t,r)},unpad:function(t){CryptoJS.pad.ZeroPadding.unpad(t),t.sigBytes--}},CryptoJS.mode.OFB=function(){var t=CryptoJS.lib.BlockCipherMode.extend(),r=t.Encryptor=t.extend({processBlock:function(t,r){var e=this._cipher,i=e.blockSize,n=this._iv,o=this._keystream;n&&(o=this._keystream=n.slice(0),this._iv=void 0),e.encryptBlock(o,0);for(var s=0;i>s;s++)t[r+s]^=o[s]}});return t.Decryptor=r,t}(),CryptoJS.pad.NoPadding={pad:function(){},unpad:function(){}},function(t){var r=CryptoJS,e=r.lib,i=e.CipherParams,n=r.enc,o=n.Hex,s=r.format;s.Hex={stringify:function(t){return t.ciphertext.toString(o)},parse:function(t){var r=o.parse(t);return i.create({ciphertext:r})}}}(),function(){var t=CryptoJS,r=t.lib,e=r.BlockCipher,i=t.algo,n=[],o=[],s=[],a=[],c=[],h=[],l=[],f=[],u=[],d=[];!function(){for(var t=[],r=0;256>r;r++)128>r?t[r]=r<<1:t[r]=r<<1^283;for(var e=0,i=0,r=0;256>r;r++){var p=i^i<<1^i<<2^i<<3^i<<4;p=p>>>8^255&p^99,n[e]=p,o[p]=e;var v=t[e],_=t[v],y=t[_],g=257*t[p]^16843008*p;s[e]=g<<24|g>>>8,a[e]=g<<16|g>>>16,c[e]=g<<8|g>>>24,h[e]=g;var g=16843009*y^65537*_^257*v^16843008*e;l[p]=g<<24|g>>>8,f[p]=g<<16|g>>>16,u[p]=g<<8|g>>>24,d[p]=g,e?(e=v^t[t[t[y^v]]],i^=t[t[i]]):e=i=1}}();var p=[0,1,2,4,8,16,32,64,128,27,54],v=i.AES=e.extend({_doReset:function(){for(var t=this._key,r=t.words,e=t.sigBytes/4,i=this._nRounds=e+6,o=4*(i+1),s=this._keySchedule=[],a=0;o>a;a++)if(e>a)s[a]=r[a];else{var c=s[a-1];a%e?e>6&&a%e==4&&(c=n[c>>>24]<<24|n[c>>>16&255]<<16|n[c>>>8&255]<<8|n[255&c]):(c=c<<8|c>>>24,c=n[c>>>24]<<24|n[c>>>16&255]<<16|n[c>>>8&255]<<8|n[255&c],c^=p[a/e|0]<<24),s[a]=s[a-e]^c}for(var h=this._invKeySchedule=[],v=0;o>v;v++){var a=o-v;if(v%4)var c=s[a];else var c=s[a-4];4>v||4>=a?h[v]=c:h[v]=l[n[c>>>24]]^f[n[c>>>16&255]]^u[n[c>>>8&255]]^d[n[255&c]]}},encryptBlock:function(t,r){this._doCryptBlock(t,r,this._keySchedule,s,a,c,h,n)},decryptBlock:function(t,r){var e=t[r+1];t[r+1]=t[r+3],t[r+3]=e,this._doCryptBlock(t,r,this._invKeySchedule,l,f,u,d,o);var e=t[r+1];t[r+1]=t[r+3],t[r+3]=e},_doCryptBlock:function(t,r,e,i,n,o,s,a){for(var c=this._nRounds,h=t[r]^e[0],l=t[r+1]^e[1],f=t[r+2]^e[2],u=t[r+3]^e[3],d=4,p=1;c>p;p++){var v=i[h>>>24]^n[l>>>16&255]^o[f>>>8&255]^s[255&u]^e[d++],_=i[l>>>24]^n[f>>>16&255]^o[u>>>8&255]^s[255&h]^e[d++],y=i[f>>>24]^n[u>>>16&255]^o[h>>>8&255]^s[255&l]^e[d++],g=i[u>>>24]^n[h>>>16&255]^o[l>>>8&255]^s[255&f]^e[d++];h=v,l=_,f=y,u=g}var v=(a[h>>>24]<<24|a[l>>>16&255]<<16|a[f>>>8&255]<<8|a[255&u])^e[d++],_=(a[l>>>24]<<24|a[f>>>16&255]<<16|a[u>>>8&255]<<8|a[255&h])^e[d++],y=(a[f>>>24]<<24|a[u>>>16&255]<<16|a[h>>>8&255]<<8|a[255&l])^e[d++],g=(a[u>>>24]<<24|a[h>>>16&255]<<16|a[l>>>8&255]<<8|a[255&f])^e[d++];t[r]=v,t[r+1]=_,t[r+2]=y,t[r+3]=g},keySize:8});t.AES=e._createHelper(v)}(),function(){function t(t,r){var e=(this._lBlock>>>t^this._rBlock)&r;this._rBlock^=e,this._lBlock^=e<<t}function r(t,r){var e=(this._rBlock>>>t^this._lBlock)&r;this._lBlock^=e,this._rBlock^=e<<t}var e=CryptoJS,i=e.lib,n=i.WordArray,o=i.BlockCipher,s=e.algo,a=[57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4],c=[14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32],h=[1,2,4,6,8,10,12,14,15,17,19,21,23,25,27,28],l=[{
	0:8421888,268435456:32768,536870912:8421378,805306368:2,1073741824:512,1342177280:8421890,1610612736:8389122,1879048192:8388608,2147483648:514,2415919104:8389120,2684354560:33280,2952790016:8421376,3221225472:32770,3489660928:8388610,3758096384:0,4026531840:33282,134217728:0,402653184:8421890,671088640:33282,939524096:32768,1207959552:8421888,1476395008:512,1744830464:8421378,2013265920:2,2281701376:8389120,2550136832:33280,2818572288:8421376,3087007744:8389122,3355443200:8388610,3623878656:32770,3892314112:514,4160749568:8388608,1:32768,268435457:2,536870913:8421888,805306369:8388608,1073741825:8421378,1342177281:33280,1610612737:512,1879048193:8389122,2147483649:8421890,2415919105:8421376,2684354561:8388610,2952790017:33282,3221225473:514,3489660929:8389120,3758096385:32770,4026531841:0,134217729:8421890,402653185:8421376,671088641:8388608,939524097:512,1207959553:32768,1476395009:8388610,1744830465:2,2013265921:33282,2281701377:32770,2550136833:8389122,2818572289:514,3087007745:8421888,3355443201:8389120,3623878657:0,3892314113:33280,4160749569:8421378},{0:1074282512,16777216:16384,33554432:524288,50331648:1074266128,67108864:1073741840,83886080:1074282496,100663296:1073758208,117440512:16,134217728:540672,150994944:1073758224,167772160:1073741824,184549376:540688,201326592:524304,218103808:0,234881024:16400,251658240:1074266112,8388608:1073758208,25165824:540688,41943040:16,58720256:1073758224,75497472:1074282512,92274688:1073741824,109051904:524288,125829120:1074266128,142606336:524304,159383552:0,176160768:16384,192937984:1074266112,209715200:1073741840,226492416:540672,243269632:1074282496,260046848:16400,268435456:0,285212672:1074266128,301989888:1073758224,318767104:1074282496,335544320:1074266112,352321536:16,369098752:540688,385875968:16384,402653184:16400,419430400:524288,436207616:524304,452984832:1073741840,469762048:540672,486539264:1073758208,503316480:1073741824,520093696:1074282512,276824064:540688,293601280:524288,310378496:1074266112,327155712:16384,343932928:1073758208,360710144:1074282512,377487360:16,394264576:1073741824,411041792:1074282496,427819008:1073741840,444596224:1073758224,461373440:524304,478150656:0,494927872:16400,511705088:1074266128,528482304:540672},{0:260,1048576:0,2097152:67109120,3145728:65796,4194304:65540,5242880:67108868,6291456:67174660,7340032:67174400,8388608:67108864,9437184:67174656,10485760:65792,11534336:67174404,12582912:67109124,13631488:65536,14680064:4,15728640:256,524288:67174656,1572864:67174404,2621440:0,3670016:67109120,4718592:67108868,5767168:65536,6815744:65540,7864320:260,8912896:4,9961472:256,11010048:67174400,12058624:65796,13107200:65792,14155776:67109124,15204352:67174660,16252928:67108864,16777216:67174656,17825792:65540,18874368:65536,19922944:67109120,20971520:256,22020096:67174660,23068672:67108868,24117248:0,25165824:67109124,26214400:67108864,27262976:4,28311552:65792,29360128:67174400,30408704:260,31457280:65796,32505856:67174404,17301504:67108864,18350080:260,19398656:67174656,20447232:0,21495808:65540,22544384:67109120,23592960:256,24641536:67174404,25690112:65536,26738688:67174660,27787264:65796,28835840:67108868,29884416:67109124,30932992:67174400,31981568:4,33030144:65792},{0:2151682048,65536:2147487808,131072:4198464,196608:2151677952,262144:0,327680:4198400,393216:2147483712,458752:4194368,524288:2147483648,589824:4194304,655360:64,720896:2147487744,786432:2151678016,851968:4160,917504:4096,983040:2151682112,32768:2147487808,98304:64,163840:2151678016,229376:2147487744,294912:4198400,360448:2151682112,425984:0,491520:2151677952,557056:4096,622592:2151682048,688128:4194304,753664:4160,819200:2147483648,884736:4194368,950272:4198464,1015808:2147483712,1048576:4194368,1114112:4198400,1179648:2147483712,1245184:0,1310720:4160,1376256:2151678016,1441792:2151682048,1507328:2147487808,1572864:2151682112,1638400:2147483648,1703936:2151677952,1769472:4198464,1835008:2147487744,1900544:4194304,1966080:64,2031616:4096,1081344:2151677952,1146880:2151682112,1212416:0,1277952:4198400,1343488:4194368,1409024:2147483648,1474560:2147487808,1540096:64,1605632:2147483712,1671168:4096,1736704:2147487744,1802240:2151678016,1867776:4160,1933312:2151682048,1998848:4194304,2064384:4198464},{0:128,4096:17039360,8192:262144,12288:536870912,16384:537133184,20480:16777344,24576:553648256,28672:262272,32768:16777216,36864:537133056,40960:536871040,45056:553910400,49152:553910272,53248:0,57344:17039488,61440:553648128,2048:17039488,6144:553648256,10240:128,14336:17039360,18432:262144,22528:537133184,26624:553910272,30720:536870912,34816:537133056,38912:0,43008:553910400,47104:16777344,51200:536871040,55296:553648128,59392:16777216,63488:262272,65536:262144,69632:128,73728:536870912,77824:553648256,81920:16777344,86016:553910272,90112:537133184,94208:16777216,98304:553910400,102400:553648128,106496:17039360,110592:537133056,114688:262272,118784:536871040,122880:0,126976:17039488,67584:553648256,71680:16777216,75776:17039360,79872:537133184,83968:536870912,88064:17039488,92160:128,96256:553910272,100352:262272,104448:553910400,108544:0,112640:553648128,116736:16777344,120832:262144,124928:537133056,129024:536871040},{0:268435464,256:8192,512:270532608,768:270540808,1024:268443648,1280:2097152,1536:2097160,1792:268435456,2048:0,2304:268443656,2560:2105344,2816:8,3072:270532616,3328:2105352,3584:8200,3840:270540800,128:270532608,384:270540808,640:8,896:2097152,1152:2105352,1408:268435464,1664:268443648,1920:8200,2176:2097160,2432:8192,2688:268443656,2944:270532616,3200:0,3456:270540800,3712:2105344,3968:268435456,4096:268443648,4352:270532616,4608:270540808,4864:8200,5120:2097152,5376:268435456,5632:268435464,5888:2105344,6144:2105352,6400:0,6656:8,6912:270532608,7168:8192,7424:268443656,7680:270540800,7936:2097160,4224:8,4480:2105344,4736:2097152,4992:268435464,5248:268443648,5504:8200,5760:270540808,6016:270532608,6272:270540800,6528:270532616,6784:8192,7040:2105352,7296:2097160,7552:0,7808:268435456,8064:268443656},{0:1048576,16:33555457,32:1024,48:1049601,64:34604033,80:0,96:1,112:34603009,128:33555456,144:1048577,160:33554433,176:34604032,192:34603008,208:1025,224:1049600,240:33554432,8:34603009,24:0,40:33555457,56:34604032,72:1048576,88:33554433,104:33554432,120:1025,136:1049601,152:33555456,168:34603008,184:1048577,200:1024,216:34604033,232:1,248:1049600,256:33554432,272:1048576,288:33555457,304:34603009,320:1048577,336:33555456,352:34604032,368:1049601,384:1025,400:34604033,416:1049600,432:1,448:0,464:34603008,480:33554433,496:1024,264:1049600,280:33555457,296:34603009,312:1,328:33554432,344:1048576,360:1025,376:34604032,392:33554433,408:34603008,424:0,440:34604033,456:1049601,472:1024,488:33555456,504:1048577},{0:134219808,1:131072,2:134217728,3:32,4:131104,5:134350880,6:134350848,7:2048,8:134348800,9:134219776,10:133120,11:134348832,12:2080,13:0,14:134217760,15:133152,2147483648:2048,2147483649:134350880,2147483650:134219808,2147483651:134217728,2147483652:134348800,2147483653:133120,2147483654:133152,2147483655:32,2147483656:134217760,2147483657:2080,2147483658:131104,2147483659:134350848,2147483660:0,2147483661:134348832,2147483662:134219776,2147483663:131072,16:133152,17:134350848,18:32,19:2048,20:134219776,21:134217760,22:134348832,23:131072,24:0,25:131104,26:134348800,27:134219808,28:134350880,29:133120,30:2080,31:134217728,2147483664:131072,2147483665:2048,2147483666:134348832,2147483667:133152,2147483668:32,2147483669:134348800,2147483670:134217728,2147483671:134219808,2147483672:134350880,2147483673:134217760,2147483674:134219776,2147483675:0,2147483676:133120,2147483677:2080,2147483678:131104,2147483679:134350848}],f=[4160749569,528482304,33030144,2064384,129024,8064,504,2147483679],u=s.DES=o.extend({_doReset:function(){for(var t=this._key,r=t.words,e=[],i=0;56>i;i++){var n=a[i]-1;e[i]=r[n>>>5]>>>31-n%32&1}for(var o=this._subKeys=[],s=0;16>s;s++){for(var l=o[s]=[],f=h[s],i=0;24>i;i++)l[i/6|0]|=e[(c[i]-1+f)%28]<<31-i%6,l[4+(i/6|0)]|=e[28+(c[i+24]-1+f)%28]<<31-i%6;l[0]=l[0]<<1|l[0]>>>31;for(var i=1;7>i;i++)l[i]=l[i]>>>4*(i-1)+3;l[7]=l[7]<<5|l[7]>>>27}for(var u=this._invSubKeys=[],i=0;16>i;i++)u[i]=o[15-i]},encryptBlock:function(t,r){this._doCryptBlock(t,r,this._subKeys)},decryptBlock:function(t,r){this._doCryptBlock(t,r,this._invSubKeys)},_doCryptBlock:function(e,i,n){this._lBlock=e[i],this._rBlock=e[i+1],t.call(this,4,252645135),t.call(this,16,65535),r.call(this,2,858993459),r.call(this,8,16711935),t.call(this,1,1431655765);for(var o=0;16>o;o++){for(var s=n[o],a=this._lBlock,c=this._rBlock,h=0,u=0;8>u;u++)h|=l[u][((c^s[u])&f[u])>>>0];this._lBlock=c,this._rBlock=a^h}var d=this._lBlock;this._lBlock=this._rBlock,this._rBlock=d,t.call(this,1,1431655765),r.call(this,8,16711935),r.call(this,2,858993459),t.call(this,16,65535),t.call(this,4,252645135),e[i]=this._lBlock,e[i+1]=this._rBlock},keySize:2,ivSize:2,blockSize:2});e.DES=o._createHelper(u);var d=s.TripleDES=o.extend({_doReset:function(){var t=this._key,r=t.words;this._des1=u.createEncryptor(n.create(r.slice(0,2))),this._des2=u.createEncryptor(n.create(r.slice(2,4))),this._des3=u.createEncryptor(n.create(r.slice(4,6)))},encryptBlock:function(t,r){this._des1.encryptBlock(t,r),this._des2.decryptBlock(t,r),this._des3.encryptBlock(t,r)},decryptBlock:function(t,r){this._des3.decryptBlock(t,r),this._des2.encryptBlock(t,r),this._des1.decryptBlock(t,r)},keySize:6,ivSize:2,blockSize:2});e.TripleDES=o._createHelper(d)}(),function(){function t(){for(var t=this._S,r=this._i,e=this._j,i=0,n=0;4>n;n++){r=(r+1)%256,e=(e+t[r])%256;var o=t[r];t[r]=t[e],t[e]=o,i|=t[(t[r]+t[e])%256]<<24-8*n}return this._i=r,this._j=e,i}var r=CryptoJS,e=r.lib,i=e.StreamCipher,n=r.algo,o=n.RC4=i.extend({_doReset:function(){for(var t=this._key,r=t.words,e=t.sigBytes,i=this._S=[],n=0;256>n;n++)i[n]=n;for(var n=0,o=0;256>n;n++){var s=n%e,a=r[s>>>2]>>>24-s%4*8&255;o=(o+i[n]+a)%256;var c=i[n];i[n]=i[o],i[o]=c}this._i=this._j=0},_doProcessBlock:function(r,e){r[e]^=t.call(this)},keySize:8,ivSize:0});r.RC4=i._createHelper(o);var s=n.RC4Drop=o.extend({cfg:o.cfg.extend({drop:192}),_doReset:function(){o._doReset.call(this);for(var r=this.cfg.drop;r>0;r--)t.call(this)}});r.RC4Drop=i._createHelper(s)}(),CryptoJS.mode.CTRGladman=function(){function t(t){if(255===(t>>24&255)){var r=t>>16&255,e=t>>8&255,i=255&t;255===r?(r=0,255===e?(e=0,255===i?i=0:++i):++e):++r,t=0,t+=r<<16,t+=e<<8,t+=i}else t+=1<<24;return t}function r(r){return 0===(r[0]=t(r[0]))&&(r[1]=t(r[1])),r}var e=CryptoJS.lib.BlockCipherMode.extend(),i=e.Encryptor=e.extend({processBlock:function(t,e){var i=this._cipher,n=i.blockSize,o=this._iv,s=this._counter;o&&(s=this._counter=o.slice(0),this._iv=void 0),r(s);var a=s.slice(0);i.encryptBlock(a,0);for(var c=0;n>c;c++)t[e+c]^=a[c]}});return e.Decryptor=i,e}(),function(){function t(){for(var t=this._X,r=this._C,e=0;8>e;e++)s[e]=r[e];r[0]=r[0]+1295307597+this._b|0,r[1]=r[1]+3545052371+(r[0]>>>0<s[0]>>>0?1:0)|0,r[2]=r[2]+886263092+(r[1]>>>0<s[1]>>>0?1:0)|0,r[3]=r[3]+1295307597+(r[2]>>>0<s[2]>>>0?1:0)|0,r[4]=r[4]+3545052371+(r[3]>>>0<s[3]>>>0?1:0)|0,r[5]=r[5]+886263092+(r[4]>>>0<s[4]>>>0?1:0)|0,r[6]=r[6]+1295307597+(r[5]>>>0<s[5]>>>0?1:0)|0,r[7]=r[7]+3545052371+(r[6]>>>0<s[6]>>>0?1:0)|0,this._b=r[7]>>>0<s[7]>>>0?1:0;for(var e=0;8>e;e++){var i=t[e]+r[e],n=65535&i,o=i>>>16,c=((n*n>>>17)+n*o>>>15)+o*o,h=((4294901760&i)*i|0)+((65535&i)*i|0);a[e]=c^h}t[0]=a[0]+(a[7]<<16|a[7]>>>16)+(a[6]<<16|a[6]>>>16)|0,t[1]=a[1]+(a[0]<<8|a[0]>>>24)+a[7]|0,t[2]=a[2]+(a[1]<<16|a[1]>>>16)+(a[0]<<16|a[0]>>>16)|0,t[3]=a[3]+(a[2]<<8|a[2]>>>24)+a[1]|0,t[4]=a[4]+(a[3]<<16|a[3]>>>16)+(a[2]<<16|a[2]>>>16)|0,t[5]=a[5]+(a[4]<<8|a[4]>>>24)+a[3]|0,t[6]=a[6]+(a[5]<<16|a[5]>>>16)+(a[4]<<16|a[4]>>>16)|0,t[7]=a[7]+(a[6]<<8|a[6]>>>24)+a[5]|0}var r=CryptoJS,e=r.lib,i=e.StreamCipher,n=r.algo,o=[],s=[],a=[],c=n.Rabbit=i.extend({_doReset:function(){for(var r=this._key.words,e=this.cfg.iv,i=0;4>i;i++)r[i]=16711935&(r[i]<<8|r[i]>>>24)|4278255360&(r[i]<<24|r[i]>>>8);var n=this._X=[r[0],r[3]<<16|r[2]>>>16,r[1],r[0]<<16|r[3]>>>16,r[2],r[1]<<16|r[0]>>>16,r[3],r[2]<<16|r[1]>>>16],o=this._C=[r[2]<<16|r[2]>>>16,4294901760&r[0]|65535&r[1],r[3]<<16|r[3]>>>16,4294901760&r[1]|65535&r[2],r[0]<<16|r[0]>>>16,4294901760&r[2]|65535&r[3],r[1]<<16|r[1]>>>16,4294901760&r[3]|65535&r[0]];this._b=0;for(var i=0;4>i;i++)t.call(this);for(var i=0;8>i;i++)o[i]^=n[i+4&7];if(e){var s=e.words,a=s[0],c=s[1],h=16711935&(a<<8|a>>>24)|4278255360&(a<<24|a>>>8),l=16711935&(c<<8|c>>>24)|4278255360&(c<<24|c>>>8),f=h>>>16|4294901760&l,u=l<<16|65535&h;o[0]^=h,o[1]^=f,o[2]^=l,o[3]^=u,o[4]^=h,o[5]^=f,o[6]^=l,o[7]^=u;for(var i=0;4>i;i++)t.call(this)}},_doProcessBlock:function(r,e){var i=this._X;t.call(this),o[0]=i[0]^i[5]>>>16^i[3]<<16,o[1]=i[2]^i[7]>>>16^i[5]<<16,o[2]=i[4]^i[1]>>>16^i[7]<<16,o[3]=i[6]^i[3]>>>16^i[1]<<16;for(var n=0;4>n;n++)o[n]=16711935&(o[n]<<8|o[n]>>>24)|4278255360&(o[n]<<24|o[n]>>>8),r[e+n]^=o[n]},blockSize:4,ivSize:2});r.Rabbit=i._createHelper(c)}(),CryptoJS.mode.CTR=function(){var t=CryptoJS.lib.BlockCipherMode.extend(),r=t.Encryptor=t.extend({processBlock:function(t,r){var e=this._cipher,i=e.blockSize,n=this._iv,o=this._counter;n&&(o=this._counter=n.slice(0),this._iv=void 0);var s=o.slice(0);e.encryptBlock(s,0),o[i-1]=o[i-1]+1|0;for(var a=0;i>a;a++)t[r+a]^=s[a]}});return t.Decryptor=r,t}(),function(){function t(){for(var t=this._X,r=this._C,e=0;8>e;e++)s[e]=r[e];r[0]=r[0]+1295307597+this._b|0,r[1]=r[1]+3545052371+(r[0]>>>0<s[0]>>>0?1:0)|0,r[2]=r[2]+886263092+(r[1]>>>0<s[1]>>>0?1:0)|0,r[3]=r[3]+1295307597+(r[2]>>>0<s[2]>>>0?1:0)|0,r[4]=r[4]+3545052371+(r[3]>>>0<s[3]>>>0?1:0)|0,r[5]=r[5]+886263092+(r[4]>>>0<s[4]>>>0?1:0)|0,r[6]=r[6]+1295307597+(r[5]>>>0<s[5]>>>0?1:0)|0,r[7]=r[7]+3545052371+(r[6]>>>0<s[6]>>>0?1:0)|0,this._b=r[7]>>>0<s[7]>>>0?1:0;for(var e=0;8>e;e++){var i=t[e]+r[e],n=65535&i,o=i>>>16,c=((n*n>>>17)+n*o>>>15)+o*o,h=((4294901760&i)*i|0)+((65535&i)*i|0);a[e]=c^h}t[0]=a[0]+(a[7]<<16|a[7]>>>16)+(a[6]<<16|a[6]>>>16)|0,t[1]=a[1]+(a[0]<<8|a[0]>>>24)+a[7]|0,t[2]=a[2]+(a[1]<<16|a[1]>>>16)+(a[0]<<16|a[0]>>>16)|0,t[3]=a[3]+(a[2]<<8|a[2]>>>24)+a[1]|0,t[4]=a[4]+(a[3]<<16|a[3]>>>16)+(a[2]<<16|a[2]>>>16)|0,t[5]=a[5]+(a[4]<<8|a[4]>>>24)+a[3]|0,t[6]=a[6]+(a[5]<<16|a[5]>>>16)+(a[4]<<16|a[4]>>>16)|0,t[7]=a[7]+(a[6]<<8|a[6]>>>24)+a[5]|0}var r=CryptoJS,e=r.lib,i=e.StreamCipher,n=r.algo,o=[],s=[],a=[],c=n.RabbitLegacy=i.extend({_doReset:function(){var r=this._key.words,e=this.cfg.iv,i=this._X=[r[0],r[3]<<16|r[2]>>>16,r[1],r[0]<<16|r[3]>>>16,r[2],r[1]<<16|r[0]>>>16,r[3],r[2]<<16|r[1]>>>16],n=this._C=[r[2]<<16|r[2]>>>16,4294901760&r[0]|65535&r[1],r[3]<<16|r[3]>>>16,4294901760&r[1]|65535&r[2],r[0]<<16|r[0]>>>16,4294901760&r[2]|65535&r[3],r[1]<<16|r[1]>>>16,4294901760&r[3]|65535&r[0]];this._b=0;for(var o=0;4>o;o++)t.call(this);for(var o=0;8>o;o++)n[o]^=i[o+4&7];if(e){var s=e.words,a=s[0],c=s[1],h=16711935&(a<<8|a>>>24)|4278255360&(a<<24|a>>>8),l=16711935&(c<<8|c>>>24)|4278255360&(c<<24|c>>>8),f=h>>>16|4294901760&l,u=l<<16|65535&h;n[0]^=h,n[1]^=f,n[2]^=l,n[3]^=u,n[4]^=h,n[5]^=f,n[6]^=l,n[7]^=u;for(var o=0;4>o;o++)t.call(this)}},_doProcessBlock:function(r,e){var i=this._X;t.call(this),o[0]=i[0]^i[5]>>>16^i[3]<<16,o[1]=i[2]^i[7]>>>16^i[5]<<16,o[2]=i[4]^i[1]>>>16^i[7]<<16,o[3]=i[6]^i[3]>>>16^i[1]<<16;for(var n=0;4>n;n++)o[n]=16711935&(o[n]<<8|o[n]>>>24)|4278255360&(o[n]<<24|o[n]>>>8),r[e+n]^=o[n]},blockSize:4,ivSize:2});r.RabbitLegacy=i._createHelper(c)}(),CryptoJS.pad.ZeroPadding={pad:function(t,r){var e=4*r;t.clamp(),t.sigBytes+=e-(t.sigBytes%e||e)},unpad:function(t){for(var r=t.words,e=t.sigBytes-1;!(r[e>>>2]>>>24-e%4*8&255);)e--;t.sigBytes=e+1}};}
/**
 *  Helper function for calculate data size in bytes
 *
 * @param {object/string/number/array} object - Data for calculate
 * @returns {number} - Size in bytes
 */
/* istanbul ignore next */
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
}(window, document));
