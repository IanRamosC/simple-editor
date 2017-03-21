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
     * A function in Rendr (Rendr.getState).
     * @function getState
     * @memberof Rendr
     */
    function getState() {
      return JSON.parse(JSON.stringify(state));
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

    /**
     * A function in Rendr (Rendr.elem).
     * @function elem
     * @param {string} name - element name
     * @param {object} attrs - element attributes
     * @param {node} child - child elements
     * @memberof Rendr
     */
    function elem(name, attrs, node) {
			var el = document.createElement(name);
			if(!!node) {
				el.appendChild(node);
			}

			for(var key in attrs) {
				el.setAttribute(key, attrs[key]);
			}

			return el;
    }

    render(state);

    return {
      setState: setState,
      getState: getState,
      setRender: setRender,
			elem: elem
    };
  })();

  function addImgToCanvas(imgUrl) {
    var canvas = document.querySelector('.canvas .block');
    var img = Rendr.elem('img', {src: imgUrl});

    canvas.appendChild(img);
  }

  function createImagesList(imgList) {
    var frag = document.createDocumentFragment();

    imgList.forEach(function(url) {
      frag.appendChild(createImagesListItem(url));
    });

    return frag;
  }

  function createImagesListItem(imgUrl) {
    var li = Rendr.elem('li');
    var img = Rendr.elem('img', {"src": imgUrl, "class": "img-rounded"});

    img.addEventListener('click', function () {
			addImgToCanvas(imgUrl);
		}, false);

    li.appendChild(img);

    return li;
  }

  Rendr.setRender(function(state) {
    var sideList = document.getElementById('imagesList');
    var canvas = document.querySelector('.canvas .block');

		sideList.innerHTML = "";
    sideList.appendChild(createImagesList(state.imgList));
  });
  Rendr.setState({imgList: []});

  Request.get(ROOT_URL + "/images", function(res) {
    Rendr.setState({imgList: JSON.parse(res)});
  });

	var submit = document.getElementById('submit');
	var file = document.querySelector('[name="upload"]');

	submit.addEventListener('click', function(e) {
		var fd = new FormData();
		fd.append("upload", file.files[0]);

		Request.post(ROOT_URL + "/uploads", fd, function(res) {
			var imgList = Rendr.getState().imgList;
			var img = JSON.parse(res).file;
			Rendr.setState({imgList: imgList.concat(img)})
		});
	});

})();
