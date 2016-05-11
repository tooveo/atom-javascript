# ironSource.atom SDK for JS [![License][license-image]][license-url]

### Using the SDK

#### Tracking events
__Installation__
```sh
$ npm i --save github.com/ironSource/atom-js
```
#### Add script file
```html
// ...
<script src="node_modules/is-atom/dist/sdk.min.js"></script>
```

#### Now you can start tracking events:
```js
// ...
var options = {
  endpoint: "https://track.atom-data.io/",
  auth: "YOUR_API_KEY"
}
var atom = new IronSourceAtom(options);
```
### Main IronSource class
ISAtom(options) object with **options**:
  * **endpoint** {String} — The endpoint URI to send requests to. The default endpoint is: **“https://track.atom-data.io/”** .
  * **auth** {String} - optional HMAC for authentication.

**Example: var atom = new IronSourceAtom(options);**

### IronSource Atom tracking methods
#### putEvent(params, callback)
Send single event to IS server
**params**:
  * **stream** {String} *Required* - **“cluster.schema.table_name”** stream name to send data.
  * **data** {String} *Required* - String with any data and any structure.
  * **method** {String} *Optional* - POST or GET http method to transfer data. Default "POST".

**callback** {Function} - custom function for work with result.
```js
var options = {
  // ...
};
var atom = new IronSourceAtom(options);

// Put single event
var params = {
  stream: "STREAM_NAME",
  data: "{\"name\": \"iron\", \"last_name\": \"Beast\"}",
  method: "GET" // optional, default "POST"
}
var callback = function(res) {
  // res = {err, data, statusCode}
  // ...
}

atom.putEvent(params, callback);
```

#### putEvents(params, callback)
Send multiple events to IS server
**params**:
  * **stream** {String} *Required* - **“cluster.schema.table_name”** stream name to send data.
  * **data** {Array} *Required* - Array of strings, the string can be any data of any structure.
  * **method** {String} *Optional* - POST or GET http method to transfer data. Default "POST".

**callback** {Function} - custom function for work with result.
```js
var options = {
  // ...
};
var atom = new IronSourceAtom(options);

// Put single event
var params = {
  stream: "STREAM_NAME",
  data: ["{\"name\": \"iron\", \"last_name\": \"Beast\"}",
         "{\"name\": \"iron2\", \"last_name\": \"Beast2\"}"],
  method: "GET" // optional, default "POST"
}
var callback = function(res) {
  // res = {err, data, statusCode}
  // ...
}

atom.putEvents(params, callback);
```


### License
MIT

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[license-url]: LICENSE
