# ironSource.atom SDK for JavaScript
[![License][license-image]][license-url]
[![Docs][docs-image]][docs-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Build status][travis-image]][travis-url]
## Browsers support
[![Sauce Test Status][sauce-image]][sauce-url]

atom-javascript is the official [ironSource.atom](http://www.ironsrc.com/data-flow-management) SDK for Web Browsers.

- [Signup](https://atom.ironsrc.com/#/signup)
- [Documentation](https://ironsource.github.io/atom-javascript/)
- [Installation](#Installation)
- [Sending an event](#Using-the-API-layer-to-send-events)

#### Installation
```sh
$ bower install --save atom-sdk-js
```
##### Add script file
```html
// ...
<script src="bower_components/atom-sdk-js/dist/sdk.min.js"></script>
```

#### Usage
##### High Level API - "Tracker"
 ```js
 var options = {
   endpoint: "https://track.atom-data.io/",
   auth: "YOUR_HMAC_AUTH_KEY", // Optional, depends on your stream config
   flushInterval: 10, // Tracker flush interval in seconds
   bulkLen: 50, // Number of events per bulk
   bulkSize: 20 // Size of each bulk in KB
 }

 var tracker = new Tracker(options); // Init a new tracker

 var params = {
   stream: "STREAM_NAME", // Your target stream name
   data: JSON.stringify({id: 1, string_col: "String"}) // Data that matches your DB structure
 }

 tracker.track(params); // Start tracking
 tracker.flush(); // Send accumulated data immediately
 ```

##### Low Level API
```js
var options = {
  endpoint: "https://track.atom-data.io/",
  auth: "YOUR_HMAC_AUTH_KEY" // Optional, depends on your stream config
}

var atom = new IronSourceAtom(options);

var params = {
  stream: "STREAM_NAME", // Your target stream name
  data: JSON.stringify({name: "iron", last_name: "Source"}), // String with data that matches your DB structure
  method: "GET" // HTTP request method - Optional, default "POST"
}

var callback = function(res) {
  // res = {err, data, statusCode}
  // ...
}

atom.putEvent(params, callback);

// OR

var params = {
  stream: "STREAM_NAME", // Your target stream name
  data: [{name: "iron", last_name: "Beast"},
         {name: "iron2", last_name: "Beast2"}], // Array with any data that matches your DB structure.
  // Note: you can't send bulk events with GET HTTP method.
} 

atom.putEvents(params, callback); // for send bulk of events
```

### Example

You can use our [example][example-url] for sending data to Atom:

![alt text][example]

### License
MIT

[example-url]: https://github.com/ironSource/atom-javascript/blob/master/atom-sdk/example/index.html
[example]: https://cloud.githubusercontent.com/assets/19283325/16585493/ce347b24-42c9-11e6-8930-765605663eca.png "example"
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[license-url]: LICENSE
[travis-image]: https://travis-ci.org/ironSource/atom-javascript.svg?branch=master
[travis-url]: https://travis-ci.org/ironSource/atom-javascript
[coveralls-image]: https://coveralls.io/repos/github/ironSource/atom-javascript/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/ironSource/atom-javascript?branch=master
[docs-image]: https://img.shields.io/badge/docs-latest-blue.svg
[docs-url]: https://ironsource.github.io/atom-javascript/
[sauce-image]: https://saucelabs.com/browser-matrix/jacckson.svg?auth=433c2b373dfd86bc7d78fc8bf36dbc3b
[sauce-url]: https://saucelabs.com/u/jacckson?auth=433c2b373dfd86bc7d78fc8bf36dbc3b
