(function() {
  'use strict';
  /**
   * @const ROOT_URL - the root url for all requests
   */
  var ROOT_URL = "http://localhost:8000";

  /**
   * Request
   * @namespace
   */
  var Request = (function() {
    /**
     * A function in request (request.get).
     * @function get
     * @param {string} url
     * @param {function} onSuccess - success callback
     * @param {function} onError - error callback
     * @memberof request
     */
    var get = function(url, onSuccess, onError) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);

      xhr.onload = function () {
        if(xhr.readyState === 4) {
          onSuccess(xhr.response);
        }
      };
      xhr.onerror = onError;

      xhr.send();
    };

    /**
     * A function in Request (Request.post).
     * @function post
     * @param {string} url
     * @param {object} data
     * @param {function} onSuccess - success callback
     * @param {function} onError - error callback
     * @memberof request
     */
    var post = function(url, data, onSuccess, onError) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);

      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

      xhr.onload = function () {
        if(xhr.readyState === 4) {
          onSuccess(xhr.response);
        }
      };
      xhr.onerror = onError;

      xhr.send(data);
    };

    return {
      get: get,
      post: post
    };
  })();
})();
