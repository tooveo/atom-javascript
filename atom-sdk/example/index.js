"use strict";

(function(){
  var options = {
    endpoint: "https://track.atom-data.io/",
    auth: "YOUR_API_KEY"
  };
  var stream = "",
      httpMethod = "POST";

  var atom = new IronSourceAtom(options);

  var sendEventBtn  = document.getElementById("track-event"),
      sendEventsBtn  = document.getElementById("track-events"),
      addData = document.getElementById("add-data");
  
  var count = document.getElementById("events-count"),
      optionsDisplay = document.getElementById("options-display"),
      responseDisplay = document.getElementById("response-display"),
      requestDisplay = document.getElementById("request-display"),
      dataInput = document.getElementById("input-data"),
      methodInput = document.getElementsByName("method"),
      streamInput = document.getElementById("stream"),
      codeDisplay = document.getElementById("bulk");
  
  var data = [];

  updateOptionsDisplay();

  for(var i=0; i < methodInput.length; i++){
    methodInput[i].addEventListener("click", function() {
      httpMethod = this.value;
      updateOptionsDisplay();
    });
  }

  streamInput.addEventListener("blur", function() {
    if (this.value != "") {
      stream = this.value;
      updateOptionsDisplay();
    }
  });

  // Add putEvent(params, callback) params {object}, callback {function}
  sendEventBtn.addEventListener("click", function(){
    displayRequest(
      { data: "{name: iron, last_name: Source}",
        table: stream,
        method: httpMethod
      });
    
    atom.putEvent({ data: "{name: iron, last_name: Source}",
        table: stream,
        method: httpMethod
      },
      function(err, data, status) {
        if (err) displayError(err);
        else displayResponse(data);
      });
  });

  // Add putEvent(params, callback) params {object}, callback {function}
  sendEventsBtn.addEventListener("click", function() {
    displayRequest(
      { data: data,
        table: stream,
        method: httpMethod
      });
    
    atom.putEvents({ data: data,
        table: stream,
        method: httpMethod
      },
      function(err, data, status){
        if (err) {
          displayError(err);      
        }
        else {
          displayResponse(data);
          data = [];
          count.innerHTML = data.length;
          codeDisplay.innerHTML = "[]";
        }
      });
  });
  
  addData.addEventListener("click", function(){
    if (dataInput.value == "") return;
    
    data.push(dataInput.value);
    dataInput.value = "";
    count.innerHTML = data.length;
    codeDisplay.innerHTML = "[" + data.join(',\n') + "]";
  });


  function updateOptionsDisplay() {
    optionsDisplay.innerHTML = '{ <br>' +
      '  streamName: "' + stream + '",<br>' +
      '  method: "' + httpMethod +'"<br>}';
  }

  function displayResponse(res) {
    responseDisplay.innerHTML = JSON.stringify(res);
  }

  function displayError(e) {
    responseDisplay.innerHTML = JSON.stringify(e);
  }

  function displayRequest (data) {
    if (httpMethod == "GET")  {
      data = btoa(data);
    } 
    requestDisplay.innerHTML = JSON.stringify(data);
  }

})();
