/**
 *
 * Constructs an Object with response data
 * @param {Object|String} error - Error if exist, else null
 * @param {Object|String} response - return response data or null if response failed
 * @param {Number} status - response status code
 * @constructor
 */
function Response(error, response, status) {
  this.error = error;
  this.response = response;
  this.status = status;
}

/**
 *
 * Returns the de-serialized response data.
 * @returns {Object|String} - return response data or null if response failed
 */

Response.prototype.data = function () {
  if (this.error) {
    return null;
  }
  try {
    return JSON.parse(this.response);
  } catch (e) {
    return this.response
  }
};

/**
 *
 * Returns the de-serialized response error data.
 * @returns {Object|String} - return response "error" or null if no error exists.
 */

Response.prototype.err = function () {
  try {
    return JSON.parse(this.error);
  } catch (e) {
    return this.error;
  }
};
