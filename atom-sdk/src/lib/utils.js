/**
 * Helper function for sending tracker bulks to Atom.
 * @param tasks - array of functions with a callback(err,data,status)
 * @param callback - the final callback that will be called when all tasks are done
 */

function taskMap(tasks, callback) {
  var results = [];
  var inFlight = tasks.length;

  function _handleTask(task, i) {
    task(function (err, data, status) {
      results[i] = {
        "err": err,
        "data": data,
        "status": status
      };
      // If all tasks are done we use the callback
      if (--inFlight === 0) {
        return callback(results)
      }
    });
  }

  for (var i = 0; i < tasks.length; i++) {
    _handleTask(tasks[i], i)
  }
}