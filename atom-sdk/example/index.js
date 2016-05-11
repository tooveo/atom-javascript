'use strict';

(function(){
  var options = {
    endpoint: "https://track.atom-data.io/",
    auth: "YOUR_API_KEY"
  };

  var atom = new IronSourceAtom(options);

  var sendEventBtn  = document.getElementById('track-event'),
      sendEventsBtn  = document.getElementById('track-events'),
      addData = document.getElementById('add-data'),
      updateOptions = document.getElementById('update-options'),
      resetOptions = document.getElementById('reset-options');

  var count = document.getElementById('events-count'),
      optionsDisplay = document.getElementById('options-display'),
      dataInput = document.getElementById('input-data'),
      authInput = document.getElementById('auth'),
      endpointInput = document.getElementById('endpoint'),
      codeDisplay = document.getElementById('bulk');
  
  var data = [];

  updateOptionsDisplay();

  authInput.addEventListener('blur', function() {
    options.auth = this.value;
  });

  endpointInput.addEventListener('blur', function() {
    if (this.value != "") {
      options.endpoint = this.value;
    }
  });

  updateOptions.addEventListener('click', function() {
    setTimeout(function() {
      atom = new IronSourceAtom(options);

      updateOptionsDisplay();

      // health method for check is server alive
      atom.health(function(res){
        console.log('Is server alive? - ', !!res && res.status < 500 && res.status != 404);
      });
    }, 50);
  });
  resetOptions.addEventListener('click', function() {
    setTimeout(function() {
      options = {
        endpoint: "https://track.atom-data.io/",
        apiVersion: "V1",
        auth: "YOUR_API_KEY"
      };

      atom = new IronSourceAtom(options);

      updateOptionsDisplay();

      // health method for check is server alive
      atom.health(function(res){
        console.log('Is server alive? - ', !!res && res.status < 500 && res.status != 404);
      });
    }, 50);
  });

  
  // Add putEvent(params, callback) params {object}, callback {function}
  sendEventBtn.addEventListener('click', function(){
    atom.putEvent({ data: "{\"name\": \"iron\", \"last_name\": \"Source\"}",
        table: "yourStreamName",
        method: "GET" // optional, default POST
      },
      function(res){
        console.log(res);
      }); 
  });

  // Add putEvent(params, callback) params {object}, callback {function}
  sendEventsBtn.addEventListener('click', function() {
    atom.putEvents({ data: data,
      table: "yourStreamName",
      method: "POST"
    },
      function(res){
        console.log(res);
        count.innerHTML = data.length;
      });
  });
  
  addData.addEventListener('click', function(){
    if (dataInput.value == "") return;
    
    data.push(dataInput.value);
    count.innerHTML = data.length;
    codeDisplay.innerHTML = data.join('\n');
  });


  function updateOptionsDisplay() {
    optionsDisplay.innerHTML = '{ <br>' +
      '  endpoint: "' + options.endpoint + '",<br>' +
      '  auth: "' + options.auth +'"<br>}';
  }

})();
