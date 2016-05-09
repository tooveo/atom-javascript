# ironSource.atom SDK for JS [![License][license-image]][license-url]

- [Get started](https://atom.ironsrc.com/#/signup)
- [Using the SDK](#using-the-sdk)
  - [Tracking events](#tracking-event)

### Using the SDK

#### Tracking events
__Installation__
```sh
$ npm i github.com/ironSource/atom-js
```
Now you can start tracking events:
```js
// ...
var options = {
  endpoint: "https://track.atom-data.io/",
  apiVersion: "V1",
  auth: "YOUR_API_KEY"
}
var atom = new IronSourceAtom(options);

// Put single event
var param = {
  table: "TABLE_NAME",
  data: "String with any data and any structure for sending",
  method: "POST" // GET or POST http method (default POST)
}
var callback = function(result) {
  // ...
}
atom.putEvent(param, callback);

// Put multiple events in one single request
var param2 = {
  table: "TABLE_NAME",
  data: ["{\"name\": \"iron\", \"last_name\": \"Beast\"}",
         "{\"name\": \"iron2\", \"last_name\": \"Beast2\"}"], // Array of strings, the string can be any data of any structure
  method: "POST" // GET or POST http method (default POST)
}
var callback2 = function(result) {
  // ...
}

atom.putEvents(param2, callback2);

```


### License
MIT

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[license-url]: LICENSE
