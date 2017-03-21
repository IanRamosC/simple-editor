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
     * @memberof Request
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
     * @memberof Request
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

  /**
   * Rendr
   * @namespace
   */
  var Rendr = (function() {
    var state = {};
    var render = function() {};

    /**
     * A function in Rendr (Rendr.setState).
     * @function setState
     * @param {obj} _state - an object describing what how state should change
     * @memberof Rendr
     */
    function setState(_state) {
      for(var key in _state) {
        state[key] = _state[key];
      }
      render(state);
    }

    /**
     * A function in Rendr (Rendr.setRender).
     * @function setRender
     * @param {function} _renderFunc - a function that will be executed everytime state changes
     * @memberof Rendr
     */
    function setRender(_renderFunc) {
      render = _renderFunc;
    }

    render(state);

    return {
      setState: setState,
      setRender: setRender
    };
  })();

  function createImagesList(imgList) {
    var frag = document.createDocumentFragment();

    imgList.forEach(function(url) {
      frag.appendChild(createImagesListItem(url));
    });

    return frag;
  }

  function createImagesListItem(imgUrl) {
    var li = document.createElement('li');
    var img = document.createElement('img');

    img.src = imgUrl;
    img.className = "img-rounded";

    li.appendChild(img);

    return li;
  }

  Rendr.setRender(function(state) {
    var list = document.getElementById('imagesList');
    list.appendChild(createImagesList(state.imgList));
  });
  Rendr.setState({imgList: []});

  Request.get(ROOT_URL + "/images", function(res) {
    Rendr.setState({imgList: JSON.parse(res)});
  });

})();
