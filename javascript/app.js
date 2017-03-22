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

        if(key === "canvasItems") {
          localStorage.setItem(key, JSON.stringify(_state[key]));
        }
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
     * A function in Rendr (Rendr.changeStateItem).
     * @function changeStateItem
     * @param {string} itemName - the item name inside state
     * @param {obj} newItem - the new item that will replace the old item
     * @param {number} position - a position, if it's an array item that will be replaed
     * @memberof Rendr
     */
    function changeStateItem(itemName, newItem, position) {
      //Ok, this is not immutable, I'm really sorry for that
      var newStateItem = getState()[itemName];
      var newState = {};

      if(!!position) {
        newStateItem[position] = newItem;
      } else {
        newStateItem = newItem;
      }

      newState[itemName] = newStateItem;

      setState(newState);
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

    return {
      setState: setState,
      getState: getState,
      setRender: setRender,
      changeStateItem: changeStateItem,
      elem: elem
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
    var li = Rendr.elem('li');
    var img = Rendr.elem('img', {"src": imgUrl, "class": "img-rounded"});

    img.addEventListener('click', function () {
      createItemForCanvas("img", imgUrl, img.width);
    }, false);

    li.appendChild(img);

    return li;
  }

  function createItemForCanvas(type, content, width, height) {
    var items = Rendr.getState().canvasItems;
    var item = {
      type: type,
      content: content,
      top: 0,
      left: 0,
      width: width,
      height: height
    };

    Rendr.setState({canvasItems: items.concat(item)});
  };

  function createCanvasItems(items) {
    var frag = document.createDocumentFragment();

    items.forEach(function(item, i) {
      var childNode;
      var elDelete = Rendr.elem("b", {
        'class': 'element-delete'
      }, document.createTextNode("X"));

      var el = Rendr.elem("span", {
        'data-key': "drag_" + i,
        'draggable': true,
        'width': item.width || null,
        'height': item.height || null,
        'style': "top: " + item.top + "; left: " + item.left + ";"
      }, elDelete);

      if(item.type === "img") {
        childNode = Rendr.elem("img", {
          'src': item.content,
          'draggable': true,
          'width': item.width || null,
          'height': item.height || null,
        });
      } else {
        childNode = document.createTextNode(item.content);
      }

      el.append(childNode);

      el.addEventListener('dragstart', function(e) {
        var target = (e.target.nodeName === "SPAN") ? e.target : e.target.parentNode;
        var style = window.getComputedStyle(target, null);
        var dataset = [
        i,
        (parseInt(style.getPropertyValue("left"), 10) - e.clientX),
        (parseInt(style.getPropertyValue("top"), 10) - e.clientY)
        ]
        event.dataTransfer.setData("text/plain", dataset.join(','));
      }, false);

      elDelete.addEventListener('click', function(e) {
        var newItems = Rendr.getState().canvasItems.filter(function(_item, _i) {
          // returning all elements that aren't the current element.
          return _i !== i;
        });
        Rendr.setState({canvasItems: newItems});
      });

      frag.appendChild(el);
    });

    return frag;
  }

  Rendr.setRender(function(state) {
    var sideList = document.getElementById('imagesList');
    var canvas = document.querySelector('.canvas .block');

    sideList.innerHTML = "";
    sideList.appendChild(createImagesList(state.imgList));

    canvas.innerHTML = "";
    canvas.appendChild(createCanvasItems(state.canvasItems));
  });

  Rendr.setState({
    imgList: [],
    canvasItems: JSON.parse(localStorage.getItem("canvasItems")) || []
  });

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

  var addButton = document.getElementById('addText');
  var text = document.querySelector('[name="canvasText"]');

  addButton.addEventListener('click', function() {
    createItemForCanvas("text", text.value);
    text.value = "";
  });

  function dragOver(e) {
    e.preventDefault();
    return false;
  }

  function drop(e) {
    event.preventDefault();
    var offset = e.dataTransfer.getData("text/plain").split(',');
    var key = offset[0];
    var el = document.querySelector('[data-key="drag_' + key + '"]');
    var left = (e.clientX + parseInt(offset[1], 10)) + 'px';
    var top = (e.clientY + parseInt(offset[2], 10)) + 'px';

    el.style.left = left;
    el.style.top = top;

    var newItem = Rendr.getState().canvasItems[key];
    newItem.top = top;
    newItem.left = left;
    Rendr.changeStateItem("canvasItems", newItem, key);

    return false;
  }

  var canvas = document.querySelector('.canvas .block');
  canvas.addEventListener('dragover', dragOver, false);
  canvas.addEventListener('drop', drop, false);
})();
