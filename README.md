# ironSource.atom SDK for JavaScript
[![License][license-image]][license-url]
[![Docs][docs-image]][docs-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Build status][travis-image]][travis-url]
[![Sauce Build Status][sauce-badge-image]][sauce-url]
## Browsers support
[![Sauce Test Status][sauce-image]][sauce-url]

atom-javascript is the official [ironSource.atom](http://www.ironsrc.com/data-flow-management) SDK for Web Browsers.

- [Signup](https://atom.ironsrc.com/#/signup)
- [Documentation](https://ironsource.github.io/atom-javascript/)
- [Installation](#installation)
- [Usage](#usage)
- [Change Log](#change-log)
- [Example](#example)


## Installation

### Installation with Bower
```sh
$ bower install --save atom-sdk-js
```

```html
<script src="bower_components/atom-sdk-js/dist/sdk.min.js"></script>
```
### Installation with Atom CDN
```html
To install a certain version just do:
<script src="https://js-sdk.atom-data.io/{VERSION_NUMBER_HERE}/sdk.min.js"></script>

For example:
<script src="https://js-sdk.atom-data.io/1.5.0/sdk.min.js"></script>
OR
<script src="https://js-sdk.atom-data.io/1.5.0/sdk.js"></script>


The CDN supports both HTTP and HTTPS 
```

### Installation with async loading

```html
<script type="text/javascript">
  (function(){
      var isa = document.createElement('script');
      isa.type = 'text/javascript';
      isa.async = true;
      isa.src = 'bower_components/atom-sdk-js/dist/sdk.min.js';
      // OR: isa.src = 'http://js-sdk.atom-data.io/1.5.0/sdk.min.js';
      (document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(isa);
  })();
</script>

In case you use the async loading, your tracking code must be placed inside the following init function
See the example for more info.

<script type="text/javascript">
  window.IronSourceAtomInit = function() {
       // Your code here ...
  }
 </script>
```

## Usage
### High Level API - "Tracker"
The tracker is used for sending events to Atom based on several conditions
- Every 30 seconds (default)
- Number of accumulated events has reached 20 (default)
- Size of accumulated events has reached 40KB (default)

```js
var options = {
  endpoint: "https://track.atom-data.io/",
  auth: "YOUR_HMAC_AUTH_KEY", // Optional, depends on your stream config
  flushInterval: 10, // Optional, Tracker flush interval in seconds (default: 30)
  bulkLen: 50, // Optional, Number of events per bulk (batch) (default: 20) 
  bulkSize: 20 // Optional, Size of each bulk in KB (default: 40KB)
}
 
var tracker = new IronSourceAtom.Tracker(options); // Init a new tracker
var stream = "MY_STREAM_NAME"; // Your target stream name
var data = {id: 1, string_col: "String"}; // Data that matches your DB structure
tracker.track(stream, data); // Start tracking and empty the backlog on the described above conditions 
 
// To Flush all events:
tracker.flush(null, function (results) {
    // returns an array of results, for example:
    // data is: {"a":[{key: "value"}],"b":[{key: "value"}]}
    // result: [{"err":"Auth Error: \"a\"","data":null,"status":401} ,{"err":null,"data":{"Status":"OK"},"status":200}]
    //  NOTE: the results will be in the same order as the data.
}); // Send accumulated data immediately

// If you don't need the results, just do:
tracker.flush();
// OR to flush a single stream (optional callback)
tracker.flush(stream);
```
 
### Low Level API
Sending a single event:
```js
var stream = "MY.ATOM.STREAM";
var number = Math.random() * 3000 + 1;
var data = {
  event_name: "JS-SDK-PUT-EVENT-TEST",
  string_value: String(number),
  int_value: Math.round(number),
  float_value: number,
  ts: new Date()
};
 
var atom = new IronSourceAtom();
var params = { 
  data: data, 
  stream: stream,
  method: 'GET' // default is POST
};

atom.putEvent(params,
function (err, data, status) {
  console.log(err,data,status);
});
```

OR if you want to send a bulk(batch) of events:

```js
var stream = "MY.ATOM.STREAM";
var data = [
  {"event_name":"JS-SDK-PUT-EVENTS-TEST","string_value":"67.217","int_value":67},
  {"event_name":"JS-SDK-PUT-EVENTS-TEST","string_value":"2046.43","int_value":20}
];
var atom = new IronSourceAtom();

atom.putEvents({ data: data, stream: stream },
function (err, data, status) {
    console.log(err,data,status);
});
```

## Change Log

### v1.5.0
Note: this version if fully compatible with the old ones except for the "Request" function which shouldn't be used
directly on any case.
- Refactor Tracker
    - Adding exponential backoff mechanism
    - Adding a taskMap to catch all tracker response
- Refactoring response class
- Adding new features and fixing example
- Rewrote all tests
- Fixing bugs in putEvent & putEvents methods
- Adding Async loading
- Adding CDN support
- Changing the documentation to JSDOC.

### v1.1.0
- Fixed Auth mechanism
- Adding Tracker

### v1.0.1
- Fixing the Javascript callback convention.
- Updating docs
- Updating Coverage

### v1.0.0
- Basic features: putEvent & putEvents functionalities

## Example
You can use our [example][example-url] for sending data to Atom:

<img src="https://cloud.githubusercontent.com/assets/7361100/17974132/81fa6808-6aed-11e6-9545-58f404912e15.png" alt="Example" width=1600px>

## License
[MIT](LICENSE)

[example-url]: atom-sdk/example
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[license-url]: LICENSE
[travis-image]: https://travis-ci.org/ironSource/atom-javascript.svg?branch=master
[travis-url]: https://travis-ci.org/ironSource/atom-javascript
[coveralls-image]: https://coveralls.io/repos/github/ironSource/atom-javascript/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/ironSource/atom-javascript?branch=master
[docs-image]: https://img.shields.io/badge/docs-latest-blue.svg
[docs-url]: https://ironsource.github.io/atom-javascript/
[sauce-image]: https://saucelabs.com/browser-matrix/jacckson.svg
[sauce-url]: https://saucelabs.com/beta/builds/d4283e62c1564c7a895523856f62b6c6
[sauce-badge-image]: https://saucelabs.com/buildstatus/jacckson
