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
      throw new Error("data is invalid - can't be stringified")
    }
  }

  this.headers = {
    contentType: "application/json;charset=UTF-8",
    sdkType: this.params.sdkType,
    sdkVersion: this.params.sdkVersion
  };

  this.xhr = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
}

/**
 * Perform an HTTP POST to the Atom endpoint.
 * @param {atomCallback} callback - The callback that handles the response.
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

  xhr.open("POST", this.params.endpoint, true);
  xhr.setRequestHeader("Content-type", this.headers.contentType);
  xhr.setRequestHeader("x-ironsource-atom-sdk-type", this.headers.sdkType);
  xhr.setRequestHeader("x-ironsource-atom-sdk-version", this.headers.sdkVersion);

  xhr.onreadystatechange = function (event) {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      var res;
      if (xhr.status == 200) {
        res = new Response(null, xhr.response, xhr.status);
        callback(null, res.data(), xhr.status);
      } else if (xhr.status >= 400 && xhr.status < 600) {
        res = new Response(xhr.response, null, xhr.status);
        callback(res.err(), null, xhr.status);
      } else if (xhr.status == 0) {
        callback("No connection to server", null, 500);
      }
    }
  };

  xhr.send(payload);
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

  var xhr = this.xhr;
  var base64Data;
  var data = JSON.stringify({
    table: this.params.stream,
    data: this.params.data,
    apiVersion: this.params.apiVersion,
    auth: !!this.params.auth ? CryptoJS.HmacSHA256(this.params.data, this.params.auth).toString(CryptoJS.enc.Hex) : ""
  });

  try {
    base64Data = Base64.encode(data);
  } catch (e) {
    throw new Error("Can't encode Base64 data: " + e);
  }

  xhr.open("GET", this.params.endpoint + '?data=' + base64Data, true);
  xhr.setRequestHeader("Content-type", this.headers.contentType);
  xhr.setRequestHeader("x-ironsource-atom-sdk-type", this.headers.sdkType);
  xhr.setRequestHeader("x-ironsource-atom-sdk-version", this.headers.sdkVersion);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      var res;
      if (xhr.status == 200) {
        res = new Response(null, xhr.response, xhr.status);
        callback(null, res.data(), xhr.status);
      } else if (xhr.status >= 400 && xhr.status < 600) {
        res = new Response(xhr.response, null, xhr.status);
        callback(res.err(), null, xhr.status);
      } else if (xhr.status == 0) {
        callback("No connection to server", null, 500);
      }
    }
  };

  xhr.send();
};

/**
 * Preform a health check on Atom Endpoint
 * @param {atomCallback} callback - The callback that handles the response.
 */
Request.prototype.health = function (callback) {
  var xhr = this.xhr;

  xhr.open("GET", this.params.endpoint + 'health', true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      var res;
      if (xhr.status == 200) {
        res = new Response(null, xhr.response, xhr.status);
        !!callback && callback(null, res.data(), xhr.status);
      } else {
        /* istanbul ignore next */
        res = new Response(xhr.response, null, xhr.status);
        /* istanbul ignore next */
        !!callback && callback(res.err(), null, xhr.status);
      }
    }
  };

  xhr.send();
};

