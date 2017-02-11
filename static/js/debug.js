(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = {
	Footer: require('./views/templates/Footer'),
	Header: require('./views/templates/Header'),
	Home: require('./views/templates/Home'),
	ItemList: require('./views/templates/ItemList'),
	MediaObject: require('./views/templates/MediaObject'),
	SiteNavigationElement: require('./views/templates/SiteNavigationElement')
};

},{"./views/templates/Footer":18,"./views/templates/Header":19,"./views/templates/Home":20,"./views/templates/ItemList":21,"./views/templates/MediaObject":22,"./views/templates/SiteNavigationElement":23}],2:[function(require,module,exports){
'use strict';

module.exports = {
	Footer: require('./views/Footer'),
	Header: require('./views/Header'),
	Home: require('./views/Home'),
	ItemList: require('./views/ItemList'),
	MediaObject: require('./views/MediaObject'),
	SiteNavigationElement: require('./views/SiteNavigationElement')
};

},{"./views/Footer":10,"./views/Header":11,"./views/Home":12,"./views/ItemList":13,"./views/MediaObject":14,"./views/SiteNavigationElement":15}],3:[function(require,module,exports){
window.cookieName = 'hazy'

},{}],4:[function(require,module,exports){
'use strict';

module.exports = Object.create(Object.assign({}, require('../../lib/MyObject'), {

    Request: {
        constructor: function constructor(data) {
            var _this = this;

            var req = new XMLHttpRequest();

            return new Promise(function (resolve, reject) {

                req.onload = function () {
                    [500, 404, 401].includes(this.status) ? reject(this.response) : resolve(JSON.parse(this.response));
                };

                if (data.method === "get") {
                    var qs = data.qs ? '?' + data.qs : '';
                    req.open(data.method, '/' + data.resource + qs);
                    _this.setHeaders(req, data.headers);
                    req.send(null);
                } else {
                    req.open(data.method, '/' + data.resource, true);
                    _this.setHeaders(req, data.headers);
                    req.send(data.data);
                }
            });
        },
        plainEscape: function plainEscape(sText) {
            /* how should I treat a text/plain form encoding? what characters are not allowed? this is what I suppose...: */
            /* "4\3\7 - Einstein said E=mc2" ----> "4\\3\\7\ -\ Einstein\ said\ E\=mc2" */
            return sText.replace(/[\s\=\\]/g, "\\$&");
        },
        setHeaders: function setHeaders(req) {
            var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            req.setRequestHeader("Accept", headers.accept || 'application/json');
            req.setRequestHeader("Content-Type", 'text/plain');
        }
    },

    _factory: function _factory(data) {
        return Object.create(this.Request, {}).constructor(data);
    },
    constructor: function constructor() {

        if (!XMLHttpRequest.prototype.sendAsBinary) {
            XMLHttpRequest.prototype.sendAsBinary = function (sData) {
                var nBytes = sData.length,
                    ui8Data = new Uint8Array(nBytes);
                for (var nIdx = 0; nIdx < nBytes; nIdx++) {
                    ui8Data[nIdx] = sData.charCodeAt(nIdx) & 0xff;
                }
                this.send(ui8Data);
            };
        }

        return this._factory.bind(this);
    }
}), {}).constructor();

},{"../../lib/MyObject":25}],5:[function(require,module,exports){
'use strict';

module.exports = Object.create({
    create: function create(name, opts) {
        name = name.charAt(0).toUpperCase() + name.slice(1);
        return Object.create(this.Views[name], Object.assign({
            name: { value: name },
            factory: { value: this },
            template: { value: this.Templates[name] },
            user: { value: this.User }
        }, opts)).constructor().on('navigate', function (route) {
            return require('../router').navigate(route);
        });
    }
}, {
    Templates: { value: require('../.TemplateMap') },
    User: { value: require('../models/User') },
    Views: { value: require('../.ViewMap') }
});

},{"../.TemplateMap":1,"../.ViewMap":2,"../models/User":7,"../router":9}],6:[function(require,module,exports){
'use strict';

window.onload = function () {
    require('./.env');
    require('./router').initialize();
};

},{"./.env":3,"./router":9}],7:[function(require,module,exports){
'use strict';

module.exports = Object.create(require('./__proto__.js'), { resource: { value: 'me' } });

},{"./__proto__.js":8}],8:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('../../../lib/MyObject'), require('events').EventEmitter.prototype, {

    Xhr: require('../Xhr'),

    get: function get() {
        var _this = this;

        var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        return this.Xhr({ method: 'get', resource: this.resource, headers: this.headers || {}, qs: opts.query ? JSON.stringify(opts.query) : undefined }).then(function (response) {
            return Promise.resolve(_this.data = response);
        });
    }
});

},{"../../../lib/MyObject":25,"../Xhr":4,"events":26}],9:[function(require,module,exports){
'use strict';

module.exports = Object.create({

    Error: require('../../lib/MyError'),

    User: require('./models/User'),

    ViewFactory: require('./factory/View'),

    initialize: function initialize() {
        var _this = this;

        this.contentContainer = document.querySelector('#content');

        window.onpopstate = this.handle.bind(this);

        this.header = this.ViewFactory.create('header', { insertion: { value: { el: this.contentContainer, method: 'insertBefore' } } });
        this.footer = this.ViewFactory.create('footer', { insertion: { value: { el: this.contentContainer.parentNode } } });

        this.User.get().then(function () {

            _this.header.onUser().on('signout', function () {
                return Promise.all(Object.keys(_this.views).map(function (name) {
                    return _this.views[name].delete();
                })).then(function () {
                    return _this.navigate('home');
                });
            });

            _this.handle();
        }).catch(this.Error);

        return this;
    },
    handle: function handle() {
        this.handler(window.location.pathname.split('/').slice(1));
    },
    handler: function handler(path) {
        var view = /verify/.test(path) ? 'verify' : 'home';

        if (this.views[view]) return this.views[view].navigate(path);

        return Promise.resolve(this.views[view] = this.ViewFactory.create(view, {
            insertion: { value: { el: this.contentContainer } },
            path: { value: path, writable: true }
        }));
    },
    navigate: function navigate(location) {
        history.pushState({}, '', location);
        this.handle();
    }
}, { views: { value: {} } });

},{"../../lib/MyError":24,"./factory/View":5,"./models/User":7}],10:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {});

},{"./__proto__":16}],11:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {

    events: {
        signoutBtn: 'click'
    },

    onUser: function onUser() {
        return this;
    },
    postRender: function postRender() {
        this.fetchAndDisplay().catch(this.Error);
        return this;
    },


    requiresLogin: false,

    signout: function signout() {

        document.cookie = window.cookieName + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

        this.user.data = {};

        this.emit('signout');
    },


    type: 'WebPageElement'

});

},{"./__proto__":16}],12:[function(require,module,exports){
"use strict";

module.exports = Object.assign({}, require('./__proto__'), {
    fetchAndDisplay: function fetchAndDisplay() {
        var _this = this;

        return this.getData().then(function () {
            return _this.views[_this.model.data["@type"]] = _this.factory.create(_this.model.data["@type"], { insertion: { value: { el: _this.els.subView } }, model: { value: _this.model } });
        });
    },
    getData: function getData() {
        if (!this.model) this.model = Object.create(this.Model);

        this.model.resource = this.path.length ? this.path.join('/') : '';
        return this.model.get();
    },
    navigate: function navigate(path) {
        var _this2 = this;

        this.path = path;

        (this.model ? this.views[this.model.data["@type"]].delete() : Promise.resolve()).then(function () {
            return _this2.fetchAndDisplay();
        }).catch(this.Error);
    },
    postRender: function postRender() {
        //this.fetchAndDisplay().catch( this.Error )
        return this;
    }
});

},{"./__proto__":16}],13:[function(require,module,exports){
"use strict";

module.exports = Object.assign({}, require('./__proto__'), {
    postRender: function postRender() {
        var _this = this;

        var children = this.els.container.children;
        this.model.data.itemListElement.forEach(function (item, i) {
            return _this.factory.create(item["@type"], { insertion: { value: { el: children[i] } }, model: { value: { data: item } } });
        });

        return this;
    }
});

},{"./__proto__":16}],14:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {});

},{"./__proto__":16}],15:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {});

},{"./__proto__":16}],16:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = Object.assign({}, require('../../../lib/MyObject'), require('events').EventEmitter.prototype, {

    Model: require('../models/__proto__.js'),

    OptimizedResize: require('./lib/OptimizedResize'),

    Xhr: require('../Xhr'),

    bindEvent: function bindEvent(key, event) {
        var _this = this;

        var els = Array.isArray(this.els[key]) ? this.els[key] : [this.els[key]];
        els.forEach(function (el) {
            return el.addEventListener(event || 'click', function (e) {
                return _this['on' + _this.capitalizeFirstLetter(key) + _this.capitalizeFirstLetter(event)](e);
            });
        });
    },


    capitalizeFirstLetter: function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    constructor: function constructor() {

        if (this.size) this.OptimizedResize.add(this.size);

        if (this.requiresLogin && (!this.user.data || !this.user.data.id)) return this.handleLogin();

        if (this.user.data && this.user.data.id && this.requiresRole && !this.hasPrivileges()) return this.showNoAccess();

        return Object.assign(this, { els: {}, slurp: { attr: 'data-js', view: 'data-view' }, views: {} }).render();
    },
    delegateEvents: function delegateEvents(key, el) {
        var _this2 = this;

        var type = _typeof(this.events[key]);

        if (type === "string") {
            this.bindEvent(key, this.events[key]);
        } else if (Array.isArray(this.events[key])) {
            this.events[key].forEach(function (eventObj) {
                return _this2.bindEvent(key, eventObj.event);
            });
        } else {
            this.bindEvent(key, this.events[key].event);
        }
    },
    delete: function _delete(duration) {
        var _this3 = this;

        return new Promise(function (resolve) {
            _this3.els.container.classList.add('hide');
            _this3.els.container.addEventListener('transitionend', function (e) {
                _this3.els.container.parentNode.removeChild(_this3.els.container);
                resolve(_this3.emit('removed'));
            }, true);
        });
    },


    events: {},

    fetchAndDisplay: function fetchAndDisplay() {
        var _this4 = this;

        return this.getData().then(function () {
            return _this4.factory.create(_this4.model.data.mainEntity["@type"], { insertion: { value: { el: _this4.els.container } }, model: { value: { data: _this4.model.data.mainEntity } } });
        });
    },
    getData: function getData() {
        if (!this.model) this.model = Object.create(this.Model, { resource: { value: this.type }, headers: { value: { accept: 'application/ld+json' } } });

        return this.model.get({ query: { name: this.name } });
    },
    getTemplateOptions: function getTemplateOptions() {
        return this.model ? this.model.data : {};
    },
    handleLogin: function handleLogin() {
        var _this5 = this;

        this.factory.create('login', { insertion: { value: { el: document.querySelector('#content') } } }).once("loggedIn", function () {
            return _this5.onLogin();
        });

        return this;
    },
    hasPrivilege: function hasPrivilege() {
        var _this6 = this;

        this.requiresRole && this.user.get('roles').find(function (role) {
            return role === _this6.requiresRole;
        }) === "undefined" ? false : true;
    },
    htmlToFragment: function htmlToFragment(str) {
        var range = document.createRange();
        // make the parent of the first div in the document becomes the context node
        range.selectNode(document.getElementsByTagName("div").item(0));
        return range.createContextualFragment(str);
    },
    isHidden: function isHidden() {
        return this.els.container.css('display') === 'none';
    },
    onLogin: function onLogin() {
        this.router.header.onUser(this.user);

        this[this.hasPrivileges() ? 'render' : 'showNoAccess']();
    },
    showNoAccess: function showNoAccess() {
        alert("No privileges, son");
        return this;
    },
    postRender: function postRender() {
        return this;
    },
    render: function render() {
        this.slurpTemplate({ template: this.template(this.getTemplateOptions()), insertion: this.insertion });

        if (this.size) this.size();

        return this.renderSubviews().postRender();
    },
    renderSubviews: function renderSubviews() {
        var _this7 = this;

        Object.keys(this.Views || []).forEach(function (key) {
            if (_this7.Views[key].el) {
                var opts = _this7.Views[key].opts;

                opts = opts ? (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) === "object" ? opts : opts() : {};

                _this7.views[key] = _this7.factory.create(key, Object.assign({ insertion: { value: { el: _this7.Views[key].el, method: 'insertBefore' } } }, opts));
                _this7.Views[key].el.remove();
                _this7.Views[key].el = undefined;
            }
        });

        return this;
    },
    show: function show(duration) {
        var _this8 = this;

        return new Promise(function (resolve, reject) {
            return _this8.els.container.show(duration || 10, function () {
                if (_this8.size) {
                    _this8.size();
                }resolve();
            });
        });
    },
    slurpEl: function slurpEl(el) {
        var key = el.getAttribute(this.slurp.attr) || 'container';

        if (key === 'container') {
            el.classList.add(this.name);
            if (this.model && this.model.data && this.model.data.name) el.classList.add(this.model.data.name);
        }

        this.els[key] = Array.isArray(this.els[key]) ? this.els[key].push(el) : this.els[key] !== undefined ? [this.els[key], el] : el;

        el.removeAttribute(this.slurp.attr);

        if (this.events[key]) this.delegateEvents(key, el);
    },
    slurpTemplate: function slurpTemplate(options) {
        var _this9 = this;

        var fragment = this.htmlToFragment(options.template),
            selector = '[' + this.slurp.attr + ']',
            viewSelector = '[' + this.slurp.view + ']';

        this.slurpEl(fragment.querySelector('*'));
        fragment.querySelectorAll(selector + ', ' + viewSelector).forEach(function (el) {
            return el.hasAttribute(_this9.slurp.attr) ? _this9.slurpEl(el) : _this9.Views[el.getAttribute(_this9.slurp.view)].el = el;
        });

        options.insertion.method === 'insertBefore' ? options.insertion.el.parentNode.insertBefore(fragment, options.insertion.el) : options.insertion.el[options.insertion.method || 'appendChild'](fragment);

        return this;
    },
    isMouseOnEl: function isMouseOnEl(event, el) {

        var elOffset = el.offset(),
            elHeight = el.outerHeight(true),
            elWidth = el.outerWidth(true);

        if (event.pageX < elOffset.left || event.pageX > elOffset.left + elWidth || event.pageY < elOffset.top || event.pageY > elOffset.top + elHeight) {

            return false;
        }

        return true;
    },


    requiresLogin: false

});

},{"../../../lib/MyObject":25,"../Xhr":4,"../models/__proto__.js":8,"./lib/OptimizedResize":17,"events":26}],17:[function(require,module,exports){
'use strict';

module.exports = Object.create({
    add: function add(callback) {
        if (!this.callbacks.length) window.addEventListener('resize', this.onResize);
        this.callbacks.push(callback);
    },
    onResize: function onResize() {
        if (this.running) return;

        this.running = true;

        window.requestAnimationFrame ? window.requestAnimationFrame(this.runCallbacks) : setTimeout(this.runCallbacks, 66);
    },
    runCallbacks: function runCallbacks() {
        this.callbacks = this.callbacks.filter(function (callback) {
            return callback();
        });
        this.running = false;
    }
}, { callbacks: { value: [] }, running: { value: false } }).add;

},{}],18:[function(require,module,exports){
"use strict";

module.exports = function (p) {
  return "<footer></footer>";
};

},{}],19:[function(require,module,exports){
"use strict";

module.exports = function (p) {
  return "<header></header>";
};

},{}],20:[function(require,module,exports){
"use strict";

module.exports = function (p) {
    return "<div>\n    <div data-js=\"subView\"></div>\n</div>";
};

},{}],21:[function(require,module,exports){
'use strict';

module.exports = function (p) {
  return '<ul>' + Array.from(Array(p.itemListElement.length).keys()).map(function (n) {
    return '<li></li>';
  }).join('') + '</ul>';
};

},{}],22:[function(require,module,exports){
"use strict";

module.exports = function (p) {
  return "<img src=\"" + p.contentUrl + "\" />";
};

},{}],23:[function(require,module,exports){
"use strict";

module.exports = function (p) {
  return "<div>" + p.name + "</div>";
};

},{}],24:[function(require,module,exports){
"use strict";

module.exports = function (err) {
  console.log(err.stack || err);
};

},{}],25:[function(require,module,exports){
'use strict';

module.exports = {

    Error: require('./MyError'),

    P: function P(fun) {
        var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var thisArg = arguments[2];
        return new Promise(function (resolve, reject) {
            return Reflect.apply(fun, thisArg || undefined, args.concat(function (e) {
                for (var _len = arguments.length, callback = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    callback[_key - 1] = arguments[_key];
                }

                return e ? reject(e) : resolve(callback);
            }));
        });
    },

    constructor: function constructor() {
        return this;
    }
};

},{"./MyError":24}],26:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvanMvLlRlbXBsYXRlTWFwLmpzIiwiY2xpZW50L2pzLy5WaWV3TWFwLmpzIiwiY2xpZW50L2pzLy5lbnYiLCJjbGllbnQvanMvWGhyLmpzIiwiY2xpZW50L2pzL2ZhY3RvcnkvVmlldy5qcyIsImNsaWVudC9qcy9tYWluLmpzIiwiY2xpZW50L2pzL21vZGVscy9Vc2VyLmpzIiwiY2xpZW50L2pzL21vZGVscy9fX3Byb3RvX18uanMiLCJjbGllbnQvanMvcm91dGVyLmpzIiwiY2xpZW50L2pzL3ZpZXdzL0Zvb3Rlci5qcyIsImNsaWVudC9qcy92aWV3cy9IZWFkZXIuanMiLCJjbGllbnQvanMvdmlld3MvSG9tZS5qcyIsImNsaWVudC9qcy92aWV3cy9JdGVtTGlzdC5qcyIsImNsaWVudC9qcy92aWV3cy9NZWRpYU9iamVjdC5qcyIsImNsaWVudC9qcy92aWV3cy9TaXRlTmF2aWdhdGlvbkVsZW1lbnQuanMiLCJjbGllbnQvanMvdmlld3MvX19wcm90b19fLmpzIiwiY2xpZW50L2pzL3ZpZXdzL2xpYi9PcHRpbWl6ZWRSZXNpemUuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL0Zvb3Rlci5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvSGVhZGVyLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9Ib21lLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9JdGVtTGlzdC5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvTWVkaWFPYmplY3QuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL1NpdGVOYXZpZ2F0aW9uRWxlbWVudC5qcyIsImxpYi9NeUVycm9yLmpzIiwibGliL015T2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE9BQU8sT0FB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzPXtcblx0Rm9vdGVyOiByZXF1aXJlKCcuL3ZpZXdzL3RlbXBsYXRlcy9Gb290ZXInKSxcblx0SGVhZGVyOiByZXF1aXJlKCcuL3ZpZXdzL3RlbXBsYXRlcy9IZWFkZXInKSxcblx0SG9tZTogcmVxdWlyZSgnLi92aWV3cy90ZW1wbGF0ZXMvSG9tZScpLFxuXHRJdGVtTGlzdDogcmVxdWlyZSgnLi92aWV3cy90ZW1wbGF0ZXMvSXRlbUxpc3QnKSxcblx0TWVkaWFPYmplY3Q6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL01lZGlhT2JqZWN0JyksXG5cdFNpdGVOYXZpZ2F0aW9uRWxlbWVudDogcmVxdWlyZSgnLi92aWV3cy90ZW1wbGF0ZXMvU2l0ZU5hdmlnYXRpb25FbGVtZW50Jylcbn0iLCJtb2R1bGUuZXhwb3J0cz17XG5cdEZvb3RlcjogcmVxdWlyZSgnLi92aWV3cy9Gb290ZXInKSxcblx0SGVhZGVyOiByZXF1aXJlKCcuL3ZpZXdzL0hlYWRlcicpLFxuXHRIb21lOiByZXF1aXJlKCcuL3ZpZXdzL0hvbWUnKSxcblx0SXRlbUxpc3Q6IHJlcXVpcmUoJy4vdmlld3MvSXRlbUxpc3QnKSxcblx0TWVkaWFPYmplY3Q6IHJlcXVpcmUoJy4vdmlld3MvTWVkaWFPYmplY3QnKSxcblx0U2l0ZU5hdmlnYXRpb25FbGVtZW50OiByZXF1aXJlKCcuL3ZpZXdzL1NpdGVOYXZpZ2F0aW9uRWxlbWVudCcpXG59Iiwid2luZG93LmNvb2tpZU5hbWUgPSAnaGF6eSdcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSggT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4uLy4uL2xpYi9NeU9iamVjdCcpLCB7XG5cbiAgICBSZXF1ZXN0OiB7XG5cbiAgICAgICAgY29uc3RydWN0b3IoIGRhdGEgKSB7XG4gICAgICAgICAgICBsZXQgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+IHtcblxuICAgICAgICAgICAgICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgWyA1MDAsIDQwNCwgNDAxIF0uaW5jbHVkZXMoIHRoaXMuc3RhdHVzIClcbiAgICAgICAgICAgICAgICAgICAgICAgID8gcmVqZWN0KCB0aGlzLnJlc3BvbnNlIClcbiAgICAgICAgICAgICAgICAgICAgICAgIDogcmVzb2x2ZSggSlNPTi5wYXJzZSh0aGlzLnJlc3BvbnNlKSApXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoIGRhdGEubWV0aG9kID09PSBcImdldFwiICkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcXMgPSBkYXRhLnFzID8gYD8ke2RhdGEucXN9YCA6ICcnIFxuICAgICAgICAgICAgICAgICAgICByZXEub3BlbiggZGF0YS5tZXRob2QsIGAvJHtkYXRhLnJlc291cmNlfSR7cXN9YCApXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0SGVhZGVycyggcmVxLCBkYXRhLmhlYWRlcnMgKVxuICAgICAgICAgICAgICAgICAgICByZXEuc2VuZChudWxsKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcS5vcGVuKCBkYXRhLm1ldGhvZCwgYC8ke2RhdGEucmVzb3VyY2V9YCwgdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRIZWFkZXJzKCByZXEsIGRhdGEuaGVhZGVycyApXG4gICAgICAgICAgICAgICAgICAgIHJlcS5zZW5kKCBkYXRhLmRhdGEgKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKVxuICAgICAgICB9LFxuXG4gICAgICAgIHBsYWluRXNjYXBlKCBzVGV4dCApIHtcbiAgICAgICAgICAgIC8qIGhvdyBzaG91bGQgSSB0cmVhdCBhIHRleHQvcGxhaW4gZm9ybSBlbmNvZGluZz8gd2hhdCBjaGFyYWN0ZXJzIGFyZSBub3QgYWxsb3dlZD8gdGhpcyBpcyB3aGF0IEkgc3VwcG9zZS4uLjogKi9cbiAgICAgICAgICAgIC8qIFwiNFxcM1xcNyAtIEVpbnN0ZWluIHNhaWQgRT1tYzJcIiAtLS0tPiBcIjRcXFxcM1xcXFw3XFwgLVxcIEVpbnN0ZWluXFwgc2FpZFxcIEVcXD1tYzJcIiAqL1xuICAgICAgICAgICAgcmV0dXJuIHNUZXh0LnJlcGxhY2UoL1tcXHNcXD1cXFxcXS9nLCBcIlxcXFwkJlwiKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRIZWFkZXJzKCByZXEsIGhlYWRlcnM9e30gKSB7XG4gICAgICAgICAgICByZXEuc2V0UmVxdWVzdEhlYWRlciggXCJBY2NlcHRcIiwgaGVhZGVycy5hY2NlcHQgfHwgJ2FwcGxpY2F0aW9uL2pzb24nIClcbiAgICAgICAgICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsICd0ZXh0L3BsYWluJyApXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX2ZhY3RvcnkoIGRhdGEgKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlKCB0aGlzLlJlcXVlc3QsIHsgfSApLmNvbnN0cnVjdG9yKCBkYXRhIClcbiAgICB9LFxuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgaWYoICFYTUxIdHRwUmVxdWVzdC5wcm90b3R5cGUuc2VuZEFzQmluYXJ5ICkge1xuICAgICAgICAgIFhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5zZW5kQXNCaW5hcnkgPSBmdW5jdGlvbihzRGF0YSkge1xuICAgICAgICAgICAgdmFyIG5CeXRlcyA9IHNEYXRhLmxlbmd0aCwgdWk4RGF0YSA9IG5ldyBVaW50OEFycmF5KG5CeXRlcyk7XG4gICAgICAgICAgICBmb3IgKHZhciBuSWR4ID0gMDsgbklkeCA8IG5CeXRlczsgbklkeCsrKSB7XG4gICAgICAgICAgICAgIHVpOERhdGFbbklkeF0gPSBzRGF0YS5jaGFyQ29kZUF0KG5JZHgpICYgMHhmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2VuZCh1aThEYXRhKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZhY3RvcnkuYmluZCh0aGlzKVxuICAgIH1cblxufSApLCB7IH0gKS5jb25zdHJ1Y3RvcigpXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIHtcblxuICAgIGNyZWF0ZSggbmFtZSwgb3B0cyApIHtcbiAgICAgICAgbmFtZSA9IG5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnNsaWNlKDEpXG4gICAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlKFxuICAgICAgICAgICAgdGhpcy5WaWV3c1sgbmFtZSBdLFxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbigge1xuICAgICAgICAgICAgICAgIG5hbWU6IHsgdmFsdWU6IG5hbWUgfSxcbiAgICAgICAgICAgICAgICBmYWN0b3J5OiB7IHZhbHVlOiB0aGlzIH0sXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IHsgdmFsdWU6IHRoaXMuVGVtcGxhdGVzWyBuYW1lIF0gfSxcbiAgICAgICAgICAgICAgICB1c2VyOiB7IHZhbHVlOiB0aGlzLlVzZXIgfVxuICAgICAgICAgICAgICAgIH0sIG9wdHMgKVxuICAgICAgICApLmNvbnN0cnVjdG9yKClcbiAgICAgICAgLm9uKCAnbmF2aWdhdGUnLCByb3V0ZSA9PiByZXF1aXJlKCcuLi9yb3V0ZXInKS5uYXZpZ2F0ZSggcm91dGUgKSApXG4gICAgfSxcblxufSwge1xuICAgIFRlbXBsYXRlczogeyB2YWx1ZTogcmVxdWlyZSgnLi4vLlRlbXBsYXRlTWFwJykgfSxcbiAgICBVc2VyOiB7IHZhbHVlOiByZXF1aXJlKCcuLi9tb2RlbHMvVXNlcicgKSB9LFxuICAgIFZpZXdzOiB7IHZhbHVlOiByZXF1aXJlKCcuLi8uVmlld01hcCcpIH1cbn0gKVxuIiwid2luZG93Lm9ubG9hZCA9ICgpID0+IHtcbiAgICByZXF1aXJlKCcuLy5lbnYnKVxuICAgIHJlcXVpcmUoJy4vcm91dGVyJykuaW5pdGlhbGl6ZSgpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIHJlcXVpcmUoJy4vX19wcm90b19fLmpzJyksIHsgcmVzb3VyY2U6IHsgdmFsdWU6ICdtZScgfSB9IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbiggeyB9LCByZXF1aXJlKCcuLi8uLi8uLi9saWIvTXlPYmplY3QnKSwgcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyLnByb3RvdHlwZSwge1xuXG4gICAgWGhyOiByZXF1aXJlKCcuLi9YaHInKSxcblxuICAgIGdldCggb3B0cz17fSApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuWGhyKCB7IG1ldGhvZDogJ2dldCcsIHJlc291cmNlOiB0aGlzLnJlc291cmNlLCBoZWFkZXJzOiB0aGlzLmhlYWRlcnMgfHwge30sIHFzOiBvcHRzLnF1ZXJ5ID8gSlNPTi5zdHJpbmdpZnkoIG9wdHMucXVlcnkgKSA6IHVuZGVmaW5lZCB9IClcbiAgICAgICAgLnRoZW4oIHJlc3BvbnNlID0+IFByb21pc2UucmVzb2x2ZSggdGhpcy5kYXRhID0gcmVzcG9uc2UgKSApXG4gICAgfVxuXG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSgge1xuXG4gICAgRXJyb3I6IHJlcXVpcmUoJy4uLy4uL2xpYi9NeUVycm9yJyksXG4gICAgXG4gICAgVXNlcjogcmVxdWlyZSgnLi9tb2RlbHMvVXNlcicpLFxuXG4gICAgVmlld0ZhY3Rvcnk6IHJlcXVpcmUoJy4vZmFjdG9yeS9WaWV3JyksXG5cbiAgICBpbml0aWFsaXplKCkge1xuICAgICAgICB0aGlzLmNvbnRlbnRDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY29udGVudCcpXG5cbiAgICAgICAgd2luZG93Lm9ucG9wc3RhdGUgPSB0aGlzLmhhbmRsZS5iaW5kKHRoaXMpXG5cbiAgICAgICAgdGhpcy5oZWFkZXIgPSB0aGlzLlZpZXdGYWN0b3J5LmNyZWF0ZSggJ2hlYWRlcicsIHsgaW5zZXJ0aW9uOiB7IHZhbHVlOiB7IGVsOiB0aGlzLmNvbnRlbnRDb250YWluZXIsIG1ldGhvZDogJ2luc2VydEJlZm9yZScgfSB9IH0gKVxuICAgICAgICB0aGlzLmZvb3RlciA9IHRoaXMuVmlld0ZhY3RvcnkuY3JlYXRlKCAnZm9vdGVyJywgeyBpbnNlcnRpb246IHsgdmFsdWU6IHsgZWw6IHRoaXMuY29udGVudENvbnRhaW5lci5wYXJlbnROb2RlIH0gfSB9IClcblxuICAgICAgICB0aGlzLlVzZXIuZ2V0KCkudGhlbiggKCkgPT4ge1xuICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuaGVhZGVyLm9uVXNlcigpXG4gICAgICAgICAgICAub24oICdzaWdub3V0JywgKCkgPT4gXG4gICAgICAgICAgICAgICAgUHJvbWlzZS5hbGwoIE9iamVjdC5rZXlzKCB0aGlzLnZpZXdzICkubWFwKCBuYW1lID0+IHRoaXMudmlld3NbIG5hbWUgXS5kZWxldGUoKSApIClcbiAgICAgICAgICAgICAgICAudGhlbiggKCkgPT4gdGhpcy5uYXZpZ2F0ZSggJ2hvbWUnICkgKVxuICAgICAgICAgICAgKVxuXG4gICAgICAgICAgICB0aGlzLmhhbmRsZSgpXG5cbiAgICAgICAgfSApLmNhdGNoKCB0aGlzLkVycm9yIClcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICBoYW5kbGUoKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlciggd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykuc2xpY2UoMSkgKVxuICAgIH0sXG5cbiAgICBoYW5kbGVyKCBwYXRoICkge1xuICAgICAgICBjb25zdCB2aWV3ID0gL3ZlcmlmeS8udGVzdCggcGF0aCApID8gJ3ZlcmlmeScgOiAnaG9tZSdcblxuICAgICAgICBpZiggdGhpcy52aWV3c1sgdmlldyBdICkgcmV0dXJuIHRoaXMudmlld3NbIHZpZXcgXS5uYXZpZ2F0ZSggcGF0aCApXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFxuICAgICAgICAgICAgdGhpcy52aWV3c1sgdmlldyBdID1cbiAgICAgICAgICAgICAgICB0aGlzLlZpZXdGYWN0b3J5LmNyZWF0ZSggdmlldywge1xuICAgICAgICAgICAgICAgICAgICBpbnNlcnRpb246IHsgdmFsdWU6IHsgZWw6IHRoaXMuY29udGVudENvbnRhaW5lciB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IHsgdmFsdWU6IHBhdGgsIHdyaXRhYmxlOiB0cnVlIH1cbiAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgKVxuICAgIH0sXG5cbiAgICBuYXZpZ2F0ZSggbG9jYXRpb24gKSB7XG4gICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKCB7fSwgJycsIGxvY2F0aW9uIClcbiAgICAgICAgdGhpcy5oYW5kbGUoKVxuICAgIH1cblxufSwgeyB2aWV3czogeyB2YWx1ZTogeyB9IH0gfSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4vX19wcm90b19fJyksIHtcblxuICAgIGV2ZW50czoge1xuICAgICAgICBzaWdub3V0QnRuOiAnY2xpY2snXG4gICAgfSxcblxuICAgIG9uVXNlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgcG9zdFJlbmRlcigpIHtcbiAgICAgICAgdGhpcy5mZXRjaEFuZERpc3BsYXkoKS5jYXRjaCggdGhpcy5FcnJvciApXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIHJlcXVpcmVzTG9naW46IGZhbHNlLFxuICAgIFxuICAgIHNpZ25vdXQoKSB7XG5cbiAgICAgICAgZG9jdW1lbnQuY29va2llID0gYCR7d2luZG93LmNvb2tpZU5hbWV9PTsgZXhwaXJlcz1UaHUsIDAxIEphbiAxOTcwIDAwOjAwOjAxIEdNVDtgO1xuXG4gICAgICAgIHRoaXMudXNlci5kYXRhID0geyB9XG5cbiAgICAgICAgdGhpcy5lbWl0KCdzaWdub3V0JylcblxuICAgIH0sXG5cbiAgICB0eXBlOiAnV2ViUGFnZUVsZW1lbnQnXG5cbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18nKSwge1xuXG4gICAgZmV0Y2hBbmREaXNwbGF5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXREYXRhKClcbiAgICAgICAgLnRoZW4oICgpID0+IFxuICAgICAgICAgICAgdGhpcy52aWV3c1sgdGhpcy5tb2RlbC5kYXRhW1wiQHR5cGVcIl0gXSA9XG4gICAgICAgICAgICAgICAgdGhpcy5mYWN0b3J5LmNyZWF0ZSggdGhpcy5tb2RlbC5kYXRhW1wiQHR5cGVcIl0sIHsgaW5zZXJ0aW9uOiB7IHZhbHVlOiB7IGVsOiB0aGlzLmVscy5zdWJWaWV3IH0gfSwgbW9kZWw6IHsgdmFsdWU6IHRoaXMubW9kZWwgfSB9IClcbiAgICAgICAgKVxuICAgIH0sXG5cbiAgICBnZXREYXRhKCkge1xuICAgICAgICBpZiggIXRoaXMubW9kZWwgKSB0aGlzLm1vZGVsID0gT2JqZWN0LmNyZWF0ZSggdGhpcy5Nb2RlbCApXG5cbiAgICAgICAgdGhpcy5tb2RlbC5yZXNvdXJjZSA9IHRoaXMucGF0aC5sZW5ndGggPyB0aGlzLnBhdGguam9pbignLycpIDogJydcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZWwuZ2V0KClcbiAgICB9LFxuXG4gICAgbmF2aWdhdGUoIHBhdGggKSB7XG4gICAgICAgIHRoaXMucGF0aCA9IHBhdGg7XG5cbiAgICAgICAgKCB0aGlzLm1vZGVsID8gdGhpcy52aWV3c1sgdGhpcy5tb2RlbC5kYXRhW1wiQHR5cGVcIl0gXS5kZWxldGUoKSA6IFByb21pc2UucmVzb2x2ZSgpIClcbiAgICAgICAgLnRoZW4oICgpID0+IHRoaXMuZmV0Y2hBbmREaXNwbGF5KCkgKVxuICAgICAgICAuY2F0Y2goIHRoaXMuRXJyb3IgKVxuICAgIH0sXG5cbiAgICBwb3N0UmVuZGVyKCkge1xuICAgICAgICAvL3RoaXMuZmV0Y2hBbmREaXNwbGF5KCkuY2F0Y2goIHRoaXMuRXJyb3IgKVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG5cbiAgICBwb3N0UmVuZGVyKCkge1xuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuZWxzLmNvbnRhaW5lci5jaGlsZHJlblxuICAgICAgICB0aGlzLm1vZGVsLmRhdGEuaXRlbUxpc3RFbGVtZW50LmZvckVhY2goICggaXRlbSwgaSApID0+XG4gICAgICAgICAgICB0aGlzLmZhY3RvcnkuY3JlYXRlKFxuICAgICAgICAgICAgICAgIGl0ZW1bIFwiQHR5cGVcIiBdLFxuICAgICAgICAgICAgICAgIHsgaW5zZXJ0aW9uOiB7IHZhbHVlOiB7IGVsOiBjaGlsZHJlbltpXSB9IH0sIG1vZGVsOiB7IHZhbHVlOiB7IGRhdGE6IGl0ZW0gfSB9IH1cbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4vX19wcm90b19fJyksIHtcbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18nKSwge1xufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHsgfSwgcmVxdWlyZSgnLi4vLi4vLi4vbGliL015T2JqZWN0JyksIHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlci5wcm90b3R5cGUsIHtcblxuICAgIE1vZGVsOiByZXF1aXJlKCcuLi9tb2RlbHMvX19wcm90b19fLmpzJyksXG5cbiAgICBPcHRpbWl6ZWRSZXNpemU6IHJlcXVpcmUoJy4vbGliL09wdGltaXplZFJlc2l6ZScpLFxuICAgIFxuICAgIFhocjogcmVxdWlyZSgnLi4vWGhyJyksXG5cbiAgICBiaW5kRXZlbnQoIGtleSwgZXZlbnQgKSB7XG4gICAgICAgIHZhciBlbHMgPSBBcnJheS5pc0FycmF5KCB0aGlzLmVsc1sga2V5IF0gKSA/IHRoaXMuZWxzWyBrZXkgXSA6IFsgdGhpcy5lbHNbIGtleSBdIF1cbiAgICAgICAgZWxzLmZvckVhY2goIGVsID0+IGVsLmFkZEV2ZW50TGlzdGVuZXIoIGV2ZW50IHx8ICdjbGljaycsIGUgPT4gdGhpc1sgYG9uJHt0aGlzLmNhcGl0YWxpemVGaXJzdExldHRlcihrZXkpfSR7dGhpcy5jYXBpdGFsaXplRmlyc3RMZXR0ZXIoZXZlbnQpfWAgXSggZSApICkgKVxuICAgIH0sXG5cbiAgICBjYXBpdGFsaXplRmlyc3RMZXR0ZXI6IHN0cmluZyA9PiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSksXG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICBpZiggdGhpcy5zaXplICkgdGhpcy5PcHRpbWl6ZWRSZXNpemUuYWRkKCB0aGlzLnNpemUgKTtcblxuICAgICAgICBpZiggdGhpcy5yZXF1aXJlc0xvZ2luICYmICghdGhpcy51c2VyLmRhdGEgfHwgIXRoaXMudXNlci5kYXRhLmlkICkgKSByZXR1cm4gdGhpcy5oYW5kbGVMb2dpbigpXG5cbiAgICAgICAgaWYoIHRoaXMudXNlci5kYXRhICYmIHRoaXMudXNlci5kYXRhLmlkICYmIHRoaXMucmVxdWlyZXNSb2xlICYmICF0aGlzLmhhc1ByaXZpbGVnZXMoKSApIHJldHVybiB0aGlzLnNob3dOb0FjY2VzcygpXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbiggdGhpcywgeyBlbHM6IHsgfSwgc2x1cnA6IHsgYXR0cjogJ2RhdGEtanMnLCB2aWV3OiAnZGF0YS12aWV3JyB9LCB2aWV3czogeyB9IH0gKS5yZW5kZXIoKVxuICAgIH0sXG5cbiAgICBkZWxlZ2F0ZUV2ZW50cygga2V5LCBlbCApIHtcbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgdGhpcy5ldmVudHNba2V5XVxuXG4gICAgICAgIGlmKCB0eXBlID09PSBcInN0cmluZ1wiICkgeyB0aGlzLmJpbmRFdmVudCgga2V5LCB0aGlzLmV2ZW50c1trZXldICkgfVxuICAgICAgICBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCB0aGlzLmV2ZW50c1trZXldICkgKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50c1sga2V5IF0uZm9yRWFjaCggZXZlbnRPYmogPT4gdGhpcy5iaW5kRXZlbnQoIGtleSwgZXZlbnRPYmouZXZlbnQgKSApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmJpbmRFdmVudCgga2V5LCB0aGlzLmV2ZW50c1trZXldLmV2ZW50IClcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBkZWxldGUoIGR1cmF0aW9uICkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoIHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxuICAgICAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoICd0cmFuc2l0aW9uZW5kJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoIHRoaXMuZWxzLmNvbnRhaW5lciApO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoIHRoaXMuZW1pdCgncmVtb3ZlZCcpIClcbiAgICAgICAgICAgIH0sIHRydWUgKVxuICAgICAgICB9IClcbiAgICB9LFxuXG4gICAgZXZlbnRzOiB7fSxcblxuICAgIGZldGNoQW5kRGlzcGxheSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0YSgpXG4gICAgICAgIC50aGVuKCAoKSA9PiBcbiAgICAgICAgICAgIHRoaXMuZmFjdG9yeS5jcmVhdGUoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5kYXRhLm1haW5FbnRpdHlbXCJAdHlwZVwiXSxcbiAgICAgICAgICAgICAgICB7IGluc2VydGlvbjogeyB2YWx1ZTogeyBlbDogdGhpcy5lbHMuY29udGFpbmVyIH0gfSwgbW9kZWw6IHsgdmFsdWU6IHsgZGF0YTogdGhpcy5tb2RlbC5kYXRhLm1haW5FbnRpdHkgfSB9IH1cbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgIH0sXG5cbiAgICBnZXREYXRhKCkge1xuICAgICAgICBpZiggIXRoaXMubW9kZWwgKSB0aGlzLm1vZGVsID0gT2JqZWN0LmNyZWF0ZSggdGhpcy5Nb2RlbCwgeyByZXNvdXJjZTogeyB2YWx1ZTogdGhpcy50eXBlIH0sIGhlYWRlcnM6IHsgdmFsdWU6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vbGQranNvbicgfSB9IH0gKVxuXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGVsLmdldCggeyBxdWVyeTogeyBuYW1lOiB0aGlzLm5hbWUgfSB9IClcbiAgICB9LFxuXG4gICAgZ2V0VGVtcGxhdGVPcHRpb25zKCkgeyByZXR1cm4gKHRoaXMubW9kZWwpID8gdGhpcy5tb2RlbC5kYXRhIDoge30gfSxcblxuICAgIGhhbmRsZUxvZ2luKCkge1xuICAgICAgICB0aGlzLmZhY3RvcnkuY3JlYXRlKCAnbG9naW4nLCB7IGluc2VydGlvbjogeyB2YWx1ZTogeyBlbDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbnRlbnQnKSB9IH0gfSApXG4gICAgICAgICAgICAub25jZSggXCJsb2dnZWRJblwiLCAoKSA9PiB0aGlzLm9uTG9naW4oKSApXG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgaGFzUHJpdmlsZWdlKCkge1xuICAgICAgICAoIHRoaXMucmVxdWlyZXNSb2xlICYmICggdGhpcy51c2VyLmdldCgncm9sZXMnKS5maW5kKCByb2xlID0+IHJvbGUgPT09IHRoaXMucmVxdWlyZXNSb2xlICkgPT09IFwidW5kZWZpbmVkXCIgKSApID8gZmFsc2UgOiB0cnVlXG4gICAgfSxcblxuICAgIGh0bWxUb0ZyYWdtZW50KCBzdHIgKSB7XG4gICAgICAgIGxldCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIC8vIG1ha2UgdGhlIHBhcmVudCBvZiB0aGUgZmlyc3QgZGl2IGluIHRoZSBkb2N1bWVudCBiZWNvbWVzIHRoZSBjb250ZXh0IG5vZGVcbiAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZShkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImRpdlwiKS5pdGVtKDApKVxuICAgICAgICByZXR1cm4gcmFuZ2UuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KCBzdHIgKVxuICAgIH0sXG4gICAgXG4gICAgaXNIaWRkZW4oKSB7IHJldHVybiB0aGlzLmVscy5jb250YWluZXIuY3NzKCdkaXNwbGF5JykgPT09ICdub25lJyB9LFxuXG4gICAgb25Mb2dpbigpIHtcbiAgICAgICAgdGhpcy5yb3V0ZXIuaGVhZGVyLm9uVXNlciggdGhpcy51c2VyIClcblxuICAgICAgICB0aGlzWyAoIHRoaXMuaGFzUHJpdmlsZWdlcygpICkgPyAncmVuZGVyJyA6ICdzaG93Tm9BY2Nlc3MnIF0oKVxuICAgIH0sXG5cbiAgICBzaG93Tm9BY2Nlc3MoKSB7XG4gICAgICAgIGFsZXJ0KFwiTm8gcHJpdmlsZWdlcywgc29uXCIpXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIHBvc3RSZW5kZXIoKSB7IHJldHVybiB0aGlzIH0sXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMuc2x1cnBUZW1wbGF0ZSggeyB0ZW1wbGF0ZTogdGhpcy50ZW1wbGF0ZSggdGhpcy5nZXRUZW1wbGF0ZU9wdGlvbnMoKSApLCBpbnNlcnRpb246IHRoaXMuaW5zZXJ0aW9uIH0gKVxuXG4gICAgICAgIGlmKCB0aGlzLnNpemUgKSB0aGlzLnNpemUoKVxuXG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlclN1YnZpZXdzKClcbiAgICAgICAgICAgICAgICAgICAucG9zdFJlbmRlcigpXG4gICAgfSxcblxuICAgIHJlbmRlclN1YnZpZXdzKCkge1xuICAgICAgICBPYmplY3Qua2V5cyggdGhpcy5WaWV3cyB8fCBbIF0gKS5mb3JFYWNoKCBrZXkgPT4ge1xuICAgICAgICAgICAgaWYoIHRoaXMuVmlld3NbIGtleSBdLmVsICkge1xuICAgICAgICAgICAgICAgIGxldCBvcHRzID0gdGhpcy5WaWV3c1sga2V5IF0ub3B0c1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG9wdHMgPSAoIG9wdHMgKVxuICAgICAgICAgICAgICAgICAgICA/IHR5cGVvZiBvcHRzID09PSBcIm9iamVjdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA/IG9wdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIDogb3B0cygpXG4gICAgICAgICAgICAgICAgICAgIDoge31cblxuICAgICAgICAgICAgICAgIHRoaXMudmlld3NbIGtleSBdID0gdGhpcy5mYWN0b3J5LmNyZWF0ZSgga2V5LCBPYmplY3QuYXNzaWduKCB7IGluc2VydGlvbjogeyB2YWx1ZTogeyBlbDogdGhpcy5WaWV3c1sga2V5IF0uZWwsIG1ldGhvZDogJ2luc2VydEJlZm9yZScgfSB9IH0sIG9wdHMgKSApXG4gICAgICAgICAgICAgICAgdGhpcy5WaWV3c1sga2V5IF0uZWwucmVtb3ZlKClcbiAgICAgICAgICAgICAgICB0aGlzLlZpZXdzWyBrZXkgXS5lbCA9IHVuZGVmaW5lZFxuICAgICAgICAgICAgfVxuICAgICAgICB9IClcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICBzaG93KCBkdXJhdGlvbiApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+XG4gICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIuc2hvdyhcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiB8fCAxMCxcbiAgICAgICAgICAgICAgICAoKSA9PiB7IGlmKCB0aGlzLnNpemUgKSB7IHRoaXMuc2l6ZSgpOyB9IHJlc29sdmUoKSB9XG4gICAgICAgICAgICApXG4gICAgICAgIClcbiAgICB9LFxuXG4gICAgc2x1cnBFbCggZWwgKSB7XG4gICAgICAgIHZhciBrZXkgPSBlbC5nZXRBdHRyaWJ1dGUoIHRoaXMuc2x1cnAuYXR0ciApIHx8ICdjb250YWluZXInXG5cbiAgICAgICAgaWYoIGtleSA9PT0gJ2NvbnRhaW5lcicgKSB7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCB0aGlzLm5hbWUgKVxuICAgICAgICAgICAgaWYoIHRoaXMubW9kZWwgJiYgdGhpcy5tb2RlbC5kYXRhICYmIHRoaXMubW9kZWwuZGF0YS5uYW1lICkgZWwuY2xhc3NMaXN0LmFkZCggdGhpcy5tb2RlbC5kYXRhLm5hbWUgKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbHNbIGtleSBdID0gQXJyYXkuaXNBcnJheSggdGhpcy5lbHNbIGtleSBdIClcbiAgICAgICAgICAgID8gdGhpcy5lbHNbIGtleSBdLnB1c2goIGVsIClcbiAgICAgICAgICAgIDogKCB0aGlzLmVsc1sga2V5IF0gIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICAgICAgPyBbIHRoaXMuZWxzWyBrZXkgXSwgZWwgXVxuICAgICAgICAgICAgICAgIDogZWxcblxuICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5zbHVycC5hdHRyKVxuXG4gICAgICAgIGlmKCB0aGlzLmV2ZW50c1sga2V5IF0gKSB0aGlzLmRlbGVnYXRlRXZlbnRzKCBrZXksIGVsIClcbiAgICB9LFxuXG4gICAgc2x1cnBUZW1wbGF0ZSggb3B0aW9ucyApIHtcbiAgICAgICAgdmFyIGZyYWdtZW50ID0gdGhpcy5odG1sVG9GcmFnbWVudCggb3B0aW9ucy50ZW1wbGF0ZSApLFxuICAgICAgICAgICAgc2VsZWN0b3IgPSBgWyR7dGhpcy5zbHVycC5hdHRyfV1gLFxuICAgICAgICAgICAgdmlld1NlbGVjdG9yID0gYFske3RoaXMuc2x1cnAudmlld31dYFxuXG4gICAgICAgIHRoaXMuc2x1cnBFbCggZnJhZ21lbnQucXVlcnlTZWxlY3RvcignKicpIClcbiAgICAgICAgZnJhZ21lbnQucXVlcnlTZWxlY3RvckFsbCggYCR7c2VsZWN0b3J9LCAke3ZpZXdTZWxlY3Rvcn1gICkuZm9yRWFjaCggZWwgPT5cbiAgICAgICAgICAgICggZWwuaGFzQXR0cmlidXRlKCB0aGlzLnNsdXJwLmF0dHIgKSApIFxuICAgICAgICAgICAgICAgID8gdGhpcy5zbHVycEVsKCBlbCApXG4gICAgICAgICAgICAgICAgOiB0aGlzLlZpZXdzWyBlbC5nZXRBdHRyaWJ1dGUodGhpcy5zbHVycC52aWV3KSBdLmVsID0gZWxcbiAgICAgICAgKVxuICAgICAgICAgIFxuICAgICAgICBvcHRpb25zLmluc2VydGlvbi5tZXRob2QgPT09ICdpbnNlcnRCZWZvcmUnXG4gICAgICAgICAgICA/IG9wdGlvbnMuaW5zZXJ0aW9uLmVsLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKCBmcmFnbWVudCwgb3B0aW9ucy5pbnNlcnRpb24uZWwgKVxuICAgICAgICAgICAgOiBvcHRpb25zLmluc2VydGlvbi5lbFsgb3B0aW9ucy5pbnNlcnRpb24ubWV0aG9kIHx8ICdhcHBlbmRDaGlsZCcgXSggZnJhZ21lbnQgKVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIGlzTW91c2VPbkVsKCBldmVudCwgZWwgKSB7XG5cbiAgICAgICAgdmFyIGVsT2Zmc2V0ID0gZWwub2Zmc2V0KCksXG4gICAgICAgICAgICBlbEhlaWdodCA9IGVsLm91dGVySGVpZ2h0KCB0cnVlICksXG4gICAgICAgICAgICBlbFdpZHRoID0gZWwub3V0ZXJXaWR0aCggdHJ1ZSApXG5cbiAgICAgICAgaWYoICggZXZlbnQucGFnZVggPCBlbE9mZnNldC5sZWZ0ICkgfHxcbiAgICAgICAgICAgICggZXZlbnQucGFnZVggPiAoIGVsT2Zmc2V0LmxlZnQgKyBlbFdpZHRoICkgKSB8fFxuICAgICAgICAgICAgKCBldmVudC5wYWdlWSA8IGVsT2Zmc2V0LnRvcCApIHx8XG4gICAgICAgICAgICAoIGV2ZW50LnBhZ2VZID4gKCBlbE9mZnNldC50b3AgKyBlbEhlaWdodCApICkgKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgfSxcblxuICAgIHJlcXVpcmVzTG9naW46IGZhbHNlLFxuXG4gICAgLy9fX3RvRG86IGh0bWwucmVwbGFjZSgvPlxccys8L2csJz48Jylcbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCB7XG5cbiAgICBhZGQoY2FsbGJhY2spIHtcbiAgICAgICAgaWYoICF0aGlzLmNhbGxiYWNrcy5sZW5ndGggKSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5vblJlc2l6ZSlcbiAgICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjaylcbiAgICB9LFxuXG4gICAgb25SZXNpemUoKSB7XG4gICAgICAgaWYoIHRoaXMucnVubmluZyApIHJldHVyblxuXG4gICAgICAgIHRoaXMucnVubmluZyA9IHRydWVcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgID8gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggdGhpcy5ydW5DYWxsYmFja3MgKVxuICAgICAgICAgICAgOiBzZXRUaW1lb3V0KCB0aGlzLnJ1bkNhbGxiYWNrcywgNjYpXG4gICAgfSxcblxuICAgIHJ1bkNhbGxiYWNrcygpIHtcbiAgICAgICAgdGhpcy5jYWxsYmFja3MgPSB0aGlzLmNhbGxiYWNrcy5maWx0ZXIoIGNhbGxiYWNrID0+IGNhbGxiYWNrKCkgKVxuICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZSBcbiAgICB9XG5cbn0sIHsgY2FsbGJhY2tzOiB7IHZhbHVlOiBbXSB9LCBydW5uaW5nOiB7IHZhbHVlOiBmYWxzZSB9IH0gKS5hZGRcbiIsIm1vZHVsZS5leHBvcnRzID0gcCA9PiBgPGZvb3Rlcj48L2Zvb3Rlcj5gXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHAgPT4gYDxoZWFkZXI+PC9oZWFkZXI+YFxuIiwibW9kdWxlLmV4cG9ydHMgPSAoIHAgKSA9PiBgPGRpdj5cbiAgICA8ZGl2IGRhdGEtanM9XCJzdWJWaWV3XCI+PC9kaXY+XG48L2Rpdj5gXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHAgPT4gYDx1bD4ke0FycmF5LmZyb20oIEFycmF5KCBwLml0ZW1MaXN0RWxlbWVudC5sZW5ndGggKS5rZXlzKCkgKS5tYXAoIG4gPT4gYDxsaT48L2xpPmAgKS5qb2luKCcnKX08L3VsPmBcbiIsIm1vZHVsZS5leHBvcnRzID0gcCA9PiBgPGltZyBzcmM9XCIke3AuY29udGVudFVybH1cIiAvPmBcbiIsIm1vZHVsZS5leHBvcnRzID0gcCA9PiBgPGRpdj4ke3AubmFtZX08L2Rpdj5gXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGVyciA9PiB7IGNvbnNvbGUubG9nKCBlcnIuc3RhY2sgfHwgZXJyICkgfVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICBFcnJvcjogcmVxdWlyZSgnLi9NeUVycm9yJyksXG5cbiAgICBQOiAoIGZ1biwgYXJncz1bIF0sIHRoaXNBcmcgKSA9PlxuICAgICAgICBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiBSZWZsZWN0LmFwcGx5KCBmdW4sIHRoaXNBcmcgfHwgdGhpcywgYXJncy5jb25jYXQoICggZSwgLi4uY2FsbGJhY2sgKSA9PiBlID8gcmVqZWN0KGUpIDogcmVzb2x2ZShjYWxsYmFjaykgKSApICksXG4gICAgXG4gICAgY29uc3RydWN0b3IoKSB7IHJldHVybiB0aGlzIH1cbn1cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBdCBsZWFzdCBnaXZlIHNvbWUga2luZCBvZiBjb250ZXh0IHRvIHRoZSB1c2VyXG4gICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuICgnICsgZXIgKyAnKScpO1xuICAgICAgICBlcnIuY29udGV4dCA9IGVyO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSBpZiAobGlzdGVuZXJzKSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24odHlwZSkge1xuICBpZiAodGhpcy5fZXZlbnRzKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgICBpZiAoaXNGdW5jdGlvbihldmxpc3RlbmVyKSlcbiAgICAgIHJldHVybiAxO1xuICAgIGVsc2UgaWYgKGV2bGlzdGVuZXIpXG4gICAgICByZXR1cm4gZXZsaXN0ZW5lci5sZW5ndGg7XG4gIH1cbiAgcmV0dXJuIDA7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiJdfQ==
