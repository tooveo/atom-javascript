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
  if ('XDomainRequest' in window && window.XDomainRequest !== null && this._isIE() && this._isIE() < 10) {
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
 * IE9 check, this function is here since IE10 has an unusable XDomainRequest (wtf?)
 * Return the version of the browser if it is an IE browser, else returns false
 * @private
 */
Request.prototype._isIE = function () {
  var myNav = navigator.userAgent.toLowerCase();
  console.log("EXPLORER VERSION: " + myNav);
  return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
};

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
