'use strict';

/**
 *
 * This class implements a tracker for tracking events to ironSource atom
 *
 * @param {Object} params
 * @param {Number} params.flushInterval - data sending interval
 * @param {Number} params.bulkLen - number of records in each bulk request
 * @param {Number} params.bulkSize - the maximum bulk size in KB.
 * Optional for ISAtom main object:
 * @param {String} params.endpoint - Endpoint api url
 * @param {String} params.auth (optional) - key for hmac authentication
 *
 * @constructor
 */
function Tracker(params) {
  var self = this;
  params = params || {};
  this.params = params;
  this.params.flushInterval = !!params.flushInterval ? params.flushInterval * 1000 : 30000;
  this.params.bulkLen = !!params.bulkLen ? params.bulkLen : 20;
  this.params.bulkSize = !!params.bulkSize ? params.bulkSize * 1024 : 5 * 1024;
  this.params.auth = !!params.auth ? params.auth : ''; // Default auth for all streams
  this.retryTimeout = 1000;

  // Dict of accumulated records: (stream -> [data array])
  this.accumulated = {};
  this.atom = new IronSourceAtom(params);

  //Flush everything every {flushInterval} seconds
  if (!this.timer) {
    this.timer = setInterval(function () {
      self.flush();
    }, this.params.flushInterval);
  }
}

window.IronSourceAtom.Tracker = Tracker;

/**
 *
 * Start track events
 *
 * @api {post} endpoint/bulk track Accumulate and send events to server
 * @apiVersion 1.1.1
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

Tracker.prototype.track = function (stream, data) {
  var self = this;
  if (stream === undefined || stream.length == 0 || data.length == 0 || data === undefined) {
    throw new Error('Stream name and data are required parameters');
  }

  // Init the stream backlog (stream -> [data array])
  if (!(stream in self.accumulated)) {
    self.accumulated[stream] = [];
  }

  // Store the data as an array of strings
  if ((typeof data !== 'string' && !(data instanceof String))) {
    try {
      self.accumulated[stream].push(JSON.stringify(data))
    } catch (e) {
      throw new Error("Invalid Data - can't be stringified", e);
    }
  } else {
    self.accumulated[stream].push(data);
  }

  // Flush on a certain bulk length or bulk size (in bytes)
  if (self.accumulated[stream].length >= self.params.bulkLen
    || _byteCount(self.accumulated[stream]) >= self.params.bulkSize) {
    self.flush(stream);
  }
};

Tracker.prototype.flush = function (targetStream, callback) {
  var self = this;
  var timeout = this.retryTimeout;

  if (!callback) {
    callback = function (err, data) {
      return err ? new Error(err) : data;
    };
  }

  var tasks = [];

  if (targetStream) {
    if (self.accumulated[targetStream].length >= 1) {
      tasks.push(function (taskCb) {
        _send(targetStream, self.accumulated[targetStream], timeout, taskCb, true);
      });
    }
  } else {
    for (var stream in self.accumulated) {
      if (self.accumulated[stream].length >= 1) {
        // The IIFE is here to create a separate scope so we don't get the stream as closure from the upper func.
        // DO NOT REMOVE IT unless you find a nicer way to copy the stream by value without jqeury/es6.
        (function (stream) {
          tasks.push(function (taskCb) {
            return _send(stream, self.accumulated[stream], timeout, taskCb, true);
          });
        })(stream);
      }
    }
  }
  return taskMap(tasks, callback);

  function _send(sendStream, sendData, timeout, callback, firstRun) {

    // In order to prevent the deletion of the data on each function call
    if (firstRun) {
      self.accumulated[sendStream] = [];
      firstRun = false;
    }

    // check return
    return self.atom.putEvents({"stream": sendStream, "data": sendData}, function (err, data, status) {
      if (err != null && status >= 500) {
        // Exponential back off + jitter - retry for 20 minutes max
        if (timeout < 20 * 60 * 1000) {
          setTimeout(function () {
            timeout = timeout * 2 + Math.floor((Math.random() * 1000) + 100);
            _send(sendStream, sendData, timeout, callback, firstRun);
          }, timeout);
          return;
        } else {
          // Case server didn't respond for too much time
          return callback('Timeout - No response from server', null, 408);
        }
      }
      return callback(err, data, status);

    })
  }
};

function _byteCount(string) {
  return encodeURI(string).split(/%..|./).length - 1;
}