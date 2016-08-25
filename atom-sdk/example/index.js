"use strict";
window.ironSourceAtomInit = function () {

  var options = {
    endpoint: "https://track.atom-data.io/",
    auth: ""
  };
  var stream = "",
    httpMethod = "POST";

  var atom = new IronSourceAtom(options);
  var tracker = new IronSourceAtom.Tracker(options);

  var sendEventBtn = document.getElementById("put-event"),
    sendEventsBtn = document.getElementById("put-events"),
    putEventsAddData = document.getElementById("putevents-add-data"),
    trackerAdd = document.getElementById("tracker-btn"),
    trackerFlush = document.getElementById("tracker-flush"),
    trackerClear = document.getElementById("tracker-clear");

  var count = document.getElementById("events-count"),
    authKey = document.getElementById("auth-key"),
    optionsDisplay = document.getElementById("options-display"),
    responseDisplay = document.getElementById("response-display"),
    requestDisplay = document.getElementById("request-display"),
    dataInput = document.getElementById("input-data"),
    methodInput = document.getElementsByName("method"),
    streamInput = document.getElementById("stream"),
    trackerStream = document.getElementById("tracker-stream"),
    trackerData = document.getElementById("tracker-data"),
    trackerBatch = document.getElementById("tracker-batch"),
    trackerResult = document.getElementById("tracker-result"),
    codeDisplay = document.getElementById("bulk"),
    generateTrackerData = document.getElementById('generate-tracker-data'),
    generateData = document.getElementById("generate-data");

  var data = [];

  updateOptionsDisplay();

  for (var i = 0; i < methodInput.length; i++) {
    methodInput[i].addEventListener("click", function () {
      httpMethod = this.value;
      updateOptionsDisplay();
    });
  }

  streamInput.addEventListener("blur", function () {
    if (this.value != "") {
      stream = this.value;
      updateOptionsDisplay();
    }
  });

  authKey.addEventListener('blur', function () {
    options.auth = authKey.value;
    atom = new IronSourceAtom(options);
    tracker = new IronSourceAtom.Tracker(options);
  });

  // putEvent
  sendEventBtn.addEventListener("click", function () {
    var number = Math.random() * 3000 + 1;
    data = {
      event_name: "JS-SDK-PUT-EVENT-TEST",
      string_value: String(number),
      int_value: Math.round(number),
      float_value: number,
      ts: new Date()
    };

    displayRequest({
      data: data,
      table: stream,
      method: httpMethod
    });

    atom.putEvent({
        data: data,
        stream: stream,
        method: httpMethod
      },
      function (err, data, status) {
        err ? displayError(err) : displayResponse(data);
        data = [];
      });

    atom.health(function (err, data, status) {
      console.log("Health Check:", data, status);
    });

  });


  // putEvents
  sendEventsBtn.addEventListener("click", function () {
    displayRequest(
      {
        data: data,
        stream: stream,
        method: httpMethod
      });

    atom.putEvents({
        data: data,
        stream: stream,
        method: httpMethod
      },
      function (err, res, status) {
        if (err) {
          displayError(err);
        }
        else {
          displayResponse(res);
          // init data
          data = [];
          count.innerHTML = data.length;
          codeDisplay.innerHTML = "[]";
        }
      });

    atom.health(function (err, data, status) {
      console.log("Health Check:", data, status);
    });

  });

  // putEvents
  putEventsAddData.addEventListener("click", function () {
    if (dataInput.value == "") return;
    if (!(data instanceof Array)) {
      data = [];
    }
    data.push(dataInput.value);
    dataInput.value = "";
    count.innerHTML = data.length;
    codeDisplay.innerHTML = "[" + data.join(',\n') + "]";
  });

  generateData.addEventListener("click", function () {
    if (!(data instanceof Array)) {
      data = [];
    }
    for (var i = 0; i < 10; i++) {
      var number = Math.random() * (3000 - 3) + 3;
      var genData = {
        event_name: "JS-SDK-PUT-EVENTS-TEST",
        string_value: String(number),
        int_value: Math.round(number),
        float_value: number,
        ts: new Date()
      };
      data.push(genData);
    }

    dataInput.value = "";
    count.innerHTML = data.length;
    codeDisplay.innerHTML = JSON.stringify(data).replace(/},{/g, "},\n{");
  });

  function updateOptionsDisplay() {
    optionsDisplay.innerHTML = '{ <br>' +
      '  streamName: "' + stream + '",<br>' +
      '  method: "' + httpMethod + '"<br>}';
  }

  function displayResponse(res) {
    responseDisplay.innerHTML = JSON.stringify(res);
  }

  function displayError(e) {
    responseDisplay.innerHTML = JSON.stringify(e);
  }

  function displayRequest(data) {
    if (httpMethod == "GET") {
      data = btoa(data);
    }
    requestDisplay.innerHTML = JSON.stringify(data);
  }


  // Tracker
  trackerAdd.addEventListener("click", function () {
    try {
      tracker.track(trackerStream.value, trackerData.value);
    } catch (e) {
      trackerResult.innerHTML = e;
      return;
    }
    updateBatch();
  });


  generateTrackerData.addEventListener("click", function () {
    for (var i = 0; i < 10; i++) {
      var number = Math.random() * (3000 - 3) + 3;
      var genData = {
        event_name: "JS-SDK-TRACKER",
        string_value: String(number),
        int_value: Math.round(number),
        float_value: number,
        ts: new Date()
      };
      try {
        tracker.track(trackerStream.value, genData);
      } catch (e) {
        trackerResult.innerHTML = e;
        return;
      }
    }
    updateBatch();
  });


  trackerFlush.addEventListener("click", function () {
    tracker.flush(null, function (results) {
      var output = '[\n';
      results.forEach(function (result) {
        output += JSON.stringify(result) + '\n';
      });
      trackerResult.innerHTML = output + ']';
      updateBatch();
    });
  });

  trackerClear.addEventListener("click", function () {
    clearTrackerInputs();
  });

  function updateBatch() {
    var output = '';
    for (stream in tracker.accumulated) {
      var data = tracker.accumulated[stream];
      output += 'Stream ' + stream + ': \n' + data.join(',\n') + '\n';
    }
    trackerBatch.innerHTML = output;
  }

  function clearTrackerInputs() {
    trackerStream.value = "";
    trackerData.value = "";
  }
};
