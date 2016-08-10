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

