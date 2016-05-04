'use strict';

(function(){
  var options = {};
  var trackerOptions = {};

  var atom    = new IronSourceAtom(options);
  var atom2   = new IronSourceAtom(options);
  var tracker = new Tracker(trackerOptions);

  var btn1  = document.getElementById('track-event'),
      btn2  = document.getElementById('track-events'),
      start = document.getElementById('start'),
      stop  = document.getElementById('stop');

  var count1 = document.getElementById('events-count');
  var count2 = document.getElementById('events-queue');
  


})();
