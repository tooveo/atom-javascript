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
  xhr.setRequestHeader("x-ironsource-atom-sdk-type", "atom-js");
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
  xhr.setRequestHeader("x-ironsource-atom-sdk-type", "atom-js");
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
