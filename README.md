# ironSource.atom SDK for JavaScript
[![License][license-image]][license-url]
[![Docs][docs-image]][docs-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Build status][travis-image]][travis-url]
## Browsers support

| [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/edge.png" alt="IE / Edge" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/firefox.png" alt="Firefox" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/chrome.png" alt="Chrome" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/safari.png" alt="Safari" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/opera.png" alt="Opera" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Opera | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/safari-ios.png" alt="iOS Safari" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>iOS Safari | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/chrome-android.png" alt="Chrome for Android" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome for Android |
| --------- | --------- | --------- | --------- | --------- | --------- | --------- |
| IE7, IE8, IE9, IE10, IE11, Edge| last 2 versions| last 2 versions| last 2 versions| last 2 versions| last 2 versions| last 2 versions

atom-javascript is the official [ironSource.atom](http://www.ironsrc.com/data-flow-management) SDK for the JavaScript programming language.

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

#### Using-the-API-layer-to-send-events

Here's an example of sending an event:
```js
var options = {
  endpoint: "https://track.atom-data.io/",
  auth: "YOUR_API_KEY"
}

var atom = new IronSourceAtom(options);

var params = {
  stream: "STREAM_NAME", //your target stream name
  data: JSON.stringify({name: "iron", last_name: "Source"}), //String with any data and any structure.
  method: "GET" // optional, default "POST"
}

var callback = function(res) {
  // res = {err, data, statusCode}
  // ...
}

atom.putEvent(params, callback);

// or

var params = {
  stream: "STREAM_NAME", // your target stream name
  data: [{name: "iron", last_name: "Beast"},
         {name: "iron2", last_name: "Beast2"}], // Array with any data and any structure.
  method: "GET" // optional, default "POST"
}

atom.putEvents(params, callback); // for send bulk of events
```

### Example

You can use our [example][example-url] for sending data to Atom:

![alt text][example]

### License
MIT

[example-url]: https://github.com/ironSource/atom-javascript/blob/master/atom-sdk/example/index.html
[example]: https://cloud.githubusercontent.com/assets/7361100/15369750/abf65a62-1d3c-11e6-90c3-c25dd331c5c6.png "example"
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[license-url]: LICENSE
[travis-image]: https://travis-ci.org/ironSource/atom-javascript.svg?branch=master
[travis-url]: https://travis-ci.org/ironSource/atom-javascript
[coveralls-image]: https://coveralls.io/repos/github/ironSource/atom-javascript/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/ironSource/atom-javascript?branch=master
[docs-image]: https://img.shields.io/badge/docs-latest-blue.svg
[docs-url]: https://ironsource.github.io/atom-javascript/