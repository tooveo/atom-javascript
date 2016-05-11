'use strict';

(function(){
  var options = {
    endpoint: "https://track.atom-data.io/",
    auth: "YOUR_API_KEY"
  };
  var stream = "",
      httpMethod = "POST";

  var atom = new IronSourceAtom(options);

  var sendEventBtn  = document.getElementById('track-event'),
      sendEventsBtn  = document.getElementById('track-events'),
      addData = document.getElementById('add-data');
      // updateOptions = document.getElementById('update-options'),
      // resetOptions = document.getElementById('reset-options');

  var count = document.getElementById('events-count'),
      optionsDisplay = document.getElementById('options-display'),
      responseDisplay = document.getElementById('response-display'),
      dataInput = document.getElementById('input-data'),
      methodInput = document.getElementsByName('method'),
      streamInput = document.getElementById('stream'),
      codeDisplay = document.getElementById('bulk');
  
  var data = [];

  updateOptionsDisplay();

  for(var i=0; i < methodInput.length; i++){
    methodInput[i].addEventListener('click', function() {
      httpMethod = this.value;
      updateOptionsDisplay();
    });
  }

  streamInput.addEventListener('blur', function() {
    if (this.value != "") {
      stream = this.value;
      updateOptionsDisplay();
    }
  });

  // updateOptions.addEventListener('click', function() {
  //   setTimeout(function() {
  //     atom = new IronSourceAtom(options);
  //
  //     updateOptionsDisplay();
  //
  //     // health method for check is server alive
  //     atom.health(function(res){
  //       console.log('Is server alive? - ', !!res && res.status < 500 && res.status != 404);
  //     });
  //   }, 50);
  // });
  // resetOptions.addEventListener('click', function() {
  //   setTimeout(function() {
  //     options = {
  //       endpoint: "https://track.atom-data.io/",
  //       apiVersion: "V1",
  //       auth: "YOUR_API_KEY"
  //     };
  //
  //     atom = new IronSourceAtom(options);
  //
  //     updateOptionsDisplay();
  //
  //     // health method for check is server alive
  //     atom.health(function(res){
  //       console.log('Is server alive? - ', !!res && res.status < 500 && res.status != 404);
  //     });
  //   }, 50);
  // });

  
  // Add putEvent(params, callback) params {object}, callback {function}
  sendEventBtn.addEventListener('click', function(){
    try {
      atom.putEvent({ data: "{\"name\": \"iron\", \"last_name\": \"Source\"}",
          table: stream,
          method: httpMethod
        },
        function(res){
          displayResponse(res);
        });
    } catch (e) {
      displayError(e);
    }

  });

  // Add putEvent(params, callback) params {object}, callback {function}
  sendEventsBtn.addEventListener('click', function() {
    try {
      atom.putEvents({ data: data,
          table: stream,
          method: httpMethod
        },
        function(res){
          displayResponse(res);
          data = [];
          count.innerHTML = data.length;
          codeDisplay.innerHTML = "[]";
        });
    } catch (e) {
      displayError(e);
    }

  });
  
  addData.addEventListener('click', function(){
    if (dataInput.value == "") return;
    
    data.push(dataInput.value);
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
    responseDisplay.innerHTML = e;
  }

})();
