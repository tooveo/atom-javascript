'use strict';

(function(){
  var options = {
    endpoint: "https://track.atom-data.io/",
    apiVersion: "V1",
    auth: "YOUR_API_KEY"
  };

  var atom    = new IronSourceAtom(options);

  var btn1  = document.getElementById('track-event'),
      btn2  = document.getElementById('track-events'),
      addData = document.getElementById('add-data');
      
  var count = document.getElementById('events-count'),
      dataInput = document.getElementById('input-data'),
      codeDisplay = document.getElementById('bulk');
  
  var data = [];
  
  // Add putEvent(params, callback) params {object}, callback {function}
  btn1.addEventListener('click', function(){
    atom.putEvent({ data: "some data",
        table: "yourStreamName",
        method: "GET"
      },
      function(res){
        console.log(res);
      }); 
  });

  // Add putEvent(params, callback) params {object}, callback {function}
  btn2.addEventListener('click', function() {
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

})();
